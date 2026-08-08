// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { ProductCard } from "@/sazo-commerce/ProductCard";
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
