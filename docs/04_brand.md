---
title: ブランド方針 SSOT
date: 2026-05-22
updated: 2026-05-22
status: validated
tags: [brand, design, tone, palette, ssot]
revision: v2（Round 1-4 moodboard 結論を反映）
---

# 04 ブランド方針 SSOT

> サイトの **visual / 言語のトーン source**。配色 / タイポ / レイアウト / motion 原則。
> 4 ラウンドの moodboard 調査（全 35 サイト）→ 3 hybrid 推薦 → 本 doc。
> 詳細根拠は `design/moodboard-references.md`。

> **⚠ 2026-06-02 reset による上書き**: 本 doc の **hero copy** と **数値方針** は `docs/07_homepage-spec.md`（reset 後正典）が上書き。
> - hero H1: 「Agentic Commerce のための LATAM infrastructure。」→ **撤回**。新 H1 =「**中南米に、新しい経済の基盤を建てる。**」（宣言型、infra 名詞は subhead）。
> - 数値: 「5 億人のみ」→ **撤回**。**4 マクロ数字 [verified 2026-05-29]**（6.6億人 / US$7,690億 / 2.1億人 / 1.7億人）。
> - **配色 / typography / motion / a11y は本 doc が有効**（Navy #0F1B3D / Crimson #C8102E pin-point は維持・再確認済 [sir-decided 2026-06-02]）。

---

## 一句で言うと

```
Stripe や Shopify の execution quality で、Agentic Commerce × LATAM を建てる。
```

* base aesthetic     = press.stripe.com（余白・抑制・curated authority）
* infra 言語         = stripe.com（数値断定 + "Infrastructure for X" 構文）
* commerce platform  = shopify.com（ecosystem 包摂、AC 文脈）
* mission framing    = anthropic.com（第一原理 + 長期 vision）
* hero edge          = mistral.ai（"Frontier AI. In your hands." 級の圧縮）
* dark inversion     = modal.com（戦略的反転 + 数値 hero）

> 日本商社系（三井物産 / 三菱商事 / 伊藤忠 等）は **参考軸から除外**（sir-decided 2026-05-22）。
> 「いけてる最先端 startup」の position を取る。商社 gravitas は古すぎ・重すぎ。

---

## ブランドの本質

```
「Andes」= 南米大陸を縦に貫く山脈

  位置のメタファー:
    - 南北米大陸の背骨を成すインフラ
    - 高地から見渡す長期視点
    - 動かない、揺るがない、地殻に根ざす存在感
```

### 3 つの core attribute（refine）

| 属性 | 内容 | 視覚への落とし方 |
|---|---|---|
| **野心 visible** | 2028 LATAM AC Protocol、$1T 経済圏を志向する明確な姿勢 | 大余白、強い type、断定 copy、数値 stack |
| **Engineering precision** | 日本由来の品質 × Stripe / Shopify 級の execution 規律 | 紺 + 白 + 赤 pin point、geometric sans、装飾排除 |
| **LATAM への根差し** | ブラジル現地で動いている事業、空想ではなく現場 | ブラジル現地写真、map 1 線（Japan→BR） |

---

## トーン（言語）

### 全般

* **断定的** > 婉曲的（"We're trying to" ではなく "We build the infrastructure for"）
* **第一原理ベース** > 業界比較ベース（"better than X" ではなく "because of Y"）
* **長期視点** > 短期成果（5 年 / 10 年 / 100 年スパン）
* **数値で語る**（曖昧な形容詞より具体数値）
* **圧縮** > 説明（1 文に圧縮、Mistral 型）

### Agentic Commerce 前面化ルール（2026-05-22 sir-decided）

```
"Agentic Commerce" を site 全体で 前面化:

  ① Hero copy 確定: 「Agentic Commerce のための LATAM infrastructure。」
  ② subhead に "AI エージェント / A to A インフラ" を残す
  ③ Portfolio section 名 = "Andes の Agentic Commerce 実装"
  ④ 各事業 (J-Planet / J-Vita / Protocol) に "Layer ①/②" タグ
  ⑤ About 冒頭で AC framing から入る
  ⑥ Careers hero に "LATAM の Agentic Commerce を建てる" 明記
  ⑦ meta / OG title に "Agentic Commerce for LATAM" 入れる
```

### NG

* "We are passionate about ..."（一般的すぎ）
* "Disruptive" / "Revolutionary"（インフレ語彙）
* "Synergy" / "Stakeholder"（コンサル語彙）
* Andes 内部の言葉そのまま（"中南米の王" / "巨人を逆顧客化" 等は public NG）
* **「北極星」という語自体**（sir-decided 2026-05-22、外部 communication 全面禁止）→「向かう先」「目標」「mission」「vision」「2028 年までに [具体]」に置換
* ローマ字専門用語（reveal / apply / texture / dialogue / summary 等）

### OK

* "Agentic Commerce のための LATAM infrastructure。"
* "AI が売り、AI が買う。"
* "5 億人の生活基盤を、AI エージェントを中心に再設計する。"
* "We're building the commerce infrastructure of Latin America."
* "Operate the system before you protocol it."

> 言語ごとの実 copy は `docs/05_pages-spec.md` で具体化。

---

## 配色（v2、validated）

### 比率 [verified]

```
白 60%  /  紺 25%  /  grey 12%  /  赤 3%
```

Stripe / Shopify と同じ「白 dominant + 紺 accent」型。Andes own slide の紺赤 brand color
は維持しつつ、layout 比率は tech infra startup の主流に合わせる。
紺は **hero 背景 / header / footer / dark inversion section** に集中、本文 area は白基調。

### Primary

```
┌──────────────────┬─────────┬────────────────────────────────────┐
│ Andes Navy       │ #0F1B3D │ hero 背景 / 強面 / CTA / 紺基調全般 │
│                  │         │ ＊深い夜の紺、北極の空・山脈の影     │
├──────────────────┼─────────┼────────────────────────────────────┤
│ Andes Paper      │ #FAFAF7 │ 背景基調 / 余白                     │
│                  │         │ ＊紙の質感、pure #fff を避ける       │
├──────────────────┼─────────┼────────────────────────────────────┤
│ Andes Ink        │ #0A0A0A │ 本文文字                            │
│                  │         │ ＊pure black を避けた濃黒            │
└──────────────────┴─────────┴────────────────────────────────────┘
```

### Accent

```
┌──────────────────┬─────────┬────────────────────────────────────┐
│ Andes Crimson    │ #C8102E │ logo + 重要数値 + hover glow + CTA │
│                  │         │ ＊slide 山 motif logo の赤、三菱赤系  │
└──────────────────┴─────────┴────────────────────────────────────┘
```

### Gray scale

```
┌──────────┬─────────┐
│ Gray 50  │ #F5F4F0 │ subtle 背景
│ Gray 100 │ #E8E6E0 │ divider / 細 border
│ Gray 300 │ #B8B5AC │ disabled / muted
│ Gray 500 │ #6E6B65 │ secondary text
│ Gray 700 │ #3D3B36 │ caption / icon stroke
│ Gray 900 │ #1A1917 │ near-black text 補助
└──────────┴─────────┘
```

### 廃止

旧 Cobre `#B85C28`、旧 Sky `#4A6FA5` は **廃止**（slide 紺赤 palette と矛盾）。

### 配色原則

* base = **モノクロ + 1 アクセント**（Crimson）
* グラデーション禁止（フラット維持）
* 赤 `#C8102E` は **pin point 使用**（CTA / hover glow / 重要数値 / logo のみ）。本文に使わない
* 写真 / 動画が色を持ち込むので、UI 自体は紺 + 白 + grey で抑制

---

## Light × Dark inversion 戦略 [verified]

```
┌────────────────────────────────────────────────────────────────┐
│ Light dominant base                                             │
│   全 page → 紙の感触（Andes Paper #FAFAF7）+ Ink + Navy accent  │
│   → 商社 / 投資家 / press 信頼の根                                │
├────────────────────────────────────────────────────────────────┤
│ Dark inversion（戦略的反転）                                     │
│   Businesses / Careers の 2 page のみ → Navy 背景 + Paper 文字   │
│   → AI startup の sharpness を打ち出す surface                  │
│   model = modal.com                                              │
└────────────────────────────────────────────────────────────────┘
```

### Dark inversion palette

```
┌──────────────────┬─────────┬────────────────────────────────────┐
│ Dark BG          │ #0F1B3D │ Navy 背景                          │
│ Dark BG Deeper   │ #060B1F │ Navy の暗側 grade                  │
│ Dark Text        │ #FAFAF7 │ Paper を反転                       │
│ Dark Subtle      │ #4A5066 │ secondary text                     │
│ Dark Crimson     │ #E83E5C │ glow 強化版、hover で明るく光らせる │
└──────────────────┴─────────┴────────────────────────────────────┘
```

### Page 配分

| Page | Theme | 理由 |
|---|---|---|
| Top | Light | 第一印象は商社 gravitas |
| About | Light | 長期 vision、IR 信頼 |
| Businesses | **Dark inversion** | 事業の "AI startup" 性を打ち出す |
| Careers | **Dark inversion** | Engineer 採用 = AI startup tone |
| Press | Light | media 露出は信頼 base |
| Contact | Light | form は誤操作回避で light |

---

## タイポ（refine）

### Display / Heading

| 言語 | 候補 1 | 候補 2 | 用途 |
|---|---|---|---|
| 英数 | **Geist** | Söhne / Inter Display | 圧縮 hero、見出し |
| 日本語 | **Noto Sans JP Bold (W7)** | Hiragino Sans W7 | section heading（重み出し） |

### Body

| 言語 | 候補 1 | 候補 2 |
|---|---|---|
| 英数 | **Inter** | IBM Plex Sans |
| 日本語 | **Noto Sans JP** | Hiragino Sans |

### 棲み分け原則

```
全 言語 / 全 hierarchy   →  Geometric sans で統一
英数                      →  Geist or Inter
日本語                    →  Noto Sans JP（heading は Bold、body は Regular）

→ Stripe / Shopify と同じ「全 sans」思想。
→ 商社的 Mincho 表現は使わない（重すぎ・古すぎ）。
```

### サイズ階層（rem）

```
Display L   4.5rem (72px)    Hero タイトル
Display M   3.5rem (56px)    Section タイトル
H1          2.5rem (40px)
H2          2rem   (32px)
H3          1.5rem (24px)
Body L      1.125rem (18px)  本文
Body M      1rem   (16px)    既定
Caption     0.875rem (14px)  数値 / tag
```

### Type rule

* Display は letter-spacing 引き締め（-0.02em〜-0.04em）
* Body line-height 1.65（読みやすさ優先）
* 日本語 `font-feature-settings: "palt"` でアキ調整
* 数値（5 億人 等）は **Tabular figures**、Display L で表示

---

## 7 つの edge 要素（Round 4 結論）

slide の商社 gravitas に対して、site では下記 7 要素で「最先端 startup」を被せる:

```
① hero subhead を 1 文に圧縮             ← Mistral
② 「5 億人」を subtitle で前面化（単一数値） ← sir-decided 2026-05-22
   ※ 当初 5 値 stack（SKU 1,700 / PRC 唯一 / 24 ヶ月先行 / 3 言語 等）を
     hero 直下に置く案だったが廃止。subtitle 内の「5 億人の生活基盤」のみで担う。
③ hero 右側に 2 層構造図を line animate   ← Cursor / Cognition
   静止 → load 時に 1 度線が描かれる
④ subhead で巨人名（OpenAI / Claude）出し
   逆顧客化 position を暗示              ← Mistral 主権 framing
⑤ light dominant + Businesses / Careers
   のみ dark inversion                   ← modal.com
⑥ Crimson 3% を pin point                ← 三菱商事 比率
   CTA / hover glow / 重要数値のみ
⑦ About 冒頭 1 行宣言 → 図 → 詳細         ← Cognition / Anthropic
```

---

## レイアウト原則

### グリッド

* 12 column / max-width `1280px` / gutter `24px`
* Section padding 縦 `120px`（desktop） / `80px`（tablet） / `64px`（mobile）
* 余白を恐れない

### Hero

```
┌───────────────────────────────────────────────────────────────┐
│ Hero（viewport 80vh）                                          │
│                                                                │
│  Agentic Commerce のための                  ┌──────────────┐  │
│  LATAM infrastructure。                     │              │  │
│                                             │ 2 層構造図   │  │
│  5 億人の生活基盤を、                       │ Japan → BR   │  │
│  AI エージェントを中心に再設計する。         │ map 1 線     │  │
│                                             │ line animate │  │
│  [事業を見る →]  [Andes について →]         │              │  │
│                                             └──────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

* text 左、図 / map 右
* CTA は控えめ（投資家 / 事業 link 程度）
* 数値 stack を hero 直下に横並び（Modal model）

### Section

* 1 section = 1 message（詰め込まない）
* 必ず 見出し + 1 段落 + 図 or リスト
* 図優先（CLAUDE.md 絶対ルール）— 表 / mermaid / ASCII を SVG で起こす

### Footer

* 4 column（事業 / 会社 / 採用 / 法務）
* 法務 link: プライバシーポリシー / 利用規約 / Cookie
* 言語 switcher は header / footer 両方

---

## アニメーション

> motion の実装正典は **docs/07 §4 ＋ `design/motion-kit/`**（reset 2026-06-04 後に更新）。本節は brand 規律として有効。

### 原則

* **動かしすぎない**。動く"主役"は最大 3 section（hero / 数字 / 2 層）。**1 画面 1 主役**。hover と入場 Reveal は主役にカウントしない
* スタック: **Motion（`motion/react`）一本**（GSAP/Lenis/Three は不使用）。reveal=variants+`whileInView`、scroll連動=`useScroll`+`useTransform`、線=`motion.path`の`pathLength`、数字=`useSpring`/`@number-flow/react`
* duration 300-600ms（count / line のみ ~1.2s 上限）、easing は唯一の token `cubic-bezier(0.16, 1, 0.3, 1)`
* `prefers-reduced-motion` 必達 — 全 effect が静的終端へスナップ
* アニメは `transform` / `opacity` 限定（layout/paint を起こさない）。hero を LCP にしない

### OK

* Hero text の staggered reveal（once）
* Hero / §3 / §5 の line・node draw（once・関係を理解させる機能的 motion）
* §2 数字の count（in-view・once）／ §3 2 層の順次 reveal（scroll once）
* Card hover で 4px 上昇 + subtle shadow ／ Crimson glow on hover ／ 言語 switcher slide
* **スクロール連動（once 原則）** — Motion の `whileInView`（once）/ `useScroll` で section を順に立ち上げる

### NG

* 自動 carousel / 常時ループ
* 過剰な parallax（全面）／ スクロール **スクラブの演出過多**（once でない派手 scrub）
* カーソル追従要素 / BGM・音
* 背景の動く gradient 全面 / 3D 人間・orb / Aceternity aurora / v0 生出力

---

## 画像 / 写真 / map

### 写真選定

* ブラジル現地で撮影 or 日本らしさが伝わるもの（三井物産 model）
* 大地・山脈・建造物の **wide landscape** を優先
* stock photo の典型「笑顔の office worker」NG
* 商品写真は J-Planet catalog から流用 OK（ライセンス確認済）
* AI 生成画像は使わない（authenticity 重視）

### Map（Hero 右側）

```
Japan ─────────── Brazil
   Tokyo  arc  São Paulo

仕様:
  - SVG 1 線のみ、DHL の全世界 map を簡略化
  - line 描画 animate（once、1200ms）
  - 紺背景 + 白 line + Crimson dot 2 点（端点）
  - 物理 globe は使わない（フラット投影）
```

### 画像形式

* 全画像 `next/image` 経由
* AVIF / WebP fallback
* `alt` 必須、装飾画像は `alt=""`
* og:image は各 page 固有、locale ごと

---

## ロゴ（slide 反映、要 sir 最終承認）

### Slide「事業概要」からの推定

```
┌──────────────────────────────┐
│   山 motif（赤、Crimson）       │
│   + 人形 silhouette             │
│   + "Andes Inc." 黒太            │
└──────────────────────────────┘
```

### 暫定方針

* slide の logo を **正式 logo として採用**（要 sir 承認、SVG 化必要）
* monochrome basic + Crimson accent 版を用意
* dark inversion 用に Paper 色版も必要

### 仕様 [TODO sir-decide]

* `public/logo.svg`（color, dark, mono の 3 variant）
* favicon / apple-touch-icon 生成
* social card 用 1200×630 OG image template

---

## Page 別 採用 mapping（tech infra 軸、商社抜き）

```
Top hero       Stripe palette ratio + Mistral 圧縮 hero + Stripe 数値 stack
               + DHL 簡略 map（Japan→BR 1 線）+ Cursor / Cognition line animate

About vision   Anthropic mission framing + press.stripe.com 抑制 voice
About 2 層      Stripe Solutions / Products の構造 + Shopify ecosystem 包摂 framing
About Phase     Anthropic timeline + Stripe Press の長期 narrative
About Team     Mercury / Linear の minimal card

Businesses     dark inversion + Modal 数値 hero + Shopify ecosystem grouping
               + Stripe Solutions 構造（5 領域 icon grid）
J-Planet sec   Layer ① tag + 数値 + WhatsApp 体験 demo embed
J-Vita sec     Layer ① tag（医療）+ Phase 0a 数値
Protocol sec   Layer ② endgame + 2028 timeline + 概念図 + Anthropic Research 風 framing

Careers        dark inversion + Linear sharpness + Mistral 主権 framing
               + Cursor の "Claude Code Native engineer" 訴求

Press          press.stripe.com 抑制 list 構造

Contact        Mercury / Linear minimal + 4 窓口 card + form 単一

Header         Stripe 3 層 nav 構造
Footer         Stripe / Shopify の 4 column 構造、bilingual switcher
Typography     全 sans 統一（Geist / Inter / Noto Sans JP）
Palette        白 60 / 紺 25 / grey 12 / 赤 3
Motion         静的 base + hover / hero line draw / number rise のみ subtle
```

### 商社 references を外した理由

sir-decided 2026-05-22: 「三井物産とか微妙じゃない？参考にするべきはショッピファイとストライプとかそういう系」。
moodboard Round 2/3（sequoia / a16z / mitsui / 三菱商事 / NYK / 双日 等）は研究記録としては
`design/moodboard-references.md` に残すが、本 SSOT の採用 mapping からは除外。

---

## アクセシビリティ

* WCAG 2.2 AA 必達
* color contrast: 通常文字 4.5:1、大文字 3:1
* dark inversion section も同基準（Paper #FAFAF7 on Navy #0F1B3D = 14.2:1、十分）
* 全 interactive 要素に focus indicator
* skip link / aria-label 適切に
* screen reader テスト（VoiceOver / NVDA）
* keyboard 操作のみで全 page 遷移可能
* `prefers-reduced-motion` 必達対応（hero line animate 無効化）

---

## SEO / OG

| 要素 | 仕様 |
|---|---|
| title | `{Page Title} \| Andes — Agentic Commerce for LATAM` 形式、各 page 固有 |
| description | 155 字以内、各 page 固有、AC framing |
| og:image | 1200×630、各 page 固有、locale ごと、紺背景 + 白 type + Crimson dot |
| og:type | website（default）、article（press の場合） |
| twitter:card | summary_large_image |
| canonical | `https://andes.global/{locale}/{path}`（hreflang 全 locale） |

---

## 確定事項（sir-decided 2026-05-22、全 8 件 lock）

* [x] ドメイン = **andes.global**
* [x] 紺 hex = **#0F1B3D**
* [x] 赤 hex = **#C8102E**
* [x] Font: **Geist**（display）+ **Inter**（body）+ **Noto Sans JP**（日本語）
* [x] 日本語 heading: **Noto Sans JP Bold (W7)**（全 sans 路線）
* [x] Logo SVG: slide からトレース、実装時 placeholder OK（後追いで `public/logo.svg` 差し替え）
* [x] 写真 source: 実装時 placeholder OK（後追いでブラジル現地 / 既存 asset 差し替え）
* [x] 数値 stack: 「5 億人」のみ採用、他 4 つ（1,700 / 唯一 / 24 ヶ月 / 3 言語）廃止
* [x] Email alias: ir@ / careers@ / press@ / partners@ / hello@ all `@andes.global`

---

## 改訂履歴

| date | rev | 要点 |
|---|---|---|
| 2026-05-22 | v1 | 初版（hypothesis）、Cobre + Sky accent |
| 2026-05-22 | v2 | Round 1-4 moodboard 結論を反映、紺赤 palette + dark inversion + 7 edge 要素を統合 |
| 2026-05-22 | v2.1 | sir feedback「Shopify / Stripe 系で」反映、商社 reference 全除外、白 dominant ratio へ、全 sans 統一（本版） |
