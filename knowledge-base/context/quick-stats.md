# Quick Stats — Stayful Web Meeting Intelligence

**Entries:** 120 transcripts (2026-Q1→Q3; 11 processed this run) | **Confidence: STRONG** (50+ meeting threshold cleared)

## Outcomes (profile-type conversion_data — approximate, see caveat)
- Ready Now: 28 (23%) | Delayed: 90 (75%)
- No Ready Soon/Nurture split exists in source data — only these two buckets are tracked.
- Lost: 15 (up from 13) — tracked separately, overlaps the two buckets above, not additive.

## Offers (offer-timing-intelligence.json, n=46)
- Acceptance rate: 4.35% (2/46) — still a floor; most offer-made entries have not been individually re-audited for offer_accepted_at_meeting.
- **New failure mode this run:** an offer can outlive its own viability — entry 094's live 13%+VAT offer was never accepted or rejected on-call, then the deal was lost afterward when the building/lease was found not to permit short-letting at all.

## Delay & Green Light
- Most common delay: DLY-OTH catch-all — 34 entries. Most common *named* delay: DLY-FUR (unfurnished) — 13.
- Green light source data untouched this run except two additions (092 GL-SELF, 096 GL-TIME) — see delay-and-green-light-reference.md.

## Archetypes — 0 of this run's 11 new entries carry a canonical archetype
**Data-integrity finding:** every extraction agent this run independently confirmed the Monday psychology columns (text_mm3pk18b Emotional Profile, numeric_mm3pm45m Conversion Likelihood, text_mm3qbahd Primary Blocker, etc.) **do not exist at all** on live board 5891626711 — not just unpopulated. CLAUDE.md's own column reference table lists these as real columns. Either they were removed from the board, or the Lead Psychology Profiler that's supposed to write them was never wired up. Still only 36/120 (30%) entries carry a canonical slug; the gap is entirely structural now, not a backfill problem.

## Lost Reasons (n=15)
**New this run: "Building does not allow" — 2 cases (13%), now tied for the largest single reason with the pre-existing "Unspecified" bucket.** Both reached agreed-terms or signed-offer stage before the restriction surfaced at onboarding. See lost-reason-patterns.json cross_reference for the prevention approach (check building/lease permission before quoting fees or making an offer).
