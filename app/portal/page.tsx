'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import LucyEye from '@/components/LucyEye'
import { LeadSession } from '@/lib/session'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export default function PortalPage() {
  const router = useRouter()
  const [session, setSession] = useState<Partial<LeadSession> | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [eyeState, setEyeState] = useState<'idle' | 'thinking' | 'speaking'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

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
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: `Hello ${firstName}, welcome to your Stayful portal.${propertyLine} I'm here to answer any questions from your meeting with Zac, or anything else about how Stayful works. What can I help you with?`,
          },
        ])
      })
      .catch(() => router.replace('/'))
  }, [router])

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      let firstChunk = true

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
              if (firstChunk) {
                setEyeState('speaking')
                firstChunk = false
              }
              fullText += parsed.text
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: fullText }
                    : m
                )
              )
            }
          } catch {
            // skip
          }
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: fullText, isStreaming: false }
            : m
        )
      )
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
    } finally {
      setIsSending(false)
      setEyeState('idle')
      inputRef.current?.focus()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
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
        <div className="flex items-center gap-3">
          <LucyEye state={eyeState} size={44} />
          <div>
            <h1
              className="font-orbitron text-sm font-bold tracking-[0.2em]"
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
            onClick={handleLogout}
            className="btn-ghost px-3 py-1.5 text-xs"
            style={{ borderRadius: 2 }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-4 py-6"
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
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask Lucy anything about your property${firstName ? `, ${firstName}` : ''}…`}
            className="lucy-input flex-1 px-4 py-3 text-sm resize-none"
            style={{ borderRadius: 2, minHeight: 44, maxHeight: 120 }}
            rows={1}
            disabled={isSending}
          />
          <button
            type="submit"
            className="btn-primary px-5 py-3 flex-shrink-0"
            style={{ borderRadius: 2, height: 44 }}
            disabled={isSending || !input.trim()}
          >
            Send
          </button>
        </form>
        <p
          className="text-center text-xs mt-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
