# spec — §3 chat デモ 完全ストーリーボード（実装 spec）

> ソース: `storyboard-f1-001/027/053/079.md`（rec1 全 104 frame, 4fps）。
> 実装先: `src/shopify-jp/sections/SpChatSection.tsx` の `ChatDemoMock` を**全面書き換え**。
> 本家 = embedded webm（autoplay loop）。これを DOM + motion/react で再構成する（動画アセット不使用、CDN 参照禁止）。

---

## 1. ループ全体構造

| 項目 | 値 | 根拠 |
|---|---|---|
| **1 ループ長** | **13.25s** | f038(9.5s) 暗転 → f091(22.75s) 暗転 = 13.25s。f044/f097 send ボタン間隔も 13.25s で一致 |
| 物語 | 1 購買 journey の圧縮 | 入力誕生 → 商品回答 → device reveal → 詳細 → 購入確認 → 多デバイス constellation → Thank you → 暗転 |
| カット割り | **ゼロ** | 全遷移が scale / opacity / 位置 tween の連続カメラ。場面切替は crossfade か push-through のみ |
| ループ継ぎ目 | 暗転（黒経由） | push-through fade-out → 0.25s の「暗転の呼吸」→ sweater fade-in で次周へ |
| scroll | 無し | 左テキスト列は全 frame 固定。デモは右半分の閉じた領域内で完結 |

### Stage 分割（7 stage / 計 13.25s）

| stage | 区間 (t) | duration | 内容 | 優先度 |
|---|---|---|---|---|
| S1 入力誕生 | 0.00–3.00 | 3.00s | 暗転→sweater→キャレット→pill→send→typewriter | ★必須（signature） |
| S2 回答 | 3.00–5.00 | 2.00s | bubble 縮小 dock + 商品 card + caption typewriter | ★必須 |
| S3 device reveal | 5.25–6.25 | 1.00s | zoom-out + phone frame fade-in + carousel | ★必須 |
| S4 商品詳細 | 6.50–7.25 | 0.75s | bottom-sheet slide-up（詳細） | 中 |
| S5 購入確認 | 7.50–7.75 | 0.50s | bottom-sheet slide-up（確認。checkout 入力は丸ごと省略） | 中 |
| S6 constellation | 8.00–10.50 | 2.50s | dolly-out + 周辺 phone fade-in + idle drift | 中 |
| S7 Thank you→退場 | 10.75–13.25 | 2.50s | crossfade → hold + 微 push-in → push-through + 暗転 | ★必須（ループ継ぎ目） |

---

## 2. イベント時系列表（t=0 = 暗転完了 / sweater fade-in 開始）

| t (s) | 要素 | モーション | 質 / easing |
|---|---|---|---|
| 0.00–1.00 | 背景 + sweater | ほぼ黒 → 深緑 sweater が単体で fade-in（明度ゆっくり上昇） | linear fade ~1s。sweater は微揺れ（実写の布の代替に y/rotate の極小 idle） |
| 1.00 | キャレット | sweater 右脇に白い縦長 pill（巨大キャレット風）が点→縦棒へ伸長 | scaleY 伸長 ~0.25s |
| 1.00–1.50 | chat pill | 縦 capsule が**横方向に展開**して角丸入力バーに（幅 ~2.5×、中身は空） | width expand、**spring 系**（軽い overshoot）。同時に背景 sweater が teal→青みに hue shift |
| 1.50–1.75 | バー | 全開で hold（x 中央、空欄） | — |
| 1.50 | send ボタン | バー右端に黒丸 ↑ が pop-in | scale 0→1 pop ~0.2s |
| 2.00–3.00 | typewriter | 「I need a warm sweater in green. Under $200.」を 1 文字ずつ（~40 字/1s、caret 無し）。途中で 2 行に折返し → **バー高さ auto-grow** | steps 的等速。height はレイアウト追従 |
| 3.00–3.25 | pill→bubble | 入力バーが一回り**縮小**し「送信済み吹き出し」へ変態（font 縮小・send ボタン灰色小型化）。**同一要素の morph** | scale-down + 位置 snap ~0.4s ease-out |
| 3.00–3.50 | 商品 card | 背後で sweater 物撮り → 角丸の商品 card（モデル着用写真）へ crossfade + 微 scale-up。bubble は card 右上角に dock | crossfade ~0.5s、位置は固定で opacity 入替が基調 |
| 3.50–4.25 | caption | card 左下に商品名「Forest Knit Sweater」が typewriter（~1s、左→右） | steps 等速 |
| 4.50–5.00 | 全体 | hold（静止。card 内のみ微動） | — |
| 5.25–5.50 | ★zoom-out reveal | bubble+card+caption が**一体で縮小（~75%）**し上方へ寄る | scale + y tween、ease-out ~0.5s |
| 5.50–5.75 | phone frame | content の周囲に **iPhone frame が fade-in**（opacity 30%→不透明）。「今見ていた chat は phone の中だった」 | frame opacity のみ。content は phone 画面サイズに収束 |
| 5.75–6.00 | carousel | 1 枚目の隣に 2・3 枚目 card が順次 fade-in。AI chat UI（ヘッダ / 返信文 / 横 carousel 3 枚 / 下端入力欄）が解像 | 順次 fade、stagger ~0.15s |
| 6.25 | — | UI 完全解像、1 拍 hold | — |
| 6.50–7.00 | 詳細 sheet | carousel 1 枚目が展開: **bottom-sheet が下から slide-up**（大判写真 + 商品名 + brand + In Stock + $125.00 + What to know） | y: 100%→0、~0.5s ease-out |
| 7.00–7.25 | — | 詳細 hold | — |
| 7.50 | 確認 sheet | 注文確認 sheet slide-up: 地図 + 「Thank you, Jordan!」+ Order placed + 紫 Track ボタン + 住所。**checkout 入力工程はジャンプ省略** | y slide-up **~0.25s**（詳細より速い） |
| 7.75 | — | 確認 hold | — |
| 8.00–9.25 | ★dolly-out | phone が縮小（~60%→45%）、周囲に暗い phone が**中心→外周の時差で fade-in**（8–12 台） | scale-down + 周辺 fade-in。深度 3 層: 近景=大+強 blur / 中景=ピント / 遠景=小+減光 |
| 9.25–10.50 | constellation | settle → 各 phone がごく緩い外向き drift で idle。前景 3 台にピント（別シナリオの phone 含む = 「どの AI チャットでも」） | ease-out で静定、以後 微小 drift 無限 |
| 10.75–11.00 | ★crossfade | checkout phone 群 → 「Thank you, Nyoka! / Alberto! / Fabian!」カード群へ**同位置 crossfade**（レイアウト保持、opacity だけ入替） | ~0.5s。位置移動なし |
| 11.25–12.25 | hold + push-in | Thank you mosaic を hold しつつ**超低速 push-in**（連続 zoom の助走） | scale 1→1.06 程度、ease-in 助走 |
| 12.50–12.75 | ★push-through | scale 急加速（カードが画面を覆う寸前まで拡大）+ **fade-out 重畳**。「cluster の中を通り抜ける」 | scale 1.06→~1.8 + opacity→0、~0.5s ease-in |
| 13.00–13.25 | 暗転の呼吸 | ほぼ黒 → t=0 へループ | 0.25s の黒 hold |

### 遷移の質まとめ

| 遷移 | 方式 | 使い所 |
|---|---|---|
| 同種 scene 入替（A→B） | 同位置 crossfade ~0.5s | checkout 群 → Thank you 群 |
| 章の切替（B→C） | push-through zoom + fade to black ~1.0s | 盛り上がりの切替にだけ zoom |
| 文脈の付与 | scale-down + frame fade-in ~1.0s | 「chat は phone の中だった」reveal |
| 規模の提示 | dolly-out + 周辺 fade-in ~1.5s | 1 台 → constellation |
| 工程の圧縮 | bottom-sheet slide-up（0.25–0.5s） | 詳細 / 確認。checkout 入力は見せない |
| 役割の変態 | 同一要素の morph（scale + snap） | 入力バー ⇄ 送信済み bubble |

---

## 3. 必要 DOM 要素リスト（ChatDemoMock 書き換え）

```
<root>  relative overflow-hidden（既存の aspect-[2090/1742] 領域）
└─ <SceneScaler>          motion.div — S7 push-through の全体 scale + opacity を担う
   ├─ <ProductHero>       sweater SVG（既存 KnitSweater 再利用）⇄ 商品 card（角丸 + gradient placeholder + モデル写真代替）
   │                      S1: 単体 fade-in / S2: card へ crossfade（2 要素重ねの opacity 入替）
   ├─ <ChatPill>          motion.div ×1 — キャレット → 入力バー → 送信済み bubble の 3 状態 morph
   │   ├─ <TypeText>      span（substring state で typewriter）
   │   └─ <SendButton>    黒丸 ↑（pop-in / 灰色小型化の 2 状態）
   ├─ <Caption>           商品名 typewriter（card 左下）
   ├─ <PhoneFrame>        角丸 device 枠（border + notch）。S3 で fade-in
   │   ├─ <ChatHeader>    架空 AI 名 + status bar 風
   │   ├─ <ReplyText>     assistant 返信文（fade、typewriter 不要 — 本家もタイプ無し）
   │   ├─ <Carousel>      商品 card ×3（横並び、stagger fade-in）
   │   ├─ <DetailSheet>   bottom-sheet（写真 / 名前 / 価格 / CTA）
   │   ├─ <ConfirmSheet>  bottom-sheet（地図 placeholder / Thank you / Track ボタン / 住所）
   │   └─ <InputBar>      下端「Ask anything」風ダミー
   ├─ <Constellation>     mini phone mockup ×8–12（絶対配置、深度 3 層: blur-クラス + opacity + size 差）
   │   └─ 各 phone は checkout 面 ⇄ ThankYouCard 面 の 2 面を持ち crossfade
   └─ <BlackVeil>         黒 overlay（S7 末尾の暗転 + ループ継ぎ目）
```

注意:
- 本家ロゴ・実写写真は複製しない（既存方針）。写真は gradient placeholder + SVG で代替。
- copy は学習用 sandbox のため component 内定数で可（site 移植時に locales JSON へ）— 既存ファイルの方針を踏襲。

---

## 4. motion/react 実装方針

| 課題 | 方針 |
|---|---|
| 可変長 stage の進行 | 既存 `useAutoCycle`（等間隔）では不可 → **`useStageTimeline(stages: {key, ms}[])`** を hooks.ts に追加。`setTimeout` chain で現在 stage key を返し、末尾で先頭へループ。IntersectionObserver（threshold 0.3）で in-view 外は停止（useAutoCycle と同パターン） |
| stage → 見た目 | 全要素を **variants**（`variants={...}` + `animate={stageKey}`）で宣言。条件 mount を避け、`opacity/scale/x/y` で出し入れ（layout thrash 防止） |
| pill の 3 状態 morph | 単一 motion.div の `width / height / borderRadius / scale` を stage keyframe で遷移。caret→bar は `width` spring（`type:"spring", stiffness 260, damping 24` 目安）、bar→bubble は `scale 0.8 + x/y snap`（ease-out 0.4s） |
| typewriter | `useEffect` + interval で substring を state 更新（~25ms/字 = 40 字/1s）。caret は描画しない（本家準拠）。reduced 時は全文即表示 |
| crossfade | 2 layer 重ねの opacity 入替（AnimatePresence 不使用で安定。両 layer 常駐 + opacity variants） |
| push-through | `<SceneScaler>` に `scale: [1, 1.06, 1.8], opacity: [1, 1, 0]`、`times: [0, 0.8, 1]`、ease-in |
| bottom-sheet | `y: "100%" → 0`、ease `EASE_OUT_CUBIC`（既存定数）、詳細 0.5s / 確認 0.25s |
| constellation drift | 各 phone に `animate={{ x: [0, ±4], y: [0, ±6] }}` の無限 mirror（duration 5–8s をばらす）。blur は**静的 CSS クラス**（blur をアニメしない — paint 負荷） |
| reduced-motion | `useReducedMotion` → timeline 停止し **S2 の静止合成 frame**（bubble + card + caption）を表示。`role="img"` + aria-label は現行を踏襲 |
| パフォーマンス | アニメ対象は transform / opacity のみ。`will-change` は SceneScaler と pill のみ。画像なし（SVG + gradient） |

### 実装の段階分け（Codex 向け）

| step | 内容 | PASS 条件 |
|---|---|---|
| 1 | `useStageTimeline` 追加 + 7 stage の骨組み（opacity 切替のみ） | 13.25s でループし in-view 外で停止 |
| 2 | S1–S2: pill morph + typewriter + card crossfade | pill の caret→bar→bubble が 1 要素で連続 |
| 3 | S3–S5: phone frame reveal + sheet ×2 | zoom-out と frame fade-in が同期 |
| 4 | S6–S7: constellation + crossfade + push-through | 暗転経由でシームレスにループ |
| 5 | reduced-motion / aria / lint+typecheck+build 緑 | 全 mandatory チェック通過 |
