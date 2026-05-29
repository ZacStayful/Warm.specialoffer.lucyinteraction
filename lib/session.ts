import { SessionOptions } from 'iron-session'

// Where the lead sits in the sales process. Drives Lucy's introduction and
// objective: pre-meeting leads haven't had a web meeting yet (Lucy's job is to
// book one); post-meeting leads have (Lucy's job is to answer questions / close).
export type LeadStage = 'pre-meeting' | 'post-meeting'

// Monday Status (status5) labels that mean the lead has NOT yet had a web
// meeting. Anything else is treated as post-meeting (the original behaviour).
// Matched case-insensitively against the status text.
const PRE_MEETING_STATUSES = [
  'in the future due to call',
  'qualified lead',
  'abandoned due to call',
]

export function getLeadStage(status: string): LeadStage {
  return PRE_MEETING_STATUSES.includes((status || '').trim().toLowerCase())
    ? 'pre-meeting'
    : 'post-meeting'
}

export interface LeadSession {
  isLoggedIn: boolean
  itemId: string
  leadName: string
  email: string
  address: string
  bedrooms: string
  leadProfile: string
  callBrief: string
  strProfit: string
  longTermLet: string
  rentMortgage: string
  annualRentMortgage: string
  netAnalyser: string
  portalHistory: string
  status: string          // Raw Monday status label
  stage: LeadStage        // Derived sales stage
  presentationUrl: string
  preQualifyUrl: string   // Pre-qualify presentation (pre-meeting)
  actionPlanUrl: string
  agreementUrl: string
  quoteUrl: string
}

export const defaultSession: LeadSession = {
  isLoggedIn: false,
  itemId: '',
  leadName: '',
  email: '',
  address: '',
  bedrooms: '',
  leadProfile: '',
  callBrief: '',
  strProfit: '',
  longTermLet: '',
  rentMortgage: '',
  annualRentMortgage: '',
  netAnalyser: '',
  portalHistory: '',
  status: '',
  stage: 'post-meeting',
  presentationUrl: '',
  preQualifyUrl: '',
  actionPlanUrl: '',
  agreementUrl: '',
  quoteUrl: '',
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'lucy-portal-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
  },
}
