> 歷史紀錄：已由 CYW-51 最新內容與 [r12 驗收紀錄](cyw51-r12.md) 取代，不得作為現行實作規格。

# School Selection presentation rebuild — CYW-51 r11

Authority: CYW-51 read in full (updated 2026-09-25T09:10:16.142Z), plus the user's explicit replacement of historical arrow/stack navigation with directly selectable desk documents. Data, eligibility, school content, allocation and save contracts are unchanged.

The old presentation is replaced with a stationary desk layer, a paper layer of independent school assets, a full-screen black transition layer, paper-attached content and document actions. Each eligible school is instantiated once. The same paper node remains present through lift, blackout, reading settle, content reveal and reverse return. Authored positions use paper-relative units; reading preserves the assets' native 2:3 aspect ratio with object-fit: contain and no clipping. Reading text has no panel background.

The motion controller serializes lift → darkening → fully opaque blackout → settle → content fade → reading. Content is opacity 0 and inert until settling finishes; controls remain inert until the fade also finishes. Return disables interaction, fades content, blacks out the view change and lands at the original authored pose. Duplicate input is ignored. Reduced motion shortens durations while preserving every content/input gate. Resize no longer remounts the scene from stale Creator state.

Document actions replace the old Button Kit, and no previous/next document or carousel control is created. Reading and scroll state still use saveSchoolDesk; enrollment still uses confirmSchool. No world, residence or house rules were added.

## Fonts and assets

Each paper image must decode and its school's exact FontFaceSet entry must load before interaction is enabled. A failure displays a retry action; the scene does not expose fallback text. Normal CSS weight 400 is mapped explicitly, synthetic weights are disabled, and all Chinese headings, copy and actions inherit the school font. See THIRD_PARTY_NOTICES.md for official version/blob verification and retained licenses. Existing paper images and font binaries are unchanged.

## Acceptance

- Node: 54 passing tests, including creator/allocation, all ten gender/finance combinations, save/load/enrollment regression, ordered blackout and content gates, duplicate input, reduced motion, 1/2/3 authored layouts and font failure rejection.
- Browser: desktop 1280×720 and landscape 844×390; individual reading, original-pose return, scroll restore and no horizontal overflow.
- 0.25× animation fixture records actual animation frames and fully opaque black frames; no early content or active controls.
- Blank-paper inspection hides headings, labels, copy and actions while preserving the real paper images and desk hit areas.
- Three-paper presentation is tested only through the shared rendering factory in an isolated fixture. Current approved gender rules yield a maximum of two schools for one character; production eligibility was not bypassed to create three options.

The local browser fixture is outside the repository and is not deployed. World Toolkit is untouched.

Additional browser checks: the actual seven-page Creator was completed through its visible controls on an isolated local origin and successfully entered the rebuilt desk. A missing-font fixture produced a visible load error, kept the paper hit button disabled and content opacity at 0. All three loaded school faces had the expected computed font-family / weight; a rendered-glyph raster comparison also differed from the system serif fallback for each face. Image natural dimensions were 1024×1536 and object-fit was contain. No font or image was fetched from a third-party origin at runtime.
