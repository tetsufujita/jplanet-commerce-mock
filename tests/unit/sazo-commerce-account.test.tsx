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
  FavoritesView,
  MyPageView,
  ProfileView,
} from "@/sazo-commerce/AccountViews";
import { AuthFlow } from "@/sazo-commerce/AuthFlow";
import { ChatPanel } from "@/sazo-commerce/ChatPanel";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import type { SazoAction } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
  it("moves through provider, birthday, and phone without leaving the local page", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    const launcher = within(desktopShell).getByRole("button", { name: "ログイン" });
    fireEvent.click(launcher);

    const provider = screen.getByRole("dialog", {
      name: "ログイン または会員登録",
    });
    expect(provider.textContent).toContain("送料50%OFFクーポン");
    for (const label of ["Googleで続ける", "Appleで続ける", "メールで続ける"]) {
      expect(within(provider).getByRole("button", { name: label })).toBeTruthy();
    }

    fireEvent.click(within(provider).getByRole("button", { name: "Googleで続ける" }));
    const chooser = screen.getByTestId("sazo-google-chooser");
    expect(within(chooser).getByRole("heading", { name: "アカウントを選択してください" })).toBeTruthy();
    expect(within(chooser).getByText("accounts.google.com/v3/signin/accountchooser")).toBeTruthy();
    expect(container.querySelector("a[href^='http']")).toBeNull();
    fireEvent.click(
      within(chooser).getByRole("button", {
        name: "Tetsu Fujita tetsu.fujita@andes.global",
      }),
    );
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
        name: "SAZOからのお得な情報を受け取らない",
      }),
    ).toBeTruthy();
  });

  it("renders birthday and phone as normal auth pages with recorded page chrome", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    fireEvent.click(within(desktopShell).getByRole("button", { name: "ログイン" }));
    fireEvent.click(screen.getByRole("button", { name: "Googleで続ける" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Tetsu Fujita tetsu.fujita@andes.global",
      }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    const birthdayPage = screen.getByTestId("sazo-auth-page");
    const birthdayMain = within(birthdayPage).getByRole("main", { name: "会員登録" });
    expect(
      within(birthdayMain).getByRole("heading", {
        name: "生年月日を入力してください",
      }),
    ).toBeTruthy();
    expect(within(birthdayPage).getByRole("banner")).toBeTruthy();
    expect(within(birthdayPage).getByRole("contentinfo")).toBeTruthy();
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
      expect(screen.queryByRole("dialog", { name: "SAZOチャット" })).toBeNull();
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

    const launcher = within(desktopShell).getByRole("button", { name: "ログイン" });
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

    const launcher = within(desktopShell).getByRole("button", { name: "ログイン" });
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
  it("renders the recorded member summary and shopping/review destinations", async () => {
    await renderWithI18n(<MyPageView dispatch={noDispatch} />);

    expect(screen.getByRole("heading", { name: "マイページ" })).toBeTruthy();
    expect(screen.getByText("Tetsu Fujita さん")).toBeTruthy();
    expect(screen.getByText("500")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    for (const label of [
      "注文履歴",
      "お気に入り",
      "クーポン",
      "ポイント",
      "レビューを作成",
      "作成したレビュー",
      "会員情報の修正",
      "登録カード管理",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("renders the product favorite empty state and local favorite tabs", async () => {
    await renderWithI18n(<FavoritesView dispatch={noDispatch} />);

    expect(screen.getByRole("heading", { name: "お気に入り" })).toBeTruthy();
    expect(screen.getByText("お気に入り商品がありません")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "ブランド" }));
    expect(screen.getByText("お気に入りブランドがありません")).toBeTruthy();
  });

  it("reaches recorded reviews from the review favorite empty state", async () => {
    const { container } = await renderPage();
    const desktopShell = container.querySelector<HTMLElement>('[data-shell="desktop"]');

    if (desktopShell === null) {
      throw new Error("Desktop SAZO shell not found");
    }

    fireEvent.click(within(desktopShell).getByRole("button", { name: "お気に入り" }));
    fireEvent.click(screen.getByRole("tab", { name: "レビュー" }));
    fireEvent.click(screen.getByRole("button", { name: "レビューを見に行く" }));

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
});

describe("SAZO local chat overlay", () => {
  it("uses dialog semantics, traps focus, and closes from its close button", async () => {
    const { container } = await renderPage();
    const launcher = screen.getByRole("button", { name: "チャットを開く" });
    launcher.focus();
    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", { name: "SAZOチャット" });
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
      expect(screen.queryByRole("dialog", { name: "SAZOチャット" })).toBeNull();
    });
    expect(background?.hasAttribute("aria-hidden")).toBe(false);
    expect(background?.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(launcher);
  });

  it("closes on its backdrop and on Escape", async () => {
    await renderPage();
    const launcher = screen.getByRole("button", { name: "チャットを開く" });

    fireEvent.click(launcher);
    fireEvent.mouseDown(screen.getByTestId("sazo-chat-backdrop"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "SAZOチャット" })).toBeNull();
    });

    fireEvent.click(launcher);
    fireEvent.keyDown(screen.getByRole("dialog", { name: "SAZOチャット" }), {
      key: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "SAZOチャット" })).toBeNull();
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

      const panel = screen.getByRole("dialog", { name: "SAZOチャット" });
      expect(panel.getAttribute("data-motion-duration")).toBe(duration);
      expect(panel.getAttribute("data-motion-mode")).toBe(mode);
    },
  );
});
