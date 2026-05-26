'use client'

import { useEffect, useState } from 'react'

interface Slot {
  start: string
  url: string
}

interface Availability {
  eventName: string
  durationMins: number | null
  schedulingUrl: string
  fallbackUrl: string
  slots: Slot[]
}

interface BookingPanelProps {
  open: boolean
  onClose: () => void
  leadName?: string
  email?: string
}

const FALLBACK_URL = 'https://calendly.com/zac-stayful/call'

function prefill(url: string, leadName?: string, email?: string): string {
  try {
    const u = new URL(url)
    if (leadName) u.searchParams.set('name', leadName)
    if (email) u.searchParams.set('email', email)
    return u.toString()
  } catch {
    return url
  }
}

export default function BookingPanel({ open, onClose, leadName, email }: BookingPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<Availability | null>(null)
  const [confirmed, setConfirmed] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError('')
    setData(null)
    setConfirmed('')

    fetch('/api/calendly/availability')
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok) {
          setData(body)
        } else {
          setError(
            body.error === 'not_configured'
              ? 'Live availability is not connected yet — you can still open Zac’s calendar below.'
              : 'Couldn’t load live availability — you can still open Zac’s calendar below.'
          )
        }
      })
      .catch(() => {
        if (!cancelled) setError('Couldn’t load live availability — you can still open Zac’s calendar below.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  function openSlot(slot: Slot) {
    const url = prefill(slot.url, leadName, email)
    window.open(url, '_blank', 'noopener,noreferrer')
    setConfirmed(slot.start)
    fetch('/api/calendly/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: slot.start }),
    }).catch(() => {})
  }

  if (!open) return null

  const grouped = new Map<string, Slot[]>()
  for (const slot of data?.slots || []) {
    const day = new Date(slot.start).toLocaleDateString('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(slot)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 fade-in"
        style={{ background: 'rgba(4,6,4,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      <div
        className="faq-sheet sheet fixed inset-x-0 bottom-0 z-50 flex flex-col panel glow-border-bright"
        style={{ borderBottom: 'none' }}
        role="dialog"
        aria-label="Book a call with Zac"
      >
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2
              className="font-orbitron text-sm font-bold tracking-[0.2em]"
              style={{ color: 'var(--green-bright)' }}
            >
              BOOK A CALL WITH ZAC
            </h2>
            <p className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {data?.durationMins
                ? `${data.durationMins} MIN · PICK A TIME · CONFIRM IN ONE CLICK`
                : 'PICK A TIME · CONFIRM IN ONE CLICK'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost px-3 py-1.5 text-xs"
            style={{ borderRadius: 2 }}
            aria-label="Close"
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {confirmed && (
              <div
                className="panel px-4 py-3 fade-up"
                style={{ borderRadius: 2, background: 'rgba(93,129,86,0.1)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  A new tab has opened on Zac’s calendar — just confirm your details there to lock in the call.
                  If it didn’t open, please allow pop-ups and try again.
                </p>
              </div>
            )}

            {loading && (
              <p className="text-center text-sm py-6" style={{ color: 'var(--text-dim)' }}>
                Loading Zac’s availability…
              </p>
            )}

            {!loading && error && (
              <p className="text-sm py-2" style={{ color: 'var(--amber)' }}>
                {error}
              </p>
            )}

            {!loading && data && data.slots.length === 0 && !error && (
              <p className="text-sm py-2" style={{ color: 'var(--text-dim)' }}>
                No open slots in the next 7 days — open Zac’s full calendar below to find a later time.
              </p>
            )}

            {!loading &&
              [...grouped.entries()].map(([day, slots]) => (
                <div key={day} className="panel" style={{ borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    className="px-4 py-2 font-orbitron text-xs font-bold tracking-widest uppercase"
                    style={{ background: 'rgba(93,129,86,0.06)', color: 'var(--text)' }}
                  >
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-2 px-4 py-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => openSlot(slot)}
                        className="btn-ghost px-3 py-2 text-sm"
                        style={{ borderRadius: 2 }}
                      >
                        {new Date(slot.start).toLocaleTimeString('en-GB', {
                          timeZone: 'Europe/London',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'rgba(8,12,8,0.95)' }}
        >
          <div className="max-w-2xl mx-auto">
            <a
              href={data?.schedulingUrl || FALLBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost block text-center py-2.5 text-xs font-orbitron tracking-widest"
              style={{ borderRadius: 2 }}
            >
              OPEN ZAC’S FULL CALENDAR
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
