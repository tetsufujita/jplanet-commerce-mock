// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function renderWithI18n(element: React.ReactNode) {
  const i18n = await createI18n("ja");

  return render(React.createElement(I18nextProvider, { i18n }, element));
}

describe("J-Planet public demo data", () => {
  it("replaces personal account, Google chooser, and address values in a public build", async () => {
    vi.stubEnv("VITE_PUBLIC_DEMO", "1");
    vi.resetModules();

    const fixtures = await import("@/sazo-commerce/fixtures");
    const account = fixtures.sazoAccountFixture;
    const googleAccounts = fixtures.sazoGoogleAccountFixtures;
    const addresses = fixtures.sazoCheckoutAddresses;

    expect(account).toMatchObject({
      displayName: "J-Planet Demo",
      email: "demo@jplanet.example",
      phone: "00000000000",
    });
    expect(googleAccounts).toEqual([
      {
        avatar: "J",
        displayName: "J-Planet デモユーザー",
        email: "demo@jplanet.example",
      },
      {
        avatar: "D",
        displayName: "公開デモアカウント",
        email: "demo-2@jplanet.example",
      },
    ]);
    expect(addresses).toEqual([
      {
        detail: "Avenida Paulista · São Paulo, SP",
        id: "paulista",
        name: "J-Planet Demo",
      },
      {
        detail: "Pinheiros · São Paulo, SP",
        id: "pinheiros",
        name: "J-Planet Demo",
      },
    ]);
  });

  it("keeps the existing local mock identity outside the public build", async () => {
    vi.stubEnv("VITE_PUBLIC_DEMO", "0");
    vi.resetModules();

    const fixtures = await import("@/sazo-commerce/fixtures");

    expect(fixtures.sazoAccountFixture.displayName).toBe("Tetsu Fujita");
    expect(fixtures.sazoAccountFixture.email).toBe("tetsu.fujita@andes.global");
    expect(fixtures.sazoCheckoutAddresses[0]?.detail).toBe(
      "Av. Paulista 1000 · Bela Vista · São Paulo, SP",
    );
  });

  it("renders anonymized identity values across public login, My Page, and checkout", async () => {
    vi.stubEnv("VITE_PUBLIC_DEMO", "1");
    vi.resetModules();

    const [{ AuthFlow }, { MyPageView }, { CheckoutView }] = await Promise.all([
      import("@/sazo-commerce/AuthFlow"),
      import("@/sazo-commerce/AccountViews"),
      import("@/sazo-commerce/CheckoutView"),
    ]);
    const dispatch = vi.fn();

    await renderWithI18n(
      React.createElement(AuthFlow, { authStep: "google", dispatch }),
    );
    expect(screen.getByText("J-Planet デモユーザー")).toBeTruthy();
    expect(screen.queryByText("tetsu.fujita@andes.global")).toBeNull();
    cleanup();

    await renderWithI18n(React.createElement(MyPageView, { dispatch }));
    expect(screen.getByRole("button", { name: "J-Planet Demo さん" })).toBeTruthy();
    expect(screen.queryByText("Tetsu Fujita")).toBeNull();
    cleanup();

    await renderWithI18n(
      React.createElement(CheckoutView, {
        dispatch,
        items: [
          {
            option: "カラー: ホワイト",
            productId: "jplanet-nintendo-switch-oled",
            quantity: 1,
          },
        ],
      }),
    );
    expect(screen.getByText("Avenida Paulista · São Paulo, SP")).toBeTruthy();
    expect(screen.queryByText(/Av\. Paulista 1000/)).toBeNull();
  });
});
