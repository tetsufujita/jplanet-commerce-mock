# 07-sidekick — 「秘密兵器、Sidekick の登場です」build spec

> 学習用再現。対象: shopify.com/jp §7（top 5800px / 高さ 873px / viewport 1440px・実測キャプチャ 1425px 幅）
> ソース: `shots/07-sidekick.png` + DOM（`data-section-name="sidekick"` / `data-component-name="home-sidekick-section"`）+ specs.json

---

## 1. レイアウト構造

```
<section data-mode="dark">                     ← 縦 grad 背景・上角丸
  └ .container (実測コンテンツ幅 ≈ 1261px 中央寄せ、左余白 ≈ 90px @1440)
     ├ 見出しブロック  pb-xl md:pb-3xl       ← 実測: H2 下端 → カード上端 = 80px
     │   └ h2.text-t3
     └ カード grid
         md:grid-cols-[2fr_1fr]  md:grid-rows-[1fr_auto]  gap-6(24px)
         ├ Card A: sidekick-card             (デモ動画 + caption)  row-span-2 subgrid
         └ Card B: sidekick-testimonial-card (事例動画 + caption)  row-span-2 subgrid
```

| 項目 | DOM クラス | 実測/換算 px |
|---|---|---|
| section 縦 padding | `py-16 md:py-25` | md+: 上下 **100px**（実測: section 上端→H2 上端 = 100px） |
| section 上角丸 | `rounded-t-4xl md:rounded-t-5xl` | 視認 ≈ **32px**（要実測、前 section の黒地に角丸で重なる） |
| section 背景 | `bg-gradient-to-b from-[#2C007F] from-[42.49%] to-[#000A1D]` | **上 42.49% まで #2C007F、下端 #000A1D** へ線形フェード |
| section 直前 spacer | `bg-section-dark-bg pb-4xl -mb-2xl` | 前 section の黒地が角丸の背後に見える仕掛け |
| 見出し下余白 | `pb-xl md:pb-3xl` | md+: **80px** |
| カード列 | `md:grid-cols-[2fr_1fr]` + `gap-6` | Card A **824px** / gap **24px** / Card B **413px**（実測） |
| カード行 | `md:grid-rows-[1fr_auto]` + 各カード `grid-rows-[subgrid] row-span-2` | row1 = メディア（伸縮）、row2 = caption（auto）→ 2 枚の caption 上端が揃う |
| カード高さ | — | 実測 **534px**（y 269→803 in shot） |
| mobile fallback | `flex flex-col` + `gap-4` | 1 カラム積み、gap 16px |

## 2. 要素インベントリ

### h2（section 見出し）
| 属性 | 値 |
|---|---|
| text | 秘密兵器、Sidekick の登場です |
| font | Noto Sans JP / **55px / w330 / lh64px**（specs.json 実測、`text-t3`） |
| color | #FFFFFF |

### Card A — sidekick-card（デモ）
| 要素 | 仕様 |
|---|---|
| カード容器 | `rounded-xl`(12px) `overflow-hidden` bg **#020A08** `shadow-card`（影値は要実測、ごく弱い） |
| メディア枠 | `aspect-ratio: 2017/872`（≈2.31:1）→ 824px 幅で **≈356px** 高。`h-full` + video `object-cover` |
| video | **838×362 実測**。`autoplay loop playsinline preload="auto"` muted。`opacity-0` → 読み込み後 `transition-opacity duration-300 ease-out-cubic` でフェードイン。src は JS 注入の blob（MSE） |
| caption 枠 | `px-lg pb-lg pt-md sm:pt-lg`（実測 ≈ **32px** 四方、上のみ md で 32px）`lg:max-w-3/4` |
| h3 | 「あなた専属のコマース AI」 `text-t7` ≈ **16px / bold / lh24**（要実測）白。`mb-sm md:mb-xs` ≈ 8px |
| h3 横の icon | 空 div `h-6 w-6`(24px) `aspect-ratio:4/3` `md:ml-2` — JS 注入の Sidekick きらめき icon（要実測）。mobile では `flex-col-reverse` で text の上 |
| p | `text-body-sm` ≈ **14px / lh22**、color **#9797A2**。文中「Sidekick」が `<a href>` 下線 link、hover で下線解除 + **white** |

### Card B — sidekick-testimonial-card（事例）
| 要素 | 仕様 |
|---|---|
| カード容器 | Card A と同一（`rounded-xl` bg #020A08 shadow-card） |
| メディア枠 | `aspect-ratio: 930/828`（≈1.12:1）→ 413px 幅で **≈367px** 高、`min-h-0` |
| video | **407×362 実測**。`preload="none"` 初期 `opacity:0; pointer-events:none`。**autoplay しない**・音あり（クリック再生型）。`controlslist` でDL/PiP等禁止 |
| 再生 button | `absolute inset-0` 全面 + 中央円: **63×63px** 円、`border-[1.89px]` border-shade-20（淡灰）、`bg-black/20`、影 `0 1.5px 9px rgba(0,0,0,.3)` |
| 再生 icon | 三角 SVG **19×21px**、fill/stroke shade-20、stroke 1.65px |
| button hover | `transition-colors duration-200`: 円 → **bg-white + border-white**、icon → **black**（focus-visible も同様） |
| aria-label | 「事例動画を再生する」 |
| caption | Card A と同構成（`max-w-[65ch]`）。h3「ビジネス成功のカタチ」+ p 14px #9797A2（link なし） |

## 3. テキスト計画

| 位置 | 採用テキスト | 備考 |
|---|---|---|
| h2 | 秘密兵器、Sidekick の登場です | 見出し原文 OK |
| Card A h3 | あなた専属のコマース AI | ラベル原文 OK |
| Card A p | **「Sidekick が成長のヒントを提案し、手間のかかる作業を肩代わりします。管理画面にはじめから組み込まれています。」** | paraphrase（逐語コピー禁止）。「Sidekick」を link 化 |
| Card B h3 | ビジネス成功のカタチ | ラベル原文 OK |
| Card B p | **「Sidekick とともに事業をすばやく、賢く育てているブランドの実例ストーリーをご覧ください。」** | paraphrase |
| 再生 button aria | 事例動画を再生する | 機能ラベル原文 OK |
| デモ mock 内 chat copy（新規作成） | user:「先週いちばん伸びた商品は？」→ Sidekick:「『リネンシャツ』が前週比 +38%。在庫が残り 12 点なので補充をおすすめします」 | 完全新規、原文に存在しない copy |

## 4. motion 仮説

| # | 対象 | 挙動 | 根拠 | 状態 |
|---|---|---|---|---|
| M1 | Card A video | 読込/視認時に opacity 0→1、**300ms ease-out-cubic** | `opacity-0 transition-opacity ease-out-cubic duration-300` | DOM 確定 |
| M2 | Card A video | autoplay + loop（scroll 連動なし） | `autoplay loop` 属性 + specs.json `autoplay:true loop:true` | 確定 |
| M3 | Card B 再生円 | hover/focus で円 white 化・icon black 化、**200ms** | `transition-colors duration-200 group-hover:*` | DOM 確定 |
| M4 | Card B video | click で opacity 1 + 再生（音声つき）、button 消滅 | `preload="none"` + `opacity:0` + button 構造 | 挙動詳細は**要実測** |
| M5 | h3 横 sparkle icon | 何らかの micro アニメ（lottie/canvas 注入と推測） | DOM が空 div + JS 注入痕跡 | **要実測** |
| M6 | section 入場 | scroll 連動の入場アニメは**なし**と推定（animations.json 14 件に sidekick 系ゼロ。marquee/scroll-x/border-glow は他 section） | animations.json | **要実測**（IntersectionObserver 系の可能性） |
| M7 | Card A デモ動画の中身 | チャット入力→返答→グラフ表示のループ映像（動画内アニメ、DOM ではない） | 観察 | mock 化で代替 |

## 5. アセット置換計画（本家 CDN の DL/複製 禁止）

| アセット | 本家 | 置換 |
|---|---|---|
| Card A デモ動画（838×362, blob） | Shopify 管理画面内 Sidekick chat のデモ映像 | **(a) CSS/SVG mock**: 偽 admin 風 dark UI（sidebar + chat panel）を DOM で構築し、motion/react で「入力→返答→売上カードの数値 count-up」を 8s ループ。動画ファイル不要 |
| Card A poster png | CDN | 不要（mock のため） |
| Card B 事例動画（407×362, 音あり） | ブランド創業者 interview | **(b) AI 生成画像** 1 枚（縦長 930:828、暗めの店舗で商品を手にする架空 founder のポートレート）を poster として静置 + 再生円 overlay。click 時は **(c) 生成動画**（5s, Higgsfield）に差し替え可・初期実装では再生 stub で OK |
| 動画内ブランドロゴ | 実在ブランド | 架空名に置換（例: cohina → **konoha**、生成画像内も文字を入れない or 架空 wordmark） |
| sparkle icon（24×24） | JS 注入 asset | **(a) インライン SVG**（4 芒星 + 小星、白）。opacity 明滅 2s loop |
| 再生三角 icon | インライン SVG（DOM に path あり） | path を参考に**自作 SVG**で同形再現（19×21, stroke 1.65） |

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/
├ SidekickSection.tsx        ← named export SidekickSection（section + h2 + grid）
├ SidekickDemoCard.tsx       ← named export SidekickDemoCard（Card A）
└ SidekickTestimonialCard.tsx← named export SidekickTestimonialCard（Card B）
```

| component | state / effect | 実装メモ |
|---|---|---|
| `SidekickSection` | なし（純 layout） | `<section class="rounded-t-[32px] bg-gradient-to-b from-[#2C007F] from-[42.49%] to-[#000A1D] py-25">`。grid は `md:grid-cols-[2fr_1fr] md:grid-rows-[1fr_auto] gap-6`、カード側は `md:grid-rows-subgrid md:row-span-2` |
| `SidekickDemoCard` | state 不要。chat ループは motion/react の `animate` + `repeat: Infinity`（時間 keyframe）で宣言的に。`useReducedMotion()` で停止 | 入場 fade は `initial={{opacity:0}} whileInView={{opacity:1}} transition={{duration:0.3, ease:[0.33,1,0.68,1]}}`（= ease-out-cubic）。aspect は `style={{aspectRatio:'2017/872'}}` |
| `SidekickTestimonialCard` | `useState<boolean>` `isPlaying`。effect 不要（再生 stub）。生成動画採用時は `useRef<HTMLVideoElement>` + click handler で `.play()` | hover は Tailwind `group` のみ（JS 不要）。`aria-label="事例動画を再生する"`、`isPlaying` で button を unmount |

文言は `src/i18n/locales/*.json` 集約ルールの対象外（学習用再現の独立 namespace）だが、ハードコードせず `src/shopify-jp/copy.ts` 等の定数に寄せる。色は #2C007F / #000A1D / #020A08 / #9797A2 をこの再現専用 `@theme` トークンに定義（本体ブランドトークンと混ぜない）。

---

### 要実測リスト（5 件）
1. section 上角丸の正確な radius（rounded-t-5xl の px）
2. `shadow-card` の実値（box-shadow）
3. `text-t7` / `text-body-sm` の正確な font-size / line-height
4. Card B click 再生時の遷移（button fade? video fade-in 時間? 終了時の挙動）
5. sparkle icon の実体と micro アニメ / section 入場時の IntersectionObserver 系アニメ有無
