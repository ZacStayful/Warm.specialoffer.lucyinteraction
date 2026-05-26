import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'
import { buildSystemPrompt } from '@/lib/faq'
import { logPortalSession } from '@/lib/monday'

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
                const text = parsed.delta.text
                fullText += text
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'text', text })}\n\n`
                  )
                )
              }
            } catch {
              // skip malformed lines
            }
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        )
        controller.close()

        // Log to Monday asynchronously — richer per-exchange format
        const lastUserMessage = [...messages]
          .reverse()
          .find((m: { role: string }) => m.role === 'user')
        if (lastUserMessage && session.itemId) {
          const answer = fullText.trim()
          const truncated =
            answer.slice(0, 500) + (answer.length > 500 ? '...' : '')

          const inputMethod =
            source === 'voice' ? 'Voice' : source === 'faq' ? 'FAQ' : 'Text'

          // Question line — for FAQ, list the picked questions + category
          let questionLine: string
          if (
            source === 'faq' &&
            Array.isArray(faqQuestions) &&
            faqQuestions.length > 0
          ) {
            const cat = faqCategory ? ` — ${faqCategory}` : ''
            questionLine = `Q (faq${cat}): ${faqQuestions.join(' / ')}`
          } else {
            const tag = source === 'voice' ? 'voice' : 'text'
            questionLine = `Q (${tag}): ${lastUserMessage.content}`
          }

          const questionCount = messages.filter(
            (m: { role: string }) => m.role === 'user'
          ).length
          const divider = '─────────────────────────'

          const logEntry = [
            'SESSION',
            `Input method: ${inputMethod}`,
            divider,
            questionLine,
            `A: ${truncated}`,
            divider,
            `Session total: ${questionCount} question${questionCount === 1 ? '' : 's'}`,
          ].join('\n')

          logPortalSession(session.itemId, logEntry).catch(console.error)
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
