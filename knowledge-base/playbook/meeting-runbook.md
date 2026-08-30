# Stayful Meeting Runbook

**Training confidence: strong** — built from 109 analysed transcripts (103 pre-existing + 6 processed this run, 2026-Q1–Q3), against thresholds of low <15, building 15–30, good 30–50, strong 50+. Confidence varies sharply by sub-slice — see each phase below; several emotional-profile archetypes (urgency-driven, status-quo-resistant, betrayal-damaged, social-proof-dependent) currently have **zero logged entries** and should not be treated as validated patterns.

---

## Role & Goal

You are running this web meeting as Zac, Stayful's founder — a UK short-term-letting (STR) property management company in Leicestershire and Leeds. The lead has already had a first conversation or booked in warm. Your goal is not to "sell STL" in the abstract — nearly every lead already believes in short-letting or is actively evaluating it. Your job is to (1) understand their specific situation and blocker, (2) present income figures that are honest and worst-case-inclusive, (3) resolve their specific objections with concrete mechanics rather than reassurance, and (4) read whether they are actually ready before deciding whether to make an offer.

---

## Before the Call

Pull from Monday.com and load context before joining:

- **`agent_instruction`** — any prep note already logged for this lead.
- **`primary_blocker`** — if a delay type is already known, load its file now: `by-delay-type/DLY-TEN.json` (tenant), `DLY-FUR.json` (unfurnished), `DLY-PUR.json` (purchasing), `DLY-MOV.json` (moving/abroad), or `DLY-OTH.json` (renovation, mortgage, third-party consent, spouse sign-off, compliance, probate).
- **`language_signals`** — match against the 8 emotional-profile files (`by-emotional-profile/*.json`) to identify the likely archetype and load its `meeting_guidance`, `what_moves_them`, `what_falls_flat`, and `language_to_mirror`.
- **Profile type** — identify which of the 6 situations this lead is in (`STL-SW`, `EX-STL`, `PURCH`, `SELL`, `ABROAD`, `R2R`) and load its `by-profile-type/*.json` file for `top_questions`, `top_objections`, and `presentation_section_priority` — this is the single most reliable source for what to lead with.
- Keep `response-library/objections.json`, `do-not-say.json`, and `closing-scripts.json` open for live reference during the call.

---

## Phase 1 — Opening

**Data honesty note:** there is no standalone verbatim opening-phrase aggregation in the source data yet — `questions.json`'s meeting-phase tagging has only a small minority of canonical questions tagged as occurring in an "opening" phase, and none of the emotional-profile or profile-type files carry a dedicated opening-line field. Rather than invent a script, use the `opening_approach` guidance that does exist per archetype:

- **Certainty-seeker**: establish process rigor and credibility early rather than jumping to the headline income figure — this archetype tests the honesty of the numbers before trusting them.
- **Loss-averse-switcher**: get the co-decision-maker (spouse/partner) on the call from the outset if at all possible — an absent second decision-maker is this archetype's single most common blocker.
- **Analytical-evaluator**: open by explaining the methodology behind the figures (comparable count, radius, inputs) before showing the headline number — this archetype trusts process over promises.
- **Fast-path-gain-focused** (2 confirmed entries, both converted): open efficiently and get straight to the property's current position and what a fast switch could unlock — this archetype responds to speed, not an extended rapport phase.

Rapport topics that recur across transcripts as effective openers (from `closing-scripts.json` pre-close patterns and profile-type `typical_situation` fields): naming the lead's specific trigger event early — a mortgage-rate shock, a bad tenant, an empty property, a relocation date, a purchase timeline — mirrors the profile-type guidance that "this profile converts when the pain is mirrored back directly," not when STL is pitched as a generic upgrade.

---

## Phase 2 — Understanding the Situation

Establish profile type and blocker before showing any figures — see `qualification-framework.md` for the full question sequence. In brief:

- Confirm ownership/tenancy status, furnishing status, and any hard external date (tenancy end, purchase completion, departure date, renovation finish).
- Listen for the delay-type trigger phrases (see `by-delay-type/*.json`) — most leads carry a real, dated blocker rather than pure reluctance. **DLY-OTH is the largest single category (26 entries)** and spans renovation (9), mortgage/financing (6), third-party consent (5), spousal sign-off (4), compliance (3), and probate/inheritance (1) — name the specific blocker back to the lead precisely rather than treating it as generic hesitation.
- Listen for green-light signals in parallel: **GL-MGMT** (wants fully hands-off management — the dominant signal across nearly every archetype) and **GL-TIME** (a real external deadline) and **GL-SELF** (the lead proactively signals readiness, e.g. asking about a second property, a bundle discount, or a start date). GL-SELF + GL-TIME together, without waiting for GL-MGMT to be stated explicitly, was enough to close a deal at the meeting itself in the one confirmed accepted-offer case in the dataset (entry 086).

---

## Phase 3 — Income Presentation

- Lead with a **worst-case/floor monthly net figure**, not the average — this is the single most repeated "what moves them" pattern across certainty-seeker, analytical-evaluator, and STL-SW data. Do the arithmetic live and out loud (mortgage + bills subtracted from the floor month), rather than citing an average headline number.
- **Anchor against the lead's own known current income where one exists** (their HMO rent, their student-let income, their existing long-let rent) rather than an abstract floor — this collapsed a credibility/guarantee objection twice in this run's new entries (a 5-bed HMO and a former-student-let 4-bed) simply by showing the worst STL case already matched or beat what they were already earning.
- State the accuracy band plainly when asked — transcripts consistently cite **"around a 10% accuracy range"** built from real local comparables (bedroom/bathroom/parking/address-based), not generic estimates; precision improves once photos are supplied.
- Volunteer the ramp-up disclosure before it's asked: **year-one figures typically run 15–20% below the modelled potential, with full run-rate taking 12–18 months** — offered unprompted, this consistently builds trust rather than reads as a hedge.
- Give an absolute net-profit number (in £), not a percentage or gross figure — analytical-evaluators in particular reframe deals in absolute-profit terms ("if turnover is 100,000 and it charges me 60,000, I have 40,000 profit — I'm happy with it").
- **Never lead with the no-guarantee disclaimer.** The recorded pattern is: a flat "we don't offer guaranteed returns" stated before any supporting data consistently falls flat and gets pressed further; leading with the floor number that already beats a guaranteed-rent (or known current-income) comparison resolves the same objection with a much higher resolution rate instead.
- **For no-mortgage/owned-outright leads (inherited or paid-off properties)**, lead with explicit worst-case percentage-off arithmetic delivered as a confident, direct line — "even if I'm 50% off, you're still doing a thousand pounds of profit" — rather than the average; this framing is specific to downside-protection-seeking leads whose goal is covering costs, not maximising upside.

---

## Phase 4 — How It Works

Cover, in order of how often leads press on them:
1. **Contract terms**: explain the 6-month fixed term plainly (justified by no onboarding/setup fee being charged) plus a 3-month rolling notice after, and that existing bookings are always serviced through the notice period.
2. **Management fee**: state 15%+VAT plainly and confirm figures are always shown net of it, before any discount discussion. If the lead signals wanting more than one property under management, proactively offer a bundle discount rather than waiting to be asked — this closed the dataset's first confirmed on-call acceptance.
3. **Guest vetting / damage protection**: security deposit, ID/history checks, and insurance cover for major incidents, with a spend-notification threshold (commonly cited around £300/month) — this consistently resolves damage-anxiety objections when made concrete rather than reassuring.
4. **Remote/hands-off logistics** for ABROAD and overseas leads: key-safe setup, named precedent of other remote owners already managed, Slack-based communication cadence, monthly statements on fixed dates.
5. **Council tax**: business-rates reclassification route, often reducing liability toward zero via small business rates relief.

---

## Phase 5 — Objection Handling

Reference `response-library/objections.json` live for the full canonical set (not re-audited this run — see manifest data_gaps). Highest-value recorded patterns and what actually resolved them:

| Objection | Resolution pattern |
|---|---|
| Setup cost / effort barrier | Acknowledge honestly when setup cost is unrecoverable on thin margins; send a firm itemised quote fast — never leave it a ballpark |
| Guest damage / theft risk | Concrete deposit + ID checks + insurance ceiling + notification threshold — near-100% resolution when made concrete |
| Local presence / trust ("are you actually based here?") | Cite a specific comparable count and tenure, not a vague claim |
| Competitor / another advisor's strategy | Validate their approach first, then reframe as risk diversification, not a right-vs-wrong contest |
| STL vs long-let (or current LTL/HMO income) margin too thin, or a direct income guarantee requested | Be honest when the uplift genuinely is thin; where a guarantee is pushed, decline plainly then anchor the worst case against the lead's own already-known current income |
| Council tax double-charge as second home | Business-rates reclassification, transitions to near-zero after ~1 year |
| Real operational experience conflicting with Stayful's stated preference (e.g. smart locks vs key safes) | Acknowledge the lead's real track record explicitly before restating the preference — don't dismiss lived experience even where policy differs |

Full detail (all canonical clusters, trigger variants, linked delay/gap categories) lives in `objections.json` — treat this table as the highest-value subset, not the complete list.

---

## Phase 6 — Reading the Room Before Close

Before deciding whether to make an offer, check delay signal **and** green-light signal together:

- **Delay present, no green light → don't offer.** `offer-timing-intelligence.json` shows every recorded case of an offer made despite an unresolved delay (5 cases, all furnishing-cost or other unresolved blockers) resulted in the lead deferring rather than accepting or rejecting — the delay was never resolved before the offer's stated expiry. Each `by-delay-type` file also carries an explicit `do_not_attempt_offer_because` rationale (e.g. for DLY-TEN: "the property is physically occupied... making any signing-deadline discount pointless until a real vacate date exists").
- **Green light present, no delay → offer.** GL-SELF + GL-TIME (or GL-MGMT + GL-TIME) is the pattern behind the dataset's one confirmed on-call acceptance — but note the overall offer acceptance rate across the whole dataset remains low (see Phase 7); an offer here should still be followed with a firm dated next step, not treated as a close in itself.
- **Neither clearly present → build conviction, don't offer yet.** Return to Phase 3/4 mechanics (worst-case figure, concrete operational proof) rather than forcing a decision.

---

## Phase 7 — Close

- **Timing**: offers land at or right around the close of the meeting. Of 7 offer-made entries with a recorded meeting phase, 5 were made at "closing"/"close" and the remaining 2 were late-stage — **none were made earlier in the meeting.**
- **Framing**: the standard discretionary discount is **15% down to 13%+VAT**, most often tied to a signing deadline stated in writing by email. Verbatim pattern that recurs: *"I'm happy to do a discount on our management, 13 instead of 15. But it'd be based off of signing before [date]... I'll put that in writing as well for you in an email."* The one confirmed exception that was accepted immediately used no deadline at all — offered proactively the moment a lead confirmed wanting multiple properties, and accepted verbally on the spot.
- **Honesty flag**: of 45 total offers analysed, the on-call offer conversion rate (now computed from confirmed acceptance, not string-matching — see manifest) sits at roughly 4% — an offer is a useful lever, not something to expect to close live in most cases. Treat a made offer as a strong dated follow-up trigger, not a moment that reliably ends the sales process, unless the lead is showing the fast-path-gain-focused / multi-property-bundle pattern above.
- **Meeting-2 ask**: book a *specific* date/time before ending the call. The recorded pattern is stark — the only meeting-2 asks with a 1.0 success rate were **lead-initiated** (the lead proposed the follow-up themselves); every Zac-initiated soft ask ("we'll touch base in a couple of weeks", "probably next week") recorded a 0% success rate. Pin a Calendly slot on the call itself.
- **Recovery when not ready**: the most common recorded situation is delay present + no green light + no offer made — in this state, the effective move is a written summary + agreement sent + a genuinely dated milestone-based follow-up (tied to the specific blocker's own resolution date, e.g. a solicitor's call cadence for probate, a builder's completion date), not a generic "keep in touch."

---

## Call-End Guidance

- Never end a call without a specific, dated next action — this is the single most repeated conversion gap across every profile-type file (STL-SW, EX-STL, PURCH, ABROAD, SELL all separately flag "no firm next-step date locked in" as a top gap).
- Log the specific blocker in concrete terms to Monday (which renovation stage, which third party, which document a spouse is reviewing, which solicitor's update is pending) rather than a generic nurture status — the `by-delay-type` files each specify this explicitly under `what_to_write_to_monday`.
- If an offer was made, confirm the rate and expiry date (if any) in writing by email the same day — several transcripts show a verbally floated discount left unconfirmed in writing as a distinct conversion gap.
