import type { LeadStage } from './session'

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

// Keep the system prompt lean: surface the first N sentences of each FAQ
// answer. Lucy still has the gist and can elaborate / invite a follow-up.
function firstSentences(text: string, n: number): string {
  const matches = text.match(/[^.!?]+[.!?]+(?:\s|$)/g)
  if (!matches || matches.length <= n) return text.trim()
  return matches.slice(0, n).join('').trim()
}

export const STAYFUL_FAQ =
  '\nSTAYFUL FAQ — COMPLETE KNOWLEDGE BASE\n\n' +
  FAQ_CATEGORIES.map(
    (cat) =>
      `=== ${cat.title.toUpperCase()} ===\n\n` +
      cat.questions
        .map((item) => `Q: ${item.q}\nA: ${firstSentences(item.a, 2)}`)
        .join('\n\n')
  ).join('\n\n') +
  '\n'

// Full knowledge of Stayful's Property Management Agreement (MWB Stays Ltd
// trading as Stayful). Lucy uses this to answer contract questions accurately
// AND to explain WHY each term exists. Figures here are authoritative.
export const MANAGEMENT_AGREEMENT = `
STAYFUL PROPERTY MANAGEMENT AGREEMENT — FULL KNOWLEDGE (with the reasoning behind each term)

Parties: MWB Stays Ltd trading as Stayful ("Agent"), 20 Wenlock Road, London N1 7GU, and the property owner ("Owner"). This is a business-to-business commercial agreement — the Owner is not treated as a consumer, and the Consumer Rights Act 2015 does not apply.

1. TERM & TERMINATION
- Initial fixed term of six (6) months. If the Owner terminates early during this fixed term, an early exit fee of £1,000 applies.
- After the initial term it becomes a rolling three (3) month notice period — either party can end it with three months' written notice.
- WHY: A new short-term listing takes roughly six months to establish — to build reviews, climb the search rankings on Airbnb/Booking.com, and reach its true earning potential. Leaving earlier means the property never gets the chance to perform, and Stayful has already absorbed the onboarding cost and lost future revenue. The six-month commitment protects that shared investment. The £1,000 is agreed in advance as a genuine pre-estimate of those losses (onboarding spend, lost future revenue, potential platform penalties).
- The Agent can also terminate immediately if the property becomes unsuitable for short-term rental — e.g. repeated guest complaints, failing safety/regulatory compliance, excessive wear or damage, persistent noise/neighbour issues, or the Owner refusing to resolve maintenance or safety issues. WHY: Stayful's reputation and platform standing are shared across the portfolio; one problem property can harm guest ratings and the wider account.

2. APPOINTMENT & AUTHORITY
- The Owner appoints Stayful as the exclusive managing agent for short-term lettings, with full authority over pricing strategy, promotions, platform selection and listing content (unless agreed otherwise in writing).
- WHY: Dynamic pricing and listing optimisation only work when one party controls them consistently. Split control leads to mispricing and lost bookings.

3. AGENT RESPONSIBILITIES
- Stayful's management responsibility begins only once the property is in a lettable condition. Work needed to get it there is outside standard management and quoted separately.
- Stayful handles: listing setup across platforms, guest communications, vetting, check-ins/outs, reviews, professional cleaning/laundry/restocking coordination, complaint resolution, damage notifications and recovery attempts, monthly revenue statements, owner calendar access, restocking basic consumables (at cost of labour plus materials), and authorising urgent repairs up to £300 without prior consent.
- Additional visits (cleaning, maintenance, photography, call-outs) and call-outs caused by issues outside Stayful's control (guest lockouts, lost keys, emergency visits) are chargeable and subject to availability — quoted in advance where possible.
- Office hours: Monday–Friday, 8:30am–6:00pm, excluding public holidays. Out-of-hours requests are actioned the next business day.

3A. ONBOARDING PERIOD
- Onboarding typically takes 7–14 working days, but depends on third parties, access, documentation, property condition, supplier availability and platform processing times.
- WHY a delay isn't a breach: those factors are outside Stayful's control, so a delay beyond 14 days is not a breach and is not grounds for early termination or a refund.

4. OWNER RESPONSIBILITIES
- The Owner is solely responsible for all ownership/operation/maintenance costs: mortgage, utilities, council tax, insurance, repairs and legal compliance. Stayful is not liable for these costs.
- The Owner must: keep the property legally compliant and lettable; provide up-to-date gas and electrical safety certificates; maintain valid building/landlord/public liability insurance covering short-term lets (failure lets Stayful suspend listings or terminate without notice); supply at least 3 complete sets of bed and bath linen (unless a linen-hire service is agreed in writing); supply appliance instructions; provide 2 full sets of keys/fobs (1 guest, 1 emergency); keep utilities active in the Owner's name; and provide uninterrupted broadband.
- WHY the linen/keys/broadband specifics: turnovers between guests are tight, so spare linen sets keep the property bookable while laundry is out; an emergency key set avoids costly lockout call-outs; and guests expect working Wi-Fi from the first booking.

ROUTINE MAINTENANCE (Owner's responsibility): annual carpet cleaning, annual repaint/wallpaper review, annual boiler and fire-extinguisher servicing, mattresses reviewed every 3 years (must be CRIB 5 / Source 5 fire-compliant), soft furnishings and electrical items reviewed every 3 years, annual review of ancillary items, annual PAT testing of portable appliances, kitchen appliances reviewed every 3 years. WHY: short-let properties get far more use than a long-term tenancy, and guests rate on condition — keeping things fresh protects both ratings and revenue, and PAT testing/CRIB 5 are safety requirements.

LANDLORD STAYS & ACCESS (Clause 4 / 4A): If the Owner wants to stay or access the property they must coordinate with Stayful in advance; confirmed guest bookings always take priority. Unscheduled access needs at least 72 hours' notice, must be requested in writing (via the dedicated Slack channel), and approved in writing before attending — except in a genuine emergency posing immediate risk to life or the structure. WHY: a guest who finds the owner turning up unannounced will leave a poor review or complain; protecting guest privacy protects the listing. Unauthorised access is treated as a material breach.

5. CLEANING & LINEN: Changeover cleaning is charged to the guest where possible; otherwise the Owner bears it. Stayful may run periodic deep cleans to maintain standards. Guest toiletries can be provided on request at Owner cost.

6. DAMAGE & MAINTENANCE: Stayful is not liable for guest-caused damage, wear and tear, or lost revenue from property condition, where reasonable recovery efforts (via the platform or guest) have been made. The Owner accepts the financial risk of unrecoverable guest-caused damage and authorises repairs up to £300 without prior approval. WHY: platforms (Airbnb/Booking.com) hold the guest relationship and deposits, so recovery runs through them; the £300 threshold lets Stayful fix small issues fast without chasing approval and losing bookings.

7. WASTE: If not in a managed block, the Owner arranges refuse collection (extra private-collection costs passed on).

8. SAFETY & COMPLIANCE: Owner provides an up-to-date Fire Risk Assessment, CO2 alarms where required, fire blankets and a first aid kit, and ensures all safety measures meet legislation.

9. UTILITIES & INTERNET: Owner sets up and pays utilities in their name; internet must be live before listings go live. Stayful doesn't attend installations and isn't responsible for smart-thermostat setup unless agreed in writing.

10. COMMUNICATION: Day-to-day communication runs through a dedicated Slack channel set up by Stayful — the primary, official channel — used for daily operations, monthly statements, and maintenance/damage/guest updates. Stayful aims to respond within 24 hours during office hours. Email is for documentation, formal notices, or if the Owner can't access Slack (email replies can take up to 5 working days). Stayful offers a video review call one month after going live, plus optional quarterly reviews. WHY Slack: it keeps every operational message, statement and decision in one searchable, timestamped place rather than scattered across texts and emails.

11. FINANCIAL TERMS
- Management Fee: 15% plus VAT of gross rental revenue (after OTA/platform fees, before costs of sale). This is the standard fee.
- Some individual agreements carry a negotiated special condition — for example a reduced introductory rate (such as 12% plus VAT) during the fixed initial six-month term. Whether a lead has any such special condition, and the exact figure, depends on what is written on their own signed agreement. If a lead asks what THEIR specific rate is, give the standard (15% + VAT) but tell them to confirm any introductory/negotiated rate against their own agreement or with Zac — don't assert a personal discounted rate you can't see.
- A monthly software fee of £42 is deducted from payouts (covers the management/channel software, dynamic pricing tools and owner dashboard).
- Additional charges (parking fines, chargebacks, supplies, etc.) are billed to the Owner.
- For claims under £75, Stayful may decline to pursue, to avoid provoking guest retaliation (a bad review can cost far more than £75 in lost future bookings).
- A temporary negative account balance is allowed up to minus £500; anything beyond −£500 is settled within 7 days of invoice.
- Stayful may apply a 5% or 10% plus VAT booking-channel commission on certain direct or externally-sourced bookings where Stayful pays a fee to source/secure that booking. This is standard industry practice and is far below the 15%+ that major OTAs charge — and it sits outside the standard management fee.
- WHY 15% + VAT: it's a full-service, fully-managed fee — pricing, guest comms 7 days a week, cleaning/laundry coordination, listing management across platforms, and complaint handling — with no upfront onboarding, photography or setup fees from Stayful. It's all-inclusive of the day-to-day management rather than a low headline rate with hidden add-ons.

12. NO GUARANTEE OF EARNINGS: The Owner is responsible for their own assessment of viability. Stayful gives no investment advice and makes no guarantees on bookings, occupancy, revenue or profit. Any income projections are illustrative only and not a contractual obligation. WHY: real income depends on the property, location, season and how it's maintained — projections are built from real comparable data but can't be promised.

13. GUEST TERMS: All guests must accept Stayful's standard Guest Terms and House Rules, enforced by Stayful.

14. INSURANCE: The Owner confirms appropriate holiday-let/landlord/building/public-liability insurance is in place, that the policy permits short-term/serviced-accommodation use, and that proof will be provided on request. WHY: standard residential landlord policies often exclude short-term lets; the right cover protects the Owner.

15. & 20. DISPUTE RESOLUTION / GOVERNING LAW: Parties attempt good-faith resolution; governed by the laws of England and Wales, under the exclusive jurisdiction of the English courts. It is a B2B commercial agreement.

16. FORCE MAJEURE: Neither party is liable for failures caused by events beyond reasonable control (acts of God, government restrictions, natural disasters, platform-wide outages).

17. EXCLUSIONS & LIMITATION OF LIABILITY: Stayful is not liable for guest actions/non-compliance, damage recovery where insufficient evidence is provided, platform decisions or chargebacks, lost revenue from cancellations/overstays/interruptions, or maintenance/communal repairs outside its control. The Owner indemnifies Stayful for property-related injury/damage, failure to meet legal safety standards, and contractor issues not caused by Stayful. Neighbour/third-party disputes are the Owner's responsibility.

18. & 19. ENTIRE AGREEMENT / AMENDMENTS: This is the full agreement; changes must be in writing. Stayful may update the agreement over time (latest version at stayful.co.uk/terms-of-service) and will notify of material changes via Slack/email — continued use is acceptance. Importantly: if Stayful makes a material change during the fixed initial term and the Owner doesn't agree, the Owner can continue under the originally agreed terms until the fixed term expires.

21. PAYOUT INFORMATION: Owner payouts are processed monthly within the first three (3) working days of the following month, with a reservation statement/invoice sent within 24 hours of payout. Bookings are paid out in the month the booking ends (based on the guest's check-out date). The only early-payout case is a booking that spans two months and is longer than 30 nights — available on request with at least 7 days' notice. WHY pay on check-out: that's when the booking is final (no cancellation/refund risk), so payouts are reliable and never clawed back.

22. OWNER INTERFERENCE: The Owner agrees not to interfere with guest communications, bookings, pricing or operations; direct contact with guests is prohibited unless authorised in writing. WHY: mixed messages to guests, or owner-led price changes, break the managed system and can cost bookings and ratings.

23. ONBOARDING & SETUP FEES: Help beyond standard onboarding (furnishing, sourcing suppliers, coordinating tradespeople, hands-on setup) is quoted and charged separately, possibly with payment upfront. The Owner remains liable for operational/management/third-party costs incurred in onboarding even if they terminate during the initial 6-month term; if no reimbursement is agreed, the £1,000 early termination fee becomes payable (or higher if actual costs exceed it).

24. OWNER'S RIGHT TO REVIEW BOOKINGS: The Owner can view real-time bookings via the software but cannot reject, cancel or interfere with confirmed/pending bookings (except a bona fide emergency making the property uninhabitable). WHY: cancelling a confirmed guest triggers platform penalties and damages the listing's standing.

25. EARLY TERMINATION PENALTY: If the Owner withdraws the property before the notice period ends without Stayful's written agreement, they're liable for a £1,000 fixed penalty OR the total value of confirmed bookings in the unfulfilled notice period (whichever is higher), plus any platform cancellation fees, non-recoverable guest refunds, lost revenue from listing suspension, and reasonable admin/reputational costs. Also applies if the Owner fails to give the required 3 months' notice.

26. NON-SOLICITATION: The Owner agrees not to directly engage contractors/cleaners/suppliers introduced by Stayful during the term and for 12 months after; breach incurs a £1,000 referral fee per individual/supplier. WHY: Stayful invests in finding and vetting reliable suppliers — this protects those operational relationships.

27. PERSONAL PROPERTY: Stayful isn't responsible for personal belongings left at the property; the Owner clears personal items before management begins.

28. TIME BAR FOR CLAIMS: Any complaint/claim must be raised in writing via Slack within 7 days of the Owner becoming aware, and in any event within 30 days of the issue occurring — otherwise it's time-barred. WHY: short-let issues need to be evidenced and addressed quickly (photos, guest records) while the facts are fresh.

PAYOUTS SUMMARY: 1st–5th of the month, reliable monthly payouts. Standard management fee 15% + VAT (some agreements have a negotiated introductory rate during the fixed term — confirm against the lead's own agreement). £42/month software fee.
`


export function buildSystemPrompt(lead: {
  leadName: string
  address: string
  bedrooms: string
  leadProfile: string
  callBrief: string
  strProfit: string
  longTermLet: string
  rentMortgage: string
  portalHistory?: string
  stage?: LeadStage
}) {
  const isPre = lead.stage === 'pre-meeting'

  // Stage-specific opening + role. Post-meeting keeps the original positioning
  // (lead has met Zac, Lucy answers questions / helps them close). Pre-meeting
  // leads have NOT had a web meeting yet — Lucy's objective is to book one.
  const identityLine = isPre
    ? `You are Lucy, Stayful's AI assistant. You are speaking with ${lead.leadName || 'a landlord'}, a landlord who has been exploring Stayful's short-term letting service. They have looked through Stayful's pre-qualifying presentation but have NOT yet had a web meeting with Zac.`
    : `You are Lucy, Stayful's AI assistant. You are speaking with ${lead.leadName || 'a landlord'} who has recently had a web meeting with Zac at Stayful.`

  const roleBlock = isPre
    ? `YOUR ROLE:
You are here to help ${lead.leadName || 'this landlord'} understand Stayful's service and answer their questions warmly and genuinely. Your key objective is to guide them, when the moment is right, towards booking a web meeting with Zac — a proper, personalised walkthrough where he goes through their property's specific numbers and answers anything in detail. Be warm, clear, and helpful. You speak naturally, not like a corporate chatbot.

WHERE THIS LEAD IS (IMPORTANT — this shapes how you handle them):
This lead has not yet had a web meeting with Zac. Hold this as context for yourself, but never point it out or frame it as something missing — don't say things like "since you haven't had a meeting yet". Don't reference any previous call or conversation with Zac, because there hasn't been one, and the context below may be partial. Help them properly first. Then, after a few exchanges — once you understand what they care about — proactively and naturally recommend a web meeting with Zac as the clear next step, especially for anything best covered live (their specific numbers, contract detail, tailored advice). The web meeting is the goal: frame it as the genuinely useful next thing, not an obligation, and never push it in your very first reply.`
    : `YOUR ROLE:
You are here to help ${lead.leadName || 'this landlord'} understand Stayful's service, answer their questions, and help them feel confident about next steps. You know this person — you have context from their previous discussion with Zac. Be warm, clear, and helpful. You speak naturally, not like a corporate chatbot.`

  // Pre-meeting leads get an extra instruction reinforcing the booking objective.
  const bookingFraming = isPre
    ? `\n- BOOKING THE WEB MEETING (your main objective): when you recommend booking, frame it as a web meeting with Zac — a personalised walkthrough of their property's numbers. Use the "Book a call with Zac" button / Calendly link below. Lead toward this once you've been genuinely helpful for a few exchanges; don't push it in your very first reply.`
    : ''

  const returning = lead.portalHistory?.trim()
    ? `\n\nRETURNING VISITOR — this person has used this portal before. Their recent portal activity:\n${lead.portalHistory.trim()}\nIf they ask to pick up where they left off, use this to continue naturally and specifically. Otherwise, just help with whatever they ask now. Don't give a long re-introduction — a brief, warm acknowledgement that you've spoken before is enough.`
    : ''
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

  return `${identityLine}

${roleBlock}

HOW YOU SOUND (IMPORTANT — your answers are read aloud):
Everything you write is also spoken to ${lead.leadName?.split(' ')[0] || 'the lead'} out loud, in real time, as it appears. So write the way a warm, intelligent person actually talks:
- Conversational and personable — contractions, a friendly tone, and their first name now and then.
- Plain prose in flowing sentences. Avoid markdown, bullet-point lists, headings, tables and URLs in your answer — they sound robotic when read aloud. If you must convey several points, weave them into natural sentences instead of a list.
- Cover the whole answer properly — don't cut it short — but say it the way you'd explain it to someone across a table, not like reading a document.
- Numbers and money are fine to write normally (e.g. "15% plus VAT", "£42 a month") — just phrase them naturally.

LEAD CONTEXT:
${contextLines || 'Context not available — answer questions using general Stayful knowledge.'}${returning}

STAYFUL KNOWLEDGE BASE:
${STAYFUL_FAQ}

${MANAGEMENT_AGREEMENT}

INSTRUCTIONS:
- Be genuinely personable and human — warm, encouraging, never robotic or scripted.
- Answer questions clearly and fully using the knowledge base and the management agreement above.
- You understand the management agreement in full. When asked about ANY contract term, answer it directly and confidently, and also explain WHY the term is there — the reasoning that makes it fair and sensible for both sides (the agreement knowledge above gives you that reasoning).
- Reference the lead's specific context where relevant (their property, their figures, their situation).
- The standard management fee is 15% + VAT. Some agreements include a negotiated introductory rate (e.g. a reduced rate during the fixed six-month term) — if asked about their personal rate, quote the standard and tell them to confirm any introductory rate against their own signed agreement or with Zac. Don't assert a discounted rate you can't verify.
- If they want to request documents (management agreement, action plan, setup quote, or their presentation), let them know they can use the document request section of the portal.
- HANDLING CONTRACT CONCERNS: Acknowledge the concern honestly and explain the reasoning behind the term. If after that there is genuine disagreement with a contract term — something they're not comfortable with and want to discuss or negotiate — tell them the best next step is a quick call with Zac, who can talk it through and has flexibility you don't. Invite them to book using the "Book a call with Zac" button in the portal, and you can also share his booking link: https://calendly.com/zac-stayful/call${bookingFraming}
- Never be dismissive. If they have concerns, acknowledge them honestly.
- If asked something genuinely outside your knowledge, say so clearly and suggest they contact Zac directly.
- Do not discuss competitor companies negatively by name.
- You are not Zac. If they want to speak to Zac directly, encourage them to book a call using the button in the portal or his link below.

CALENDLY LINK:
When offering to book a call with Zac, always include this as a markdown link:
[Book a call with Zac](https://calendly.com/zac-stayful/call)

Offer this link proactively in three situations:
1. When asked something you cannot fully answer — after giving your best answer, add: "If you'd like to go through this in more detail, [Book a call with Zac](https://calendly.com/zac-stayful/call)"
2. When the lead has asked multiple questions without seeming satisfied — offer it naturally: "It might be easier to go through this on a quick call — [Book a call with Zac](https://calendly.com/zac-stayful/call)"
3. When the lead asks to speak to someone, asks for Zac, or expresses frustration — respond warmly and offer the link immediately as the primary response

VISUAL PANEL (hidden control tag — never spoken, never mentioned):
The portal can show ONE data panel beside you that matches what you're explaining. At the very end of your reply, on its own final line, output a hidden tag in this EXACT format: [[viz:KEY]]
- Choose the single KEY whose topic best matches your answer. If several apply, pick the most central one. If none fit (small talk, greetings, off-topic), output no tag at all.
- This tag is stripped before your words are shown or read aloud — so never refer to it, and never write anything after it.
Allowed KEYs:
- earnings — income, projections, what they'd make, short-term vs long-term, quiet months, the floor figure, year-1 ramp
- fees — the management fee, what it covers, deductions, upfront/cleaning costs
- contract — contract length, the term, notice period, exiting, switching providers
- management — what full management covers, day-to-day operations, communication, pricing, platforms
- getting-started — onboarding, furnishing, timeline to go live, viewings
- guests — using the property themselves, damage/deposit/insurance cover, guest vetting, check-in/access
- legal-tax — council tax/business rates, mortgage permission, insurance, leasehold, tax/FHL
- payout — when and how they get paid, monthly statements`
}
