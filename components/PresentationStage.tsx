'use client'

import { useEffect, useRef, useState } from 'react'
import { LucyEye } from '@/components/LucyEye'
import { PresentationScript } from '@/lib/presentation-script'
import { cleanForVoice } from '@/lib/voice-clean'

type Phase = 'idle' | 'entering' | 'playing' | 'wrapping' | 'exiting' | 'done'

interface Props {
  script: PresentationScript
  isMuted?: boolean
  // Fires after the eye has returned to its original state.
  onComplete?: () => void
  // Fires when the lead aborts mid-presentation (close button).
  onCancel?: () => void
  // Triggers entry — flip false → true to start.
  active: boolean
}

export default function PresentationStage({
  script,
  isMuted = false,
  onComplete,
  onCancel,
  active,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [eyeState, setEyeState] = useState<'idle' | 'speaking' | 'thinking'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const playedIdxRef = useRef<Set<number>>(new Set())
  const ttsQueueRef = useRef<Promise<Blob | null>[]>([])
  const ttsBusyRef = useRef(false)
  const cancelRef = useRef(false)
  const mutedRef = useRef(isMuted)
  const audioLevelRef = useRef(0)
  const decodeCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    mutedRef.current = isMuted
  }, [isMuted])

  // Entry sequence — when `active` flips true, begin the eye-shrinks-to-corner
  // transition, then play the video. Depends only on `active` so the timer
  // isn't torn down by the phase change it triggers.
  useEffect(() => {
    if (!active) return
    setPhase('entering')
    const t = window.setTimeout(() => {
      setPhase('playing')
      const v = videoRef.current
      if (v) {
        v.currentTime = 0
        v.play().catch((err) => console.error('[Stage] video play error', err))
      }
    }, 1700)
    return () => clearTimeout(t)
  }, [active])

  // While the video plays, watch its time and fire each narration section
  // exactly once when we cross its `at` mark.
  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v || phase !== 'playing') return
    const t = v.currentTime
    script.sections.forEach((section, i) => {
      if (playedIdxRef.current.has(i)) return
      if (t + 0.05 >= section.at) {
        playedIdxRef.current.add(i)
        enqueueSpeech(section.text)
      }
    })
  }

  function handleVideoEnded() {
    // Wait for any queued narration to finish, then play the wrap-up line and
    // begin exit. We move to 'wrapping' so further timeupdate ticks are no-ops.
    setPhase('wrapping')
    waitForQueueIdle().then(() => {
      enqueueSpeech(script.closing, () => beginExit())
    })
  }

  function beginExit() {
    setPhase('exiting')
    // Allow video to fade out before the eye scales back to centre.
    window.setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, 1700)
  }

  function handleClose() {
    cancelRef.current = true
    stopAudio()
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
    }, 1200)
  }

  // ── TTS pipeline (mirrors the portal page's queue: in-order, sequential) ──
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

  function enqueueSpeech(text: string, onAfter?: () => void) {
    if (mutedRef.current || !text.trim()) {
      onAfter?.()
      return
    }
    const blobPromise = fetchTTSBlob(cleanForVoice(text))
    ttsQueueRef.current.push(blobPromise)
    pumpSpeech(onAfter)
  }

  function waitForQueueIdle(): Promise<void> {
    return new Promise((resolve) => {
      const tick = () => {
        if (!ttsBusyRef.current && ttsQueueRef.current.length === 0) resolve()
        else setTimeout(tick, 120)
      }
      tick()
    })
  }

  function pumpSpeech(onAllDone?: () => void) {
    if (ttsBusyRef.current || cancelRef.current) return
    const next = ttsQueueRef.current.shift()
    if (!next) {
      setEyeState('idle')
      onAllDone?.()
      return
    }
    ttsBusyRef.current = true
    next.then((blob) => {
      if (cancelRef.current || !blob) {
        ttsBusyRef.current = false
        pumpSpeech(onAllDone)
        return
      }
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioElRef.current = audio
      const done = () => {
        URL.revokeObjectURL(url)
        if (audioElRef.current === audio) audioElRef.current = null
        audioLevelRef.current = 0
        ttsBusyRef.current = false
        pumpSpeech(onAllDone)
      }
      audio.onended = done
      audio.onerror = done
      setEyeState('speaking')
      void computeEnvelope(blob).then((env) => {
        if (env && audioElRef.current === audio) trackEnvelope(audio, env.env, env.frameMs)
      })
      audio.play().catch(done)
    })
  }

  function stopAudio() {
    cancelRef.current = true
    ttsQueueRef.current = []
    ttsBusyRef.current = false
    audioLevelRef.current = 0
    const a = audioElRef.current
    if (a) {
      try {
        a.pause()
      } catch {}
      a.src = ''
    }
    audioElRef.current = null
  }

  async function computeEnvelope(
    blob: Blob
  ): Promise<{ env: Float32Array; frameMs: number } | null> {
    try {
      const Ctx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
      stopAudio()
    }
  }, [])

  // Visual phase mapping — drives the CSS transform on the eye container
  // and the opacity of the video stage.
  const eyeCornered = phase === 'playing' || phase === 'wrapping'
  const videoVisible = phase === 'playing' || phase === 'wrapping'

  return (
    <div className="fixed inset-0 z-[60]" style={{ background: 'var(--bg)' }}>
      {/* Subtle background grid to match portal */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(93,129,86,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(93,129,86,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute z-10 btn-ghost px-3 text-xs font-orbitron tracking-widest flex items-center"
        style={{
          top: 16,
          right: 16,
          borderRadius: 2,
          height: 36,
        }}
        aria-label="Close walkthrough"
      >
        CLOSE
      </button>

      {/* Lucy eye — animates between centered (full) and cornered (30%) */}
      <div
        style={{
          position: 'absolute',
          top: eyeCornered ? 'min(6vh, 48px)' : '50%',
          left: eyeCornered ? 'min(6vw, 48px)' : '50%',
          transform: `translate(${eyeCornered ? '0, 0' : '-50%, -50%'}) scale(${eyeCornered ? 0.3 : 1})`,
          transformOrigin: 'top left',
          transition:
            'top 1.6s cubic-bezier(0.4, 0, 0.2, 1), left 1.6s cubic-bezier(0.4, 0, 0.2, 1), transform 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'top, left, transform',
        }}
      >
        <LucyEye state={eyeState} size={220} levelRef={audioLevelRef} />
      </div>

      {/* Video stage — fades in when eye reaches the corner */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: videoVisible ? 1 : 0,
          transition: 'opacity 0.9s ease-in-out',
        }}
      >
        <div
          style={{
            width: 'min(86vw, 1100px)',
            aspectRatio: '1152 / 720',
            background: '#000',
            border: '1px solid var(--border)',
            boxShadow: '0 0 60px rgba(93,129,86,0.18)',
            pointerEvents: videoVisible ? 'auto' : 'none',
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

      {/* Status label below the cornered eye */}
      {eyeCornered && (
        <div
          className="absolute font-orbitron text-xs tracking-[0.3em]"
          style={{
            top: 'calc(min(6vh, 48px) + 78px)',
            left: 'min(6vw, 48px)',
            color: 'var(--green-bright)',
            opacity: 0.6,
          }}
        >
          {script.title.toUpperCase()}
        </div>
      )}
    </div>
  )
}
