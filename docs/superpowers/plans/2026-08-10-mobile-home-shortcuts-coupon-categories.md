# J-Planet Mobile Home Shortcuts, Coupon, and Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the mobile J-Planet home by replacing the duplicate top navigation and intro block with one discoverable shortcut rail, a coupon banner, and a photo-led category rail.

**Architecture:** Keep the existing `HomeView`/`SazoShell` boundaries and dispatch-based navigation. The home owns presentation order; shortcut and category fixtures own labels, icons, and imagery; CSS provides internal horizontal rails without page overflow. The coupon uses the existing coupons route and existing local campaign artwork.

**Tech Stack:** React 19, TypeScript, lucide-react, i18next, Vitest, Playwright, Vite CSS.

## Global Constraints

- Shortcut order is exactly `J-Planet特集 → 限定 → フリマ → サービス紹介 → 人気ブランド → カテゴリー → レビュー → ヘルプ → お知らせ`.
- `ホーム` is removed from the mobile shortcut rail but remains in fixed bottom navigation.
- `コスメ` and `K-POP` are absent from the mobile shortcut rail.
- Only shortcut/category rails may have intentional horizontal overflow; the page itself must not overflow at 341px, 390px, or 440px.
- Coupon action routes to the existing `coupons` view; no backend/payment behavior changes.
- Desktop, product, cart, checkout, and existing J-Planet branding remain unchanged.
- User-facing labels are localized in Japanese, English, and Portuguese.

---

### Task 1: Define home shortcut and category fixtures

**Files:**
- Modify: `src/sazo-commerce/fixtures.ts`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Test: `tests/unit/sazo-commerce-home.test.tsx`

**Interfaces:**
- Produces `homeShortcutItems`, a readonly list of nine items with `id`, `labelKey`, optional `view`, and optional icon identifier.
- Produces `homeCategoryItems`, a readonly list of photo-led category entries with `id`, `labelKey`, `image`, and optional `view`.

- [ ] **Step 1: Write failing fixture contract tests**

```tsx
expect(homeShortcutItems.map((item) => item.labelKey)).toEqual([
  "feature", "limited", "fleaMarket", "service", "brands",
  "categories", "reviews", "help", "news",
]);
expect(homeShortcutItems.some((item) => item.labelKey === "home")).toBe(false);
expect(homeShortcutItems.some((item) => item.labelKey === "cosmetics")).toBe(false);
expect(homeShortcutItems.some((item) => item.labelKey === "kpop")).toBe(false);
expect(homeCategoryItems.length).toBeGreaterThanOrEqual(6);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm exec vitest run tests/unit/sazo-commerce-home.test.tsx`

Expected: FAIL because the new fixture exports and locale keys do not exist.

- [ ] **Step 3: Add the nine shortcut entries and category image data**

Reuse existing local artwork from `public/sazo-commerce` and existing `categoryDirectory`/GRAM product imagery. Assign the existing navigation views to service, brands, categories, reviews, and support; leave news inert. Add all labels and accessible category text to the three locale files.

- [ ] **Step 4: Run the focused tests and typecheck**

Run: `pnpm exec vitest run tests/unit/sazo-commerce-home.test.tsx && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit only fixture/locale/test hunks**

```bash
git add -p src/sazo-commerce/fixtures.ts src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-home.test.tsx
git diff --cached --check
git commit -m "feat: define mobile home shortcuts and categories"
```

### Task 2: Replace the duplicated mobile navigation with the unified shortcut rail

**Files:**
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Test: `tests/unit/sazo-commerce-shell.test.tsx`
- Test: `tests/unit/sazo-commerce-home.test.tsx`

**Interfaces:**
- `HomeView` renders a `ShortcutRow` with nine `button` elements and dispatches the existing `navigate` actions.
- `SazoShell` renders no `.sazo-mobile-secondary-nav` on the home mobile shell while keeping the bottom `ホーム` button.

- [ ] **Step 1: Write failing navigation assertions**

```tsx
expect(screen.queryByRole("navigation", { name: "モバイルサブメニュー" })).toBeNull();
expect(screen.getByRole("group", { name: "J-Planetショートカット" })
  .querySelectorAll("button")).toHaveLength(9);
expect(screen.getByRole("button", { name: "サービス紹介" })).toBeVisible();
expect(screen.queryByRole("button", { name: "コスメ" })).toBeNull();
expect(screen.queryByRole("button", { name: "K-POP" })).toBeNull();
```

- [ ] **Step 2: Run focused tests and verify the old structure fails**

Run: `pnpm exec vitest run tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx`

Expected: FAIL because the shell still renders the old secondary nav and the shortcut fixture still drives the old five-item row.

- [ ] **Step 3: Implement the unified row and remove only the home secondary nav**

Render the mobile secondary nav only for non-home views, or omit it from the mobile shell when `state.view === "home"`. Update `ShortcutRow` to use `homeShortcutItems`; map each navigable entry to the existing dispatch action and keep news inert. Do not change desktop navigation or bottom navigation.

- [ ] **Step 4: Add mobile rail CSS**

Use `display:flex`, `flex-wrap:nowrap`, `overflow-x:auto`, `scrollbar-width:none`, `touch-action:pan-x`, and `flex:0 0 auto` for shortcut buttons. Keep page/root `overflow-x:clip` and preserve existing focus rings, safe-area, and J-Planet tokens.

- [ ] **Step 5: Run focused tests and typecheck**

Run: `pnpm exec vitest run tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx && pnpm typecheck`

Expected: PASS.

- [ ] **Step 6: Commit only shell/home/CSS/test hunks**

```bash
git add -p src/sazo-commerce/SazoShell.tsx src/sazo-commerce/HomeView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx
git diff --cached --check
git commit -m "feat: unify mobile home discovery shortcuts"
```

### Task 3: Replace the intro block with the coupon and add the post-GRAM category rail

**Files:**
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/sazo-commerce/fixtures.ts` if category shape needs a local adjustment
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Test: `tests/unit/sazo-commerce-home.test.tsx`

**Interfaces:**
- `MobileCouponBanner` renders `data-mobile-coupon-banner` and dispatches `{ type: "navigate", view: "coupons" }`.
- `MobileCategoryRail` renders `data-mobile-category-rail` after `MobileGramGrid`, with one button per `homeCategoryItems` entry.

- [ ] **Step 1: Write failing placement and interaction tests**

```tsx
const coupon = screen.getByTestId("mobile-coupon-banner");
expect(coupon).toBeVisible();
expect(screen.queryByText("ブラジル最大級 日本直輸入ショップ")).toBeNull();
expect(screen.getByTestId("mobile-category-rail")).toBeVisible();
expect(screen.getByTestId("mobile-gram-section").compareDocumentPosition(
  screen.getByTestId("mobile-category-rail"),
) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
await user.click(screen.getByRole("button", { name: /クーポン/ }));
expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "coupons" });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm exec vitest run tests/unit/sazo-commerce-home.test.tsx`

Expected: FAIL because the old `HomeIntro` is still present and the category rail does not exist.

- [ ] **Step 3: Implement `MobileCouponBanner`**

Use the existing local coupon/campaign artwork, an image with descriptive alt text, a short Japanese/Portuguese-safe label, and a button that dispatches to `coupons`. Keep the banner bounded by the home content width and preserve rounded corners.

- [ ] **Step 4: Implement `MobileCategoryRail` and placement**

Render photo tiles with two-line labels and an accessible group label. Place the rail directly after `MobileGramGrid` and before `MobilePicksGrid`. Use existing local images only; if an image is missing, render a neutral J-Planet tile with the category label.

- [ ] **Step 5: Add responsive styling and reduced-motion behavior**

Use an internal horizontal rail for categories, circular/rounded image tiles, and no page-level overflow at 341/390/440px. Add visible keyboard focus and `scroll-behavior:auto` under `prefers-reduced-motion: reduce`.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `pnpm exec vitest run tests/unit/sazo-commerce-home.test.tsx && pnpm typecheck`

Expected: PASS.

- [ ] **Step 7: Commit only HomeView/CSS/locale/fixture/test hunks**

```bash
git add -p src/sazo-commerce/HomeView.tsx src/sazo-commerce/sazo.css src/sazo-commerce/fixtures.ts src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-home.test.tsx
git diff --cached --check
git commit -m "feat: add mobile coupon and category discovery"
```

### Task 4: E2E, responsive QA, and regression verification

**Files:**
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`
- Reuse: `scripts/sazo-capture-checkpoints.mjs`
- Reuse: `design/reproductions/sazo-commerce/qa/`

**Interfaces:**
- Consumes the nine-item shortcut rail, coupon test id, category rail test id, and existing fixed bottom navigation.
- Produces mobile regression coverage without changing desktop/product/cart/checkout expectations.

- [ ] **Step 1: Write failing E2E assertions**

At mobile widths, assert nine shortcut buttons in the approved order, no secondary nav, no cosmetics/K-POP, coupon visibility/action, category rail visibility after GRAM, internal rail overflow, and `document.documentElement.scrollWidth === clientWidth`.

- [ ] **Step 2: Run E2E and verify stale contracts fail**

Run: `pnpm test:e2e:sazo`

Expected: mobile failures until the new shortcut/coupon/category selectors are implemented.

- [ ] **Step 3: Update only feature-owned E2E expectations**

Keep desktop flows and product/cart/checkout assertions unchanged. Add a touch gesture check proving shortcut/category rail movement does not change page vertical scroll.

- [ ] **Step 4: Run the complete verification gate**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:sazo
pnpm sazo:capture
curl -I http://127.0.0.1:5190/sazo-commerce-mock/
```

If `sazo:capture` reproduces the existing hero fixture mismatch, record it without changing unrelated hero fixtures.

- [ ] **Step 5: Perform visual QA**

Inspect 341x735, 390x844, and 440x956 home captures. Confirm the old top nav and intro are absent, the nine-item rail is finger-scrollable, coupon artwork is prominent but bounded, the interested-items rail follows it, and the category rail appears directly after J-Planet GRAM.

- [ ] **Step 6: Commit only E2E/QA test hunks**

```bash
git add -p tests/e2e/sazo-commerce-reproduction.spec.ts
git diff --cached --check
git commit -m "test: cover mobile home shortcut coupon layout"
```

---

## Plan self-review

- Every spec requirement maps to Tasks 1–4: shortcut order/removals (1–2), coupon replacement and category placement (3), responsive/accessibility/E2E/visual QA (2–4).
- No placeholder markers or undefined function names remain.
- Task 3 defines the exact `data-testid` hooks consumed by Task 4.
- Desktop/product/cart/checkout scope is explicitly protected in Tasks 2 and 4.
