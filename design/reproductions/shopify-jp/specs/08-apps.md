# 08-apps — アプリですべてをカスタマイズ（build spec）

> 学習用再現。対象: shopify.com/jp `data-section-name="apps"`（`home-apps-section`、`data-mode="dark"`）
> ページ内位置: top 6673px / 高さ 624px（実測 viewport 1425px = lg 帯域）
> ⚠ キャプチャ `shots/08-apps.png` は entrance fade 前（`opacity-0` 状態）で撮れており、ほぼ無地 navy。実表示はロゴコラージュ marquee + 左上見出しのオーバーレイ。

---

## 1. レイアウト構造

```
<div .bg-coal-black .isolate>                         ← 外側ラッパー（黒系、isolation: isolate）
└ <section .grid .gap-y-2xl .grid-cols-full
           .text-section-dark-text .pt-0 .bg-deep-navy .pb-3xl .overflow-hidden>
  └ <div .overflow-container .relative .w-screen .overflow-clip>
    ├ <div .container .relative .z-10>                ← 見出しレイヤー（z-10、md+ で高さ 0）
    │ └ <div .apps-heading-group
    │        .max-w-[33rem] .mt-2xl
    │        .md:absolute .md:max-w-[38rem]
    │        .transition-opacity .duration-1000
    │        .md:motion-safe:opacity-0>               ← md+ は marquee 上に絶対配置 + 入場フェード
    │   ├ <h3 .text-t3 .mb-md>
    │   └ <p .text-body-lg .!text-b3 .text-gray-d>（リンク 1 個内包）
    ├ <div .relative .group .mt-xl .md:mt-2xl .w-screen .mb-px>   ← marquee ブロック
    │ ├ <div .app-grid .flex .max-w-full .overflow-hidden .select-none>
    │ │ ├ 斜めグラデ overlay（md+ のみ、z-[1]、見出しの可読性確保）
    │ │ └ <div style="width:calc(100% + 6px)" .ml-[-6px]
    │ │        .flex .overflow-hidden .motion-safe:opacity-0
    │ │        .transition-opacity .duration-1000 .ease-out>      ← 入場フェード（marquee 側）
    │ │   └ タイル <div> ×4（同一コラージュ画像、各自 animate-scroll-x）
    │ └ hover spotlight overlay（mix-blend-darken、radial-gradient）
    ├ 上端 fade（h-1/4、deep-navy → transparent、下向き）
    └ 下端 fade（h-1/4、deep-navy → transparent、上向き）
```

### 寸法（実測突合済み）

| 項目 | 値 | 根拠 |
|---|---|---|
| 背景色 | `#000A1E`（deep-navy） | overlay グラデの色値より確定 |
| section 高さ | 624px @1425vw | 64 + 480 + 80 = 624 で整合 |
| marquee 上 margin `md:mt-2xl` | **64px**（section top 6673 → img top 6737） | `2xl = 64px` 確定 |
| section 下 padding `pb-3xl` | **80px**（624 − 64 − 480） | `3xl = 80px` 確定 |
| タイル高 | base 240 / md 360 / **lg 480** / xl 557 px | class 実値 |
| タイル幅 | base 800 / md 1200 / **lg 1600** / xl 1856 px | class 実値 |
| タイル間 gap | `mr-2`=8px、md+ `mr-4`=16px | class 実値 |
| 画像描画サイズ @lg | 1600×457（タイル箱 480 より低い、`items-start` 上寄せ） | img 実測 |
| 見出し幅 | base `max-w-[33rem]`=528px / md+ `max-w-[38rem]`=608px | class 実値 |
| marquee 内側 offset | `width: calc(100% + 6px)` + `ml-[-6px]`（左端の継ぎ目隠し） | inline style |
| `.container` 幅 | Shopify 共通コンテナ（中央寄せ + 左右 padding）。max-width **要実測**（推定 ~1276px） | — |
| 斜めグラデ overlay 高 | md 247 / lg 264 / xl 234 px（base/sm 非表示 `hidden md:block`） | class 実値 |
| spacing トークン推定 | sm≈16 / md≈24 / xl≈48（mb-md, mt-xl に使用、**要実測**） | 2xl/3xl からの内挿 |

### 重なり順（md+）

1. marquee タイル（最下層）
2. 斜めグラデ overlay `z-[1]`: `linear-gradient(145deg, #000A1E 47–50%, rgba(0,10,30,.9) 67–70%, transparent 90–93%)` → 左上を navy で塗り潰し見出しの下地にする
3. `.container` 見出しグループ `z-10`（md+ `absolute` で marquee 上に浮く）
4. hover spotlight overlay（`inset-0`、pointer-events-none）
5. 上下 fade（各 h-1/4、static）

---

## 2. 要素インベントリ

| 要素 | スペック |
|---|---|
| h3 見出し | `text-t3`: **55px / weight 330 / lh 64px**（他 section の t3 実測値より。@1425vw、**要実測** この section 単体で）、color 白（`text-section-dark-text`）、`text-pretty`、下 margin `mb-md`≈24px |
| 本文 p | `text-body-lg !text-b3`: 推定 **18px / lh ~1.6**（**要実測**）、color `text-gray-d` ≈ `#9797A2` 系の淡グレー（**要実測**） |
| 本文内リンク | 下線付きテキストリンク（richtext 内 `<a>`、別タブ） |
| marquee 画像 | 1856×530 jpg（2x=3712×1060）。多数のアプリロゴカードを敷き詰めたコラージュ 1 枚を 4 回繰り返し。`alt=""`・`aria-hidden`・`loading="lazy"`・`pointer-events-none` |
| marquee 親 | `aria-label`（ロゴスクロールの説明文）、`group`（hover 制御の起点） |
| 斜めグラデ overlay | 上表の通り。xl は custom utility `bg-app-gradient-wide`（同系の wide 版） |
| spotlight overlay | `mix-blend-darken`、`background: radial-gradient(circle at <x> <y>, white, #000A1E 30%)`、`opacity-0 → group-hover:opacity-60`、`transition-opacity duration-1000` |
| 上下 fade | `bg-gradient-to-b / -to-t`、`from-deep-navy to-transparent`、高さ各 25% |
| 角丸 | この section には目立つ角丸なし（コラージュ画像内のカードに角丸あり） |

---

## 3. テキスト計画

| 場所 | 採用テキスト | 備考 |
|---|---|---|
| h3 | アプリですべてをカスタマイズ | 短い機能的見出し → 原文 OK |
| 本文 p | 「標準機能だけでも、販売に必要な土台はひと通り揃っています。さらに踏み込んだ機能が欲しくなったら、業種や課題ごとに特化した 13,000 以上の拡張アプリが並ぶアプリストアから自由に追加できます。」 | 原文（必須機能が備わっている＋13,000 以上のアプリ＋App Store 誘導）と同じ長さ・同じ意味の **paraphrase**。逐語コピー禁止 |
| 本文内リンク | 「アプリストア」（`href="#"` placeholder） | 本家ブランド名「Shopify App Store」は出さない |
| marquee `aria-label` | 「多数のコマースアプリのロゴが横に流れるアニメーション」 | paraphrase |

---

## 4. motion 仮説

### a. 入場フェード（scroll 連動・一回）

- 見出しグループ: `md:motion-safe:opacity-0` + `transition-opacity duration-1000`
- marquee ラッパー: `motion-safe:opacity-0` + `transition-opacity duration-1000 ease-out`
- 仮説: IntersectionObserver で section が viewport に入った時に `opacity-0` を外す（or `opacity-100` 付与）→ 1s フェードイン。**要実測**: 発火 threshold / rootMargin、見出しと marquee の発火タイミング差（同時か stagger か）
- `prefers-reduced-motion` 時は `motion-safe:` が外れるため最初から可視（静的表示）

### b. marquee ループ（実測済み・確定）

animations.json より `scroll-x` CSSAnimation 実測:

```
keyframes: transform: translate(-100%) → translate(0)
duration : 240,000ms（240 秒）
easing   : linear / iterations: infinite / 4 タイル全てに適用
```

- 各タイルが自身の幅 + margin 分（lg: 1600+16=1616px）を 240s で移動 → **右方向へ約 6.7px/s**（xl: 1872px/240s ≈ 7.8px/s）の超低速ドリフト。4 枚同一画像なので継ぎ目なしで無限ループ
- hover で停止: `group-hover:[animation-play-state:paused]`
- GPU 合成: `transform-gpu`

### c. hover spotlight（マウス追従の懐中電灯効果）

- overlay の `radial-gradient(circle at 0px 0px, white, #000A1E 30%)` — `circle at` の座標が inline style にあり、**JS の mousemove で中心座標を更新している**と推定
- `mix-blend-darken` の効果: 白（カーソル中心）= 下のロゴがそのまま見える / #000A1E（周辺）= navy に沈む → カーソル周辺だけロゴが「照らされる」
- `opacity-0 → group-hover:opacity-60`、transition 1000ms で出入り
- **要実測**: gradient 中心の追従方法（rAF か直接 style 書換か）、円の半径（30% は要素サイズ基準）

### d. 静的装飾

- 上下 25% fade、斜めグラデ overlay は motion なし

---

## 5. アセット置換計画

| 本家アセット | 内容 | 置換方法 |
|---|---|---|
| `9354c77a…jpg`（1856×530、唯一の画像。4 回再利用） | アプリロゴカード多数を敷き詰めたコラージュ | **(a) CSS/SVG モック**: `AppLogoTile` コンポーネント 1 枚（w=1856 相当・h 可変）を CSS grid で生成し 4 回繰り返す。中身 = 角丸正方形アイコン（単色 bg + 頭文字 or 簡単な図形）+ アプリ名テキストのカードを 3〜4 行ランダム幅で敷き詰める。アプリ名は全て架空（例: konoha / lumora / sashiko pay / tsugi reviews / hanico shipping / mochi loyalty / kaze SEO / tonbo analytics 等）。色はくすんだ多色パレット（navy 背景に映える彩度低め） |
| — | — | CDN からの DL・複製は**禁止**。コラージュ内部の正確な行数・カード密度は本家を目視で観察して CSS モックに反映（**要実測**: 行数とカード寸法感） |

CSS モック利点: marquee が DOM になるので spotlight の blend 効果・retina 対応・lazy 読込問題も消える。1856px 幅の固定タイルとして `flex-shrink-0` で組めば本家とアニメ互換。

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/AppsSection.tsx   … named export: AppsSection
src/shopify-jp/sections/AppLogoTile.tsx   … named export: AppLogoTile（コラージュ 1 枚分の CSS モック）
```

### AppsSection

- **構造**: 上記 §1 の DOM をそのまま写す（section > overflow-container > container(見出し) + marquee + fades）
- **入場フェード**: `motion/react` の `useInView(ref, { once: true })` → 見出し / marquee の `opacity-0` → `opacity-100` を `data-inview` 属性 or 条件 class で切替（transition は Tailwind の `transition-opacity duration-1000`）。motion component は不要、CSS transition で足りる
- **marquee**: 純 CSS。`globals.css` に keyframes 追加:
  ```css
  @keyframes scroll-x { from { transform: translate(-100%); } to { transform: translate(0); } }
  ```
  Tailwind 4 `@theme` で `--animate-scroll-x: scroll-x 240s linear infinite` を定義 → `motion-safe:animate-scroll-x`。pause は `group-hover:[animation-play-state:paused]` をそのまま利用
- **spotlight**: `useRef<HTMLDivElement>` + `onMouseMove` で CSS 変数 `--spot-x / --spot-y` を直接 style 更新（**state 不使用**、再 render なし。rAF throttle 推奨）。overlay は `style={{ background: 'radial-gradient(circle at var(--spot-x,0px) var(--spot-y,0px), white, #000A1E 30%)' }}`
- **state/effect 要否**: `useState` 不要 / `useEffect` 不要（useInView と ref コールバックで完結）
- **トークン**: `@theme` に `--color-deep-navy: #000A1E`、gray-d 系 `--color-app-gray: #9797A2`（要実測後に確定）
- **a11y**: marquee は `aria-hidden`、親に paraphrase 済み `aria-label`。`prefers-reduced-motion` で `motion-safe:` が全部無効 → 静止 + 即時表示
- **breakpoint**: タイル w/h・グラデ高・見出し幅の 4 段切替（base/md/lg/xl）を class で再現。lg(1425px 検証幅) を基準に diff を取る

### PASS 条件（再現 diff 用）

1. @1425px で section 高さ 624±8px、bg `#000A1E`
2. marquee が右方向へ約 6.7px/s で流れ、hover で停止する
3. 見出しが marquee 左上にオーバーレイされ、斜めグラデで可読
4. hover で懐中電灯 spotlight がカーソルに追従（opacity 0.6）
5. reduced-motion で全て静止・即時可視

---

## 要実測（合計 6 件）

1. 入場フェードの IntersectionObserver threshold / 見出しと marquee の stagger 有無
2. spotlight gradient 中心のマウス追従実装（更新頻度・円サイズ）
3. `.container` の max-width / 左右 padding
4. `text-t3` / `text-b3` のこの section での実 px（t3=55px/330/64px は他 section からの転用値）
5. `text-gray-d` の実 hex
6. コラージュ画像内部のカード行数・寸法感（CSS モック設計用、目視観察のみ・DL 不可）
