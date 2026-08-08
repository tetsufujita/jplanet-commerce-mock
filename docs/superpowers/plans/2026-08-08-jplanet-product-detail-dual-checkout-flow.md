# J-Planet Dual Checkout and Delivery Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce SAZO's product-detail hierarchy with one synchronized purchase state rendered in the hero and again below recommendations, plus a six-stage white delivery-flow card matching the supplied fifth reference.

**Architecture:** Extract purchase state and purchase actions into one `useProductPurchaseController` hook owned by `ProductDetailView`. Render two `ProductPurchasePanel` views with unique ID prefixes against that controller; only the hero instance owns the single mobile fixed action group. Move recommendations before the lower commerce grid, then keep the second purchase panel sticky beside the tabbed detail flow.

**Tech Stack:** React 19, TypeScript strict, Vite 6, Motion, react-i18next, Lucide React, Vitest/Testing Library, Playwright browser scripts, CSS with existing J-Planet tokens.

## Global Constraints

- The hero purchase panel and lower sticky purchase panel must share `selectedOption`, `quantity`, `requestText`, `imageCheck`, `feedback`, `requestGuideOpen`, totals, and purchase handlers.
- Render exactly two `form[data-product-purchase-form]` elements on desktop and exactly one `.sazo-product-mobile-purchase` group. At 390px and 320px, only the hero form is visible; the lower duplicate is hidden.
- Every form ID, label `htmlFor`, `aria-labelledby`, `aria-controls`, and conditional `aria-describedby` must be unique through an exact `idPrefix`.
- An invalid purchase must focus the select in the panel whose button was used.
- Recommendations must precede the lower commerce grid and must not share its row with the sticky checkout.
- The lower purchase panel becomes sticky only in the post-recommendation detail grid at desktop `top: 112px`; the upper panel never becomes sticky.
- The order flow has exactly six stages: received, purchased, warehouse arrived, inspected, international shipping/customs, delivered in Brazil.
- Order stage states are exactly two `complete`, one `current`, and three `pending`.
- Desktop delivery flow uses a white card, subtle border/shadow, horizontal progress line, state-colored circular icons, large two-line heading, and underlined details link.
- Mobile delivery flow may scroll horizontally inside the card but must not create page-level horizontal overflow.
- Use J-Planet white, navy, sakura, and existing tokens only; never add SAZO red/logo, Korean campaign assets, or visible SAZO/Korea/TO JAPAN copy.
- Every new visible string must have identical key structure in `ja`, `en`, and `pt-BR` locales; never hardcode visible copy in TSX.
- Preserve product switching reset, gallery/image fallback, share, favorite, tabs, source link, cart feedback, `open-login`, reduced motion, footer, and chat behavior.
- Preserve 1512px six-card visibility, approximately 2.1 recommendation cards at 390px/320px, 44px controls, and no page overflow.
- Do not modify or stage the user-owned dirty 2026-08-07 plan or pre-existing untracked QA/assets/scripts.

---

### Task 1: Extract one purchase controller and render synchronized hero/lower panels

**Files:**

- Create: `src/sazo-commerce/useProductPurchaseController.ts`
- Modify: `src/sazo-commerce/ProductPurchasePanel.tsx`
- Modify: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- Produce `useProductPurchaseController({ detail, dispatch }: UseProductPurchaseControllerOptions): ProductPurchaseController`.
- `ProductPurchaseController` exposes shared values, calculated totals, `selectOption`, quantity/request/image/guide mutations, `removeSelection`, and `purchase(intent, focusInvalid)`.
- Change the panel interface to `ProductPurchasePanel({ controller, detail, idPrefix, reduceMotion, showMobileActions }: ProductPurchasePanelProps)`.
- `idPrefix` is a required non-empty string. This task uses exact values `hero` and `sticky`.
- `showMobileActions` is true only for the hero instance.

- [ ] **Step 1: Add the failing synchronized-panel test**

Add a focused test to `tests/unit/sazo-product-detail.test.tsx`:

```tsx
it("shares one purchase state across hero and lower checkout forms", async () => {
  const { container } = await renderWithI18n(
    <ProductDetailView dispatch={vi.fn()} productId="p01" />,
  );
  const forms = Array.from(
    container.querySelectorAll<HTMLFormElement>("form[data-product-purchase-form]"),
  );

  expect(forms).toHaveLength(2);
  expect(container.querySelectorAll(".sazo-product-mobile-purchase")).toHaveLength(1);

  const heroSelect = within(forms[0]).getByLabelText("商品オプション");
  const stickySelect = within(forms[1]).getByLabelText("商品オプション");
  fireEvent.change(heroSelect, { target: { value: "標準" } });
  expect(stickySelect).toHaveValue("標準");

  fireEvent.click(within(forms[1]).getByRole("button", { name: "数量を増やす" }));
  expect(screen.getAllByTestId("product-quantity").map((node) => node.textContent)).toEqual([
    "2",
    "2",
  ]);
  expect(screen.getAllByTestId("product-total-value").map((node) => node.textContent)).toEqual([
    "¥7,948",
    "¥7,948",
  ]);

  const ids = Array.from(container.querySelectorAll("[id]"), (node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
});
```

Update existing purchase tests so they scope desktop actions to the hero form or lower form instead of using page-global single-form queries.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: the new test fails because only one purchase form exists and its state is local to `ProductPurchasePanel`.

- [ ] **Step 3: Create the shared controller hook**

Create `src/sazo-commerce/useProductPurchaseController.ts` with this public contract:

```ts
import type { Dispatch } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { calculateProductTotal, formatYen } from "@/sazo-commerce/fixtures";
import type { ProductDetail } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";

export type PurchaseIntent = "cart" | "buy";

export interface PurchaseFeedback {
  kind: "error" | "success";
  message: string;
}

export interface ProductPurchaseController {
  feedback: PurchaseFeedback | null;
  formattedTotal: string;
  imageCheck: boolean;
  productAmount: number;
  quantity: number;
  requestGuideOpen: boolean;
  requestText: string;
  selectedOption: string;
  setImageCheck: (checked: boolean) => void;
  setRequestText: (value: string) => void;
  selectOption: (value: string) => void;
  decrementQuantity: () => void;
  incrementQuantity: () => void;
  removeSelection: () => void;
  toggleRequestGuide: () => void;
  purchase: (intent: PurchaseIntent, focusInvalid: () => void) => void;
}

export interface UseProductPurchaseControllerOptions {
  detail: ProductDetail;
  dispatch: Dispatch<SazoAction>;
}
```

Move the current purchase state and calculations from `ProductPurchasePanel` into the hook. Keep the exact total formula:

```ts
const totalAmount =
  selectedOption === ""
    ? 0
    : calculateProductTotal(
        detail.unitPriceAmount,
        quantity,
        detail.localDistributionFeeAmount,
      );
const productAmount = detail.unitPriceAmount * quantity;
const formattedTotal = totalAmount === 0 ? String(totalAmount) : formatYen(totalAmount);
```

`purchase("cart", focusInvalid)` retains cart feedback. `purchase("buy", focusInvalid)` retains `dispatch({ type: "open-login" })`. When no option is selected, set the translated error feedback and call the supplied focus callback.

- [ ] **Step 4: Convert `ProductPurchasePanel` into a controlled view**

Use the required props:

```ts
export interface ProductPurchasePanelProps {
  controller: ProductPurchaseController;
  detail: ProductDetail;
  idPrefix: string;
  reduceMotion: boolean;
  showMobileActions?: boolean;
}
```

Derive all IDs from the prefix:

```ts
const headingId = `sazo-product-purchase-heading-${idPrefix}`;
const optionId = `sazo-product-option-${idPrefix}`;
const requestId = `sazo-product-request-${idPrefix}`;
const requestGuideId = `sazo-product-request-guide-${idPrefix}`;
const imageCheckId = `sazo-product-image-check-${idPrefix}`;
```

The panel keeps only its local `selectRef`. Every field reads and mutates the shared controller. Both desktop buttons call:

```ts
controller.purchase("cart", () => selectRef.current?.focus());
controller.purchase("buy", () => selectRef.current?.focus());
```

Render `.sazo-product-mobile-purchase` only when `showMobileActions` is true.

- [ ] **Step 5: Mount both controlled panels in `ProductDetailView`**

Create the controller once after `detail` is resolved:

```tsx
const purchaseController = useProductPurchaseController({ detail, dispatch });
```

At the end of `.sazo-product-detail-purchase-panel`, after shared feedback/source metadata, mount:

```tsx
<ProductPurchasePanel
  controller={purchaseController}
  detail={detail}
  idPrefix="hero"
  reduceMotion={reduceMotion}
  showMobileActions
/>
```

Keep the existing lower checkout instance but pass `idPrefix="sticky"` and omit `showMobileActions`.

- [ ] **Step 6: Add only the Task 1 structural CSS**

Add:

```css
.sazo-root .sazo-product-detail-purchase-panel > .sazo-product-detail-purchase-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--jplanet-line);
}

@media (max-width: 767px) {
  .sazo-root .sazo-product-detail-checkout-rail {
    display: none;
  }
}
```

Do not change the lower-grid/recommendation ordering in this task.

- [ ] **Step 7: Run focused and affected verification**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx tests/unit/sazo-commerce-views.test.tsx tests/unit/sazo-commerce-home.test.tsx
pnpm typecheck
pnpm lint
```

Expected: all affected tests pass. Verify p01 remains `¥4,149` at quantity 1 and `¥7,948` at quantity 2 in both panels.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/sazo-commerce/useProductPurchaseController.ts src/sazo-commerce/ProductPurchasePanel.tsx src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: synchronize dual product checkout panels"
```

---

### Task 2: Move recommendations above the detail grid and rebuild the six-stage flow

**Files:**

- Modify: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/ProductOrderFlow.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- `ProductDetailView` renders `ProductRecommendationRail` immediately before `.sazo-product-detail-commerce-grid`.
- `.sazo-product-detail-left-flow` begins with `.sazo-product-detail-information`; the lower checkout begins on the same row as the tabbed information area, not recommendations.
- `ProductOrderFlow({ compact?: boolean })` preserves its public signature and produces six `li[data-stage][data-state]` elements.
- Exact `data-state` sequence: `complete`, `complete`, `current`, `pending`, `pending`, `pending`.

- [ ] **Step 1: Add failing hierarchy and delivery-state tests**

Replace the existing hierarchy expectation with:

```tsx
const recommendation = container.querySelector(".sazo-product-detail-recommendations");
const commerceGrid = container.querySelector(".sazo-product-detail-commerce-grid");
const leftFlow = container.querySelector(".sazo-product-detail-left-flow");

expect(recommendation?.nextElementSibling).toBe(commerceGrid);
expect(leftFlow?.firstElementChild).toHaveClass("sazo-product-detail-information");

const stages = Array.from(container.querySelectorAll(".sazo-product-order-flow li"));
expect(stages).toHaveLength(6);
expect(stages.map((stage) => stage.getAttribute("data-state"))).toEqual([
  "complete",
  "complete",
  "current",
  "pending",
  "pending",
  "pending",
]);
```

Also require the Japanese heading text `注文配送の流れ` and `一目で見る`.

- [ ] **Step 2: Run focused test and verify RED**

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: hierarchy fails because recommendations are inside the left flow, and stage expectations fail because the current component has five unstated stages.

- [ ] **Step 3: Move recommendations before the lower commerce grid**

Cut the existing `ProductRecommendationRail` call out of `.sazo-product-detail-left-flow` and place it immediately before `.sazo-product-detail-commerce-grid`. Do not change the internal markup of the existing information, review, cautions, or benefits sections in this step.

The resulting direct-child order is verified with this exact structure assertion:

```tsx
expect(recommendation?.nextElementSibling).toBe(commerceGrid);
expect(commerceGrid?.children[0]).toHaveClass("sazo-product-detail-checkout-rail");
expect(commerceGrid?.children[1]).toBe(leftFlow);
expect(
  Array.from(leftFlow?.children ?? [], (node) => node.className),
).toEqual([
  expect.stringContaining("sazo-product-detail-information"),
  expect.stringContaining("sazo-product-campaign"),
  expect.stringContaining("sazo-product-detail-review"),
  expect.stringContaining("sazo-product-detail-cautions"),
  expect.stringContaining("sazo-product-detail-benefits"),
]);
```

Keep checkout first in the commerce-grid DOM so the mobile contract remains predictable even though this duplicate is CSS-hidden at mobile.

- [ ] **Step 4: Expand the order flow to six stateful stages**

Define:

```ts
const orderStages = [
  { icon: Check, labelKey: "received", state: "complete" },
  { icon: Store, labelKey: "purchased", state: "complete" },
  { icon: Package, labelKey: "warehouseArrived", state: "current" },
  { icon: PackageCheck, labelKey: "inspected", state: "pending" },
  { icon: Plane, labelKey: "shipping", state: "pending" },
  { icon: Home, labelKey: "delivered", state: "pending" },
] as const;
```

Give the section an accessible heading relationship and render the two-line title:

```tsx
<section
  aria-labelledby="sazo-product-order-flow-heading"
  className="sazo-product-order-flow"
  data-compact={compact || undefined}
>
  <div className="sazo-product-order-flow-heading">
    <h3 id="sazo-product-order-flow-heading">
      <span>{t("sazo.views.productDetail.order.title")}</span>
      <strong>{t("sazo.views.productDetail.order.subtitle")}</strong>
    </h3>
    <a href="#sazo-product-detail-order-details">
      {t("sazo.views.productDetail.order.detailsLink")}
    </a>
  </div>
  <div className="sazo-product-detail-timeline-scroll">
    <ol
      aria-label={t("sazo.views.productDetail.order.listLabel")}
      className="sazo-product-detail-timeline"
    >
      {orderStages.map(({ icon: Icon, labelKey, state }, index) => (
        <li data-stage={index + 1} data-state={state} key={labelKey}>
          <span className="sazo-product-detail-stage-icon">
            <Icon aria-hidden size={23} strokeWidth={1.9} />
          </span>
          <span className="sazo-product-detail-stage-number">
            {t("sazo.views.productDetail.order.step", { step: index + 1 })}
          </span>
          <strong>{t(`sazo.views.productDetail.order.stages.${labelKey}`)}</strong>
        </li>
      ))}
    </ol>
  </div>
</section>
```

- [ ] **Step 5: Add matching locale keys and exact Japanese copy**

In all three locales add `order.subtitle` and `order.stages.warehouseArrived` with identical structure.

Japanese values:

```json
{
  "title": "注文配送の流れ",
  "subtitle": "一目で見る",
  "warehouseArrived": "日本倉庫へ到着",
  "shipping": "国際配送・通関",
  "delivered": "ブラジルへお届け"
}
```

English equivalents: `Order delivery flow`, `At a glance`, `Arrived at Japan warehouse`, `International shipping & customs`, `Delivered in Brazil`.

Portuguese equivalents: `Fluxo de entrega do pedido`, `Veja de relance`, `Chegou ao armazém no Japão`, `Envio internacional e alfândega`, `Entregue no Brasil`.

- [ ] **Step 6: Rebuild the desktop delivery card and post-recommendation grid CSS**

Use existing tokens only. The required structural rules are:

```css
.sazo-root .sazo-product-detail-recommendations {
  margin-top: 72px;
}

.sazo-root .sazo-product-detail-commerce-grid {
  margin-top: 34px;
}

.sazo-root .sazo-product-order-flow {
  padding: 28px 32px;
  border: 1px solid var(--jplanet-line);
  border-radius: 18px;
  background: var(--jplanet-surface);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--jplanet-shadow) 68%, transparent);
}

.sazo-root .sazo-product-detail-timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(112px, 1fr));
  min-width: 720px;
}
```

Add one progress line behind the icons. Style `[data-state="complete"]`, `[data-state="current"]`, and `[data-state="pending"]` separately: complete white/navy, current sakura/white, pending blue-soft/muted. Keep each stage control/visual target at least 44px.

At `max-width: 767px`, keep the lower checkout hidden, keep commerce grid one column, reduce flow padding, and let only `.sazo-product-detail-timeline-scroll` overflow horizontally.

- [ ] **Step 7: Run focused, locale, and affected tests**

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx tests/unit/sazo-commerce-views.test.tsx
pnpm typecheck
pnpm lint
```

Verify all six stages, the exact state sequence, and recommendation-before-grid hierarchy pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/ProductOrderFlow.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: match SAZO product detail purchase flow"
```

---

### Task 3: Update browser QA, capture the five-reference states, and finish verification

**Files:**

- Modify: `scripts/sazo-product-detail-browser.mjs`
- Modify: `scripts/sazo-jplanet-theme-browser.mjs` only if measured hierarchy changes require audit selectors or counts
- Modify: `docs/superpowers/plans/2026-08-08-jplanet-product-detail-dual-checkout-flow.md`

**Interfaces:**

- Product browser consumes `.sazo-product-detail-purchase-panel form`, `.sazo-product-detail-checkout-rail form`, `.sazo-product-detail-recommendations`, `.sazo-product-detail-commerce-grid`, `.sazo-product-order-flow`, and its six `[data-state]` stages.
- Keep screenshot paths `/tmp/jplanet-product-reference-desktop.png`, `/tmp/jplanet-product-reference-mobile.png`, `/tmp/jplanet-product-reference-mobile-320.png`, and `/tmp/jplanet-product-reference-sticky.png`.
- Keep product QA viewports `1512x982`, `390x844`, `320x844` and 12 origin states.

- [x] **Step 1: Add failing dual-panel and hierarchy browser assertions**

At desktop require two visible forms:

```js
const heroForm = page.locator(
  ".sazo-product-detail-purchase-panel form[data-product-purchase-form]",
);
const stickyForm = page.locator(
  ".sazo-product-detail-checkout-rail form[data-product-purchase-form]",
);
assert.equal(await heroForm.count(), 1);
assert.equal(await stickyForm.count(), 1);
assert(await heroForm.isVisible(), "hero purchase form visible");
assert(await stickyForm.isVisible(), "sticky purchase form visible");
```

Select through hero and increment through sticky:

```js
await heroForm.getByLabel("商品オプション").selectOption("標準");
assert.equal(await stickyForm.getByLabel("商品オプション").inputValue(), "標準");
await stickyForm.getByRole("button", { name: "数量を増やす" }).click();
assert.equal(await heroForm.getByTestId("product-quantity").innerText(), "2");
assert.equal(await stickyForm.getByTestId("product-total-value").innerText(), "¥7,948");
```

Require recommendation bottom before checkout top in document layout, then scroll the order flow/campaign and require the checkout to settle at sticky top 112px without overlap.

Require six stages and exact state counts `2 / 1 / 3`.

At mobile require two forms in DOM but only one visible form, one mobile fixed action group, a hidden lower checkout, and no page overflow.

- [x] **Step 2: Run product QA and verify RED**

```bash
pnpm qa:sazo-product-detail
```

Expected: the pre-change script or new assertions fail because it assumes one form and the old recommendation/grid hierarchy.

- [x] **Step 3: Update browser actions and geometry measurements**

Scope every purchase action to `heroForm` or `stickyForm`; never use a page-global duplicated label/button locator. Record:

- hero form bounds;
- lower form bounds before and after scroll;
- recommendation bottom;
- commerce-grid top;
- six stage state counts;
- desktop track/card bounds;
- page overflow and mobile visible-form count.

Use a one-pixel tolerance for layout bounds. Preserve the existing source link, quantity, total, footer, chat, fixed CTA, and origin-state assertions.

- [x] **Step 4: Regenerate and inspect all four screenshots**

Capture:

```text
/tmp/jplanet-product-reference-desktop.png
/tmp/jplanet-product-reference-mobile.png
/tmp/jplanet-product-reference-mobile-320.png
/tmp/jplanet-product-reference-sticky.png
```

Visually verify against the five supplied SAZO references:

- top-right full purchase form follows product summary;
- recommendation section is full row;
- second purchase form begins below recommendations;
- second form remains visible next to the six-stage white flow card;
- current third stage is sakura-filled while completed/pending stages use the specified states;
- J-Planet colors/copy replace every SAZO/Korea visual;
- mobile has no duplicate visible form or horizontal spill.

- [x] **Step 5: Run complete verification**

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm build
pnpm exec prettier --check src/sazo-commerce/useProductPurchaseController.ts src/sazo-commerce/ProductPurchasePanel.tsx src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/ProductOrderFlow.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-product-detail.test.tsx scripts/sazo-product-detail-browser.mjs scripts/sazo-jplanet-theme-browser.mjs
node --check scripts/sazo-product-detail-browser.mjs
node --check scripts/sazo-jplanet-theme-browser.mjs
pnpm qa:sazo-product-detail
node scripts/sazo-jplanet-theme-browser.mjs
git diff --check
```

Expected: zero lint/type/build/test failures; product audit keeps 3 viewports/12 origin states; theme audit keeps 36 states/26 mobile placements; image counts may change only when measured and explained.

- [x] **Step 6: Run forbidden-copy and live-route checks**

```bash
rg -n --glob '*.{ts,tsx,json,css,svg}' 'SAZO|韓国|KOREA|TO JAPAN|Republic of Korea' src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/ProductPurchasePanel.tsx src/sazo-commerce/ProductOrderFlow.tsx src/sazo-commerce/useProductPurchaseController.ts
curl -sS -o /dev/null -w '%{http_code}\n' 'http://127.0.0.1:5190/sazo-commerce-mock/?qa=1&view=product&product=p01'
```

Expected: no forbidden matches and HTTP `200`.

- [x] **Step 7: Record measured evidence and commit Task 3**

Update this plan's Task 3 checkboxes with exact form counts, state counts, geometry, screenshot dimensions, test totals, audit totals, and live HTTP result, then commit:

```bash
git add scripts/sazo-product-detail-browser.mjs scripts/sazo-jplanet-theme-browser.mjs docs/superpowers/plans/2026-08-08-jplanet-product-detail-dual-checkout-flow.md
git commit -m "test: verify synchronized product checkout flow"
```

#### Task 3 measured evidence

- Acceptance RED: after the new hero/sticky locators passed, the obsolete global assertion failed with `desktop single purchase form: 2 !== 1`.
- Checkout forms: desktop `2` in DOM / `2` visible / `1` mobile group hidden; 390px and 320px `2` in DOM / `1` visible / `1` mobile group visible, with the lower checkout hidden and without bounds.
- Shared purchase state: selecting `標準` through the hero synchronized the lower select; incrementing through the desktop lower form synchronized both quantities to `2` and both totals to `¥7,948`.
- Desktop form geometry at 1512x982: hero `left=1031 top=848 right=1431 bottom=1524` (`400x675`); lower form before scroll `left=1095 top=2071 right=1435 bottom=2721` (`340x650`); after order-flow scroll `left=1095 top=137 right=1435 bottom=988` (`340x851`). The containing sticky rail was `left=1070 top=112 right=1460 bottom=962` (`390x850`).
- Hierarchy geometry: recommendation bottom `2011.8125`; commerce-grid and lower-checkout document top `2045.8125`, a `34px` gap. The recommendation is the grid's direct preceding sibling.
- Order flow: six stages with state counts `complete=2 / current=1 / pending=3`; sequence `complete, complete, current, pending, pending, pending`; the current stage alone has `aria-current="step"`, and all stages expose localized Japanese status text. At the sticky screenshot position the white flow card was `left=95 top=112 right=983 bottom=364` (`888x251`) and did not overlap the checkout.
- Recommendation geometry: desktop track `left=52 right=1460`, `clientWidth=1408`, `scrollWidth=1408`; all six cards were fully visible at `170px` wide. At 390px and 320px, two cards were fully visible within the internal horizontal rail.
- Overflow: desktop `1512/1512`, 390px `390/390`, 320px `320/320` (`scrollWidth/innerWidth`). Hero bounds were `328x675` at 390px and `272x672` at 320px.
- Screenshots: desktop `1512x4341`, mobile `390x5383`, mobile-320 `320x5456`, sticky `1512x982`. Direct visual comparison against all five supplied 1920x1080 SAZO references confirmed the top-right full purchase form, full-row recommendation rail, post-recommendation lower checkout, sticky checkout beside the white six-stage card, and sakura-filled third/current stage. Red rectangles in the references were treated as user annotations. J-Planet navy/sakura/copy replaced the SAZO/Korea visuals; no mobile duplicate or page spill was visible.
- Full verification: ESLint `0` errors; TypeScript `0` errors; Vitest `14` files / `174` tests passed; Vite build `2,224` modules; Prettier and both Node syntax checks passed; `git diff --check` passed.
- Browser totals: product audit `3` viewports / `12` origin states / `33` images; theme audit `36` states / `26` mobile placements / `546` images. Counts were unchanged.
- Forbidden-copy search returned no matches (expected `rg` exit `1`); live product route returned HTTP `200`.
