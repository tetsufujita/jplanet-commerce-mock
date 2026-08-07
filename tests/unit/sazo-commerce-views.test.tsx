// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
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
      "SAZO RANKING",
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

  it("separates the campaign headline scales without baking the text into media", async () => {
    const { container } = await renderWithI18n(
      <CampaignView dispatch={noDispatch} loaded />,
    );
    const heading = container.querySelector(".sazo-campaign-message h1");

    expect(heading?.querySelector("strong")?.textContent).toBe("超お得な");
    expect(heading?.querySelector("small")?.textContent).toBe("韓国商品がたくさん！");
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
      "/sazo-commerce/editorial-reviews/01.webp",
    );
    const capturedReviewTiles = Array.from(
      container.querySelectorAll<HTMLElement>(".sazo-review-tile"),
    ).slice(4);

    expect(
      capturedReviewTiles.map((tile) => tile.querySelector("img")?.getAttribute("src")),
    ).toEqual([
      "/sazo-commerce/community/10.webp",
      undefined,
      "/sazo-commerce/community/11.webp",
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
      name: "韓国以外からも購入できますか？",
    });
    const answerId = faqButton.getAttribute("aria-controls");

    expect(faqButton.getAttribute("aria-expanded")).toBe("true");
    expect(answerId).toBeTruthy();
    const answer = document.getElementById(answerId ?? "");
    expect(answer?.getAttribute("aria-hidden")).toBe("false");

    faqButton.focus();
    fireEvent.click(faqButton);

    expect(faqButton.getAttribute("aria-expanded")).toBe("false");
    expect(answer?.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(faqButton);

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

    await renderWithI18n(<ProductCard product={product} />);
    const favorite = screen.getByRole("button", {
      name: `${product.name}をお気に入りに追加`,
    });

    expect(favorite.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(favorite);
    expect(favorite.getAttribute("aria-pressed")).toBe("true");
  });
});
