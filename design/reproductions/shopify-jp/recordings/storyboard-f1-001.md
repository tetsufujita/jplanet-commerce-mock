# Storyboard — rec1 f1/001–026（0.0–6.5s）

§3「ブランドがチャットに登場」の chat デモ動画（embedded video、ページ scroll なし）。
左カラム（x 3–37%）は見出し + 本文 + 「Agentic Storefronts」リンクで全フレーム静止。動くのは右側の動画領域のみ。
左上（x 3–13% / y 4–12%）に AI チャネルアイコン 3 連（OpenAI / Google / Microsoft Copilot、白丸バッジ）。
右下隅に次セクション動画のプレビューサムネが常時ちら見え（本編とは無関係、viewport 底辺に張り付き）。

> 注: f021 以降はフレーム幅が 900px → 674px に変化（録画クロップ変更）。% 表記で正規化して記録。

## 時系列表

| frame | 秒 | イベント | モーションの質 |
|---|---|---|---|
| f001 | 0.00 | 開幕タブロー: 白い user bubble「I need a warm sweater in green. Under $200.」(x 72–88% / y 12–22%) + 大判商品カード（緑セーターのモデル写真、x 64–79% / y 25–70%）。caption「Forest Knit S…」が出現途中 | caption は fade-in（左から順に現れる wipe 風） |
| f002–f003 | 0.25–0.75 | caption「Forest Knit Sweater」が完全表示。左上アイコン 3 連が密な重なり → 横並びにわずかに展開 | fade-in 完了。アイコンは小さな spread（移動量 数px 程度） |
| f004–f005 | 1.00–1.25 | 静止保持。bubble + カード + caption が安定表示 | hold（カード画像にごく微小な ken-burns の気配） |
| f006 | 1.50 | 遷移開始: カードがわずかに縮小、caption が減光 | scale-down + fade 開始 |
| f007 | 1.75 | カード大きく縮小（元の約 6 割）、背後に暗い角丸シルエット（iPhone の前身）が出現。全体が軽くブラー | 連続 scale-down + 背景に device frame が fade-in、被写界深度ブラー |
| f008 | 2.00 | iPhone 枠がはっきり出現（ぼけたまま、x 66–82% / y 15–88%）。bubble と商品画像が電話内レイアウトのスケールへ収まっていく | morph: 抽象 chat → 実機 UI への吸い込み。rack focus（ボケ→ピント） |
| f009 | 2.25 | 電話内で assistant 返信領域 + カルーセル 1 枚目（緑セーター）が形成中。まだ全体ソフトフォーカス | crossfade + フォーカス回復途中 |
| f010–f011 | 2.50–2.75 | ピント完全回復。ChatGPT モバイル UI: ヘッダー「ChatGPT」、user bubble、返信「Absolutely. Here are some green sweaters under $200 that you might love.」、横スクロール商品カルーセル 3 枚（Forest Knit Sweater $125.00 · Verve / Cashmere Crewneck $159.00 · Plenty / 3 枚目見切れ）、下端に「Ask anything」入力バー | 静定。カルーセルは返信と同時に出現（4fps ではタイプ演出は確認できず、ほぼ一括表示） |
| f012 | 3.00 | カルーセル 1 枚目が商品詳細ページへ展開: 大判画像が電話の下 2/3 を占有、「Forest Knit Sweater」、merchant Verve、「In Stock · Free delivery」、$125.00、「Visit」ボタン | card→detail の expand / morph（タップ想定の shared-element 遷移） |
| f013–f014 | 3.25–3.50 | 詳細ページ内スクロール: 画像が上へ寄り「What to know」説明文（Crafted from premium, soft-to-touch fabric…）が下に出現 | 電話内の垂直 content scroll（上方向、1 画面弱） |
| f015 | 3.75 | 電話がわずかに縮小開始（outro の前兆）。詳細ページは保持 | 全体 scale-down 開始（ごく緩い） |
| f016 | 4.00 | 注文確認シートが電話下端からスライドアップ: 地図 + 配達員アイコン、「Thank you, Jordan!」、Order placed、藍色ボタン「Track your order with Shop」、$125.00。商品画像は上部に残存 | bottom-sheet の slide-up（下→上、電話の約 2/3 を覆う）。checkout 入力は省略（detail→confirmation へ圧縮） |
| f017 | 4.25 | シートが電話全面に。電話はさらに縮小（高さ 65%→約 45%、x 70–80% / y 28–75%）。住所（Jordan Chen, New York NY…）・支払情報まで見える | カメラ dolly-out 開始 |
| f018–f019 | 4.50–4.75 | 確認画面の電話を中心に、周囲へ暗い電話シルエットが多数 fade-in（右上 x ~78%/y 15%、左下 x ~60%/y 75% など、奥行き差あり） | dolly-out 継続 + 周辺電話の fade-in（深度別パララックス） |
| f020 | 5.00 | フル constellation: 中央の Shop 確認電話の周囲に約 8–10 台の電話が浮遊。明暗・ボケで深度表現 | カメラ引き続ける。浮遊電話は各自ゆっくり drift |
| f021 | 5.25 | カメラが群れの中を通過する見え方: 左端に白 chat UI の大電話（近景・ボケ）、右端に暗い大電話（近景）、中景に小電話多数 | fly-through / パン（左→右方向の視差大）。近景は強ブラー = DOF |
| f022–f023 | 5.50–5.75 | 新しいヒーロー電話群が点灯: 左にオレンジ枠の電話（ダーク UI・商品カード）、中央に白い checkout フォーム電話、右に暗い chat 電話（椅子の商品画像 +「Order confirmed」）。別シナリオ（家具）の買い物が示唆される | 各電話が fade + ピント送りで順に立ち上がる。カメラ減速 |
| f024–f026 | 6.00–6.50 | 静定ポーズ: 前景 3 台（オレンジ枠 / 白 checkout / 椅子+Order confirmed）にピント、周囲 10 台前後は減光・ボケで浮遊。以後ほぼ静止（ごく緩い drift のみ） | settle。ease-out で停止、微小 idle drift 継続 |

## モーション所見

1. **1 ループ = 1 購買journey の圧縮**: 抽象 chat（bubble+カード）→ 実機 ChatGPT UI → カルーセル → 商品詳細 → 確認（Shop 追跡）→ 多デバイス constellation、の 6.5 秒で「発見→購入→追跡→あらゆる AI チャネル」を語る構成。
2. **遷移は全て連続カメラ**: カット割りなし。scale-down + rack focus（ボケ⇄ピント）+ crossfade で場面を継ぎ、checkout 入力など冗長な工程は bottom-sheet 1 枚に圧縮。
3. **抽象→実機の morph（f006–f010）が要**: 同じ bubble / 商品画像が縮みながら電話枠に「吸い込まれる」shared-element 的遷移。再現時は同一要素の scale+position トゥイーンと device frame の fade-in を同期させる。
4. **constellation（f017–f026）は深度 3 層**: 近景（強ブラー・大）/ 中景（ピント・ヒーロー 3 台）/ 遠景（減光・小）。fade-in は中心から外周へ時差、最後は ease-out で静定 → 微小 drift の idle 状態。
5. **チャネル中立の演出**: 左上に OpenAI/Google/Copilot アイコン常設、終盤にオレンジ枠（別 AI surface 示唆）の電話を点灯させ「どの AI チャットでも」を視覚化。
6. **ページ scroll は f001–f026 で発生なし**。左テキスト列は完全固定。f021 のフレーム寸法変化は録画クロップの変更でありページ遷移ではない。
