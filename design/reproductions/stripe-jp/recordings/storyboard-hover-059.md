---
video: f-hover（stripe.com/jp hover 録画）
frames: 059.png – 087.png（3fps / 1 frame = 333ms、frame N ≈ (N-1)/3 秒）
range_time: ≈ 19.3s – 28.7s
section: hero CTA hover → スクロール → 「ビジネスの形態を問わない、柔軟なプラットフォーム。」section（デモカード 2 枚）
analysis: 目視 + PIL pixel-diff（クラスタ bbox / 色サンプリング）で裏取り済
---

# Storyboard: f-hover 059–087

この区間 = nav hover 終了後の **ページ内 CTA hover フェーズ**。hero の 2 ボタン hover → 4 回のスクロールステップ → プラットフォーム section のデモカード操作ボタン hover + デモのロケール切替アニメ。

## 画面状態の流れ

| frames | 画面 |
|---|---|
| 059–061 | hero フル表示（header あり）。hover 対象なし、ambient アニメのみ |
| 062–071 | スクロール 1 段目（header 消失、hero CTA が画面中央）。「始める」→「Google で登録」hover |
| 072–077 | スクロール 2 段目。「ビジネスの形態を問わない、柔軟なプラットフォーム。」+ カード 2 枚（「オンライン決済・対面決済をグローバルに展開」/「あらゆるサブスク・課金モデルに対応」） |
| 078–082 | スクロール 3 段目（小） |
| 083–087 | スクロール 4 段目（小）。左カードのデモが Roastery(USD) → Cartay(EUR/独語) へ crossfade |

## モーション一覧

| # | 対象要素 | モーション種別 | frames（開始→終了） | 経過秒 | 推定 duration / easing | 備考 |
|---|---|---|---|---|---|---|
| 1 | hero 背景グラデーション（虹色ブロブ） | ambient drift（形状・色がゆっくり変化） | 059→071 常時 | 全区間 | 連続・linear 的 | hover と無関係の常時アニメ |
| 2 | 「Stripe 上の決済額が全世界の GDP に占める割合: 1.662036…%」 | live counter（下位桁が毎フレーム変動） | 059→071 常時 | 全区間 | 連続更新（≤333ms 間隔） | 数字 ticker。rolling アニメは 3fps では不可視 |
| 3 | ロゴ帯（NVIDIA / ORIX / Marriott / TOYOTA / Figma / NIKKEI ID / Google / Sansan…） | marquee（左方向へ等速スクロール） | 059→087 常時 | 全区間 | 約 5–6px / 333ms（720px 幅換算）≈ 16px/s、linear 無限ループ | 全フレームで diff 検出。途切れなし |
| 4 | ページ全体 | scroll step ①（hero 内を下へ） | 061→062 | ≈20.0→20.3s | ≤333ms | hover スクリプトの自動スクロール。滑らかさは 3fps では判定不能 |
| 5 | 「始める」primary ボタン（紫 #635BFF 系） | hover: chevron「›」→ 矢印「→」（軸線 fade-in + chevron 右シフト） | 063→064 | ≈20.7→21.0s | ~150–300ms、ease-out 風 | Stripe 定番の arrow shift。064 で矢印完成 |
| 6 | 「始める」ボタン背景 | hover: 背景 darken。実測 RGB(99,78,250)→RGB(83,68,203) | 064→065 | ≈21.0→21.3s | ~200–300ms | 矢印より半拍遅れて完了に見える（333ms 粒度の限界内） |
| 7 | 「始める」ボタン | unhover 戻り: 背景・矢印とも 1 フレーム内で default へ復帰 | 068→069 | ≈22.3→22.6s | ≤333ms、即時に近い | 戻りも同 duration の transition |
| 8 | 「Google で登録」secondary ボタン | hover: 枠線 gray RGB(237,237,237) → 薄紫 RGB(202,196,234) | 068→069 | ≈22.3→22.6s | ≤333ms | #5 の unhover と同フレーム＝マウスが隣へ移動。背景・文字は不変、border のみ |
| 9 | 「Google で登録」 | hover 維持（変化なし） | 069→071 | ≈22.6→23.6s | — | scroll ②で解除 |
| 10 | ページ全体 | scroll step ②（プラットフォーム section へ） | 071→072 | ≈23.3→23.6s | ≤333ms | ロゴ帯が画面上端 y≈22–40 に移動 |
| 11 | 左カード右上の小型アイコンボタン（デモ切替 ⤢/⟳） | hover/active: 薄ラベンダー RGB(218,211,252) → 塗り潰し紫 RGB(89,67,248)≈#635BFF | 072→073 | ≈23.6→24.0s | ≤333ms | グリフは白のまま。1 フレームで完了 |
| 12 | 同アイコンボタン | 紫塗り潰し状態が **073→087 まで持続**（約 4.7s） | 073→087 | ≈24.0→28.7s | — | 1.1s 滞在より長い → 単純 hover でなく active/cycling 状態の可能性（下記不確実点） |
| 13 | 左カード見出し「オンライン決済・対面決済をグローバルに展開」 | ごく僅かな文字色 darken（dark px 平均 RGB 105→96） | 072→075 | ≈23.6→24.7s | ~300–600ms | 視認ほぼ不可。カード hover 連動の可能性（不確実） |
| 14 | ページ全体 | scroll step ③（小、~60px） | 077→078 | ≈25.3→25.7s | ≤333ms | |
| 15 | ページ全体 | scroll step ④（小） | 082→083 | ≈27.0→27.3s | ≤333ms | |
| 16 | 右カード「過去 30 日間に使用されたトークン」数値 | live counter（値が数秒おきに更新: 1,720,558,650 → 1,743,175,218 → 1,716,789,223） | 072 / 078 / 083 で異なる値 | ≈23.6s / 25.7s / 27.3s | 数秒間隔で更新 | 桁ロール演出は 3fps では不可視 |
| 17 | 左カード内・スマホデモ | locale crossfade ①: 「Roastery に支払う $5.46 / Mocha latte…」→「Cartay bezahlen €26.89 / 独語明細」 | 084→086 | ≈27.7→28.4s | ~600–700ms、opacity crossfade（slide なし） | 084→085 で微変化開始、086 で切替完了 |
| 18 | 左カード内・ブラウザ checkout デモ | locale crossfade ②: 「ROASTERY / jane.diaz@stripe.com / 注文概要 / ケトル画像」→「CARTAY / damian.michelfelder@example.com / Zusammenfassung der Bestellung / パーカー画像」 | 086→087+ | ≈28.4→28.7s+ | ~600ms+、087 以降に継続 | **スマホ → ブラウザの順に stagger**（約 1 フレーム ≈ 333ms 差） |

## 再現実装メモ

- **始める hover** = 2 プロパティ同時 transition: ① chevron→arrow（::after の translateX + 軸線 opacity）② background darken。約 200ms / ease。戻りも同じ。
- **Google で登録 hover** = border-color のみの transition（gray → 薄紫）。
- **デモ切替ボタン** = default 薄ラベンダー bg + 白グリフ → hover で #635BFF 塗り潰し。瞬時（≤150ms）。
- **デモ locale 切替** = phone → desktop の stagger crossfade（各 ~600ms、間隔 ~300ms）。
- **ロゴ marquee** = 完全等速・無限。CTA hover 中も停止しない。
- **GDP %・トークン数** = JS live counter（GDP は毎フレーム、トークンは数秒間隔）。

## 不確実な点

1. **マウスカーソルは 720×450 解像度では直接視認できない** — hover 位置は要素の状態変化から逆算（始める→Google→デモ切替ボタンの順は確実、それ以外の滞在先は不明）。
2. **デモ切替ボタンの紫塗り潰しが 4.7s 持続**（073–087）— 1.1s 滞在ルールと矛盾。hover 状態ではなく「デモ自動巡回中の active 表示」か、スクリプトがこの位置に長く留まった可能性。どちらか判別不能。
3. **084–087 の locale crossfade のトリガー** — デモの自動ローテーションか、切替ボタン hover による誘発かは判別不能（クリックなしの録画なので自動の可能性が高い）。
4. スクロール 4 回（#4/#10/#14/#15）が smooth scroll か instant jump かは 3fps では判定不能（いずれも 1 フレーム内で完了）。
5. #5/#6 の arrow と背景色の stagger（arrow が先行に見える）は 333ms 粒度での観測であり、実際は同一 transition の可能性あり。
6. トークン数値の読み取り（1,743,175,218 → 1,716,789,223 と減少して見える）は OCR 誤読の可能性あり。「数秒おきに値が変わる」ことのみ確実。
7. #13 のカード見出し色変化は diff では検出されたが視認困難。hover 連動の color transition か再レンダリングノイズか不明。
