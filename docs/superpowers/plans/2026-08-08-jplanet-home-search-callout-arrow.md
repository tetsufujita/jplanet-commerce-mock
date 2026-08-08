# J-Planet Home Search Callout Arrow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the angular CSS guidance arrow with a smooth dedicated SVG and reproduce the reference callout's heading, search field, button, and two-line hint geometry while preserving J-Planet branding.

**Architecture:** Keep `SearchDiscovery` as the only React owner of this UI. Task 1 adds semantic/decorative SVG structure with focused unit coverage and removes the legacy pseudo-element arrow; Task 2 locks the reference geometry and responsive behavior in Playwright-driven browser QA before tuning the CTA-only CSS. No global typography, routing, search behavior, or unrelated home sections change.

**Tech Stack:** React 19, TypeScript, Lucide React, CSS, i18next, Vitest + Testing Library, Playwright/Chrome through the existing Vite browser audit.

## Global Constraints

- Preserve the established J-Planet navy, ink, sakura, line, surface, muted, and shadow tokens.
- Keep the callout width at `640px` on desktop.
- Use one decorative inline SVG with `fill="none"`, round caps, round joins, and approximately `3px` desktop stroke width.
- Keep the SVG and submit icon `aria-hidden="true"`; the button's only accessible name remains `検索`.
- Hide the guidance SVG at the existing mobile breakpoint and prevent page-level horizontal overflow at `390px` and `320px`.
- Do not change global typography, search behavior, navigation, product cards, or sections outside `SearchDiscovery`.
- Preserve every pre-existing user-owned dirty/untracked file; stage only files explicitly owned by the current task.

---

### Task 1: Dedicated Guidance SVG and Submit Icon

**Files:**

- Modify: `src/sazo-commerce/HomeView.tsx:3-12,543-556`
- Modify: `src/sazo-commerce/sazo.css:2967-3040,3775-3806`
- Test: `tests/unit/sazo-commerce-home.test.tsx:139-260`

**Interfaces:**

- Consumes: existing `SearchDiscovery`, `Search`, translation keys `sazo.home.searchTitle`, `searchPlaceholder`, `searchButton`, and `searchHint`.
- Produces: `svg[data-search-guidance-arrow]`, body path `[data-search-guidance-curve]`, arrowhead path `[data-search-guidance-head]`, and `svg[data-search-submit-arrow]` for Task 2 browser geometry checks.

- [ ] **Step 1: Add a failing structural unit test**

Add a focused case inside `describe("SAZO home composition")`:

```tsx
it("uses a dedicated decorative SVG for the search guidance", async () => {
  const { container } = await renderHomePage();
  const callout = container.querySelector(".sazo-search-callout");
  const guidance = callout?.querySelector("svg[data-search-guidance-arrow]");
  const submit = screen.getByRole("button", { name: "検索" });

  expect(guidance).not.toBeNull();
  expect(guidance?.getAttribute("aria-hidden")).toBe("true");
  expect(guidance?.querySelectorAll("path")).toHaveLength(2);
  expect(guidance?.querySelector("[data-search-guidance-curve]")).not.toBeNull();
  expect(guidance?.querySelector("[data-search-guidance-head]")).not.toBeNull();
  expect(submit.querySelector("svg[data-search-submit-arrow]")).not.toBeNull();
  expect(submit.textContent).toBe("検索");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx -t "dedicated decorative SVG"
```

Expected: FAIL because the guidance SVG and button arrow do not exist.

- [ ] **Step 3: Add the minimal React structure**

Add `ArrowRight` to the Lucide import and replace the pseudo-arrow-only structure with explicit decorative nodes:

```tsx
<div className="sazo-large-search" role="search">
  <Search aria-hidden size={24} strokeWidth={2} />
  <span>{t("sazo.home.searchPlaceholder")}</span>
  <button type="button">
    <span>{t("sazo.home.searchButton")}</span>
    <ArrowRight
      aria-hidden
      data-search-submit-arrow
      size={22}
      strokeWidth={2.2}
    />
  </button>
</div>
<svg
  aria-hidden="true"
  className="sazo-search-guidance-arrow"
  data-search-guidance-arrow
  focusable="false"
  viewBox="0 0 140 92"
>
  <path
    d="M132 84 C100 72 82 92 50 87 C17 82 8 61 15 39 C18 29 24 21 31 15"
    data-search-guidance-curve
  />
  <path d="M16 20 L31 15 L33 31" data-search-guidance-head />
</svg>
<p>{t("sazo.home.searchHint")}</p>
```

The body path runs from the hint side toward the magnifier side so `getPointAtLength(totalLength)` yields the tip position for Task 2.

- [ ] **Step 4: Remove the CSS-border arrow and add minimal SVG styling**

Delete the `.sazo-search-callout::before` and `::after` rules. Add:

```css
.sazo-root .sazo-search-guidance-arrow {
  position: absolute;
  z-index: 1;
  top: 143px;
  left: 8px;
  width: 140px;
  height: 92px;
  overflow: visible;
  color: var(--jplanet-ink);
  pointer-events: none;
}

.sazo-root .sazo-search-guidance-arrow path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}

.sazo-root .sazo-large-search button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}
```

At the existing mobile breakpoint replace the pseudo-element hiding rule with:

```css
.sazo-root .sazo-search-guidance-arrow {
  display: none;
}
```

- [ ] **Step 5: Run Task 1 GREEN verification**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx
pnpm typecheck
pnpm exec prettier --check src/sazo-commerce/HomeView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-home.test.tsx
git diff --check
```

Expected: focused home tests, typecheck, formatting, and diff check pass; there is exactly one SVG guidance arrow and one decorative submit arrow.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/sazo-commerce/HomeView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-home.test.tsx
git commit -m "feat: add smooth home search guidance arrow"
```

---

### Task 2: Reference Geometry, Responsive QA, and Final Visual Match

**Files:**

- Modify: `scripts/sazo-commerce-home-browser.mjs:1-520`
- Modify: `src/sazo-commerce/sazo.css:2967-3044,3775-3806`
- Modify: `docs/superpowers/plans/2026-08-08-jplanet-home-search-callout-arrow.md`

**Interfaces:**

- Consumes: Task 1 selectors `svg[data-search-guidance-arrow]`, `[data-search-guidance-curve]`, `[data-search-guidance-head]`, and `svg[data-search-submit-arrow]`.
- Produces: browser-measured desktop/mobile callout geometry, screenshots `/tmp/jplanet-home-search-callout-desktop.png`, `/tmp/jplanet-home-search-callout-mobile.png`, and evidence recorded in this plan.

- [x] **Step 1: Add failing desktop geometry assertions before tuning CSS**

After `address` is validated, create one reusable URL and use it for the existing desktop navigation plus the new mobile pages:

```js
const homeUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;
```

After the home view loads, scroll `.sazo-search-callout` into view and measure it:

```js
const searchCallout = page.locator(".sazo-search-callout");
await searchCallout.scrollIntoViewIfNeeded();
const searchField = searchCallout.locator(".sazo-large-search");
const searchButton = searchField.getByRole("button", { name: "検索" });
const searchIcon = searchField.locator(":scope > svg").first();
const guidance = searchCallout.locator("svg[data-search-guidance-arrow]");
const guidanceCurve = guidance.locator("[data-search-guidance-curve]");
const hint = searchCallout.locator(":scope > p");
const [calloutBounds, fieldBounds, buttonBounds, iconBounds, hintBounds] =
  await Promise.all([
    searchCallout.boundingBox(),
    searchField.boundingBox(),
    searchButton.boundingBox(),
    searchIcon.boundingBox(),
    hint.boundingBox(),
  ]);

assert(calloutBounds && fieldBounds && buttonBounds && iconBounds && hintBounds);
assert(Math.abs(calloutBounds.width - 640) < 2);
assert(Math.abs(fieldBounds.height - 82) < 2);
assert(Math.abs(buttonBounds.height - 64) < 2);
```

Verify exact brand and SVG treatment:

```js
assert.equal(
  await searchButton.evaluate((element) => getComputedStyle(element).backgroundColor),
  "rgb(254, 162, 172)",
);
assert.equal(await guidance.getAttribute("aria-hidden"), "true");
assert.equal(await guidance.locator("path").count(), 2);
assert.equal(
  await guidanceCurve.evaluate((element) => getComputedStyle(element).strokeLinecap),
  "round",
);
assert.equal(
  await guidanceCurve.evaluate((element) => getComputedStyle(element).strokeLinejoin),
  "round",
);
```

Resolve the curve tip in screen coordinates and require it near but not over the magnifier center:

```js
const tip = await guidanceCurve.evaluate((path) => {
  const point = path.getPointAtLength(path.getTotalLength());
  const matrix = path.getScreenCTM();
  const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix ?? undefined);

  return { x: screenPoint.x, y: screenPoint.y };
});
const iconCenter = {
  x: iconBounds.x + iconBounds.width / 2,
  y: iconBounds.y + iconBounds.height / 2,
};
assert(Math.hypot(tip.x - iconCenter.x, tip.y - iconCenter.y) < 30);
assert(Math.hypot(tip.x - iconCenter.x, tip.y - iconCenter.y) > 8);
```

Require the hint to occupy two lines using computed line height:

```js
const hintLineHeight = Number.parseFloat(
  await hint.evaluate((element) => getComputedStyle(element).lineHeight),
);
assert.equal(Math.round(hintBounds.height / hintLineHeight), 2);
assert.equal(await searchButton.locator("svg[data-search-submit-arrow]").count(), 1);
```

- [x] **Step 2: Run the desktop audit and verify RED**

Run:

```bash
pnpm test:sazo-home-browser
```

Expected: FAIL on the pre-tuning field height (`78px`), button height (`60px`), navy button, one-line hint, or arrow tip geometry. Record the first correct mismatch before changing production CSS.

- [x] **Step 3: Tune only callout CSS to match the reference**

Apply the minimal CTA-scoped values:

```css
.sazo-root .sazo-search-discovery {
  padding-top: 90px;
}

.sazo-root .sazo-search-callout h2 {
  font-size: 34px;
  letter-spacing: -0.02em;
}

.sazo-root .sazo-large-search {
  min-height: 82px;
  margin-top: 29px;
  padding: 8px 9px 8px 26px;
}

.sazo-root .sazo-large-search button {
  min-width: 132px;
  min-height: 64px;
  background: var(--jplanet-sakura);
  color: var(--jplanet-deep-navy);
}

.sazo-root .sazo-search-callout > p {
  width: 236px;
  margin: 18px 0 0 126px;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
}
```

Adjust only `.sazo-search-guidance-arrow` `top`, `left`, `width`, or `height` if the real browser tip-distance assertion proves the initial values are outside `8–30px`. Do not change the path to satisfy a screenshot by trial without preserving a smooth curve and round treatment.

- [x] **Step 4: Add mobile containment assertions**

Audit separate `390×844` and `320×844` pages:

```js
for (const viewport of [
  { height: 844, width: 390 },
  { height: 844, width: 320 },
]) {
  const mobile = await browser.newPage({ viewport });
  await mobile.goto(homeUrl);
  await mobile.locator("[data-home-view]").waitFor();
  const mobileCallout = mobile.locator(".sazo-search-callout");
  await mobileCallout.scrollIntoViewIfNeeded();

  assert.equal(
    await mobileCallout.locator("svg[data-search-guidance-arrow]").isVisible(),
    false,
  );
  assert.equal(
    await mobile.evaluate(() => document.documentElement.scrollWidth),
    viewport.width,
  );
  const mobileButtonBounds = await mobileCallout
    .getByRole("button", { name: "検索" })
    .boundingBox();
  assert(mobileButtonBounds && mobileButtonBounds.height >= 44);
  if (viewport.width === 390) {
    await mobileCallout.screenshot({
      path: "/tmp/jplanet-home-search-callout-mobile.png",
    });
  }
  await mobile.close();
}
```

Keep the existing mobile stacked button layout; do not introduce a desktop arrow into the compact CTA.

- [x] **Step 5: Capture locator screenshots and verify GREEN**

Capture the exact callout at desktop and mobile after fonts settle:

```js
await searchCallout.screenshot({
  path: "/tmp/jplanet-home-search-callout-desktop.png",
});
```

The `390px` loop in Step 4 captures the mobile screenshot before its page closes.

Run:

```bash
pnpm test:sazo-home-browser
```

Expected: PASS; desktop field is approximately `82px`, button `64px`, hint two lines, SVG tip `8–30px` from the icon, and both mobile widths have no page overflow.

Open both generated screenshots and compare the desktop callout directly against:

- `/var/folders/f9/g75lkj552h7dv5fxlp1ztx040000gn/T/TemporaryItems/NSIRD_screencaptureui_cBIaTq/スクリーンショット 2026-08-08 18.17.13.png`
- `/var/folders/f9/g75lkj552h7dv5fxlp1ztx040000gn/T/TemporaryItems/NSIRD_screencaptureui_N241EJ/スクリーンショット 2026-08-08 18.17.21.png`

- [x] **Step 6: Run full verification**

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm build
pnpm exec prettier --check src/sazo-commerce/HomeView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-home.test.tsx scripts/sazo-commerce-home-browser.mjs docs/superpowers/plans/2026-08-08-jplanet-home-search-callout-arrow.md
node --check scripts/sazo-commerce-home-browser.mjs
git diff --check
curl -sS -o /dev/null -w '%{http_code}\n' 'http://127.0.0.1:5190/sazo-commerce-mock/'
```

Expected: zero lint, type, test, build, formatting, syntax, or diff failures; live route returns HTTP `200`.

- [x] **Step 7: Record measured evidence and commit Task 2**

Append the RED mismatch, final desktop/mobile measurements, screenshot dimensions, exact test totals, and HTTP result to this plan. Then commit only:

```bash
git add scripts/sazo-commerce-home-browser.mjs src/sazo-commerce/sazo.css docs/superpowers/plans/2026-08-08-jplanet-home-search-callout-arrow.md
git commit -m "fix: match home search callout reference"
```

#### Task 2 measured evidence — 2026-08-08

- RED: before production CSS tuning, `pnpm test:sazo-home-browser` exited `1` at `search field height=78`; the required height was `82px`.
- Intermediate geometry RED: after applying the scoped reference values, the unadjusted arrow tip was `5.0625px` from the magnifier center, below the required `>8px` clearance. Browser-measured placement selected `left: -9px` without changing the SVG path.
- GREEN desktop (`1511×828` viewport): callout `640×255.4375px`; field `82px`; button `64px`; hint `43.5px / 21.75px = 2` lines; magnifier center `(474.5, 439.140625)`; curve endpoint `(457.5, 444.203125)`; endpoint distance `17.737781886414094px`; sakura button `rgb(254, 162, 172)`; round curve caps and joins; one submit SVG.
- GREEN responsive: at `390×844`, callout `354×280.0625px`, button `50px`, document scroll width `390px`; at `320×844`, callout `284×358.125px`, button `50px`, document scroll width `320px`. The guidance SVG was hidden at both widths.
- Screenshots inspected against both supplied references: `/tmp/jplanet-home-search-callout-desktop.png` is `641×256px`; `/tmp/jplanet-home-search-callout-mobile.png` is `354×281px`. The desktop preserves the two-line heading, pill proportions, sakura CTA, smooth round curve terminating below-left of the magnifier, and two-line centered hint; mobile preserves the stacked CTA with no guidance arrow or horizontal overflow.
- Task 2 browser-audit synchronization at that commit: the service-step probe in the same script was stale against the current ServiceView (`h1`, `1010×436px`, implicit viewport position). It targeted the rendered `h2`, measured the current `1156×500px` panel, and explicitly established the asserted `268px` viewport position before measuring; the final fix evidence below replaces that arranged position probe.
- Verification: `pnpm test:sazo-home-browser` passed (`sazo-home-browser-ok`); ESLint passed with `0` errors; TypeScript passed with `0` errors; Vitest passed `14/14` files and `176/176` tests; Vite built `2224` modules; Prettier, Node syntax, and `git diff --check` passed; live route returned HTTP `200`.

#### Final fix wave measured evidence — 2026-08-08

- [x] I1 exact i18n-backed hint break: focused unit RED received `欲しい商品の「名前」か「URL」をここに入力！` instead of `欲しい商品の「名前」か\n「URL」をここに入力！`; browser RED received one `innerText` line instead of the approved two. All three mock locales now carry the same explicit newline, CTA-scoped `white-space: pre-line` renders the approved desktop lines, and removing the newline still yields the unchanged logical wording. The 390px and 320px hints remain two lines with `236px` scroll width, contained by their callouts.
- [x] I2 load-bearing arrow guard: the existing SVG passed the stronger regression coverage without production SVG changes. The endpoint is lower-left of the magnifier at `17.737781886414094px`; normalized final tangent is `(0.7479967799881755, -0.6637023558247486)` with `0.9063105262600405` cosine toward the icon; curve/head tip error is `0.003116208573869537px`; arm trail cosines are `-0.9194931654529195` and `-0.5657995823282248`. Screen path bounds are `left 439.28195667266846 / top 444.203125 / right 558.5 / bottom 517.0226745605469` inside callout `x 435.5 / y 286.203125 / width 640 / height 255.4375` with a `1.5px` stroke radius, `2px` tolerance, and visible SVG overflow.
- [x] I3 natural ServiceView probe: removed target prepositioning. The audit establishes `scrollY=700`, clicks Service, waits for the natural view reset to `scrollY=0` and `data-view=service`, then measures the unarranged first-step document/viewport top at `3544.5px`; its current `h2` and `1156×500px` geometry remain asserted.
- [x] Screenshots regenerated and inspected at original detail against both supplied references: desktop `641×256px` now renders exactly `欲しい商品の「名前」か` / `「URL」をここに入力！`; mobile `354×281px` keeps the approved copy readable with no arrow or overflow.
- [x] Final fix verification ready for commit: focused hint test `1/1`, full home file `21/21`, browser audit `sazo-home-browser-ok`, ESLint and TypeScript `0` errors, full Vitest `14/14` files and `177/177` tests, Vite build `2224` modules, Prettier/Node syntax/diff checks clean, live HTTP `200`, and screenshots `641×256px` desktop / `354×281px` mobile.
