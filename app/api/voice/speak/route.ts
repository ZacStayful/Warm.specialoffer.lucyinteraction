import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'

// Streams ElevenLabs TTS audio for a Lucy response. Voice output is an
// enhancement only — on any failure the client already shows the text.
export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  try {
    const { text } = await request.json()
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
      })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId = process.env.ELEVENLABS_VOICE_ID
    if (!apiKey || !voiceId) {
      console.error('[Speak] Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID')
      return new Response(JSON.stringify({ error: 'Voice output not configured' }), {
        status: 503,
      })
    }

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
            // Slightly quicker than default (1.0); range is 0.7–1.2
            speed: 1.1,
          },
        }),
        cache: 'no-store',
      }
    )

    if (!resp.ok || !resp.body) {
      const detail = await resp.text().catch(() => '')
      console.error('[Speak] ElevenLabs error', resp.status, detail)
      return new Response(JSON.stringify({ error: 'TTS request failed' }), {
        status: 502,
      })
    }

    // Buffer the full clip and return it with a Content-Length. This is far
    // more reliable for an <audio> element than a chunked stream (a manual
    // Transfer-Encoding header can corrupt the body on the Node runtime).
    const audio = await resp.arrayBuffer()
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[Speak error]', err)
    return new Response(JSON.stringify({ error: 'TTS error' }), { status: 500 })
  }
}
