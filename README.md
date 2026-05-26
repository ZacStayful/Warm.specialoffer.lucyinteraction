# Stayful Lucy — Lead Portal

AI-powered portal for post-web-meeting leads. Leads authenticate via email, get their Monday context loaded, and can chat with Lucy about their property and Stayful's service.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Deployment**: Vercel → `lucy.stayful.co.uk`
- **Auth**: iron-session (encrypted cookie)
- **AI**: Claude Sonnet (Anthropic API, streaming)
- **CRM**: Monday.com board `5891626711`

---

## Setup

### 1. Clone and install
```bash
git clone https://github.com/YOUR_ORG/Stayful-Lucy.git
cd Stayful-Lucy
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in:
```
ANTHROPIC_API_KEY=       # From console.anthropic.com
MONDAY_API_KEY=          # From Monday.com Developer section
SESSION_SECRET=          # Any random string, min 32 chars
```

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B — GitHub integration
1. Push to GitHub (`Stayful-Lucy` repo)
2. Go to vercel.com → New Project → Import from GitHub
3. Add environment variables in Vercel project settings
4. Deploy

### Custom domain
In Vercel project settings → Domains → add `lucy.stayful.co.uk`
Then add a CNAME record in your DNS: `lucy` → `cname.vercel-dns.com`

---

## Monday.com Columns Used

| Column | ID | Purpose |
|--------|-----|---------|
| Email | `text_mkygb5xx` | Auth lookup |
| Lead Profile | `text_mm1x8cgy` | Context |
| Address | `text6` | Context |
| Call Brief | `long_text_mm2tp6aw` | Context |
| STR Profit | `text_mm2eawgk` | Income figures |
| Long Term Let | `text_mm2dsnw7` | Comparison figure |
| Rent/Mortgage | `text_mm26pf4c` | Cost context |
| Bedrooms | `text5` | Property detail |
| Presentation URL | `text_mm2xe380` | Document request |
| Action Plan URL | `text_mm3h5atf` | Document request |
| Setup Quote | `file_mm3mq7dn` | Document request |
| Agreement | `file_mm2cqjjh` | Document request |
| **Lucy Portal Intelligence** | `long_text_mm3pj2zj` | Session logging |

---

## Build Phases

- ✅ **Phase 1** — Auth, lead context, text chat, Monday logging
- ⬜ **Phase 2** — Categorised FAQ dropdown, voice input/output
- ⬜ **Phase 3** — Document request + Gmail draft
- ⬜ **Phase 4** — Full Monday intelligence logging
- ⬜ **Phase 5** — Polish, performance, mobile
