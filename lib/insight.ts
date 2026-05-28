// Lightweight, client-side topic detection so the dashboard can surface a
// relevant data card while Lucy is speaking. Heuristic by design — it reads
// the answer text and picks the single most relevant card to show.

export type InsightType = 'earnings' | 'fee' | 'payout'

export function detectInsight(text: string): InsightType | null {
  const t = text.toLowerCase()
  // Explicit topics win first so a fee/payout answer doesn't trigger earnings.
  if (/(fee|commission|fifteen percent|15\s?%|\bvat\b|our (cut|charge)|what (we|it) charge)/.test(t)) {
    return 'fee'
  }
  if (/(payout|paid out|get paid|payment|transfer|monthly statement|1st|first of the month)/.test(t)) {
    return 'payout'
  }
  if (/(earn|income|profit|\bnet\b|per month|a month|short[- ]?term|long[- ]?term|\bstr\b|nightly|revenue|\bmake\b|yield)/.test(t)) {
    return 'earnings'
  }
  return null
}

// Pulls the first sensible integer out of a Monday text value like "£2,400",
// "2400 pcm", "£2,400 / month". Returns null if there's nothing usable.
export function parseAmount(s?: string | null): number | null {
  if (!s) return null
  const digits = s.replace(/[^0-9]/g, '')
  if (!digits) return null
  const n = parseInt(digits, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function formatGBP(n: number): string {
  return '£' + Math.round(n).toLocaleString('en-GB')
}
