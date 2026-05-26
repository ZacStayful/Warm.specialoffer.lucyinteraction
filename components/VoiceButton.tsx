'use client'

import { useEffect, useRef, useState } from 'react'

interface VoiceButtonProps {
  disabled?: boolean
  // Live partial/final transcript — written into the input field as the lead speaks
  onTranscript: (text: string) => void
  // Called once on stop with the finalised transcript — triggers auto-send
  onStop: (text: string) => void
  onRecordingChange?: (recording: boolean) => void
  onError?: (message: string) => void
}

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    )
  }
  return btoa(binary)
}

export default function VoiceButton({
  disabled,
  onTranscript,
  onStop,
  onRecordingChange,
  onError,
}: VoiceButtonProps) {
  const [recording, setRecording] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const finalRef = useRef('')
  const partialRef = useRef('')

  function cleanup() {
    try {
      processorRef.current?.disconnect()
    } catch {}
    try {
      sourceRef.current?.disconnect()
    } catch {}
    try {
      ctxRef.current?.close()
    } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ terminate_session: true }))
      } catch {}
      try {
        wsRef.current.close()
      } catch {}
    }
    processorRef.current = null
    sourceRef.current = null
    ctxRef.current = null
    streamRef.current = null
    wsRef.current = null
  }

  // Safety: tear down on unmount
  useEffect(() => () => cleanup(), [])

  async function start() {
    finalRef.current = ''
    partialRef.current = ''
    onError?.('')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      onError?.('Microphone access denied')
      return
    }
    streamRef.current = stream

    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    let ctx: AudioContext
    try {
      ctx = new AudioCtx({ sampleRate: 16000 })
    } catch {
      ctx = new AudioCtx()
    }
    ctxRef.current = ctx
    const sampleRate = ctx.sampleRate

    // Get a short-lived token from our server
    let token: string
    try {
      const res = await fetch('/api/voice/token')
      if (!res.ok) throw new Error('token')
      const data = await res.json()
      token = data.token
      if (!token) throw new Error('token')
    } catch {
      onError?.('Voice unavailable — please type instead')
      cleanup()
      return
    }

    const ws = new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${sampleRate}&token=${token}`
    )
    wsRef.current = ws

    ws.onopen = () => {
      const source = ctx.createMediaStreamSource(stream)
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      sourceRef.current = source
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return
        const input = e.inputBuffer.getChannelData(0)
        const b64 = arrayBufferToBase64(floatTo16BitPCM(input))
        try {
          ws.send(JSON.stringify({ audio_data: b64 }))
        } catch {}
      }

      source.connect(processor)
      processor.connect(ctx.destination)

      setRecording(true)
      onRecordingChange?.(true)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.message_type === 'PartialTranscript') {
          partialRef.current = msg.text || ''
        } else if (msg.message_type === 'FinalTranscript') {
          if (msg.text) {
            finalRef.current = `${finalRef.current} ${msg.text}`.trim()
          }
          partialRef.current = ''
        } else {
          return
        }
        const live = `${finalRef.current} ${partialRef.current}`.trim()
        onTranscript(live)
      } catch {}
    }

    ws.onerror = () => {
      onError?.('Voice connection error — please type instead')
      cleanup()
      setRecording(false)
      onRecordingChange?.(false)
    }
  }

  function stop() {
    const finalText = `${finalRef.current} ${partialRef.current}`.trim()
    cleanup()
    setRecording(false)
    onRecordingChange?.(false)
    if (finalText) onStop(finalText)
  }

  function toggle() {
    if (recording) stop()
    else start()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled && !recording}
      aria-label={recording ? 'Stop recording' : 'Start voice input'}
      title={recording ? 'Stop recording' : 'Speak to Lucy'}
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
