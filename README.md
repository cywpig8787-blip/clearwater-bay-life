# 《人生》 / Clearwater Bay Life

《人生》正式主專案。

## 技術方向

- **Godot 4 + GDScript**：正式遊戲本體。
- **GitHub**：唯一正式原始碼來源。
- **GitHub Pages**：目前的固定瀏覽器測試入口。
- **Web Prototype**：只用來快速驗證 UI / UX，確認後再遷移進 Godot。

## 目前正式模組

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
