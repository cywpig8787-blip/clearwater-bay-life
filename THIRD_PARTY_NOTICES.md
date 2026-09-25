# Third-party code and assets

## Release admission policy

Before adding external code, fonts, audio, images, models, textures, data, or generated-asset inputs to the formal game, record the exact source/version, author, license (including a retained license text or authoritative link), use path, modifications, and obligations. Unknown, missing, or incompatible commercial rights block admission to the game and release artifacts. Public availability is not a license. Do not substitute a guessed license.

This v2 change adds no third-party runtime code, package, font, model, image or audio. The allocator is newly authored here. Native browser/Node APIs are used. UI markup/CSS and skill definitions are retained from this repository; repository origin alone is not proof of external asset rights.

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
