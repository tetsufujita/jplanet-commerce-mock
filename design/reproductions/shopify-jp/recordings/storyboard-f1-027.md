# Storyboard — rec1 f027–052（6.75s–13.0s）§3「ブランドがチャットに登場」chat デモ

> 4fps 抽出（frame N = N/4 秒）。frames: `f1/027.png`–`f1/052.png`。
> 本区間に **ページ scroll は一切なし**。左テキスト列（badge トリオ + 見出し + 本文）は全フレーム固定。
> 動くのは右半分の demo 動画領域のみ = section 内 embed 動画（autoplay loop）と判断。

## 固定レイアウト（全フレーム共通）

| 要素 | 位置（vw/vh %） | 備考 |
|---|---|---|
| AI badge トリオ（OpenAI / Google / Copilot） | x 3–13%, y 8–18% | 白丸 3 連、重なり配置、静止 |
| H1「ブランドがチャットに登場」 | x 3–38%, y 40–72% | 2 行、白、静止 |
| 本文 + 「Agentic Storefronts」下線 link | x 3–37%, y 74–95% | 静止 |
| demo 動画領域 | x 55–98%, y 5–95% | 右半分。中心 ~75% x / 50% y |
| 画面右下隅の小 thumb | x ~88–100%, y ~93–100% | 動画の見切れ要素。中身が変化（顔→暗→ラベンダー服→白内装）= 次 scene の素材が端に peek |
| custom cursor（マゼンタ矢印） | ~81–82% x / 45–60% y | 録画者 cursor、ほぼ静止 |

## 時系列（frame → 秒）

| frame | 秒 | イベント | モーションの質 |
|---|---|---|---|
| f027 | 6.75 | **Scene A 末尾**: 浮遊 phone mockup 群（12–15 枚、中央に白 checkout UI の大 phone、左にオレンジ縁 phone）。cluster 中心 ~75% x / 50% y、span 55–98% x | 各 mockup が深度差つきで浮遊（微 drift）。中央ほど鮮明・周辺ほど blur+暗 = 擬似被写界深度 |
| f028 | 7.0 | **Scene A→B crossfade 中間**: checkout phone 群が透けながら "Thank you" カード群が同位置に重なって出現 | 純 crossfade（位置移動なし、opacity 入替のみ）。約 0.5s |
| f029 | 7.25 | **Scene B 完成**: ✓丸 + 「Thank you, Nyoka!」「Thank you, Alberto!」「Thank you, Fabian!」カード群 + 商品 thumb。配置は Scene A とほぼ同じ cluster 構造 | 静止に近い hold 開始 |
| f029–034 | 7.25–8.5 | Scene B hold（~1.25s）。ごく僅かに全体 scale-up が始まる | 超低速 push-in（連続 zoom の助走） |
| f035–036 | 8.75–9.0 | **push-in 加速**: カードが目に見えて拡大、Alberto / Nyoka カードが画面中央へ | カメラ前進（cluster 全体の scale-up、中心固定）。ease-in |
| f037 | 9.25 | **極端 zoom**: 女性の顔が大写し（~55–70% x）、巨大✓丸（~80% x）。同時に全体が暗転開始 | scale-up 継続 + 全体 fade-out 重畳。「cluster の中を通り抜ける」演出 |
| f038 | 9.5 | **暗転完了 / Scene C 仕込み**: ほぼ黒。緑 sweater の塊が ~72% x / 48% y に薄く出現、下方 ~80% y に小 thumb の残滓 | fade to dark → 新素材を暗い状態から fade-in（black を経由した scene 切替） |
| f039 | 9.75 | 暗い緑 sweater が中央右 ~72% x / 50% y に浮かぶ（単体、背景ほぼ無地） | fade-in 継続。sweater 自体は実写動画素材（布が微妙に揺れる） |
| f040 | 10.0 | sweater 明度上昇。**右縁 ~74% x に細い縦白バー出現** = chat pill の誕生 | 細い縦線 → capsule への morph 開始 |
| f041 | 10.25 | 縦長白 capsule（~76% x、高さ ~15vh 相当）に成長 | 縦 capsule のまま太る |
| f042 | 10.5 | capsule が**横方向に展開**し丸角入力バーに（x 65–85%、sweater の上に重なる、中身は空） | 横幅 expand（width アニメ、丸角維持）。気持ちよい spring 系 |
| f043 | 10.75 | バー全開（x ~63–88%、y 中心 ~50%）。まだ空・ボタンなし | expand 完了 |
| f044 | 11.0 | バー右端に**黒丸 ↑ send ボタン fade-in**。sweater は青緑に発色 | ボタン単体 fade/scale-in |
| f045 | 11.25 | 同状態 hold | — |
| f046 | 11.5 | **typewriter 開始**: 「I need a warm」 | 1 文字ずつ左詰めタイプ。caret なし |
| f047 | 11.75 | 「I need a warm sweater」 | タイプ継続（~10 文字/0.25s） |
| f048 | 12.0 | 「I need a warm sweater in green. Un」— バーが 2 行に**高さ拡張**。背後の sweater が rounded card 化し始める（暗転 + 角丸枠出現） | テキスト折返しで bubble 高さが auto-grow。背景素材は crossfade 準備 |
| f049 | 12.25 | 全文「I need a warm sweater in green. Under $200.」完成。背後に角丸の商品 card（緑系画像）が透けて出現 | typewriter 完了 + 背景 crossfade 進行 |
| f050 | 12.5 | **Scene D: 商品 card 出現**（緑 sweater 着用モデルの胴体クロップ、x 66–83% / y 28–77%）。bubble は card 左上に重なる | card fade-in + 微 scale-up。bubble は「入力バー → 送信済み吹き出し」へ縮小遷移開始 |
| f051 | 12.75 | card 鮮明化（モデルの顔まで見える）。bubble は**縮小**（font 小さく 2 行、send ボタンも灰色小型化）し card 左縁に pin | bubble の scale-down + 位置 snap。card は実写（モデルが微動 = 動画素材） |
| f052 | 13.0 | card 微拡大しつつ下へ、bubble は card **右上角**へ再配置。card 下に caption「Forest + …」が fade-in。右下隅に次の浮遊 thumb（白内装）が edge から進入 | card の settle + caption fade-in。次 scene の素材が画面端から slide-in 開始 |

## モーション所見（実装向け）

1. **scene 切替は 2 方式の使い分け**
   - A→B（checkout 群 → Thank you 群）: 同位置 **crossfade**（~0.5s、レイアウト保持で opacity だけ入替）
   - B→C（Thank you 群 → sweater）: **push-in zoom + fade to black**（~1.0s）→ 黒経由で次素材 fade-in。盛り上がりの切替にだけ zoom を使う
2. **chat 入力バーの誕生が最重要モーション**: 細い縦線 → 縦 capsule → 横 expand → send ボタン fade-in → typewriter、の 5 段直列（計 ~1.5s）。これが「チャットで買う」の signature
3. **bubble の役割遷移**: 入力バー（大・中央）→ 送信済み吹き出し（小・商品 card の角に pin）へ scale-down + snap。商品 card が「回答」として bubble の下から現れる構図
4. **浮遊 cluster の质感**: 中央鮮明 + 周辺 blur/減光の擬似 DoF、各カードに微 drift。カード内は実写動画（人物が微動）
5. **テキスト量に応じて bubble 高さが auto-grow**（1 行→2 行、f047→f048）
6. **scroll なし**: 本区間は完全に動画内演出。左 copy は不動
