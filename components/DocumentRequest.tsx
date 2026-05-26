'use client'

import { useState } from 'react'

export interface RequestedDoc {
  name: string
  url: string
}

interface DocumentRequestProps {
  open: boolean
  onClose: () => void
  agreementUrl?: string
  actionPlanUrl?: string
  quoteUrl?: string
  presentationUrl?: string
  onRequest: (docs: RequestedDoc[]) => void
}

export default function DocumentRequest({
  open,
  onClose,
  agreementUrl,
  actionPlanUrl,
  quoteUrl,
  presentationUrl,
  onRequest,
}: DocumentRequestProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const docs: RequestedDoc[] = [
    { name: 'Management Agreement', url: agreementUrl || '' },
    { name: 'Post-Meeting Action Plan', url: actionPlanUrl || '' },
    { name: 'Setup Quote', url: quoteUrl || '' },
    { name: 'Web Meeting Presentation', url: presentationUrl || '' },
  ]

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handleEmailMe() {
    const chosen = docs.filter((d) => d.url && selected.has(d.name))
    if (chosen.length === 0) return
    setSelected(new Set())
    onRequest(chosen)
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
        className="faq-sheet sheet fixed inset-x-0 bottom-0 z-50 flex flex-col panel glow-border-bright"
        style={{ borderBottom: 'none' }}
        role="dialog"
        aria-label="Request your documents"
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
              YOUR DOCUMENTS
            </h2>
            <p className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              SELECT WHAT YOU&rsquo;D LIKE · LUCY WILL EMAIL THEM
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

        {/* Cards */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
            {docs.map((doc) => {
              const available = !!doc.url
              const isSel = selected.has(doc.name)
              return (
                <button
                  key={doc.name}
                  type="button"
                  onClick={() => available && toggle(doc.name)}
                  disabled={!available}
                  className="doc-card flex flex-col items-start gap-2 p-4 text-left transition-colors"
                  style={{
                    borderRadius: 2,
                    background: 'var(--bg-panel)',
                    border: `1px solid ${
                      isSel ? 'var(--green)' : 'var(--border)'
                    }`,
                    opacity: available ? 1 : 0.45,
                    cursor: available ? 'pointer' : 'not-allowed',
                    minHeight: 96,
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    {/* Checkbox */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 2,
                        border: `1px solid ${
                          isSel ? 'var(--green)' : 'var(--border-bright)'
                        }`,
                        background: isSel ? 'var(--green)' : 'transparent',
                        color: '#fff',
                        fontSize: 10,
                        lineHeight: 1,
                        visibility: available ? 'visible' : 'hidden',
                      }}
                    >
                      {isSel ? '✓' : ''}
                    </span>
                    {!available && (
                      <span
                        className="font-orbitron tracking-widest"
                        style={{ color: 'var(--text-muted)', fontSize: 9 }}
                      >
                        NOT AVAILABLE
                      </span>
                    )}
                  </div>
                  <span
                    className="font-orbitron text-xs font-bold tracking-widest uppercase"
                    style={{ color: available ? 'var(--text)' : 'var(--text-muted)' }}
                  >
                    {doc.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer — Email Me */}
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
                onClick={handleEmailMe}
                className="btn-primary flex-1 py-2.5"
                style={{ borderRadius: 2 }}
              >
                Email Me ({selected.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
