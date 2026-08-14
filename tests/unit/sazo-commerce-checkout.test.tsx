// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckoutView } from "@/sazo-commerce/CheckoutView";

const items = [
  { productId: "jplanet-nintendo-switch-oled", option: "カラー: ホワイト", quantity: 1 },
  { productId: "jplanet-new-balance-9060", option: "サイズ: 27cm", quantity: 1 },
  { productId: "jplanet-sony-a7c-ii", option: "バリエーション: 本体のみ", quantity: 1 },
] as const;

afterEach(() => {
  cleanup();
});

describe("J-Planet checkout", () => {
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
