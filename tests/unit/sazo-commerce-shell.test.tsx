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
import { afterEach, describe, expect, it } from "vitest";
import { App } from "@/App";
import { createI18n } from "@/i18n/createI18n";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

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

describe("SazoCommercePage shell", () => {
  it("renders the official J-Planet wordmark in both responsive shells", async () => {
    const { container } = await renderSazoCommercePage();
    const wordmarks = Array.from(
      container.querySelectorAll<HTMLImageElement>(
        ".sazo-wordmark img[data-jplanet-wordmark]",
      ),
    );

    expect(wordmarks).toHaveLength(2);
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
    const desktopHeader = within(desktopShell).getByRole("banner");
    const desktopNav = within(desktopShell).getByRole("navigation", {
      name: "メインメニュー",
    });
    const mobileNav = within(mobileShell).getByRole("navigation", {
      name: "モバイルメニュー",
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
      expect(within(desktopNav).getByRole("button", { name: label })).toBeTruthy();
    }

    for (const label of ["お気に入り", "カート", "通知", "ログイン", "言語"]) {
      expect(within(desktopHeader).getByRole("button", { name: label })).toBeTruthy();
    }

    expect(
      within(desktopNav)
        .getByRole("button", { name: "ホーム" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    expect(within(mobileNav).getAllByRole("button")).toHaveLength(5);
    for (const label of [
      "ホーム",
      "通知",
      "エージェント",
      "お気に入り",
      "マイページ",
    ]) {
      expect(within(mobileNav).getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("renders the two-row mobile home header", async () => {
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");
    const mobileHeader = within(mobileShell).getByRole("banner");

    for (const label of ["言語", "検索", "カート"]) {
      expect(within(mobileHeader).getByRole("button", { name: label })).toBeTruthy();
    }

    const secondary = within(mobileHeader).getByRole("navigation", {
      name: "モバイルサブメニュー",
    });
    expect(within(secondary).getAllByRole("button")).toHaveLength(7);
    expect(within(secondary).getByRole("button", { name: "ヘルプ" })).toBeTruthy();
    expect(within(secondary).getByRole("button", { name: "お知らせ" })).toBeTruthy();
    expect(
      within(secondary).getByRole("button", { name: "ホーム" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("keeps the complete mobile secondary menu after opening support", async () => {
    const { container } = await renderSazoCommercePage();
    const mobileShell = getShell(container, "mobile");
    const homeSecondary = within(mobileShell).getByRole("navigation", {
      name: "モバイルサブメニュー",
    });

    fireEvent.click(within(homeSecondary).getByRole("button", { name: "ヘルプ" }));

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

  it("groups the desktop search, icon actions, and navigation in one header card", async () => {
    const { container } = await renderSazoCommercePage();
    const desktopShell = getShell(container, "desktop");
    const headerCard = desktopShell.querySelector<HTMLElement>(
      ".sazo-desktop-header-card",
    );

    expect(headerCard).not.toBeNull();
    if (headerCard === null) return;

    const header = within(headerCard).getByRole("banner");
    const navigation = within(headerCard).getByRole("navigation", {
      name: "メインメニュー",
    });
    const search = within(header).getByRole("search");
    const login = within(header).getByRole("button", { name: "ログイン" });
    const language = within(header).getByRole("button", { name: "言語" });

    expect(headerCard.contains(header)).toBe(true);
    expect(headerCard.contains(navigation)).toBe(true);
    expect(search.querySelector(".lucide-clipboard-paste")).not.toBeNull();
    expect(search.querySelector(".lucide-chevron-down")).not.toBeNull();
    expect(login.querySelector(".lucide-user-round")).not.toBeNull();
    expect(language.querySelector(".sazo-language-flag")?.textContent).toBe("🇯🇵");
  });

  it("backs the centered desktop header card with a full-width band", async () => {
    const { container } = await renderSazoCommercePage();
    const desktopShell = getShell(container, "desktop");
    const headerBand = desktopShell.querySelector<HTMLElement>(
      ".sazo-desktop-header-band",
    );

    expect(headerBand).not.toBeNull();
    if (headerBand === null) return;

    const headerCard = headerBand.querySelector<HTMLElement>(
      ".sazo-desktop-header-card",
    );

    expect(headerCard).not.toBeNull();
    expect(within(headerBand).getByRole("banner")).toBeTruthy();
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

      expect(within(shell).getByRole("banner")).toBeTruthy();
      expect(
        within(shell).getByRole("navigation", { name: navigationLabel }),
      ).toBeTruthy();
      expect(within(shell).getByRole("main")).toBeTruthy();
      expect(within(shell).getByRole("contentinfo")).toBeTruthy();
    },
  );

  it("dispatches navigation and exposes service visibility state", async () => {
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
    const service = within(desktopNav).getByRole("button", { name: "サービス紹介" });

    fireEvent.click(service);

    expect(root?.dataset.view).toBe("service");
    expect(service.getAttribute("aria-pressed")).toBe("true");
    expect(mobileNav.getAttribute("aria-hidden")).toBe("true");
    expect(within(mobileShell).getByRole("banner")).toBeTruthy();
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
    expect(
      container.querySelector(".sazo-mobile-shell .sazo-mobile-header"),
    ).toBeNull();
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
    const chat = screen.getByRole("button", { name: "チャットを開く" });

    fireEvent.click(chat);

    expect(root?.dataset.overlay).toBe("chat");
    expect(chat.getAttribute("aria-expanded")).toBe("true");
  });

  it.each(["ja", "en", "pt-BR"] as const)(
    "keeps the captured Japanese labels fixed for %s",
    async (locale) => {
      const markup = await renderSazoCommerceMarkup(locale);

      expect(markup).toContain("キーワードまたはURLを入力");
      expect(markup).toContain("サービス紹介");
      expect(markup).toContain("人気ブランド");
      expect(markup).toContain("お気に入り");
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
