// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PNG } from "pngjs";
import { createI18n } from "@/i18n/createI18n";
import { CatalogView } from "@/sazo-commerce/CatalogView";
import { CampaignView } from "@/sazo-commerce/CampaignView";
import { CategoriesView, BrandsView } from "@/sazo-commerce/DirectoryViews";
import { ReviewsView } from "@/sazo-commerce/EditorialViews";
import { MobileAgentHubView } from "@/sazo-commerce/MobileAgentHubView";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import { SkincareCatalogView } from "@/sazo-commerce/SkincareCatalogView";
import { products } from "@/sazo-commerce/fixtures";
import {
  createInitialSazoState,
  type CatalogMode,
  type SazoAction,
  type SazoState,
} from "@/sazo-commerce/model";
import { ServiceView } from "@/sazo-commerce/ServiceView";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
});

const noDispatch = () => undefined;

async function renderWithI18n(element: React.ReactNode) {
  const i18n = await createI18n("ja");

  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

function installMobileHome() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === "(max-width: 767px)",
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
    writable: true,
  });
}

function installDesktopHome() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
    writable: true,
  });
}

function stateWithCatalogMode(mode: CatalogMode): SazoState {
  return { ...createInitialSazoState(), catalogMode: mode, view: "catalog" };
}

function openCatalogFromCategoryDirectory(category: string) {
  fireEvent.click(
    within(screen.getByRole("navigation", { name: "メインメニュー" })).getByRole(
      "button",
      { name: "カテゴリー" },
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: category }));
}

function MobileCategoryDirectoryHarness() {
  const [state, setState] = React.useState<SazoState>({
    ...createInitialSazoState(),
    view: "categories",
  });

  const dispatch = (action: SazoAction) => {
    if (action.type === "select-directory-category") {
      setState((current) => ({ ...current, directoryCategory: action.category }));
    }
  };

  return <CategoriesView dispatch={dispatch} state={state} />;
}

describe("SAZO captured view contracts", () => {
  it("removes generic mobile divider bands without changing cart checkout boundaries", () => {
    const css = readFileSync(
      join(process.cwd(), "src/sazo-commerce/section-flow.css"),
      "utf8",
    );
    const cleanupStart = css.lastIndexOf("/* Mobile section continuity:");
    const cleanup = css.slice(cleanupStart);

    expect(cleanupStart).toBeGreaterThanOrEqual(0);
    expect(cleanup).toContain(
      '.sazo-root[data-view="product"] .sazo-reference-nintendo-scroll-section',
    );
    expect(cleanup).toContain(
      '.sazo-root[data-view="favorites"] .sazo-favorites-reference-section--pending',
    );
    expect(cleanup).toContain('.sazo-root[data-view="support"] .sazo-support-section');
    expect(cleanup).toContain("border-bottom: 0 !important;");
    expect(cleanup).not.toContain('data-view="cart"');
  });

  it("renders the catalog search state without populated product cards", async () => {
    const state = {
      ...stateWithCatalogMode("list"),
      loadingSurface: "catalog",
    } as SazoState;
    const { container } = await renderWithI18n(
      <CatalogView dispatch={noDispatch} state={state} />,
    );

    expect(screen.getByRole("status", { name: "商品を検索しています" })).toBeTruthy();
    expect(
      container.querySelectorAll(".sazo-catalog-products .sazo-product-card"),
    ).toHaveLength(0);
    expect(screen.getByText("全体 86個")).toBeTruthy();
  });

  it("renders the category route loader without the populated directory", async () => {
    const state = {
      ...createInitialSazoState(),
      loadingSurface: "directory",
      view: "categories",
    } as SazoState;
    const { container } = await renderWithI18n(
      <CategoriesView dispatch={noDispatch} state={state} />,
    );

    expect(
      screen.getByRole("status", { name: "カテゴリーを読み込んでいます" }),
    ).toBeTruthy();
    expect(container.querySelector(".sazo-category-layout")).toBeNull();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("keeps the AI agent entry at the top of category and catalog directories", async () => {
    const { container } = await renderWithI18n(
      <CategoriesView dispatch={noDispatch} state={createInitialSazoState()} />,
    );

    expect(
      container.querySelector('[data-testid="category-agent-entry"]'),
    ).not.toBeNull();
    expect(screen.getByPlaceholderText("見つからない商品を送る")).toBeTruthy();

    cleanup();
    const { container: catalogContainer } = await renderWithI18n(
      <CatalogView dispatch={noDispatch} state={stateWithCatalogMode("list")} />,
    );

    expect(
      catalogContainer.querySelector('[data-testid="catalog-agent-entry"]'),
    ).not.toBeNull();
    expect(
      screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索"),
    ).toBeTruthy();
  });

  it("puts categories before brands and exposes all nine beauty entries", async () => {
    const { container } = await renderWithI18n(
      <CategoriesView dispatch={noDispatch} state={createInitialSazoState()} />,
    );

    expect(
      screen.getAllByRole("tab").map((tab) => tab.textContent?.trim()),
    ).toEqual(["カテゴリー", "人気ブランド"]);
    expect(container.querySelectorAll(".sazo-category-child-card")).toHaveLength(9);
    expect(container.querySelectorAll(".sazo-category-child-icon")).toHaveLength(9);
  });

  it("shows nine circular cosmetics categories and switches the mobile parent pane", async () => {
    installMobileHome();
    const { container } = await renderWithI18n(<MobileCategoryDirectoryHarness />);
    const childList = container.querySelector(".sazo-category-child-list");

    expect(screen.getByRole("heading", { name: "カテゴリー" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "カテゴリー" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("tab", { name: "人気ブランド" }).getAttribute("aria-selected")).toBe(
      "false",
    );
    expect(
      screen.getByRole("button", { name: /^化粧品$/ }).getAttribute("aria-current"),
    ).toBe("page");
    expect(childList?.querySelectorAll(".sazo-category-child-card")).toHaveLength(9);
    expect(childList?.querySelectorAll("img")).toHaveLength(9);
    expect(container.querySelectorAll(".sazo-category-child-icon")).toHaveLength(0);
    expect(
      container.querySelectorAll(".sazo-category-parent-list button"),
    ).toHaveLength(14);
    expect(screen.getByRole("button", { name: "PC・ゲーム" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "クレンジング" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ヘアケア" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ボディケア" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^レディース$/ }));
    expect(screen.getByRole("heading", { name: "レディース" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^レディース$/ }).getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByRole("button", { name: /^トップス$/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "PC・ゲーム" }));
    expect(screen.getByRole("heading", { name: "PC・ゲーム" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "PC・ゲーム" }).getAttribute("aria-current"),
    ).toBe("page");
  });

  it("routes every mobile beauty child category to the shared skincare catalog", async () => {
    installMobileHome();
    const dispatch = vi.fn();
    await renderWithI18n(
      <CategoriesView dispatch={dispatch} state={createInitialSazoState()} />,
    );

    const beautyChildLabels = [
      "スキンケア",
      "ベースメイク",
      "ポイントメイク",
      "セット商品",
      "メイク小物",
      "UVケア",
      "クレンジング",
      "ヘアケア",
      "ボディケア",
    ];
    for (const label of beautyChildLabels) {
      fireEvent.click(screen.getByRole("button", { name: label }));
    }

    expect(dispatch).toHaveBeenCalledTimes(beautyChildLabels.length * 2);
    expect(
      dispatch.mock.calls.filter(
        ([action]) => action.type === "navigate" && action.view === "skincare-catalog",
      ),
    ).toHaveLength(beautyChildLabels.length);

    fireEvent.click(screen.getByRole("tab", { name: "人気ブランド" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "brands" });
  });

  it("uses data-driven middle and small category rails above home cards in the mobile skincare catalog", async () => {
    installMobileHome();
    const dispatch = vi.fn();
    const { container } = await renderWithI18n(<SkincareCatalogView dispatch={dispatch} />);

    expect(screen.getAllByText("スキンケア").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "AIに探してもらう" })).toBeTruthy();
    expect(screen.getByPlaceholderText("肌悩み・商品名・画像を送る")).toBeTruthy();
    expect(container.querySelector(".sazo-skincare-catalog-breadcrumb")).toBeNull();

    const recommendations = screen.getByTestId("skincare-recommendation-grid");
    expect(within(recommendations).getByRole("heading", { name: "あなたへのおすすめ" })).toBeTruthy();
    expect(within(recommendations).queryByRole("button", { name: "すべて見る" })).toBeNull();
    expect(within(recommendations).getAllByTestId("home-dense-product-card")).toHaveLength(6);
    expect(
      container.querySelectorAll(".sazo-home-dense-product-column"),
    ).toHaveLength(2);

    const categoryRail = screen.getByTestId("skincare-category-rail");
    expect(within(categoryRail).getAllByRole("tab")).toHaveLength(6);
    expect(
      within(categoryRail).getByRole("tab", { name: "スキンケア" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(within(categoryRail).getByRole("button", { name: "化粧水" })).toBeTruthy();

    fireEvent.click(within(categoryRail).getByRole("tab", { name: "ベースメイク" }));
    expect(
      within(categoryRail).getByRole("tab", { name: "ベースメイク" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(within(categoryRail).getByRole("button", { name: "BBクリーム" })).toBeTruthy();
    expect(within(recommendations).getAllByTestId("home-dense-product-card")).toHaveLength(2);

    fireEvent.click(within(categoryRail).getByRole("button", { name: "BBクリーム" }));
    expect(
      within(categoryRail).getByRole("button", { name: "BBクリーム" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(within(recommendations).getAllByTestId("home-dense-product-card")).toHaveLength(1);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /クッションファンデーション ナチュラルの商品詳細を見る/,
      })[0]!,
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "open-product",
      productId: "jplanet-nintendo-pro-controller",
    });

    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "categories" });
  });

  it("exposes the shared Apple-style category layout contract", async () => {
    const { container } = await renderWithI18n(
      <CategoriesView dispatch={noDispatch} state={createInitialSazoState()} />,
    );

    expect(
      container.querySelector('.sazo-category-layout[data-apple-layout="category"]'),
    ).not.toBeNull();

    cleanup();
    const { container: catalogContainer } = await renderWithI18n(
      <CatalogView dispatch={noDispatch} state={stateWithCatalogMode("list")} />,
    );

    expect(
      catalogContainer.querySelector('.sazo-catalog-view[data-apple-layout="category"]'),
    ).not.toBeNull();
  });

  it("keeps the category agent visible above directory controls on mobile", () => {
    const css = readFileSync(join(process.cwd(), "src/sazo-commerce/sazo.css"), "utf8");
    // Home top-bar overrides are appended in a later media block; keep this
    // directory contract independent of stylesheet append order.
    const mobileBlock = css;
    const agentRule =
      [
        ...mobileBlock.matchAll(
          /\.sazo-root\[data-view="categories"\] \.sazo-directory-agent,[\s\S]*?\{([\s\S]*?)\}/g,
        ),
      ].at(-1)?.[1] ?? "";
    const controlRule =
      [...mobileBlock.matchAll(/\.sazo-root \.sazo-category-tabs \{([\s\S]*?)\}/g)].at(
        -1,
      )?.[1] ?? "";
    const catalogControlRule =
      [
        ...mobileBlock.matchAll(
          /\.sazo-root \.sazo-catalog-sticky-controls \{([\s\S]*?)\}/g,
        ),
      ].at(-1)?.[1] ?? "";

    expect(agentRule).toMatch(/position:\s*sticky/);
    expect(agentRule).toMatch(/top:\s*58px/);
    expect(controlRule).toMatch(/top:\s*var\(--sazo-directory-agent-offset/);
    expect(catalogControlRule).toMatch(/top:\s*var\(--sazo-directory-agent-offset/);
  });

  it("keeps review screenshot crops above their recorded author/action overlays", () => {
    const expectedBoundaries = [
      ["unseen-media.png", 540, 440],
      ["tail-02-media.png", 536, 430],
      ["tail-03-media.png", 538, 420],
    ] as const;

    for (const [file, width, maximumHeight] of expectedBoundaries) {
      const png = PNG.sync.read(
        readFileSync(join(process.cwd(), "public/sazo-commerce/reviews", file)),
      );

      expect(png.width).toBe(width);
      expect(png.height).toBeLessThanOrEqual(maximumHeight);
    }
  });

  it.each([
    ["brands", "LONGCHAMP", <BrandsView dispatch={noDispatch} />],
    [
      "categories",
      "スキンケア",
      <CategoriesView dispatch={noDispatch} state={createInitialSazoState()} />,
    ],
    [
      "catalog",
      "全体 86個",
      <CatalogView dispatch={noDispatch} state={stateWithCatalogMode("list")} />,
    ],
    [
      "reviews",
      "購入体験レビュー",
      <ReviewsView dispatch={noDispatch} state={createInitialSazoState()} />,
    ],
    ["service", "URL入力で購入代行ができます。", <ServiceView dispatch={noDispatch} />],
  ])("renders the unique %s contract from captured fixtures", async (_, text, view) => {
    const { container } = await renderWithI18n(view);

    expect(container.textContent).toContain(text);
    const back = container.querySelector<HTMLButtonElement>("[data-view-back]");
    expect(back).not.toBeNull();
    expect(back?.getAttribute("aria-label")).toBeTruthy();
  });

  it("separates the service step word and number for the recorded scale hierarchy", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const firstLabel = container.querySelector(
      '.sazo-service-step[data-step="01"] .sazo-service-step-copy > span',
    );

    expect(firstLabel?.querySelector("small")?.textContent).toBe("STEP");
    expect(firstLabel?.querySelector("strong")?.textContent).toBe("01");
    expect(
      Array.from(container.querySelectorAll<HTMLElement>(".sazo-service-step")).map(
        ({ dataset }) => dataset.panelTone,
      ),
    ).toEqual(["yellow", "green", "blue"]);
    expect(
      container.querySelector<HTMLElement>(".sazo-service-title")?.dataset.pasteOutline,
    ).toBe("true");
  });

  it("uses only the approved J-Planet service-step artwork", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const stepSources = Array.from(
      container.querySelectorAll<HTMLImageElement>(".sazo-service-step-image img"),
      (image) => image.getAttribute("src"),
    );

    expect(stepSources).toEqual([
      "/sazo-commerce/service-lp/jplanet-how-to-use-1.svg",
      "/sazo-commerce/service-lp/jplanet-how-to-use-2.svg",
      "/sazo-commerce/service-lp/jplanet-how-to-use-3.svg",
    ]);
    expect(stepSources.some((source) => source?.endsWith(".png"))).toBe(false);
  });

  it("keeps every shipping-step SVG free of invalid NaN path data", () => {
    for (let step = 1; step <= 5; step += 1) {
      const source = readFileSync(
        join(
          process.cwd(),
          `public/sazo-commerce/service-lp/shipping-step-${String(step)}.svg`,
        ),
        "utf8",
      );

      expect(source, `shipping-step-${String(step)}.svg`).not.toMatch(/nan/i);
    }
  });

  it("describes the Japan-to-Brazil forwarding service", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const serviceHeading = container.querySelector(".sazo-service-hero h1");
    const routeHeading = container.querySelector(".sazo-service-hero-outline");
    const serviceSubheading = container.querySelector(".sazo-service-hero h2");
    const shippingMap = container.querySelector<HTMLImageElement>(
      ".sazo-service-shipping-map",
    );

    expect(serviceHeading?.textContent).toBe("日本代行");
    expect(routeHeading?.textContent.replace(/\s+/g, "")).toBe("FROMJAPANTOBRAZIL");
    expect(serviceSubheading?.textContent).toBe("日本の商品をブラジルへ直送");
    expect(screen.getAllByLabelText("日本のショップURL")).toHaveLength(2);
    expect(screen.getAllByPlaceholderText("日本のショップURL")).toHaveLength(2);
    expect(shippingMap?.alt).toBe("日本からブラジルへ商品を直送");
    expect(shippingMap?.getAttribute("src")).toBe(
      "/sazo-commerce/service-lp/shipping-japan-brazil.svg",
    );
    expect(
      Array.from(container.querySelectorAll(".sazo-service-shipping-step strong")).map(
        (step) => step.textContent,
      ),
    ).toEqual([
      "受付",
      "日本国内購入",
      "日本倉庫で検品",
      "国際配送・通関",
      "ブラジルへお届け",
    ]);
    expect(
      Array.from(
        container.querySelectorAll(".sazo-service-partner-card"),
        (card) => card.textContent,
      ).slice(0, 8),
    ).toEqual([
      "公式通販",
      "百貨店",
      "フリマ",
      "家電",
      "ホビー",
      "コスメ",
      "書籍",
      "クラファン",
    ]);
    const partnerLogos = container.querySelectorAll<HTMLImageElement>(
      ".sazo-service-partner-grid img",
    );
    expect(partnerLogos.length).toBeGreaterThanOrEqual(8);
    expect(Array.from(partnerLogos, (logo) => logo.getAttribute("src"))).toContain(
      "/sazo-commerce/service-lp/logo-gmarket.png",
    );
    expect(
      container.querySelectorAll(".sazo-service-partner-marquee-track"),
    ).toHaveLength(1);
    expect(
      container.querySelector(
        '.sazo-service-partner-marquee-track[data-direction="forward"]',
      ),
    ).not.toBeNull();
    expect(container.querySelector(".sazo-service-view")?.textContent).not.toMatch(
      /韓国|KOREA|TO JAPAN|韓国代行|日本まで発送/,
    );
  });

  it("starts the service page with the recorded campaign and URL how-to sequence", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const intro = container.querySelector<HTMLElement>("[data-service-video-intro]");

    expect(intro).not.toBeNull();
    expect(intro?.querySelector(".sazo-service-video-header")).not.toBeNull();
    expect(
      intro?.querySelector<HTMLImageElement>(".sazo-service-video-banner img")?.src,
    ).toContain("/sazo-commerce/campaign/coupon-banner.png");
    expect(intro?.querySelectorAll("[data-service-video-rail]")).toHaveLength(2);
    expect(intro?.textContent).toContain("購入代行の面倒さゼロ！");
    expect(intro?.textContent).toContain("日本の商品がたくさん！");
    expect(intro?.querySelector("[data-service-agent-entry]")).not.toBeNull();
    expect(
      intro?.querySelector("[data-service-agent-entry] .sazo-mobile-agent-composer"),
    ).not.toBeNull();

    const howTo = container.querySelector<HTMLElement>("[data-service-video-howto]");
    expect(howTo).not.toBeNull();
    expect(howTo?.querySelector("h2")?.textContent).toBe("URL入力のやり方");
    expect(howTo?.querySelectorAll("img")).toHaveLength(3);
  });

  it("uses the J-Planet AI composer for the service-page search entry", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const entry = container.querySelector<HTMLElement>("[data-service-agent-entry]");

    expect(entry).not.toBeNull();
    expect(entry?.querySelector(".sazo-mobile-agent-composer")).not.toBeNull();
    expect(entry?.querySelector("textarea")?.getAttribute("placeholder")).toContain(
      "URL",
    );
    expect(container.querySelector(".sazo-service-video-url")).toBeNull();
  });

  it("exposes one semantic review set and hides the scrolling clone", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const reviewSets = Array.from(
      container.querySelectorAll<HTMLElement>("[data-service-review-set]"),
    );

    expect(reviewSets).toHaveLength(2);
    expect(reviewSets[0]?.getAttribute("aria-hidden")).toBeNull();
    expect(reviewSets[0]?.querySelectorAll(".sazo-service-review-card")).toHaveLength(10);
    expect(reviewSets[1]?.getAttribute("aria-hidden")).toBe("true");
    expect(reviewSets[1]?.querySelectorAll(".sazo-service-review-card")).toHaveLength(10);
    expect(reviewSets[0]?.textContent).toContain(
      "日本からブラジルまで無事に届きました。",
    );
  });

  it("renders the complete forwarding landing-page sequence from the recording", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);

    expect(container.querySelector(".sazo-service-hero h1")?.textContent).toBe(
      "日本代行",
    );
    expect(screen.getByText("手数料")).toBeTruthy();
    expect(screen.getByText("日本の商品をブラジルへ直送")).toBeTruthy();
    expect(screen.getAllByPlaceholderText("日本のショップURL")).toHaveLength(2);
    expect(container.querySelectorAll(".sazo-service-problem-card")).toHaveLength(3);
    expect(container.querySelectorAll(".sazo-service-shipping-step")).toHaveLength(5);
    expect(container.querySelectorAll(".sazo-service-trust-card")).toHaveLength(5);
    expect(screen.getByText("購入後の流れ")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /日本の.*どの通販.*でも/ })).toBeTruthy();
  });

  it("opens and closes each recorded service FAQ row", async () => {
    await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const question = screen.getByRole("button", {
      name: /日本の販売者に問い合わせることはできますか/,
    });

    expect(question.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(question);
    expect(question.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(question);
    expect(question.getAttribute("aria-expanded")).toBe("false");
  });

  it("marks both recorded URL demos for the copy-paste motion", async () => {
    const { container } = await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const demos = container.querySelectorAll(".sazo-service-url-search");

    expect(demos).toHaveLength(2);
    expect(Array.from(demos, (demo) => demo.getAttribute("data-url-demo"))).toEqual([
      "typing",
      "typing",
    ]);
    expect(
      container.querySelectorAll(".sazo-service-url-entry[data-demo-input]"),
    ).toHaveLength(2);
  });

  it("uses a full-image carousel and omits the old editorial placeholder", async () => {
    const { container } = await renderWithI18n(
      <ReviewsView dispatch={noDispatch} state={createInitialSazoState()} />,
    );

    expect(
      container.querySelector('[data-review-feature-carousel="true"]'),
    ).not.toBeNull();
    expect(container.querySelectorAll(".sazo-review-feature-card")).toHaveLength(3);
    expect(container.querySelector(".sazo-review-tile-placeholder")).toBeNull();
  });

  it("keeps purchase-experience controls distinct from the agent search", async () => {
    const dispatch = vi.fn();
    const { container } = await renderWithI18n(
      <ReviewsView dispatch={dispatch} state={createInitialSazoState()} />,
    );

    expect(screen.getAllByRole("heading", { name: "購入体験レビュー" })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "AIで商品を探す" })).toBeTruthy();
    expect(container.querySelector('[data-review-agent-entry="true"]')).not.toBeNull();
    expect(container.querySelector("textarea")).not.toBeNull();
    expect(
      container.querySelector('[data-review-category-filter="true"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('.sazo-review-masonry[data-review-columns="2"]'),
    ).not.toBeNull();
  });

  it("renders photo-first purchase review tiles without social metrics", async () => {
    const dispatch = vi.fn();
    const { container } = await renderWithI18n(
      <ReviewsView dispatch={dispatch} state={createInitialSazoState()} />,
    );
    const purchaseTiles = container.querySelectorAll(".sazo-review-tile");

    expect(purchaseTiles).toHaveLength(18);
    expect(container.textContent).toContain("Yuri · Belo Horizonte");
    expect(container.textContent).toContain("Ken · Rio de Janeiro");
    expect(container.querySelector(".sazo-review-tile-actions")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "BRL 総額" }));
    expect(dispatch).toHaveBeenCalledWith({
      category: "brl-total",
      type: "select-review-category",
    });
  });

  it("separates the campaign headline scales without baking the text into media", async () => {
    const { container } = await renderWithI18n(
      <CampaignView dispatch={noDispatch} loaded />,
    );
    const heading = container.querySelector(".sazo-campaign-message h1");

    expect(heading?.querySelector("strong")?.textContent).toBe("超お得な");
    expect(heading?.querySelector("small")?.textContent).toBe("日本の商品がたくさん！");
  });

  it("uses the approved J-Planet coupon artwork and current wordmark", async () => {
    const { container } = await renderWithI18n(
      <CampaignView dispatch={noDispatch} loaded />,
    );
    const artwork = container.querySelector<HTMLImageElement>(
      ".sazo-campaign-banner-artwork",
    );
    const wordmark = container.querySelector<HTMLImageElement>(
      ".sazo-campaign-banner img[data-jplanet-wordmark]",
    );

    expect(artwork?.getAttribute("src")).toBe(
      "/sazo-commerce/campaign/jplanet-coupon-banner.svg",
    );
    expect(wordmark?.getAttribute("src")).toBe("/sazo-commerce/jplanet-wordmark.png");
    expect(container.querySelector('img[src$="coupon-banner.png"]')).toBeNull();
  });

  it.each(["list", "grid"] as const)(
    "exposes the catalog %s mode and its matching accessible toggle state",
    async (mode) => {
      const { container } = await renderWithI18n(
        <CatalogView dispatch={noDispatch} state={stateWithCatalogMode(mode)} />,
      );

      expect(
        container.querySelector("[data-catalog-mode]")?.getAttribute("data-catalog-mode"),
      ).toBe(mode);
      expect(
        screen
          .getByRole("button", { name: mode === "list" ? "リスト表示" : "グリッド表示" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    },
  );

  it("opens the shared skincare catalog from directory category children", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    openCatalogFromCategoryDirectory("ベースメイク");
    expect(container.querySelectorAll('[data-view-content="catalog"]')).toHaveLength(0);
    expect(container.querySelector('[data-beauty-view]')).toBeNull();
    expect(container.querySelector('[data-testid="skincare-catalog-view"]')).not.toBeNull();

    fireEvent.click(within(desktopNav).getByRole("button", { name: "ホーム" }));
    openCatalogFromCategoryDirectory("ベースメイク");

    expect(container.querySelectorAll('[data-view-content="catalog"]')).toHaveLength(0);
    expect(container.querySelector('[data-beauty-view]')).toBeNull();
    expect(container.querySelector('[data-testid="skincare-catalog-view"]')).not.toBeNull();
  });

  it("uses home shortcuts with bottom Home and renders the video-matched top bar", async () => {
    installMobileHome();
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const mobileShell =
      container.querySelector<HTMLElement>('[data-shell="mobile"]') ?? container;
    const mobileHeader = within(mobileShell).getByRole("banner");
    const primary = within(mobileShell).getByRole("navigation", {
      name: "モバイルメニュー",
    });
    const secondary = within(mobileHeader).getByRole("navigation", {
      name: "モバイルサブメニュー",
    });

    expect(mobileHeader.getAttribute("data-sazo-topbar")).toBe("true");
    expect(mobileHeader.querySelector("[data-sazo-topbar-primary]")).not.toBeNull();

    const shortcuts = screen.getByRole("group", {
      name: "J-Planetショートカット",
    });

    expect(
      within(shortcuts)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual([
      "J-Planet特集",
      "日本限定",
      "フリマ・中古",
      "人気ブランド",
      "カテゴリー",
      "クーポン",
      "レビュー",
      "サービス紹介",
      "お知らせ",
    ]);
    expect(
      within(primary)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["ホーム", "ブランド", "AI検索", "通知", "マイページ"]);

    const brandTab = within(primary).getByRole("button", { name: "ブランド" });
    fireEvent.click(brandTab);
    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "brands",
    );
    expect(brandTab.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(within(primary).getByRole("button", { name: "ホーム" }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "J-Planetショートカット" })).getByRole(
        "button",
        {
          name: "人気ブランド",
        },
      ),
    );
    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "brands",
    );

    fireEvent.click(within(primary).getByRole("button", { name: "ホーム" }));
    fireEvent.click(within(shortcuts).getByRole("button", { name: "カテゴリー" }));
    expect(
      within(secondary)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual([
      "ホーム",
      "サービス紹介",
      "人気ブランド",
      "カテゴリー",
      "レビュー",
      "ヘルプ",
      "お知らせ",
    ]);

    fireEvent.click(within(secondary).getByRole("button", { name: "ホーム" }));

    const agent = within(primary).getByRole("button", { name: "AI検索" });
    fireEvent.click(agent);

    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "ai-search",
    );
    expect(agent.getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByRole("dialog", { name: "J-Planet AIエージェント" })).toBeNull();
    expect(screen.getByRole("search", { name: "AI検索" })).toBeTruthy();
  });

  it("uses one content rail for the agent activity sections", async () => {
    installDesktopHome();
    const { container } = await renderWithI18n(
      <MobileAgentHubView dispatch={noDispatch} entryIntent={null} />,
    );

    expect(
      ["recent-searches", "recent-products", "common-searches"].map((section) =>
        container
          .querySelector<HTMLElement>(`[data-section="${section}"]`)
          ?.classList.contains("sazo-agent-hub-content-rail"),
      ),
    ).toEqual([true, true, true]);
  });

  it("filters the shared J-Planet brand inventory from its active control", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "ブランド" }));
    fireEvent.click(screen.getByRole("button", { name: "家電" }));

    expect(screen.getByText("APPLE")).toBeTruthy();
    expect(screen.queryByText("NIKE")).toBeNull();
  });

  it("uses the eight recorded brand logos as decorative local images", async () => {
    const { container } = await renderWithI18n(<BrandsView dispatch={noDispatch} />);
    const logos = Array.from(
      container.querySelectorAll<HTMLImageElement>("img.sazo-brand-logo"),
    );

    expect(logos).toHaveLength(8);
    expect(logos.every((logo) => logo.alt === "")).toBe(true);
    expect(logos.every((logo) => logo.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(new Set(logos.map((logo) => logo.getAttribute("src"))).size).toBe(8);
  });

  it("opens the shared skincare catalog instead of the retired category landing", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "カテゴリー" }));
    fireEvent.click(screen.getByRole("button", { name: "ベースメイク" }));

    expect(container.querySelectorAll('[data-view-content="catalog"]')).toHaveLength(0);
    expect(container.querySelector('[data-beauty-view]')).toBeNull();
    expect(container.querySelector('[data-testid="skincare-catalog-view"]')).not.toBeNull();
  });

  it("does not revive the retired landing for non-beauty category children", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "カテゴリー" }));
    fireEvent.click(screen.getByRole("button", { name: "レディース" }));
    fireEvent.click(screen.getByRole("button", { name: "トップス" }));

    expect(container.querySelector('[data-beauty-view]')).toBeNull();
    expect(container.querySelector('[data-testid="skincare-catalog-view"]')).not.toBeNull();
  });

  it("filters catalog products with an active chip", async () => {
    const state = stateWithCatalogMode("list");
    const { container } = await renderWithI18n(
      <CatalogView dispatch={noDispatch} state={state} />,
    );
    const initialCount = container.querySelectorAll(
      ".sazo-catalog-products .sazo-product-card",
    ).length;
    const toner = screen.getByRole("button", { name: "化粧水" });
    expect(toner.getAttribute("aria-pressed")).toBe("false");

    cleanup();
    const { container: filteredContainer } = await renderWithI18n(
      <CatalogView dispatch={noDispatch} state={{ ...state, catalogChip: "toner" }} />,
    );
    expect(
      filteredContainer.querySelectorAll(".sazo-catalog-products .sazo-product-card")
        .length,
    ).toBeLessThan(initialCount);
  });

  it("falls back to the all-review chip after selecting a directory category", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "カテゴリー" }));
    fireEvent.click(screen.getByRole("button", { name: "レディース" }));
    fireEvent.click(
      within(screen.getByRole("navigation", { name: "モバイルサブメニュー" })).getByRole(
        "button",
        { name: "レビュー" },
      ),
    );

    expect(
      screen.getByRole("button", { name: "すべて" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("uses purchase decision axes to filter review cards", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=reviews");
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const firstReview = container.querySelector(".sazo-review-tile");

    expect(firstReview?.textContent).toContain("Yuri · Belo Horizonte");
    expect(firstReview?.textContent).toContain(
      "梱包がとても丁寧で、傷ひとつありませんでした。",
    );
    expect(firstReview?.querySelector("img")?.getAttribute("src")).toBe(
      "/sazo-commerce/review-media/r06.jpg",
    );
    expect(container.querySelectorAll<HTMLElement>(".sazo-review-tile")).toHaveLength(18);

    const reviewFilters = container.querySelector<HTMLElement>(
      '[data-review-category-filter="true"]',
    );
    if (reviewFilters === null) throw new Error("Missing review filters");
    fireEvent.click(within(reviewFilters).getByRole("button", { name: "配送・通関" }));

    expect(container.querySelectorAll<HTMLElement>(".sazo-review-tile")).toHaveLength(9);
    expect(container.textContent).not.toContain("João · Porto Alegre");
  });

  it("hides a closed FAQ panel and closes the focused item with Escape", async () => {
    await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const faqButton = screen.getByRole("button", {
      name: /日本の販売者に問い合わせることはできますか/,
    });
    const answerId = faqButton.getAttribute("aria-controls");

    expect(faqButton.getAttribute("aria-expanded")).toBe("false");
    expect(answerId).toBeTruthy();
    const answer = document.getElementById(answerId ?? "");
    expect(answer?.getAttribute("aria-hidden")).toBe("true");

    faqButton.focus();
    fireEvent.click(faqButton);

    expect(faqButton.getAttribute("aria-expanded")).toBe("true");
    expect(answer?.getAttribute("aria-hidden")).toBe("false");
    expect(document.activeElement).toBe(faqButton);

    fireEvent.click(faqButton);
    expect(faqButton.getAttribute("aria-expanded")).toBe("false");
    expect(answer?.getAttribute("aria-hidden")).toBe("true");

    fireEvent.click(faqButton);
    expect(faqButton.getAttribute("aria-expanded")).toBe("true");
    expect(answer?.getAttribute("aria-hidden")).toBe("false");

    fireEvent.keyDown(faqButton, { key: "Escape" });
    expect(faqButton.getAttribute("aria-expanded")).toBe("false");
    expect(answer?.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(faqButton);
  });

  it("gives each product favorite a local pressed state", async () => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing SAZO product test fixture");
    }

    await renderWithI18n(<ProductCard onOpen={() => undefined} product={product} />);
    const favorite = screen.getByRole("button", {
      name: `${product.name}をお気に入りに追加`,
    });

    expect(favorite.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(favorite);
    expect(favorite.getAttribute("aria-pressed")).toBe("true");
  });
});
