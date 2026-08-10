# SAZO Mobile First-Fold Precision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the J-Planet mobile home first fold match the approved SAZO reference geometry while preserving J-Planet branding, content, behavior, and the accepted bottom navigation.

**Architecture:** Keep the existing React component tree and assets unchanged. Tighten only the final authoritative mobile-home CSS override, and promote the approved reference dimensions into the existing Playwright capture script so visual geometry becomes a regression contract.

**Tech Stack:** React 19, TypeScript, CSS, Vite, Playwright, Node.js assertions, Vitest.

## Global Constraints

- Preserve the J-Planet wordmark, navy/sakura palette, five current shortcut artworks, localized copy, and AI-agent behavior.
- Do not change the bottom navigation, chat button, intro/product sections, product detail, cart, checkout, PRC, fixtures, prices, or desktop/tablet layout.
- Keep `public/sazo-commerce/hero/slide-1.webp`; the same-banner comparison must be solved through geometry and surface styling, not an asset swap.
- Limit implementation ownership to `scripts/sazo-mobile-home-capture.mjs` and `src/sazo-commerce/sazo.css`.
- Preserve all pre-existing modified and untracked files outside those two files.

---

### Task 1: Lock and implement the SAZO first-fold geometry

**Files:**
- Modify: `scripts/sazo-mobile-home-capture.mjs:76-151`
- Modify: `src/sazo-commerce/sazo.css:8241-8434`

- [ ] **Step 1: Replace the loose capture assertions with the approved reference contract**

In `inspectMobileHomeGeometry`, add locators for the language button and the search label, read the header/search computed styles, and replace the current height and overlap checks with the following contract:

```js
const languageButton = page.locator(
  '.sazo-mobile-header-actions button:first-child',
);
const searchLabel = page.locator(
  '[data-mobile-agent-search] > span:not(.sazo-mobile-agent-badge)',
);

assert(Math.abs(header.height - 98) <= 2);
assert(Math.abs(primary.height - 56) <= 2);
assert(Math.abs(secondary.height - 42) <= 2);
assert(Math.abs(hero.y - 99) <= 2);

if (expectedWidth === 440) {
  assert(Math.abs(hero.height - 220) <= 2);
  assert(search.y >= 288 && search.y <= 292);
  assert(Math.abs(search.height - 48) <= 1);
  assert(shortcuts.y >= 364 && shortcuts.y <= 371);
  assert(intro.y >= 499 && intro.y <= 511);
}

const searchOverlapRatio = (hero.y + hero.height - search.y) / search.height;
assert(Math.abs(searchOverlapRatio - 0.6) <= 0.08);
```

Add surface assertions that require a 16–18px rounded header bottom, a non-`none` header shadow, an 18×2px language underline from `getComputedStyle(element, '::after')`, and a centered search label whose center differs from the pill center by at most 3px.

- [ ] **Step 2: Run the capture script and verify RED**

Run:

```bash
node scripts/sazo-mobile-home-capture.mjs
```

Expected: failure on the old 122px header and/or old 0.50 search overlap. Do not edit CSS until this failure is observed.

- [ ] **Step 3: Implement the minimum mobile-home CSS changes**

In the final `@media (max-width: 767px)` block of `sazo.css`, apply these values without changing shortcut artwork or component markup:

```css
.sazo-root[data-view="home"] .sazo-mobile-header,
.sazo-root[data-view="home"][data-header-collapsed="true"] .sazo-mobile-header {
  min-height: 98px;
  border-radius: 0 0 18px 18px;
  box-shadow: 0 5px 12px color-mix(in srgb, var(--jplanet-shadow) 24%, transparent);
}

.sazo-root[data-view="home"] .sazo-mobile-header-primary,
.sazo-root[data-view="home"][data-header-collapsed="true"] .sazo-mobile-header-primary {
  flex-basis: 56px;
  min-height: 56px;
}

.sazo-root[data-view="home"] .sazo-mobile-secondary-nav,
.sazo-root[data-view="home"][data-header-collapsed="true"] .sazo-mobile-secondary-nav {
  flex-basis: 42px;
  min-height: 42px;
}

.sazo-root[data-view="home"] .sazo-mobile-secondary-button,
.sazo-root[data-view="home"][data-header-collapsed="true"] .sazo-mobile-secondary-button {
  min-height: 42px;
}

.sazo-root[data-view="home"] .sazo-content-main {
  padding-top: 98px;
}

.sazo-root[data-view="home"] .sazo-hero-viewport,
.sazo-root[data-view="home"] .sazo-hero-slide {
  aspect-ratio: 2 / 1;
}

.sazo-root[data-view="home"] .sazo-mobile-search-overlap {
  margin-top: -29px;
}

.sazo-root[data-view="home"] .sazo-mobile-search-pill {
  position: relative;
  justify-content: center;
  min-height: 48px;
  font-size: clamp(14px, 3.6vw, 16px);
  font-weight: 600;
  text-align: center;
}

.sazo-root[data-view="home"] .sazo-mobile-search-pill > svg {
  position: absolute;
  left: 18px;
}

.sazo-root[data-view="home"] .sazo-shortcuts {
  margin-top: 29px;
  padding-bottom: 60px;
}
```

Add a positioned `::after` underline to `.sazo-mobile-header-actions button:first-child` with `width: 18px`, `height: 2px`, and the J-Planet navy color. Adjust only spacing values if the 440px contract requires a final 1–2px correction.

- [ ] **Step 4: Run the focused capture contract and verify GREEN**

Run:

```bash
node scripts/sazo-mobile-home-capture.mjs
```

Expected: `sazo-mobile-home-capture-ok`, including 341, 440, 676, 900, and 1511 widths.

- [ ] **Step 5: Perform same-banner visual QA**

Inspect these generated images against `/Users/fujitatetsu/Downloads/スクリーンショット 2026-08-10 16.12.42.png` and the J-Planet comparison `/Users/fujitatetsu/Downloads/スクリーンショット 2026-08-10 16.12.46.png`:

```text
/tmp/jplanet-mobile-home-341x735.png
/tmp/jplanet-mobile-home-440x956.png
/tmp/jplanet-mobile-home-676x1472.png
/tmp/jplanet-mobile-home-900x900.png
/tmp/jplanet-desktop-home-1511x900.png
```

Confirm: the two-row header is visually as compact as SAZO, the hero begins immediately below it, the centered 48px search pill overlaps approximately 60%, shortcut icons are unchanged, the intro begins in the target range, and desktop/tablet are unchanged.

- [ ] **Step 6: Run the full regression gates**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --reporter=dot
pnpm build
pnpm test:e2e:sazo
node scripts/sazo-mobile-home-capture.mjs
curl -I http://127.0.0.1:5190/sazo-commerce-mock/
git diff --check
```

Expected: all commands pass, 18 unit-test files / 227 tests remain green, desktop and mobile E2E both pass, capture prints its success marker, and the local URL returns HTTP 200.

- [ ] **Step 7: Review scope and commit only owned files**

Run:

```bash
git diff -- scripts/sazo-mobile-home-capture.mjs src/sazo-commerce/sazo.css
git status --short
git add scripts/sazo-mobile-home-capture.mjs src/sazo-commerce/sazo.css
git commit -m "style: match SAZO mobile first fold"
```

Confirm no existing user-modified or untracked file is staged.
