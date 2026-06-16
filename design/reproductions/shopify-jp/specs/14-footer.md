# 14-footer — Build Spec（学習用再現）

> 対象: Shopify JP homepage footer / page top 10612px / 高さ 564px（実測キャプチャ 1425px 幅）
> 実測ソース: shots/14-footer.png + DOM `<footer data-component-name="footer">` + specs.json

---

## 1. レイアウト構造

### 全体

```
<footer>  bg #000000 / text #A1A1AA（実測 rgb(161,161,170) = zinc-400 相当）
├─ [back-to-top ロゴ]  a → #main, 44×50px, 白バッグロゴ
├─ [リンク列グリッド]   4 カラム（見出し + リンク list）
└─ [ボトムバー]        border-t #121C1E / 言語切替 + 法的リンク + SNS
```

- **DOM 実クラス**: `relative py-20 px-8 gap-y-14 font-sans sm:grid sm:grid-cols-3 md:grid-cols-5 sm:gap-x-gutter sm:px-margin xl:px-auto-xl bg-black text-shade-40`
- **実測 px 突合（1425px 幅時）**:
  - 縦 padding: `py-20` = **上下 80px**（80 + コンテンツ 228 + 行間 56 + ボトムバー 120 + 80 ≈ 564px ✓）
  - 横 padding: 実測 **左右 ≈ 96px**（ロゴ左端 x=96、コンテンツ幅 ≈ 1233px）→ 再現は `px-24`（96px）で固定可
  - グリッド: **5 カラム**（md+）。col 1 = ロゴ、col 2-5 = リンク列。カラムピッチ実測 ≈ 257px（幅 ≈ 225px + gutter ≈ 32px）→ `gap-x-gutter` ≈ **32px**
  - グリッド行間: `gap-y-14` = **56px**（リンク列 → ボトムバー）

### リンク列グリッド（内側 ul）

- DOM: `ul.sm:col-span-2 sm:grid sm:grid-cols-2 md:col-span-4 md:grid-cols-4 gap-y-14 sm:gap-x-gutter`
- 4 列の見出し x 実測: 347 / 605 / 862 / 1119（等ピッチ 257px）
- 各列 = `li > h3 + ul.flex.flex-col.gap-y-4`（リンク間 **16px**）

### ボトムバー

- DOM: `div.flex w-full gap-y-7 border-t pt-10 sm:flex-wrap sm:gap-x-10 sm:items-center md:col-span-5 lg:flex-nowrap border-[#121C1E]`
- 実測: border 線 y=392（1px, **#121C1E**）、`pt-10` = **40px**、要素間 `gap-x-10` = **40px**
- 並び: [言語切替 button] → [法的リンク ul `md:me-auto`] → [SNS ul 右端]
- 1425px では法的リンクが 2 行に折返し、SNS 7 個目（Pinterest）が 2 行目に wrap（`flex-wrap gap-4`）

---

## 2. 要素インベントリ

| 要素 | サイズ / スタイル |
|---|---|
| back-to-top ロゴ | `a[href="#main"]` 44×50px（`w-11 h-[50px]`）、白 SVG バッグ、aria-label「トップに戻る」 |
| 列見出し h3 | **20px / weight 500 / line-height 20px / #FFFFFF / mb-24px**（`text-xl leading-[20px] font-medium mb-6 text-white`） |
| リンク a | **16px / weight 400 / line-height 24px / #A1A1AA**、行ピッチ実測 40px（24 + gap 16）。font = "Noto Sans JP", Helvetica, Arial, sans-serif（ページ共通） |
| 言語切替 button | text **#E0E0E0** hover:#FFF。構成: 地球儀 SVG 16×16 fill-white + 「日本 \| 日本語」 + chevron SVG 16×16 white（`transition-transform duration-200`）。`inline-flex items-center gap-x-1` |
| 言語 dropdown（閉時非表示） | `absolute bottom-[calc(100%+5em)] lg:w-[66rem] rounded-lg bg-zinc-900 shadow-2xl text-white z-50`。中身 `columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-7 px-14 py-10`。国名 16px 白 + 言語リンク 14px zinc-400 hover:underline、区切り `\|` opacity-40。現在地域に 30×30 チェック SVG |
| 法的リンク a | 16px / #A1A1AA / hover:#FFF、`gap-x-10`（40px 間隔）。5 個目に CCPA opt-out アイコン img **30×14px**（`h-3.5 w-7.5`）を `gap-1.5` で右添え |
| SNS アイコン li | **32×32px**（`h-8 w-8`）× 7 個、`gap-4`（16px）。白丸 + 黒グリフ（`fill-white text-black`）。外部リンク `target="_blank" rel="me nofollow noopener noreferrer"` |
| 角丸 | footer 本体なし。dropdown のみ `rounded-lg`（8px） |

色トークン（実測確定）:

| token | hex | 用途 |
|---|---|---|
| bg | `#000000` | footer 背景 |
| text-muted | `#A1A1AA` | 本文リンク（DOM 名 `text-shade-40`） |
| text-strong | `#FFFFFF` | 見出し / hover / ロゴ / アイコン |
| text-region | `#E0E0E0` | 言語切替ボタン |
| border | `#121C1E` | ボトムバー上罫線（わずかに青緑がかった黒） |
| dropdown-bg | zinc-900 `#18181B` | 言語パネル |

---

## 3. テキスト計画

見出し・リンクは短い機能的文言 → **原文ベース OK だがブランド名は架空名「Konoha」に置換**:

- 列 1「Konoha」: Konoha とは / Konoha Editions / 投資家の皆様へ
- 列 2「エコシステム」: 開発者ドキュメント / テーマストア / App Store / パートナー / アフィリエイト
- 列 3「リソース」: ブログ / Konoha との比較 / コース / 無料ツール / 変更ログ
- 列 4「サポート」: Konoha ヘルプセンター / コミュニティフォーラム / パートナーを採用する / サービスステータス
- ボトム: 日本 | 日本語 / 利用規約 / 法的事項 / プライバシーポリシー / サイトマップ / プライバシーに関する選択
- aria: 「トップに戻る」「地域メニュー. 現在: 日本」

文章レベルの説明 copy は footer に存在しない（paraphrase 対象なし）。

---

## 4. motion 仮説

スクロール連動・ループは **なし**（animations.json の 14 件は全て hero 回転語。footer 該当ゼロ）。CSS transition のみ:

| 対象 | DOM クラス | 挙動 |
|---|---|---|
| 全リンク | `transition-colors duration-200 hover:text-white` | hover で #A1A1AA → #FFF（200ms） |
| SNS アイコン | `hover:opacity-70 transition-opacity duration-200` | hover で opacity 1 → 0.7 |
| chevron | `transition-transform duration-200` | dropdown 開時に rotate-180 と推定 — **要実測**（開状態未キャプチャ） |
| 言語 dropdown | `style="display:none"` ⇄ 表示、`aria-expanded` 切替 | 開閉に fade/slide が付くか **要実測**（display 切替だけの可能性大） |
| mobile 背景 overlay | `transition-opacity bg-black opacity-0 pointer-events-none` | sm 未満で dropdown 開時に黒幕 fade-in と推定 — **要実測** |

`motion-reduce:transition-none` が overlay に付与 → reduced-motion 対応を踏襲。

---

## 5. アセット置換計画

**本家 CDN アセットの DL/複製は禁止。** 全て (a) CSS/SVG モック:

| 本家アセット | 置換 |
|---|---|
| Shopify バッグロゴ（`#logo-shopify-bag` sprite） | (a) **架空「Konoha」ロゴ SVG を自作**（葉モチーフの白いワンカラーマーク、44×50 viewBox）。本家バッグ形状をトレースしない |
| 地球儀アイコン | (a) lucide-react 風の globe を inline SVG で自作（16×16, stroke/fill 白） |
| chevron / チェック | (a) inline SVG 自作（16×16 / 30×30） |
| SNS 7 アイコン（FB/X/YouTube/IG/TikTok/LinkedIn/Pinterest sprite） | (a) **simple-icons 等 OSS グリフ or 自作の白丸+黒イニシャル SVG**（32×32）。学習用なので「白円に F / X / ▶ / 回形 / ♪ / in / P」の簡易自作で十分 |
| CCPA opt-out アイコン（cdn.shopify.com の svg, 30×14） | (a) CSS/SVG モック: 青い角丸ピル + 白チェック + ✕ の簡易再現 |

画像・動画アセットなし（AI 生成不要）。

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/
├─ Footer.tsx            // named export: Footer（section 本体）
├─ FooterLinkColumn.tsx  // named export: FooterLinkColumn（h3 + リンク ul、props: title, links[]）
└─ FooterRegionSelector.tsx // named export: FooterRegionSelector（button + dropdown）
```

- **Footer**: state/effect 不要。データは定数配列（`{ title, links: { label, href }[] }[]`）をファイル内定義。
  - ルート: `<footer class="relative grid grid-cols-5 gap-x-8 gap-y-14 bg-black px-24 py-20 text-[#A1A1AA]">`（md 未満は `max-md:flex max-md:flex-col` 系に縮退）
  - 罫線色は arbitrary `border-[#121C1E]` か `@theme` トークン追加
- **FooterLinkColumn**: 純表示、props のみ。
- **FooterRegionSelector**: `useState<boolean>`（open）+ click-outside 用 `useEffect`（`pointerdown` listener）。dropdown は motion/react `<AnimatePresence>` + `<motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.2}}>` で開閉（本家は display 切替だが学習再現として fade を許容、要実測後に合わせ込み）。地域データは 5-6 件のダミーで縮約可（66rem パネル + columns-4 の構造だけ再現）。
- hover 系は全て Tailwind の `transition-colors duration-200` / `hover:opacity-70` で実装、motion/react 不要。
- a11y: `aria-expanded` / `aria-controls` / `aria-label`（トップに戻る・地域メニュー）を踏襲。SNS リンクは `aria-label` + `target="_blank" rel="noopener noreferrer"`。

### PASS 条件

1. 1425px 幅で px-96 / py-80 / 5 カラム / カラムピッチ ≈ 257px が screenshot と一致
2. 色 4 値（#000 / #A1A1AA / #FFF / #121C1E）一致
3. hover 3 種（リンク白化 200ms / SNS opacity 0.7 / chevron）動作
4. 本家アセット 0 個（全 SVG 自作 / Konoha ロゴ）
