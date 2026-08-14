// @vitest-environment jsdom

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { createI18n } from "@/i18n/createI18n";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
    writable: true,
  });
  window.history.replaceState({}, "", "/");
});

function installMobileHome() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: query === "(max-width: 767px)",
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }),
    writable: true,
  });
}

async function renderSazoCommercePage(locale: "ja" | "en" | "pt-BR" = "ja") {
  const i18n = await createI18n(locale);

  return render(
    <I18nextProvider i18n={i18n}>
      <SazoCommercePage />
    </I18nextProvider>,
  );
}

async function renderSazoCommerceMarkup(locale: "ja" | "en" | "pt-BR") {
  const i18n = await createI18n(locale);

  return renderToStaticMarkup(
    React.createElement(I18nextProvider, { i18n }, React.createElement(SazoCommercePage)),
  );
}

async function renderAppAt(pathname: string) {
  const i18n = await createI18n("ja");

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[pathname]}>
        <App />
      </MemoryRouter>
    </I18nextProvider>,
  );
}

function getShell(container: HTMLElement, shell: "desktop" | "mobile") {
  const element = container.querySelector<HTMLElement>(`[data-shell="${shell}"]`);

  if (element === null) {
    throw new Error(`${shell} shell not found`);
  }

  return element;
}

function getDesktopHeader(scope: HTMLElement) {
  const header = scope.querySelector<HTMLElement>(".sazo-desktop-header");

  if (header === null) {
    throw new Error("Desktop global header not found");
  }

  return header;
}

describe("SazoCommercePage shell", () => {
  it("keeps the official J-Planet wordmark in the desktop shell only", async () => {
    const { container } = await renderSazoCommercePage();
    const wordmarks = Array.from(
      container.querySelectorAll<HTMLImageElement>(
        ".sazo-wordmark img[data-jplanet-wordmark]",
      ),
    );

    expect(wordmarks).toHaveLength(1);
    expect(
      wordmarks.every(
        (wordmark) =>
          wordmark.getAttribute("src") === "/sazo-commerce/jplanet-wordmark.png",
      ),
    ).toBe(true);
    expect(
      container.querySelectorAll(".sazo-wordmark svg[data-sazo-wordmark]"),
    ).toHaveLength(0);
  });

  it("renders the complete captured desktop and mobile control inventory", async () => {
    const { container } = await renderSazoCommercePage();
    const desktopShell = getShell(container, "desktop");
    const mobileShell = getShell(container, "mobile");
    const desktopHeader = getDesktopHeader(desktopShell);
    const desktopActions = desktopHeader.querySelector<HTMLElement>(
      ".sazo-top-actions",
    );
    const desktopNav = within(desktopShell).getByRole("navigation", {
      name: "メインメニュー",
    });
    const mobileNav = within(mobileShell).getByRole("navigation", {
      name: "モバイルメニュー",
    });

    for (const label of ["ホーム", "ブランド", "エージェント", "通知", "マイページ"]) {
      expect(
        Array.from(desktopNav.querySelectorAll("button")).some(
          (button) => button.textContent === label,
        ),
      ).toBe(true);
    }

    if (desktopActions === null) {
      throw new Error("Desktop global actions not found");
    }

    for (const label of ["AI検索を開く", "カート", "通知", "ログイン"]) {
      expect(within(desktopActions).getByRole("button", { name: label })).toBeTruthy();
    }
    expect(within(desktopActions).queryByRole("button", { name: "お気に入り" })).toBeNull();

    expect(
      within(desktopNav)
        .getByRole("button", { name: "ホーム" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    expect(within(mobileNav).getAllByRole("button")).toHaveLength(5);
    for (const label of ["ホーム", "ブランド", "エージェント", "通知", "マイページ"]) {
      expect(within(mobileNav).getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("opens notifications from the fixed mobile navigation", async () => {
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");
    const mobileNav = within(mobileShell).getByRole("navigation", {
      name: "モバイルメニュー",
    });
    const notificationButton = within(mobileNav).getByRole("button", { name: "通知" });

    expect(notificationButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(notificationButton);

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
        "notifications",
      );
      expect(notificationButton.getAttribute("aria-pressed")).toBe("true");
    });
  });

  it("opens the source-grouped cart from the desktop header with its selected BRL summary", async () => {
    const { container } = await renderSazoCommercePage();
    const desktopShell = getShell(container, "desktop");
    const desktopHeader = getDesktopHeader(desktopShell);

    fireEvent.click(within(desktopHeader).getByRole("button", { name: "カート" }));

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
        "cart",
      );
    });

    expect(screen.getByRole("heading", { name: "カート (3)" })).toBeTruthy();
    expect(screen.getAllByTestId("jplanet-cart-item")).toHaveLength(3);
    expect(
      screen
        .getAllByRole("checkbox")
        .every((checkbox) => (checkbox as HTMLInputElement).checked),
    ).toBe(true);
    expect(screen.getByText("R$ 5,612")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Rakuten Japan 公式ストアのクーポンを選択" }),
    ).toBeTruthy();
  });

  it("recreates the two-row mobile top bar without pinning the agent card", async () => {
    installMobileHome();
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");
    const mobileHeader = within(mobileShell).getByRole("banner");
    const mobileNav = within(mobileShell).getByRole("navigation", {
      name: "モバイルメニュー",
    });

    for (const label of [
      "URL・画像・商品名をAIに渡す",
      "カメラ",
      "カート",
      "チャットを開く",
    ]) {
      expect(within(mobileHeader).getByRole("button", { name: label })).toBeTruthy();
    }

    expect(mobileHeader.getAttribute("data-sazo-topbar")).toBe("true");
    expect(mobileHeader.classList.contains("sazo-mobile-header--opaque")).toBe(false);
    expect(mobileHeader.querySelector("[data-sazo-topbar-primary]")).not.toBeNull();
    expect(
      within(mobileHeader).queryByRole("button", { name: "J-Planet ホーム" }),
    ).toBeNull();
    expect(within(mobileHeader).queryByRole("button", { name: "言語" })).toBeNull();
    const secondary = within(mobileHeader).getByRole("navigation", {
      name: "モバイルサブメニュー",
    });
    for (const label of [
      "ホーム",
      "サービス紹介",
      "人気ブランド",
      "カテゴリー",
      "レビュー",
      "ヘルプ",
      "お知らせ",
    ]) {
      expect(within(secondary).getByRole("button", { name: label })).toBeTruthy();
    }
    expect(
      within(mobileHeader)
        .getByRole("button", { name: "カート" })
        .querySelector("[data-shell-cart-badge]"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-home-agent-entry]")?.getAttribute("data-sticky"),
    ).not.toBe("true");

    expect(
      within(mobileHeader)
        .getByRole("button", { name: "カート" })
        .querySelector(".lucide-shopping-cart"),
    ).not.toBeNull();
    expect(
      within(mobileHeader)
        .getByRole("button", { name: "URL・画像・商品名をAIに渡す" })
        .querySelector(".lucide-search"),
    ).not.toBeNull();
    expect(
      within(mobileHeader)
        .getByRole("button", { name: "カメラ" })
        .querySelector(".lucide-camera"),
    ).not.toBeNull();
    expect(
      within(mobileHeader)
        .getByRole("button", { name: "チャットを開く" })
        .querySelector(".lucide-message-circle"),
    ).not.toBeNull();

    expect(within(mobileNav).getByRole("button", { name: "ホーム" })).toBeTruthy();
  });

  it("keeps the mobile header compact until the home hero is reached again", async () => {
    installMobileHome();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
    const { container } = await renderSazoCommercePage();
    const root = container.querySelector(".sazo-root");

    window.scrollY = 160;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(root?.getAttribute("data-header-collapsed")).toBe("true");
    });

    window.scrollY = 120;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(root?.getAttribute("data-header-collapsed")).toBe("true");
    });

    window.scrollY = 0;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(root?.getAttribute("data-header-collapsed")).toBe("false");
    });
  });

  it("opens the empty agent search state from the mobile header search bar", async () => {
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");
    const mobileHeader = within(mobileShell).getByRole("banner");

    fireEvent.click(
      within(mobileHeader).getByRole("button", { name: "URL・画像・商品名をAIに渡す" }),
    );

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
        "agent-hub",
      );
    });
    expect(container.querySelector("[data-mobile-agent-hub]")).not.toBeNull();
    expect(screen.queryByRole("dialog", { name: "J-Planet AIエージェント" })).toBeNull();
    expect(screen.getByPlaceholderText("URL・画像・商品名を送る")).toBeTruthy();
  });

  it("opens the camera-capable picker from the mobile header camera button", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click");
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");

    fireEvent.click(within(mobileShell).getByRole("button", { name: "カメラ" }));

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
        "agent-hub",
      );
      expect(click).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByLabelText("カメラ", { selector: "input" }).getAttribute("capture"),
    ).toBe("environment");
  });

  it("opens the J-Planet chat from the mobile header", async () => {
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");

    fireEvent.click(within(mobileShell).getByRole("button", { name: "チャットを開く" }));

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")?.getAttribute("data-overlay")).toBe(
        "chat",
      );
    });
    expect(screen.getByRole("dialog", { name: "J-Planetチャット" })).toBeTruthy();
  });

  it("keeps the complete mobile secondary menu after opening support", async () => {
    installMobileHome();
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");
    const shortcutRail = screen.getByRole("group", {
      name: "J-Planetショートカット",
    });

    fireEvent.click(within(shortcutRail).getByRole("button", { name: "ヘルプ" }));

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
        "support",
      );
    });
    const supportSecondary = within(mobileShell).getByRole("navigation", {
      name: "モバイルサブメニュー",
    });
    expect(
      within(supportSecondary)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual([
      "ホーム",
      "サービス紹介",
      "人気ブランド",
      "カテゴリー",
      "レビュー",
      "ヘルプ",
      "お知らせ",
    ]);
  });

  it("groups the desktop AI search, icon actions, and navigation in one header card", async () => {
    const { container } = await renderSazoCommercePage();
    const desktopShell = getShell(container, "desktop");
    const headerCard = desktopShell.querySelector<HTMLElement>(
      ".sazo-desktop-header-card",
    );

    expect(headerCard).not.toBeNull();
    if (headerCard === null) return;

    const header = getDesktopHeader(headerCard);
    const navigation = within(headerCard).getByRole("navigation", {
      name: "メインメニュー",
    });
    const search = within(header).getByRole("button", { name: "AI検索を開く" });
    const login = within(header).getByRole("button", { name: "ログイン" });

    expect(headerCard.contains(header)).toBe(true);
    expect(headerCard.contains(navigation)).toBe(true);
    expect(search.querySelector(".lucide-search")).not.toBeNull();
    expect(login.querySelector(".lucide-user-round")).not.toBeNull();
  });

  it("backs the centered desktop header card with a full-width band", async () => {
    const { container } = await renderSazoCommercePage();
    const desktopShell = getShell(container, "desktop");
    const headerBand = desktopShell.querySelector<HTMLElement>(
      ".sazo-desktop-header-band",
    );

    expect(headerBand).not.toBeNull();
    if (headerBand === null) return;

    const headerCard = headerBand.querySelector<HTMLElement>(".sazo-desktop-header-card");

    expect(headerCard).not.toBeNull();
    expect(getDesktopHeader(headerBand)).toBeTruthy();
    expect(
      within(headerBand).getByRole("navigation", { name: "メインメニュー" }),
    ).toBeTruthy();
  });

  it.each(["desktop", "mobile"] as const)(
    "keeps header, navigation, main, and footer inside the %s shell",
    async (shellName) => {
      const { container } = await renderSazoCommercePage();
      const shell = getShell(container, shellName);
      const navigationLabel =
        shellName === "desktop" ? "メインメニュー" : "モバイルメニュー";

      expect(
        shellName === "desktop"
          ? getDesktopHeader(shell)
          : within(shell).getByRole("banner"),
      ).toBeTruthy();
      expect(
        within(shell).getByRole("navigation", { name: navigationLabel }),
      ).toBeTruthy();
      expect(within(shell).getByRole("main")).toBeTruthy();
      expect(within(shell).getByRole("contentinfo")).toBeTruthy();
    },
  );

  it("dispatches desktop brand navigation without changing the mobile route model", async () => {
    const { container } = await renderSazoCommercePage();
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const desktopShell = getShell(container, "desktop");
    const mobileShell = getShell(container, "mobile");
    const desktopNav = within(desktopShell).getByRole("navigation", {
      name: "メインメニュー",
    });
    const mobileNav = within(mobileShell).getByRole("navigation", {
      name: "モバイルメニュー",
    });
    const brands = within(desktopNav).getByRole("button", { name: "ブランド" });

    fireEvent.click(brands);

    expect(root?.dataset.view).toBe("brands");
    expect(brands.getAttribute("aria-pressed")).toBe("true");
    expect(mobileNav.getAttribute("aria-hidden")).not.toBe("true");
  });

  it("navigates to the dedicated hub from the fixed agent item", async () => {
    const { container } = await renderSazoCommercePage();
    const mobileNav = getShell(container, "mobile").querySelector(".sazo-mobile-nav");
    const agent = within(mobileNav as HTMLElement).getByRole("button", {
      name: "エージェント",
    });

    fireEvent.click(agent);

    expect(container.querySelector(".sazo-root")?.getAttribute("data-view")).toBe(
      "agent-hub",
    );
    expect(agent.getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByRole("dialog", { name: "J-Planet AIエージェント" })).toBeNull();
  });

  it("mounts the dedicated hub without the generic mobile header", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=agent-hub");
    const { container } = await renderSazoCommercePage();

    expect(container.querySelector("[data-mobile-agent-hub]")).not.toBeNull();
    expect(container.querySelector(".sazo-mobile-shell .sazo-mobile-header")).toBeNull();
    expect(container.querySelector(".sazo-mobile-nav")).not.toBeNull();
  });

  it("mounts BEAUTY with its dedicated header and keeps the fixed mobile nav", async () => {
    window.history.replaceState({}, "", "/sazo-commerce-mock/?qa=1&view=beauty");
    const { container } = await renderSazoCommercePage();

    expect(container.querySelector("[data-beauty-view]")).not.toBeNull();
    expect(container.querySelector(".sazo-mobile-shell .sazo-mobile-header")).toBeNull();
    expect(container.querySelector("[data-beauty-header]")).not.toBeNull();
    expect(container.querySelector(".sazo-mobile-nav")).not.toBeNull();
  });

  it.each([
    ["ja", "エージェント"],
    ["en", "Agent"],
    ["pt-BR", "Agente"],
  ] as const)("localizes the mobile agent navigation for %s", async (locale, label) => {
    const { container } = await renderSazoCommercePage(locale);
    const mobileNav = within(getShell(container, "mobile")).getByRole("navigation", {
      name: "モバイルメニュー",
    });

    expect(within(mobileNav).getByRole("button", { name: label })).toBeTruthy();
  });

  it("dispatches login and exposes the expanded overlay state", async () => {
    const { container } = await renderSazoCommercePage();
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const mobileNav = within(getShell(container, "mobile")).getByRole("navigation", {
      name: "モバイルメニュー",
    });
    const login = within(mobileNav).getByRole("button", { name: "マイページ" });

    fireEvent.click(login);

    expect(root?.dataset.overlay).toBe("login");
    expect(login.getAttribute("aria-expanded")).toBe("true");
  });

  it("dispatches chat and exposes the expanded overlay state", async () => {
    const { container } = await renderSazoCommercePage();
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const chat = within(getShell(container, "mobile")).getByRole("button", {
      name: "チャットを開く",
    });

    fireEvent.click(chat);

    expect(root?.dataset.overlay).toBe("chat");
    expect(chat.getAttribute("aria-expanded")).toBe("true");
  });

  it.each(["ja", "en", "pt-BR"] as const)(
    "keeps the shared J-Planet desktop labels available for %s",
    async (locale) => {
      const markup = await renderSazoCommerceMarkup(locale);

      expect(markup).toContain("J-Planet");
      expect(markup).toContain("AI検索");
      expect(markup).toContain("ブランド");
      expect(markup).toContain("商品カテゴリー");
    },
  );
});

describe("App route safety", () => {
  it("reaches the SAZO shell through its wildcard route", async () => {
    const { container } = await renderAppAt("/sazo-commerce-mock/catalog");

    await waitFor(() => {
      expect(container.querySelector(".sazo-root")).not.toBeNull();
    });
    expect(await screen.findAllByRole("button", { name: "人気ブランド" })).toHaveLength(2);
  });

  it("keeps the existing localized home route reachable", async () => {
    await renderAppAt("/ja");

    expect(await screen.findByText("Making")).toBeTruthy();
  });
});
