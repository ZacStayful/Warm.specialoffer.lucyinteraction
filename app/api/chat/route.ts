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

  const { messages } = await request.json()

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

        // Log to Monday asynchronously
        const lastUserMessage = [...messages]
          .reverse()
          .find((m: { role: string }) => m.role === 'user')
        if (lastUserMessage && session.itemId) {
          const writtenAnswer = fullText.replace(/\[VOICE\][\s\S]*?\[\/VOICE\]/g, '').trim()
          const logEntry = `Q: ${lastUserMessage.content}\nA: ${writtenAnswer.slice(0, 500)}${writtenAnswer.length > 500 ? '...' : ''}`
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
