# CYW-51 r9 — approved button asset integration

Spec: current CYW-51 re-read; latest user instructions prioritize desktop and the supplied button sheet.

## Delivered

- 3 reusable blank bases and 11 transparent icons cropped from the approved sheet. Original source and SHA-256/crop manifest retained.
- Reproducible extraction: `powershell -File scripts/extract-creator-buttons.ps1` (Windows/System.Drawing). Re-extraction produces identical PNG hashes.
- Native HTML controls use CSS border-image nine-slice. Text remains DOM text. Same base for normal/hover/pressed; disabled grayscale. Hover brightness 1.035, press brightness .98 with 2px displacement.
- Navigation, finance, all three random controls, steppers, birthday, crop and developer controls use this presentation layer. Sticky-note navigation and portrait hit area retain their appropriate existing surfaces.
- Clear stale detail selection when switching between skills and proficiencies.

## Verification (2026-09-25)

- `node --test tests/character-creator-v2.test.mjs tests/ravenwood.test.mjs`: 30 passed, 0 failed.
- Desktop 1440x900 and 1366x768: all seven pages inspected; no horizontal overflow, content area above footer, footer within viewport, all ordinary buttons decorated. Icons loaded; no console errors. Visual screenshots inspected for bases, corners, icon alignment, list density and dialog focus.
- Native keyboard focus ring verified in crop dialog; reset returns zoom to 1; upload and confirm crop work. Birthday confirmation works.
- Missing surname blocks direct jump to page 07. Unrolled finance blocks page 03. Developer reset followed by normal roll locks one of the five approved labels.
- Attributes random result sums to 150 (all <=65); decrementing one point blocks Next; increment restores validity.
- Skills overspending after attribute changes blocks Next; random allocation repairs category budgets. Mother-tongue cap can leave unspendable language budget.
- Proficiencies random result sums to 400 (observed maximum 17, <=75); minus/plus one updates remaining 1/0 and preserves editability.
- Final confirmation stays on page 07 and disables the confirmation button with grayscale.
- Hover checked with pointer and computed style; active 2px displacement checked in stylesheet; no alternative state images.
- No obsolete 500-point budget remains in current creator modules/UI. CSS font-weight 500 remains unrelated typography.
- World Toolkit and School Selection unchanged. Existing responsive styles retained; mobile layout is not an acceptance blocker this round.
