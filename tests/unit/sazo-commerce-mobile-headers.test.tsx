// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { MyPageView } from "@/sazo-commerce/AccountViews";
import { CategoriesView } from "@/sazo-commerce/DirectoryViews";
import {
  JplanetBrandDetailView,
  JplanetBrandsView,
} from "@/sazo-commerce/JplanetBrandViews";
import { createInitialSazoState, type SazoAction } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
});

function installMobileViewport() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === "(max-width: 767px)",
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  });
}

async function renderWithI18n(element: React.ReactNode) {
  const i18n = await createI18n("ja");
  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

describe("mobile content header unification", () => {
  it("uses the compact home-derived shell for the category directory", async () => {
    installMobileViewport();
    const dispatch = vi.fn<(action: SazoAction) => void>();

    const { container } = await renderWithI18n(
      <CategoriesView
        dispatch={dispatch}
        state={{ ...createInitialSazoState(), view: "categories" }}
      />,
    );

    const header = container.querySelector<HTMLElement>(".sazo-unified-mobile-header");
    expect(header).not.toBeNull();
    if (header === null) throw new Error("Unified category header was not rendered");
    expect(header.classList.contains("sazo-unified-mobile-header")).toBe(true);
    expect(
      within(header)
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["ホームに戻る", "商品・カテゴリーを検索", "カート"]);
    expect(within(header).queryByRole("button", { name: "商品を共有" })).toBeNull();
    expect(within(header).queryByRole("button", { name: "商品メニュー" })).toBeNull();

    fireEvent.click(within(header).getByRole("button", { name: "商品・カテゴリーを検索" }));
    fireEvent.click(within(header).getByRole("button", { name: "カート" }));
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: "navigate", view: "agent-hub" });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: "navigate", view: "cart" });
  });

  it.each([
    ["brands", JplanetBrandsView, "ブランド・商品を検索"],
    ["brand-detail", JplanetBrandDetailView, "ブランド名・商品名を検索"],
  ] as const)("removes the redundant Home action from the %s header", async (_view, View, searchName) => {
    const dispatch = vi.fn<(action: SazoAction) => void>();
    const state = {
      ...createInitialSazoState(),
      brandLoading: false,
      view: _view,
    };

    const { container } = render(<View dispatch={dispatch} state={state} />);

    const header = container.querySelector<HTMLElement>(".sazo-unified-mobile-header");
    expect(header).not.toBeNull();
    if (header === null) throw new Error("Unified brand header was not rendered");
    expect(header.classList.contains("sazo-unified-mobile-header")).toBe(true);
    expect(within(header).getByRole("searchbox", { name: searchName })).toBeTruthy();
    expect(within(header).queryByRole("button", { name: "ホーム" })).toBeNull();
    expect(within(header).getByRole("button", { name: "カート" })).toBeTruthy();
  });

  it("keeps cart and purchase help as the two My Page actions", async () => {
    const dispatch = vi.fn<(action: SazoAction) => void>();
    const { container } = await renderWithI18n(<MyPageView dispatch={dispatch} />);

    const header = container.querySelector<HTMLElement>(".sazo-unified-mobile-header");
    expect(header).not.toBeNull();
    if (header === null) throw new Error("Unified My Page header was not rendered");
    expect(header.classList.contains("sazo-unified-mobile-header")).toBe(true);
    expect(within(header).getByRole("button", { name: "カート" })).toBeTruthy();
    fireEvent.click(within(header).getByRole("button", { name: "購入について相談" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "open-chat" });
  });
});
