# SAZO Service Typography and URL Form Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Arial-first Japanese rendering on the SAZO service page with deterministic Noto Sans JP typography and polish the URL-entry control without changing its recording-matched outer geometry.

**Architecture:** Keep the existing `ServiceView` markup and state model intact. Add a repository-local Fontsource variable-font bundle, scope it to `.sazo-service-view`, refine the form entirely in the existing namespaced stylesheet, and extend the current browser QA scripts with computed-style, geometry, focus, narrow-width, screenshot, and recording checks.

**Tech Stack:** React 19, TypeScript 5 strict, Vite 6, CSS, Noto Sans JP Variable from Fontsource 5.3.0, Vitest 4, Playwright 1.60, FFmpeg.

## Global Constraints

- Work only in `/Users/fujitatetsu/Desktop/Andes-Website-sazo-mock` on `feat/sazo-commerce-mock`; preserve and do not revert unrelated dirty changes.
- Apply the new font only below `.sazo-service-view`; do not change typography on other commerce views.
- Self-host WOFF2 files. Do not load Google Fonts, Fontsource CDN, or any other runtime font URL.
- Preserve the desktop URL-entry box at 100 px outer height, two-pixel pink border, pill radius, 200 px action area, and existing hero overlap.
- Use the current SAZO pink CSS variable; do not introduce a second brand-pink hex value.
- Preserve local-mock behavior: no external search request, navigation, personal-data persistence, or new form submission behavior.
- Preserve the explicit URL label, keyboard focus, mobile single-row layout, and `prefers-reduced-motion` behavior.
- At 1726×1264, the form’s outer width and height may differ from the supplied recording checkpoint by no more than 2 px.
- At 320 px width, the service URL control must remain inside the viewport with no horizontal overflow.
- Run scoped tests before full verification. Report unrelated pre-existing failures without weakening the new assertions.

## File Structure

- Create `public/sazo-commerce/fonts/noto-sans-jp/wght.css`: Fontsource variable-font declarations loaded locally at runtime.
- Create `public/sazo-commerce/fonts/noto-sans-jp/files/*.woff2`: the 124 unicode-range WOFF2 files from `@fontsource-variable/noto-sans-jp@5.3.0`.
- Create `public/sazo-commerce/fonts/noto-sans-jp/LICENSE.txt`: the bundled font license.
- Create `tests/unit/sazo-service-typography.test.ts`: guards local font assets and service-only font scoping.
- Modify `package.json` and `pnpm-lock.yaml`: pin Fontsource 5.3.0 as the reproducible asset source and expose the service QA command.
- Modify `src/sazo-commerce/sazo.css`: import the local declarations, scope Noto Sans JP, and refine URL-entry states.
- Modify `scripts/sazo-commerce-views-browser.mjs`: assert computed typography, geometry, focus treatment, and 320 px containment.
- Modify `scripts/sazo-service-video-check.mjs`: wait for the font, capture the refined hero checkpoint, and preserve the full-page recording loop.

---

### Task 1: Add deterministic Noto Sans JP assets and service-page scoping

**Files:**
- Create: `public/sazo-commerce/fonts/noto-sans-jp/wght.css`
- Create: `public/sazo-commerce/fonts/noto-sans-jp/files/*.woff2`
- Create: `public/sazo-commerce/fonts/noto-sans-jp/LICENSE.txt`
- Create: `tests/unit/sazo-service-typography.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/sazo-commerce/sazo.css:1-20,2991-2995`

**Interfaces:**
- Consumes: `@fontsource-variable/noto-sans-jp@5.3.0` as the pinned build-time source.
- Produces: the CSS family name `"Noto Sans JP Variable"` for weights 100–900, loaded from `/sazo-commerce/fonts/noto-sans-jp/wght.css` and scoped to `.sazo-service-view`.

- [ ] **Step 1: Write the failing font-asset contract test**

Create `tests/unit/sazo-service-typography.test.ts`:

```ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const fontRoot = join(
  process.cwd(),
  "public/sazo-commerce/fonts/noto-sans-jp",
);
const serviceCss = readFileSync(
  join(process.cwd(), "src/sazo-commerce/sazo.css"),
  "utf8",
);

describe("SAZO service typography assets", () => {
  it("vendors the complete Fontsource Noto Sans JP variable bundle", () => {
    const fontCss = readFileSync(join(fontRoot, "wght.css"), "utf8");
    const fontFiles = readdirSync(join(fontRoot, "files")).filter((file) =>
      file.endsWith(".woff2"),
    );

    expect(fontCss).toContain("font-family: 'Noto Sans JP Variable'");
    expect(fontCss).toContain("font-weight: 100 900");
    expect(fontCss).toContain("font-display: swap");
    expect(fontFiles).toHaveLength(124);
    expect(readFileSync(join(fontRoot, "LICENSE.txt"), "utf8")).toContain(
      "SIL OPEN FONT LICENSE",
    );
  });

  it("loads Noto only for the service page", () => {
    expect(serviceCss).toContain(
      '@import url("/sazo-commerce/fonts/noto-sans-jp/wght.css");',
    );
    expect(serviceCss).toMatch(
      /\.sazo-root \.sazo-service-view\s*{[^}]*font-family:\s*"Noto Sans JP Variable"/s,
    );
    expect(serviceCss).not.toMatch(
      /\.sazo-root\s*{[^}]*font-family:\s*"Noto Sans JP Variable"/s,
    );
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-service-typography.test.ts
```

Expected: FAIL with `ENOENT` for `public/sazo-commerce/fonts/noto-sans-jp/wght.css`.

- [ ] **Step 3: Pin Fontsource and copy its local assets**

Run:

```bash
pnpm add -D @fontsource-variable/noto-sans-jp@5.3.0
mkdir -p public/sazo-commerce/fonts/noto-sans-jp/files
cp node_modules/@fontsource-variable/noto-sans-jp/wght.css public/sazo-commerce/fonts/noto-sans-jp/wght.css
cp node_modules/@fontsource-variable/noto-sans-jp/files/*.woff2 public/sazo-commerce/fonts/noto-sans-jp/files/
cp node_modules/@fontsource-variable/noto-sans-jp/LICENSE public/sazo-commerce/fonts/noto-sans-jp/LICENSE.txt
```

Expected: `package.json` and `pnpm-lock.yaml` pin version 5.3.0, and exactly 124 WOFF2 files exist in the public font directory.

- [ ] **Step 4: Import and scope the font**

Insert this as the first line of `src/sazo-commerce/sazo.css`:

```css
@import url("/sazo-commerce/fonts/noto-sans-jp/wght.css");
```

Extend the existing service-view rule without changing the root `.sazo-root` family:

```css
.sazo-root .sazo-service-view {
  --sazo-lp-pink: #eb3658;
  overflow: hidden;
  background: #fff;
  font-family: "Noto Sans JP Variable", "Hiragino Sans", "Yu Gothic", Meiryo,
    sans-serif;
}
```

- [ ] **Step 5: Run the focused test to verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-service-typography.test.ts
```

Expected: 2 tests PASS.

- [ ] **Step 6: Commit only the font contract and local assets**

Inspect the staged paths before committing because the worktree is already dirty:

```bash
git add package.json pnpm-lock.yaml tests/unit/sazo-service-typography.test.ts public/sazo-commerce/fonts/noto-sans-jp src/sazo-commerce/sazo.css
git diff --cached --stat
git commit -m "fix: use local Noto Sans JP on SAZO service page"
```

Expected: no file outside the listed paths is staged.

---

### Task 2: Refine the URL-entry control without changing its geometry

**Files:**
- Modify: `scripts/sazo-commerce-views-browser.mjs:76-81,164-165`
- Modify: `src/sazo-commerce/sazo.css:3121-3182,4016-4020,4370-4394`

**Interfaces:**
- Consumes: `"Noto Sans JP Variable"` from Task 1 and the existing `.sazo-service-url-search` / `.sazo-service-url-entry` markup.
- Produces: a two-layer `:focus-within` ring/shadow, Noto-weighted prompt/input/action text, deterministic hover/pressed/disabled states, and a 320 px-contained mobile pill.

- [ ] **Step 1: Add failing desktop form assertions**

In `scripts/sazo-commerce-views-browser.mjs`, immediately after the service page reaches the 1726×1264 viewport, insert:

```js
  await desktopPage.waitForFunction(() =>
    document.fonts.check('700 24px "Noto Sans JP Variable"', "韓国商品"),
  );
  const serviceEntry = desktopPage.locator(".sazo-service-url-entry").first();
  const serviceInput = serviceEntry.locator("input");
  const serviceButton = serviceEntry.locator("button");
  const serviceButtonIcon = serviceButton.locator("svg");
  const entryBounds = await serviceEntry.boundingBox();
  assert(entryBounds !== null);
  assert.ok(Math.abs(entryBounds.height - 100) <= 2);
  assert.ok(Math.abs(entryBounds.width - 1154) <= 2);
  const serviceButtonIconBounds = await serviceButtonIcon.boundingBox();
  assert(serviceButtonIconBounds !== null);
  assert.ok(Math.abs(serviceButtonIconBounds.width - 30) <= 1);
  assert.ok(Math.abs(serviceButtonIconBounds.height - 30) <= 1);
  assert.match(
    await serviceInput.evaluate((element) => getComputedStyle(element).fontFamily),
    /^"?Noto Sans JP Variable"?/,
  );
  await serviceInput.focus();
  assert.match(
    await serviceEntry.evaluate((element) => getComputedStyle(element).boxShadow),
    /0px 0px 0px 4px/,
  );
  const restingButtonColor = await serviceButton.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await serviceButton.hover();
  assert.notEqual(
    await serviceButton.evaluate((element) => getComputedStyle(element).backgroundColor),
    restingButtonColor,
  );
```

- [ ] **Step 2: Add the 320 px containment assertion**

After the mobile service view is visible, resize and assert the form bounds:

```js
  await mobilePage.setViewportSize({ height: 844, width: 320 });
  const mobileServiceEntry = mobilePage.locator(".sazo-service-url-entry").first();
  const mobileEntryBounds = await mobileServiceEntry.boundingBox();
  assert(mobileEntryBounds !== null);
  assert.ok(mobileEntryBounds.left >= 0);
  assert.ok(mobileEntryBounds.x + mobileEntryBounds.width <= 320);
  assert.equal(
    await mobilePage.locator('[data-view-content="service"]').evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
    true,
  );
```

- [ ] **Step 3: Run the browser check to verify RED**

Run:

```bash
node scripts/sazo-commerce-views-browser.mjs
```

Expected: FAIL at the `0px 0px 0px 4px` focus-ring assertion because the current field exposes only its resting shadow.

- [ ] **Step 4: Implement the visual refinement**

Add service-level color/state tokens beside `--sazo-lp-pink`:

```css
  --sazo-lp-pink-hover: color-mix(in srgb, var(--sazo-lp-pink) 88%, black);
  --sazo-lp-form-shadow: 0 12px 28px
    color-mix(in srgb, var(--sazo-lp-pink) 12%, transparent);
  --sazo-lp-form-ring: 0 0 0 4px
    color-mix(in srgb, var(--sazo-lp-pink) 14%, transparent);
```

Replace only the typography and state declarations in the existing URL rules, preserving the position, width, height, border, radius, and action width:

```css
.sazo-root .sazo-service-url-search > p {
  letter-spacing: -0.02em;
  line-height: 1.45;
  font-weight: 700;
}

.sazo-root .sazo-service-url-entry {
  box-shadow: var(--sazo-lp-form-shadow);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.sazo-root .sazo-service-url-entry:focus-within {
  box-shadow: var(--sazo-lp-form-ring), var(--sazo-lp-form-shadow);
}

.sazo-root .sazo-service-url-entry input {
  color: #667080;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.35;
}

.sazo-root .sazo-service-url-entry input::placeholder {
  color: #667080;
  opacity: 0.72;
}

.sazo-root .sazo-service-url-entry input:focus-visible {
  outline: 0;
}

.sazo-root .sazo-service-url-entry button {
  gap: 12px;
  font-size: 25px;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1;
  transition:
    background-color 160ms ease,
    transform 100ms ease,
    opacity 160ms ease;
}

.sazo-root .sazo-service-url-entry button:hover {
  background: var(--sazo-lp-pink-hover);
}

.sazo-root .sazo-service-url-entry button:active {
  transform: translateY(1px);
}

.sazo-root .sazo-service-url-entry button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
```

Also remove `.sazo-root .sazo-service-view input:focus-visible` from the shared
focus-outline selector at lines 4016–4020, leaving the service button selector in
that group. The URL input is represented by the parent `:focus-within` ring and
must not receive a second outline.

Keep the existing mobile dimensions and add only explicit alignment:

```css
@media (max-width: 767px) {
  .sazo-root .sazo-service-url-search > p {
    letter-spacing: -0.015em;
    line-height: 1.4;
  }

  .sazo-root .sazo-service-url-entry input {
    line-height: 1.3;
  }

  .sazo-root .sazo-service-url-entry button {
    gap: 0;
  }
}
```

- [ ] **Step 5: Run browser and unit checks to verify GREEN**

Run:

```bash
node scripts/sazo-commerce-views-browser.mjs
pnpm vitest run tests/unit/sazo-service-typography.test.ts tests/unit/sazo-commerce-views.test.tsx
```

Expected: browser script exits with `sazo-views-browser-ok`; both unit files PASS.

- [ ] **Step 6: Commit the scoped form refinement**

```bash
git add scripts/sazo-commerce-views-browser.mjs src/sazo-commerce/sazo.css
git diff --cached --stat
git commit -m "fix: refine SAZO URL entry typography"
```

Expected: the staged diff contains only service typography/form rules and their browser assertions.

---

### Task 3: Record, compare, and verify the finished service form

**Files:**
- Modify: `package.json`
- Modify: `scripts/sazo-service-video-check.mjs:1-77`

**Interfaces:**
- Consumes: the local font and form states from Tasks 1–2 plus the supplied recording `/var/folders/f9/g75lkj552h7dv5fxlp1ztx040000gn/T/TemporaryItems/NSIRD_screencaptureui_YWbNI8/画面収録 2026-08-07 16.49.55.mov`.
- Produces: `/tmp/sazo-service-form-refined.png`, `/tmp/sazo-service-video-check.webm`, and `/tmp/sazo-service-form-comparison.png` as final QA evidence.

- [ ] **Step 1: Strengthen the recording script before capturing**

After the service view is visible in `scripts/sazo-service-video-check.mjs`, insert:

```js
  await page.waitForFunction(() =>
    document.fonts.check('700 24px "Noto Sans JP Variable"', "韓国商品"),
  );
  const serviceEntry = page.locator(".sazo-service-url-entry").first();
  const serviceBounds = await serviceEntry.boundingBox();
  assert(serviceBounds !== null);
  assert.ok(Math.abs(serviceBounds.height - 100) <= 2);
  assert.ok(Math.abs(serviceBounds.width - 1154) <= 2);
  await page.screenshot({ path: "/tmp/sazo-service-form-refined.png" });
```

Add this package script:

```json
"test:sazo-service-browser": "node scripts/sazo-service-video-check.mjs"
```

- [ ] **Step 2: Run the service recording check**

Run:

```bash
pnpm test:sazo-service-browser
```

Expected: output ends with `sazo-service-video-ok /tmp/sazo-service-video-check.webm`; both PNG and WEBM files exist and no page response is 400 or higher.

- [ ] **Step 3: Extract the target frame and build a side-by-side comparison**

Run:

```bash
ffmpeg -y -ss 1 -i '/var/folders/f9/g75lkj552h7dv5fxlp1ztx040000gn/T/TemporaryItems/NSIRD_screencaptureui_YWbNI8/画面収録 2026-08-07 16.49.55.mov' -frames:v 1 -update 1 /tmp/sazo-target-form.png
ffmpeg -y -i /tmp/sazo-target-form.png -i /tmp/sazo-service-form-refined.png -filter_complex '[0:v]scale=1726:1264[target];[1:v]scale=1726:1264[actual];[target][actual]hstack=inputs=2' -frames:v 1 -update 1 /tmp/sazo-service-form-comparison.png
```

Inspect `/tmp/sazo-service-form-comparison.png` at original resolution. The following conditions must all hold:

- URL-entry width and height differ by no more than 2 px.
- Prompt bubble remains attached to the same hero overlap point.
- Placeholder, search icon, and search label share one optical vertical axis.
- Japanese glyphs use Noto Sans JP and no control resolves to Arial.
- Resting shadow is visibly tighter than the previous 20×35 px shadow and the keyboard focus ring does not move layout.

If the text baseline differs by more than 2 px, change only `line-height` in increments of `0.05` and rerun Steps 2–3. If the shadow extends more than 28 px below the field, reduce the shadow blur by 2 px; if the focus ring is not distinct, raise only the ring mix percentage by two percentage points. Do not change the 100 px height, two-pixel border, 200 px action width, or hero offsets during this loop.

- [ ] **Step 4: Run scoped and project verification**

Run:

```bash
pnpm vitest run tests/unit/sazo-service-typography.test.ts tests/unit/sazo-commerce-views.test.tsx
pnpm test:sazo-views-browser
pnpm test:sazo-service-browser
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected for the new scope: both scoped unit files, both browser scripts, lint, and build PASS. If full typecheck or full test still reports the already-observed unrelated dirty-worktree failures, record the exact test names and confirm that none reference the font assets, service form selectors, or modified QA assertions.

- [ ] **Step 5: Commit the recording QA contract**

```bash
git add package.json scripts/sazo-service-video-check.mjs
git diff --cached --stat
git commit -m "test: verify SAZO service typography recording"
```

Expected: no temporary PNG or WEBM files are staged.

- [ ] **Step 6: Final handoff**

Report:

- the computed service font family and loaded weights;
- desktop and 320 px form dimensions;
- the scoped test, browser, typecheck, full-test, and build results;
- clickable paths for the modified source/test files;
- the absolute QA artifact paths under `/tmp`;
- any remaining difference attributable to recording compression or platform text rasterization.
