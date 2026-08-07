# Task 5 Report — SAZO Directory, Catalog, Editorial, and Service Views

## Status

完了。承認済み desktop / mobile 録画を基準に、ブランド、カテゴリー、カタログ、ランキング、レビュー、サービス紹介の6 viewを実装し、既存shellの状態遷移へ接続した。

## 実装内容

- `BrandsView` は8ブランドのstacked row、ロゴ代替表示、日本語表記、録画cropのpreview strip、ローカル保存状態、画像失敗時のskeleton fallbackを持つ。
- `CategoriesView` は親カテゴリーと子カテゴリーの2-column directory、選択状態、子項目から対応するcatalog tabへの遷移を持つ。
- `CatalogView` はsticky category tabs / chips、`全体 86個`、accessibleなlist / grid切替、responsive product card layoutを持つ。商品DOMはmodeごとに複製せず1組だけ描画する。
- `RankingView` は購入数 / 閲覧数 / 週間controlsと順位付き12商品grid、`ReviewsView` はcategory chipsと8件のmasonry-like layoutを持つ。
- `ServiceView` はURL entry、3 step、trust panel、FAQ accordion、support block、footer linksを持つ。FAQ先頭項目は初期展開し、native button、`aria-expanded` / `aria-controls`、`max-height` / opacity transitionで操作できる。
- homeのレビュー / ランキングの「もっと見る」を各viewへ接続し、全view切替時にscroll位置を先頭へ戻す。
- `ProductCard`とブランド保存buttonにローカルのpressed stateと動的accessible labelを追加した。
- 表示ラベルは`ja / en / pt-BR` locale JSONへ追加し、録画由来の商品・ブランド・カテゴリー・レビュー構造はtyped fixtureへ集約した。
- 新規styleは`.sazo-root`配下に限定し、1511×828 desktopと390×844 mobileをresponsive breakpointで再現した。

## Visual assets

- desktop録画からブランドpreview 8枚とサービスstep 3枚を抽出・cropし、ローカルWebPとして保存した。
- FFmpegで対象frameをPNG抽出し、WebP encoderがないため最終encodeのみPillowを使用した。
- 新規11 assetの合計は106,992 bytes、最大は`service/step-02.webp`の22,936 bytes。外部network画像は使用していない。

## TDD evidence

### RED

```bash
pnpm vitest run tests/unit/sazo-commerce-views.test.tsx
```

- view module実装前に`@/sazo-commerce/CatalogView`のmissing-module failureを確認した。
- 自己レビューでcategory childからcatalogへ整数文字列を渡す不整合を回帰テストで再現し、`ベースメイク` tabが選択されないfailureを確認した。
- directory category選択後にreviewsへ移るとどのchipもactiveにならない共有state不整合を回帰テストで再現した。
- browser QAで長いhomeからview遷移するとscroll位置が残るfailure（849px）を再現した。

### GREEN

```bash
pnpm vitest run tests/unit/sazo-commerce-views.test.tsx
pnpm test:sazo-views-browser
```

- view contract、back button accessible label、list / grid mode、single active view、mode保持、category-to-catalog tab、review chip fallback、FAQ、favorite stateの13 testsがPASSした。
- Chrome behavior QAは`sazo-views-browser-ok`を返し、desktop / mobileの遷移、件数、mode保持、scroll reset、FAQ keyboard操作とcomputed transitionを確認した。

## Verification

| Command                        | Result                                      |
| ------------------------------ | ------------------------------------------- |
| focused Vitest                 | PASS — 1 file / 13 tests                    |
| `pnpm test`                    | PASS — 8 files / 64 tests                   |
| `pnpm typecheck`               | PASS                                        |
| `pnpm lint`                    | PASS                                        |
| `pnpm build`                   | PASS                                        |
| `pnpm test:sazo-views-browser` | PASS — `sazo-views-browser-ok`              |
| scoped `prettier --check`      | PASS                                        |
| `git diff --check`             | PASS                                        |
| asset size check               | PASS — 最大22,936 bytes / 合計106,992 bytes |

## Visual QA / self-review

- Chrome 1511×828でbrands、categories、ranking、reviews、service top / FAQを描画し、録画の密度、column幅、カード比率、sticky controls、footerまで確認した。
- Chrome 390×844でcatalog grid、mode保持、brands、categories、serviceを描画し、view header、horizontal rails、2-column category、stacked service stepsを確認した。
- public componentはnamed export、内部importは`@/`、新規CSSは`.sazo-root` scope、画像はlocal path、表示ラベルはlocale JSON、fixtureはtyped arrayに限定した。
- `any`、console、親相対import、新規hardcoded hex、重複active view DOMは追加していない。

## Concerns

- catalogの商品画像と商品fixtureはTask 4で録画から作成された12商品を再利用している。今回の録画に表示された86件全量をfixture化したものではない。
- browser QA screenshotは`/tmp/sazo-task5-*`にのみ生成し、deliveryには含めていない。
