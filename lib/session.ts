import { SessionOptions } from 'iron-session'

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
  presentationUrl: string
  actionPlanUrl: string
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
  presentationUrl: '',
  actionPlanUrl: '',
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
