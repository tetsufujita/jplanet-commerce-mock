// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartView } from "@/sazo-commerce/CartView";

const cartItems = [
  {
    option: "カラー: ホワイト",
    productId: "jplanet-nintendo-switch-oled",
    quantity: 1,
  },
  {
    option: "サイズ: 27cm",
    productId: "jplanet-new-balance-9060",
    quantity: 1,
  },
  {
    option: "バリエーション: 本体のみ",
    productId: "jplanet-sony-a7c-ii",
    quantity: 1,
  },
] as const;

afterEach(() => {
  cleanup();
});

describe("J-Planet cart", () => {
  it("groups multiple selected products by purchase source and keeps the BRL summary live", () => {
    const dispatch = vi.fn();

    render(<CartView dispatch={dispatch} items={cartItems} />);

    expect(screen.getByRole("heading", { name: "カート (3)" })).toBeTruthy();
    expect(screen.getByText("Rakuten Japan 公式ストア")).toBeTruthy();
    expect(screen.getByText("Sony Japan 公式")).toBeTruthy();
    expect(screen.getByText("R$ 5,612")).toBeTruthy();
    expect(document.body.textContent).not.toContain("¥");

    fireEvent.click(screen.getByRole("checkbox", { name: "Nintendo Switch OLEDを選択" }));
    expect(screen.getByRole("button", { name: "購入手続きへ (2)" })).toBeTruthy();
    expect(screen.getByText("R$ 3,428")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Nintendo Switch OLEDを増やす" }));
    expect(dispatch).toHaveBeenCalledWith({
      option: "カラー: ホワイト",
      productId: "jplanet-nintendo-switch-oled",
      quantity: 2,
      type: "set-cart-item-quantity",
    });
  });

  it("shows the home-style recommendation grid below the cart and keeps its product flow active", () => {
    const dispatch = vi.fn();

    render(<CartView dispatch={dispatch} items={cartItems} />);

    const recommendations = screen.getByTestId("jplanet-cart-recommendations");
    expect(screen.getByRole("heading", { name: "あなたへのおすすめ" })).toBeTruthy();
    expect(recommendations.querySelectorAll(".sazo-home-dense-product")).toHaveLength(16);
    expect(recommendations.querySelectorAll(".sazo-home-dense-product-add")).toHaveLength(16);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Nintendo Switch Proコントローラーの購入オプションを選ぶ",
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      productId: "jplanet-nintendo-pro-controller",
      type: "open-product",
    });
  });

  it("applies a source coupon and reopens the existing variant-selection flow", () => {
    const dispatch = vi.fn();

    render(<CartView dispatch={dispatch} items={cartItems} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Rakuten Japan 公式ストアのクーポンを選択" }),
    );
    expect(screen.getByRole("dialog", { name: "クーポンを選択" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "適用する" }));
    expect(screen.getByText("R$ 20 OFF")).toBeTruthy();
    expect(screen.getByText("R$ 5,592")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Nintendo Switch OLEDのバリアントを選択" }),
    );
    expect(screen.getByRole("dialog", { name: "バリアントを選択" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "カラー: ネオンブルー・ネオンレッド" }));
    expect(dispatch).toHaveBeenCalledWith({
      option: "カラー: ネオンブルー・ネオンレッド",
      previousOption: "カラー: ホワイト",
      productId: "jplanet-nintendo-switch-oled",
      type: "set-cart-item-option",
    });
  });

  it("supports editing to an empty cart and hands selected items to checkout", () => {
    const dispatch = vi.fn();

    render(<CartView dispatch={dispatch} items={cartItems} />);
    fireEvent.click(screen.getByRole("button", { name: "購入手続きへ (3)" }));
    expect(dispatch).toHaveBeenCalledWith({
      items: cartItems,
      type: "begin-checkout",
    });

    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "Nintendo Switch OLEDを削除" }));
    fireEvent.click(screen.getByRole("button", { name: "New Balance 9060を削除" }));
    fireEvent.click(screen.getByRole("button", { name: "Sony α7C II ボディを削除" }));

    expect(screen.getByTestId("jplanet-cart-empty")).toBeTruthy();
    expect(screen.getByRole("button", { name: /エージェントで商品を探す/ })).toBeTruthy();
  });
});
