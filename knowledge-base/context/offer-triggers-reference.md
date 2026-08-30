# Offer Triggers Reference

**Overall: 45 offers analysed. Acceptance rate 4.4% (methodology fixed this run — see below). Best timing: closing** — of 7 offers with a recorded meeting phase, 5 were made at "closing/close", the other 2 late-stage/pre-close; none were made mid-meeting.

**Methodology note (2026-08-30):** acceptance rate now counts `offer_accepted_at_meeting==true` rather than literal string-matching `offer_outcome=="accepted"` — the old method underscored acceptance because most transcripts didn't literally write the word "accepted" even when a deal was verbally agreed. Only 2 of 45 offer entries have this field reliably backfilled so far (the historical entry that already read "accepted", plus entry 086 this run); the other 43 still need auditing, so 4.4% is a floor, not final.

## Make the Offer When
- A green light is present (GL-SELF, GL-MGMT, or GL-TIME — see delay-and-green-light-reference.md) AND
- No unresolved delay is on the table AND
- You're at or near the meeting's close, after the income walkthrough and service explanation are already done
- **New confirmed pattern (entry 086):** proactively offering a bundle/multi-property discount the moment a lead signals wanting more than one property under management — this produced the dataset's first confirmed acceptance, verbally, with no negotiation and no stated expiry.

## Do NOT Offer When (per delay-type "do_not_attempt_offer_because" reasoning)
- **DLY-FUR** — no firm furnishing cost exists yet; nothing for a signing deadline to attach to
- **DLY-MOV** — no go-live date is possible until the lead's actual move-out date is known
- **DLY-PUR** — the lead doesn't legally own the property yet; no basis to sign
- **DLY-TEN** — the property is physically occupied; Stayful cannot take possession
- **DLY-OTH** — the blocker sits with a third party (builder, lender, freeholder, spouse, solicitor/probate) Stayful cannot accelerate

Caveat from the data: offers **were** made anyway in 5 recorded delay-present cases (all furnishing-cost or other unresolved delays). Result: 0 accepted, 0 explicitly rejected — every one was deferred rather than resolved. Offering into an unresolved delay doesn't kill the deal, but it doesn't move it either; it stalls. None of this run's 6 new entries had an offer made into a delay.

## Top Offer Framings (acceptance rate)
Every individually-recorded verbatim framing shows **0% acceptance** except one: entry 086 (Kabir, fast-path-gain-focused), where a proactive bundle discount (13% vs 15%) was offered once he confirmed wanting two properties managed together — accepted immediately, verbally, no expiry stated. This is now the dataset's confirmed proof-of-concept for "offer live, ask immediately" once a genuine multi-property or urgency signal is present.
By profile type: EX-STL now shows 8.3% acceptance (up from 0%, driven by entry 086) — the best of the 5 types with offer data. STL-SW still 6.7%; ABROAD, PURCH, SELL all sit at 0%.

## Expiry Framing Effectiveness
- 14-day expiry: 7 cases, 0% acceptance
- Other/longer expiry: 34 cases, 2.9% acceptance
- 7-day expiry: 0 cases recorded — never tried
- No expiry at all: 1 case (entry 086) — 100% acceptance. Directionally, the one confirmed acceptance in the dataset had no time-boxed deadline; it was applied and asked for immediately, live at the meeting, rather than left to think over.

## When Delay Is Present — Alternative Commits (closing-scripts.json, delay_present_close)
- **DLY-OTH** (freq 17): send the agreement + summary/action plan as a no-pressure follow-up; commit to proposing specific meeting slots within 48 hours, before the window closes
- **DLY-FUR** (freq 8): put the costing together in an email + send the agreement; get a firm outreach date committed now, and a specific week for onboarding kickoff
- **DLY-PUR** (freq 5): summary + action plan + agreement; propose specific meeting slots within 48 hours, before the completion window closes
- **DLY-TEN** (freq 5): summary + action plan + agreement; pin a specific inspection/visit date before ending the call rather than leaving it open-ended
- **DLY-MOV** (freq 5): "keep in touch" + summary/action plan + agreement; commit to a firm outreach date tied to their departure timeline
