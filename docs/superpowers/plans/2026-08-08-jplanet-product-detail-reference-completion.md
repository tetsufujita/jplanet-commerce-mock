# J-Planet Product Detail Reference Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the three approved SAZO product-detail reference screens as a J-Planet Japan-to-Brazil mock with a source link, richer commerce metadata, dense recommendations, sticky checkout, order flow, and J-Planet campaign content.

**Architecture:** Keep `ProductDetailView` as the route-level state coordinator, but split the new source, checkout, order-flow, and campaign units into named components. The desktop page uses a gallery/summary hero followed by a two-column commerce grid whose left flow contains recommendations and detail content and whose right rail contains the single sticky purchase form; mobile reorders the same DOM into summary → purchase → recommendations → details and retains the existing fixed CTA without duplicating the form.

**Tech Stack:** React 19, TypeScript strict, Vite 6, `react-i18next`, Motion, Lucide React, Vitest/Testing Library, Playwright Chrome-channel browser QA, CSS with the existing J-Planet tokens.

## Global Constraints

- Use only J-Planet white, sakura, navy, soft-blue, line, and shadow tokens; do not introduce SAZO red or Korean branding.
- Never render `SAZO`, `韓国`, `KOREA`, or `TO JAPAN` in product-detail visible copy or imagery.
- Put every new user-facing string in ja/en/pt-BR locale JSON with identical key structure.
- Keep exactly one purchase `<form>` in the DOM; desktop sticky checkout and the mobile fixed CTA must share the same state and handlers.
- Keep the existing product-to-product remount reset, gallery error fallback, share, favorite, validation focus, cart feedback, and `open-login` behavior.
- Keep all mobile interactive targets at least 44×44px and preserve `prefers-reduced-motion` behavior.
- At 320px, `documentElement.scrollWidth` must remain at most `innerWidth + 1`.
- The external source URLs are deterministic mock URLs; no live marketplace scraping or logo downloads are required.

---

### Task 1: Add deterministic commerce metadata and the source-link component

**Files:**

- Modify: `src/sazo-commerce/fixtures.ts`
- Create: `src/sazo-commerce/ProductSourceLink.tsx`
- Modify: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- Extend `ProductDetail` with required `originalUrl: string`, `unitPriceAmount: number`, `localDistributionFeeAmount: number`, `purchaseTypeId: "direct" | "marketplace"`, and `deliveryEstimateDays: number`.
- Export `parseYenPrice(price: string): number`, `formatYen(amount: number): string`, and `calculateProductTotal(unitPriceAmount: number, quantity: number, localDistributionFeeAmount: number): number` from `fixtures.ts`.
- Produce `ProductSourceLink({ brand, href, label }: ProductSourceLinkProps)` with `brand: string`, `href: string`, and `label: string`.
- `getProductDetail()` must always produce `https://example.com/jplanet/source/${encodeURIComponent(product.id)}` when no explicit URL override is present.

- [ ] **Step 1: Write failing fixture and source-link tests**

Add tests that express the required data and UI before production code changes:

```tsx
it("renders a marketplace badge and original-page link for every product", async () => {
  const detail = getProductDetail("p01");
  await renderWithI18n(
    <ProductDetailView dispatch={vi.fn()} productId={detail.product.id} />,
  );

  const sourceLink = screen.getByRole("link", { name: /元のページへ/ });
  expect(sourceLink.getAttribute("href")).toBe(
    "https://example.com/jplanet/source/p01",
  );
  expect(sourceLink.getAttribute("target")).toBe("_blank");
  expect(sourceLink.getAttribute("rel")).toContain("noreferrer");
  expect(screen.getByTestId("product-source-badge").textContent).toBe("11D");
  expect(screen.getByText("J-Planet直輸入商品")).toBeTruthy();
  expect(screen.getByText("ご注文日から平均9日")).toBeTruthy();
});

it("resolves deterministic commerce metadata for generated details", () => {
  const detail = getProductDetail("p02");
  expect(detail.originalUrl).toBe("https://example.com/jplanet/source/p02");
  expect(detail.unitPriceAmount).toBe(4012);
  expect(detail.localDistributionFeeAmount).toBe(350);
  expect(detail.purchaseTypeId).toBe("direct");
  expect(detail.deliveryEstimateDays).toBe(9);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: FAIL because `originalUrl` is absent for `p01`, the new metadata fields do not exist, and `product-source-badge` is not rendered.

- [ ] **Step 3: Extend the fixture contract and pricing helpers**

Change the type and generated detail contract to the following shape:

```ts
export interface ProductDetail {
  product: Product;
  gallery: readonly SazoImagePath[];
  originalName: string;
  categoryLabel: string;
  originalUrl: string;
  unitPriceAmount: number;
  localDistributionFeeAmount: number;
  purchaseTypeId: "direct" | "marketplace";
  deliveryEstimateDays: number;
  optionLabel: string;
  options: readonly string[];
  purchaseNote: string;
  information: string;
  recommendationIds: readonly string[];
}

export function parseYenPrice(price: string): number {
  return Number.parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
}

export function formatYen(amount: number): string {
  return `¥${new Intl.NumberFormat("ja-JP").format(amount)}`;
}

export function calculateProductTotal(
  unitPriceAmount: number,
  quantity: number,
  localDistributionFeeAmount: number,
): number {
  return unitPriceAmount * Math.max(1, quantity) + localDistributionFeeAmount;
}
```

For generated details use `parseYenPrice(product.price)`, fee `350`, `purchaseTypeId: "direct"`, and `deliveryEstimateDays: 9`. Give the `p01` override the same required fields and deterministic mock URL. Keep visible purchase-type, delivery, and support sentences in locale JSON rather than fixture strings.

- [ ] **Step 4: Implement the source-link component**

Use a normalized brand key for styling without external image assets:

```tsx
export interface ProductSourceLinkProps {
  brand: string;
  href: string;
  label: string;
}

export function ProductSourceLink({ brand, href, label }: ProductSourceLinkProps) {
  const brandKey = brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <a
      className="sazo-product-source-link"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <span
        className="sazo-product-source-badge"
        data-brand={brandKey}
        data-testid="product-source-badge"
      >
        {brand}
      </span>
      <span className="sazo-product-source-label">{label}</span>
      <ExternalLink aria-hidden size={18} strokeWidth={1.9} />
    </a>
  );
}
```

Render it as the first element of the right-side product summary with `t("sazo.views.productDetail.source.openOriginal")`. Remove the old icon-only conditional external link so there is one clear original-page control.

Style `.sazo-product-source-link` as a full-width 64px desktop row and at least 52px mobile row. Give `11d`, `naver`, `kream`, `ably`, and the generic fallback distinct J-Planet-compatible badge treatments using existing color tokens; do not use remote images or new hex values.

Below price/direct-purchase copy, render `.sazo-product-detail-metadata` with three bordered rows: purchase type, delivery estimate, and J-Planet delivery support. Each row has a translated label, translated/interpolated value, and a Lucide icon. Keep the source link above the product title and the metadata rows above the extracted purchase form.

- [ ] **Step 5: Add source and metadata copy to all locales**

Keep the existing `source.openOriginal` translation and add matching `metadata.purchaseType`, `metadata.purchaseTypes.direct`, `metadata.purchaseTypes.marketplace`, `metadata.deliveryEstimate`, `metadata.deliveryEstimateValue`, `metadata.support`, and `metadata.details` keys in ja/en/pt-BR. Resolve `purchaseTypeId` through the locale key and interpolate `deliveryEstimateDays`; do not hardcode visible metadata in TSX or fixtures.

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
pnpm typecheck
```

Expected: product-detail tests pass and TypeScript reports zero errors.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/sazo-commerce/fixtures.ts src/sazo-commerce/ProductSourceLink.tsx src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: add product marketplace source details"
```

---

### Task 2: Build the single rich purchase panel with quantity and totals

**Files:**

- Create: `src/sazo-commerce/ProductPurchasePanel.tsx`
- Modify: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- Produce `ProductPurchasePanel({ detail, dispatch, reduceMotion }: ProductPurchasePanelProps)`.
- `detail` is the Task 1 `ProductDetail`; `dispatch` is `Dispatch<SazoAction>`; `reduceMotion` is `boolean`.
- The component owns `selectedOption`, `quantity`, `requestText`, `imageCheck`, and `feedback` so its form and mobile fixed CTA share one state source.
- The component renders exactly one `<form data-product-purchase-form>` and one non-form `.sazo-product-mobile-purchase` control group.

- [ ] **Step 1: Write failing quantity, total, and single-form tests**

```tsx
it("updates the selected product quantity and deterministic total", async () => {
  const detail = getProductDetail("p01");
  const { container } = await renderWithI18n(
    <ProductDetailView dispatch={vi.fn()} productId="p01" />,
  );

  expect(container.querySelectorAll("form[data-product-purchase-form]")).toHaveLength(1);
  expect(screen.getByTestId("product-total-value").textContent).toBe("0");

  fireEvent.change(screen.getByLabelText("商品オプション"), {
    target: { value: "標準" },
  });
  expect(screen.getByTestId("product-total-value").textContent).toBe("¥4,149");

  fireEvent.click(screen.getByRole("button", { name: "数量を増やす" }));
  expect(screen.getByTestId("product-quantity").textContent).toBe("2");
  expect(screen.getByTestId("product-total-value").textContent).toBe("¥7,948");

  fireEvent.click(screen.getByRole("button", { name: "数量を減らす" }));
  expect(screen.getByTestId("product-quantity").textContent).toBe("1");
});
```

Keep the existing tests that require option validation, select focus, cart feedback, mobile buy-now dispatch, and reset after product switching.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: FAIL because quantity controls, local distribution fee, rich total, and `data-product-purchase-form` do not exist.

- [ ] **Step 3: Extract and implement `ProductPurchasePanel`**

Move the purchase state and handlers from `ProductDetailView` into the new named component. Add `requestGuideOpen` alongside the existing state and use:

```ts
const [quantity, setQuantity] = useState(1);
const totalAmount =
  selectedOption === ""
    ? 0
    : calculateProductTotal(
        detail.unitPriceAmount,
        quantity,
        detail.localDistributionFeeAmount,
      );
```

The visual order inside the form must be:

1. required option label and select;
2. selected-product card with product price and quantity stepper;
3. request label plus underlined request-guide button that toggles an `id="sazo-product-request-guide"` help paragraph;
4. request textarea with `aria-describedby` pointing to the guide while it is open;
5. image-check control;
6. open total card containing total, product price, and local distribution fee;
7. full-width cart CTA, followed by the secondary buy-now action and feedback.

Quantity decrement must use `Math.max(1, current - 1)`. Buttons must use translated `aria-label`s and display the current quantity in `data-testid="product-quantity"`. The selected-product remove button clears `selectedOption`, resets quantity to `1`, and returns the displayed total to `0`.

- [ ] **Step 4: Preserve the shared mobile action contract**

Render the mobile fixed action group from inside `ProductPurchasePanel` after the form, not as a second form. Both mobile buttons call the same `handlePurchase` used by desktop buttons. Keep the initial total at `0` until a required option is selected.

- [ ] **Step 5: Add purchase-panel translations to all locales**

Add matching keys for `quantity.decrease`, `quantity.increase`, `quantity.label`, `requestGuide`, `requestGuideBody`, `selectedProduct`, `localDistributionFee`, `totalOrderAmount`, and `removeSelection` in ja/en/pt-BR.

- [ ] **Step 6: Style the reference purchase card and interaction states**

In `sazo.css`, add dedicated classes for the selected-product card, 44px stepper buttons, request-guide underline, expanded total card, and full-width primary CTA. Use only existing J-Planet tokens and preserve the existing `:focus-visible` conventions. Do not make the form itself fixed on mobile; only `.sazo-product-mobile-purchase` remains fixed.

- [ ] **Step 7: Run focused and affected tests**

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx tests/unit/sazo-commerce-views.test.tsx tests/unit/sazo-commerce-home.test.tsx
pnpm lint
pnpm typecheck
```

Expected: all affected tests pass, lint is clean, and TypeScript reports zero errors.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/sazo-commerce/ProductPurchasePanel.tsx src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: add rich sticky product checkout"
```

---

### Task 3: Recompose recommendations, detail tabs, order flow, and campaign banner

**Files:**

- Create: `src/sazo-commerce/ProductOrderFlow.tsx`
- Create: `src/sazo-commerce/ProductCampaignBanner.tsx`
- Create: `src/sazo-commerce/ProductRecommendationRail.tsx`
- Modify: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/fixtures.ts`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- Produce `ProductOrderFlow({ compact?: boolean }: ProductOrderFlowProps)` using the same five translated stages.
- Produce `ProductCampaignBanner()` using J-Planet mark/wordmark assets already under `/sazo-commerce/` and translated Japan-to-Brazil copy.
- Produce `ProductRecommendationRail({ dispatch, products }: ProductRecommendationRailProps)` using six existing `ProductCard`s and an accessible next control that calls `scrollBy({ left: clientWidth * 0.82, behavior })` on its track.
- `ProductDetailView` produces `.sazo-product-detail-commerce-grid`, `.sazo-product-detail-left-flow`, and `.sazo-product-detail-checkout-rail`.
- DOM order inside the commerce grid is purchase panel first, then left flow; CSS places the purchase panel in desktop column 2 and left flow in column 1, while mobile naturally shows purchase before recommendations.

- [ ] **Step 1: Write failing hierarchy and campaign tests**

```tsx
it("matches the approved reference hierarchy with one sticky checkout rail", async () => {
  const { container } = await renderWithI18n(
    <ProductDetailView dispatch={vi.fn()} productId="p01" />,
  );

  const commerceGrid = container.querySelector(".sazo-product-detail-commerce-grid");
  const checkout = container.querySelector(".sazo-product-detail-checkout-rail");
  const recommendation = screen.getByRole("region", {
    name: "この商品はいかがですか？",
  });
  const campaign = screen.getByRole("region", {
    name: "J-Planet 日本からブラジルへ",
  });

  expect(commerceGrid).not.toBeNull();
  expect(checkout).not.toBeNull();
  expect(within(recommendation).getAllByRole("button", { name: /商品詳細を開く/ }))
    .toHaveLength(6);
  expect(within(recommendation).getByRole("button", { name: "次の商品" }))
    .toBeTruthy();
  expect(campaign.textContent).toContain("日本の販売サイトから直接購入");
  expect(campaign.textContent).toContain("ブラジルへお届け");
  expect(campaign.textContent).not.toMatch(/SAZO|韓国|KOREA|TO JAPAN/i);
});
```

Also assert the information tab contains the five-stage order flow and that the caution tab removes it from the active panel.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: FAIL because the commerce-grid classes, six-card region contract, campaign region, and tab-contained order flow do not exist.

- [ ] **Step 3: Create the reusable order-flow component**

Move the current `orderStages` constant and timeline markup into `ProductOrderFlow.tsx`. The component must keep the existing ordered list, five `data-stage` items, translated stage labels, and Lucide icons. Place it inside the information tab panel, above `detail.information`, inside a bordered reference card with the translated heading and details link.

- [ ] **Step 4: Create the J-Planet campaign component**

Use an accessible region with no SAZO asset:

```tsx
export function ProductCampaignBanner() {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("sazo.views.productDetail.campaign.label")}
      className="sazo-product-campaign"
    >
      <div className="sazo-product-campaign-copy">
        <img
          alt=""
          aria-hidden
          height={72}
          src="/sazo-commerce/jplanet-sakura-mark.png"
          width={72}
        />
        <p>{t("sazo.views.productDetail.campaign.eyebrow")}</p>
        <h2>{t("sazo.views.productDetail.campaign.title")}</h2>
        <span>{t("sazo.views.productDetail.campaign.body")}</span>
      </div>
      <div aria-hidden className="sazo-product-campaign-route">
        <strong>{t("sazo.views.productDetail.campaign.origin")}</strong>
        <span>→</span>
        <strong>{t("sazo.views.productDetail.campaign.destination")}</strong>
      </div>
    </section>
  );
}
```

Add `campaign.label`, `campaign.eyebrow`, `campaign.title`, `campaign.body`, `campaign.origin`, and `campaign.destination` to all locales. Japanese copy must say `J-Planet 日本からブラジルへ`, `日本の販売サイトから直接購入`, and `ブラジルへお届け`.

- [ ] **Step 5: Recompose the route-level layout**

Keep the hero as gallery plus product summary. Move `ProductPurchasePanel` below the hero into `.sazo-product-detail-commerce-grid > .sazo-product-detail-checkout-rail`. Put recommendations, tabbed information/order flow, campaign, review, cautions, and benefits in `.sazo-product-detail-left-flow` in that order.

Use the new `ProductRecommendationRail` for the recommendation section. It must have `role="region"`, the translated title as `aria-label`, a 44px next control, and a reduced-motion-aware scroll behavior. Expand fallback `recommendationIds` from four to six and make the `p01` override contain six unique products excluding itself.

- [ ] **Step 6: Implement the desktop and mobile reference geometry**

Add CSS with these contracts:

```css
.sazo-root .sazo-product-detail-commerce-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 390px);
  align-items: start;
  gap: 44px;
  margin-top: 72px;
}

.sazo-root .sazo-product-detail-checkout-rail {
  position: sticky;
  top: 112px;
  grid-column: 2;
  grid-row: 1;
}

.sazo-root .sazo-product-detail-left-flow {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
}
```

Desktop recommendations use six columns around 150–170px with horizontal overflow only when needed. At `max-width: 767px`, set the commerce grid to one column, place checkout in normal flow before left content, show 2.1 recommendation cards, and remove desktop sticky positioning. Keep the campaign ratio legible at 320px without page overflow.

- [ ] **Step 7: Run focused tests and inspect the route locally**

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
pnpm typecheck
```

Open:

```text
http://127.0.0.1:5190/sazo-commerce-mock/?qa=1&view=product&product=p01
```

Confirm the three approved reference states: top hero/source metadata; dense recommendations with sticky checkout; tabs/order flow/campaign with the same checkout still visible.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/sazo-commerce/ProductOrderFlow.tsx src/sazo-commerce/ProductCampaignBanner.tsx src/sazo-commerce/ProductRecommendationRail.tsx src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/fixtures.ts src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: complete J-Planet product detail reference layout"
```

---

### Task 4: Expand real-browser QA and finish visual verification

**Files:**

- Modify: `scripts/sazo-product-detail-browser.mjs`
- Modify: `scripts/sazo-jplanet-theme-browser.mjs`
- Modify: `docs/superpowers/plans/2026-08-08-jplanet-product-detail-reference-completion.md`
- Format-only: `src/sazo-commerce/ProductSourceLink.tsx` (added after the required Prettier check exposed an inherited formatting mismatch)

**Interfaces:**

- Consume `.sazo-product-source-link`, `.sazo-product-detail-commerce-grid`, `.sazo-product-detail-checkout-rail`, `.sazo-product-detail-recommendation-track`, `.sazo-product-campaign`, quantity controls, and the existing QA product route.
- Produce screenshots `/tmp/jplanet-product-reference-desktop.png`, `/tmp/jplanet-product-reference-mobile.png`, `/tmp/jplanet-product-reference-mobile-320.png`, and `/tmp/jplanet-product-reference-sticky.png`.
- Preserve `viewports=3 originStates=12`; the measured completed-reference image expectation is `images=33` (11 product-detail images at each viewport).

- [x] **Step 1: Add failing browser assertions for the new reference contract**

For every product viewport, assert:

```js
const sourceLink = page.locator(".sazo-product-source-link");
assert.equal(await sourceLink.getAttribute("href"), `${mockSourceBase}/p01`);
const sourceBounds = await sourceLink.boundingBox();
assert(sourceBounds !== null, "source link bounds");
assert.ok(sourceBounds.height >= 44);

const option = page.getByLabel("商品オプション");
await option.selectOption("標準");
await page.getByRole("button", { name: "数量を増やす" }).click();
assert.equal(await page.getByTestId("product-quantity").innerText(), "2");
assert.equal(await page.getByTestId("product-total-value").innerText(), "¥7,948");
```

At desktop width, scroll to the campaign and require the checkout rail bounds to stay inside the viewport. Require at least six recommendation cards, campaign visibility, no overlap between left flow and checkout rail, and 44px quantity/source controls. At mobile widths, reuse fixed CTA/footer/chat checks and assert the commerce grid is one column.

- [x] **Step 2: Run the browser script and verify RED**

```bash
pnpm qa:sazo-product-detail
```

Expected: FAIL until the source link, quantity, campaign, six-card rail, and sticky geometry satisfy the new assertions.

- [x] **Step 3: Capture the four approved visual checkpoints**

Make the script capture full-page screenshots plus a desktop viewport screenshot after scrolling the campaign into view. Use these paths:

```text
/tmp/jplanet-product-reference-desktop.png
/tmp/jplanet-product-reference-mobile.png
/tmp/jplanet-product-reference-mobile-320.png
/tmp/jplanet-product-reference-sticky.png
```

Visually compare source row, hero density, recommendation spacing, tab/order-flow card, campaign banner, and sticky purchase rail to the three user references.

- [x] **Step 4: Extend the whole-site theme audit**

Keep the existing 36 states and 26 mobile top-placement states. On the product view, additionally require visible `元のページへ`, `日本の販売サイトから直接購入`, and `ブラジルへお届け`; reject visible or image-source matches for SAZO/Korea branding.

- [x] **Step 5: Run full automated verification**

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm build
pnpm exec prettier --check src/sazo-commerce/ProductSourceLink.tsx src/sazo-commerce/ProductPurchasePanel.tsx src/sazo-commerce/ProductOrderFlow.tsx src/sazo-commerce/ProductCampaignBanner.tsx src/sazo-commerce/ProductRecommendationRail.tsx src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/fixtures.ts src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-product-detail.test.tsx scripts/sazo-product-detail-browser.mjs scripts/sazo-jplanet-theme-browser.mjs
node --check scripts/sazo-product-detail-browser.mjs
node --check scripts/sazo-jplanet-theme-browser.mjs
pnpm qa:sazo-product-detail
node scripts/sazo-jplanet-theme-browser.mjs
git diff --check
```

Expected: every command exits 0, all Vitest tests pass, product QA covers all three viewports and 12 origin states, and the whole-site audit reports 36 states and 26 mobile placements.

- [x] **Step 6: Run forbidden-copy and live-route checks**

```bash
rg -n --glob '*.{ts,tsx,json,css,svg}' 'SAZO|韓国|KOREA|TO JAPAN' src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/ProductSourceLink.tsx src/sazo-commerce/ProductPurchasePanel.tsx src/sazo-commerce/ProductOrderFlow.tsx src/sazo-commerce/ProductCampaignBanner.tsx src/sazo-commerce/ProductRecommendationRail.tsx
curl -sS -o /dev/null -w '%{http_code}\n' 'http://127.0.0.1:5190/sazo-commerce-mock/?qa=1&view=product&product=p01'
```

Expected: `rg` returns no matches and the live route returns `200`.

- [x] **Step 7: Record evidence and commit Task 4**

Only after all commands and visual checks pass, mark the Task 4 checkboxes with measured evidence, then commit:

```bash
git add scripts/sazo-product-detail-browser.mjs scripts/sazo-jplanet-theme-browser.mjs docs/superpowers/plans/2026-08-08-jplanet-product-detail-reference-completion.md src/sazo-commerce/ProductSourceLink.tsx
git commit -m "test: verify complete product detail reference"
```

#### Task 4 measured evidence — 2026-08-08

- RED: `pnpm qa:sazo-product-detail` failed at the obsolete `.sazo-product-detail-purchase-panel .sazo-product-detail-cart-button` locator with a 10,000 ms timeout before the new assertions were implemented.
- Product browser GREEN: `viewports=3 originStates=12 images=33`; source controls measured `400x64`, `328x52`, and `272x52`, and every quantity control measured `44x44` at 1512, 390, and 320 px respectively.
- Geometry GREEN: desktop grid measured `974px 390px`; all six recommendation cards measured `150px` and fit fully within track bounds `52–1026px`, while the sticky checkout occupied `1070–1460px` at `top=112px` without overlap. Mobile grids measured one column (`362px` and `300px`) with static checkout rails and exact page/viewport widths `390/390px` and `320/320px`.
- Interaction/content GREEN: deterministic source href, exactly one purchase form, shared cart actions, option `標準`, quantity `2`, total `¥7,948`, six recommendation cards, tabs/order flow, campaign, mobile fixed CTA/footer/chat clearance, and forbidden visible/image-source branding all passed.
- Whole-site browser GREEN: `states=36 mobileTopStates=26 images=546`, including product requirements for `元のページへ`, `日本の販売サイトから直接購入`, and `ブラジルへお届け`.
- Full verification GREEN: lint, typecheck, 14 Vitest files / 169 tests, production build (2,223 modules), required Prettier check, both Node syntax checks, both browser audits, forbidden-copy scan (no matches), live route HTTP 200, and `git diff --check`.
- Visual review GREEN: all four required screenshots were inspected for source row, hero density, recommendation spacing, tab/order flow, campaign, sticky rail, mobile one-column layout, clipping, overlaps, and unwanted SAZO/Korea marks.
- The required Prettier check exposed a pre-existing format-only mismatch in `ProductSourceLink.tsx`; ownership was explicitly expanded only for that mechanical formatting change, after which the full verification set was rerun.

#### Task 4 review round 2 — image-source guard hardening

- RED: focused fixtures in both browser scripts reproduced `false !== true` for `/assets/sazo.png`; `/assets/sazoshop.webp` had the same false-pass path.
- Fix: both audits now evaluate a narrow image basename predicate that rejects standalone `sazo` / `sazoshop` files and their logo/wordmark variants while allowing ordinary assets under the legitimate `/sazo-commerce/` namespace. Existing Korea/TO JAPAN and theme legacy-asset checks remain active.
- Focused boundary fixtures cover rejected `/assets/sazo.png` and `/assets/sazoshop.webp` plus allowed `/sazo-commerce/products/01.webp` and `/sazo-commerce/jplanet-sakura-mark.png`.
- GREEN: product QA remained `viewports=3 originStates=12 images=33`; whole-site audit remained `states=36 mobileTopStates=26 images=546`.

#### Senior final fix wave — 2026-08-08

- Geometry RED reproduced 4/6 fully visible desktop recommendation cards with track `clientWidth=766`, `scrollWidth=974`; production width was then increased to `1408px` and the browser contract upgraded from DOM count to all-six bounds containment plus `149–171px` card-width checks.
- Semantic/auth REDs reproduced `SECTION !== DIV` and missing J-Planet Brasil company copy. The selected-product wrapper is now non-sectioning, and semantically renamed `brazilCopyright` / `brazilAddress` locale keys replace the legacy Korea company fields in ja/en/pt-BR with identical locale structure.
- Guard REDs reproduced false passes for `sazo-banner.png`, product visible `TO-JAPAN`, and theme visible `Republic of Korea`. Both audits now use case-insensitive visible token patterns and basename-only asset tokenization shared by their positive/negative fixtures.
- Final browser GREEN: desktop recommendation track `52–1026px`, six cards `54–1024px` at `150px` each, checkout `1070–1460px` at `112–962px`, and page `1512/1512px`; mobile page widths remained `390/390px` and `320/320px` with two fully visible recommendation cards plus the intended partial next card.
- Final verification GREEN: focused product 20/20, focused auth 17/17, full Vitest 14 files / 169 tests, typecheck, lint, production build, Prettier, Node syntax, product browser `3/12/33`, theme browser `36/26/546`, forbidden scans, auth locale parity, live HTTP 200, and `git diff --check`.
