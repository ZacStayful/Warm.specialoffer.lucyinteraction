# Stayful Qualification Framework

**Training confidence: strong** — 109 transcripts analysed (103 pre-existing + 6 this run), against thresholds low <15 / building 15–30 / good 30–50 / strong 50+. Per-profile-type confidence varies: STL-SW (40 entries) is **strong**; EX-STL/PURCH/ABROAD (18–19 entries each) are **good–strong**; SELL (8) and R2R (6) remain **building**.

---

## What to Establish Before Showing Figures

In roughly this order, before the income walkthrough begins:

1. **Situation** — do they already own it (STL-SW/EX-STL), are they buying it (PURCH), selling it (SELL), relocating (ABROAD), or arranging a rent-to-rent deal (R2R)? Note: leads who inherited a property via probate, or who are converting a never-let/new-build property, currently get filed under PURCH as the nearest fit — the taxonomy has a known gap here (flagged again this run) and a dedicated INHERIT/NEW-BUILD code is overdue.
2. **Tenancy end date** — is there a sitting tenant, and is notice formally served or only discussed verbally?
3. **Purchase stage** — offer accepted, exchanged, or completed? Off-plan build date if relevant? Or, for an inherited property, is probate complete and is legal possession confirmed?
4. **Moving confirmation** — is the departure date firm (employer/visa/sale-confirmed) or still soft? Note this also applies to purely domestic relocations with a long runway (e.g. a lead relocating in ~12+ months to start an unrelated business) — treat the same as DLY-MOV even without international travel involved.
5. **Furnishing status** — fully furnished, partially, or empty? Self-furnish or Stayful-coordinated?
6. **Mortgage/ownership type** — residential, BTL, no mortgage (owned outright/inherited), or a financing vehicle (SSAS, off-plan) that may restrict STL use. No-mortgage leads should be qualified specifically for downside-protection framing (see meeting-runbook.md Phase 3), not upside-maximisation framing.
7. **Motivation** — escaping a specific pain (rate shock, bad tenant, empty property, chronic student/HMO maintenance issues) vs. maximising a new asset vs. bridging a sale vs. preserving a family asset long-term.
8. **Timeline** — what specific external event, if any, gates when they could actually go live?
9. **Prior knowledge** — have they already spoken to another agent, a developer's in-house management, or researched figures themselves (including comparing Stayful's estimate against other sites' differing numbers)?
10. **Competitor contact** — is a competing management company, guaranteed-rent scheme, or developer offer already live in parallel? Also check whether the lead is already self/friend-managing an informal Airbnb — this is a strong green light (GL-SELF), not a competitor risk, and should shortcut straight to commission/scope-of-service questions rather than re-pitching the STL concept.

---

## Question Sequence (from response-library/questions.json — not re-audited this run, see manifest data_gaps for known size/coverage caveats)

Highest-frequency questions actually asked, in roughly the order most meetings naturally raise them:

1. **Contract terms** — "Is there a minimum tie-in period? What's the exit process?"
2. **Management fee** — "What's the fee and what's included?" (Increasingly also: "Is that percentage VAT-inclusive, and is it factored into your net figure?")
3. **Guest type / who's actually staying** and **realistic income expectation** — these two run roughly concurrently once figures are on screen.
4. **Which platforms is it listed on**.
5. **STL vs LTL (or current HMO/student-let) financial comparison**.
6. **Council tax treatment when switching**, **guest vetting/property protection**, **can the property stay on the market while STL'd** (SELL-profile specific), **does STL income cover mortgage and running costs**, and (new, recurring theme this run) **what's your confidence level that you'll actually hit these numbers / do you offer any kind of income guarantee**.

Note: meeting-phase tagging in the source data remains thin and inconsistent — treat the ordering above as frequency-derived, not a strictly validated sequence.

### By profile type — top questions (from by-profile-type files' `top_questions`)

- **STL-SW** (40 entries): "How does STL income compare to what I'm getting from a long-term let?" (freq 21/40 — dominant), then furnishing cost (8), fees (6), guest vetting/damage risk (6), council tax (4), mortgage compliance (4), income-guarantee/confidence-level asks (new, freq 1 each but recurring theme).
- **EX-STL** (18 entries): "How does Stayful's fee/service compare to my current management company?" (4), "What income can I realistically expect including the worst-case month?" (5), "Would taking on multiple properties together attract a discount?" (new this run — asked proactively by the lead, not prompted).
- **PURCH** (19 entries): "What income can I realistically expect, and how does it compare to LTL?" (8), full cost/fee breakdown (5), strategy validation — platform vs direct bookings (3), furnishing/setup cost (3), and (new) "Am I tied into a fixed contract term, and is there a route out if my circumstances change?" — specific to a downside-protection-seeking, no-mortgage lead.
- **SELL** (8 entries): "Can the property stay actively listed for sale while it's short-let?" (4 — the dominant SELL-specific question), "Will STL income cover the mortgage and running costs?" (3).
- **ABROAD** (18 entries): "How will the property actually be managed with no one on-site?" (7), income/LTL comparison (10 combined across two related question clusters), guest damage/vetting (6), and (new) "Which insurance takes precedence if something goes wrong — mine or yours?"
- **R2R** (6 entries): "Does this deal work financially once rent, fee, and setup costs are all stacked?" (4 — dominant; almost never resolves in the lead's favour at the landlord's initial asking rent).

---

## Delay Detection & Timeline-Probing Questions

Ask the specific timeline question tied to whichever delay type the trigger phrases suggest (from `by-delay-type/*.json`):

| Delay type | Entries | Timeline question to ask |
|---|---|---|
| **DLY-TEN** (existing tenant) | 8 | "Once your tenant/occupant is actually out, is there a firm date for that yet, or is it still an estimate — and is notice formally served, or just discussed verbally?" |
| **DLY-FUR** (unfurnished) | 11 | "If you can send me the room dimensions and a couple of photos, I can turn that ballpark into a firm itemised quote — how soon could you get those over?" |
| **DLY-PUR** (purchasing) | 10 | "Where are you in the process right now — has anything exchanged, and what's the realistic completion date your solicitor or the vendor has given you?" |
| **DLY-MOV** (moving/abroad, or a long-runway domestic relocation) | 10 | "Once you've got your move/departure date confirmed, roughly how much notice would you want to give us to get everything onboarded and live before you go?" |
| **DLY-OTH** (renovation, mortgage, third-party consent, spouse, compliance, probate) | 26 | "Of everything still to sort before this could go live — [name the specific blocker back to them] — what's the realistic next milestone, and when do you expect to know more?" |

Typical resolution windows: DLY-FUR and DLY-OTH often resolve within weeks to ~3 months once a firm quote or milestone lands; DLY-TEN and DLY-MOV more often run 2–3 months (up to 6–8 in HMO or long-notice cases, or externally-gated processes like probate); DLY-PUR typically 1–3 months. **Conversion-after-delay rates recorded: DLY-OTH 38%, DLY-FUR 36%, DLY-TEN 14%, DLY-MOV 13%, DLY-PUR 10%** — delays gated by a third party's process outside anyone's control (DLY-PUR, DLY-TEN, and externally-gated DLY-OTH cases like probate) convert markedly worse than delays the lead can resolve themselves (DLY-FUR, most of DLY-OTH).

---

## Green Light Confirmation Questions

The dominant green-light signal across nearly every archetype and profile type is **GL-MGMT** — a stated preference for fully hands-off management. Confirm it directly rather than assuming it: *"Just so I've got this right — you'd want this to be genuinely hands-off, where the only thing you're dealing with is the mortgage and bills?"*

Confirm **GL-TIME** by naming the actual external deadline back to them (a mortgage switch, a lease renewal, a relocation date) rather than accepting a vague "soon."

Watch for **GL-SELF** — the lead proactively raising signing before the next call, asking about a multi-property discount, or volunteering a second property. This is the strongest unprompted signal and should shift the meeting toward Phase 7 (Close) in the runbook. This run's clearest example: a lead already self/friend-managing a trading Airbnb (proving the concept before the call) combined GL-SELF with GL-TIME (explicit urgency) and converted within an 8-minute call with an accepted bundle-discount offer.

---

## Red Flags (from lost-reason-patterns.json — 13 total lost entries, unchanged this run — no new LOST outcomes)

- **R2R deals where landlord rent leaves no real margin after Stayful's fee and setup cost** — 3 of 4 lost R2R leads failed specifically on this gate; pre-qualify rent level vs. STL gross-revenue ceiling *before* booking the web meeting.
- **Very low existing mortgage (e.g. ~£260/month)** — limited financial pain means the STL uplift rarely clears the setup-cost bar; flag early and consider a capital-compounding reframe rather than a cost-reduction pitch. (Contrast with the *zero*-mortgage/owned-outright case, which instead responds well to downside-protection framing — see meeting-runbook.md.)
- **Property purchase still mid-process** — 3 of 19 PURCH leads were lost specifically while the purchase itself was still live (chose a developer's in-house management, or lost momentum before completion); this is the highest-risk window for PURCH leads specifically.
- **Shared-accommodation/HMO-style property** — outside Stayful's operating model entirely; 1 lost R2R lead was disqualified on this basis alone, independent of financial viability. Screen for this on the qualifying call, before booking a full web meeting.
- **Trust gap from a prior management company's broken promises**, left unresolved by pitch alone rather than verified proof — flagged as a lost reason for an EX-STL-type lead.
- **Competitor chosen or deferred** — most likely when the lead is evaluating multiple providers simultaneously (2–3 agents) and no differentiated proof point (case study, specific local track record) was offered.

---

## Green Flags (from offer-timing-intelligence.json — 45 offers analysed)

- The strongest recorded green-light combination remains **GL-MGMT + GL-SELF + GL-TIME together** (seen in 4 offers pre-this-run) — none of those were explicitly recorded as accepted live on the call, but this run's confirmed acceptance (GL-SELF + GL-TIME, no GL-MGMT explicitly stated) shows readiness signals can close a deal live even without all three; a future pass should re-run this combination analysis including it.
- **Offer rate by profile type**: SELL leads receive an offer 87.5% of the time (highest), EX-STL 70.6%, STL-SW 40.5%, PURCH 27.8%, ABROAD 29.4% — reflecting how much more often SELL and EX-STL leads present with a clear, resolvable financial case by the close of the meeting. EX-STL's acceptance rate is now 8.3% (up from 0%), the best of any profile type with offer data.
- **Best offer timing across every profile type is "closing"** — no profile type in the dataset shows an offer landing effectively earlier in the meeting, with one exception: a proactive bundle-discount offer made the instant a multi-property signal appears, which does not need to wait for the formal close.
