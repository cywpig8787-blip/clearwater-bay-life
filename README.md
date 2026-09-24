# 《人生》 / Clearwater Bay Life

《人生》正式主專案。

## 技術方向

- **Text-first Hybrid 3D（文本優先混合 3D）**：主要世界、Location、NPC、課程、事件、移動與生活模擬以文本為核心。
- 3D 主要用於 Character/Body、Clothing、Items、可旋轉 Inventory Viewer，以及少量特殊場景；完整 3D 開放世界不再是必要目標。
- **Godot 4 + GDScript**：正式遊戲本體。
- **GitHub**：唯一正式原始碼來源。
- **GitHub Pages**：目前的固定瀏覽器測試入口。
- **Web Prototype**：只用來快速驗證 UI / UX，確認後再遷移進 Godot。

## 目前正式模組

### Character Creation v2 ＋ Ravenwood 文本校園測試

- [創角與校園試玩](https://cywpig8787-blip.github.io/clearwater-bay-life/opening/)：建立角色後進入開學前校園，再到行政中心辦理住宿；中性角色於此時選宿舍側別。
- v2 模組分離 Character Data、Attribute Engine、Point Source Ledger、Allocation Engine、School Eligibility、Residence Assignment。Academic / Other 各 200；Bonus 為獨立 restricted source，所有技能均保存付款來源。
- v1 已封存在 `archive/character-creation-v1/`，不發布、不作為 v2 分配邏輯來源。v2 草稿與 v1 草稿隔離；既有正式存檔保留。
- [架構、規格核對與限制](docs/character-creation-v2.md)；[第三方來源與商業發行記錄](THIRD_PARTY_NOTICES.md)。
- [接續校園存檔](https://cywpig8787-blip.github.io/clearwater-bay-life/ravenwood/)：主校舍、科學翼、02–07、08–11 宿舍及南門→公園→商店街。
- 距離推進時間、住宅門禁、中性住宿側選擇、置物櫃妙手判定。
- 本版為 Web 玩法驗證，Godot 尚待移植。設計來源、估算與限制見 [Ravenwood 說明](web/ravenwood/README.md)。
- 測試：`node --test tests/*.test.mjs`（含封存原型的歷史回歸測試）；v2：`node --test tests/creation-v2.test.mjs`。

### Phone OS v2
手機系統已納入正式專案，包含：

- 直式手機浮在橫版主遊戲上。
- Lock / Home / App Drawer。
- App Registry 與 App Session。
- Recent Apps。
- 滑鼠與觸控上滑解鎖。
- Recent Apps 卡片上滑關閉。
- Notes 基礎功能。
- Settings 與真正的 Dark Mode。

## 專案結構

```text
godot/        正式 Godot 遊戲工程
web/          固定測試入口
.github/      GitHub Pages 自動發布
AGENTS.md     後續 ChatGPT / 開發者接手規則
```

核心系統不要使用 AppDeploy 作為正式來源；正式修改應回到此 repository。
