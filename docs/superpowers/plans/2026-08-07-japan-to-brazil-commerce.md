# J-Planet Japan-to-Brazil Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every J-Planet commerce screen describe Japanese products purchased in Japan and shipped directly to Brazil.

**Architecture:** Keep the current component hierarchy, J-Planet design tokens, and interaction model. Update localized copy and fixture content at their existing sources, replace the route-specific shipping artwork with a local Japan-to-Brazil SVG, and extend the real-browser audit so every route is checked for both required and forbidden copy.

**Tech Stack:** React 18, TypeScript, i18next JSON locales, CSS, Vitest, Testing Library, Playwright, Vite

## Global Constraints

- Home headline must be exactly `ブラジル最大級\n日本直輸入ショップ`.
- Service name must be exactly `日本代行`.
- English route heading must be exactly `FROM JAPAN TO BRAZIL`.
- Core promise must be `日本の商品をブラジルへ直送`.
- URL inputs must refer to `日本のショップURL`.
- Preserve the latest J-Planet logo, white primary surfaces, navy and sakura palette, layouts, navigation, motion, Japanese UI, and current price formatting.
- Do not leave user-visible `韓国`, `KOREA`, `TO JAPAN`, `韓国代行`, or `日本まで発送` copy in any audited route.

---

### Task 1: Add the Japan-to-Brazil copy contract

**Files:**
- Modify: `tests/unit/sazo-commerce-home.test.tsx`
- Modify: `tests/unit/sazo-commerce-views.test.tsx`
- Modify: `scripts/sazo-jplanet-theme-browser.mjs`

**Interfaces:**
- Consumes: the existing `SazoCommercePage`, `data-home-view`, and `data-view-content` selectors.
- Produces: browser assertions that reject legacy route copy on all desktop and mobile views.

- [x] **Step 1: Write failing home and service assertions**

Update the home composition test to require the new heading:

```ts
expect(container.textContent).toContain("ブラジル最大級");
expect(container.textContent).toContain("日本直輸入ショップ");
expect(container.textContent).toContain("日本の商品をブラジルへ直送");
```

Update the service contract to require:

```ts
expect(container.textContent).toContain("日本代行");
expect(container.textContent).toContain("FROMJAPANTOBRAZIL");
expect(container.textContent).toContain("ブラジルへお届け");
```

- [x] **Step 2: Extend the browser route audit**

Inside `assertJplanetTheme`, normalize the rendered text and reject legacy direction copy:

```js
const renderedText = await root.innerText();
for (const forbiddenCopy of ["韓国", "KOREA", "TO JAPAN", "韓国代行", "日本まで発送"]) {
  assert.equal(renderedText.includes(forbiddenCopy), false, `${label} legacy route copy: ${forbiddenCopy}`);
}
```

After each view loads, require positive copy on the two primary marketing views:

```js
if (view === "home") {
  await page.getByText("ブラジル最大級", { exact: false }).waitFor();
  await page.getByText("日本直輸入ショップ", { exact: false }).waitFor();
}
if (view === "service") {
  await page.getByRole("heading", { name: "日本代行" }).waitFor();
  await page.getByText("FROM", { exact: true }).waitFor();
}
```

- [x] **Step 3: Run the tests and prove RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-views.test.tsx
node scripts/sazo-jplanet-theme-browser.mjs
```

Expected: failures show the old Korean-to-Japan copy.

- [x] **Step 4: Commit the failing contract**

```bash
git add tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-views.test.tsx scripts/sazo-jplanet-theme-browser.mjs
git commit -m "test: define Japan to Brazil commerce copy"
```

### Task 2: Reframe global, home, campaign, and fixture copy

**Files:**
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `src/sazo-commerce/fixtures.ts`
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/CampaignView.tsx`

**Interfaces:**
- Consumes: existing `sazo.home.*` and `sazo.views.service.*` translation keys.
- Produces: Japan-to-Brazil text for every component without changing translation key names.

- [x] **Step 1: Replace the home and service locale values in all three locale files**

Use the same Japanese mock copy in `ja`, `en`, and `pt-BR`, matching the current locale structure:

```json
"introTitle": "ブラジル最大級\n日本直輸入ショップ",
"introBody": "J-Planetは日本の人気ショップの商品を購入し、ブラジルへ直接お届けします",
"service": {
  "title": "日本代行",
  "urlLabel": "日本のショップURL",
  "urlPlaceholder": "日本のショップURLを入力してね",
  "stepsTitle": "URL入力だけで、日本の商品をかんたん注文",
  "faq01Question": "日本以外の商品も購入できますか？",
  "faq01Answer": "日本のショップで購入できる商品を対象に、日本からブラジルへの購入・配送代行を利用できます。"
}
```

- [x] **Step 2: Update visible fixture and home catalog copy**

Apply these semantic replacements in fixture values and hardcoded catalog entries:

```text
日本では買えない → ブラジルでは買えない
日本で出回りがなく → ブラジルで出回りがなく
韓国スナック → 日本のお菓子
韓国ファッション → 日本ファッション
韓国ブランド → 日本ブランド
韓国スタバ新作 → 日本限定スタバ新作
韓国ダイソー → 日本ダイソー
夏の韓国トレンド → 夏の日本トレンド
```

- [x] **Step 3: Update campaign search copy**

Change the campaign labels to:

```tsx
<small>日本の商品がたくさん！</small>
<span>日本のショップURLを入力してね</span>
```

- [x] **Step 4: Run focused tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-views.test.tsx
```

Expected: home and fixture tests pass; service assertions may remain red until Task 3.

- [x] **Step 5: Commit the global copy change**

```bash
git add src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json src/sazo-commerce/fixtures.ts src/sazo-commerce/HomeView.tsx src/sazo-commerce/CampaignView.tsx tests/unit/sazo-commerce-home.test.tsx
git commit -m "feat: reframe J-Planet for Brazil delivery"
```

### Task 3: Rebuild the service page route and shipping story

**Files:**
- Create: `public/sazo-commerce/service-lp/shipping-japan-brazil.svg`
- Modify: `src/sazo-commerce/ServiceView.tsx`
- Modify: `tests/unit/sazo-commerce-views.test.tsx`

**Interfaces:**
- Consumes: the existing service page layout and `JplanetLogo`.
- Produces: a service page whose route, benefits, reviews, FAQ, and shipping graphic all describe Japan-to-Brazil delivery.

- [x] **Step 1: Create the local route artwork**

Create an SVG with a white background, navy Japan and Brazil endpoint discs, a sakura flight arc, a small plane marker, and visible `JAPAN` / `BRAZIL` labels. Use this accessible metadata:

```svg
<svg viewBox="0 0 1440 640" role="img" aria-labelledby="title desc" xmlns="http://www.w3.org/2000/svg">
  <title id="title">日本からブラジルへの直送ルート</title>
  <desc id="desc">日本で購入・検品した商品を国際配送し、ブラジルへ届ける流れ</desc>
  <rect width="1440" height="640" rx="48" fill="#ffffff"/>
  <circle cx="220" cy="330" r="118" fill="#f3f6fb"/>
  <circle cx="1220" cy="330" r="118" fill="#fff4f5"/>
  <path d="M275 290 C560 35 930 35 1165 290" fill="none" stroke="#fea2ac" stroke-width="12" stroke-linecap="round"/>
  <path d="M1165 290 l-32 -8 18 28 z" fill="#fea2ac"/>
  <text x="650" y="104" fill="#1f3864" font-size="54" font-weight="800">✈</text>
  <text x="220" y="342" text-anchor="middle" fill="#1f3864" font-size="46" font-weight="800">JAPAN</text>
  <text x="1220" y="342" text-anchor="middle" fill="#1f3864" font-size="46" font-weight="800">BRAZIL</text>
  <text x="220" y="500" text-anchor="middle" fill="#667085" font-size="30">購入・検品</text>
  <text x="1220" y="500" text-anchor="middle" fill="#667085" font-size="30">ブラジルへお届け</text>
</svg>
```

- [x] **Step 2: Replace all hardcoded service direction copy**

Use these exact key phrases:

```tsx
<span aria-hidden className="sazo-service-hero-outline">
  FROM<br />JAPAN<br />TO BRAZIL
</span>
<h1>日本代行</h1>
<h2>日本の商品をブラジルへ直送</h2>
```

Change the search label and placeholder to `日本のショップURL`; change the solution to `J-Planetが日本で購入、ブラジルまで発送`; and change the partner heading to `日本のどの通販でも！`.

- [x] **Step 3: Replace service problems, reviews, trust, FAQ, and shipping steps**

Use this shipping sequence:

```ts
const shippingSteps = [
  "受付",
  "日本国内購入",
  "日本倉庫で検品",
  "国際配送・通関",
  "ブラジルへお届け",
] as const;
```

The trust copy must describe Japan-side purchasing and inspection, international tracking, secure export packaging, and delivery in Brazil without naming an unverified carrier.

- [x] **Step 4: Replace the shipping image**

```tsx
<img
  alt="日本からブラジルへ商品を直送"
  className="sazo-service-shipping-map"
  src="/sazo-commerce/service-lp/shipping-japan-brazil.svg"
/>
```

- [x] **Step 5: Run the service and view tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-views.test.tsx tests/unit/sazo-service-typography.test.ts
```

Expected: all tests pass and the service contract finds `日本代行`, `FROMJAPANTOBRAZIL`, and `ブラジルへお届け`.

- [x] **Step 6: Commit the service change**

```bash
git add public/sazo-commerce/service-lp/shipping-japan-brazil.svg src/sazo-commerce/ServiceView.tsx tests/unit/sazo-commerce-views.test.tsx
git commit -m "feat: add Japan to Brazil service journey"
```

### Task 4: Audit every rendered route and verify the build

**Files:**
- Modify: `scripts/sazo-jplanet-theme-browser.mjs`
- Modify: `docs/superpowers/plans/2026-08-07-japan-to-brazil-commerce.md`

**Interfaces:**
- Consumes: all 12 QA views, three auth states, provider overlay, and chat overlay.
- Produces: fresh desktop/mobile screenshots and completion evidence for the whole objective.

- [x] **Step 1: Run the complete browser audit**

Run:

```bash
node scripts/sazo-jplanet-theme-browser.mjs
```

Expected: `sazo-jplanet-theme-browser-ok`, with no forbidden route copy or horizontal overflow.

- [x] **Step 2: Inspect representative screenshots**

Inspect at minimum:

```text
/tmp/sazo-jplanet-desktop-home.png
/tmp/sazo-jplanet-desktop-service.png
/tmp/sazo-jplanet-desktop-campaign.png
/tmp/sazo-jplanet-mobile-home.png
/tmp/sazo-jplanet-mobile-service.png
/tmp/sazo-jplanet-mobile-campaign.png
```

Confirm the headline, route graphic, form wording, card wrapping, and fixed navigation remain legible.

- [x] **Step 3: Run the full test suite**

Run:

```bash
pnpm vitest run
```

Expected: all test files and all tests pass.

- [x] **Step 4: Run the production build and static checks**

Run:

```bash
pnpm build
git diff --check
rg -n --glob '*.{ts,tsx,json}' '韓国|KOREA|TO JAPAN|韓国代行|日本まで発送' src/sazo-commerce src/i18n/locales
```

Expected: build exits 0, diff check exits 0, and `rg` returns no user-visible legacy direction copy. Internal test descriptions and project namespace identifiers are outside this copy audit.

- [x] **Step 5: Verify the live URL**

Run:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5190/sazo-commerce-mock/
```

Expected: `200`.

- [x] **Step 6: Mark the plan complete**

Change each task checkbox from `[ ]` to `[x]` only after its command has produced the expected evidence.
