'use client'

import { useEffect, useRef, useState } from 'react'
import { InsightType, parseAmount, formatGBP } from '@/lib/insight'

interface Figures {
  strProfit?: string
  longTermLet?: string
  rentMortgage?: string
}

// Counts a number up from 0 to target once, on mount / when target changes.
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      // ease-out
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
          style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}
        >
          {label}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: strong ? '0.95rem' : '0.85rem',
            color: strong ? 'var(--green-bright)' : 'var(--text-dim)',
            fontWeight: strong ? 700 : 400,
          }}
        >
          {formatGBP(shown)}
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}> /mo</span>
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 2,
          background: 'rgba(93,129,86,0.12)',
          overflow: 'hidden',
        }}
      >
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

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="fade-up"
      style={{
        width: '100%',
        maxWidth: 360,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        padding: '12px 14px',
        boxShadow: '0 0 18px rgba(93,129,86,0.12)',
      }}
    >
      <div
        className="font-orbitron tracking-[0.2em] mb-2 flex items-center gap-2"
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

export function InsightCard({
  type,
  figures,
}: {
  type: InsightType
  figures: Figures
}) {
  if (type === 'earnings') {
    const str = parseAmount(figures.strProfit)
    const ltl = parseAmount(figures.longTermLet)
    if (!str && !ltl) return null
    const max = Math.max(str || 0, ltl || 0) || 1
    return (
      <Shell title="YOUR PROJECTION">
        <div className="flex flex-col gap-2.5">
          {str != null && (
            <Bar label="SHORT-TERM (STAYFUL)" amount={str} pct={(str / max) * 100} strong />
          )}
          {ltl != null && (
            <Bar label="LONG-TERM LET" amount={ltl} pct={(ltl / max) * 100} />
          )}
        </div>
        {str != null && ltl != null && ltl > 0 && str > ltl && (
          <p
            className="mt-2"
            style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}
          >
            ~{(str / ltl).toFixed(1)}× your long-term rent, for your property
          </p>
        )}
      </Shell>
    )
  }

  if (type === 'fee') {
    return (
      <Shell title="WHAT YOU PAY">
        <div className="flex items-baseline gap-2">
          <span
            className="font-orbitron"
            style={{ fontSize: '1.4rem', color: 'var(--green-bright)', fontWeight: 700 }}
          >
            15%
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>+ VAT</span>
        </div>
        <p className="mt-1" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          No upfront fees · full management included
        </p>
      </Shell>
    )
  }

  // payout
  return (
    <Shell title="YOUR PAYMENTS">
      <div
        className="font-orbitron"
        style={{ fontSize: '1.05rem', color: 'var(--green-bright)', fontWeight: 700 }}
      >
        1st–5th, every month
      </div>
      <p className="mt-1" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        Paid directly to you · never missed
      </p>
    </Shell>
  )
}
