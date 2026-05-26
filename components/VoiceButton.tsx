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

// Minimal typings for the Web Speech API (not in the standard DOM lib).
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionResultEventLike {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export default function VoiceButton({
  disabled,
  onResult,
  onStateChange,
  onError,
}: VoiceButtonProps) {
  const [state, setState] = useState<RecState>('idle')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')

  function update(s: RecState) {
    setState(s)
    onStateChange?.(s)
  }

  // Tear down on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
  }, [])

  function start() {
    onError?.('')
    finalRef.current = ''

    const Recognition = getRecognitionCtor()
    if (!Recognition) {
      console.error('[Voice] Web Speech API unavailable in this browser')
      onError?.('Voice input needs Chrome, Edge or Safari — or just type instead')
      return
    }

    let recognition: SpeechRecognitionLike
    try {
      recognition = new Recognition()
    } catch (err) {
      console.error('[Voice] failed to create SpeechRecognition', err)
      onError?.('Voice input could not start — please type instead')
      return
    }

    recognition.lang = 'en-GB'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalText = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
      }
      finalRef.current = finalText.trim()
    }

    recognition.onerror = (event) => {
      console.error('[Voice] recognition error', event.error)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        onError?.('Microphone blocked — allow mic access in your browser, or type instead')
      } else if (event.error === 'no-speech') {
        onError?.("I didn't catch that — please try again or type")
      } else if (event.error !== 'aborted') {
        onError?.('Voice input failed — please type instead')
      }
    }

    recognition.onend = () => {
      recognitionRef.current = null
      update('idle')
      const text = finalRef.current.trim()
      if (text) onResult(text)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      update('recording')
    } catch (err) {
      console.error('[Voice] recognition.start failed', err)
      recognitionRef.current = null
      onError?.('Voice input could not start — please type instead')
      update('idle')
    }
  }

  function stop() {
    try {
      recognitionRef.current?.stop()
    } catch {
      recognitionRef.current = null
      update('idle')
    }
  }

  function toggle() {
    if (state === 'recording') stop()
    else if (state === 'idle') start()
  }

  const recording = state === 'recording'

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
