# 06-scale — 「起業家からエンタープライズまで、あらゆる規模のビジネスに」build spec

> 学習用再現。原典: shopify.com/jp `data-section-name="for-everyone"` + 直後の logo marquee。
> ページ内位置: top 4659px / 高さ 1141px（1425px 幅キャプチャ）。本家 CDN アセットの DL / 複製は禁止。

---

## 1. レイアウト構造

```
<section data-mode="dark">  bg #02090A（実測 rgb(2,9,10)・純黒ではない）
│ pt ≈ 88px (pt-2xl)                         ← token は clamp、要実測
│ ┌ container  幅 1242px / 左右 margin ≈ 91px @1425
│ │ ┌ 見出し行 flex（pb-2xl ≈ 72–96px）
│ │ │  左 col w-3/5 (≈745px) … h3        右 col w-2/5 … 空
│ │ ├ カード行  md+: grid grid-cols-3 / gap ≈ 32px（col 幅 ≈ 393px）
│ │ │  mobile: 横 snap carousel（snap-x mandatory / card w-3/4）
│ │ │  ┌──────────┐ ┌──────────┐ ┌──────────┐
│ │ │  │media 300px│ │media 300px│ │media 300px│  ← キャプチャでは空（§5 参照）
│ │ │  │h4 + p    │ │h4 + p    │ │h4 + p    │
│ │ │  └──────────┘ └──────────┘ └──────────┘
│ │ └ CTA 行 text-center / mt-xl ≈ 48px … pill button（h 56px / w ≈ 214px）
│ └ pb ≈ 72px (pb-2xl)
└ </section>
<div role="group">  logo marquee  full-bleed / h 80px (h-20) / bg 同色
└ <div class="pb-4xl -mb-2xl">  spacer（次 section の rounded-t-4xl が食い込む）
```

実測アンカー（section top = 0、1425px 幅）:

| 要素 | y 実測 |
|---|---|
| h3 グリフ 1 行目 top | 98（3 行、行送り 64px → 98 / 162 / 226） |
| カード media slot | top ≈ 358 / bottom ≈ 655（h 300px 固定 `md:h-[300px]`） |
| h4（カード見出し）グリフ top | 682 |
| 本文 5 行（行送り 22px） | 717–823 |
| CTA pill | 898–953（h 56px、x 613–826 で中央） |
| logo marquee 帯 | ≈ 1025–1105（h-20 = 80px、ロゴ実測 190×81） |

⚠ spacing token（2xl/xl/lg/md/sm/xs）は Shopify 独自 clamp()。再現値は **2xl=88 / xl=48 / lg=32 / md=24 / sm=12 / xs=8 px** を採用（上記アンカーに整合）。正確な token 値は **要実測**（getComputedStyle）。

---

## 2. 要素インベントリ

| 要素 | 仕様 |
|---|---|
| section 背景 | `#02090A`（実測）。テキスト基調 `#FFFFFF` |
| h3 見出し | text-t3: **55px / 330 / lh 64px** / #FFF / Noto Sans JP（specs.json の同 class h2 実測と一致）。`text-pretty` |
| h4 カード見出し ×3 | text-t7: グリフ実測高 19px → **推定 18px / 600 / lh ≈ 1.3** / #FFF、`mb-xs ≈ 8px`。**要実測** |
| p 本文 ×3 | text-body-sm: **推定 14px / 400 / lh 22px** / gray-c（グリフ実測ピーク rgb(151,151,162) → **#9DA0A6 近辺、要実測**）。`max-w-[65ch]`。`<strong>` はブランド名のみ: fw 600・同色 token（`[&_strong]:font-[600] [&_strong]:text-gray-c`） |
| カード枠 | `rounded-xl`(12px) `overflow-hidden` flex-col。背景なし（section 地のまま）。media slot は `rounded-b-xl` |
| media slot ×3 | md+: `h-[300px]` w-full / mobile: `aspect-[26/17]`。キャプチャ時点で**中身なし**（黒地のまま） |
| CTA `最適なプランを探す` | pill: **透明背景 + 白 2px border + 白文字**（実測: 縁 #FFF 2px、内側は地色）。18px / 550 / radius 9999px / padding 12×24 + border → 総高 56px。`href→/jp/pricing` 相当 |
| logo marquee | `<ul>` ×2（同一 8 ロゴを複製 = 無限ループ用）。li = `w-[190px]` h-full、li 間 `space-x-6`(24px)、ul 間 gap 24px。img は本家では `invert` で白化 → 再現では最初から白 SVG。順序: cohina / francfranc / Bento&Co. / Gymshark / KURASU / Amirisu / Tsuchiya Kaban / Kyoto Brewing Co. |

---

## 3. テキスト計画

短い機能的文言は原文 OK、説明 copy は paraphrase（逐語コピー禁止）、ブランド名は架空に置換。

| 区分 | 採用テキスト |
|---|---|
| h3 | 起業家からエンタープライズまで、あらゆる規模のビジネスに（原文 OK） |
| h4 ×3 | 短期間で開業 / 思い通りに規模拡大 / 小さなチームが大きな夢を叶える（原文 OK） |
| CTA | 最適なプランを探す（原文 OK） |
| card 1 本文 | **Yohaku**はShopify Basicプランから事業を始めました。Z世代に支持されるアパレルブランドへ成長する中で段階的にプランを引き上げ、いまはShopify Plusを基盤に躍進を続けています。 |
| card 2 本文 | アスレジャーブランドの**Gymorca**は、小さなガレージでの創業から、いまや年間売上高5億米ドル規模のグローバル企業へと駆け上がりました。 |
| card 3 本文 | **Kuranoko**は、食品の再流通でフードロスを減らすことを使命にしています。Shopify Plusの導入で、少人数のまま世界水準のストアを構築し、売上を大きく伸ばして急成長しました。 |

架空ロゴ名（marquee、§5 参照）: KONOHA / Blancblanc / OBENTO&CO. / GYMORCA / KURASHI / amairo / TSUCHINO KABAN / KAMOGAWA BREWING CO.

---

## 4. motion 仮説

| # | 挙動 | 根拠 | 状態 |
|---|---|---|---|
| 1 | **logo marquee 無限ループ**: keyframes `translateX(calc(-100% - 24px)) → translateX(0)`、**60s / linear / infinite**、両 ul に適用。方向は **左→右**（一般的な左流れと逆） | animations.json 実測 `logo-group-marquee` | 確定（方向のみ目視再確認推奨） |
| 2 | `prefers-reduced-motion`: marquee 停止 → `flex-wrap` の静的グリッド（li w-1/4）、h-20 解除 | DOM `motion-reduce:*` class | 確定 |
| 3 | mobile カード carousel: `snap-x snap-mandatory` + card `snap-center w-3/4`。`transition-all` あり → snap 位置で opacity/scale 変化の可能性 | DOM class | **要実測**（mobile 幅） |
| 4 | カード hover: 親に `group` があるが hover 演出（media 再生 / 色変化）は capture から特定不能 | DOM 構造 | **要実測** |
| 5 | CTA hover: `hover:ring-1` + token swap → 白塗り + 黒文字へ反転と推定 | DOM class 命名 | **要実測** |
| 6 | スクロール入場アニメ: この section には**なし**（animations.json に該当エントリなし、`data-viewable-component` は計測用） | animations.json | 確定扱い |

---

## 5. アセット置換計画

| 原典アセット | 置換 |
|---|---|
| merchant ロゴ SVG ×8（cdn.shopify.com logo-soup、190×81） | **(a) CSS/SVG モック**。架空 wordmark を inline SVG（viewBox 190×80、fill #FFF）で自作: KONOHA（幾何 sans・tracking 広）/ Blancblanc（前半 bold + 後半 light）/ OBENTO&CO.（太 serif）/ GYMORCA（heavy italic + 簡易シャチ図形）/ KURASHI（細 sans）/ amairo（小文字 round）/ TSUCHINO KABAN（classic serif + 小紋章）/ KAMOGAWA BREWING CO.（円形 badge 文字組）。`invert` filter は不要（最初から白で描く） |
| カード media slot ×3 | **キャプチャ準拠 = 空の黒 slot（h 300px）をまず再現**。本番サイトで media が lazy/hover 表示される可能性 → 要実測後、必要なら **(b) AI 生成画像**（アパレル物撮り / アスレジャー / 食品再流通の 3 枚、dark trim）を `object-cover` で差す |
| 動画 | この section に該当なし |

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/
├── ScaleSection.tsx      named export: ScaleSection
└── ScaleLogoMarquee.tsx  named export: ScaleLogoMarquee（ScaleSection 直下で使用）
```

| 項目 | 方針 |
|---|---|
| state / effect | **不要**。全て静的 + CSS アニメ（marquee は CSS keyframes。JS 駆動にしない） |
| marquee 実装 | Tailwind v4 `@theme` に `--animate-logo-marquee: logo-marquee 60s linear infinite` + `@keyframes logo-marquee { from { transform: translateX(calc(-100% - 24px)) } to { transform: translateX(0) } }`。ul ×2 複製、`motion-reduce:` で静的 wrap にフォールバック |
| カード | `CaseCard`（ScaleSection 内のローカル関数 component）: `{ title, body: ReactNode, mediaSlot? }`。md+ `grid-cols-3 gap-8`、mobile `flex overflow-x-auto snap-x snap-mandatory no-scrollbar` |
| CTA | `<a>` pill。`border-2 border-white text-white rounded-full px-6 py-3 text-[18px] font-[550] hover:bg-white hover:text-black transition-all duration-150`（hover は要実測後に補正） |
| ロゴ | `ScaleLogoMarquee` 内に架空ロゴ SVG を子 component（`LogoKonoha` 等）として定義、配列 map ×2 |
| motion/react | 入場アニメ実測なしのため**使わない**（仮に §4-3/4 で判明したら whileInView ではなく hover variant で追加） |
| 文言 | 学習用再現 sandbox のため section ファイル先頭の `const COPY = {...}` に集約（本サイト i18n とは分離。site 移植時は locales JSON へ） |
| 色 | `#02090A` / `#9DA0A6`（gray-c 仮）/ `#FFFFFF` を `@theme` token 化（shopify-jp 再現専用 token、Andes ブランド token と混ぜない） |
```

---

## 要実測リスト（検証ループ向け）

1. spacing token 正値（2xl/xl/lg/md/sm/xs の clamp 解決値 @1440）
2. text-t7 / text-body-sm の font-size・line-height・weight
3. gray-c の正確な hex
4. カード media slot の本番挙動（hover/lazy で video or 画像が出るか）
5. mobile carousel の snap 時 transition（opacity/scale）
6. CTA hover の色反転仕様
7. marquee の進行方向の目視確認（実測 keyframes は右流れを示す）
