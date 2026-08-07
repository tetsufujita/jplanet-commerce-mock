// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { CatalogView } from "@/sazo-commerce/CatalogView";
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

  it("keeps the first FAQ expanded and toggles it through its native button", async () => {
    await renderWithI18n(<ServiceView dispatch={noDispatch} />);
    const faqButton = screen.getByRole("button", {
      name: "韓国以外からも購入できますか？",
    });
    const answerId = faqButton.getAttribute("aria-controls");

    expect(faqButton.getAttribute("aria-expanded")).toBe("true");
    expect(answerId).toBeTruthy();
    expect(document.getElementById(answerId ?? "")?.getAttribute("data-expanded")).toBe(
      "true",
    );

    fireEvent.click(faqButton);

    expect(faqButton.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(answerId ?? "")?.getAttribute("data-expanded")).toBe(
      "false",
    );
    expect(screen.getByText("よくある質問")).toBeTruthy();
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
