// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/sazo-commerce-mock/");
});

async function renderAgentView() {
  const i18n = await createI18n("ja");

  return render(
    <I18nextProvider i18n={i18n}>
      <SazoCommercePage />
    </I18nextProvider>,
  );
}

describe("mobile image product identification", () => {
  it("shows one closest result and an image-focused candidate rail without purchase claims", async () => {
    window.history.replaceState(
      {},
      "",
      "/sazo-commerce-mock/?qa=1&view=agent-image-resolution",
    );
    const { container } = await renderAgentView();

    expect(
      screen.getByRole("heading", { name: "画像に近い商品を見つけました" }),
    ).toBeTruthy();
    expect(screen.getByRole("img", { name: "送った画像" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "最も近い商品" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "その他の候補" })).toBeTruthy();
    expect(container.querySelectorAll("[data-image-search-candidate]")).toHaveLength(5);
    expect(screen.queryByText(/最安値/)).toBeNull();
    expect(screen.queryByText(/購入先比較/)).toBeNull();
    expect(screen.queryByText(/R\$/)).toBeNull();
    expect(container.querySelector(".sazo-image-resolution-back")).toBeNull();
  });

  it("opens the selected New Balance through its mobile product-detail route", async () => {
    window.history.replaceState(
      {},
      "",
      "/sazo-commerce-mock/?qa=1&view=agent-image-resolution",
    );
    const { container } = await renderAgentView();

    const [primaryCandidate] = screen.getAllByRole("button", {
      name: "New Balance 9060 ホワイト／グリーンを選ぶ",
    });
    expect(primaryCandidate).toBeTruthy();
    fireEvent.click(primaryCandidate!);

    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "product",
    );
    expect(screen.getByTestId("jplanet-image-search-new-balance-detail")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "New Balance 9060" })).toBeTruthy();
    expect(screen.getByText("New Balance Japan 候補")).toBeTruthy();
    expect(screen.getByText("R$ 748")).toBeTruthy();
    expect(screen.getByText("8,600件販売")).toBeTruthy();
    expect(screen.getByRole("region", { name: "通常日本商品" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "通関配送情報" })).toBeTruthy();
    expect(screen.getByText("元ページの商品レビュー")).toBeTruthy();
    expect(screen.getByText("商品仕様")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "商品説明" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "購入者レビュー" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "一緒に検討されている商品" })).toBeTruthy();
    expect(screen.getByLabelText("画像 1 / 3")).toBeTruthy();
    expect(screen.queryByText("Nintendo Switch Proコントローラー")).toBeNull();
  });

  it("routes the retired mobile agent hub to the unified AI search", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=agent-hub");
    const { container } = await renderAgentView();

    expect(container.querySelector("[data-ai-search-view]")).not.toBeNull();
    expect(screen.getByRole("search", { name: "AI検索" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "最近の検索" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "欲しい商品を、J-Planetに相談" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "今、人気の検索" })).toBeTruthy();
    expect(container.querySelector("[data-mobile-agent-hub]")).toBeNull();
  });

  it("keeps URL submissions on the existing direct product route", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=agent-hub");
    const { container } = await renderAgentView();
    const input = container.querySelector<HTMLInputElement>(
      "[data-ai-search-input]",
    );
    const form = container.querySelector<HTMLFormElement>(
      "form.sazo-ai-search-form",
    );

    expect(input).toBeTruthy();
    expect(form).toBeTruthy();
    if (input === null || form === null) return;

    fireEvent.change(input, { target: { value: "https://www.rakuten.co.jp/item/mock" } });
    fireEvent.submit(form);

    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "product",
    );
  });

  it("keeps product-name submission on the existing search flow until an image is selected", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=agent-hub");
    const { container } = await renderAgentView();
    const input = container.querySelector<HTMLInputElement>(
      "[data-ai-search-input]",
    );
    const form = container.querySelector<HTMLFormElement>(
      "form.sazo-ai-search-form",
    );

    expect(input).toBeTruthy();
    expect(form).toBeTruthy();
    if (input === null || form === null) return;

    fireEvent.change(input, { target: { value: "白いスニーカー" } });
    fireEvent.submit(form);

    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "ai-search",
    );
    expect(container.querySelector("[data-ai-search-results]")).not.toBeNull();
    expect(
      screen.queryByRole("heading", { name: "画像に近い商品を見つけました" }),
    ).toBeNull();
  });
});
