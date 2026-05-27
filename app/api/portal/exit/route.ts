import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'
import { postPortalUpdate } from '@/lib/monday'

// Receives exit-flag beacons from the portal. navigator.sendBeacon posts the
// body as text/plain (a JSON string), so we handle both JSON and raw text.
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<LeadSession>(cookies(), sessionOptions)
    if (!session.isLoggedIn || !session.itemId) {
      return new Response(null, { status: 200 })
    }

    const raw = await request.text()
    let body = ''
    try {
      const parsed = JSON.parse(raw)
      body = typeof parsed?.body === 'string' ? parsed.body : raw
    } catch {
      body = raw
    }

    if (body.trim()) {
      await postPortalUpdate(session.itemId, body.trim())
    }

    return new Response(null, { status: 200 })
  } catch (err) {
    console.error('[Portal exit error]', err)
    // sendBeacon ignores the response — never surface an error
    return new Response(null, { status: 200 })
  }
}
