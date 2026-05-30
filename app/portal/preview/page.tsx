'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PresentationStage from '@/components/PresentationStage'
import { LucyEye } from '@/components/LucyEye'
import { REVENUE_FORECAST_WALKTHROUGH } from '@/lib/presentation-script'

// Standalone test page for the presentation-mode mechanic. Lives inside the
// authed portal area so the TTS endpoint is reachable. Once approved, the
// PresentationStage component is meant to drop into the main portal page.
export default function PreviewTestPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.isLoggedIn) {
          router.replace('/')
          return
        }
        setAuthed(true)
        setLoading(false)
      })
      .catch(() => router.replace('/'))
  }, [router])

  if (loading) {
    return (
      <div
        className="min-shell flex flex-col items-center justify-center gap-5"
        style={{ background: 'var(--bg)' }}
      >
        <LucyEye state="thinking" size={120} />
        <p
          className="font-orbitron text-xs tracking-[0.3em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Loading…
        </p>
      </div>
    )
  }

  if (!authed) return null

  return (
    <div className="app-shell relative" style={{ background: 'var(--bg)' }}>
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

      {/* Idle / done state — eye centred with a single CTA */}
      {!active && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-8 px-6">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(93,129,86,0.12) 0%, transparent 70%)',
                transform: 'scale(1.8)',
              }}
            />
            <LucyEye state="idle" size={220} />
          </div>

          <div className="text-center max-w-md">
            <p
              className="font-orbitron text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Presentation Mode — Test
            </p>
            <h1
              className="font-orbitron text-lg tracking-widest"
              style={{ color: 'var(--text)' }}
            >
              {REVENUE_FORECAST_WALKTHROUGH.title}
            </h1>
            <p
              className="text-sm mt-3"
              style={{ color: 'var(--text-dim)' }}
            >
              {completed
                ? 'Walkthrough complete. Run it again to refine timing.'
                : 'Click below to start. Lucy will move into the top-left and play the walkthrough.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCompleted(false)
              setActive(true)
            }}
            className="btn-primary px-6 font-orbitron tracking-widest text-xs"
            style={{ borderRadius: 2, height: 44 }}
          >
            {completed ? 'RUN AGAIN' : 'START WALKTHROUGH'}
          </button>

          <button
            type="button"
            onClick={() => router.replace('/portal')}
            className="btn-ghost px-4 text-xs"
            style={{ borderRadius: 2, height: 36 }}
          >
            Back to portal
          </button>
        </div>
      )}

      {/* Presentation stage — owns its own eye while active */}
      {active && (
        <PresentationStage
          script={REVENUE_FORECAST_WALKTHROUGH}
          active={active}
          onComplete={() => {
            setActive(false)
            setCompleted(true)
          }}
          onCancel={() => {
            setActive(false)
            setCompleted(true)
          }}
        />
      )}
    </div>
  )
}
