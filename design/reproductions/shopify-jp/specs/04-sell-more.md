# 04-sell-more — build spec（学習用再現）

> 対象: Shopify JP homepage `data-section-name="online-and-in-person"`（`home-online-section`）
> ページ内位置: top 2207px / 高さ 1625px（viewport 1440px、キャプチャ 1425px 幅）
> **DOM 判定の重要発見**: 事前観察メモの「タブ/スクロール切替の可能性」は **この section には無い**。`role="tablist"` は次の section（`data-section-name="a-b"`）のもの。04 は静的レイアウト + 動画ループのみ。
> 右上に重なる小窓動画（「Shopifyが開発されるまで」pip ボタン）は **section 外の floating 要素**。本 section の再現対象外。

---

## 1. レイアウト構造

```
<section> bg #02090A（bg-section-dark-bg）/ dark mode / pt-2xl(64px) pb-2xl
└ container（幅 1260px、左右 margin 90px @1440）
   ├ ヘッダー行（pb-2xl=64px）: flex / sm:items-baseline
   │   ├ 左カラム w-3/5（756px、pr-lg=32px）… h3 見出し
   │   └ 右カラム w-2/5（504px）… 説明 p（実測グリフ左端 x≈903 — 要実測）
   ├ 大カード行（grid 1col、mb-md=16px）… card-ose（動画 showcase）
   └ サブカード行（grid md:grid-cols-3、gap-md=16px）… card-channels / card-pos / card-checkout
```

### 実測 px（キャプチャ local 座標、section top = 0）

| 要素 | x | y | サイズ |
|---|---|---|---|
| h3 見出し（グリフ） | 95–784 | 85–198（2 行） | 行送り 64px |
| 説明 p（グリフ） | 903–1345 | 135–195（3 行） | 行送り 22.5px |
| 大カード card-ose | 90–1350 | 267–874 | 1260×607 |
| 大カード内 video | 中央寄せ | — | 1148×598（上下 inset 約 5px、左右 約 56px） |
| サブカード ×3 | 90–499 / 515–925 / 941–1350 | 890–1587 | 各 409×697、gap 16px |
| カードテキスト左 inset | — | — | px-lg = 32px（グリフ実測 35px） |
| カード下 inset | — | — | pb-lg = 32px（最終行グリフ→カード底 35px） |

### spacing token（クラス名と実測の突合）

| token | 推定 px | 根拠 |
|---|---|---|
| xs | 8 | h4→本文間 `md:mb-xs`（実測 約 10px） |
| sm | 12 | `mb-sm`（mobile 用） |
| md | 16 | `gap-md` `mb-md` 実測 16px ✔ |
| lg | 32 | `px-lg` `pb-lg` `pr-lg` 実測 32px ✔ |
| 2xl | 64 | ヘッダー下→大カード間 実測 約 61px ✔ |

⚠ 不整合: section 下端は最終カードから **38px**（pb-2xl=64 と合わない）。切り抜き境界か次 section の食い込みの可能性 → **要実測**。

### 色

| 用途 | 値 |
|---|---|
| section 背景 | `#02090A` |
| カード基調（deep-green） | `#061A1C` |
| 大カード背景 | `linear-gradient(0deg, #061518 20%, #0A2C30)` |
| カード上端 hairline（border-t） | 実測 `#1E2C31`〜`#123336`、≈ `#1C3A3D` 1px（要実測: rgba の可能性） |
| 見出し / h4 | `#FFFFFF` |
| ヘッダー説明文（gray-c） | ≈ `#95959F`（寒色グレー） |
| カード本文（gray-a） | ≈ `#9DABAD`（teal がかったグレー） |
| glow（カード別） | 下記 §2 参照 |

---

## 2. 要素インベントリ

### 2-1. ヘッダー行

| 要素 | 字形 | 値 |
|---|---|---|
| h3（text-t3） | Noto Sans JP | **55px / fw330 / lh64px**、白、2 行折返し |
| p（text-body-sm, gray-c） | Noto Sans JP | **16px / fw400 / lh22.5px**（要実測: 15px/1.5 の可能性）|
| p 内リンク | 下線付き、本文より明るい（白寄り） | hover で色変化（要実測） |

### 2-2. 大カード card-ose（ストア編集画面 showcase）

- 1260×607、`rounded-xl`（実測コーナー半径 ≈ **8–10px**）、overflow-hidden、border-t hairline、shadow-card（値 要実測）
- 背景: `linear-gradient(0deg,#061518 20%,#0A2C30)`（Safari fallback は単色 deep-green）
- 内側に video 1148×598（aspect 1920/1000）、autoplay / loop / muted / playsinline / preload=auto、poster あり
- video に `transition-opacity duration-300 ease-out-cubic`（読み込み完了で fade-in）

### 2-3. サブカード ×3（共通骨格）

各カード: 409×697、rounded-xl、overflow-hidden、border-t hairline、bg deep-green `#061A1C`、`flex flex-col justify-between`（メディアが上で伸び、テキストが底に張り付く）、`container-type: inline-size`（glow を cqw 指定）

絶対配置の glow 楕円（z-0、radial-gradient、rounded-[340px]）— 1cqw = 4.09px:

| カード | glow 位置 / サイズ | gradient | 変形 |
|---|---|---|---|
| channels | top 18cqw / left 4cqw / 84×70cqw | `radial(#1C4E50, #133032 34%, #091A1C 70%, #061A1C)` | scale 1.6 / rotate 53deg |
| pos | top 17cqw / left 20cqw / 83×75cqw | `radial(#3E4646, #0F3335 40%, #061A1C 70%, #061A1C)` | scale 1.8 |
| checkout | top 32cqw / left 6cqw / 84×84cqw | `radial(#2A4344, rgb(6 26 28) 70%, #061A1C)` | scale 1.6 |

テキストブロック（z-10、`px-lg pb-lg pt-md sm:pt-lg`、max-w 65ch）:

| 要素 | 字形 |
|---|---|
| h4（text-t7） | **18px / lh28px**、白、fw 500 前後（要実測）。下マージン xs=8px |
| 本文（text-body-sm, gray-a） | 16px / lh22.5px、`#9DABAD`、リンク下線付き |

メディア領域（カード別、**キャプチャ時点では 3 枚とも lazy 未ロード**）:

| カード | DOM 上のメディア | 実測手掛かり |
|---|---|---|
| channels | `<video>` aspect 407/484、src 無し（lazy 注入） | specs.json の空 video（top 3266, 300×150 placeholder） |
| pos | 空 div `sm:h-[600px] md:h-full flex items-center`（lazy） | 中央に POS 端末画像が入ると推定（要実測） |
| checkout | div `aspect-ratio:9/11` data-nosnippet（lazy） | 40×29 の img が縦に 76px 間隔で 6+ 枚（page top 3455–3835）→ 縦 feed 状 UI と推定 |

---

## 3. テキスト計画（説明 copy は paraphrase 済・逐語コピー禁止対応）

| 位置 | 原文（見出し・ラベルは原文 OK） | 再現で使う copy |
|---|---|---|
| h3 | より多くの場所で、より多くの販売を | そのまま使用 |
| ヘッダー p | （原文は逐語コピー禁止） | 「販売に必要な機能を最初から備えた、印象に残るストアを作れます。AI による素早いデザインも、用意されたテーマも、ゼロからの作り込みも選べます。」（リンク部=「印象に残るストアを作れます」） |
| card-channels h4 | あらゆるチャネルで販売 | そのまま使用 |
| card-channels p | （paraphrase） | 「複数チャネルとつながることで、お客様が探し、購入し、眺めるすべての接点に商品を届けられます。」（リンク部=「複数チャネルとつながる」） |
| card-pos h4 | 対面販売を強化する | そのまま使用 |
| card-pos p | （paraphrase / 商品名置換） | 「店頭でもそのまま販売。レジ端末「konoha POS」なら、ネットと実店舗の売上をひとつにまとめて管理できます。」（リンク部=「konoha POS」） |
| card-checkout h4 | Shop を通じて 2億5,000万人以上の買い物客に販売 | 「konoha アプリで 2億5,000万人以上の買い物客にリーチ」（架空アプリ名に置換） |
| card-checkout p | （paraphrase） | 「商品は konoha アプリへ自動で掲載。本人確認済みの膨大な買い物客層へそのまま届きます。」（リンク部=「konoha アプリ」） |

---

## 4. motion 仮説

| # | 挙動 | 根拠 | 確度 |
|---|---|---|---|
| 1 | 全 video は autoplay / loop / muted の **無限ループ**。スクロール連動・タブ切替は無し | DOM 属性。tablist は次 section | 高 |
| 2 | video 読み込み完了時に **opacity 0→1 の 300ms fade**（ease-out-cubic） | `transition-opacity ease-out-cubic duration-300 opacity-100` | 高 |
| 3 | サブカードのメディアは **viewport 接近で lazy mount**（channels の src 空、pos / checkout の空 div） | キャプチャ DOM が空 | 高（mount トリガー閾値は **要実測**） |
| 4 | card-checkout は縦 feed（aspect 9/11）内で小要素が並ぶ。**自動縦スクロール（marquee）か静止か → 要実測** | 40×29 img が 76px 等間隔 | 中 |
| 5 | glow は静的（animations.json に該当アニメ無し。検出された `loop` / `scroll-x` / `logo-group-marquee` は全て他 section） | animations.json 14 件を全件照合 | 高 |
| 6 | カード自体の hover 変形は無し（hover 系クラス無し）。リンク hover の下線/色変化のみ → **要実測** | DOM クラス | 中 |
| 7 | section 入場時の reveal（fade/slide）有無 → **要実測**（`data-viewable-component` は計測用の可能性大） | — | 低 |
| 8 | `prefers-reduced-motion` 時は video 停止 + 静止 poster 表示にする（再現側の方針） | 本家は motion-safe 規約あり | — |

**要実測 まとめ（6 件）**: ③mount 閾値 / ④checkout feed の自動スクロール有無 / ⑥リンク hover / ⑦入場 reveal / shadow-card の値 / section 下端 38px と pb-2xl=64 の不整合。

---

## 5. アセット置換計画（本家 CDN の DL・複製は禁止）

| アセット | 本家の内容 | 置換方法 |
|---|---|---|
| 大カード video（1148×598、ストア編集 UI モンタージュ） | admin/editor 画面録画 | **(a) CSS/DOM モック**: 架空ストア「konoha」の編集画面風 UI を HTML で組み、motion/react のタイムラインで「テーマ切替→色変更→公開」を 8 秒ループ再生。UI 録画系は生成動画より DOM モックの方が線が立つ |
| 大カード poster | 同上の静止画 | DOM モックの初期フレーム（poster 不要、reduced-motion 時は静止状態） |
| channels video（縦 407/484、SNS feed 風） | 携帯画面に各チャネルの商品表示 | **(a) CSS/SVG モック**: 角丸スマホ枠 + 架空 SNS の feed カードが縦に流れる CSS keyframes ループ。SNS 名は架空（「Pictogram」「ClipClap」等） |
| pos メディア（lazy、POS 端末写真と推定） | ハードウェア写真 | **(b) AI 生成画像**: 「ダークスタジオ背景・teal 照明のカードリーダー端末、ブランド表記なし」を Higgsfield で生成（要実測後に構図確定） |
| checkout 縦 feed（aspect 9/11、40×29 img ×6+） | Shop アプリの商品 feed | **(a) CSS モック**: 架空ブランドロゴ（konoha / Yamabiko / SORA 等のテキストロゴ）入り商品行を 76px ピッチで縦に並べ、必要なら marquee 縦ループ |
| glow ×3 | CSS radial-gradient | そのまま CSS で再現（§2-3 の値）|
| hairline / shadow | CSS | CSS で再現 |

---

## 6. component 設計（React 19 + Tailwind 4 + motion/react）

```
src/shopify-jp/sections/SellMoreSection.tsx   ← named export: SellMoreSection
src/shopify-jp/sections/sell-more/
  ├ EditorShowcaseCard.tsx    ← 大カード（DOM モック動画。named export）
  ├ SellChannelCard.tsx       ← サブカード共通枠（glow 設定 / メディア / テキストを props で受ける）
  └ media/                    ← ChannelsFeedMock / PosImage / CheckoutFeedMock
```

- **token**: `@theme` に `--color-sjp-bg: #02090A` `--color-sjp-deep-green: #061A1C` `--color-sjp-gray-a: #9DABAD` `--color-sjp-gray-c: #95959F` `--color-sjp-hairline: #1C3A3D` を追加（hex 直書き禁止ルールに従い token 化）
- **state**: 不要（タブ無し）。`useState` ゼロで成立
- **effect**: lazy mount は motion/react の `useInView`（`once: true, margin: "0px 0px -20% 0px"`）→ メディア子要素を mount + `animate={{ opacity: [0,1] }}`（300ms, easeOut）。`useEffect` 直書きは不要
- **ループ動作**: feed / 編集画面モックは CSS keyframes（`motion-safe:` 付き）優先。複雑な編集 UI シーケンスのみ motion/react の `useAnimate` でループ
- **a11y**: glow / メディア装飾は `aria-hidden`、reduced-motion でアニメ停止
- **データ**: 3 サブカードは配列（h4 / 本文 / リンク / glow 設定 / メディア component）で map。文言は i18n 集約ルール対象外（study reproduction 専用 copy として section 内 const で保持 — 本番 site とは分離）
```

