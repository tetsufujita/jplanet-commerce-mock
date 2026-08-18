// @vitest-environment jsdom

import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { PNG } from "pngjs";
import { createI18n } from "@/i18n/createI18n";
import { HomeView } from "@/sazo-commerce/HomeView";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import {
  homeCategoryItems,
  homeShortcutItems,
  searchDiscoveryMediaCrops,
  type HomeCategoryItem,
  type HomeShortcutItem,
} from "@/sazo-commerce/fixtures";
import { createInitialSazoState, type SazoAction } from "@/sazo-commerce/model";
import { useSazoHero } from "@/sazo-commerce/useSazoHero";

if (!("PointerEvent" in window)) {
  class TestPointerEvent extends MouseEvent {
    isPrimary: boolean;
    pointerId: number;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.isPrimary = init.isPrimary ?? false;
      this.pointerId = init.pointerId ?? 0;
    }
  }

  Object.defineProperty(window, "PointerEvent", {
    configurable: true,
    value: TestPointerEvent,
  });
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function includesInOrder(markup: string, values: readonly string[]) {
  let previousIndex = -1;

  for (const value of values) {
    const nextIndex = markup.indexOf(value, previousIndex + 1);

    expect(
      nextIndex,
      `Expected ${value} after index ${String(previousIndex)}`,
    ).toBeGreaterThan(previousIndex);
    previousIndex = nextIndex;
  }
}

function installReducedMotion(matches: boolean, mobileHome = true) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => {
      const isMobileHomeQuery = query === "(max-width: 767px)";
      const isReducedMotionQuery = query === "(prefers-reduced-motion: reduce)";

      return {
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: isMobileHomeQuery ? mobileHome : isReducedMotionQuery ? matches : false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      };
    },
    writable: true,
  });
}

async function renderHomePage(
  locale: "ja" | "en" | "pt-BR" = "ja",
  dispatch?: (action: SazoAction) => void,
) {
  const i18n = await createI18n(locale);

  if (dispatch !== undefined) {
    installReducedMotion(true);
  }

  return render(
    <I18nextProvider i18n={i18n}>
      {dispatch === undefined ? (
        <SazoCommercePage />
      ) : (
        <HomeView dispatch={dispatch} state={createInitialSazoState()} />
      )}
    </I18nextProvider>,
  );
}

function HeroTicker({
  intervalMs = 5_000,
  onNext,
  paused = false,
}: {
  intervalMs?: number;
  onNext: () => void;
  paused?: boolean;
}) {
  useSazoHero({ intervalMs, onNext, paused });

  return null;
}

describe("SAZO home composition", () => {
  it("exposes the shared Apple-style surface contract", async () => {
    const { container } = await renderHomePage();

    expect(
      container.querySelector('.sazo-root[data-apple-design="true"]'),
    ).not.toBeNull();

    cleanup();
    const { container: homeContainer } = await renderHomePage("ja", vi.fn());
    expect(
      homeContainer.querySelector('[data-home-agent-entry][data-apple-surface="true"]'),
    ).not.toBeNull();
  });

  it("marks the selected soft-surface home polish and honors reduced motion", async () => {
    const { container } = await renderHomePage();
    const css = readFileSync(resolve("src/sazo-commerce/sazo.css"), "utf8");

    expect(container.querySelector('[data-home-view][data-home-polish="option-two"]')).not.toBeNull();
    expect(css).toContain('[data-home-view][data-home-polish="option-two"]');
    expect(css).toContain("--jplanet-home-surface-radius: 20px;");
    expect(css).toContain("--jplanet-home-control-radius: 16px;");
    expect(css).toContain(".sazo-home-polish--motion");
    expect(css).toContain(
      ".sazo-root[data-view=\"home\"] [data-home-view][data-home-polish=\"option-two\"].sazo-home-polish--motion",
    );
  });

  it("uses one whole-tile control for each desktop Lens banner without animating images", () => {
    const css = readFileSync(resolve("src/sazo-commerce/sazo.css"), "utf8");
    const interactionStart = css.lastIndexOf("PC Lens banner interaction");
    const interaction = css.slice(interactionStart);

    expect(interactionStart).toBeGreaterThanOrEqual(0);
    expect(interaction).toContain("--agent-lens-tile-pointer-x: 0px;");
    expect(interaction).toContain("scale(1.009);");
    expect(interaction).toContain("transform: none !important;");
    expect(interaction).toContain("@media (min-width: 768px) and (prefers-reduced-motion: reduce)");
  });

  it("defines the mobile shortcut and photo-category fixture contracts", async () => {
    expectTypeOf<readonly HomeShortcutItem[]>().toExtend<typeof homeShortcutItems>();
    expectTypeOf<readonly HomeCategoryItem[]>().toExtend<typeof homeCategoryItems>();

    expect(homeShortcutItems.map((item) => item.labelKey)).toEqual([
      "feature",
      "limited",
      "fleaMarket",
      "service",
      "brands",
      "categories",
      "reviews",
      "help",
      "news",
    ]);
    expect(homeShortcutItems.some((item) => item.labelKey === "home")).toBe(false);
    expect(homeShortcutItems.some((item) => item.labelKey === "cosmetics")).toBe(false);
    expect(homeShortcutItems.some((item) => item.labelKey === "kpop")).toBe(false);
    expect(homeCategoryItems.length).toBeGreaterThanOrEqual(6);

    for (const locale of ["ja", "en", "pt-BR"] as const) {
      const i18n = await createI18n(locale);
      const labelKeys = [
        ...homeShortcutItems.map(({ labelKey }) => `sazo.home.shortcuts.${labelKey}`),
        ...homeCategoryItems.map(({ labelKey }) => `sazo.home.categories.${labelKey}`),
      ];

      for (const labelKey of labelKeys) {
        expect(i18n.exists(labelKey), `${locale} is missing ${labelKey}`).toBe(true);
      }
    }
  });

  it("uses the compact agent launcher instead of the retired search guidance", async () => {
    const { container } = await renderHomePage();
    const launcher = container.querySelector(".sazo-home-agent-launcher");

    expect(launcher).not.toBeNull();
    expect(launcher?.querySelector(".sazo-home-agent-camera")).not.toBeNull();
    expect(launcher?.querySelector(".sazo-home-agent-send")).not.toBeNull();
    expect(container.querySelector(".sazo-search-callout")).toBeNull();
  });

  it("keeps the localized agent input copy available in every supported locale", async () => {
    for (const locale of ["ja", "en", "pt-BR"] as const) {
      const i18n = await createI18n(locale);

      expect(i18n.t("sazo.agentHub.composer.inputPlaceholder")).toEqual(
        expect.any(String),
      );
      expect(i18n.t("sazo.agentHub.composer.inputPlaceholder").trim()).not.toBe("");
    }

    await renderHomePage();
    expect(screen.getAllByText("商品名・キーワード・画像・URLで検索").length).toBeGreaterThan(0);
  });

  it("summarizes concrete Japan-to-Brazil buying checks in the agent entry", async () => {
    const { container } = await renderHomePage();
    const assurances = container.querySelector(".sazo-home-agent-assurances");

    expect(assurances?.textContent).toBe(
      "販売元・購入可否・関税・配送を確認し、BRL総額を表示",
    );
  });

  it("keeps the home assurance aligned to the input without a divider", () => {
    const css = readFileSync(resolve("src/sazo-commerce/sazo.css"), "utf8");
    const assuranceRule = [
      ...css.matchAll(
        /\.sazo-root\[data-view="home"\] \.sazo-home-agent-assurances\s*\{[^}]*\}/g,
      ),
    ]
      .map((match) => match[0])
      .at(-1);
    const assuranceContentRule = [
      ...css.matchAll(
        /\.sazo-root\[data-view="home"\] \.sazo-home-agent-assurances > span\s*\{[^}]*\}/g,
      ),
    ]
      .map((match) => match[0])
      .at(-1);

    expect(assuranceRule).toContain("width: 100%;");
    expect(assuranceRule).toContain("padding-top: 0 !important;");
    expect(assuranceRule).toContain("border-top: 0;");
    expect(assuranceContentRule).toContain("justify-content: start;");
    expect(assuranceContentRule).toContain("padding-inline: 0;");
  });

  it("keeps mobile home sections continuous without thick gray divider bands", () => {
    const css = readFileSync(
      resolve("src/sazo-commerce/section-flow.css"),
      "utf8",
    );
    const cleanupStart = css.lastIndexOf("/* Mobile section continuity:");
    const cleanup = css.slice(cleanupStart);

    expect(cleanupStart).toBeGreaterThanOrEqual(0);
    expect(cleanup).toContain(
      '.sazo-root[data-view="home"] .sazo-home-dense-picks',
    );
    expect(cleanup).toContain(".sazo-mobile-home-uniqlo-discovery");
    expect(cleanup).toContain("border-top: 0 !important;");
    expect(cleanup).toContain("padding-top: 16px !important;");
  });

  it("keeps the dense product grid independent from retired keyword loading states", async () => {
    const i18n = await createI18n("ja");
    const state = {
      ...createInitialSazoState(),
      loadingSurface: "keyword-products",
    } as ReturnType<typeof createInitialSazoState>;
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={state} />
      </I18nextProvider>,
    );
    const denseGrid = container.querySelector(
      "[data-mobile-picks-grid] [data-home-dense-product-grid]",
    );

    expect(
      denseGrid?.querySelectorAll("[data-testid='home-dense-product-card']"),
    ).toHaveLength(48);
    expect(container.querySelector(".sazo-keyword-section")).toBeNull();
  });

  it("renders every recommendation through the J-Planet dense product contract", async () => {
    const i18n = await createI18n("ja");
    const state = {
      ...createInitialSazoState(),
      loadingSurface: "search-first",
    } as ReturnType<typeof createInitialSazoState>;
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={state} />
      </I18nextProvider>,
    );
    const cards = container.querySelectorAll(
      "[data-mobile-picks-grid] [data-testid='home-dense-product-card']",
    );

    expect(cards).toHaveLength(48);
    expect(Array.from(cards).every((card) => card.querySelector("img") !== null)).toBe(
      true,
    );
    expect(
      container.querySelectorAll("[data-mobile-picks-grid] .sazo-home-dense-product-column"),
    ).toHaveLength(2);
    expect(
      Array.from(cards).every(
        (card) => card.querySelector(".sazo-home-dense-product-add") !== null,
      ),
    ).toBe(true);
    expect(container.querySelector(".sazo-home-dense-product-rating")).toBeNull();
    expect(container.textContent).toContain("14% OFF");
    expect(container.textContent).toContain("R$ 498");
    expect(container.textContent).toContain("9,450件販売");
    expect(container.textContent).toContain("日本から直送");
    expect(container.textContent).not.toContain("購入済み");
    expect(
      container.querySelector("[data-mobile-picks-grid] [data-home-dense-product-grid]")
        ?.textContent,
    ).not.toContain("関税込み");
    expect(container.querySelector(".sazo-search-discovery")).toBeNull();
    expect(container.textContent).not.toContain("¥");
  });

  it("opens the existing purchase option flow from a dense-card cart control", async () => {
    const dispatch = vi.fn<(action: SazoAction) => void>();
    const { container } = await renderHomePage("ja", dispatch);
    const firstCard = container.querySelector<HTMLElement>(
      "[data-mobile-picks-grid] [data-testid='home-dense-product-card']",
    );

    if (firstCard === null) {
      throw new Error("Missing dense product card");
    }

    fireEvent.click(
      within(firstCard).getByRole("button", {
        name: "Nintendo Switch Proコントローラーの購入オプションを選ぶ",
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "open-product",
      productId: "jplanet-nintendo-pro-controller",
    });
  });

  it("renders the captured home sections and fixture content in order", async () => {
    installReducedMotion(false);
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={createInitialSazoState()} />
      </I18nextProvider>,
    );

    includesInOrder(markup, [
      "日本の買い物を、もっと確かに。",
      "AIで商品を探す",
      "利用者レビュー",
      "J-Planet GRAM",
      "おすすめ商品",
    ]);
    expect(markup).toContain('aria-label="次のバナー"');
    expect(markup).toContain("1/4");
    expect(markup).toContain("R$ 429");
    expect(markup).not.toContain("¥");
  });

  it("keeps the current mobile shortcut contract and brand destination", async () => {
    installReducedMotion(false);
    const dispatch = vi.fn();
    const i18n = await createI18n("ja");
    render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={dispatch} state={createInitialSazoState()} />
      </I18nextProvider>,
    );
    const shortcutGroup = screen.getByRole("group", {
      name: "J-Planetショートカット",
    });

    expect(
      within(shortcutGroup)
        .getAllByRole("button")
        .map((button) => button.textContent.replace("new", "")),
    ).toEqual([
      "J-Planet特集",
      "限定",
      "フリマ",
      "サービス紹介",
      "人気ブランド",
      "カテゴリー",
      "レビュー",
      "ヘルプ",
      "お知らせ",
    ]);

    fireEvent.click(within(shortcutGroup).getByRole("button", { name: "人気ブランド" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "brands" });
  });

  it("renders the selected desktop agentic-commerce home and its six-product rail", async () => {
    installReducedMotion(false, false);
    const dispatch = vi.fn<(action: SazoAction) => void>();
    const i18n = await createI18n("ja");
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={dispatch} state={createInitialSazoState()} />
      </I18nextProvider>,
    );

    expect(container.querySelector("[data-desktop-home-view]")).not.toBeNull();
    const agentLens = screen.getByTestId("desktop-agent-lens");
    expect(
      within(agentLens).getByRole("heading", { name: "AIで商品を探す" }),
    ).not.toBeNull();
    expect(
      within(agentLens).getByRole("search", { name: "AI検索" }),
    ).not.toBeNull();
    expect(within(agentLens).queryByRole("tablist")).toBeNull();
    expect(within(agentLens).queryAllByRole("tab")).toHaveLength(0);
    expect(within(agentLens).getByText("商品特定")).not.toBeNull();
    expect(within(agentLens).getByText("BRL総額・到着目安")).not.toBeNull();
    const openChatGpt = vi.spyOn(window, "open").mockImplementation(() => null);
    expect(
      [
        "初回クーポンを見る",
        "J-PlanetをChatGPTから使う",
        "おすすめの検索先を見る",
        "サマーセールを見る",
      ].map((name) => within(agentLens).getByRole("button", { name }).tagName),
    ).toEqual(["BUTTON", "BUTTON", "BUTTON", "BUTTON"]);
    expect(agentLens.querySelectorAll("[data-agent-lens-banner] button")).toHaveLength(0);
    fireEvent.click(
      within(agentLens).getByRole("button", { name: "J-PlanetをChatGPTから使う" }),
    );
    expect(openChatGpt).toHaveBeenCalledWith(
      "https://chatgpt.com/",
      "_blank",
      "noopener,noreferrer",
    );
    expect(dispatch).not.toHaveBeenCalledWith({ type: "open-chat" });
    expect(screen.queryByTestId("desktop-home-hero-composer")).toBeNull();
    expect(screen.queryByTestId("desktop-home-promo-stack")).toBeNull();
    expect(
      within(screen.getByTestId("desktop-home-product-rail")).getAllByTestId(
        "home-dense-product-card",
      ),
    ).toHaveLength(6);
    const desktopReviews = screen.getByTestId("desktop-home-reviews");
    const desktopGram = screen.getByTestId("desktop-home-gram");
    const desktopUniqloDiscovery = screen.getByTestId(
      "desktop-home-uniqlo-discovery",
    );
    const desktopCategories = screen.getByTestId("desktop-home-category-grid");
    const desktopCategoryProducts = screen.getByTestId(
      "desktop-home-category-products",
    );
    expect(
      desktopReviews.querySelectorAll(".sazo-desktop-home-review-card"),
    ).toHaveLength(6);
    expect(desktopGram.querySelectorAll(".sazo-desktop-home-gram-card")).toHaveLength(5);
    expect(
      within(desktopUniqloDiscovery).getAllByTestId("home-dense-product-card"),
    ).toHaveLength(6);
    expect(
      desktopUniqloDiscovery.querySelectorAll(
        'img[data-brand-source="uniqlo"][src="/sazo-commerce/reference/uniqlo-logo.svg"]',
      ),
    ).toHaveLength(6);
    expect(
      desktopUniqloDiscovery.querySelectorAll(".sazo-home-dense-product-media-open em"),
    ).toHaveLength(0);
    expect(
      within(desktopReviews).getByRole("button", { name: "次のレビューを表示" }),
    ).toBeTruthy();
    expect(
      within(desktopGram).getByRole("button", { name: "次のJ-Planet GRAM投稿を表示" }),
    ).toBeTruthy();
    expect(
      screen
        .getByTestId("desktop-home-product-rail")
        .compareDocumentPosition(desktopReviews) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      desktopGram.compareDocumentPosition(desktopUniqloDiscovery) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      desktopUniqloDiscovery.compareDocumentPosition(desktopCategories) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      desktopCategories.compareDocumentPosition(desktopCategoryProducts) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(desktopCategoryProducts).getAllByTestId("home-dense-product-card"),
    ).toHaveLength(60);
    expect(
      within(desktopCategoryProducts).getByRole("heading", { name: "あなたへのおすすめ" }),
    ).toBeTruthy();
    expect(container.querySelector(".sazo-desktop-home-hero-search")).toBeNull();
    const agentInput = within(agentLens).getByRole("textbox", {
      name: "商品名・キーワード・画像・URLで検索",
    });
    expect(agentInput.getAttribute("aria-controls")).toBe(
      "desktop-agent-search-history-popover",
    );
    expect(agentInput.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(agentInput);
    const searchHistoryPopover = screen.getByRole("dialog", { name: "最近の検索" });
    expect(agentInput.getAttribute("aria-expanded")).toBe("true");
    expect(agentLens.contains(searchHistoryPopover)).toBe(false);
    expect(
      within(searchHistoryPopover).getByRole("list", { name: "最近の検索" }),
    ).toBeTruthy();
    expect(
      within(searchHistoryPopover).getAllByRole("button", { name: /の商品を見る$/ }),
    ).toHaveLength(8);

    fireEvent.pointerDown(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "最近の検索" })).toBeNull(),
    );
    expect(agentInput.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(agentInput);
    expect(screen.getByRole("dialog", { name: "最近の検索" })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "最近の検索" })).toBeNull(),
    );
    expect(agentInput.getAttribute("aria-expanded")).toBe("false");

    const recentProductsTrigger = screen.getByRole("button", {
      name: "最近確認した商品 続きからすぐに確認できます",
    });
    expect(recentProductsTrigger.getAttribute("aria-controls")).toBe(
      "desktop-recent-products-popover",
    );
    expect(recentProductsTrigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(recentProductsTrigger);
    const recentProductsPopover = screen.getByRole("dialog", { name: "最近見た商品" });
    expect(recentProductsTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(agentLens.contains(recentProductsPopover)).toBe(false);
    expect(
      within(recentProductsPopover).getAllByRole("button", { name: /の商品を見る$/ }),
    ).toHaveLength(8);

    fireEvent.click(
      within(recentProductsPopover).getByRole("button", {
        name: "New Balance 9060の商品を見る",
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "open-product",
      productId: "jplanet-new-balance-9060",
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "最近見た商品" })).toBeNull(),
    );

    fireEvent.click(recentProductsTrigger);
    const reopenedRecentProductsPopover = screen.getByRole("dialog", {
      name: "最近見た商品",
    });
    fireEvent.click(
      within(reopenedRecentProductsPopover).getByRole("button", {
        name: "Sony α7C IIを最近見た商品から削除",
      }),
    );
    expect(
      within(reopenedRecentProductsPopover).getAllByRole("button", { name: /の商品を見る$/ }),
    ).toHaveLength(7);
    fireEvent.click(
      within(reopenedRecentProductsPopover).getByRole("button", {
        name: "最近見た商品をすべて削除",
      }),
    );
    expect(within(reopenedRecentProductsPopover).getByText("最近見た商品はありません")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "最近見た商品" })).toBeNull(),
    );
    expect(recentProductsTrigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(within(desktopReviews).getByRole("button", { name: "もっと見る" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "reviews" });

    fireEvent.click(within(desktopGram).getByRole("button", { name: "もっと見る" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "gram" });

    fireEvent.click(
      within(desktopCategoryProducts).getByRole("button", { name: "もっと見る" }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "catalog" });

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Nintendo Switch Proコントローラーの商品詳細を見る",
      })[0]!,
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "open-product",
      productId: "jplanet-nintendo-pro-controller",
    });
  });

  it("renders the SAZO mobile home hierarchy with J-Planet content", async () => {
    installReducedMotion(true);
    const { container } = await renderHomePage();
    const home = container.querySelector("[data-home-view]");

    const shortcutGroup = screen.getByRole("group", {
      name: "J-Planetショートカット",
    });

    expect(
      within(shortcutGroup)
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual([
      "J-Planet特集",
      "限定",
      "フリマ",
      "サービス紹介",
      "人気ブランド",
      "カテゴリー",
      "レビュー",
      "ヘルプ",
      "お知らせ",
    ]);
    expect(
      within(shortcutGroup).getByRole("button", { name: "サービス紹介" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "コスメ" })).toBeNull();
    expect(screen.queryByRole("button", { name: "K-POP" })).toBeNull();
    const shortcutGrid = home?.querySelector<HTMLElement>("[data-mobile-shortcut-grid]");
    expect(shortcutGrid).not.toBeNull();
    expect(shortcutGrid?.dataset.layout).toBe("horizontal-menu");
    expect(shortcutGrid?.dataset.pageSize).toBe("9");
    includesInOrder(home?.textContent ?? "", [
      "AIで商品を探す",
      "J-Planet特集",
      "クーポンを受け取る",
      "利用者レビュー",
      "J-Planet GRAM",
      "ユニクロをお探しですか？",
      "おすすめ商品",
    ]);
    expect(screen.queryByTestId("mobile-category-rail")).toBeNull();

    const selectors = [
      "[data-testid='sazo-hero']",
      "[data-mobile-agent-search]",
      "[data-mobile-shortcut-grid]",
      "[data-mobile-coupon-banner]",
    ];
    const elements = selectors.map((selector) => {
      const element = home?.querySelector(selector);

      if (element === null || element === undefined) {
        throw new Error(`Missing mobile home element: ${selector}`);
      }

      return element;
    });

    for (let index = 1; index < elements.length; index += 1) {
      const previousElement = elements.at(index - 1);
      const currentElement = elements.at(index);

      if (previousElement === undefined || currentElement === undefined) {
        throw new Error(
          `Missing mobile home hierarchy element at index ${String(index)}`,
        );
      }

      expect(
        previousElement.compareDocumentPosition(currentElement) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    expect(home?.textContent).not.toContain("エージェントが確認できる商品");
    expect(home?.textContent).not.toContain("気になっているアイテム");
    expect(home?.textContent).not.toContain("MY GIFT FAIR");

    const denseProductGrid = home?.querySelector<HTMLElement>(
      "[data-mobile-picks-grid] [data-home-dense-product-grid]",
    );
    expect(denseProductGrid).not.toBeNull();
    expect(
      denseProductGrid?.querySelectorAll("[data-testid='home-dense-product-card']"),
    ).toHaveLength(48);
    expect(denseProductGrid?.textContent).toContain("R$ 429");
    expect(denseProductGrid?.textContent).not.toContain("¥");
    expect(home?.querySelector(".sazo-interested-items")).toBeNull();
  });

  it("opens the full agent from the compact home entry without duplicating an image menu", async () => {
    const dispatch = vi.fn();
    const { container } = await renderHomePage("ja", dispatch);

    expect(container.querySelector(".sazo-home-agent-launcher")).not.toBeNull();
    expect(container.querySelector("[data-mobile-agent-image-entry]")).toBeNull();

    const launcher = screen.getByRole("button", {
      name: "AI検索",
    });
    expect(launcher).toBeTruthy();
    fireEvent.click(launcher);
    expect(dispatch).toHaveBeenCalledWith({
      type: "open-agent-hub",
      intent: "compose",
    });

    expect(screen.getByText("AIで商品を探す")).toBeTruthy();
    expect(screen.getByText("商品名・キーワード・画像・URLで検索")).toBeTruthy();
    expect(screen.queryByText("何を確認しますか？")).toBeNull();
    expect(launcher.querySelector(".sazo-home-agent-camera")).not.toBeNull();
    expect(launcher.querySelector(".sazo-home-agent-send")).not.toBeNull();
    expect(launcher.querySelector(".lucide-search")).toBeNull();
    expect(
      container.querySelector("[data-home-agent-entry] .sazo-home-agent-card-header span"),
    ).toBeNull();
    expect(
      screen.queryByText("商品名・キーワード・画像・URLから商品を探します。"),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /商品を確認/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /総額を確認/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /希望から相談/ })).toBeNull();

    expect(screen.queryByRole("button", { name: "入力メニュー" })).toBeNull();
    expect(screen.queryByRole("menu", { name: "入力メニュー" })).toBeNull();
  });

  it("floats the mobile AI entry over the hero edge without pinning it during scroll", () => {
    const css = readFileSync(resolve("src/sazo-commerce/sazo.css"), "utf8");
    const homeSource = readFileSync(resolve("src/sazo-commerce/HomeView.tsx"), "utf8");
    const topbarRule = [
      ...css.matchAll(
        /\.sazo-root\[data-view="home"\] \.sazo-mobile-header\[data-sazo-topbar="true"\]\s*\{[^}]*\}/g,
      ),
    ]
      .map((match) => match[0])
      .find((rule) => rule.includes("var(--sazo-home-hero-surface)"));
    const searchOverlapStart = css.lastIndexOf(
      '.sazo-root[data-view="home"] .sazo-mobile-search-overlap {',
    );
    const searchOverlapRule = css.slice(
      searchOverlapStart,
      css.indexOf("}", searchOverlapStart) + 1,
    );
    expect(css).toContain("height: 360px !important;");
    expect(css).toContain("margin-top: -25px !important;");
    expect(css).toMatch(
      /\.sazo-root\[data-view="home"\] \.sazo-mobile-search-overlap::before\s*\{[\s\S]*?display:\s*none;/,
    );
    expect(topbarRule).toBeDefined();
    expect(topbarRule).toContain("height: 50px !important;");
    expect(topbarRule).toContain("background: var(--sazo-home-hero-surface) !important;");
    expect(searchOverlapRule).toContain("position: relative !important;");
    expect(searchOverlapRule).toContain("background: transparent;");
    expect(searchOverlapRule).not.toContain("background: var(--jplanet-surface);");
    expect(homeSource).not.toContain("mobileAgentCompactThreshold");
    expect(homeSource).not.toContain("data-compact={");
    const compactSearchOverlapStart = css.lastIndexOf(
      '.sazo-root[data-view="home"] .sazo-mobile-search-overlap[data-compact="true"] {',
    );
    const compactSearchOverlapRule = css.slice(
      compactSearchOverlapStart,
      css.indexOf("}", compactSearchOverlapStart) + 1,
    );
    expect(compactSearchOverlapRule).toContain("position: relative !important;");
    expect(compactSearchOverlapRule).not.toContain("sticky");
    const overlapShimStart = css.lastIndexOf(
      '.sazo-root[data-view="home"] .sazo-mobile-search-overlap::before {',
    );
    const overlapShimRule = css.slice(
      overlapShimStart,
      css.indexOf("}", overlapShimStart) + 1,
    );
    expect(overlapShimRule).toContain("display: none;");
  });

  it("turns the home header into a compact white frame after scrolling", () => {
    const css = readFileSync(resolve("src/sazo-commerce/sazo.css"), "utf8");
    const collapsedHeaderStart = css.lastIndexOf(
      '.sazo-root[data-view="home"][data-header-collapsed="true"]\n    .sazo-mobile-header[data-sazo-topbar="true"] {',
    );
    const collapsedHeaderRule = css.slice(
      collapsedHeaderStart,
      css.indexOf("}", collapsedHeaderStart) + 1,
    );

    expect(collapsedHeaderRule).toContain("background: #fff !important;");
    expect(collapsedHeaderRule).toContain(
      "box-shadow: 0 5px 18px rgb(18 32 65 / 12%) !important;",
    );
    expect(css).toMatch(
      /\.sazo-root\[data-view="home"\]\s+\.sazo-mobile-secondary-nav\[data-sazo-topbar-nav\]\s*\{[\s\S]*?display:\s*none\s*!important;/,
    );
  });

  it("keeps the compact home AI card centered with a symmetric mobile inset", () => {
    const css = readFileSync(resolve("src/sazo-commerce/sazo.css"), "utf8");
    const overlapRules = [
      ...css.matchAll(
        /\.sazo-root\[data-view="home"\] \.sazo-mobile-search-overlap\s*\{[^}]*\}/g,
      ),
    ].map((match) => match[0]);
    const mobileEntryRules = [
      ...css.matchAll(
        /\.sazo-root\[data-view="home"\] \.sazo-mobile-agent-entry\s*\{[^}]*\}/g,
      ),
    ].map((match) => match[0]);

    const overlapRule = overlapRules.at(-1);
    const mobileEntryRule = mobileEntryRules
      .filter((rule) => rule.includes("display: block;"))
      .at(-1);

    expect(overlapRule).toBeDefined();
    expect(overlapRule).toContain("box-sizing: border-box;");
    expect(overlapRule).toContain("margin-inline: auto;");
    expect(overlapRule).toContain("padding-inline: 16px;");
    expect(mobileEntryRule).toBeDefined();
    expect(mobileEntryRule).toContain("box-sizing: border-box;");
    expect(mobileEntryRule).toContain("margin-inline: auto;");

    const appleHomeCardRules = [
      ...css.matchAll(
        /\.sazo-root\[data-view="home"\] \.sazo-home-agent-card\[data-apple-surface="true"\]\s*\{[^}]*\}/g,
      ),
    ].map((match) => match[0]);
    const appleHomeCardRule = appleHomeCardRules.at(-1);
    expect(appleHomeCardRule).toBeDefined();
    expect(appleHomeCardRule).toMatch(/margin-inline:\s*0\s*!important;/);
  });

  it("keeps the coupon and compact menu while omitting category discovery from home", async () => {
    const dispatch = vi.fn();

    await renderHomePage("ja", dispatch);

    const coupon = screen.getByTestId("mobile-coupon-banner");
    const gram = screen.getByTestId("mobile-gram-section");
    const uniqloDiscovery = screen.getByTestId("mobile-home-uniqlo-discovery");

    expect(coupon).not.toBeNull();
    expect(screen.queryByText("ブラジル最大級 日本直輸入ショップ")).toBeNull();
    expect(screen.queryByTestId("mobile-category-rail")).toBeNull();
    expect(
      within(uniqloDiscovery).getByRole("heading", { name: "ユニクロをお探しですか？" }),
    ).toBeTruthy();
    expect(
      within(uniqloDiscovery).getAllByTestId("home-dense-product-card"),
    ).toHaveLength(4);
    expect(
      uniqloDiscovery.querySelectorAll(
        'img[data-brand-source="uniqlo"][src="/sazo-commerce/reference/uniqlo-logo.svg"]',
      ),
    ).toHaveLength(5);
    expect(
      uniqloDiscovery.querySelectorAll(".sazo-uniqlo-discovery-heading-mark"),
    ).toHaveLength(1);
    expect(
      uniqloDiscovery.querySelectorAll(".sazo-home-dense-product-title-row"),
    ).toHaveLength(4);
    expect(gram.nextElementSibling).toBe(uniqloDiscovery);
    expect(uniqloDiscovery.nextElementSibling?.hasAttribute("data-mobile-picks-grid")).toBe(
      true,
    );

    fireEvent.click(
      within(uniqloDiscovery).getAllByRole("button", {
        name: "New Balance 9060の商品詳細を見る",
      })[0]!,
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "open-product",
      productId: "jplanet-nintendo-pro-controller",
    });

    fireEvent.click(screen.getByRole("button", { name: /クーポン/ }));

    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "coupons" });
  });

  it("uses the frameless media treatment only for the Uniqlo discovery rail", async () => {
    const dispatch = vi.fn();
    const { container } = await renderHomePage("ja", dispatch);

    const uniqloDiscovery = screen.getByTestId("mobile-home-uniqlo-discovery");
    const standardDenseGrid = container.querySelector("[data-mobile-picks-grid]");

    expect(uniqloDiscovery.getAttribute("data-product-presentation")).toBe(
      "media-rail",
    );
    expect(standardDenseGrid?.getAttribute("data-product-presentation")).toBeNull();
  });

  it("keeps regular-price products free of discount badges in the Uniqlo discovery rail", async () => {
    const dispatch = vi.fn();

    await renderHomePage("ja", dispatch);

    const cards = within(screen.getByTestId("mobile-home-uniqlo-discovery")).getAllByTestId(
      "home-dense-product-card",
    );

    expect(cards).toHaveLength(4);
    expect(within(cards[0]!).getByText("14% OFF")).toBeTruthy();
    expect(within(cards[1]!).queryByText(/OFF/)).toBeNull();
    expect(within(cards[2]!).getByText("10% OFF")).toBeTruthy();
    expect(within(cards[3]!).queryByText(/OFF/)).toBeNull();
  });

  it("opens the product catalog from the Uniqlo discovery rail more link", async () => {
    const dispatch = vi.fn();

    await renderHomePage("ja", dispatch);

    const uniqloDiscovery = screen.getByTestId("mobile-home-uniqlo-discovery");
    fireEvent.click(
      within(uniqloDiscovery).getByRole("button", { name: "もっと見る" }),
    );

    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "catalog" });
  });

  it("opens the full category directory from the existing mobile shortcut", async () => {
    const dispatch = vi.fn();

    await renderHomePage("ja", dispatch);

    const more = screen.getByRole("button", { name: "カテゴリー" });

    fireEvent.click(more);

    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "categories" });
  });

  it("opens usable coupon content from the mobile home CTA", async () => {
    installReducedMotion(true);
    const { container } = await renderHomePage();

    fireEvent.click(screen.getByRole("button", { name: "クーポンを受け取る" }));

    expect(container.querySelector('[data-view-content="coupons"]')).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "クーポン" })).toBeTruthy();
  });

  it.each([
    ["ja", "J-Planetショートカット", "クーポンを受け取る", "J-Planet PIX DAYセール"],
    ["en", "J-Planet shortcuts", "Get coupons", "J-Planet PIX DAY sale"],
    ["pt-BR", "Atalhos da J-Planet", "Ver cupons", "Oferta PIX DAY da J-Planet"],
  ] as const)(
    "localizes visible and accessible coupon content for %s",
    async (locale, shortcutLabel, cta, artworkDescription) => {
      const dispatch = vi.fn();
      await renderHomePage(locale, dispatch);
      const shortcutGroup = screen.getByRole("group", { name: shortcutLabel });
      const coupon = screen.getByTestId("mobile-coupon-banner");
      const image = within(coupon).getByRole("img");
      const button = within(coupon).getByRole("button", { name: cta });

      expect(shortcutGroup).toBeTruthy();
      expect(within(button).getByText(cta)).toBeTruthy();
      expect(
        new URL(image.getAttribute("src") ?? "", window.location.origin).pathname,
      ).toBe("/sazo-commerce/campaign/jplanet-pix-day-sale.png");
      expect(image.getAttribute("alt")).toBe(artworkDescription);
      expect(button.getAttribute("aria-label")).toBe(cta);

      cleanup();
    },
  );

  it.each([
    ["サービス紹介", "service"],
    ["人気ブランド", "brands"],
    ["カテゴリー", "categories"],
    ["レビュー", "reviews"],
    ["ヘルプ", "support"],
  ] as const)("routes the %s shortcut to %s", async (label, view) => {
    const dispatch = vi.fn();
    await renderHomePage("ja", dispatch);

    fireEvent.click(screen.getByRole("button", { name: label }));

    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view });
  });

  it("keeps the news shortcut inert", async () => {
    const dispatch = vi.fn();
    await renderHomePage("ja", dispatch);

    fireEvent.click(
      within(screen.getByRole("group", { name: "J-Planetショートカット" })).getByRole(
        "button",
        { name: "お知らせ" },
      ),
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not retain an image input menu in the home AI card", async () => {
    const dispatch = vi.fn();
    await renderHomePage("ja", dispatch);

    expect(screen.queryByRole("button", { name: "入力メニュー" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "ギャラリー" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "カメラ" })).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it.each(["ja", "en", "pt-BR"] as const)(
    "localizes the mobile agent entry for %s",
    async (locale) => {
      installReducedMotion(true);
      const i18n = await createI18n(locale);
      await renderHomePage(locale);

      expect(
        screen.getByRole("group", {
          name: i18n.t("sazo.home.agentEntryGroup"),
        }),
      ).toBeTruthy();
    },
  );

  it("keeps the mobile agent entry localization keys aligned across locales", async () => {
    for (const locale of ["ja", "en", "pt-BR"] as const) {
      const i18n = await createI18n(locale);

      expect(
        i18n.getResource(locale, "translation", "sazo.home.agentEntryGroup"),
      ).toEqual(expect.any(String));
      expect(
        i18n.getResource(locale, "translation", "sazo.home.agentImageEntry"),
      ).toEqual(expect.any(String));
    }
  });

  it("renders crisp pop J-Planet shortcut artwork", async () => {
    const { container } = await renderHomePage("ja", vi.fn());
    const shortcutGroup = screen.getByRole("group", {
      name: "J-Planetショートカット",
    });

    expect(screen.getByRole("button", { name: "J-Planet特集" })).toBeTruthy();
    expect(shortcutGroup.querySelectorAll("img[data-jplanet-sakura-mark]")).toHaveLength(
      1,
    );
    expect(shortcutGroup.querySelectorAll(".sazo-shortcut-icon")).toHaveLength(9);
    expect(shortcutGroup.querySelectorAll('img[src*="/shortcuts/"]')).toHaveLength(0);
    expect(container.querySelectorAll(".sazo-shortcut-badge")).toHaveLength(0);
  });

  it("mounts the stateful home view only once across responsive shells", async () => {
    const { container } = await renderHomePage();

    expect(container.querySelectorAll("[data-home-view]")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "次のバナー" })).toHaveLength(1);
  });

  it("keeps GRAM assets and dense BRL recommendations in their current sections", async () => {
    const { container } = await renderHomePage();
    const sectionImages = (heading: string) => {
      const section = screen.getByRole("heading", { name: heading }).closest("section");

      expect(section).not.toBeNull();

      return Array.from(section?.querySelectorAll<HTMLImageElement>("img") ?? []).map(
        ({ src }) => new URL(src).pathname,
      );
    };

    expect(sectionImages("J-Planet GRAM")).toEqual([
      "/sazo-commerce/community/01.webp",
      "/sazo-commerce/community/01.webp",
      "/sazo-commerce/gram/home/02.png",
      "/sazo-commerce/gram/home/02-thumb.png",
    ]);
    const gramSection = screen
      .getByRole("heading", { name: "J-Planet GRAM" })
      .closest("section");
    expect(gramSection?.querySelectorAll(".sazo-mobile-gram-card")).toHaveLength(2);
    const denseGrid = container.querySelector(
      "[data-mobile-picks-grid] [data-home-dense-product-grid]",
    );
    expect(
      denseGrid?.querySelectorAll("[data-testid='home-dense-product-card']"),
    ).toHaveLength(48);
    expect(denseGrid?.textContent).toContain("R$ 429");
    expect(denseGrid?.textContent).not.toContain("¥");
    expect(container.querySelector(".sazo-recommendation")).toBeNull();
    expect(container.querySelector(".sazo-search-callout")).toBeNull();
  });

  it("opens the dedicated GRAM view instead of appending the catalogue to home", async () => {
    const { container } = await renderHomePage();
    const section = screen
      .getByRole("heading", { name: "J-Planet GRAM" })
      .closest("section");
    if (section === null) {
      throw new Error("J-Planet GRAM home section is missing");
    }

    expect(container.querySelector(".sazo-gram-catalog-section")).toBeNull();
    fireEvent.click(within(section).getByRole("button", { name: "もっと見る" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "J-Planet GRAM" }),
    ).toBeTruthy();
    expect(container.querySelector('[data-view-content="gram"]')).not.toBeNull();
  });

  it("keeps recorded search-product crops inside media-only boundaries", () => {
    expect(searchDiscoveryMediaCrops).toHaveLength(4);

    for (const fixture of searchDiscoveryMediaCrops) {
      const png = PNG.sync.read(readFileSync(resolve(`public${fixture.image}`)));

      expect(fixture.sourceSecond).toBe(37.5);
      expect(fixture.crop.y + fixture.crop.height).toBeLessThanOrEqual(
        fixture.controlBoundaryY,
      );
      expect({ height: png.height, width: png.width }).toEqual({
        height: fixture.crop.height,
        width: fixture.crop.width,
      });
    }
  });
});

describe("SAZO hero controls", () => {
  it("changes slides for thresholded horizontal pointer swipes", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const { container } = await renderHomePage();
    const viewport = container.querySelector<HTMLElement>(".sazo-hero-viewport");
    const counter = screen.getByTestId("sazo-hero-counter");

    expect(viewport).not.toBeNull();
    if (viewport === null) throw new Error("Missing hero viewport");

    fireEvent.pointerDown(viewport, {
      clientX: 300,
      clientY: 100,
      isPrimary: true,
      pointerId: 1,
    });
    fireEvent.pointerUp(viewport, {
      clientX: 240,
      clientY: 106,
      isPrimary: true,
      pointerId: 1,
    });
    expect(counter.textContent).toBe("2/4");

    fireEvent.pointerDown(viewport, {
      clientX: 140,
      clientY: 100,
      isPrimary: true,
      pointerId: 2,
    });
    fireEvent.pointerUp(viewport, {
      clientX: 200,
      clientY: 103,
      isPrimary: true,
      pointerId: 2,
    });
    expect(counter.textContent).toBe("1/4");
  });

  it("ignores short, vertical, canceled, and mismatched pointer gestures", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const { container } = await renderHomePage();
    const viewport = container.querySelector<HTMLElement>(".sazo-hero-viewport");
    const counter = screen.getByTestId("sazo-hero-counter");

    expect(viewport).not.toBeNull();
    if (viewport === null) throw new Error("Missing hero viewport");

    const swipe = (
      start: { x: number; y: number; pointerId: number },
      end: { x: number; y: number; pointerId: number },
    ) => {
      fireEvent.pointerDown(viewport, {
        clientX: start.x,
        clientY: start.y,
        isPrimary: true,
        pointerId: start.pointerId,
      });
      fireEvent.pointerUp(viewport, {
        clientX: end.x,
        clientY: end.y,
        isPrimary: true,
        pointerId: end.pointerId,
      });
    };

    swipe({ x: 200, y: 100, pointerId: 3 }, { x: 170, y: 101, pointerId: 3 });
    swipe({ x: 200, y: 100, pointerId: 4 }, { x: 140, y: 180, pointerId: 4 });
    swipe({ x: 200, y: 100, pointerId: 5 }, { x: 140, y: 101, pointerId: 6 });
    fireEvent.pointerDown(viewport, {
      clientX: 200,
      clientY: 100,
      isPrimary: true,
      pointerId: 7,
    });
    fireEvent.pointerCancel(viewport, { isPrimary: true, pointerId: 7 });
    fireEvent.pointerUp(viewport, {
      clientX: 140,
      clientY: 101,
      isPrimary: true,
      pointerId: 7,
    });

    expect(counter.textContent).toBe("1/4");
  });

  it("keeps the carousel on the new slide when a swipe emits a compatibility click", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const { container } = await renderHomePage();
    const viewport = container.querySelector<HTMLElement>(".sazo-hero-viewport");
    const counter = screen.getByTestId("sazo-hero-counter");

    expect(viewport).not.toBeNull();
    if (viewport === null) throw new Error("Missing hero viewport");

    fireEvent.pointerDown(viewport, {
      clientX: 240,
      clientY: 100,
      isPrimary: true,
      pointerId: 8,
    });
    fireEvent.pointerUp(viewport, {
      clientX: 180,
      clientY: 104,
      isPrimary: true,
      pointerId: 8,
    });
    fireEvent.click(viewport, { detail: 1 });

    expect(counter.textContent).toBe("2/4");
    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    expect(counter.textContent).toBe("3/4");
  });

  it("advances, reverses, wraps, and pauses through the live controls", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    await renderHomePage();

    const counter = screen.getByTestId("sazo-hero-counter");
    const next = screen.getByRole("button", { name: "次のバナー" });
    const previous = screen.getByRole("button", { name: "前のバナー" });

    expect(counter.textContent).toBe("1/4");
    fireEvent.click(previous);
    expect(counter.textContent).toBe("4/4");
    fireEvent.click(next);
    expect(counter.textContent).toBe("1/4");

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(counter.textContent).toBe("2/4");

    fireEvent.click(screen.getByRole("button", { name: "バナーを一時停止" }));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(counter.textContent).toBe("2/4");
    expect(screen.getByRole("button", { name: "バナーを再生" })).toBeTruthy();
  });

  it("keeps the live pause control visible, focusable, and visually stateful on every slide", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    await renderHomePage();

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    const pause = screen.getByRole("button", { name: "バナーを一時停止" });
    const status = screen.getByTestId("sazo-hero-counter").parentElement;

    pause.focus();
    expect(document.activeElement).toBe(pause);
    expect(status).not.toBeNull();
    expect(pause.querySelector(".lucide-pause")).not.toBeNull();

    fireEvent.click(pause);
    const play = screen.getByRole("button", { name: "バナーを再生" });
    expect(play.querySelector(".lucide-play")).not.toBeNull();
  });

  it("uses one-slot circular neighbors at both wrap boundaries", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const { container } = await renderHomePage();
    const offsetFor = (slide: string) =>
      container
        .querySelector(`[data-hero-slide="${slide}"]`)
        ?.getAttribute("data-hero-offset");

    expect(offsetFor("jplanet-home-japan-brazil")).toBe("0");
    expect(offsetFor("jplanet-home-service")).toBe("-1");
    expect(offsetFor("jplanet-home-chatgpt")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("2/4");
    expect(screen.getAllByText("2/4")).toHaveLength(1);
    expect(
      container
        .querySelector('[data-hero-slide="jplanet-home-chatgpt"] img')
        ?.getAttribute("src"),
    ).toBe("/sazo-commerce/hero/jplanet-home-chatgpt-v2.png");
    expect(
      container.querySelectorAll(
        '[data-hero-slide="jplanet-home-chatgpt"] .sazo-hero-arrow, [data-hero-slide="jplanet-home-chatgpt"] .sazo-hero-status',
      ),
    ).toHaveLength(0);
    expect(offsetFor("jplanet-home-chatgpt")).toBe("0");
    expect(offsetFor("jplanet-home-japan-brazil")).toBe("-1");
    expect(offsetFor("jplanet-home-popular")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("3/4");
    expect(offsetFor("jplanet-home-popular")).toBe("0");
    expect(offsetFor("jplanet-home-chatgpt")).toBe("-1");
    expect(offsetFor("jplanet-home-service")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("4/4");
    expect(offsetFor("jplanet-home-service")).toBe("0");
    expect(offsetFor("jplanet-home-popular")).toBe("-1");
    expect(offsetFor("jplanet-home-japan-brazil")).toBe("1");
  });

  it.each([
    {
      active: "jplanet-home-japan-brazil",
      counter: "1/4",
      feed: "natural",
      index: 0,
      next: "jplanet-home-chatgpt",
      previous: "jplanet-home-service",
    },
    {
      active: "jplanet-home-chatgpt",
      counter: "2/4",
      feed: "cold-first",
      index: 1,
      next: "jplanet-home-popular",
      previous: "jplanet-home-japan-brazil",
    },
    {
      active: "jplanet-home-popular",
      counter: "3/4",
      feed: "delivery-last",
      index: 2,
      next: "jplanet-home-service",
      previous: "jplanet-home-chatgpt",
    },
    {
      active: "jplanet-home-service",
      counter: "4/4",
      feed: "large-first",
      index: 3,
      next: "jplanet-home-japan-brazil",
      previous: "jplanet-home-popular",
    },
  ] as const)(
    "renders the $feed QA snapshot as $counter with evidenced neighbors",
    async ({ active, counter, feed, index, next, previous }) => {
      const i18n = await createI18n("ja");
      const state = {
        ...createInitialSazoState(),
        heroFeed: feed,
        heroIndex: index,
      };
      const { container } = render(
        <I18nextProvider i18n={i18n}>
          <HomeView dispatch={() => undefined} state={state} />
        </I18nextProvider>,
      );
      const offsetFor = (slide: string) =>
        container
          .querySelector(`[data-hero-slide="${slide}"]`)
          ?.getAttribute("data-hero-offset");

      expect(screen.getByTestId("sazo-hero-counter").textContent).toBe(counter);
      expect(offsetFor(active)).toBe("0");
      expect(offsetFor(previous)).toBe("-1");
      expect(offsetFor(next)).toBe("1");
    },
  );

  it("provides the four generated mobile hero sources at their native ratio", async () => {
    const { container } = await renderHomePage();
    const sources = Array.from(
      container.querySelectorAll<HTMLSourceElement>(
        '.sazo-hero-slide source[media="(max-width: 767px)"]',
      ),
    );

    expect(sources).toHaveLength(4);
    expect(
      sources.map((source) => ({
        height: source.getAttribute("height"),
        srcSet: source.getAttribute("srcset"),
        width: source.getAttribute("width"),
      })),
    ).toEqual([
      {
        height: "852",
        srcSet: "/sazo-commerce/hero/jplanet-home-japan-brazil-mobile-v4.png",
        width: "887",
      },
      {
        height: "852",
        srcSet: "/sazo-commerce/hero/jplanet-home-chatgpt-mobile-v4.png",
        width: "887",
      },
      {
        height: "852",
        srcSet: "/sazo-commerce/hero/jplanet-home-popular-mobile-v4.png",
        width: "887",
      },
      {
        height: "852",
        srcSet: "/sazo-commerce/hero/jplanet-home-service-mobile-v4.png",
        width: "887",
      },
    ]);
  });

  it("marks all four hero artworks for reference-scale rendering", async () => {
    const { container } = await renderHomePage();

    expect(container.querySelectorAll(".sazo-hero-artwork")).toHaveLength(4);
  });

  it("renders all approved mobile heroes with visible real text", async () => {
    const { container } = await renderHomePage();
    const expectedCopy = [
      ["jplanet-home-japan-brazil", "日本の買い物を、もっと確かに。"],
      ["jplanet-home-chatgpt", "ChatGPTから、J-Planetで買い物しよう！"],
      ["jplanet-home-popular", "いま、人気の商品を見つけよう。"],
      ["jplanet-home-service", "探す、確かめる、届けるまで。"],
    ] as const;

    expect(
      expectedCopy.map(([id]) =>
        container
          .querySelector(`[data-hero-slide="${id}"] .sazo-hero-copy`)
          ?.textContent?.trim(),
      ),
    ).toEqual(expectedCopy.map(([, copy]) => copy));
    expect(
      Array.from(container.querySelectorAll(".sazo-hero-copy")).every(
        (copy) => copy.getAttribute("aria-hidden") === "true",
      ),
    ).toBe(true);
    expect(container.querySelectorAll(".sazo-hero-copy")).toHaveLength(4);
  });
});

describe("useSazoHero", () => {
  it("advances every interval and clears the timer on unmount", () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const onNext = vi.fn();
    const { unmount } = render(<HeroTicker onNext={onNext} />);

    act(() => {
      vi.advanceTimersByTime(9_999);
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onNext).toHaveBeenCalledTimes(2);

    unmount();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it("does not auto-advance while paused or reduced motion is requested", () => {
    vi.useFakeTimers();
    const pausedNext = vi.fn();
    installReducedMotion(false);
    const { unmount } = render(<HeroTicker onNext={pausedNext} paused />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(pausedNext).not.toHaveBeenCalled();
    unmount();

    const reducedMotionNext = vi.fn();
    installReducedMotion(true);
    render(<HeroTicker onNext={reducedMotionNext} />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(reducedMotionNext).not.toHaveBeenCalled();
  });
});
