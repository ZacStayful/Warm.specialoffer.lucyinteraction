import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'
import { findLeadByEmail, findLeadByName } from '@/lib/monday'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    let lead = null

    if (email) {
      lead = await findLeadByEmail(email.trim())
    } else if (name) {
      lead = await findLeadByName(name.trim())
    } else {
      return NextResponse.json(
        { error: 'Email or name required' },
        { status: 400 }
      )
    }

    if (!lead) {
      return NextResponse.json(
        { error: email ? 'email_not_found' : 'name_not_found' },
        { status: 404 }
      )
    }

    // Create session
    const session = await getIronSession<LeadSession>(cookies(), sessionOptions)
    session.isLoggedIn = true
    session.itemId = lead.itemId
    session.leadName = lead.leadName
    session.email = lead.email
    session.address = lead.address
    session.bedrooms = lead.bedrooms
    session.leadProfile = lead.leadProfile
    session.callBrief = lead.callBrief
    session.strProfit = lead.strProfit
    session.longTermLet = lead.longTermLet
    session.rentMortgage = lead.rentMortgage
    session.presentationUrl = lead.presentationUrl
    session.actionPlanUrl = lead.actionPlanUrl
    session.agreementUrl = lead.agreementUrl
    session.quoteUrl = lead.quoteUrl
    await session.save()

    return NextResponse.json({
      success: true,
      leadName: lead.leadName,
      address: lead.address,
    })
  } catch (err) {
    console.error('[Auth error]', err)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
