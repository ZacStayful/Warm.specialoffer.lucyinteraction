import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, LeadSession } from '@/lib/session'

// Receives a recorded audio blob, uploads it to AssemblyAI, submits a
// transcription job and polls until complete. More reliable than the
// realtime WebSocket and works on all AssemblyAI accounts.
export async function POST(request: NextRequest) {
  const session = await getIronSession<LeadSession>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY
    if (!apiKey) {
      console.error('[Transcribe] Missing ASSEMBLYAI_API_KEY')
      return NextResponse.json({ error: 'Voice input not configured' }, { status: 503 })
    }

    const formData = await request.formData()
    const audio = formData.get('audio')
    if (!audio || typeof audio === 'string') {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    const audioBuffer = await audio.arrayBuffer()

    // 1. Upload audio to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { authorization: apiKey },
      body: audioBuffer,
      cache: 'no-store',
    })
    if (!uploadRes.ok) {
      const detail = await uploadRes.text().catch(() => '')
      console.error('[Transcribe] upload failed', uploadRes.status, detail)
      return NextResponse.json({ error: 'Upload failed' }, { status: 502 })
    }
    const { upload_url } = await uploadRes.json()

    // 2. Submit for transcription
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ audio_url: upload_url }),
      cache: 'no-store',
    })
    if (!transcriptRes.ok) {
      const detail = await transcriptRes.text().catch(() => '')
      console.error('[Transcribe] submit failed', transcriptRes.status, detail)
      return NextResponse.json({ error: 'Transcription submit failed' }, { status: 502 })
    }
    const { id } = await transcriptRes.json()

    // 3. Poll until complete (max ~30s)
    let transcript: string | null = null
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: apiKey },
        cache: 'no-store',
      })
      const data = await poll.json()
      if (data.status === 'completed') {
        transcript = data.text
        break
      }
      if (data.status === 'error') {
        console.error('[Transcribe] AssemblyAI error', data.error)
        break
      }
    }

    return NextResponse.json({ text: transcript || '' })
  } catch (err) {
    console.error('[Transcribe error]', err)
    return NextResponse.json({ error: 'Transcription error' }, { status: 500 })
  }
}
