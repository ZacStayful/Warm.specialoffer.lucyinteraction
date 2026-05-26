'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LucyEye } from '@/components/LucyEye'
import FAQPanel from '@/components/FAQPanel'
import BookingPanel from '@/components/BookingPanel'
import DocumentRequest, { RequestedDoc } from '@/components/DocumentRequest'
import VoiceButton from '@/components/VoiceButton'
import { LeadSession } from '@/lib/session'
import { cleanForVoice } from '@/lib/voice-clean'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  voiceText?: string
  voiceRemainder?: string
  isStreaming?: boolean
  docAction?: 'confirm'
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// Renders Lucy's text with [text](url) markdown links as clickable anchors,
// preserving the surrounding text (and whitespace via the parent's pre-wrap).
function renderWithLinks(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) nodes.push(text.slice(lastIndex, m.index))
    const url = m[2]
    const safe = /^https?:\/\//i.test(url)
    if (safe) {
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--green-bright)', textDecoration: 'underline' }}
        >
          {m[1]}
        </a>
      )
    } else {
      nodes.push(m[1])
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

// Grabs the single next complete sentence (terminator followed by whitespace),
// used to speak the answer sentence-by-sentence and cap auto-speech at the
// first few sentences. A terminator only counts when followed by whitespace,
// so mid-number dots (e.g. "2.5") aren't treated as sentence ends.
function nextSentence(text: string, from: number): { chunk: string; to: number } {
  const rest = text.slice(from)
  const m = rest.match(/^[\s\S]*?[.!?…]+(?=\s)/)
  if (!m) return { chunk: '', to: from }
  return { chunk: m[0], to: from + m[0].length }
}

// Index just past the Nth sentence end (terminator + space or end of string).
function sentenceBoundary(text: string, n: number): number {
  const re = /[.!?…]+(?=\s|$)/g
  let count = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    count++
    if (count === n) return m.index + m[0].length
  }
  return text.length
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
  const [bookingOpen, setBookingOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [pendingDocs, setPendingDocs] = useState<RequestedDoc[] | null>(null)
  const [docPhase, setDocPhase] = useState<'idle' | 'confirm' | 'note'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'transcribing'>('idle')
  const [isDesktop, setIsDesktop] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const mutedRef = useRef(false)
  const greetingRef = useRef('')
  const greetedRef = useRef(false)
  const greetingPendingRef = useRef(false)
  // Streaming TTS queue — speaks the answer sentence-by-sentence as it types
  const ttsQueueRef = useRef<Promise<Blob | null>[]>([])
  const ttsBusyRef = useRef(false)
  const ttsCancelRef = useRef(false)
  const ttsStreamingRef = useRef(false)

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
        const propertyClause = data.address
          ? `, including your property at ${data.address}`
          : ''
        const greeting = `Hello ${firstName}. Welcome to your Stayful portal — I'm Lucy, Zac's assistant.

I have the details from your recent call with Zac${propertyClause}. So anything you want to go back over from that conversation, I can help with.

A few things to know before we start: if at any point you'd like to speak with Zac directly, there's a button in the top right to book a call with him.

Down at the bottom, you can browse common questions and pick any you'd like me to answer, or request copies of any documents we've sent you — your presentation, action plan, agreement, or quote — and I'll get those over to you.

Or if it's easier, just enable your microphone and speak to me directly.

What would you like to go through first?`
        greetingRef.current = cleanForVoice(greeting)
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
        // Auto-focus the chat input once the portal is ready
        setTimeout(() => inputRef.current?.focus(), 100)
      })
      .catch(() => router.replace('/'))
  }, [router])

  // Track viewport for responsive eye sizing (no mobile-detection library)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Session expired (401 from any API) — stop everything and prompt re-login
  function handleSessionExpired() {
    abortRef.current?.abort()
    stopAudio()
    setIsSending(false)
    setEyeState('idle')
    setSessionExpired(true)
  }

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
  interface SendMeta {
    source?: 'text' | 'voice' | 'faq'
    faqCategory?: string
    faqQuestions?: string[]
  }
  async function sendMessage(content: string, meta: SendMeta = {}) {
    if (!content.trim() || isSending) return
    const source = meta.source || 'text'

    abortRef.current?.abort()
    abortRef.current = new AbortController()
    stopAudio()

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
        body: JSON.stringify({
          messages: apiMessages,
          source,
          faqCategory: meta.faqCategory,
          faqQuestions: meta.faqQuestions,
        }),
        signal: abortRef.current.signal,
      })

      if (res.status === 401) {
        handleSessionExpired()
        return
      }
      if (!res.ok) throw new Error('Chat failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let spokenChars = 0
      let spokenSentences = 0

      // Begin a fresh streaming-speech session for this answer
      ttsCancelRef.current = false
      ttsStreamingRef.current = !isMuted

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
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullText } : m
                )
              )
              // Speak only the first 3 sentences as they arrive (low latency);
              // the rest is available on demand via the message's speaker icon.
              if (!isMuted && spokenSentences < 3) {
                let s = nextSentence(fullText, spokenChars)
                while (s.chunk.trim() && spokenSentences < 3) {
                  enqueueSpeech(s.chunk)
                  spokenChars = s.to
                  spokenSentences++
                  s = nextSentence(fullText, spokenChars)
                }
              }
            }
          } catch {
            // skip
          }
        }
      }

      // Finalise: speak up to the first 3 sentences, keep the rest on demand
      const boundary = sentenceBoundary(fullText, 3)
      if (!isMuted && spokenChars < boundary) {
        enqueueSpeech(fullText.slice(spokenChars, boundary))
        spokenChars = boundary
      }
      const remainderRaw = fullText.slice(boundary)
      const voiceRemainder = remainderRaw.trim()
        ? cleanForVoice(remainderRaw)
        : undefined

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: fullText,
                voiceText: cleanForVoice(fullText),
                voiceRemainder,
                isStreaming: false,
              }
            : m
        )
      )

      // Let the queue settle; the remainder is spoken only on demand
      ttsStreamingRef.current = false
      if (isMuted) setEyeState('idle')
      else pumpSpeech()
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
                    "I'm having a little trouble at the moment — please try again or use the button in the top right to speak with Zac directly.",
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
    ttsCancelRef.current = true
    ttsStreamingRef.current = false
    ttsQueueRef.current = []
    ttsBusyRef.current = false
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

  async function fetchTTSBlob(text: string): Promise<Blob | null> {
    try {
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.status === 401) {
        handleSessionExpired()
        return null
      }
      if (!res.ok) {
        console.error('[TTS] request failed', res.status)
        return null
      }
      return await res.blob()
    } catch (err) {
      console.error('[TTS] fetch error', err)
      return null
    }
  }

  // Prefetch a chunk's audio and add it to the queue, then keep the queue moving
  function enqueueSpeech(text: string) {
    const clean = cleanForVoice(text)
    if (!clean || mutedRef.current) return
    ttsQueueRef.current.push(fetchTTSBlob(clean))
    pumpSpeech()
  }

  // Plays queued clips one after another so the answer is spoken in order
  function pumpSpeech() {
    if (ttsBusyRef.current || ttsCancelRef.current) return
    const next = ttsQueueRef.current.shift()
    if (!next) {
      if (!ttsStreamingRef.current) setEyeState('idle')
      return
    }
    ttsBusyRef.current = true
    next.then(blob => {
      if (ttsCancelRef.current || !blob) {
        ttsBusyRef.current = false
        pumpSpeech()
        return
      }
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url
      const audio = new Audio(url)
      audioElRef.current = audio
      const done = () => {
        if (audioUrlRef.current === url) {
          URL.revokeObjectURL(url)
          audioUrlRef.current = null
        }
        if (audioElRef.current === audio) audioElRef.current = null
        ttsBusyRef.current = false
        pumpSpeech()
      }
      audio.onended = done
      audio.onerror = done
      setEyeState('speaking')
      audio.play().catch(err => {
        console.error('[TTS] playback error', err)
        done()
      })
    })
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
    sendMessage(text, { source: 'voice' })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (docPhase === 'note') submitDocRequest(input.trim())
    else sendMessage(input, { source: 'text' })
  }

  function handleAskFromFaq(questions: string[], category: string) {
    setFaqOpen(false)
    if (questions.length === 0) return
    const content =
      questions.length === 1
        ? questions[0]
        : `I have a few questions:\n${questions
            .map((q, i) => `${i + 1}. ${q}`)
            .join('\n')}`
    sendMessage(content, {
      source: 'faq',
      faqCategory: category,
      faqQuestions: questions,
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (docPhase === 'note') submitDocRequest(input.trim())
      else sendMessage(input, { source: 'text' })
    }
  }

  // ── Document request flow ──
  function pushLucyMessage(content: string, extra: Partial<Message> = {}) {
    setMessages(prev => [
      ...prev,
      { id: generateId(), role: 'assistant', content, ...extra },
    ])
  }

  function handleDocRequest(docs: RequestedDoc[]) {
    setDocOpen(false)
    setPendingDocs(docs)
    setDocPhase('confirm')
    pushLucyMessage(
      "I'll get that ready for you. Is there anything else you'd like included, or shall I send it as is?",
      { docAction: 'confirm' }
    )
  }

  function handleDocAddNote() {
    setDocPhase('note')
    inputRef.current?.focus()
  }

  async function submitDocRequest(note: string) {
    const docs = pendingDocs
    setPendingDocs(null)
    setDocPhase('idle')
    setInput('')
    if (!docs || docs.length === 0) return

    try {
      const res = await fetch('/api/documents/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: docs,
          additionalNote: note,
          sessionConfirmed: true,
        }),
      })
      if (res.status === 401) {
        handleSessionExpired()
        return
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok && !data.gmailSkipped) {
        pushLucyMessage(
          "Done — your email has been drafted for Zac's approval. You'll receive it shortly."
        )
      } else {
        // Gmail draft failed or was skipped — request is still logged to Monday
        pushLucyMessage(
          'Your request has been noted — Zac will follow up with your documents shortly.'
        )
      }
    } catch (err) {
      console.error('[Documents] request error', err)
      pushLucyMessage(
        'Your request has been noted — Zac will follow up with your documents shortly.'
      )
    }
  }

  async function handleLogout() {
    await fetch('/api/me', { method: 'DELETE' })
    router.replace('/')
  }

  if (loading) {
    return (
      <div
        className="min-shell flex flex-col items-center justify-center gap-5 fade-in"
        style={{ background: 'var(--bg)' }}
      >
        <LucyEye state="thinking" size={120} />
        <p
          className="font-orbitron text-xs tracking-[0.3em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Preparing your portal…
        </p>
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
      className="app-shell flex flex-col portal-in"
      style={{ background: 'var(--bg)' }}
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

        <div className="flex items-center gap-2 sm:gap-4">
          {session?.leadName && (
            <div className="text-right">
              <p
                className="text-xs"
                style={{
                  color: 'var(--text-dim)',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {session.leadName}
              </p>
              {session.address && (
                <p
                  className="hidden sm:block text-xs"
                  style={{
                    color: 'var(--text-muted)',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {session.address}
                </p>
              )}
            </div>
          )}
          <button
            onClick={toggleMute}
            className="btn-ghost flex items-center justify-center"
            style={{
              borderRadius: 2,
              height: 44,
              width: 44,
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
            onClick={() => {
              setFaqOpen(false)
              setDocOpen(false)
              setBookingOpen(true)
            }}
            className="btn-ghost px-3 text-xs font-orbitron tracking-widest flex items-center"
            style={{ borderRadius: 2, height: 44 }}
            aria-label="Book a call with Zac"
            title="Book a call with Zac"
          >
            BOOK CALL
          </button>
          <button
            onClick={handleLogout}
            className="btn-ghost px-3 text-xs flex items-center"
            style={{ borderRadius: 2, height: 44 }}
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Lucy Eye — central focal point ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-3 pb-2 sm:pt-6 sm:pb-3 flex-shrink-0">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(93,129,86,0.12) 0%, transparent 70%)',
              transform: 'scale(1.8)',
            }}
          />
          <LucyEye state={eyeState} size={isDesktop ? 220 : 160} />
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
                        onClick={() =>
                          playTTS(
                            msg.voiceRemainder ||
                              msg.voiceText ||
                              cleanForVoice(msg.content)
                          )
                        }
                        className="flex items-center justify-center"
                        style={{ color: 'var(--text-dim)', minWidth: 44, minHeight: 44 }}
                        aria-label={msg.voiceRemainder ? 'Hear full response' : 'Replay this message'}
                        title={msg.voiceRemainder ? 'Hear full response' : 'Replay'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                          <path d="M16 8.5a4 4 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                          {msg.voiceRemainder && (
                            <path d="M19 6a7 7 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                          )}
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {msg.content ? (
                  <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {msg.role === 'assistant' ? renderWithLinks(msg.content) : msg.content}
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

                {msg.docAction === 'confirm' && docPhase === 'confirm' && pendingDocs && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => submitDocRequest('')}
                      className="btn-primary px-4 py-2 text-xs"
                      style={{ borderRadius: 2 }}
                    >
                      Send as is
                    </button>
                    <button
                      type="button"
                      onClick={handleDocAddNote}
                      className="btn-ghost px-4 py-2 text-xs"
                      style={{ borderRadius: 2 }}
                    >
                      Add a note
                    </button>
                  </div>
                )}
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
            onClick={() => {
              setDocOpen(false)
              setFaqOpen((v) => !v)
            }}
            className="btn-ghost px-4 flex-shrink-0 font-orbitron tracking-widest"
            style={{ borderRadius: 2, height: 44, fontSize: '0.65rem' }}
            aria-label="Browse frequently asked questions"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={() => {
              setFaqOpen(false)
              setDocOpen((v) => !v)
            }}
            className="btn-ghost px-4 flex-shrink-0 font-orbitron tracking-widest"
            style={{ borderRadius: 2, height: 44, fontSize: '0.65rem' }}
            aria-label="Request your documents"
          >
            DOCS
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
            placeholder={
              docPhase === 'note'
                ? 'Add anything you’d like included, then confirm…'
                : `Ask Lucy anything about your property${firstName ? `, ${firstName}` : ''}…`
            }
            className="lucy-input flex-1 px-4 py-3 text-sm resize-none"
            style={{ borderRadius: 2, minHeight: 44, maxHeight: 120 }}
            rows={1}
            disabled={isSending || voiceState !== 'idle'}
          />
          <button
            type="submit"
            className="btn-primary px-5 py-3 flex-shrink-0"
            style={{ borderRadius: 2, height: 44 }}
            disabled={
              isSending ||
              voiceState !== 'idle' ||
              (docPhase !== 'note' && !input.trim())
            }
          >
            {docPhase === 'note' ? 'Confirm & Send' : 'Send'}
          </button>
        </form>
        {voiceError ? (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--amber)' }}>
            {voiceError}
          </p>
        ) : docPhase === 'note' ? (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Type your note, then Confirm & Send ·{' '}
            <button
              type="button"
              onClick={() => {
                setDocPhase('idle')
                setPendingDocs(null)
                setInput('')
              }}
              className="underline"
              style={{ color: 'var(--text-dim)' }}
            >
              cancel
            </button>
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

      {/* ── Document request ── */}
      <DocumentRequest
        open={docOpen}
        onClose={() => setDocOpen(false)}
        agreementUrl={session?.agreementUrl}
        actionPlanUrl={session?.actionPlanUrl}
        quoteUrl={session?.quoteUrl}
        presentationUrl={session?.presentationUrl}
        onRequest={handleDocRequest}
      />

      {/* ── Book a call with Zac ── */}
      <BookingPanel
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        leadName={session?.leadName}
        email={session?.email}
      />

      {/* ── Session expired overlay ── */}
      {sessionExpired && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 px-6 text-center fade-in"
          style={{ background: 'var(--bg)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Session expired"
        >
          <LucyEye state="idle" size={120} />
          <p
            className="font-orbitron text-sm tracking-[0.2em] uppercase"
            style={{ color: 'var(--text)' }}
          >
            Your session has expired
          </p>
          <button
            onClick={() => router.replace('/')}
            className="btn-primary px-6 flex items-center"
            style={{ borderRadius: 2, height: 44 }}
          >
            Log in again
          </button>
        </div>
      )}
    </div>
  )
}
