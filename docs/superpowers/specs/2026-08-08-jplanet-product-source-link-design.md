# J-Planet Product Source Link Design

## Goal

商品詳細の購入パネル最上部に、販売元ECを視覚的に示すロゴ風バッジと「元のページへ」外部リンクを常時表示する。実在の商品URLへの到達はモックの対象外とする。

## Approved UI

- 添付されたSAZO参考画面と同じく、商品名より上に横長の販売元リンク行を置く。
- 左側に商品の`brand`を使ったロゴ風バッジ、右側に下線付きの「元のページへ」と外部リンクアイコンを配置する。
- バッジは画像アセットを増やさず、ブランド別の色と短い文字でECロゴらしく見せる。
  - `11D`: 黒地に白文字。
  - `NAVER`: 緑地に白文字。
  - `KREAM`: 黒地に白文字。
  - `ABLY`: 桜色地に濃紺文字。
  - その他: J-Planet濃紺地に白文字。
- PCでは購入パネルの横幅いっぱい、モバイルでは商品情報カードの横幅いっぱいに表示する。
- 44px以上の操作領域を確保し、hover、focus-visible、active状態を既存J-Planetトークンで表現する。

## Data and Navigation

- `ProductDetail.originalUrl`は全商品で解決できるようにする。
- 実URLは不要なため、`https://example.com/jplanet/source/<product-id>`形式の決定的なモックURLを使う。
- リンクは新しいタブで開き、`rel="noreferrer"`を付ける。
- 可視文言とaccessible nameは既存の`source.openOriginal` i18n keyを利用し、TSXへ新しい固定文言を追加しない。

## Component Boundary

- `ProductSourceLink`を商品詳細用の小さなnamed componentとして切り出す。
- 入力は`brand`、`href`、翻訳済みlabelのみとし、ブランド表現の正規化をcomponent内へ閉じ込める。
- 購入フォーム、共有、お気に入り、商品切替stateには影響させない。

## Failure Handling

- ブランド名が未知でも汎用バッジを表示する。
- モックURLは常に生成されるため、リンク行を非表示にする分岐は持たない。
- 外部画像を使わないため、ロゴ画像の読込失敗は発生しない。

## Verification

- Unit testでロゴ風バッジ、ブランド名、「元のページへ」、外部URL、`target`、`rel`を検証する。
- 商品切替後にリンク先とバッジが切り替わることを検証する。
- TDDで、現状リンク行が存在しないREDを確認してから実装する。
- PC、390px、320pxの実ブラウザQAで表示、44px操作領域、横overflowなしを確認する。
- `lint`、`typecheck`、全Vitest、build、商品QA、全サイト監査を通す。

## Out of Scope

- 実在ECの正式ロゴ取得。
- 実商品URLの収集・有効性保証。
- 遷移先サイトとのAPI連携。
