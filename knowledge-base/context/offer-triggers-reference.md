# Offer Triggers Reference

**Overall: 46 offers analysed. Acceptance rate 4.35% (2/46 — still a floor, most entries not individually re-audited). Best timing: closing** — of 7 offers with a recorded meeting phase, 5 were made at "closing/close", the other 2 late-stage/pre-close; none were made mid-meeting.

**Methodology note:** acceptance rate counts `offer_accepted_at_meeting==true`. This run added 1 offer-made entry (094, Piotr Surminski) with `offer_accepted_at_meeting=false` — the offer had already been made in an inaccessible prior meeting, and this transcript was a follow-up onboarding call with no on-call accept/reject moment.

## Make the Offer When
- A green light is present (GL-SELF, GL-MGMT, or GL-TIME — see delay-and-green-light-reference.md) AND
- No unresolved delay is on the table AND
- You're at or near the meeting's close, after the income walkthrough and service explanation are already done
- **AND, new mandatory check this run:** for any leasehold, flat, or managed-building property, building/lease short-let permission has been confirmed in writing. Two deals this run (092, 094) reached agreed-terms or a signed offer before this was checked, and both were lost afterward when the restriction surfaced.
- Confirmed pattern (entry 086): proactively offering a bundle/multi-property discount the moment a lead signals wanting more than one property under management — this produced the dataset's only confirmed acceptance, verbally, with no negotiation and no stated expiry.

## Do NOT Offer When (per delay-type "do_not_attempt_offer_because" reasoning)
- **DLY-FUR** — no firm furnishing cost exists yet; nothing for a signing deadline to attach to
- **DLY-MOV** — no go-live date is possible until the lead's actual move-out date is known (now includes "possible plan, no firm date" cases that can run up to a year)
- **DLY-PUR** — the lead doesn't legally own the property yet; no basis to sign
- **DLY-TEN** — the property is physically occupied; Stayful cannot take possession
- **DLY-OTH** — the blocker sits with a third party (builder, lender, freeholder, spouse, solicitor/probate) Stayful cannot accelerate. **Where the blocker is building/lease eligibility itself, this is not a "wait it out" delay — do not offer or sign until permission is confirmed in writing, full stop.**

Caveat from the data: offers **were** made anyway in 6 recorded delay-present cases. Result: 0 explicitly accepted, 0 explicitly rejected on-call — but one (094, this run) was later **lost entirely**, not merely stalled, when the property turned out to be ineligible after the offer's own expiry. Offering into an ordinary timing delay (furnishing, purchase, tenancy) stalls the deal without killing it; offering into an unverified-eligibility situation can kill it outright, later, invisibly.

## Top Offer Framings (acceptance rate)
Every individually-recorded verbatim framing shows **0% acceptance** except one: entry 086 (Kabir, fast-path-gain-focused), where a proactive bundle discount (13% vs 15%) was offered once he confirmed wanting two properties managed together — accepted immediately, verbally, no expiry stated. This remains the dataset's confirmed proof-of-concept for "offer live, ask immediately" once a genuine multi-property or urgency signal is present.
By profile type (stale as of 2026-08-30, not recomputed this run): EX-STL 8.3% acceptance — best of the 5 types with offer data. STL-SW 6.7%; ABROAD, PURCH, SELL all 0%.

## Expiry Framing Effectiveness
- 14-day expiry: 7 cases, 0% acceptance
- Other/longer expiry: 35 cases, 2.86% acceptance
- 7-day expiry: 0 cases recorded — never tried
- No expiry at all: 1 case (entry 086) — 100% acceptance. Directionally, the one confirmed acceptance in the dataset had no time-boxed deadline; it was applied and asked for immediately, live at the meeting, rather than left to think over.

## When Delay Is Present — Alternative Commits (closing-scripts.json, delay_present_close)
- **DLY-OTH** (freq 25): send the agreement + summary/action plan as a no-pressure follow-up; commit to proposing specific meeting slots within 48 hours, before the window closes; for leasehold/managed-building properties, confirm building/lease permission in writing before the next close attempt
- **DLY-FUR** (freq 10): put the costing together in an email + send the agreement; get a firm outreach date committed now, and a specific week for onboarding kickoff
- **DLY-TEN** (freq 8): summary + action plan + agreement; pin a specific inspection/visit date before ending the call rather than leaving it open-ended
- **DLY-PUR** (freq 7): summary + action plan + agreement; propose specific meeting slots within 48 hours, before the completion window closes
- **DLY-MOV** (freq 7): "keep in touch" + summary/action plan + agreement; commit to a firm outreach date tied to their departure timeline
