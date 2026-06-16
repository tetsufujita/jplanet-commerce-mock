# 11-checkout — build spec（学習用再現）

> 本家: `data-section-name="checkout-stats"` / `data-component-name="home-stats-section"` / `data-mode="dark"`
> ページ内位置: top 8342px / 高さ 717px（実測キャプチャ 1425px 幅）
> ⚠ キャプチャ時、右カラムの画像 3 層は `opacity-0`（scroll-reveal 未発火）のためスクショでは空。DOM から構造確定済み。

---

## 1. レイアウト構造

```
<section bg-deep-pine>                       ← bg #041E18（実測）
  ::before blurred-ellipse                   ← left -12.5% / top 25% / rotate -20deg のぼかし楕円グロー
  <div container 12col grid items-center>    ← 左右 margin 実測 ≈ 91px / gutter ≈ 24px
    ├ 左カラム  md:col-span-6 col-start-1    ← 実測 x 91→709（幅 ≈ 618px）flex flex-col gap-y-xl
    │   ├ h3 見出し
    │   ├ ul 統計 2 枚（flex / 各 w-1/2 / md:space-x-6 = 24px、実測 gap ≈ 25px）
    │   ├ blockquote（左ボーダー付き引用）
    │   └ 注釈
    └ 右カラム  md:col-span-5 md:col-start-8 ← 実測 x ≈ 831→1336（幅 ≈ 505px）
        └ チェックアウト UI ビジュアル 3 層（z-0 グロー / z-10 UI カード / z-20 決済バッジ）
  </div>
</section>
```

- section padding: 本家クラス `pt-xl pb-0 sm:pt-4xl sm:pb-3xl xl:pb-4xl`。実測: 見出し line1 top が slice 内 y≈165（直前 section の残余込み）→ **pt ≈ 96–128px、pb ≈ 128px と推定（要実測）**
- 左カラム縦リズム `gap-y-xl`: 見出しボックス下端 ≈333 → 統計 border-t y=394（ul 自体に `md:mt-8`=32px あり）→ **gap-y-xl ≈ 32px 推定（要実測）**
- grid: `grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-x-gutter gap-y-xl items-center`
- 背景色: **#041E18**（deep-pine、実測サンプル）。グロー部は #072820 程度まで明るくなる

## 2. 要素インベントリ

| 要素 | 実測 / DOM 由来スペック |
|---|---|
| h3 見出し | `text-t4`。実測: 3 行、行ピッチ 55–56px、グリフ高 ≈44px → **fs ≈ 48px / lh ≈ 56px（要実測）**、weight 330（薄め）、color #FFFFFF、font: Shopify Sans 系 + "Noto Sans JP" |
| 統計 li ×2 | `border-t-[.5px] border-[#11352D]`（実測 y=394 に #11352D の 1px 線）、`pt-2`(8px)、`w-1/2`、`flex flex-col justify-between` |
| 統計ラベル | `font-mono text-xs uppercase text-avocado`。**avocado = #36F4A4（実測）**、fs 12px、mono、先頭に小 SVG アイコン（`space-x-3`=12px） |
| 統計数値 | 「15」「2億5,000万」: `xl:text-t2` → **≈70px**（実測グリフ高 44px、weight 330、white、whitespace-nowrap）。単位「%」「+」: `xl:text-t3` → **≈55px**、`items-start` で上付き風に並ぶ |
| blockquote | `text-body-sm border-l-2 border-avocado pl-[1em] text-gray-b xl:max-w-[85%]`。左バー 2px **#36F4A4**、本文 **#99B3AD（gray-b 実測）**、fs ≈14px / lh ≈22px（3 行、要実測）。文中 2 リンクは下線付き同色 |
| 注釈 | `text-b6 text-gray-b` → **#99B3AD**、fs ≈12px（要実測） |
| 右: グロー層 z-0 | 本家 png 1394×1338。absolute 中央寄せ `lg:w-[140%]`、カード背後の淡い光 |
| 右: UI カード z-10 | 本家 png 1920×1532（チェックアウト画面、配送先フォーム + 決済選択）。`rounded-lg`（8px）、`max-w-[83%] mx-auto sm:max-w-none` |
| 右: 決済バッジ z-20 | absolute `bg-[#5a31f4]`（紫）、`bottom-[20%] lg:right-0 lg:w-[130px] lg:px-4 lg:py-3 rounded shadow-md`、白ワードマーク SVG |

## 3. テキスト計画

| 要素 | 採用テキスト |
|---|---|
| h3（原文 OK） | 世界最高レベルのコンバージョンをもたらすチェックアウト |
| ラベル 1（原文 OK） | より高いコンバージョン率 |
| 数値 1 | 15 ＋ % |
| ラベル 2（原文 OK） | 購買意欲の高い買い物客 |
| 数値 2 | 2億5,000万 ＋ + |
| blockquote（paraphrase、ブランド架空化） | 「**Storely Checkout** に **Sora Pay** を加えると、通常のゲスト購入フローと比べて購入完了率が最大 50% 高まり、世界中の膨大な買い物客層へブランドを届けられます。」（リンク 2 箇所 = 太字部分） |
| 注釈（paraphrase） | 「大手コンサルティングファームと共同で 2023 年に実施した第三者調査の結果に基づく数値です。」 |

※ 逐語コピーは見出し・短ラベルのみ。説明文 2 つは同長・同義の新規日本語に置換済み。

## 4. motion 仮説

右カラム 3 層が共通で `duration-1000 opacity-0 transition-all translate-y-4` を持ち、delay だけ階段状:

| 層 | delay | 挙動仮説 |
|---|---|---|
| グロー z-0 | 0ms | viewport 進入で opacity 0→1 / translateY 16px→0、1000ms |
| UI カード z-10 | 330ms | 同上 |
| 決済バッジ z-20 | 660ms | 同上 |

- トリガーは IntersectionObserver でクラス除去（`opacity-0 translate-y-4` を外す）方式と推定。**閾値・一回きりか毎回か・easing は要実測**（animations.json に該当記録なし＝キャプチャ時未発火）
- 左カラム（見出し・統計・引用）には transition クラスなし → 静的表示と推定
- 数値のカウントアップは DOM 上に痕跡なし → **なし** と判断（要実測で最終確認）
- section ::before の blurred-ellipse は静的（アニメなし）。サイズ・blur 量・色は **要実測**（実測サンプルでは bg が #041E18→#072820 へ持ち上がる程度の微弱グロー）

## 5. アセット置換計画（本家 CDN の DL/複製 禁止）

| 本家アセット | 置換 |
|---|---|
| 統計アイコン SVG ×2（94bf4a… / 67583e…） | **(a) インライン SVG モック**: 16px、stroke #36F4A4 の上向き矢印 / 人物ピクト |
| グロー png（edecfcf… 1394×1338） | **(a) CSS 再現**: `radial-gradient` + `blur()` の div（rgba(54,244,164,0.06)〜透明） |
| チェックアウト UI png（c59185d2… 1920×1532） | **(a) CSS/JSX モック**: 白背景 rounded-lg のチェックアウトカードを JSX で組む（配送先フォーム行 + 「Sora Pay / PayPal / Apple Pay 風」決済ボタン 3 段。架空ショップ名「konoha」、Apple/PayPal ロゴも幾何図形の架空マークに置換） |
| Shop Pay バッジ SVG（2fd05c…） | **(a) CSS + テキスト**: bg #5A31F4 / rounded / shadow-md / 白文字ワードマーク「sora pay」（font-weight 600 イタリックなし） |
| section ::before のぼかし楕円 | **(a) CSS**: 擬似要素 `before:` で再現 |

→ 全アセット (a) CSS/SVG モックで完結。AI 生成は不要。

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/CheckoutStats.tsx        ← section 本体（named export: CheckoutStats）
src/shopify-jp/sections/CheckoutCardMock.tsx     ← UI カードモック（named export: CheckoutCardMock）
```

- **CheckoutStats**: state 不要。`motion.div` + `whileInView={{ opacity: 1, y: 0 }}` `initial={{ opacity: 0, y: 16 }}` `viewport={{ once: true, amount: 0.3 }}` `transition={{ duration: 1, delay: 0 / 0.33 / 0.66 }}` で 3 層 stagger を宣言的に再現 → useEffect 不要
- 色トークン（Tailwind v4 `@theme`）: `--color-pine-deep: #041E18` / `--color-avocado: #36F4A4` / `--color-gray-b: #99B3AD` / `--color-pine-border: #11352D` / `--color-pay-purple: #5A31F4`（globals.css に定義、hex ハードコード禁止ルール準拠）
- タイポ: 見出し 48px/56px・数値 70px・単位 55px は `text-[…]` arbitrary か `@theme` の font-size トークンで定義（weight 330 ≈ `font-light` + Noto Sans JP 300）
- レイアウト: `grid md:grid-cols-12 gap-x-6 items-center`、左 `md:col-span-6`、右 `md:col-span-5 md:col-start-8`、container は `max-w-[1245px] mx-auto px-[90px]` 相当
- `prefers-reduced-motion` 時は reveal 省略（motion/react の `useReducedMotion`）

### 要実測リスト（再現後に本家と diff）

1. text-t4 / body-sm / b6 の正確な font-size・line-height
2. spacing トークン実値（gap-y-xl / pt-4xl / pb-4xl / gap-x-gutter）
3. reveal トリガー（IO 閾値・once か否か・transition easing）
4. blurred-ellipse のサイズ・blur 半径・色・opacity
5. 数値カウントアップの有無（なし、と仮説）
6. 統計アイコン SVG の実デザイン（矢印/人物の形状）
