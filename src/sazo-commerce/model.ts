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
  | "cards";

export type SazoOverlay = "none" | "login" | "chat";
export type SazoAuthStep = "provider" | "birthday" | "phone";
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
  heroIndex: number;
  heroPaused: boolean;
  campaignLoaded: boolean;
  authenticated: boolean;
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
  | { type: "reset" };

const heroSlideCount = 5;

export function createInitialSazoState(): SazoState {
  return {
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
    heroIndex: 0,
    heroPaused: false,
    campaignLoaded: false,
    authenticated: false,
  };
}

export function sazoReducer(state: SazoState, action: SazoAction): SazoState {
  switch (action.type) {
    case "navigate":
      return { ...state, view: action.view, overlay: "none" };
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
    case "reset":
      return createInitialSazoState();
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled SAZO action: ${JSON.stringify(value)}`);
}
