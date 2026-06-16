# 02-logos — Merchant Showcase（タブ連動カルーセル）build spec

> 対象: `data-component-name="home-ab-section"`（`data-section-name="a-b"`、`data-mode="dark"`）
> ページ内位置: top 850px / 高さ 711px（viewport 1425px 実測キャプチャ）
> shot: `shots/02-logos.png`

## ⚠ 事前観察メモの訂正（重要発見）

| 観察メモの記載 | 実際 |
|---|---|
| 「3 feature cards（短期間で開業 / 移行 / エンタープライズ、287×274 imgs）」 | **この section には存在しない**。`global-nav-level2`（header メガメニュー）内の level3-link カード。top=1092 はメニュー展開時の測定値 |
| 「小 video 190×87」×2（top 1130 / 1331）+ 256×150（top 1004） | 同じくメガメニュー内の hover video。本 section 対象外 |
| shot 下端の白いナビバー（y≈631-711） | sticky global header のフルページキャプチャ artifact。**本 section に含めない**（Header component が担当） |

→ **この section の実体 = 「4 文タブ見出し + 12 merchant screenshot のタブ連動カルーセル」のみ。**

---

## 1. レイアウト構造

```
<section>  bg #02090A / dark mode / overflow-hidden / pt:0 / pb:80px(md)・64px(base)
│          grid 1 列、row-gap = 2xl ≈ 64px
├─ .container（padding-inline ≈ 90px = var(--margin)）
│   └─ 見出し tablist（role="tablist"、span×4 がタブ＝文）3 行に折返し
│       y: 850–1042（行送り 64px × 3 行）
└─ .container（max-lg:mr-0 / xl:overflow-hidden）
    └─ tabpanel strip: flex / column-gap = var(--margin) 90px
        inline style transform: translate3d(-{index×1335}px, 0, 0)  ← JS 制御
        ├─ panel 0（lg:basis-full、幅 1245px）… img×3
        ├─ panel 1 … img×3
        ├─ panel 2 … img×3
        └─ panel 3 … img×3
        y: 1106–1482（img 高さ 376px）
```

- **コンテナ余白**: `--margin ≈ 90px` @1425px。根拠: strip の translate3d(-4005px) ÷ 3 panel = stride 1335px = viewport 1425 − 90。見出し字面の左端 x=108 は字面サイドベアリング込みで整合
- **panel stride**: panel 幅 1245px（= 1425 − 90×2）+ gap 90px = 1335px
- **panel 内**: flex nowrap、img 間 margin-right 16px（`md:mr-4`）、`items-start`。lg では `lg:shrink` で 492+16+213+16+492=1229px を 1245px 内に収める
- **縦リズム**（page 座標）: 見出し 850→1042 ／ gap 64px ／ カルーセル 1106→1482 ／ pb 80px → section 終端 1562
- **背景色**: `#02090A`（実測サンプル rgb(2,9,10)）。token 名 `bg-section-dark-bg`
- **モバイル時**（参考、再現は 1440 优先）: 各 panel が `overflow-x-scroll` + `cursor-grab`、img 高さ h-[196px]→sm:310→md:360

## 2. 要素インベントリ

### 2-1. 見出し tablist（文＝タブ）

| 項目 | 値 |
|---|---|
| 構造 | `div[role=tablist]` > `span[role=tab]` ×4（`aria-selected` / `aria-controls` で panel と紐付け） |
| font | Noto Sans JP、**55px / line-height 64px / weight 330**（他 section の text-t2/t3 実測と行送り実測 64px から推定。要実測） |
| active タブ | `!text-white`（#FFFFFF） |
| inactive タブ | `text-shade-50` ≈ rgba(255,255,255,0.5)（要実測） |
| hover | `hover:text-transparent` + 親の `bg-clip-text bg-ab-control` → テキスト内に背景 gradient が透ける reveal。`cursor-pointer` |
| 折返し | 4 文がインライン連結で 3 行、`sm:text-balance` |

### 2-2. カルーセル panel（×4）

| 項目 | 値 |
|---|---|
| panel | `flex shrink-0 lg:basis-full items-start cursor-grab active:cursor-grabbing overflow-x-scroll no-scrollbar` |
| img wrapper | `rounded-[5px] overflow-hidden`、`mask-image: radial-gradient(white, black)`（角丸の Safari レンダリング対策） |
| img（wide） | 492×376（原画 1046×800、ratio 1.3075） |
| img（narrow） | 213×376（原画 454×800、ratio 0.5675） |
| hover overlay | `span` 全面、`before:bg-[#061A1C]`、opacity 0→1 / `duration-300`、中央配置で下端 `bottom-4` に merchant ドメインリンク（白 16px / 400、新規タブ） |

### 2-3. 12 枚インベントリ（panel 別、左→右）

| panel | タブ文（原文） | 画像（幅型） | 元ブランド → 架空置換名 | リンク表示 |
|---|---|---|---|---|
| 0 | お客さまが買い物をするあらゆる場所で販売しましょう。 | W / N / W | Mejuri→**Lumera**（ジュエリー）/ FTC→**DECKROW**（スケートアパレル）/ Glossier→**glowie**（コスメ） | lumera.example / deckrow.example / glowie.example |
| 1 | オンラインでも、実店舗でも。 | N / W / W | Hommey→**Homari**（クッション雑貨）/ East Fork→**Claypath**（陶磁器）/ Kurasu→**Kissaten**（コーヒー器具） | homari.example / claypath.example / kissaten.example |
| 2 | AI や SNS でも。 | W / N / W | Monos→**Voyara**（スーツケース）/ Stanley→**Tundra Co.**（ボトル）/ Yowie→**Mochiko**（デザイン雑貨） | voyara.example / tundra.example / mochiko.example |
| 3 | 国内でも、海外でも。 | W / N / W | KINTO→**Sumika**（テーブルウェア）/ Kirrin Finch→**Finchley**（アパレル）/ Brooklinen→**Yorulin**（寝具） | sumika.example / finchley.example / yorulin.example |

## 3. テキスト計画

- **タブ 4 文** = 見出し兼ラベル（短い機能的文言）→ **原文のまま使用 OK**
  1. お客さまが買い物をするあらゆる場所で販売しましょう。
  2. オンラインでも、実店舗でも。
  3. AI や SNS でも。
  4. 国内でも、海外でも。
- **img alt**（説明文なので paraphrase + 架空ブランド）: 「ハンドメイドジュエリーを扱う Lumera のストア画面」「スケーター向けアパレル DECKROW のストア画面」…の型で 12 枚分新規作成
- **tablist aria-label**: 「販売チャネル別の事例を見る」（原文「マーチャントのカテゴリーを閲覧する」を同義 paraphrase）
- **hover リンクラベル**: 架空ドメイン文字列（上表）

## 4. motion 仮説

| # | 挙動 | 根拠 | 状態 |
|---|---|---|---|
| 1 | **タブ自動送り**: 数秒ごとに active tab が 0→1→2→3 と循環し、strip が `translate3d(-index×1335px)` へスライド | strip の transform が inline style（JS 制御）。DOM 取得時 tab-3 選択 / shot 時 tab-0 選択 = 時間で進行 | **要実測**（間隔は 5s 前後と推定、in-view 時のみ作動かも確認） |
| 2 | スライドの transition | inline transform のみで CSS animation 記録なし（animations.json に該当なし）→ JS が transition 付与 | **要実測**（duration / easing。推定 600-800ms ease-in-out） |
| 3 | **active 文の progress fill**: `bg-clip-text` + `bg-ab-control` は背景 gradient を文字に clip する構え。自動送りの経過を文字色の塗り進行で表す可能性 | class 構造（`bg-ab-control` の中身は外部 CSS で未取得） | **要実測**（gradient 定義と CSS 変数の時間変化） |
| 4 | タブ click / hover: click で該当 panel へジャンプ、hover で `text-transparent` reveal | `role=tab` + `cursor-pointer` + `hover:text-transparent` | クラスから確度高 |
| 5 | img hover: 濃紺 #061A1C overlay が 300ms で fade-in、ドメインリンク表示 | `transition-opacity duration-300` 明記 | 確定 |
| 6 | drag: panel に `cursor-grab active:cursor-grabbing` + `overflow-x-scroll`（モバイルはネイティブ横スクロール） | class | lg でも pointer drag が効くか **要実測** |
| 7 | reduced-motion: 自動送り停止が筋（本家は marquee 系で motion-reduce 分岐あり） | 同サイトの他 section の流儀 | 再現側では必須実装 |

**要実測まとめ（5 件）**: ①自動送り間隔・発火条件 ②スライド duration/easing ③`bg-ab-control` の正体（fill 進行）④text-t3 の正確な font-size/weight ⑤lg での drag 可否

## 5. アセット置換計画（本家 CDN の DL/複製 禁止）

| アセット | 置換方法 |
|---|---|
| merchant screenshot 12 枚（wide 1046×800 ×8、narrow 454×800 ×4） | **(b) AI 生成画像**。架空ブランド（§2-3 の置換名）の EC サイト風 screenshot を生成（hero 画像+ロゴ文字+ナビの構図、ブランドごとにカテゴリ相応の色味）。生成までの暫定は **(a) CSS モック**: `rounded-[5px]` の div に淡色 gradient 背景 + 架空 wordmark（大型タイポ）+ ダミー nav 帯。narrow 型はモバイル UI 風に |
| ブランドロゴ | 画像内の文字として表現（架空名）。単独ロゴ画像は作らない |
| hover overlay / gradient | (a) CSS のみで再現（#061A1C + opacity） |
| 動画 | この section には無し（観察メモの video はメガメニュー側） |

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/MerchantShowcase.tsx   ← named export: MerchantShowcase
src/shopify-jp/data/merchants.ts               ← 12 件の架空 merchant データ（名前/ドメイン/型/画像 path/alt）
```

- **state**: `const [active, setActive] = useState(0)` のみ
- **effect**: `useEffect` で `setInterval`（推定 5000ms、要実測値に差替え）→ `setActive(i => (i+1) % 4)`。`useReducedMotion()`（motion/react）が true なら interval を張らない。タブ click で `setActive` + interval リセット
- **strip**: `motion.div` に `animate={{ x: -active * stride }}` `transition={{ duration: 0.7, ease: 'easeInOut' }}`（要実測で補正）。`stride` は `container 幅 + gap` を `useRef`+`ResizeObserver` か CSS 変数で算出
- **tablist**: `<div role="tablist">` 内に `<span role="tab" aria-selected onClick>` ×4。active は `text-white`、inactive は `text-white/50`、`hover:text-white/80`（bg-clip-text fill は要実測後に追補）
- **panel**: `role="tabpanel"` ×4、各内部に `MerchantCard`（img + hover overlay + 架空ドメインリンク）。`group` + `group-hover:opacity-100` で overlay 制御、`transition-opacity duration-300`
- **a11y**: タブは `tabIndex={0}` + Enter/Space で切替。画像 alt は §3 の paraphrase 文
- **トークン**: 背景 `#02090A`・overlay `#061A1C` は shopify-jp 再現専用の `@theme` トークン（例 `--color-repro-dark-bg`）として定義し、Andes 本体の Navy/Crimson トークンと混ぜない

### PASS 条件

1. 1440px viewport で見出し 3 行・カルーセル 1 段（W/N/W）・section 高さ ≈711px ±2%
2. タブが約 5 秒間隔で自動送りされ、strip が滑らかにスライド（4 panel 循環）
3. img hover で #061A1C overlay + ドメインリンクが 300ms fade
4. 本家アセット URL がコードに 1 つも存在しない（架空ブランドのみ）
5. `prefers-reduced-motion` で自動送り停止
