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

- Source: the image explicitly supplied and approved in the user's Character Creator v2 button-asset request; retained at docs/references/character-creator-button-sheet.png. SHA-256 and exact crop rectangles are in web/opening/assets/buttons/manifest.json.
- Author/rightsholder not independently identified. No third-party/open-source license is asserted. The user explicitly authorized cropping this image, integrating the resulting assets, and publishing them to the existing GitHub Pages Playtest. This entry records that task-specific permission, not a broader commercial license.
- Usage: web/opening/assets/buttons/*.png and button-assets.css/mjs.
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
