# CYW-51 Playtest Fix — 2026-09-24

Source of truth: [CYW-51](https://linear.app/cyw900704/issue/CYW-51), including the final “Playtest Fix｜技能點數池／Random Roll 錯誤（2026-09-24）” section, updated 2026-09-23 17:28:49 UTC. The issue and all four comments were read before implementation.

## Change

The previous randomizer used a combined 400-plus-bonuses loop bound and tested every candidate against both pools. An overspent saved draft in the untouched pool could prevent the selected pool from allocating anything. Fresh empty drafts did not consistently reproduce that failure in the old engine; both fresh-entry orders are now explicit regressions.

`skillBudget` computes the selected pool's budget before random sampling. It reserves the legal sources needed by the unchanged pool, then exposes only applicable remaining sources. Base is 200; each attribute generates `max(0, Attribute - 50)` once. Bonus is the applicable source capacity minus capacity already needed by the other pool. Total Available = Base + Bonus; Allocated = the selected skills' sum; Remaining = Total Available - Allocated.

Random Roll spends restricted sources first, distributes within each source's capacity and the 75 skill cap, validates funding, then replaces only the selected skill map. It does not initialize or roll the other pool. Manual increases use the same budget. Invalid older allocations remain visible and must still pass the existing final character validation.

Both UI summaries use this budget function. Point Sources includes actual generated/reserved/available values, the six attribute formulas, eligible skills, and the existing source allocation ledger. Unspent shared INT can be available to either pool; the two potential limits must not be added together.

Example: STR 25, CON 25, AGI 50, DEX 60, PER 25, INT 65 totals 250 attributes. The only bonuses are DEX 10 and INT 15. Academic first allocates 215, leaving Other 210. Other first allocates 225, leaving Academic 200. Both orders spend 425 combined, with INT used only once. No mapping, cap, school, residence, or map rules changed.

## Verification

`node --test tests/*.test.mjs`: 36 passed, 0 failed (27 existing plus 9 new tests).

The new suite covers all nine Playtest acceptance checks: fresh/reloaded Academic first; fresh/reloaded Other first; both ordering directions preserving the untouched map; repeated rolls; legal total budgets; normal skill cap 75; no duplicate bonuses; and all five UI amounts matching the engine. It additionally covers absent skill maps, invalid older allocations, pre-sampling budgets, override not minting random points, lowered attributes, and manual allocation limits. Existing six-archetype, attribute, school, residence and world regressions remain green.

Browser verification used two independent fresh local origins. Academic-first produced 215/210; Other-first produced 200/225. Reloading and rolling the other pool preserved all original skill values (including all 48 Other inputs). Expanded calculation text matched INT 15, DEX 10, AGI 0 and the reserved shared source. Both pages had no console warnings or errors.
