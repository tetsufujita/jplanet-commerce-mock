# SAZO Mobile Home Complete Reproduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 767px以下のJ-Planetホームを、SAZOモバイルWebホームの情報順序、寸法、余白、固定ヘッダー、カルーセル、検索欄、ショートカット密度へ合わせつつ、J-Planetのロゴ・色・文言・商品データと既存AIエージェント遷移を維持する。

**Architecture:** 既存のレスポンシブ単一DOM構成を維持し、`SazoShell` が2段モバイルヘッダー、`HomeView` がモバイル専用セクション順序を担当する。状態管理やAPIを追加せず、既存の `open-agent`、商品遷移、カルーセル状態、fixture、翻訳、固定下部ナビを再利用する。767px以下の最終CSSブロックを唯一のモバイルホーム寸法定義として更新し、768px以上の既存表示を保護する。

**Tech Stack:** React 19, TypeScript, Vite, i18next, Vitest + Testing Library, Playwright, CSS media queries, lucide-react.

## Global Constraints

- 正典設計は `docs/superpowers/specs/2026-08-10-sazo-mobile-home-complete-reproduction-design.md`。
- 参照は `/Users/fujitatetsu/Downloads/画面収録 2026-08-10 14.28.20.mov` と `/Users/fujitatetsu/Downloads/スクリーンショット 2026-08-10 14.28.15.png`。
- 変更対象はモバイルホーム、モバイルヘッダー、対応テスト、モバイルキャプチャスクリプトだけ。
- 固定下部ナビの5項目、高さ76px、中央の `エージェント`、チャットボタン位置は変更しない。
- 商品詳細、カート、決済、PRC、価格、商品fixture、デスクトップホームは変更しない。
- 既存のユーザー変更を戻さない。各タスクは所有ファイルだけをstageする。
- すべての機能変更はREDテストから始める。テスト失敗理由を確認してから実装する。
- 341px、440px、676px、900px、1511pxで検証する。767px以下だけが新しいホームになる。

---

## Task 1: Restore the two-row SAZO mobile header hierarchy

**Files:**

- Modify: `tests/unit/sazo-commerce-shell.test.tsx`
- Modify: `src/sazo-commerce/SazoShell.tsx`

- [ ] **Step 1: Write the failing header contract**

`tests/unit/sazo-commerce-shell.test.tsx` の `uses the captured mobile home header controls` を次の契約へ更新する。

```tsx
it("renders the two-row mobile home header", async () => {
  const { container } = await renderSazoCommercePage();
  const mobileShell = getShell(container, "mobile");
  const mobileHeader = within(mobileShell).getByRole("banner");

  for (const label of ["言語", "検索", "カート"]) {
    expect(within(mobileHeader).getByRole("button", { name: label })).toBeTruthy();
  }

  const secondary = within(mobileHeader).getByRole("navigation", {
    name: "モバイルサブメニュー",
  });
  expect(within(secondary).getAllByRole("button")).toHaveLength(5);
  expect(
    within(secondary).getByRole("button", { name: "ホーム" }),
  ).toHaveAttribute("aria-pressed", "true");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Expected: home headerに `言語`、`検索`、`モバイルサブメニュー` がないため失敗する。

- [ ] **Step 3: Render the full two-row header on home**

`src/sazo-commerce/SazoShell.tsx` でホームだけを除外している条件分岐を外す。

```tsx
<button aria-label={t("sazo.actions.language")} type="button">
  <span aria-hidden>🇯🇵</span>
</button>
<button aria-label={t("sazo.navigation.search")} type="button">
  <Search aria-hidden size={22} strokeWidth={2.2} />
</button>
<button aria-label={t("sazo.actions.cart")} type="button">
  <ShoppingCart aria-hidden size={23} strokeWidth={2.2} />
</button>
```

`agent-hub` では従来どおりヘッダー全体を非表示にする。その他のビューも既存動作を維持する。`mobileSecondaryNavigation` をホームでも表示し、`NavigationButton` の既存 `aria-pressed` とnavigate処理を再利用する。

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Expected: PASS。

- [ ] **Step 5: Commit only Task 1 files**

```bash
git add tests/unit/sazo-commerce-shell.test.tsx src/sazo-commerce/SazoShell.tsx
git commit -m "feat: restore SAZO mobile header hierarchy"
```

---

## Task 2: Rebuild the mobile home content order and AI entry

**Files:**

- Modify: `tests/unit/sazo-commerce-home.test.tsx`
- Modify: `src/sazo-commerce/HomeView.tsx`

- [ ] **Step 1: Write the failing mobile home order and interaction tests**

`tests/unit/sazo-commerce-home.test.tsx` でモバイル契約を次へ変更する。

```tsx
it("renders the SAZO mobile home hierarchy with J-Planet content", async () => {
  installReducedMotion(true);
  const { container } = await renderHomePage();
  const home = container.querySelector("[data-home-view]");

  expect(home?.querySelectorAll(".sazo-shortcuts .sazo-shortcut")).toHaveLength(5);
  expect(home?.querySelector("[data-mobile-shortcut-grid]")).toBeNull();
  includesInOrder(home?.textContent ?? "", [
    "何を注文しますか？",
    "J-Planet特集",
    "ブラジル最大級",
    "気になっているアイテム",
    "利用者レビュー",
    "MY GIFT FAIR",
    "J-Planet GRAM",
    "J-Planet's PICK",
  ]);
});
```

DOM順序はテキストだけでなく要素でも確認する。

```tsx
const selectors = [
  "[data-testid='sazo-hero']",
  "[data-mobile-agent-search]",
  ".sazo-shortcuts",
  ".sazo-home-intro",
  ".sazo-interested-items",
];
const elements = selectors.map((selector) => home?.querySelector(selector));
expect(elements.every(Boolean)).toBe(true);
for (let index = 1; index < elements.length; index += 1) {
  expect(
    elements[index - 1]?.compareDocumentPosition(elements[index] as Node) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
}
```

AI入口テストは `URL・画像・商品名をAIに相談` ではなく `何を注文しますか？` を押し、既存の `J-Planet AIエージェント` dialogが開くことを確認する。3ロケールの入口ラベルは `sazo.home.mobileSearchPlaceholder` の値を期待する。

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx --reporter=dot
```

Expected: 現行は検索がhero前、10項目shortcut、interested itemsなしのため失敗する。

- [ ] **Step 3: Replace the large AI discovery block with one search pill**

`src/sazo-commerce/HomeView.tsx` から `mobileShortcutItems`、`MobileDiscoveryTop`、そのためだけの `ImagePlus` importを削除する。代わりに単一入口を同ファイルへ追加する。

```tsx
function MobileAgentSearch({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();
  const label = t("sazo.home.mobileSearchPlaceholder");

  return (
    <div className="sazo-mobile-search-overlap" data-mobile-home>
      <button
        aria-label={label}
        className="sazo-mobile-search-pill sazo-mobile-agent-entry"
        data-mobile-agent-search
        onClick={() => dispatch({ type: "open-agent" })}
        type="button"
      >
        <Search aria-hidden size={25} strokeWidth={2.1} />
        <span>{label}</span>
      </button>
    </div>
  );
}
```

既存 `HeroCarousel` 内部の非操作 `.sazo-hero-search` は重複するため削除する。カルーセル本体、counter、pause、自動送りは変更しない。

- [ ] **Step 4: Reorder the mobile branch using existing components**

`HomeView` のモバイル分岐を次の順へする。

```tsx
<HeroCarousel dispatch={dispatch} state={{ ...state, heroFeed: "large-first" }} />
<MobileAgentSearch dispatch={dispatch} />
<ShortcutRow />
<HomeIntro />
<InterestedItemsRail dispatch={dispatch} />
<ReviewStrip dispatch={dispatch} state={state} title="利用者レビュー" />
<MobileGiftFair dispatch={dispatch} />
<MobileGramGrid dispatch={dispatch} />
<MobilePicksGrid dispatch={dispatch} />
<MobileSupportFooter />
```

`ShortcutRow` は既存fixtureの正確な5項目と `JplanetShortcutIcon` を使う。商品fixture、表示価格、商品遷移は変更しない。

- [ ] **Step 5: Run focused unit tests and verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx --reporter=dot
```

Expected: PASS。

- [ ] **Step 6: Commit only Task 2 files**

```bash
git add tests/unit/sazo-commerce-home.test.tsx src/sazo-commerce/HomeView.tsx
git commit -m "feat: align SAZO mobile home discovery"
```

---

## Task 3: Match SAZO mobile geometry without changing the bottom navigation

**Files:**

- Modify: `scripts/sazo-mobile-home-capture.mjs`
- Modify: `src/sazo-commerce/sazo.css`

- [ ] **Step 1: Change the browser geometry contract before CSS**

`scripts/sazo-mobile-home-capture.mjs` の現行84px header、10 shortcut、hero前search期待を更新する。

検査対象:

```js
const header = await page.locator(".sazo-mobile-header").boundingBox();
const primary = await page.locator(".sazo-mobile-header-primary").boundingBox();
const secondary = await page.locator(".sazo-mobile-secondary-nav").boundingBox();
const hero = await page.locator(".sazo-hero-viewport").boundingBox();
const search = await page.locator("[data-mobile-agent-search]").boundingBox();
const shortcuts = await page.locator(".sazo-shortcuts").boundingBox();
const intro = await page.locator(".sazo-home-intro").boundingBox();
const interested = await page.locator(".sazo-interested-items").boundingBox();
```

Assertions:

- headerはprimary + secondaryの2段で、概ね120〜132px。
- secondary buttonは5個、ホームが選択状態。
- heroはheader直下。
- search上端はhero下端より上、search中央はhero下端より下となり半分重なる。
- `hero → search → shortcuts → intro → interested` の順。
- 5 shortcut。
- document幅とviewport幅の差は1px以内。
- bottom navは5項目、高さ76px、fixedのまま。
- 341px、440pxに加え、`{ width: 676, height: 1472 }` を追加して `/tmp/jplanet-mobile-home-676x1472.png` を出力する。
- 900pxと1511pxの既存desktop回帰検査を維持する。

- [ ] **Step 2: Run capture and verify RED**

Run:

```bash
node scripts/sazo-mobile-home-capture.mjs
```

Expected: header高さ、search overlap、shortcut selectorまたは順序で失敗する。

- [ ] **Step 3: Replace the final authoritative mobile CSS block**

`src/sazo-commerce/sazo.css` の `/* SAZO mobile-home capture, 2026-08-10. Keep this final block authoritative. */` 以下を新契約へ合わせる。

必須スタイル:

- `.sazo-mobile-header`: sticky/fixedの既存挙動を維持し、homeでも2段合計高を確保。
- `.sazo-mobile-header-primary`: SAZO参照のロゴと3操作を1列に配置。
- `.sazo-mobile-secondary-nav`: 1行横スクロール、選択下線、scrollbar非表示。
- `.sazo-content-main`: header合計高と一致するpadding-top。
- `.sazo-hero`: header直下、左右余白0、既存2.05:1、角丸0。
- `.sazo-mobile-search-overlap`: hero直後、負のmargin-topと正のz-indexで検索欄を半分重ねる。
- `.sazo-mobile-search-pill`: 白、50px前後、999px角丸、薄い枠と影、検索アイコン、AI badgeなし。
- `.sazo-shortcuts`: 1行5列、SAZO参照のアイコン寸法・ラベル間隔、画面内に収める。
- `.sazo-home-intro`: 区切り線、見出し改行、説明、初回利用pillを参照へ合わせる。
- `.sazo-interested-items`: mobileでも表示し、intro直後の見出し・商品rail密度を整える。
- `.sazo-mobile-shortcut-grid` と `.sazo-mobile-shortcut-art` の古い最終overrideを削除する。
- 768px以上を選択するruleを追加しない。
- ファイル末尾のfixed bottom nav overrideは変更しない。

341pxではフォントとgapだけを小さくし、要素の削除や2段化をしない。676pxでは内容最大幅を無理に狭めず、参照スクリーンショットの比率へ合わせる。

- [ ] **Step 4: Run capture until GREEN and inspect each image**

Run:

```bash
node scripts/sazo-mobile-home-capture.mjs
```

Expected output: `sazo-mobile-home-capture-ok`。

Visual inspection:

```text
/tmp/jplanet-mobile-home-341x735.png
/tmp/jplanet-mobile-home-440x956.png
/tmp/jplanet-mobile-home-676x1472.png
/tmp/jplanet-mobile-home-900x900.png
/tmp/jplanet-desktop-home-1511x900.png
```

`view_image` で5枚を確認し、参照画像と比べてheader高、hero高、検索重なり、shortcut間隔、intro開始位置、bottom nav衝突を確認する。視覚差が大きい場合はCSSを調整して再キャプチャする。

- [ ] **Step 5: Commit only Task 3 files**

```bash
git add scripts/sazo-mobile-home-capture.mjs src/sazo-commerce/sazo.css
git commit -m "style: match SAZO mobile home geometry"
```

---

## Task 4: Update E2E behavior and run full regression verification

**Files:**

- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts`

- [ ] **Step 1: Update the mobile E2E contract**

モバイルホームscenarioのAI入口名を `何を注文しますか？` へ変更する。加えて次を確認する。

```ts
await expect(page.getByRole("navigation", { name: "モバイルサブメニュー" })).toBeVisible();
await expect(
  page.getByRole("navigation", { name: "モバイルサブメニュー" }).getByRole("button"),
).toHaveCount(5);
await expect(page.getByRole("group", { name: "J-Planetショートカット" }).getByRole("button")).toHaveCount(5);
await page.getByRole("button", { name: "何を注文しますか？" }).click();
await expect(page.getByRole("dialog", { name: "J-Planet AIエージェント" })).toBeVisible();
```

固定下部ナビから `エージェント` hubへ移動する既存E2Eは維持する。

- [ ] **Step 2: Run E2E and verify behavior**

Run:

```bash
pnpm test:e2e:sazo
```

Expected: desktop and mobile PASS。

- [ ] **Step 3: Run all quality gates from a fresh state**

Run each command separately and record the exact result:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --reporter=dot
pnpm build
pnpm test:e2e:sazo
node scripts/sazo-mobile-home-capture.mjs
git diff --check
```

Start the preview/dev server if needed and verify:

```bash
curl -I http://127.0.0.1:5190/sazo-commerce-mock/
```

Expected: HTTP 200 and all gates PASS。

- [ ] **Step 4: Perform final visual comparison**

Use `view_image` for all generated images. Compare first fold to:

```text
/Users/fujitatetsu/Downloads/スクリーンショット 2026-08-10 14.28.15.png
/tmp/sazo-mobile-first-fold-contact-sheet.png
```

Confirm explicitly:

- 2-row header and active home underline.
- hero directly below header.
- one search pill overlaps hero.
- one row of 5 crisp J-Planet shortcuts.
- intro, interested items, review, gift fair, GRAM, PICKS order.
- fixed bottom nav remains 76px and center label remains `エージェント`.
- 900px and desktop unchanged.

- [ ] **Step 5: Request independent code review and address findings**

Use `superpowers:requesting-code-review`. Reviewer must inspect only the commits from this plan, compare against the approved spec, and classify findings by severity. For any valid finding, use `superpowers:receiving-code-review`, add a failing regression test when applicable, fix, and rerun the complete quality gates.

- [ ] **Step 6: Commit the E2E contract**

```bash
git add tests/e2e/sazo-commerce-reproduction.spec.ts
git commit -m "test: verify SAZO mobile home reproduction"
```

- [ ] **Step 7: Final handoff**

Report:

- What changed: SAZO mobile home hierarchy reproduced with J-Planet branding.
- Where: exact committed files and commit hashes.
- Verification: exact lint/typecheck/unit/build/E2E/capture/HTTP results.
- Remaining risk: visual differences that still require the user's judgment, if any.
- URL: `http://127.0.0.1:5190/sazo-commerce-mock/` only after HTTP 200 is confirmed.
