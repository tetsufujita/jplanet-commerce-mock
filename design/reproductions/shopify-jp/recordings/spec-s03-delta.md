# spec-s03-delta — §3 chat デモ UI 詳細 & 差分

> ソース: `recordings/f3/001–102.png`（4fps、約 2 ループ分、f3 = 高解像度スクリーンキャプチャ）
> 照合先: `spec-s03-chat-demo.md`（既存 timeline spec）+ `src/shopify-jp/sections/SpChatSection.tsx`（現実装）
> 本家ブランド表記（ChatGPT / OpenAI ロゴ等）は架空名（AI_CHANNELS 準拠）へ置換前提で記述。

---

## ① UI 詳細（stage 別表）

### S1 入力誕生（t 0.00–3.00）

| 要素 | 実測ビジュアル |
|---|---|
| 背景 sweater | **実写物撮り写真**。暗い黒背景に深緑のニットセーターが単体で浮かぶ。向きは正面/やや斜め。照明は正面強め、セーター下に落ち影。素材感（編み目テクスチャ）が見える。アスペクトは正方形寄り（約 1:1.1）。 |
| sweater の位置・サイズ | 右半分領域の中央やや上。高さ約 40%。 |
| キャレット（t~1.00） | 細い白い縦棒（約 2px 幅、高さ約 20px 相当）。sweater の右側中央に出現。pill ではなく純粋な縦線 cursor。 |
| pill 展開 | キャレットが横に伸びて入力バーへ変形。白い角丸長方形。sweater の右下寄り（中央右）にオーバーレイ配置。pill の位置は sweater にかかっており、sweater は pill の後ろに見える。 |
| send ボタン | 黒丸に上向き矢印。バー右端に現れる。 |
| typewriter テキスト | 「I need a warm sweater in green. Under $200.」2行に折り返し。 |

### S2 回答（t 3.00–5.25）

| 要素 | 実測ビジュアル |
|---|---|
| bubble 変形 | pill が縮小・上方移動して「送信済み bubble」へ。白い角丸矩形、テキスト「I need a warm sweater in green. Under $200.」を内包。bubble は card 領域の**上部にオーバーレイ**（card の右上角ではなく card 上方の独立した位置）。 |
| 商品 card | **実写モデル着用写真**。アジア系女性が深緑ニットを着用。背景は砂岩/岩肌（ウォームベージュ・テクスチャ）。ハーフボディ〜全身。黒のワイドパンツ、ゴールドネックレス。ポートレート縦長（約 3:4 比率）。角丸あり。 |
| card 位置 | 右半分の中央。bubble の直下から card が立ち上がる形。zoom-out 前は card が画面の 60% 程度の高さを占める大きさ。 |
| caption | card 左下外側に「Forest Knit Sweater」白テキスト。typewriter で左→右に出現。 |
| send ボタン変化 | bubble 化と同時に灰色・小型化。 |

### S3 device reveal + carousel（t 5.25–6.50）

| 要素 | 実測ビジュアル |
|---|---|
| zoom-out | bubble + card が一体で縮小しつつ上方へ移動。phone frame が外から fade-in。 |
| chat ヘッダ | status bar（時刻「11:30」+ バッテリー）/ その下にアプリタイトル行：**「[架空 AI 名]」**（本家は「ChatGPT」。テキスト中央配置、左に三本線ハンバーガーアイコン、右に 2 アイコン = 共有系+人物アイコン）。UI 背景は**ライトグレー**（#EBEBEB 相当）。 |
| user bubble | 右寄り、白背景角丸（iOS Messages 風）。テキスト黒。 |
| assistant reply テキスト | **「Absolutely. Here are some green sweaters under $200 that you might love.」**（黒テキスト、ライトバックグラウンドに対して通常テキスト。左揃え。assistant bubble なし—テキスト単独）。 |
| carousel card 1 | **実写モデル着用写真**（S2 と同一人物・同一写真）。下部に商品名「**Forest Knit Sweater**」/ ブランド名「**vera**」（小文字、左寄り）/ 価格「**$125.00**」（右寄り）。白背景。角丸。 |
| carousel card 2 | **実写物撮り写真**（暗背景に薄茶/キャメルのニットセーター横向き）。下部：「**Cashmere Crewneck**」/ ブランド「**Penny**」/ 価格「**$148.00**」。白背景。角丸。 |
| carousel card 3 | 大半が右端で見切れ。緑系ニットと推定。 |
| 下端入力欄 | 「+ Ask anything」テキスト + 右端に上向き矢印ボタン。ライトグレー背景。 |
| phone UI 全体色 | **ライトモード**（白/グレー系背景）。現実装の dark UI とは逆。 |

### S4 商品詳細（t 6.50–7.50）

| 要素 | 実測ビジュアル |
|---|---|
| 写真 | 大判モデル着用写真（S2/S3 と同一）。シート上半分〜2/3 を占める。 |
| 商品名 | 「**Forest Knit Sweater**」セミボールド、左寄り。 |
| ブランド行 | 緑丸アイコン（ブランドロゴ）+「**Verce**」テキスト / 右側に「**$125.00**」価格 + 「**Visit**」ボタン（小）。 |
| バッジ行 | 「**In Stock**」· 「**Free delivery**」（グレーテキスト、ドット区切り）。 |
| 区切り線 | 価格行の下に細い gray border。 |
| What to know | 「**What to know**」ラベル（ボールド）+ 本文「Crafted from premium, soft-to-touch fabric, this sweater ensures maximum comfort and durability.」（グレーテキスト、2〜3行）。 |
| シートの高さ | phone 下から約 70〜75% 程度。 |
| シート背景 | 白。 |

### S5 購入確認（t 7.50–8.00）

| 要素 | 実測ビジュアル |
|---|---|
| 地図 | シート上部 30%。リアルな地図（道路・街区が見える。Apple Maps 風ベージュ系）。地図上に**人物の顔写真（Jordan の顔・丸形）**が配達先マーカーとして配置。 |
| メインテキスト | 「**Thank you, Jordan!**」セミボールド、中央寄り。 |
| サブテキスト | 「**Order placed**」（グレー、小）。 |
| Track ボタン | 「**Track order**」紫（#6E56F8 相当）角丸全幅ボタン。 |
| 商品サムネ行 | 小さい商品写真サムネ（ニット） + 「Forest Knit Sweater」テキスト + 「$125.00」右寄り。 |
| 住所行 | 「Jordan Chen」/ 「1500 Saint St, Apt 12」/ 「Portland, OR 97205」。グレーテキスト。 |
| シートの高さ | phone 下から約 80%（詳細シートより高い）。 |

### S6 constellation（t 8.00–10.75）

| 要素 | 実測ビジュアル |
|---|---|
| phone 台数 | 12〜16 台が確認できる（spec の 8〜12 より多い可能性）。 |
| phone 各面（checkout 相当） | 各 phone は**それぞれ異なる AI チャット UI**を表示。ライトモード UI（白系背景）と dark UI（黒系）が混在。一部の phone は S3 と同様のカルーセル画面、一部は注文確認画面（「Order confirmed」テキストが見える）。 |
| 深度構成 | 近景: 大きく前後 blur あり / 中景: ピント合ってクリア / 遠景: 小さく暗め。3 層構成は spec 通り。 |
| 中央 focus phone | S5 の確認シートが表示された状態のまま dolly-out（確認シートが見えている）。 |
| 周辺 phone の形状 | 一部が landscape 向きの tablet 風サイズ（横長）も確認できる。ほとんどは portrait phone。 |

### S7 Thank you（t 10.75–13.25）

| 要素 | 実測ビジュアル |
|---|---|
| Nyoka カード | 左寄り中サイズ。**実写ポートレート（アジア系女性）**。暖色グラデーション背景。左上に白背景+黒チェックマークの丸アイコン。左下に白テキスト「Thank you,」/ 「**Nyoka!**」改行。 |
| Alberto カード | 中央右・最大サイズ（前景）。**実写ポートレート（ラテン系男性、淡いウォームグレー衣服）**。暖色背景（ベージュ〜テラコッタ）。中央上に白背景+黒チェックマークの丸アイコン。中下に白テキスト「Thank you,」/ 「**Alberto!**」。 |
| Fabian カード | 右上・小サイズ。テキスト「Thank you, Fabian!」が確認できる。 |
| 名前なし phone | 残りの phone は Thank you テキストのみ（顔なし）または顔写真付き（名前不明）。 |
| push-through | Alberto カードが画面全体を覆う形で zoom → fade-out。Alberto の顔が最終フレーム直前まで全面に見える。 |

---

## ② 現実装との差分リスト（優先度付き）

### [P1 必須] 視覚的一致に直結する差分

| # | 差分項目 | 現実装 | 本家（フレーム確認） | 対応方針 |
|---|---|---|---|---|
| D1 | **S1 sweater**: 素材 | SVG イラスト（`KnitSweater` コンポーネント）| 実写物撮り写真（暗背景+緑ニット実物） | 写真アセットを生成して `<img>` 差し替え。SVG は廃止。 |
| D2 | **S2 商品 card**: 素材 | `ProductPhoto`（砂色 gradient + KnitSweater SVG） | 実写モデル着用写真（アジア系女性、岩肌背景） | カード写真を生成アセットに差し替え。 |
| D3 | **S3 carousel**: phone UI の配色 | dark モード（黒系 `#101415` 背景） | **ライトモード**（白/グレー系 `#EBEBEB` 相当） | `ChatHeader`・`ReplyText`・carousel 背景を white/light-gray に変更。文字色を dark に反転。 |
| D4 | **S3 assistant reply テキスト** | 「Here are some green sweaters under $200:」 | 「Absolutely. Here are some green sweaters under $200 that you might love.」 | `REPLY_TEXT` 定数を更新。 |
| D5 | **S3 carousel card 1 ブランド名** | 「konoha · Free delivery」 | ブランド「vera」（小文字）/ 価格右寄り | ブランド名を `vera` に変更、レイアウト修正。 |
| D6 | **S3 carousel card 2**: 写真・商品名・ブランド | 「Moss Crewneck」$148.00 / コスト砂色 gradient | 物撮り写真（キャメルニット暗背景）/ 「Cashmere Crewneck」$148.00 / ブランド「Penny」 | 商品名・ブランド修正 + 写真アセット差し替え。 |
| D7 | **S3 chat header 右側アイコン** | ドットが 2 個（`size-[5px]` 丸 × 2） | 左: ハンバーガー（三本線）、右: 共有+人物アイコン群 | ヘッダ左に三本線アイコン追加、右アイコン 2 つに変更。 |
| D8 | **S4 詳細シート ブランド行** | 「konoha · In Stock · Free delivery」単行 / 価格右端 | ブランドロゴ(緑丸)+「Verce」/ In Stock・Free delivery 別行 / 価格+「Visit」ボタン | ブランド名を `Verce` + ロゴ丸に変更、Visit ボタン追加。 |
| D9 | **S5 確認シート 地図** | 抽象 SVG（`MapBlock`：ライン+紫丸） | リアル地図風（Apple Maps 系ライト配色 + Jordan 顔写真マーカー） | 地図をより写実的な gradient + ストリートライン SVG に改善。顔写真サークルを地図上に追加。 |
| D10 | **S6 constellation checkout 面** | 抽象 `CheckoutFace`（暗背景+紫ボタンのシルエット） | 各 phone に実際の AI chat UI 風スクリーン（ライトモード + カルーセル / 注文確認など） | `CheckoutFace` をライトモード chat UI 風モックに刷新。少なくとも 2 バリアント（カルーセル型・注文確認型）が必要。 |
| D11 | **S7 Thank you face**: 人物 | `ThankYouFace`（シルエット gradient + 図形代替） | 実写ポートレート写真（Nyoka/Alberto/Fabian）+ チェックマーク丸アイコン | 各 Thank you カードに生成写真 + 白チェックマーク丸オーバーレイを追加。 |

### [P2 中] 補正推奨

| # | 差分項目 | 現実装 | 本家 | 対応方針 |
|---|---|---|---|---|
| D12 | **S2 bubble 位置** | `PILL_POSE.bubble` = `top: "-14%"` (card 右上角のドック位置) | card 上方（独立した位置、card の真上に距離あり） | bubble の `top` 値を `-22%` 程度に上げ、card との間隔を確保。 |
| D13 | **S3 carousel card 3** | 「Pine Cable Knit」$172.00 / gradient | 緑系ニット（推定）/ 商品名・ブランド不明（見切れで読み取り困難） | 少なくとも商品名を「Ribbed Cable Knit」等の自然な名称に変更（本家読み取り不可のため独自設定で可）。 |
| D14 | **S3 下端入力欄テキスト** | 「Ask anything」 | 「+ Ask anything」（+ プレフィックス付き） | テキストに「+ 」を追加。 |
| D15 | **S1 pill 位置** | `left: "60%"` → bar `left: "4%"` | pill は sweater の中央右にオーバーレイ（sweater 右端付近、画面右 1/3 あたり） | pill の初期 x 位置と bar 位置を sweater と重なる位置へ調整（`left: "55%"` 付近）。 |
| D16 | **constellation phone 台数** | 11 台 | 12〜16 台（見切れ含む） | `CONSTELLATION` 配列に 2〜4 台追加（遠景 / far 層）。 |

### [P3 軽微]

| # | 差分項目 | 現実装 | 本家 | 対応方針 |
|---|---|---|---|---|
| D17 | **AI チャンネルアイコン配色** | Loupe = 青+黄、Halo = 紫→水色グラデーション | 本家 3 アイコンは OpenAI 白/Google 4色/Perplexity 紫（複製不可）。現実装の Quill/Loupe/Halo は代替として妥当 | 変更不要（架空ブランド維持）。 |
| D18 | **S5 確認シート「Order placed」** | 「Order placed · Arrives in 3 days」 | 「Order placed」のみ（`Arrives in 3 days` の有無はフレームから判断困難） | 両方残して可。判断保留。 |

---

## ③ 生成写真リスト（プロンプト案つき）

### 写真 A — sweater 物撮り（S1 背景）

**役割**: S1 の sweater fade-in 背景。暗闇の中に浮かぶニット物撮り。

**アスペクト比**: 1:1（正方形）〜 3:4（縦長）

**被写体・構図・トーン**:
- 深緑（モスグリーン〜フォレストグリーン）のケーブルニットセーター、スタジオ物撮り
- 背景は純黒〜ごく深い黒（#010A09 相当）
- セーターのみ、人物なし、台も見えない（空中に浮かんでいるように）
- 正面〜やや斜め上から。照明は前面と左斜め上から。ハイライトが編み目に乗る。
- ドラマティックな chiaroscuro 照明（shadow が深い）。プロダクト広告クオリティ。

**プロンプト案**:
```
Studio product photograph of a deep forest green cable-knit sweater floating against a pure black background, no person, no surface visible, dramatic top-left key lighting highlighting the knit texture, soft shadow below, editorial fashion photography, high detail, square crop
```

---

### 写真 B — モデル着用（S2 card・S3 carousel card1・S4 詳細シート・S5 確認サムネ）

**役割**: メインの商品提示写真。全 stage で使い回す。

**アスペクト比**: 3:4（縦長ポートレート）

**被写体・構図・トーン**:
- アジア系または人種中立的な 20〜30 代の女性モデル
- 深緑ケーブルニットセーターを着用。黒のワイドパンツ。ゴールドのシンプルなネックレス
- ウエスト〜全身（下半身まで入る縦構図）
- 背景: 砂岩/岩肌テクスチャ（ウォームベージュ、自然光が当たった砂漠・荒野の壁面）
- 自然光風の柔らかい照明。editorial ファッション写真スタイル
- カメラ目線または視線を少し外したナチュラルなポーズ（両手を軽く前に、または片手をポケットに）

**プロンプト案**:
```
Editorial fashion photograph of a young woman wearing a deep forest green cable-knit sweater and wide-leg black trousers, standing in front of a sandstone rock texture wall with warm natural light, gold necklace, full body portrait, soft natural lighting, clean and minimal fashion photography, 3:4 aspect ratio
```

---

### 写真 C — キャメル/ベージュニット 物撮り（S3 carousel card2）

**役割**: カルーセル 2 枚目「Cashmere Crewneck」の商品写真。

**アスペクト比**: 1:1 〜 3:4

**被写体・構図・トーン**:
- キャメル/ライトタン色のカシミヤ風クルーネックセーターを横向きに置いた物撮り
- 背景は暗い（チャコールグレー〜黒）
- ニットの柔らかさ・素材感を強調。折りたたまれた状態、または平置き
- ドラマティックなスタジオ照明。シャドウが強め

**プロンプト案**:
```
Studio product photo of a folded camel tan cashmere crewneck sweater laid on a dark charcoal surface, dramatic side lighting showing soft knit texture, dark moody background, luxury product photography, high detail
```

---

### 写真 D — ポートレート「Nyoka」（S7 Thank you card）

**役割**: Thank you 面の人物カード「Thank you, Nyoka!」。

**アスペクト比**: 3:4 〜 1:1

**被写体・構図・トーン**:
- アジア系または東アフリカ系の 25〜35 歳の女性（架空の顧客）
- ウォームオレンジ〜テラコッタのグラデーション背景
- ハーフバスト〜バスト上構図（顔〜肩が中心）
- 柔らかい微笑み、リラックスした表情
- 自然光風ポートレート。カジュアルで親しみやすいトーン

**プロンプト案**:
```
Portrait photo of a young East Asian or East African woman with a warm smile, half-bust shot, warm orange terracotta gradient background, soft natural lighting, casual and approachable style, clean editorial portrait
```

---

### 写真 E — ポートレート「Alberto」（S7 Thank you card・push-through）

**役割**: Thank you 面の大型カード「Thank you, Alberto!」。push-through で最後に全画面を覆う。

**アスペクト比**: 3:4（縦長）

**被写体・構図・トーン**:
- ラテン系男性（25〜35 歳、架空の顧客）
- 淡いウォームグレー/クリーム色のシャツまたはセーター
- ウエスト上〜バスト構図（顔と上半身が中心）
- 暖色背景（ライトベージュ〜テラコッタ）
- 穏やかな笑顔または自信ある表情
- 自然光風、クリーンな editorial ポートレート

**プロンプト案**:
```
Portrait of a Latin American young man wearing a light warm-gray sweater, half-body shot, warm beige terracotta background, natural light, confident and friendly expression, editorial portrait photography, 3:4 ratio
```

---

### 写真 F — ポートレート「Fabian」（S7 Thank you card・小サイズ）

**役割**: Thank you 面の小型カード「Thank you, Fabian!」。

**アスペクト比**: 1:1 〜 3:4

**被写体・構図・トーン**:
- 欧州系または中東系の男性（20〜30 歳、架空の顧客）
- 暖色背景。小サイズカードなので顔のアップが主体
- 笑顔ポートレート

**プロンプト案**:
```
Close-up portrait of a young Middle Eastern or Mediterranean man with a warm smile, warm amber background, natural soft lighting, friendly expression, square or portrait crop
```

---

## ④ タイムライン修正

既存 spec（`spec-s03-chat-demo.md`）の 7 stage 構成は変更不要。以下の値のみ修正：

| 項目 | 現 spec 値 | 修正値 | 根拠 |
|---|---|---|---|
| REPLY_TEXT 定数 | 「Here are some green sweaters under $200:」 | 「Absolutely. Here are some green sweaters under $200 that you might love.」 | フレーム実測（f050/f102）。2 ループとも同一テキスト確認。 |
| CAROUSEL_CARDS[0].brand | 「konoha」 | 「vera」（小文字） | f050/f102 実測。 |
| CAROUSEL_CARDS[1].name | 「Moss Crewneck」 | 「Cashmere Crewneck」 | f050/f102 実測。 |
| CAROUSEL_CARDS[1].brand | 「konoha」 | 「Penny」 | f050/f102 実測。 |
| S4 詳細シートブランド名 | 「konoha」 | 「Verce」 | f001/f052/f053 実測。 |
| CONSTELLATION 台数 | 11 | 13〜15（遠景 far 層を 2〜4 台追加） | f061〜f065 目視カウント（12 台以上確認）。 |

### タイムライン秒数：変更なし

13.25s / 7 stage の分割は変更不要。各 stage の duration も spec 通り。

---

## サマリ

差分件数: **18 件**（P1=11 件・P2=5 件・P3=2 件）
生成写真数: **6 枚**（A=sweater 物撮り / B=モデル着用メイン / C=キャメルニット物撮り / D=Nyoka / E=Alberto / F=Fabian）
