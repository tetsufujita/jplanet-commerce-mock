---
title: Stripe / Shopify deep pattern trace
purpose: Andes corporate site design参考軸抽出（sir-decided 2026-05-22 商社NG → Stripe/Shopify系のみ）
sources: playwright 直接観測 2026-05-22
status: verified（computed style 取得）
---

# Stripe / Shopify pattern trace

## 観測サマリー

| Site | 目視結論 | 一言で |
|---|---|---|
| Stripe | 白 dominant、紺/紫、軽量 sans、密度高い、密な情報設計 | "infrastructure for serious people" |
| Shopify | 黒 dominant、ネオン緑 accent、超大型 h1、編集デザイン色 | "brand for ambition" |

**取得不能ページ:**

- `stripe.com/about` / `stripe.com/en-br/about` → home へ redirect（独立 about page を Stripe は廃止）
- `stripe.com/jobs` → 表層のみ、実際の listing は別 subdomain（`stripe.com/jobs/listing/...` 形式）

その他 8 page は computed style 取得済み。

---

## 1. Hero pattern

| Dim | Stripe (home) | Shopify (home) |
|---|---|---|
| composition | 左 text / 右 visual（小さな customer logo carousel + animated card） | 中央寄り、上 text / 下 visual（動画 + animation 背景） |
| copy structure | 2 文（tagline `Financial infrastructure to grow your revenue.` + sub 1 文） | 2 行 stacked（短い断片で韻を踏む） |
| visual | 抽象 animated card / 浮く UI mock | 動画 + 大 gradient + product mockup |
| CTA 数 | 2（"Get started" purple solid + "Sign up with Google" outline） | 1 + 1（"Comece gratuitamente" white pill + secondary link） |
| 高さ | ~viewport 強（hero region 約 700-800px / 900 viewport） | ~viewport 強、巨大 h1 で占有 |

**Andes 移植案:** Stripe 型 hero（左 copy / 右 visual、2 CTA: primary `お問い合わせ` 紺 + secondary `事業を見る` outline）。Shopify 型超大型 h1 は brand 力依存で初期 site には不向き。

```
[Stripe hero]
┌──────────────────────────────────────────┐
│ nav                                       │
├──────────────────────────────────────────┤
│                                           │
│ tag-meta (小)            ┌─────────────┐  │
│ H1 48px / w300 / -0.96   │ animated    │  │
│ "Financial infra-        │ card        │  │
│  structure to grow…"     │ (UI mock)   │  │
│                          │             │  │
│ subhead 1 文              └─────────────┘  │
│ [Get started] [Sign up Google]           │
│                                           │
├──────────────────────────────────────────┤
│ customer logo row (横 scroll)             │
└──────────────────────────────────────────┘

[Shopify hero]
┌──────────────────────────────────────────┐
│ nav (透明 over hero)                       │
├──────────────────────────────────────────┤
│                                           │
│        H1 96px / w400 / lh100%             │
│        "Your future can be                 │
│         Highlighted by AI"                 │
│                                           │
│        [Comece gratuitamente] pill         │
│                                           │
│   ┌──────────────────────────────────┐    │
│   │   video / motion artwork         │    │
│   │   (full-width)                   │    │
│   └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

---

## 2. Nav pattern

| Dim | Stripe | Shopify |
|---|---|---|
| 構造 | flat 5 items + mega-menu hover dropdown | flat 5 items + mega-menu hover dropdown |
| nav 高さ | 76px | 72px |
| sticky | `position: relative`（home 上で非 sticky、scroll で固定する子 nav は別） | `position: sticky`（hero 上で透明、scroll で白へ swap） |
| 背景 | 透明 → 白 swap | 透明 → 白 swap（dark theme page では透明維持） |
| 右側 | "Sign in" + "Contact sales" (filled) | "Login" + "Start free trial" pill |
| mobile | hamburger 全画面 overlay | hamburger 全画面 overlay |

**Andes 移植案:** Shopify 型 sticky + 透明→白 swap。右側は `お問い合わせ`（filled、紺）一発、`Sign in` 不要。nav 高さ 72px。

```
[共通 nav 構造]
┌──────────────────────────────────────────────────┐
│ [logo]  Products▾  Solutions▾  …▾  Pricing       │
│                                  [Sign in] [CTA] │
└──────────────────────────────────────────────────┘

[Andes 移植]
┌──────────────────────────────────────────────────┐
│ [Andes]  事業  会社  採用  プレス  ──  [お問い合わせ] │
└──────────────────────────────────────────────────┘
```

---

## 3. Section transition

| Dim | Stripe | Shopify |
|---|---|---|
| section 間境界 | divider 線なし、余白 + 背景 swap | divider 線なし、background swap が劇的 |
| bg pattern | 白 → 白 → 白 → ネイビー (#0d1738) → 白 の sandwich | 黒 → 白 → 黒 の alternating |
| vertical rhythm | section 間 padding `64-128px`、内部 grid gap `24-48px` | section 間 padding `120-180px`（よりゆったり） |
| scroll-triggered animation | あり（card slide-in、stats count-up） | あり（large text scroll-revealed、video autoplay on view） |
| doc 高さ | 14642px（16+ viewport） | 11046px（12+ viewport） |

**Andes 移植案:** Stripe 型 sandwich（白 dominant + 中盤に紺 1 section）。Shopify 型 alternating dark/light は brand 力が弱いと chaos に見える。

---

## 4. Card / grid pattern

| Dim | Stripe | Shopify |
|---|---|---|
| card 構造 | icon (16-24px) + heading + 1-2 行 desc + arrow link | image/illust 大 + 1 行 title + sub |
| column 数 | 3 / 4 / variable（mega-menu は 4-5 col） | 3 / variable |
| gap | 24-48px | 32-64px |
| card 背景 | 透明 or 薄 grey `#f6f9fc` | 黒 page 上で transparent / 白 page 上で 薄 grey |
| hover | underline + arrow nudge、card lift なし | image zoom + text underline |
| radius | 4-8px | 8-16px or pill |

**Andes 移植案:** Stripe 型（icon + heading + 1 行 desc + arrow link）3 col。J-Planet / J-Vita / LATAM AC Protocol の 3 事業を card grid で。

---

## 5. Typography

| Dim | Stripe | Shopify |
|---|---|---|
| font family | `sohne-var, SF Pro Display, sans-serif` (custom) | `NeueHaasGrotesk, Helvetica, Arial`（home）/ `Inter-Variable`（news 系）/ `Courier New` mono（careers） |
| h1 size | 48px | 96px（home）/ 64px（article）/ 48px mono（careers） |
| h1 weight | **300**（light） | 400 |
| h1 line-height | 55.2px（=1.15） | 96px（=1.0、超 tight） |
| h1 letter-spacing | -0.96px（-2%、tight） | normal or +2.4px |
| h2 | 32px / w300 / -0.64 | 56-96px / w330 |
| body | 16px / 通常 weight | 16px |
| 特徴 | **軽量 weight + tight letter-spacing** が brand 印象を決める | **超大型 + ほぼ default weight** で immersive |

**Andes 移植案:** Stripe 型を base に、日本語向けに調整。
- h1: 48-56px / weight 300 / letter-spacing -0.02em
- 日本語 font: `Inter` + `Noto Sans JP` weight 300/500
- 数字部分（"$1T" "2028"）のみ tabular-nums + weight 400 で強調

---

## 6. Color usage（実測 hex）

### Stripe palette

| 役割 | hex | 用途 |
|---|---|---|
| 基本テキスト | `#061b31` | body / heading（深紺） |
| 主背景 | `#ffffff` | hero / section 大半 |
| 強調背景 | `#0d1738` | 中盤 1 section（dark navy） |
| primary CTA | `#533afd` | "Get started" 紫 |
| accent gradient | `#0000ff / #6474ff / #B9B9F9` | hero animated card 内 |
| muted text | `#64748d` | sub copy |
| 比率（観測） | 白 60-65 / navy 25 / purple 6 / grey 4 | — |

### Shopify palette

| 役割 | hex | 用途 |
|---|---|---|
| 基本背景 | `#000000` | home / news 大半 |
| 反転背景 | `#ffffff` | careers / about 一部 |
| accent | `#36F4A4` (neon green) | underline / icon / micro accent |
| accent 2 | `#1338BF` (royal blue) | careers page 主 accent |
| muted | `#a1a1aa` | sub text |
| 比率 | 黒 50 / 白 40 / green 5 / blue 5 | — |

**Andes 移植案:** brand v2.1 に整合する Stripe 寄り配色（白 60 / 紺 25 / grey 12 / 赤 3）を維持。Stripe の purple は使わず、accent を red `#dc2626` 系へ置換。

```
[色面積比較]
Stripe   ████████████████████████░░░░░░░░░░░░  60% white
         ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░  25% navy
         ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   6% purple
         ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   4% grey

Shopify  ████████████████████░░░░░░░░░░░░░░░░  50% black
         ████████████████░░░░░░░░░░░░░░░░░░░░  40% white
         ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5% neon green
         ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5% royal blue

Andes 案 ████████████████████████░░░░░░░░░░░░  60% white
         ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░  25% navy #0e1a3a
         █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  12% grey #6b7280
         █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   3% red  #dc2626
```

---

## 7. Motion

| Dim | Stripe | Shopify |
|---|---|---|
| hero | 浮く card / gradient drift（autoplay） | hero video autoplay loop |
| scroll-triggered | stats count-up、card slide-in（subtle、距離 8-16px） | text reveal、image zoom-in、parallax 軽 |
| hover | CTA: 背景 darken + 1px lift / link: underline draw | image scale 1.02-1.05、underline draw |
| duration | 200-400ms | 300-600ms |
| easing | `cubic-bezier(.42,0,.58,1)` 系 default | より長い custom easing |
| load | fade-in stagger 25-50ms | hero immediate、下層は scroll で reveal |

**Andes 移植案:** Stripe 型 subtle motion。`framer-motion` `whileInView` + `transition={{duration: 0.3}}`。distance 16px の slide-in、stats count-up 用に `@react-spring/web` か手書き。

---

## 8. Number display

| Dim | Stripe | Shopify |
|---|---|---|
| 表示位置 | hero 上部 meta line（"Global GDP running on Stripe: 1.65%"）small / 中盤 section に大数字 | 通常本文と同程度の size、ただし image overlay 内に大きく表示するパターンあり |
| 数字 typography | tabular-nums、weight 300-425、color 通常テキストと同等 | weight 330-400、大型でも muted |
| 周囲 layout | 1 数字 1 row、label を上、value を下、3-4 列で並べる | 段落内に inline で混ぜる |
| 動き | scroll-in で count-up | 無し or subtle reveal |

**Andes 移植案:** Stripe 型 stats row（`$6T` LATAM GDP / `1,700` SKU / `2028` AC Protocol / `2026.06` Phase 1 launch）。tabular-nums + count-up。

```
[Stats row 移植]
┌─────────┬─────────┬─────────┬─────────┐
│  $6T    │  1,700  │  2028   │ 2026.06 │
│ LATAM   │  SKU    │ Protocol│ Phase 1 │
│  GDP    │ catalog │ release │  launch │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 9. CTA pattern

| Dim | Stripe primary | Shopify primary |
|---|---|---|
| bg | `#533afd` (purple) | `#ffffff` on dark / `#000000` on light |
| color | white | inverse |
| radius | **4px**（rectangular feel） | **9999px** (full pill) |
| padding | `15.5px 24px` | `8-12px 20-24px` |
| weight | 400 | 550 |
| hover | bg darken + 1px lift | bg invert |
| size scale | medium（target 触りやすい） | small-medium（compact） |

**Andes 移植案:** Stripe 寄り radius `6-8px`（4 は硬すぎ、12+ は friendly すぎ）、padding `14px 24px`、bg 紺 `#0e1a3a`、weight 500。pill は Andes serious tone に合わない。

```
[Stripe CTA]  [ Get started → ]   radius 4px,  purple #533afd
[Shopify CTA] ( Start free trial )  radius 9999px (pill), white
[Andes 案]    [ お問い合わせ → ]   radius 8px,  navy #0e1a3a, weight 500
```

---

## 10. Footer

| Dim | Stripe | Shopify |
|---|---|---|
| column 数 | 5-6 col（Products / Solutions / Developers / Company / Resources / Region） | 5-6 col 類似 |
| links 数 | ~79 | 多数（mega-footer） |
| 上部 | 地域 selector + logo | 地域 selector + logo + lang |
| 下部 | © + privacy/terms/sitemap + 言語 selector | © + privacy + cookie + 言語 selector |
| social | あり（X / LinkedIn / YouTube / GitHub） | あり（同様） |
| 背景 | 白（同 page bg、divider 線 1px） | 黒（page bg 継承） |

**Andes 移植案:** 4 col で十分（事業 / 会社 / 採用 / プレス）+ 連絡先 1 block + 言語 selector（ja / en / pt-BR）+ 会社情報 1 行（CNPJ / 住所）。`docs/01` の住所をそのまま反映。

---

## 11. Image / illustration style

| Dim | Stripe | Shopify |
|---|---|---|
| 主視覚 | 抽象 UI mock（custom illust）+ animated card、3D 微量、real photo は customer story でのみ | 大判 photo + video heavy、3D / illustration mix、editorial 寄り |
| photo style | 整った studio shot、人物中心 | candid + editorial、明暗強い |
| illust 線 | 細線、gradient 微量、product UI を抽象化 | 太線 + colorful、graphic novel 風 |
| icon | 16-24px、stroke 1.5-2px、monochrome | より colorful、filled も混在 |

**Andes 移植案:** Stripe 型 abstract UI mock を採用。3D / photo heavy は Andes に合わない（serious infra tone）。illustration は J-Planet / J-Vita / Protocol layer の 2 層構造図を Stripe 風 schematic で。`docs/02` の 2 層構造図を SVG 化。

---

## Stripe vs Shopify — Andes はどちらを重視するか

**結論: Stripe 8 割 / Shopify 2 割。**

理由（1 段落）: Andes は B2B infrastructure + Series A 文脈、買い手は投資家 / partner / serious engineer。Stripe は同じ文脈で勝った reference（Stripe 自身が `Financial infrastructure to grow your revenue` を hero に置いている）。白 dominant + 軽量 sans + 抽象 UI mock + subtle motion + rectangular CTA は「信頼 + 技術深度」の signature。Shopify は consumer / merchant に向けた immersive brand 側で、黒 dominant + 96px h1 + pill CTA + neon green は「ambition + emotion」を売る side で、Andes の initial corporate site stage では brand 力が足りず空虚に見えるリスク。Shopify から借りるのは `sticky 透明 → 白 swap` の nav 挙動と、`news article page` の clean editorial layout (`Inter-Variable, 64px h1 w330, lh1.08`) のみ。残りは Stripe を base に、purple → red、4px radius → 6-8px radius、英語 sans → 日本語向け Inter + Noto Sans JP weight 300/500 へ翻案。

---

## Andes 移植 Top 5 pattern（優先実装順）

1. **Hero**: Stripe 型左 copy / 右 visual、h1 48-56px / w300 / -0.02em、CTA 2 個（primary 紺 filled + secondary outline）、下に customer/partner logo row
2. **Color system**: 白 60 / 紺 25 / grey 12 / 赤 3、CTA radius 8px、深紺 `#061b31` 系を body text に
3. **Stats row**: `$6T / 1,700 / 2028 / 2026.06` の 4 値を tabular-nums + count-up、Stripe 型 4 col grid
4. **2 層構造 schematic**: `docs/02` の Layer ① / Layer ② / endgame 図を Stripe 風 abstract UI mock として SVG 化、about page の主軸 visual に
5. **Nav**: Shopify 型 sticky 透明 → scroll で白 swap、72px、右側 `お問い合わせ` filled 1 個のみ

---

## 補足 — 観測 raw data

| Stripe home | 値 |
|---|---|
| h1 font | `sohne-var, "SF Pro Display"` |
| h1 size/weight/lh/ls | 48px / 300 / 55.2 / -0.96 |
| body color | `rgb(6, 27, 49)` = `#061b31` |
| primary CTA bg | `rgb(83, 58, 253)` = `#533afd` |
| CTA radius | 4px |
| nav height | 76px |
| doc height | 14642px |

| Shopify home | 値 |
|---|---|
| h1 font | `NeueHaasGrotesk, Helvetica` |
| h1 size/weight/lh | 96px / 400 / 96px (=1.0) |
| body bg | `rgb(0, 0, 0)` |
| accent | `rgb(54, 244, 164)` = `#36F4A4` |
| primary CTA bg | white on dark / radius 9999px / padding 12px 24px / weight 550 |
| nav height | 72px |
| doc height | 11046px |

| Shopify careers | 値 |
|---|---|
| h1 font | `Courier New` mono |
| h1 size/weight | 48px / 650 |
| accent | `rgb(19, 56, 191)` = `#1338BF` |

| Shopify news article | 値 |
|---|---|
| h1 font | `Inter-Variable` |
| h1 size/weight/lh | 64px / 330 / 69.12 (=1.08) |
| body bg | black |
| p size/weight/lh | 16 / 400 / 24 |
