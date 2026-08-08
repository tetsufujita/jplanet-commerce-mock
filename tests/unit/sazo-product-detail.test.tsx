// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

async function renderWithI18n(element: React.ReactNode, locale: unknown = "ja") {
  const i18n = await createI18n(locale);

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

  it.each([
    ["ja", "商品詳細を開く"],
    ["en", "Open product details"],
    ["pt-BR", "Abrir detalhes do produto"],
  ])("localizes the product open name for %s", async (locale, label) => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing J-Planet product test fixture");
    }

    await renderWithI18n(<ProductCard onOpen={vi.fn()} product={product} />, locale);

    expect(
      screen.getByRole("button", { name: `${label}: ${product.name}` }),
    ).toBeTruthy();
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
    const desktopBack = container.querySelector<HTMLButtonElement>(
      ".sazo-product-detail-desktop-back",
    );

    if (desktopBack === null) {
      throw new Error("Missing desktop product detail back control");
    }

    fireEvent.click(desktopBack);
    expect(container.querySelector("[data-home-view]")).not.toBeNull();
  });

  it("resets product-scoped state and scroll before opening a recommendation", async () => {
    const firstProduct = products[0];
    const secondProduct = products[1];

    if (firstProduct === undefined || secondProduct === undefined) {
      throw new Error("Missing product switch test fixtures");
    }

    window.history.replaceState(
      null,
      "",
      "/sazo-commerce-mock/?qa=1&view=product&product=p01",
    );
    await renderWithI18n(<SazoCommercePage />);

    fireEvent.click(screen.getByRole("button", { name: "画像2を表示" }));
    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));
    fireEvent.change(screen.getByLabelText("商品オプション"), {
      target: { value: "ギフト包装" },
    });
    fireEvent.change(screen.getByLabelText("ご要望"), {
      target: { value: "赤い包装を希望" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "画像にチェック" }));
    fireEvent.click(screen.getByRole("tab", { name: "注意事項" }));

    const initialCartButton = screen.getAllByRole("button", {
      name: "カートに入れる",
    })[0];

    if (initialCartButton === undefined) {
      throw new Error("Missing initial cart button");
    }

    fireEvent.click(initialCartButton);
    expect(screen.getByRole("status").textContent).toContain("カートに追加しました");

    document.documentElement.scrollTop = 1186;
    document.body.scrollTop = 1186;
    fireEvent.click(
      screen.getByRole("button", {
        name: `商品詳細を開く: ${secondProduct.name}`,
      }),
    );

    await waitFor(() => {
      expect(document.documentElement.scrollTop).toBe(0);
      expect(document.body.scrollTop).toBe(0);
    });
    expect(screen.getByRole("heading", { name: secondProduct.name })).toBeTruthy();
    expect(
      screen.getByRole("img", { name: secondProduct.name }).getAttribute("src"),
    ).toBe(secondProduct.image);

    const option = screen.getByLabelText<HTMLSelectElement>("商品オプション");
    const request = screen.getByLabelText<HTMLTextAreaElement>("ご要望");
    const imageCheck = screen.getByRole<HTMLInputElement>("checkbox", {
      name: "画像にチェック",
    });

    expect(option.value).toBe("");
    expect(screen.queryByRole("option", { name: "ギフト包装" })).toBeNull();
    expect(request.value).toBe("");
    expect(imageCheck.checked).toBe(false);
    expect(
      screen
        .getByRole("button", { name: "お気に入りに追加" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(
      screen.getByRole("tab", { name: "商品情報" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByTestId("product-total-value").textContent).toBe("0");

    const nextCartButton = screen.getAllByRole("button", {
      name: "カートに入れる",
    })[0];

    if (nextCartButton === undefined) {
      throw new Error("Missing next product cart button");
    }

    fireEvent.click(nextCartButton);
    expect(screen.getByRole("alert").textContent).toContain("商品オプションを選択");
    expect(screen.queryByRole("status")).toBeNull();
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
    expect(screen.getByRole("heading", { name: "なぜJ-Planetなのか？" })).toBeTruthy();
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
    expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(
      "/sazo-commerce/products/02.webp",
    );

    fireEvent.keyDown(secondThumbnail, { key: "ArrowRight" });
    expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(
      "/sazo-commerce/products/03.webp",
    );

    expect(container.querySelectorAll("form")).toHaveLength(1);
    expect(screen.getAllByRole("combobox", { name: "商品オプション" })).toHaveLength(1);
    expect(screen.getByTestId("product-unit-price").textContent).toBe(product.price);
    expect(screen.getByTestId("product-total-value").textContent).toBe("0");

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
    expect(screen.getByTestId("product-unit-price").textContent).toBe(product.price);
    expect(screen.getByTestId("product-total-value").textContent).toBe(product.price);
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

  it("falls back failed gallery sources without breaking image navigation", async () => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing J-Planet product test fixture");
    }

    await renderWithI18n(<ProductDetailView dispatch={vi.fn()} productId="p01" />);

    fireEvent.error(screen.getByRole("img", { name: product.name }));
    const mainPlaceholder = screen.getByTestId("product-main-image-placeholder");
    expect(mainPlaceholder.getAttribute("role")).toBe("img");
    expect(mainPlaceholder.getAttribute("aria-label")).toContain(product.name);

    const secondThumbnail = screen.getByRole("button", { name: "画像2を表示" });
    fireEvent.click(secondThumbnail);
    expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(
      "/sazo-commerce/products/02.webp",
    );

    const thirdThumbnail = screen.getByRole("button", { name: "画像3を表示" });
    const thirdThumbnailImage = thirdThumbnail.querySelector("img");

    if (thirdThumbnailImage === null) {
      throw new Error("Missing third gallery thumbnail image");
    }

    fireEvent.error(thirdThumbnailImage);
    expect(
      within(thirdThumbnail).getByTestId("product-thumbnail-image-placeholder"),
    ).toBeTruthy();
    expect(within(thirdThumbnail).queryByRole("img", { hidden: true })).toBeNull();

    fireEvent.click(thirdThumbnail);
    expect(screen.getByTestId("product-main-image-placeholder")).toBeTruthy();
    fireEvent.click(secondThumbnail);
    expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(
      "/sazo-commerce/products/02.webp",
    );
  });

  it("keeps the compact header mobile-only and renders a desktop back control", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const css = readFileSync(join(process.cwd(), "src/sazo-commerce/sazo.css"), "utf8");

    expect(container.querySelector(".sazo-product-detail-header")).not.toBeNull();
    expect(container.querySelector(".sazo-product-detail-desktop-back")).not.toBeNull();
    expect(css).toMatch(
      /\.sazo-root \.sazo-product-detail-header\s*{[^}]*display:\s*none/s,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\)[\s\S]*?\.sazo-root \.sazo-product-detail-header\s*{[^}]*display:\s*grid/s,
    );
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

  it("renders product-detail interface copy from the active locale", async () => {
    await renderWithI18n(<ProductDetailView dispatch={vi.fn()} productId="p01" />, "en");

    expect(screen.getByText("Purchase directly from Japanese retailers")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Product information" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Buy now" })).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Why J-Planet?" })).toBeTruthy();
  });

  it("applies the vendored Noto Sans JP stack to product detail", () => {
    const css = readFileSync(join(process.cwd(), "src/sazo-commerce/sazo.css"), "utf8");

    expect(css).toMatch(
      /\.sazo-root \.sazo-product-detail\s*{[^}]*font-family:\s*"Noto Sans JP Variable",\s*"Hiragino Sans",\s*"Yu Gothic",\s*Meiryo,\s*sans-serif/s,
    );
  });
});
