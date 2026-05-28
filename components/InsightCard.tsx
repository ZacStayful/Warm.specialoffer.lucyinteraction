'use client'

import { useEffect, useRef, useState } from 'react'
import { InsightType, parseAmount, formatGBP } from '@/lib/insight'

interface Figures {
  strProfit?: string
  longTermLet?: string
  rentMortgage?: string
  annualRentMortgage?: string
}

// Counts a number up from 0 to target once, on mount / when target changes.
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])
  return val
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="fade-up"
      style={{
        width: '100%',
        maxWidth: 380,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        padding: '12px 14px',
        boxShadow: '0 0 18px rgba(93,129,86,0.12)',
      }}
    >
      <div
        className="font-orbitron tracking-[0.2em] mb-2.5 flex items-center gap-2"
        style={{ fontSize: '0.6rem', color: 'var(--green)' }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--green-bright)',
            boxShadow: '0 0 6px var(--green-bright)',
          }}
        />
        {title}
      </div>
      {children}
    </div>
  )
}

function Bar({
  label,
  amount,
  pct,
  strong,
}: {
  label: string
  amount: number
  pct: number
  strong?: boolean
}) {
  const shown = useCountUp(amount)
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span
          className="font-orbitron tracking-widest"
          style={{ fontSize: '0.58rem', color: 'var(--text-dim)' }}
        >
          {label}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: strong ? '0.95rem' : '0.82rem',
            color: strong ? 'var(--green-bright)' : 'var(--text-dim)',
            fontWeight: strong ? 700 : 400,
          }}
        >
          {formatGBP(shown)}
          <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}> /mo</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 2, background: 'rgba(93,129,86,0.12)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${w}%`,
            borderRadius: 2,
            background: strong
              ? 'linear-gradient(90deg, var(--green), var(--green-bright))'
              : 'var(--green-dim)',
            boxShadow: strong ? '0 0 8px rgba(143,202,133,0.5)' : 'none',
            transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
    </div>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
      <span style={{ color: 'var(--green-bright)', lineHeight: 1.4 }}>✓</span>
      <span style={{ lineHeight: 1.4 }}>{children}</span>
    </li>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
      <span
        className="font-orbitron flex-shrink-0 flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          borderRadius: 2,
          border: '1px solid var(--border)',
          color: 'var(--green-bright)',
          fontSize: '0.6rem',
        }}
      >
        {n}
      </span>
      <span style={{ lineHeight: 1.5 }}>{children}</span>
    </li>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2.5" style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
      {children}
    </p>
  )
}

export function InsightCard({ type, figures }: { type: InsightType; figures: Figures }) {
  if (type === 'earnings') {
    const str = parseAmount(figures.strProfit)
    const ltl = parseAmount(figures.longTermLet)
    const cur = parseAmount(figures.rentMortgage)
    if (!str && !ltl && !cur) return null
    const max = Math.max(str || 0, ltl || 0, cur || 0) || 1
    return (
      <Shell title="YOUR PROJECTION">
        <div className="flex flex-col gap-2.5">
          {str != null && <Bar label="SHORT-TERM (STAYFUL)" amount={str} pct={(str / max) * 100} strong />}
          {ltl != null && <Bar label="LONG-TERM LET" amount={ltl} pct={(ltl / max) * 100} />}
          {cur != null && <Bar label="YOUR MORTGAGE / RENT" amount={cur} pct={(cur / max) * 100} />}
        </div>
        {str != null && ltl != null && ltl > 0 && str > ltl && (
          <Caption>~{(str / ltl).toFixed(1)}× your long-term rent · net, for your property</Caption>
        )}
      </Shell>
    )
  }

  if (type === 'fees') {
    return (
      <Shell title="WHAT YOU PAY">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-orbitron" style={{ fontSize: '1.4rem', color: 'var(--green-bright)', fontWeight: 700 }}>
            15%
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>+ VAT of gross bookings</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          <Check>Covers all guest comms, pricing, cleaning &amp; maintenance coordination</Check>
          <Check>Cleaning charged at cost, per stay — never marked up</Check>
          <Check>No upfront, onboarding or photography fees</Check>
        </ul>
      </Shell>
    )
  }

  if (type === 'contract') {
    return (
      <Shell title="THE CONTRACT">
        <div className="flex items-stretch gap-2">
          <div className="flex-1" style={{ background: 'rgba(93,129,86,0.08)', borderRadius: 2, padding: '8px 10px' }}>
            <div className="font-orbitron" style={{ fontSize: '1.1rem', color: 'var(--green-bright)', fontWeight: 700 }}>
              6 mo
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>fixed term</div>
          </div>
          <div className="flex items-center" style={{ color: 'var(--text-muted)' }}>→</div>
          <div className="flex-1" style={{ background: 'rgba(93,129,86,0.08)', borderRadius: 2, padding: '8px 10px' }}>
            <div className="font-orbitron" style={{ fontSize: '1.1rem', color: 'var(--green-bright)', fontWeight: 700 }}>
              3 mo
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>rolling notice</div>
          </div>
        </div>
        <Caption>Six months to establish the listing &amp; reviews — then roll on a 3-month notice.</Caption>
      </Shell>
    )
  }

  if (type === 'management') {
    return (
      <Shell title="FULL MANAGEMENT">
        <ul className="flex flex-col gap-1.5">
          <Check>Guest communication, end to end</Check>
          <Check>Dynamic pricing across all platforms</Check>
          <Check>Cleaning &amp; laundry coordination every stay</Check>
          <Check>Maintenance &amp; 24/7 guest issues</Check>
          <Check>Monthly statement &amp; payout</Check>
          <Check>Dedicated Slack channel with the team</Check>
        </ul>
      </Shell>
    )
  }

  if (type === 'getting-started') {
    return (
      <Shell title="GETTING STARTED">
        <ol className="flex flex-col gap-2">
          <Step n={1}>Sign the agreement</Step>
          <Step n={2}>Furnish &amp; style, then professional photos</Step>
          <Step n={3}>We build the listings &amp; go live</Step>
          <Step n={4}>First bookings — often within 24–48 hrs</Step>
        </ol>
        <Caption>Furnished &amp; ready: live in ~2 weeks. Needs furnishing: ~3–5 weeks.</Caption>
      </Shell>
    )
  }

  if (type === 'guests') {
    return (
      <Shell title="YOUR PROPERTY & GUESTS">
        <ul className="flex flex-col gap-1.5">
          <Check>Use it yourself anytime — block dates, no fee</Check>
          <Check>£200 deposit + up to £100,000 damage cover per stay</Check>
          <Check>Every guest ID-verified before check-in</Check>
          <Check>No stag/hen or unverified bookings</Check>
        </ul>
      </Shell>
    )
  }

  if (type === 'legal-tax') {
    return (
      <Shell title="LEGAL & TAX">
        <ul className="flex flex-col gap-1.5">
          <Check>Council tax moves to business rates once live</Check>
          <Check>Most properties qualify for Small Business Rate Relief — often £0, backdated</Check>
          <Check>Specialist STR insurance needed (~£200–500/yr)</Check>
        </ul>
        <Caption>General information, not tax or legal advice — confirm with your accountant or broker.</Caption>
      </Shell>
    )
  }

  // payout
  return (
    <Shell title="YOUR PAYMENTS">
      <div className="font-orbitron" style={{ fontSize: '1.05rem', color: 'var(--green-bright)', fontWeight: 700 }}>
        1st–5th, every month
      </div>
      <Caption>Paid directly to you, never missed · full statement with every deduction itemised.</Caption>
    </Shell>
  )
}
