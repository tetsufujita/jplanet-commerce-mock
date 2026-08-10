# Responsive Bottom Navigation Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the fixed five-item J-Planet bottom navigation and overlapping chat control at the current 822px in-app browser width while preserving the existing phone and desktop layouts.

**Architecture:** Reuse the already-rendered `SazoShell` mobile navigation and expose only that navigation from the mobile shell between 768px and 899px. Keep the existing full mobile layout at 767px and below, and extend the deterministic Playwright capture script to lock the 822px, 440px, 341px, and 900px+ contracts.

**Tech Stack:** React 19, CSS media queries, Vite, Playwright, Node assertions, Vitest, TypeScript.

## Global Constraints

- Bottom items remain `ホーム / 通知 / エージェント / お気に入り / マイページ`.
- The center item remains `エージェント`; do not revert it to `検索`.
- The fixed navigation is visible through `899px` and visually absent at `900px` and wider.
- At `768px–899px`, do not duplicate the mobile header, footer, or main content alongside the desktop shell.
- The home chat control overlaps only the upper edge of the navigation and must not cover a navigation icon.
- Existing service, campaign, product, and agent-hub behavior must remain unchanged.
- Do not modify `playwright.config.ts` or unrelated dirty/untracked files.

---

### Task 1: Restore the responsive bottom navigation and lock its geometry

**Files:**
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `scripts/sazo-mobile-home-capture.mjs`

**Interfaces:**
- Consumes: the existing `.sazo-mobile-shell`, `.sazo-mobile-nav`, `.sazo-nav-button`, and `.sazo-chat-button` DOM rendered by `SazoShell`.
- Produces: a visible fixed navigation at viewport widths `341`, `440`, and `822`; no visible navigation at width `900` or wider; screenshots `/tmp/jplanet-bottom-nav-822x956.png` and `/tmp/jplanet-bottom-nav-440x956.png`.

- [ ] **Step 1: Add failing responsive geometry assertions**

In `scripts/sazo-mobile-home-capture.mjs`, add a helper after `assertContrastAtLeast`:

```js
async function inspectBottomNavigation(page, expectedWidth) {
  const navigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  const navigationBox = await navigation.boundingBox();
  const chatBox = await page.getByRole("button", { name: "チャットを開く" }).boundingBox();
  const myPageIconBox = await navigation
    .getByRole("button", { exact: true, name: "マイページ" })
    .locator("svg")
    .boundingBox();
  const position = await navigation.evaluate((element) => getComputedStyle(element).position);

  assert(navigationBox && chatBox && myPageIconBox);
  assert.equal(await navigation.getByRole("button").count(), 5);
  assert.deepEqual(
    await navigation.getByRole("button").allTextContents(),
    ["ホーム", "通知", "エージェント", "お気に入り", "マイページ"],
  );
  assert.equal(position, "fixed");
  assert(Math.abs(navigationBox.width - expectedWidth) < 1);
  assert(Math.abs(navigationBox.height - 76) < 2);
  assert(chatBox.y + chatBox.height <= myPageIconBox.y);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), expectedWidth);

  return { chatBox, navigationBox };
}
```

After the existing 440px home assertions, call:

```js
const mobileBottomNavigation = await inspectBottomNavigation(page, 440);
await page.screenshot({
  animations: "disabled",
  caret: "hide",
  path: "/tmp/jplanet-bottom-nav-440x956.png",
});
```

Before the 341px page is created, add an 822px page:

```js
const tabletPage = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { height: 956, width: 822 },
});

await tabletPage.goto(url, { waitUntil: "networkidle" });
await tabletPage.locator("[data-home-view]").waitFor();
const tabletBottomNavigation = await inspectBottomNavigation(tabletPage, 822);
assert.equal(await tabletPage.locator(".sazo-mobile-header").count(), 0);
assert.equal(await tabletPage.locator(".sazo-mobile-shell > .sazo-footer").count(), 1);
assert.equal(
  await tabletPage.locator(".sazo-mobile-shell > .sazo-footer").evaluate(
    (element) => getComputedStyle(element).display,
  ),
  "none",
);
await tabletPage.screenshot({
  animations: "disabled",
  caret: "hide",
  path: "/tmp/jplanet-bottom-nav-822x956.png",
});
await tabletPage.close();
```

At the existing desktop page, add:

```js
assert.equal(await desktopPage.locator(".sazo-mobile-nav").boundingBox(), null);
```

Add an exact 900px boundary check before creating the existing desktop page:

```js
const desktopBoundaryPage = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { height: 956, width: 900 },
});
await desktopBoundaryPage.goto(url, { waitUntil: "networkidle" });
await desktopBoundaryPage.locator("[data-home-view]").waitFor();
assert.equal(await desktopBoundaryPage.locator(".sazo-mobile-nav").boundingBox(), null);
await desktopBoundaryPage.close();
```

- [ ] **Step 2: Run the capture test and verify RED**

Run:

```bash
node scripts/sazo-mobile-home-capture.mjs
```

Expected: FAIL at the 440px chat assertion because the home chat is hidden, or at the 822px navigation assertion because the mobile shell is `display: none`.

- [ ] **Step 3: Add the minimal responsive CSS**

At the end of `src/sazo-commerce/sazo.css`, add a tablet-only block that exposes only the navigation from the mobile shell:

```css
@media (min-width: 768px) and (max-width: 899px) {
  .sazo-root .sazo-mobile-shell {
    display: contents;
  }

  .sazo-root .sazo-mobile-header,
  .sazo-root .sazo-mobile-shell > .sazo-main,
  .sazo-root .sazo-mobile-shell > .sazo-footer {
    display: none;
  }

  .sazo-root .sazo-mobile-nav {
    position: fixed;
    z-index: 20;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    min-height: 76px;
    padding: 5px max(8px, env(safe-area-inset-right))
      max(5px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
    border: 0;
    border-radius: 20px 20px 0 0;
    background: var(--jplanet-surface);
    box-shadow: 0 -5px 21px color-mix(in srgb, var(--jplanet-navy) 11%, transparent);
  }

  .sazo-root .sazo-mobile-nav .sazo-nav-button {
    width: 100%;
    min-width: 0;
    min-height: 64px;
    gap: 3px;
    padding: 5px 4px;
    color: var(--jplanet-muted);
    font-size: 10px;
  }

  .sazo-root .sazo-mobile-nav .sazo-nav-button svg {
    width: 27px;
    height: 27px;
    stroke-width: 2;
  }

  .sazo-root .sazo-mobile-nav .sazo-nav-button[aria-pressed="true"] {
    color: var(--jplanet-sakura);
  }

  .sazo-root .sazo-content-main {
    padding-bottom: 88px;
  }

  .sazo-root .sazo-chat-button {
    right: 18px;
    bottom: calc(70px + env(safe-area-inset-bottom));
  }

  .sazo-root[data-view="service"] .sazo-mobile-nav,
  .sazo-root[data-view="campaign"] .sazo-mobile-nav,
  .sazo-root[data-view="product"] .sazo-mobile-nav {
    display: none;
  }
}
```

In the final `@media (max-width: 767px)` mobile-home block, override the existing home chat suppression after the navigation rules:

```css
.sazo-root[data-view="home"] .sazo-chat-button {
  right: 14px;
  bottom: calc(70px + env(safe-area-inset-bottom));
  display: inline-flex;
  width: 48px;
  height: 48px;
}
```

- [ ] **Step 4: Run the focused capture gate and verify GREEN**

Run:

```bash
node scripts/sazo-mobile-home-capture.mjs
```

Expected: PASS with `sazo-mobile-home-capture-ok`; the 822px and 440px screenshots exist; the 900px+ navigation bounding box is `null`.

- [ ] **Step 5: Inspect both new screenshots**

Open:

- `/tmp/jplanet-bottom-nav-822x956.png`
- `/tmp/jplanet-bottom-nav-440x956.png`

Reject the change if the navigation is missing, a label differs, the chat control covers the My Page icon, content is hidden behind the navigation, or the desktop header is duplicated.

- [ ] **Step 6: Run all verification gates**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --reporter=dot
pnpm build
pnpm test:e2e:sazo
node scripts/sazo-mobile-home-capture.mjs
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5190/sazo-commerce-mock/
git diff --check
```

Expected: lint/typecheck/build exit `0`; all 227 unit tests pass; desktop/mobile E2E pass; capture prints `sazo-mobile-home-capture-ok`; HTTP is `200`; diff check is clean.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/sazo-commerce/sazo.css scripts/sazo-mobile-home-capture.mjs
git commit -m "fix: restore responsive bottom navigation"
```
