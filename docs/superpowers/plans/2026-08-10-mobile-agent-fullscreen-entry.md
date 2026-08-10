# J-Planet Mobile AI Entry and Fullscreen Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace the mobile-home agent bottom sheet with an AI-styled entry that navigates to a fullscreen J-Planet agent page supporting URL, image, and product-name consultations.

**Architecture:** Extend the existing reducer with a one-shot agent entry intent, route both home entry controls to the existing agent-hub, and add a focused MobileAgentComposer component inside that page. Keep the existing history, product rail, ranked topics, footer, J-Planet branding, and fixed bottom navigation while making the SAZO-inspired two-row mobile header horizontally scrollable.

**Tech Stack:** React 19, TypeScript 5.9, Vitest, Testing Library, i18next, lucide-react, Playwright, CSS

## Global Constraints

- The accepted design is docs/superpowers/specs/2026-08-10-mobile-agent-fullscreen-entry-design.md.
- Mobile home search must not dispatch open-agent or open AgentComposerSheet.
- Home main entry and home image entry must navigate to agent-hub.
- The image entry must render the agent page first, select image mode, and then attempt to open the file chooser; an in-page 画像を選択 fallback must always remain available.
- Keep AgentComposerSheet for unrelated legacy entry points; do not delete it.
- File selection is local-only: accept image/*, validate MIME type, preview through an Object URL, and revoke every created Object URL.
- Keep the existing agent-hub sections in this order: composer, recent consultations, recent products, popular topics, footer.
- Mobile secondary navigation must contain seven one-line items and support native horizontal finger scrolling with the scrollbar hidden.
- Preserve J-Planet white, navy, and sakura-pink styling. Do not reintroduce SAZO logos or pink branding.
- Support 341px, 390px, and 440px without horizontal page overflow or bottom-navigation overlap.
- Add every new display string to ja, en, and pt-BR; locale key sets must stay identical.
- Do not modify product detail, cart, checkout, or desktop search behavior.
- The working tree already contains user and parallel-agent changes. Inspect git diff before each edit, preserve unrelated hunks, stage only feature hunks with git add -p, and verify the cached diff before every commit.
- Follow TDD for every behavior change: failing test, observed RED, minimal implementation, observed GREEN, then commit.

## File Structure

### Create

- src/sazo-commerce/MobileAgentComposer.tsx — owns modes, input, image validation/preview, CTA state, and mock acknowledgement.
- tests/unit/sazo-commerce-agent-composer.test.tsx — focused composer contract.

### Modify

- src/sazo-commerce/model.ts — one-shot AgentEntryIntent.
- src/sazo-commerce/HomeView.tsx — separate main and image AI entry controls.
- src/sazo-commerce/MobileAgentHubView.tsx — composer integration and ranked-topic seeding.
- src/sazo-commerce/SazoCommercePage.tsx — passes entry intent.
- src/sazo-commerce/SazoShell.tsx — seven mobile secondary items.
- src/sazo-commerce/sazo.css — final mobile header, entry, composer, focus, safe-area, and reduced-motion styles.
- src/i18n/locales/ja.json, en.json, pt-BR.json — matching composer strings.
- tests/unit/sazo-commerce-model.test.ts
- tests/unit/sazo-commerce-home.test.tsx
- tests/unit/sazo-commerce-agent-hub.test.tsx
- tests/unit/sazo-commerce-shell.test.tsx
- tests/unit/sazo-commerce-views.test.tsx
- tests/e2e/sazo-commerce-reproduction.spec.ts

---

### Task 1: One-shot agent intent and mobile-home navigation

**Files:**
- Modify: src/sazo-commerce/model.ts
- Modify: src/sazo-commerce/HomeView.tsx
- Test: tests/unit/sazo-commerce-model.test.ts
- Test: tests/unit/sazo-commerce-home.test.tsx

**Interfaces:**
- Produces: AgentEntryIntent = "compose" | "image-picker".
- Produces: SazoState.agentEntryIntent: AgentEntryIntent | null.
- Produces actions open-agent-hub and consume-agent-entry-intent.
- Produces DOM hooks data-mobile-agent-search and data-mobile-agent-image-entry.

- [ ] **Step 1: Write the failing reducer test**

~~~ts
it("opens and consumes a fullscreen agent entry intent", () => {
  const opened = sazoReducer(createInitialSazoState(), {
    type: "open-agent-hub",
    intent: "image-picker",
  });

  expect(opened).toMatchObject({
    agentEntryIntent: "image-picker",
    overlay: "none",
    view: "agent-hub",
  });
  expect(
    sazoReducer(opened, { type: "consume-agent-entry-intent" }),
  ).toMatchObject({ agentEntryIntent: null, view: "agent-hub" });
});
~~~

- [ ] **Step 2: Run the reducer test and verify RED**

Run: pnpm test -- tests/unit/sazo-commerce-model.test.ts

Expected: the new state field and action variants do not exist.

- [ ] **Step 3: Implement the reducer contract**

Add this public type and state field:

~~~ts
export type AgentEntryIntent = "compose" | "image-picker";

export interface SazoState {
  // existing fields stay unchanged
  agentEntryIntent: AgentEntryIntent | null;
}
~~~

Initialize agentEntryIntent to null. Add these action variants:

~~~ts
| { type: "open-agent-hub"; intent: AgentEntryIntent }
| { type: "consume-agent-entry-intent" }
~~~

Add reducer branches:

~~~ts
case "open-agent-hub":
  return {
    ...state,
    agentEntryIntent: action.intent,
    overlay: "none",
    view: "agent-hub",
  };
case "consume-agent-entry-intent":
  return { ...state, agentEntryIntent: null };
~~~

Ordinary navigate must always clear agentEntryIntent. The dedicated
open-agent-hub action is the only action allowed to create a new intent.

- [ ] **Step 4: Run the reducer test and verify GREEN**

Run: pnpm test -- tests/unit/sazo-commerce-model.test.ts

Expected: all model tests pass.

- [ ] **Step 5: Write failing home entry tests**

Replace the old dialog assertion with:

~~~tsx
it("routes the mobile AI entry to the fullscreen hub", async () => {
  const dispatch = vi.fn();
  await renderHomePage("ja", dispatch);

  fireEvent.click(
    screen.getByRole("button", { name: "URL・画像・商品名をAIに相談" }),
  );

  expect(dispatch).toHaveBeenCalledWith({
    type: "open-agent-hub",
    intent: "compose",
  });
  expect(screen.queryByRole("dialog", { name: "J-Planet AIエージェント" })).toBeNull();
});

it("routes the image action with an image-picker intent", async () => {
  const dispatch = vi.fn();
  await renderHomePage("ja", dispatch);

  fireEvent.click(screen.getByRole("button", { name: "画像からAIに相談" }));

  expect(dispatch).toHaveBeenCalledWith({
    type: "open-agent-hub",
    intent: "image-picker",
  });
});
~~~

Update renderHomePage to accept dispatch = vi.fn() if needed.

- [ ] **Step 6: Run home tests and verify RED**

Run: pnpm test -- tests/unit/sazo-commerce-home.test.tsx

Expected: approved labels, image action, and navigation actions are absent.

- [ ] **Step 7: Implement sibling home entry controls**

Replace the single open-agent button with this non-nested structure:

~~~tsx
<div className="sazo-mobile-search-overlap" data-mobile-home>
  <div
    aria-label={t("sazo.home.agentEntryGroup")}
    className="sazo-mobile-agent-entry"
    role="group"
  >
    <button
      className="sazo-mobile-agent-entry-main"
      data-mobile-agent-search
      onClick={() => dispatch({ type: "open-agent-hub", intent: "compose" })}
      type="button"
    >
      <Sparkles aria-hidden size={24} />
      <span className="sazo-mobile-agent-badge" aria-hidden>AI</span>
      <span>{t("sazo.agentHub.launcher")}</span>
    </button>
    <button
      aria-label={t("sazo.home.agentImageEntry")}
      className="sazo-mobile-agent-image-entry"
      data-mobile-agent-image-entry
      onClick={() => dispatch({ type: "open-agent-hub", intent: "image-picker" })}
      type="button"
    >
      <ImagePlus aria-hidden size={24} />
    </button>
  </div>
</div>
~~~

Import ImagePlus and Sparkles from lucide-react. Do not call open-agent.

- [ ] **Step 8: Run focused tests and verify GREEN**

Run: pnpm test -- tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-home.test.tsx

Expected: both files pass.

- [ ] **Step 9: Commit only Task 1 hunks**

~~~bash
git add -p src/sazo-commerce/model.ts src/sazo-commerce/HomeView.tsx tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-home.test.tsx
git diff --cached --check
git diff --cached
git commit -m "feat: route mobile AI entry to agent hub"
~~~

---

### Task 2: Reusable fullscreen mobile agent composer

**Files:**
- Create: src/sazo-commerce/MobileAgentComposer.tsx
- Create: tests/unit/sazo-commerce-agent-composer.test.tsx
- Modify: src/i18n/locales/ja.json
- Modify: src/i18n/locales/en.json
- Modify: src/i18n/locales/pt-BR.json

**Interfaces:**
- Consumes AgentEntryIntent.
- Produces AgentComposerMode = "url" | "image" | "product-name".
- Produces MobileAgentComposerProps with entryIntent, onEntryIntentConsumed, and seedProductName.
- Uses forwardRef<HTMLDivElement, MobileAgentComposerProps>.

- [ ] **Step 1: Create failing mode and CTA tests**

~~~tsx
it("shows all modes and enables submit only when input exists", async () => {
  await renderComposer({ entryIntent: "compose" });

  expect(screen.getByRole("button", { name: "URLを貼る" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "画像を追加" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "商品名で相談" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "AIに探してもらう" })).toBeDisabled();

  fireEvent.click(screen.getByRole("button", { name: "商品名で相談" }));
  fireEvent.change(screen.getByRole("textbox", { name: "探したい商品" }), {
    target: { value: "日本限定スニーカー" },
  });

  expect(screen.getByRole("button", { name: "AIに探してもらう" })).toBeEnabled();
});
~~~

The helper renders through I18nextProvider and returns the onEntryIntentConsumed mock.

- [ ] **Step 2: Run the test and verify RED**

Run: pnpm test -- tests/unit/sazo-commerce-agent-composer.test.tsx

Expected: module-not-found for MobileAgentComposer.

- [ ] **Step 3: Add identical composer locale keys**

Under sazo.agentHub.composer, add these keys in all three locales:

~~~json
{
  "title": "J-Planet AIエージェント",
  "intro": "日本の商品探し・購入からブラジルへの配送まで、AIがサポートします。",
  "stepUrl": "日本の商品URLまたは画像を送ってください",
  "stepName": "商品名や希望条件だけでも相談できます",
  "modesLabel": "相談方法",
  "urlMode": "URLを貼る",
  "imageMode": "画像を追加",
  "productMode": "商品名で相談",
  "draftLabel": "探したい商品",
  "urlPlaceholder": "日本の商品URLを貼り付けてください",
  "productPlaceholder": "欲しい商品名や条件を入力してください",
  "selectImage": "画像を選択",
  "replaceImage": "画像を差し替える",
  "removeImage": "画像を削除",
  "invalidImage": "画像ファイルを選択してください",
  "selectedImageAlt": "選択した画像: {{name}}",
  "submit": "AIに探してもらう",
  "submitted": "AIエージェントが商品を探し始めました"
}
~~~

Translate values naturally in en and pt-BR; keep keys identical. Add sazo.home.agentEntryGroup and sazo.home.agentImageEntry to all three locales.

- [ ] **Step 4: Implement the minimum composer**

Use this state shape:

~~~ts
const [mode, setMode] = useState<AgentComposerMode>(
  entryIntent === "image-picker" ? "image" : "product-name",
);
const [draft, setDraft] = useState("");
const [imageFile, setImageFile] = useState<File | null>(null);
const [imageUrl, setImageUrl] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [submitted, setSubmitted] = useState(false);
const canSubmit = draft.trim().length > 0 || imageFile !== null;
~~~

Render:
- a J-Planet icon/title and two numbered guidance lines;
- three mode buttons with aria-pressed;
- textarea for URL/product-name modes;
- hidden input type=file accept=image/* plus a visible label/button;
- preview, filename, replace, and remove controls in image mode;
- disabled submit until canSubmit;
- role=status for validation and mock submission feedback.

Attach the forwarded ref to the component's root div and give that root the
stable class name sazo-mobile-agent-composer. All intro, mode, input, preview,
and CTA elements must remain descendants of that root.

Validate with file.type.startsWith("image/"). Create the preview with URL.createObjectURL.

- [ ] **Step 5: Run the mode test and verify GREEN**

Run: pnpm test -- tests/unit/sazo-commerce-agent-composer.test.tsx

Expected: mode and CTA test passes.

- [ ] **Step 6: Add failing image lifecycle tests**

~~~tsx
it("previews an image and revokes its Object URL", async () => {
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
  const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  const { unmount } = await renderComposer({ entryIntent: "image-picker" });
  const file = new File(["image"], "item.png", { type: "image/png" });

  fireEvent.change(screen.getByLabelText("画像を選択"), {
    target: { files: [file] },
  });

  expect(screen.getByRole("img", { name: "選択した画像: item.png" }))
    .toHaveAttribute("src", "blob:preview");
  expect(screen.getByRole("button", { name: "AIに探してもらう" })).toBeEnabled();

  unmount();
  expect(revoke).toHaveBeenCalledWith("blob:preview");
});
~~~

Add:
- a text/plain file test expecting invalidImage and no preview;
- a replacement/removal test expecting every previous URL to be revoked;
- an image-picker intent test expecting onEntryIntentConsumed exactly once;
- a submit test that enters a product name, clicks AIに探してもらう, and
  expects the localized submitted status without any network request.

- [ ] **Step 7: Implement auto-open, seed, and cleanup effects**

~~~ts
useEffect(() => {
  if (entryIntent === null) return;
  if (entryIntent === "image-picker") {
    setMode("image");
    fileInputRef.current?.click();
  }
  onEntryIntentConsumed();
}, [entryIntent, onEntryIntentConsumed]);

useEffect(() => {
  if (seedProductName === null) return;
  setMode("product-name");
  setDraft(seedProductName);
}, [seedProductName]);
~~~

Centralize URL replacement in one helper: revoke the current Object URL once,
then store the next URL. Call the same helper with null for removal and from the
unmount cleanup for the final URL. Do not combine an imageUrl dependency cleanup
with explicit replacement revocation, because that would revoke the same URL
twice. Keep the visible image-select fallback after the automatic click attempt.

- [ ] **Step 8: Run composer and locale parity tests**

Run:
- pnpm test -- tests/unit/sazo-commerce-agent-composer.test.tsx
- locate locale parity with rg -l "locale.*keys|pt-BR.*ja" tests/unit and run that file.

Expected: composer tests pass and locale key sets match.

- [ ] **Step 9: Commit only Task 2 hunks**

~~~bash
git add src/sazo-commerce/MobileAgentComposer.tsx tests/unit/sazo-commerce-agent-composer.test.tsx
git add -p src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json
git diff --cached --check
git diff --cached
git commit -m "feat: add fullscreen mobile agent composer"
~~~

---

### Task 3: Integrate composer into agent hub

**Files:**
- Modify: src/sazo-commerce/MobileAgentHubView.tsx
- Modify: src/sazo-commerce/SazoCommercePage.tsx
- Test: tests/unit/sazo-commerce-agent-hub.test.tsx
- Test: tests/unit/sazo-commerce-views.test.tsx

**Interfaces:**
- Consumes state.agentEntryIntent and consume-agent-entry-intent.
- Consumes MobileAgentComposer and its forwarded ref.
- Produces MobileAgentHubViewProps with entryIntent and dispatch.

- [ ] **Step 1: Write failing section-order and no-overlay tests**

Update the render helper to pass entryIntent. Require section order:

~~~ts
expect(
  screen.getAllByTestId("agent-hub-section")
    .map((section) => section.dataset.section),
).toEqual(["composer", "consultations", "recent-products", "popular-topics", "footer"]);
~~~

Click the header launcher and assert no open-agent dispatch. Render with image-picker and expect consume-agent-entry-intent.

- [ ] **Step 2: Run hub tests and verify RED**

Run: pnpm test -- tests/unit/sazo-commerce-agent-hub.test.tsx

Expected: composer section and intent prop are absent; launcher still calls open-agent.

- [ ] **Step 3: Embed composer and consume intent**

Add:

~~~ts
const composerRef = useRef<HTMLDivElement>(null);
const [seedProductName, setSeedProductName] = useState<string | null>(null);
const focusComposer = () => {
  composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
};
~~~

Render immediately after the compact header:

~~~tsx
<section data-section="composer" data-testid="agent-hub-section">
  <MobileAgentComposer
    entryIntent={entryIntent}
    onEntryIntentConsumed={() => dispatch({ type: "consume-agent-entry-intent" })}
    ref={composerRef}
    seedProductName={seedProductName}
  />
</section>
~~~

Change the header launcher to focusComposer.

- [ ] **Step 4: Make ranked topics seed the composer**

Replace catalog navigation with:

~~~ts
setSeedProductName(topic);
requestAnimationFrame(focusComposer);
~~~

Keep the ranked accessible name unchanged.

- [ ] **Step 5: Pass intent from SazoCommercePage**

~~~tsx
<MobileAgentHubView
  dispatch={dispatch}
  entryIntent={state.agentEntryIntent}
/>
~~~

- [ ] **Step 6: Add and satisfy ranked-topic seeding test**

~~~ts
fireEvent.click(screen.getByRole("button", { name: "1位 アニメグッズ" }));
expect(screen.getByRole("button", { name: "商品名で相談" }))
  .toHaveAttribute("aria-pressed", "true");
expect(screen.getByRole("textbox", { name: "探したい商品" }))
  .toHaveValue("アニメグッズ");
~~~

Run: pnpm test -- tests/unit/sazo-commerce-agent-hub.test.tsx tests/unit/sazo-commerce-views.test.tsx

Expected: both pass and no hub/home interaction expects the dialog.

- [ ] **Step 7: Commit only Task 3 hunks**

~~~bash
git add src/sazo-commerce/MobileAgentHubView.tsx tests/unit/sazo-commerce-agent-hub.test.tsx
git add -p src/sazo-commerce/SazoCommercePage.tsx tests/unit/sazo-commerce-views.test.tsx
git diff --cached --check
git diff --cached
git commit -m "feat: embed composer in mobile agent hub"
~~~

---

### Task 4: Mobile header and final J-Planet AI styling

**Files:**
- Modify: src/sazo-commerce/SazoShell.tsx
- Modify: src/sazo-commerce/sazo.css
- Test: tests/unit/sazo-commerce-shell.test.tsx
- Test: tests/unit/sazo-commerce-home.test.tsx
- Test: tests/unit/sazo-commerce-agent-hub.test.tsx

**Interfaces:**
- Consumes home entry and composer class hooks from Tasks 1–3.
- Produces seven mobile secondary buttons.
- Produces native horizontal scrolling on sazo-mobile-secondary-nav.

- [ ] **Step 1: Write failing seven-item navigation test**

~~~ts
const secondary = screen.getByRole("navigation", { name: "モバイルサブメニュー" });
expect(within(secondary).getAllByRole("button")).toHaveLength(7);
expect(within(secondary).getByRole("button", { name: "ヘルプ" })).toBeTruthy();
expect(within(secondary).getByRole("button", { name: "お知らせ" })).toBeTruthy();
~~~

- [ ] **Step 2: Run shell test and verify RED**

Run: pnpm test -- tests/unit/sazo-commerce-shell.test.tsx

Expected: home view contains five items.

- [ ] **Step 3: Add help and news to mobileSecondaryNavigation**

~~~ts
{ translationKey: "sazo.navigation.help", view: "support" },
{ translationKey: "sazo.navigation.news" },
~~~

Keep news inert like the desktop item.

- [ ] **Step 4: Run shell test and verify GREEN**

Run: pnpm test -- tests/unit/sazo-commerce-shell.test.tsx

Expected: seven-item assertion passes.

- [ ] **Step 5: Append a final authoritative CSS block**

At the end of sazo.css, add a labelled max-width:760px block. It must include:

~~~css
.sazo-root[data-view="home"] .sazo-mobile-secondary-nav {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  touch-action: pan-x;
}

.sazo-root[data-view="home"] .sazo-mobile-secondary-button {
  flex: 0 0 auto;
  white-space: nowrap;
}

.sazo-root[data-view="home"] .sazo-mobile-agent-entry {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  width: calc(100% - 32px);
  min-height: 64px;
  border: 1px solid var(--jplanet-line);
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--jplanet-ink) 12%, transparent);
}

.sazo-root[data-view="agent-hub"] .sazo-agent-hub {
  padding-bottom: calc(var(--sazo-mobile-nav-height) + env(safe-area-inset-bottom) + 24px);
  background: #fff;
}

.sazo-root[data-view="agent-hub"] .sazo-mobile-agent-composer {
  border: 1px solid var(--jplanet-line);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 14px 34px color-mix(in srgb, var(--jplanet-ink) 9%, transparent);
}
~~~

Complete the block with:
- sakura focus rings, navy text, and sakura selected mode pills;
- a compact fixed agent header and matching content top padding;
- responsive object-fit:cover image preview;
- 341/390/440px no-overflow rules;
- safe-area bottom padding;
- prefers-reduced-motion overriding smooth scrolling to auto.

Do not use !important unless the final block cannot win through source order and focused specificity.

- [ ] **Step 6: Add CSS-hook unit assertions**

~~~ts
expect(container.querySelector(".sazo-mobile-agent-entry-main")).not.toBeNull();
expect(container.querySelector(".sazo-mobile-agent-image-entry")).not.toBeNull();
expect(container.querySelector(".sazo-mobile-agent-composer")).not.toBeNull();
~~~

- [ ] **Step 7: Run focused UI tests**

Run: pnpm test -- tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-agent-hub.test.tsx tests/unit/sazo-commerce-agent-composer.test.tsx

Expected: all pass.

- [ ] **Step 8: Commit only Task 4 hunks**

~~~bash
git add -p src/sazo-commerce/SazoShell.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-agent-hub.test.tsx
git diff --cached --check
git diff --cached
git commit -m "style: refine mobile AI and header experience"
~~~

---

### Task 5: End-to-end flow, responsive geometry, and final verification

**Files:**
- Modify: tests/e2e/sazo-commerce-reproduction.spec.ts
- Reuse: scripts/sazo-capture-checkpoints.mjs
- Reuse: design/reproductions/sazo-commerce/qa/

**Interfaces:**
- Consumes the fullscreen route, composer accessible names, image input, seven-item nav, and fixed bottom nav.
- Produces desktop and mobile regression coverage.

- [ ] **Step 1: Replace old dialog E2E with failing fullscreen assertions**

~~~ts
const topLauncher = page.getByRole("button", {
  exact: true,
  name: "URL・画像・商品名をAIに相談",
});
await topLauncher.click();

const hub = page.locator("[data-mobile-agent-hub]");
await expect(hub).toBeVisible();
await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
await expect(page.getByRole("dialog", { name: "J-Planet AIエージェント" }))
  .toHaveCount(0);
await expect(hub.getByRole("button", { name: "AIに探してもらう" }))
  .toBeDisabled();
~~~

- [ ] **Step 2: Add image-entry and preview E2E**

Return home, click 画像からAIに相談, assert image mode pressed, then:

~~~ts
await page.locator('input[type="file"][accept="image/*"]').setInputFiles({
  name: "sample.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z7xkAAAAASUVORK5CYII=",
    "base64",
  ),
});

await expect(page.getByRole("img", { name: "選択した画像: sample.png" }))
  .toBeVisible();
await expect(page.getByRole("button", { name: "AIに探してもらう" }))
  .toBeEnabled();
~~~

Playwright setInputFiles intentionally bypasses the OS chooser; unit tests own the automatic click attempt.

- [ ] **Step 3: Add horizontal navigation geometry checks**

~~~ts
const secondary = page.getByRole("navigation", { name: "モバイルサブメニュー" });
await expect(secondary.getByRole("button")).toHaveCount(7);
const overflow = await secondary.evaluate((element) => ({
  clientWidth: element.clientWidth,
  scrollWidth: element.scrollWidth,
}));
expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth);
await secondary.evaluate((element) => element.scrollTo({ left: element.scrollWidth }));
await expect(secondary.getByRole("button", { name: "お知らせ" })).toBeInViewport();
~~~

At 341px and 440px assert documentElement.scrollWidth equals clientWidth on home and agent-hub.

- [ ] **Step 4: Run E2E and fix only feature-owned stale assertions**

Run: pnpm test:e2e:sazo

Expected before updates: mobile failures around old dialog and five-item expectations. Expected after updates: desktop and mobile projects pass. Do not weaken unrelated assertions.

- [ ] **Step 5: Run the full automated verification**

Run each separately:

~~~bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:sazo
pnpm sazo:capture
~~~

Expected: zero failures. Verify any unrelated failure against a clean HEAD worktree and report it instead of changing unrelated code.

- [ ] **Step 6: Perform responsive visual QA**

Inspect and capture:
1. 341x735 home first fold.
2. 390x844 home first fold.
3. 440x956 home first fold.
4. 341x735 agent-hub before input.
5. 341x735 agent-hub with image preview.
6. 440x956 agent-hub with seeded popular keyword.

Verify:
- two-row header directly touches the hero;
- AI entry does not cover slide counter/pause;
- image icon is a separate tap target;
- secondary nav scrolls horizontally without moving the page vertically;
- composer does not clip at 341px;
- bottom nav covers no CTA, preview, ranked list, or footer;
- J-Planet logo, navy, and sakura remain sharp.

- [ ] **Step 7: Commit only Task 5 hunks**

~~~bash
git add -p tests/e2e/sazo-commerce-reproduction.spec.ts
git diff --cached --check
git diff --cached
git commit -m "test: cover fullscreen mobile agent flow"
~~~

Do not stage generated QA captures unless intentionally tracked.

- [ ] **Step 8: Verify the delivered URL**

Run: curl -I http://127.0.0.1:5190/sazo-commerce-mock/

Expected: HTTP/1.1 200 OK. Hand off the clickable URL and fresh verification summary, including any remaining browser-specific file-picker limitation.
