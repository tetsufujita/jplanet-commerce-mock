import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  brands,
  categories,
  gramEntries,
  heroSlides,
  homeGramEntries,
  homeGramEntryIds,
  homeReviewIds,
  homeReviews,
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
    expect(state.overlay).toBe("none");
    state = sazoReducer(state, { type: "open-chat" });

    expect(state.authStep).toBe("birthday");
    expect(state.overlay).toBe("chat");
  });

  it("completes the auth page without reopening it after account navigation", () => {
    let state = sazoReducer(createInitialSazoState(), { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "phone" });
    state = sazoReducer(state, { type: "open-chat" });
    state = sazoReducer(state, { type: "close-overlay" });

    expect(state).toMatchObject({ authStep: "phone", overlay: "none", view: "home" });

    const completed = sazoReducer(state, { type: "complete-auth" });

    expect(completed).toMatchObject({
      authStep: "provider",
      overlay: "none",
      view: "mypage",
    });
  });

  it.each(["login", "chat"] as const)("closes the %s overlay", (overlay) => {
    const state =
      overlay === "login"
        ? sazoReducer(createInitialSazoState(), { type: "open-login" })
        : sazoReducer(createInitialSazoState(), { type: "open-chat" });

    expect(sazoReducer(state, { type: "close-overlay" }).overlay).toBe("none");
  });

  it("keeps directory selection independent from catalog tab and chip", () => {
    let state = sazoReducer(createInitialSazoState(), {
      type: "select-directory-category",
      category: "ladies",
    });
    state = sazoReducer(state, {
      type: "select-catalog-tab",
      tab: "tops",
    });
    state = sazoReducer(state, {
      type: "select-catalog-chip",
      chip: "short-sleeve",
    });

    expect(state).toMatchObject({
      directoryCategory: "ladies",
      catalogTab: "tops",
      catalogChip: "short-sleeve",
    });
  });

  it("keeps brand, review, and ranking controls in dedicated state fields", () => {
    let state = sazoReducer(createInitialSazoState(), {
      type: "select-brand-filter",
      filter: "gadgets",
    });
    state = sazoReducer(state, {
      type: "select-review-category",
      category: "idol",
    });
    state = sazoReducer(state, {
      type: "select-ranking-metric",
      metric: "views",
    });

    expect(state).toMatchObject({
      brandFilter: "gadgets",
      reviewCategory: "idol",
      rankingMetric: "views",
    });
  });

  it("clears a chip that belongs to the previous catalog tab", () => {
    let state = sazoReducer(createInitialSazoState(), {
      type: "select-catalog-chip",
      chip: "toner",
    });
    state = sazoReducer(state, {
      type: "select-catalog-tab",
      tab: "base-makeup",
    });

    expect(state).toMatchObject({ catalogTab: "base-makeup", catalogChip: null });
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
    state = sazoReducer(state, {
      type: "select-directory-category",
      category: "beauty",
    });
    state = sazoReducer(state, {
      type: "select-catalog-tab",
      tab: "base-makeup",
    });
    state = sazoReducer(state, { type: "select-catalog-chip", chip: "primer" });
    state = sazoReducer(state, { type: "select-brand-filter", filter: "beauty" });
    state = sazoReducer(state, {
      type: "select-review-category",
      category: "beauty",
    });
    state = sazoReducer(state, {
      type: "select-ranking-metric",
      metric: "views",
    });

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

  it("maps every brand to an existing unique local recording logo", () => {
    const logoPaths = brands.map(({ logo }) => logo);

    expect(logoPaths).toEqual([
      "/sazo-commerce/brand-logos/01.webp",
      "/sazo-commerce/brand-logos/02.webp",
      "/sazo-commerce/brand-logos/03.webp",
      "/sazo-commerce/brand-logos/04.webp",
      "/sazo-commerce/brand-logos/05.webp",
      "/sazo-commerce/brand-logos/06.webp",
      "/sazo-commerce/brand-logos/07.webp",
      "/sazo-commerce/brand-logos/08.webp",
    ]);

    const hashes = logoPaths.flatMap((logoPath) => {
      if (typeof logoPath !== "string") {
        return [];
      }

      const bytes = readFileSync(join(process.cwd(), "public", logoPath));

      return [createHash("sha256").update(bytes).digest("hex")];
    });

    expect(hashes).toHaveLength(8);
    expect(new Set(hashes).size).toBe(8);
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
        /^\/sazo-commerce\/(hero\/slide-0?[1-5]|products\/(0[1-9]|1[0-2])|brands\/0[1-8]|community\/(0[1-9]|1[0-4]))\.webp$/.test(
          image,
        ),
      ),
    ).toBe(true);
  });

  it("keeps review and GRAM fixture content distinct instead of padding counts", () => {
    const reviewSignatures = reviews.map(
      ({ author, comment, image, productName }) =>
        `${author}|${productName}|${comment}|${image}`,
    );
    const gramSignatures = gramEntries.map(
      ({ author, caption, image }) => `${author}|${caption}|${image}`,
    );

    expect(new Set(reviewSignatures).size).toBe(8);
    expect(new Set(reviews.map(({ image }) => image)).size).toBe(8);
    expect(new Set(gramSignatures).size).toBe(6);
    expect(new Set(gramEntries.map(({ image }) => image)).size).toBe(6);
  });

  it("maps the home subsets by explicit fixture IDs with stable content associations", () => {
    expect(homeReviewIds).toEqual(["r01", "r02", "r03", "r04", "r05", "r06"]);
    expect(homeReviews.map(({ author, id, image }) => ({ author, id, image }))).toEqual([
      { author: "mm", id: "r01", image: "/sazo-commerce/community/04.webp" },
      { author: "なー", id: "r02", image: "/sazo-commerce/community/07.webp" },
      { author: "T", id: "r03", image: "/sazo-commerce/community/05.webp" },
      {
        author: "村上ラッペ",
        id: "r04",
        image: "/sazo-commerce/community/08.webp",
      },
      { author: "코코", id: "r05", image: "/sazo-commerce/community/09.webp" },
      { author: "17♡", id: "r06", image: "/sazo-commerce/community/06.webp" },
    ]);
    expect(homeGramEntryIds).toEqual(["g01", "g02", "g03"]);
    expect(homeGramEntries.map(({ id }) => id)).toEqual(homeGramEntryIds);
  });
});
