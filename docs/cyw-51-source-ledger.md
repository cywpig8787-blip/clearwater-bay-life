# CYW-51 Point Source Ledger (2026-09-24)

The creator now uses `AllocationEngine` as the only allocator. `point-data.mjs`
retains the confirmed skill catalog, eligibility mapping and 250/65/75 rules.

## Source contract

There are exactly eight independent sources: Academic Base 200, Other Base 200,
and one source for each of STR/CON/AGI/DEX/PER/INT. Each attribute source has
`amount = max(0, Attribute - 50)` and its own `eligibleSkills`. No bonus belongs
to a category. `pay()` checks eligibility and remaining capacity before recording
a contribution. The ledger contains each source's amount, used, remaining and
allocations, plus each skill's exact source contributions.

Manual target values (including +/- and direct input) are reconciled together
using a residual flow graph inside the engine. This can reroute payments without
changing any other skill value. A random roll releases only the selected
category's payments, then samples eligible destinations from each source and
pays each increment through the same engine. It never generates arbitrary skill
values for a later budget check. Valid untouched-category payments survive a
reroll as well as its skill values.

`creationPoints.version = 2` persists the resulting source ledger. Loading checks
its source-definition/value signature and replays payments against freshly
computed source capacities; saved source amounts never authorize spending.
Legacy drafts and mismatched/invalid snapshots are reconciled from current
attributes and skill values. `pointPools()` and `allocation().pools` remain only
as compatibility readers for existing tests/callers; the persisted v2 ledger
has one canonical `sources` array and no category-owned bonus budgets.

## Display and invalid drafts

Category summaries are derived from this single ledger. Bonus summary means
bonus payments to this category plus relevant unspent source capacity. The
same unspent shared source may be usable in either category, so the displayed
category limits must not be summed. A category summary never authorizes payment.

Allocated means funded points. When an old draft or a reduction in attributes
leaves an unfunded request, its original skill values remain editable, the UI
shows requested and unfunded amounts explicitly, and finishing creation is
blocked. Remaining is always actual nonnegative capacity, not a negative debt
or a cosmetic clamp hiding invalid allocations.

Developer Override lifts the existing attribute/skill caps only; source
eligibility and capacity still apply. Normal rolls continue to produce capped
values. Other creation, residence and gameplay rules are unchanged.

## Verification

Run `node --test tests/*.test.mjs` (53 tests). Coverage includes the eight
requested regressions, both roll orders, JSON reloads, exact unaffected payments,
source tampering, failed transaction rollback, normal/override limits and the
existing Ravenwood save/location/residence tests. The PER cross-category test
uses a fixture only; the confirmed PER eligibility list is unchanged.

Browser checks: Academic first, Other rerolls, +/- controls, direct input and
75 cap rejection, details, reload persistence, no console errors. With
STR/CON/AGI/DEX = 35 and PER/INT = 55, Academic manually allocated 200 and Other
rolled to exactly 210, both at Remaining 0 after the roll.

Deployment uses the existing main-branch GitHub Pages workflow. All opening
module URLs use `ledger-v3` so previously cached creator code is refreshed.
