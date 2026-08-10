# J-Planet Mobile My Page Reproduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the complete recorded SAZO mobile My Page journey as a deterministic J-Planet-branded local mock.

**Architecture:** Extend the existing reducer view union, keep the established account screen frame in `AccountViews.tsx`, and route every recorded destination through `SazoCommercePage.tsx`. Use local component state for tabs, toggles, and form-only interactions; no external API or persistence is introduced.

**Tech Stack:** React 19, TypeScript 5.9, i18next, lucide-react, Vitest + Testing Library, Playwright, CSS media queries.

## Global Constraints

- Use the recording at `/var/folders/f9/g75lkj552h7dv5fxlp1ztx040000gn/T/TemporaryItems/NSIRD_screencaptureui_9ghJeP/画面収録 2026-08-10 16.17.32.mov` as the visual and interaction reference.
- Preserve SAZO information architecture, placement, transitions, sticky account header, fixed bottom navigation, and fixed action controls.
- Replace SAZO logo, company name, and brand colors with J-Planet assets and tokens.
- Keep the center bottom-navigation destination labelled `エージェント`.
- Do not connect external services, production account APIs, payment APIs, card storage, or address storage.
- Do not alter home hero, banner, category, or product-rail structure.
- Verify 341 px, 345 px, and 440 px mobile widths with no horizontal overflow.

---

### Task 1: Add the complete recorded account route model

**Files:**
- Modify: `src/sazo-commerce/model.ts`
- Modify: `src/sazo-commerce/fixtures.ts`
- Test: `tests/unit/sazo-commerce-model.test.ts`

**Interfaces:**
- Produces: `SazoAccountView`, the account route members in `SazoView`, and expanded `SazoAccountFixture` values used by account screens.
- Produces route names: `orders`, `coupons`, `points`, `review-create`, `review-history`, `delivery`, `address`, `notifications`, and `support`.

- [ ] **Step 1: Write failing route and fixture tests**

```ts
it.each([
  "orders",
  "coupons",
  "points",
  "review-create",
  "review-history",
  "delivery",
  "address",
  "notifications",
  "support",
] as const)("accepts the recorded account QA route %s", (view) => {
  expect(createInitialSazoState(`?qa=1&view=${view}`).view).toBe(view);
});

it("uses the recorded account balances", () => {
  expect(sazoAccountFixture).toMatchObject({ coupons: 1, points: 500 });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- tests/unit/sazo-commerce-model.test.ts`

Expected: the new QA routes fall back to `home`, and the coupon fixture assertion reports `0` instead of `1`.

- [ ] **Step 3: Add typed account routes and fixture values**

```ts
export type SazoAccountView =
  | "mypage"
  | "favorites"
  | "profile"
  | "cards"
  | "orders"
  | "coupons"
  | "points"
  | "review-create"
  | "review-history"
  | "delivery"
  | "address"
  | "notifications"
  | "support";

export type SazoView =
  | SazoAccountView
  | "home"
  | "service"
  | "brands"
  | "categories"
  | "catalog"
  | "campaign"
  | "reviews"
  | "ranking"
  | "product"
  | "gram"
  | "gram-detail"
  | "agent-hub";
```

Add every account route to `qaViews`:

```ts
const qaViews = new Set<SazoView>([
  "home", "service", "brands", "categories", "catalog", "campaign",
  "reviews", "ranking", "product", "gram", "gram-detail", "agent-hub",
  "mypage", "favorites", "profile", "cards", "orders", "coupons",
  "points", "review-create", "review-history", "delivery", "address",
  "notifications", "support",
]);
```

Update `sazoAccountFixture.coupons` to `1` and add recorded display values needed by the account screens:

```ts
export interface SazoAccountFixture {
  coupons: number;
  displayName: string;
  email: string;
  phone: string;
  birthday: string;
  points: number;
  pendingPoints: number;
  expiringPoints: number;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm test -- tests/unit/sazo-commerce-model.test.ts`

Expected: all model tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/sazo-commerce/model.ts src/sazo-commerce/fixtures.ts tests/unit/sazo-commerce-model.test.ts
git commit -m "feat: add recorded mypage route model"
```

---

### Task 2: Build every recorded My Page destination and interaction

**Files:**
- Modify: `src/sazo-commerce/AccountViews.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Test: `tests/unit/sazo-commerce-account.test.tsx`
- Test: `tests/unit/sazo-commerce-shell.test.tsx`

**Interfaces:**
- Consumes: `SazoAccountView` and the expanded `sazoAccountFixture` from Task 1.
- Produces: exported React components `OrdersView`, `CouponsView`, `PointsView`, `ReviewCreateView`, `ReviewHistoryView`, `DeliveryView`, `AddressView`, `NotificationsView`, and `SupportView`.
- Produces: complete route rendering for every `SazoAccountView`.

- [ ] **Step 1: Write failing navigation and screen-content tests**

```tsx
it("dispatches every recorded My Page destination", async () => {
  const dispatch = vi.fn();
  await renderWithI18n(<MyPageView dispatch={dispatch} />);

  const destinations = [
    ["注文履歴", "orders"],
    ["お気に入り", "favorites"],
    ["クーポン", "coupons"],
    ["ポイント", "points"],
    ["レビューを作成", "review-create"],
    ["作成したレビュー", "review-history"],
    ["会員情報の修正", "profile"],
    ["登録カード管理", "cards"],
    ["配送先管理", "delivery"],
    ["通知設定", "notifications"],
    ["サポート", "support"],
  ] as const;

  for (const [label, view] of destinations) {
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "navigate", view });
  }
});

it.each([
  [OrdersView, "注文履歴", "検索結果が見つかりませんでした。"],
  [CouponsView, "クーポン", "送料50%割引クーポン"],
  [PointsView, "ポイント", "500P"],
  [ReviewCreateView, "レビュー作成", "レビュー済みの場合"],
  [ReviewHistoryView, "作成したレビュー", "作成したレビューがございません"],
  [CardsView, "登録カード管理", "登録されているカードがありません。"],
  [DeliveryView, "配送先管理", "登録されたお届け先住所がありません。"],
  [NotificationsView, "通知設定", "メール通知"],
  [SupportView, "ヘルプ", "何かお困りですか？"],
] as const)("renders %s", async (View, heading, copy) => {
  await renderWithI18n(<View dispatch={noDispatch} />);
  expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
  expect(screen.getByText(copy, { exact: false })).toBeTruthy();
});
```

Add the interaction tests:

```tsx
it("switches point filters and notification settings locally", async () => {
  await renderWithI18n(<PointsView dispatch={noDispatch} />);
  const used = screen.getByRole("tab", { name: "利用済み" });
  fireEvent.click(used);
  expect(used.getAttribute("aria-selected")).toBe("true");

  cleanup();
  await renderWithI18n(<NotificationsView dispatch={noDispatch} />);
  const email = screen.getByRole("switch", { name: "メール通知" });
  expect(email.getAttribute("aria-checked")).toBe("true");
  fireEvent.click(email);
  expect(email.getAttribute("aria-checked")).toBe("false");
});

it("opens the recorded address form from delivery management", async () => {
  const dispatch = vi.fn();
  await renderWithI18n(<DeliveryView dispatch={dispatch} />);
  fireEvent.click(screen.getByRole("button", { name: "配送先を追加" }));
  expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "address" });
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `pnpm test -- tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-commerce-shell.test.tsx`

Expected: imports for the new views fail and current menu items do not dispatch the recorded routes.

- [ ] **Step 3: Implement the shared recorded account structure**

Keep `AccountHeader` and `AccountViewFrame`. Add a local footer shared by the recorded account screens:

```tsx
function AccountLegalFooter() {
  const { t } = useTranslation();
  return (
    <footer className="sazo-account-legal-footer">
      <nav aria-label={t("sazo.account.footer.companyLinksLabel")}>
        <button type="button">{t("sazo.account.footer.company")}</button>
        <button type="button">{t("sazo.account.footer.recruit")}</button>
        <button type="button">{t("sazo.account.footer.press")}</button>
      </nav>
      <p>{t("sazo.account.footer.companyCopy")}</p>
      <nav aria-label={t("sazo.account.footer.policyLinksLabel")}>
        <button type="button">{t("sazo.account.footer.terms")}</button>
        <button type="button">{t("sazo.account.footer.privacy")}</button>
        <button type="button">{t("sazo.account.footer.commercial")}</button>
      </nav>
    </footer>
  );
}
```

`AccountViewFrame` renders the sticky account header, its screen body, and `AccountLegalFooter`. Keep all links local buttons or inert anchors with `href="#"` and `preventDefault()`.

- [ ] **Step 4: Implement all menu routes and screen-local state**

Connect every `AccountLink` in `MyPageView` to its recorded route. Use local state for deterministic controls:

```tsx
const [pointFilter, setPointFilter] = useState<"all" | "earned" | "used">("all");
const [emailEnabled, setEmailEnabled] = useState(true);
const [mobileEnabled, setMobileEnabled] = useState(true);
```

Use `role="switch"` and `aria-checked` for notifications. Use `role="tab"`/`aria-selected` for favorites and point-history filters. `DeliveryView` dispatches `address`; `AddressView` validates through native required fields only and returns to `delivery` on submit. `SupportView` reproduces the FAQ cards, customer-support card, guide cards, and keyword search shown in the recording.

- [ ] **Step 5: Route every account screen and keep account chrome active**

Import and render all exported views in `SazoCommercePage.tsx`:

```tsx
{state.view === "orders" ? <OrdersView dispatch={dispatch} /> : null}
{state.view === "coupons" ? <CouponsView dispatch={dispatch} /> : null}
{state.view === "points" ? <PointsView dispatch={dispatch} /> : null}
{state.view === "review-create" ? <ReviewCreateView dispatch={dispatch} /> : null}
{state.view === "review-history" ? <ReviewHistoryView dispatch={dispatch} /> : null}
{state.view === "delivery" ? <DeliveryView dispatch={dispatch} /> : null}
{state.view === "address" ? <AddressView dispatch={dispatch} /> : null}
{state.view === "notifications" ? <NotificationsView dispatch={dispatch} /> : null}
{state.view === "support" ? <SupportView dispatch={dispatch} /> : null}
```

Replace the hard-coded account view array in `SazoShell.tsx` with a typed `Set<SazoAccountView>`. All account views hide the standard mobile header and retain the fixed bottom nav. The active My Page item remains highlighted for account detail routes.

- [ ] **Step 6: Add complete i18n keys in all three locales**

Add identical key structure under `sazo.account` for `footer`, `orders`, `coupons`, `points`, `reviews`, `delivery`, `address`, `notifications`, and `support`. Japanese is the visible reference text. English and Portuguese receive real equivalent strings, not duplicated Japanese placeholders.

- [ ] **Step 7: Run focused tests, locale parity, and typecheck**

Run:

```bash
pnpm test -- tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: focused tests and TypeScript pass; no locale key is missing.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/sazo-commerce/AccountViews.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/SazoShell.tsx src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-commerce-shell.test.tsx
git commit -m "feat: reproduce complete mobile mypage journey"
```

---

### Task 3: Match the recorded mobile geometry and fixed controls

**Files:**
- Modify: `src/sazo-commerce/sazo.css`
- Create: `scripts/sazo-mypage-browser.mjs`
- Modify: `package.json`
- Test: `tests/unit/sazo-commerce-account.test.tsx`

**Interfaces:**
- Consumes: `data-view-content` values and account class hooks from Task 2.
- Produces: `pnpm test:sazo-mypage-browser`, screenshots in `/tmp`, and geometry assertions for the mobile account flow.

- [ ] **Step 1: Write the browser geometry check before CSS changes**

Create a Vite + Playwright script following `scripts/sazo-commerce-account-browser.mjs`. For 341, 345, and 440 px widths it must:

```js
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
assert.equal(Math.round((await header.boundingBox()).y), 0);
assert.equal(Math.round((await bottomNav.boundingBox()).y + (await bottomNav.boundingBox()).height), height);
assert((await firstMenuRow.boundingBox()).height >= 42);
assert((await chat.boundingBox()).y + (await chat.boundingBox()).height < (await bottomNav.boundingBox()).y + 2);
```

The script navigates directly with `?qa=1&view=mypage`, captures the top and settings positions, opens every detail route, checks fixed action buttons, and writes screenshots to `/tmp/jplanet-mypage-<width>-<view>.png`.

- [ ] **Step 2: Run the browser check and verify RED**

Run: `node scripts/sazo-mypage-browser.mjs`

Expected: recorded geometry assertions fail against the current oversized account CSS and missing per-view fixed-action layout.

- [ ] **Step 3: Implement mobile-first recorded styling**

Update the account CSS under `@media (max-width: 767px)` so that:

```css
.sazo-root .sazo-account-header {
  min-height: 36px;
  padding: 0 8px;
  box-shadow: 0 2px 7px rgb(21 36 65 / 12%);
}

.sazo-root .sazo-account-content,
.sazo-root .sazo-account-screen-content,
.sazo-root .sazo-profile-form {
  width: 100%;
  padding: 18px 15px calc(70px + env(safe-area-inset-bottom));
}

.sazo-root .sazo-account-link {
  min-height: 44px;
}
```

Match the recording's 14–18 px horizontal gutters, 1 px dividers, pale section bands, 12–14 px body type, navy text, sakura selected states, generous empty-state height, sticky header, fixed action button, fixed bottom nav, and chat clearance. Add `overscroll-behavior-x: none` and ensure no account screen creates horizontal overflow.

- [ ] **Step 4: Add the browser script command and layout contract assertions**

Add to `package.json`:

```json
"test:sazo-mypage-browser": "node scripts/sazo-mypage-browser.mjs"
```

Add unit assertions for stable class/data hooks: account header, legal footer, fixed action, empty state, point filters, and notification switches.

- [ ] **Step 5: Run geometry and focused tests and verify GREEN**

Run:

```bash
pnpm test -- tests/unit/sazo-commerce-account.test.tsx
pnpm test:sazo-mypage-browser
```

Expected: all assertions pass at 341, 345, and 440 px.

- [ ] **Step 6: Inspect every generated screenshot**

Open the generated top/settings/detail screenshots with the image viewer. Compare header height, left gutter, section spacing, divider position, empty-state vertical balance, fixed actions, bottom navigation, and chat placement to the recording. Adjust CSS and rerun the browser check until all inspected screens match the reference structure.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/sazo-commerce/sazo.css scripts/sazo-mypage-browser.mjs package.json tests/unit/sazo-commerce-account.test.tsx
git commit -m "style: match recorded mobile mypage geometry"
```

---

### Task 4: Lock the complete journey with E2E and final verification

**Files:**
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`
- Modify: `scripts/sazo-capture-checkpoints.mjs`

**Interfaces:**
- Consumes: all routes, labels, and class/data hooks from Tasks 1–3.
- Produces: a deterministic mobile E2E replay covering the entire recorded account journey and final capture checkpoints.

- [ ] **Step 1: Extend the E2E journey before changing implementation**

After authentication, add a table-driven replay:

```ts
for (const [label, view] of [
  ["注文履歴", "orders"],
  ["お気に入り", "favorites"],
  ["クーポン", "coupons"],
  ["ポイント", "points"],
  ["レビューを作成", "review-create"],
  ["作成したレビュー", "review-history"],
  ["登録カード管理", "cards"],
  ["配送先管理", "delivery"],
  ["通知設定", "notifications"],
] as const) {
  await account.getByRole("button", { exact: true, name: label }).click();
  await expect(page.locator(`[data-view-content="${view}"]`)).toBeVisible();
  await page.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();
  account = page.locator('[data-view-content="mypage"]');
}
```

Add explicit assertions for the nested and stateful interactions:

```ts
await account.getByRole("button", { name: "配送先管理" }).click();
await page.getByRole("button", { name: "配送先を追加" }).click();
await expect(page.locator('[data-view-content="address"]')).toBeVisible();
await expect(page.getByRole("button", { name: "次へ" })).toBeVisible();

await page.getByRole("button", { name: "前の画面に戻る" }).click();
await page.getByRole("button", { name: "前の画面に戻る" }).click();
await page.getByRole("button", { name: "通知設定" }).click();
const emailSwitch = page.getByRole("switch", { name: "メール通知" });
await emailSwitch.click();
await expect(emailSwitch).toHaveAttribute("aria-checked", "false");

await expect(
  page.getByRole("navigation", { name: "モバイルメニュー" })
    .getByRole("button", { name: "エージェント" }),
).toBeVisible();
expect(applicationExternalRequests(externalRequests)).toEqual([]);
```

- [ ] **Step 2: Run mobile E2E and verify RED if any route is incomplete**

Run: `pnpm test:e2e:sazo -- --project=mobile`

Expected before the final adjustments: any missing route, label, or fixed-control behavior fails with a specific locator assertion.

- [ ] **Step 3: Add account capture checkpoints**

Capture `mypage-top`, `mypage-settings`, `points`, `coupons`, `review-create`, `delivery`, `address`, `notifications`, and `support` at the reference mobile viewport. Use the existing capture helper after font readiness:

```js
await page.evaluate(() => document.fonts.ready);
await capture("mypage-top");
await page.getByRole("button", { name: "ポイント" }).click();
await capture("points");
await page.getByRole("button", { name: "前の画面に戻る" }).click();
await page.getByRole("button", { name: "クーポン" }).click();
await capture("coupons");
await page.getByRole("button", { name: "前の画面に戻る" }).click();

for (const [label, checkpoint] of [
  ["レビューを作成", "review-create"],
  ["配送先管理", "delivery"],
  ["通知設定", "notifications"],
  ["サポート", "support"],
] as const) {
  await page.getByRole("button", { name: label }).click();
  await capture(checkpoint);
  await page.getByRole("button", { name: "前の画面に戻る" }).click();
}

await page.getByRole("button", { name: "配送先管理" }).click();
await page.getByRole("button", { name: "配送先を追加" }).click();
await capture("address");
```

Before `mypage-settings`, return to My Page and scroll the settings heading into view with `locator.scrollIntoViewIfNeeded()`.

- [ ] **Step 4: Run the full verification suite**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:sazo
pnpm test:sazo-mypage-browser
pnpm sazo:capture
```

Expected: every command exits 0, unit tests have no skipped account assertions, desktop and mobile E2E pass, and browser geometry passes at all three widths.

- [ ] **Step 5: Perform final visual and diff review**

Inspect all new account screenshots against the recording. Run `git diff --check` and `git status --short`; verify that unrelated existing work is not staged. Confirm the UI contains no visible `SAZO`, `SAJWO`, Korean address, or external merchant link in the reproduced account flow.

- [ ] **Step 6: Commit Task 4**

```bash
git add tests/e2e/sazo-commerce-reproduction.spec.ts scripts/sazo-capture-checkpoints.mjs
git commit -m "test: verify complete mobile mypage reproduction"
```
