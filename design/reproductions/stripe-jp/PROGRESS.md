# Stripe JP 再現 /loop — 進行管理

> 対象: https://stripe.com/jp（tracking param 除去済を正とする）
> 方式: Shopify JP と同じ measure → rebuild → diff。**hover/マウス操作モーションを含め全再現**（sir 指示 2026-06-11）。
> 出力先: 実装 `src/stripe-jp/`（/stripe-jp route 予定）/ 実測 `design/reproductions/stripe-jp/`

## タスク

| # | タスク | 状態 |
|---|---|---|
| 1 | 記録基盤 `scripts/record-stripe.mjs`（scroll + hover 2 本録画） | ✅ 2026-06-11 |
| 2 | 録画実行: rec-scroll.webm(26.4s) / rec-hover.webm(66.9s) + DOM + fullpage.png + hover-inventory.json | ✅ 2026-06-11 |
| 3 | storyboard 抽出 workflow（12 agents）→ `specs/01-motion-spec.md`（41 motions / 要精密測定 26 件） | ✅ wf_bbf260fa-8b5 |
| 4 | 実測 specs: `stripe-jp-specs.json` + `02-interactions.json`（megamenu 641 samples / ticker / marquee 30px/s） | ✅ P1-P5 解消 |
| 5 | scaffold: `src/stripe-jp/` + `/stripe-jp` route + token css + 10 section stub（typecheck 緑） | ✅ 2026-06-11 |
| 6 | section 実装 — 8 並列 workflow 完了（megamenu/marquee/ticker/bento/carousel/diagram 全実装） | ✅ wf_a783c7fd-533 |
| 7 | hover モーション実装: megamenu / ボタン arrow / カード hover（#6 に統合） | ✅ |
| 8 | QA loop: 高さ補正完了 — **全 section ±17px / 全体 +20px**（hero+2 / support 0 / global 0 / usecases-4 / devs+10 / news-4） | ✅ |
| 9 | `pnpm lint && typecheck && test && build` 緑 | ✅ 最終確認済 |
| 10 | アニメ実測補正: クローン録画 + frame 整列比較 + burst 8 spot + 20s 周期実測 → ambient 補正完了 | ✅ 一巡目 |

## アニメ QA 結果（2026-06-11 PM、全て Fable 直接実施）

- **megamenu**: panel 内容・morph・veil・退色・開閉時間 = 原本一致（frame 整列比較で確認）
- **burst 8 spot**: 動作有無 8/8 一致（testimonial / news carousel は両方静止 = 原本仕様）
- **20s 周期実測で確定した原本の ambient 仕様**（storyboard の誤読を補正）:
  - payments locale デモ / issuing カード柄 flip = **hover 駆動**（idle 静止）
  - connect merchant 巡回 = **時間駆動 ~11s 周期**（y2200 帯のクラスタ）
  - billing odometer = 小幅 random walk（上位桁安定）+ bars 微振動
- **修正済バグ**: ①megamenu open 中の サインイン cutout 退色（tint 0.38 で可読化）②Sessions card 写真化（原寸 crop を asset 化）③odometer 大ジャンプ→±15M walk ④payments/issuing hover 駆動化 ⑤connect 5.6s tick

## §4 dataviz 流動エフェクト（2026-06-11 16:30、sir 録画 rec-fluid.mov 対応）

- **P8 の正体判明**: 本家 §4 は WebGL canvas。headless 計測では static fallback PNG に退化していた（だから今までの計測で動きゼロ）。sir の実ブラウザ録画（55s、`recordings/rec-fluid.mov` + f-fluid/ 111 frames）で実体を確認
- **実装**: `SjGlobalDataviz.tsx` — 依存ゼロ canvas 2D 粒子システム（260 strands × 10 点）
  - 4 formation = stat 連動: burst(135+ 放射) / globe($1.9兆 回転粒子球) / wave(99.999% 進行正弦波) / strands(2億+ 蝶ネクタイ流線)
  - 形態内は常時流動、形態間は粒子モーフ（1.6s・strand 単位 stagger）
  - time-of-day theme 6 種に色追従（粒子色 + canvas 内の空 + warm glow を lerp）
  - reduced-motion = 従来の fallback 静止画 / 画面外 = IntersectionObserver で描画停止
- 検証: 4 形態 screenshot（shots/dataviz-*.png）+ ambient diff ~90k px/frame（動体確認）
- 調整履歴: globe は「全球分布→可視 cap ランダム分布 + R縮小」で dome 輪郭が出るまで 3 回補正

## §4 pointer 流体反応（2026-06-12、sir 録画 rec-pointer.mov 対応）

- 録画分析: カーソル周辺で粒子が**滑らかに反発して曲がり、離れると弾性で戻る**（repel field、影響半径 ~150px・最大変位 ~46px）
- 実装: `SjGlobalDataviz.tsx` に pointer events（mouse + touch 共通）
  - smoothstep falloff の radial repel / 場の位置は平滑追従（8/s）で流体的な遅れ
  - 強度 ease in 6/s・out 3/s = 弾性の戻り / `touch-action: pan-y` で縦スクロール非阻害
- 検証: hover diff 26,303（ambient 3,033 の ~9 倍 = 明確反応）→ leave 後 3,033（完全復帰）。shots/fix-pointer-hover.png で曲がり目視確認。全ゲート緑
- 録画 frames: `recordings/f-pointer/`（58 枚 @4fps、青 daytime テーマでの burst/strands 反応）

## §4 daytime 色味 pixel 実測補正（2026-06-12 14:30、rec-pointer f010 比較）

- 原本/クローンの同条件 screenshot から pixel sample → 3 差分を補正:
  ①sky 上端 209→238（原本 237、ほぼ白）②sky グラデ方向を逆転（上明→下青が正）③中心核 198→171（原本 147、burst 基底 alpha 0.2→0.35 + daytime glow を濃い青へ）
- 検証 script: `scripts/sample-colors.mjs`（4 点 7px 平均）

## §6 構成図 録画照合（2026-06-12 17:45、rec-diagram.mov = Downloads 14:03 取込）

- 原本 §6a 構成図の 11s 録画と clone を side-by-side 照合: 構造（pills 5 / SDK / イベント送信先 / App Marketplace / stripe 中心 / Data Pipeline / オーケストレーション / PSP / dot grid）・タイル配色・**app flip**・**PSP 多言語サイクル（日→葡→泰）**すべて一致。差分は flip の位相のみ（実装は健全）
- frames: `recordings/f-diagram/`（23 枚 @2fps）

## §4 性能実測（2026-06-12 16:05）

- 最重 formation（globe + ghost 弧 = 520 paths/frame）で rAF 間隔実測: **avg 8.46ms / p95 9.20ms / max 25ms** — 60fps 予算（16.7ms）に対し余裕 ~2 倍。性能課題なし（`scripts/verify-fps.mjs`）

## §4 globe/wave 補正（2026-06-12 15:35、rec-fluid f020 比較）

- globe: trail 0.225→0.5 rad（弧が球面に沿って曲がる長さ）+ **ghost 弧 第 2 パス**（globe 重みで fade、モーフ非破壊、pointer repel 同適用）で密度倍増 → dome 輪郭・立体感が f020 に接近。地平 warm glow 0.28→0.4
- wave: 縦線の基底 alpha 0.24→0.34（原本 f060 の線の見え方に合わせ）
- 全ゲート緑。これで 4 形態すべて原本フレームとの個別照合済み

## §4 strands 形状補正（2026-06-12 15:00、rec-pointer f025 比較）

- 旧実装は上半分だけの浅い V 字 → 原本は**左右の縁の全高**から中央の縦の腰柱（0.13H–0.87H）へ funnel する砂時計型。上半分は下りながら・下半分は上りながら収束、線は腰を少し抜け、dot は腰柱に密集
- glow も腰柱中心（H*0.52）へ移動。screenshot 比較で構造一致を確認、全ゲート緑

## 時間帯セレクタ listbox 忠実化（2026-06-11 17:00、rec-fluid f048 実測）

- 旧実装の「click で巡回」を本家同様の **combobox + listbox** に置換（白パネル・6 項目・icon 色付き・active 太字・選択/外側クリック/Esc で close・150ms scale-in）
- ラベル修正: 夜明け前→**日の出前** / 夕暮れ→**日暮れ**（録画の原文に一致）
- 検証: open screenshot 一致 + 日没選択→theme 変化→close を Playwright 確認、全ゲート緑

## click 系モーション QA（2026-06-11 15:30、click burst 実測）

- **news carousel 矢印**: 原本 ~1118ms ease-out 減衰 → クローン 0.55s/ease-in-out だったのを **1.05s / [0.22,1,0.36,1]** に補正 → 実測 ~1062ms 一致 ✅（P26 解消）
- **testimonial ロゴ切替**: 原本 ~99ms（実質即時 swap）＝ クローン ~87ms ✅ 補正不要

## 残課題（次 iteration）

1. ~~connect transition の composite 化~~ ✅ 2026-06-11: 不均等チェーン（注文2s→支払9.2s、周期11.2s）でクラスタ波形が原本一致（実測 [7.1,7.6][9,9.5]→11s後再来）
2. h1 の字送り: クローンは `palt` で詰まる（sohne-var 非ライセンスの近似限界、行折返しは一致済）— **sir 判断待ち**で現状維持
3. ~~5c 下段 3 列のアイコン~~ ✅ 2026-06-11: 原本 DOM の charm path を抽出して `SjCharm` variant 化（5c=rocket/trend/shield、5a=blocks/people/lifebuoy）。全 6 列とも原本一致、screenshot 確認済
4. ~~旧 QA report（specs/03-motion-qa-report.md）~~ → stale/誤報のため削除（2026-06-11）。motion の正は 01-motion-spec.md + 02-interactions.json + 本ファイルの実測記録
5. Zenflow widget は fullPage screenshot で空に見えるが実スクロールでは正常（whileInView 仕様、対応不要）— 実スクロール表示はアイコン修正時の screenshot でも確認済

## 決定事項

- hover 録画は ①header nav 全 hover（megamenu）②本文上部 6000px の CTA/カード 25 個巡回
- viewport 1440×900 / locale ja-JP / chromium
- hero の WebGL mesh gradient: 完全再現指示を受け、**ライブラリ無しの自作 canvas（小シェーダ）または CSS 近似**で対応。本番 Andes には持ち込まない（motion-kit _rejected 済）

## 重要発見（実測 2026-06-11）

- **hero に WebGL なし**: 背景リボン = 静的画像 `wave-fallback-desktop.png`（assets/ に確保済）。mesh gradient 自作は不要
- **h1 gradient text**: h1 が 2 枚重ね（`__title--background` 実色 + `__title--foreground` gradient clip）で色が動く。実測 font = sohne-var 44px / w300 / lh50.6 / ls-0.88px
- **GDP ticker**: `eyebrow-value__content-incoming/outgoing` のスロット式数字ロール（tabular-nums）
- 8 section 骨格 + 高さ実測済（hero 685px 〜 footer 手前まで、全 14756px）
- canvas は 1 個のみ = 下部 `squeezy-carousel__canvas`（Stripe の最前線 section）
- megamenu の開閉 CSS は headless 測定で空 → Playwright 再測 or storyboard から補完（要・精密測定）

## ブロッカー解消（精密測定 2026-06-11 / `02-interactions.json`）

- **P1 hero wave**: idle 2.5s の pixel diff **0.00%** → 完全静的画像で確定（storyboard の「常時 morph」はスクロール時の視差の誤認）
- **P2/P3 megamenu**: panel = `.hds-navigation-menu__content` w1262 / h654(サービス)・654(ソリューション)・403(開発者)・307(リソース)。切替は閉じずに内容 swap + 高さ morph。close = leave 後 336ms で DOM 消滅。easing = cubic-bezier(0.4,0,0.2,1)。duration は JS 駆動（WAAPI）のため CSS に出ない → open 400ms / morph 250-300ms / close ~250ms で実装
- **P4 header**: **sticky なし**。透過のまま、スクロールで消えて再出現しない
- **P5 bento**: 6 カード、--card-shift/grow は DOM inline style に実値あり（hover で微小 shift/grow + ⤢ 点灯）
- **P12 ticker**: 12s で 15 events（≈800ms 間隔）、incoming/outgoing のスロット式
- **P14 marquee**: **30.03 px/s** 左流れ

## メモ

- @playwright/test / pixelmatch / pngjs は整頓 commit（b7e95ca）で消えていたため devDeps に再導入（2026-06-11）
