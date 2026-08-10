# J-Planet BEAUTY Mobile View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home `コスメ` shortcut open a high-fidelity J-Planet BEAUTY mobile view whose search field accepts and filters input in place instead of opening the AI agent.

**Architecture:** Add `beauty` as an isolated `SazoView`, render a focused `BeautyView` with its own mobile header and local search/category state, and keep existing product-detail and bottom-navigation actions. Store the supplied recording crops and BEAUTY mock data in dedicated files so neither `HomeView` nor the general `CatalogView` inherits BEAUTY-specific behavior.

**Tech Stack:** React 19, TypeScript 5.9, Vitest + Testing Library, Playwright, CSS, ffmpeg, Vite

## Global Constraints

- The mobile reference is `/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov`, 684×1474, 60.403 seconds.
- Replace the reference brand only with `J-Planet BEAUTY`; do not render `SAZO BEAUTY`.
- The BEAUTY search field must remain an `input[type="search"]` inside the `beauty` view and must never dispatch `open-agent` or navigate to `agent-hub`.
- The header, hero, search, category chips, rails showing three cards at once, J-Beauty trend section, and fixed bottom navigation must match the supplied recording at CSS viewport widths 341px and 440px.
- Use `J-Beauty`, not `K-Beauty`, in J-Planet-facing copy.
- No production search/AI API, checkout change, new dependency, or unrelated refactor.
- Preserve all pre-existing dirty worktree changes. Before every commit, stage only the files listed in that task and inspect `git diff --cached --name-only`.
- Use test-driven development: RED test, minimal GREEN implementation, focused verification, then commit.

## File Structure

- Create `src/sazo-commerce/BeautyView.tsx`: BEAUTY header, hero, controlled search, category rail, product rail, trend list, and local loading state.
- Create `src/sazo-commerce/beautyFixtures.ts`: BEAUTY category/product/trend types and deterministic fixture data.
- Create `tests/unit/sazo-commerce-beauty.test.tsx`: behavior and markup contracts for the new isolated view.
- Create `public/sazo-commerce/beauty/*.webp`: crops from the user-supplied recording used only by the mock.
- Modify `src/sazo-commerce/model.ts`: register `beauty` as a valid view and QA route.
- Modify `src/sazo-commerce/HomeView.tsx`: make only the `cosmetics` shortcut navigate to `beauty`.
- Modify `src/sazo-commerce/SazoCommercePage.tsx`: render `BeautyView` for the new view.
- Modify `src/sazo-commerce/SazoShell.tsx`: suppress the ordinary mobile header while BEAUTY owns its dedicated header; retain the fixed bottom navigation.
- Modify `src/sazo-commerce/sazo.css`: add one final authoritative mobile BEAUTY block without rewriting existing account/agent/home rules.
- Modify `tests/unit/sazo-commerce-home.test.tsx`: cover the shortcut dispatch without weakening existing home contracts.
- Modify `tests/unit/sazo-commerce-shell.test.tsx`: cover dedicated-header ownership and bottom-navigation retention.
- Modify `tests/e2e/sazo-commerce-reproduction.spec.ts`: exercise home → BEAUTY, inline search, chip loading, horizontal scrolling, and product detail return.

---

### Task 1: Register the BEAUTY Route and Deterministic Media Fixtures

**Files:**
- Create: `public/sazo-commerce/beauty/skincare-01.webp`
- Create: `public/sazo-commerce/beauty/skincare-02.webp`
- Create: `public/sazo-commerce/beauty/skincare-03.webp`
- Create: `public/sazo-commerce/beauty/trend-01.webp`
- Create: `public/sazo-commerce/beauty/trend-02.webp`
- Create: `public/sazo-commerce/beauty/trend-03.webp`
- Create: `src/sazo-commerce/beautyFixtures.ts`
- Modify: `src/sazo-commerce/model.ts`
- Test: `tests/unit/sazo-commerce-beauty.test.tsx`
- Test: `tests/unit/sazo-commerce-model.test.ts`

**Interfaces:**
- Produces: `BeautyCategoryId`, `BeautyProduct`, `beautyCategories`, `beautyProductsByCategory`, `beautyTrendProducts`, and `beautyTrendKeywords`.
- Produces: `SazoView` member `"beauty"`, accepted by `createInitialSazoState("?qa=1&view=beauty")`.
- Consumers: `BeautyView` in Task 2 and home/shell routing in Task 3.

- [ ] **Step 1: Write the failing route and fixture tests**

Create `tests/unit/sazo-commerce-beauty.test.tsx` with a fixture contract that imports only `beautyFixtures`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  beautyCategories,
  beautyProductsByCategory,
  beautyTrendKeywords,
  beautyTrendProducts,
} from "@/sazo-commerce/beautyFixtures";

describe("J-Planet BEAUTY fixtures", () => {
  it("keeps the recorded category order and scrollable three-column mobile rails", () => {
    expect(beautyCategories.map(({ id, label }) => [id, label])).toEqual([
      ["skincare", "スキンケア"],
      ["mask-pack", "マスクパック"],
      ["cleansing", "クレンジング"],
      ["sun-care", "日焼け止め"],
      ["makeup", "メイクアップ"],
      ["mens-care", "メンズケア"],
      ["fragrance", "香水"],
      ["hair-care", "ヘアケア"],
    ]);

    for (const { id } of beautyCategories) {
      expect(beautyProductsByCategory[id]).toHaveLength(6);
    }
    expect(beautyTrendProducts).toHaveLength(6);
    expect(beautyTrendKeywords).toHaveLength(7);
  });
});
```

Add this assertion to the existing QA route test in `tests/unit/sazo-commerce-model.test.ts`:

```ts
expect(createInitialSazoState("?qa=1&view=beauty").view).toBe("beauty");
```

- [ ] **Step 2: Run the tests to verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx tests/unit/sazo-commerce-model.test.ts
```

Expected: FAIL because `beautyFixtures.ts` does not exist and `beauty` is not assignable to `SazoView`.

- [ ] **Step 3: Extract six deterministic product crops from the supplied recording**

Run these exact commands from the repository root:

```bash
mkdir -p public/sazo-commerce/beauty
ffmpeg -y -hide_banner -loglevel error -ss 8 -i '/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov' -vf 'crop=212:212:30:528,scale=424:424' -frames:v 1 public/sazo-commerce/beauty/skincare-01.webp
ffmpeg -y -hide_banner -loglevel error -ss 8 -i '/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov' -vf 'crop=212:212:258:528,scale=424:424' -frames:v 1 public/sazo-commerce/beauty/skincare-02.webp
ffmpeg -y -hide_banner -loglevel error -ss 8 -i '/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov' -vf 'crop=161:212:485:528,scale=424:424:force_original_aspect_ratio=increase,crop=424:424' -frames:v 1 public/sazo-commerce/beauty/skincare-03.webp
ffmpeg -y -hide_banner -loglevel error -ss 8 -i '/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov' -vf 'crop=212:212:30:1099,scale=424:424' -frames:v 1 public/sazo-commerce/beauty/trend-01.webp
ffmpeg -y -hide_banner -loglevel error -ss 8 -i '/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov' -vf 'crop=212:212:258:1099,scale=424:424' -frames:v 1 public/sazo-commerce/beauty/trend-02.webp
ffmpeg -y -hide_banner -loglevel error -ss 56 -i '/Users/fujitatetsu/Downloads/画面収録 2026-08-10 17.21.56.mov' -vf 'crop=299:299:347:514,scale=424:424' -frames:v 1 public/sazo-commerce/beauty/trend-03.webp
```

Inspect all six images before proceeding:

```bash
file public/sazo-commerce/beauty/*.webp
```

Expected: six valid WebP images, each 424×424.

- [ ] **Step 4: Implement the fixture module**

Create `src/sazo-commerce/beautyFixtures.ts` with these public contracts and deterministic data shape:

```ts
export type BeautyCategoryId =
  | "skincare"
  | "mask-pack"
  | "cleansing"
  | "sun-care"
  | "makeup"
  | "mens-care"
  | "fragrance"
  | "hair-care";

export interface BeautyProduct {
  id: string;
  detailProductId: string;
  brand: string;
  name: string;
  price: string;
  image: `/sazo-commerce/beauty/${string}.webp`;
  keywords: readonly string[];
}

export const beautyCategories = [
  { id: "skincare", label: "スキンケア" },
  { id: "mask-pack", label: "マスクパック" },
  { id: "cleansing", label: "クレンジング" },
  { id: "sun-care", label: "日焼け止め" },
  { id: "makeup", label: "メイクアップ" },
  { id: "mens-care", label: "メンズケア" },
  { id: "fragrance", label: "香水" },
  { id: "hair-care", label: "ヘアケア" },
] as const satisfies readonly { id: BeautyCategoryId; label: string }[];
```

Define the product data with a small constructor and these exact values:

```ts
const product = (
  id: string,
  detailProductId: string,
  brand: string,
  name: string,
  price: string,
  image: BeautyProduct["image"],
  keywords: readonly string[],
): BeautyProduct => ({ id, detailProductId, brand, name, price, image, keywords });

const skincare = [
  product("beauty-01", "p01", "資生堂", "高保湿ビタミンC美容液", "¥4,111", "/sazo-commerce/beauty/skincare-01.webp", ["美容液", "ビタミンC", "保湿"]),
  product("beauty-02", "p02", "Anua", "ドクダミ鎮静アンプル 1+1", "¥3,088", "/sazo-commerce/beauty/skincare-02.webp", ["アンプル", "鎮静", "化粧水"]),
  product("beauty-03", "p03", "AESTURA", "アトバリア365クリーム", "¥3,040", "/sazo-commerce/beauty/skincare-03.webp", ["クリーム", "敏感肌", "保湿"]),
] as const;

const trend = [
  product("beauty-trend-01", "p04", "JILL STUART", "限定リップケアセット", "¥2,591", "/sazo-commerce/beauty/trend-01.webp", ["リップ", "限定"]),
  product("beauty-trend-02", "p05", "CEZANNE", "ニュアンスカラーチーク", "¥1,014", "/sazo-commerce/beauty/trend-02.webp", ["チーク", "メイク"]),
  product("beauty-trend-03", "p06", "KATE", "リップモンスター", "¥1,071", "/sazo-commerce/beauty/trend-03.webp", ["リップ", "口紅"]),
] as const;

const allProducts = [...skincare, ...trend] as const;

export const beautyProductsByCategory: Record<BeautyCategoryId, readonly BeautyProduct[]> = {
  skincare: allProducts,
  "mask-pack": [skincare[1], skincare[2], trend[0], skincare[0], trend[1], trend[2]],
  cleansing: [skincare[2], skincare[0], trend[1], skincare[1], trend[2], trend[0]],
  "sun-care": [skincare[0], skincare[2], trend[2], skincare[1], trend[0], trend[1]],
  makeup: [...trend, ...skincare],
  "mens-care": [skincare[2], skincare[1], trend[0], skincare[0], trend[2], trend[1]],
  fragrance: [trend[2], trend[0], skincare[0], trend[1], skincare[1], skincare[2]],
  "hair-care": [trend[1], trend[2], skincare[2], trend[0], skincare[0], skincare[1]],
};

export const beautyTrendProducts = [...trend, ...skincare] as const;
export const beautyTrendKeywords = [
  "逃したら終わり",
  "夏の透明感メイク",
  "毛穴ケア",
  "ツヤ肌ベース",
  "敏感肌スキンケア",
  "落ちないリップ",
  "香りで選ぶヘアケア",
] as const;
```

- [ ] **Step 5: Register the route in the model**

In `src/sazo-commerce/model.ts`, add `"beauty"` to both `SazoView` and `qaViews`. Do not add global BEAUTY search/category state; those values are local to `BeautyView`.

- [ ] **Step 6: Run focused tests to verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: both test files PASS and TypeScript reports no error.

- [ ] **Step 7: Commit Task 1 only**

```bash
git add -- public/sazo-commerce/beauty src/sazo-commerce/beautyFixtures.ts src/sazo-commerce/model.ts tests/unit/sazo-commerce-beauty.test.tsx tests/unit/sazo-commerce-model.test.ts
git diff --cached --name-only
git commit -m "feat: add J-Planet beauty route fixtures"
```

Expected staged paths: only the six media files and five paths listed above.

---

### Task 2: Build the Isolated Inline-Search BEAUTY View

**Files:**
- Create: `src/sazo-commerce/BeautyView.tsx`
- Modify: `tests/unit/sazo-commerce-beauty.test.tsx`

**Interfaces:**
- Consumes: `beautyCategories`, `beautyProductsByCategory`, `beautyTrendProducts`, `beautyTrendKeywords`, and `BeautyCategoryId` from Task 1.
- Consumes: `dispatch: Dispatch<SazoAction>` and existing `open-product` action.
- Produces: `BeautyView({ dispatch }: { dispatch: Dispatch<SazoAction> })` and stable `data-beauty-*` hooks for CSS/E2E.

- [ ] **Step 1: Add failing behavior tests**

Append component tests to `tests/unit/sazo-commerce-beauty.test.tsx`. Render through the Japanese i18n provider and assert:

```tsx
it("keeps search input inside BEAUTY and never opens the agent", async () => {
  const dispatch = vi.fn();
  renderBeauty(<BeautyView dispatch={dispatch} />);

  const input = screen.getByRole("searchbox", {
    name: "BEAUTYの商品を検索",
  });
  fireEvent.change(input, { target: { value: "美容液" } });
  fireEvent.submit(input.closest("form")!);

  expect(input).toHaveValue("美容液");
  expect(dispatch).not.toHaveBeenCalledWith({ type: "open-agent" });
  expect(dispatch).not.toHaveBeenCalledWith({
    type: "navigate",
    view: "agent-hub",
  });
});
```

Add tests for these exact contracts:

- Initial `スキンケア` chip has `aria-pressed="true"`.
- Clicking `マスクパック` shows a status named `マスクパックの商品を読み込んでいます`.
- After advancing fake timers by 500ms, `マスクパック` becomes selected and six cards render in a rail showing three columns at once.
- Clicking a product dispatches `{ type: "open-product", productId: "p01" }` for the first mapped card.
- Submitting `__該当なし__` renders `該当する商品がありません` and preserves the searchbox.
- The document contains `J-Planet`, `BEAUTY`, `コスメ`, `ヘルプ`, `お知らせ`, `今話題のJ-Beautyトレンド`, and seven ranked rows.
- Clicking the header search action focuses `#sazo-beauty-search-input`.
- Firing an error on a product image replaces it with a same-size `.sazo-beauty-image-fallback`; successful product images use the product name as `alt`.

- [ ] **Step 2: Run the component tests to verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx
```

Expected: FAIL because `BeautyView.tsx` and its accessible UI do not exist.

- [ ] **Step 3: Implement the component boundaries**

Create `src/sazo-commerce/BeautyView.tsx` with these internal boundaries:

```tsx
export interface BeautyViewProps {
  dispatch: Dispatch<SazoAction>;
}

export function BeautyView({ dispatch }: BeautyViewProps) {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<BeautyCategoryId>("skincare");
  const [pendingCategory, setPendingCategory] =
    useState<BeautyCategoryId | null>(null);

  const normalizedQuery = submittedQuery.toLocaleLowerCase("ja-JP");
  const visibleProducts = beautyProductsByCategory[activeCategory].filter(
    ({ brand, keywords, name }) =>
      normalizedQuery.length === 0 ||
      [brand, name, ...keywords]
        .join(" ")
        .toLocaleLowerCase("ja-JP")
        .includes(normalizedQuery),
  );

  return (
    <main className="sazo-beauty" data-beauty-view>
      <BeautyHeader dispatch={dispatch} />
      <section className="sazo-beauty-hero">
        <span className="sazo-beauty-store-badge">J-Beauty</span>
        <h1>これからは<br />J-Planetで探す</h1>
        <p>日本で人気のJ-ビューティーを、今すぐ見つけて注文しよう！</p>
        <BeautySearch
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={() => setSubmittedQuery(inputValue.trim())}
        />
        <BeautySearchGuidance />
      </section>
      <section className="sazo-beauty-discovery">
        <h2>日本のショップから<br />欲しい商品を探してみよう！</h2>
        <BeautyCategoryRail
          activeCategory={pendingCategory ?? activeCategory}
          onSelect={setPendingCategory}
        />
        <BeautyProductRail
          dispatch={dispatch}
          loadingCategory={pendingCategory}
          products={visibleProducts}
        />
      </section>
      <BeautyTrendList dispatch={dispatch} />
    </main>
  );
}
```

Keep the internal signatures explicit:

```ts
function BeautyHeader({ dispatch }: BeautyViewProps): ReactElement;
function BeautySearch(props: {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}): ReactElement;
function BeautySearchGuidance(): ReactElement;
function BeautyCategoryRail(props: {
  activeCategory: BeautyCategoryId;
  onSelect: (category: BeautyCategoryId) => void;
}): ReactElement;
function BeautyProductRail(props: {
  dispatch: Dispatch<SazoAction>;
  loadingCategory: BeautyCategoryId | null;
  products: readonly BeautyProduct[];
}): ReactElement;
function BeautyTrendList({ dispatch }: BeautyViewProps): ReactElement;
```

`BeautyHeader` must render `JplanetLogo`, the literal `BEAUTY`, language/search/cart buttons, and the second-row `コスメ / ヘルプ / お知らせ` navigation. The logo dispatches `{ type: "navigate", view: "home" }`; the header search button focuses `#sazo-beauty-search-input`; cart remains a non-routing mock control.

`BeautySearchGuidance` must reuse the approved sharp hand-drawn path rather than a raster arrow:

```tsx
<svg aria-hidden focusable="false" viewBox="0 0 140 92">
  <path d="M114 84 C86 72 74 92 50 87 C17 82 8 61 15 39 C18 29 33 30 36 20" />
  <path d="M21 25 L36 20 L38 36" />
</svg>
```

Render product media through an internal `BeautyProductImage` component. It owns a `failed` boolean, sets it from `img.onError`, renders `.sazo-beauty-image-fallback` when true, and otherwise renders `<img alt={product.name} src={product.image} />`. This keeps image failure handling local to a card without hiding the rest of the rail.

Use a real form:

```tsx
<form
  className="sazo-beauty-search"
  onSubmit={(event) => {
    event.preventDefault();
    setSubmittedQuery(inputValue.trim());
  }}
  role="search"
>
  <label className="sazo-visually-hidden" htmlFor="sazo-beauty-search-input">
    BEAUTYの商品を検索
  </label>
  <input
    id="sazo-beauty-search-input"
    onChange={(event) => setInputValue(event.target.value)}
    placeholder="キーワードまたはURLを入力"
    type="search"
    value={inputValue}
  />
  <button aria-label="検索する" type="submit">
    <Search aria-hidden />
  </button>
</form>
```

For category changes, cancel the previous timeout in the effect cleanup and commit only the most recent pending category after 500ms:

```tsx
useEffect(() => {
  if (pendingCategory === null) return undefined;
  const timeout = window.setTimeout(() => {
    setActiveCategory(pendingCategory);
    setPendingCategory(null);
  }, 500);
  return () => window.clearTimeout(timeout);
}, [pendingCategory]);
```

Filter using a normalized haystack built from `brand`, `name`, and `keywords`. The empty submitted query returns all three products. Render the loading status instead of product cards while `pendingCategory !== null`.

- [ ] **Step 4: Run focused tests and typecheck**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx
pnpm typecheck
```

Expected: all BEAUTY tests PASS and TypeScript reports no error.

- [ ] **Step 5: Commit Task 2 only**

```bash
git add -- src/sazo-commerce/BeautyView.tsx tests/unit/sazo-commerce-beauty.test.tsx
git diff --cached --name-only
git commit -m "feat: build inline-search beauty view"
```

---

### Task 3: Wire Home, Page Rendering, and Dedicated Mobile Header Ownership

**Files:**
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `tests/unit/sazo-commerce-home.test.tsx`
- Modify: `tests/unit/sazo-commerce-shell.test.tsx`
- Modify: `tests/unit/sazo-commerce-beauty.test.tsx`

**Interfaces:**
- Consumes: `BeautyView` and `SazoView = "beauty"` from Tasks 1–2.
- Produces: home `cosmetics` shortcut navigation, page-level BEAUTY rendering, and one mobile header only.
- Preserves: existing AI launcher, normal home header, desktop header, fixed bottom nav, and product return behavior.

- [ ] **Step 1: Write failing integration tests**

In `tests/unit/sazo-commerce-home.test.tsx`, add a test that renders `HomeView` with a spy dispatch, clicks the button named `コスメ`, and expects exactly:

```ts
expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "beauty" });
```

Also verify clicking `限定` does not dispatch the BEAUTY navigation.

In `tests/unit/sazo-commerce-shell.test.tsx`, render state `{ ...createInitialSazoState(), view: "beauty" }` and assert:

```ts
expect(container.querySelector(".sazo-mobile-header")).toBeNull();
expect(
  screen.getByRole("navigation", { name: "モバイルメニュー" }),
).toBeTruthy();
```

In `tests/unit/sazo-commerce-beauty.test.tsx`, render the full `SazoCommercePage` at `?qa=1&view=beauty` and expect `[data-beauty-view]` and only one `[data-beauty-header]`.

- [ ] **Step 2: Run the integration tests to verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-beauty.test.tsx
```

Expected: FAIL because the shortcut has no dispatch, the page does not render `BeautyView`, and the standard header still renders.

- [ ] **Step 3: Wire only the cosmetics shortcut**

Change `ShortcutRow` to accept `dispatch`, then add an `onClick` only for the cosmetics case:

```tsx
function ShortcutRow({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  // ...
  <button
    onClick={() => {
      if (shortcut.id === "cosmetics") {
        dispatch({ type: "navigate", view: "beauty" });
      }
    }}
    type="button"
  >
```

Replace `<ShortcutRow />` with `<ShortcutRow dispatch={dispatch} />`. Do not modify the home AI search behavior in this task.

- [ ] **Step 4: Render the view and suppress only the duplicate mobile header**

In `SazoCommercePage.tsx`, import `BeautyView` and render:

```tsx
{state.view === "beauty" ? <BeautyView dispatch={dispatch} /> : null}
```

In `SazoShell.tsx`, add:

```ts
const dedicatedMobileHeader = agentHubView || state.view === "beauty";
```

Then replace `{agentHubView ? null : (...)}` with `{dedicatedMobileHeader ? null : (...)}`. Do not hide the fixed `.sazo-mobile-nav`.

- [ ] **Step 5: Run focused integration and return-route tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-beauty.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: PASS. Opening a BEAUTY product sets `productReturnView` to `beauty`, and `close-product` returns to `beauty` through the existing reducer.

- [ ] **Step 6: Commit Task 3 only**

```bash
git add -- src/sazo-commerce/HomeView.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/SazoShell.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-beauty.test.tsx
git diff --cached --name-only
git commit -m "feat: connect home cosmetics to beauty view"
```

---

### Task 4: Match the Recorded Mobile Geometry and Interaction Styling

**Files:**
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `tests/unit/sazo-commerce-beauty.test.tsx`

**Interfaces:**
- Consumes: stable `sazo-beauty-*` classes and `data-beauty-*` hooks from Task 2.
- Produces: 341px/440px geometry, fixed dedicated header, scrollable chips/rails, loading skeletons, and visible focus states.

- [ ] **Step 1: Add failing source-level style contract tests**

In `tests/unit/sazo-commerce-beauty.test.tsx`, read `src/sazo-commerce/sazo.css` and assert the final stylesheet contains all of these exact selectors/properties:

```ts
expect(css).toContain('.sazo-root[data-view="beauty"] .sazo-beauty-header');
expect(css).toContain("position: fixed");
expect(css).toContain("--sazo-beauty-green: #63df16");
expect(css).toContain("grid-auto-columns: calc((100% - 16px) / 3)");
expect(css).toContain("overflow-x: auto");
expect(css).toContain("touch-action: pan-y");
expect(css).toContain('.sazo-root[data-view="beauty"] .sazo-beauty-search:focus-within');
```

- [ ] **Step 2: Run the style test to verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx
```

Expected: FAIL because the authoritative BEAUTY CSS block does not exist.

- [ ] **Step 3: Add one final authoritative BEAUTY CSS block**

Append a new `@media (max-width: 767px)` block at the end of `sazo.css`. Use these fixed geometry anchors from the 684×1474 @2x recording:

```css
@media (max-width: 767px) {
  .sazo-root[data-view="beauty"] {
    --sazo-beauty-green: #63df16;
    --sazo-beauty-mint: #effff2;
  }

  .sazo-root[data-view="beauty"] .sazo-content-main {
    padding-top: 78px;
    padding-bottom: calc(86px + env(safe-area-inset-bottom));
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header {
    position: fixed;
    z-index: 30;
    top: 0;
    right: 0;
    left: 0;
    height: 78px;
    border-radius: 0 0 16px 16px;
    background: #fff;
    box-shadow: 0 5px 12px rgb(20 31 54 / 12%);
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-category-rail,
  .sazo-root[data-view="beauty"] .sazo-beauty-product-rail {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    touch-action: pan-y;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-product-rail {
    display: grid;
    grid-auto-columns: calc((100% - 16px) / 3);
    grid-auto-flow: column;
    gap: 8px;
  }
```

Continue the same open media block with these concrete rules:

```css
  .sazo-root[data-view="beauty"] .sazo-beauty-header-top {
    display: flex;
    align-items: center;
    height: 49px;
    padding: 0 15px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-right: auto;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-brand img {
    width: 92px;
    height: auto;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-brand strong {
    color: var(--jplanet-sakura);
    font-size: 14px;
    font-weight: 900;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header-actions {
    display: flex;
    gap: 11px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header-actions button {
    display: grid;
    width: 30px;
    height: 36px;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--jplanet-ink);
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header-actions svg {
    width: 23px;
    height: 23px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header-nav {
    display: flex;
    align-items: stretch;
    height: 29px;
    padding: 0 24px;
    gap: 27px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header-nav button {
    padding: 0 0 7px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--jplanet-ink);
    font-size: 13px;
    font-weight: 750;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-header-nav button[aria-current="page"] {
    border-bottom-color: var(--jplanet-sakura);
    color: var(--jplanet-sakura-ink);
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-hero {
    padding: 40px 15px 0;
    text-align: center;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-store-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 74px;
    height: 26px;
    padding: 0 12px;
    border-radius: 999px;
    background: var(--sazo-beauty-mint);
    color: #27884d;
    font-size: 12px;
    font-weight: 800;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-hero h1 {
    margin: 13px 0 14px;
    color: #090c12;
    font-size: clamp(42px, 12.4vw, 48px);
    font-weight: 950;
    letter-spacing: -0.055em;
    line-height: 0.98;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-hero > p {
    margin: 0;
    color: #111827;
    font-size: 14px;
    font-weight: 650;
    line-height: 1.5;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-search {
    display: grid;
    grid-template-columns: 1fr 50px;
    align-items: center;
    height: 58px;
    margin: 20px 0 0;
    padding: 4px 4px 4px 20px;
    border: 1px solid #d5d9df;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 7px 18px rgb(27 41 66 / 14%);
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-search input {
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--jplanet-ink);
    font: inherit;
    font-size: 15px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-search button {
    display: grid;
    width: 50px;
    height: 50px;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: var(--sazo-beauty-green);
    color: #fff;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-guidance {
    display: flex;
    align-items: flex-start;
    min-height: 84px;
    padding: 4px 8px 0;
    gap: 3px;
    text-align: left;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-discovery,
  .sazo-root[data-view="beauty"] .sazo-beauty-trends {
    padding: 0 15px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-discovery h2,
  .sazo-root[data-view="beauty"] .sazo-beauty-trends h2 {
    margin: 0 0 18px;
    color: #0a0d13;
    font-size: 19px;
    font-weight: 900;
    line-height: 1.45;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-category-rail {
    display: flex;
    gap: 8px;
    margin: 0 -15px 14px;
    padding: 0 15px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-category-rail button {
    flex: 0 0 auto;
    height: 42px;
    padding: 0 16px;
    border: 1px solid #d7dbe1;
    border-radius: 999px;
    background: #fff;
    color: #111827;
    font-size: 13px;
    font-weight: 750;
    white-space: nowrap;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-category-rail button[aria-pressed="true"] {
    border-color: #0b1320;
    background: #0b1320;
    color: #fff;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-product-rail {
    margin: 0 -15px;
    padding: 0 15px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-product-card img,
  .sazo-root[data-view="beauty"] .sazo-beauty-skeleton {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 9px;
    object-fit: cover;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-product-card h3 {
    display: -webkit-box;
    margin: 8px 0 4px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 750;
    line-height: 1.3;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-product-card strong {
    font-size: 14px;
    font-weight: 900;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-trends {
    margin-top: 42px;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-ranked-list {
    display: grid;
    gap: 17px;
    margin: 28px 0 0;
    padding: 0;
    list-style: none;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-ranked-list li {
    display: grid;
    grid-template-columns: 28px 1fr;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-ranked-list li:nth-child(-n + 3) span {
    color: var(--jplanet-sakura);
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-skeleton {
    background: linear-gradient(90deg, #f1f2f4 25%, #fafafa 50%, #f1f2f4 75%);
    background-size: 200% 100%;
    animation: sazo-beauty-shimmer 1.2s linear infinite;
  }

  .sazo-root[data-view="beauty"] .sazo-beauty-search:focus-within,
  .sazo-root[data-view="beauty"] button:focus-visible {
    outline: 3px solid var(--jplanet-sakura);
    outline-offset: 2px;
  }

  .sazo-root[data-view="beauty"] .sazo-mobile-shell > .sazo-footer {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .sazo-root[data-view="beauty"] .sazo-beauty-skeleton {
      animation: none;
    }
  }
}

@keyframes sazo-beauty-shimmer {
  to { background-position-x: -200%; }
}
```

The CSS above implements these measured visual requirements:

- Header row 1 is 49px; row 2 is 29px.
- `J-Planet` wordmark is 92px wide at 341px viewport; `BEAUTY` is 14px, bold, sakura.
- Header actions are 30×36px with 23px icons and 11px gaps.
- Hero top padding is 40px, badge is 74×26px, heading is 42px/0.98 at 341px and caps at 48px, body is 14px/1.5.
- Search shell is 58px tall, side margins 15px, 999px radius; submit circle is 50px and uses `--sazo-beauty-green`.
- Guidance SVG/copy occupies 84px below the field.
- Content horizontal padding is 15px; section gap is 42px.
- Category chips are 42px tall and never wrap.
- Product images use `aspect-ratio: 1`, 9px radius, and `object-fit: cover`.
- Product names are two-line clamped at 13px/1.3; prices are 14px bold.
- Skeletons keep the identical three-column footprint and use a subtle 1.2s shimmer; disable shimmer under `prefers-reduced-motion: reduce`.
- The existing fixed mobile nav remains above the content at z-index 40.
- Hide `.sazo-mobile-shell > .sazo-footer` for `data-view="beauty"`, matching the home and agent views.
- Keep the existing chat bubble visible above the fixed bottom navigation, matching the supplied recording; do not change its behavior.
- Define `:focus-visible` for BEAUTY buttons and input with a 3px J-Planet sakura ring and 2px offset.

- [ ] **Step 4: Run focused unit, lint, and typecheck**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx
pnpm lint
pnpm typecheck
```

Expected: all commands PASS.

- [ ] **Step 5: Commit Task 4 only**

```bash
git add -- src/sazo-commerce/sazo.css tests/unit/sazo-commerce-beauty.test.tsx
git diff --cached --name-only
git commit -m "style: reproduce J-Planet beauty mobile layout"
```

---

### Task 5: Add Native Mobile E2E Coverage and Perform Visual Verification

**Files:**
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`
- Create: `design/reproductions/sazo-commerce/qa/beauty-341.png`
- Create: `design/reproductions/sazo-commerce/qa/beauty-440.png`

**Interfaces:**
- Consumes: the complete home → BEAUTY → product route and stable `data-beauty-*` hooks.
- Produces: repeatable mobile interaction coverage and two final visual artifacts for user review.

- [ ] **Step 1: Add a failing mobile E2E scenario**

Extend the existing mobile test after home shortcut assertions:

```ts
await page
  .getByRole("group", { name: "J-Planetショートカット" })
  .getByRole("button", { name: "コスメ" })
  .click();

const beauty = page.locator("[data-beauty-view]");
await expect(beauty).toBeVisible();
await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
await expect(page.getByText("J-Planet", { exact: true })).toBeVisible();
await expect(page.getByText("BEAUTY", { exact: true })).toBeVisible();

const search = page.getByRole("searchbox", { name: "BEAUTYの商品を検索" });
await search.fill("美容液");
await search.press("Enter");
await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
await expect(page.getByRole("dialog", { name: "J-Planet AIエージェント" })).toHaveCount(0);
await search.fill("");
await search.press("Enter");
```

Continue the scenario with explicit pointer drags and the existing detail back control:

```ts
const categoryRail = beauty.locator(".sazo-beauty-category-rail");
const categoryBox = await categoryRail.boundingBox();
if (categoryBox === null) throw new Error("Missing BEAUTY category rail geometry");
await dispatchNativeTouchGesture(page, [
  { x: categoryBox.x + categoryBox.width - 18, y: categoryBox.y + categoryBox.height / 2 },
  { x: categoryBox.x + categoryBox.width / 2, y: categoryBox.y + categoryBox.height / 2 },
  { x: categoryBox.x + 22, y: categoryBox.y + categoryBox.height / 2 },
]);
await expect.poll(() => categoryRail.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);

await beauty.getByRole("button", { name: "マスクパック" }).click();
await expect(
  beauty.getByRole("status", { name: "マスクパックの商品を読み込んでいます" }),
).toBeVisible();
await expect(beauty.getByRole("button", { name: "マスクパック" })).toHaveAttribute(
  "aria-pressed",
  "true",
  { timeout: 800 },
);
await expect(beauty.locator(".sazo-beauty-product-card")).toHaveCount(6);

const productRail = beauty.locator(".sazo-beauty-product-rail");
const productBox = await productRail.boundingBox();
if (productBox === null) throw new Error("Missing BEAUTY product rail geometry");
await dispatchNativeTouchGesture(page, [
  { x: productBox.x + productBox.width - 18, y: productBox.y + productBox.height / 2 },
  { x: productBox.x + productBox.width / 2, y: productBox.y + productBox.height / 2 },
  { x: productBox.x + 22, y: productBox.y + productBox.height / 2 },
]);
await expect.poll(() => productRail.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);

await beauty.locator(".sazo-beauty-product-card button").first().click();
await expect(page.locator("[data-product-detail]")).toBeVisible();
await page.locator(".sazo-product-detail-header .sazo-product-detail-back").click();
await expect(page.locator("[data-beauty-view]")).toBeVisible();
await expect(page.getByRole("navigation", { name: "モバイルメニュー" })).toBeVisible();
```

- [ ] **Step 2: Run the E2E test to verify RED, then resolve only BEAUTY failures**

Run:

```bash
pnpm test:e2e:sazo -- --project=mobile
```

Expected before the new behavior is complete: FAIL at the first BEAUTY selector. After Tasks 1–4: PASS. Do not rewrite unrelated agent/auth expectations; if another parallel change has altered them, report that conflict separately.

- [ ] **Step 3: Capture the 341px and 440px review images**

With the dev server on port 5190, capture `?qa=1&view=beauty` at these exact viewports by running:

```bash
mkdir -p design/reproductions/sazo-commerce/qa
node --input-type=module -e '
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [width, height] of [[341, 735], [440, 956]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://127.0.0.1:5190/sazo-commerce-mock/?qa=1&view=beauty");
  await page.screenshot({
    path: `design/reproductions/sazo-commerce/qa/beauty-${width}.png`,
    fullPage: false,
  });
}
await browser.close();
'
```

The exact output files are:

```text
341 × 735  → design/reproductions/sazo-commerce/qa/beauty-341.png
440 × 956  → design/reproductions/sazo-commerce/qa/beauty-440.png
```

The images must show, without horizontal page overflow:

- the complete dedicated header;
- the store badge, hero copy, and inline search;
- at least five visible/partially visible category chips;
- exactly three product columns;
- the beginning of `今話題のJ-Beautyトレンド`;
- the fixed bottom navigation.

Use `view_image` on both captures and compare them directly with frames at 0s and 8s from the supplied recording. Correct geometry differences before proceeding; do not accept missing sections, overlap, clipped search controls, or duplicate headers.

- [ ] **Step 4: Run the complete verification matrix**

Run fresh commands:

```bash
pnpm vitest run tests/unit/sazo-commerce-beauty.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e:sazo
git diff --check
```

Expected: every command PASS. If the dirty worktree contains an unrelated pre-existing failure, verify the BEAUTY scope in a clean temporary worktree at the final feature commit and report both results explicitly.

- [ ] **Step 5: Commit Task 5 only**

```bash
git add -- tests/e2e/sazo-commerce-reproduction.spec.ts design/reproductions/sazo-commerce/qa/beauty-341.png design/reproductions/sazo-commerce/qa/beauty-440.png
git diff --cached --name-only
git commit -m "test: verify J-Planet beauty mobile flow"
```

- [ ] **Step 6: Final handoff**

Report:

```text
変更: ホームのコスメから専用J-Planet BEAUTYへ遷移し、検索を画面内入力へ変更
確認: 341px/440pxの画像、unit、full test、lint、typecheck、build、desktop/mobile E2E
残る範囲外: 本番検索API、カート、決済、デスクトップ専用BEAUTYデザイン
URL: http://127.0.0.1:5190/sazo-commerce-mock/?qa=1&view=beauty
```
