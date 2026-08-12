# SAZO Mobile Home Reproduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-only J-Planet home that reproduces the supplied SAZO mobile-web recording at 440 × 956 while preserving the existing desktop home and all product-detail/checkout behavior.

**Architecture:** Keep `HomeView` mounted once. Add explicit mobile-home presentation components inside it and use the existing 768 px breakpoint to select mobile versus desktop surfaces. Reuse current fixtures and assets for the first reproduction pass, add mobile-specific catalog fixtures, and preserve the state/reducer and navigation contracts.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Playwright-compatible Chromium capture.

## Global Constraints

- Primary viewport is exactly 440 × 956 CSS pixels.
- Secondary viewport remains 341 × 735 CSS pixels.
- Mobile home only; product detail, cart, checkout, account, and PRC-dependent copy are out of scope.
- Desktop home must retain its current structure.
- No network-fetched runtime assets.
- Hero progression remains 5,000 ms and respects pause/reduced-motion behavior.
- J-Planet logo, navy, and sakura theme remain in place.

---

### Task 1: Lock the mobile composition contract

**Files:**
- Modify: `tests/unit/sazo-commerce-home.test.tsx`
- Modify: `tests/unit/sazo-commerce-shell.test.tsx`

**Interfaces:**
- Consumes: `HomeView`, `SazoCommercePage`, `createInitialSazoState()`.
- Produces: failing contracts for `[data-mobile-home]`, `[data-mobile-shortcut-grid]`, `[data-mobile-gift-fair]`, `[data-mobile-picks-grid]`, and the mobile header/button inventory.

- [ ] **Step 1: Write the failing home-structure test**

```tsx
it("renders the captured SAZO mobile home sequence", async () => {
  const { container } = await renderHomePage();
  const mobile = container.querySelector("[data-mobile-home]");

  expect(mobile).not.toBeNull();
  expect(
    mobile?.querySelectorAll("[data-mobile-shortcut-grid] button"),
  ).toHaveLength(10);
  expect(
    mobile?.querySelectorAll("[data-mobile-gift-fair]"),
  ).toHaveLength(4);
  expect(
    mobile?.querySelectorAll("[data-mobile-picks-grid] .sazo-product-card"),
  ).toHaveLength(31);
  includesInOrder(mobile?.textContent ?? "", [
    "何を注文しますか？",
    "ブラジル最大級",
    "利用者レビュー",
    "MY GIFT FAIR",
    "J-Planet GRAM",
    "J-Planet's PICK",
  ]);
});
```

- [ ] **Step 2: Write the failing mobile-shell test**

```tsx
it("uses the captured home header and five-item bottom navigation", async () => {
  const { container } = await renderCommercePage();
  const mobile = container.querySelector('[data-shell="mobile"]');

  expect(
    within(mobile as HTMLElement).getByRole("button", { name: "カート" }),
  ).toBeTruthy();
  expect(
    within(mobile as HTMLElement).queryByRole("navigation", {
      name: "モバイルサブメニュー",
    }),
  ).toBeNull();
  expect(
    within(mobile as HTMLElement)
      .getByRole("navigation", { name: "モバイルメニュー" })
      .querySelectorAll("button"),
  ).toHaveLength(5);
});
```

- [ ] **Step 3: Run the tests and verify RED**

Run: `pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx`

Expected: FAIL because the mobile-specific home surface, ten-item shortcut grid, and mobile header contract do not exist.

- [ ] **Step 4: Commit after GREEN only**

Do not commit while unrelated user changes are present. Stage only the test and implementation files after final verification if the user explicitly requests a commit.

---

### Task 2: Add mobile fixtures and semantic components

**Files:**
- Modify: `src/sazo-commerce/fixtures.ts`
- Modify: `src/sazo-commerce/HomeView.tsx`
- Test: `tests/unit/sazo-commerce-home.test.tsx`

**Interfaces:**
- Produces: `mobileShortcuts`, `mobileGiftFairSections`, `mobilePickProducts` and a `[data-mobile-home]` surface.
- Preserves: `products`, `shortcuts`, desktop `HeroCarousel`, reducer state, and `ProductCard` navigation.

- [ ] **Step 1: Add literal mobile fixture types and arrays**

```ts
export interface MobileShortcut {
  id: string;
  label: string;
  artwork: SazoImagePath;
}

export interface MobileGiftFairSection {
  id: string;
  title: string;
  products: readonly Product[];
}

export const mobileShortcuts = [
  { id: "special", label: "特価", artwork: "/sazo-commerce/mobile-shortcuts/special.webp" },
  { id: "limited", label: "限定", artwork: "/sazo-commerce/mobile-shortcuts/limited.webp" },
  { id: "ranking", label: "ランキング", artwork: "/sazo-commerce/mobile-shortcuts/ranking.webp" },
  { id: "reviews", label: "レビュー", artwork: "/sazo-commerce/mobile-shortcuts/reviews.webp" },
  { id: "flea", label: "フリマ", artwork: "/sazo-commerce/mobile-shortcuts/flea.webp" },
  { id: "brands", label: "ブランド", artwork: "/sazo-commerce/mobile-shortcuts/brands.webp" },
  { id: "cosmetics", label: "化粧品", artwork: "/sazo-commerce/mobile-shortcuts/cosmetics.webp" },
  { id: "hobby", label: "趣味", artwork: "/sazo-commerce/mobile-shortcuts/hobby.webp" },
  { id: "appliances", label: "家電", artwork: "/sazo-commerce/mobile-shortcuts/appliances.webp" },
  { id: "food", label: "食品", artwork: "/sazo-commerce/mobile-shortcuts/food.webp" },
] satisfies readonly MobileShortcut[];
```

- [ ] **Step 2: Add mobile presentation components**

Add focused components in `HomeView.tsx`:

```tsx
function MobileDiscoveryTop() { /* search pill + 5×2 shortcut grid */ }
function MobileGiftFair() { /* four headings + two cards per row */ }
function MobileGramGrid({ dispatch }: Pick<HomeViewProps, "dispatch">) { /* 2 cards */ }
function MobilePicksGrid({ dispatch }: Pick<HomeViewProps, "dispatch">) { /* 31 ranked cards */ }
```

Wrap them with `<div className="sazo-mobile-home" data-mobile-home>…</div>` and wrap the existing desktop composition with `<div className="sazo-desktop-home">…</div>`.

- [ ] **Step 3: Run the focused tests and verify GREEN for structure**

Run: `pnpm vitest run tests/unit/sazo-commerce-home.test.tsx`

Expected: PASS for the new mobile composition test and all existing home tests.

---

### Task 3: Reproduce the mobile shell and visual geometry

**Files:**
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Test: `tests/unit/sazo-commerce-shell.test.tsx`

**Interfaces:**
- Consumes: `[data-view="home"]`, `.sazo-mobile-home`, existing `NavigationButton`.
- Produces: sticky 84 px header, 10-item discovery grid, full-bleed hero, and fixed safe-area bottom navigation.

- [ ] **Step 1: Simplify the home mobile header**

For `state.view === "home"`, render only the wordmark and cart action in the mobile primary header. Keep secondary navigation for non-home directory views so existing navigation journeys remain reachable.

- [ ] **Step 2: Apply the 440 px reference geometry**

Use the following mobile values in `sazo.css`:

```css
@media (max-width: 767px) {
  .sazo-root[data-view="home"] .sazo-mobile-header { min-height: 84px; }
  .sazo-root[data-view="home"] .sazo-mobile-header-primary { min-height: 84px; padding: 0 20px; }
  .sazo-root[data-view="home"] .sazo-mobile-header .sazo-wordmark img { width: 108px; }
  .sazo-root[data-view="home"] .sazo-content-main { padding-top: 84px; padding-bottom: 88px; }
  .sazo-root .sazo-mobile-discovery-search { width: calc(100% - 24px); min-height: 50px; margin: 12px auto 22px; }
  .sazo-root .sazo-mobile-shortcut-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); row-gap: 18px; padding: 0 14px 24px; }
  .sazo-root .sazo-mobile-shortcut-artwork { width: 56px; height: 56px; border-radius: 16px; }
  .sazo-root .sazo-mobile-home .sazo-hero-viewport { aspect-ratio: 440 / 215; }
  .sazo-root .sazo-mobile-home .sazo-hero-slide { border-radius: 0; aspect-ratio: 440 / 215; }
  .sazo-root .sazo-mobile-picks-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 12px; }
  .sazo-root .sazo-mobile-nav { min-height: 72px; padding-bottom: max(8px, env(safe-area-inset-bottom)); }
  .sazo-root .sazo-mobile-nav .sazo-nav-button svg { width: 26px; height: 26px; }
}
```

- [ ] **Step 3: Run the focused tests and verify GREEN**

Run: `pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx`

Expected: PASS.

---

### Task 4: Capture and compare the reproduced checkpoints

**Files:**
- Create: `scripts/sazo-mobile-home-capture.mjs`
- Modify: `package.json`
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`

**Interfaces:**
- Produces: `/tmp/jplanet-mobile-home/top.png`, `reviews.png`, `gram.png`, `picks.png`, and `footer.png` at 440 × 956.

- [ ] **Step 1: Add a capture script using installed Chrome**

The script must open `/sazo-commerce-mock/?qa=1`, set `{ width: 440, height: 956 }`, wait for `networkidle`, capture the top viewport, scroll headings into view with `locator.scrollIntoViewIfNeeded()`, and capture the four named checkpoints.

- [ ] **Step 2: Add the script entry**

```json
"sazo:capture:mobile-home": "node scripts/sazo-mobile-home-capture.mjs"
```

- [ ] **Step 3: Run browser capture**

Run: `pnpm sazo:capture:mobile-home`

Expected: five PNG files produced at 440 × 956 with no external runtime requests.

- [ ] **Step 4: Compare against the supplied recording**

Check these observable contracts:

- Header wordmark/cart scale and 84 px content header.
- Search pill and 5×2 shortcuts are visible before the hero.
- Hero fills 440 px width and advances every five seconds.
- Reviews show roughly 2.5 cards.
- Gift-fair rows show two compact cards.
- GRAM uses two columns.
- Picks use two full-width columns with corner ranks.
- Bottom navigation stays visible at every checkpoint.

- [ ] **Step 5: Run the complete verification set**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx
pnpm typecheck
pnpm build
pnpm sazo:capture:mobile-home
```

Expected: all commands exit 0 and the five captures are generated.

