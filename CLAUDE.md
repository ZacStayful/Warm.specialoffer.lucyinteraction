# CLAUDE.md — Stayful Lucy Lead Portal
# Complete project context for Claude Code
# Read this entire file before writing any code

---

## WHAT THIS PROJECT IS

Stayful-Lucy is a customer-facing AI portal for leads who have had a web meeting with Stayful — a short-term letting (STR) property management company based in Leicestershire and Leeds, UK. The founder is Zac.

After a web meeting, leads get access to this portal at **lucy.stayful.co.uk**. They authenticate with their email (which must match a record in Monday.com CRM), get their lead context loaded, and can:

1. **Chat with Lucy** (the AI) about their property and Stayful's service
2. **Browse a categorised FAQ** — dropdown system with 47 questions across 8 categories
3. **Speak to Lucy** — voice input (AssemblyAI) and voice output (ElevenLabs)
4. **Request documents** — management agreement, action plan, quote, presentation — triggers a Gmail draft to Zac's inbox
5. **Everything logged to Monday.com** — every question asked, every document requested, all captured as lead intelligence

---

## TECH STACK

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Deployment**: Vercel → `lucy.stayful.co.uk` (project: `lucy-stayful`, team: `zacs-projects-bcdb6016`)
- **Session**: iron-session v8 (encrypted httpOnly cookie)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`), streaming SSE
- **Voice In**: AssemblyAI real-time transcription
- **Voice Out**: ElevenLabs TTS (same voice as JARVIS — British, calm, intelligent)
- **CRM**: Monday.com board `5891626711` (Management Leads)
- **Email**: Gmail API via MCP (draft only — never auto-sends)
- **Styling**: Tailwind CSS + custom CSS animations
- **Fonts**: Orbitron (headers/logo) + Share Tech Mono (body)

---

## DESIGN SYSTEM

### Visual identity
This portal shares the same aesthetic as JARVIS (Zac's internal AI command centre). It is NOT a generic SaaS UI.

- **Background**: `#080c08` (near black with green tint)
- **Primary green**: `#5d8156` (Stayful brand)
- **Green glow**: `#7aab72`
- **Green bright**: `#8fca85`
- **Green dim**: `#3d5939`
- **Text**: `#e8f0e6`
- **Text dim**: `#7a9977`
- **Text muted**: `#4a6447`
- **Amber (warnings)**: `#d4a017`
- **Red (errors)**: `#c0392b`
- **Panel background**: `#0d120d`
- **Border**: `rgba(93, 129, 86, 0.25)`

### Typography
- **Orbitron** (Google Font): all headings, labels, logo, button text
- **Share Tech Mono** (Google Font): body text, messages, inputs, UI text

### Key design elements
- Scanline overlay on body (CSS `::before`)
- Subtle noise texture overlay (CSS `::after`)
- Background grid pattern (CSS `repeating-linear-gradient`)
- Animated Lucy Eye (SVG) — central focal point that reacts to AI state
- All panels have subtle green border glow
- Green glow on `LUCY` wordmark
- All transitions: `0.2s ease`
- Border radius: `2px` (very subtle, not rounded)

### Eye states
- `idle`: slow pulse, slow pupil wander, slow scan ring rotation
- `thinking`: fast pulse, rapid pupil movement, fast scan rings
- `speaking`: fastest pulse, fastest scans

---

## ENVIRONMENT VARIABLES

Required in `.env.local` and Vercel project settings:

```
ANTHROPIC_API_KEY=          # From console.anthropic.com
MONDAY_API_KEY=             # From Monday.com → Developer → API
SESSION_SECRET=             # Min 32 chars, random string
ELEVENLABS_API_KEY=         # From elevenlabs.io (Phase 2)
ASSEMBLYAI_API_KEY=4610edab175d4b29a43ac9d60dee2cd9  # Already set
GMAIL_CLIENT_ID=            # Google OAuth (Phase 3)
GMAIL_CLIENT_SECRET=        # Google OAuth (Phase 3)
GMAIL_REFRESH_TOKEN=        # Google OAuth (Phase 3)
ZAC_EMAIL=zac@stayful.co.uk # Destination for Gmail drafts (Phase 3)
```

---

## MONDAY.COM BOARD STRUCTURE

**Board ID**: `5891626711` (Management Leads)
**API URL**: `https://api.monday.com/v2`
**API Version header**: `2024-10`

### Column IDs used by this portal

| Column | ID | Type | Purpose |
|--------|-----|------|---------|
| Name | `name` | name | Lead's full name |
| Email | `text_mkygb5xx` | text | Auth lookup |
| Phone | `phone_mm1hp0a8` | phone | — |
| Address | `text6` | text | Property address |
| Bedrooms | `text5` | text | Bedroom count |
| Lead Profile | `text_mm1x8cgy` | text | Internal profile notes |
| Call Brief | `long_text_mm2tp6aw` | long_text | Pre-call prompt / conversation history |
| STR Profit | `text_mm2eawgk` | text | Projected STR net income |
| Long Term Let | `text_mm2dsnw7` | text | LTL rent equivalent |
| Rent/Mortgage | `text_mm26pf4c` | text | Lead's current mortgage/rent |
| Annual Rent/Mortgage | `text_mm2dc5ka` | text | Annual cost |
| Stayful Net Analyser | `text_mm2dkavd` | text | Analyser output |
| Web Meeting Presentation | `text_mm2xe380` | text | URL to their presentation |
| Post Meeting Action Plan | `text_mm3h5atf` | text | URL to action plan |
| Setup Quote | `file_mm3mq7dn` | file | Quote PDF |
| Agreement | `file_mm2cqjjh` | file | Management agreement |
| Web Meeting Transcripts | `long_text_mm231qgr` | long_text | Full meeting transcript |
| Presentation Responses | `long_text_mm2pse8d` | long_text | Responses from presentation |
| Action Plan Responses | `long_text_mm3mfgvx` | long_text | Action plan responses |
| Status | `status5` | status | Lead status |
| **Lucy Portal Intelligence** | `long_text_mm3pj2zj` | long_text | All portal session logs ← NEW |

### Auth lookup logic
1. POST `/api/auth` with `{ email }`
2. Query Monday: `items_page` where `text_mkygb5xx` contains_text email
3. Filter results for exact case-insensitive match
4. If no match → return `{ error: 'email_not_found' }` (404)
5. Frontend shows name fallback: POST `/api/auth` with `{ name }`
6. Query Monday: `items_page` where `name` contains_text name
7. If no match → return `{ error: 'name_not_found' }` (404)
8. Frontend shows final error with contact info

---

## SESSION STRUCTURE (iron-session)

```typescript
interface LeadSession {
  isLoggedIn: boolean
  itemId: string        // Monday item ID
  leadName: string      // Full name
  email: string
  address: string       // Property address
  bedrooms: string
  leadProfile: string   // Internal profile notes
  callBrief: string     // Previous conversation summary
  strProfit: string     // STR income projection
  longTermLet: string   // LTL comparison figure
  rentMortgage: string  // Monthly mortgage/rent
  presentationUrl: string
  actionPlanUrl: string
}
```

Cookie: `lucy-portal-session`, httpOnly, secure in production, 8-hour expiry

---

## API ROUTES

### POST `/api/auth`
Body: `{ email?: string, name?: string }`
- Looks up lead in Monday by email (exact match) or name (contains match)
- Sets iron-session cookie with lead data
- Returns: `{ success: true, leadName, address }` or `{ error: 'email_not_found' | 'name_not_found' }`

### GET `/api/me`
Returns current session data. If not logged in, returns `{ isLoggedIn: false }`

### DELETE `/api/me`
Destroys session (logout)

### POST `/api/chat`
Body: `{ messages: [{role, content}][] }`
- Requires valid session (401 if not)
- Builds system prompt from lead context + FAQ
- Streams Claude response as SSE
- Format: `data: { type: 'start' | 'text' | 'done' | 'error', text?, model? }\n\n`
- Logs Q&A to Monday `long_text_mm3pj2zj` asynchronously after stream completes

### POST `/api/voice/transcribe` (Phase 2)
Body: audio blob
- Sends to AssemblyAI for transcription
- Returns `{ text: string }`

### POST `/api/voice/speak` (Phase 2)
Body: `{ text: string }`
- Sends to ElevenLabs TTS
- Returns audio stream

### POST `/api/documents/request` (Phase 3)
Body: `{ documents: string[], message?: string, sessionConfirmed: boolean }`
- Only executes if `sessionConfirmed: true`
- Creates Gmail draft to Zac (ZAC_EMAIL env var)
- Pre-addressed to lead's email
- Body summarises what was requested
- Logs request to Monday intelligence column

---

## FILE STRUCTURE

```
stayful-lucy/
├── CLAUDE.md                    ← This file
├── README.md                    ← Setup instructions
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .gitignore
├── app/
│   ├── globals.css              ← Full design system, animations
│   ├── layout.tsx               ← Root layout, font loading
│   ├── page.tsx                 ← Login page
│   ├── portal/
│   │   └── page.tsx             ← Main portal (client component)
│   └── api/
│       ├── auth/route.ts        ← Monday email/name auth
│       ├── me/route.ts          ← Session check + logout
│       ├── chat/route.ts        ← Claude streaming chat
│       ├── voice/
│       │   ├── transcribe/route.ts  ← AssemblyAI (Phase 2)
│       │   └── speak/route.ts       ← ElevenLabs TTS (Phase 2)
│       └── documents/
│           └── request/route.ts     ← Gmail draft (Phase 3)
├── components/
│   ├── LucyEye.tsx              ← Animated SVG eye
│   ├── ChatInterface.tsx        ← (Phase 2 refactor if needed)
│   ├── FAQPanel.tsx             ← Categorised FAQ dropdown (Phase 2)
│   ├── VoiceButton.tsx          ← Push-to-talk + TTS (Phase 2)
│   └── DocumentRequest.tsx     ← Document request UI (Phase 3)
└── lib/
    ├── session.ts               ← iron-session config + types
    ├── monday.ts                ← Monday API client
    └── faq.ts                   ← FAQ content + system prompt builder
```

---

## PHASE BUILD PLAN

### ✅ PHASE 1 — COMPLETE
- [x] GitHub repo: `Stayful-Lucy`
- [x] Next.js 14 app with App Router
- [x] Authentication: email → Monday lookup → name fallback → iron-session
- [x] Lead context loaded from Monday on login
- [x] Chat interface with Claude (streaming SSE)
- [x] System prompt with lead context + full FAQ knowledge base
- [x] Lucy Eye SVG animation (idle / thinking / speaking states)
- [x] Login page with JARVIS aesthetic
- [x] Portal page with chat UI
- [x] Monday intelligence logging (async, non-blocking)
- [x] Sign out / session destroy
- [x] Deployed to Vercel (lucy.stayful.co.uk)

---

### ⬜ PHASE 2 — FAQ DROPDOWN + VOICE

#### 2a: FAQ Dropdown System
Build `components/FAQPanel.tsx`:

Categories (in order):
1. Your Earnings
2. Fees & What You Pay
3. The Contract
4. How We Manage
5. Getting Started
6. Your Property & Guests
7. Legal & Tax
8. Comparing Options

UI behaviour:
- Collapsible panel that slides up from bottom of screen (or side panel on desktop)
- Each category is a collapsible section
- Questions inside each category are listed
- Lead can tap/click a question → Lucy answers it in the chat
- Multiple questions can be queued — Lucy answers all in one response
- "Ask Selected" button appears when questions are ticked
- Questions marked [CORE] surface at the top of each category
- All FAQ content is in `lib/faq.ts`

#### 2b: Voice Input (AssemblyAI)
Build `components/VoiceButton.tsx`:

- Microphone button in the input area
- Press and hold (or toggle) to record
- Real-time transcription via AssemblyAI WebSocket
- Transcription appears in input field as lead speaks
- On release/stop → sends message
- AssemblyAI API key: `4610edab175d4b29a43ac9d60dee2cd9`
- Use AssemblyAI real-time transcription WebSocket API
- Show recording indicator (pulsing red dot or similar)

#### 2c: Voice Output (ElevenLabs)
Build `/api/voice/speak/route.ts`:

- After Lucy responds in chat, auto-read the response aloud
- POST to ElevenLabs API with the response text
- Stream audio back to client
- Play audio in browser
- Use the same JARVIS voice (British, calm, intelligent) — voice ID to be configured via env var `ELEVENLABS_VOICE_ID`
- Add a speaker icon in chat messages — click to replay
- User can mute/unmute voice output (toggle in header)
- While Lucy is speaking, eye state = `speaking`

ElevenLabs API pattern:
```typescript
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream
Headers: xi-api-key: ELEVENLABS_API_KEY
Body: { text, model_id: 'eleven_turbo_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }
```

---

### ⬜ PHASE 3 — DOCUMENT REQUEST + GMAIL DRAFT

Build `components/DocumentRequest.tsx`:

#### Four documents (from Monday columns)
| Document | Monday Column | Type |
|----------|--------------|------|
| Management Agreement | `file_mm2cqjjh` | file |
| Post-Meeting Action Plan | `text_mm3h5atf` | text/URL |
| Setup Quote | `file_mm3mq7dn` | file |
| Web Meeting Presentation | `text_mm2xe380` | text/URL |

#### UI behaviour
- Show as 4 cards with checkboxes
- If column is empty → show card as "Not Available" (greyed out, can't select)
- If column has value → card is selectable
- Lead ticks what they want
- "Email Me" button appears when ≥1 selected
- Before sending: Lucy asks in chat "Is there anything else you'd like included in this email before I send it?"
- Lead confirms → Lucy proceeds
- After confirmation → show "Your email has been drafted for approval — you'll receive it shortly"
- Log to Monday intelligence column

#### Gmail draft route `/api/documents/request/route.ts`
- Requires valid session
- Requires `sessionConfirmed: true` in body
- Creates Gmail draft:
  - To: lead's email (from session)
  - Subject: `Your Stayful information — [lead name]`
  - Body: summary of what was requested + any additional message
  - Attachments: requested files (fetched from Monday)
- Uses Gmail API with OAuth credentials
- Returns `{ success: true, draftId }`
- Logs to Monday `long_text_mm3pj2zj`

---

### ⬜ PHASE 4 — ENHANCED MONDAY INTELLIGENCE LOGGING

Expand the Monday logging to capture:
- Session start time
- All questions asked (timestamped)
- FAQ items selected (by category and question text)
- Documents requested
- Any follow-up requests from the lead
- Session duration
- Whether lead engaged with voice or text only

Format the log entry cleanly:
```
[25 May 2026, 14:32]
Session: Text chat
Duration: 8 minutes
Questions asked: 3
  - "What is your management fee?"
  - "Can I still use the property myself?"
  - "What about council tax?"
Documents requested: Management Agreement, Presentation
FAQ used: Fees & What You Pay (2 items), Legal & Tax (1 item)
```

---

### ⬜ PHASE 5 — POLISH + MOBILE

- Mobile-first responsive layout (currently desktop-first)
- Smooth page transitions (login → portal)
- Error boundary components
- Loading skeletons
- Retry logic on failed API calls
- Keyboard accessibility
- Meta tags and Open Graph
- Analytics (optional)

---

## LUCY SYSTEM PROMPT DESIGN

The system prompt in `lib/faq.ts` → `buildSystemPrompt()` does:

1. Sets Lucy's identity and purpose
2. Injects lead-specific context (name, address, figures, call brief)
3. Includes the full 47-question FAQ knowledge base
4. Gives behavioural instructions

Key rules baked into the prompt:
- Answer using lead's specific context where relevant
- If asked about documents, tell them to use the document request section
- Never discuss competitors negatively by name
- Never make income promises — reference their specific figures from context
- If genuinely unsure, say so and suggest contacting Zac
- Keep responses focused — not overly long
- Lucy is not Zac — if they want to speak to Zac, encourage a follow-up call

---

## IMPORTANT RULES FOR CLAUDE CODE

1. **Never auto-execute actions** — document requests must require explicit confirmation
2. **Never send emails** — only create drafts. The draft goes to Zac's inbox, Zac approves and sends
3. **Never expose internal data** — the lead should only see their own information
4. **Session required** — every portal API route (except `/api/auth`) must check `session.isLoggedIn`
5. **Async Monday logging** — never block the user-facing response waiting for Monday writes
6. **Streaming** — Claude responses always stream via SSE, never wait for full response
7. **Error handling** — every API route has try/catch, never expose raw errors to client
8. **No breaking changes to Phase 1** — extend, don't replace, the existing files

---

## STAYFUL CONTEXT

- **Company**: Stayful — short-term letting (STR) property management
- **Locations**: Leicestershire and Leeds, UK
- **Founder**: Zac
- **Zac's email**: zac@stayful.co.uk
- **Management fee**: 15% + VAT
- **Contract**: 6-month minimum, 3-month notice after
- **Payout**: 1st–5th of every month, never missed
- **Portfolio size**: ~70 properties
- **Direct bookings**: ~40% of portfolio
- **No upfront fees** — no onboarding, no photography, no setup fee from Stayful
- **Full management only** — no partial services

---

## ASSEMBLYAI INTEGRATION NOTES

API Key: `4610edab175d4b29a43ac9d60dee2cd9`

For real-time transcription, use AssemblyAI's WebSocket API:
1. POST `https://api.assemblyai.com/v2/realtime/token` to get a short-lived token
2. Connect WebSocket: `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token={token}`
3. Stream audio chunks (PCM16, 16kHz)
4. Receive partial and final transcripts
5. On final transcript, populate the input field and auto-send

---

## ELEVENLABS INTEGRATION NOTES

Voice should match JARVIS from Iron Man: British, calm, intelligent, authoritative, measured.
Voice ID is set via `ELEVENLABS_VOICE_ID` environment variable.

Suggested voice settings for this character:
```json
{
  "stability": 0.55,
  "similarity_boost": 0.75,
  "style": 0.0,
  "use_speaker_boost": true
}
```

Model: `eleven_turbo_v2` (faster, better for conversational responses)

---

## GMAIL DRAFT INTEGRATION NOTES

Uses Gmail API via OAuth 2.0. Credentials stored as env vars.

To create a draft:
```typescript
// Build MIME message
const message = [
  `To: ${leadEmail}`,
  `Subject: Your Stayful information — ${leadName}`,
  `Content-Type: text/plain; charset=utf-8`,
  '',
  emailBody
].join('\n')

// Base64url encode
const encoded = Buffer.from(message).toString('base64url')

// Create draft via Gmail API
POST https://gmail.googleapis.com/gmail/v1/users/me/drafts
Authorization: Bearer {access_token}
{ message: { raw: encoded } }
```

For attachments (Monday file columns), fetch the file URL from Monday first, then include as MIME attachment.

---

## WHEN CLAUDE CODE ASKS WHAT TO BUILD NEXT

If the user says "build Phase 2", implement sections 2a, 2b, and 2c in that order.
If the user says "build the FAQ", implement Phase 2a only.
If the user says "add voice", implement Phase 2b and 2c.
If the user says "build Phase 3" or "add document requests", implement Phase 3.
If the user says "build everything", implement all phases in order.

Always confirm the plan before writing code. Always check existing files before creating new ones.

---

## QUICK REFERENCE

| Thing | Value |
|-------|-------|
| Monday board ID | `5891626711` |
| Email column | `text_mkygb5xx` |
| Intelligence log column | `long_text_mm3pj2zj` |
| AssemblyAI key | `4610edab175d4b29a43ac9d60dee2cd9` |
| Stayful green | `#5d8156` |
| Claude model | `claude-sonnet-4-20250514` |
| ElevenLabs model | `eleven_turbo_v2` |
| Domain | `lucy.stayful.co.uk` |
| Zac's email | `zac@stayful.co.uk` |
| Vercel project | `lucy-stayful` |
| Vercel project ID | `prj_VP2tRvbxOPa9RjXQdOtECAmkEkY5` |
| Vercel team ID | `team_mDfwEWnPCdJ3rXbjzDNDWOMc` |
| Vercel team slug | `zacs-projects-bcdb6016` |
