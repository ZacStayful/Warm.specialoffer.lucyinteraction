# Delay & Green Light Reference

## Delay Codes

**DLY-FUR** — Unfurnished property (n=11, eventual conversion 36%)
- Top triggers: fully unfurnished, full setup investment required (4); wants a firm itemised cost not a verbal ballpark (2)
- Timeline: rarely stated (9/11 blank); when given, 1-2 weeks to research/quote — not months
- Ask: "If you can send room dimensions and a couple of photos, I can turn that ballpark into a firm itemised quote — how soon could you get those over?"
- Reframe: move from an abstract spend to an itemised list tied to their actual rooms, so they decide against real numbers

**DLY-MOV** — Moving abroad / leaving residence (n=10, eventual conversion 13% — lowest of the 5)
- Top triggers: relocating with a firm departure date already set (3); needs a remote/hands-off solution while away (2); relocating domestically for a lifestyle/business reason with a long (~12+ month) runway (1, new this run)
- Timeline: most common 3 months (range 1-8)
- Ask: "Once your move/departure date is confirmed, roughly how much notice would you want before going live?"
- Reframe: treat the departure date as the trigger for a pre-planned onboarding window, not a reason to pause

**DLY-OTH** — Other prerequisite / catch-all (n=26, eventual conversion 38% — highest of the 5)
- Top triggers: renovation/building work incomplete (9); mortgage/financing unresolved (6); third-party consent needed — freeholder/agent (5); partner sign-off needed (4); probate/inheritance not complete (1, new this run)
- Timeline: most common 1 month (range 0-3); spans the widest range of any code
- Ask: "Of everything still to sort — [name the specific blocker] — what's the realistic next milestone, and when will you know more?"
- Reframe: name the specific blocker back precisely (builder, lender, freeholder, spouse, solicitor) rather than treating it as generic hesitation

**DLY-PUR** — Purchasing property (n=10, eventual conversion 10%)
- Top triggers: in legal process, awaiting exchange/completion (3); buying specifically with STL in mind (2); off-plan awaiting build (2)
- Timeline: most common 2 months (range 1-3)
- Ask: "Where are you in the process right now — has anything exchanged, and what completion date has your solicitor given you?"
- Reframe: position the income figures as the reason to keep the purchase moving; offer purchase-adjacent help (e.g. an income letter for a mortgage broker)

**DLY-TEN** — Existing tenant (n=8, eventual conversion 14%)
- Top triggers: tenant/occupant not due to move out for months (3); tenancy rule changes mean notice is required to convert an HMO (2, incl. new this run); legally unable to serve notice, only natural turnover or sale (1)
- Timeline: most common 3 months (range 1-6)
- Ask: "Is there a firm date yet for your tenant leaving, or still an estimate — has notice actually been served?"
- Reframe: treat the vacate date as a fixed point to plan backward from, not an open "someday"

## Green Light Codes
No dedicated source file exists for green lights (unlike delays, which have by-delay-type/*.json with structured trigger phrases). This section is assembled from the qualitative patterns recorded in archetype/profile-type files plus offer-timing-intelligence.json — treat phrasing as directional, not verbatim-sourced.

**GL-MGMT** — wants fully hands-off, full management. Near-universal once present: 13/17 analytical-evaluators, 10/11 certainty-seekers. Why it's a green light: the lead has already accepted the core value proposition (someone else runs it) rather than negotiating service scope.

**GL-TIME** — an external forcing deadline (mortgage renewal, relocation, property already empty or on the market). The most frequent green light aggregated across by-profile-type files (~30 vs GL-MGMT's ~28). Why: gives the lead their own reason to decide now, rather than Stayful manufacturing urgency.

**GL-SELF** — the lead proactively signals readiness (asks about a second-property discount, raises signing before the next call, volunteers next steps unprompted). Rarer (~14 aggregate) but the highest-intent signal precisely because it's unprompted. Entry 086 (Kabir) showed both GL-SELF (already self/friend-managing a trading Airbnb) and GL-TIME (explicit urgency) together and converted at the meeting itself with an accepted offer.

## Combination Patterns (offer-timing-intelligence.json, n=6 offers with recorded green-light data — pre-086)
- GL-MGMT + GL-SELF + GL-TIME together: 4 of 6 — the most common combination, but none were explicitly marked accepted at the meeting (decisions were left pending/deferred)
- GL-MGMT + GL-TIME only: 1 | GL-MGMT + GL-SELF only: 1
- Small n — do not read this as proof combinations don't drive acceptance; entry 086 (GL-SELF + GL-TIME, no GL-MGMT explicitly stated) is now the dataset's one confirmed accepted offer, so a future run should re-run this combination analysis with it included.
