# Stayful Qualification Framework

**Training confidence: strong** — 103 transcripts analysed (78 pre-existing + 25 this run), against thresholds low <15 / building 15–30 / good 30–50 / strong 50+. Per-profile-type confidence varies: STL-SW (37 entries) and EX-STL/PURCH/ABROAD (17–18 entries each) are **good–strong**; SELL (8) and R2R (6) are **building**.

---

## What to Establish Before Showing Figures

In roughly this order, before the income walkthrough begins:

1. **Situation** — do they already own it (STL-SW/EX-STL), are they buying it (PURCH), selling it (SELL), relocating (ABROAD), or arranging a rent-to-rent deal (R2R)?
2. **Tenancy end date** — is there a sitting tenant, and is notice formally served or only discussed verbally?
3. **Purchase stage** — offer accepted, exchanged, or completed? Off-plan build date if relevant?
4. **Moving confirmation** — is the departure date firm (employer/visa/sale-confirmed) or still soft?
5. **Furnishing status** — fully furnished, partially, or empty? Self-furnish or Stayful-coordinated?
6. **Mortgage/ownership type** — residential, BTL, or a financing vehicle (SSAS, off-plan) that may restrict STL use.
7. **Motivation** — escaping a specific pain (rate shock, bad tenant, empty property) vs. maximising a new asset vs. bridging a sale.
8. **Timeline** — what specific external event, if any, gates when they could actually go live?
9. **Prior knowledge** — have they already spoken to another agent, a developer's in-house management, or researched figures themselves?
10. **Competitor contact** — is a competing management company, guaranteed-rent scheme, or developer offer already live in parallel?

---

## Question Sequence (from response-library/questions.json, 80 canonical clusters across 103 transcripts)

Highest-frequency questions actually asked, in the order most meetings naturally raise them:

1. **Contract terms** (freq 11) — "Is there a minimum tie-in period? What's the exit process?"
2. **Management fee** (freq 7) — "What's the fee and what's included?"
3. **Guest type / who's actually staying** (freq 4) and **realistic income expectation** (freq 4) — these two run roughly concurrently once figures are on screen.
4. **Which platforms is it listed on** (freq 3).
5. **STL vs LTL financial comparison** (freq 3).
6. **Council tax treatment when switching** (freq 2), **guest vetting/property protection** (freq 2), **can the property stay on the market while STL'd** (freq 2, SELL-profile specific), **does STL income cover mortgage and running costs** (freq 2).

Note: meeting-phase tagging in the source data is thin and inconsistent (39 different free-text phase labels across 80 questions, most untagged) — treat the ordering above as frequency-derived, not a strictly validated sequence.

### By profile type — top questions (from by-profile-type files' `top_questions`)

- **STL-SW** (37 entries): "How does STL income compare to what I'm getting from a long-term let?" (freq 20/37 — dominant), then furnishing cost (8), fees (5), council tax (4), guest vetting (4), mortgage compliance (4).
- **EX-STL** (17 entries): "How does Stayful's fee/service compare to my current management company?" (4), "What income can I realistically expect including the worst-case month?" (5), "Why aren't we getting bookings under our current setup?" (2).
- **PURCH** (18 entries): "What income can I realistically expect, and how does it compare to LTL?" (8), full cost/fee breakdown (5), strategy validation — platform vs direct bookings (3), furnishing/setup cost (3).
- **SELL** (8 entries): "Can the property stay actively listed for sale while it's short-let?" (4 — the dominant SELL-specific question), "Will STL income cover the mortgage and running costs?" (3).
- **ABROAD** (17 entries): "How will the property actually be managed with no one on-site?" (7), income/LTL comparison (10 combined across two related question clusters), guest damage/vetting (5).
- **R2R** (6 entries): "Does this deal work financially once rent, fee, and setup costs are all stacked?" (4 — dominant; almost never resolves in the lead's favour at the landlord's initial asking rent).

---

## Delay Detection & Timeline-Probing Questions

Ask the specific timeline question tied to whichever delay type the trigger phrases suggest (from `by-delay-type/*.json`):

| Delay type | Entries | Timeline question to ask |
|---|---|---|
| **DLY-TEN** (existing tenant) | 7 | "Once your tenant/occupant is actually out, is there a firm date for that yet, or is it still an estimate — and is notice formally served, or just discussed verbally?" |
| **DLY-FUR** (unfurnished) | 11 | "If you can send me the room dimensions and a couple of photos, I can turn that ballpark into a firm itemised quote — how soon could you get those over?" |
| **DLY-PUR** (purchasing) | 10 | "Where are you in the process right now — has anything exchanged, and what's the realistic completion date your solicitor or the vendor has given you?" |
| **DLY-MOV** (moving/abroad) | 8 | "Once you've got your move/departure date confirmed, roughly how much notice would you want to give us to get everything onboarded and live before you go?" |
| **DLY-OTH** (renovation, mortgage, third-party consent, spouse, compliance) | 24 | "Of everything still to sort before this could go live — [name the specific blocker back to them] — what's the realistic next milestone, and when do you expect to know more?" |

Typical resolution windows: DLY-FUR and DLY-OTH often resolve within weeks to ~3 months once a firm quote or milestone lands; DLY-TEN and DLY-MOV more often run 2–3 months (up to 6–8 in HMO or long-notice cases); DLY-PUR typically 1–3 months. **Conversion-after-delay rates recorded: DLY-OTH 38%, DLY-FUR 36%, DLY-MOV 13%, DLY-TEN 14%, DLY-PUR 10%** — delays gated by a third party's process outside anyone's control (DLY-PUR, DLY-TEN) convert markedly worse than delays the lead can resolve themselves (DLY-FUR, most of DLY-OTH).

---

## Green Light Confirmation Questions

The dominant green-light signal across nearly every archetype and profile type is **GL-MGMT** — a stated preference for fully hands-off management. Confirm it directly rather than assuming it: *"Just so I've got this right — you'd want this to be genuinely hands-off, where the only thing you're dealing with is the mortgage and bills?"*

Confirm **GL-TIME** by naming the actual external deadline back to them (a mortgage switch, a lease renewal, a relocation date) rather than accepting a vague "soon."

Watch for **GL-SELF** — the lead proactively raising signing before the next call, asking about a multi-property discount, or volunteering a second property. This is the strongest unprompted signal and should shift the meeting toward Phase 7 (Close) in the runbook.

---

## Red Flags (from lost-reason-patterns.json — 13 total lost entries)

- **R2R deals where landlord rent leaves no real margin after Stayful's fee and setup cost** — 3 of 4 lost R2R leads failed specifically on this gate; pre-qualify rent level vs. STL gross-revenue ceiling *before* booking the web meeting.
- **Very low existing mortgage (e.g. ~£260/month)** — limited financial pain means the STL uplift rarely clears the setup-cost bar; flag early and consider a capital-compounding reframe rather than a cost-reduction pitch.
- **Property purchase still mid-process** — 3 of 18 PURCH leads were lost specifically while the purchase itself was still live (chose a developer's in-house management, or lost momentum before completion); this is the highest-risk window for PURCH leads specifically.
- **Shared-accommodation/HMO-style property** — outside Stayful's operating model entirely; 1 lost R2R lead was disqualified on this basis alone, independent of financial viability. Screen for this on the qualifying call, before booking a full web meeting.
- **Trust gap from a prior management company's broken promises**, left unresolved by pitch alone rather than verified proof — flagged as a lost reason for an EX-STL-type lead.
- **Competitor chosen or deferred** — most likely when the lead is evaluating multiple providers simultaneously (2–3 agents) and no differentiated proof point (case study, specific local track record) was offered.

---

## Green Flags (from offer-timing-intelligence.json — 44 offers analysed)

- The strongest recorded green-light combination is **GL-MGMT + GL-SELF + GL-TIME together** (seen in 4 offers) — though note honestly that none of these were explicitly recorded as accepted live on the call; readiness signals correlate with a *stronger conversation*, not a guaranteed on-call close.
- **Offer rate by profile type**: SELL leads receive an offer 87.5% of the time (highest), EX-STL 70.6%, STL-SW 40.5%, PURCH 27.8%, ABROAD 29.4% — reflecting how much more often SELL and EX-STL leads present with a clear, resolvable financial case by the close of the meeting.
- **Best offer timing across every profile type is "closing"** — no profile type in the dataset shows an offer landing effectively earlier in the meeting.
