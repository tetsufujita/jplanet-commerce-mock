// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { MobileAgentHubView } from "@/sazo-commerce/MobileAgentHubView";
import type { AgentEntryIntent } from "@/sazo-commerce/model";

const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
const scrollIntoView = vi.fn();

function installReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
    writable: true,
  });
}

beforeEach(() => {
  scrollIntoView.mockClear();
  installReducedMotion(false);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
    writable: true,
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  if (originalScrollIntoView !== undefined) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoView);
  }
  Reflect.deleteProperty(window, "matchMedia");
  if (originalMatchMedia !== undefined) {
    Object.defineProperty(window, "matchMedia", originalMatchMedia);
  }
});

async function renderHub(
  locale: "ja" | "en" | "pt-BR" = "ja",
  dispatch = vi.fn(),
  entryIntent: AgentEntryIntent | null = null,
) {
  const i18n = await createI18n(locale);

  return {
    dispatch,
    ...render(
      <I18nextProvider i18n={i18n}>
        <MobileAgentHubView dispatch={dispatch} entryIntent={entryIntent} />
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
    ).toEqual([
      "composer",
      "consultations",
      "recent-products",
      "popular-topics",
      "footer",
    ]);
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

    expect(dispatch).toHaveBeenCalledWith({ type: "navigate", view: "home" });
    expect(dispatch).not.toHaveBeenCalledWith({ type: "open-agent" });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["standard motion", false, "smooth"],
    ["reduced motion", true, "auto"],
  ] as const)("scrolls to the composer with %s behavior", async (_label, reduced, behavior) => {
    installReducedMotion(reduced);
    await renderHub("ja");

    fireEvent.click(screen.getByRole("button", { name: "AIエージェントに相談" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior, block: "start" });
  });

  it("exposes stable hooks for the mobile hub layout", async () => {
    const { container } = await renderHub("ja");

    expect(container.querySelector(".sazo-mobile-agent-composer")).not.toBeNull();
    expect(
      container.querySelector(".sazo-agent-hub > .sazo-agent-hub-header"),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".sazo-agent-hub-header > .sazo-agent-hub-launcher",
      ),
    ).not.toBeNull();
    expect(container.querySelectorAll(".sazo-agent-hub-consultation-row")).toHaveLength(
      3,
    );
    expect(container.querySelector(".sazo-agent-hub-product-rail")).not.toBeNull();
    expect(container.querySelectorAll(".sazo-agent-hub-product-card")).toHaveLength(3);
    expect(container.querySelector(".sazo-agent-hub-ranked-list")).not.toBeNull();
    expect(container.querySelectorAll(".sazo-agent-hub-ranked-row")).toHaveLength(20);
    expect(container.querySelector(".sazo-agent-hub-footer")).not.toBeNull();
  });

  it("dispatches home and product actions while seeding the composer from ranked topics", async () => {
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
    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "1位 アニメグッズ" }));
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    });

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: "navigate", view: "home" });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "open-product",
      // Vitest's asymmetric matcher is intentionally typed as any.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      productId: expect.any(String),
    });
    expect(dispatch).not.toHaveBeenCalledWith({ type: "open-agent" });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: "商品名で相談" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: "探したい商品" }).value).toBe(
      "アニメグッズ",
    );
  });

  it("reapplies the same ranked topic after the draft is edited", async () => {
    await renderHub("ja");
    const rankedTopic = screen.getByRole("button", { name: "1位 アニメグッズ" });

    fireEvent.click(rankedTopic);
    const draft = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "探したい商品",
    });
    expect(draft.value).toBe("アニメグッズ");

    fireEvent.change(draft, { target: { value: "編集した相談内容" } });
    expect(draft.value).toBe("編集した相談内容");
    fireEvent.click(rankedTopic);
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });

    expect(draft.value).toBe("アニメグッズ");
  });

  it("consumes the image picker intent through the embedded composer", async () => {
    const dispatch = vi.fn();
    await renderHub("ja", dispatch, "image-picker");

    expect(dispatch).toHaveBeenCalledWith({ type: "consume-agent-entry-intent" });
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
