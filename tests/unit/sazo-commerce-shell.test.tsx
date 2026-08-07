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
    for (const label of ["ホーム", "通知", "検索", "お気に入り", "ログイン"]) {
      expect(within(mobileNav).getByRole("button", { name: label })).toBeTruthy();
    }
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

  it("dispatches catalog navigation from the mobile search control", async () => {
    const { container } = await renderSazoCommercePage();
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const mobileNav = within(getShell(container, "mobile")).getByRole("navigation", {
      name: "モバイルメニュー",
    });
    const search = within(mobileNav).getByRole("button", { name: "検索" });

    fireEvent.click(search);

    expect(root?.dataset.view).toBe("catalog");
    expect(search.getAttribute("aria-pressed")).toBe("true");
  });

  it("dispatches login and exposes the expanded overlay state", async () => {
    const { container } = await renderSazoCommercePage();
    const root = container.querySelector<HTMLElement>(".sazo-root");
    const mobileNav = within(getShell(container, "mobile")).getByRole("navigation", {
      name: "モバイルメニュー",
    });
    const login = within(mobileNav).getByRole("button", { name: "ログイン" });

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
    expect(await screen.findAllByRole("button", { name: "人気ブランド" })).toHaveLength(
      2,
    );
  });

  it("keeps the existing localized home route reachable", async () => {
    await renderAppAt("/ja");

    expect(await screen.findByText("Making")).toBeTruthy();
  });
});
