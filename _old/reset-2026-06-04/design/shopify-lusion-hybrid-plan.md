---
title: Shopify × Lusion ハイブリッド build 計画
date: 2026-05-24
updated: 2026-05-24
status: draft
tags: [design, build-plan, shopify, lusion, hybrid]
revision: v1
source:
  - https://www.shopify.com/enterprise (Phase A trace, playwright)
  - https://lusion.co/ (Phase B trace, playwright)
---

# Shopify × Lusion ハイブリッド build 計画

> 失敗した螺旋 3D を捨て、**Shopify Enterprise の構造**（layout / 配置 / 情報設計）に **Lusion の motion DNA**（WebGL hero + letter mask reveal + cursor canvas）を被せる。
> Claude の capability ceiling 内で再現可能な要素のみ採用。

---

## Phase A — Shopify Enterprise 抽出結果

### A-1. Section 順 と layout pattern

```
┌─────────────────────────────────────────────────────────────────┐
│ NAV  Logo  |  Solutions ▾  Customers ▾  Resources ▾  Devs ▾ │ CTA │  fixed top, dark bg
└─────────────────────────────────────────────────────────────────┘
┌─ HERO (#1F281E dark green, padding 212/204) ─────────────────────┐
│  eyebrow h1 16px (上付き label)                                   │
│  H2 68px / line 76 / -1.36 letter / weight 400  ← 主タイトル       │
│  body p 24px                                                      │
│  [Primary CTA white bg] [Secondary text link]                     │
│  ┌── customer logo row (horizontal scroll loop) ───────────────┐  │
│  │ Dollar Shave Club  Everlane  Glossier  JB Hi-Fi ...         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌── slide carousel: report cards (4 slides + arrows) ─────────┐  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
┌─ SOLUTIONS (#FFFFF6 cream, padding 128) ─────────────────────────┐
│  eyebrow "SOLUÇÕES" │ tag "Uma plataforma única..." │ body        │
│  ── 3 card grid (B2C / B2B / Retail) ── 各 card に矢印 link        │
└──────────────────────────────────────────────────────────────────┘
┌─ ADVANTAGES (#171E16 darker, full bleed) ────────────────────────┐
│  eyebrow │ tag │ body                                             │
│  ── 6 cell bento grid (3×2): innovate / revenue / perf / flex... ─│
│  ── stats row 3 列: $1.4B R&D / millions of merchants / engineers │
└──────────────────────────────────────────────────────────────────┘
┌─ ARCHITECTURE (#FFFFF6 cream, padding 128/64) ───────────────────┐
│  eyebrow │ tag │ body                                             │
│  ── 2 column: Opcionalidade / Composabilidade + link             │
└──────────────────────────────────────────────────────────────────┘
┌─ WHY US (#FFFFF6 cream, padding 128/64) ─────────────────────────┐
│  eyebrow "POR QUE A SHOPIFY" │ tag │ body                         │
│  ── 3 column reasons (innovation / scale / efficiency)            │
│  ── full bleed image + 3 capability + 3 stat callouts             │
└──────────────────────────────────────────────────────────────────┘
┌─ PARTNERS (cream) ───────────────────────────────────────────────┐
│  eyebrow │ tag │ body                                             │
│  ── 2 column: Service partners / Tech partners                    │
│  ── horizontal scroll partner logo wall (Deloitte / IBM / KPMG…)  │
└──────────────────────────────────────────────────────────────────┘
┌─ CONTACT CTA (#1F281E dark, full bleed) ─────────────────────────┐
│  H2 large │ body │ [Primary CTA] [Secondary]                      │
└──────────────────────────────────────────────────────────────────┘
┌─ FOOTER (dark) — 5 column link grid + region switcher + social ──┐
└──────────────────────────────────────────────────────────────────┘
```

### A-2. Typography（実測値）

| 役割 | Family | Size | Weight | Line | Letter | Color |
|---|---|---|---|---|---|---|
| Eyebrow h1 | Inter | 16 | 500 | 16 | -0.16 | #F0FBCC（淡黄緑 on dark） |
| Display h2 | Faktum | **68** | 400 | 76 | -1.36 | #FFFFFF |
| Section h2 | Faktum | 14 | 500（uppercase） | — | — | dark on cream |
| Body p | Faktum | 24 | 400 | 32 | -0.48 | #FFFFFF / dark |
| CTA | Faktum | 16 | 500 | 24 | — | #171E16 on #FFF |

Andes 側: 既に決定済の Söhne / Inter / NCT Söhne mono 系で代替（`docs/04_brand.md`）。

### A-3. Color tokens（実測）

```
dark-primary     #1F281E   hero / contact CTA
dark-deep        #171E16   advantages section
cream-base       #FFFFF6   solutions / why us / partners
lime-accent      #F0FBCC   eyebrow label on dark
white-pure       #FFFFFF   text on dark
```

Andes 翻案: Andes は **紺基調** (`docs/04_brand.md` v2.1)。`dark-primary` → Andes 紺 #0A1428、`cream-base` → 既存 cream、`lime-accent` → 赤 pin point #D72A2A。

### A-4. Motion / scroll signal

- **背景動画**: Hero に webm autoplay/loop/muted (1425×1356)
- **scroll-snap**: あり（section 単位）
- **logo row**: horizontal infinite scroll (2 set 複製で seamless loop)
- **carousel**: prev / next / play 制御付き、4 slide 自動切替
- **GSAP / Lenis なし** — pure CSS scroll-snap + IntersectionObserver + WAAPI で実装可能

### A-5. Nav 構造

```
fixed top, dark bg, padding 8px。
[Logo] [Solutions ▾] [Customers ▾] [Resources ▾] [Developers ▾]  ──   [Trial] [Contact]
section anchor: #contact-sales へ smooth scroll
```

---

## Phase B — Lusion 抽出結果

### B-1. WebGL 配置

```
canvas#0  1440×900 fixed background (hero と Featured Work で背景演出)
canvas#1   45×45  cursor follower (custom cursor with draw / morph)
canvas#2 1442×902 off-screen (恐らく postprocess 用 FBO)
```

`THREE` / `gsap` global は **隠蔽**（モジュール化）。だが canvas 構成と挙動から: Three.js + r3f + 自作 cursor + custom shader（distortion / noise / iridescence）と推測。

### B-2. Scroll で起きる animation 全リスト

| Trigger | 演出 |
|---|---|
| page 全体 | smooth scroll (慣性 hijack)、`window.scrollY` 0 のまま canvas 内 scroll lerp |
| Hero | H1 letter-by-letter mask reveal、Aeonik 36px、weight 400 |
| 走り文字 | section 名「CONCEPT • WEB • DESIGN…」が track 上を流れる、文字毎 2 重 (top / bottom mask split) |
| Featured Work | 各作品 thumbnail = `WEB • DESIGN…` メタ行 + 文字 stack 2 重 reveal、hover で 3D distortion |
| 「Let's work together」CTA | 全文字 2 重で stagger reveal（split top/bottom letter） |
| footer 直前 | 「KEEP SCROLLING TO LEARN MORE」次 page hint |

文字 stack pattern (全 letter で 2 つの duplicate を持つ) = **clip-path mask の split reveal**:

```
<span class="char">
  <span class="char-top">L</span>    ← y: -100% → 0
  <span class="char-bot">L</span>    ← y: 0      → 100%
</span>
```

### B-3. Cursor canvas

- 45×45 fixed canvas、`pointer-events: none`
- hover で半径拡張、click で粒子 burst（推測）
- 簡易版: requestAnimationFrame で 円描画 + trail（既存 `CursorTrailClaude.tsx` を再利用可）

### B-4. Motion philosophy

| 動くもの | 動かないもの |
|---|---|
| 文字 reveal（letter mask split） | section padding / grid そのもの |
| 背景 canvas（subtle distortion / particle） | typography size（scale しない） |
| cursor canvas | logo / nav |
| 走り marquee | CTA button shape |
| hover 3D thumbnail | body text |

**原則**: layout は静、motion は letter と背景のみ。これが Lusion の品位の source。

---

## Phase C — Andes 用 build 計画

### C-1. ページ構造（Shopify 構造 × Andes content）

```
┌─ NAV (fixed, navy bg) ───────────────────────────────────────────┐
│ Andes │ Businesses ▾  About  Careers  Press │ [Contact CTA]      │
└──────────────────────────────────────────────────────────────────┘

┌─ HERO #1 (navy #0A1428, full viewport, padding 212/204) ─────────┐
│  [WebGL canvas 背景: Brazil 衛星地形 + subtle noise distortion]    │
│  eyebrow 16px:   「ANDES INC.」                                    │
│  H2 68px:        「Agentic Commerce のための                       │
│                   LATAM infrastructure。」                          │
│  body 24px:      「中南米 $1T 経済圏の基盤を、Andes が建てる。」   │
│  [Contact 白 CTA] [Investor deck テキスト link]                    │
│  ── 信頼 logo row（後で差替: KOTRA / IVS / etc）──                │
└──────────────────────────────────────────────────────────────────┘

┌─ #2 BUSINESSES (cream #FFFFF6, padding 128) ──────────────────────┐
│  eyebrow「ANDES の AGENTIC COMMERCE 実装」                         │
│  tag「2 層構造で LATAM を再設計する」                              │
│  body 説明                                                         │
│  ── 3 card grid: J-Planet / J-Vita / LATAM AC Protocol ─          │
│   各 card: title / Layer ① or ② tag / 短説明 / 矢印 link            │
└──────────────────────────────────────────────────────────────────┘

┌─ #3 J-PLANET deep (navy full bleed) ──────────────────────────────┐
│  左: Brazil port / São Paulo cinematic photo                       │
│  右: 「J-Planet — seller 募集中」                                 │
│       body / Phase 1 説明 / [Seller 募集 CTA]                      │
│  ── service mock 画面 (WhatsApp UI mockup) ──                    │
└──────────────────────────────────────────────────────────────────┘

┌─ #4 J-VITA deep (cream) ──────────────────────────────────────────┐
│  左: 医療品紹介 copy                                               │
│  右: 製品 mock screen                                              │
│  ── 4 cell bento: GLP-1 / 育毛 / ホルモン / ダイエット ──        │
└──────────────────────────────────────────────────────────────────┘

┌─ #5 LATAM AC PROTOCOL (navy, full bleed) ─────────────────────────┐
│  eyebrow「2028 北極星 → サイト copy では『目標』」                 │
│  H2「LATAM Agentic Commerce Protocol」                            │
│  ── 4 phase timeline: 2026-06 → 2027 → 2028 → 2029 ──            │
│  ── 各 phase に Brazil context image (Rio / Amazon 等) ──        │
└──────────────────────────────────────────────────────────────────┘

┌─ #6 COMPANY (cream, padding 128) ─────────────────────────────────┐
│  eyebrow「ABOUT ANDES」                                            │
│  tag「東京 × サンパウロ、二拠点で建てる」                          │
│  ── 2 column: Andes Inc. (JP) / Andes BR + J-Planet (BR) ──     │
│  ── stats row 3 列: 拠点数 / 言語数 / 設立年 ──                  │
└──────────────────────────────────────────────────────────────────┘

┌─ #7 CAREERS (navy) ───────────────────────────────────────────────┐
│  eyebrow「JOIN ANDES」                                             │
│  H2「LATAM の Agentic Commerce を建てる engineer 募集」            │
│  ── 3 column: open position summary ──                            │
│  [Careers page CTA]                                                │
└──────────────────────────────────────────────────────────────────┘

┌─ #8 NEWS (cream) ─────────────────────────────────────────────────┐
│  eyebrow「PRESS & NEWS」                                           │
│  ── 3 card grid: 最新 3 件 (IVS 京都登壇 / KOTRA / 等) ──         │
│  [All news →]                                                      │
└──────────────────────────────────────────────────────────────────┘

┌─ #9 CONTACT CTA (navy full bleed) ────────────────────────────────┐
│  H2「Agentic Commerce を一緒に建てる」                             │
│  body                                                               │
│  [Contact CTA] [Investor deck CTA]                                 │
└──────────────────────────────────────────────────────────────────┘

┌─ FOOTER (dark) — 5 col link grid + lang switcher + social ────────┘
```

### C-2. animation 仕様（Lusion DNA を Shopify layout に被せる）

| Section | 動き | 実装 |
|---|---|---|
| Hero 背景 | WebGL 平面に Brazil 衛星 texture + noise distortion + cursor で歪み | r3f `<Plane>` + custom shader、既存 `IridescentCentrepiece.tsx` を base に流用 |
| Hero H2 | letter-by-letter split mask reveal（Lusion 式 top/bot 2 重 span） | `<SplitChar>` component、CSS `transform: translateY` + `transition: 800ms cubic-bezier(.22,1,.36,1)`、stagger 30ms |
| Hero body / CTA | 200ms 遅延で fade-up 24px → 0 | IntersectionObserver + WAAPI |
| Section heading | eyebrow → tag → body の順に 100ms stagger fade-up | 同上、共通 hook `useReveal()` |
| 走り marquee（任意） | businesses 区切りに「AGENTIC COMMERCE • LATAM • INFRASTRUCTURE •」を seamless loop | CSS `@keyframes` + 2 set 複製 |
| Logo row | 信頼 logo 横 infinite scroll | 同 marquee 技法 |
| Card hover | scale 1.0 → 1.02 + box-shadow + 矢印 8px slide | tailwind `transition`、JS 不要 |
| Brazil photo section | 入場時 parallax 8% slow scroll | IntersectionObserver で `transform: translateY` |
| Cursor | navy canvas 上に小円 trail (15px radius)、hover で 30px | 既存 `CursorTrailClaude.tsx` を desktop 限定で適用 |
| Scroll smoothing | 軽い inertia（aggressive hijack はしない） | `SmoothScrollProvider.tsx` 既存を使う、reduced-motion で disable |

**捨てるもの**: 螺旋 3D、SpiralGallery3D、PaintCanvas（過剰）、CinematicCanvasClaude の全画面 webgl 演出。

### C-3. Brazil 写真の配置案

| Section | 画像 | 意図 |
|---|---|---|
| Hero 背景 | Amazon 衛星 / Andes 山脈衛星（暗 navy tinted） | 地理 scale を視覚化 |
| #3 J-Planet | São Paulo 港 / コンテナ / Av. Paulista 夜景 | 物流 / 都市 |
| #4 J-Vita | Rio 海岸 / 健康 lifestyle photo | 消費者 life context |
| #5 Protocol | Brazil 国旗 macro / 地図 line（JP→BR） | プロトコル国境横断 |
| #6 Company | サンパウロ office photo（暫定 stock） | 拠点 reality |
| #9 Contact | favela / 朝焼け（希望 framing） | 長期 vision tone |

**避けるもの**: サッカー / カーニバル（stereotype）。**採用するもの**: 地形 / 都市 / 港 / 衛星（infra tone）。

保存先: `/public/images/brazil/{hero,saopaulo,amazon,coast,protocol,office,morning}.jpg`、各 2400px wide WebP。

### C-4. Service demo mock

| 事業 | mock 形式 | 場所 |
|---|---|---|
| J-Planet | WhatsApp 会話 UI mock（PNG、device frame） | `/public/mock/jplanet-whatsapp.png` |
| J-Vita | 製品 detail / mandato 申込 flow 3 画面 | `/public/mock/jvita-flow.png` |
| AC Protocol | MCP 接続 diagram（SVG component 化） | `<ProtocolDiagram />` in `src/components/sections/` |

**推奨**: 静止 PNG（design tool で作って書き出し）+ device frame。SVG component 化は protocol diagram のみ（インタラクティブ性必要）。

### C-5. 実装 phase 分割（Claude 実行可能順）

| Phase | 範囲 | 想定 commit 数 | risk |
|---|---|---|---|
| **Phase 1** | Hero（navy bg、SplitChar reveal、IntersectionObserver、CTA、logo row marquee）+ nav fixed + footer | 4-6 | 低、layout pure |
| **Phase 2** | Section 2-9 layout（card grid / bento / 2 col / timeline / stats）、placeholder Brazil 画像 | 6-8 | 低、tailwind grid |
| **Phase 3** | WebGL Hero 背景（既存 IridescentCentrepiece を Brazil texture 仕様に改修）、cursor canvas、parallax | 3-4 | 中、shader 部分のみ慎重に |
| **Phase 4** | 走り marquee、card hover polish、reduced-motion 対応、3 言語 copy 整合、画像 LCP 最適化 | 3-5 | 低 |

**禁止**: Phase 1 で WebGL に手を出さない（また pancake する）。layout 完成 → reveal → 最後に 1 枚 shader plane。

### C-6. Brand 整合 check（`docs/04_brand.md` v2.1）

| brand 規範 | 本計画との整合 | 矛盾の翻案 |
|---|---|---|
| 余白・抑制・curated authority | ✅ Shopify 128px section padding を採用 | — |
| 数値断定 + Infrastructure for X 構文 | ✅ Hero H2「Agentic Commerce のための LATAM infrastructure」 | — |
| 紺 + 白 + 赤 pin point | ⚠️ Shopify の dark green #1F281E → Andes 紺 #0A1428 に置換 | tailwind token `andes-navy` を `tailwind.config.ts` に定義 |
| 装飾排除 / geometric sans | ✅ Faktum → Söhne / Inter で代替 | — |
| ブラジル現地写真、map 1 線 | ✅ Brazil photo 各 section に配置、Protocol section に JP→BR map | — |
| 「北極星」外部 NG | ⚠️ #5 Protocol section copy で「目標」「2028 年までに」へ翻案済 | — |
| Agentic Commerce 前面化（7 ルール） | ✅ Hero copy 確定、portfolio 名 = AC 実装、Careers AC 明記、各事業に Layer タグ | — |
| 商社 reference 除外 | ✅ Shopify / Lusion 由来、商社味なし | — |
| Series A 機密数値 public NG | ✅ stats row には拠点・言語・設立年のみ、pre-money / 投資家名は出さない | — |
| Cinematic storytelling pivot（2026-05-22 sir-decided） | ✅ WebGL hero + letter reveal + Brazil photo で cinematic 維持、ただし「動く layout」は廃止 | — |

---

## 参考 file

- `docs/04_brand.md` v2.1 — brand SSOT
- `docs/05_pages-spec.md` v2 — page spec
- `design/storytelling-references.md` — cinematic 参照
- `design/stripe-shopify-patterns.md` — pattern source
- `src/components/cinematic/` — 既存 helper（流用: SmoothScrollProvider / MotionGate / GlassPanel / CursorTrailClaude / IridescentCentrepiece、廃棄: SpiralGallery3D / PaintCanvas）
- `messages/{ja,en,pt-BR}.json` — i18n key

## TODO（sir 確認待ち）

- `[sir-decide]` Brazil photo の調達 source（Unsplash / Pexels / 自社撮影 / 有料 stock）
- `[sir-decide]` service mock の作成者（design tool 自前 vs 外注）
- `[sir-decide]` Phase 1 着手 timing（messages 3 言語の Hero copy 確定後）
