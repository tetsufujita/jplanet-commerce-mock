# 03-chat — ブランドがチャットに登場（agentic section）

> 学習用再現 spec。実測ソース: shots/03-chat.png（1425×646）/ DOM `data-section-name="agentic"` / specs.json / animations.json
> ページ内位置: top 1561px / 高さ 646px（viewport 1440px、capture 1425px）

---

## 1. レイアウト構造

```
<section>  bg #02090A（page dark bg）・pt 64px / pb 64px（pt-2xl/pb-2xl 実測 64px）
└─ container  幅 1260px・左右 margin 90px（@1440vp）
   └─ card  grid grid-cols-1 md:grid-cols-2（630px × 2）
      ├─ 左列: 図像 + テキスト（flex-col gap-16px、p 40px、md:justify-between）
      └─ 右列: チャットデモ動画（items-center justify-center、md:p-0）
```

| 項目 | 値 |
|---|---|
| section 背景 | `#02090A`（実測 pixel と nav の `bg-[#02090a]` 一致） |
| section padding | 上下 64px（`pt-2xl pb-2xl`、実測: section 1561 → card 1625） |
| card サイズ | 1260 × 約 519–524px（右列の video 高がドライバ） |
| card 角丸 | 16px（`rounded-2xl`） |
| card 背景 | base `#061A1C`、md 以上 `linear-gradient(290.7deg, #061A1C 58.79%, #0D3A2D 100%)`（左上が緑に発光） |
| card 縁 | `::after` 全面 overlay に `inset 0 1px 0 0 rgba(64,71,77,0.4)`（上辺 1px ハイライト hairline、pointer-events-none、rounded-2xl） |
| 左列 padding | 40px（`md:p-10`。mobile は 24px `p-6`） |
| 左列構造 | `flex flex-col gap-4 md:justify-between` → アイコン群が上端、テキスト塊が下端に張り付く |
| 右列 | `flex items-center justify-center pt-6 md:p-0`、内側 div `w-full` + `aspect-ratio: 2090/1742` |

実測座標（card 左上原点）: アイコン円 top 40px / H2 1行目 glyph top 266px / 段落 1行目 glyph top 404px / 段落終端 ≈496px + 下 padding 40px。

## 2. 要素インベントリ

### 2-1. AI チャネルアイコン群（左列上端）
- 白円 ×3、横並び・重なり。円: 56px（`size-14`、mobile 40px）、`bg-white rounded-full`
- 重なり: 2個目以降 `-ml-4`（−16px）、z-index 3→2→1（左が手前）。群全体幅 136px（56×3 − 16×2、実測一致）
- 影: `0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2)`
- 中のロゴ img: 28px（`size-7`、mobile 20px）。本家 = ChatGPT(svg) / Google(png) / Copilot(svg)

### 2-2. H2
- テキスト: 「ブランドがチャットに登場」
- `text-t3`: **55px / weight 330 / line-height 64px** / `#FFFFFF` / `"Noto Sans JP", Helvetica, Arial, sans-serif`（specs.json 実測）
- `text-balance` で 6 文字 ×2 行（「ブランドがチ / ャットに登場」）に均等折返し → 描画幅 ≈330px

### 2-3. 説明段落
- `text-body-sm`: **font-size ≈16px / line-height 23px（行送り実測 23px）** / weight 400 / 色 `#9DABAD`（`text-gray-a`、実測最頻値）→ 正確な fs/lh は **要実測**（getComputedStyle）
- `lg:max-w-3/4` → 左列内コンテンツ幅 550px の 3/4 ≈ **406px**（実測 ≈404px）、4 行
- H2 との間隔: 16px（`gap-4`）
- 文中リンク: 下線あり、`hover:text-white hover:no-underline`

### 2-4. デモ動画（右列）
- 本家: webm + poster png（2090×1742）、**描画 622×519**、`object-cover h-full w-full`、`autoplay loop muted playsinline preload="auto"`
- 表示制御 class: `transition-opacity ease-out-cubic duration-300 opacity-100`（読み込み完了で opacity 0→100 のフェードイン）
- 内容（キャプチャ時 frame）: 暗背景に緑のニットセーターが浮遊 + 光のスパーク。チャット UI 内で商品提示→チェックアウトのデモと推定 → **全尺ストーリーボードは要実測**（frame burst）

## 3. テキスト計画

| 要素 | 採用テキスト | 備考 |
|---|---|---|
| H2 | ブランドがチャットに登場 | 短い機能的見出し → 原文 OK |
| 段落 | AI アシスタント上で商品が見つかり、買い物客は会話の流れのままチェックアウトまで完了。注文状況の追跡にも対応します。この体験を支えるのが、Agent Storefront です。 | 同長・同義の新規 paraphrase（逐語コピー禁止対応）。約 80 字 / 4 行 |
| 文中リンク | Agent Storefront | 本家の製品名「Agentic Storefronts」を架空名に置換。下線 + hover 挙動は §2-3 |

## 4. motion 仮説

| # | 挙動 | 根拠 | 確度 |
|---|---|---|---|
| 1 | 動画は autoplay + loop（スクロール非連動の常時ループ） | `autoplay loop muted playsinline` 属性 | 高 |
| 2 | 動画ロード完了時に 300ms フェードイン（`ease-out-cubic` = cubic-bezier(0.33,1,0.68,1)） | `transition-opacity ease-out-cubic duration-300`、capture 時は `opacity-100` | 中 — mount/lazy 切替条件は **要実測** |
| 3 | リンク hover: gray→white + 下線消失（CSS transition のみ） | `[&_a]:hover:text-white [&_a]:hover:no-underline` | 高 |
| 4 | section 自体のスクロール出現アニメは**なし**と推定 | animations.json の 14 件は全て hero / marquee 系。`data-viewable-component="true"` は計測タグであってアニメではない | 中 — viewport 進入時の挙動は **要実測** |
| 5 | アイコン群・カードに hover 反応なし | transition 系 class 不在 | 高 |

要実測まとめ（3 件）: ①動画の全尺ストーリーボード（frame burst） ②動画フェードインの発火条件 ③スクロール進入時に reveal が本当に無いか。

## 5. アセット置換計画（本家 CDN の DL / 複製は禁止）

| アセット | 本家 | 置換方法 |
|---|---|---|
| ChatGPT アイコン | svg 28px | **(a) CSS/SVG モック**: 架空 AI「Quill」— 単色の結び目風ストロークを inline SVG で自作 |
| Google アイコン | png 28px | **(a) CSS/SVG モック**: 架空検索「Loupe」— 4 色ではなく 2 色のシンプルな円弧グリフを自作 |
| Copilot アイコン | svg 28px | **(a) CSS/SVG モック**: 架空 assistant「Halo」— グラデーション付きリボン形を自作 |
| デモ動画（webm 622×519） | チャット内チェックアウトのデモ | **(a) CSS/SVG + motion/react モックを第一候補**: チャット bubble → 商品カード（架空ブランド「konoha」の緑ニット）→ 購入ボタン → 注文追跡、を DOM で組んだループアニメ。動きの再現度が要件になった場合のみ (c) Higgsfield 等で類似動画を生成（緑ニット浮遊 + 暗背景） |
| poster png | 2090×1742 | モック採用なら不要。(c) の場合は生成動画の初回 frame を流用 |

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/ChatSection.tsx   … section 本体（named export: ChatSection）
src/shopify-jp/sections/ChatDemoMock.tsx  … 右列デモのモックアニメ（named export: ChatDemoMock）
```

- **ChatSection**: 純 presentational。state / effect 不要。
  - 構造: `<section class="bg-[#02090A] py-16">` → container → card（`rounded-2xl overflow-hidden relative bg-[#061A1C] md:bg-[linear-gradient(290.7deg,#061A1C_58.79%,#0D3A2D_100%)] after:...shadow-[inset_0_1px_0_0_rgba(64,71,77,0.4)] grid md:grid-cols-2`）
  - アイコン円は配列 map（`{ name, svg }` ×3、z-index 降順 + `-ml-4`）
  - 色は study 用 token（`--color-repro-card: #061A1C` 等）を `@theme` に追加し hex 直書きを避ける
- **ChatDemoMock**: motion/react でチャットデモをループ再生。
  - `whileInView` + `viewport={{ once: false }}` で可視時のみ再生、`useReducedMotion()` 時は静止 frame
  - bubble 群を `motion.div` の `animate` keyframes + `transition={{ repeat: Infinity, repeatDelay }}` で順次出現 → state 不要。タイムライン制御が複雑になる場合のみ `useAnimate()`（effect 1 個）
  - 外形: `aspect-[2090/1742] w-full`、角丸なし（card 側の overflow-hidden が刈る）
  - 生成動画 (c) に切替える場合: `<video autoplay loop muted playsinline poster>` + `onCanPlay` で opacity 0→100（useState 1 個、duration-300 / ease-out-cubic）
- copy は study 専用のため section ローカル定数 or `ja.json` の `shopifyJp.chat.*` namespace（scaffold 側の方針に従う）
