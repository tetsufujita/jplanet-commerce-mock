# J-Planet Mobile Agent Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the fast home-page AI composer while adding a SAZO-search-inspired mobile agent hub behind the fixed `エージェント` navigation item.

**Architecture:** Add `agent-hub` as a reducer-owned `SazoView`, render one focused `MobileAgentHubView`, and keep the existing `agent` overlay as the only composer. The hub owns only transient clear/hide state; product, catalog, overlay, and return navigation continue through the existing reducer.

**Tech Stack:** React 19, TypeScript, i18next, Lucide React, CSS, Vitest + Testing Library, Playwright, Vite.

## Global Constraints

- The home launcher `URL・画像・商品名をAIに相談` must continue opening the existing bottom sheet.
- The fixed mobile `エージェント` item must navigate to `agent-hub`, not open the sheet directly.
- The hub must show, in order: fixed header, `最近の相談`, `最近見た商品`, `J-Planet AI` / `ブラジルで人気の日本アイテム`, then the J-Planet footer.
- The hub header launcher must open the same `J-Planet AIエージェント` overlay used by the home launcher.
- The five-item mobile navigation must stay 76px high and mark `エージェント` selected on the hub.
- Mobile breakpoint: `767px` and below. Required visual widths: `440 × 956` and `341 × 735`.
- No document-level horizontal overflow; only the recent-products rail may scroll horizontally.
- Add every new user-facing string to `ja`, `en`, and `pt-BR` locale resources.
- Do not add real AI, persistence, recommendation, cart, checkout, PRC, inventory, price, or shipping behavior.
- Do not change existing desktop navigation or desktop home rendering.
- Preserve unrelated dirty and untracked workspace files.

---

## File Structure

- Create `src/sazo-commerce/agentHubFixtures.ts`: typed recent-consultation and popular-topic content plus the selected existing recent products.
- Create `src/sazo-commerce/MobileAgentHubView.tsx`: the dedicated mobile hub and its transient clear/hide state.
- Create `tests/unit/sazo-commerce-agent-hub.test.tsx`: component structure, behavior, accessibility, and locale coverage.
- Modify `src/sazo-commerce/model.ts`: register the `agent-hub` reducer view and QA query support.
- Modify `src/sazo-commerce/SazoShell.tsx`: route the fixed agent nav to the hub and suppress the generic mobile header on that view.
- Modify `src/sazo-commerce/SazoCommercePage.tsx`: mount `MobileAgentHubView` for the new view.
- Modify `src/i18n/locales/{ja,en,pt-BR}.json`: add `sazo.agentHub.*` copy.
- Modify `src/sazo-commerce/sazo.css`: implement the 440/341 mobile layout without touching desktop composition.
- Modify `tests/unit/sazo-commerce-model.test.ts` and `tests/unit/sazo-commerce-shell.test.tsx`: reducer and shell integration coverage.
- Modify `tests/e2e/sazo-commerce-reproduction.spec.ts` and `scripts/sazo-mobile-home-capture.mjs`: exercise and capture the new hub.

---

### Task 1: Register the agent hub and route the fixed navigation

**Files:**
- Modify: `src/sazo-commerce/model.ts`
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `tests/unit/sazo-commerce-model.test.ts`
- Modify: `tests/unit/sazo-commerce-shell.test.tsx`

**Interfaces:**
- Produces: `SazoView` value `"agent-hub"` accepted by `{ type: "navigate"; view: SazoView }` and `?qa=1&view=agent-hub`.
- Produces: the fixed agent navigation dispatches `{ type: "navigate", view: "agent-hub" }` and exposes selected state through `aria-pressed="true"`.
- Consumes: existing `NavigationButton`, `Sparkles`, `sazoReducer`, and `createInitialSazoState`.

- [ ] **Step 1: Write failing reducer and shell tests**

Add to `tests/unit/sazo-commerce-model.test.ts`:

```ts
it("supports the mobile agent hub as a reducer and QA view", () => {
  const navigated = sazoReducer(createInitialSazoState(), {
    type: "navigate",
    view: "agent-hub",
  });
  const qaState = createInitialSazoState("?qa=1&view=agent-hub");

  expect(navigated.view).toBe("agent-hub");
  expect(navigated.overlay).toBe("none");
  expect(qaState.view).toBe("agent-hub");
});
```

Replace the existing shell expectation that clicking the mobile agent control opens an overlay with:

```ts
it("navigates to the dedicated hub from the fixed agent item", async () => {
  const { container } = await renderSazoCommercePage();
  const mobileNav = getShell(container, "mobile").querySelector(".sazo-mobile-nav");
  const agent = within(mobileNav as HTMLElement).getByRole("button", {
    name: "エージェント",
  });

  fireEvent.click(agent);

  expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
    "agent-hub",
  );
  expect(agent.getAttribute("aria-pressed")).toBe("true");
  expect(screen.queryByRole("dialog", { name: "J-Planet AIエージェント" })).toBeNull();
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Expected: TypeScript/Vitest fails because `agent-hub` is not a `SazoView`, is not in `qaViews`, and the mobile control still dispatches `open-agent`.

- [ ] **Step 3: Add the minimal reducer and navigation implementation**

In `src/sazo-commerce/model.ts`, add `"agent-hub"` to both the `SazoView` union and `qaViews` set.

In `src/sazo-commerce/SazoShell.tsx`, replace the agent `ControlButton` with:

```tsx
<NavigationButton
  className="sazo-nav-button sazo-agent-nav-button"
  dispatch={dispatch}
  icon={Sparkles}
  label={t("sazo.agent.navigation")}
  state={state}
  view="agent-hub"
/>
```

Do not alter the home launcher, `open-agent` action, or overlay renderer.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2.

Expected: both test files pass and the agent button changes the reducer view without opening a dialog.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/sazo-commerce/model.ts src/sazo-commerce/SazoShell.tsx tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-shell.test.tsx
git commit -m "feat: route mobile agent navigation to hub"
```

---

### Task 2: Build the translated agent hub content and interactions

**Files:**
- Create: `src/sazo-commerce/agentHubFixtures.ts`
- Create: `src/sazo-commerce/MobileAgentHubView.tsx`
- Create: `tests/unit/sazo-commerce-agent-hub.test.tsx`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`

**Interfaces:**
- Consumes: `Dispatch<SazoAction>`, `interestedProducts`, existing product IDs, and existing `open-agent`, `open-product`, and `navigate` actions.
- Produces: `MobileAgentHubView({ dispatch }: { dispatch: Dispatch<SazoAction> })`.
- Produces: `agentHubRecentConsultations`, `agentHubRecentProducts`, and `agentHubPopularTopics` typed readonly arrays.

- [ ] **Step 1: Write the failing component tests**

Create `tests/unit/sazo-commerce-agent-hub.test.tsx` with this locale-aware renderer:

```tsx
async function renderHub(
  locale: "ja" | "en" | "pt-BR" = "ja",
  dispatch = vi.fn(),
) {
  const i18n = await createI18n(locale);

  return {
    dispatch,
    ...render(
      <I18nextProvider i18n={i18n}>
        <MobileAgentHubView dispatch={dispatch} />
      </I18nextProvider>,
    ),
  };
}
```

Add these behavior tests:

```tsx
it("renders the SAZO-inspired sections in the approved order", async () => {
  await renderHub("ja");

  expect(
    screen.getAllByTestId("agent-hub-section").map((section) => section.dataset.section),
  ).toEqual(["consultations", "recent-products", "popular-topics", "footer"]);
  expect(screen.getByText("最近の相談")).toBeTruthy();
  expect(screen.getByText("最近見た商品")).toBeTruthy();
  expect(screen.getByText("J-Planet AI")).toBeTruthy();
  expect(screen.getByText("ブラジルで人気の日本アイテム")).toBeTruthy();
  expect(screen.getAllByRole("listitem", { name: /位/ })).toHaveLength(20);
});

it("dispatches shared agent, home, product, and catalog actions", async () => {
  const dispatch = vi.fn();
  await renderHub("ja", dispatch);

  fireEvent.click(screen.getByRole("button", { name: "AIエージェントに相談" }));
  fireEvent.click(screen.getByRole("button", { name: "ホームへ戻る" }));
  fireEvent.click(screen.getAllByRole("button", { name: /商品詳細を見る/ })[0]);
  fireEvent.click(screen.getByRole("button", { name: "1位 アニメグッズ" }));

  expect(dispatch).toHaveBeenNthCalledWith(1, { type: "open-agent" });
  expect(dispatch).toHaveBeenNthCalledWith(2, { type: "navigate", view: "home" });
  expect(dispatch).toHaveBeenNthCalledWith(3, {
    type: "open-product",
    productId: expect.any(String),
  });
  expect(dispatch).toHaveBeenNthCalledWith(4, { type: "navigate", view: "catalog" });
});

it("clears only the requested transient section", async () => {
  await renderHub("ja");

  fireEvent.click(screen.getByRole("button", { name: "最近の相談を削除" }));
  expect(screen.queryByText("日本限定スニーカーを探したい")).toBeNull();
  expect(screen.getAllByRole("button", { name: /商品詳細を見る/ })).toHaveLength(3);
});
```

Add one parameterized locale test asserting the translated hub input label and all four fixed section headings for `ja`, `en`, and `pt-BR`.

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-commerce-agent-hub.test.tsx --reporter=dot
```

Expected: FAIL because the component, fixtures, and `sazo.agentHub.*` locale keys do not exist.

- [ ] **Step 3: Add typed fixtures**

Create `src/sazo-commerce/agentHubFixtures.ts`:

```ts
import { interestedProducts, type Product } from "@/sazo-commerce/fixtures";

export interface AgentHubConsultation {
  id: string;
  label: string;
}

export interface AgentHubTopic {
  id: string;
  labelKey: `sazo.agentHub.topics.${string}`;
  rank: number;
}

export const agentHubRecentConsultations: readonly AgentHubConsultation[] = [
  { id: "url", label: "coupang.com/vp/products/5973528469" },
  { id: "sneakers", label: "日本限定スニーカーを探したい" },
  { id: "image", label: "この画像の商品が欲しい" },
];

export const agentHubRecentProducts: readonly Product[] = interestedProducts.slice(0, 3);

export const agentHubPopularTopics: readonly AgentHubTopic[] = [
  { id: "anime", labelKey: "sazo.agentHub.topics.anime", rank: 1 },
  { id: "skincare", labelKey: "sazo.agentHub.topics.skincare", rank: 2 },
  { id: "sneakers", labelKey: "sazo.agentHub.topics.sneakers", rank: 3 },
  { id: "characters", labelKey: "sazo.agentHub.topics.characters", rank: 4 },
  { id: "stationery", labelKey: "sazo.agentHub.topics.stationery", rank: 5 },
  { id: "kitchen", labelKey: "sazo.agentHub.topics.kitchen", rank: 6 },
  { id: "beauty-devices", labelKey: "sazo.agentHub.topics.beautyDevices", rank: 7 },
  { id: "gaming", labelKey: "sazo.agentHub.topics.gaming", rank: 8 },
  { id: "watches", labelKey: "sazo.agentHub.topics.watches", rank: 9 },
  { id: "cameras", labelKey: "sazo.agentHub.topics.cameras", rank: 10 },
  { id: "outdoor", labelKey: "sazo.agentHub.topics.outdoor", rank: 11 },
  { id: "baby", labelKey: "sazo.agentHub.topics.baby", rank: 12 },
  { id: "hobby", labelKey: "sazo.agentHub.topics.hobby", rank: 13 },
  { id: "food", labelKey: "sazo.agentHub.topics.food", rank: 14 },
  { id: "matcha", labelKey: "sazo.agentHub.topics.matcha", rank: 15 },
  { id: "fashion", labelKey: "sazo.agentHub.topics.fashion", rank: 16 },
  { id: "bags", labelKey: "sazo.agentHub.topics.bags", rank: 17 },
  { id: "home-decor", labelKey: "sazo.agentHub.topics.homeDecor", rank: 18 },
  { id: "pet", labelKey: "sazo.agentHub.topics.pet", rank: 19 },
  { id: "limited", labelKey: "sazo.agentHub.topics.limited", rank: 20 },
];
```

Keep this exact 20-entry order; do not synthesize topic names at runtime.

- [ ] **Step 4: Add all locale keys**

Under `sazo.agentHub`, add these exact Japanese values and direct English/Portuguese translations for the same keys:

```json
{
  "launcher": "URL・画像・商品名をAIに相談",
  "launcherLabel": "AIエージェントに相談",
  "backHome": "ホームへ戻る",
  "recentConsultations": "最近の相談",
  "clearConsultations": "最近の相談を削除",
  "recentProducts": "最近見た商品",
  "clearProducts": "最近見た商品を削除",
  "brand": "J-Planet AI",
  "popularTitle": "ブラジルで人気の日本アイテム",
  "productDetails": "{{name}}の商品詳細を見る",
  "rankedTopic": "{{rank}}位 {{topic}}"
}
```

Use these exact topic translations:

| Key | ja | en | pt-BR |
| --- | --- | --- | --- |
| anime | アニメグッズ | Anime goods | Produtos de anime |
| skincare | スキンケア | Skincare | Cuidados com a pele |
| sneakers | スニーカー | Sneakers | Tênis |
| characters | キャラクター雑貨 | Character goods | Artigos de personagens |
| stationery | 文具 | Stationery | Papelaria |
| kitchen | キッチン用品 | Kitchen goods | Artigos de cozinha |
| beautyDevices | 美容家電 | Beauty devices | Aparelhos de beleza |
| gaming | ゲーム | Gaming | Games |
| watches | 腕時計 | Watches | Relógios |
| cameras | カメラ | Cameras | Câmeras |
| outdoor | アウトドア用品 | Outdoor goods | Artigos para atividades ao ar livre |
| baby | ベビー用品 | Baby goods | Artigos para bebês |
| hobby | ホビー・フィギュア | Hobby and figures | Hobbies e figuras |
| food | 日本食品 | Japanese food | Alimentos japoneses |
| matcha | 抹茶・お茶 | Matcha and tea | Matcha e chá |
| fashion | 日本ブランド服 | Japanese fashion | Moda japonesa |
| bags | バッグ | Bags | Bolsas |
| homeDecor | インテリア雑貨 | Home decor | Decoração |
| pet | ペット用品 | Pet goods | Artigos para pets |
| limited | 日本限定品 | Japan exclusives | Produtos exclusivos do Japão |

Reuse the existing `sazo.auth.page.company`, `careers`, `press`, `terms`, `privacy`, `commerce`, `brazilCopyright`, `brazilAddress`, `japanCopyright`, and `japanAddress` keys for the footer instead of duplicating company/legal copy. Preserve the existing `sazo.agent.*` strings unchanged.

- [ ] **Step 5: Implement `MobileAgentHubView` minimally**

Create a component that:

- uses `useState(true)` for consultation and product visibility,
- uses semantic `section`, `ol`, `li`, `nav`, and `footer` elements,
- dispatches `open-agent` from the compact launcher,
- dispatches `navigate/home` from both back and home buttons,
- dispatches `open-product` from each product button,
- dispatches `navigate/catalog` from each topic button,
- renders the cart button with `t("sazo.actions.cart")` but no new state transition,
- gives each topic `li` the localized `t("sazo.agentHub.rankedTopic", { rank, topic })` accessible name,
- renders company/legal links and company copy only from the existing `sazo.auth.page.*` keys,
- uses `data-testid="agent-hub-section"` and `data-section` only on the four ordered content groups.

The component root must be:

```tsx
<div className="sazo-agent-hub" data-mobile-agent-hub>
```

- [ ] **Step 6: Run the new component tests and verify GREEN**

Run the command from Step 2.

Expected: all structure, behavior, clearing, accessibility-name, and locale tests pass.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/sazo-commerce/agentHubFixtures.ts src/sazo-commerce/MobileAgentHubView.tsx tests/unit/sazo-commerce-agent-hub.test.tsx src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json
git commit -m "feat: add mobile agent hub content"
```

---

### Task 3: Integrate and style the mobile-only hub

**Files:**
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `tests/unit/sazo-commerce-shell.test.tsx`
- Modify: `tests/unit/sazo-commerce-agent-hub.test.tsx`

**Interfaces:**
- Consumes: `MobileAgentHubView`, the `agent-hub` view from Task 1, and the translated content from Task 2.
- Produces: `[data-mobile-agent-hub]` mounted only when `state.view === "agent-hub"`; generic mobile header hidden on that view; fixed nav remains visible and selected.

- [ ] **Step 1: Add failing integration and layout contract tests**

In `tests/unit/sazo-commerce-shell.test.tsx`, add:

```tsx
it("mounts the dedicated hub without the generic mobile header", async () => {
  window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=agent-hub");
  const { container } = await renderSazoCommercePage();

  expect(container.querySelector("[data-mobile-agent-hub]")).not.toBeNull();
  expect(container.querySelector(".sazo-mobile-shell .sazo-mobile-header")).toBeNull();
  expect(container.querySelector(".sazo-mobile-nav")).not.toBeNull();
});
```

In `tests/unit/sazo-commerce-agent-hub.test.tsx`, assert the component exposes the class hooks used for a sticky header, single-line launcher, horizontal product rail, ranked list, and footer.

- [ ] **Step 2: Run focused integration tests and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-commerce-agent-hub.test.tsx tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Expected: FAIL because the page does not mount the hub and the generic mobile header is still present.

- [ ] **Step 3: Mount the hub and suppress only the duplicate mobile header**

In `SazoCommercePage.tsx`, import and mount:

```tsx
{state.view === "agent-hub" ? <MobileAgentHubView dispatch={dispatch} /> : null}
```

In `SazoShell.tsx`, derive:

```ts
const agentHubView = state.view === "agent-hub";
```

Render the generic `.sazo-mobile-header` only when `agentHubView` is false. Do not hide the fixed navigation.

- [ ] **Step 4: Add scoped mobile CSS**

Within the existing mobile media block, add rules scoped by `.sazo-root[data-view="agent-hub"]` and `.sazo-agent-hub`:

- white page, navy text, sakura accents,
- sticky 52px header below the safe viewport top,
- `36px 12px 40px 12px` control row for back/launcher/home/cart,
- launcher `min-width: 0`, `text-overflow: ellipsis`, no wrapping,
- section padding `16px`, headings approximately 20px/700,
- recent consultations as clipped one-line rows,
- recent products as three `124px` cards in an internal horizontal rail,
- popular topics as a compact 20-row list with only ranks 1–3 in sakura,
- footer separated by a 1px line and bottom padding at least `calc(96px + env(safe-area-inset-bottom))`,
- `.sazo-root[data-view="agent-hub"] .sazo-mobile-shell > .sazo-footer` hidden,
- no styles outside the mobile breakpoint that alter existing desktop views.

Reuse `--jplanet-*` tokens; do not add hardcoded SAZO pink or new font imports.

- [ ] **Step 5: Run focused tests, lint, and typecheck**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-commerce-agent-hub.test.tsx tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
pnpm lint
pnpm typecheck
```

Expected: all commands pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/SazoShell.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-agent-hub.test.tsx
git commit -m "feat: integrate SAZO-inspired agent hub"
```

---

### Task 4: Prove the hybrid journey and visual fidelity

**Files:**
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`
- Modify: `scripts/sazo-mobile-home-capture.mjs`

**Interfaces:**
- Consumes: home launcher overlay, fixed nav `agent-hub`, hub launcher overlay, catalog submission, existing 440/341/desktop capture infrastructure.
- Produces: screenshots `/tmp/jplanet-mobile-agent-hub.png` and `/tmp/jplanet-mobile-agent-hub-341x735.png` plus deterministic geometry/overflow assertions.

- [ ] **Step 1: Extend the mobile E2E with the full hybrid flow**

After the existing home-launcher dialog check, add:

```ts
await page.getByRole("button", { exact: true, name: "エージェント" }).click();
await expect(page.locator("[data-mobile-agent-hub]")).toBeVisible();
await expect(page.getByRole("heading", { name: "最近の相談" })).toBeVisible();
await expect(page.getByRole("heading", { name: "最近見た商品" })).toBeVisible();
await expect(
  page.getByRole("heading", { name: "ブラジルで人気の日本アイテム" }),
).toBeVisible();
await expect(page.getByRole("button", { name: "エージェント" })).toHaveAttribute(
  "aria-pressed",
  "true",
);

await page.getByRole("button", { name: "AIエージェントに相談" }).click();
const hubAgent = page.getByRole("dialog", { name: "J-Planet AIエージェント" });
await hubAgent.getByRole("textbox").fill("日本限定スニーカー");
await hubAgent.getByRole("button", { name: "AIに探してもらう" }).click();
await expect(page.locator("[data-catalog-view]")).toBeVisible();
```

Add checks for clearing consultation history, opening one product and returning to `agent-hub`, and no external application requests.

- [ ] **Step 2: Run the hybrid E2E before adding capture assertions**

Run:

```bash
pnpm test:e2e:sazo
```

Expected: desktop and mobile scenarios pass against the completed Tasks 1–3. A failure here is a functional regression and must be fixed in the owning task before the visual capture gate is expanded.

- [ ] **Step 3: Extend the capture script**

At 440px:

- click the fixed `エージェント` button,
- assert the hub header width equals viewport width,
- assert five fixed nav buttons and nav height `76 ± 2px`,
- assert 3 recent product cards and 20 ranked topics,
- assert document scroll width equals `440`,
- take `/tmp/jplanet-mobile-agent-hub.png`.

At 341px:

- open `?qa=1&view=agent-hub`,
- assert document scroll width equals `341`,
- assert the compact launcher text is clipped rather than wrapping,
- take `/tmp/jplanet-mobile-agent-hub-341x735.png`.

Retain the existing home, PICK-image load, and desktop regression assertions.

- [ ] **Step 4: Run all verification gates**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --reporter=dot
pnpm build
pnpm test:e2e:sazo
node scripts/sazo-mobile-home-capture.mjs
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5190/sazo-commerce-mock/
```

Expected:

- lint/typecheck/build exit 0,
- every Vitest file passes,
- Playwright desktop + mobile pass,
- capture prints `sazo-mobile-home-capture-ok`,
- HTTP status is `200`.

- [ ] **Step 5: Inspect visual outputs**

Open and compare:

- `/tmp/jplanet-mobile-agent-hub.png`
- `/tmp/jplanet-mobile-agent-hub-341x735.png`
- `/tmp/jplanet-mobile-home-top.png`
- `/tmp/jplanet-desktop-home-regression.png`

Reject the build if the hub has document overflow, overlapping fixed navigation, two mobile headers, broken/empty product images, unreadable compact text, or SAZO branding.

- [ ] **Step 6: Commit Task 4**

```bash
git add tests/e2e/sazo-commerce-reproduction.spec.ts scripts/sazo-mobile-home-capture.mjs
git commit -m "test: verify mobile agent hub journey"
```

---

## Final Review Checklist

- [ ] Confirm `git diff --check` passes for the complete implementation range.
- [ ] Confirm the four original agent strings remain unchanged.
- [ ] Confirm all new strings exist in `ja`, `en`, and `pt-BR`.
- [ ] Confirm the home launcher still opens the composer immediately.
- [ ] Confirm the fixed agent navigation opens the dedicated hub.
- [ ] Confirm the hub launcher reuses the same accessible modal.
- [ ] Confirm 440px and 341px have no document overflow.
- [ ] Confirm desktop remains on the existing desktop branch.
- [ ] Confirm unrelated dirty files were not staged or committed.
