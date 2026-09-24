# CYW-51 Character Creator v2 — r8 verification

Specification read: Linear CYW-51, updated 2026-09-24T11:53:00.277Z, including the full description and all four discussion comments. The explicit latest page requirements and user instruction supersede older embedded totals. Current rules: Attributes 150 / cap 65; Proficiencies 400 / cap 75; Skills retain fourteen category budgets and their Attribute Pair formula.

## Changes

- Six attribute labels show their Chinese names on the same line, including the confirmation summary.
- Proficiency budget, UI, validation, tests and current developer notes use 400.
- All three allocation pages have the same dice label and warm paper-gold action style. Proficiency random allocation calls the existing allocation engine for every increment, commits atomically, includes custom entries and allows later manual edits.
- Page navigation, restored drafts and final confirmation use shared validation. Exact Attribute totals alone cannot hide invalid individual values. Negative Skill values now fail validation.
- Desktop content is bounded within the document, with independent long-list scrolling and a reserved footer. Skill/proficiency reading surfaces reduce interference from decorative line art.
- Existing separate name fields, click-to-upload portrait/crop, fixed finance labels, run-bound roll and seven-step scope are retained.

## Automated regression

`node --test tests/character-creator-v2.test.mjs tests/ravenwood.test.mjs`: 30 passed, 0 failed.

Coverage includes exact 150/400 totals; individual caps; clamped adjustment; category budgets; free mother tongue baseline; changes causing overbudget skills; deterministic/random proficiency allocation; malformed RNG atomicity; manual edits after randomization; old overbudget drafts; shared page/final gates; unchanged source paper image checksum; and existing Ravenwood traversal, saves and residence rules.

## Real browser verification

Browser viewport tests, not physical-device tests:

| Viewport | Pages | Horizontal overflow | Tabs fit | Counter rows fit | Footer overlap |
|---|---|---|---|---|---|
| 1440 × 900 | 01–07 | None | Yes | Yes | None |
| 844 × 390 | 01–07 | None | Yes | Yes | None |
| 667 × 375 | 01–07 | None | Yes | Yes | None |

Interactive checks:

- Empty required pages 01–05 block Next; unfinished prerequisites block page tabs.
- Clearing the name after reaching page 07 prevents returning to page 07; reloading retains the incomplete draft.
- February offers days 1–29, excluding day 30.
- Finance result survives reload without a new roll control.
- Attribute randomization gives 150; proficiency randomization gives 400. Skill randomization stays within the displayed per-category budgets.
- Skill and proficiency allocations remain manually editable. At a fully allocated proficiency budget, subtracting 1 then requesting +10 adds only the available 1.
- Central portrait button opens the file chooser. An existing repository image was used as test input; crop zoom/reset/confirm work and the preview is horizontally centered with `object-position: 50% 50%`.
- Empty Background advances normally. Final confirmation stays on the summary, acknowledges confirmation and disables repeated submission.
- No console errors or warnings were recorded during the completed local flow.

World Toolkit, existing world modules and the original paper asset are unchanged. This release adds no school selection or post-confirmation flow.
