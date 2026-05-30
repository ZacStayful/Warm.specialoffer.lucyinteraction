'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { LucyEye } from '@/components/LucyEye'
import { PresentationScript } from '@/lib/presentation-script'
import { cleanForVoice } from '@/lib/voice-clean'

export interface PresentationStageHandle {
  pause: () => void
  resume: () => void
  isPaused: () => boolean
}

type Phase = 'idle' | 'entering' | 'playing' | 'wrapping' | 'exiting' | 'done'

interface Props {
  script: PresentationScript
  isMuted?: boolean
  active: boolean
  // Fires after the eye has returned to its original state.
  onComplete?: () => void
  // Fires when the lead aborts mid-presentation (close button).
  onCancel?: () => void
  // Fires when the lead clicks BOOK CALL beneath the cornered eye.
  onBookCall?: () => void
  // Shared audio level ref — when provided, narration loudness drives the
  // portal's main Lucy eye too, so the visible eye reacts during narration.
  levelRef?: React.MutableRefObject<number>
}

// Renders the video stage + a cornered LucyEye + a BOOK CALL button.
// Sync model: when the video crosses a section's timestamp, the video is
// paused while Lucy narrates that section, then resumed. Slides stay locked
// to her words regardless of how long each line takes. All TTS blobs are
// pre-fetched on mount so playback is instant when each section fires.
const PresentationStage = forwardRef<PresentationStageHandle, Props>(
  function PresentationStage(
    { script, isMuted = false, active, onComplete, onCancel, onBookCall, levelRef },
    ref
  ) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [eyeState, setEyeState] = useState<'idle' | 'speaking'>('idle')
    const [paused, setPaused] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioElRef = useRef<HTMLAudioElement | null>(null)
    const blobCacheRef = useRef<Map<number, Blob | null>>(new Map())
    const closingBlobRef = useRef<Blob | null>(null)
    const playedIdxRef = useRef<Set<number>>(new Set())
    const currentNarrationIdxRef = useRef<number | null>(null)
    const pausedRef = useRef(false)
    const cancelRef = useRef(false)
    const mutedRef = useRef(isMuted)
    const localLevelRef = useRef(0)
    const audioLevelRef = levelRef ?? localLevelRef
    const decodeCtxRef = useRef<AudioContext | null>(null)

    useEffect(() => {
      mutedRef.current = isMuted
    }, [isMuted])

    // Pre-fetch every narration blob (and the closing) once the stage is
    // active. Fetches in parallel so most are ready by the time we need them.
    useEffect(() => {
      if (!active) return
      let cancelled = false
      script.sections.forEach((section, idx) => {
        if (blobCacheRef.current.has(idx)) return
        blobCacheRef.current.set(idx, null) // claim slot to avoid double-fetch
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

    // Entry: eye animates centered → cornered, then video plays.
    useEffect(() => {
      if (!active) return
      setPhase('entering')
      const t = window.setTimeout(() => {
        setPhase('playing')
        videoRef.current
          ?.play()
          .catch((err) => console.error('[Stage] video play error', err))
      }, 1700)
      return () => clearTimeout(t)
    }, [active])

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
          // If a narration was interrupted, restart it (which will also
          // re-pause the video for that section). If the interrupt landed
          // between sections, just resume the video.
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

      // Freeze the video on the current slide while Lucy speaks.
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
      // Not yet fetched (or fetch in flight) — fetch now.
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
      }, 1000)
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

    const eyeCornered = phase === 'playing' || phase === 'wrapping'
    const videoVisible = (phase === 'playing' || phase === 'wrapping') && !paused

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Lucy eye animates centered → cornered */}
        <div
          className="pointer-events-auto"
          style={{
            position: 'absolute',
            top: eyeCornered ? 12 : '50%',
            left: eyeCornered ? 12 : '50%',
            transform: `translate(${eyeCornered ? '0, 0' : '-50%, -50%'}) scale(${eyeCornered ? 0.3 : 1})`,
            transformOrigin: 'top left',
            transition:
              'top 1.6s cubic-bezier(0.4, 0, 0.2, 1), left 1.6s cubic-bezier(0.4, 0, 0.2, 1), transform 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'top, left, transform',
          }}
        >
          <LucyEye state={eyeState} size={220} levelRef={audioLevelRef} />
        </div>

        {/* BOOK CALL button beneath the cornered eye (replaces title label) */}
        {eyeCornered && onBookCall && (
          <div
            className="absolute pointer-events-auto"
            style={{
              top: 90,
              left: 12,
              opacity: eyeCornered ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out 0.8s',
            }}
          >
            <button
              type="button"
              onClick={onBookCall}
              className="btn-primary font-orbitron flex items-center whitespace-nowrap"
              style={{
                borderRadius: 2,
                height: 36,
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                padding: '0 0.75rem',
              }}
              aria-label="Book a call with Zac"
            >
              BOOK CALL
            </button>
          </div>
        )}

        {/* PAUSED indicator */}
        {paused && eyeCornered && (
          <div
            className="absolute pointer-events-none font-orbitron text-xs tracking-[0.3em]"
            style={{ top: 140, left: 12, color: 'var(--amber)' }}
          >
            PAUSED
          </div>
        )}

        {/* Video stage */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: videoVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            pointerEvents: videoVisible ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              width: 'min(78vw, 880px)',
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

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute pointer-events-auto btn-ghost px-3 text-xs font-orbitron tracking-widest flex items-center"
          style={{ top: 12, right: 12, borderRadius: 2, height: 36 }}
          aria-label="Close walkthrough"
        >
          CLOSE
        </button>
      </div>
    )
  }
)

export default PresentationStage
