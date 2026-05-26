export interface FAQItem {
  q: string
  a: string
  core?: boolean
}

export interface FAQCategory {
  id: string
  title: string
  questions: FAQItem[]
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'earnings',
    title: 'Your Earnings',
    questions: [
      {
        core: true,
        q: 'How much can I earn from my property?',
        a: 'Every property is different, so we produce an income analysis based on comparable properties within a mile of yours — properties with a similar bedroom count, type, and location live on Airbnb and Booking.com right now. We pull 12 comparable properties, look at their occupancy rates and nightly rates, and build a projection from real data. You receive two figures: a gross figure (total bookings before deductions) and a net figure — what actually lands in your account after platform fees, cleaning, laundry, and our management fee. The net figure is the number that matters.',
      },
      {
        core: true,
        q: 'How does short-term letting compare to long-term rental?',
        a: 'We show both figures side by side. Short-term letting almost always generates more, but how much depends on your property and location. The biggest gains are on larger properties — 3 beds and above — in areas with strong demand drivers like hospitals, universities, or city centres. The right comparison is net short-term versus net long-term. A long-term rental has voids, potential management fees, and rent arrears. When you compare the floors, short-term almost always comes out ahead.',
      },
      {
        q: "What's the worst-case scenario? What happens in quiet months?",
        a: "We always show the worst month in the projections, because that's the number that tells you whether this works or not. For most properties, the quietest months are January and February. A 2-bed in a typical UK city might show £800 net in January and £2,200 in July. The long-term rent equivalent is usually around £900 per month all year. Even the worst month is in the same territory, and across the year you're materially ahead.",
      },
      {
        q: 'Can you guarantee the income?',
        a: "No — and we're upfront about that. Any company offering a guaranteed income is either setting the figure so low it isn't meaningful, or building the risk into their margin in a way that won't last. Our estimates are typically accurate to within 10–15% once a property is established. If income certainty is your main concern, look at the floor figure from the analysis — if the worst month still beats your long-term rental, the guarantee question largely answers itself.",
      },
      {
        q: 'Do you offer guaranteed rent?',
        a: "We do offer guaranteed rent, but only for selective properties where the numbers stack up for both sides. It's not something we offer across the entire portfolio, because we'd rather be honest about what works than overpromise and underdeliver.",
      },
      {
        q: 'Will income be consistent? What about quiet periods?',
        a: 'Short-term letting income has a predictable floor, not just a ceiling. The floor is based on what comparable properties in your specific postcode are already generating. We pay out between the 1st and 5th of every month without exception. Every landlord knows exactly when their money is coming, regardless of how bookings fall in any given month.',
      },
      {
        q: 'What should I expect in Year 1 versus when the property is established?',
        a: 'Year 1 is about building the foundation. Every new listing starts at zero reviews, and reviews determine where you rank and what rate you can charge. In Year 1, expect to be at around 70–80% of your full potential. You typically need 50–100 reviews before reaching full market rate, which takes around 12–18 months.',
      },
    ],
  },
  {
    id: 'fees',
    title: 'Fees & What You Pay',
    questions: [
      {
        core: true,
        q: 'What is your management fee?',
        a: "Our management fee is 15% + VAT of gross bookings — that's every booking that comes in, regardless of platform.",
      },
      {
        q: 'What does the management fee cover?',
        a: 'The 15% covers everything operational: guest communication from enquiry to checkout, dynamic pricing across all platforms, check-in and check-out coordination, cleaning and laundry coordination (actual cleaning cost is separate, charged per stay), maintenance coordination, review management, monthly statements and payout processing, and access to your dedicated Slack channel with the full team.',
      },
      {
        q: 'How does the net figure work — what are the deductions?',
        a: 'The net figure is after: platform commission (Airbnb and Booking.com each take around 12–15%), cleaning and laundry (charged per stay, typically 15–18% of gross), our management fee (15% + VAT), and any agreed maintenance costs. Your mortgage, utilities, Wi-Fi, and council tax remain your responsibility regardless of how the property is let.',
      },
      {
        core: true,
        q: 'Are there any upfront fees to get started?',
        a: 'No upfront fees. No onboarding fees. No photography fees charged to you at the start. We invest in getting your property live and recoup that through the ongoing management relationship.',
      },
      {
        q: 'How are cleaning costs handled?',
        a: "Cleaning is charged to the guest as a cleaning fee on top of the nightly rate. The guest pays it, it flows through the booking, and it's deducted from your gross payout. We do not mark up cleaning costs — it's at cost, deducted from gross, and itemised on your monthly statement.",
      },
      {
        q: 'What are my ongoing costs as the landlord?',
        a: 'Mortgage payments, utilities (gas, electric, water), Wi-Fi, and council tax — which converts to business rates once the property goes live. Most properties eventually qualify for full Small Business Rate Relief with a backdated refund.',
      },
    ],
  },
  {
    id: 'contract',
    title: 'The Contract',
    questions: [
      {
        core: true,
        q: 'Is there a contract? How long is it?',
        a: 'Yes. There is a 6-month fixed term, then a rolling 3-month notice period. The six-month minimum exists because it takes around six months to properly establish a listing, build reviews, and get the property performing at its best.',
      },
      {
        q: 'What is the notice period after the initial term?',
        a: "Three months' notice after the initial six months. During the notice period we continue managing the property and you continue receiving income.",
      },
      {
        q: 'Can I have a shorter contract or notice period?',
        a: "The 6-month minimum and 3-month notice are standard. If you have specific circumstances, that's a conversation to have directly with Zac.",
      },
      {
        q: "What if my property sells while you're managing it?",
        a: 'We work around it. If you need to do viewings, you block dates on the calendar. If you get an offer accepted and need to exit, we discuss the timeline around existing bookings and find a clean exit point.',
      },
      {
        q: 'How does switching from another management company work?',
        a: 'Check your current contract for notice period requirements — typically 30–60 days. We begin onboarding in parallel. In most cases we can transfer your existing listing — photos and reviews — to our account rather than starting from scratch.',
      },
    ],
  },
  {
    id: 'manage',
    title: 'How We Manage',
    questions: [
      {
        core: true,
        q: 'What does full management actually mean?',
        a: 'You hand over the keys, and your only job after that is to pay your mortgage and bills. Everything else is ours: listing your property, responding to every guest enquiry, managing check-in and checkout, coordinating cleaning after every stay, handling maintenance issues, dealing with guest problems at 2am, chasing reviews, adjusting pricing dynamically, and paying you every month with a full breakdown.',
      },
      {
        q: 'How do I communicate with the team? Who is my contact?',
        a: "You get a dedicated Slack channel with the full Stayful team. It's a live channel, not an inbox. Martyn handles most landlord communication day to day. You also have live access to your booking calendar at any time. We do quarterly performance review calls.",
      },
      {
        q: "How do I know what's happening with my property?",
        a: 'Three ways: your booking calendar (live access, viewable any time), monthly statements (sent between the 1st and 5th of each month), and your Slack channel (maintenance reports, inspection photos, anything we think you\'d want to know in real time).',
      },
      {
        q: 'What platforms do you list on?',
        a: 'Airbnb and Booking.com are the two primary platforms. On top of those, we have our own direct booking platform targeting repeat guests and corporate clients. As your listing matures, direct bookings typically grow to around 30–40% of revenue.',
      },
      {
        q: 'How does pricing work?',
        a: "We use dynamic pricing software combined with manual oversight. The software adjusts rates based on demand, local events, lead time, and competitor pricing — but we review and override where needed. Your headline nightly rate will fluctuate — that's normal. What matters is the monthly outcome.",
      },
      {
        q: 'How do guests get into the property?',
        a: 'No one meets guests at the door. We use key safes or smart locks. When a booking is confirmed, guests receive automated check-in instructions and the access code, timed to release before check-in.',
      },
      {
        q: "What happens if there's a maintenance emergency in the middle of the night?",
        a: "We cover it. Guest-facing communication and emergency response is 24/7. The only time you'd hear about a maintenance issue is if it requires a spend above a threshold we agree upfront, or if it needs your decision as the owner.",
      },
      {
        q: 'Can I use my own cleaners or maintenance team?',
        a: "Maintenance — yes, if your team meets our requirements (available out of hours and weekends). Cleaning — generally no, because we need to maintain control over cleaning standards. If you have a cleaner you're extremely confident in, we can discuss it case by case.",
      },
      {
        q: "How can you manage my property if you're not local?",
        a: 'We have a centralised team who coordinate the day-to-day operations, and a local network of vetted cleaners and maintenance specialists who work on the ground. This is how every credible short-let operator works. When a property comes onboard, it\'s actively advertised to our approved local suppliers — best service for best price.',
      },
    ],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    questions: [
      {
        core: true,
        q: 'What does the onboarding process look like?',
        a: "Once you've signed the agreement: setup (we furnish and style the property, or you use our guide), photography (professional photography once ready), listing creation (we build listings on all platforms and get everything live), then first bookings — typically within 24–48 hours on a well-prepared property. Total time from signing to live: typically 2–3 weeks.",
      },
      {
        q: 'Does the property need to be furnished?',
        a: "Yes — short-term letting requires a fully furnished property. Rough furnishing cost guide: 1-bed £2,500–£4,000 / 2-bed £4,000–£6,500 / 3-bed £6,000–£9,500 / 4-bed £8,000–£13,000. You own everything, and it's an allowable business expense.",
      },
      {
        q: 'Can you help with furnishing?',
        a: 'Yes — we offer a full furnishing and setup service: procurement, delivery, installation, staging, and photography. Alternatively, we provide a detailed setup guide and you source everything yourself.',
      },
      {
        q: 'How long does it take to go live?',
        a: 'Furnished and ready: around 2 weeks. Needs furnishing first: allow 3–5 weeks.',
      },
      {
        q: 'Do you come to view the property?',
        a: "Yes. The viewing normally happens after the contract is signed and you're fully committed to coming onboard.",
      },
    ],
  },
  {
    id: 'property-guests',
    title: 'Your Property & Guests',
    questions: [
      {
        core: true,
        q: 'Can I still use the property myself?',
        a: "Yes — completely. You block dates on the calendar and they're off the market instantly. No fees charged for blocking. Most bookings come in within 30 days, so blocking a few weeks ahead means you'll rarely have a conflict. Message us via Slack when you're ready and we'll arrange a clean before you arrive.",
      },
      {
        core: true,
        q: 'What if guests damage my property?',
        a: 'Three layers of protection: a security deposit (£200 collected from every guest before check-in), damage cover (up to £100,000 per guest stay for damage beyond the deposit), and ID verification (every guest submits ID before check-in). Property damage from short-let guests is far less common than people expect.',
      },
      {
        q: 'How do you vet guests?',
        a: "Every booking requires ID verification. On Airbnb, guests also have profile history and reviews from previous stays. Around 30% of bookings come from guests we've hosted before. We don't accept stag or hen party bookings, large group events at unsuitable properties, or guests with no verification.",
      },
      {
        q: 'Do you get direct bookings?',
        a: "Yes. Around 40% of all bookings across our portfolio are direct — they don't go through Airbnb or Booking.com. This reduces platform dependency and strengthens income stability.",
      },
      {
        q: 'How are payouts handled?',
        a: "All bookings come in on Stayful's account and channel manager. You have full visibility through the channel manager access we provide. Payouts are distributed between the 1st and 5th of every month, with a full statement showing a clear breakdown of income and every deduction.",
      },
    ],
  },
  {
    id: 'legal-tax',
    title: 'Legal & Tax',
    questions: [
      {
        core: true,
        q: 'What about council tax and business rates?',
        a: 'When a property goes into short-term letting, it moves from council tax to business rates. The transition takes around 6–12 months to process. Once reclassified, most short-let properties qualify for Small Business Rate Relief, bringing the rate to zero — with a backdated refund.',
      },
      {
        q: "Do I need my lender's permission for short-term letting?",
        a: 'Buy-to-let mortgages — most lenders are fine but some require notification. Residential mortgages — more complicated. Short-term letting on a residential mortgage is technically a breach of conditions for most lenders. The first call should be to your mortgage broker. We always flag this before you sign anything.',
      },
      {
        q: 'Do I need any special insurance?',
        a: "Yes. Standard landlord insurance won't cover short-term letting. The main UK providers are Guardhog and Pikl. It's typically around £200–500 per year. Airbnb's AirCover is not FCA-regulated and is not a replacement for proper insurance.",
      },
      {
        q: 'I have a leasehold flat — do I need freeholder permission?',
        a: "Potentially, yes. Check your lease for: whether subletting is permitted, whether there's a minimum subletting period, and whether you need freeholder consent. In the majority of cases leases are fine.",
      },
      {
        q: 'What about tax on the rental income?',
        a: "Short-term rental income is taxable. Short-term lettings can qualify as a Furnished Holiday Let (FHL), which has specific tax advantages including mortgage interest offset and capital allowances on furnishings. The rules changed in April 2025, so speak to your accountant. We'll point you towards the right questions to ask.",
      },
    ],
  },
  {
    id: 'comparing',
    title: 'Comparing Options',
    questions: [
      {
        q: "Why shouldn't I just manage it myself on Airbnb?",
        a: "Self-managing involves: responding to enquiries within an hour any time of day, coordinating cleaning between every stay, handling check-in communications, dealing with guest issues at any hour, and managing dynamic pricing manually. Our fee is 15%. Most people who try self-managing find the question quickly becomes whether they'd pay twice that to never deal with a guest complaint at 11pm on a Saturday again. We also tend to outperform self-managed listings through dynamic pricing tools and established review profiles.",
      },
      {
        core: true,
        q: 'How do you compare to other management companies?',
        a: "Our management fee is 15% + VAT — some national operators charge 18–22% + VAT. We manage around 70 properties with a hands-on team. National operators manage thousands, and the most common complaint from landlords switching to us is that they couldn't get anyone on the phone. We don't mark up cleaning costs — it's at cost, itemised on your statement.",
      },
      {
        q: 'Where are you based? What areas do you cover?',
        a: 'We have two main locations — Leicestershire and Leeds — and operate across a wider area beyond both. We have a centralised operations team and a local network of approved suppliers on the ground wherever we manage properties.',
      },
      {
        q: 'Do you have a physical office?',
        a: 'We operate through virtual offices. The best way to meet is a web meeting with Zac, which works just as well and is far more convenient.',
      },
      {
        q: 'Can I do short-term letting for just a few months?',
        a: "It doesn't really work on a short window. A new listing takes 3–6 months to build the reviews and visibility needed to perform. Our minimum is 6 months.",
      },
    ],
  },
]

export const STAYFUL_FAQ =
  '\nSTAYFUL FAQ — COMPLETE KNOWLEDGE BASE\n\n' +
  FAQ_CATEGORIES.map(
    (cat) =>
      `=== ${cat.title.toUpperCase()} ===\n\n` +
      cat.questions.map((item) => `Q: ${item.q}\nA: ${item.a}`).join('\n\n')
  ).join('\n\n') +
  '\n'

export function buildSystemPrompt(lead: {
  leadName: string
  address: string
  bedrooms: string
  leadProfile: string
  callBrief: string
  strProfit: string
  longTermLet: string
  rentMortgage: string
}) {
  const contextLines = [
    lead.address && `Property address: ${lead.address}`,
    lead.bedrooms && `Bedrooms: ${lead.bedrooms}`,
    lead.rentMortgage && `Current mortgage/rent: ${lead.rentMortgage}`,
    lead.longTermLet && `Long-term rental estimate: ${lead.longTermLet}`,
    lead.strProfit && `STR net income projection: ${lead.strProfit}`,
    lead.leadProfile && `Lead profile notes: ${lead.leadProfile}`,
    lead.callBrief && `Previous conversation summary: ${lead.callBrief}`,
  ]
    .filter(Boolean)
    .join('\n')

  return `You are Lucy, Stayful's AI assistant. You are speaking with ${lead.leadName || 'a landlord'} who has recently had a web meeting with Zac at Stayful.

YOUR ROLE:
You are here to help ${lead.leadName || 'this landlord'} understand Stayful's service, answer their questions, and help them feel confident about next steps. You know this person — you have context from their previous discussion with Zac. Be warm, clear, and helpful. You speak naturally, not like a corporate chatbot.

SPOKEN SUMMARY — ALWAYS DO THIS FIRST:
Begin EVERY reply with a short spoken summary wrapped in [VOICE] ... [/VOICE] tags. This is the part ${lead.leadName?.split(' ')[0] || 'they'} will HEAR out loud, so make it sound like a real person talking:
- 1–2 warm, natural sentences that capture the gist — do NOT read everything, summarise the key point
- Conversational and personable: use their first name now and then, contractions, a friendly tone
- Plain spoken English only — no markdown, no bullet points, no headings, no URLs
- Speak numbers as words ("fifteen percent plus VAT", not "15% + VAT"; "around two thousand pounds", not "£2,000")

After the closing [/VOICE] tag, write your full written answer as normal — this is what they READ on screen, and it can include the detail, figures, and light structure.

Example:
[VOICE]Great question — in short, our fee is fifteen percent plus VAT, and there are no upfront costs at all. I've popped the full breakdown below for you.[/VOICE]
Our management fee is 15% + VAT of the booking revenue. There are no setup fees, no onboarding costs, and no photography charges...

LEAD CONTEXT:
${contextLines || 'Context not available — answer questions using general Stayful knowledge.'}

STAYFUL KNOWLEDGE BASE:
${STAYFUL_FAQ}

INSTRUCTIONS:
- Always lead with the [VOICE] spoken summary, then the written answer (see above)
- Be genuinely personable and human — warm, encouraging, never robotic or scripted
- Answer questions clearly and helpfully using the knowledge base above
- Reference the lead's specific context where relevant (their property, their figures, their situation)
- If they ask about their specific income projections or property details, use the figures from their context
- If they want to request documents (management agreement, action plan, setup quote, or their presentation), let them know they can use the document request section of the portal
- Keep responses focused and conversational — not overly long
- Never be dismissive. If they have concerns, acknowledge them honestly.
- If asked something genuinely outside your knowledge, say so clearly and suggest they contact Zac directly
- Do not discuss competitor companies negatively by name
- You are not Zac. If they ask to speak to Zac, encourage them to book a follow-up call.`
}
