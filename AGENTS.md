# 《人生》開發接手指南

## 核心原則

- 本 repository 是《人生》的正式 source of truth。
- 不要重做已驗收系統；先讀現有實作再修改。
- 不要使用 AppDeploy 當正式專案來源。
- Web 版本只負責快速測試 UI / UX；正式遊戲以 Godot 4 + GDScript 為目標。
- 不得因新增功能而偷偷改動 Save、World State、Location 或其他已存在核心規則。
- 未經使用者確認，不要自行發明世界觀規則、學校制度、住宿細節、技能名稱或角色設定。

## Phone OS v2

手機不是主選單，而是遊戲世界中的裝置。

已確認：
- 主遊戲橫版，手機本體維持直式。
- App Session 與 Persistent Data 分離。
- Home 不等於關閉 App。
- Recent Apps 上滑才真正關閉 Session。
- Lock Screen 支援滑鼠與觸控上滑解鎖。
- Dark Mode 是實際黑／深灰 UI 主題，不是整體 brightness 變暗。
- Phone App 後續統一透過 App Registry 擴充。

## 目錄

- `godot/`：正式遊戲工程。
- `web/`：固定瀏覽器測試入口。
