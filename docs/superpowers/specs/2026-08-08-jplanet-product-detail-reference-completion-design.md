# J-Planet Product Detail Reference Completion Design

## Goal

提供された3枚のSAZO商品詳細参考画面の情報量、配置、追従挙動をJ-Planetの日本→ブラジル向けモックとして再現する。SAZOの色・ロゴ・韓国向けコピーは持ち込まない。

## Reference Structure

### Product hero

- Desktopは左に大きな正方形ギャラリーと縦thumbnail、右に商品購入情報を置く。
- 右カラム最上部に、ECロゴ風バッジと下線付き「元のページへ」を横一列で配置する。
- 続けて商品名、原文名、価格、販売区分、配送期間、J-Planetの配送サポートを表示する。
- shareとfavoriteは商品名横の独立した44px操作領域にする。
- Mobileはギャラリー→販売元リンク→商品情報→購入フォームの順に一列化する。

### Source link

- 商品の`brand`をロゴ風バッジとして表示する。
  - `11D`: 黒地に白文字。
  - `NAVER`: 緑地に白文字。
  - `KREAM`: 黒地に白文字。
  - `ABLY`: 桜色地に濃紺文字。
  - その他: J-Planet濃紺地に白文字。
- 実在の商品URLは不要なため、`https://example.com/jplanet/source/<product-id>`形式の決定的なモックURLへ新しいタブで遷移する。
- 外部画像は使わず、unknown brandでも汎用バッジを表示する。

### Purchase panel

- 参考画面と同じく、商品オプション、選択商品、数量stepper、ご要望、ご要望ガイド、画像チェック、合計内訳、カートCTAを一つのpanelへまとめる。
- quantityは1以上で、増減すると商品価格と現地流通費を含む総額が更新される。
- 必須optionが未選択の場合は既存validationとfocus移動を維持する。
- Desktopではpanelをviewport内でstickyにし、商品情報エリアをスクロールしても右側に残す。
- Mobileでは既存の下部固定CTAと同じform stateを共有し、form自体を複製しない。

### Recommendation rail

- hero直後に「この商品はいかがですか？」の横長recommendation railを置く。
- Desktopは6商品相当を一度に見せ、右矢印で横送りできる密度にする。
- Mobileは2商品強を見せるhorizontal scrollにする。
- 販売元バッジ、商品名、価格、favoriteを参考画面と同じ順で表示する。

### Detail content and sticky checkout

- Desktop下部は左のcontent areaと右のsticky purchase panelを並べる。
- 左側上部に「商品情報」「注意事項」tabを置く。
- 商品情報tabの先頭に、注文受付→日本で購入→日本倉庫で検品→国際配送・通関→ブラジルへお届け、の5段階flow cardを表示する。
- 注意事項tabは在庫、輸入制限、返品・返金の既存内容を表示する。
- review、cautions、benefitsは既存情報を保ちながら、参考画面の余白とcard密度へ寄せる。

### J-Planet campaign banner

- 参考画面のSAZO韓国広告と同じ配置・横幅・視覚的な強さで、J-Planet用bannerを表示する。
- 色は白・桜色・濃紺を使用し、コピーは「日本の販売サイトから直接購入」「ブラジルへお届け」に統一する。
- SAZO、韓国、KOREA、TO JAPANの文字やassetを含めない。

## Component Boundaries

- `ProductSourceLink`: brand、href、翻訳済みlabelを受け取り、ロゴ風バッジと外部リンクを描画する。
- `ProductPurchasePanel`: option、quantity、request、image check、total、feedbackを一つのform stateへ接続する。
- `ProductRecommendationRail`: 既存`ProductCard`を利用し、商品切替をdispatchする。
- `ProductOrderFlow`: 既存5段階fixtureとi18nを利用する。
- `ProductCampaignBanner`: J-Planet固定assetまたはCSS compositionとして描画する。

## Data and Copy

- `ProductDetail.originalUrl`は全商品で必ず解決する。
- モックの現地流通費は固定表示値としてfixtureへ置き、total計算を決定的にする。
- 新しいユーザー表示文言はja/en/pt-BRへ同じkey構造で追加する。
- 既存の商品切替時state reset、gallery failure fallback、favorite、share、cart feedbackを壊さない。

## Responsive and Accessibility

- Breakpointsは既存の767px境界を使う。
- Desktopは2-columnとsticky panel、Mobileは1-columnとfixed CTAを使う。
- link、stepper、tab、CTAは44px以上の操作領域を持つ。
- tab、quantity、galleryはkeyboard操作可能にする。
- focus-visibleをJ-Planet濃紺と桜色で明確にする。
- 320pxでhorizontal page overflowを発生させない。

## Verification

- Unit testでsource badge/link、mock URL、metadata rows、quantity total、option validation、tab、商品切替stateを検証する。
- TDDで新しいreference hierarchyが存在しないREDを確認してから実装する。
- 実ブラウザQAで1512x982、390x844、320x844を撮影する。
- Desktopでpurchase panelのsticky位置、recommendation rail密度、tab/order flowとの横並びを測定する。
- Mobileでfixed CTA、44px操作領域、footer/chat clearance、overflowなしを確認する。
- 商品詳細の可視copyと画像に旧SAZO/Korea brandingがないことを確認する。
- `lint`、`typecheck`、全Vitest、build、商品QA、全サイト監査を通す。

## Out of Scope

- 実在ECの正式ロゴ取得。
- 実商品URLの収集・有効性保証。
- 決済、在庫、配送APIとの連携。
