import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession, defaultSession } from '@/lib/session'

export async function GET() {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ ...defaultSession })
  }

  return NextResponse.json({
    isLoggedIn: true,
    leadName: session.leadName,
    email: session.email,
    address: session.address,
    bedrooms: session.bedrooms,
    leadProfile: session.leadProfile,
    callBrief: session.callBrief,
    strProfit: session.strProfit,
    longTermLet: session.longTermLet,
    rentMortgage: session.rentMortgage,
    annualRentMortgage: session.annualRentMortgage,
    netAnalyser: session.netAnalyser,
    presentationUrl: session.presentationUrl,
    actionPlanUrl: session.actionPlanUrl,
    agreementUrl: session.agreementUrl,
    quoteUrl: session.quoteUrl,
    itemId: session.itemId,
  })
}

export async function DELETE() {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)
  session.destroy()
  return NextResponse.json({ success: true })
}
