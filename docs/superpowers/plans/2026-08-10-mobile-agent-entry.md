# Mobile Agent Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the mobile home search touchpoint and fixed bottom-navigation search item into one shared J-Planet purchasing-agent composer without changing the SAZO-derived home sequence.

**Architecture:** Add `agent` to the existing reducer-managed overlay state, render one isolated `AgentComposerSheet` from `SazoCommercePage`, and dispatch the same `open-agent` action from `MobileDiscoveryTop` and `SazoShell`. The sheet owns only transient draft/file state and hands a successful mock submission back to the existing `catalog` view.

**Tech Stack:** React 19, TypeScript, Lucide React, Motion, Vitest, Testing Library, Playwright, CSS media queries.

## Global Constraints

- Preserve the 416 × 50 px mobile home entry at a 440 px viewport.
- Preserve the fixed mobile navigation at 76 px with exactly five items.
- Use the copy `URL・画像・商品名をAIに相談`, `エージェント`, `J-Planet AIエージェント`, and `AIに探してもらう` exactly.
- The mobile home categories, hero, introduction, reviews, four gift-fair sections, GRAM, 31-item PICK grid, and footer do not change order.
- Product detail, cart, checkout, PRC-dependent content, desktop search, and AI/backend calls are out of scope.
- Preserve unrelated dirty worktree files and stage only files named by each task.

---

### Task 1: Agent overlay reducer state

**Files:**
- Modify: `tests/unit/sazo-commerce-model.test.ts`
- Modify: `src/sazo-commerce/model.ts`

**Interfaces:**
- Produces: `SazoOverlay = "none" | "login" | "chat" | "agent"`
- Produces: `SazoAction` variant `{ type: "open-agent" }`
- Produces: reducer behavior where `open-agent` sets `overlay: "agent"` and existing `close-overlay` restores `none`

- [ ] **Step 1: Write the failing reducer test**

Add this test beside the existing overlay tests:

```ts
it("opens and closes the purchasing-agent overlay", () => {
  const opened = sazoReducer(createInitialSazoState(), { type: "open-agent" });

  expect(opened.overlay).toBe("agent");
  expect(sazoReducer(opened, { type: "close-overlay" }).overlay).toBe("none");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test tests/unit/sazo-commerce-model.test.ts
```

Expected: TypeScript/Vitest failure because `open-agent` is not a valid `SazoAction` and no reducer branch exists.

- [ ] **Step 3: Add the minimal model behavior**

Update the type unions and reducer:

```ts
export type SazoOverlay = "none" | "login" | "chat" | "agent";

// Add this variant immediately after the existing `open-chat` variant.
| { type: "open-agent" }

case "open-agent":
  return { ...state, overlay: "agent" };
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm test tests/unit/sazo-commerce-model.test.ts
```

Expected: the complete model test file passes.

- [ ] **Step 5: Commit the isolated model change**

```bash
git add src/sazo-commerce/model.ts tests/unit/sazo-commerce-model.test.ts
git commit -m "feat: add agent overlay state"
```

---

### Task 2: Shared AI composer sheet

**Files:**
- Create: `src/sazo-commerce/AgentComposerSheet.tsx`
- Create: `tests/unit/sazo-commerce-agent.test.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`

**Interfaces:**
- Consumes: `dispatch: Dispatch<SazoAction>` and `open-agent`/`close-overlay` from Task 1
- Produces: `AgentComposerSheet({ dispatch }: { dispatch: Dispatch<SazoAction> })`
- Produces: accessible dialog named `J-Planet AIエージェント`
- Produces: submit behavior `dispatch({ type: "navigate", view: "catalog" })`

- [ ] **Step 1: Write the failing composer tests**

Create a Testing Library test that renders `AgentComposerSheet` with a reducer-backed harness:

```tsx
function AgentHarness() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, createInitialSazoState);

  return (
    <div data-overlay={state.overlay} data-view={state.view}>
      <button onClick={() => dispatch({ type: "open-agent" })} type="button">
        エージェントを開く
      </button>
      {state.overlay === "agent" ? <AgentComposerSheet dispatch={dispatch} /> : null}
    </div>
  );
}
```

Assert real behavior:

```ts
fireEvent.click(screen.getByRole("button", { name: "エージェントを開く" }));
const dialog = screen.getByRole("dialog", { name: "J-Planet AIエージェント" });
const submit = within(dialog).getByRole("button", { name: "AIに探してもらう" });
expect(submit).toBeDisabled();

fireEvent.change(within(dialog).getByRole("textbox"), {
  target: { value: "https://example.jp/item" },
});
expect(submit).not.toBeDisabled();
fireEvent.click(submit);
expect(document.querySelector("[data-view='catalog']")).not.toBeNull();
```

Add a second assertion that choosing `sample.png` in the image input displays `sample.png` and enables submit.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test tests/unit/sazo-commerce-agent.test.tsx
```

Expected: module-not-found failure for `AgentComposerSheet`.

- [ ] **Step 3: Implement the minimal sheet component**

Create the component with:

```tsx
export function AgentComposerSheet({ dispatch }: AgentComposerSheetProps) {
  const [draft, setDraft] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canSubmit = draft.trim().length > 0 || fileName !== null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    dispatch({ type: "navigate", view: "catalog" });
  };

  // Escape closes, opening focuses the textarea, and cleanup restores focus/body scroll.
  // Render backdrop, dialog, three capability chips, textarea, hidden image input,
  // filename state, and the disabled/enabled primary action.
}
```

The `URLを貼る` chip focuses the text box, `画像を追加` opens the hidden file input, and `商品名で相談` focuses the text box. Backdrop clicks and the close button dispatch `close-overlay`; clicks inside the sheet stop propagation.

- [ ] **Step 4: Render the overlay from the page root**

Import the component and add it to the existing `AnimatePresence` block:

```tsx
{state.overlay === "agent" ? (
  <AgentComposerSheet dispatch={dispatch} key="sazo-agent" />
) : null}
```

- [ ] **Step 5: Add scoped mobile-first sheet CSS**

Add `.sazo-agent-*` styles for:

- a fixed full-screen backdrop above the shell and navigation,
- a bottom-aligned white sheet with 24 px top corners,
- navy/sakura chips and primary action,
- a 52 px minimum touch target,
- a desktop-safe centered maximum width of 520 px,
- reduced-motion behavior through the existing motion setup.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run:

```bash
pnpm test tests/unit/sazo-commerce-agent.test.tsx tests/unit/sazo-commerce-model.test.ts
```

Expected: both test files pass without warnings.

- [ ] **Step 7: Commit the shared component**

```bash
git add src/sazo-commerce/AgentComposerSheet.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-agent.test.tsx
git commit -m "feat: add mobile purchasing agent composer"
```

---

### Task 3: Connect the home entry and fixed navigation

**Files:**
- Modify: `tests/unit/sazo-commerce-home.test.tsx`
- Modify: `tests/unit/sazo-commerce-shell.test.tsx`
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/SazoShell.tsx`
- Modify: `src/sazo-commerce/sazo.css`

**Interfaces:**
- Consumes: `dispatch({ type: "open-agent" })` from Task 1
- Consumes: shared `AgentComposerSheet` rendered by Task 2
- Produces: home button named `URL・画像・商品名をAIに相談`
- Produces: five bottom items `ホーム / 通知 / エージェント / お気に入り / マイページ`

- [ ] **Step 1: Write the failing home and shell tests**

Update the mobile sequence assertion to begin with `URL・画像・商品名をAIに相談`.

Add a home integration assertion:

```ts
const agentEntry = screen.getByRole("button", {
  name: "URL・画像・商品名をAIに相談",
});
fireEvent.click(agentEntry);
expect(screen.getByRole("dialog", { name: "J-Planet AIエージェント" })).toBeTruthy();
```

Update the shell inventory to:

```ts
for (const label of ["ホーム", "通知", "エージェント", "お気に入り", "マイページ"]) {
  expect(within(mobileNav).getByRole("button", { name: label })).toBeTruthy();
}
```

Replace the catalog-navigation test with an overlay test that clicks `エージェント`, expects `data-overlay="agent"`, and expects `aria-pressed="true"`.

- [ ] **Step 2: Run both focused test files and verify RED**

Run:

```bash
pnpm test tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx
```

Expected: failures mention missing agent copy, missing agent button, and unchanged catalog navigation.

- [ ] **Step 3: Convert `MobileDiscoveryTop` into the agent entry**

Pass `dispatch` into the component and render:

```tsx
<button
  aria-label="URL・画像・商品名をAIに相談"
  className="sazo-mobile-search-pill sazo-mobile-agent-entry"
  onClick={() => dispatch({ type: "open-agent" })}
  type="button"
>
  <Sparkles aria-hidden size={22} strokeWidth={2} />
  <span className="sazo-mobile-agent-badge">AI</span>
  <span>URL・画像・商品名をAIに相談</span>
  <ImagePlus aria-hidden size={20} strokeWidth={1.9} />
</button>
```

Call it as `<MobileDiscoveryTop dispatch={dispatch} />` in the mobile home branch.

- [ ] **Step 4: Convert the bottom item into an agent control**

Extend `ControlButton` with `pressed?: boolean`, map it to `aria-pressed`, and replace the catalog `NavigationButton` with:

```tsx
<ControlButton
  className="sazo-nav-button sazo-agent-nav-button"
  expanded={state.overlay === "agent"}
  icon={Sparkles}
  label="エージェント"
  onPress={() => dispatch({ type: "open-agent" })}
  pressed={state.overlay === "agent"}
/>
```

- [ ] **Step 5: Refine entry CSS without changing captured geometry**

Keep `.sazo-mobile-search-pill` at 416 × 50 px at the reference viewport. Add a small sakura `AI` badge, trailing image icon, ellipsis-safe prompt text, and active nav styling via `[aria-pressed="true"]`.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
pnpm test tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-agent.test.tsx tests/unit/sazo-commerce-model.test.ts
```

Expected: all four test files pass.

- [ ] **Step 7: Commit the integrated mobile entry**

```bash
git add src/sazo-commerce/HomeView.tsx src/sazo-commerce/SazoShell.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx
git commit -m "feat: connect mobile agent entry points"
```

---

### Task 4: Mobile journey and visual regression

**Files:**
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`
- Modify: `scripts/sazo-mobile-home-capture.mjs`

**Interfaces:**
- Consumes: dialog and labels from Tasks 2–3
- Produces: repeatable mobile E2E proof and 440/341/desktop visual artifacts

- [ ] **Step 1: Update the mobile E2E expectation before production behavior**

Replace the direct `検索` → catalog step with:

```ts
await mobileNavigation
  .getByRole("button", { exact: true, name: "エージェント" })
  .click();
const agent = page.getByRole("dialog", {
  exact: true,
  name: "J-Planet AIエージェント",
});
await expect(agent).toBeVisible();
await agent.getByRole("textbox").fill("日本限定スニーカー");
await agent.getByRole("button", { exact: true, name: "AIに探してもらう" }).click();
```

Keep the existing catalog list/grid assertions after submission.

- [ ] **Step 2: Run the updated mobile E2E as an integration regression**

Run:

```bash
pnpm exec playwright test tests/e2e/sazo-commerce-reproduction.spec.ts --project=mobile
```

Expected: the end-to-end agent journey passes. The missing-label and missing-dialog RED evidence is recorded by the focused unit-test run in Task 3 before the production integration is added.

- [ ] **Step 3: Add capture-script assertions**

Assert:

```js
assert.equal(await page.getByRole("button", { name: "エージェント" }).count(), 1);
assert.equal(
  await page.getByRole("button", { name: "URL・画像・商品名をAIに相談" }).count(),
  1,
);
```

Capture the agent-open state at 440 × 956 as `/tmp/jplanet-mobile-agent-sheet.png`, then close it and retain existing top/reviews/gift/GRAM/PICK/footer, 341 × 735 overflow, and desktop captures.

- [ ] **Step 4: Run the mobile E2E and capture script**

Run:

```bash
pnpm exec playwright test tests/e2e/sazo-commerce-reproduction.spec.ts --project=mobile
node scripts/sazo-mobile-home-capture.mjs
```

Expected: mobile journey passes, capture reports `sazo-mobile-home-capture-ok`, and both mobile widths have no horizontal overflow.

- [ ] **Step 5: Run the full verification gate**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --reporter=dot
pnpm build
pnpm test:e2e:sazo
```

Expected: zero lint/type errors, all unit tests pass, production build exits 0, and desktop/mobile E2E both pass.

- [ ] **Step 6: Verify the live URL**

Run:

```bash
curl -sS -I http://127.0.0.1:5190/sazo-commerce-mock/ | sed -n '1,5p'
lsof -nP -iTCP:5190 -sTCP:LISTEN
```

Expected: HTTP 200 and a listener on `127.0.0.1:5190`.

- [ ] **Step 7: Commit the regression coverage**

```bash
git add tests/e2e/sazo-commerce-reproduction.spec.ts scripts/sazo-mobile-home-capture.mjs
git commit -m "test: cover mobile purchasing agent journey"
```
