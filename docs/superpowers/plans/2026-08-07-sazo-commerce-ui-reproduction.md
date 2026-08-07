# SAZO Commerce UI Recording Reproduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local React mock at `/sazo-commerce-mock` that reproduces every screen and interaction state visible in the supplied desktop and mobile SAZO recordings, then validate it through automated recordings and frame comparisons.

**Architecture:** Add a namespaced `src/sazo-commerce/` feature with a pure reducer, typed fixtures, responsive view components, and feature-local CSS. A route entry in `src/App.tsx` loads the feature without changing existing Andes pages. Playwright drives deterministic desktop and mobile scenarios; Node/FFmpeg scripts extract reference checkpoints, record the mock, and generate pixel-difference artifacts.

**Tech Stack:** React 19, TypeScript 5 strict, Vite 6, React Router 7, Motion 12, Lucide React, Vitest 4, Playwright 1.60, Pixelmatch 7, PNGJS 7, FFmpeg.

## Global Constraints

- Work only in an isolated worktree created from `Andes-Website` branch `feat/shopify-jp-reproduction`; do not modify or stage the original worktree's unrelated changes.
- The supplied recordings are the visual and behavioral source of truth: desktop 3022×1656 and mobile 682×1470.
- Retain SAZO branding and Japanese copy for this first reproduction pass.
- Reproduce only flows visible in the recordings; no live search, payment, checkout, delivery, OAuth, or personal-data persistence.
- All data and assets load locally; the mock must make no network calls after the initial document request.
- All styles are scoped below `.sazo-root`; do not leak tokens or resets into existing pages.
- New components use named exports and `@/*` imports. TypeScript `any`, `console.log`, and unhandled promises are prohibited.
- Display labels live in `src/i18n/locales/*.json`; captured products/reviews/brands live in typed fixtures.
- Motion must match observed behavior and honor `prefers-reduced-motion`.
- Every production behavior begins with a failing test and completes with a green test before commit.

---

### Task 1: Create the isolated feature worktree and reference ledger

**Files:**
- Create: `design/reproductions/sazo-commerce/reference-manifest.json`
- Create: `scripts/sazo-extract-reference.mjs`
- Modify: `.gitignore`
- Modify: `package.json`
- Test: `tests/unit/sazo-reference-manifest.test.ts`

**Interfaces:**
- Consumes: the two source recordings at the absolute paths approved in the design spec.
- Produces: `reference-manifest.json` with `desktop` and `mobile` source metadata and named checkpoints; `pnpm sazo:reference` extracts PNG frames to the ignored `design/reproductions/sazo-commerce/qa/reference/` directory.

- [ ] **Step 1: Create the isolated worktree**

Run from `/Users/fujitatetsu/Desktop/Andes-Website` after invoking `superpowers:using-git-worktrees`:

```bash
git worktree add /Users/fujitatetsu/Desktop/Andes-Website-sazo-mock -b feat/sazo-commerce-mock
```

Expected: a clean worktree on `feat/sazo-commerce-mock` with the approved design and this plan present.

- [ ] **Step 2: Write the failing manifest test**

Create `tests/unit/sazo-reference-manifest.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Recording = {
  source: string;
  viewport: { width: number; height: number };
  durationSeconds: number;
  checkpoints: { name: string; second: number }[];
};

const manifest = JSON.parse(
  readFileSync("design/reproductions/sazo-commerce/reference-manifest.json", "utf8"),
) as { desktop: Recording; mobile: Recording };

describe("SAZO recording manifest", () => {
  it("pins both approved recordings and viewport sizes", () => {
    expect(manifest.desktop.viewport).toEqual({ width: 3022, height: 1656 });
    expect(manifest.mobile.viewport).toEqual({ width: 682, height: 1470 });
    expect(manifest.desktop.durationSeconds).toBeCloseTo(448.23, 2);
    expect(manifest.mobile.durationSeconds).toBeCloseTo(211.957, 2);
  });

  it("defines an ordered, unique checkpoint sequence", () => {
    for (const recording of [manifest.desktop, manifest.mobile]) {
      const names = recording.checkpoints.map(({ name }) => name);
      const seconds = recording.checkpoints.map(({ second }) => second);
      expect(new Set(names).size).toBe(names.length);
      expect(seconds).toEqual([...seconds].sort((a, b) => a - b));
      expect(seconds.at(-1)).toBeLessThan(recording.durationSeconds);
    }
  });
});
```

- [ ] **Step 3: Run the test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-reference-manifest.test.ts`

Expected: FAIL because `reference-manifest.json` does not exist.

- [ ] **Step 4: Add the manifest and extraction command**

Create the JSON with these checkpoint contracts:

```json
{
  "desktop": {
    "source": "/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.24.01.mov",
    "viewport": { "width": 3022, "height": 1656 },
    "durationSeconds": 448.23,
    "checkpoints": [
      { "name": "home-hero", "second": 0 },
      { "name": "home-sections", "second": 36 },
      { "name": "chat-open", "second": 72 },
      { "name": "reviews", "second": 120 },
      { "name": "gram", "second": 168 },
      { "name": "ranking", "second": 240 },
      { "name": "service", "second": 312 },
      { "name": "brands", "second": 384 },
      { "name": "login-modal", "second": 438 }
    ]
  },
  "mobile": {
    "source": "/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.31.56.mov",
    "viewport": { "width": 682, "height": 1470 },
    "durationSeconds": 211.957,
    "checkpoints": [
      { "name": "home-hero", "second": 0 },
      { "name": "home-community", "second": 24 },
      { "name": "ranking", "second": 48 },
      { "name": "service", "second": 72 },
      { "name": "brands", "second": 96 },
      { "name": "categories", "second": 112 },
      { "name": "catalog-list", "second": 128 },
      { "name": "catalog-grid", "second": 144 },
      { "name": "login", "second": 160 },
      { "name": "registration", "second": 176 },
      { "name": "mypage", "second": 192 },
      { "name": "profile", "second": 208 }
    ]
  }
}
```

Implement `scripts/sazo-extract-reference.mjs` with `spawnSync("ffmpeg", ["-ss", String(second), "-i", source, "-frames:v", "1", output])`, fail on a missing source or nonzero FFmpeg exit, and create `qa/reference/<viewport>/<name>.png`.

Add `"sazo:reference": "node scripts/sazo-extract-reference.mjs"` to `package.json` and ignore only `design/reproductions/sazo-commerce/qa/` in `.gitignore`.

- [ ] **Step 5: Verify GREEN and extract reference frames**

Run:

```bash
pnpm vitest run tests/unit/sazo-reference-manifest.test.ts
pnpm sazo:reference
```

Expected: 2 tests PASS and 21 checkpoint PNG files exist under the ignored QA directory.

- [ ] **Step 6: Commit the reference ledger**

```bash
git add .gitignore package.json scripts/sazo-extract-reference.mjs design/reproductions/sazo-commerce/reference-manifest.json tests/unit/sazo-reference-manifest.test.ts
git commit -m "test: pin SAZO recording references"
```

---

### Task 2: Build the deterministic commerce state model

**Files:**
- Create: `src/sazo-commerce/model.ts`
- Create: `src/sazo-commerce/fixtures.ts`
- Test: `tests/unit/sazo-commerce-model.test.ts`

**Interfaces:**
- Consumes: no browser APIs.
- Produces: `SazoView`, `SazoOverlay`, `SazoState`, `SazoAction`, `createInitialSazoState()`, and `sazoReducer(state, action)`.

- [ ] **Step 1: Write the failing reducer tests**

Create `tests/unit/sazo-commerce-model.test.ts` with assertions for navigation, grid/list mode, carousel wraparound, login progression, chat overlay, and reset:

```ts
import { describe, expect, it } from "vitest";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";

describe("sazoReducer", () => {
  it("navigates catalog and preserves its display mode", () => {
    const state = createInitialSazoState();
    const catalog = sazoReducer(state, { type: "navigate", view: "catalog" });
    const grid = sazoReducer(catalog, { type: "set-catalog-mode", mode: "grid" });
    expect(grid.view).toBe("catalog");
    expect(grid.catalogMode).toBe("grid");
  });

  it("wraps the five-slide hero and toggles pause", () => {
    let state = createInitialSazoState();
    for (let index = 0; index < 5; index += 1) state = sazoReducer(state, { type: "hero-next" });
    expect(state.heroIndex).toBe(0);
    expect(sazoReducer(state, { type: "toggle-hero-pause" }).heroPaused).toBe(true);
  });

  it("advances the mock registration and opens chat deterministically", () => {
    let state = sazoReducer(createInitialSazoState(), { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "birthday" });
    state = sazoReducer(state, { type: "open-chat" });
    expect(state.authStep).toBe("birthday");
    expect(state.overlay).toBe("chat");
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-commerce-model.test.ts`

Expected: FAIL because `@/sazo-commerce/model` does not exist.

- [ ] **Step 3: Implement the minimal typed reducer**

Define these exact unions and state fields:

```ts
export type SazoView =
  | "home" | "service" | "brands" | "categories" | "catalog"
  | "reviews" | "ranking" | "mypage" | "favorites" | "profile" | "cards";
export type SazoOverlay = "none" | "login" | "chat";
export type SazoAuthStep = "provider" | "birthday" | "phone";
export type CatalogMode = "list" | "grid";

export type SazoState = {
  view: SazoView;
  overlay: SazoOverlay;
  authStep: SazoAuthStep;
  catalogMode: CatalogMode;
  heroIndex: number;
  heroPaused: boolean;
  selectedCategory: string;
  selectedTab: string;
};
```

Implement an exhaustive `switch` using a `never` guard. Add typed fixture arrays for five hero slides, five shortcuts, twelve products, ten ranking keywords, eight brands, fourteen categories, eight reviews, and six GRAM entries. Fixture image paths must all begin with `/sazo-commerce/`.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run tests/unit/sazo-commerce-model.test.ts`

Expected: all reducer tests PASS with no warnings.

- [ ] **Step 5: Commit the state model**

```bash
git add src/sazo-commerce/model.ts src/sazo-commerce/fixtures.ts tests/unit/sazo-commerce-model.test.ts
git commit -m "feat: add deterministic SAZO commerce state"
```

---

### Task 3: Add the route, i18n contract, and responsive shell

**Files:**
- Create: `src/sazo-commerce/SazoCommercePage.tsx`
- Create: `src/sazo-commerce/SazoShell.tsx`
- Create: `src/sazo-commerce/sazo.css`
- Modify: `src/App.tsx`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Test: `tests/unit/sazo-commerce-shell.test.tsx`

**Interfaces:**
- Consumes: `createInitialSazoState()` and `sazoReducer()` from Task 2.
- Produces: lazy route `/sazo-commerce-mock/*`, `.sazo-root`, `SazoCommercePage`, `SazoShell`, and accessible desktop/mobile navigation controls.

- [ ] **Step 1: Write the failing shell test**

Use `renderToStaticMarkup` and an `I18nextProvider` to assert the wordmark, search label, desktop nav labels, mobile bottom nav labels, main landmark, and chat button. Also read `sazo.css` and assert `.sazo-root`, the desktop media query, the exact pink token, and reduced-motion handling.

```ts
expect(markup).toContain("SAZO");
expect(markup).toContain("キーワードまたはURLを入力");
expect(markup).toContain("サービス紹介");
expect(markup).toContain("お気に入り");
expect(markup).toContain('aria-label="チャットを開く"');
expect(css).toContain("--sazo-pink: #e52969");
expect(css).toContain("@media (min-width: 900px)");
expect(css).toContain("prefers-reduced-motion: reduce");
```

- [ ] **Step 2: Run the shell test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx`

Expected: FAIL because the page and stylesheet do not exist.

- [ ] **Step 3: Implement the route and shell**

Add a lazy import in `src/App.tsx` and place the specific route before `/:locale`:

```tsx
const SazoCommercePage = lazy(() =>
  import("@/sazo-commerce/SazoCommercePage").then((module) => ({ default: module.SazoCommercePage })),
);

<Route
  path="/sazo-commerce-mock/*"
  element={<Suspense fallback={null}><SazoCommercePage /></Suspense>}
/>
```

Implement the shell with `header`, `nav`, `main`, and `footer`, responsive desktop/mobile variants controlled entirely by CSS, and buttons that dispatch `navigate`, `open-login`, and `open-chat` actions.

Define feature tokens only inside `.sazo-root`:

```css
.sazo-root {
  --sazo-pink: #e52969;
  --sazo-ink: #101319;
  --sazo-muted: #72767d;
  --sazo-line: #e8e8ea;
  --sazo-surface: #ffffff;
  --sazo-soft: #f6f7f8;
  min-height: 100vh;
  background: var(--sazo-surface);
  color: var(--sazo-ink);
  font-family: Arial, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
}
```

Add `sazo` locale keys to all three locale files. Keep the captured Japanese strings identical in each locale because this is a fixed Japanese reproduction route.

- [ ] **Step 4: Verify GREEN and existing route safety**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx
pnpm typecheck
```

Expected: shell tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit the route and shell**

```bash
git add src/App.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/SazoShell.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-shell.test.tsx
git commit -m "feat: add responsive SAZO commerce shell"
```

---

### Task 4: Reproduce the home, discovery, and hero motion

**Files:**
- Create: `src/sazo-commerce/HomeView.tsx`
- Create: `src/sazo-commerce/ProductCard.tsx`
- Create: `src/sazo-commerce/useSazoHero.ts`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Create: `public/sazo-commerce/logo-mark.svg`
- Create: `public/sazo-commerce/hero/slide-1.webp` through `slide-5.webp`
- Create: `public/sazo-commerce/products/01.webp` through `12.webp`
- Create: `public/sazo-commerce/community/01.webp` through `06.webp`
- Test: `tests/unit/sazo-commerce-home.test.tsx`

**Interfaces:**
- Consumes: `heroSlides`, `shortcuts`, `products`, `reviews`, `gramEntries`, and `SazoState`.
- Produces: `HomeView`, `ProductCard`, and `useSazoHero({ paused, onNext, intervalMs: 5000 })`.

- [ ] **Step 1: Write the failing home composition test**

Render `HomeView` with the initial state and assert section order and captured labels:

```ts
includesInOrder(markup, [
  "新規特典がリニューアル",
  "SAZO特集",
  "日本最大級",
  "みんなの口コミ",
  "SAZO GRAM",
  "レビュー高評価のおすすめ",
  "SAZO RANKING",
]);
expect(markup).toContain('aria-label="次のバナー"');
expect(markup).toContain("1/5");
expect(markup).toContain("¥3,799");
```

- [ ] **Step 2: Run the home test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-commerce-home.test.tsx`

Expected: FAIL because `HomeView` does not exist.

- [ ] **Step 3: Prepare local visual assets**

Use the extracted reference frames as visual input. Crop hero, community, and product imagery with FFmpeg into the named delivery files, convert to WebP at quality 88, and keep each delivery image below 350 KB. Preserve the original reference PNGs unchanged in the ignored QA directory.

Run: `find public/sazo-commerce -type f -size +350k -print`

Expected: no output.

- [ ] **Step 4: Implement the home components and observed motion**

Implement the centered desktop carousel with neighboring slide visibility and the edge-to-edge mobile carousel. Add previous/next buttons, `n/5`, pause control, five-second automatic advance, and cleanup on unmount. Use a horizontal card strip on mobile and desktop grids/rows at 900px and above. Match visible image ratios: hero 2.45:1 desktop, 1.62:1 mobile; product cards 1:1; community cards 0.78:1.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: all selected tests PASS and typecheck exits 0.

- [ ] **Step 6: Commit home reproduction**

```bash
git add src/sazo-commerce public/sazo-commerce tests/unit/sazo-commerce-home.test.tsx
git commit -m "feat: reproduce SAZO home discovery UI"
```

---

### Task 5: Reproduce brand, category, catalog, ranking, review, and service views

**Files:**
- Create: `src/sazo-commerce/DirectoryViews.tsx`
- Create: `src/sazo-commerce/CatalogView.tsx`
- Create: `src/sazo-commerce/EditorialViews.tsx`
- Create: `src/sazo-commerce/ServiceView.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Create: `public/sazo-commerce/service/step-01.webp` through `step-03.webp`
- Create: `public/sazo-commerce/brands/01.webp` through `08.webp`
- Test: `tests/unit/sazo-commerce-views.test.tsx`

**Interfaces:**
- Consumes: `SazoView`, `CatalogMode`, fixture arrays, and dispatch callbacks.
- Produces: `BrandsView`, `CategoriesView`, `CatalogView`, `RankingView`, `ReviewsView`, and `ServiceView`.

- [ ] **Step 1: Write failing view-contract tests**

Render every view and assert its unique contract:

```ts
expect(render("brands")).toContain("LONGCHAMP");
expect(render("categories")).toContain("スキンケア");
expect(render("catalog")).toContain("全体 86個");
expect(render("ranking")).toContain("SAZO RANKING");
expect(render("reviews")).toContain("利用レビュー");
expect(render("service")).toContain("URL入力で購入代行ができます。");
expect(render("service")).toContain("よくある質問");
```

Also assert that list mode renders `data-catalog-mode="list"`, grid mode renders `data-catalog-mode="grid"`, and all view-back buttons have an accessible label.

- [ ] **Step 2: Run the view test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-commerce-views.test.tsx`

Expected: FAIL because the view modules do not exist.

- [ ] **Step 3: Implement directory and catalog views**

Build the brand directory as stacked rows with logo, Japanese transliteration, horizontal preview strip, save button, and skeleton fallback. Build the two-column category view with left parent selection and right child rows. Build the catalog view with sticky horizontal category tabs, chips, `全体 86個`, list/grid toggle, and responsive product cards.

- [ ] **Step 4: Implement editorial and service views**

Build ranking controls (`購入数`, `閲覧数`, `週間`) and the recorded product grid. Build review category chips and masonry-like desktop/mobile layouts. Build the service introduction with URL-entry card, three step cards, trust panel, FAQ accordion, support block, and footer links. The FAQ first item expands with a `max-height` and opacity transition; all items remain keyboard operable.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-views.test.tsx
pnpm typecheck
```

Expected: all view tests PASS and typecheck exits 0.

- [ ] **Step 6: Commit catalog and editorial views**

```bash
git add src/sazo-commerce public/sazo-commerce/service public/sazo-commerce/brands tests/unit/sazo-commerce-views.test.tsx
git commit -m "feat: reproduce SAZO catalog and service views"
```

---

### Task 6: Reproduce login, registration, account, favorites, and chat states

**Files:**
- Create: `src/sazo-commerce/AuthFlow.tsx`
- Create: `src/sazo-commerce/AccountViews.tsx`
- Create: `src/sazo-commerce/ChatPanel.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Test: `tests/unit/sazo-commerce-account.test.tsx`

**Interfaces:**
- Consumes: `SazoAuthStep`, `SazoOverlay`, `SazoView`, and dispatch callbacks.
- Produces: `AuthFlow`, `MyPageView`, `FavoritesView`, `ProfileView`, `CardsView`, and `ChatPanel`.

- [ ] **Step 1: Write failing account-flow tests**

Assert the provider screen contains the coupon callout and three continuation buttons; birthday contains `YYYY-MM-DD`; phone contains the country selector and consent control; My Page contains the recorded shopping/review links; Favorites and Cards show their empty-state copy; Chat has dialog semantics and a close button.

```ts
expect(provider).toContain("送料50%OFFクーポン");
expect(provider).toContain("Googleで続ける");
expect(birthday).toContain("生年月日を入力してください");
expect(phone).toContain("電話番号を入力してください");
expect(favorites).toContain("お気に入り商品がありません");
expect(cards).toContain("登録されているカードがありません。");
expect(chat).toContain('role="dialog"');
```

- [ ] **Step 2: Run the account test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-commerce-account.test.tsx`

Expected: FAIL because the account modules do not exist.

- [ ] **Step 3: Implement authentication and account states**

Implement a desktop centered modal with backdrop and a mobile full-height sheet. Provider buttons only dispatch local transitions. Date and phone inputs use labels, visible focus, and recorded widths. Country selection is a local native `select` with `JP`, `KR`, `CN`, `US`, `TW`, `BN`, `SG`, `DE`, `TH`, `GU`, and `RU`. Escape closes the login overlay and focus returns to the launcher.

Implement My Page, Favorites, Profile, and Cards as separate semantic view components using the captured values `Tetsu Fujita`, `500`, `0`, and `tetsu.fujita@andes.global` only inside the local mock fixture.

- [ ] **Step 4: Implement chat behavior**

Use Motion for a 220ms desktop slide-in and 180ms mobile fade/translate. The panel traps focus while open, closes on Escape/backdrop/close button, and renders the recorded empty/loading state without external messaging.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: all selected tests PASS and typecheck exits 0.

- [ ] **Step 6: Commit auth, account, and chat**

```bash
git add src/sazo-commerce tests/unit/sazo-commerce-account.test.tsx
git commit -m "feat: reproduce SAZO account and chat flows"
```

---

### Task 7: Add deterministic Playwright scenarios and video capture

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/sazo-commerce-reproduction.spec.ts`
- Create: `scripts/sazo-record.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: stable `data-testid` controls exposed by Tasks 3–6.
- Produces: `pnpm test:e2e:sazo` and `pnpm sazo:record`; recordings are saved to `design/reproductions/sazo-commerce/qa/actual/{desktop,mobile}/recording.webm` and converted to MP4.

- [ ] **Step 1: Write the failing desktop/mobile scenario test**

Configure Playwright `webServer` to run `pnpm dev --host 127.0.0.1 --port 5190`. Define two projects with the exact reference viewports. The test must fail before stable test IDs exist or before the route is interactive.

The desktop test performs:

```ts
await page.goto("/sazo-commerce-mock/?qa=1");
await expect(page.getByTestId("sazo-hero")).toBeVisible();
await page.getByTestId("nav-reviews").click();
await expect(page.getByRole("heading", { name: "利用レビュー" })).toBeVisible();
await page.getByTestId("chat-launcher").click();
await expect(page.getByRole("dialog", { name: "チャット" })).toBeVisible();
await page.getByTestId("chat-close").click();
await page.getByTestId("login-launcher").click();
await expect(page.getByText("Googleで続ける")).toBeVisible();
```

The mobile test navigates home → categories → catalog list → catalog grid → login → birthday → phone → My Page → favorites → profile → cards.

- [ ] **Step 2: Run the E2E test to verify RED**

Run: `pnpm playwright test tests/e2e/sazo-commerce-reproduction.spec.ts`

Expected: at least one assertion FAILS because one or more stable scenario controls are not yet exposed.

- [ ] **Step 3: Add stable test IDs and video recording script**

Expose only the required `data-testid` attributes. Implement `scripts/sazo-record.mjs` with Playwright `recordVideo`, the same scenario order, fixed waits stored in a named timing map, `locale: "ja-JP"`, `colorScheme: "light"`, and reduced motion disabled. Save videos under the ignored QA directory and invoke FFmpeg with `-c:v libx264 -pix_fmt yuv420p` to create `desktop.mp4` and `mobile.mp4`.

Add package scripts:

```json
{
  "test:e2e:sazo": "playwright test tests/e2e/sazo-commerce-reproduction.spec.ts",
  "sazo:record": "node scripts/sazo-record.mjs"
}
```

- [ ] **Step 4: Verify GREEN and produce the first recordings**

Run:

```bash
pnpm test:e2e:sazo
pnpm sazo:record
```

Expected: both Playwright projects PASS; desktop and mobile WebM and MP4 files exist and have nonzero duration reported by `ffprobe`.

- [ ] **Step 5: Commit scenario automation**

```bash
git add .gitignore package.json playwright.config.ts scripts/sazo-record.mjs tests/e2e/sazo-commerce-reproduction.spec.ts src/sazo-commerce
git commit -m "test: automate SAZO reproduction recordings"
```

---

### Task 8: Build frame comparison and run the fidelity loop

**Files:**
- Create: `scripts/sazo-capture-checkpoints.mjs`
- Create: `scripts/sazo-compare.mjs`
- Create: `design/reproductions/sazo-commerce/fidelity-report.md`
- Modify: `package.json`
- Test: `tests/unit/sazo-comparison-contract.test.ts`

**Interfaces:**
- Consumes: manifest checkpoints, reference PNGs, and deterministic mock routes/actions.
- Produces: actual PNG, diff PNG, side-by-side PNG, JSON summary, and a written fidelity report for each desktop/mobile checkpoint.

- [ ] **Step 1: Write the failing comparison-contract test**

The test reads `scripts/sazo-compare.mjs` and asserts it imports `pixelmatch` and `pngjs`, reads the manifest, writes `summary.json`, and exits nonzero when an image pair has different dimensions. It also asserts `package.json` exposes `sazo:compare`.

- [ ] **Step 2: Run the comparison test to verify RED**

Run: `pnpm vitest run tests/unit/sazo-comparison-contract.test.ts`

Expected: FAIL because the scripts and package command do not exist.

- [ ] **Step 3: Implement deterministic checkpoint capture**

Create one capture function per named checkpoint. Each function uses route navigation, stable controls, scroll positions, and `page.screenshot()` rather than seeking the produced video. Use exact reference viewport dimensions and disable the pointer cursor in screenshot mode with `?qa=1&cursor=0`.

- [ ] **Step 4: Implement pixel comparison**

For each matched PNG pair, run Pixelmatch with `{ threshold: 0.12, includeAA: false }`. Write:

```json
{
  "name": "home-hero",
  "viewport": "mobile",
  "differentPixels": 0,
  "totalPixels": 1002540,
  "ratio": 0,
  "status": "pass"
}
```

Use `pass` for `ratio <= 0.08`, `review` for `0.08 < ratio <= 0.18`, and `fail` for `ratio > 0.18`. Dimension mismatch is always `fail`. Generate side-by-side and magenta diff images in `qa/compare/<viewport>/`.

Add both commands to `package.json`:

```json
{
  "sazo:capture": "node scripts/sazo-capture-checkpoints.mjs",
  "sazo:compare": "node scripts/sazo-compare.mjs"
}
```

- [ ] **Step 5: Verify GREEN and run the first comparison**

Run:

```bash
pnpm vitest run tests/unit/sazo-comparison-contract.test.ts
pnpm sazo:reference
pnpm sazo:capture
pnpm sazo:compare
```

Expected: the contract test PASS; `summary.json` contains all 21 checkpoints. Initial visual failures are expected and must be listed by descending ratio.

- [ ] **Step 6: Run the correction loop**

Repeat this exact sequence until no checkpoint is `fail` and every `review` item has a written cause:

```text
highest-ratio checkpoint
→ inspect reference / actual / diff images
→ classify shell / type / spacing / crop / color / state / motion
→ write or extend a failing unit or E2E regression assertion
→ verify the assertion fails
→ apply the smallest CSS/component/asset correction
→ rerun the focused test
→ recapture the checkpoint
→ rerun comparison
```

Record each iteration in `fidelity-report.md` with viewport, checkpoint, previous ratio, new ratio, correction, and remaining cause. Accepted remaining causes are limited to recording compression, cursor location, or platform text rasterization.

- [ ] **Step 7: Commit comparison tooling and verified corrections**

```bash
git add package.json scripts/sazo-capture-checkpoints.mjs scripts/sazo-compare.mjs tests/unit/sazo-comparison-contract.test.ts design/reproductions/sazo-commerce/fidelity-report.md src/sazo-commerce public/sazo-commerce
git commit -m "test: verify SAZO reproduction fidelity"
```

---

### Task 9: Complete full verification and handoff

**Files:**
- Create: `design/reproductions/sazo-commerce/README.md`
- Modify: `design/reproductions/sazo-commerce/fidelity-report.md`

**Interfaces:**
- Consumes: the completed feature, all tests, final recordings, and comparison summary.
- Produces: reproducible run instructions, final evidence, and known limitations.

- [ ] **Step 1: Write the handoff document**

Document these exact commands and output locations:

```bash
pnpm install
pnpm dev --host 127.0.0.1 --port 5190
pnpm sazo:reference
pnpm test:e2e:sazo
pnpm sazo:record
pnpm sazo:capture
pnpm sazo:compare
```

Link the route, source manifest, desktop/mobile MP4 files, comparison summary, and fidelity report. State that all authentication and commerce actions are local mock transitions.

- [ ] **Step 2: Run complete repository verification**

Invoke `superpowers:verification-before-completion`, then run fresh:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:sazo
pnpm sazo:record
pnpm sazo:capture
pnpm sazo:compare
```

Expected: lint, typecheck, unit tests, build, and E2E all exit 0; recordings are nonempty; comparison summary contains zero `fail` statuses.

- [ ] **Step 3: Inspect the final recordings manually**

Play both MP4 files from start to finish. Check fixed headers/nav, carousel timing, scrolling, modal focus, list/grid transitions, loaders, chat, account transitions, and that no blank or unstyled frame appears.

- [ ] **Step 4: Commit the handoff and final report**

```bash
git add design/reproductions/sazo-commerce/README.md design/reproductions/sazo-commerce/fidelity-report.md
git commit -m "docs: hand off SAZO commerce reproduction"
```

- [ ] **Step 5: Report completion evidence**

Report the worktree path, route, verification command results, recording file paths, checkpoint pass/review/fail counts, and any accepted compression/rasterization differences. Do not claim complete reproduction unless the fresh verification output supports it.
