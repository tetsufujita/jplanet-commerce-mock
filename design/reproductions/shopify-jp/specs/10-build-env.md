# 10-build-env — 構築に最適な環境が揃っています（build spec）

> 学習用再現。対象: shopify.com/jp `data-section-name="no-better-place"`（`home-heading-section`、`data-mode="dark"`）
> ページ内位置: top 8120px / 高さ 222px（実測 viewport 1425px）
> 役割: **deep-pine 大ブロックの「蓋」**。上角丸の deep-pine 帯 + 中央 H2 のみの見出し専用 section。直後の `checkout-stats`（11）以降も `bg-deep-pine` が続くため、この section が pine ゾーンの視覚的開始点になる。

---

## 1. レイアウト構造

```
<div .bg-deep-navy>                                  ← 角丸の「裏地」。navy が角丸の外側に見える
└ <section .grid .gap-y-2xl .grid-cols-full
           .text-section-dark-text
           .rounded-t-4xl .md:rounded-t-5xl          ← 上 2 角のみ角丸（蓋の形）
           .bg-deep-pine
           .pt-2xl .pb-2 .sm:pt-3xl .sm:pb-0>
  └ <div .container>
    └ <div .pb-0>
      └ <h2 .richtext .text-t2
             .sm:mx-auto .sm:text-center
             .md:w-3/4 .lg:w-2/3 .xl:w-1/2
             .text-pretty .pb-[3px]>
         構築に最適な環境が<br>揃っています
```

子は H2 1 個だけ。grid / gap-y-2xl は単一子のため実効なし（共通 section シェルの流用）。

### 寸法（実測突合済み）

| 項目 | 値 | 根拠 |
|---|---|---|
| 背景色（section） | `#041E18`（deep-pine） | 事前観察メモ実測 |
| 背景色（裏地 wrapper） | `#000A1E`（deep-navy） | 08-apps spec で確定済みトークン |
| section 高さ | 222px @1425vw | 80(pt) + 140(H2 2 行) + 3(pb-[3px]) ≈ 223 で整合 |
| 上 padding `sm:pt-3xl` | **80px** | 3xl=80px（08-apps で確定）。base は `pt-2xl`=64px |
| 下 padding `sm:pb-0` | **0px** | base のみ `pb-2`=8px |
| 上角丸 | `rounded-t-4xl`（base）→ `md:rounded-t-5xl`。実 px は **要実測**（Shopify カスタムトークン。目視で 40px 前後） | class 実値 + 目視 |
| H2 幅 | `lg:w-2/3`（container の 2/3 ≈ 850px）/ `xl:w-1/2`。1425px がどちらの帯域かは **要実測**（08 spec は 1425=lg と判断） | class 実値 |
| `.container` | Shopify 共通コンテナ（中央寄せ + 左右 padding、max-width **要実測** 推定 ~1276px） | 08-apps と共通 |
| スライス上端の navy 帯 | 約 30px。前 section（dev/apps、navy 系）の尻 + 角丸裏地が見えているだけで、本 section の box 外 | screenshot 目視 |

---

## 2. 要素インベントリ

| 要素 | スペック |
|---|---|
| h2 | `text-t2`: **70px / weight 330 / lh 70px / letter-spacing normal**（specs.json 実測）、color `rgb(255,255,255)`（`text-section-dark-text`）、font `"Noto Sans JP", Helvetica, Arial, sans-serif`、`text-center`（sm+）、`mx-auto`、`text-pretty`、`pb-[3px]`、明示 `<br>` で 2 行固定 |
| section 角丸 | 上 2 角のみ。下は次 section（同色 deep-pine）に連続するため角丸なし・境界も不可視 |
| その他 | 画像 / 動画 / CTA / リンク **なし**。テキスト 1 要素のみの最小 section |

---

## 3. テキスト計画

| 場所 | 採用テキスト | 備考 |
|---|---|---|
| h2 | 構築に最適な環境が`<br>`揃っています | 短い機能的見出し → 原文 OK（文章レベル copy は本 section に存在しない） |

---

## 4. motion 仮説

- **なし（静的）と判断**。animations.json の 14 件にこの section を対象とするものは無し。DOM にも `transition-* / duration-* / animate-* / opacity-0 / sticky / marquee` 系 class が一切ない
- `data-viewable-component="true"` は viewability 計測（analytics）用であり、アニメーションのトリガーではないと推定
- 唯一の動き候補: 上角丸の「蓋」が前の navy section の上にスクロールで被さって見える視覚効果。これは sticky ではなく**通常フローの色切替**（要素自体は動かない）。被せ演出（前 section が `position: sticky` で下敷きになる等）が無いかは **要実測**（スクロール中の挙動を目視確認）
- reduced-motion 対応: 動きが無いため不要

---

## 5. アセット置換計画

- **置換対象アセットなし**。画像 0 / 動画 0 / ロゴ 0
- 角丸・配色は全て CSS（Tailwind class）で再現可能。CDN からの DL は発生しない

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/BuildEnvSection.tsx   … named export: BuildEnvSection
```

### BuildEnvSection

- **構造**: §1 の DOM をそのまま写す。`<div class="bg-deep-navy"><section class="bg-deep-pine rounded-t-[32px] md:rounded-t-[40px] pt-16 pb-2 sm:pt-20 sm:pb-0 text-white"><div class="container"><h2 …>構築に最適な環境が<br/>揃っています</h2></div></section></div>`（角丸 px は要実測後に確定）
- **state/effect**: 不要。完全静的 — `useState` / `useEffect` / motion component すべて使わない
- **トークン**: `@theme` に `--color-deep-pine: #041E18` を追加（`--color-deep-navy: #000A1E` は 08 で定義済みを共用）。タイポは `--text-t2: 70px`（lh 70px / fw 330）をトークン化
- **連続性の注意**: 直後の `CheckoutStatsSection`（11）も `bg-deep-pine` 必須。pine ゾーン全体を 1 つの wrapper にまとめるか、各 section が同トークンを参照するかは 11 の spec と合わせて決める（蓋と本体で色がズレると境界線が出る）
- **font-weight 330**: Noto Sans JP variable font が必要（`font-variation-settings` か variable 軸指定）。static weights しか無い場合 300 で近似し diff で確認

### PASS 条件（再現 diff 用）

1. @1425px で section 高さ 222±4px、bg `#041E18`、裏地 `#000A1E`
2. H2 が 70px/330/70px・白・中央揃え・2 行（`<br>` 位置一致）
3. 上 2 角のみ角丸、角丸の外側に navy が見える
4. 下端は次 section の pine と継ぎ目なく連続

---

## 要実測（合計 4 件）

1. `rounded-t-4xl` / `rounded-t-5xl` の実 px（Shopify カスタム radius トークン）
2. 1425px viewport の breakpoint 帯域（lg か xl か → H2 幅 w-2/3 / w-1/2 の確定）
3. `.container` の max-width / 左右 padding（08-apps と共通の未確定値）
4. スクロール時に「蓋が被さる」演出（前 section の sticky 下敷き）の有無
