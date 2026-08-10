// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { MobileAgentHubView } from "@/sazo-commerce/MobileAgentHubView";

afterEach(() => {
  cleanup();
});

async function renderHub(locale: "ja" | "en" | "pt-BR" = "ja", dispatch = vi.fn()) {
  const i18n = await createI18n(locale);

  return {
    dispatch,
    ...render(
      <I18nextProvider i18n={i18n}>
        <MobileAgentHubView dispatch={dispatch} />
      </I18nextProvider>,
    ),
  };
}

describe("MobileAgentHubView", () => {
  it("renders the SAZO-inspired sections in the approved order", async () => {
    await renderHub("ja");

    expect(
      screen
        .getAllByTestId("agent-hub-section")
        .map((section) => section.dataset.section),
    ).toEqual(["consultations", "recent-products", "popular-topics", "footer"]);
    expect(screen.getByText("最近の相談")).toBeTruthy();
    expect(screen.getByText("最近見た商品")).toBeTruthy();
    expect(screen.getByText("J-Planet AI")).toBeTruthy();
    expect(screen.getByText("ブラジルで人気の日本アイテム")).toBeTruthy();
    expect(screen.getAllByRole("listitem", { name: /位/ })).toHaveLength(20);
  });

  it("keeps the four header controls in order and leaves the cart inert", async () => {
    const dispatch = vi.fn();
    const { container } = await renderHub("ja", dispatch);

    const header = container.querySelector<HTMLElement>(".sazo-agent-hub-header");
    if (header === null) {
      throw new Error("Agent hub header is missing");
    }
    const back = within(header).getByRole("button", { name: "ホームへ戻る" });
    const launcher = within(header).getByRole("button", {
      name: "AIエージェントに相談",
    });
    const home = within(header).getByRole("button", { name: "J-Planet ホーム" });
    const cart = within(header).getByRole("button", { name: "カート" });

    expect(within(header).getAllByRole("button")).toEqual([back, launcher, home, cart]);

    fireEvent.click(launcher);
    fireEvent.click(home);
    fireEvent.click(cart);

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: "open-agent" });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: "navigate", view: "home" });
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("dispatches shared agent, home, product, and catalog actions", async () => {
    const dispatch = vi.fn();
    await renderHub("ja", dispatch);

    fireEvent.click(screen.getByRole("button", { name: "AIエージェントに相談" }));
    fireEvent.click(screen.getByRole("button", { name: "ホームへ戻る" }));
    const [firstProductButton] = screen.getAllByRole("button", {
      name: /商品詳細を見る/,
    });
    if (firstProductButton === undefined) {
      throw new Error("Recent product button is missing");
    }
    fireEvent.click(firstProductButton);
    fireEvent.click(screen.getByRole("button", { name: "1位 アニメグッズ" }));

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: "open-agent" });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: "navigate", view: "home" });
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: "open-product",
      // Vitest's asymmetric matcher is intentionally typed as any.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      productId: expect.any(String),
    });
    expect(dispatch).toHaveBeenNthCalledWith(4, {
      type: "navigate",
      view: "catalog",
    });
  });

  it("clears only the requested transient section", async () => {
    await renderHub("ja");

    fireEvent.click(screen.getByRole("button", { name: "最近の相談を削除" }));
    expect(screen.queryByText("日本限定スニーカーを探したい")).toBeNull();
    expect(screen.getAllByRole("button", { name: /商品詳細を見る/ })).toHaveLength(3);
  });

  it.each([
    [
      "ja",
      "URL・画像・商品名をAIに相談",
      ["最近の相談", "最近見た商品", "J-Planet AI", "ブラジルで人気の日本アイテム"],
    ],
    [
      "en",
      "Ask AI about a URL, image, or product name",
      [
        "Recent consultations",
        "Recently viewed products",
        "J-Planet AI",
        "Popular Japanese items in Brazil",
      ],
    ],
    [
      "pt-BR",
      "Consulte a IA com URL, imagem ou nome do produto",
      [
        "Consultas recentes",
        "Produtos vistos recentemente",
        "J-Planet AI",
        "Itens japoneses populares no Brasil",
      ],
    ],
  ] as const)(
    "renders the translated launcher and section headings for %s",
    async (locale, launcher, headings) => {
      await renderHub(locale);

      expect(screen.getByText(launcher)).toBeTruthy();
      for (const heading of headings) {
        expect(screen.getByText(heading)).toBeTruthy();
      }
    },
  );
});
