'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { LucyEye } from '@/components/LucyEye'
import { PresentationScript } from '@/lib/presentation-script'
import { cleanForVoice } from '@/lib/voice-clean'

export interface PresentationStageHandle {
  pause: () => void
  resume: () => void
  isPaused: () => boolean
}

type Phase =
  | 'idle'        // not yet active
  | 'entering'    // eye animating to corner, intro narrating
  | 'playing'     // video playing, sections firing
  | 'wrapping'    // video ended, closing narration playing
  | 'exiting'     // eye returning to centre
  | 'done'

interface Props {
  script: PresentationScript
  isMuted?: boolean
  active: boolean
  paused?: boolean
  onComplete?: () => void
  onCancel?: () => void
  onBookCall?: () => void
  // Shared audio level ref — narration loudness drives the same Lucy eye
  // that chat TTS does, so the visible eye reacts during narration too.
  levelRef?: React.MutableRefObject<number>
  // Compact answer panel — rendered by the parent so it can access chat
  // state (latest message, chips, etc). Sits in the bottom of the stage
  // area when the stage is paused for an interruption.
  pausedPanel?: ReactNode
}

const PresentationStage = forwardRef<PresentationStageHandle, Props>(
  function PresentationStage(
    {
      script,
      isMuted = false,
      active,
      paused: pausedProp,
      onComplete,
      onCancel,
      onBookCall,
      levelRef,
      pausedPanel,
    },
    ref
  ) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [eyeState, setEyeState] = useState<'idle' | 'speaking'>('idle')
    const [paused, setPaused] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioElRef = useRef<HTMLAudioElement | null>(null)
    const blobCacheRef = useRef<Map<number, Blob | null>>(new Map())
    const closingBlobRef = useRef<Blob | null>(null)
    const introBlobRef = useRef<Blob | null>(null)
    const playedIdxRef = useRef<Set<number>>(new Set())
    const currentNarrationIdxRef = useRef<number | null>(null)
    const pausedRef = useRef(false)
    const cancelRef = useRef(false)
    const mutedRef = useRef(isMuted)
    const localLevelRef = useRef(0)
    const audioLevelRef = levelRef ?? localLevelRef
    const decodeCtxRef = useRef<AudioContext | null>(null)
    const introDoneRef = useRef(false)

    useEffect(() => {
      mutedRef.current = isMuted
    }, [isMuted])

    // Mirror the external `paused` prop into our internal state.
    useEffect(() => {
      if (typeof pausedProp !== 'boolean') return
      pausedRef.current = pausedProp
      setPaused(pausedProp)
      if (pausedProp) {
        const v = videoRef.current
        if (v && !v.paused) {
          try {
            v.pause()
          } catch {}
        }
        const a = audioElRef.current
        if (a) {
          try {
            a.pause()
          } catch {}
        }
        setEyeState('idle')
      }
    }, [pausedProp])

    // Pre-fetch every narration blob (and the intro + closing) once active.
    useEffect(() => {
      if (!active) return
      let cancelled = false
      if (!introBlobRef.current && script.intro) {
        fetchTTSBlob(cleanForVoice(script.intro)).then((blob) => {
          if (!cancelled) introBlobRef.current = blob
        })
      }
      script.sections.forEach((section, idx) => {
        if (blobCacheRef.current.has(idx)) return
        blobCacheRef.current.set(idx, null)
        fetchTTSBlob(cleanForVoice(section.text)).then((blob) => {
          if (cancelled) return
          blobCacheRef.current.set(idx, blob)
        })
      })
      if (!closingBlobRef.current) {
        fetchTTSBlob(cleanForVoice(script.closing)).then((blob) => {
          if (!cancelled) closingBlobRef.current = blob
        })
      }
      return () => {
        cancelled = true
      }
    }, [active, script])

    // Entry: eye animates centered → cornered; intro narration plays while
    // it moves; once both eye animation AND intro finish, video starts.
    useEffect(() => {
      if (!active) return
      setPhase('entering')
      introDoneRef.current = false

      // Wait the eye animation, then poll until intro narration has finished
      // (or skip if no intro / no blob).
      const eyeAnimMs = 1700
      let stopped = false
      const startWhenReady = () => {
        if (stopped || cancelRef.current) return
        if (introDoneRef.current) {
          setPhase('playing')
          videoRef.current
            ?.play()
            .catch((err) => console.error('[Stage] video play error', err))
          return
        }
        setTimeout(startWhenReady, 120)
      }

      // Kick off intro narration in parallel with the eye animation.
      tryPlayIntro().finally(() => {
        introDoneRef.current = true
      })

      const eyeTimer = window.setTimeout(startWhenReady, eyeAnimMs)
      return () => {
        stopped = true
        clearTimeout(eyeTimer)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    async function tryPlayIntro() {
      if (!script.intro || cancelRef.current) return
      // Wait briefly for the pre-fetch to land. If still not ready, fetch now.
      let blob = introBlobRef.current
      if (!blob) {
        const start = Date.now()
        while (!blob && Date.now() - start < 800 && !cancelRef.current) {
          await new Promise((r) => setTimeout(r, 100))
          blob = introBlobRef.current
        }
        if (!blob) {
          blob = await fetchTTSBlob(cleanForVoice(script.intro))
          introBlobRef.current = blob
        }
      }
      if (!blob || cancelRef.current) return
      await playBlobOnce(blob)
    }

    function playBlobOnce(blob: Blob): Promise<void> {
      return new Promise((resolve) => {
        if (cancelRef.current) return resolve()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioElRef.current = audio
        const finish = () => {
          URL.revokeObjectURL(url)
          if (audioElRef.current === audio) audioElRef.current = null
          audioLevelRef.current = 0
          setEyeState('idle')
          resolve()
        }
        audio.onended = finish
        audio.onerror = finish
        setEyeState('speaking')
        void computeEnvelope(blob).then((env) => {
          if (env && audioElRef.current === audio) {
            trackEnvelope(audio, env.env, env.frameMs)
          }
        })
        audio.play().catch(finish)
      })
    }

    useImperativeHandle(
      ref,
      () => ({
        pause: () => {
          pausedRef.current = true
          setPaused(true)
          const v = videoRef.current
          if (v && !v.paused) {
            try {
              v.pause()
            } catch {}
          }
          const a = audioElRef.current
          if (a) {
            try {
              a.pause()
            } catch {}
            a.src = ''
          }
          audioElRef.current = null
          audioLevelRef.current = 0
          setEyeState('idle')
        },
        resume: () => {
          if (cancelRef.current) return
          pausedRef.current = false
          setPaused(false)
          const interruptedIdx = currentNarrationIdxRef.current
          if (interruptedIdx !== null) {
            currentNarrationIdxRef.current = null
            playedIdxRef.current.delete(interruptedIdx)
            playSection(interruptedIdx)
            return
          }
          videoRef.current
            ?.play()
            .catch((err) => console.error('[Stage] resume error', err))
        },
        isPaused: () => pausedRef.current,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    )

    function playSection(idx: number) {
      if (cancelRef.current || pausedRef.current) return
      if (playedIdxRef.current.has(idx)) return
      playedIdxRef.current.add(idx)
      currentNarrationIdxRef.current = idx

      const section = script.sections[idx]
      if (!section) {
        currentNarrationIdxRef.current = null
        return
      }

      const v = videoRef.current
      if (v && !v.paused) {
        try {
          v.pause()
        } catch {}
      }

      const cached = blobCacheRef.current.get(idx)
      if (cached) {
        playBlobThenResume(cached, idx)
        return
      }
      fetchTTSBlob(cleanForVoice(section.text)).then((b) => {
        blobCacheRef.current.set(idx, b)
        if (!b || pausedRef.current || cancelRef.current) {
          currentNarrationIdxRef.current = null
          if (!pausedRef.current && !cancelRef.current) {
            videoRef.current?.play().catch(() => {})
          }
          return
        }
        playBlobThenResume(b, idx)
      })
    }

    function playBlobThenResume(blob: Blob, narrationIdx: number) {
      if (cancelRef.current || pausedRef.current) {
        currentNarrationIdxRef.current = null
        return
      }
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioElRef.current = audio
      const finish = () => {
        URL.revokeObjectURL(url)
        if (audioElRef.current === audio) audioElRef.current = null
        audioLevelRef.current = 0
        setEyeState('idle')
        if (currentNarrationIdxRef.current === narrationIdx) {
          currentNarrationIdxRef.current = null
        }
        if (!pausedRef.current && !cancelRef.current) {
          videoRef.current?.play().catch(() => {})
        }
      }
      audio.onended = finish
      audio.onerror = finish
      setEyeState('speaking')
      void computeEnvelope(blob).then((env) => {
        if (env && audioElRef.current === audio) {
          trackEnvelope(audio, env.env, env.frameMs)
        }
      })
      audio.play().catch(finish)
    }

    function handleTimeUpdate() {
      if (pausedRef.current || cancelRef.current) return
      if (phase !== 'playing') return
      if (currentNarrationIdxRef.current !== null) return
      const v = videoRef.current
      if (!v) return
      const t = v.currentTime
      for (let i = 0; i < script.sections.length; i++) {
        if (playedIdxRef.current.has(i)) continue
        const section = script.sections[i]
        if (t + 0.05 >= section.at) {
          playSection(i)
          break
        }
      }
    }

    function handleVideoEnded() {
      if (pausedRef.current || cancelRef.current) return
      setPhase('wrapping')
      const blob = closingBlobRef.current
      if (!blob) {
        beginExit()
        return
      }
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioElRef.current = audio
      const finish = () => {
        URL.revokeObjectURL(url)
        if (audioElRef.current === audio) audioElRef.current = null
        audioLevelRef.current = 0
        setEyeState('idle')
        beginExit()
      }
      audio.onended = finish
      audio.onerror = finish
      setEyeState('speaking')
      void computeEnvelope(blob).then((env) => {
        if (env && audioElRef.current === audio) {
          trackEnvelope(audio, env.env, env.frameMs)
        }
      })
      audio.play().catch(finish)
    }

    function beginExit() {
      setPhase('exiting')
      window.setTimeout(() => {
        setPhase('done')
        onComplete?.()
      }, 1400)
    }

    function handleClose() {
      cancelRef.current = true
      const a = audioElRef.current
      if (a) {
        try {
          a.pause()
        } catch {}
      }
      const v = videoRef.current
      if (v) {
        try {
          v.pause()
        } catch {}
      }
      setPhase('exiting')
      window.setTimeout(() => {
        setPhase('done')
        onCancel?.()
      }, 700)
    }

    async function fetchTTSBlob(text: string): Promise<Blob | null> {
      try {
        const res = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        if (!res.ok) return null
        return await res.blob()
      } catch {
        return null
      }
    }

    async function computeEnvelope(
      blob: Blob
    ): Promise<{ env: Float32Array; frameMs: number } | null> {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        if (!Ctx) return null
        if (!decodeCtxRef.current) decodeCtxRef.current = new Ctx()
        const data = await blob.arrayBuffer()
        const buf = await decodeCtxRef.current.decodeAudioData(data.slice(0))
        const ch = buf.getChannelData(0)
        const frameMs = 40
        const frameLen = Math.max(1, Math.floor((buf.sampleRate * frameMs) / 1000))
        const frames = Math.ceil(ch.length / frameLen)
        const env = new Float32Array(frames)
        let max = 0
        for (let f = 0; f < frames; f++) {
          const start = f * frameLen
          const end = Math.min(ch.length, start + frameLen)
          let sum = 0
          for (let i = start; i < end; i++) sum += ch[i] * ch[i]
          const rms = Math.sqrt(sum / Math.max(1, end - start))
          env[f] = rms
          if (rms > max) max = rms
        }
        if (max > 0) for (let f = 0; f < frames; f++) env[f] = Math.min(1, env[f] / max)
        return { env, frameMs }
      } catch {
        return null
      }
    }

    function trackEnvelope(audio: HTMLAudioElement, env: Float32Array, frameMs: number) {
      const step = () => {
        if (audioElRef.current !== audio || audio.paused || audio.ended) {
          audioLevelRef.current *= 0.6
          return
        }
        const idx = Math.floor((audio.currentTime * 1000) / frameMs)
        const target = env[Math.min(env.length - 1, Math.max(0, idx))] || 0
        audioLevelRef.current = audioLevelRef.current * 0.65 + target * 0.35
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    useEffect(() => {
      return () => {
        cancelRef.current = true
        const a = audioElRef.current
        if (a) {
          try {
            a.pause()
          } catch {}
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const eyeCornered =
      phase === 'entering' || phase === 'playing' || phase === 'wrapping'
    const videoVisible = (phase === 'playing' || phase === 'wrapping') && !paused

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Lucy eye — cross-fade between a full-detail centred instance
            and a full-detail cornered instance. Rendering each at its own
            native size preserves the iris, pupil, ticks and scan rings at
            both sizes (CSS scaling at 0.3 was washing out the inner detail). */}
        <div
          className="pointer-events-auto"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: eyeCornered ? 0 : 1,
            transition: 'opacity 0.7s ease-in-out',
          }}
        >
          <LucyEye state={eyeState} size={220} levelRef={audioLevelRef} />
        </div>
        <div
          className="pointer-events-auto"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            opacity: eyeCornered ? 1 : 0,
            transition: 'opacity 0.7s ease-in-out',
          }}
        >
          <LucyEye state={eyeState} size={100} levelRef={audioLevelRef} />
        </div>

        {/* BOOK CALL link beneath the cornered eye (replaces title label).
            Opens Zac's Calendly in a new tab so the lead doesn't lose the
            walkthrough. */}
        {eyeCornered && (
          <div
            className="absolute pointer-events-auto"
            style={{
              top: 130,
              left: 16,
              opacity: 1,
              transition: 'opacity 0.7s ease-in-out 0.4s',
            }}
          >
            <a
              href="https://calendly.com/zac-stayful/call"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary font-orbitron flex items-center whitespace-nowrap"
              style={{
                borderRadius: 2,
                height: 32,
                fontSize: '0.55rem',
                letterSpacing: '0.14em',
                padding: '0 0.6rem',
                textDecoration: 'none',
              }}
              aria-label="Book a call with Zac"
              onClick={() => onBookCall?.()}
            >
              BOOK CALL
            </a>
          </div>
        )}

        {/* PAUSED indicator */}
        {paused && eyeCornered && (
          <div
            className="absolute pointer-events-none font-orbitron text-xs tracking-[0.3em]"
            style={{ top: 172, left: 16, color: 'var(--amber)' }}
          >
            PAUSED
          </div>
        )}

        {/* Video stage — bottom-anchored so it sits close to the chat input */}
        <div
          className="absolute inset-x-0 flex items-end justify-center"
          style={{
            top: 12,
            bottom: 12,
            opacity: videoVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            pointerEvents: videoVisible ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              width: 'min(86vw, 880px)',
              maxHeight: '100%',
              aspectRatio: '1152 / 720',
              background: '#000',
              border: '1px solid var(--border)',
              boxShadow: '0 0 60px rgba(93,129,86,0.18)',
            }}
          >
            <video
              ref={videoRef}
              src={script.videoSrc}
              playsInline
              muted
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>

        {/* Compact answer panel — rendered by parent, shown when paused */}
        {paused && pausedPanel && (
          <div
            className="absolute pointer-events-auto"
            style={{
              left: 12,
              right: 12,
              bottom: 12,
              top: 210,
            }}
          >
            {pausedPanel}
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute pointer-events-auto btn-ghost px-3 text-xs font-orbitron tracking-widest flex items-center"
          style={{ top: 12, right: 12, borderRadius: 2, height: 32 }}
          aria-label="Close walkthrough"
        >
          CLOSE
        </button>
      </div>
    )
  }
)

export default PresentationStage
