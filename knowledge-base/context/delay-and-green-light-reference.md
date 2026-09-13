# Delay & Green Light Reference

## Delay Codes

**DLY-FUR** — Unfurnished property (n=13, eventual conversion 31%)
- Top triggers: fully unfurnished, full setup investment required (6); wants a firm itemised cost not a verbal ballpark (2)
- Timeline: rarely stated; when given, 1-2 weeks to research/quote, or 3-4 weeks from signing to fitted-out — not months
- Ask: "If you can send room dimensions and a couple of photos, I can turn that ballpark into a firm itemised quote — how soon could you get those over?"
- Reframe: move from an abstract spend to an itemised list tied to their actual rooms, so they decide against real numbers

**DLY-MOV** — Moving abroad / leaving residence (n=12, eventual conversion 8% — lowest of the 5)
- Top triggers: relocating with a firm departure date already set (3); needs a remote/hands-off solution while away (2); considering relocating abroad within 6-12 months with no firm date (1, new this run)
- Timeline: most common 3 months (range now 1-12 — a "possible plan, no firm date" case can run to a year)
- Ask: "Once your move/departure date is confirmed, roughly how much notice would you want before going live?"
- Reframe: treat the departure date as the trigger for a pre-planned onboarding window, not a reason to pause

**DLY-OTH** — Other prerequisite / catch-all (n=34, eventual conversion 26%)
- Top triggers: renovation/building work incomplete (12); mortgage/financing unresolved (9); third-party consent needed — freeholder/agent (5); partner sign-off needed (5); **building/lease ultimately found not to permit short-letting at all, discovered after the sales call (2, new this run — see below)**
- Timeline: most common 1 month (range 0-3); spans the widest range of any code. The building-eligibility subset isn't a timing delay at all — it's a hard stop discovered too late.
- Ask: "Of everything still to sort — [name the specific blocker] — what's the realistic next milestone, and when will you know more?"
- Reframe: name the specific blocker back precisely (builder, lender, freeholder, spouse, solicitor) rather than treating it as generic hesitation
- **New mandatory check this run:** for any leasehold flat, tower block, or managed-building property, confirm in writing that the lease/building/freeholder actually permits short-letting BEFORE agreeing commercial terms, a go-live date, or making any offer. Two deals this run (Caixia Ye, Piotr Surminski) reached advanced stages — one with a signed special offer — before this surfaced and killed both.

**DLY-PUR** — Purchasing property (n=12, eventual conversion 8%)
- Top triggers: in legal process, awaiting exchange/completion (4); buying specifically with STL in mind (2); off-plan awaiting build (2); target property not yet identified (2)
- Timeline: most common 2 months (range 1-3)
- Ask: "Where are you in the process right now — has anything exchanged, and what completion date has your solicitor given you?"
- Reframe: position the income figures as the reason to keep the purchase moving; offer purchase-adjacent help (e.g. an income letter for a mortgage broker). For a lead with no property identified yet, this becomes general due-diligence education instead — still worth a Monday record even before an address exists.

**DLY-TEN** — Existing tenant (n=11, eventual conversion 9%)
- Top triggers: tenant/occupant not due to move out for months (6, incl. a family member tenant, new this run); tenancy rule changes mean notice is required to convert an HMO (2); legally unable to serve notice, only natural turnover or sale (1)
- Timeline: most common 3 months (range 1-6)
- Ask: "Is there a firm date yet for your tenant leaving, or still an estimate — has notice actually been served?"
- Reframe: treat the vacate date as a fixed point to plan backward from, not an open "someday"

## Green Light Codes
No dedicated source file exists for green lights (unlike delays, which have by-delay-type/*.json with structured trigger phrases). This section is assembled from the qualitative patterns recorded in archetype/profile-type files plus offer-timing-intelligence.json — treat phrasing as directional, not verbatim-sourced. This run added two green-light instances: GL-SELF (092, Caixia Ye — already self-managing a proven, booked Airbnb) and GL-TIME (096, Margarita Kitova-John — agreed November go-live), neither of which converted to an offer (092 was lost on building eligibility before an offer stage; 096's primary blocker, a mortgage/SPV restructuring, had no firm timeline).

**GL-MGMT** — wants fully hands-off, full management. Near-universal once present. Why it's a green light: the lead has already accepted the core value proposition (someone else runs it) rather than negotiating service scope.

**GL-TIME** — an external forcing deadline (mortgage renewal, relocation, property already empty or on the market). The most frequent green light aggregated across by-profile-type files. Why: gives the lead their own reason to decide now, rather than Stayful manufacturing urgency. Caveat (096, this run): a GL-TIME date for the *letting itself* doesn't override a separate, still-open-ended delay (e.g. a mortgage restructuring) — check whether the actual blocker to the offer has a timeline, not just the go-live date.

**GL-SELF** — the lead proactively signals readiness (asks about a second-property discount, raises signing before the next call, already self-managing a live proven listing). Rarer but the highest-intent signal precisely because it's unprompted. Entry 086 (Kabir) showed both GL-SELF and GL-TIME together and converted at the meeting itself with an accepted offer — the dataset's only confirmed acceptance. Caveat (092, this run): GL-SELF from an already-operating listing is not proof the building/lease permits it long-term — verify eligibility even when the lead is clearly ready operationally.

## Combination Patterns (offer-timing-intelligence.json, n=6 offers with recorded green-light data — pre-086)
- GL-MGMT + GL-SELF + GL-TIME together: 4 of 6 — the most common combination, but none were explicitly marked accepted at the meeting (decisions were left pending/deferred)
- GL-MGMT + GL-TIME only: 1 | GL-MGMT + GL-SELF only: 1
- Small n — do not read this as proof combinations don't drive acceptance; entry 086 (GL-SELF + GL-TIME, no GL-MGMT explicitly stated) remains the dataset's one confirmed accepted offer.
