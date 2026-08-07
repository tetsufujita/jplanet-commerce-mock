import { describe, expect, it } from "vitest";
import {
  brands,
  categories,
  gramEntries,
  heroSlides,
  products,
  rankingKeywords,
  reviews,
  shortcuts,
} from "@/sazo-commerce/fixtures";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";

describe("sazoReducer", () => {
  it("navigates catalog and preserves its display mode", () => {
    const state = createInitialSazoState();
    const catalog = sazoReducer(state, { type: "navigate", view: "catalog" });
    const grid = sazoReducer(catalog, { type: "set-catalog-mode", mode: "grid" });

    expect(grid.view).toBe("catalog");
    expect(grid.catalogMode).toBe("grid");
  });

  it.each(["login", "chat"] as const)(
    "closes the %s overlay when navigating",
    (overlay) => {
      const state =
        overlay === "login"
          ? sazoReducer(createInitialSazoState(), { type: "open-login" })
          : sazoReducer(createInitialSazoState(), { type: "open-chat" });

      const navigated = sazoReducer(state, { type: "navigate", view: "ranking" });

      expect(navigated).toMatchObject({ view: "ranking", overlay: "none" });
    },
  );

  it("wraps the five-slide hero and toggles pause", () => {
    let state = createInitialSazoState();

    for (let index = 0; index < 5; index += 1) {
      state = sazoReducer(state, { type: "hero-next" });
    }

    expect(state.heroIndex).toBe(0);
    expect(sazoReducer(state, { type: "toggle-hero-pause" }).heroPaused).toBe(true);
  });

  it("advances the mock registration and opens chat deterministically", () => {
    let state = sazoReducer(createInitialSazoState(), { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "birthday" });
    state = sazoReducer(state, { type: "open-chat" });

    expect(state.authStep).toBe("birthday");
    expect(state.overlay).toBe("chat");
  });

  it.each(["login", "chat"] as const)("closes the %s overlay", (overlay) => {
    const state =
      overlay === "login"
        ? sazoReducer(createInitialSazoState(), { type: "open-login" })
        : sazoReducer(createInitialSazoState(), { type: "open-chat" });

    expect(sazoReducer(state, { type: "close-overlay" }).overlay).toBe("none");
  });

  it("selects category and tab independently", () => {
    const categorySelected = sazoReducer(createInitialSazoState(), {
      type: "select-category",
      category: "beauty",
    });
    const tabSelected = sazoReducer(categorySelected, {
      type: "select-tab",
      tab: "popular",
    });

    expect(tabSelected).toMatchObject({
      selectedCategory: "beauty",
      selectedTab: "popular",
    });
  });

  it("resets every stateful screen choice", () => {
    let state = sazoReducer(createInitialSazoState(), {
      type: "navigate",
      view: "catalog",
    });
    state = sazoReducer(state, { type: "set-catalog-mode", mode: "grid" });
    state = sazoReducer(state, { type: "hero-next" });
    state = sazoReducer(state, { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "phone" });
    state = sazoReducer(state, { type: "select-category", category: "beauty" });
    state = sazoReducer(state, { type: "select-tab", tab: "popular" });

    expect(sazoReducer(state, { type: "reset" })).toEqual(createInitialSazoState());
  });
});

describe("SAZO fixture asset contract", () => {
  it("publishes the required collection sizes", () => {
    expect({
      heroSlides: heroSlides.length,
      shortcuts: shortcuts.length,
      products: products.length,
      rankingKeywords: rankingKeywords.length,
      brands: brands.length,
      categories: categories.length,
      reviews: reviews.length,
      gramEntries: gramEntries.length,
    }).toEqual({
      heroSlides: 5,
      shortcuts: 5,
      products: 12,
      rankingKeywords: 10,
      brands: 8,
      categories: 14,
      reviews: 8,
      gramEntries: 6,
    });
  });

  it("uses only Task 4 and Task 5 delivery paths for fixture imagery", () => {
    expect(heroSlides.map(({ image }) => image)).toEqual([
      "/sazo-commerce/hero/slide-1.webp",
      "/sazo-commerce/hero/slide-2.webp",
      "/sazo-commerce/hero/slide-3.webp",
      "/sazo-commerce/hero/slide-4.webp",
      "/sazo-commerce/hero/slide-5.webp",
    ]);
    expect(products.map(({ image }) => image)).toEqual([
      "/sazo-commerce/products/01.webp",
      "/sazo-commerce/products/02.webp",
      "/sazo-commerce/products/03.webp",
      "/sazo-commerce/products/04.webp",
      "/sazo-commerce/products/05.webp",
      "/sazo-commerce/products/06.webp",
      "/sazo-commerce/products/07.webp",
      "/sazo-commerce/products/08.webp",
      "/sazo-commerce/products/09.webp",
      "/sazo-commerce/products/10.webp",
      "/sazo-commerce/products/11.webp",
      "/sazo-commerce/products/12.webp",
    ]);
    expect(brands.map(({ image }) => image)).toEqual([
      "/sazo-commerce/brands/01.webp",
      "/sazo-commerce/brands/02.webp",
      "/sazo-commerce/brands/03.webp",
      "/sazo-commerce/brands/04.webp",
      "/sazo-commerce/brands/05.webp",
      "/sazo-commerce/brands/06.webp",
      "/sazo-commerce/brands/07.webp",
      "/sazo-commerce/brands/08.webp",
    ]);
  });

  it("keeps every fixture image under the local SAZO asset prefix", () => {
    const imagePaths = [
      ...heroSlides,
      ...shortcuts,
      ...products,
      ...brands,
      ...categories,
      ...reviews,
      ...gramEntries,
    ].map(({ image }) => image);

    expect(imagePaths).toHaveLength(58);
    expect(imagePaths.every((image) => image.startsWith("/sazo-commerce/"))).toBe(true);
    expect(imagePaths.every((image) => image.endsWith(".webp"))).toBe(true);
    expect(
      imagePaths.every((image) =>
        /^\/sazo-commerce\/(hero\/slide-0?[1-5]|products\/(0[1-9]|1[0-2])|brands\/0[1-8]|community\/0[1-6])\.webp$/.test(
          image,
        ),
      ),
    ).toBe(true);
  });
});
