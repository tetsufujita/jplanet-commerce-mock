# 09-devs — 「開発者による開発者のためのリソース」build spec

> 学習用再現。対象: shopify.com/jp §9（top 7297px / 高さ 823px / viewport 1440px・実測キャプチャ 1425px 幅）
> ソース: `shots/09-devs.png` + DOM（`data-section-name="developer"` / `data-component-name="home-dev-section"` / `data-mode="dark"`）+ animations.json
> ⚠ **breakpoint 注意**: キャプチャ幅 1425px では **lg variant が適用**（xl ≈ 1440 と推定）。本 spec の実測 px は lg 値。xl 値は併記。

---

## 1. レイアウト構造

```
<section class="grid gap-y-2xl grid-cols-full pb-4xl pt-0 bg-deep-navy" data-mode="dark">
  └ .container（実測コンテンツ幅 1260px、左 margin 90px @1425）
     ├ 見出しブロック .pb-xl .max-w-[85ch] .text-balance
     │   ├ h3.text-t3（2 行、<br> 改行）
     │   └ p.text-body-sm.!text-b3.text-gray-d.mt-md（link 2 個入り）
     └ 「dev canvas」 .rounded-2xl .bg-[#010624] .overflow-hidden .relative
        .flex .justify-start  lg:pt-20 lg:pb-6（xl:pb-8）
        ├ Hydrogen 円 button（absolute left-0、cyan gradient）
        └ inline-block wrapper（lg:translate-x-[300px] / xl:translate-x-[400px]）
           ├ 青 glow 楕円 ×3（absolute、radial-gradient）
           ├ 装飾コード SVG img ×4（absolute、card の上下左右に配置）
           ├ 中央 column（text-center）: label pill + 中央 card（max-w 630）
           │   └ 左 block（absolute right-[calc(100%-14px)] top-[13%] max-w-275）
           │       : label pill + 左 card（縦長）
           └ 右 block（absolute text-right lg:right-9 lg:top-[40%] max-w-486 / xl:right-32）
               : label pill + fork 円 button（purple）+ 右 card
</section>
```

| 項目 | DOM クラス | 実測/換算 px（@1425 lg） |
|---|---|---|
| section 背景 | `bg-deep-navy` | **#000A1E**（実測 rgb(0,10,30)） |
| section 下 padding | `pb-4xl` | **96px**（実測: canvas 下端 726 → section 下端 823 = 97px） |
| section 上 | `pt-0` | 0。実測では section 上端 → h3 ink 上端 = **40px**（lh box 上端 ≈ 33px、前 section の重なり由来。再現では pt-8 相当で diff 調整） |
| container | `.container` | 幅 **1260px**、x 90 → 1349 |
| 見出し下余白 | `pb-xl` | **40px**（実測: p box 下端 ≈264 → canvas 上端 306） |
| p 上余白 | `mt-md` | **24px** |
| canvas 寸法 | — | **1260 × 420px**（x 90–1349 / y 306–726 in shot） |
| canvas 角丸 | `rounded-2xl` | **16px** |
| canvas 背景 | `bg-[#010624]` | **#010624**（実測一致） |
| canvas 内 padding | `lg:pt-20 lg:pb-6`（`xl:pb-8`） | 上 **80px** / 下 24px（xl: 32px）。実測: pill 上端 = 306+80 = **386** ✓ |
| canvas 影 | `shadow-dev-image-container` | カスタム token、**要実測** |
| spacing token 対応表 | md/lg/xl/2xl/3xl/4xl | **24 / 32 / 40 / 64(推定) / 80 / 96** |

### 3 カードの実測ジオメトリ（@1425、y はいずれも shot 座標）

| card | x 範囲 | 幅 | 上端 y | 由来クラス |
|---|---|---|---|---|
| 左（AI 向けに構築） | **129 → 404** | **275px** | block top-[13%]、card ≈ y 452〜 | `lg:max-w-[275px]`、右端 = 中央 column 左端 +14px（`md:right-[calc(100%-14px)]`） |
| 中央（カスタムストアフロント） | **390 → 1020** | **630px** | **457**（pill 386 + pill 高 46 + gap 24） | `lg:max-w-[630px]`、wrapper `lg:translate-x-[300px]`（90+300=390 ✓） |
| 右（アプリを構築） | **828 → 1314** | **486px** | ≈ 474（`lg:top-[40%]` = 306+168） | `lg:max-w-[486px]`、右端 = canvas 右端 −36（`lg:right-9`）✓ |

- 右 block は中央 card の右側 **x 828–1020 を上から overlay**（DOM 後勝ち、z 自然順）。
- 全 card とも下端は canvas の `overflow-hidden` で切られ「下から生えている」見え方。

## 2. 要素インベントリ

### h3（section 見出し）
| 属性 | 値 |
|---|---|
| text | 開発者による`<br>`開発者のためのリソース |
| font | Noto Sans JP / **55px / w330 / lh64px**（`text-t3`、ink 実測 40–89 / 104–153、行 pitch 64 ✓） |
| color | #FFFFFF |

### p（リード文）
| 属性 | 値 |
|---|---|
| font | `!text-b3` ≈ **19–20px / lh28**（実測: 行 pitch 27.5、"Shopify" ascender–descender 20px。正確値**要実測**） |
| color | `text-gray-d` ≈ **#BEBFCB**（ストローク中心実測 rgb(189,189,202)、token 値要実測） |
| 行数 | 3 行、`max-w-[85ch]` `text-balance` |
| link ×2 | 「ユニバーサルコマースプロトコル」「API、ツール、プリミティブ」= 下線つき同色 a。hover 挙動（white 化?）**要実測** |

### label pill ×3（`hidden lg:inline-flex`、lg 以上のみ表示）
| 属性 | 値 |
|---|---|
| box | `px-4 py-3`（16/12px）`gap-3`(12px) `rounded`(4px) `mb-4` `bg-white/20` `shadow-dev-label-container`（要実測） |
| 実測高 | **46px**（y 386–432） |
| dot | 8×8px 円、`border-2` 白縁・中抜き |
| text | `text-b4` ≈ **14px**（要実測）、白。「AI 向けに構築」「カスタムストアフロントを構築」「アプリを構築」 |
| hover | `hover:bg-[#4A659A]` |

### dev card 共通フレーム（左/中央/右）
| 要素 | 仕様 |
|---|---|
| 外枠 | `bg-white/10` + `border border-[rgba(255,255,255,0.1)]` + padding **13px**（md+、実測 13px ✓。mobile 10px） |
| 角丸 | 中央/右 `rounded-t-[20px]`、左 `rounded-tl-[20px]`（外向き角のみ丸い） |
| 内側 | `bg-[#060607]`（実測一致）`rounded-t-[9px] md:rounded-t-xl` `pb-10`(40px) `overflow-hidden` |
| border-glow | `span.border-glow absolute -inset-px rounded-t-[20px] border border-transparent` — 枠線上を巡る光（§4） |
| 右 card のみ | さらに `bg-devCard rounded-t-[20px]` の背板 div あり（token 値**要実測**） |
| 中身 img | 中央: 1200×778 png `aspect-[600/389]`（架空ストアフロント画面）/ 左: 1067×1874 png（縦長 mobile AI チャット画面）/ 右: 920×416 jpg（アプリ開発 UI）— いずれも `aria-hidden` 装飾、shot ではほぼ黒に近い dark UI |

### 円形 icon button ×2
| 属性 | Hydrogen（cyan） | fork（purple） |
|---|---|---|
| 位置 | absolute left-0、`lg:w-[73px] lg:top-[19%] lg:translate-x-[877px]`（実測 x ≈ 960–1040、xl: translate-x 980px/top 16%） | 右 block 内 absolute `-translate-x-1/2 z-20`、`lg:w-[71px] lg:top-[51%] lg:translate-x-[445px]`（実測 x ≈ 1273–1344 / y ≈ 660–731、xl: translate-x 460px） |
| 背景 | `linear-gradient(180deg,#30deee→#30c0ee)` | `linear-gradient(180deg,#6b26ff→#5126ff)`（実測 rgb(87,38,255) ✓） |
| 影 | `0 16px 24px 0 #070d17` | `0 16px 24px rgba(7,13,23,0.1)` |
| 中身 | 2 段 chevron ロゴ SVG（36×38、黒、`max-w-[47cqw]` container query） | git-fork 線画 SVG（27×27 viewBox、黒 stroke 2.16、`line-up`/`circle`/`curvy`/`plus-wrap` class 持ち） |
| hover | `hover:scale-110` + `hover:shadow-[0_0_24px_0_#30deee]`、duration-200 | 同型 `hover:shadow-[0_0_24px_#6b26ff]` |
| link 先 | hydrogen.shopify.dev（架空に置換） | shopify.dev（架空に置換） |

### 装飾レイヤー（wrapper 内 absolute、全部 `aria-hidden`）
| 要素 | 仕様 |
|---|---|
| 青 glow 楕円 ×3 | `w-[412px] aspect-[412/163] rounded-[100%] opacity-80` `bg-[radial-gradient(rgba(18,96,255,0.35),transparent_50%)]`。配置: ① 右上 `top-0 left-full scale-[3]` ② 左 `right-full rotate-45 scale-x-[2.5] scale-y-[5]` ③ 右下 `top-full right-[-40%] scale-[1.5]`。CSS のみで再現可 |
| コードSVG img ×4 | ① 312×128（card 左、`-translate-x-full -translate-y-1/2 top-0`）② 288×172（card 右、`left-full -translate-y-1/2`）③ 580×76（card 上、`-translate-x-1/2 -translate-y-full left-1/2`）④ 657×109（右下、`z-20 translate-x-1/2 translate-y-1/3 bottom-0 right-0`）— 薄いコード行/スキーマ線画 |

## 3. テキスト計画

| 位置 | 採用テキスト | 備考 |
|---|---|---|
| h3 | 開発者による`<br>`開発者のためのリソース | 見出し原文 OK |
| p | **「Shopify が公開するユニバーサルコマースプロトコルに加え、API・ツール・プリミティブを使えば、開発者は事業に必要なエージェンティックコマース体験を自在に組み立てられます。」** | paraphrase（逐語コピー禁止）。下線 link 2 箇所は原文と同じ語に付与 |
| pill ×3 | AI 向けに構築 / カスタムストアフロントを構築 / アプリを構築 | 機能ラベル原文 OK |
| sr-only ×2 | 「Hydrangea：ヘッドレスコマースのフレームワーク」「devs.example」 | 架空名に置換（本家: Hydrogen / shopify.dev） |
| 装飾コード SVG 内テキスト | `const cart = agent.checkout({...})` 風の**完全新規**疑似コード | 原文 asset を読まず自作 |

## 4. motion 仮説

| # | 対象 | 挙動 | 根拠 | 状態 |
|---|---|---|---|---|
| M1 | border-glow ×3 | CSS animation `loop`: **8s linear**、`offsetDistance` を全体の 0→40% で移動（中央 -20%→80% / 左 -30%→60% / 右 -30%→-120% =逆走）後、60% は静止。**delay 1.0s / 4.0s / 5.5s の stagger**。capture 時 `playState: paused` → viewport 進入で再生（`data-viewable-component` 由来の IntersectionObserver と推定） | animations.json 実測 3 件 | keyframe 確定 / **光の見た目（色・太さ・offset-path 定義）と再生トリガーは要実測** |
| M2 | Hydrogen ロゴ | hover で上段 path `translate-y-[10%]`・下段 `-10%` + `opacity-40`、**300ms**（ロゴが上下に割れる） | `group-hover/hydrogen:*` `duration-300` | DOM 確定 |
| M3 | 円 button ×2 | hover で `scale-110` + ネオン影（#30deee / #6b26ff）、**200ms** `transition-[transform,box-shadow]` | DOM | 確定 |
| M4 | label pill | hover で bg #4A659A（transition 指定なし → 即時 or 継承、要確認） | DOM | ほぼ確定 |
| M5 | fork SVG | `line-up`/`circle`/`curvy`/`plus-wrap origin-center` class → hover で線の draw / plus 回転系 micro アニメと推定 | class 命名のみ | **要実測** |
| M6 | card 入場 | `dev-left-card`/`dev-middle-card`/`dev-right-card` 固有 class → scroll 進入時に下から rise / stagger の可能性 | class 命名のみ（animations.json に transform 系なし） | **要実測** |
| M7 | scroll 連動 | sticky / marquee / scroll-scrub は**この section にはなし**（scroll-x・marquee は §8 apps 側） | animations.json | 確定 |

reduced-motion: M1/M6 は `motion-safe:` 配下に置き、`prefers-reduced-motion` で静止。

## 5. アセット置換計画（本家 CDN の DL/複製 禁止）

| アセット | 本家 | 置換 |
|---|---|---|
| 中央 card img（1200×778 storefront 画面） | CDN png | **(a) CSS/SVG mock**: 架空ブランド「konoha」の dark ストアフロント（nav + hero 商品画像枠 + 価格行）を DOM で構築。shot ではほぼ黒なので低コントラストで十分 |
| 左 card img（1067×1874 縦長 AI チャット） | CDN png | **(a) CSS mock**: mobile 幅の架空 AI チャット UI（吹き出し 2-3 個、入力欄）。上 1/3 のみ見えるため簡素で OK |
| 右 card img（920×416 アプリ開発 UI） | CDN jpg | **(a) CSS mock**: 架空 admin + side panel の dark UI |
| 装飾コード SVG ×4 | CDN svg | **(a) 自作 SVG**: monospace 疑似コード行・接続線（白 8–15% opacity）。寸法は本家と同じ 312×128 / 288×172 / 580×76 / 657×109 |
| Hydrogen ロゴ（inline SVG） | ブランドロゴ | **架空「Hydrangea」**: 2 段 chevron 風の**自作 path**（本家 d 属性の流用禁止） |
| fork icon（inline SVG） | 汎用 git-fork 線画 | 汎用図形なので**同構図を自作 SVG で再現**（stroke 2.16 / round cap） |
| 青 glow 楕円 / 影 / gradient | CSS 値 | DOM に値が露出しているため **CSS そのまま再現**（asset 不要） |

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/
├ DevsSection.tsx      ← named export DevsSection（section + 見出し + canvas + 配置）
├ DevCard.tsx          ← named export DevCard（白/10 フレーム + #060607 内側 + BorderGlow + mock 中身 slot）
├ DevLabelPill.tsx     ← named export DevLabelPill（dot + text-b4、hover bg） 
└ DevOrbButton.tsx     ← named export DevOrbButton（円形 gradient button、variant: 'hydrangea' | 'fork'）
```

| component | state / effect | 実装メモ |
|---|---|---|
| `DevsSection` | state 不要。`useInView`（motion/react）で canvas の視認を取り、CSS 変数か class で border-glow の `animation-play-state` を running に | 構造: `<section class="bg-[#000A1E] pb-24"><div class="mx-auto max-w-[1260px] px-0">`。canvas は `relative flex justify-start overflow-hidden rounded-2xl bg-[#010624] pt-20 pb-6`。wrapper は `inline-block relative translate-x-[300px] xl:translate-x-[400px]`、左/右 block は本 spec §1 の絶対配置値を arbitrary value で直書き |
| `DevCard` | なし（純 presentational） | props: `corner: 't' | 'tl'`, `width`, `glowDelay`, `glowKeyframes`。BorderGlow は CSS `@keyframes`（`offset-path` + `offset-distance`、8s linear、delay を prop 化）。`motion-safe:` + play-state 制御 |
| `DevLabelPill` | なし | `hidden lg:inline-flex items-center gap-3 rounded px-4 py-3 bg-white/20 hover:bg-[#4A659A]` |
| `DevOrbButton` | なし。hover は Tailwind group のみ（JS 不要） | variant で gradient / 影 / 中身 SVG を分岐。Hydrangea hover の上下分裂は `group-hover:translate-y-[10%]` 等で CSS 完結。`style={{container:'icon / inline-size'}}` + `max-w-[47cqw]` の container query も再現 |

文言は `src/shopify-jp/copy.ts` の定数に集約（ハードコード禁止ルール準拠、学習用独立 namespace）。色 #000A1E / #010624 / #060607 / #30DEEE / #30C0EE / #6B26FF / #5126FF / #4A659A はこの再現専用の `@theme` トークンへ（本体ブランドトークンと混ぜない）。

---

### 要実測リスト（6 件）
1. `text-b3` / `text-b4` / `text-gray-d` の正確な font-size / line-height / color token 値
2. `shadow-dev-image-container` / `shadow-dev-label-container` / `bg-devCard` の実値
3. border-glow の視覚実体（光の色・長さ・`offset-path` 定義）と再生トリガー（IntersectionObserver 条件）
4. fork SVG の hover micro アニメ（`line-up`/`circle`/`curvy`/`plus-wrap` の keyframes）
5. card 入場アニメの有無（`dev-*-card` class の scroll 連動、JS 注入の可能性）
6. p 内 link の hover 挙動と、xl breakpoint の正確な閾値（1440 想定の検証）
