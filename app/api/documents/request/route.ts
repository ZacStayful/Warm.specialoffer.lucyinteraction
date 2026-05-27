import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'
import { postPortalUpdate } from '@/lib/monday'

interface RequestedDoc {
  name: string
  url: string
}

export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const documents: RequestedDoc[] = Array.isArray(body.documents) ? body.documents : []
    const additionalNote: string =
      typeof body.additionalNote === 'string' ? body.additionalNote.trim() : ''
    const sessionConfirmed: boolean = body.sessionConfirmed === true

    if (!sessionConfirmed) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    }

    if (documents.length === 0) {
      return NextResponse.json({ error: 'No documents selected' }, { status: 400 })
    }

    // Step A — Build the email body
    const docLines = documents.map((d) => `• ${d.name}: ${d.url}`).join('\n')
    const emailBody = [
      `Hi ${session.leadName},`,
      '',
      'Following your recent meeting with Zac at Stayful, here are the documents you requested:',
      '',
      docLines,
      ...(additionalNote ? ['', additionalNote] : []),
      '',
      'If you have any questions, you can speak to Lucy at lucy.stayful.co.uk',
      '',
      'Best regards,',
      'The Stayful Team',
    ].join('\n')

    // Step B/C — Create a Gmail draft (only if credentials are present)
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env
    let gmailSkipped = false

    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GMAIL_CLIENT_ID,
            client_secret: GMAIL_CLIENT_SECRET,
            refresh_token: GMAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token',
          }),
          cache: 'no-store',
        })

        const tokenData = await tokenRes.json()
        const accessToken = tokenData?.access_token

        if (!accessToken) {
          console.error('[Documents] Failed to obtain Gmail access token', tokenData?.error)
          gmailSkipped = true
        } else {
          const mime = [
            `To: ${session.email}`,
            `Subject: Your Stayful documents — ${session.leadName}`,
            `Content-Type: text/plain; charset=utf-8`,
            ``,
            emailBody,
          ].join('\r\n')

          const encoded = Buffer.from(mime).toString('base64url')

          const draftRes = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: { raw: encoded } }),
              cache: 'no-store',
            }
          )

          if (!draftRes.ok) {
            const detail = await draftRes.text().catch(() => '')
            console.error('[Documents] Gmail draft failed', draftRes.status, detail)
            gmailSkipped = true
          }
        }
      } catch (gmailErr) {
        console.error('[Documents] Gmail error', gmailErr)
        gmailSkipped = true
      }
    } else {
      console.error('[Documents] Missing Gmail credentials — skipping draft')
      gmailSkipped = true
    }

    // Step D — Log to Monday as an Update (no char limit, non-blocking)
    if (session.itemId) {
      const stamp = new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const updateBody = [
        `📎 Lucy Portal — Document Request — ${stamp}`,
        '',
        `Documents requested: ${documents.map((d) => d.name).join(', ')}`,
        `Note: ${additionalNote || 'None'}`,
        `Draft email sent to: ${session.email}`,
      ].join('\n')
      postPortalUpdate(session.itemId, updateBody).catch(console.error)
    }

    return NextResponse.json({ success: true, gmailSkipped })
  } catch (err) {
    console.error('[Documents request error]', err)
    return NextResponse.json({ error: 'Document request failed' }, { status: 500 })
  }
}
