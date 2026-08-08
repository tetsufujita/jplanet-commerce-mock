// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import { ProductDetailView } from "@/sazo-commerce/ProductDetailView";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import { products } from "@/sazo-commerce/fixtures";

afterEach(() => {
  cleanup();
});

async function renderWithI18n(element: React.ReactNode) {
  const i18n = await createI18n("ja");

  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

describe("SAZO product detail navigation", () => {
  it("opens detail from the product control without coupling favorite navigation", async () => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing SAZO product test fixture");
    }

    const onOpen = vi.fn();
    await renderWithI18n(<ProductCard onOpen={onOpen} product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /商品詳細を開く/ }));
    expect(onOpen).toHaveBeenCalledWith("p01");

    fireEvent.click(screen.getByRole("button", { name: /お気に入り/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("opens a product from home and returns to home", async () => {
    window.history.replaceState(null, "", "/sazo-commerce-mock/");
    const { container } = await renderWithI18n(<SazoCommercePage />);
    const productOpenControl = screen.getAllByRole("button", {
      name: /商品詳細を開く/,
    })[0];

    if (productOpenControl === undefined) {
      throw new Error("Missing product detail open control");
    }

    fireEvent.click(productOpenControl);
    expect(container.querySelector("[data-product-detail]")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(container.querySelector("[data-home-view]")).not.toBeNull();
  });
});

describe("J-Planet product detail experience", () => {
  it("renders the complete Japan-to-Brazil information hierarchy", async () => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing J-Planet product test fixture");
    }

    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );

    expect(screen.getByRole("heading", { name: product.name })).toBeTruthy();
    expect(screen.getByText("日本の販売サイトから直接購入")).toBeTruthy();
    expect(screen.getByText("日本で購入")).toBeTruthy();
    expect(screen.getByText("ブラジルへお届け")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "商品情報" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "なぜJ-Planetなのか？" }),
    ).toBeTruthy();
    expect(screen.getByText("レビューがありません。")).toBeTruthy();
    expect(screen.getByText("販売元の在庫について")).toBeTruthy();
    expect(screen.getByText("ブラジルの輸入制限")).toBeTruthy();
    expect(screen.getByText("返品・返金サポート")).toBeTruthy();

    const productVisibleText = container.textContent.replace(/\s+/g, " ");
    expect(productVisibleText).not.toMatch(/SAZO|韓国|KOREA|TO JAPAN/i);
  });

  it("shares gallery and validated purchase state across desktop and mobile controls", async () => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing J-Planet product test fixture");
    }

    const dispatch = vi.fn();
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={dispatch} productId="p01" />,
    );

    const secondThumbnail = screen.getByRole("button", { name: "画像2を表示" });
    fireEvent.click(secondThumbnail);
    expect(
      screen.getByRole("img", { name: product.name }).getAttribute("src"),
    ).toBe("/sazo-commerce/products/02.webp");

    fireEvent.keyDown(secondThumbnail, { key: "ArrowRight" });
    expect(
      screen.getByRole("img", { name: product.name }).getAttribute("src"),
    ).toBe("/sazo-commerce/products/03.webp");

    expect(container.querySelectorAll("form")).toHaveLength(1);
    expect(screen.getAllByRole("combobox", { name: "商品オプション" })).toHaveLength(
      1,
    );

    const cartButtons = screen.getAllByRole("button", { name: "カートに入れる" });
    const primaryCartButton = cartButtons[0];

    if (primaryCartButton === undefined) {
      throw new Error("Missing primary cart button");
    }

    fireEvent.click(primaryCartButton);
    expect(screen.getByRole("alert").textContent).toContain("商品オプションを選択");
    expect(document.activeElement).toBe(screen.getByLabelText("商品オプション"));

    fireEvent.change(screen.getByLabelText("商品オプション"), {
      target: { value: "標準" },
    });
    expect(screen.getByTestId("product-total").textContent).toContain(product.price);
    fireEvent.click(primaryCartButton);
    expect(screen.getByRole("status").textContent).toContain("カートに追加しました");

    const buyNowButtons = screen.getAllByRole("button", { name: "今すぐ買う" });
    const mobileBuyNowButton = buyNowButtons.at(-1);

    if (mobileBuyNowButton === undefined) {
      throw new Error("Missing mobile buy-now button");
    }

    fireEvent.click(mobileBuyNowButton);
    expect(dispatch).toHaveBeenCalledWith({ type: "open-login" });
  });

  it("supports keyboard tabs and preserves the five delivery stages", async () => {
    await renderWithI18n(<ProductDetailView dispatch={vi.fn()} productId="p01" />);

    const informationTab = screen.getByRole("tab", { name: "商品情報" });
    const cautionTab = screen.getByRole("tab", { name: "注意事項" });
    expect(informationTab.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(informationTab, { key: "ArrowRight" });
    expect(cautionTab.getAttribute("aria-selected")).toBe("true");

    expect(screen.getByText("注文受付")).toBeTruthy();
    expect(screen.getByText("日本で購入")).toBeTruthy();
    expect(screen.getByText("日本倉庫で検品")).toBeTruthy();
    expect(screen.getByText("国際配送・通関")).toBeTruthy();
    expect(screen.getByText("ブラジルへお届け")).toBeTruthy();
  });
});
