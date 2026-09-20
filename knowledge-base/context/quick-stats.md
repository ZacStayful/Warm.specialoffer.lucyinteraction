# Quick Stats — Stayful Web Meeting Intelligence

**Entries:** 121 transcripts (2026-Q1→Q3; 1 processed this run — entry 102, Karen Lee) | **Confidence: STRONG** (50+ meeting threshold cleared)

## Outcomes (profile-type conversion_data — approximate, see caveat)
- Ready Now: 28 (23%) | Delayed: 91 (75%)
- No Ready Soon/Nurture split exists in source data — only these two buckets are tracked.
- Lost: 15 — tracked separately, overlaps the two buckets above, not additive.

## Offers (offer-timing-intelligence.json, n=46)
- Acceptance rate: 4.35% (2/46) — still a floor; most offer-made entries have not been individually re-audited for offer_accepted_at_meeting. No offer made this run.
- **New failure mode (2026-09-13 run, still current):** an offer can outlive its own viability — entry 094's live 13%+VAT offer was never accepted or rejected on-call, then the deal was lost afterward when the building/lease was found not to permit short-letting at all.

## Delay & Green Light
- Most common delay: DLY-OTH catch-all — 35 entries (+1 this run — 102, Karen Lee: mid-conversion/never-let property plus spousal sign-off pending, both existing DLY-OTH trigger types). Most common *named* delay: DLY-FUR (unfurnished) — 13.
- Green light source data untouched this run (no green-light signal present in entry 102) — see delay-and-green-light-reference.md.

## Archetypes — 0 of this run's 1 new entry carries a canonical archetype
**Data-integrity finding (confirmed again this run):** the Monday psychology columns (text_mm3pk18b Emotional Profile, numeric_mm3pm45m Conversion Likelihood, text_mm3qbahd Primary Blocker, etc.) **do not exist at all** on live board 5891626711 — not just unpopulated, confirmed directly via get_board_items_page on item 13067940691 (Karen Lee) this run. CLAUDE.md's own column reference table lists these as real columns. Either they were removed from the board, or the Lead Psychology Profiler that's supposed to write them was never wired up. Still only 36/121 (30%) entries carry a canonical slug; the gap is entirely structural now, not a backfill problem.

## Lost Reasons (n=15)
No change this run (entry 102 outcome is Warm, not lost). "Building does not allow" remains 2 cases (13%), tied for the largest single reason with the pre-existing "Unspecified" bucket. See lost-reason-patterns.json cross_reference for the prevention approach (check building/lease permission before quoting fees or making an offer).

## New this run
- **NEW-BUILD/DEV/CONV taxonomy gap reinforced again** (entry 102, Karen Lee — a never-let new-build conversion filed under STL-SW as nearest fit; same gap flagged at entries 039, 101). A dedicated profile code remains overdue.
- **South Northants geographic cluster forming**: 098 (Towcester) + 102 (Middleton Cheney, Banbury) — both STL-SW, both within the Silverstone/HS2/Motorsport Valley demand corridor. Worth a locality-specific reference sheet per the STL-SW credibility gap (see by-profile-type/STL-SW.json top_conversion_gaps).
