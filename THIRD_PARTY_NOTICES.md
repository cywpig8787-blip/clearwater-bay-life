# Third-party code and assets

## Release admission policy

Before adding external code, fonts, audio, images, models, textures, data, or generated-asset inputs to the formal game, record the exact source/version, author, license (including a retained license text or authoritative link), use path, modifications, and obligations. Unknown, missing, or incompatible commercial rights block admission to the game and release artifacts. Public availability is not a license. Do not substitute a guessed license.

The allocator is authored here and uses native browser/Node APIs. External artwork and fonts added to later playtest revisions are recorded below; repository origin alone is not proof of external asset rights.

## Existing materials and dependencies

| Source / author | License / status | Usage | Modifications | Obligations / release treatment |
| --- | --- | --- | --- | --- |
| `docs/references/ravenwood-campus-original.png`; original supplier/author not recorded in repo | Unknown; reference only, not approved for commercial distribution | Design reference outside `web/` and `godot/` | None in this refactor | Preserve privately as reference history; excluded from Pages upload. Do not copy to game/release until source and rights are documented. |
| Existing repo UI/CSS and skill/school data; repo history at `3c803e0` | Project-authored provenance; no external attribution recorded | `web/opening/`, `web/creation-v2/catalog.mjs`, existing world/phone files | UI adapter replaced; catalogue preserved; no external artwork imported | Preserve project history. Any later discovered external origin requires this register to be corrected before commercial release. |
| [actions/checkout](https://github.com/actions/checkout), GitHub Actions maintainers | MIT — upstream LICENSE | CI only, v4 | None | Not bundled in game. Preserve upstream license if redistributed; record exact resolved SHA in Actions run. |
| [actions/setup-node](https://github.com/actions/setup-node), GitHub Actions maintainers | MIT — upstream LICENSE | CI only, v4 | None | Same CI-only treatment and redistribution notice requirement. |
| [actions/configure-pages](https://github.com/actions/configure-pages), GitHub Actions maintainers | MIT — upstream LICENSE | CI only, v5 | None | Same CI-only treatment and redistribution notice requirement. |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact), GitHub Actions maintainers | MIT — upstream LICENSE | CI only, v3 | None | Same CI-only treatment and redistribution notice requirement. |
| [actions/deploy-pages](https://github.com/actions/deploy-pages), GitHub Actions maintainers | MIT — upstream LICENSE | CI only, v4 | None | Same CI-only treatment and redistribution notice requirement. |

Future entry template: source URL + version/hash; author/rightsholder; license identifier + text; commercial permission evidence; usage paths; changes; attribution/notice/source-disclosure/share-alike obligations; review status. This register is an inventory and admission gate, not a claim that the entire historical project has received commercial clearance.

## Character Creator button sheet — user-supplied, 2026-09-24

- Source: the image explicitly supplied and approved in the user's Character Creator v2 button-asset request; retained at docs/references/character-creator-button-sheet.png. Historical crop hashes and rectangles remain in Git history (before r12).
- Author/rightsholder not independently identified. No third-party/open-source license is asserted. The user explicitly authorized cropping this image, integrating the resulting assets, and publishing them to the existing GitHub Pages Playtest. This entry records that task-specific permission, not a broader commercial license.
- Historical usage: web/opening/assets/buttons/*.png and button-assets.css/mjs. Removed from the r12 web artifact because the latest CYW-51 supersedes this control kit.
- Modifications: exact rectangular crops with source alpha preserved for bases; original brown icon RGB preserved with a paper-background alpha mask for glyphs. No regenerated artwork, text, alternate palettes or state images.
- Original source retained outside the Pages web artifact. Attribution and broader distribution rights remain as supplied by the user.

## School Selection — 2026-09-25

The user explicitly supplied the three school sheets (1000078262, 1000078267, 1000078271) and desk (1000078255), requesting their integration and publication to this GitHub Pages Playtest. This records that task-specific authorization, not an independently verified commercial artwork license. The desk is copied unchanged. Original school JPGs supply the crests through CSS clipping. The paper PNG derivatives use imagegen editing to remove printed text/crests for dynamic HTML overlays; generated reconstruction can differ locally from the originals. No alternate school identity was commissioned. Files and SHA-256 hashes are recorded in `web/school-selection/assets/manifest.json`.

### Bundled fonts

All three original, unmodified TTF files are distributed under SIL Open Font License 1.1, which permits commercial use and embedding subject to its conditions. Fonts are not sold separately; copyright and complete licenses accompany the files. No reserved font names are reassigned. No third-party download sites were used.

| Font / copyright holder | Official source and version | Retained license / attribution | Use |
| --- | --- | --- | --- |
| Iansui / The Iansui Project Authors | https://github.com/ButTaiwan/iansui/tree/v1.020 | `web/school-selection/fonts/iansui-OFL.txt`, `iansui-AUTHORS.txt` | Ravenwood |
| ChenYuLuoYan / Wang, Li-Yu and Liu, Wei-Chen | https://github.com/Chenyu-otf/chenyuluoyan_thin/tree/6e36815b0bec9f4f948298698d00b27a5f0b65c1 — ChenYuluoyan-2.0-Thin.ttf | `web/school-selection/fonts/chenyu-OFL.txt` (copyright included) | Rosamund |
| LXGW WenKai TC / The LXGW WenKai Project Authors | https://github.com/lxgw/LxgwWenkaiTC/tree/v1.522 | `web/school-selection/fonts/wenkai-OFL.txt`, `wenkai-AUTHORS.txt` | Avenor |

### School font verification — CYW-51 r11 (2026-09-26)

The bundled, unmodified TTFs were compared with the original projects' Git trees at the versions above. Their Git blob hashes match exactly:

- Iansui v1.020, `fonts/ttf/Iansui-Regular.ttf`: `3dcc17971252ea3c23f1eac4e6277e762f4566d0`.
- ChenYuLuoYan pinned commit, `ChenYuluoyan-2.0-Thin.ttf`: `647b14819d9a734eec5800bcbbff0f5cad2d42cf`.
- LXGW WenKai TC v1.522, `fonts/TTF/LXGWWenKaiTC-Regular.ttf`: `b4a79650617dc7db626b196c50777b411340d023`.

The Iansui and WenKai OFL / AUTHORS files also match upstream blobs. ChenYuLuoYan's retained OFL text equals upstream `license.txt` after CRLF/LF normalization. All notices and copyright / reserved-name declarations remain bundled. No font binaries, names inside the fonts, or glyphs were modified.

Web use maps each original face explicitly to normal style / CSS weight 400, including the original Thin design for ChenYuLuoYan; this is a CSS face mapping, not a modified or emboldened font. School content disables synthetic weights and uses only the declared face. Assets are served from the same origin as the playtest. The scene verifies FontFaceSet loading before revealing text and displays a retry message if a required face or image fails, instead of silently presenting fallback text.

## CYW-51 typography lock — 2026-09-26

Latin font provenance, pinned upstream revision, exact download path and SHA-256 are retained in `web/school-selection/fonts/latin-sources.json`. Courier Prime is from quoteunquoteapps/CourierPrime; Cormorant Garamond from its original author CatharsisFonts/Cormorant; IBM Plex Sans and Mono from IBM/plex. All are SIL OFL 1.1; complete copyright and licenses accompany the files as courier-OFL.txt, cormorant-OFL.txt and plex-OFL.txt. Original font binaries are unmodified. Commercial use, embedding and redistribution follow these retained licenses; fonts are not sold on their own.

Pinyon Script is compiled from the official librefonts/pinyonscript TTX tables at 1633812b2044a523b8b9f1f0da5d52630f624c6b using fontTools (no glyph outline or name edits, original timestamp retained). Copyright 2011 Sorkin Type Co, reserved name Pinyon Script; complete pinyon-OFL.txt accompanies the font. Format compilation does not change the design. No mirror website was used.

The new three blank school paper assets and isolated Creator paper are generated using OpenAI built-in imagegen for this explicitly requested visual revision. Creator extraction uses the previously user-supplied paper-master reference. Seven blank sticky markers are project-authored SVG art. Prompts, provenance and asset hashes are recorded in docs/cyw51-r12-assets.json. Generated campus drawings are decorative visual direction, not authoritative world/location data. Existing school crests are retained from the already authorized source sheets; they do not establish broader commercial clearance.
