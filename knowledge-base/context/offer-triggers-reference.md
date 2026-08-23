# Offer Triggers Reference

**Overall: 44 offers analysed. Acceptance rate 2.3%. Best timing: closing** — of 6 offers with a recorded meeting phase, 4 were made at "closing/close", the other 2 late-stage/pre-close; none were made mid-meeting.

## Make the Offer When
- A green light is present (GL-SELF, GL-MGMT, or GL-TIME — see delay-and-green-light-reference.md) AND
- No unresolved delay is on the table AND
- You're at or near the meeting's close, after the income walkthrough and service explanation are already done

## Do NOT Offer When (per delay-type "do_not_attempt_offer_because" reasoning)
- **DLY-FUR** — no firm furnishing cost exists yet; nothing for a signing deadline to attach to
- **DLY-MOV** — no go-live date is possible until the lead's actual move-out date is known
- **DLY-PUR** — the lead doesn't legally own the property yet; no basis to sign
- **DLY-TEN** — the property is physically occupied; Stayful cannot take possession
- **DLY-OTH** — the blocker sits with a third party (builder, lender, freeholder, spouse) Stayful cannot accelerate

Caveat from the data: offers **were** made anyway in 5 recorded delay-present cases (all furnishing-cost or other unresolved delays). Result: 0 accepted, 0 explicitly rejected — every one was deferred rather than resolved. Offering into an unresolved delay doesn't kill the deal, but it doesn't move it either; it stalls.

## Top Offer Framings (acceptance rate)
Every individually-recorded verbatim framing in offer_framings shows **0% acceptance** except one: the fast-path-gain-focused case, where a live 13%-vs-15% discount was applied and accepted in the room — the single accepted offer in the whole 103-transcript dataset (n=1, not statistically reliable but directionally the only proof-of-concept for "offer live, ask immediately").
By profile type: STL-SW acceptance 6.7% (best of the 5 types with offer data, "best timing: late — after full income walkthrough and the lead's own direct ask to negotiate fees"); ABROAD, EX-STL, PURCH, SELL all sit at 0%.

## Expiry Framing Effectiveness
- 14-day expiry: 7 cases, 0% acceptance
- Other/longer expiry: 34 cases, 2.9% acceptance
- 7-day expiry: 0 cases recorded — never tried
No expiry length in the data shows meaningfully positive acceptance. The one accepted offer had no time-boxed expiry at all — it was applied and asked for immediately, live at the meeting.

## When Delay Is Present — Alternative Commits (closing-scripts.json, delay_present_close)
- **DLY-OTH** (freq 15): send the agreement + summary/action plan as a no-pressure follow-up; commit to proposing specific meeting slots within 48 hours, before the window closes
- **DLY-FUR** (freq 8): put the costing together in an email + send the agreement; get a firm outreach date committed now, and a specific week for onboarding kickoff
- **DLY-PUR** (freq 5): summary + action plan + agreement; propose specific meeting slots within 48 hours, before the completion window closes
- **DLY-TEN** (freq 4): summary + action plan + agreement; pin a specific inspection/visit date before ending the call rather than leaving it open-ended
- **DLY-MOV** (freq 3): "keep in touch" + summary/action plan + agreement; commit to a firm outreach date tied to their departure timeline
