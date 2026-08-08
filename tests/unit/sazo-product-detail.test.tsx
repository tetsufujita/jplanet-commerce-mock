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
import { getProductDetail, products } from "@/sazo-commerce/fixtures";

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

    const initialHeroForm = document.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );

    if (initialHeroForm === null) {
      throw new Error("Missing initial hero purchase form");
    }

    fireEvent.click(screen.getByRole("button", { name: "画像2を表示" }));
    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));
    fireEvent.change(within(initialHeroForm).getByLabelText("商品オプション"), {
      target: { value: "ギフト包装" },
    });
    fireEvent.change(within(initialHeroForm).getByLabelText("ご要望"), {
      target: { value: "赤い包装を希望" },
    });
    fireEvent.click(
      within(initialHeroForm).getByRole("checkbox", { name: "画像にチェック" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "注意事項" }));

    const initialCartButton = within(initialHeroForm).getByRole("button", {
      name: "カートに入れる",
    });

    fireEvent.click(initialCartButton);
    expect(within(initialHeroForm).getByRole("status").textContent).toContain(
      "カートに追加しました",
    );

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

    const nextHeroForm = document.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );

    if (nextHeroForm === null) {
      throw new Error("Missing next hero purchase form");
    }

    const option =
      within(nextHeroForm).getByLabelText<HTMLSelectElement>("商品オプション");
    const request = within(nextHeroForm).getByLabelText<HTMLTextAreaElement>("ご要望");
    const imageCheck = within(nextHeroForm).getByRole<HTMLInputElement>("checkbox", {
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
    expect(within(nextHeroForm).getByTestId("product-total-value").textContent).toBe("0");

    const nextCartButton = within(nextHeroForm).getByRole("button", {
      name: "カートに入れる",
    });

    fireEvent.click(nextCartButton);
    expect(within(nextHeroForm).getByRole("alert").textContent).toContain(
      "商品オプションを選択",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("J-Planet product detail experience", () => {
  it("renders a marketplace badge and original-page link for every product", async () => {
    const detail = getProductDetail("p01");

    await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId={detail.product.id} />,
    );

    const sourceLink = screen.getByRole("link", { name: /元のページへ/ });
    expect(sourceLink.getAttribute("href")).toBe(
      "https://example.com/jplanet/source/p01",
    );
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("rel")).toContain("noreferrer");
    expect(screen.getByTestId("product-source-badge").textContent).toBe("11D");
    expect(screen.getByText("J-Planet直輸入商品")).toBeTruthy();
    expect(screen.getByText("ご注文日から平均9日")).toBeTruthy();
  });

  it("resolves deterministic commerce metadata for generated details", () => {
    const detail = getProductDetail("p02");

    expect(detail.originalUrl).toBe("https://example.com/jplanet/source/p02");
    expect(detail.unitPriceAmount).toBe(4012);
    expect(detail.localDistributionFeeAmount).toBe(350);
    expect(detail.purchaseTypeId).toBe("direct");
    expect(detail.deliveryEstimateDays).toBe(9);
    expect(detail.recommendationIds).toHaveLength(6);
    expect(new Set(detail.recommendationIds)).toHaveProperty("size", 6);
    expect(detail.recommendationIds).not.toContain(detail.product.id);
  });

  it("shares one purchase state across hero and lower checkout forms", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const forms = Array.from(
      container.querySelectorAll<HTMLFormElement>("form[data-product-purchase-form]"),
    );

    expect(forms).toHaveLength(2);
    expect(container.querySelectorAll(".sazo-product-mobile-purchase")).toHaveLength(1);

    const heroForm = forms[0];
    const stickyForm = forms[1];

    if (heroForm === undefined || stickyForm === undefined) {
      throw new Error("Missing synchronized purchase forms");
    }

    const heroSelect = within(heroForm).getByLabelText("商品オプション");
    const stickySelect = within(stickyForm).getByLabelText("商品オプション");
    fireEvent.change(heroSelect, { target: { value: "標準" } });
    expect((stickySelect as HTMLSelectElement).value).toBe("標準");

    fireEvent.click(within(stickyForm).getByRole("button", { name: "数量を増やす" }));
    expect(
      screen.getAllByTestId("product-quantity").map((node) => node.textContent),
    ).toEqual(["2", "2"]);
    expect(
      screen.getAllByTestId("product-total-value").map((node) => node.textContent),
    ).toEqual(["¥7,948", "¥7,948"]);

    const heroRequest = within(heroForm).getByLabelText<HTMLTextAreaElement>("ご要望");
    const stickyRequest =
      within(stickyForm).getByLabelText<HTMLTextAreaElement>("ご要望");
    fireEvent.change(stickyRequest, {
      target: { value: "ブラジル配送前に外箱を補強してください" },
    });
    expect(heroRequest.value).toBe("ブラジル配送前に外箱を補強してください");

    const heroImageCheck = within(heroForm).getByRole<HTMLInputElement>("checkbox", {
      name: "画像にチェック",
    });
    const stickyImageCheck = within(stickyForm).getByRole<HTMLInputElement>("checkbox", {
      name: "画像にチェック",
    });
    fireEvent.click(stickyImageCheck);
    expect(heroImageCheck.checked).toBe(true);
    expect(stickyImageCheck.checked).toBe(true);

    const heroGuideButton = within(heroForm).getByRole("button", {
      name: "ご要望の書き方",
    });
    const stickyGuideButton = within(stickyForm).getByRole("button", {
      name: "ご要望の書き方",
    });
    expect(heroGuideButton.getAttribute("aria-controls")).toBe(
      "sazo-product-request-guide-hero",
    );
    expect(stickyGuideButton.getAttribute("aria-controls")).toBe(
      "sazo-product-request-guide-sticky",
    );
    fireEvent.click(stickyGuideButton);
    expect(heroGuideButton.getAttribute("aria-expanded")).toBe("true");
    expect(stickyGuideButton.getAttribute("aria-expanded")).toBe("true");
    expect(heroRequest.getAttribute("aria-describedby")).toBe(
      "sazo-product-request-guide-hero",
    );
    expect(stickyRequest.getAttribute("aria-describedby")).toBe(
      "sazo-product-request-guide-sticky",
    );
    expect(within(heroForm).getByText(/色・サイズ・仕様/).id).toBe(
      "sazo-product-request-guide-hero",
    );
    expect(within(stickyForm).getByText(/色・サイズ・仕様/).id).toBe(
      "sazo-product-request-guide-sticky",
    );

    fireEvent.click(within(stickyForm).getByRole("button", { name: "選択を解除" }));
    expect((heroSelect as HTMLSelectElement).value).toBe("");
    expect((stickySelect as HTMLSelectElement).value).toBe("");
    expect(
      screen.getAllByTestId("product-total-value").map((node) => node.textContent),
    ).toEqual(["0", "0"]);
    fireEvent.change(heroSelect, { target: { value: "標準" } });
    expect(
      screen.getAllByTestId("product-quantity").map((node) => node.textContent),
    ).toEqual(["1", "1"]);

    const ids = Array.from(container.querySelectorAll("[id]"), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("focuses the hero option after an invalid mobile purchase action", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const heroForm = container.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );
    const mobileActions = container.querySelector<HTMLElement>(
      ".sazo-product-mobile-purchase",
    );

    if (heroForm === null || mobileActions === null) {
      throw new Error("Missing hero form or mobile purchase actions");
    }

    const heroOption = within(heroForm).getByLabelText("商品オプション");
    fireEvent.click(
      within(mobileActions).getByRole("button", { name: "カートに入れる" }),
    );

    expect(document.activeElement).toBe(heroOption);
  });

  it("announces shared purchase feedback once while rendering it in both panels", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const forms = Array.from(
      container.querySelectorAll<HTMLFormElement>("form[data-product-purchase-form]"),
    );
    const stickyForm = forms[1];

    if (stickyForm === undefined) {
      throw new Error("Missing sticky purchase form");
    }

    const stickyOption = within(stickyForm).getByLabelText("商品オプション");
    fireEvent.click(within(stickyForm).getByRole("button", { name: "カートに入れる" }));

    const visualFeedback = Array.from(
      container.querySelectorAll<HTMLElement>(".sazo-product-detail-feedback"),
      (node) => node.textContent,
    );
    expect(visualFeedback).toEqual([
      expect.stringContaining("商品オプションを選択"),
      expect.stringContaining("商品オプションを選択"),
    ]);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(document.activeElement).toBe(stickyOption);
  });

  it("updates the selected product quantity and deterministic total", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const heroForm = container.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );

    expect(container.querySelectorAll("form[data-product-purchase-form]")).toHaveLength(
      2,
    );
    expect(container.querySelectorAll(".sazo-product-mobile-purchase")).toHaveLength(1);

    if (heroForm === null) {
      throw new Error("Missing hero purchase form");
    }

    expect(within(heroForm).getByTestId("product-total-value").textContent).toBe("0");

    fireEvent.change(within(heroForm).getByLabelText("商品オプション"), {
      target: { value: "標準" },
    });
    expect(
      container.querySelector(".sazo-product-detail-selected-product")?.tagName,
    ).toBe("DIV");
    expect(within(heroForm).getByTestId("product-total-value").textContent).toBe(
      "¥4,149",
    );

    fireEvent.click(within(heroForm).getByRole("button", { name: "数量を増やす" }));
    expect(within(heroForm).getByTestId("product-quantity").textContent).toBe("2");
    expect(within(heroForm).getByTestId("product-total-value").textContent).toBe(
      "¥7,948",
    );

    fireEvent.click(within(heroForm).getByRole("button", { name: "数量を減らす" }));
    expect(within(heroForm).getByTestId("product-quantity").textContent).toBe("1");
  });

  it("clamps quantity at one and resets quantity and total when selection is removed", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const heroForm = container.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );

    if (heroForm === null) {
      throw new Error("Missing hero purchase form");
    }

    const option = within(heroForm).getByLabelText<HTMLSelectElement>("商品オプション");
    fireEvent.change(option, { target: { value: "標準" } });

    fireEvent.click(within(heroForm).getByRole("button", { name: "数量を減らす" }));
    expect(within(heroForm).getByTestId("product-quantity").textContent).toBe("1");

    fireEvent.click(within(heroForm).getByRole("button", { name: "数量を増やす" }));
    fireEvent.click(within(heroForm).getByRole("button", { name: "選択を解除" }));
    expect(option.value).toBe("");
    expect(within(heroForm).getByTestId("product-total-value").textContent).toBe("0");

    fireEvent.change(option, { target: { value: "標準" } });
    expect(within(heroForm).getByTestId("product-quantity").textContent).toBe("1");
  });

  it("associates the request guide with the textarea only while expanded", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const heroForm = container.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );

    if (heroForm === null) {
      throw new Error("Missing hero purchase form");
    }

    const request = within(heroForm).getByLabelText<HTMLTextAreaElement>("ご要望");
    const guideButton = within(heroForm).getByRole("button", {
      name: "ご要望の書き方",
    });
    expect(request.getAttribute("aria-describedby")).toBeNull();

    fireEvent.click(guideButton);
    expect(guideButton.getAttribute("aria-expanded")).toBe("true");
    expect(request.getAttribute("aria-describedby")).toBe(
      "sazo-product-request-guide-hero",
    );
    expect(within(heroForm).getByText(/色・サイズ・仕様/).id).toBe(
      "sazo-product-request-guide-hero",
    );

    fireEvent.click(guideButton);
    expect(guideButton.getAttribute("aria-expanded")).toBe("false");
    expect(request.getAttribute("aria-describedby")).toBeNull();
  });

  it("renders the complete Japan-to-Brazil information hierarchy", async () => {
    const product = products[0];

    if (product === undefined) {
      throw new Error("Missing J-Planet product test fixture");
    }

    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );

    expect(screen.getByRole("heading", { name: product.name })).toBeTruthy();
    expect(screen.getAllByText("日本の販売サイトから直接購入")).toHaveLength(2);
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

  it("places recommendations before the commerce grid and renders the six-stage delivery flow", async () => {
    const detail = getProductDetail("p01");
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );

    const commerceGrid = container.querySelector(".sazo-product-detail-commerce-grid");
    const checkout = container.querySelector(".sazo-product-detail-checkout-rail");
    const leftFlow = container.querySelector(".sazo-product-detail-left-flow");
    const recommendation = container.querySelector<HTMLElement>(
      ".sazo-product-detail-recommendations",
    );
    const campaign = screen.getByRole("region", {
      name: "J-Planet 日本からブラジルへ",
    });

    expect(commerceGrid).not.toBeNull();
    expect(checkout).not.toBeNull();
    expect(leftFlow).not.toBeNull();
    expect(recommendation?.nextElementSibling).toBe(commerceGrid);
    expect(
      leftFlow?.firstElementChild?.classList.contains("sazo-product-detail-information"),
    ).toBe(true);
    expect(
      commerceGrid?.children[0]?.classList.contains("sazo-product-detail-checkout-rail"),
    ).toBe(true);
    expect(commerceGrid?.children[1]).toBe(leftFlow);
    expect(Array.from(leftFlow?.children ?? [], (node) => node.className)).toEqual([
      expect.stringContaining("sazo-product-detail-information"),
      expect.stringContaining("sazo-product-campaign"),
      expect.stringContaining("sazo-product-detail-review"),
      expect.stringContaining("sazo-product-detail-cautions"),
      expect.stringContaining("sazo-product-detail-benefits"),
    ]);

    const stages = Array.from(container.querySelectorAll(".sazo-product-order-flow li"));
    expect(stages).toHaveLength(6);
    expect(stages.map((stage) => stage.getAttribute("data-state"))).toEqual([
      "complete",
      "complete",
      "current",
      "pending",
      "pending",
      "pending",
    ]);
    expect(stages.map((stage) => stage.getAttribute("aria-current"))).toEqual([
      null,
      null,
      "step",
      null,
      null,
      null,
    ]);
    expect(
      stages.map(
        (stage) => stage.querySelector(".sazo-visually-hidden")?.textContent ?? null,
      ),
    ).toEqual(["完了", "完了", "現在のステップ", "未完了", "未完了", "未完了"]);
    expect(
      screen.getByRole("heading", { name: "注文配送の流れ 一目で見る" }),
    ).toBeTruthy();
    expect(screen.getByText("一目で見る")).toBeTruthy();
    expect(detail.recommendationIds).toHaveLength(6);
    expect(new Set(detail.recommendationIds)).toHaveProperty("size", 6);
    expect(detail.recommendationIds).not.toContain(detail.product.id);
    if (recommendation === null) {
      throw new Error("Missing product recommendation region");
    }

    expect(
      within(recommendation).getAllByRole("button", { name: /商品詳細を開く/ }),
    ).toHaveLength(6);
    expect(within(recommendation).getByRole("button", { name: "次の商品" })).toBeTruthy();
    expect(campaign.textContent).toContain("日本の販売サイトから直接購入");
    expect(campaign.textContent).toContain("ブラジルへお届け");
    expect(campaign.textContent).not.toMatch(/SAZO|韓国|KOREA|TO JAPAN/i);
  });

  it("scrolls the recommendation rail by most of its visible width", async () => {
    await renderWithI18n(<ProductDetailView dispatch={vi.fn()} productId="p01" />);

    const recommendation = screen.getByRole("region", {
      name: "この商品はいかがですか？",
    });
    const track = recommendation.querySelector<HTMLDivElement>(
      ".sazo-product-detail-recommendation-track",
    );

    if (track === null) {
      throw new Error("Missing product recommendation track");
    }

    const scrollBy = vi.fn();
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 1000 });
    track.scrollBy = scrollBy;
    fireEvent.click(within(recommendation).getByRole("button", { name: "次の商品" }));

    expect(scrollBy).toHaveBeenCalledWith({
      behavior: "smooth",
      left: 820,
    });
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

    const forms = Array.from(
      container.querySelectorAll<HTMLFormElement>("form[data-product-purchase-form]"),
    );
    const heroForm = forms[0];
    const stickyForm = forms[1];

    expect(forms).toHaveLength(2);
    expect(screen.getAllByRole("combobox", { name: "商品オプション" })).toHaveLength(2);

    if (heroForm === undefined || stickyForm === undefined) {
      throw new Error("Missing synchronized purchase forms");
    }

    expect(within(heroForm).getByTestId("product-unit-price").textContent).toBe(
      product.price,
    );
    expect(within(heroForm).getByTestId("product-total-value").textContent).toBe("0");

    const stickyCartButton = within(stickyForm).getByRole("button", {
      name: "カートに入れる",
    });
    const stickyOption = within(stickyForm).getByLabelText("商品オプション");
    fireEvent.click(stickyCartButton);
    expect(
      stickyForm.querySelector(".sazo-product-detail-feedback")?.textContent,
    ).toContain("商品オプションを選択");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(document.activeElement).toBe(stickyOption);

    fireEvent.change(within(heroForm).getByLabelText("商品オプション"), {
      target: { value: "標準" },
    });
    expect(within(heroForm).getByTestId("product-unit-price").textContent).toBe(
      product.price,
    );
    expect(within(heroForm).getByTestId("product-total-value").textContent).toBe(
      "¥4,149",
    );

    const heroCartButton = within(heroForm).getByRole("button", {
      name: "カートに入れる",
    });
    fireEvent.click(heroCartButton);
    expect(within(heroForm).getByRole("status").textContent).toContain(
      "カートに追加しました",
    );

    const mobileActions = container.querySelector<HTMLElement>(
      ".sazo-product-mobile-purchase",
    );

    if (mobileActions === null) {
      throw new Error("Missing mobile buy-now button");
    }

    fireEvent.click(within(mobileActions).getByRole("button", { name: "今すぐ買う" }));
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

  it("keeps the six delivery stages only inside the information tab", async () => {
    await renderWithI18n(<ProductDetailView dispatch={vi.fn()} productId="p01" />);

    const informationTab = screen.getByRole("tab", { name: "商品情報" });
    const cautionTab = screen.getByRole("tab", { name: "注意事項" });
    const informationPanel = screen.getByRole("tabpanel");
    expect(informationTab.getAttribute("aria-selected")).toBe("true");
    const orderList = within(informationPanel).getByRole("list", {
      name: "注文からお届けまで",
    });
    expect(orderList.querySelectorAll("li[data-stage]")).toHaveLength(6);
    expect(within(informationPanel).getByText("注文受付")).toBeTruthy();
    expect(within(informationPanel).getByText("日本で購入")).toBeTruthy();
    expect(within(informationPanel).getByText("日本倉庫へ到着")).toBeTruthy();
    expect(within(informationPanel).getByText("検品完了")).toBeTruthy();
    expect(within(informationPanel).getByText("国際配送・通関")).toBeTruthy();
    expect(within(informationPanel).getByText("ブラジルへお届け")).toBeTruthy();

    fireEvent.keyDown(informationTab, { key: "ArrowRight" });
    expect(cautionTab.getAttribute("aria-selected")).toBe("true");
    expect(
      within(screen.getByRole("tabpanel")).queryByRole("list", {
        name: "注文からお届けまで",
      }),
    ).toBeNull();
  });

  it("renders product-detail interface copy from the active locale", async () => {
    await renderWithI18n(<ProductDetailView dispatch={vi.fn()} productId="p01" />, "en");

    expect(screen.getAllByText("Purchase directly from Japanese retailers")).toHaveLength(
      2,
    );
    expect(screen.getByRole("tab", { name: "Product information" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Buy now" })).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Why J-Planet?" })).toBeTruthy();
  });

  it.each([
    ["ja", ["完了", "完了", "現在のステップ", "未完了", "未完了", "未完了"]],
    ["en", ["Completed", "Completed", "Current step", "Pending", "Pending", "Pending"]],
    [
      "pt-BR",
      ["Concluído", "Concluído", "Etapa atual", "Pendente", "Pendente", "Pendente"],
    ],
  ])("localizes accessible delivery status text for %s", async (locale, statuses) => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
      locale,
    );
    const stages = Array.from(container.querySelectorAll(".sazo-product-order-flow li"));

    expect(
      stages.map(
        (stage) => stage.querySelector(".sazo-visually-hidden")?.textContent ?? null,
      ),
    ).toEqual(statuses);
    expect(
      stages.filter((stage) => stage.getAttribute("aria-current") === "step"),
    ).toHaveLength(1);
    expect(stages[2]?.getAttribute("aria-current")).toBe("step");
  });

  it("applies the vendored Noto Sans JP stack to product detail", () => {
    const css = readFileSync(join(process.cwd(), "src/sazo-commerce/sazo.css"), "utf8");

    expect(css).toMatch(
      /\.sazo-root \.sazo-product-detail\s*{[^}]*font-family:\s*"Noto Sans JP Variable",\s*"Hiragino Sans",\s*"Yu Gothic",\s*Meiryo,\s*sans-serif/s,
    );
  });
});
