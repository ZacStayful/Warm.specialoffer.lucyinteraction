'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LucyEye } from '@/components/LucyEye'

type Stage = 'email' | 'name' | 'loading' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [eyeState, setEyeState] = useState<'idle' | 'thinking'>('idle')

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStage('loading')
    setEyeState('thinking')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/portal')
        return
      }

      if (data.error === 'email_not_found') {
        setStage('name')
        setEyeState('idle')
        setErrorMsg('')
        return
      }

      setStage('email')
      setEyeState('idle')
      setErrorMsg('Something went wrong. Please try again.')
    } catch {
      setStage('email')
      setEyeState('idle')
      setErrorMsg('Connection error. Please try again.')
    }
  }

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setStage('loading')
    setEyeState('thinking')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/portal')
        return
      }

      setStage('error')
      setEyeState('idle')
      setErrorMsg('')
    } catch {
      setStage('error')
      setEyeState('idle')
      setErrorMsg('Connection error. Please try again.')
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(93,129,86,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(93,129,86,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm fade-in">

        {/* Eye */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(93,129,86,0.08) 0%, transparent 70%)',
              transform: 'scale(1.8)',
            }}
          />
          <LucyEye state={eyeState} size={180} />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <h1
            className="font-orbitron text-4xl font-black tracking-[0.3em] glow-green"
            style={{ color: 'var(--green-bright)' }}
          >
            LUCY
          </h1>
          <p
            className="text-xs tracking-[0.3em] mt-1 uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Stayful Lead Portal
          </p>
        </div>

        {/* ── Panel ── */}
        <div className="w-full panel p-6 glow-border" style={{ borderRadius: 4 }}>

          {/* Email Stage */}
          {(stage === 'email' || (stage === 'loading' && !name)) && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Please use the email address you enquired with us — you may have more than one.
              </p>
              <div>
                <label
                  className="block text-xs tracking-widest uppercase mb-2"
                  style={{ color: 'var(--text-dim)' }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="lucy-input w-full px-4 py-3 text-sm"
                  style={{ borderRadius: 2 }}
                  disabled={stage === 'loading'}
                  autoFocus
                  required
                />
              </div>
              {errorMsg && (
                <p className="text-xs" style={{ color: 'var(--red)' }}>
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                className="btn-primary w-full py-3"
                style={{ borderRadius: 2 }}
                disabled={stage === 'loading'}
              >
                {stage === 'loading' ? 'Searching...' : 'Access Portal'}
              </button>
            </form>
          )}

          {/* Name Fallback Stage */}
          {(stage === 'name' || (stage === 'loading' && name)) && (
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4 fade-up">
              <div
                className="text-xs p-3"
                style={{
                  background: 'rgba(212,160,23,0.08)',
                  border: '1px solid rgba(212,160,23,0.3)',
                  color: '#d4a017',
                  borderRadius: 2,
                }}
              >
                That email doesn&apos;t match the address you enquired with us. Please enter your full name to try again.
              </div>
              <div>
                <label
                  className="block text-xs tracking-widest uppercase mb-2"
                  style={{ color: 'var(--text-dim)' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="First and last name"
                  className="lucy-input w-full px-4 py-3 text-sm"
                  style={{ borderRadius: 2 }}
                  disabled={stage === 'loading'}
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full py-3"
                style={{ borderRadius: 2 }}
                disabled={stage === 'loading'}
              >
                {stage === 'loading' ? 'Searching...' : 'Try Name'}
              </button>
              <button
                type="button"
                className="btn-ghost w-full py-2"
                style={{ borderRadius: 2 }}
                onClick={() => {
                  setStage('email')
                  setEmail('')
                  setName('')
                }}
              >
                ← Back
              </button>
            </form>
          )}

          {/* Error / Not Found */}
          {stage === 'error' && (
            <div className="flex flex-col gap-4 fade-up">
              <div
                className="text-xs p-3"
                style={{
                  background: 'rgba(192,57,43,0.08)',
                  border: '1px solid rgba(192,57,43,0.3)',
                  color: '#e74c3c',
                  borderRadius: 2,
                }}
              >
                We couldn&apos;t find your details. Please contact Stayful directly and we&apos;ll get you set up.
              </div>
              <button
                className="btn-ghost w-full py-2"
                style={{ borderRadius: 2 }}
                onClick={() => {
                  setStage('email')
                  setEmail('')
                  setName('')
                }}
              >
                ← Try Again
              </button>
              <a
                href="mailto:hello@stayful.co.uk"
                className="text-center text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                hello@stayful.co.uk
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Stayful. All rights reserved.
        </p>
      </div>
    </main>
  )
}
