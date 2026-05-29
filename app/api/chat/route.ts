import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'
import { buildSystemPrompt } from '@/lib/faq'
import { postPortalUpdate, logPortalSession } from '@/lib/monday'
import { isInsightType } from '@/lib/insight'

export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  const { messages, source, faqCategory, faqQuestions } = await request.json()

  const systemPrompt = buildSystemPrompt({
    leadName: session.leadName,
    address: session.address,
    bedrooms: session.bedrooms,
    leadProfile: session.leadProfile,
    callBrief: session.callBrief,
    strProfit: session.strProfit,
    longTermLet: session.longTermLet,
    rentMortgage: session.rentMortgage,
    portalHistory: session.portalHistory,
    stage: session.stage,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            stream: true,
            messages: messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!response.ok) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message: 'AI service error' })}\n\n`
            )
          )
          controller.close()
          return
        }

        const reader = response.body!.getReader()
        const dec = new TextDecoder()
        let fullText = ''
        let sentLen = 0
        // Hold back a tail longer than any [[viz:...]] tag so a partial tag can
        // never leak to the client; the tag lives on the final line.
        const HOLDBACK = 48

        const emitText = (upTo: number) => {
          if (upTo > sentLen) {
            const out = fullText.slice(sentLen, upTo)
            sentLen = upTo
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', text: out })}\n\n`)
            )
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'start', model: 'claude-sonnet-4-20250514' })}\n\n`
          )
        )

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = dec.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') continue

            try {
              const parsed = JSON.parse(raw)
              if (
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta'
              ) {
                fullText += parsed.delta.text
                emitText(fullText.length - HOLDBACK)
              }
            } catch {
              // skip malformed lines
            }
          }
        }

        // Pull the hidden visual cue, then strip every tag from what we show.
        const vizMatch = fullText.match(/\[\[viz:([a-z-]+)\]\]/i)
        const cardKey = vizMatch ? vizMatch[1].toLowerCase() : null
        const card = isInsightType(cardKey) ? cardKey : null
        const cleanFull = fullText.replace(/\[\[viz:[a-z-]+\]\]/gi, '').trimEnd()

        // Flush whatever clean text remains (the held-back tail, tag removed).
        if (cleanFull.length > sentLen) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'text', text: cleanFull.slice(sentLen) })}\n\n`
            )
          )
          sentLen = cleanFull.length
        }

        if (card) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'viz', card })}\n\n`)
          )
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        )
        controller.close()

        // Log to Monday asynchronously — full Q&A as an Update (no char limit)
        const lastUserMessage = [...messages]
          .reverse()
          .find((m: { role: string }) => m.role === 'user')
        if (lastUserMessage && session.itemId) {
          const answer = cleanFull.trim()
          const truncatedAnswer =
            answer.length > 800 ? answer.slice(0, 800) + '...' : answer

          // Source label — include the FAQ category when relevant
          let sourceLabel: string
          if (source === 'voice') sourceLabel = 'Voice'
          else if (source === 'faq')
            sourceLabel = `FAQ${faqCategory ? ` — ${faqCategory}` : ''}`
          else sourceLabel = 'Text'

          // For FAQ, prefer the picked question list over the composed prompt
          const question =
            source === 'faq' &&
            Array.isArray(faqQuestions) &&
            faqQuestions.length > 0
              ? faqQuestions.join(' / ')
              : lastUserMessage.content

          const stamp = new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          const updateBody = [
            `💬 Lucy Portal — ${stamp}`,
            `Source: ${sourceLabel}`,
            '',
            `Q: ${question}`,
            '',
            `A: ${truncatedAnswer}`,
          ].join('\n')

          postPortalUpdate(session.itemId, updateBody).catch(console.error)

          // At-a-glance snapshot on the column (overwrite). Includes the most
          // recent question topics so a returning visit can pick up where they
          // left off (read back into the session on next login).
          const userQuestions = messages
            .filter((m: { role: string }) => m.role === 'user')
            .map((m: { content: string }) => m.content)
          const questionCount = userQuestions.length
          const recent = userQuestions
            .slice(-3)
            .map((q: string) => {
              const t = q.replace(/\s+/g, ' ').trim()
              return `"${t.length > 60 ? t.slice(0, 57) + '…' : t}"`
            })
            .join('; ')
          const today = new Date().toLocaleDateString('en-GB', {
            timeZone: 'Europe/London',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          const time = new Date().toLocaleTimeString('en-GB', {
            timeZone: 'Europe/London',
            hour: '2-digit',
            minute: '2-digit',
          })
          const snapshot =
            `Last portal visit: ${today}, ${time} · ${questionCount} question${questionCount === 1 ? '' : 's'}` +
            (recent ? ` · Recent: ${recent}` : '')
          logPortalSession(session.itemId, snapshot).catch(console.error)
        }
      } catch (err) {
        console.error('[Chat stream error]', err)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
