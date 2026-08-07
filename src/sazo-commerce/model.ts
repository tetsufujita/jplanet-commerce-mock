export type SazoView =
  | "home"
  | "service"
  | "brands"
  | "categories"
  | "catalog"
  | "reviews"
  | "ranking"
  | "mypage"
  | "favorites"
  | "profile"
  | "cards";

export type SazoOverlay = "none" | "login" | "chat";
export type SazoAuthStep = "provider" | "birthday" | "phone";
export type CatalogMode = "list" | "grid";

export interface SazoState {
  view: SazoView;
  overlay: SazoOverlay;
  authStep: SazoAuthStep;
  catalogMode: CatalogMode;
  heroIndex: number;
  heroPaused: boolean;
  selectedCategory: string;
  selectedTab: string;
}

export type SazoAction =
  | { type: "navigate"; view: SazoView }
  | { type: "set-catalog-mode"; mode: CatalogMode }
  | { type: "hero-next" }
  | { type: "toggle-hero-pause" }
  | { type: "open-login" }
  | { type: "advance-auth"; step: SazoAuthStep }
  | { type: "open-chat" }
  | { type: "close-overlay" }
  | { type: "select-category"; category: string }
  | { type: "select-tab"; tab: string }
  | { type: "reset" };

const heroSlideCount = 5;

export function createInitialSazoState(): SazoState {
  return {
    view: "home",
    overlay: "none",
    authStep: "provider",
    catalogMode: "list",
    heroIndex: 0,
    heroPaused: false,
    selectedCategory: "all",
    selectedTab: "all",
  };
}

export function sazoReducer(state: SazoState, action: SazoAction): SazoState {
  switch (action.type) {
    case "navigate":
      return { ...state, view: action.view };
    case "set-catalog-mode":
      return { ...state, catalogMode: action.mode };
    case "hero-next":
      return { ...state, heroIndex: (state.heroIndex + 1) % heroSlideCount };
    case "toggle-hero-pause":
      return { ...state, heroPaused: !state.heroPaused };
    case "open-login":
      return { ...state, overlay: "login", authStep: "provider" };
    case "advance-auth":
      return { ...state, authStep: action.step };
    case "open-chat":
      return { ...state, overlay: "chat" };
    case "close-overlay":
      return { ...state, overlay: "none" };
    case "select-category":
      return { ...state, selectedCategory: action.category };
    case "select-tab":
      return { ...state, selectedTab: action.tab };
    case "reset":
      return createInitialSazoState();
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled SAZO action: ${JSON.stringify(value)}`);
}
