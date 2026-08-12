# J-Planet Commerce Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/sazo-commerce-mock/`の全ページを白基調のJ-Planetブランド配色へ統一し、ホームの5つのショートカットを鮮明でポップなJ-Planetアイコンへ刷新する。

**Architecture:** `sazo.css`のブランド色をJ-Planetカスタムプロパティへ集約し、全ビューは同じトークンを参照する。ショートカットはデータ上のアイコン種別と専用SVGコンポーネントを分離し、全ページQA用クエリで12ビューと認証状態を直接巡回できるようにする。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、Playwright、CSS custom properties、inline SVG

## Global Constraints

- ブランドネイビーは `#1f3864`、ディープネイビーは `#1f2e4f`、桜ピンクは `#fea2ac` とする。
- ページ、ヘッダー、検索フォーム、商品カードの主面は `#ffffff` を維持する。
- ソフト桜は `#fff4f5`、ソフトブルーは `#f3f6fb` とする。
- ショートカット以外の文章に含まれるSAZO表記の全面的な書き換えは行わない。
- 既存のルート、遷移、レスポンシブレイアウト、商品データは変更しない。
- 意味を持つ成功、警告、エラー色はブランド色への機械置換対象にしない。

## File Map

- Create `src/sazo-commerce/JplanetShortcutIcon.tsx`: 5種類のショートカット図像を描画する。
- Create `public/sazo-commerce/jplanet-sakura-mark.png`: sir提供の桜マーク原典を公開用に保持する。
- Create `scripts/sazo-jplanet-theme-browser.mjs`: 実ブラウザ上のブランドトークンを検証し、全ビューと認証状態をデスクトップ／モバイルで巡回する。
- Modify `src/sazo-commerce/fixtures.ts`: ショートカットを画像URLからアイコン種別へ変更する。
- Modify `src/sazo-commerce/HomeView.tsx`: 新アイコンと`new`バッジを描画する。
- Modify `src/sazo-commerce/model.ts`: QA時だけビューと認証状態を直接指定できるようにする。
- Modify `src/sazo-commerce/sazo.css`: 全ページのJ-Planetトークン、ポップなアイコン、旧SAZO色を置換する。
- Modify `tests/unit/sazo-commerce-home.test.tsx`: 表示ラベルとDOM種別をJ-Planet仕様へ更新する。
- Modify `tests/unit/sazo-commerce-account.test.tsx`: 認証ページのロゴ契約をJ-Planetへ更新する。
- Modify `tests/unit/sazo-commerce-model.test.ts`: QAビュー指定と画像fixture契約を更新する。
- Modify `tests/unit/sazo-reference-manifest.test.ts`: 廃止する旧ショートカットPNGの参照契約を更新する。

---

### Task 1: J-Planet Brand Tokens

**Files:**
- Create: `scripts/sazo-jplanet-theme-browser.mjs`
- Modify: `src/sazo-commerce/sazo.css:1-15`
- Modify: `tests/unit/sazo-commerce-account.test.tsx:168-174`

**Interfaces:**
- Produces: `--jplanet-navy`, `--jplanet-deep-navy`, `--jplanet-sakura`, `--jplanet-sakura-soft`, `--jplanet-blue-soft`, `--jplanet-ink`, `--jplanet-muted`, `--jplanet-line`, `--jplanet-surface`, `--jplanet-soft`, `--jplanet-shadow`。

- [ ] **Step 0: 既存J-Planetロゴに追従して基準テストを直す**

```ts
expect(
  within(birthdayPage)
    .getByRole("banner")
    .querySelector("img[data-jplanet-wordmark='true']"),
).toBeTruthy();
```

Run: `pnpm vitest run tests/unit/sazo-commerce-account.test.tsx`

Expected: 17 tests PASS。

- [ ] **Step 1: ブランドトークンの失敗テストを書く**

```js
const root = page.locator(".sazo-root");
const palette = await root.evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    navy: style.getPropertyValue("--jplanet-navy").trim(),
    deepNavy: style.getPropertyValue("--jplanet-deep-navy").trim(),
    sakura: style.getPropertyValue("--jplanet-sakura").trim(),
    surface: style.getPropertyValue("--jplanet-surface").trim(),
  };
});

assert.deepEqual(palette, {
  navy: "#1f3864",
  deepNavy: "#1f2e4f",
  sakura: "#fea2ac",
  surface: "#ffffff",
});
```

- [ ] **Step 2: REDを確認する**

Run: `node scripts/sazo-jplanet-theme-browser.mjs`

Expected: `--jplanet-navy`が存在しないためFAIL。

- [ ] **Step 3: ルートトークンをJ-Planetへ置換する**

```css
.sazo-root {
  --jplanet-navy: #1f3864;
  --jplanet-deep-navy: #1f2e4f;
  --jplanet-sakura: #fea2ac;
  --jplanet-sakura-soft: #fff4f5;
  --jplanet-blue-soft: #f3f6fb;
  --jplanet-ink: var(--jplanet-deep-navy);
  --jplanet-muted: #667085;
  --jplanet-line: #e5eaf1;
  --jplanet-surface: #ffffff;
  --jplanet-soft: var(--jplanet-blue-soft);
  --jplanet-shadow: rgb(31 46 79 / 12%);
}
```

`--sazo-pink`、`--sazo-ink`、`--sazo-muted`、`--sazo-line`、`--sazo-surface`、`--sazo-soft`、`--sazo-shadow`の全参照を対応するJ-Planetトークンへ機械的に置換する。レイアウト変数`--sazo-slide-left`は変更しない。

- [ ] **Step 4: GREENを確認する**

Run: `node scripts/sazo-jplanet-theme-browser.mjs && pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx`

Expected: 全テストPASS。

- [ ] **Step 5: ブランドトークン変更をコミットする**

```bash
git add src/sazo-commerce/sazo.css scripts/sazo-jplanet-theme-browser.mjs
git commit -m "feat: add J-Planet commerce color tokens"
```

### Task 2: Pop Shortcut Icons

**Files:**
- Create: `src/sazo-commerce/JplanetShortcutIcon.tsx`
- Create: `public/sazo-commerce/jplanet-sakura-mark.png`
- Modify: `src/sazo-commerce/fixtures.ts:22-26,292-310`
- Modify: `src/sazo-commerce/HomeView.tsx:196-215`
- Modify: `src/sazo-commerce/sazo.css:1060-1110,2238-2260`
- Modify: `tests/unit/sazo-commerce-home.test.tsx:120-145`
- Modify: `tests/unit/sazo-commerce-model.test.ts:375-405`

**Interfaces:**
- Produces: `ShortcutIconId = "feature" | "limited" | "flea-market" | "cosmetics" | "k-pop"`。
- Produces: `JplanetShortcutIcon({ id }: { id: ShortcutIconId })`。
- Consumes: Task 1のJ-Planetカラートークン。

- [ ] **Step 1: 新しいショートカットDOM契約の失敗テストを書く**

```tsx
it("renders crisp pop J-Planet shortcut artwork", async () => {
  const { container } = await renderHomePage();
  const shortcuts = screen.getByRole("group", { name: "ショートカット" });

  expect(within(shortcuts).getByRole("button", { name: "J-Planet特集" })).toBeTruthy();
  expect(shortcuts.querySelectorAll("img[data-jplanet-sakura-mark]")).toHaveLength(1);
  expect(shortcuts.querySelectorAll("svg[data-jplanet-shortcut-icon]")).toHaveLength(4);
  expect(shortcuts.querySelectorAll('img[src*="/shortcuts/"]')).toHaveLength(0);
  expect(container.querySelectorAll(".sazo-shortcut-badge")).toHaveLength(2);
});
```

- [ ] **Step 2: REDを確認する**

Run: `pnpm vitest run tests/unit/sazo-commerce-home.test.tsx`

Expected: `J-Planet特集`と新しいSVGが存在しないためFAIL。

- [ ] **Step 3: データ型とSVGコンポーネントを実装する**

```ts
export type ShortcutIconId =
  | "feature"
  | "limited"
  | "flea-market"
  | "cosmetics"
  | "k-pop";

export interface Shortcut {
  id: ShortcutIconId;
  label: string;
  badge?: "new";
}
```

`JplanetShortcutIcon`はfeatureのみ`/sazo-commerce/jplanet-sakura-mark.png`を表示し、残り4種は`viewBox="0 0 64 64"`の塗りSVGを返す。限定はスタンプ、フリマは値札、コスメはリップとブラシ、K-POPは音符入りプレイヤーとし、細い輪郭線だけで構成しない。

- [ ] **Step 4: ホーム表示とポップなタイルCSSを実装する**

```tsx
<span className="sazo-shortcut-icon" data-icon={shortcut.id}>
  <JplanetShortcutIcon id={shortcut.id} />
  {shortcut.badge ? <span className="sazo-shortcut-badge">new</span> : null}
</span>
```

タイルは白、角丸20px、ネイビー系の柔らかい影を維持する。図像はデスクトップ56px、モバイル36pxを上限とし、`feature`だけ桜マークを`object-fit: contain`で表示する。

- [ ] **Step 5: fixture画像契約を更新してGREENを確認する**

`tests/unit/sazo-commerce-model.test.ts`の画像一覧から`shortcuts`を外し、ショートカットIDの重複がないことを別アサーションで確認する。

Run: `pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts`

Expected: 全テストPASS。

- [ ] **Step 6: ショートカット変更をコミットする**

```bash
git add public/sazo-commerce/jplanet-sakura-mark.png src/sazo-commerce/JplanetShortcutIcon.tsx src/sazo-commerce/fixtures.ts src/sazo-commerce/HomeView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
git commit -m "feat: add pop J-Planet shortcut icons"
```

### Task 3: Replace Legacy SAZO Brand Colors Across Every Page

**Files:**
- Modify: `src/sazo-commerce/sazo.css:1-5796`
- Modify: `scripts/sazo-jplanet-theme-browser.mjs`

**Interfaces:**
- Consumes: Task 1の全J-Planetトークン。
- Produces: 全12ビュー、認証、チャット、サービスLPで共通のブランド配色。

- [ ] **Step 1: 代表UIの旧ブランド色を拒否する実ブラウザ失敗テストを書く**

```js
assert.equal(
  await page.locator('.sazo-secondary-button[aria-pressed="true"]').evaluate(
    (element) => getComputedStyle(element).color,
  ),
  "rgb(31, 56, 100)",
);
assert.equal(
  await page.locator(".sazo-chat-button").evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  ),
  "rgb(254, 162, 172)",
);
```

- [ ] **Step 2: REDを確認する**

Run: `node scripts/sazo-jplanet-theme-browser.mjs`

Expected: 旧SAZO色とLPトークンが残っているためFAIL。

- [ ] **Step 3: 全ページ固有のブランド色を置換する**

- Header/Home/Catalog/Directory/Editorial/Account/Auth/Chat: 主要CTAと選択状態は`var(--jplanet-navy)`、バッジと通知は`var(--jplanet-sakura)`へ変更する。
- Campaign: `#facbd4`等の旧ピンク面を`var(--jplanet-sakura-soft)`と`var(--jplanet-sakura)`へ変更する。
- Service LP: `--sazo-lp-pink`系を`--jplanet-lp-sakura`、`--jplanet-lp-sakura-hover`、`--jplanet-lp-form-shadow`、`--jplanet-lp-form-ring`へ改名し、原色をJ-Planet桜ピンクへ変更する。
- フォーカスリングはネイビーまたは桜ピンクを薄め、白い主面を維持する。
- 成功緑、警告黄、Googleブランド色など意味色は維持する。

- [ ] **Step 4: GREENと関連ビュー回帰を確認する**

Run: `node scripts/sazo-jplanet-theme-browser.mjs && pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-views.test.tsx tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-service-typography.test.ts`

Expected: 全テストPASS。

- [ ] **Step 5: 全ページ配色変更をコミットする**

```bash
git add src/sazo-commerce/sazo.css scripts/sazo-jplanet-theme-browser.mjs
git commit -m "feat: apply J-Planet colors across commerce views"
```

### Task 4: Direct Full-Page QA Coverage

**Files:**
- Modify: `src/sazo-commerce/model.ts:145-195`
- Modify: `tests/unit/sazo-commerce-model.test.ts`
- Modify: `scripts/sazo-jplanet-theme-browser.mjs`

**Interfaces:**
- Produces: QA query `?qa=1&view=<SazoView>`。
- Produces: QA query `?qa=1&auth=<provider|google|birthday|phone>`。

- [ ] **Step 1: QAビュー指定の失敗テストを書く**

```ts
it("opens every commerce view and auth page through QA parameters", () => {
  expect(createInitialSazoState("?qa=1&view=service").view).toBe("service");
  expect(createInitialSazoState("?qa=1&view=cards").view).toBe("cards");
  expect(createInitialSazoState("?qa=1&auth=phone").authStep).toBe("phone");
  expect(createInitialSazoState("?qa=1&view=unknown").view).toBe("home");
});
```

- [ ] **Step 2: REDを確認する**

Run: `pnpm vitest run tests/unit/sazo-commerce-model.test.ts`

Expected: `view`と`auth`が無視されるためFAIL。

- [ ] **Step 3: 許可リスト付きQAパラメーターを実装する**

```ts
const qaViews = new Set<SazoView>([
  "home", "service", "brands", "categories", "catalog", "campaign",
  "reviews", "ranking", "mypage", "favorites", "profile", "cards",
]);
const qaAuthSteps = new Set<SazoAuthStep>(["provider", "google", "birthday", "phone"]);
```

`qa=1`のときだけ許可リスト内の`view`と`auth`を初期stateへ反映する。不正値はhome/providerへフォールバックする。

- [ ] **Step 4: 全画面巡回スクリプトを作成する**

`scripts/sazo-jplanet-theme-browser.mjs`は1511×828と390×844で12ビューを開き、各`data-view-content`または`data-home-view`の表示、ルート背景の白、J-Planetカスタムプロパティの値、水平オーバーフローなしを検証して`/tmp/sazo-jplanet-<viewport>-<view>.png`へ保存する。認証4状態とログイン／チャットoverlayも別ケースで開く。

- [ ] **Step 5: QAスクリプトとモデルテストをGREENにする**

Run: `pnpm vitest run tests/unit/sazo-commerce-model.test.ts && node scripts/sazo-jplanet-theme-browser.mjs`

Expected: `sazo-jplanet-theme-browser-ok`を出力して終了コード0。

- [ ] **Step 6: QA導線をコミットする**

```bash
git add src/sazo-commerce/model.ts tests/unit/sazo-commerce-model.test.ts scripts/sazo-jplanet-theme-browser.mjs
git commit -m "test: cover all J-Planet commerce views"
```

### Task 5: Completion Audit

**Files:**
- Modify when required by evidence: `src/sazo-commerce/sazo.css`, `src/sazo-commerce/JplanetShortcutIcon.tsx`, `scripts/sazo-jplanet-theme-browser.mjs`

**Interfaces:**
- Consumes: Tasks 1-4の実装と全画面スクリーンショット。

- [ ] **Step 1: コードとアセット監査を実行する**

Run: `rg -n -- '#e52969|#eb3658|#ef4666|#d83252|#fe8291|--sazo-pink|--sazo-lp-pink' src/sazo-commerce public/sazo-commerce`

Expected: 0 matches。

- [ ] **Step 2: 関連テスト一式を実行する**

Run: `pnpm vitest run tests/unit/sazo-commerce-shell.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-views.test.tsx tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-service-typography.test.ts`

Expected: 0 failures。

- [ ] **Step 3: 全画面ブラウザ検証とビルドを実行する**

Run: `node scripts/sazo-jplanet-theme-browser.mjs && pnpm build && git diff --check`

Expected: ブラウザ検証、Vite build、差分チェックがすべて終了コード0。

- [ ] **Step 4: デスクトップとモバイルのコンタクトシートを目視確認する**

全12ビュー、認証4状態、overlayのスクリーンショットを確認し、旧SAZO色、ぼやけたアイコン、白基調の崩れ、水平オーバーフローが1件でもあれば該当実装へ戻る。

- [ ] **Step 5: 最終変更をコミットする**

```bash
git add src/sazo-commerce public/sazo-commerce scripts/sazo-jplanet-theme-browser.mjs tests/unit
git commit -m "feat: complete J-Planet commerce theme"
```
