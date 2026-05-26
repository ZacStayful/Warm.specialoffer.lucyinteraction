import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'
import { logPortalSession } from '@/lib/monday'

// Records that the lead has opened a booking slot to confirm a call with Zac.
// The actual booking is completed by the lead on Calendly's page.
export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { startTime } = await request.json()

    if (session.itemId) {
      let when = 'a time slot'
      if (startTime) {
        when = new Date(startTime).toLocaleString('en-GB', {
          timeZone: 'Europe/London',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
      logPortalSession(
        session.itemId,
        `Call booking: opened Calendly to confirm a call with Zac for ${when}.`
      ).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Calendly book]', err)
    return NextResponse.json({ error: 'Booking log failed' }, { status: 500 })
  }
}
