# J-Planet Product Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every rendered product card open a full J-Planet product detail page that reproduces the reference information hierarchy and interactions on desktop and mobile.

**Architecture:** Extend the existing reducer-driven commerce mock with a `product` view, a selected product ID, and a remembered return view. Keep base `Product` fixtures intact, resolve richer detail data through a dedicated fixture adapter, render one accessible `ProductDetailView`, and reuse the existing shell, auth overlay, design tokens, and browser-audit infrastructure.

**Tech Stack:** React 19, TypeScript, i18next, Motion, Lucide React, CSS, Vitest, Testing Library, Playwright, Vite

## Global Constraints

- Product detail is a full page inside the existing J-Planet shell, not a modal.
- Desktop uses a two-column gallery and purchase-panel layout; mobile uses one column and a safe-area-aware fixed purchase bar.
- Every rendered `ProductCard` must open product detail; its favorite button must not navigate.
- Back returns to the exact source view; QA direct entry returns home.
- Preserve the latest J-Planet logo, white primary surfaces, navy and sakura palette, Noto Sans JP, existing navigation, and current price formatting.
- User-visible detail copy and imagery must not contain `SAZO`, `韓国`, `KOREA`, or `TO JAPAN`.
- Purchase and cart actions remain local mock interactions; do not add backend, payment, inventory, or persistent-cart integrations.
- Desktop, 390px, and 320px are mandatory visual and interaction QA sizes.

---

### Task 1: Add product-detail state and fixture resolution

**Files:**

- Modify: `src/sazo-commerce/model.ts`
- Modify: `src/sazo-commerce/fixtures.ts`
- Modify: `tests/unit/sazo-commerce-model.test.ts`

**Interfaces:**

- Consumes: existing `SazoView`, `SazoState`, `SazoAction`, `Product`, `products`, `searchDiscoveryProducts`, `catalogInventory`, and `reviewRecommendations`.
- Produces: `ProductDetail`, `getProductDetail(productId: string | null): ProductDetail`, `open-product`, `close-product`, `selectedProductId`, and `productReturnView`.

- [ ] **Step 1: Write failing reducer and fixture tests**

Add imports for `getProductDetail`, `products`, and `type SazoState`, then write these contracts in `tests/unit/sazo-commerce-model.test.ts`:

```ts
it("opens product detail and returns to the source view", () => {
  const catalog = { ...createInitialSazoState(), view: "catalog" } as SazoState;
  const detail = sazoReducer(catalog, { type: "open-product", productId: "p01" });

  expect(detail).toMatchObject({
    productReturnView: "catalog",
    selectedProductId: "p01",
    view: "product",
  });
  expect(sazoReducer(detail, { type: "close-product" }).view).toBe("catalog");
});

it("keeps the original return view when another recommendation is opened", () => {
  const first = sazoReducer(
    { ...createInitialSazoState(), view: "ranking" } as SazoState,
    { type: "open-product", productId: "p01" },
  );
  const second = sazoReducer(first, { type: "open-product", productId: "p02" });

  expect(second.productReturnView).toBe("ranking");
  expect(second.selectedProductId).toBe("p02");
});

it("accepts a deterministic product QA entry and falls back safely", () => {
  expect(createInitialSazoState("?qa=1&view=product&product=p01")).toMatchObject({
    productReturnView: "home",
    selectedProductId: "p01",
    view: "product",
  });
  expect(getProductDetail("missing-id").product.id).toBe(products[0]?.id);
});

it("resolves rich and generated product detail without changing base products", () => {
  const rich = getProductDetail("p01");
  const generated = getProductDetail("recommendation-heart");

  expect(rich.gallery.length).toBeGreaterThan(1);
  expect(rich.options.length).toBeGreaterThan(0);
  expect(generated.product.id).toBe("recommendation-heart");
  expect(generated.gallery).toEqual([generated.product.image]);
});
```

- [ ] **Step 2: Run the focused tests and prove RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-model.test.ts
```

Expected: FAIL because `product` view, product actions, product state, and `getProductDetail` do not exist.

- [ ] **Step 3: Add the state contract**

Update `model.ts` with these exact public shapes:

```ts
export type SazoView =
  | "home"
  | "service"
  | "brands"
  | "categories"
  | "catalog"
  | "campaign"
  | "reviews"
  | "ranking"
  | "mypage"
  | "favorites"
  | "profile"
  | "cards"
  | "product";

export type SazoNonProductView = Exclude<SazoView, "product">;

export interface SazoState {
  // existing fields remain unchanged
  selectedProductId: string | null;
  productReturnView: SazoNonProductView;
}

export type SazoAction =
  // existing actions remain unchanged
  { type: "open-product"; productId: string } | { type: "close-product" };
```

Initialize `selectedProductId` to `null` and `productReturnView` to `"home"`. Add `product` to `qaViews`; when `?qa=1&view=product` is accepted, read `product` and default to `products[0].id` indirectly through the view layer when absent. Reducer behavior must preserve the old return view when `state.view === "product"`:

```ts
case "open-product":
  return {
    ...state,
    overlay: "none",
    productReturnView:
      state.view === "product" ? state.productReturnView : state.view,
    selectedProductId: action.productId,
    view: "product",
  };
case "close-product":
  return {
    ...state,
    overlay: "none",
    selectedProductId: null,
    view: state.productReturnView,
  };
```

- [ ] **Step 4: Add rich detail fixtures and a total resolver**

Add these interfaces near `Product` in `fixtures.ts`:

```ts
export interface ProductDetail {
  product: Product;
  gallery: readonly SazoImagePath[];
  originalName: string;
  categoryLabel: string;
  originalUrl?: string;
  optionLabel: string;
  options: readonly string[];
  purchaseNote: string;
  information: string;
  recommendationIds: readonly string[];
}
```

After all product-bearing fixture arrays are declared, build a deduplicated product registry from `products`, `searchDiscoveryProducts`, `catalogInventory.map(({ product }) => product)`, and `reviewRecommendations.map(({ product }) => product)`. Add a rich `p01` override with three local gallery images from `/sazo-commerce/products/01.webp` through `/03.webp`, option choices `標準` and `ギフト包装`, and Japan-to-Brazil copy. Export:

```ts
export function getProductDetail(productId: string | null): ProductDetail;
```

The fallback must select the requested registered product, otherwise `products[0]`, use a one-image gallery, `商品オプション`, option `標準`, no fabricated external URL, and recommendation IDs from other registered products.

- [ ] **Step 5: Run the focused tests and prove GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: model tests pass and TypeScript reports zero errors.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/sazo-commerce/model.ts src/sazo-commerce/fixtures.ts tests/unit/sazo-commerce-model.test.ts
git commit -m "feat: add product detail state and fixtures"
```

---

### Task 2: Make every ProductCard open and return from a basic detail view

**Files:**

- Create: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/ProductCard.tsx`
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/CatalogView.tsx`
- Modify: `src/sazo-commerce/EditorialViews.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Create: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- Consumes: Task 1 `open-product`, `close-product`, `getProductDetail`, `selectedProductId`, and `SazoState`.
- Produces: `ProductDetailView`, `data-view-content="product"`, `data-product-detail`, and accessible `ProductCard` open controls.

- [ ] **Step 1: Write failing ProductCard and page-transition tests**

Create `tests/unit/sazo-product-detail.test.tsx` with jsdom, i18n setup, cleanup, and these contracts:

```tsx
it("opens detail from the product control without coupling favorite navigation", async () => {
  const onOpen = vi.fn();
  await renderWithI18n(<ProductCard onOpen={onOpen} product={products[0]!} />);

  fireEvent.click(screen.getByRole("button", { name: /商品詳細を開く/ }));
  expect(onOpen).toHaveBeenCalledWith("p01");

  fireEvent.click(screen.getByRole("button", { name: /お気に入り/ }));
  expect(onOpen).toHaveBeenCalledTimes(1);
});

it("opens a product from home and returns to home", async () => {
  window.history.replaceState(null, "", "/sazo-commerce-mock/");
  const { container } = await renderWithI18n(<SazoCommercePage />);

  fireEvent.click(screen.getAllByRole("button", { name: /商品詳細を開く/ })[0]!);
  expect(container.querySelector("[data-product-detail]")).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "戻る" }));
  expect(container.querySelector("[data-home-view]")).not.toBeNull();
});
```

- [ ] **Step 2: Run the new test and prove RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: FAIL because `ProductCard.onOpen` and `ProductDetailView` do not exist.

- [ ] **Step 3: Refactor ProductCard into sibling open and favorite controls**

Change the public props to:

```ts
export interface ProductCardProps {
  mediaHidden?: boolean;
  onOpen: (productId: string) => void;
  product: Product;
  variant?: "compact" | "standard";
}
```

Inside the article, render one `.sazo-product-open` button containing both the media and copy, then render `.sazo-product-favorite` as a sibling button positioned above the card. The open button calls `onOpen(product.id)` and uses `aria-label={`商品詳細を開く: ${product.name}`}`. Do not nest one button inside another.

- [ ] **Step 4: Thread dispatch through every ProductCard caller**

For every `ProductCard` in `HomeView.tsx`, `CatalogView.tsx`, and `EditorialViews.tsx`, pass:

```tsx
onOpen={(productId) => {
  dispatch({ type: "open-product", productId });
}}
```

Update helper components such as `ProductGrid`, `RecommendedReviews`, `ProductDiscovery`, and `SearchDiscovery` to accept `dispatch` where needed. No rendered `ProductCard` may omit `onOpen`.

- [ ] **Step 5: Create a basic routed ProductDetailView**

Create `ProductDetailView.tsx` with:

```ts
export interface ProductDetailViewProps {
  dispatch: Dispatch<SazoAction>;
  productId: string | null;
}
```

Resolve `getProductDetail(productId)`, render an article with `data-product-detail` and `data-view-content="product"`, a `戻る` button dispatching `close-product`, the primary image, brand, product name, and price. In `SazoCommercePage.tsx`, render it when `state.view === "product"` and pass `state.selectedProductId`.

- [ ] **Step 6: Add structural ProductCard and basic detail CSS**

Keep existing card dimensions. Make `.sazo-product-card` positioned, `.sazo-product-open` inherit text alignment/color with no default border/background, and `.sazo-product-favorite` a higher z-index sibling. Add minimal `.sazo-product-detail` and `.sazo-product-detail-basic` rules sufficient for the transition test; Task 3 will replace the basic section with the full layout.

- [ ] **Step 7: Run focused and affected suites**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-views.test.tsx
pnpm typecheck
```

Expected: all tests pass, every ProductCard call compiles, and favorite behavior remains independent.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/ProductCard.tsx src/sazo-commerce/HomeView.tsx src/sazo-commerce/CatalogView.tsx src/sazo-commerce/EditorialViews.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/sazo.css tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: open product detail from commerce cards"
```

---

### Task 3: Build the complete interactive product detail page

**Files:**

- Modify: `src/sazo-commerce/ProductDetailView.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `tests/unit/sazo-product-detail.test.tsx`

**Interfaces:**

- Consumes: Task 1 `ProductDetail`; Task 2 `ProductDetailViewProps` and product navigation.
- Produces: gallery, purchase form, recommendation rail, order timeline, tabs, reviews, caution content, J-Planet benefit cards, and mobile purchase bar.

- [ ] **Step 1: Write failing interaction and content tests**

Add contracts that render `ProductDetailView` with `productId="p01"` and assert:

```tsx
expect(screen.getByRole("heading", { name: products[0]!.name })).toBeTruthy();
expect(screen.getByText("日本の販売サイトから直接購入")).toBeTruthy();
expect(screen.getByText("日本で購入")).toBeTruthy();
expect(screen.getByText("ブラジルへお届け")).toBeTruthy();
expect(screen.getByRole("tab", { name: "商品情報" })).toBeTruthy();
expect(screen.getByRole("heading", { name: "なぜJ-Planetなのか？" })).toBeTruthy();
```

Add gallery and purchase behavior:

```tsx
const secondThumbnail = screen.getByRole("button", { name: "画像2を表示" });
fireEvent.click(secondThumbnail);
expect(screen.getByRole("img", { name: products[0]!.name }).getAttribute("src")).toBe(
  "/sazo-commerce/products/02.webp",
);

fireEvent.click(screen.getAllByRole("button", { name: "カートに入れる" })[0]!);
expect(screen.getByRole("alert").textContent).toContain("商品オプションを選択");

fireEvent.change(screen.getByLabelText("商品オプション"), {
  target: { value: "標準" },
});
expect(screen.getByTestId("product-total").textContent).toContain(products[0]!.price);
fireEvent.click(screen.getAllByRole("button", { name: "カートに入れる" })[0]!);
expect(screen.getByRole("status").textContent).toContain("カートに追加しました");
```

Also assert product-visible text excludes `/SAZO|韓国|KOREA|TO JAPAN/i` after normalizing whitespace.

- [ ] **Step 2: Run the focused test and prove RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx
```

Expected: FAIL because the complete information hierarchy and interactions are absent.

- [ ] **Step 3: Implement the gallery and product summary**

In `ProductDetailView.tsx`, use local state for active gallery index, favorite, selected option, request text, image check, active tab, and feedback. Render:

- compact mobile header with `戻る`, truncated title, home, and cart controls;
- vertical desktop/horizontal mobile thumbnails;
- primary image with previous/next controls only when `gallery.length > 1`;
- source/category label, original-page link only when present, share and favorite;
- product name, original name, price, and `日本の販売サイトから直接購入`.

Thumbnail buttons use `aria-current`, arrow-key navigation updates the active index, and the main image has the product name as alt text.

- [ ] **Step 4: Implement one accessible purchase form**

Render one form in the right purchase panel with:

- required `select` labelled `商品オプション`;
- `textarea` labelled `ご要望`;
- checkbox labelled `画像にチェック`;
- collapsed/expanded total summary with `data-testid="product-total"`;
- `カートに入れる` and `今すぐ買う` buttons.

Both CTAs validate the option. Invalid submission sets an alert and focuses the select. Valid cart submission announces `カートに追加しました` in an `aria-live` status. Valid buy-now dispatches `{ type: "open-login" }`. The mobile bar triggers the same handlers and references the same form state without rendering a duplicate form.

- [ ] **Step 5: Implement the lower reference hierarchy**

Render these sections in order:

1. `この商品はいかがですか？` recommendation rail using resolved recommendation IDs and `ProductCard` with `open-product` dispatch.
2. Order timeline with exactly `注文受付`, `日本で購入`, `日本倉庫で検品`, `国際配送・通関`, `ブラジルへお届け`.
3. Arrow-key-operable tabs `商品情報` and `注意事項`.
4. Information panel containing `J-Planetが日本で購入・検品し、ブラジルへお届けします`.
5. Review empty state `レビューがありません。`.
6. Three caution cards for seller inventory, Brazil import restrictions, and refund support without carrier/date/tax promises.
7. Three `なぜJ-Planetなのか？` benefit cards for fee clarity, unified search, and user reviews.

- [ ] **Step 6: Implement final desktop and mobile styling**

Add scoped `.sazo-product-detail-*` rules:

- desktop max-width 1200px, gallery/purchase grid, 56px thumbnail rail, square primary media, sticky purchase panel;
- white surfaces, J-Planet navy text/CTA, sakura required/active/progress states, existing radii and shadows;
- recommendation cards and order timeline matching the reference density;
- at `max-width: 767px`, one column, compact header, horizontal thumbnails, 44px controls, and fixed `.sazo-product-mobile-purchase` with `padding-bottom: env(safe-area-inset-bottom)`;
- content bottom padding equal to the fixed bar plus chat clearance;
- 320px wrapping with no clipped CTA/text;
- crossfade/entry/status animations and `prefers-reduced-motion: reduce` overrides.

- [ ] **Step 7: Run component, accessibility, and regression tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-product-detail.test.tsx tests/unit/sazo-commerce-views.test.tsx tests/unit/sazo-commerce-home.test.tsx
pnpm lint
pnpm typecheck
```

Expected: all focused suites pass, lint has zero errors/warnings, and TypeScript has zero errors.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/sazo-commerce/ProductDetailView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-product-detail.test.tsx
git commit -m "feat: reproduce J-Planet product detail experience"
```

---

### Task 4: Add real-browser product QA and complete the rollout

**Files:**

- Create: `scripts/sazo-product-detail-browser.mjs`
- Modify: `scripts/sazo-jplanet-theme-browser.mjs`
- Modify: `package.json`
- Modify: `docs/superpowers/plans/2026-08-08-jplanet-product-detail.md`

**Interfaces:**

- Consumes: `data-view-content="product"`, `data-product-detail`, `.sazo-product-open`, `.sazo-product-mobile-purchase`, and QA product parameters.
- Produces: desktop/390px/320px screenshots, origin-return interaction proof, fixed-bar bounds proof, and expanded whole-site theme audit.

- [x] **Step 1: Write a failing product-detail browser script** — Added the Vite/Chrome-channel QA for 3 viewports and 12 origin-return states, including gallery/option/cart/tabs, image dimensions, overflow, Noto computed font, fixed CTA bounds, and footer/chat overlap.

Create `scripts/sazo-product-detail-browser.mjs` using the existing Vite ephemeral-server and Playwright Chrome-channel pattern. It must:

```js
const origins = ["home", "catalog", "ranking", "reviews"];
const viewports = [
  { label: "desktop", width: 1512, height: 982 },
  { label: "mobile", width: 390, height: 844 },
  { label: "mobile-320", width: 320, height: 844 },
];
```

For each origin, open `?qa=1&view=<origin>`, click the first `.sazo-product-open`, require `[data-product-detail]`, click `戻る`, and require the original content selector. For each viewport, open `?qa=1&view=product&product=p01`, exercise thumbnail 2, option `標準`, cart feedback, info/caution tabs, and take `/tmp/sazo-jplanet-product-<label>.png`.

At mobile sizes, assert the fixed purchase bar has `x >= 0`, `right <= viewport width`, `bottom <= viewport height`, and does not cover the last footer link after scrolling to the bottom. Assert all detail images are complete with positive natural dimensions and `documentElement.scrollWidth <= innerWidth + 1`.

- [x] **Step 2: Run the browser script and prove RED** — Initial run failed at `reviews` because no `.sazo-product-open` existed; a focused unit test independently failed because the reviews recommendation region was absent.

Run:

```bash
node scripts/sazo-product-detail-browser.mjs
```

Expected: FAIL until all selectors, interactions, and responsive geometry satisfy the browser contract.

- [x] **Step 3: Add product to the whole-site theme audit** — Product now uses `product=p01`, checks both required route phrases, and is captured at desktop/390px/320px.

In `scripts/sazo-jplanet-theme-browser.mjs`:

- append `"product"` to `views`;
- let `contentSelector("product")` resolve `[data-view-content="product"]`;
- navigate product QA with `product=p01`;
- capture product screenshots at desktop, 390px, and 320px;
- update expected audit state count from `34` to `36`;
- update expected mobile top-placement count from `24` to `26`;
- require visible `日本の販売サイトから直接購入` and `ブラジルへお届け` on the product view.

- [x] **Step 4: Add a package command and run both browser audits** — `pnpm qa:sazo-product-detail` passed 3 viewports/12 origin states/21 images; the whole-site audit passed 36 states/26 mobile top-placement states/538 images.

Add:

```json
"qa:sazo-product-detail": "node scripts/sazo-product-detail-browser.mjs"
```

Run:

```bash
pnpm qa:sazo-product-detail
node scripts/sazo-jplanet-theme-browser.mjs
```

Expected: product QA passes; the whole-site audit reports 36 states and 26 mobile top-placement states with no copy, palette, image, or overflow failures.

- [x] **Step 5: Inspect the three representative screenshots** — Visually confirmed the required hierarchy, legibility, compact mobile header, fixed bar, and J-Planet/Japan-to-Brazil branding in all three `/tmp/sazo-jplanet-product-*.png` captures.

Inspect:

```text
/tmp/sazo-jplanet-product-desktop.png
/tmp/sazo-jplanet-product-mobile.png
/tmp/sazo-jplanet-product-mobile-320.png
```

Confirm reference-order gallery, purchase panel, recommendation rail, order timeline, tabs, review, cautions, J-Planet benefits, mobile compact header, and fixed purchase bar are legible and use only J-Planet/Japan-to-Brazil branding.

- [x] **Step 6: Run full automated verification** — `pnpm lint`, `pnpm typecheck`, `pnpm vitest run` (14 files/157 tests), `pnpm build`, and `git diff --check` all exited 0.

Run:

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm build
git diff --check
```

Expected: every command exits 0 and all test files/tests pass.

- [x] **Step 7: Run forbidden-copy and live-route checks** — Forbidden-copy `rg` returned no matches and the live route returned HTTP 200.

Run:

```bash
rg -n --glob '*.{ts,tsx,json,css,svg}' 'SAZO|韓国|KOREA|TO JAPAN' src/sazo-commerce/ProductDetailView.tsx
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5190/sazo-commerce-mock/
```

Expected: `rg` returns no matches and the live route returns `200`.

- [x] **Step 8: Mark plan evidence and commit Task 4** — Recorded only measured Task 4 evidence here; the verified owned files are included in the prescribed Task 4 commit.

Only after every command and visual check passes, change the plan checkboxes with actual evidence, then commit:

```bash
git add scripts/sazo-product-detail-browser.mjs scripts/sazo-jplanet-theme-browser.mjs package.json docs/superpowers/plans/2026-08-08-jplanet-product-detail.md
git commit -m "test: verify J-Planet product detail flow"
```
