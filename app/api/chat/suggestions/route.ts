import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'

// Suggests a few natural follow-up questions a property owner might ask next,
// so the dashboard can show one-tap chips that keep the conversation going.
const SYSTEM = `You generate follow-up questions for a property owner talking to Lucy, the assistant for Stayful (a UK short-term-let management company).

Given the last question and Lucy's answer, return the 3 most natural follow-up questions THIS owner is most likely to want to ask next.

Rules:
- Write them in the owner's first-person voice ("Can I...", "What happens if...", "How do you...").
- Each must be short — 8 words or fewer.
- They must be genuinely useful next steps, not restating what was just answered.
- Stay on Stayful-relevant topics (earnings, fees, the contract, management, getting started, guests, tax).
- Return ONLY a JSON array of 3 strings. No prose, no markdown, no keys.`

export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { question, answer } = await request.json()
    if (typeof answer !== 'string' || !answer.trim()) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userContent = `Owner asked: ${question || '(opening question)'}\n\nLucy answered: ${answer.slice(0, 3000)}`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: SYSTEM,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    if (!resp.ok) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await resp.json()
    const raw: string =
      Array.isArray(data?.content) && data.content[0]?.type === 'text'
        ? data.content[0].text
        : ''

    let suggestions: string[] = []
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed)) {
          suggestions = parsed
            .filter(s => typeof s === 'string')
            .map(s => s.trim())
            .filter(Boolean)
            .slice(0, 3)
        }
      } catch {
        // leave suggestions empty on parse failure
      }
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[Suggestions error]', err)
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
