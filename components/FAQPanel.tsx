'use client'

import { useMemo, useState } from 'react'
import { FAQ_CATEGORIES } from '@/lib/faq'

interface FAQPanelProps {
  open: boolean
  onClose: () => void
  onAsk: (questions: string[]) => void
  disabled?: boolean
}

export default function FAQPanel({ open, onClose, onAsk, disabled }: FAQPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([FAQ_CATEGORIES[0]?.id])
  )
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Core questions pinned to the top of each category (stable order otherwise)
  const categories = useMemo(
    () =>
      FAQ_CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.questions
          .map((item, idx) => ({ ...item, key: `${cat.id}:${idx}` }))
          .sort((a, b) => Number(b.core ?? false) - Number(a.core ?? false)),
      })),
    []
  )

  function toggleCategory(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleQuestion(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleAsk() {
    if (selected.size === 0 || disabled) return
    // Compose in reading order: category order, original question order
    const questions: string[] = []
    for (const cat of FAQ_CATEGORIES) {
      cat.questions.forEach((item, idx) => {
        if (selected.has(`${cat.id}:${idx}`)) questions.push(item.q)
      })
    }
    setSelected(new Set())
    onAsk(questions)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 fade-in"
        style={{ background: 'rgba(4,6,4,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="faq-sheet fixed inset-x-0 bottom-0 z-50 flex flex-col panel glow-border-bright"
        style={{ maxHeight: '78vh', borderBottom: 'none' }}
        role="dialog"
        aria-label="Frequently asked questions"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2
              className="font-orbitron text-sm font-bold tracking-[0.2em]"
              style={{ color: 'var(--green-bright)' }}
            >
              FREQUENTLY ASKED
            </h2>
            <p className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              TAP TO SELECT · ASK LUCY ALL AT ONCE
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

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            {categories.map((cat) => {
              const isOpen = expanded.has(cat.id)
              const selectedInCat = cat.items.filter((i) => selected.has(i.key)).length
              return (
                <div
                  key={cat.id}
                  className="panel"
                  style={{ borderRadius: 2, overflow: 'hidden' }}
                >
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    style={{ background: 'rgba(93,129,86,0.06)' }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="font-orbitron text-xs font-bold tracking-widest uppercase"
                        style={{ color: 'var(--text)' }}
                      >
                        {cat.title}
                      </span>
                      {selectedInCat > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5"
                          style={{
                            background: 'var(--green)',
                            color: '#fff',
                            borderRadius: 2,
                          }}
                        >
                          {selectedInCat}
                        </span>
                      )}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--text-dim)',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      ▾
                    </span>
                  </button>

                  {/* Questions */}
                  {isOpen && (
                    <div className="flex flex-col" style={{ borderTop: '1px solid var(--border)' }}>
                      {cat.items.map((item) => {
                        const isSel = selected.has(item.key)
                        return (
                          <button
                            key={item.key}
                            onClick={() => toggleQuestion(item.key)}
                            className="faq-row flex items-start gap-3 px-4 py-3 text-left text-sm"
                            style={{
                              borderTop: '1px solid rgba(93,129,86,0.08)',
                              background: isSel ? 'rgba(93,129,86,0.1)' : 'transparent',
                            }}
                          >
                            {/* Checkbox */}
                            <span
                              className="flex-shrink-0 mt-0.5 flex items-center justify-center"
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 2,
                                border: `1px solid ${isSel ? 'var(--green)' : 'var(--border-bright)'}`,
                                background: isSel ? 'var(--green)' : 'transparent',
                                color: '#fff',
                                fontSize: 10,
                                lineHeight: 1,
                              }}
                            >
                              {isSel ? '✓' : ''}
                            </span>
                            <span className="flex-1" style={{ color: 'var(--text)' }}>
                              {item.q}
                            </span>
                            {item.core && (
                              <span
                                className="flex-shrink-0 font-orbitron text-xs tracking-widest mt-0.5"
                                style={{ color: 'var(--amber)', fontSize: 9 }}
                              >
                                CORE
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer — Ask Selected */}
        {selected.size > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0 fade-up"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'rgba(8,12,8,0.95)',
            }}
          >
            <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
              <button
                onClick={() => setSelected(new Set())}
                className="btn-ghost px-3 py-2 text-xs"
                style={{ borderRadius: 2 }}
              >
                Clear
              </button>
              <button
                onClick={handleAsk}
                disabled={disabled}
                className="btn-primary flex-1 py-2.5"
                style={{ borderRadius: 2 }}
              >
                Ask Lucy ({selected.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
