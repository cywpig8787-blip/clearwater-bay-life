# Character Creation v2 — Text-first Hybrid 3D

## Authority and audit (2026-09-24)

This repository is the implementation source of truth. The user's 2026-09-24 refactor instruction supersedes the old full-3D target and v1 point-pool implementation.

- Reviewed [CYW-51](https://linear.app/cyw900704/issue/CYW-51): latest Skill v0.1 catalogue, Point Pools v0.1, Playtest Fix and deferred residence assignment. Keep the confirmed catalogue/eligibility mappings, 250 attributes, cap 65, skill cap 75, bases 200/200, and max(0, attribute - 50).
- Reviewed [Character Creation project](https://linear.app/cyw900704/project/人生角色創建介面-cccaca030b86): its older full-3D description is superseded by this instruction. This refactor updates the repo; it does not rewrite external planning records.
- Reviewed [Notion Ravenwood](https://www.notion.so/3cfb523ffd8c8191afe7d32a766bb590): its older two-building/single-room/22:30 text differs from later CYW-51 and current campus implementation. Do not reintroduce those older rules. Campus data remains unchanged; residence assignment is extracted without changing its allocation policy.
- No edits to World Toolkit. Existing NPC/world, school names, houses, skill names, Phone OS and Godot files retained. New 3D renderers are a future consumer of the same character/world state, not implemented in this refactor.

## Modules

| Module | Responsibility |
| --- | --- |
| character-data / catalog | Versioned draft, confirmed skill/attribute/school/house definitions; body, identity, knowledge and proficiency interfaces |
| attribute-engine | Integer validation, total/cap, bounded attribute rolls; no new positive minimum |
| point-source-ledger | Issue each source once; independently validate contributions; derive UI summaries |
| allocation-engine | Atomic edits and random allocation via one fresh bipartite flow implementation |
| school-eligibility | Identity, body-trait and existing family-finance checks; no gender overwrite |
| residence-assignment | World-time side and residence assignment from current dormitory data; creator strips actual assignment fields |
| developer-override | Separate cap policy; never grants unfunded points |
| creator-service | Persistence boundary, complete validation and compatible Player State export |
| opening UI / point-panel | Presentation and calls to the modules; no payment decision logic |

## Allocation contract

Every draft stores `contributions[kind][skill][sourceId]`. Base sources are `academic` and `other`; positive attribute sources use the attribute ID and are never owned by a category. A source can pay only its eligible skills. Zero bonus means no spendable bonus source; the UI still shows all six formulas.

The engine works on a clone. It reserves the opposite category's exact contributions, solves the requested category's payments, validates the entire ledger, and commits only on success. There is no partial payment, clipping, negative remainder or saved unfunded skill. Decreases release funds. Attribute changes may reroute both categories without changing their skill values; changes which make those values impossible are rejected atomically. Random Roll releases only its category and uses the same set transaction for every increment. Attribute Roll remains bounded to 250/65 even in developer mode; manual override is the explicit way to test extreme attributes.

Shared bonuses mean two category totals cannot be added. Category Total Available = own base + bonus already paying that category + unspent bonus eligible for that category. It excludes bonus reserved by the other category. Per-skill eligibility can further restrict spending. The source ledger is the authoritative conservation check, not an aggregate total.

## Persistence and flow

`cbl-character-v2` is independent of v1 drafts. Invalid v2 drafts are rejected rather than trusted as budgets. The formal `clearwater-life-player-state-v1` envelope remains compatible and includes the v2 version/contribution proof. Existing saved worlds are not migrated or erased. Body traits, gender identity, pronouns and school registration remain separate. The provisional flat-chest test default can be changed in the explicit test-data panel while appearance is unimplemented.

Ravenwood enters the existing pre-enrolment south gate with residence pending. Only the world administration interaction creates residence IDs and access. Rosamund/Avenor retain Player State export; their playable maps are not implemented. Their school/house/boarding choices are validated before export.

## Presentation and release direction

Text drives locations, NPCs, courses, events, movement and life simulation. Godot 4 + GDScript remains the formal engine target. 3D focuses on body/character, clothing, items, a rotatable inventory viewer and selected special scenes. A complete 3D open world is not a release requirement. Web is the current playable validation surface.

Commercial builds must exclude the retired prototype and reference-only materials, and satisfy THIRD_PARTY_NOTICES. No new external runtime dependency or asset was introduced. Existing unverified reference provenance is recorded, not silently treated as a commercial license.
