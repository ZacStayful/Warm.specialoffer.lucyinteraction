// Catalog of dashboard data panels. Selection is deterministic where possible:
// - FAQ clicks map by category (we know exactly what was asked)
// - typed questions are tagged by Lucy via a hidden [[viz:KEY]] cue
// Keyword guessing is intentionally gone — it was the inaccurate path.

export type InsightType =
  | 'earnings'
  | 'fees'
  | 'contract'
  | 'management'
  | 'getting-started'
  | 'guests'
  | 'legal-tax'
  | 'payout'

export const VALID_CARDS: InsightType[] = [
  'earnings',
  'fees',
  'contract',
  'management',
  'getting-started',
  'guests',
  'legal-tax',
  'payout',
]

// FAQ category id (from lib/faq.ts FAQ_CATEGORIES) -> card to show.
export const CATEGORY_TO_CARD: Record<string, InsightType> = {
  earnings: 'earnings',
  comparing: 'earnings',
  fees: 'fees',
  contract: 'contract',
  manage: 'management',
  'getting-started': 'getting-started',
  'property-guests': 'guests',
  'legal-tax': 'legal-tax',
}

export function isInsightType(v: unknown): v is InsightType {
  return typeof v === 'string' && (VALID_CARDS as string[]).includes(v)
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

export type Nation = 'england' | 'scotland' | 'wales' | 'ni'

// Postcode areas that are unambiguously one nation. Border areas (e.g. SY, CH,
// HR) are deliberately left out so we default to England rather than guess.
const SCOTLAND_AREAS = new Set([
  'AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE',
])
const WALES_AREAS = new Set(['CF', 'LL', 'NP', 'SA', 'LD'])

// Best-effort nation from a freeform UK address (reads the postcode area).
// Returns null when no postcode is found, so the card stays generic.
export function detectNation(address?: string | null): Nation | null {
  if (!address) return null
  const m = address.toUpperCase().match(/\b([A-Z]{1,2})\d[A-Z\d]?\s*\d[A-Z]{2}\b/)
  const area = m?.[1]
  if (!area) return null
  if (area === 'BT') return 'ni'
  if (SCOTLAND_AREAS.has(area)) return 'scotland'
  if (WALES_AREAS.has(area)) return 'wales'
  return 'england'
}
