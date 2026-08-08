import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  brands,
  categories,
  gramEntries,
  getProductDetail,
  getHeroSlidesForFeed,
  heroSlides,
  homeGramEntries,
  homeGramEntryIds,
  homeReviewIds,
  homeReviews,
  recordedDesktopRankingReviewIds,
  recordedDesktopRankingReviews,
  recordedMobileProfileReviewIds,
  recordedMobileProfileReviews,
  products,
  rankingKeywords,
  reviews,
  shortcuts,
} from "@/sazo-commerce/fixtures";
import {
  createInitialSazoState,
  sazoReducer,
  type SazoState,
} from "@/sazo-commerce/model";

describe("sazoReducer", () => {
  it("opens product detail and returns to the source view", () => {
    const catalog = { ...createInitialSazoState(), view: "catalog" } as SazoState;
    const detail = sazoReducer(catalog, { type: "open-product", productId: "p01" });

    expect(detail).toMatchObject({
      productReturnView: "catalog",
      selectedProductId: "p01",
      view: "product",
    });
    expect(sazoReducer(detail, { type: "close-product" }).view).toBe("catalog");
  });

  it("keeps the original return view when another recommendation is opened", () => {
    const first = sazoReducer(
      { ...createInitialSazoState(), view: "ranking" },
      { type: "open-product", productId: "p01" },
    );
    const second = sazoReducer(first, { type: "open-product", productId: "p02" });

    expect(second.productReturnView).toBe("ranking");
    expect(second.selectedProductId).toBe("p02");
  });

  it("accepts a deterministic product QA entry and falls back safely", () => {
    expect(createInitialSazoState("?qa=1&view=product&product=p01")).toMatchObject({
      productReturnView: "home",
      selectedProductId: "p01",
      view: "product",
    });
    expect(getProductDetail("missing-id").product.id).toBe(products[0]?.id);
  });

  it("resolves rich and generated product detail without changing base products", () => {
    const rich = getProductDetail("p01");
    const generated = getProductDetail("recommendation-heart");

    expect(rich.gallery.length).toBeGreaterThan(1);
    expect(rich.options.length).toBeGreaterThan(0);
    expect(generated.product.id).toBe("recommendation-heart");
    expect(generated.gallery).toEqual([generated.product.image]);
  });

  it("starts with no forced loading surface", () => {
    expect(createInitialSazoState()).toMatchObject({
      heroFeed: "natural",
      heroIndex: 0,
      loadingSurface: "none",
      reviewFeed: "natural",
    });
  });

  it("accepts deterministic capture state only behind the QA query", () => {
    expect(
      createInitialSazoState(
        "?qa=1&loading=directory&heroFeed=cold-first&heroIndex=1&reviewFeed=desktop-ranking",
      ),
    ).toMatchObject({
      heroFeed: "cold-first",
      heroIndex: 1,
      loadingSurface: "directory",
      reviewFeed: "desktop-ranking",
    });
    expect(createInitialSazoState("?qa=1&loading=search-first")).toMatchObject({
      loadingSurface: "search-first",
    });
    expect(
      createInitialSazoState(
        "?loading=catalog&heroFeed=large-first&heroIndex=4&reviewFeed=desktop-ranking",
      ),
    ).toMatchObject({
      heroFeed: "natural",
      heroIndex: 0,
      loadingSurface: "none",
      reviewFeed: "natural",
    });
    expect(
      createInitialSazoState(
        "?qa=1&loading=unknown&heroFeed=unknown&heroIndex=99&reviewFeed=unknown",
      ),
    ).toMatchObject({
      heroFeed: "natural",
      heroIndex: 0,
      loadingSurface: "none",
      reviewFeed: "natural",
    });
  });

  it("opens every commerce view and auth page only through QA parameters", () => {
    expect(createInitialSazoState("?qa=1&view=service").view).toBe("service");
    expect(createInitialSazoState("?qa=1&view=cards").view).toBe("cards");
    expect(createInitialSazoState("?qa=1&auth=phone").authStep).toBe("phone");
    expect(createInitialSazoState("?qa=1&view=unknown").view).toBe("home");
    expect(createInitialSazoState("?qa=1&auth=unknown").authStep).toBe("provider");
    expect(createInitialSazoState("?view=service&auth=phone")).toMatchObject({
      authStep: "provider",
      view: "home",
    });
  });

  it("maps every recorded campaign-feed snapshot to the evidenced slide order", () => {
    const ids = (feed: Parameters<typeof getHeroSlidesForFeed>[0]) =>
      getHeroSlidesForFeed(feed).map(({ id }) => id);

    expect(ids("natural")).toEqual([
      "delivery-line",
      "new-benefits",
      "large-furniture",
      "cold-delivery",
      "friend-invite",
    ]);
    expect(ids("cold-first")).toEqual([
      "cold-delivery",
      "friend-invite",
      "new-benefits",
      "large-furniture",
      "delivery-line",
    ]);
    expect(ids("delivery-last")).toEqual([
      "new-benefits",
      "large-furniture",
      "cold-delivery",
      "friend-invite",
      "delivery-line",
    ]);
    expect(ids("large-first")).toEqual([
      "large-furniture",
      "cold-delivery",
      "friend-invite",
      "delivery-line",
      "new-benefits",
    ]);
  });

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

  it("opens the coupon campaign in a deterministic loading state", () => {
    const loading = sazoReducer(createInitialSazoState(), { type: "open-campaign" });

    expect(loading).toMatchObject({ campaignLoaded: false, view: "campaign" });
    expect(sazoReducer(loading, { type: "campaign-loaded" })).toMatchObject({
      campaignLoaded: true,
      view: "campaign",
    });
  });

  it("advances the mock registration and opens chat deterministically", () => {
    let state = sazoReducer(createInitialSazoState(), { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "birthday" });
    expect(state.overlay).toBe("none");
    state = sazoReducer(state, { type: "open-chat" });

    expect(state.authStep).toBe("birthday");
    expect(state.overlay).toBe("chat");
  });

  it("returns a catalog login to home before showing the registration page", () => {
    let state = sazoReducer(createInitialSazoState(), {
      type: "navigate",
      view: "catalog",
    });
    state = sazoReducer(state, { type: "set-catalog-mode", mode: "grid" });
    state = sazoReducer(state, { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "birthday" });

    expect(state).toMatchObject({
      authStep: "birthday",
      catalogMode: "grid",
      overlay: "none",
      view: "home",
    });
  });

  it("completes the auth page without reopening it after account navigation", () => {
    let state = sazoReducer(createInitialSazoState(), { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "phone" });
    state = sazoReducer(state, { type: "open-chat" });
    state = sazoReducer(state, { type: "close-overlay" });

    expect(state).toMatchObject({ authStep: "phone", overlay: "none", view: "home" });

    const completed = sazoReducer(state, { type: "complete-auth" });

    expect(completed).toMatchObject({
      authenticated: true,
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
      ...products,
      ...brands,
      ...categories,
      ...reviews,
      ...gramEntries,
    ].map(({ image }) => image);

    expect(imagePaths).toHaveLength(53);
    expect(imagePaths.every((image) => image.startsWith("/sazo-commerce/"))).toBe(true);
    expect(imagePaths.every((image) => /\.(?:jpe?g|png|webp)$/.test(image))).toBe(true);
    expect(
      imagePaths.every((image) =>
        /^\/sazo-commerce\/(?:(?:hero\/slide-0?[1-5]|products\/(0[1-9]|1[0-2])|brands\/0[1-8]|community\/(0[1-9]|1[0-4]))\.webp|review-media\/r0[1-8]\.jpg)$/.test(
          image,
        ),
      ),
    ).toBe(true);
  });

  it("keeps J-Planet shortcut icon identifiers unique", () => {
    expect(shortcuts.map(({ id }) => id)).toEqual([
      "feature",
      "limited",
      "flea-market",
      "cosmetics",
      "k-pop",
    ]);
    expect(new Set(shortcuts.map(({ id }) => id)).size).toBe(shortcuts.length);
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
    expect(homeReviewIds).toEqual(["r06", "r02", "r03", "r01", "r04", "r05"]);
    expect(homeReviews.map(({ author, id, image }) => ({ author, id, image }))).toEqual([
      {
        author: "17♡",
        id: "r06",
        image: "/sazo-commerce/review-media/r06.jpg",
      },
      {
        author: "なー",
        id: "r02",
        image: "/sazo-commerce/review-media/r02.jpg",
      },
      { author: "T", id: "r03", image: "/sazo-commerce/review-media/r03.jpg" },
      { author: "mm", id: "r01", image: "/sazo-commerce/review-media/r01.jpg" },
      {
        author: "村上ラッペ",
        id: "r04",
        image: "/sazo-commerce/review-media/r04.jpg",
      },
      {
        author: "코코",
        id: "r05",
        image: "/sazo-commerce/review-media/r05.jpg",
      },
    ]);
    expect(recordedDesktopRankingReviewIds).toEqual([
      "r05",
      "r04",
      "r03",
      "r01",
      "r02",
      "r06",
    ]);
    expect(recordedDesktopRankingReviews.map(({ id }) => id)).toEqual(
      recordedDesktopRankingReviewIds,
    );
    expect(recordedMobileProfileReviewIds).toEqual(homeReviewIds);
    expect(recordedMobileProfileReviews.map(({ id }) => id)).toEqual(
      recordedMobileProfileReviewIds,
    );
    expect(homeGramEntryIds).toEqual(["g01", "g02", "g03"]);
    expect(homeGramEntries.map(({ id }) => id)).toEqual(homeGramEntryIds);
    expect(
      homeGramEntries.map(({ product }) => [
        product.name,
        product.discount ?? null,
        product.price,
      ]),
    ).toEqual([
      ["[たまごっち]長袖パジャマ(Blue)_SPPPG49U09", null, "￥4,594"],
      ["スノーイヤホン / Cタイプ", null, "￥2,185"],
      ["ユアサマーグラスプレートセット（2p）", "20%", "￥3,495"],
    ]);
    expect(homeGramEntries[1]?.image).toBe("/sazo-commerce/gram/home/02.png");
  });
});
