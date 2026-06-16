---
video: f-hover（stripe.com/jp hover 録画）
frames: 117–145（3fps 抽出 / 1 frame = 333ms / 117 ≈ 39.0s, 145 ≈ 48.3s）
viewport: 720×450 px（全 frame 同一）
section: 「あらゆるビジネスを支え続けます。」直下の demo カードグリッド
  - card1: オンライン決済・対面決済をグローバルに展開（Terminal 電話 + Checkout demo）
  - card2: あらゆるサブスク・課金モデルに対応（Billing 使用量 demo）
  - 下段: エージェンティックコマースを導入 / カード発行プログラムを自在に展開 / ステーブルコインと暗号資産で越境決済に対応
analyzed: 2026-06-11
---

# storyboard: hover frames 117–145

マウスカーソル自体は frame に映っていない（録画にカーソル非収録）。hover 位置は要素の状態変化から逆算。

## モーション一覧

| # | 対象要素 | モーション種別 | frame | 経過時間 | 推定 duration / easing | 詳細 |
|---|---|---|---|---|---|---|
| M1 | card1「オンライン決済・対面決済をグローバルに展開」右上の expand アイコン（⤢） | hover active 保持 | ≤117 → 128 | ≥4.0s（117 以前から継続） | — | アイコンボタンが purple（#635BFF 系）塗りつぶし + 白矢印。**カード本体には lift / shadow / scale 変化なし**。hover 表示はアイコン fill のみ |
| M2 | 同上 card1 アイコン | hover-off color fade | 128 → 130（中間 129） | 333–666ms 窓 | 実 duration ≈150–300ms、単純 background-color fade（ease 不明瞭・linear 相当） | 129 で fill が約 50–60% 不透明度の中間色 → 130 で resting（薄ラベンダー bg + purple 矢印）に復帰 |
| M3 | card2「あらゆるサブスク・課金モデルに対応」右上の expand アイコン | hover-on color fill | 128 → 130（中間 129） | 333–666ms 窓 | 同上 ≈150–300ms fade | 129 はほぼ白く washed-out（矢印 purple→白 へ crossfade 中）→ 130 で purple 塗りつぶし完成。**マウスは 128–130 間（≈42.6→43.3s）に card1→card2 へ移動** |
| M4 | card2 アイコン | hover active 保持 | 130 → 145（範囲末尾まで継続） | ≥5.3s | — | purple fill のまま。card2 本体にも lift 等なし |
| M5 | card1 内蔵 demo（hover 非依存の autoplay ループ） | scenario crossfade（JP→US） | 134 → 138 | ≈1.0–1.3s | 段階的 crossfade + 数字 roll、ease-in-out 見え | ①電話の金額「¥5,000」→「$5.46」（136 で数字が重なる morph/roll 中間態を確認、明細も Mocha latte 等へ）②Checkout パネル: SHOWFLIX→ROASTERY（ロゴ・ブラウザバー URL 切替）、決済手段 PayPay／ファミリーマート → Affirm／Cash App／暗号資産／アメリカの銀行口座、注文概要がストリーミングサブスク → 黒い電気ケトル写真（温度調節機能付き電気ケトル $130.00）③CTA ボタン色 purple → クリーム/オレンジ。138 で完了 |
| M6 | card2 内「使用量」グラデーションメーター | progress bar 伸長（autoplay） | 117 → 139 にかけ漸増 | 数秒スケールの連続アニメ、linear | バーが約 72% → 80% へゆっくり伸びる。棒グラフ・トークン数「2,010,569,010」はこの範囲では静止に見える（130→131 にグラフ域の微小差分あり） |
| M7 | viewport 全体 | 垂直 micro-scroll（±6–13px） | 121→122（+13px 下）/ 128→129（戻し）/ 132→133（+6）/ 138→139（−5）/ 143→144（+8） | 各 1–2 frame（≤666ms）で整定 | smooth scroll の ease-out 整定（129→132 の残差が 10492→4645→1365px と減衰） | hover script の scrollIntoView 微調整 or 録画アーティファクト。**ページ要素のアニメではない**。左端 card edge x=76–83 は全 frame 不動 = 水平 zoom なし |

## 静止確認（モーションなし）

- 117–121 / 122–128 / 133–134 / 142–143 / 144–145 は実質完全静止（diff ≈0）。
- hover 中もカード本体の border / shadow / transform 変化は検出されず。**再現時は expand アイコンの fill 遷移だけ実装すればよい**。
- 下段 3 カード（エージェンティックコマース / カード発行 / ステーブルコイン）はこの範囲では hover されず resting のまま。

## 再現用スペック（実測ベース推定）

```
.demo-card .expand-btn          { background: #EEEDFF系の薄ラベンダー; color: #635BFF; border-radius: 6px; }
.demo-card:hover .expand-btn    { background: #635BFF; color: #fff; }
transition: background-color ~200ms, color ~200ms（中間 frame 1 枚のみ捕捉 → 150–300ms 帯）
カード本体: hover 変化なし（lift なし）
demo ループ: card1 は JP/US scenario を約 1.2s の crossfade で切替（数字は digit roll）、滞在は数秒
card2 使用量バー: linear で数秒かけて漸増
```

## 不確実な点

1. **カーソル非収録**のため、hover 位置はアイコン fill 変化からの逆算。card1 滞在が ≥4s・card2 滞在が ≥5.3s と、指定の 1.1s/対象より長い — カード内の複数ターゲット（カード本体→アイコン等）を視覚変化なしに順 hover していた可能性。
2. M2/M3 の easing は中間 frame が各 1 枚しかなく、ease-out か linear かは判別不能（duration 150–300ms 帯のどこかという推定のみ）。
3. M5 の crossfade が hover と無関係の autoplay ループであることは状況証拠（hover 対象は card2 に移った後に発火）からの推定。クリックによる切替の可能性は低いが排除しきれない。
4. M6 のトークン数値カウントアップの有無は 720px 解像度では判別不能（数値は静止に見える）。
5. M7 の ±6–13px 垂直シフトの原因（scrollIntoView / 録画エンコード）は特定不能。再現対象外として扱うのが安全。
6. card2 アイコンの 129 における「ほぼ白」中間態は、矢印色と bg 色が別タイミングで遷移している可能性を示唆（bg より先に矢印が白へ）。要 DevTools 実測。
