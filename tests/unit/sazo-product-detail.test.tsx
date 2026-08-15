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
  vi.restoreAllMocks();
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
      name: /商品詳細を見る/,
    })[0];

    if (productOpenControl === undefined) {
      throw new Error("Missing product detail open control");
    }

    fireEvent.click(productOpenControl);
    expect(container.querySelector("[data-product-detail]")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
    ).toBeTruthy();
    expect(screen.getByText("R$ 429〜")).toBeTruthy();
    expect(screen.queryByText("¥6,900")).toBeNull();
    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: /NCT WISH エンシティウィッシュ/,
      }),
    ).toBeNull();
    // All in-app product links normalize to the J-Planet controller detail.
    // Its shared media header owns the back control at every breakpoint.
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(container.querySelector("[data-home-view]")).not.toBeNull();
  });

  it("normalizes a direct legacy product URL to the shared J-Planet controller detail", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    });
    window.history.replaceState(
      null,
      "",
      "/sazo-commerce-mock/?qa=1&view=product&product=p01",
    );
    const { container } = await renderWithI18n(<SazoCommercePage />);

    expect(container.querySelector("[data-testid='jplanet-controller-result']")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
    ).toBeTruthy();
    expect(screen.queryByText(/NCT WISH エンシティウィッシュ/)).toBeNull();
    expect(screen.queryByText("¥3,799")).toBeNull();
  });
});

describe("J-Planet product detail experience", () => {
  it("wires desktop purchase options to the shared cart and checkout actions", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    });
    const dispatch = vi.fn();
    await renderWithI18n(
      <ProductDetailView dispatch={dispatch} productId="jplanet-nintendo-pro-controller" />,
    );

    const controllerCommerceMeta = screen.getByTestId(
      "jplanet-desktop-controller-commerce-meta",
    );
    expect(within(controllerCommerceMeta).getByText("4.8")).toBeTruthy();
    expect(within(controllerCommerceMeta).getByText("864件のレビュー")).toBeTruthy();
    expect(within(controllerCommerceMeta).getByText("30mil+ 購入済み")).toBeTruthy();
    expect(within(controllerCommerceMeta).queryByText("Nintendo 公式")).toBeNull();
    expect(
      within(controllerCommerceMeta).getByRole("link", {
        name: "元ページを開く",
      }),
    ).toBeTruthy();

    const desktopPurchase = screen.getByTestId("jplanet-desktop-controller-purchase");
    fireEvent.click(within(desktopPurchase).getByRole("button", { name: "ホワイト 在庫あり" }));
    fireEvent.click(within(desktopPurchase).getByRole("button", { name: "PCで数量を増やす" }));
    fireEvent.click(
      within(desktopPurchase).getByRole("button", { name: "商品をカートに入れる" }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "add-to-cart",
      item: {
        option: "Proコントローラー / ホワイト",
        productId: "jplanet-nintendo-pro-controller",
        quantity: 2,
      },
    });
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "cart" });

    fireEvent.click(within(desktopPurchase).getByRole("button", { name: "商品を購入に進む" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "begin-checkout",
      items: [
        {
          option: "Proコントローラー / ホワイト",
          productId: "jplanet-nintendo-pro-controller",
          quantity: 2,
        },
      ],
    });
  });

  it("renders the Nintendo reference detail on a mobile viewport and keeps its core actions live", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) => ({
        addEventListener: vi.fn(),
        matches: query.includes("max-width"),
        removeEventListener: vi.fn(),
      }),
    });
    const dispatch = vi.fn();

    await renderWithI18n(
      <ProductDetailView dispatch={dispatch} productId="jplanet-nintendo-pro-controller" />,
    );

    const mediaHeader = screen.getByTestId("jplanet-product-media-header");
    expect(mediaHeader.getAttribute("data-header-surface")).toBe("transparent");
    expect(screen.queryByRole("button", { name: "J-Planet ホーム" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "AI検索を開く" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "agent-hub" });

    expect(screen.queryByRole("button", { name: "チャット" })).toBeNull();
    expect(screen.queryByRole("button", { name: "画像から検索" })).toBeNull();
    expect(screen.queryByLabelText("商品画像を選択")).toBeNull();

    const openWindow = vi.spyOn(window, "open").mockImplementation(() => null);
    fireEvent.click(screen.getByRole("button", { name: "WhatsAppで共有" }));
    expect(openWindow).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\/\?text=/),
      "_blank",
      "noopener,noreferrer",
    );

    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    fireEvent.click(screen.getByRole("button", { name: "商品を共有" }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "商品メニュー" }));
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "商品URLをコピー" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "カート" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "cart" });

    const headerBox = mediaHeader as HTMLElement;
    const productInformation = screen.getByTestId("jplanet-product-information");
    vi.spyOn(headerBox, "getBoundingClientRect").mockReturnValue({ height: 56 } as DOMRect);
    vi.spyOn(productInformation, "getBoundingClientRect").mockReturnValue({ top: 57 } as DOMRect);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(mediaHeader.getAttribute("data-header-surface")).toBe("transparent");
    });
    vi.spyOn(productInformation, "getBoundingClientRect").mockReturnValue({ top: 56 } as DOMRect);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(mediaHeader.getAttribute("data-header-surface")).toBe("solid");
    });
    vi.spyOn(productInformation, "getBoundingClientRect").mockReturnValue({ top: 220 } as DOMRect);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(mediaHeader.getAttribute("data-header-surface")).toBe("transparent");
    });

    expect(
      screen.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
    ).toBeTruthy();
    expect(screen.queryByText("購入条件を確認中")).toBeNull();
    expect(screen.queryByText("限定ハイプラ")).toBeNull();
    expect(screen.queryByRole("button", { name: /バリアントを選択/ })).toBeNull();
    expect(screen.getByRole("button", { name: "ブラックを表示" })).toBeTruthy();
    const controllerMedia = document.querySelector(
      ".sazo-reference-nintendo-controller-media",
    );
    const controllerVariantRail = screen.getByTestId("jplanet-controller-variant-rail");
    expect(controllerMedia).not.toBeNull();
    expect(
      within(controllerMedia as HTMLElement).queryByRole("button", { name: "ブラックを表示" }),
    ).toBeNull();
    expect(controllerMedia?.compareDocumentPosition(controllerVariantRail)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(controllerVariantRail.textContent).toContain("3色のバリエーション");
    fireEvent.click(screen.getByRole("button", { name: "ホワイトを表示" }));
    expect(
      (controllerMedia as HTMLElement)
        .querySelector<HTMLImageElement>(".sazo-reference-nintendo-controller-hero")
        ?.getAttribute("src"),
    ).toBe("/sazo-commerce/reference/nintendo-pro-controller-white-v1.png");
    expect(screen.getByText("通常日本商品")).toBeTruthy();
    expect(screen.getByText("日本の素敵な商品をすぐにお届けします。")).toBeTruthy();
    expect(screen.queryByText("カラーを選ぶと、総額と到着予定を確定します")).toBeNull();
    expect(screen.getByText("R$ 429〜")).toBeTruthy();
    expect(screen.getByText("R$ 498")).toBeTruthy();
    expect(screen.getByText("-14%")).toBeTruthy();
    expect(screen.getByText("30mil+ 購入済み")).toBeTruthy();
    expect(
      within(screen.getByRole("region", { name: "価格情報" })).queryByText(
        "ブラジル到着総額",
      ),
    ).toBeNull();
    const saveController = screen.getByRole("button", { name: "お気に入りに追加" });
    expect(saveController.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(saveController);
    expect(
      screen.getByRole("button", { name: "お気に入りから削除" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }).compareDocumentPosition(
        screen.getByText("R$ 429〜"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("通関配送情報")).toBeTruthy();
    expect(screen.getByText("日本国内：1〜2日")).toBeTruthy();
    expect(screen.getByText("日本→ブラジル：7〜10日")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "購入エージェントの確認" })).toBeNull();
    const specificationButton = screen.getByRole("button", { name: "商品仕様を開く" });
    expect(specificationButton.textContent).toContain("Bluetooth / USB Type-C");
    fireEvent.click(specificationButton);
    const specificationSheet = screen.getByRole("dialog", { name: "商品仕様" });
    expect(specificationSheet.textContent).toContain("Nintendo Switch / Nintendo Switch OLED");
    expect(specificationSheet.textContent).toContain("約40時間");
    expect(specificationSheet.textContent).toContain("HAC-A-FSSKA");
    fireEvent.click(screen.getByRole("button", { name: "商品仕様を閉じる" }));
    expect(screen.queryByRole("dialog", { name: "商品仕様" })).toBeNull();

    expect(screen.getByRole("heading", { name: "商品説明" })).toBeTruthy();
    const description = document.querySelector(
      ".sazo-reference-nintendo-product-description-content",
    );
    expect(description?.getAttribute("data-expanded")).toBe("false");
    const expandDescription = screen.getByRole("button", { name: "商品説明をもっと見る" });
    fireEvent.click(expandDescription);
    expect(description?.getAttribute("data-expanded")).toBe("true");
    expect(screen.getByText("主な仕様")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Nintendo Switch Proコントローラー ブラックの正面" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Nintendo Switch Proコントローラー ブラックの正面を拡大",
      }),
    );
    expect(
      screen.getByRole("dialog", {
        name: "Nintendo Switch Proコントローラー ブラックの正面の拡大表示",
      }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "拡大画像を閉じる" }));
    fireEvent.click(screen.getByRole("button", { name: "商品説明を閉じる" }));
    expect(description?.getAttribute("data-expanded")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "配送・通関の詳細を開く" }));
    expect(screen.getByTestId("jplanet-delivery-detail")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "配送・通関の詳細" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "確認した内容" })).toBeTruthy();
    expect(screen.getByText("Rakuten Japan 公式ストアを確認")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(screen.getByTestId("jplanet-controller-result")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "カートに入れる" }));
    const controllerSheet = screen.getByRole("dialog", {
      name: "Proコントローラーをカートに入れる",
    });
    expect(within(controllerSheet).getByText("R$ 429")).toBeTruthy();
    expect(
      within(controllerSheet).getByRole("button", { name: /ブラック 在庫あり/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    const soldOutVariant = within(controllerSheet).getByRole("button", {
      name: /スプラトゥーン 売り切れ/,
    });
    expect((soldOutVariant as HTMLButtonElement).disabled).toBe(true);
    expect(soldOutVariant.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(
      within(controllerSheet).getByRole("button", { name: /ホワイト 在庫あり/ }),
    );
    fireEvent.click(within(controllerSheet).getByRole("button", { name: "数量を増やす" }));
    fireEvent.click(within(controllerSheet).getByRole("button", { name: "カートに入れる" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "add-to-cart",
      item: {
        option: "Proコントローラー / ホワイト",
        productId: "jplanet-nintendo-pro-controller",
        quantity: 2,
      },
    });
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "cart" });

    fireEvent.click(screen.getByRole("button", { name: "カートに入れる" }));
    expect(screen.getByRole("dialog", { name: "Proコントローラーをカートに入れる" })).toBeTruthy();
  });

  it("continues the retrieved product with reviews and recommendations in one scroll", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    });

    const dispatch = vi.fn();
    await renderWithI18n(
      <ProductDetailView dispatch={dispatch} productId="jplanet-nintendo-pro-controller" />,
    );

    expect(screen.getByTestId("jplanet-controller-result")).toBeTruthy();
    expect(screen.queryByTestId("jplanet-inline-delivery-detail")).toBeNull();
    expect(screen.getByTestId("jplanet-inline-followup")).toBeTruthy();
    expect(screen.getByTestId("jplanet-related-product-list").querySelectorAll("button")).toHaveLength(
      10,
    );
    expect(screen.queryByText("購入条件を確認中")).toBeNull();
    expect(screen.queryByText("限定ハイプラ")).toBeNull();
    expect(screen.queryByText("J-Planetの到着実績")).toBeNull();
    expect(screen.queryByText("この商品をブラジルへ届けた記録")).toBeNull();
    expect(screen.queryByText("確認済みの購入のみ")).toBeNull();
    expect(screen.queryByText("配送・通関の詳細を見る")).toBeNull();
    expect(screen.getByTestId("jplanet-product-review-preview")).toBeTruthy();
    expect(screen.getByText("128件のレビュー")).toBeTruthy();
    expect(screen.getAllByRole("img", { name: /のレビュー写真/ })).toHaveLength(3);
    expect(screen.getByText("通常日本商品")).toBeTruthy();
    expect(screen.getByText("日本の素敵な商品をすぐにお届けします。")).toBeTruthy();
    expect(screen.getByRole("button", { name: "配送・通関の詳細を開く" })).toBeTruthy();
    expect(screen.queryByText("総額に含まれるもの")).toBeNull();
    expect(screen.queryByText("ブラジル到着総額に含まれます")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /ブラジル到着総額 R\$ 2,184 の内訳を見る/ }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "配送・通関の詳細を開く" }));
    const deliveryGuide = screen.getByTestId("jplanet-desktop-delivery-guide");
    expect(deliveryGuide).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "配送・通関に関するご案内" }),
    ).toBeTruthy();
    expect(screen.getByText("到着予定の目安")).toBeTruthy();
    expect(screen.getByText("日本での手配")).toBeTruthy();
    expect(screen.getByText("注文確定後 1〜2日")).toBeTruthy();
    expect(screen.getByText("日本 → ブラジル: 7〜10日")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "購入前に確認する事項" })).toBeTruthy();
    expect(screen.getByText("配送先・バリエーションごとに確認が必要です。")).toBeTruthy();
    expect(screen.getByText("送料・税金の内訳は、購入前に確認が必要です。")).toBeTruthy();
    expect(screen.queryByText("関税込み・国際送料を含む見込みです。")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "配送・通関のご案内を閉じる" }));
    expect(screen.queryByTestId("jplanet-desktop-delivery-guide")).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "すべてのレビューを見る" })[0]!);
    expect(screen.getByTestId("jplanet-product-reviews")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "商品レビュー" })).toBeTruthy();
    expect(screen.getByText("J-Planetで購入を確認したお客様の声")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "写真付き 36" }));
    expect(
      screen.getByRole("button", { name: "写真付き 36" }).getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.change(screen.getByRole("searchbox", { name: "レビューを検索" }), {
      target: { value: "Camila" },
    });
    expect(screen.getByText("Camila R.")).toBeTruthy();
    expect(screen.queryByText("Bruno S.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(screen.getByTestId("jplanet-product-review-preview")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Nintendo Switch Proコントローラーの商品詳細を見る" }),
    );
    expect(screen.getByTestId("jplanet-controller-result")).toBeTruthy();

    expect(screen.queryByRole("button", { name: /バリアントを選択/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "スプラトゥーンを表示" }));
    expect(
      screen
        .getByRole("img", { name: "Nintendo Switch Proコントローラー スプラトゥーン" })
        .getAttribute("src"),
    ).toBe("/sazo-commerce/reference/nintendo-pro-controller-splatoon-v1.png");
    fireEvent.click(screen.getByRole("button", { name: "カートに入れる" }));
    const cartDialog = screen.getByRole("dialog", {
      name: "Proコントローラーをカートに入れる",
    });
    expect(
      within(cartDialog).getByText("選択後、この商品をカートに追加します"),
    ).toBeTruthy();
    fireEvent.click(
      within(cartDialog).getByRole("button", { name: /ホワイト 在庫あり/ }),
    );
    fireEvent.click(within(cartDialog).getByRole("button", { name: "数量を増やす" }));
    fireEvent.click(within(cartDialog).getByRole("button", { name: "カートに入れる" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "add-to-cart",
      item: {
        option: "Proコントローラー / ホワイト",
        productId: "jplanet-nintendo-pro-controller",
        quantity: 2,
      },
    });
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "cart" });
  });

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
    expect(screen.getByText("通常日本商品")).toBeTruthy();
    expect(screen.getByText("日本の素敵な商品をすぐにお届けします。")).toBeTruthy();
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

  it("keeps only cart and buy-now actions in the fixed mobile purchase bar", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );
    const mobileActions = container.querySelector<HTMLElement>(
      ".sazo-product-mobile-purchase",
    );

    if (mobileActions === null) {
      throw new Error("Missing mobile purchase actions");
    }

    expect(mobileActions.querySelectorAll("button")).toHaveLength(2);
    expect(within(mobileActions).queryByText("ご注文金額合計")).toBeNull();
    expect(
      within(mobileActions).getByRole("button", { name: "カートに入れる" }),
    ).toBeTruthy();
    expect(
      within(mobileActions).getByRole("button", { name: "今すぐ買う" }),
    ).toBeTruthy();
  });

  it("opens a bottom order sheet with only the selected purchase intent", async () => {
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
      throw new Error("Missing product purchase controls");
    }

    fireEvent.change(within(heroForm).getByLabelText("商品オプション"), {
      target: { value: "標準" },
    });
    fireEvent.click(
      within(mobileActions).getByRole("button", { name: "カートに入れる" }),
    );

    const sheet = container.querySelector<HTMLElement>(
      ".sazo-product-detail-checkout-rail[data-open='true']",
    );
    expect(sheet).not.toBeNull();
    if (sheet === null) {
      throw new Error("Missing open order sheet");
    }

    const stickyForm = sheet.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );
    if (stickyForm === null) {
      throw new Error("Missing order sheet form");
    }

    expect(
      within(stickyForm).getByRole("button", { name: "カートに入れる" }),
    ).toBeTruthy();
    expect(within(stickyForm).queryByRole("button", { name: "今すぐ買う" })).toBeNull();

    fireEvent.click(within(sheet).getByRole("button", { name: "注文シートを閉じる" }));
    expect(
      container.querySelector(".sazo-product-detail-checkout-rail[data-open='true']"),
    ).toBeNull();

    fireEvent.click(within(mobileActions).getByRole("button", { name: "今すぐ買う" }));
    const reopenedSheet = container.querySelector<HTMLElement>(
      ".sazo-product-detail-checkout-rail[data-open='true']",
    );
    expect(reopenedSheet).not.toBeNull();
    if (reopenedSheet === null) {
      throw new Error("Missing reopened order sheet");
    }
    const reopenedForm = reopenedSheet.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );
    if (reopenedForm === null) {
      throw new Error("Missing reopened order sheet form");
    }

    expect(within(reopenedForm).getByRole("button", { name: "今すぐ買う" })).toBeTruthy();
    expect(
      within(reopenedForm).queryByRole("button", { name: "カートに入れる" }),
    ).toBeNull();
  });

  it("confirms the cart intent inside the sheet and keeps purchase feedback visible", async () => {
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
      throw new Error("Missing product purchase controls");
    }

    fireEvent.change(within(heroForm).getByLabelText("商品オプション"), {
      target: { value: "標準" },
    });
    fireEvent.click(
      within(mobileActions).getByRole("button", { name: "カートに入れる" }),
    );

    const sheetForm = container.querySelectorAll<HTMLFormElement>(
      "form[data-product-purchase-form]",
    )[1];
    if (sheetForm === undefined) {
      throw new Error("Missing order sheet form");
    }

    fireEvent.click(within(sheetForm).getByRole("button", { name: "カートに入れる" }));
    expect(screen.getByRole("status").textContent).toContain("カートに追加しました");
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
    expect(screen.getAllByText("日本の素敵な商品をすぐにお届けします。")).toHaveLength(1);
    expect(screen.getByText("日本で購入")).toBeTruthy();
    expect(screen.getByText("ブラジルへお届け")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "商品情報" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "なぜJ-Planetなのか？" })).toBeTruthy();
    expect(screen.getByText("レビューを見る")).toBeTruthy();
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
    expect(
      screen.queryByRole("region", { name: "J-Planet 日本からブラジルへ" }),
    ).toBeNull();

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
      expect.stringContaining("sazo-product-detail-review"),
      expect.stringContaining("sazo-product-detail-cautions"),
      expect.stringContaining("sazo-product-detail-benefits"),
      expect.stringContaining("sazo-product-detail-selected-recommendations"),
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
    const reviewList = screen.getByTestId("product-review-list");
    expect(reviewList.querySelectorAll("article")).toHaveLength(5);
    expect(reviewList.querySelectorAll("img")).toHaveLength(5);
    expect(screen.getByText("レビューを見る")).toBeTruthy();

    const benefitDetails = container.querySelectorAll<HTMLDetailsElement>(
      ".sazo-product-detail-benefit-card details",
    );
    expect(benefitDetails).toHaveLength(3);
    expect(Array.from(benefitDetails).every((detail) => !detail.open)).toBe(true);
    const viewAllBenefits = screen.getByRole("button", { name: "すべて見る" });
    fireEvent.click(viewAllBenefits);
    expect(Array.from(benefitDetails).every((detail) => detail.open)).toBe(true);
    expect(screen.getByRole("button", { name: "閉じる" })).toBeTruthy();
    expect(
      screen.getByText(
        "URLや画像、商品名をAIに渡すだけで、日本の販売サイトから候補を整理して提案します。",
      ),
    ).toBeTruthy();
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

  it("continues below the benefits with a vertical two-column selected-product grid", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );

    const rail = screen.getByTestId("product-selected-recommendations");
    expect(rail.getAttribute("aria-label")).toBe("この商品を選んだ人におすすめ");
    expect(
      container.querySelector(".sazo-product-detail-benefits")?.nextElementSibling,
    ).toBe(rail);

    const track = rail.querySelector<HTMLDivElement>(
      ".sazo-product-detail-recommendation-track",
    );

    if (track === null) {
      throw new Error("Missing selected-product recommendation track");
    }

    expect(track.querySelectorAll(".sazo-product-card")).toHaveLength(6);
    expect(track.getAttribute("data-layout")).toBe("grid");
    expect(track.getAttribute("data-scroll-axis")).toBe("vertical");
    expect(within(rail).queryByRole("button", { name: "次の商品" })).toBeNull();
    expect(track.querySelectorAll(".sazo-product-badge")).toHaveLength(0);

    const moreButton = within(rail).getByRole("button", { name: "もっと見る" });
    fireEvent.click(moreButton);
    expect(track.querySelectorAll(".sazo-product-card")).toHaveLength(10);
    expect(within(rail).queryByRole("button", { name: "もっと見る" })).toBeNull();
  });

  it("marks the delivery timeline as a full-width six-step overview", async () => {
    const { container } = await renderWithI18n(
      <ProductDetailView dispatch={vi.fn()} productId="p01" />,
    );

    const timeline = container.querySelector(".sazo-product-detail-timeline");
    expect(timeline?.getAttribute("data-fit")).toBe("full");
    expect(timeline?.querySelectorAll("li")).toHaveLength(6);
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
    const heroOrderSheet = container.querySelector<HTMLElement>(
      ".sazo-product-detail-checkout-rail[data-open='true']",
    );
    if (heroOrderSheet === null) {
      throw new Error("Missing hero order sheet");
    }
    fireEvent.click(
      within(heroOrderSheet).getByRole("button", { name: "カートに入れる" }),
    );
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
    const buyOrderSheet = container.querySelector<HTMLElement>(
      ".sazo-product-detail-checkout-rail[data-open='true']",
    );
    if (buyOrderSheet === null) {
      throw new Error("Missing buy-now order sheet");
    }
    fireEvent.click(within(buyOrderSheet).getByRole("button", { name: "今すぐ買う" }));
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

    expect(
      screen.getAllByText("We deliver great products from Japan quickly."),
    ).toHaveLength(1);
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
