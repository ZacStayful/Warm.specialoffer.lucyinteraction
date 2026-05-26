import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'

// Returns a short-lived AssemblyAI realtime token for the browser to open a
// transcription WebSocket. Session-gated so the API key is never exposed.
export async function GET() {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Voice input not configured' }), {
        status: 503,
      })
    }

    const resp = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expires_in: 300 }),
      cache: 'no-store',
    })

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Token request failed' }), {
        status: 502,
      })
    }

    const data = await resp.json()
    return new Response(JSON.stringify({ token: data.token }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[Voice token error]', err)
    return new Response(JSON.stringify({ error: 'Token error' }), { status: 500 })
  }
}
