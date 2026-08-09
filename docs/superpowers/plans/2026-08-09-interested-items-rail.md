# J-Planet Interested Items Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** J-Planetホームの導入ブロック直下に、SAZO実画面と同じ5商品の「気になっているアイテム」レールを追加する。

**Architecture:** 5商品とローカル画像を`fixtures.ts`へ登録し、既存`ProductCard`へ見た目だけを変える`interest`バリアントを追加する。新しい`InterestedItemsRail`が横スクロールと次へ操作を所有し、`HomeView`は導入ブロックと口コミの間へ配置するだけに留める。

**Tech Stack:** React 19、TypeScript 5.9、Vite 6、Vitest 4、Testing Library、Playwright、Lucide React、Noto Sans JP、CSS scroll snap

## Global Constraints

- 配置は「ブラジル最大級 日本直輸入ショップ」の直下、「みんなの口コミ」の直前とする。
- 初期デスクトップ表示は先頭4商品、5商品目は右側のオーバーフローに置く。
- 右矢印は1商品分進み、末尾で押すと先頭へ戻る。
- 商品画像・11STアイコン・KREAMアイコンはローカル資産へ保存し、実行時の外部リクエストを追加しない。
- 商品画像は正方形WebPとし、参考画像に写り込んだカーソルやブラウザUIを含めない。
- 新規要素はJ-Planetの濃紺・桜色・白を使い、SAZOピンクを主操作色に使わない。
- ブックマークはカード内ローカル状態とし、サーバー保存やグローバルstateを追加しない。
- `prefers-reduced-motion: reduce`では横移動を即時にする。
- モバイルは約1.4枚を表示し、指スワイプとscroll snapを維持する。
- 既存のユーザー所有変更と未追跡ファイルを変更・削除・コミットしない。各コミットではこの計画に明記したファイルだけをstageする。

---

## File Structure

### Create

- `public/sazo-commerce/interested-items/01.webp` — Nike縄跳びの商品画像
- `public/sazo-commerce/interested-items/02.webp` — Nike Mind 001の商品画像
- `public/sazo-commerce/interested-items/03.webp` — Sprint Sister Wの商品画像
- `public/sazo-commerce/interested-items/04.webp` — 肉キーリングの商品画像
- `public/sazo-commerce/interested-items/05.webp` — アヒルクッションの商品画像
- `public/sazo-commerce/interested-items/source-11st.png` — 11STの出典アイコン
- `public/sazo-commerce/interested-items/source-kream.png` — KREAMの出典アイコン
- `src/sazo-commerce/InterestedItemsRail.tsx` — レール描画と横移動の所有者
- `tests/unit/sazo-interested-items.test.tsx` — fixture、カード、レール操作の単体テスト

### Modify

- `src/sazo-commerce/fixtures.ts` — `Product.sourceIcon`と`interestedProducts`、商品registry登録
- `src/sazo-commerce/ProductCard.tsx` — `interest`バリアントと出典アイコン行
- `src/sazo-commerce/HomeView.tsx` — 導入直後へレールを配置
- `src/sazo-commerce/sazo.css` — デスクトップ／モバイルのレールとカード表現
- `src/i18n/locales/ja.json` — 見出しと次へボタンの日本語
- `src/i18n/locales/en.json` — 同じキーの英語
- `src/i18n/locales/pt-BR.json` — 同じキーのポルトガル語
- `tests/unit/sazo-commerce-home.test.tsx` — ホームの表示順契約
- `scripts/sazo-commerce-home-browser.mjs` — デスクトップ／モバイルの視覚・操作契約

---

### Task 1: 元画像と5商品fixtureを追加する

**Files:**

- Create: `public/sazo-commerce/interested-items/01.webp`
- Create: `public/sazo-commerce/interested-items/02.webp`
- Create: `public/sazo-commerce/interested-items/03.webp`
- Create: `public/sazo-commerce/interested-items/04.webp`
- Create: `public/sazo-commerce/interested-items/05.webp`
- Create: `public/sazo-commerce/interested-items/source-11st.png`
- Create: `public/sazo-commerce/interested-items/source-kream.png`
- Create: `tests/unit/sazo-interested-items.test.tsx`
- Modify: `src/sazo-commerce/fixtures.ts:20-45`
- Modify: `src/sazo-commerce/fixtures.ts:340-435`
- Modify: `src/sazo-commerce/fixtures.ts:1340-1380`

**Interfaces:**

- Consumes: 既存`Product`型と`getProductDetail(productId)`。
- Produces: `Product.sourceIcon?: SazoImagePath`と`export const interestedProducts: readonly Product[]`。

- [ ] **Step 1: fixture契約の失敗テストを書く**

`tests/unit/sazo-interested-items.test.tsx`を次の内容で作る。

```tsx
// @vitest-environment jsdom

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getProductDetail, interestedProducts } from "@/sazo-commerce/fixtures";

describe("J-Planet interested items fixtures", () => {
  it("keeps the five source products in the captured order", () => {
    expect(
      interestedProducts.map(({ id, name, price }) => ({ id, name, price })),
    ).toEqual([
      {
        id: "interested-nike-rope",
        name: "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
        price: "¥3,339",
      },
      {
        id: "interested-nike-mind",
        name: "Nike Mind 001 Black Chrome",
        price: "¥17,432",
      },
      {
        id: "interested-sprint-sister",
        name: "[インフルエンサーPick]スプリントシスターW - [リザーロック：オーシャンキューブ：ダークシンダー：セール / IR5693-256]",
        price: "¥12,803",
      },
      {
        id: "interested-meat-keyring",
        name: "肉ラバーかわいいギフトおいしい肉キリング役に立たない無駄な面白い人形動物キーホルダー",
        price: "¥1,048",
      },
      {
        id: "interested-duck-cushion",
        name: "アヒル人形睡眠モチ大型抱擁者クッション動物ぬいぐるみアヒル人形かわいい大型大王小さな巨大動物ボディ",
        price: "¥1,651",
      },
    ]);
  });

  it("ships every interested-item image locally and resolves a mock detail", () => {
    for (const product of interestedProducts) {
      expect(product.image).toMatch(/^\/sazo-commerce\/interested-items\/\d{2}\.webp$/);
      expect(existsSync(resolve(`public${product.image}`))).toBe(true);
      expect(getProductDetail(product.id).product).toEqual(product);
    }
  });
});
```

- [ ] **Step 2: テストが未実装のexportで失敗することを確認する**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-interested-items.test.tsx
```

Expected: FAIL。`interestedProducts`が`fixtures.ts`からexportされていないこと、または画像資産が存在しないことが原因である。

- [ ] **Step 3: SAZO実DOMで確認した元画像をローカルWebPへ変換する**

リポジトリルートで次を実行する。実行時だけ外部取得し、アプリ実行時はローカル資産のみを使う。

```bash
interest_asset_tmp=$(mktemp -d)
mkdir -p public/sazo-commerce/interested-items

curl -L --fail --retry 3 "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/2329501500/B.jpg?11000000" -o "$interest_asset_tmp/01"
curl -L --fail --retry 3 "https://search.pstatic.net/sunny?src=https%3A%2F%2Fkream-phinf.pstatic.net%2FMjAyNjAxMTZfMjgz%2FMDAxNzY4NTI4NTUwNjQ3.J4WCfkHbddnwp2kmFGCOF1SW4oveIptdGyCRfkpmxxEg.W9q89aT9-BpoFth_Au0-f90-mGEaKrHAOAh-0dlE9F0g.PNG%2Fa_4a35eb20a1ab460398a5376b5b0dafae.png" -o "$interest_asset_tmp/02"
curl -L --fail --retry 3 "https://img.29cm.co.kr/item/202604/11f13c632b37ebedbc920db2f48cfdd4.jpg" -o "$interest_asset_tmp/03"
curl -L --fail --retry 3 "https://img.29cm.co.kr/next-product/2024/04/18/2e371856764543b38d786c74665b610f_20240418104521.jpg" -o "$interest_asset_tmp/04"
curl -L --fail --retry 3 "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/9520514098/B.webp?687526719" -o "$interest_asset_tmp/05"

for interest_index in 01 02 03 04 05; do
  ffmpeg -hide_banner -loglevel error -y \
    -i "$interest_asset_tmp/$interest_index" \
    -vf "scale=640:640:force_original_aspect_ratio=increase,crop=640:640" \
    -c:v libwebp -quality 88 \
    "public/sazo-commerce/interested-items/$interest_index.webp"
done

curl -L --fail --retry 3 "https://cdn.sazo.shop/images/site_icons_v2/11st.png" -o public/sazo-commerce/interested-items/source-11st.png
curl -L --fail --retry 3 "https://cdn.sazo.shop/images/site_icons_v2/kream.png" -o public/sazo-commerce/interested-items/source-kream.png
```

画像を確認する。

```bash
for interest_image in public/sazo-commerce/interested-items/*.webp; do
  sips -g pixelWidth -g pixelHeight "$interest_image"
done
```

Expected: 5ファイルすべて`pixelWidth: 640`、`pixelHeight: 640`。

- [ ] **Step 4: `Product`型と`interestedProducts`を実装する**

`Product`へ出典アイコンを追加する。

```ts
export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: SazoImagePath;
  badge?: string;
  sourceIcon?: SazoImagePath;
}
```

`products`の直後へ次を追加する。

```ts
export const interestedProducts = [
  {
    id: "interested-nike-rope",
    brand: "11ST",
    name: "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
    price: "¥3,339",
    image: "/sazo-commerce/interested-items/01.webp",
    sourceIcon: "/sazo-commerce/interested-items/source-11st.png",
  },
  {
    id: "interested-nike-mind",
    brand: "KREAM",
    name: "Nike Mind 001 Black Chrome",
    price: "¥17,432",
    image: "/sazo-commerce/interested-items/02.webp",
    sourceIcon: "/sazo-commerce/interested-items/source-kream.png",
  },
  {
    id: "interested-sprint-sister",
    brand: "29CM",
    name: "[インフルエンサーPick]スプリントシスターW - [リザーロック：オーシャンキューブ：ダークシンダー：セール / IR5693-256]",
    price: "¥12,803",
    image: "/sazo-commerce/interested-items/03.webp",
  },
  {
    id: "interested-meat-keyring",
    brand: "29CM",
    name: "肉ラバーかわいいギフトおいしい肉キリング役に立たない無駄な面白い人形動物キーホルダー",
    price: "¥1,048",
    image: "/sazo-commerce/interested-items/04.webp",
  },
  {
    id: "interested-duck-cushion",
    brand: "11ST",
    name: "アヒル人形睡眠モチ大型抱擁者クッション動物ぬいぐるみアヒル人形かわいい大型大王小さな巨大動物ボディ",
    price: "¥1,651",
    image: "/sazo-commerce/interested-items/05.webp",
  },
] satisfies readonly Product[];
```

`productRegistry`構築配列へ`...interestedProducts`を追加する。

```ts
for (const product of [
  ...products,
  ...interestedProducts,
  ...searchDiscoveryProducts,
  ...catalogInventory.map(({ product }) => product),
  ...reviewRecommendations.map(({ product }) => product),
]) {
```

- [ ] **Step 5: fixtureテスト、型検査、画像寸法を確認する**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-interested-items.test.tsx
pnpm typecheck
```

Expected: 両方PASS。5商品の詳細が既存生成ロジックで解決される。

- [ ] **Step 6: fixtureと資産だけをコミットする**

```bash
git add \
  public/sazo-commerce/interested-items \
  src/sazo-commerce/fixtures.ts \
  tests/unit/sazo-interested-items.test.tsx
git commit -m "feat: add interested item fixtures"
```

---

### Task 2: `ProductCard`へinterestバリアントを追加する

**Files:**

- Modify: `src/sazo-commerce/ProductCard.tsx:6-77`
- Modify: `tests/unit/sazo-interested-items.test.tsx`

**Interfaces:**

- Consumes: Task 1の`Product.sourceIcon`と`interestedProducts[0]`。
- Produces: `ProductCardProps.variant?: "compact" | "interest" | "standard"`、`.sazo-product-title-row`、`.sazo-product-source-icon`。

- [ ] **Step 1: interestカードの失敗テストを書く**

テストファイルへReact・Testing Library・i18n・`ProductCard`のimportと、次のテストを追加する。

```tsx
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { ProductCard } from "@/sazo-commerce/ProductCard";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("renders the compact source identity without losing card interactions", async () => {
  const i18n = await createI18n("ja");
  const onOpen = vi.fn();
  const product = interestedProducts[0];
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <ProductCard onOpen={onOpen} product={product} variant="interest" />
    </I18nextProvider>,
  );
  const card = container.querySelector('[data-variant="interest"]');

  expect(card).not.toBeNull();
  expect(card?.querySelector(".sazo-product-brand")).toBeNull();
  expect(
    card?.querySelector<HTMLImageElement>(".sazo-product-source-icon")?.src,
  ).toContain("/sazo-commerce/interested-items/source-11st.png");
  expect(card?.querySelector(".sazo-product-title-row h3")?.textContent).toBe(
    product.name,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: `商品詳細を開く: ${product.name}`,
    }),
  );
  expect(onOpen).toHaveBeenCalledWith(product.id);

  const favorite = screen.getByRole("button", {
    name: `${product.name}をお気に入りに追加`,
  });
  fireEvent.click(favorite);
  expect(favorite.getAttribute("aria-pressed")).toBe("true");
  expect(onOpen).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: interestバリアント未定義で失敗することを確認する**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-interested-items.test.tsx
```

Expected: FAIL。`interest`がvariant unionにない、または`.sazo-product-title-row`がない。

- [ ] **Step 3: `ProductCard`へ最小のinterest分岐を追加する**

variant unionを更新する。

```ts
variant?: "compact" | "interest" | "standard";
```

既存`.sazo-product-copy`内を次の形にする。standard／compactのDOMは変えない。

```tsx
<div className="sazo-product-copy">
  {variant === "interest" ? (
    <div className="sazo-product-title-row">
      {product.sourceIcon === undefined ? null : (
        <img
          alt=""
          aria-hidden
          className="sazo-product-source-icon"
          decoding="async"
          height={18}
          src={product.sourceIcon}
          width={18}
        />
      )}
      <h3>{product.name}</h3>
    </div>
  ) : (
    <>
      <span className="sazo-product-brand">{product.brand}</span>
      <h3>{product.name}</h3>
    </>
  )}
  <p className="sazo-product-price">
    {product.badge === undefined ? null : (
      <span className="sazo-product-badge">{product.badge}</span>
    )}
    {product.price}
  </p>
</div>
```

- [ ] **Step 4: interestカードテストと既存ホームテストを通す**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-interested-items.test.tsx tests/unit/sazo-commerce-home.test.tsx
pnpm typecheck
```

Expected: PASS。既存standard／compactカードのDOM契約も維持される。

- [ ] **Step 5: ProductCardバリアントをコミットする**

```bash
git add src/sazo-commerce/ProductCard.tsx tests/unit/sazo-interested-items.test.tsx
git commit -m "feat: add interested product card variant"
```

---

### Task 3: レール操作とホーム配置を実装する

**Files:**

- Create: `src/sazo-commerce/InterestedItemsRail.tsx`
- Modify: `src/sazo-commerce/HomeView.tsx:1-25`
- Modify: `src/sazo-commerce/HomeView.tsx:495-520`
- Modify: `src/i18n/locales/ja.json:300-332`
- Modify: `src/i18n/locales/en.json:300-332`
- Modify: `src/i18n/locales/pt-BR.json:300-332`
- Modify: `tests/unit/sazo-interested-items.test.tsx`
- Modify: `tests/unit/sazo-commerce-home.test.tsx:115-155`

**Interfaces:**

- Consumes: `interestedProducts`、`ProductCard`の`interest`バリアント、`Dispatch<SazoAction>`。
- Produces: `InterestedItemsRail({ dispatch }: Pick<HomeViewProps, "dispatch">)`、`data-testid="interested-items-track"`、`.sazo-interested-items-next`。

- [ ] **Step 1: 配置・dispatch・横移動の失敗テストを書く**

`tests/unit/sazo-interested-items.test.tsx`へ追加する。

```tsx
import { HomeView } from "@/sazo-commerce/HomeView";
import { createInitialSazoState } from "@/sazo-commerce/model";

it("places the interested rail between the intro and customer reviews", async () => {
  const i18n = await createI18n("ja");
  const dispatch = vi.fn();
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <HomeView dispatch={dispatch} state={createInitialSazoState()} />
    </I18nextProvider>,
  );
  const children = Array.from(
    container.querySelector("[data-home-view]")?.children ?? [],
  );
  const introIndex = children.findIndex((child) =>
    child.classList.contains("sazo-home-intro"),
  );
  const interestedIndex = children.findIndex((child) =>
    child.classList.contains("sazo-interested-items"),
  );
  const reviewsIndex = children.findIndex((child) =>
    child.classList.contains("sazo-review-section"),
  );

  expect(introIndex).toBeGreaterThanOrEqual(0);
  expect([introIndex, interestedIndex, reviewsIndex]).toEqual([
    introIndex,
    introIndex + 1,
    introIndex + 2,
  ]);
  expect(screen.getByRole("heading", { name: "気になっているアイテム" })).toBeTruthy();
  expect(container.querySelectorAll('[data-variant="interest"]')).toHaveLength(5);

  fireEvent.click(
    screen.getByRole("button", {
      name: `商品詳細を開く: ${interestedProducts[0].name}`,
    }),
  );
  expect(dispatch).toHaveBeenCalledWith({
    type: "open-product",
    productId: "interested-nike-rope",
  });
});

it("scrolls one card and wraps to the start with reduced-motion support", async () => {
  const i18n = await createI18n("ja");
  const matchMedia = vi.fn().mockReturnValue({ matches: false });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: matchMedia,
  });
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <HomeView dispatch={() => undefined} state={createInitialSazoState()} />
    </I18nextProvider>,
  );
  const track = screen.getByTestId("interested-items-track");
  const firstCard = track.querySelector<HTMLElement>(".sazo-product-card");
  Object.defineProperties(track, {
    clientWidth: { configurable: true, value: 1_140 },
    scrollLeft: { configurable: true, value: 0, writable: true },
    scrollWidth: { configurable: true, value: 1_430 },
  });
  vi.spyOn(firstCard as HTMLElement, "getBoundingClientRect").mockReturnValue({
    bottom: 0,
    height: 0,
    left: 0,
    right: 276,
    top: 0,
    width: 276,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  const scrollTo = vi.fn(({ left }: ScrollToOptions) => {
    track.scrollLeft = Number(left ?? 0);
  });
  Object.defineProperty(track, "scrollTo", { configurable: true, value: scrollTo });
  const next = screen.getByRole("button", { name: "次の商品を表示" });

  fireEvent.click(next);
  expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", left: 290 });

  track.scrollLeft = 290;
  fireEvent.click(next);
  expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", left: 0 });

  matchMedia.mockReturnValue({ matches: true });
  fireEvent.click(next);
  expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "auto", left: 290 });
  expect(container.querySelector(".sazo-interested-items-next svg")).not.toBeNull();
});
```

このテストではCSS gapを14pxと仮定するため、コンポーネントのフォールバックgapも14pxに固定する。

- [ ] **Step 2: レール未実装で失敗することを確認する**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-interested-items.test.tsx tests/unit/sazo-commerce-home.test.tsx
```

Expected: FAIL。見出し、5カード、次へボタンが存在しない。

- [ ] **Step 3: 翻訳キーを3言語へ追加する**

各localeの`sazo.home`へ次のキーを追加する。

```json
"interestedItems": "気になっているアイテム",
"nextInterestedItems": "次の商品を表示"
```

既存モックは主要ホーム文言を3localeで日本語固定しているため、この2キーも3ファイルで同じ値にする。

- [ ] **Step 4: `InterestedItemsRail`を実装する**

`src/sazo-commerce/InterestedItemsRail.tsx`を次の責務で作る。

```tsx
import type { Dispatch } from "react";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { interestedProducts } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";
import { ProductCard } from "@/sazo-commerce/ProductCard";

interface InterestedItemsRailProps {
  dispatch: Dispatch<SazoAction>;
}

export function InterestedItemsRail({ dispatch }: InterestedItemsRailProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);

  const showNext = () => {
    const track = trackRef.current;

    if (track === null) {
      return;
    }

    const firstCard = track.querySelector<HTMLElement>(".sazo-product-card");
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
    const computedGap = Number.parseFloat(getComputedStyle(track).columnGap);
    const gap = Number.isFinite(computedGap) ? computedGap : 14;
    const maximumLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const atEnd = maximumLeft - track.scrollLeft <= 1;
    const nextLeft = atEnd
      ? 0
      : Math.min(track.scrollLeft + cardWidth + gap, maximumLeft);
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    track.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      left: nextLeft,
    });
  };

  return (
    <section
      aria-labelledby="sazo-interested-items-heading"
      className="sazo-home-section sazo-interested-items"
    >
      <h2 id="sazo-interested-items-heading">{t("sazo.home.interestedItems")}</h2>
      <div className="sazo-interested-items-viewport">
        <div
          className="sazo-interested-items-track"
          data-testid="interested-items-track"
          ref={trackRef}
        >
          {interestedProducts.map((product) => (
            <ProductCard
              key={product.id}
              onOpen={(productId) => {
                dispatch({ type: "open-product", productId });
              }}
              product={product}
              variant="interest"
            />
          ))}
        </div>
        <button
          aria-label={t("sazo.home.nextInterestedItems")}
          className="sazo-interested-items-next"
          onClick={showNext}
          type="button"
        >
          <ChevronRight aria-hidden size={24} strokeWidth={1.8} />
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `HomeView`の導入直後へ配置する**

importを追加する。

```ts
import { InterestedItemsRail } from "@/sazo-commerce/InterestedItemsRail";
```

導入ブロックの閉じタグ直後を次の順にする。

```tsx
</section>

<InterestedItemsRail dispatch={dispatch} />
<ReviewStrip dispatch={dispatch} state={state} />
<GramStrip dispatch={dispatch} />
```

`tests/unit/sazo-commerce-home.test.tsx`の順序契約にも見出しを加える。

```ts
includesInOrder(markup, [
  "新規特典がリニューアル",
  "J-Planet特集",
  "ブラジル最大級",
  "気になっているアイテム",
  "みんなの口コミ",
  "J-Planet GRAM",
  "レビュー高評価のおすすめ",
  "J-Planet RANKING",
]);
```

- [ ] **Step 6: レール単体・ホーム・型検査を通す**

Run:

```bash
pnpm exec vitest run tests/unit/sazo-interested-items.test.tsx tests/unit/sazo-commerce-home.test.tsx
pnpm typecheck
```

Expected: PASS。DOM順はintro → interested → reviews。

- [ ] **Step 7: 機能実装をコミットする**

```bash
git add \
  src/sazo-commerce/InterestedItemsRail.tsx \
  src/sazo-commerce/HomeView.tsx \
  src/i18n/locales/ja.json \
  src/i18n/locales/en.json \
  src/i18n/locales/pt-BR.json \
  tests/unit/sazo-interested-items.test.tsx \
  tests/unit/sazo-commerce-home.test.tsx
git commit -m "feat: add interested items rail"
```

---

### Task 4: 参考画面どおりのCSSとブラウザ契約を追加する

**Files:**

- Modify: `src/sazo-commerce/sazo.css:1148-1285`
- Modify: `src/sazo-commerce/sazo.css:1880-1950`
- Modify: `src/sazo-commerce/sazo.css:3995-4160`
- Modify: `scripts/sazo-commerce-home-browser.mjs`

**Interfaces:**

- Consumes: Task 2の`data-variant="interest"`とTask 3のレールclass／test id。
- Produces: 4枚表示のデスクトップレール、約1.4枚表示のモバイルレール、44px以上の次へ操作、ブラウザ幾何契約。

- [ ] **Step 1: ブラウザ契約を先に追加して失敗させる**

デスクトップページのintro測定直後へ次を追加する。

```js
const interestedSection = page.locator(".sazo-interested-items");
const interestedTrack = page.getByTestId("interested-items-track");
const interestedCards = interestedTrack.locator('[data-variant="interest"]');
const interestedNext = interestedSection.getByRole("button", {
  name: "次の商品を表示",
});

await interestedSection.scrollIntoViewIfNeeded();
assert.equal(await interestedCards.count(), 5);
const desktopInterestSectionBounds = await interestedSection.boundingBox();
const desktopInterestCardBounds = await interestedCards.first().boundingBox();
const desktopInterestNextBounds = await interestedNext.boundingBox();
assert(
  desktopInterestSectionBounds !== null &&
    desktopInterestCardBounds !== null &&
    desktopInterestNextBounds !== null,
);
assert(Math.abs(desktopInterestSectionBounds.width - 1170) < 24);
assert(desktopInterestCardBounds.width > 270 && desktopInterestCardBounds.width < 290);
assert(desktopInterestNextBounds.width >= 44);
assert(desktopInterestNextBounds.height >= 44);
const desktopFavorite = interestedCards.first().locator(".sazo-product-favorite");
await desktopFavorite.click();
assert.equal(await desktopFavorite.getAttribute("aria-pressed"), "true");
assert.equal(await page.locator(".sazo-root").getAttribute("data-view"), "home");
assert.equal(
  await interestedCards.nth(4).evaluate((element) => {
    const card = element.getBoundingClientRect();
    const track = element.parentElement?.getBoundingClientRect();
    return track === undefined ? false : card.left >= track.right - 1;
  }),
  true,
);

const desktopInterestScrollBefore = await interestedTrack.evaluate(
  (element) => element.scrollLeft,
);
await interestedNext.click();
await page.waitForFunction(
  () =>
    (document.querySelector('[data-testid="interested-items-track"]')?.scrollLeft ?? 0) >
    0,
);
assert(
  (await interestedTrack.evaluate((element) => element.scrollLeft)) >
    desktopInterestScrollBefore,
);
await interestedSection.screenshot({
  path: "/tmp/jplanet-interested-items-desktop.png",
});
```

モバイル測定へ次のlocatorと相対配置契約を追加する。

```js
const mobileInterestedSection = mobilePage.locator(".sazo-interested-items");
const mobileInterestedSectionBounds = await mobileInterestedSection.boundingBox();
const mobileInterestedCardBounds = await mobileInterestedSection
  .locator('[data-variant="interest"]')
  .first()
  .boundingBox();
```

既存の`mobileCommunityHeadingBounds.y === 638`と`mobileReviewCardBounds.y === 668`の絶対値検査は、セクション追加で正しく下がるため次へ置き換える。

```js
assert(mobileInterestedSectionBounds !== null && mobileInterestedCardBounds !== null);
assert(mobileInterestedSectionBounds.y > mobileIntroButtonBounds.y);
assert(
  mobileCommunityHeadingBounds.y >=
    mobileInterestedSectionBounds.y + mobileInterestedSectionBounds.height,
);
assert(mobileReviewCardBounds.y > mobileCommunityHeadingBounds.y);
assert(mobileInterestedCardBounds.width > 225 && mobileInterestedCardBounds.width < 250);
assert.match(
  await mobileInterestedSection
    .locator(".sazo-interested-items-track")
    .evaluate((element) => getComputedStyle(element).scrollSnapType),
  /mandatory/,
);
assert.equal(
  await mobileInterestedSection
    .getByRole("button", { name: "次の商品を表示" })
    .evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width >= 44 && bounds.height >= 44;
    }),
  true,
);
await mobileInterestedSection.screenshot({
  path: "/tmp/jplanet-interested-items-mobile.png",
});
```

同じStep内で、ホームレールからモック詳細へ遷移できることを独立ページで確認する。

```js
const interestedDetailPage = await browser.newPage({
  viewport: { height: 828, width: 1511 },
});
await interestedDetailPage.goto(homeUrl);
await interestedDetailPage.locator("[data-home-view]").waitFor();
await interestedDetailPage
  .getByRole("button", {
    name: "商品詳細を開く: [ナイキ] ファンダメンタル 重量減り(AC4197-010)",
  })
  .click();
await interestedDetailPage.locator('[data-view-content="product"]').waitFor();
assert.equal(
  await interestedDetailPage.locator(".sazo-product-detail-price").innerText(),
  "¥3,339",
);
assert.equal(
  await interestedDetailPage.locator(".sazo-product-detail h1").innerText(),
  "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
);
await interestedDetailPage.close();
```

- [ ] **Step 2: ブラウザ検査が未装飾レイアウトで失敗することを確認する**

Run:

```bash
pnpm test:sazo-home-browser
```

Expected: FAIL。カード幅、5枚目のオーバーフロー、または次へボタン寸法が契約を満たさない。

- [ ] **Step 3: デスクトップCSSを追加する**

既存ホームセクション規則の近くへ追加する。

```css
.sazo-root .sazo-interested-items {
  padding-top: 0;
  padding-bottom: 48px;
}

.sazo-root .sazo-interested-items > h2 {
  margin: 0 0 16px;
  color: var(--jplanet-ink);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.25;
}

.sazo-root .sazo-interested-items-viewport {
  position: relative;
}

.sazo-root .sazo-interested-items-track {
  display: grid;
  grid-auto-columns: calc((100% - 42px) / 4);
  grid-auto-flow: column;
  gap: 14px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-width: none;
  scroll-snap-type: inline mandatory;
}

.sazo-root .sazo-interested-items-track::-webkit-scrollbar {
  display: none;
}

.sazo-root .sazo-product-card[data-variant="interest"] {
  min-width: 0;
  container-type: inline-size;
  scroll-snap-align: start;
}

.sazo-root .sazo-product-card[data-variant="interest"] .sazo-product-card-media {
  border-radius: 14px;
}

.sazo-root .sazo-product-card[data-variant="interest"] .sazo-product-copy {
  padding: 8px 4px 0;
}

.sazo-root .sazo-product-title-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.sazo-root .sazo-product-source-icon {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  object-fit: contain;
}

.sazo-root .sazo-product-card[data-variant="interest"] h3 {
  min-height: 42px;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
}

.sazo-root .sazo-product-card[data-variant="interest"] .sazo-product-price {
  margin-top: 4px;
  font-size: 17px;
}

.sazo-root .sazo-product-card[data-variant="interest"] .sazo-product-favorite {
  top: calc(100cqi - 43px);
  right: 9px;
  bottom: auto;
  width: 34px;
  height: 34px;
  background: transparent;
  color: #fff;
  filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--jplanet-ink) 55%, transparent));
}

.sazo-root .sazo-interested-items-next {
  position: absolute;
  top: calc(50% - 28px);
  right: -24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 1px solid var(--jplanet-line);
  border-radius: 50%;
  background: var(--jplanet-surface);
  color: var(--jplanet-ink);
  box-shadow: 0 7px 22px color-mix(in srgb, var(--jplanet-shadow) 65%, transparent);
  cursor: pointer;
  z-index: 2;
}

@media (prefers-reduced-motion: reduce) {
  .sazo-root .sazo-interested-items-track {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 4: モバイルCSSを既存モバイルmedia queryへ追加する**

```css
.sazo-root .sazo-interested-items {
  padding: 36px 18px;
}

.sazo-root .sazo-interested-items > h2 {
  margin-bottom: 14px;
  font-size: 20px;
}

.sazo-root .sazo-interested-items-track {
  grid-auto-columns: 70vw;
  gap: 12px;
  margin-right: -18px;
  padding-right: 18px;
}

.sazo-root .sazo-interested-items-next {
  top: calc(50% - 24px);
  right: -4px;
  width: 44px;
  height: 44px;
}

.sazo-root .sazo-product-card[data-variant="interest"] .sazo-product-favorite {
  top: calc(100cqi - 42px);
  right: 8px;
}
```

- [ ] **Step 5: ブラウザ検査とスクリーンショットを確認する**

Run:

```bash
pnpm test:sazo-home-browser
```

Expected: PASS。次の2画像を目視する。

- `/tmp/jplanet-interested-items-desktop.png`: 4枚表示、5枚目非表示、右矢印が右端へ半分重なる。
- `/tmp/jplanet-interested-items-mobile.png`: 約1.4枚表示、横あふれなし、右矢印44px以上。

- [ ] **Step 6: CSSとブラウザ契約をコミットする**

```bash
git add src/sazo-commerce/sazo.css scripts/sazo-commerce-home-browser.mjs
git commit -m "feat: match interested items carousel"
```

---

### Task 5: 回帰検査と最終ブラウザ確認を行う

**Files:**

- Verify only: `src/sazo-commerce/**`
- Verify only: `tests/unit/**`
- Verify only: `tests/e2e/sazo-commerce-reproduction.spec.ts`

**Interfaces:**

- Consumes: Tasks 1〜4の完成物。
- Produces: lint、型、単体、build、ホームブラウザ、全ビュー、E2Eの合格証跡。

- [ ] **Step 1: 対象ファイルの整形差分を確認する**

Run:

```bash
pnpm exec prettier --check \
  src/sazo-commerce/InterestedItemsRail.tsx \
  src/sazo-commerce/ProductCard.tsx \
  src/sazo-commerce/HomeView.tsx \
  src/sazo-commerce/fixtures.ts \
  src/sazo-commerce/sazo.css \
  src/i18n/locales/ja.json \
  src/i18n/locales/en.json \
  src/i18n/locales/pt-BR.json \
  tests/unit/sazo-interested-items.test.tsx \
  tests/unit/sazo-commerce-home.test.tsx \
  scripts/sazo-commerce-home-browser.mjs
```

Expected: PASS。失敗時だけ同じ明示ファイル一覧へ`pnpm exec prettier --write`を実行し、整形差分を別コミットする。

- [ ] **Step 2: 静的検査と全単体テストを実行する**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Expected: 全コマンドPASS。

- [ ] **Step 3: production buildを確認する**

Run:

```bash
pnpm build
```

Expected: Vite buildがexit code 0。missing asset warningがない。

- [ ] **Step 4: SAZOブラウザ回帰を実行する**

Run:

```bash
pnpm test:sazo-home-browser
pnpm test:sazo-views-browser
pnpm test:sazo-gram-browser
pnpm qa:sazo-product-detail
pnpm test:e2e:sazo
```

Expected: すべてPASS。商品カードを押した詳細で、元画像・商品名・価格が表示され、商品購入パネルが重複しない。

- [ ] **Step 5: 外部リクエストとworktreeを確認する**

Run:

```bash
git diff --check HEAD
git status --short
```

Expected: この機能のtracked差分は残っていない。事前から存在するユーザー所有の変更・未追跡ファイルだけが表示され、それらはcommitされていない。

- [ ] **Step 6: 最終報告に確認結果とURLを記載する**

報告内容は次の4点に限定する。

1. 導入ブロック直下へ5商品レールを追加したこと。
2. 右矢印、スワイプ、お気に入り、詳細遷移が機能すること。
3. lint／typecheck／test／build／browser／E2Eの結果。
4. 確認URL `http://127.0.0.1:5190/sazo-commerce-mock/`。

---

## Source Verification Notes

2026-08-09にログイン済みSAZOホームの実DOMを読み取り、次を確認した。

| 順番 | SAZO detail ID                         | 出典  |
| ---: | -------------------------------------- | ----- |
|    1 | `821a7b51-e0ab-4228-8dad-49e9d1933d3b` | 11ST  |
|    2 | `cd405404-a88b-49e2-a506-9408f1300b51` | KREAM |
|    3 | `9ab8ae1d-4b4c-4ddb-8351-f0ba0519146a` | 29CM  |
|    4 | `020986ec-91e7-4917-9817-8aaba1819c9c` | 29CM  |
|    5 | `7c0c9b42-e53f-4f7a-90d0-e777155a03ae` | 11ST  |

参考画像では先頭4件だけが見えるが、実DOMには5件目が存在する。したがって、右矢印は装飾ではなく5件目を表示する操作として実装する。
