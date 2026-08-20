// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckoutView } from "@/sazo-commerce/CheckoutView";

const items = [
  { productId: "jplanet-nintendo-switch-oled", option: "カラー: ホワイト", quantity: 1 },
  { productId: "jplanet-new-balance-9060", option: "サイズ: 27cm", quantity: 1 },
  { productId: "jplanet-sony-a7c-ii", option: "バリエーション: 本体のみ", quantity: 1 },
] as const;

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("J-Planet checkout", () => {
  it("keeps the synthetic mock delivery stages expanded by default and toggles them locally", () => {
    window.history.replaceState(
      {},
      "",
      "/sazo-commerce-mock/?qa=1&view=checkout",
    );
    render(<CheckoutView dispatch={vi.fn()} items={items} />);

    const deliverySection = document.querySelector<HTMLElement>(
      '[data-delivery-copy-source="synthetic-mock"]',
    );
    expect(deliverySection).not.toBeNull();
    if (deliverySection === null) throw new Error("Missing synthetic delivery section");

    const closeDetails = within(deliverySection).getByRole("button", {
      name: "配送詳細を閉じる",
    });
    expect(closeDetails.getAttribute("aria-expanded")).toBe("true");
    expect(within(deliverySection).getByText("日本国内配送 2〜4日")).toBeTruthy();
    expect(within(deliverySection).getByText("日本 → ブラジル 6〜8日")).toBeTruthy();
    expect(
      within(deliverySection).getByText("合計目安 8〜12日で到着予定"),
    ).toBeTruthy();
    expect(
      within(deliverySection).getByRole("button", { name: /国際配送 · 通常便/ }),
    ).toBeTruthy();

    fireEvent.click(closeDetails);

    const showDetails = within(deliverySection).getByRole("button", {
      name: "配送詳細を見る",
    });
    expect(showDetails.getAttribute("aria-expanded")).toBe("false");
    expect(within(deliverySection).getByText("通常配送")).toBeTruthy();
    expect(within(deliverySection).getByText("8〜12日")).toBeTruthy();
    expect(within(deliverySection).getByText("詳細を見る")).toBeTruthy();
    expect(within(deliverySection).queryByText("日本国内配送 2〜4日")).toBeNull();
    expect(within(deliverySection).queryByText("日本 → ブラジル 6〜8日")).toBeNull();

    fireEvent.click(showDetails);
    expect(
      within(deliverySection).getByRole("button", { name: "配送詳細を閉じる" }),
    ).toBeTruthy();
    expect(within(deliverySection).getByText("日本国内配送 2〜4日")).toBeTruthy();
    expect(deliverySection.textContent).not.toMatch(/AI|確認済み/);
  });

  it("keeps the approved order and payment reviews open by default and folds them in place", () => {
    window.history.replaceState(
      {},
      "",
      "/sazo-commerce-mock/?qa=1&view=checkout",
    );
    render(<CheckoutView dispatch={vi.fn()} items={items} />);

    const proposal = document.querySelector<HTMLElement>(
      '[data-checkout-mobile-proposal="figma-43-2"]',
    );
    expect(proposal).not.toBeNull();
    if (proposal === null) throw new Error("Missing approved mobile checkout proposal");

    const orderReview = within(proposal).getByTestId("checkout-order-review");
    const closeOrder = within(orderReview).getByRole("button", {
      name: "注文商品を閉じる",
    });
    expect(closeOrder.getAttribute("aria-expanded")).toBe("true");
    expect(within(orderReview).getByText("3点・販売元2件")).toBeTruthy();
    expect(within(orderReview).getByText("Nintendo Switch OLED")).toBeTruthy();
    expect(within(orderReview).getByText("ほか2点")).toBeTruthy();

    fireEvent.click(closeOrder);
    const showOrder = within(orderReview).getByRole("button", {
      name: "注文商品を見る",
    });
    expect(showOrder.getAttribute("aria-expanded")).toBe("false");
    expect(within(orderReview).queryByText("Nintendo Switch OLED")).toBeNull();
    expect(within(orderReview).getAllByRole("img", { hidden: true })).toHaveLength(3);

    fireEvent.click(showOrder);
    expect(
      within(orderReview).getByRole("button", { name: "注文商品を閉じる" }),
    ).toBeTruthy();

    const paymentReview = within(proposal).getByTestId("checkout-payment-review");
    const closePayment = within(paymentReview).getByRole("button", {
      name: "支払い方法を閉じる",
    });
    expect(closePayment.getAttribute("aria-expanded")).toBe("true");
    expect(
      within(paymentReview).getByRole("button", { name: "Pix すぐに支払い" }),
    ).toBeTruthy();
    expect(
      within(paymentReview).getByRole("button", {
        name: "クレジットカード Visa / Mastercard",
      }),
    ).toBeTruthy();

    fireEvent.click(closePayment);
    const showPayment = within(paymentReview).getByRole("button", {
      name: "支払い方法の詳細を見る",
    });
    expect(showPayment.getAttribute("aria-expanded")).toBe("false");
    expect(
      within(paymentReview).queryByRole("button", { name: "Pix すぐに支払い" }),
    ).toBeNull();

    fireEvent.click(showPayment);
    fireEvent.click(
      within(paymentReview).getByRole("button", {
        name: "クレジットカード Visa / Mastercard",
      }),
    );
    expect(
      within(paymentReview)
        .getByRole("button", { name: "クレジットカード Visa / Mastercard" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("does not expose synthetic delivery copy outside the exact QA checkout route", () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/");
    render(<CheckoutView dispatch={vi.fn()} items={items} />);

    expect(
      document.querySelector('[data-delivery-copy-source="synthetic-mock"]'),
    ).toBeNull();
    expect(screen.getByRole("button", { name: /国際配送 · 通常便/ })).toBeTruthy();
    expect(screen.queryByText("日本国内配送 2〜4日")).toBeNull();
  });

  it("shows the selected cart items, cross-border total, and fixed confirmation flow in BRL", () => {
    const dispatch = vi.fn();
    render(<CheckoutView dispatch={dispatch} items={items} />);

    expect(screen.getByRole("heading", { name: "購入手続き" })).toBeTruthy();
    expect(screen.getByText("Rakuten Japan 公式ストア")).toBeTruthy();
    expect(screen.getByText("Sony Japan 公式")).toBeTruthy();
    expect(screen.getAllByText("R$ 6,602").length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toContain("¥");

    fireEvent.click(screen.getByRole("button", { name: "注文を確定する" }));
    expect(screen.getByRole("heading", { name: "注文を受け付けました" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /注文・配送を見る/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "orders" });
  });

  it("changes address, coupon, delivery, payment, and opens a tax explanation", () => {
    const dispatch = vi.fn();
    render(<CheckoutView dispatch={dispatch} items={items} />);

    fireEvent.click(screen.getByRole("button", { name: /Tetsu Fujita/ }));
    expect(screen.getByRole("dialog", { name: "配送先を選択" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Rua dos Pinheiros 540/ }));
    expect(screen.getByText(/Rua dos Pinheiros 540/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /使えるクーポン/ }));
    expect(screen.getByRole("dialog", { name: "クーポンを選択" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /クーポンを使わない/ }));
    expect(screen.getAllByText("R$ 6,622").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /国際配送 · 通常便/ }));
    fireEvent.click(screen.getByRole("button", { name: /優先便/ }));
    expect(screen.getByText(/国際配送 · 優先便/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Pix/ }));
    fireEvent.click(screen.getByRole("button", { name: /クレジットカード/ }));
    expect(screen.getByText("Visa •••• 2048")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "税金の説明を表示" }));
    expect(screen.getByRole("dialog", { name: "税金の説明" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "確認しました" }));
  });
});
