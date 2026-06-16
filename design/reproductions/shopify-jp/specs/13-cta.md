# 13-cta — Shopify でビジネスを迅速に構築（build spec）

> 学習用再現。対象: shopify.com/jp `data-section-name="conversion"`（`home-conversion-section`、`data-mode="dark"`）
> ページ内位置: top 9836px / 高さ 776px（実測キャプチャ 1425px 幅 ≈ viewport 1440）
> ⚠ キャプチャ `shots/13-cta.png` は左カラムの画像カード 8 枚が lazy 未ロード状態（左半分が無地）。実表示は左に縦長フォトカード 2 枚（各 4 枚 crossfade）。

---

## 1. レイアウト構造

```
<section .grid .gap-y-2xl .grid-cols-full
         .pt-3xl .pb-4xl
         .rounded-t-4xl .md:rounded-t-5xl     ← 前 section に被さる上角丸（relative z-10）
         .bg-conversion-gradient .text-section-dark-text>
└ <div .container>                            ← 中央寄せ（実測: x 76→1349、幅 ≈1273 @1425vw）
  ├ <div .pb-xl .sm:text-center>
  │ └ <h2 .text-t3 #conversion-heading>       ← 見出し（中央揃え）
  └ <div .grid .gap-x-md .gap-y-xl .grid-cols-4 .md:grid-cols-12 .sm:items-end>
    ├ 画像カラム（.hidden .sm:flex .gap-sm .justify-self-end .items-end
    │            .col-span-2 .md:col-span-5 .lg:col-span-6）
    │ ├ カードA <div .rounded-xl .aspect-[281/375] .lg:max-w-72 .mb-20    ← 80px 持ち上げ
    │ │          .motion-safe:opacity-0 .motion-safe:translate-y-4
    │ │          .transition-opacity-transform .duration-500>
    │ │ └ <img> ×4 重ね（active: opacity-100 z-10 / 他: absolute inset-0 opacity-0 z-0、
    │ │            各 img .transition-all .duration-500 .object-cover）
    │ └ カードB 同構造 + .delay-200（mb-20 なし → 2 枚が段違い・下端揃え基準）
    └ リストカラム（.col-span-2 .md:col-span-7 .lg:col-span-6 .lg:pl-lg）
      ├ <div .mb-2xl role="list">
      │ └ <p role="listitem" tabindex="0" .flex .items-center .mb-md .cursor-default> ×3
      │   ├ <span 番号 .text-body-lg .text-avocado .w-10 .md:w-16 .pb-2 .md:pb-[0.625rem]>
      │   └ <span 本文 .grow .text-t4 .text-white .border-b .pb-2 .md:pb-[0.625rem]
      │            .transition-color .duration-300>   ← 3 番目のみ .border-transparent
      └ <div .sm:pl-10 .md:pl-16>
        └ <a 今すぐトライ>（pill ボタン、dark-primary）
```

### 寸法（実測突合、@1425vw）

| 項目 | 値 | 根拠 |
|---|---|---|
| section 高さ | 776px | スライス実測 |
| 背景 | 黒ベース + 上端に深緑バンド + 斜めの淡いグレー光（下記 §背景） | pixel 実測 |
| 見出し glyph 帯 | y 118–177（中央揃え、x 320–1120） | pixel 実測 |
| リストカラム左端 | x ≈765（番号 765–793 / 本文 x 828 開始） | pixel 実測 |
| 番号カラム幅 `md:w-16` | 64px（765→829 で本文開始 ✓） | class + 実測 |
| 区切り線 | 1px、x 828–1349（幅 521px）、item1 下 y317 / item2 下 y462、item3 はなし | pixel 実測 |
| 行ピッチ（t4 折返し） | 58px（item2 の 2 行: y351 / y409 開始） | pixel 実測 |
| CTA pill | x 828–987 × y 616–671 = **159×55px**、リスト本文と左揃え（`md:pl-16`=64px） | pixel 実測 |
| pill 下 → section 下端 | 105px（`pb-4xl` ≈96–112、**要実測**） | pixel 実測 |
| カード幅 @lg | `lg:max-w-72` = 288px → 高さ 288×375/281 ≈ **384px**（aspect 固定） | class 実値 |
| カード間 gap-sm | ≈16px（**要実測**） | token 内挿 |
| 上角丸 | `rounded-t-4xl` / md `5xl`（推定 32/40px、前 section も dark で視認不可、**要実測**） | class |

### 背景 `bg-conversion-gradient`（pixel 実測からの近似レシピ）

| 層 | 近似 CSS |
|---|---|
| base | `#060809`（最暗部 rgb(3,7,7)–rgb(8,11,12)） |
| 上端緑バンド | `linear-gradient(180deg, #041E18 0%, transparent ~110px)`（y15px で rgb(4,30,24) 全幅一様、y116 で消滅） |
| 斜め光 | 左下↔右上の対角に淡い band。右上寄り (x0.75,y0.3) で rgb(38,38,46)、左下 (x0.25,y0.7) で rgb(35,36,44)、中央 rgb(31,33,39)。近似: `linear-gradient(135deg, transparent 25%, rgba(90,100,125,0.16) 50%, transparent 75%)` |

正確な stop 値・角度は computed `background-image` の**要実測**。

---

## 2. 要素インベントリ

| 要素 | スペック |
|---|---|
| h2 見出し | `text-t3`: **55px / weight 330 / lh 64px**（specs.json 実測・この見出し自身）、color #FFF、Noto Sans JP、`sm:text-center` |
| ステップ本文 | `text-t4`: glyph 高 42px・行ピッチ 58px → 推定 **fs ≈40px / lh ≈58px(1.45) / weight 330–400**（**要実測**）、color #FFF |
| ステップ番号 | `text-body-lg .text-avocado`: digit 高 22px → 推定 **fs 28–30px**（**要実測**）、color 実測ピーク **rgb(54,244,164) ≈ #36F4A4**（本家 avocado token、**要実測**） |
| 区切り線 | `border-b` 1px、実測 **rgb(229,231,235) = #E5E7EB**（不透明の明グレー）。3 項目目は `border-transparent` |
| CTA ボタン | pill `rounded-button`=9999px、**bg #FFF / text #000**、`text-button-lg-size`=18px / weight 550、padding 12px 24px + border-2（同色）→ 実測 159×55px。hover: dark-primary の hover token（白→淡グレー bg、**要実測**） |
| 画像カード ×2 | `rounded-xl`（≈12px）、aspect 281:375、`overflow-hidden`。中身 img 4 枚 stack、`object-cover`。カードA 素材 575×794 / カードB 575×745（いずれも cover で crop）。`alt=""` `loading="lazy"` |

---

## 3. テキスト計画

| 場所 | 採用テキスト | 備考 |
|---|---|---|
| h2 | Shopify でビジネスを迅速に構築 | 短い機能的見出し → 原文 OK（公開時はブランド名を架空名に差替え可） |
| step 01 | 最初の商品を追加する | 原文 OK（機能ラベル） |
| step 02 | ストアをカスタマイズする | 原文 OK |
| step 03 | 決済方法を設定する | 原文 OK |
| CTA | 今すぐトライ | 原文 OK |
| CTA href | `#`（placeholder。本家 signup URL は使わない） | — |
| 画像 alt | `""`（本家同様 decorative） | — |

文言は `src/i18n/locales/{ja,en,pt-BR}.json` の `shopifyJp.cta.*` に収める（AGENTS 規約、.tsx ハードコード禁止）。

---

## 4. motion 仮説

### a. 入場 reveal（scroll 連動・一回）

- カードA/B: `motion-safe:opacity-0 translate-y-4` + `transition-opacity-transform duration-500`、カードB のみ `delay-200`
- 仮説: in-view で class を外し **fade + 16px 上昇**、B が 200ms 遅れの stagger。**要実測**: threshold / 発火位置
- reduced-motion 時は `motion-safe:` が無効 → 最初から可視

### b. 画像 crossfade（4 枚ローテーション）

- 各カード内 img 4 枚 stack。active が `opacity-100 z-10`、他は `opacity-0 z-0`、`transition-all duration-500` → **500ms クロスフェード**
- 駆動の仮説: タイマーで自動巡回（推定 3–4s 間隔）し、**リストの 3 ステップのハイライトと同期**している可能性が高い（listitem に `tabindex=0` + 本文に `transition-color duration-300` → active 行が白 / 非 active 行が減светグレーに切替わる想定。キャプチャ DOM は全行 text-white の瞬間）
- 4 枚 vs 3 ステップの対応（default+3 か、hover/focus 起動か）は**要実測**（interval ms・hover 時の挙動含む）

### c. その他

- 区切り線・番号・背景は静的。CTA は `transition-all duration-150` の色 hover のみ
- sticky / marquee / scroll-scrub 系は本 section になし

---

## 5. アセット置換計画

| 本家アセット | 内容 | 置換方法 |
|---|---|---|
| カードA img ×4（575×794 jpg: `009e0d56…` `e01306d7…` `c7bad325…` `69a7c030…`） | マーチャント/商品の縦長ライフスタイル写真 | **(b) AI 生成画像**: Higgsfield で縦長 575×794 相当を 4 枚生成（例: 陶器工房 / アパレル作業場 / コスメ撮影 / 梱包風景。実在ブランド・ロゴなし、warm tone） |
| カードB img ×4（575×745 jpg: `a4cb30be…` `9b3e46ff…` `6850f6e5…` `c286d3c9…`） | 同上（別モチーフ） | **(b) AI 生成画像** 4 枚（例: 店頭受け渡し / スマホで店舗管理 / 花屋 / カフェ）。第一段階は **(a) CSS モック**（角丸グラデ placeholder 2 枚 + 番号同期の色替え）で組み、生成後に差替え |

- 本家 CDN アセットの DL・複製は**禁止**。被写体の構図感のみ目視参考
- 写真内に文字を入れる場合は架空ショップ名（例: 「konoha」「tsumugi」）のみ

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/CtaSection.tsx   … named export: CtaSection
```

- **構造**: §1 の DOM を写す（section > container > 見出し + 12col grid[画像 flex + リスト]）
- **state**: `useState<number>` で `activeStep`（0–3 の画像 index）。`useEffect` で `setInterval`（暫定 3500ms、実測後に確定）巡回。`useInView` 外 / reduced-motion / リスト hover・focus 中は停止
- **入場 reveal**: `motion/react` の `useInView(ref, { once: true })` → 条件 class で `opacity-0 translate-y-4` を解除（CSS transition で十分、motion component 不要。カードB は `delay-200`）
- **crossfade**: motion 不使用の CSS 方式（img 4 枚 stack、`opacity` + `z-index` を activeStep で切替、`transition-opacity duration-500`）— 本家互換
- **リスト同期**: listitem の `onMouseEnter` / `onFocus` で `setActiveStep(i+1)`（仮説実装、要実測後に調整）。active 行の本文を `text-white`、非 active を `text-white/60` に（`transition-colors duration-300`）
- **reduced-motion**: `motion-safe:` 系をそのまま利用 + interval を `matchMedia('(prefers-reduced-motion)')` でスキップ
- **トークン**: `@theme` に `--color-avocado: #36F4A4` / `--color-cta-divider: #E5E7EB` / conversion gradient を `--background-image-conversion-gradient` として定義
- **a11y**: `role="list"` / `role="listitem"` / `aria-labelledby="conversion-heading"` / listitem `tabindex={0}` を踏襲

### PASS 条件（再現 diff 用）

1. @1425px で section 高さ 776±8px、上端に緑バンド → 黒 + 斜め淡光のグラデ
2. 見出し 55px/330 中央、リスト右カラム x≈765 開始、区切り線 #E5E7EB が item1/2 のみ
3. CTA pill 白 159×55px がリスト本文と左揃え
4. カード 2 枚が段違い（A が 80px 上）で入場 fade-up + B 200ms stagger
5. 画像が 500ms crossfade で巡回し、reduced-motion で全静止

---

## 要実測（合計 7 件）

1. `bg-conversion-gradient` の正確な CSS（computed background-image の stop / 角度）
2. crossfade の駆動: 自動 interval ms / リスト hover・focus 連動の有無 / 4 枚と 3 ステップの対応
3. リスト active 行の色変化（非 active 時の text 色 / border 色の遷移）
4. `text-t4` の正確な fs / lh / fw（実測推定 40px / 58px / 330–400）
5. `text-body-lg`（番号）の正確な fs と avocado の正式 hex（実測ピーク #36F4A4）
6. 入場 reveal の IntersectionObserver threshold
7. spacing 実 px: `pt-3xl` / `pb-4xl` / `pb-xl` / `gap-sm` / `rounded-t-4xl|5xl`（08 spec より 2xl=64 / 3xl=80 は確定済）
