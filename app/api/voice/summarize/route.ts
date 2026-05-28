import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'

// Turns Lucy's full written answer into a spoken-friendly summary. The portal
// shows the full text on screen but speaks this summary aloud — it must carry
// all the information from the answer, condensed and easy to follow by ear.
const SUMMARY_SYSTEM = `You convert a written answer from Lucy (Stayful's assistant) into how she would say it out loud on the phone.

Rules:
- Keep ALL the important information and meaning from the written text. Do not drop facts, figures, or steps.
- Do not read it word for word. Re-express it as natural, spoken British English — easy to understand by ear.
- Be concise: shorter than the written version, no filler, no repetition.
- Use normal sentences and punctuation (commas and full stops) so it reads with natural pauses.
- No markdown, no bullet points, no headings, no URLs, no emojis.
- Speak as Lucy in the first person, warm and clear. Do not add greetings or sign-offs.
- Output only the spoken version — nothing else.`

export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  try {
    const { text } = await request.json()
    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
      })
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: SUMMARY_SYSTEM,
        messages: [{ role: 'user', content: text.slice(0, 6000) }],
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      console.error('[Summarize] Anthropic error', resp.status, detail)
      return new Response(JSON.stringify({ error: 'Summarize failed' }), {
        status: 502,
      })
    }

    const data = await resp.json()
    const summary: string =
      Array.isArray(data?.content) && data.content[0]?.type === 'text'
        ? data.content[0].text.trim()
        : ''

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Empty summary' }), {
        status: 502,
      })
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[Summarize error]', err)
    return new Response(JSON.stringify({ error: 'Summarize error' }), {
      status: 500,
    })
  }
}
