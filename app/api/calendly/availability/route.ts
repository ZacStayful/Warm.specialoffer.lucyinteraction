import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'

const CALENDLY_API = 'https://api.calendly.com'
const FALLBACK_BOOKING_URL = 'https://calendly.com/zac-stayful/call'

function getToken() {
  return process.env.Calendly_API || process.env.CALENDLY_API || process.env.CALENDLY_API_KEY
}

async function calendly(path: string, token: string) {
  const res = await fetch(`${CALENDLY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Calendly ${path} ${res.status} ${detail}`)
  }
  return res.json()
}

// Returns Zac's real upcoming availability for the "call" event type so the
// lead can pick a slot and confirm in one click on Calendly.
export async function GET() {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = getToken()
  if (!token) {
    console.error('[Calendly] Missing Calendly_API token')
    return NextResponse.json(
      { error: 'not_configured', fallbackUrl: FALLBACK_BOOKING_URL },
      { status: 503 }
    )
  }

  try {
    // 1. Resolve the connected user (Zac)
    const me = await calendly('/users/me', token)
    const userUri: string = me?.resource?.uri
    if (!userUri) throw new Error('No user URI from Calendly')

    // 2. Find the "call" event type (fall back to the first active one)
    const eventTypesRes = await calendly(
      `/event_types?user=${encodeURIComponent(userUri)}&active=true&count=100`,
      token
    )
    const eventTypes: any[] = eventTypesRes?.collection || []
    if (eventTypes.length === 0) {
      return NextResponse.json(
        { error: 'no_event_types', fallbackUrl: FALLBACK_BOOKING_URL },
        { status: 502 }
      )
    }
    const eventType =
      eventTypes.find((e) => typeof e.scheduling_url === 'string' && e.scheduling_url.endsWith('/call')) ||
      eventTypes.find((e) => e.slug === 'call') ||
      eventTypes[0]

    // 3. Pull available times for the next 7 days (Calendly's max window)
    const start = new Date(Date.now() + 60 * 1000)
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const timesRes = await calendly(
      `/event_type_available_times?event_type=${encodeURIComponent(
        eventType.uri
      )}&start_time=${start.toISOString()}&end_time=${end.toISOString()}`,
      token
    )
    const slots: any[] = timesRes?.collection || []

    const available = slots
      .filter((s) => s.status === 'available' && s.scheduling_url)
      .slice(0, 20)
      .map((s) => ({ start: s.start_time, url: s.scheduling_url }))

    return NextResponse.json({
      eventName: eventType.name || 'Call with Zac',
      durationMins: eventType.duration || null,
      schedulingUrl: eventType.scheduling_url || FALLBACK_BOOKING_URL,
      fallbackUrl: FALLBACK_BOOKING_URL,
      slots: available,
    })
  } catch (err) {
    console.error('[Calendly availability]', err)
    return NextResponse.json(
      { error: 'calendly_error', fallbackUrl: FALLBACK_BOOKING_URL },
      { status: 502 }
    )
  }
}
