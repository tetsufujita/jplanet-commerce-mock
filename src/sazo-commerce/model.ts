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

export type SazoNonProductView = Exclude<SazoView, "product">;

export type SazoOverlay = "none" | "login" | "chat";
export type SazoAuthStep = "provider" | "google" | "birthday" | "phone";
export type SazoLoadingSurface =
  | "none"
  | "catalog"
  | "directory"
  | "keyword-products"
  | "search-first";
export type SazoHeroFeed = "natural" | "cold-first" | "delivery-last" | "large-first";
export type SazoReviewFeed = "natural" | "desktop-ranking" | "mobile-profile";
export type CatalogMode = "list" | "grid";
export type BrandFilterId =
  | "all"
  | "apparel"
  | "accessories"
  | "bags"
  | "shoes"
  | "gadgets"
  | "beauty";
export type DirectoryCategoryId =
  | "beauty"
  | "ladies"
  | "mens"
  | "kids"
  | "living"
  | "food"
  | "pets"
  | "appliances"
  | "hobby";
export type CatalogTabId =
  | "skincare"
  | "base-makeup"
  | "point-makeup"
  | "sets"
  | "tools"
  | "uv-care"
  | "body-care"
  | "hair-removal"
  | "nails"
  | "hair"
  | "fragrance"
  | "mens-cosmetics"
  | "tops"
  | "outerwear"
  | "bottoms"
  | "dresses"
  | "bags"
  | "shoes"
  | "kids-fashion"
  | "baby"
  | "toys"
  | "appliances"
  | "kitchen"
  | "interior"
  | "daily"
  | "snacks"
  | "drinks"
  | "instant-food"
  | "pet-food"
  | "pet-supplies"
  | "electronics"
  | "kpop"
  | "characters"
  | "sports";
export type ReviewCategoryId =
  | "all"
  | "idol"
  | "beauty"
  | "clothing"
  | "food"
  | "books"
  | "automotive"
  | "kids-pets";
export type RankingMetric = "purchases" | "views";

export interface SazoState {
  view: SazoView;
  overlay: SazoOverlay;
  authStep: SazoAuthStep;
  catalogMode: CatalogMode;
  catalogTab: CatalogTabId;
  catalogChip: string | null;
  directoryCategory: DirectoryCategoryId;
  brandFilter: BrandFilterId;
  reviewCategory: ReviewCategoryId;
  rankingMetric: RankingMetric;
  heroFeed: SazoHeroFeed;
  heroIndex: number;
  heroPaused: boolean;
  campaignLoaded: boolean;
  authenticated: boolean;
  loadingSurface: SazoLoadingSurface;
  reviewFeed: SazoReviewFeed;
  selectedProductId: string | null;
  productReturnView: SazoNonProductView;
  gramCategory: GramCategoryId;
  gramLoading: boolean;
  selectedGramPostId: string | null;
}

export type SazoAction =
  | { type: "navigate"; view: SazoView }
  | { type: "set-catalog-mode"; mode: CatalogMode }
  | { type: "hero-next" }
  | { type: "toggle-hero-pause" }
  | { type: "open-campaign" }
  | { type: "campaign-loaded" }
  | { type: "open-login" }
  | { type: "advance-auth"; step: SazoAuthStep }
  | { type: "complete-auth" }
  | { type: "open-chat" }
  | { type: "close-overlay" }
  | { type: "select-directory-category"; category: DirectoryCategoryId }
  | { type: "select-brand-filter"; filter: BrandFilterId }
  | { type: "select-catalog-tab"; tab: CatalogTabId }
  | { type: "select-catalog-chip"; chip: string | null }
  | { type: "select-review-category"; category: ReviewCategoryId }
  | { type: "select-ranking-metric"; metric: RankingMetric }
  | { type: "open-product"; productId: string }
  | { type: "close-product" }
  | { type: "select-gram-category"; category: GramCategoryId }
  | { type: "gram-loaded" }
  | { type: "open-gram-post"; postId: string }
  | { type: "reset" };

const heroSlideCount = 5;

const qaLoadingSurfaces = new Set<SazoLoadingSurface>([
  "none",
  "catalog",
  "directory",
  "keyword-products",
  "search-first",
]);
const qaHeroFeeds = new Set<SazoHeroFeed>([
  "natural",
  "cold-first",
  "delivery-last",
  "large-first",
]);
const qaReviewFeeds = new Set<SazoReviewFeed>([
  "natural",
  "desktop-ranking",
  "mobile-profile",
]);
const qaViews = new Set<SazoView>([
  "home",
  "service",
  "brands",
  "categories",
  "catalog",
  "campaign",
  "reviews",
  "ranking",
  "mypage",
  "favorites",
  "profile",
  "cards",
  "product",
  "gram",
  "gram-detail",
]);
const qaAuthSteps = new Set<SazoAuthStep>(["provider", "google", "birthday", "phone"]);

export function createInitialSazoState(search = ""): SazoState {
  const state: SazoState = {
    view: "home",
    overlay: "none",
    authStep: "provider",
    catalogMode: "list",
    catalogTab: "skincare",
    catalogChip: null,
    directoryCategory: "beauty",
    brandFilter: "all",
    reviewCategory: "all",
    rankingMetric: "purchases",
    heroFeed: "natural",
    heroIndex: 0,
    heroPaused: false,
    campaignLoaded: false,
    authenticated: false,
    loadingSurface: "none",
    reviewFeed: "natural",
    selectedProductId: null,
    productReturnView: "home",
    gramCategory: "all",
    gramLoading: false,
    selectedGramPostId: null,
  };

  const parameters = new URLSearchParams(search);

  if (parameters.get("qa") !== "1") {
    return state;
  }

  const loadingSurface = parameters.get("loading") as SazoLoadingSurface | null;
  const heroFeed = parameters.get("heroFeed") as SazoHeroFeed | null;
  const reviewFeed = parameters.get("reviewFeed") as SazoReviewFeed | null;
  const view = parameters.get("view") as SazoView | null;
  const authStep = parameters.get("auth") as SazoAuthStep | null;
  const heroIndex = Number(parameters.get("heroIndex"));

  if (loadingSurface !== null && qaLoadingSurfaces.has(loadingSurface)) {
    state.loadingSurface = loadingSurface;
  }

  if (heroFeed !== null && qaHeroFeeds.has(heroFeed)) {
    state.heroFeed = heroFeed;
  }

  if (reviewFeed !== null && qaReviewFeeds.has(reviewFeed)) {
    state.reviewFeed = reviewFeed;
  }

  if (view !== null && qaViews.has(view)) {
    state.view = view;

    if (view === "product") {
      state.selectedProductId = parameters.get("product");
    }

    if (view === "gram-detail") {
      state.selectedGramPostId = parameters.get("gramPost");
    }
  }

  if (authStep !== null && qaAuthSteps.has(authStep)) {
    state.authStep = authStep;
  }

  if (Number.isInteger(heroIndex) && heroIndex >= 0 && heroIndex < heroSlideCount) {
    state.heroIndex = heroIndex;
  }

  return state;
}

export function sazoReducer(state: SazoState, action: SazoAction): SazoState {
  switch (action.type) {
    case "navigate":
      return {
        ...state,
        gramLoading: false,
        overlay: "none",
        selectedGramPostId: action.view === "gram-detail" ? state.selectedGramPostId : null,
        view: action.view,
      };
    case "set-catalog-mode":
      return { ...state, catalogMode: action.mode };
    case "hero-next":
      return { ...state, heroIndex: (state.heroIndex + 1) % heroSlideCount };
    case "toggle-hero-pause":
      return { ...state, heroPaused: !state.heroPaused };
    case "open-campaign":
      return { ...state, campaignLoaded: false, overlay: "none", view: "campaign" };
    case "campaign-loaded":
      return { ...state, campaignLoaded: true };
    case "open-login":
      return { ...state, overlay: "login", authStep: "provider" };
    case "advance-auth":
      return { ...state, authStep: action.step, overlay: "none", view: "home" };
    case "complete-auth":
      return {
        ...state,
        authenticated: true,
        authStep: "provider",
        overlay: "none",
        view: "mypage",
      };
    case "open-chat":
      return { ...state, overlay: "chat" };
    case "close-overlay":
      return { ...state, overlay: "none" };
    case "select-directory-category":
      return { ...state, directoryCategory: action.category };
    case "select-brand-filter":
      return { ...state, brandFilter: action.filter };
    case "select-catalog-tab":
      return { ...state, catalogTab: action.tab, catalogChip: null };
    case "select-catalog-chip":
      return { ...state, catalogChip: action.chip };
    case "select-review-category":
      return { ...state, reviewCategory: action.category };
    case "select-ranking-metric":
      return { ...state, rankingMetric: action.metric };
    case "open-product":
      return {
        ...state,
        overlay: "none",
        productReturnView:
          state.view === "product" ? state.productReturnView : state.view,
        selectedProductId: action.productId,
        view: "product",
      };
    case "close-product":
      return {
        ...state,
        overlay: "none",
        selectedProductId: null,
        view: state.productReturnView,
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
    case "reset":
      return createInitialSazoState();
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled SAZO action: ${JSON.stringify(value)}`);
}
