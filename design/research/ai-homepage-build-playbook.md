---
title: AI 駆動（Codex）で「綺麗な公式サイト」を作る — 専門家パネル合成
updated: 2026-06-04
status: research（5 専門家 + scout・最新 2025-2026・fetch/ライセンス検証済）
---

# AI ホームページ ビルド・プレイブック（Part 1）

> Andes 公式サイト（Next.js 15 / React 19 / TS / Tailwind v4 / Vercel）を **Claude=設計 / Codex=実装** で「デザイン性高く・綺麗・anti-slop」に作るための最新合成。5 人の専門家＋参考サイト scout の fetch 検証結果。

## 0. パネルが一点に収束した結論
**「綺麗」は彩度でなく〈achromatic 土台 + Crimson を面積 1–2% に全振り〉×〈大きく confident な grotesque sans + 数字/法令名は monospace〉×〈編集的・非対称グリッド + 広い余白〉×〈質感は微 grain のみ〉×〈motion は 1 主役 + 機能的のみ〉。** AI に作らせる鍵は **docs を SSOT にし、anti-slop ゲート（hallmark）＋トークン固定＋視覚 diff（Playwright）で generic に倒れるのを物理的に止める**こと。

## 1. AI 駆動の制作ワークフロー（最新）
```
① 設計(Claude): docs/ に色/typo/layout/motion/IA/copy を確定（SSOT）
② トークン化: tailwind.config に Andes token（color/font/animation）を override
   → AI のデフォルト blue/gray/Inter を「見せない」
③ anti-slop ゲート: hallmark skill を導入（65 の slop 検査・macrostructure/theme）
④ 実装(Codex): shadcn(MIT) を素体に、Andes token で restyle。
   MCP で shadcn registry を直接 install（shadcn MCP）。Figma を SSOT 化するなら Figma Dev Mode MCP。
   motion は GSAP/Lenis/Motion で「1 画面 1 主役」だけ。
⑤ 品質ゲート(PR前): hallmark audit / Playwright 視覚 diff / a11y(WCAG2.2 AA) / i18n 3 locale / lint・typecheck・test・build 緑
```
> 鉄則: **SSOT が無いと AI は必ず generic に倒れる。** docs/ が確定していれば Codex は「意図して綺麗な」コードを出す。

## 2. AI に generic / slop を作らせない 5 策
1. **hallmark（MIT）anti-slop skill** を実装ゲートに（rounded cards / blue-grey / hero-stack を弾く）。
2. **tailwind.config に Andes token override**（Crimson/ink/paper/font）→ デフォルト色を物理的に排除。
3. **shadcn MCP** でコンポーネントを「正しい構造」で install → AI が generic を量産しない。
4. **Playwright `toHaveScreenshot()` 視覚 diff**（参照=Stripe/Linear）で subtle generic を CI で catch。
5. **v0 等の生成は prototype 限定**、必ず手で書き直す（生出力の本番投入は slop ＋ IP リスク）。

## 3. ツール表（fetch・ライセンス検証済）
| 名前 | 種別 | ライセンス | Andes の使い所 | 注意 |
|---|---|---|---|---|
| **hallmark** | Claude/Codex skill | **MIT** | anti-slop ゲート（必須） | `npx skills add` で導入 |
| **shadcn/ui** | registry | **MIT** | UI 素体（必須）。Andes token で restyle | generic でなく素体 |
| **shadcn MCP** | MCP | 無料公式 | Codex がコンポーネントを直接 install | namespace で他 registry も |
| **Magic UI** | registry | **MIT** | animated 部品を 1–2 個厳選改変 | 多用＝既視感 |
| **Cult UI** | registry | **MIT** | 差別化（知名度低=generic 回避） | — |
| **Aceternity UI** | registry | MIT(free) | — | ❌ **slop 筆頭・基本不使用** |
| **GSAP（全部入り）** | anim | GSAP No-Charge（商用無料） | scroll/SplitText/Flip 主軸。**SplitText 3.13 で rewrite** | 標準 MIT でないが Andes 用途可。split-type → SplitText 移行推奨 |
| **Lenis** | anim | **MIT** | smooth scroll 定番 | パッケージ名 `lenis` |
| **Motion(旧 framer-motion)** | anim | **MIT** | React UI motion 主軸 | import を `motion/react` に寄せる |
| **R3F v9 + drei** | WebGL | **MIT** | WebGL 背景（使い所限定）。`PerformanceMonitor`/`AdaptiveDpr` で mobile 担保 | R3F9=React19 一致 |
| **Paper Shaders** | WebGL | **PolyForm Shield** | three 無しの軽量 animated gradient 背景 | 商用可だが要 attribution・docs 明記 |
| **Rive(react-canvas)** | anim | **MIT(runtime)** | 1 点ものの interactive figure | editor は freemium・広く敷かない |
| **Figma Dev Mode MCP** | MCP | beta 無料(将来有料) | Figma を SSOT 化するなら token 移植 | — |
| **chrome-devtools MCP** | MCP | 既設 | measure→token→視覚 diff | — |
| **v0(Vercel)** | AI 生成 | 商用は有料(IP は Enterprise のみ assign) | **prototype 限定** | 生出力の本番投入 NG |
| **Tailwind Plus** | template | 有料 $299(再販NG) | premium 土台（任意） | Figma 同梱なし |

## 4. CSS scroll-driven の新潮流（モーション専門家）
- **CSS scroll-driven animations**（`animation-timeline: scroll()/view()`）が 2025-2026 の地殻変動。compositor で走り main thread を塞がない。**軽い fade/parallax はこれ**、複雑 narrative は Lenis+GSAP ScrollTrigger。**Baseline 未到達（Firefox フラグ裏）→ `@supports` で fallback 必須**。
- 規律: reduced-motion 必須 / hero を LCP にしない / `transform`・`opacity` 限定 / DPR≤2 / motion は 1 画面 1 主役。

## 5. 採用の核（パネル合意）
- 素体=**shadcn(MIT)** ＋ **GSAP/Lenis/Motion(MIT/無料)**、anti-slop=**hallmark(MIT)**、install=**shadcn MCP**。背景に動く gradient が要れば **Paper Shaders(要 license 明記)** か **R3F**。**Aceternity・v0 生出力・Inter は使わない。**

## 出典（fetch 確認済・抜粋）
anthropic.com / linear.app / mercury.com / awwwards SOTD / github.com/Nutlope/hallmark(MIT) / ui.shadcn.com(MIT) / shadcn MCP / figma MCP(developers.figma.com) / gsap.com(3.13/無料) / motion.dev(MIT) / lenis / r3f v9 / github.com/paper-design/shaders(PolyForm) / rive.app / v0.app(有料/IP) / tailwindcss.com/plus。詳細は各専門家ログ。
