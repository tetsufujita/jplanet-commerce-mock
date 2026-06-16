# build-plan — Shopify JP 再現（specs 01–14 統合）

> 入力: `specs/01-hero.md` 〜 `specs/14-footer.md`（2026-06-10 抽出）。
> 本書は ①アセット生成リスト ②共有 component ③ビルド順序 ④要実測統合、の 4 部構成。
> 本家 CDN アセットの DL / 複製は全 section 共通で禁止。架空ブランド名は **konoha 系で統一**（spec 間で Storely / Storefy の揺れあり → 実装時に 1 つへ統一すること）。

---

## 1. アセット生成リスト（AI 生成、優先度順）

> 生成は本書の scope 外。リストとプロンプト案のみ。出力先は `design/reproductions/shopify-jp/assets/` を推奨。
> Higgsfield recipe は memory `reference_higgsfield-hero-video.md` 参照（upload→generate→poll→DL、720p/5s ≈ 22.5cr）。

### P1 — hero 背景（最大面積・ページの顔）【01-hero】

| # | 種別 | サイズ | 用途 | プロンプト案 |
|---|---|---|---|---|
| A1 | 画像 | 1920×1080 | hero poster + 動画の元絵 | 「暖色照明の室内倉庫兼スタジオ。若い商人 2-3 人が出荷作業の合間に歓喜している。手前に商品の段ボール箱とパッケージ、奥にラック。シネマティック、dark grade、浅い被写界深度、ブランドロゴなし」 |
| A2 | 動画 | 1280×720 / 5s loop | hero 背景 `<video autoplay muted loop playsinline poster>` | A1 を image→video。「緩い手持ちカメラ感の push-in、人物は小さな自然動作のみ、照明のゆらぎ。ループ前提で大きな構図変化なし」 |

### P2 — CTA フォトカード ×8【13-cta】

| # | 種別 | サイズ | 用途 | プロンプト案 |
|---|---|---|---|---|
| B1-4 | 画像 ×4 | 575×794 縦 | カード A crossfade | ①陶器工房で器を検品する手元 ②アパレル作業場でミシンと生地 ③コスメ商品の撮影風景 ④梱包・発送作業。共通: warm tone、実在ロゴなし、生活感のあるドキュメンタリー調 |
| B5-8 | 画像 ×4 | 575×745 縦 | カード B crossfade | ①店頭で客に紙袋を手渡す ②スマホで店舗管理画面を見る店主 ③花屋の店先 ④カフェカウンター。共通トーン同上 |

### P3 — merchant screenshot ×12【02-logos】（暫定は CSS モックで先行可）

| # | 種別 | サイズ | 用途 | プロンプト案 |
|---|---|---|---|---|
| C1-8 | 画像 ×8 | 1046×800（wide） | カルーセル panel | 「架空ブランド {名} の EC サイト hero 画面。大きな wordmark + ナビ帯 + 商品写真」。ブランド: Lumera(ジュエリー)/glowie(コスメ)/Claypath(陶磁器)/Kissaten(コーヒー器具)/Voyara(スーツケース)/Mochiko(雑貨)/Sumika(テーブルウェア)/Yorulin(寝具) — 各カテゴリ相応の色味 |
| C9-12 | 画像 ×4 | 454×800（narrow） | 同上（mobile UI 風） | DECKROW(スケートアパレル)/Homari(クッション)/Tundra Co.(ボトル)/Finchley(アパレル) のスマホ表示風 screenshot |

### P4 — 商品物撮り ×6【05-global】

| # | 種別 | サイズ | 用途 | プロンプト案 |
|---|---|---|---|---|
| D1-6 | 画像 ×6 | 812×904 | 商品カードスタック | バッグ / スニーカー / コスメ瓶 / マグ / キャンドル / 帽子 の単品物撮り。ニュートラル背景、ソフトライト、ブランド表記なし |

### P5 — 単発（要実測後に構図確定）

| # | 種別 | サイズ | 用途 | プロンプト案 |
|---|---|---|---|---|
| E1 | 画像 | 横長 | POS 端末【04-sell-more】 | 「ダークスタジオ背景、teal 照明のカード決済端末。ブランド表記なし、製品写真調」（lazy 未ロードのため実測後に確定） |
| E2 | 画像 | 930:828 縦 | founder poster【07-sidekick】 | 「暗めの店舗で自社商品を手にする架空 founder のポートレート、映画的ライティング、ロゴなし」 |
| E3 | 動画(任意) | 5s | E2 の click 再生用【07】 | E2 を image→video、人物の僅かな動きのみ。初期実装は再生 stub で省略可 |
| E4 | 画像(条件付き) ×3 | h300 相当 | media slot【06-scale】 | 要実測で slot に media が出ると判明した場合のみ（アパレル物撮り / アスレジャー / 食品再流通、dark trim） |

### AI 生成不要（全て CSS/SVG/DOM モック）

03-chat（チャットデモ・AI アイコン 3 種）/ 08-apps（ロゴコラージュ）/ 09-devs（card 中身・コード SVG・ロゴ）/ 10-build-env / 11-checkout（UI モック・バッジ）/ 12-speed（globe SVG）/ 14-footer（全アイコン）/ 06-scale ロゴ marquee（架空 wordmark SVG ×8 自作）

---

## 2. 共有 component 候補

| component | 内容 | 使用 section |
|---|---|---|
| **tokens（@theme）** | 色: `#02090A`(dark-bg) `#061A1C`(deep-green) `#000A1E`(deep-navy) `#041E18`(deep-pine) `#010624` `#060607` `#36F4A4`(avocado) `#9DABAD` `#95959F` `#9797A2` `#99B3AD` `#A1A1AA` 等 / spacing xs〜4xl（暫定 8/12/16/32/48/64/80/96） / type t2(70) t3(55/330/64) t4(≈45-48) t7(≈18-20) body-sm b3 b4 / radius / shadow。**全 section が依存、最初に作る** | 全部 |
| **Container** | 幅 1260px・左右 margin 90px @1440（要実測で確定） | 全部 |
| **SectionShell** | `<section data-mode="dark">` + bg token + py token + Container。grid gap-y-2xl 共通骨格 | 全部 |
| **SectionHeading** | h3 text-t3（55/330/64・白）+ 任意の右カラム説明 p（w-3/5 + w-2/5 型） | 04 05 06 08 09 |
| **PillButton** | radius 9999px / 18px / w550 / padding 12×24 / border-2。variant: `primary-white`（白地黒字: 01 13）/ `outline-white`（透明+白縁: 01 06）/ play icon 付き（01） | 01 06 13 |
| **Marquee** | CSS keyframes（`translateX(calc(-100%−gap))→0`）+ `@theme` の `--animate-*`。props: duration（06=60s / 08=240s）/ gap / pauseOnHover（08）/ `motion-reduce:` 静的 wrap fallback | 06 08 |
| **VideoFrame** | `autoplay loop muted playsinline preload poster` + 読込後 opacity 0→1（300ms ease-out-cubic）+ `useReducedMotion()` で poster 静止画 | 01 03 04 07 |
| **DarkCard** | `rounded-xl overflow-hidden` + border-t hairline + bg deep-green + shadow-card。variant `rounded-2xl`（03 09 canvas） | 03 04 05 07 09 |
| **CaptionBlock** | h4 text-t7 白 + p text-body-sm gray + 文中リンク（下線 / `hover:text-white hover:no-underline`） | 04 05 07 |
| **GlowEllipse** | absolute radial-gradient 楕円（cqw 指定 + rotate/scale を props 化、`container-type: inline-size` 親前提、`aria-hidden`） | 04(×3) 05(×8) 09(×3) 11 12 |
| **RoundedTopLid** | 上 2 角 `rounded-t-4xl/5xl` + 裏地 wrapper（前 section 色）+ `-mb`/spacer の被せ演出 | 01(::after帯) 07 10 13（06 の spacer も関連） |
| **useRevealInView** | IO once + `opacity-0 translate-y-4` 解除（duration 500-1000ms、delay stagger を props 化）+ motion-safe | 08 11 13（04 07 09 12 も要実測次第で利用） |
| **useAutoCycle** | `setInterval` 巡回 + in-view 外で停止 + `useReducedMotion()` で無効 + click/hover でリセット | 02(タブ送り) 05(国旗/カード) 13(crossfade) |
| **TextLink** | 下線リンク共通スタイル（gray→white hover） | 03 04 05 07 08 09 11 |

---

## 3. ビルド順序の推奨

> 原則: ①tokens → ②小さく静的な section で token 検証 → ③パターン定義 section → ④複雑 section、の順。色 zone（dark→navy→pine→gradient→black）単位でまとめると境界の継ぎ目検証が楽。
> アセット依存（01 02 05 13）は CSS placeholder で先行ビルドし、生成完了後に差替え。

| phase | 対象 | 理由 / 依存 |
|---|---|---|
| 0 | tokens + Container + SectionShell + PillButton + VideoFrame + Marquee + DarkCard + CaptionBlock + GlowEllipse + useRevealInView + useAutoCycle | 全 section の前提 |
| 1 | **10-build-env** → **14-footer** | 最小・完全静的。token（t2 70px / w330 / 角丸 / pine・navy 色）の検証台 |
| 2 | **06-scale** → **11-checkout** | 06 で Marquee + PillButton、11 で useRevealInView（3 層 stagger）+ GlowEllipse のパターン確立。両方アセット不要 |
| 3 | **04-sell-more** → **05-global** → **03-chat** → **07-sidekick** | deep-green カード zone。04 で DarkCard/Caption/glow の型 → 05 が最複雑（カルーセル同期は 04 の型 + useAutoCycle に依存）→ 03/07 は DOM モックデモ |
| 4 | **08-apps** → **09-devs** | navy zone。08 は Marquee 変奏（240s + spotlight）、09 は最複雑の絶対配置 + border-glow（独立だが工数大） |
| 5 | **12-speed** → **13-cta** | pine zone 残り。12 の globe SVG モックは独立工数大。13 は useRevealInView + useAutoCycle + RoundedTopLid の総合 |
| 6 | **01-hero** → **02-logos** | 01 は回転 H1（最重要 motion）+ 生成動画依存 → P1 アセット完了後に動画差替え。02 は 12 枚画像依存（CSS モックで先行可）。※ 01 は現行 task で着手済のため、その場合は phase 6 を「アセット差替えのみ」に読み替え |
| 7 | **page 結合 + 縦リズム検証** | section 間の被せ（hero 黒帯→02、06 spacer→07 lid、09→10 lid、12→13 lid）と色 zone 継ぎ目を通しで diff。その後 §4 の実測ループへ |

---

## 4. 要実測 統合リスト（Playwright / chrome-devtools で後測）

### A. グローバル token 系（1 回の getComputedStyle 走査でまとめて取る）

| # | 項目 | 関連 spec |
|---|---|---|
| A1 | spacing token 実値（xs/sm/md/lg/xl/2xl/3xl/4xl の clamp 解決値 @1440。08 で 2xl=64 / 3xl=80 確定済、残りを確定） | 01 04 06 08 11 12 13 |
| A2 | `.container` max-width / `--margin`（左右 90px 仮）/ 左右 padding | 01 08 10 11 |
| A3 | typography 実値: text-body-base(01) / t4(11 12 13) / t7(04 05 06 07) / body-sm(03 04 05 06 07 11) / b3(08 09 12) / b4(09) / body-lg(13) の fs・lh・weight | 左記 |
| A4 | 色 token 正値: coal-black・section-dark-bg(01) / gray-c(04 06) / gray-d(08 09) / avocado 正式 hex(11 13) / hairline の rgba(04 05) | 左記 |
| A5 | radius 実値: `rounded-t-4xl` / `rounded-t-5xl`（01 07 10 13）、card `rounded-xl` | 左記 |
| A6 | shadow 実値: `shadow-card`(04 07) / `shadow-hero-ab-card-edge`(01) / `shadow-dev-image-container`・`shadow-dev-label-container`・`bg-devCard`(09) | 左記 |
| A7 | button hover token（primary 白→淡グレー bg / secondary border 色） | 01 06 13 |
| A8 | breakpoint 帯域確定（1425/1440 は lg か xl か → 09 の xl 値・10 の H2 幅が決まる） | 09 10 |

### B. section 別挙動系（scroll + frame burst + interaction）

| spec | 要実測 |
|---|---|
| 01-hero | 回転語の全周ループ順序と駆動方式（transitionend 連鎖 or interval）/ `translate-y-100` の実体（100% or 400px）/ PIP ボタンの出現トリガー |
| 02-logos | タブ自動送り間隔・発火条件（in-view 限定か）/ スライド duration・easing / `bg-ab-control` の正体（文字 fill 進行）/ lg での pointer drag 可否 |
| 03-chat | デモ動画の全尺ストーリーボード（frame burst）/ 動画フェードイン発火条件 / scroll 進入 reveal の有無 |
| 04-sell-more | lazy mount 閾値 / checkout 縦 feed の自動スクロール有無 / リンク hover / 入場 reveal 有無 / section 下端 38px と pb-2xl=64 の不整合 |
| 05-global | カルーセル進行間隔・easing / `card-left/right` の transform 実値 / pill の国別変化 / 3 シーン切替トリガー / 世界地図の実体（canvas/SVG/img） |
| 06-scale | カード media slot の本番挙動（hover/lazy で media 出現か）/ mobile snap 時 transition / CTA hover の色反転 / marquee 進行方向の目視確認 |
| 07-sidekick | Card B click 再生の遷移詳細 / sparkle icon の実体と micro アニメ / section 入場アニメ有無 |
| 08-apps | 入場フェードの IO threshold と見出し/marquee の stagger / spotlight のマウス追従実装（更新頻度・円サイズ）/ コラージュ内カード行数・密度（目視のみ） |
| 09-devs | border-glow の視覚実体（色・長さ・offset-path）と再生トリガー / fork SVG の hover keyframes / `dev-*-card` 入場アニメ有無 / p 内 link hover |
| 10-build-env | scroll 時の「蓋が被さる」演出（前 section sticky 下敷き）の有無 |
| 11-checkout | reveal トリガー（IO 閾値・once か・easing）/ ::before blurred-ellipse のサイズ・blur・色 / 数値 count-up 無しの最終確認 / 統計アイコン SVG の形状 |
| 12-speed | globe の mount トリガー・回転速度・弧の cadence・色（進入後 frame burst）/ deco bg の実画像 / テキスト reveal 有無 / section 実高さと次 section の被り量 |
| 13-cta | `bg-conversion-gradient` の computed 値 / crossfade の駆動（interval ms・3 ステップとの同期・hover/focus 連動）/ active 行の色変化 / 入場 reveal threshold |
| 14-footer | chevron の rotate-180 / 言語 dropdown の開閉アニメ有無 / mobile 黒幕 overlay の挙動 |

> 実測手順は task #7（verify ループ）に接続: A 系 → getComputedStyle 一括スクリプト、B 系 → scroll 駆動 + frame burst + pixelmatch diff。
