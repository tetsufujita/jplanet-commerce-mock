// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { MobileAgentHubView } from "@/sazo-commerce/MobileAgentHubView";
import type {
  AgentEntryIntent,
  AgentHubScenario,
  SazoAction,
} from "@/sazo-commerce/model";

const createDispatch = () => vi.fn<(action: SazoAction) => void>();

afterEach(() => {
  cleanup();
});

async function renderHub({
  dispatch = createDispatch(),
  entryIntent = null,
  scenario = "normal",
}: {
  dispatch?: ReturnType<typeof createDispatch>;
  entryIntent?: AgentEntryIntent | null;
  scenario?: AgentHubScenario;
} = {}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
    writable: true,
  });
  const i18n = await createI18n("ja");

  return {
    dispatch,
    ...render(
      <I18nextProvider i18n={i18n}>
        <MobileAgentHubView
          dispatch={dispatch}
          entryIntent={entryIntent}
          scenario={scenario}
        />
      </I18nextProvider>,
    ),
  };
}

describe("MobileAgentHubView", () => {
  it("renders the search entry, removable intents, two recent products, and the lower discovery sections", async () => {
    const { container } = await renderHub();

    expect(container.querySelector("[data-desktop-agent-hub]")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "AIで商品を探す" })).toBeTruthy();
    expect(
      screen.getByText("商品名・キーワード・画像・URLから商品を探します。"),
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索"),
    ).toBeTruthy();
    expect(screen.getByText("URLは商品ページを直接開きます")).toBeTruthy();
    const composer = container.querySelector<HTMLElement>('[data-section="agent-search"]');
    if (composer === null) throw new Error("Agent composer section is missing");
    expect(within(composer).getByRole("button", { name: "カメラ" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "最近の検索" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "最近の検索" }).children).toHaveLength(3);
    expect(screen.getByRole("button", { name: "検索履歴を全消去" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "最近確認した商品" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /の商品を見る$/ })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "すべて見る（8件）" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "よく検索されるキーワード" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "よく検索されるキーワード" }).children).toHaveLength(5);
    expect(screen.getByRole("button", { name: "AI検索の使い方" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByTestId("agent-popular-products").querySelectorAll("[data-testid='home-dense-product-card']")).toHaveLength(4);

    expect(screen.queryByText("送信履歴")).toBeNull();
    expect(screen.queryByText("過去の送信履歴 18件")).toBeNull();
    expect(screen.queryByText("購入判断が完了しました")).toBeNull();
    expect(container.querySelector("[data-jplanet-sakura-mark]")).not.toBeNull();
  });

  it("removes individual search intents and clears the remaining search history", async () => {
    await renderHub();
    const history = screen.getByRole("list", { name: "最近の検索" });

    fireEvent.click(screen.getByRole("button", { name: "Nintendo Switchを削除" }));
    expect(history.children).toHaveLength(2);
    expect(within(history).queryByText("Nintendo Switch")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "検索履歴を全消去" }));
    expect(history.children).toHaveLength(0);
    expect(
      (screen.getByRole("button", { name: "検索履歴を全消去" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("expands the viewed-product list to all eight rows, then closes it back to two", async () => {
    await renderHub();

    expect(screen.getAllByRole("button", { name: /の商品を見る$/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "すべて見る（8件）" }));
    expect(screen.getAllByRole("button", { name: /の商品を見る$/ })).toHaveLength(8);
    expect(screen.getByRole("button", { name: "閉じる" }).getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.getAllByRole("button", { name: /の商品を見る$/ })).toHaveLength(2);
  });

  it("opens the usage steps on demand and resolves a common keyword through the shared product flow", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch });
    const howItWorks = screen.getByRole("button", { name: "AI検索の使い方" });

    fireEvent.click(howItWorks);
    expect(howItWorks.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("URLで検索")).toBeTruthy();
    expect(screen.getByText("画像で検索")).toBeTruthy();
    expect(screen.getByText("商品名で検索")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "カメラ" })[0]!);
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "open-product" }));
    fireEvent.click(screen.getByRole("button", { name: "フィギュア" }));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-product",
      productId: "jplanet-character-figure",
    });
  });

  it("opens the usage steps by default for the empty first-visit mock state", async () => {
    await renderHub({ scenario: "empty" });

    expect(screen.getByRole("list", { name: "最近の検索" }).children).toHaveLength(0);
    expect(screen.getByText("まだ確認した商品はありません")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "すべて見る（8件）" })).toBeNull();
    expect(screen.getByRole("button", { name: "AI検索の使い方" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("URLで検索")).toBeTruthy();
  });

  it("opens the shared product-detail flow from a viewed-product CTA and directly from a search", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch });

    fireEvent.click(screen.getByRole("button", { name: "Sony α7C IIの商品を見る" }));
    fireEvent.change(screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索"), {
      target: { value: "日本限定スニーカー" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "open-product",
      productId: "jplanet-sony-a7c-ii",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "start-agent-search",
      request: {
        imageName: null,
        imageResolution: false,
        summary: "日本限定スニーカー",
      },
    });
  });

  it("keeps the real wordmark, cart, and chat controls in the compact header", async () => {
    const dispatch = createDispatch();
    const { container } = await renderHub({ dispatch });
    const header = container.querySelector<HTMLElement>(".sazo-agent-hub-header");

    if (header === null) {
      throw new Error("Agent header is missing");
    }

    expect(header.querySelector("[data-jplanet-wordmark]")).not.toBeNull();
    fireEvent.click(within(header).getByRole("button", { name: "J-Planet ホーム" }));
    fireEvent.click(within(header).getByRole("button", { name: "カート" }));
    fireEvent.click(within(header).getByRole("button", { name: "チャット" }));

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: "navigate", view: "home" });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: "navigate", view: "cart" });
    expect(dispatch).toHaveBeenNthCalledWith(3, { type: "open-chat" });
  });

  it("does not mix the opt-in legacy exception scenario into the normal agent search surface", async () => {
    await renderHub({ scenario: "customs-action" });

    expect(screen.queryByText("通関手続きに必要な情報があります")).toBeNull();
    expect(screen.queryByText("CPF・お届け先の確認")).toBeNull();
    expect(screen.queryByText("進行中")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("consumes a camera-entry intent through the shared composer", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch, entryIntent: "camera" });

    expect(dispatch).toHaveBeenCalledWith({ type: "consume-agent-entry-intent" });
  });
});
