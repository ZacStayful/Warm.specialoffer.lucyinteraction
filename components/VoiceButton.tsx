'use client'

import { useEffect, useRef, useState } from 'react'

type RecState = 'idle' | 'recording' | 'transcribing'

interface VoiceButtonProps {
  disabled?: boolean
  // Final transcript — populate input + auto-send
  onResult: (text: string) => void
  onStateChange?: (state: RecState) => void
  onError?: (message: string) => void
}

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/mp4',
    'audio/ogg',
  ]
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

export default function VoiceButton({
  disabled,
  onResult,
  onStateChange,
  onError,
}: VoiceButtonProps) {
  const [state, setState] = useState<RecState>('idle')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  function update(s: RecState) {
    setState(s)
    onStateChange?.(s)
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  // Tear down on unmount
  useEffect(() => () => stopStream(), [])

  async function start() {
    onError?.('')
    chunksRef.current = []

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      console.error('[Voice] getUserMedia unavailable — needs HTTPS and a supported browser')
      onError?.('Voice needs a secure (https) connection — please type instead')
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      console.error('[Voice] microphone permission / getUserMedia error', err)
      onError?.('Microphone blocked — allow mic access in your browser, or type instead')
      return
    }
    streamRef.current = stream

    let recorder: MediaRecorder
    try {
      const mimeType = pickMimeType()
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
    } catch {
      onError?.('Recording not supported — please type instead')
      stopStream()
      return
    }
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      stopStream()
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      })
      chunksRef.current = []

      if (blob.size === 0) {
        update('idle')
        return
      }

      update('transcribing')
      try {
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')
        const res = await fetch('/api/voice/transcribe', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('transcribe failed')
        const data = await res.json()
        const text = (data.text || '').trim()
        update('idle')
        if (text) {
          onResult(text)
        } else {
          onError?.("I didn't catch that — please try again or type")
        }
      } catch (err) {
        console.error('[Voice] transcription error', err)
        update('idle')
        onError?.('Transcription failed — please type instead')
      }
    }

    recorder.start()
    update('recording')
  }

  function stop() {
    try {
      recorderRef.current?.stop()
    } catch {
      stopStream()
      update('idle')
    }
  }

  function toggle() {
    if (state === 'recording') stop()
    else if (state === 'idle') start()
    // ignore clicks while transcribing
  }

  const recording = state === 'recording'
  const transcribing = state === 'transcribing'

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={(disabled && !recording) || transcribing}
      aria-label={recording ? 'Stop recording' : 'Start voice input'}
      title={
        recording ? 'Stop recording' : transcribing ? 'Transcribing…' : 'Speak to Lucy'
      }
      className="btn-ghost flex-shrink-0 flex items-center justify-center"
      style={{
        borderRadius: 2,
        height: 44,
        width: 44,
        borderColor: recording ? 'var(--red)' : undefined,
      }}
    >
      {recording ? (
        <span
          className="rec-dot"
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--red)',
            display: 'inline-block',
          }}
        />
      ) : transcribing ? (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid var(--green)',
            borderTopColor: 'transparent',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
          <path
            d="M5 11a7 7 0 0 0 14 0M12 18v3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
    </button>
  )
}
