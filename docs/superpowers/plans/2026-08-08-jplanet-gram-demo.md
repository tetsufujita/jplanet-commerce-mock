# J-Planet GRAM Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ホームの `J-Planet GRAM` から、録画どおりの一覧・カテゴリローディング・縦型投稿詳細・関連商品・ホーム復帰を操作できるデモを構築する。

**Architecture:** 既存の `SazoState` を画面遷移・カテゴリ・選択投稿の唯一の状態源にし、GRAM固有データは新しい `gramFixtures.ts`、UIは新しい `GramView.tsx` へ分離する。ホームは入口だけを持ち、専用一覧と詳細を `SazoCommercePage` が `gram` / `gram-detail` ビューとして描画する。再生進捗は詳細コンポーネント内の局所状態、500msのカテゴリロードはページレベルの効果で管理する。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Playwright、Motion、Lucide、既存の `sazo.css` とローカル画像素材。

## Global Constraints

- 参照録画は `/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.24.01.mov` の156〜230秒とする。
- 録画の SAZO 表記は J-Planet に置き換え、白を主面、紺を文字・選択状態、桜色を割引・進捗・フォーカスのアクセントにする。
- 実EC遷移、投稿アップロード、ログイン必須化、動画配信、購入決済、サーバー保存は追加しない。
- 一覧はデスクトップ5列・最大幅1170px、モバイル2列・左右16px・間隔12pxとする。
- カテゴリロード時間は500msとし、後から選ばれたカテゴリを最終選択として採用する。
- カテゴリ順は `全体 / インフルエンサーPick / HOT🔥 / 日用品 / 健康・サプリ / 食べ物 / スタバ / コスメ・スキンケア / ファッション / ドラマ / アイドル` とする。
- 390pxと320pxで意図しない水平ページオーバーフローを発生させず、チップ列だけ横スクロールを許可する。
- すべての新規操作はキーボード操作可能にし、モバイルで44px以上のタップ領域を確保する。
- `prefers-reduced-motion: reduce` ではズームと進捗アニメーションを停止する。
- アプリUIを画像へ焼き込まず、商品名・価格・選択・再生状態はDOMで描画する。
- ユーザー所有の未コミットファイルと、GRAM以外の既存UI・テスト挙動を変更しない。

---

## File Structure

- Create `src/sazo-commerce/gramFixtures.ts`: GRAMカテゴリ、投稿、関連商品の型・固定データ・安全な検索関数。
- Create `src/sazo-commerce/GramView.tsx`: 一覧、カテゴリチップ、スケルトン、投稿カード、詳細メディア、関連商品カード。
- Modify `src/sazo-commerce/model.ts`: `gram` / `gram-detail`、カテゴリ、ロード、選択投稿とアクション。
- Modify `src/sazo-commerce/HomeView.tsx`: 「もっと見る」を一覧へ接続し、ホーム末尾の静的一覧を除去。
- Modify `src/sazo-commerce/SazoCommercePage.tsx`: GRAM画面描画と500msロード完了効果。
- Modify `src/sazo-commerce/sazo.css`: 一覧・詳細・ローディング・レスポンシブ・reduced-motion。
- Modify `src/i18n/locales/{ja,en,pt-BR}.json`: GRAM画面の見出しとアクセシブル名。
- Modify `tests/unit/sazo-commerce-model.test.ts`: GRAM状態機械とQA入口。
- Modify `tests/unit/sazo-commerce-home.test.tsx`: ホーム入口と静的一覧除去。
- Create `tests/unit/sazo-commerce-gram.test.tsx`: 一覧、フィルター、詳細、再生、関連商品。
- Create `scripts/sazo-commerce-gram-browser.mjs`: 録画どおりのデスクトップ・モバイル操作と幾何検証。
- Modify `scripts/sazo-capture-checkpoints.mjs`: `gram` チェックポイントを専用一覧へ遷移して撮影。
- Modify `package.json`: `test:sazo-gram-browser` スクリプト。

---

### Task 1: GRAM domain fixtures and state machine

**Files:**

- Create: `src/sazo-commerce/gramFixtures.ts`
- Modify: `src/sazo-commerce/model.ts`
- Modify: `tests/unit/sazo-commerce-model.test.ts`

**Interfaces:**

- Consumes: `gramEntries` と `products` from `@/sazo-commerce/fixtures`、既存の `SazoState` / `SazoAction`。
- Produces:
  - `GramCategoryId`
  - `GramCategory`
  - `GramProduct`
  - `GramPost`
  - `gramCategories`
  - `gramPosts`
  - `getGramPosts(category: GramCategoryId): readonly GramPost[]`
  - `getGramPost(id: string | null): GramPost`
  - `SazoState.gramCategory`, `SazoState.gramLoading`, `SazoState.selectedGramPostId`
  - `select-gram-category`, `gram-loaded`, `open-gram-post` actions

- [ ] **Step 1: Write the failing state and fixture tests**

Add imports and these focused tests to `tests/unit/sazo-commerce-model.test.ts`:

```ts
import {
  getGramPost,
  getGramPosts,
  gramCategories,
  gramPosts,
} from "@/sazo-commerce/gramFixtures";

it("defines the recorded GRAM categories and complete local post feed", () => {
  expect(gramCategories.map(({ label }) => label)).toEqual([
    "全体",
    "インフルエンサーPick",
    "HOT🔥",
    "日用品",
    "健康・サプリ",
    "食べ物",
    "スタバ",
    "コスメ・スキンケア",
    "ファッション",
    "ドラマ",
    "アイドル",
  ]);
  expect(gramPosts).toHaveLength(10);
  expect(new Set(gramPosts.map(({ id }) => id)).size).toBe(10);
  expect(
    gramPosts.every(
      ({ image, products }) =>
        image.startsWith("/sazo-commerce/") && products.length >= 2,
    ),
  ).toBe(true);
  expect(getGramPosts("hot").every(({ categories }) => categories.includes("hot"))).toBe(
    true,
  );
  expect(getGramPost("missing").id).toBe("gram-01");
});

it("moves through GRAM category loading, detail, and home reset states", () => {
  const gram = sazoReducer(createInitialSazoState(), { type: "navigate", view: "gram" });
  const loading = sazoReducer(gram, { type: "select-gram-category", category: "hot" });
  const loaded = sazoReducer(loading, { type: "gram-loaded" });
  const detail = sazoReducer(loaded, { type: "open-gram-post", postId: "gram-01" });
  const home = sazoReducer(detail, { type: "navigate", view: "home" });

  expect(gram).toMatchObject({ gramCategory: "all", gramLoading: false, view: "gram" });
  expect(loading).toMatchObject({ gramCategory: "hot", gramLoading: true });
  expect(loaded.gramLoading).toBe(false);
  expect(detail).toMatchObject({ selectedGramPostId: "gram-01", view: "gram-detail" });
  expect(home).toMatchObject({
    gramLoading: false,
    selectedGramPostId: null,
    view: "home",
  });
});

it("accepts deterministic GRAM QA entries only behind qa=1", () => {
  expect(createInitialSazoState("?qa=1&view=gram")).toMatchObject({ view: "gram" });
  expect(createInitialSazoState("?qa=1&view=gram-detail&gramPost=gram-03")).toMatchObject(
    {
      selectedGramPostId: "gram-03",
      view: "gram-detail",
    },
  );
  expect(createInitialSazoState("?view=gram-detail&gramPost=gram-03").view).toBe("home");
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-model.test.ts -t "GRAM"
```

Expected: FAIL because `gramFixtures.ts`, the GRAM view names, state fields, and actions do not exist.

- [ ] **Step 3: Add the typed fixture module**

Create `src/sazo-commerce/gramFixtures.ts` with these exact public types and category IDs:

```ts
import { gramEntries, products } from "@/sazo-commerce/fixtures";

export type GramCategoryId =
  | "all"
  | "influencer"
  | "hot"
  | "daily"
  | "health"
  | "food"
  | "starbucks"
  | "beauty"
  | "fashion"
  | "drama"
  | "idol";

export interface GramCategory {
  id: GramCategoryId;
  label: string;
}

export interface GramProduct {
  id: string;
  image: string;
  name: string;
  price: string;
  discount?: string;
  productId?: string;
}

export interface GramPost {
  id: string;
  image: string;
  caption: string;
  author: string;
  categories: readonly Exclude<GramCategoryId, "all">[];
  products: readonly GramProduct[];
}
```

Define the category array in the approved order. Define ten posts with IDs `gram-01` through `gram-10` using this exact primary-card data:

| ID        | Media / primary image              | Primary product                             | Discount | Price     | Categories               |
| --------- | ---------------------------------- | ------------------------------------------- | -------- | --------- | ------------------------ |
| `gram-01` | `/sazo-commerce/community/01.webp` | `[たまごっち]長袖パジャマ(Blue)_SPPPG49U09` | none     | `￥4,594` | `idol`, `fashion`, `hot` |
| `gram-02` | `/sazo-commerce/gram/home/02.png`  | `スノーイヤホン / Cタイプ`                  | none     | `￥2,185` | `daily`, `beauty`        |
| `gram-03` | `/sazo-commerce/community/03.webp` | `ユアサマーグラスプレートセット（2p）`      | `20%`    | `￥3,495` | `starbucks`, `hot`       |
| `gram-04` | `/sazo-commerce/community/12.webp` | `バニーバニートートバッグ`                  | `50%`    | `¥9,719`  | `influencer`, `fashion`  |
| `gram-05` | `/sazo-commerce/community/13.webp` | `サブアークケル Thin バッグ`                | `42%`    | `¥2,280`  | `idol`, `hot`            |
| `gram-06` | `/sazo-commerce/community/14.webp` | `マイメロディードール`                      | none     | `¥110`    | `daily`, `drama`         |
| `gram-07` | `/sazo-commerce/gram/list-02.png`  | `REMINI Plush キャラぬいキーリング`         | `10%`    | `¥4,914`  | `beauty`, `influencer`   |
| `gram-08` | `/sazo-commerce/community/04.webp` | `購入代行依頼`                              | none     | `¥1`      | `health`, `daily`        |
| `gram-09` | `/sazo-commerce/gram/list-04.png`  | `rd check pants スウェットパンツまとめ`     | `50%`    | `¥12,469` | `fashion`, `influencer`  |
| `gram-10` | `/sazo-commerce/gram/list-05.png`  | `[@xanaduany SET] 夏の日本トレンドまとめ`   | none     | `¥12,160` | `food`, `drama`          |

For post index `i`, set `products[0]` to the exact primary product in the table and set `products[1]` to a linked local product built from `products[i % products.length]` in the existing fixture array. Give the linked item `productId` equal to that fixture's `id`; copy its image, name, and price. This guarantees every post has exactly two related items, one faithful recorded product and one route-connected demo product, without network assets. Export filtering and fallback functions:

For `gram-01` through `gram-06`, copy `author` and `caption` from `gramEntries[0]` through `gramEntries[5]`. Use these exact remaining pairs: `gram-07 = KREAM / REMINI Plush キャラぬいキーリング`, `gram-08 = J-Planet / ブラジルからの購入代行リクエスト`, `gram-09 = MUSINSA / rd check pants スウェットパンツまとめ`, and `gram-10 = KREAM / 夏の日本トレンドまとめ`. Declare the final array with `as const satisfies readonly GramPost[]` so its first element is statically present.

```ts
export function getGramPosts(category: GramCategoryId): readonly GramPost[] {
  return category === "all"
    ? gramPosts
    : gramPosts.filter(({ categories }) => categories.includes(category));
}

export function getGramPost(id: string | null): GramPost {
  return gramPosts.find((post) => post.id === id) ?? gramPosts[0];
}
```

At module initialization, throw if the ten IDs are not unique or a post has fewer than two products. This makes fixture corruption fail deterministically during tests.

- [ ] **Step 4: Add GRAM state and reducer transitions**

In `model.ts`:

```ts
import type { GramCategoryId } from "@/sazo-commerce/gramFixtures";

export type SazoView =
  | "home"
  | "service"
  | "brands"
  | "categories"
  | "catalog"
  | "campaign"
  | "reviews"
  | "ranking"
  | "mypage"
  | "favorites"
  | "profile"
  | "cards"
  | "product"
  | "gram"
  | "gram-detail";

// Add these fields to the existing SazoState interface.
{
  gramCategory: GramCategoryId;
  gramLoading: boolean;
  selectedGramPostId: string | null;
}

// Append these variants to the existing SazoAction union.
| { type: "select-gram-category"; category: GramCategoryId }
  | { type: "gram-loaded" }
  | { type: "open-gram-post"; postId: string };
```

Initialize `gramCategory: "all"`, `gramLoading: false`, and `selectedGramPostId: null`. Add `gram` and `gram-detail` to `qaViews`, read `gramPost` only when QA mode selected `gram-detail`, and add these reducer rules:

```ts
case "navigate":
  return {
    ...state,
    gramLoading: false,
    overlay: "none",
    selectedGramPostId: action.view === "gram-detail" ? state.selectedGramPostId : null,
    view: action.view,
  };
case "select-gram-category":
  return { ...state, gramCategory: action.category, gramLoading: true };
case "gram-loaded":
  return { ...state, gramLoading: false };
case "open-gram-post":
  return {
    ...state,
    gramLoading: false,
    overlay: "none",
    selectedGramPostId: action.postId,
    view: "gram-detail",
  };
```

- [ ] **Step 5: Run focused and regression tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: all model tests PASS and TypeScript reports no errors.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/sazo-commerce/gramFixtures.ts src/sazo-commerce/model.ts tests/unit/sazo-commerce-model.test.ts
git commit -m "feat: add J-Planet GRAM state and fixtures"
```

---

### Task 2: Interactive GRAM catalogue and home entry

**Files:**

- Create: `src/sazo-commerce/GramView.tsx`
- Create: `tests/unit/sazo-commerce-gram.test.tsx`
- Modify: `src/sazo-commerce/HomeView.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `tests/unit/sazo-commerce-home.test.tsx`

**Interfaces:**

- Consumes: `GramCategoryId`, `gramCategories`, `getGramPosts`, GRAM fields/actions from Task 1.
- Produces: `GramViewProps`, `GramCatalogView`, `.sazo-gram-view`, `.sazo-gram-filter`, `.sazo-gram-catalog-grid`, `.sazo-gram-catalog-card`, `.sazo-gram-skeleton-card`.

- [ ] **Step 1: Write failing home-entry and catalogue tests**

In `sazo-commerce-home.test.tsx`, replace the assertion that ten catalogue cards exist on the home with:

```ts
it("opens the dedicated GRAM view instead of appending the catalogue to home", async () => {
  const { container } = await renderHomePage();
  const section = screen
    .getByRole("heading", { name: "J-Planet GRAM" })
    .closest("section");

  expect(container.querySelector(".sazo-gram-catalog-section")).toBeNull();
  fireEvent.click(
    within(section as HTMLElement).getByRole("button", { name: "もっと見る" }),
  );

  expect(
    await screen.findByRole("heading", { level: 1, name: "J-Planet GRAM" }),
  ).toBeTruthy();
  expect(container.querySelector('[data-view-content="gram"]')).not.toBeNull();
});
```

Create `tests/unit/sazo-commerce-gram.test.tsx` with a localized render helper and:

```ts
function installReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
    writable: true,
  });
}

async function renderCommercePage() {
  const i18n = await createI18n("ja");
  return render(
    <I18nextProvider i18n={i18n}>
      <SazoCommercePage />
    </I18nextProvider>,
  );
}

async function renderGram(
  state: SazoState,
  dispatch: Dispatch<SazoAction> = vi.fn(),
  surface: "catalog" | "detail" = "catalog",
) {
  const i18n = await createI18n("ja");
  const renderSurface = (nextState: SazoState) =>
    surface === "detail" ? (
      <GramDetailView dispatch={dispatch} state={nextState} />
    ) : (
      <GramCatalogView dispatch={dispatch} state={nextState} />
    );
  const result = render(
    <I18nextProvider i18n={i18n}>{renderSurface(state)}</I18nextProvider>,
  );

  return {
    ...result,
    rerenderWithState(nextState: SazoState) {
      result.rerender(
        <I18nextProvider i18n={i18n}>{renderSurface(nextState)}</I18nextProvider>,
      );
    },
  };
}

it("renders the recorded category order and ten interactive post cards", async () => {
  await renderGram({ ...createInitialSazoState(), view: "gram" });

  expect(screen.getAllByRole("button", { name: /カテゴリ:/ })).toHaveLength(11);
  expect(screen.getAllByRole("button", { name: /投稿を開く:/ })).toHaveLength(10);
  expect(screen.getByRole("button", { name: "カテゴリ: 全体" }).getAttribute("aria-pressed")).toBe("true");
});

it("dispatches category selection and preserves a ten-card loading outline", async () => {
  const dispatch = vi.fn();
  const { rerenderWithState } = await renderGram(createInitialSazoState(), dispatch);

  fireEvent.click(screen.getByRole("button", { name: "カテゴリ: HOT🔥" }));
  expect(dispatch).toHaveBeenCalledWith({ type: "select-gram-category", category: "hot" });

  rerenderWithState({
    ...createInitialSazoState(),
    gramCategory: "hot",
    gramLoading: true,
    view: "gram",
  });
  expect(screen.getByRole("status", { name: "投稿を読み込み中" })).toBeTruthy();
  expect(document.querySelectorAll(".sazo-gram-skeleton-card")).toHaveLength(10);
});

it("keeps the last selected category loading for a full 500ms", async () => {
  vi.useFakeTimers();
  await renderCommercePage();
  const section = screen.getByRole("heading", { name: "J-Planet GRAM" }).closest("section");
  fireEvent.click(within(section as HTMLElement).getByRole("button", { name: "もっと見る" }));
  fireEvent.click(screen.getByRole("button", { name: "カテゴリ: HOT🔥" }));
  act(() => vi.advanceTimersByTime(200));
  fireEvent.click(screen.getByRole("button", { name: "カテゴリ: 日用品" }));
  act(() => vi.advanceTimersByTime(499));
  expect(screen.getByRole("status", { name: "投稿を読み込み中" })).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole("status", { name: "投稿を読み込み中" })).toBeNull();
  expect(screen.getByRole("button", { name: "カテゴリ: 日用品" }).getAttribute("aria-pressed")).toBe("true");
});
```

Import `within` in the home test and ensure the GRAM test wraps the component with the Japanese `I18nextProvider`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-gram.test.tsx -t "GRAM|category|loading"
```

Expected: FAIL because the home button is a no-op, `GramView.tsx` does not exist, and the static catalogue remains on home.

- [ ] **Step 3: Implement the catalogue component**

Create `GramView.tsx` with this public interface:

```ts
export interface GramViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

export function GramCatalogView({ dispatch, state }: GramViewProps) {
  const posts = getGramPosts(state.gramCategory);

  return (
    <main className="sazo-gram-view" data-view-content="gram">
      <h1>J-Planet GRAM</h1>
      <div aria-label="J-Planet GRAM カテゴリ" className="sazo-gram-filter" role="group">
        {gramCategories.map((category) => (
          <button
            aria-label={`カテゴリ: ${category.label}`}
            aria-pressed={state.gramCategory === category.id}
            key={category.id}
            onClick={() => dispatch({ type: "select-gram-category", category: category.id })}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>
      {state.gramLoading ? <GramSkeletonGrid /> : <GramPostGrid posts={posts} dispatch={dispatch} />}
    </main>
  );
}
```

`GramPostGrid` renders ten cards for `all`; filtered categories may render fewer real cards. Every real card is a `<button aria-label={\`投稿を開く: ${post.caption}\`}>`that dispatches`{ type: "open-gram-post", postId: post.id }`. `GramSkeletonGrid`renders exactly ten`aria-hidden`cards plus one`<div role="status" aria-label="投稿を読み込み中">` spinner.

- [ ] **Step 4: Connect Home and page-level loading**

In `HomeView.tsx`:

- Change `GramStrip()` to accept `dispatch`.
- Pass `onMore={() => dispatch({ type: "navigate", view: "gram" })}` to its `SectionHeading`.
- Delete `gramCatalogEntries`, `GramCatalog`, its `gramEntries` import, and `<GramCatalog />` from the home tail.

In `SazoCommercePage.tsx`:

```ts
useEffect(() => {
  if (state.view !== "gram" || !state.gramLoading) return undefined;
  const timeout = window.setTimeout(() => dispatch({ type: "gram-loaded" }), 500);
  return () => window.clearTimeout(timeout);
}, [state.gramCategory, state.gramLoading, state.view]);
```

Render `<GramCatalogView dispatch={dispatch} state={state} />` when `state.view === "gram"`. Including `gramCategory` in the effect dependency guarantees rapid selections cancel the earlier timer and the last selection wins.

- [ ] **Step 5: Add catalogue styling and copy**

Add locale keys under `sazo.gram`:

```json
{
  "title": "J-Planet GRAM",
  "categoriesLabel": "J-Planet GRAM カテゴリ",
  "categoryLabel": "カテゴリ: {{category}}",
  "openPost": "投稿を開く: {{caption}}",
  "loading": "投稿を読み込み中"
}
```

Use these exact English values: `J-Planet GRAM`, `J-Planet GRAM categories`, `Category: {{category}}`, `Open post: {{caption}}`, `Loading posts`. Use these exact Brazilian Portuguese values: `J-Planet GRAM`, `Categorias do J-Planet GRAM`, `Categoria: {{category}}`, `Abrir publicação: {{caption}}`, `Carregando publicações`.

In `sazo.css`, implement:

- `.sazo-gram-view`: width `min(1170px, calc(100% - 64px))`, centered, padding `48px 0 96px`.
- `.sazo-gram-filter`: horizontal flex, gap `10px`, overflow-x auto, hidden scrollbar, 44px minimum button height.
- selected filter: `var(--jplanet-ink)` background and white text.
- `.sazo-gram-catalog-grid`: 5 equal columns, `20px` horizontal and `58px` vertical gap.
- media: aspect ratio `0.78 / 1`, radius `12px`, object-fit cover.
- cards: zero native border/background, left-aligned, focus-visible 3px sakura ring, hover translateY(-3px).
- skeleton: preserve media and copy dimensions with a soft navy/sakura shimmer.
- at max-width `700px`: view width `calc(100% - 32px)`, two columns, `12px` gaps, smaller copy.

- [ ] **Step 6: Run focused and regression tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-gram.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: all focused tests PASS and no type errors.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/sazo-commerce/GramView.tsx src/sazo-commerce/HomeView.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-gram.test.tsx
git commit -m "feat: add interactive J-Planet GRAM catalogue"
```

---

### Task 3: GRAM post detail, playback, and related products

**Files:**

- Modify: `src/sazo-commerce/GramView.tsx`
- Modify: `src/sazo-commerce/SazoCommercePage.tsx`
- Modify: `src/sazo-commerce/sazo.css`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt-BR.json`
- Modify: `tests/unit/sazo-commerce-gram.test.tsx`

**Interfaces:**

- Consumes: `getGramPost`, `GramProduct`, `selectedGramPostId`, `open-product`.
- Produces: `GramDetailView`, `.sazo-gram-detail`, `.sazo-gram-player`, `.sazo-gram-player-progress`, `.sazo-gram-product-grid`.

- [ ] **Step 1: Write failing detail and playback tests**

Add to `sazo-commerce-gram.test.tsx`:

```ts
it("opens a post detail with vertical media and related products", async () => {
  const dispatch = vi.fn();
  await renderGram({ ...createInitialSazoState(), view: "gram" }, dispatch);
  fireEvent.click(screen.getAllByRole("button", { name: /投稿を開く:/ })[0]);
  expect(dispatch).toHaveBeenCalledWith({ type: "open-gram-post", postId: "gram-01" });

  cleanup();
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    dispatch,
    "detail",
  );
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("SPAO");
  expect(screen.getByRole("region", { name: "縦型投稿メディア" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "商品一覧" })).toBeTruthy();
  expect(
    screen.getAllByRole("button", { name: /商品を見る:/ }).length,
  ).toBeGreaterThanOrEqual(2);
});

it("plays, advances, and pauses the demo progress", async () => {
  vi.useFakeTimers();
  installReducedMotion(false);
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    vi.fn(),
    "detail",
  );
  const progress = screen.getByRole("progressbar", { name: "投稿の再生位置" });

  fireEvent.click(screen.getByRole("button", { name: "再生" }));
  act(() => vi.advanceTimersByTime(1_000));
  expect(Number(progress.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
  const paused = progress.getAttribute("aria-valuenow");
  act(() => vi.advanceTimersByTime(1_000));
  expect(progress.getAttribute("aria-valuenow")).toBe(paused);
});

it("keeps progress static when reduced motion is requested", async () => {
  vi.useFakeTimers();
  installReducedMotion(true);
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    vi.fn(),
    "detail",
  );
  fireEvent.click(screen.getByRole("button", { name: "再生" }));
  act(() => vi.advanceTimersByTime(1_000));
  expect(
    screen
      .getByRole("progressbar", { name: "投稿の再生位置" })
      .getAttribute("aria-valuenow"),
  ).toBe("0");
});

it("opens an existing product detail and leaves demo-only products local", async () => {
  const dispatch = vi.fn();
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    dispatch,
    "detail",
  );
  const local = screen.getByRole("button", { name: /商品を見る: \[たまごっち\]/ });
  fireEvent.click(local);
  expect(local.getAttribute("aria-pressed")).toBe("true");
  expect(dispatch).not.toHaveBeenCalled();

  const linked = screen.getByRole("button", { name: /商品を見る:.*リンク済み/ });
  fireEvent.click(linked);
  expect(dispatch).toHaveBeenCalledWith({
    type: "open-product",
    productId: expect.any(String),
  });
});
```

The render helper's fourth argument selects `GramCatalogView` or `GramDetailView`. Install reduced-motion `matchMedia` in tests so timers are deterministic.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-gram.test.tsx -t "detail|plays|product"
```

Expected: FAIL because `GramDetailView`, progress state, and related product controls do not exist.

- [ ] **Step 3: Implement the detail view and local demo player**

Add `GramDetailView` to `GramView.tsx`:

```ts
export function GramDetailView({ dispatch, state }: GramViewProps) {
  const post = getGramPost(state.selectedGramPostId);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const timer = window.setInterval(() => setProgress((value) => (value + 1) % 101), 100);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  return (
    <main className="sazo-gram-detail" data-playing={playing} data-view-content="gram-detail">
      <h1 className="sazo-visually-hidden">{post.caption}</h1>
      <GramMediaPlayer playing={playing} post={post} progress={progress} onToggle={() => setPlaying((value) => !value)} />
      <GramProductList dispatch={dispatch} products={post.products} />
    </main>
  );
}
```

`GramMediaPlayer` uses the post image as a poster, a DOM play/pause button, muted icon, and a progress bar with `aria-valuemin=0`, `aria-valuemax=100`, and current `aria-valuenow`. Its media region has `aria-label="縦型投稿メディア"`. The image zoom class is active only when `playing`.

`GramProductList` renders a `商品一覧` heading and two-column buttons. Its accessible name is `商品を見る: ${product.name}` for a local demo item and `商品を見る: ${product.name}（リンク済み）` for an item with `productId`. For a product with `productId`, click dispatches `open-product`; otherwise it toggles local `aria-pressed` selection and displays a small `選択中` pill without navigation.

- [ ] **Step 4: Render the detail route and add localized controls**

In `SazoCommercePage.tsx`, render `GramDetailView` when `state.view === "gram-detail"`.

Add these locale meanings under `sazo.gram`:

```text
mediaRegion = 縦型投稿メディア
productList = 商品一覧
play = 再生
pause = 一時停止
mute = ミュート
progress = 投稿の再生位置
viewProduct = 商品を見る: {{name}}
selected = 選択中
```

Use these exact English equivalents: `Vertical post media`, `Products`, `Play`, `Pause`, `Muted`, `Post playback position`, `View product: {{name}}`, `Selected`. Use these exact Brazilian Portuguese equivalents: `Mídia vertical da publicação`, `Produtos`, `Reproduzir`, `Pausar`, `Sem som`, `Posição de reprodução`, `Ver produto: {{name}}`, `Selecionado`.

- [ ] **Step 5: Add detail, animation, and responsive CSS**

Implement:

- `.sazo-gram-detail`: max-width 1170px, centered, grid columns `minmax(0, 1fr) 460px`, 48px gap, padding `48px 0 96px`.
- `.sazo-gram-player`: width 390px, max-width 100%, aspect-ratio `9 / 16`, centered on dark navy background.
- playing poster: scale from 1 to 1.035 over 8 seconds with alternate easing.
- controls: dark translucent bottom gradient, 44px buttons, sakura progress fill.
- `.sazo-gram-product-grid`: two equal columns and 16px gap; product image square with radius 12px.
- at max-width `800px`: one column, view width `calc(100% - 32px)`, player first and products second.
- `@media (prefers-reduced-motion: reduce)`: no transform/transition/animation on GRAM media or cards.

- [ ] **Step 6: Run focused and regression tests**

Run:

```bash
pnpm vitest run tests/unit/sazo-commerce-gram.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-model.test.ts
pnpm typecheck
```

Expected: all focused tests PASS and no type errors.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/sazo-commerce/GramView.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-gram.test.tsx
git commit -m "feat: add J-Planet GRAM post detail"
```

---

### Task 4: Browser journey, visual fidelity, and regression verification

**Files:**

- Create: `scripts/sazo-commerce-gram-browser.mjs`
- Modify: `scripts/sazo-capture-checkpoints.mjs`
- Modify: `package.json`
- Modify if browser evidence exposes a defect: `src/sazo-commerce/GramView.tsx`
- Modify if browser evidence exposes a defect: `src/sazo-commerce/sazo.css`
- Test: `tests/unit/sazo-commerce-gram.test.tsx`

**Interfaces:**

- Consumes: accessible GRAM labels and `data-view-content` values from Tasks 2–3.
- Produces: `pnpm test:sazo-gram-browser`, desktop/mobile screenshots in `/tmp`, and an updated deterministic `gram` reference capture path.

- [ ] **Step 1: Write the browser script assertions before changing capture behavior**

Create `scripts/sazo-commerce-gram-browser.mjs` following the existing browser scripts' Vite startup/cleanup pattern. The script must assert this exact journey:

```js
await page.goto(`${baseUrl}/sazo-commerce-mock/?qa=1&cursor=0`);
const homeGram = page.getByRole("heading", { name: "J-Planet GRAM" }).locator("..");
await homeGram.getByRole("button", { name: "もっと見る" }).click();
await page.locator('[data-view-content="gram"]').waitFor();
assert.equal(await page.getByRole("button", { name: /カテゴリ:/ }).count(), 11);
assert.equal(await page.getByRole("button", { name: /投稿を開く:/ }).count(), 10);

await page.getByRole("button", { name: "カテゴリ: HOT🔥" }).click();
await page.getByRole("status", { name: "投稿を読み込み中" }).waitFor();
await page.getByRole("status", { name: "投稿を読み込み中" }).waitFor({ state: "hidden" });
assert.equal(
  await page
    .getByRole("button", { name: "カテゴリ: HOT🔥" })
    .getAttribute("aria-pressed"),
  "true",
);

await page
  .getByRole("button", { name: /投稿を開く:/ })
  .first()
  .click();
await page.locator('[data-view-content="gram-detail"]').waitFor();
await page.getByRole("button", { name: "再生" }).click();
const before = Number(
  await page
    .getByRole("progressbar", { name: "投稿の再生位置" })
    .getAttribute("aria-valuenow"),
);
await page.waitForTimeout(350);
const after = Number(
  await page
    .getByRole("progressbar", { name: "投稿の再生位置" })
    .getAttribute("aria-valuenow"),
);
assert(after > before);
await page.getByRole("button", { name: "一時停止" }).click();
await page.getByRole("button", { name: "J-Planet ホーム" }).click();
await page.locator("[data-home-view]").waitFor();
```

Before implementation integration is accepted, run this script once against the current branch and record failure at the no-op「もっと見る」or missing `gram` view. If Tasks 1–3 have already made it pass, use a temporary assertion for the not-yet-enforced grid geometry (`5` columns) to demonstrate RED, then replace it with the final geometry assertions below.

- [ ] **Step 2: Add final desktop and mobile geometry assertions**

For 1511×828 assert:

- catalogue width between 1168 and 1172px;
- first row contains five distinct card left positions;
- active chip is navy and at least 44px high;
- detail uses two columns and player width between 388 and 392px;
- every image has completed decode and non-zero natural dimensions.

For 390×844 and 320×720 assert:

- document `scrollWidth` equals viewport width;
- catalogue first row contains two distinct card left positions;
- every category control is at least 44px high;
- detail is one column and player width does not exceed the content width;
- the product grid remains two columns when each card is at least 132px wide, otherwise switches to one column at 320px.

Save screenshots to:

```text
/tmp/jplanet-gram-catalog-desktop.png
/tmp/jplanet-gram-loading-desktop.png
/tmp/jplanet-gram-detail-desktop.png
/tmp/jplanet-gram-catalog-mobile.png
/tmp/jplanet-gram-detail-mobile.png
```

- [ ] **Step 3: Register the browser command and update reference capture**

Add to `package.json`:

```json
"test:sazo-gram-browser": "node scripts/sazo-commerce-gram-browser.mjs"
```

Change the `gram` checkpoint in `sazo-capture-checkpoints.mjs` from scrolling to the home-appended grid to:

```js
gram: async (page) => {
  const section = page.getByRole("heading", { name: "J-Planet GRAM" }).locator("..");
  await section.getByRole("button", { exact: true, name: "もっと見る" }).click();
  await waitForVisible(page.locator('[data-view-content="gram"]'));
  await settle(page);
},
```

This preserves the existing 168-second reference target while exercising the real route.

- [ ] **Step 4: Run browser RED, fix only measured defects, and verify GREEN**

Run:

```bash
pnpm test:sazo-gram-browser
```

Expected first run: FAIL on a concrete missing or mismatched browser requirement. Adjust only the corresponding GRAM component/CSS behavior, add a component regression assertion when the defect is semantic rather than purely geometric, and rerun until `sazo-gram-browser-ok` prints.

- [ ] **Step 5: Run the complete verification chain**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm vitest run
pnpm build
pnpm test:sazo-home-browser
pnpm test:sazo-views-browser
pnpm test:sazo-gram-browser
pnpm test:e2e:sazo
pnpm prettier --check src/sazo-commerce/gramFixtures.ts src/sazo-commerce/GramView.tsx src/sazo-commerce/model.ts src/sazo-commerce/HomeView.tsx src/sazo-commerce/SazoCommercePage.tsx src/sazo-commerce/sazo.css src/i18n/locales/ja.json src/i18n/locales/en.json src/i18n/locales/pt-BR.json tests/unit/sazo-commerce-model.test.ts tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-gram.test.tsx scripts/sazo-commerce-gram-browser.mjs scripts/sazo-capture-checkpoints.mjs package.json
git diff --check
```

Expected: every command exits 0, all screenshots exist at the exact `/tmp` paths, and no console/page errors occur during the GRAM browser journey.

- [ ] **Step 6: Visually compare the five screenshots to the recording**

Inspect each screenshot with the recording frames at 162, 174, 180, 186, and 210 seconds. Confirm:

- title/filter/card alignment follows the recording;
- J-Planet theme replaces the source pink SAZO chrome without reintroducing SAZO branding;
- loading preserves grid geometry;
- detail player/product proportions match;
- no clipped text, focus ring, controls, or unexpected blank card appears.

If any item fails, add the narrowest automated assertion that would catch it, watch it fail, fix the implementation, and rerun Step 5.

- [ ] **Step 7: Commit Task 4**

```bash
git add package.json scripts/sazo-commerce-gram-browser.mjs scripts/sazo-capture-checkpoints.mjs src/sazo-commerce/GramView.tsx src/sazo-commerce/sazo.css tests/unit/sazo-commerce-gram.test.tsx
git commit -m "test: verify J-Planet GRAM browser journey"
```

---

## Completion Evidence

The branch is complete only when all of the following are attached to the implementation report:

1. RED and GREEN output for every task's focused tests.
2. Full unit test count and success output.
3. Lint, typecheck, production build, existing browser suites, GRAM browser suite, and e2e success output.
4. Exact desktop/mobile geometry metrics from `sazo-commerce-gram-browser.mjs`.
5. Five final screenshots at the documented `/tmp` paths.
6. A requirement-by-requirement audit against `docs/superpowers/specs/2026-08-08-jplanet-gram-demo-design.md`.
7. Confirmation that user-owned dirty/untracked files were not staged, modified, or deleted.
