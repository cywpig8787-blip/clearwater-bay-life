# CYW-51 School Selection playtest r10

Specification: CYW-51, re-read in full, updated 2026-09-25T08:48:13.861Z. The latest school-selection rules supersede the earlier stop-after-Creator and neutral-gender prototypes.

## Flow and persistence

The seven-step Creator validates and atomically promotes its existing draft storage slot to a committed Player State. Keeping one slot avoids duplicating a large portrait and exceeding browser storage quota. The committed snapshot carries the same locked finance run into the separate School Selection screen. No eighth sticky note is added.

`school-selection` and `school-confirmed` are explicit saved phases. Before confirmation, selectedSchool and openingFlow are null. Enrollment revalidates the persisted snapshot before saving a school. Storage errors leave the prior record intact; stale reading tabs cannot overwrite confirmed enrollment. Reading school, desk ordering and scroll offset survive reload. Invalid player records are preserved with a visible loading error.

Eligibility: Ravenwood accepts both genders at all five tiers; Rosamund requires female and tier 3 or above; Avenor requires male and tier 2 or above. Only eligible documents are instantiated. Legacy neutral drafts keep other data and require an explicit male/female choice.

The final handoff saves one pending opening route and displays the CYW-51 document-handover text. It does not assign residence/house, create NPCs, or implement subsequent campus scenes. A `school-opening-ready` event exposes the route and committed Player State to future flow integration.

## Visuals

User-supplied desk JPG is unchanged and stationary. School paper PNGs are text-removal derivatives of the supplied sheets; original JPG crops provide small crests. Text is HTML, uses each school's designated licensed font, and scrolls inside a bounded safe area. See THIRD_PARTY_NOTICES.md and the asset hash manifest for provenance. Paper motion uses a shared lift/read/return controller, preserves desk poses, blocks duplicate input, and reduces animation to 1 ms with reduced motion enabled.

## Verification

- Node regression: 50 tests passed across character-creator-v2, school-selection and ravenwood suites; CI includes all three.
- Ten gender/finance combinations, invalid/neutral/unlocked inputs, one/two school sets, snapshot isolation, draft promotion with portrait, failed writes, export/import, all three opening routes and stale-tab protection.
- Motion sequence and duplicate-input tests for standard and reduced motion.
- Actual browser at 1280 × 720: Creator confirmation to single Ravenwood document; pick/return; refresh in desk and reading states; cancellation and enrollment; all three opening refreshes; female tier 3 and male tier 2 two-document cases; document navigation; Avenor long-text scrolling and refresh offset; all three reading layouts and no horizontal overflow.
- Browser scenario harness lives outside the repository and is not published. It imports production modules and uses separate test storage keys.
- World Toolkit files are unchanged. Mobile landscape expansion was out of scope.
