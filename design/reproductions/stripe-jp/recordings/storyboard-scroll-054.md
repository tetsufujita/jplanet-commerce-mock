---
video: f-scroll（stripe.com/jp 1440x900・300px/280ms スクロール録画）
frames: 054.png – 079.png（3fps・1 frame = 333ms / frame N ≈ (N-1)×0.333s）
range_time: ~17.7s – ~26.0s
scope: ページ末尾（Stripe の最前線 carousel → 今週注目の本 → 今すぐ始める CTA → footer）＋ scroll 終了後の top 復帰
---

# storyboard: scroll 054–079（ページ末尾〜footer〜top 復帰）

## フレーム概要

| frame | 時刻(約) | viewport 内容 |
|---|---|---|
| 054 | 17.7s | 「Stripe の最前線」carousel（Annual letter 2025 大カード＋右に thumbnail 列＋縦帯 stack）。最上部に直前 section の dark navy bar の尻尾（「ノーコードで始める ›」「プラットフォーム一覧を表示 ›」「詳細を表示 ›」） |
| 055 | 18.0s | carousel 本文（「Stripe を利用するビジネスが 2025 年に生み出す$1.9兆。…」「レターを読む ›」）。下端に「今週注目の本」見出しが進入 |
| 056 | 18.3s | 「今週注目の本 / 起業の原点は、常に一つの着想にあります。」＋書籍カード（NATURE'S METROPOLIS）進入、右上に The Library of Stripe の seal |
| 057 | 18.7s | 書籍 section 全景（「Nature's Metropolis: Chicago and the Great West / William Cronon」＋本文＋「Stripe Press」「Works in Progress」link）。下端に「今すぐ始める」進入 |
| 058 | 19.0s | CTA「今すぐ始める」全景（「今すぐ始める ›」filled＋「営業にお問い合わせ」outline、右に「お支払い額をご確認ください」「構築を開始する」2 column）。footer 列が進入 |
| 059–061 | 19.3–20.0s | footer link 群（プロダクト・料金体系 / ソリューション / 統合とカスタムソリューション / 会社情報 / リソース / サポート / 開発者）を通過 |
| 062 | 20.3s | ページ最下端到達（「日本 (日本語)」「© 2026 Stripe, LLC.」＋ Stripe ロゴマーク） |
| 062–069 | 20.3–23.0s | **完全静止**（8 frame ≈ 2.7s、footer で hold。差分ゼロ） |
| 070 | 23.0s | **top へ瞬間ジャンプ**（hero 再表示。069→070 の 1 frame 間で遷移、smooth scroll なし） |
| 070–072 | 23.0–23.7s | hero 静止表示。logo marquee と gradient 背景のみ動く |
| 073–076 | 24.0–25.0s | ⚠ 録画 artifact: 灰色画面＋左上に縦長の full-page 縮小サムネイル（full-page screenshot 合成処理の漏れ込み。サイトのモーションではない） |
| 077–079 | 25.3–26.0s | hero 静止表示に復帰。marquee / gradient / GDP counter は継続して動く |

## モーション一覧

| # | 対象要素 | 種別 | frame | duration / easing 推定 | 備考 |
|---|---|---|---|---|---|
| 1 | dark navy bar（「ノーコードで始める ›」「プラットフォーム一覧を表示 ›」「詳細を表示 ›」） | scroll-out（前 section の anchor bar が viewport 上端から退出） | 054 → 055 | スクロール連動（アニメではない） | bar 自体の固有アニメは未観測。sticky 解除の瞬間かは 3fps では判別不可 |
| 2 | 「Stripe の最前線」carousel（Annual letter 2025 カード・thumbnail 列・← → pagination 矢印） | **scroll 進入時のエントランスなし** | 054–056 | — | viewport 進入時点で full opacity。自動 crossfade / auto-advance もこの区間では未発生 |
| 3 | 「今週注目の本」書籍 section（書影・The Library of Stripe seal・本文） | **scroll 進入時のエントランスなし** | 055–057 | — | fade/slide なしで即表示 |
| 4 | CTA「今すぐ始める」「営業にお問い合わせ」＋ 2 column | **scroll 進入時のエントランスなし** | 057–058 | — | 即表示 |
| 5 | footer 全体（link 列・locale・© 2026 Stripe, LLC.） | 静的 | 059–069 | — | アニメなし |
| 6 | スクロール位置 | scroll-to-top の瞬間ジャンプ | 069 → 070 | < 333ms（1 frame 内）・easing なし＝instant | 録画スクリプトの `scrollTo(0)` と推定。サイト固有モーションではない |
| 7 | hero logo marquee（OpenAI / EC CUBE / amazon / ADASTRIA / NVIDIA / Marriott / TOYOTA…） | 横方向 auto-scroll（右→左、無限 loop） | 070–072、077–079 で連続 | linear・連続。070→072 の 2 frame（666ms）で TOYOTA が右端から進入 ≈ 推定 30–60px/s | scroll 中も常時動いている模様（hero が見えている全 frame で位置が異なる） |
| 8 | hero gradient 背景（orange/pink の WebGL canvas） | 連続 morph（色面がゆっくり流動） | 070–072、077–079 | 連続・極めて低速 | Stripe 名物の gradient canvas。loop 周期は本区間では計測不能 |
| 9 | hero 上の ticker「Stripe 上の決済額が全世界の GDP に占める割合: 1.862038…」 | counter（末尾桁が連続インクリメント） | 070–079 | 連続 | 解像度の都合で桁の確読不可、ただし frame 間で末尾数字列が変化して見える（低確度） |

## 不確実な点

1. **073–076 の灰色 frame**: full-page 縮小サムネイルが左上に映る録画 artifact と判断。サイトのモーション解析からは除外したが、原因（full-page screenshot 処理の混入）は推測。
2. **エントランスアニメの不在**: この区間（carousel / 書籍 / CTA / footer）では fade-in 等を一切検出できなかった。3fps（333ms 間隔）のため、~300ms 以下の短い fade は取りこぼしている可能性あり。ただし隣接 frame で半透明状態が一度も写っていないので「エントランスなし」の確度は高め。
3. **#1 dark navy bar が sticky だったか**: 054 で viewport 最上端にあり 055 で消失。直前 frame 群（担当範囲外 ~053 以前）を見ないと sticky pin → release か単なる通過かは確定できない。
4. **marquee 速度**: 縮小画像での目視差分のため 30–60px/s は粗い推定。実測は computed transform で取り直すべき。
5. **GDP counter の変化**: 文字が小さく、frame 間の桁変化は「変化しているように見える」レベル。Stripe 本家の仕様（連続インクリメント counter）との整合はあるが、本録画単独では低確度。
6. **carousel の auto-advance**: ← → 矢印と縦帯 stack（次カードの peek）が存在するが、この区間では自動送りは発生せず。hover/click 録画側での確認が必要。
