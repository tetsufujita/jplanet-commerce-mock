---
video: f-hover（stripe.com/jp header nav 7項目 hover 録画、各1.8秒滞在）
frames: 001.png – 029.png（3fps 抽出、1 frame = 333ms）
担当範囲時間: 0.0s – 9.7s
解析日: 2026-06-11
---

# Storyboard — f-hover 001–029（nav hover 前半: サービス → ソリューション）

## タイムライン概要

| 区間 | フレーム | 経過時間 | 状態 |
|---|---|---|---|
| A | 001–016 | 0.0–5.3s | ページ idle。header は hero gradient 上に透過（nav 白文字）。マウスが nav へ移動中（hover 変化なし） |
| B | 016→018 | 5.3–6.0s | **megamenu「サービス」open**（017 = 開き途中の中間フレーム） |
| C | 018–022 | 6.0–7.3s | 「サービス」panel 安定表示（滞在 ≈ 2.0s ≒ 指定 1.8s と一致） |
| D | 022→023 | 7.3–7.7s | **panel 切替「サービス」→「ソリューション」**（中間フレームなし = 333ms 以内に完了） |
| E | 023–029 | 7.7–9.7s | 「ソリューション」panel 安定表示（滞在継続、029 で範囲終了） |

## モーション一覧

| # | 対象要素 | モーション種別 | 開始F→終了F（秒） | 推定 duration / easing | 詳細 |
|---|---|---|---|---|---|
| 1 | hero 下の顧客ロゴ帯（OpenAI / EC-CUBE / amazon / ADASTRIA / NVIDIA / TOYOTA 等） | marquee 左方向スクロール（ambient、hover 無関係） | 001→029 連続 | linear・無限ループ | OpenAI が f1 左端 x≈70px → f8 で画面外。実測 ≈ 25–30px/s（1440px 想定換算）。megamenu open 中も裏で継続（veil 越しに視認） |
| 2 | hero 上 eyebrow「Stripe 上の決済額が全世界の GDP に占める割合: 1.66203…%」 | 数字カウンター連続 tick（ambient） | 001→016 視認 | 連続（毎フレーム下位桁が変化） | 小数下位桁がリアルタイム増加。live counter 演出 |
| 3 | megamenu panel「サービス」（Payments / 収益 / 資金管理 / プラットフォームとマーケットプレイス / さらに表示） | megamenu open: panel が上端 anchor で下方向に展開（height/clip expand）、内容は top 揃えで clip | 016→018（5.3→6.0s）、017 が中間状態 | 実測 333–666ms 内に完了 → **推定 400–500ms, ease-out**（017 で高さ ≈30%、018 で 100% + 静止） | 017 では panel 下端が「マーチャントオブレコードソリューション / サブスクリプション / Atlas / Climate」付近で clip され hero 見出しがまだ下に見える。内容のスケール変形は見えない（clip 展開）。018 で右列 promo card「Stripe Sessions 2026 …こちらからご覧ください →」まで全表示 |
| 4 | header bar 全体 | テーマ反転: gradient 上の透過 header（白文字 nav・白枠サインイン）→ 白背景 solid header（黒文字 nav・紫文字「サインイン」薄紫 pill） | 016→017（megamenu open と同時） | open と同時 ≈ 同 duration、fade | 「営業にお問い合わせ」紫 pill ボタンは白背景上でもそのまま紫を維持 |
| 5 | nav item「サービス」の chevron | rotate 180°（∨ → ∧）active 表示 | 016→018 | open と同期、~200–300ms | 018–022 の間 ∧ を維持 |
| 6 | megamenu 背後のページ本体（hero・ロゴ帯・下層 section） | 白 veil fade-in（ページ全体がほぼ白く washed out、コンテンツがうっすら透ける） | 017→018 | open と同期、fade、推定 300–500ms | 017 では hero 文字がまだ濃く読める → 018 でほぼ白。veil 越しにロゴ marquee の動きは継続視認 |
| 7 | megamenu panel content | panel 切替 crossfade + panel resize（縮小）:「サービス」5 列・高さ大 →「ソリューション」4 列（成長段階別 / ユースケース別 / 業種別 / エコシステム）・高さ約 2/3 | 022→023（7.3→7.7s） | 中間フレームなし → **≤333ms、推定 200–300ms, ease（in-out）** | panel 下端が約 360px → 約 240px 相当へ縮む。promo card は消え、新 panel に「エージェンティックコマース / E コマース / 組込み型金融 / AI 企業 / パートナー / Stripe App Marketplace」等 |
| 8 | nav chevron 2 箇所 | 「サービス」∧→∨ へ戻り、「ソリューション」∨→∧ | 022→023 | 切替と同期 ~200ms | hover 解除時の戻りアニメに相当（panel は閉じず隣 item へ直接遷移するため menu 自体は開いたまま） |
| 9 | megamenu panel「ソリューション」 | 静止維持（追加モーションなし） | 023→029（7.7–9.7s） | — | 内部リンクの hover 変化はこの区間では検出されず |

## マウス位置（推定）

- 001–015: hero 領域 → header へ移動中（カーソルは 720×450 解像度では視認不能）
- 016–022: nav「サービス」上（megamenu open がトリガーされた事実から逆算）
- 022–029: nav「ソリューション」上（panel 切替から逆算）

## 不確実な点

1. **カーソル自体が低解像度（720×450, 3fps）で視認できない** — マウス位置は menu 状態からの逆算。
2. megamenu open（#3）が「clip/height 展開」か「scaleY + content counter-scale」かはフレームからは断定不可。017 で文字が歪んでいない事から clip 展開 or 高さ expand が有力。
3. open 開始の正確なタイミングが f16–f17 間のどこかのため、duration は 350–650ms の幅を持つ（推定値 400–500ms はその中央）。
4. panel 切替（#7）は 1 フレーム以内で完了しており、crossfade か slide（横方向）かは判別不能。Stripe 既知実装では「コンテンツ横 slide + panel サイズ補間」だが本録画では未確認。
5. nav item の hover 下線・文字色変化（menu open 前の 012–016）は解像度的に検出できず。
6. veil（#6）の最終 opacity 値は不明（見た目 80–90% 白）。
7. 営業にお問い合わせ / サインイン ボタン自体の hover はこの区間では発生していない。
8. ソリューション panel 内で「成長段階別」列のみ文字色が暗色、他列が紫 — 静的な link スタイル差か hover 状態かは不明（023–029 で不変のため静的と推定）。
