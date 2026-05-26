'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LucyEye } from '@/components/LucyEye'
import FAQPanel from '@/components/FAQPanel'
import VoiceButton from '@/components/VoiceButton'
import { LeadSession } from '@/lib/session'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  voiceText?: string
  isStreaming?: boolean
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

const VOICE_OPEN = '[VOICE]'
const VOICE_CLOSE = '[/VOICE]'

// Splits a streamed response into the spoken summary ([VOICE]...[/VOICE]) and
// the written answer shown on screen. While the voice block is still arriving
// it is kept hidden from the display.
function splitVoice(full: string): {
  display: string
  voice: string
  voiceComplete: boolean
} {
  const start = full.indexOf(VOICE_OPEN)
  if (start === -1) {
    // The opening tag may still be arriving token-by-token — hide a partial
    // leading match (e.g. "[VOIC") so it never flashes on screen.
    const trimmed = full.trimStart()
    if (trimmed.length > 0 && VOICE_OPEN.startsWith(trimmed)) {
      return { display: '', voice: '', voiceComplete: false }
    }
    return { display: full, voice: '', voiceComplete: false }
  }

  const afterOpen = start + VOICE_OPEN.length
  const end = full.indexOf(VOICE_CLOSE, afterOpen)
  if (end === -1) {
    return { display: full.slice(0, start), voice: full.slice(afterOpen), voiceComplete: false }
  }

  const voice = full.slice(afterOpen, end)
  const display = (full.slice(0, start) + full.slice(end + VOICE_CLOSE.length)).replace(
    /^\s+/,
    ''
  )
  return { display, voice, voiceComplete: true }
}

// Strips tags and markdown so the TTS reads clean, natural prose.
function cleanForSpeech(text: string): string {
  return text
    .replace(/\[\/?VOICE\]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function PortalPage() {
  const router = useRouter()
  const [session, setSession] = useState<Partial<LeadSession> | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [eyeState, setEyeState] = useState<
    'idle' | 'thinking' | 'speaking' | 'listening'
  >('idle')
  const [faqOpen, setFaqOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'transcribing'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const mutedRef = useRef(false)
  const greetingRef = useRef('')
  const greetedRef = useRef(false)
  const greetingPendingRef = useRef(false)

  // ── Load session ──
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (!data.isLoggedIn) {
          router.replace('/')
          return
        }
        setSession(data)
        setLoading(false)

        // Welcome message
        const firstName = data.leadName?.split(' ')[0] || 'there'
        const propertyLine = data.address
          ? ` I have your property at ${data.address} pulled up.`
          : ''
        const greeting = `Hello ${firstName}, welcome to your Stayful portal.${propertyLine} I'm here to answer any questions from your meeting with Zac, or anything else about how Stayful works. What can I help you with?`
        greetingRef.current = cleanForSpeech(greeting)
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: greeting,
            voiceText: greetingRef.current,
          },
        ])
        // Try to greet aloud now; if the browser blocks autoplay, the first
        // interaction listener below will speak it instead.
        speakGreeting()
      })
      .catch(() => router.replace('/'))
  }, [router])

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keep mute state readable from listener closures without re-binding them
  useEffect(() => {
    mutedRef.current = isMuted
  }, [isMuted])

  // Speak Lucy's greeting. Browsers block audio autoplay until the user has
  // interacted with the page, so this is retried on the first interaction.
  async function speakGreeting() {
    if (
      greetedRef.current ||
      greetingPendingRef.current ||
      mutedRef.current ||
      !greetingRef.current
    ) {
      return
    }
    greetingPendingRef.current = true
    const ok = await playTTS(greetingRef.current)
    greetingPendingRef.current = false
    if (ok) greetedRef.current = true
  }

  // Fallback: greet on the lead's first interaction if autoplay was blocked
  useEffect(() => {
    const handler = () => {
      speakGreeting()
    }
    window.addEventListener('pointerdown', handler)
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Send message ──
  async function sendMessage(content: string) {
    if (!content.trim() || isSending) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsSending(true)
    setEyeState('thinking')

    const assistantId = generateId()
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', isStreaming: true },
    ])

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('Chat failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let voiceSpoken = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue

          try {
            const parsed = JSON.parse(raw)
            if (parsed.type === 'text') {
              fullText += parsed.text
              const { display, voice, voiceComplete } = splitVoice(fullText)
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: display } : m
                )
              )
              // Speak the summary the moment it's complete, while the written
              // answer keeps streaming in below.
              if (!voiceSpoken && voiceComplete) {
                voiceSpoken = true
                const speech = cleanForSpeech(voice)
                if (speech && !isMuted) playTTS(speech)
              }
            }
          } catch {
            // skip
          }
        }
      }

      const { display, voice } = splitVoice(fullText)
      const spokenSummary = cleanForSpeech(voice) || cleanForSpeech(display)
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: display, voiceText: spokenSummary, isStreaming: false }
            : m
        )
      )

      // If the model never emitted a [VOICE] block, fall back to speaking the
      // written answer. Otherwise the summary is already playing.
      if (isMuted) {
        setEyeState('idle')
      } else if (!voiceSpoken) {
        if (spokenSummary) playTTS(spokenSummary)
        else setEyeState('idle')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I'm sorry, I encountered an error. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        )
      }
      setEyeState('idle')
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  // ── Voice output (ElevenLabs TTS via Audio element) ──
  function stopAudio() {
    const a = audioElRef.current
    if (a) {
      try {
        a.pause()
      } catch {}
      a.src = ''
    }
    audioElRef.current = null
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }

  async function playTTS(text: string): Promise<boolean> {
    if (!text.trim()) {
      setEyeState('idle')
      return false
    }
    try {
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        console.error('[TTS] request failed', res.status)
        setEyeState('idle')
        return false
      }
      const blob = await res.blob()

      // Stop any current playback before starting a new clip
      stopAudio()

      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url
      const audio = new Audio(url)
      audioElRef.current = audio
      audio.onended = () => {
        if (audioUrlRef.current === url) {
          URL.revokeObjectURL(url)
          audioUrlRef.current = null
        }
        if (audioElRef.current === audio) audioElRef.current = null
        setEyeState('idle')
      }
      audio.onerror = () => {
        console.error('[TTS] audio playback error')
        setEyeState('idle')
      }
      await audio.play()
      setEyeState('speaking')
      return true
    } catch (err) {
      // Voice is enhancement only — fail silently in the UI (e.g. autoplay
      // blocked before the first interaction).
      console.error('[TTS] playback error', err)
      setEyeState('idle')
      return false
    }
  }

  function toggleMute() {
    setIsMuted(prev => {
      const next = !prev
      if (next) {
        stopAudio()
        setEyeState('idle')
      }
      return next
    })
  }

  // ── Voice input (browser-native Web Speech API) ──
  function handleVoiceState(s: 'idle' | 'recording' | 'transcribing') {
    setVoiceState(s)
    setEyeState(
      s === 'recording' ? 'listening' : s === 'transcribing' ? 'thinking' : 'idle'
    )
  }

  function handleVoiceResult(text: string) {
    setInput(text)
    sendMessage(text)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleAskFromFaq(questions: string[]) {
    setFaqOpen(false)
    if (questions.length === 0) return
    const content =
      questions.length === 1
        ? questions[0]
        : `I have a few questions:\n${questions
            .map((q, i) => `${i + 1}. ${q}`)
            .join('\n')}`
    sendMessage(content)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  async function handleLogout() {
    await fetch('/api/me', { method: 'DELETE' })
    router.replace('/')
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <LucyEye state="thinking" size={120} />
      </div>
    )
  }

  const firstName = session?.leadName?.split(' ')[0] || ''
  const statusLabel =
    eyeState === 'thinking'
      ? 'THINKING'
      : eyeState === 'speaking'
      ? 'SPEAKING'
      : eyeState === 'listening'
      ? 'LISTENING'
      : 'ONLINE'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', maxHeight: '100vh' }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(93,129,86,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(93,129,86,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(8,12,8,0.95)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div>
          <h1
            className="font-orbitron text-sm font-bold tracking-[0.2em] glow-green"
            style={{ color: 'var(--green-bright)' }}
          >
            LUCY
          </h1>
          <p
            className="text-xs tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            STAYFUL PORTAL
          </p>
        </div>

        <div className="flex items-center gap-4">
          {session?.address && (
            <div className="hidden sm:block text-right">
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {session.leadName}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {session.address}
              </p>
            </div>
          )}
          <button
            onClick={toggleMute}
            className="btn-ghost flex items-center justify-center"
            style={{
              borderRadius: 2,
              height: 30,
              width: 34,
              color: isMuted ? 'var(--text-muted)' : 'var(--green-bright)',
            }}
            aria-label={isMuted ? 'Unmute Lucy' : 'Mute Lucy'}
            title={isMuted ? 'Voice off — tap to unmute' : 'Voice on — tap to mute'}
          >
            {isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                <path d="M17 9l4 6M21 9l-4 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                <path d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="btn-ghost px-3 py-1.5 text-xs"
            style={{ borderRadius: 2 }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Lucy Eye — central focal point ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-6 pb-3 flex-shrink-0">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(93,129,86,0.12) 0%, transparent 70%)',
              transform: 'scale(1.8)',
            }}
          />
          <LucyEye state={eyeState} size={220} />
        </div>
        <p
          className="font-orbitron text-xs tracking-[0.3em] mt-3 transition-colors"
          style={{
            color:
              eyeState === 'idle' ? 'var(--text-muted)' : 'var(--green-bright)',
          }}
        >
          {statusLabel}
        </p>
      </div>

      {/* ── Messages ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-4 pt-2 pb-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`fade-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'message-user' : 'message-lucy'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="flex items-center gap-1.5 mb-2"
                    style={{ color: 'var(--green)' }}
                  >
                    <span className="font-orbitron text-xs font-bold tracking-widest">
                      LUCY
                    </span>
                    {msg.isStreaming && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        ···
                      </span>
                    )}
                    {!msg.isStreaming && msg.content && (
                      <button
                        type="button"
                        onClick={() => playTTS(msg.voiceText || cleanForSpeech(msg.content))}
                        className="flex items-center justify-center"
                        style={{ color: 'var(--text-dim)', width: 18, height: 18 }}
                        aria-label="Replay this message"
                        title="Replay"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                          <path d="M16 8.5a4 4 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {msg.content ? (
                  <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </p>
                ) : msg.isStreaming ? (
                  <div className="flex gap-1.5 py-1">
                    <span
                      className="typing-dot w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--green)', display: 'inline-block' }}
                    />
                    <span
                      className="typing-dot w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--green)', display: 'inline-block' }}
                    />
                    <span
                      className="typing-dot w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--green)', display: 'inline-block' }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div
        className="relative z-10 px-4 py-4"
        style={{
          background: 'rgba(8,12,8,0.95)',
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex gap-3 items-end"
        >
          <button
            type="button"
            onClick={() => setFaqOpen((v) => !v)}
            className="btn-ghost px-4 flex-shrink-0 font-orbitron tracking-widest"
            style={{ borderRadius: 2, height: 44, fontSize: '0.65rem' }}
            aria-label="Browse frequently asked questions"
          >
            FAQ
          </button>
          <VoiceButton
            disabled={isSending}
            onResult={handleVoiceResult}
            onStateChange={handleVoiceState}
            onError={(msg) => setVoiceError(msg)}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask Lucy anything about your property${firstName ? `, ${firstName}` : ''}…`}
            className="lucy-input flex-1 px-4 py-3 text-sm resize-none"
            style={{ borderRadius: 2, minHeight: 44, maxHeight: 120 }}
            rows={1}
            disabled={isSending || voiceState !== 'idle'}
          />
          <button
            type="submit"
            className="btn-primary px-5 py-3 flex-shrink-0"
            style={{ borderRadius: 2, height: 44 }}
            disabled={isSending || voiceState !== 'idle' || !input.trim()}
          >
            Send
          </button>
        </form>
        {voiceError ? (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--amber)' }}>
            {voiceError}
          </p>
        ) : voiceState === 'recording' ? (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--red)' }}>
            ● Recording — tap the mic to stop
          </p>
        ) : voiceState === 'transcribing' ? (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--green-bright)' }}>
            Transcribing…
          </p>
        ) : (
          <p
            className="text-center text-xs mt-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Press Enter to send · Shift+Enter for new line
          </p>
        )}
      </div>

      {/* ── FAQ Panel ── */}
      <FAQPanel
        open={faqOpen}
        onClose={() => setFaqOpen(false)}
        onAsk={handleAskFromFaq}
        disabled={isSending}
      />
    </div>
  )
}
