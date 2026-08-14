// @vitest-environment jsdom

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { HomeView } from "@/sazo-commerce/HomeView";
import { InterestedItemsRail } from "@/sazo-commerce/InterestedItemsRail";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import { getProductDetail, interestedProducts } from "@/sazo-commerce/fixtures";
import { createInitialSazoState } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("J-Planet interested items fixtures", () => {
  it("keeps the five source products in the captured order", () => {
    expect(
      interestedProducts.map(({ id, name, price }) => ({ id, name, price })),
    ).toEqual([
      {
        id: "interested-nike-rope",
        name: "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
        price: "¥3,339",
      },
      {
        id: "interested-nike-mind",
        name: "Nike Mind 001 Black Chrome",
        price: "¥17,432",
      },
      {
        id: "interested-sprint-sister",
        name: "[インフルエンサーPick]スプリントシスターW - [リザーロック：オーシャンキューブ：ダークシンダー：セール / IR5693-256]",
        price: "¥12,803",
      },
      {
        id: "interested-meat-keyring",
        name: "肉ラバーかわいいギフトおいしい肉キリング役に立たない無駄な面白い人形動物キーホルダー",
        price: "¥1,048",
      },
      {
        id: "interested-duck-cushion",
        name: "アヒル人形睡眠モチ大型抱擁者クッション動物ぬいぐるみアヒル人形かわいい大型大王小さな巨大動物ボディ",
        price: "¥1,651",
      },
    ]);
  });

  it("ships every interested-item image locally and resolves a mock detail", () => {
    for (const product of interestedProducts) {
      expect(product.image).toMatch(/^\/sazo-commerce\/interested-items\/\d{2}\.webp$/);
      expect(existsSync(resolve(`public${product.image}`))).toBe(true);
      expect(getProductDetail(product.id).product).toEqual(product);
    }
  });
});

describe("J-Planet interested item card", () => {
  it("renders the compact source identity without losing card interactions", async () => {
    const i18n = await createI18n("ja");
    const onOpen = vi.fn();
    const product = interestedProducts[0];
    expect(product).toBeDefined();
    if (product === undefined) {
      throw new Error("Expected the interested-items fixture to include a product");
    }
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <ProductCard onOpen={onOpen} product={product} variant="interest" />
      </I18nextProvider>,
    );
    const card = container.querySelector('[data-variant="interest"]');

    expect(card).not.toBeNull();
    expect(card?.querySelector(".sazo-product-brand")).toBeNull();
    expect(
      card?.querySelector<HTMLImageElement>(".sazo-product-source-icon")?.src,
    ).toContain("/sazo-commerce/interested-items/source-11st.png");
    expect(card?.querySelector(".sazo-product-title-row h3")?.textContent).toBe(
      product.name,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: `商品詳細を開く: ${product.name}`,
      }),
    );
    expect(onOpen).toHaveBeenCalledWith(product.id);

    const favorite = screen.getByRole("button", {
      name: `${product.name}をお気に入りに追加`,
    });
    fireEvent.click(favorite);
    expect(favorite.getAttribute("aria-pressed")).toBe("true");
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("J-Planet interested items rail", () => {
  it("keeps the interested rail out of the home feed", async () => {
    const i18n = await createI18n("ja");
    const dispatch = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={dispatch} state={createInitialSazoState()} />
      </I18nextProvider>,
    );
    const children = Array.from(
      container.querySelector("[data-home-view]")?.children ?? [],
    );
    const heroIndex = children.findIndex((child) => child.classList.contains("sazo-hero"));
    const interestedIndex = children.findIndex((child) =>
      child.classList.contains("sazo-interested-items"),
    );

    expect(heroIndex).toBe(0);
    expect(interestedIndex).toBe(-1);
    expect(screen.queryByRole("heading", { name: "気になっているアイテム" })).toBeNull();
    expect(container.querySelectorAll('[data-variant="interest"]')).toHaveLength(0);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("scrolls one card and wraps to the start with reduced-motion support", async () => {
    const i18n = await createI18n("ja");
    const matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: matchMedia,
    });
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <InterestedItemsRail dispatch={() => undefined} />
      </I18nextProvider>,
    );
    const track = screen.getByTestId("interested-items-track");
    const firstCard = track.querySelector<HTMLElement>(".sazo-product-card");

    if (firstCard === null) {
      throw new Error("Expected the interested-items rail to include a product card");
    }

    Object.defineProperties(track, {
      clientWidth: { configurable: true, value: 1_140 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollWidth: { configurable: true, value: 1_430 },
    });
    vi.spyOn(firstCard, "getBoundingClientRect").mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 276,
      top: 0,
      width: 276,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const scrollTo = vi.fn(({ left }: ScrollToOptions) => {
      track.scrollLeft = left ?? 0;
    });
    Object.defineProperty(track, "scrollTo", { configurable: true, value: scrollTo });
    const next = screen.getByRole("button", { name: "次の商品を表示" });

    fireEvent.click(next);
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", left: 290 });

    track.scrollLeft = 290;
    fireEvent.click(next);
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", left: 0 });

    matchMedia.mockReturnValue({ matches: true });
    fireEvent.click(next);
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "auto", left: 290 });
    expect(container.querySelector(".sazo-interested-items-next svg")).not.toBeNull();
  });

  it("falls back to smooth scrolling when matchMedia is unavailable", async () => {
    const i18n = await createI18n("ja");
    const matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");

    Reflect.deleteProperty(window, "matchMedia");
    expect("matchMedia" in window).toBe(false);

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <InterestedItemsRail dispatch={() => undefined} />
      </I18nextProvider>,
    );
    const track = screen.getByTestId("interested-items-track");
    const firstCard = track.querySelector<HTMLElement>(".sazo-product-card");

    if (firstCard === null) {
      throw new Error("Expected the interested-items rail to include a product card");
    }

    Object.defineProperties(track, {
      clientWidth: { configurable: true, value: 1_140 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollWidth: { configurable: true, value: 1_430 },
    });
    vi.spyOn(firstCard, "getBoundingClientRect").mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 276,
      top: 0,
      width: 276,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const scrollTo = vi.fn();
    Object.defineProperty(track, "scrollTo", { configurable: true, value: scrollTo });

    fireEvent.click(screen.getByRole("button", { name: "次の商品を表示" }));

    expect(scrollTo).toHaveBeenCalledWith({ behavior: "smooth", left: 290 });

    if (matchMediaDescriptor !== undefined) {
      Object.defineProperty(window, "matchMedia", matchMediaDescriptor);
    }
    expect(container.querySelector(".sazo-interested-items-next")).not.toBeNull();
  });
});
