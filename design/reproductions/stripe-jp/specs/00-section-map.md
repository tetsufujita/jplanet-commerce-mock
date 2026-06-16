# 00 — stripe.com/jp Section 構造マップ（DOM 分析）

> 元データ: `design/reproductions/stripe-jp/stripe-jp-dom.html`（950,723 bytes・1 行 minified・2026-06-11 取得）
> byte offset は同ファイル内の位置。再現実装の section 分割・命名の基準にする。

---

## 1. 上から順の section 一覧

| # | offset | 役割 | 主要見出し（原文） | root class / id | 主要要素 |
|---|---|---|---|---|---|
| 0 | 29,470 | **Header / グローバルナビ** | — | `header.navigation` > `nav#navigation-menu.hds-navigation-menu.navigation-menu--homepage` | trigger button ×4（megamenu）+ link ×2 + hamburger + CTA ×2。**megamenu panel は DOM に無い**（§3 参照） |
| 1 | 38,386 | **Hero** | h1「事業成長を支える金融インフラ。決済から組込み型金融、エージェンティックコマースまで、企業の収益最大化を支援。」 | `section.hero-section-container` | GDP ticker / **h1 二枚重ね** / CTA「始める」+「Google で登録」/ wave 背景（**WebGL 無し・静的 picture**）/ logo marquee |
| 2 | 171,481 | **プロダクト bento（6 カード）** | h2「ビジネスの形態を問わない、柔軟なプラットフォーム。」 | `.modular-solutions-section` + `.modular-solutions-bento` | `<button>` カード ×6（`aria-haspopup="dialog"`）: payments / billing / agentic-commerce / issuing / crypto / connect。各カードに dom-graphic（端末・UI 画像） |
| 3 | 351,875 | **日本語サポート帯** | h3「専門スタッフによる包括的な日本語サポート。」 | `.multilingual-support-section` | 背景 picture ×2（PC/mobile）+ CTA「サポートにお問い合わせ」+ chat banner の dom-graphic（吹き出しが clip-path / translateY で入替り） |
| 4 | 357,073 | **数値帯（stats）** | h2「グローバルなコマースを&nbsp;支える基盤」 | `.stats-section.stats-section--time-sunrise` | 数値 4 つ: `135+ / $1.9兆 / 99.999% / 2億+`。`stats-menu` の button 切替 + active indicator（`--active-stat-index`）+ **時間帯セレクタ**（sunrise/daytime/dusk… `stats-animation-gradient__gradient--*` 背景クロスフェード）+ Dataviz 静止画 |
| 5 | 375,933 | **あらゆるビジネスに対応（3 部構成）** | h2「あらゆるビジネスに対応。」 | `.business-sizes-section` | 下記 5a–5c。各部の間に `canvas.divider-canvas`（1264×20） |
| 5a | 376,737 | └ 大企業: 導入事例アコーディオン | h3「機動力のある金融インフラで、大企業の基盤を刷新」/ Hertz / URBN / Instacart / Le Monde | `.customer-stories` | `button.customer-stories__customer-button[aria-expanded][aria-controls=detail-customer-content-*]` + 開閉式「事例を表示」button（width 数値が inline） |
| 5b | 411,499 | └ スタートアップ: 横 carousel | h3「強固なビジネス基盤で、スタートアップの成長を加速」 | `section.startups-carousel[aria-label=導入事例]` | `.carousel__scroller`（`--carousel-scroll-progress` / `--carousel-drag-offset` / `data-carousel-drag` / `--carousel-hover-scale-target:1.036`）+ case-study card ×6 + 前後 button |
| 5c | 446,933 | └ SaaS プラットフォーム | h3「SaaS プラットフォームを「金融オペレーティングシステム」へ」 | `.platform-value__graphic-container` > `.platform-graphic` | 背景 picture + CTA「プラットフォーム向けソリューション」 |
| 6 | 540,915 | **開発者（唯一の dark）** | h2「あらゆる技術スタックに、信頼と拡張性を。」 | `section.hds-mode--dark` | CTA: docs + GitHub。下記 6a–6c。divider-canvas ×2 |
| 6a | 542,690 | └ システム連携アニメ図 | h3「既存のシステムと接続。」 | `.developer-systems-animation` | dot-grid + SVG 破線 path（**stroke #5D64FE**, `stroke-dasharray`）+ app logo flip（`__app-logo__front/back` ×7）+ PSP 接続 path |
| 6b | 584,741 | └ スケール数値 | h3「事業規模を確実に拡大。」 | （divider-canvas 2 枚で挟む） | `developer-wave-wide_2x.png` + 数値 3 つ: `5億+`(API/日) `1万+`(API/秒) `15万+`(取引/分) |
| 6c | 586,900 | └ 導入方法 3 カード | h3「インテグレーションの方法を選択。」 | `.columns[--columns-count-dt:3]` > `.feature-detail` ×3 | ① no-code: chat + payment link + QR picture ② pre-integrated: marketplace 誘導 ③ build-your-own: **`pre.integrated-code-graphic__editor` 擬似 code editor**（`.code-line/.code-linenumber/.code-string/.code-keyword/.code-autocomplete`）+ terminal |
| 7 | 616,775 | **最新情報 carousel** | h2「Stripe の最前線」 | `.events-section` + `.squeezy-carousel` | **`canvas.squeezy-carousel__canvas`（1232×460・本 DOM 唯一の描画 canvas）** + item 詳細 ×8（年次レター $1.9兆 / 15万+ / Tidemark / Tobi Lütke×John Collison 対談 / アプリストア外決済 / Crypto.com / AI プラットフォーム購入 / 大手小売）+ mobile fallback card ×8 + 前後 button |
| 7b | 641,246 | └ 今週注目の本 | h3「今週注目の本」 | `.book-of-the-week` | 書影 picture（Nature's Metropolis）+ `--book-of-the-week-background-color:#463F3B` + 円形ロゴ svg |
| 8 | 669,867 | **Footer CTA** | 「今すぐ始める」 | `.footer-cta-section__grid` | CTA「今すぐ始める」+「営業にお問い合わせ」+ feature card ×4（`.charm` icon = SVG mask + linearGradient `--icon-gradient-start/middle/end`） |
| 9 | 675,898 | **Footer** | — | `footer.footer` | link 列 ×7:「プロダクト・料金体系 / ソリューション / 開発者 / 統合とカスタムソリューション / リソース / 会社情報 / サポート」（`.footer-links-block__item` 計 77 link）+ `.footer-bottom`: locale-switcher（combobox/listbox）+ copyright。末尾に ThirdPartyFrame iframe ×2（計測用・再現不要） |

全 section root は `section.hds-color-mode.section.section--white.hds-mode--light`（§6 のみ `hds-mode--dark`、§8 は `hds-mode--light` 修飾なし白）。行間 gap は inline CSS 変数 `--section-row-gap-{mb,tb,dt}` で制御。

---

## 2. Hero の詳細構造（★WebGL 無し）

```
section.hero-section-container
└─ div.section-container.hero-section__layout
   └─ div.hero-section__layout-grid
      ├─ div.hero-section__eyebrow                       ← GDP ticker
      │  ├─ span.hero-section__eyebrow-label「Stripe 上の決済額が全世界の GDP に占める割合:」
      │  └─ span.hero-section__eyebrow-value.tabular-nums--tight
      │     ├─ span.__content-outgoing   ← 桁ごと <span> ×11（1.66203822%）
      │     └─ span.__content-incoming(--higher)         ← スロット式数字ロール（出/入 2 組）
      ├─ h1.hero-section__title--background (aria-hidden=false)  ← 実色テキスト
      ├─ h1.hero-section__title--foreground (aria-hidden=true)   ← ★同文を二枚重ね＝gradient clip 用
      │  └─ em.hero-section__title-main + span.hero-section__title-copy
      └─ div.hds-button-group.hero-section__actions
         ├─ a.hds-button--primary「始める」+ svg.hds-icon-hover-arrow
         └─ a.hero-section__button--google「Google で登録」
div.section-background.hero-section__background (aria-hidden)
   ├─ span.hero-section__fullbleed-line--top / --bottom   ← 上下の罫線
   └─ div.hero-wave-animation > __layout > __contents
      └─ div.hero-wave-animation__static                  ← ★静的 picture のみ
         （--fallback-width-desktop:1392px / -height:975px）
         └─ picture: wave-fallback-{desktop|tablet|mobile}.png（images.stripeassets.com）
div.section-container.hero-logo-section
   └─ div.logo-carousel > __marquee-container
      └─ ul.logo-carousel__marquee [style="transform: translateX(0px)"]  ← JS marquee
         └─ li.logo-carousel__item ×36（10 社 svg をループ複製: OpenAI / ECCube / Adastria /
            Amazon / Figma / Marriott / Nikkei / Nvidia / ORIX / Toyota。
            logo 色 = var(--customerLogoColor, #...)）
```

**特記**: hero に `<canvas>` は存在しない。「mesh gradient canvas」は旧デザインの遺物で、現行 JP hero は wave 静止画 + h1 二枚重ね gradient text + GDP ticker が動きの本体。`hero-wave-animation__contents` 直下が `__static` のみ＝アニメ版 wave があるなら runtime 注入だが、本 snapshot では未確認（PROGRESS.md の実測どおり静止画で確定として良い）。

---

## 3. Header nav / megamenu の DOM 構造

```
header.hds-color-mode.navigation.section.section--white.hds-mode--light
└─ div.section-container.navigation__layout
   ├─ nav#navigation-menu.hds-navigation-menu.navigation-menu.navigation-menu--homepage
   │  ├─ a.navigation-menu-home-link（Stripe logo svg 60×25）
   │  ├─ div.hds-navigation-menu__content.navigation-menu-content [data-status="unmounted"]
   │  │  └─ ul.hds-navigation-menu__list--horizontal.navigation-menu-list
   │  │     ├─ li[value="products"]   > button.hds-navigation-menu__trigger[aria-expanded=false][data-active]「サービス」+ chevron svg
   │  │     ├─ li[value="solutions"]  > button「ソリューション」
   │  │     ├─ li[value="developers"] > button「開発者」
   │  │     ├─ li[value="resources"]  > button「リソース」
   │  │     ├─ li > a[href=/jp/pricing]「料金体系」
   │  │     └─ li.navigation-item__sign-in--mobile > a「サインイン」
   │  ├─ div.navigation-menu-overflow [data-status="unmounted"]      ← mobile drawer 用
   │  │  ├─ section.navigation-menu-footer（「今すぐ始める」primary +「営業にお問い合わせ」）
   │  │  └─ section.navigation-menu-header
   │  │     └─ button.navigation-back-button [command="close" commandfor="navigation-menu"]「戻る」
   │  │        ↑ ★Invoker Commands API（command/commandfor）を使用
   │  ├─ button.navigation-hamburger-button--homepage（rect.line-1〜line-4 の svg、line-2/3 重なり=X 変形用）
   │  └─ ul.navigation-buttons
   │     ├─ li > a.navigation-item__sign-in「サインイン」
   │     │   └─ svg.navigation-item__sign-in__mask  ← SVG <mask> で文字をくり抜いた pill 背景
   │     └─ li > a.navigation-item__contact-sales.hds-button--primary「営業にお問い合わせ」+ hover-arrow
   ├─ div.navigation-menu__background                 ← ★megamenu 展開時に変形する白パネル本体
   └─ div.navigation-menu__background-static--mobile
```

**★megamenu panel（リンク群の中身）は本 snapshot の DOM に存在しない。**
根拠: trigger 全て `aria-expanded="false"`、`navigation-menu-content` / `navigation-menu-overflow` が `data-status="unmounted"`、`navigation-menu__panel` 系 class 0 件。panel は hover/click 時に React が mount → unmount で破棄する方式（Radix NavigationMenu 型）。`navigation-menu__background` が panel の白背景（開閉で width/height/位置が trigger 連動変形）。**panel 内容の再現には Playwright で hover 状態の DOM を別途取得する必要がある**（PROGRESS.md タスク 4 の「megamenu CSS 採れず」と一致）。

---

## 4. Canvas / iframe 全数

| offset | 要素 | サイズ | 用途 |
|---|---|---|---|
| 411,397 | `canvas.divider-canvas` | 1264×20 | 5a/5b 間の区切り線（描画系 divider、計 5 個共通） |
| 446,831 | `canvas.divider-canvas` | 1264×20 | 5b/5c 間 |
| 584,512 | `canvas.divider-canvas` | 1264×20 | 6a/6b 間 |
| 586,559 | `canvas.divider-canvas` | 1264×20 | 6b/6c 間 |
| 618,414 | `canvas.squeezy-carousel__canvas` | 1232×460 | §7 カード carousel の描画本体（cursor: default、唯一の大型 canvas） |
| 641,246 | `canvas.divider-canvas` | 1264×20 | 7/7b 間 |
| 871,329〜 | `iframe.ThirdPartyFrame` ×2 | — | PrivacyCompliance / GoogleTagManager（再現対象外） |

各 divider-canvas は同名 class を含む親 div でラップ（occurrence が 2 倍になるのはそのため）。

---

## 5. アニメ関連の class / data 属性（実装時に効く順）

| 仕組み | 属性 / class | 出現箇所 |
|---|---|---|
| 遅延ロードアニメ | `.lazy-animation` + `.lazy-animation--loaded`（×7）, `.lazy-bento-graphic` | bento graphic / dev systems / code 系。viewport 進入で `--loaded` 付与 |
| bento カード hover | `data-bento-card-hover-class`（×6）+ `data-bento-card-root` + inline `--card-shift-x/y` `--card-grow-x/y` | §2。hover で card がマウス方向に shift/grow。border は `__border-color-gradient` |
| カードクリック | `aria-haspopup="dialog"` + `aria-expanded` | §2 bento（クリックで dialog 展開、snapshot 未 mount） |
| GDP ticker | `.tabular-nums--tight` + `__content-outgoing/incoming(--higher)` 桁別 span | §1。数字スロットロール |
| h1 gradient | `__title--background` + `__title--foreground`（同文 2 枚） | §1 |
| marquee | `ul.logo-carousel__marquee` の inline `transform: translateX()` | §1。JS 駆動（CSS animation でない） |
| drag carousel | `data-carousel-drag` + `--carousel-scroll-progress` + `--carousel-drag-offset` + `--carousel-hover-scale-target:1.036` | §5b |
| stats 切替 | `--active-stat-index` / `--hover-indicator-index` / `--stats-menu-height` + `stats-menu__stat--active` | §4 |
| 時間帯テーマ | `button.time-of-day-select__trigger[data-value="sunrise"][role=combobox]` + `.stats-animation-gradient__gradient--{pre-dawn,sunrise,daytime,dusk,…}` の `--active` 切替 | §4 背景クロスフェード |
| dev 図アニメ | `developer-systems-animation__{dot-grid, psp-connection-path, app-logo__front/back, dynamic-rect-bg, grid-row-block}`、SVG `stroke-dasharray`（#5D64FE） | §6a。線の dash 流し + logo flip |
| chat banner | inline `clip-path: xywh(...)` + `transform: translateY()` + `opacity` | §3 |
| hover arrow | `svg.hds-icon-hover-arrow`（path 2 本: 横棒 + くの字） | 全 CTA 共通。hover で棒が伸びる定番 |
| 事例 button | `.customer-story-button` の inline `width` + `__text/__icon` opacity 入替 | §5a |
| 計測 | `data-analytics-label`（×173）/ `data-analytics-category`（×28）/ `data-testid`（×8） | 全域（再現時は省略可） |

---

## 6. 再現実装メモ

- デザインシステム prefix は **`hds-`**（Stripe Home Design System）。`hds-heading--{xs,sm,md,lg,xl,xxl}` / `hds-text--*` / `hds-button--{primary,secondary,transparent,secondary-on-quiet}` / `hds-link` が全 section 共通語彙 → 再現でも共通 token 化すると楽。
- spacing は全て `--hds-space-core-{0,300,400,500,600,700,800,1000,1200}` の CSS 変数参照。
- 画像は全て `images.stripeassets.com`（Contentful）+ `?w=&fm=webp&q=` の幅別 srcset。
- dark は §6 のみ（`hds-mode--dark`）。色 mode は section root の `hds-color-mode` + `hds-mode--*` で切替。
- グラフィックは `dom-graphic`（`--graphic-source-width/height/aspect-ratio/scale/max-width`）という共通スケーリングラッパで包まれる。
