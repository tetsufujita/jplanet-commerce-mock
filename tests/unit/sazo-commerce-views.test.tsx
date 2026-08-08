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
import { RankingView, ReviewsView } from "@/sazo-commerce/EditorialViews";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import { products } from "@/sazo-commerce/fixtures";
import {
  createInitialSazoState,
  type CatalogMode,
  type SazoState,
} from "@/sazo-commerce/model";
import { ServiceView } from "@/sazo-commerce/ServiceView";

afterEach(() => {
  cleanup();
});

const noDispatch = () => undefined;

async function renderWithI18n(element: React.ReactNode) {
  const i18n = await createI18n("ja");

  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

function stateWithCatalogMode(mode: CatalogMode): SazoState {
  return { ...createInitialSazoState(), catalogMode: mode, view: "catalog" };
}

describe("SAZO captured view contracts", () => {
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
      "ranking",
      "J-Planet RANKING",
      <RankingView dispatch={noDispatch} state={createInitialSazoState()} />,
    ],
    [
      "reviews",
      "利用レビュー",
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
      ),
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
    expect(container.querySelectorAll(".sazo-service-partner-grid img")).toHaveLength(0);
    expect(container.querySelector(".sazo-service-view")?.textContent).not.toMatch(
      /韓国|KOREA|TO JAPAN|韓国代行|日本まで発送/,
    );
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

  it("keeps the recorded short placeholder in the sixth review slot", async () => {
    const { container } = await renderWithI18n(
      <ReviewsView dispatch={noDispatch} state={createInitialSazoState()} />,
    );
    const placeholder = container.querySelector<HTMLElement>(
      '.sazo-review-tile[data-review-id="editorial-review-06"] .sazo-review-tile-placeholder',
    );

    expect(placeholder).not.toBeNull();
    expect(placeholder?.dataset.recordedHeight).toBe("190");
  });

  it("opens a recommendation from reviews without replacing editorial reviews", async () => {
    const dispatch = vi.fn();
    const { container } = await renderWithI18n(
      <ReviewsView dispatch={dispatch} state={createInitialSazoState()} />,
    );
    const recommendations = screen.getByRole("region", {
      name: "レビュー高評価のおすすめ",
    });

    const editorialTiles = container.querySelectorAll(".sazo-review-tile");

    expect(editorialTiles).toHaveLength(12);
    expect(
      container.querySelector('[data-review-id="editorial-review-09"]')?.textContent,
    ).toContain("丁寧な梱包で届きました。ありがとうございました。");
    expect(
      container.querySelector('[data-review-id="editorial-review-12"]')?.textContent,
    ).toContain("とても綺麗な状態で届きました。");
    const recommendationButton = within(recommendations)
      .getAllByRole("button", { name: /商品詳細を開く/ })
      .at(0);

    if (recommendationButton === undefined) {
      throw new Error("Reviews recommendation button was not rendered");
    }

    fireEvent.click(recommendationButton);
    expect(dispatch).toHaveBeenCalledWith({
      productId: "recommendation-heart",
      type: "open-product",
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

  it("renders only the active view and preserves grid mode across navigation", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const mobileNav = within(
      container.querySelector<HTMLElement>('[data-shell="mobile"]') ?? container,
    ).getByRole("navigation", { name: "モバイルメニュー" });
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(mobileNav).getByRole("button", { name: "検索" }));
    fireEvent.click(screen.getByRole("button", { name: "グリッド表示" }));
    expect(container.querySelectorAll('[data-view-content="catalog"]')).toHaveLength(1);
    expect(
      container.querySelector("[data-catalog-mode]")?.getAttribute("data-catalog-mode"),
    ).toBe("grid");

    fireEvent.click(within(desktopNav).getByRole("button", { name: "ホーム" }));
    fireEvent.click(within(mobileNav).getByRole("button", { name: "検索" }));

    expect(container.querySelectorAll('[data-view-content="catalog"]')).toHaveLength(1);
    expect(
      container.querySelector("[data-catalog-mode]")?.getAttribute("data-catalog-mode"),
    ).toBe("grid");
  });

  it("exposes the recorded mobile secondary destinations as real navigation", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const mobileShell =
      container.querySelector<HTMLElement>('[data-shell="mobile"]') ?? container;
    const secondary = within(mobileShell).getByRole("navigation", {
      name: "モバイルサブメニュー",
    });

    expect(
      within(secondary)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["ホーム", "サービス紹介", "人気ブランド", "カテゴリー", "レビュー"]);

    fireEvent.click(within(secondary).getByRole("button", { name: "人気ブランド" }));
    expect(container.querySelector('[data-view-content="brands"]')).not.toBeNull();
  });

  it("filters the brand inventory from its active control", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "人気ブランド" }));
    fireEvent.click(screen.getByRole("button", { name: "ガジェット" }));

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

  it("opens the catalog on the tab selected from the category directory", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "カテゴリー" }));
    fireEvent.click(screen.getByRole("button", { name: "ベースメイク" }));

    expect(container.querySelectorAll('[data-view-content="catalog"]')).toHaveLength(1);
    expect(
      screen.getByRole("tab", { name: "ベースメイク" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("maps a non-beauty child to its explicit catalog target", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "カテゴリー" }));
    fireEvent.click(screen.getByRole("button", { name: "レディース" }));
    fireEvent.click(screen.getByRole("button", { name: "トップス" }));

    expect(
      screen.getByRole("tab", { name: "トップス" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen.getByRole("tab", { name: "スキンケア" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("filters catalog products with an active chip", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const mobileNav = within(
      container.querySelector<HTMLElement>('[data-shell="mobile"]') ?? container,
    ).getByRole("navigation", { name: "モバイルメニュー" });

    fireEvent.click(within(mobileNav).getByRole("button", { name: "検索" }));
    const initialCount = container.querySelectorAll(
      ".sazo-catalog-products .sazo-product-card",
    ).length;
    const toner = screen.getByRole("button", { name: "化粧水" });
    fireEvent.click(toner);

    expect(toner.getAttribute("aria-pressed")).toBe("true");
    expect(
      container.querySelectorAll(".sazo-catalog-products .sazo-product-card").length,
    ).toBeLessThan(initialCount);
  });

  it("falls back to the all-review chip after selecting a directory category", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "カテゴリー" }));
    fireEvent.click(screen.getByRole("button", { name: "レディース" }));
    fireEvent.click(within(desktopNav).getByRole("button", { name: "レビュー" }));

    expect(
      screen.getByRole("button", { name: "全体" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("uses captured ranking inventory and changes order by metric", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);

    fireEvent.click(
      within(container.querySelector(".sazo-ranking-section") ?? container).getByRole(
        "button",
        { name: "もっと見る" },
      ),
    );
    const firstRankingName = () =>
      container.querySelector(".sazo-ranked-product h3")?.textContent;

    expect(firstRankingName()).toContain("プチプチ犬ヘッドピン");
    expect(container.querySelector(".sazo-ranked-product img")?.getAttribute("src")).toBe(
      "/sazo-commerce/ranking/01.webp",
    );
    fireEvent.click(screen.getByRole("button", { name: "閲覧数" }));
    expect(firstRankingName()).toContain("ポケモンキーリング人形");
  });

  it("uses captured review order and filters it by category", async () => {
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const desktopNav = within(
      container.querySelector<HTMLElement>('[data-shell="desktop"]') ?? container,
    ).getByRole("navigation", { name: "メインメニュー" });

    fireEvent.click(within(desktopNav).getByRole("button", { name: "レビュー" }));
    const firstReview = container.querySelector(".sazo-review-tile");

    expect(firstReview?.textContent).toContain("MKT");
    expect(firstReview?.textContent).toContain("めちゃめちゃ良かったです");
    expect(firstReview?.querySelector("img")?.getAttribute("src")).toBe(
      "/sazo-commerce/jplanet-sakura-mark.png",
    );
    const capturedReviewTiles = Array.from(
      container.querySelectorAll<HTMLElement>(".sazo-review-tile"),
    ).slice(4);

    expect(
      capturedReviewTiles.map((tile) => tile.querySelector("img")?.getAttribute("src")),
    ).toEqual([
      "/sazo-commerce/review-media/r07.jpg",
      undefined,
      "/sazo-commerce/review-media/r08.jpg",
      "/sazo-commerce/reviews/unseen-media.png",
      "/sazo-commerce/reviews/tail-01.png",
      "/sazo-commerce/reviews/tail-03-media.png",
      "/sazo-commerce/reviews/tail-04.png",
      "/sazo-commerce/reviews/tail-02-media.png",
    ]);
    expect(
      Array.from(container.querySelectorAll<HTMLElement>(".sazo-review-tile")).every(
        (tile) =>
          (tile.querySelector(".sazo-review-tile-media > span")?.textContent.trim()
            .length ?? 0) > 0 &&
          (tile.querySelector(":scope > p")?.textContent.trim().length ?? 0) > 0 &&
          tile.querySelectorAll(":scope > .sazo-review-tile-actions").length === 1,
      ),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "アイドル" }));

    expect(container.querySelector(".sazo-review-tile")?.textContent).toContain(
      "加藤奈実",
    );
    expect(container.textContent).not.toContain("めちゃめちゃ良かったです");
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
