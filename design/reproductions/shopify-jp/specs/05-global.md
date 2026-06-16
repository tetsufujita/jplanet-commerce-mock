# 05-global — 世界へ広がる可能性（local-and-global）build spec

> 学習用再現。DOM 実測 + screenshot 実測（1425px 幅 capture / viewport 1440 − scrollbar 15）。
> 本家 section: `data-section-name="local-and-global"` / `data-mode="dark"` / top 3832px / h 827px。

---

## 1. レイアウト構造

```
<section>  bg #02090A（section-dark-bg）/ pt-2xl ≈ 96px / pb-2xl（capture 上は下 38px・要実測 §4-5）
└ container  幅 1260px（1440 時、左右 margin 90px）
   ├ 見出しブロック  pb-xl ≈ 32px
   │  └ h3 「世界へ広がる可能性」 55px / fw330 / lh64
   └ 大パネル（1 枚カード構成）
      ・w 1260 × h 596（lg:h-[596px] xl:h-[590px]、実測 595）
      ・rounded-xl(12px) / overflow-hidden / relative / p-lg = 32px（実測: 左 33・下 34）
      ・bg #061A1C（deep-green）+ border-top 1px hairline ≈ #1E2C31（白 8–10% 相当）
      ・shadow-card / container-type:inline-size（子の glow は cqw 単位）
      ・flex flex-col justify-between
      ├ [z-0] glow 8 個（§2-A）
      ├ [z-10] ビジュアル行（flex row）
      │   ├ 左半分 w-1/2（xl）: 国旗縦カルーセル + 商品カードスタック + 注文 pill
      │   └ 右半分 w-1/2（xl）: checkout window（capture 時 opacity-0）+ 世界地図 layer（capture 時 空）
      └ 下部テキストブロック（max-w-[65ch]）: h4 + p（パネル内、p-lg の内側）
```

座標実測（capture 1425px 幅、section top = y0）:
- h3 glyph: x93–581 / y99–148
- パネル: x90–1349 / y193–788
- 国旗 active tile: x134–197（64px 角）、縦ピッチ 76px（tile 64 + gap 12）
- hero 商品カード: x413–648（235px）/ y255–564（309px）→ lg:w-[236px] h-[310px] aspect 236/310
- 注文 pill: x602–800（w198）/ y379–426（h47）
- h4: x123–282 / y659–678、本文 3 行: y694–754

## 2. 要素インベントリ

### A. glow（パネル背景の光彩、z-0、8 個）
- 共通: `absolute rounded-[340px] scale-200`、サイズ/位置は cqw（例 `w-[20cqw] h-[12cqw] top-[2cqw] -left-[4cqw]`）
- 回転: 45deg / 53deg / −30deg の 3 系統
- 塗り 2 系統:
  - `radial-gradient(#157076, transparent 65%)` opacity 20–25%
  - `radial-gradient(rgba(21,112,118,.4〜.6), #061A1C 75%)` opacity 30–40%
- 実測色: glow 部 #08272A（bg #061A1C より僅かに明るい teal）。静的（アニメなし）

### B. 国旗縦カルーセル `#flags-carousel`
- 列: 縦 1 列、tile 64×64（`lg:w-16` aspect-square）、margin で縦ピッチ 76px、`sm:h-[324px]`（≈4.3 tile 分、上下見切れ）
- tile: `rounded-xl bg-white/10`（非 active、実測 #183436）/ active のみ `bg-white/50`（実測 #7D878A）
- 国旗画像: 40×29px、非 active `opacity-60` → active `opacity-100`、`transition-opacity` + `transition-transform ease-in`
- DOM に 13 item。wrapper に `translate3d(0,-676px,0)`、先頭 item に `translate3d(0,988px,0)` → JS 駆動の無限縦ループ（item recycle 方式）

### C. 商品カードスタック（カルーセル中央）
- 6 枚の card が `absolute inset-0` で全重なり。役割 class で見え方を切替:
  - `card-hero`: opacity-100 z-30（最前・等倍 204×227 画像）
  - `card-left` z-20 / `card-right` z-10: opacity-100、縮小+横 offset（画像実測 170×189 = hero の 0.83 倍）。`card-overlay`（`bg-deep-green` + `transition-opacity`）が乗り暗く沈む（実測 #566365）
  - 残り 3 枚: opacity-0 z-0（次候補、画像 146×162 = 0.72 倍）
- card 本体: `bg-white rounded-md→lg:rounded-lg(8px) p-2→lg:p-4 gap-2→3` flex-col
  - 商品画像枠: `rounded grow bg-deep-green/20`、img object-cover（元 812×904）
  - Buy now ボタン: `lg:min-h-14`（実測 h≈52）、`rounded(4px)`、縦 gradient ≈ #1E3A3C→#1A3233（`bg-local-global-card-button`）+ 同系 shadow、文字 `text-b6`(14px) bold white「Buy now」
- 注文 pill（各 card に 1 個、`data-local-global-card-pill`）:
  - `bg-white rounded-full shadow-2xl p-1 pr-4 gap-1.5`、位置 `lg:left-[80%] md:top-[40%]`（hero card の右肩に重なる）
  - 左: 丸 badge `h-10`（lg）、`bg-shade-10 border-shade-20`、国旗 emoji 🇺🇸
  - 右: `text-b6`(14px) 黒「次に注文：」+「$125.00」
  - active card の pill のみ `translate-y-0 opacity-100 delay-500 duration-1000`、他は `translate-y-10 opacity-0 duration-500`

### D. checkout window（右半分、capture 時 非表示）
- `w-64 lg:w-80`（320px）`aspect-[624/674]`、PNG 320×279 実測（ブラウザ window 風の配送ラベル UI 画像）
- `transition-opacity-transform duration-500 ease-in-out opacity-0 motion-safe:translate-y-10` → 表示時に fade+rise

### E. 世界地図 layer `local-and-global-map`
- `absolute pointer-events-none transition-transform duration-500`、DOM capture 時は中身 空 → JS が後から差し込む（「配送済み」ピン付き世界地図、aria-label より）

### F. 下部テキスト
- h4 `text-t7`: 「国境を越えた販売」 実測 ≈20px / fw700 / lh≈28（要実測）、white、`mb-xs`
- p `text-body-sm text-gray-a`: 16px / fw400 / lh≈26（要実測）、色 #889799、`max-w-[65ch]`、文中リンク 1 個（下線、同色）

### タイポまとめ（Noto Sans JP, Helvetica fallback）
| 要素 | size | weight | lh | 色 |
|---|---|---|---|---|
| h3 text-t3 | 55px | 330 | 64px | #FFFFFF |
| h4 text-t7 | ≈20px | 700 | ≈28px | #FFFFFF |
| p text-body-sm | 16px | 400 | ≈26px | #889799 |
| Buy now / pill text-b6 | 14px | 700 / 400 | 20px | #FFF / #000 |

## 3. テキスト計画

- h3: 「世界へ広がる可能性」（原文 OK・機能的見出し）
- h4: 「国境を越えた販売」（原文 OK）
- ボタン: 「Buy now」 / pill: 「次に注文：」+「$125.00」（原文 OK）
- 本文（paraphrase、逐語コピー禁止 → 新規日本語。リンクは架空ブランド名に置換）:
  > 「{BRAND} なら、低コストで素早い海外配送の手配から、{BRAND} Markets による地域ごとの購買体験の最適化まで、越境販売につきものの煩雑な作業をひとまとめに解決できます。」
  - `{BRAND}` は再現全体で統一する架空名（例: Storefy）。「{BRAND} Markets」部分をリンク表示（下線）。

## 4. motion 仮説

1. **国旗カルーセル（縦・自動ループ）**: wrapper を −76px ずつ translateY、端まで来た item を `translate3d` で末尾へ recycle（DOM の −676px / +988px が証拠）。active tile が中央 3 番目に固定され、`bg-white/10→/50`・`opacity-60→100` が transition で切替。**進行間隔・easing・1 step 時間 = 要実測①**
2. **商品カード切替（国旗と同期）**: 国旗が 1 つ進むたび `card-hero/card-left/card-right` の役割 class を JS が付け替え。`.card-left/.card-right` の transform 値（scale ≈0.83 / 横 offset ≈±170px と推定）は外部 CSS のため **要実測②**。`card-overlay` の opacity transition で奥カードを沈ませる
3. **注文 pill**: active card の pill が `delay-500 duration-1000` で fade+rise in（translate-y-10→0）。国ごとに 国旗 emoji と通貨額が変わる可能性 **要実測③**
4. **シーン遷移**: aria-label より 3 シーン構成 ―― ①Buy now ボタンの言語切替（国旗+カード） ②配送ラベル作成（checkout window が fade-in） ③世界地図に「配送済み」マーク。capture はシーン①のみ可視。**シーン切替トリガー（時間 or scroll / IntersectionObserver での play-pause）= 要実測④**。地図の実体（canvas/SVG/img）も **要実測⑤**
5. glow・パネル自体はスクロール連動なし（static）。`motion-safe:` prefix が checkout window にあるため reduced-motion 対応必須
6. 採寸の残課題: 下 padding（class は pb-2xl だが capture 上は 38px。次 section との相殺 or crop）**要実測⑥**、text-t7 / body-sm の正確な lh **要実測⑦**

## 5. アセット置換計画（本家 CDN の DL/複製 禁止）

| 本家アセット | 内容 | 置換 |
|---|---|---|
| 国旗 PNG ×13（40×29） | 各国国旗 | **(a) CSS/SVG モック**: 国旗 emoji（🇺🇸🇯🇵🇧🇷🇫🇷…）を tile 内に 28px で表示。pill も本家同様 emoji なので統一感あり |
| 商品写真 JPG ×6（812×904） | 商品ライフスタイル写真 | **(b) AI 生成画像** ×6（Higgsfield、バッグ/スニーカー/コスメ等の汎用物撮り、ブランド表記なし）。つなぎは neutral gradient placeholder で先行実装可 |
| checkout window PNG（939×818） | 配送ラベル UI のブラウザ window 風画像 | **(a) CSS/SVG モック**: rounded window + ダミー form 行 + 架空ロゴで再構築（UI なので CSS の方が忠実） |
| 世界地図 layer | 「配送済み」ピン付き地図 | **(a) CSS/SVG モック**: dot-matrix 世界地図 SVG + ピン。実体が判明するまで保留可（要実測⑤） |
| ブランドロゴ/名称 | Shopify / Shopify Markets | 架空名 `{BRAND}`（例: Storefy / Storefy Markets）に置換 |

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/
├ GlobalSection.tsx        … <section> + container + h3 + パネル + 下部テキスト（named export: GlobalSection）
├ GlobalGlowField.tsx      … glow 8 個（純 CSS、static、props なし）
├ GlobalFlagsCarousel.tsx  … 国旗縦カルーセル（props: activeIndex）
├ GlobalCardStack.tsx      … 商品カード 6 枚 + pill（props: activeIndex）
└ GlobalCheckoutWindow.tsx … シーン②の window モック（props: visible）
```

- **state**: `GlobalSection` が `useState(activeIndex)` + `useEffect(setInterval ≈3s・要実測①)` で唯一のタイマーを持ち、子へ props で配布（国旗とカードの同期が要件）
- **effect**: `useEffect` で IntersectionObserver → 画面外で interval 停止（本家 `data-viewable-component` 相当）。`useReducedMotion()`（motion/react）で autoplay 無効化 + pill/checkout は静的表示
- **アニメ実装**:
  - 国旗列: `motion.div` に `animate={{ y: -76 * step }}`、recycle は index 計算（modulo）で疑似無限化
  - カード役割: index 差分から hero/left/right/hidden を算出し、`motion.div` に `animate={{ scale, x, opacity, zIndex }}`（transition duration 0.5）
  - pill: `AnimatePresence` + `initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.5, duration: 1 } }}`
- **色トークン**（globals.css `@theme` に追加。ハードコード hex 禁止ルールに従う）:
  `--color-sfy-dark: #02090A; --color-sfy-deep-green: #061A1C; --color-sfy-glow: #157076; --color-sfy-hairline: #1E2C31; --color-sfy-gray-a: #889799;`
- 文言は `src/i18n/locales/*.json` の `shopifyJp.global.*` key に集約（heading / cardTitle / body / buyNow / pillLabel / pillPrice）
