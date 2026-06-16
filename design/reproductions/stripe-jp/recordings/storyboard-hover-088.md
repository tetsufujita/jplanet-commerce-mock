---
video: f-hover（stripe.com/jp hover 録画、3fps 抽出 = 333ms/frame）
frames: 088–116（/design/reproductions/stripe-jp/recordings/f-hover/088.png〜116.png）
time_range: 約 29.0s〜38.3s（t = (frame−1) × 0.333s 換算）
section: 「ビジネスの形態を問わない、柔軟なプラットフォーム。」デモカードグリッド（オンライン決済デモ + 5 小カード）
analyzed: 2026-06-11
method: Python 連番 diff（閾値クラスタリング + 縦相関スクロール推定）+ 拡大クロップ目視
---

# storyboard: f-hover 088–116

## 前提（重要）

- **この録画にはマウスカーソルが映っていない**（screenshot ベース録画のため cursor 非描画）。マウス位置は直接特定不可。
- 担当範囲内で **hover 起因の視覚変化（underline / arrow shift / カード lift / 色変化）は 1 件も検出されなかった**。検出された motion は全て「環境アニメ（デモの自動演出）」と「スクロール」。
- 静止区間（094–099 ≈ 2.0s、100–109 ≈ 3.0s、114–116 ≈ 1.0s）が hover 滞在（各 1.1s）に対応すると推定。hover 対象に視覚 feedback がない（またはこの解像度 720×450 で検出不能な）要素だったと考えられる。

## 画面内容

大型デモカード（左: 決済端末 phone「Cartsy bezahlen €26.89」、中: ブラウザ checkout「CARTSY」、右: 注文サマリー）+ 右列「あらゆるサブスク・課金モデルに対応」（Pro プラン + 棒グラフ）+ 下段 3 カード「エージェンティックコマースを導入」「カード発行プログラムを自在に展開」「ステーブルコインと暗号資産で越境決済に対応」。

## モーション一覧

| # | 対象要素 | モーション種別 | 開始→終了 frame（経過秒） | 推定 duration / easing | 備考 |
|---|---|---|---|---|---|
| 1 | ページ全体 | smooth scroll down **218px** | 088→089（29.0→29.3s） | ≤666ms、ease-out（090–093 にサブピクセルの減速 settle 痕跡） | 見出し「ビジネスの形態を問わない、柔軟なプラットフォーム。」→カードグリッド全景へ |
| 2 | 「エージェンティックコマースを導入」カード内チャット吹き出し「ワードローブを一新しようと思っています。サイズ M で、着心地がよくてリラックスできるベーシックアイテムをおすすめしてもらえますか？」 | fade-in（type-in の可能性あり、3fps で判別不能） | 089→090（29.3→29.6s）。089 では半透明、090 で完全表示 | 約 300–600ms、ease-out | scroll-into-view トリガーのデモ演出と推定。hover 起因ではない可能性大 |
| 3 | 同カード背景のピンク粒子群（particle swarm） | ambient drift（粒子が常時ゆっくり流動） | 089→093 で毎フレーム微変化（継続） | 連続 / linear・infinite | デモの常時背景アニメ |
| 4 | 大型デモカード下辺の **gradient border glow**（ピンク⇄紫） | animated gradient sweep（色相が辺に沿って這う） | 091→092、101→102、107→108 で 2px 高の辺だけ変化（30s台を通して継続） | 非常に遅い連続アニメ、linear・infinite | y≈302 の細線 diff の正体。カード全周ではなく下辺で顕著 |
| 5 | ページ全体 | micro scroll +4px | 093→094（30.6→31.0s） | 1 frame 内 | スクロール位置の微調整（settle） |
| 6 | （静止区間） | 変化なし | 094→099（31.0→33.0s、約 2.0s） | — | hover 滞在 1〜2 回分。視覚 feedback 検出なし |
| 7 | ページ全体 | scroll down +18px | 099→100（33.0→33.3s） | 1 frame 内 | 小スクロール |
| 8 | （静止区間） | 変化なし（#4 の border 這いのみ） | 100→109（33.3→36.3s、約 3.0s） | — | hover 滞在 2〜3 回分。視覚 feedback 検出なし |
| 9 | デモ rotation 開始: ブラウザ URL バー「cartsy.com/checkout」+ phone 金額「€26.89」 | crossfade 開始（極微・不透明度 ~10% 未満） | 109→110（36.0→36.3s） | — | ローカライズ checkout デモの自動切替の起点 |
| 10 | ページ全体 | scroll **up** 80px | 110→111（36.3→36.6s） | ≤666ms | 上方向へ戻るスクロール（マウスが上の要素へ移動と推定） |
| 11 | phone 画面: 「Cartsy bezahlen €26.89」(独/EUR) → 「Showflix に支払う ¥5,000」+ ギフトカード/合計 ¥5,000 + 紫「続行」ボタン | crossfade（コンテンツ丸替え） | 110→111 で完了（36.3→36.6s） | ~300–600ms | デモ rotation の第 1 波。phone が browser より先に切替（staggered） |
| 12 | ブラウザ checkout: 「CARTSY」→「SHOWFLIX」へ全要素切替 — URL「cartsy.com/checkout→showflixapp.com/checkout」、E-Mail「damian.michelfelder@example.com」→メールアドレス「taro.yamada@example.com」、支払方法 Klarna/Rechnung → カード/PayPay/ファミリーマート、注文サマリー Unzerstörbarer Hoodie €41.70 → ストリーミング ¥1,880 | staggered crossfade（上から下へ行単位で cascade。diff 量 11071→7195→530 と減衰） | 111→114（36.6→37.6s）で完了 | 全体 ≈1.0–1.7s（109 起点なら ~1.7s）、ease-out（減衰パターンから） | Stripe 名物の国別ローカライズデモの自動 rotation。ドイツ→日本 |
| 13 | （静止区間） | 変化なし | 114→116（37.6→38.3s） | — | 115→116 の散発 diff は動画圧縮ノイズ（拡大目視で同一確認済） |

## 再現実装への示唆

1. **ローカライズ checkout デモの auto-rotation**（#9–12）が本区間最大の発見。国（言語/通貨/決済手段）丸ごと crossfade、**phone → browser header → form 行 → サマリー数値の順に stagger**、全体 1.3–1.7s / ease-out。時間駆動の自動サイクル（hover 非依存と推定）。
2. **大型デモカードの gradient border glow が常時這う**（#4）— 非常に低速の linear infinite。再現するなら `background: linear-gradient` の position アニメか conic-gradient 回転。
3. **エージェンティックコマースカードのチャット吹き出し fade-in + 粒子 drift**（#2,3）— scroll-into-view 演出 + 常時 ambient。

## 不確実な点

- **マウス位置が一切不明**（cursor 非描画）。どの CTA/カード/リンクに hover していたかはフレームからは特定不可。静止区間の配置（2.0s / 3.0s / 1.0s）から滞在回数を推定したのみ。
- 本区間で hover 起因の変化ゼロ＝「hover 効果がない要素」か「720×450 で検出限界以下（例: 小さな expand アイコンの背景色変化）」かは判別不能。元解像度の再録画か DevTools 実測での確認推奨。
- #2 のチャット文言が type-in（文字送り）か fade-in かは 3fps では判別不能。
- 089–092 のビューポート最上端（y0–10）のカードタイトル文字のシマー: smooth scroll のサブピクセル settle と判断したが、text reveal アニメの可能性も棄却しきれない。
- デモ rotation（#11–12）が scroll/hover トリガーか純粋な時間駆動かは未確認（scroll up とほぼ同時に発火しているため）。Stripe 本家挙動的には時間駆動の可能性が高い。
- 095→096 と 115→116 の全面散発 diff は動画キーフレームの圧縮ノイズと判断（拡大目視で内容同一）。
