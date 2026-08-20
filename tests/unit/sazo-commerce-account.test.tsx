// @vitest-environment jsdom

import React, { act } from "react";
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
import {
  CardsView,
  CouponsView,
  DeliveryView,
  FavoritesView,
  MyPageView,
  NotificationsView,
  OrderDetailView,
  OrdersView,
  PointsView,
  ProfileView,
  SupportView,
} from "@/sazo-commerce/AccountViews";
import { AuthFlow } from "@/sazo-commerce/AuthFlow";
import { ChatPanel } from "@/sazo-commerce/ChatPanel";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import { createInitialSazoState, type SazoAction } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/sazo-commerce-mock/");
  document.body.style.overflow = "";
});

const noDispatch = (_action: SazoAction) => undefined;

function installMatchMedia({
  mobile = false,
  reducedMotion = false,
}: {
  mobile?: boolean;
  reducedMotion?: boolean;
} = {}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query.includes("prefers-reduced-motion")
        ? reducedMotion
        : query.includes("max-width")
          ? mobile
          : false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
    writable: true,
  });
}

async function renderWithI18n(element: React.ReactNode) {
  const i18n = await createI18n("ja");

  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

async function renderPage() {
  installMatchMedia();

  return renderWithI18n(<SazoCommercePage />);
}

describe("SAZO local authentication", () => {
  it("logs in and opens My Page immediately when Google is selected", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    fireEvent.click(within(desktopShell).getByRole("button", { name: "マイページ" }));
    fireEvent.click(screen.getByRole("button", { name: "Googleで続ける" }));

    expect(screen.queryByRole("dialog", { name: "ログイン または会員登録" })).toBeNull();
    expect(screen.queryByTestId("sazo-google-chooser")).toBeNull();
    expect(screen.getByRole("heading", { name: "マイページ" })).toBeTruthy();
    expect(container.querySelector<HTMLElement>(".sazo-root")?.dataset.view).toBe(
      "mypage",
    );
  });

  it("keeps the Apple registration flow on the local birthday and phone pages", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    const launcher = within(desktopShell).getByRole("button", { name: "マイページ" });
    fireEvent.click(launcher);

    const provider = screen.getByRole("dialog", {
      name: "ログイン または会員登録",
    });
    expect(provider.textContent).toContain("送料50%OFFクーポン");
    for (const label of ["Googleで続ける", "Appleで続ける", "メールで続ける"]) {
      expect(within(provider).getByRole("button", { name: label })).toBeTruthy();
    }

    fireEvent.click(within(provider).getByRole("button", { name: "Appleで続ける" }));
    expect(
      screen.getByRole("heading", { name: "生年月日を入力してください" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("生年月日（西暦）").getAttribute("placeholder")).toBe(
      "YYYY-MM-DD",
    );

    fireEvent.change(screen.getByLabelText("生年月日（西暦）"), {
      target: { value: "2001-08-22" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    expect(
      screen.getByRole("heading", { name: "電話番号を入力してください" }),
    ).toBeTruthy();
    expect(container.querySelector("a[href^='http']")).toBeNull();
  });

  it("offers the exact recorded countries and labelled consent control", async () => {
    await renderWithI18n(<AuthFlow authStep="phone" dispatch={noDispatch} />);

    const country = screen.getByLabelText("国番号");
    expect(
      within(country)
        .getAllByRole("option")
        .map((option) => option.getAttribute("value")),
    ).toEqual(["JP", "KR", "CN", "US", "TW", "BN", "SG", "DE", "TH", "GU", "RU"]);
    expect(screen.getByLabelText("電話番号").getAttribute("type")).toBe("tel");
    expect(
      screen.getByRole("checkbox", {
        name: "J-Planetからのお得な情報を受け取らない",
      }),
    ).toBeTruthy();
  });

  it("renders birthday and phone as normal auth pages with recorded page chrome", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    fireEvent.click(within(desktopShell).getByRole("button", { name: "マイページ" }));
    fireEvent.click(screen.getByRole("button", { name: "Appleで続ける" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    const birthdayPage = screen.getByTestId("sazo-auth-page");
    const birthdayMain = within(birthdayPage).getByRole("main", { name: "会員登録" });
    expect(
      within(birthdayMain).getByRole("heading", {
        name: "生年月日を入力してください",
      }),
    ).toBeTruthy();
    expect(within(birthdayPage).getByRole("banner")).toBeTruthy();
    expect(
      within(birthdayPage)
        .getByRole("banner")
        .querySelector("img[data-jplanet-wordmark='true']"),
    ).toBeTruthy();
    expect(within(birthdayPage).getByRole("contentinfo")).toBeTruthy();
    expect(within(birthdayPage).getByText("© 2024-2026 J-Planet Brasil")).toBeTruthy();
    expect(within(birthdayPage).getByText("São Paulo - SP, Brasil")).toBeTruthy();
    expect(birthdayPage.textContent).not.toMatch(/SAJWO|Republic of Korea|韓国/i);
    for (const link of [
      "会社紹介",
      "採用情報",
      "プレスリリース",
      "利用規約",
      "プライバシー規約",
      "特定商取引法に基づく表記",
    ]) {
      expect(within(birthdayPage).getByRole("link", { name: link })).toBeTruthy();
    }
    const authChatLauncher = within(birthdayPage).getByRole("button", {
      name: "チャットを開く",
    });
    expect(authChatLauncher).toBeTruthy();

    const root = container.querySelector<HTMLElement>(".sazo-root");
    expect(root?.getAttribute("aria-hidden")).toBeNull();
    expect(root?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(authChatLauncher);
    fireEvent.click(screen.getByRole("button", { name: "チャットを閉じる" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "J-Planetチャット" })).toBeNull();
    });
    expect(screen.getByTestId("sazo-auth-page")).toBeTruthy();

    fireEvent.change(within(birthdayMain).getByLabelText("生年月日（西暦）"), {
      target: { value: "2001-08-22" },
    });
    fireEvent.click(within(birthdayMain).getByRole("button", { name: "次へ" }));

    const phonePage = screen.getByTestId("sazo-auth-page");
    const phoneMain = within(phonePage).getByRole("main", { name: "会員登録" });
    expect(
      within(phoneMain).getByRole("heading", {
        name: "電話番号を入力してください",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(within(phonePage).getByRole("banner")).toBeTruthy();
    expect(within(phonePage).getByRole("contentinfo")).toBeTruthy();
  });

  it("closes with Escape and returns focus to the login launcher", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    const launcher = within(desktopShell).getByRole("button", { name: "マイページ" });
    launcher.focus();
    fireEvent.click(launcher);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(launcher);
  });

  it("traps focus and closes from the close button or backdrop", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    const launcher = within(desktopShell).getByRole("button", { name: "マイページ" });
    launcher.focus();
    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", {
      name: "ログイン または会員登録",
    });
    const close = within(dialog).getByRole("button", { name: "ログインを閉じる" });
    const email = within(dialog).getByRole("button", { name: "メールで続ける" });
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const background = container.querySelector<HTMLElement>(
      '[data-overlay-background="true"]',
    );

    expect(background?.getAttribute("aria-hidden")).toBe("true");
    expect(background?.hasAttribute("inert")).toBe(true);
    expect(root?.getAttribute("aria-hidden")).toBeNull();
    expect(root?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("hidden");

    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(email);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    fireEvent.click(close);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(launcher);

    fireEvent.click(launcher);
    fireEvent.mouseDown(screen.getByTestId("sazo-auth-backdrop"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(background?.hasAttribute("aria-hidden")).toBe(false);
    expect(background?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(launcher);
  });
});

describe("SAZO recorded account views", () => {
  it("dispatches every destination in the post-purchase My Page", async () => {
    const dispatch = vi.fn();

    await renderWithI18n(<MyPageView couponCount={4} dispatch={dispatch} />);

    const destinations = [
      [/500.*ポイント/, { type: "navigate", view: "points" }],
      [/4.*クーポン/, { type: "navigate", view: "coupons" }],
      [/注文・配送/, { type: "navigate", view: "orders" }],
      ["お気に入り", { type: "open-favorites", tab: "product" }],
      ["配送先", { type: "navigate", view: "delivery" }],
      ["支払い方法", { type: "navigate", view: "cards" }],
      ["通知設定", { type: "navigate", view: "notifications" }],
      ["会員情報", { type: "navigate", view: "profile" }],
      ["サポート", { type: "navigate", view: "support" }],
    ] as const;

    for (const [label, action] of destinations) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(dispatch).toHaveBeenLastCalledWith(action);
    }
  });

  it("opens the unified favorites page from My Page with product and brand tabs", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=mypage");
    const { container } = await renderPage();
    const myPage = container.querySelector<HTMLElement>('[data-view-content="mypage"]');

    if (myPage === null) {
      throw new Error("My Page was not rendered");
    }

    fireEvent.click(within(myPage).getByRole("button", { name: "お気に入り" }));

    await waitFor(() => {
      const favorites = container.querySelector<HTMLElement>('[data-view-content="favorites"]');

      expect(favorites).not.toBeNull();
      expect(
        within(favorites as HTMLElement)
          .getByRole("tab", { name: /商品/ })
          .getAttribute("aria-selected"),
      ).toBe("true");
    });

    const favorites = container.querySelector<HTMLElement>('[data-view-content="favorites"]');
    if (favorites === null) {
      throw new Error("Favorites was not rendered");
    }

    fireEvent.click(within(favorites).getByRole("tab", { name: /ブランド/ }));
    expect(within(favorites).getByRole("tab", { name: /ブランド/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it.each([
    ["orders", "対応が必要", "CPF情報の確認が必要です"],
    ["coupons", "クーポン", "国際送料 R$30 OFF"],
    ["points", "ポイント", "500P"],
    ["review-create", "レビュー作成", "レビュー済みの場合"],
    ["review-history", "作成したレビュー", "作成したレビューがございません"],
    ["delivery", "配送先管理", "登録されたお届け先住所がありません。"],
    ["address", "住所の追加・変更", "日本国内のご自身名義の自宅の住所"],
    ["notifications", "お知らせ", "購入に関する変化をまとめてお知らせします。"],
    ["support", "ヘルプ", "何かお困りですか？"],
  ] as const)("renders the recorded %s account screen", async (view, heading, copy) => {
    window.history.replaceState({}, "", `/sazo-commerce-mock/?qa=1&view=${view}`);

    await renderPage();

    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    expect(screen.getByText(copy, { exact: false })).toBeTruthy();
  });

  it("renders the member summary with points, coupons and account destinations", async () => {
    await renderWithI18n(<MyPageView dispatch={noDispatch} />);

    expect(screen.getByRole("heading", { name: "マイページ" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tetsu Fujita さん" })).toBeTruthy();
    expect(screen.getByText("500")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    for (const label of [
      /注文・配送/,
      "お気に入り",
      "配送先",
      "支払い方法",
      "通知設定",
      "会員情報",
      "サポート",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("uses the supplied J-Planet wordmark in the My Page header", async () => {
    await renderWithI18n(<MyPageView dispatch={noDispatch} />);

    expect(document.querySelector("img[data-jplanet-wordmark='true']")?.getAttribute("src")).toBe(
      "/sazo-commerce/jplanet-wordmark.png",
    );
  });

  it("opens the CPF order detail and switches to the local submission success state", async () => {
    const dispatch = vi.fn();

    const orders = await renderWithI18n(<OrdersView dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "CPF情報を提出する" }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "navigate", view: "order-detail" });
    orders.unmount();

    await renderWithI18n(<OrderDetailView dispatch={noDispatch} />);
    expect(screen.getByRole("heading", { name: "提出が必要な書類" })).toBeTruthy();
    expect(screen.getByText("書類の提出後に次へ進みます")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "CPF情報を提出する" }));
    expect(screen.getByRole("status").textContent).toContain("CPF情報を送信しました");
  });

  it("expands Nintendo shipping status locally from the tracking action", async () => {
    await renderWithI18n(<OrdersView dispatch={noDispatch} />);

    const tracking = screen.getByRole("button", { name: "Nintendo Switch OLEDを追跡する" });
    expect(tracking.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(tracking);
    expect(tracking.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("国際配送の準備状況");
  });

  it("renders the reference favorite products and local favorite tabs", async () => {
    await renderWithI18n(<FavoritesView dispatch={noDispatch} />);

    expect(screen.getByRole("heading", { name: "お気に入り" })).toBeTruthy();
    expect(screen.getByText("購入条件を確認した商品")).toBeTruthy();
    expect(screen.getByText("New Balance 9060")).toBeTruthy();
    expect(screen.getByText("Sony α7C II")).toBeTruthy();
    expect(screen.getByText("Nintendo Switch OLED")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "ブランド 2" }));
    expect(screen.getByText("保存したブランド")).toBeTruthy();
    expect(screen.getByRole("button", { name: "NEW BALANCE" })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "レビュー 1" }));
    expect(screen.getByText("保存したレビュー")).toBeTruthy();
  });

  it("removes a favorite locally and opens product details from the row", async () => {
    const dispatch = vi.fn();

    await renderWithI18n(<FavoritesView dispatch={dispatch} />);

    fireEvent.click(
      screen.getByRole("button", { name: "New Balance 9060をお気に入りから削除" }),
    );
    expect(screen.queryByText("New Balance 9060")).toBeNull();
    expect(screen.getByRole("tab", { name: "商品 3" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Sony α7C IIの商品詳細を開く" }));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-product",
      productId: "jplanet-sony-a7c-ii",
    });
  });

  it("sorts favorite products and starts the deferred product check", async () => {
    const dispatch = vi.fn();

    await renderWithI18n(<FavoritesView dispatch={dispatch} />);

    fireEvent.click(screen.getByRole("button", { name: "新しい順" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "到着総額が安い順" }));
    expect(screen.getByRole("button", { name: "到着総額が安い順" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "確認をはじめる" }));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-product",
      productId: "jplanet-nintendo-switch-oled",
    });
  });

  it("reaches recorded reviews from the favorite review tab", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=mypage");
    const { container } = await renderPage();
    const myPage = container.querySelector<HTMLElement>('[data-view-content="mypage"]');

    if (myPage === null) {
      throw new Error("My Page was not rendered");
    }

    fireEvent.click(within(myPage).getByRole("button", { name: "お気に入り" }));
    fireEvent.click(screen.getByRole("tab", { name: "レビュー 1" }));
    fireEvent.click(screen.getByRole("button", { name: "購入判断に役立ったレビュー" }));

    expect(container.querySelector('[data-view-content="reviews"]')).not.toBeNull();
  });

  it("sources the recorded profile values from the typed fixture", async () => {
    await renderWithI18n(<ProfileView dispatch={noDispatch} />);

    expect(screen.getByRole("heading", { name: "会員情報の修正・変更" })).toBeTruthy();
    expect(screen.getByLabelText("ニックネーム").getAttribute("value")).toBe(
      "Tetsu Fujita",
    );
    expect(screen.getByLabelText("メールアドレス").getAttribute("value")).toBe(
      "tetsu.fujita@andes.global",
    );
  });

  it("renders the recorded profile phone verification and LINE linkage UI", async () => {
    const { container } = await renderWithI18n(<ProfileView dispatch={noDispatch} />);

    expect(
      screen.getByText(
        "ご注文の商品、配送状況をお見逃しなく！メール認証とLINE連携することで、ご注文の商品の配送状況を見逃しなく確認できます。",
      ),
    ).toBeTruthy();

    const phone = screen.getByRole("group", { name: "電話番号" });
    expect(within(phone).getByText("JP")).toBeTruthy();
    expect(within(phone).queryByRole("combobox")).toBeNull();
    expect(
      within(phone)
        .getByRole("textbox", { name: "認証済み電話番号" })
        .hasAttribute("readonly"),
    ).toBe(true);
    expect(screen.getByText("電話番号を認証すると自動で入力されます")).toBeTruthy();

    const authenticate = screen.getByRole("button", { name: "認証する" });
    expect(authenticate.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(authenticate);
    expect(authenticate.getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector("a[href^='http']")).toBeNull();
  });

  it("renders the recorded cards empty state", async () => {
    await renderWithI18n(<CardsView dispatch={noDispatch} />);

    expect(screen.getByRole("heading", { name: "登録カード管理" })).toBeTruthy();
    expect(screen.getByText("登録されているカードがありません。")).toBeTruthy();
  });

  it("supports the coupon wallet filters, code states, conditions and discovery", async () => {
    const dispatch = vi.fn();
    const { unmount } = await renderWithI18n(
      <CouponsView dispatch={dispatch} state={createInitialSazoState()} />,
    );

    expect(screen.getByRole("heading", { name: "クーポン" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "すべて (4)" })).toBeTruthy();
    expect(screen.getAllByTestId("jplanet-coupon-ticket")).toHaveLength(4);

    fireEvent.click(screen.getByRole("tab", { name: "配送 (2)" }));
    expect(screen.getAllByTestId("jplanet-coupon-ticket")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "コードを入力" }));
    const codeDialog = screen.getByRole("form", { name: "クーポンコードを入力" });
    const apply = within(codeDialog).getByRole("button", { name: "適用" });
    expect(apply.hasAttribute("disabled")).toBe(true);
    const codeInput = within(codeDialog).getByRole("textbox", { name: "クーポンコードを入力" });
    fireEvent.change(codeInput, {
      target: { value: "USED2026" },
    });
    fireEvent.click(apply);
    expect(screen.getByRole("status").textContent).toContain("このコードは使用済みです");
    fireEvent.change(codeInput, {
      target: { value: "INVALID" },
    });
    fireEvent.click(apply);
    expect(screen.getByRole("status").textContent).toContain("有効なクーポンコードではありません");
    fireEvent.change(codeInput, {
      target: { value: "JPLANET20" },
    });
    fireEvent.click(apply);
    expect(screen.getByRole("status").textContent).toContain("クーポンを追加しました");
    expect(dispatch).toHaveBeenCalledWith({ type: "claim-coupon", couponId: "welcome-code-r20" });

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    const firstConditionsButton = screen.getAllByRole("button", { name: "利用条件" })[0];
    if (firstConditionsButton === undefined) throw new Error("Coupon conditions button missing");
    fireEvent.click(firstConditionsButton);
    expect(screen.getByRole("dialog", { name: /国際送料 R\$30 OFFの利用条件/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    fireEvent.click(screen.getByRole("button", { name: "クーポンを探す" }));
    expect(screen.getByRole("heading", { name: "クーポンを探す" })).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "配布終了" }).every((button) =>
        button.hasAttribute("disabled"),
      ),
    ).toBe(true);

    unmount();
    await renderWithI18n(
      <CouponsView dispatch={noDispatch} state={{ ...createInitialSazoState(), couponOwnedIds: [] }} />,
    );
    expect(screen.getByTestId("jplanet-coupon-empty")).toBeTruthy();

    cleanup();
    await renderWithI18n(<SupportView />);
    expect(screen.getByText("平日：10:00〜18:00")).toBeTruthy();
    expect(screen.getByText("土日・祝日：15:00〜18:00")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /すぐに問い合わせを開始する/ }),
    ).toBeTruthy();
  });

  it("opens the recorded address form from delivery management", async () => {
    const dispatch = vi.fn();
    await renderWithI18n(<DeliveryView dispatch={dispatch} />);

    fireEvent.click(screen.getByRole("button", { name: "配送先を追加" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "address" });
  });

  it("switches the recorded point history tabs locally", async () => {
    await renderWithI18n(<PointsView dispatch={noDispatch} />);

    const used = screen.getByRole("tab", { name: "利用済み" });
    expect(used.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(used);
    expect(used.getAttribute("aria-selected")).toBe("true");
  });

  it("toggles each notification setting locally", async () => {
    await renderWithI18n(<NotificationsView dispatch={noDispatch} />);

    fireEvent.click(screen.getByRole("button", { name: "通知設定" }));
    const email = screen.getByRole("switch", { name: "メール通知" });
    expect(email.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(email);
    expect(email.getAttribute("aria-checked")).toBe("false");
  });

  it("uses the dedicated notification inbox frame", async () => {
    const { container } = await renderWithI18n(
      <NotificationsView dispatch={noDispatch} />,
    );

    expect(
      container
        .querySelector(".sazo-notifications-view")
        ?.getAttribute("data-view-content"),
    ).toBe("notifications");
    expect(screen.getByRole("tablist", { name: "通知を絞り込む" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "ご案内" })).toBeTruthy();
  });

  it("filters purchase updates and preserves their routes without the retired size alert", async () => {
    const dispatch = vi.fn();
    await renderWithI18n(<NotificationsView dispatch={dispatch} />);

    expect(screen.getByRole("tab", { name: "すべて" })).toBeTruthy();
    expect(screen.queryByText("New Balance 9060 のサイズを選ぶ")).toBeNull();
    expect(screen.getByText("Air Jordan 1 Retro High OG")).toBeTruthy();
    expect(screen.getByText("Nintendo Switch OLED")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "配送" }));
    expect(screen.queryByText("Air Jordan 1 Retro High OG")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "ご案内" }));
    expect(screen.queryByText("Nintendo Switch OLED")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "配送" }));
    fireEvent.click(screen.getByTestId("sazo-notification-switch"));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-product",
      productId: "jplanet-nintendo-switch-oled",
    });
  });
});

describe("SAZO local chat overlay", () => {
  it("uses dialog semantics, traps focus, and closes from its close button", async () => {
    const { container } = await renderPage();
    const launcher = screen.getByTestId("chat-launcher");
    launcher.focus();
    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", { name: "J-Planetチャット" });
    const close = within(dialog).getByRole("button", { name: "チャットを閉じる" });
    const message = within(dialog).getByRole("textbox", { name: "メッセージ" });
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const background = container.querySelector<HTMLElement>(
      '[data-overlay-background="true"]',
    );

    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(background?.getAttribute("aria-hidden")).toBe("true");
    expect(background?.hasAttribute("inert")).toBe(true);
    expect(root?.getAttribute("aria-hidden")).toBeNull();
    expect(root?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("hidden");

    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(message);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    fireEvent.click(close);
    expect(background?.hasAttribute("aria-hidden")).toBe(false);
    expect(background?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(launcher);
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "J-Planetチャット" })).toBeNull();
    });
    expect(background?.hasAttribute("aria-hidden")).toBe(false);
    expect(background?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(launcher);
  });

  it("closes on its backdrop and on Escape", async () => {
    await renderPage();
    const launcher = screen.getByTestId("chat-launcher");

    fireEvent.click(launcher);
    fireEvent.mouseDown(screen.getByTestId("sazo-chat-backdrop"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "J-Planetチャット" })).toBeNull();
    });

    fireEvent.click(launcher);
    fireEvent.keyDown(screen.getByRole("dialog", { name: "J-Planetチャット" }), {
      key: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "J-Planetチャット" })).toBeNull();
    });
  });

  it("changes from local loading to the recorded empty state without fetching", async () => {
    installMatchMedia();
    vi.useFakeTimers();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await renderWithI18n(<ChatPanel dispatch={noDispatch} />);

    expect(screen.getByText("チャットを読み込んでいます")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText("メッセージはまだありません")).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    [false, false, "0.22", "desktop"],
    [true, false, "0.18", "mobile"],
    [false, true, "0", "desktop"],
  ] as const)(
    "uses the recorded motion duration for mobile=%s reduced=%s",
    async (mobile, reducedMotion, duration, mode) => {
      installMatchMedia({ mobile, reducedMotion });
      await renderWithI18n(<ChatPanel dispatch={noDispatch} />);

      const panel = screen.getByRole("dialog", { name: "J-Planetチャット" });
      expect(panel.getAttribute("data-motion-duration")).toBe(duration);
      expect(panel.getAttribute("data-motion-mode")).toBe(mode);
    },
  );
});
