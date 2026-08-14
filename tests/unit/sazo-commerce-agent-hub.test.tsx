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
  it("renders the compact agent form, newest two submissions, disclosure, and a separate recent-products rail", async () => {
    const { container } = await renderHub();

    expect(container.querySelector('[data-mobile-agent-hub][data-scenario="normal"]')).not.toBeNull();
    expect(screen.getByRole("heading", { name: "購入エージェント" })).toBeTruthy();
    expect(screen.getByPlaceholderText("URL・画像・商品名を送る")).toBeTruthy();
    expect(screen.getByRole("button", { name: "カメラ" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "送信履歴" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /の結果を見る$/ })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /過去の送信履歴 18件/ }).getAttribute(
        "aria-expanded",
      ),
    ).toBe("false");
    expect(screen.getByRole("heading", { name: "最近見た商品" })).toBeTruthy();
    expect(container.querySelectorAll(".sazo-agent-hub-product-card")).toHaveLength(4);
  });

  it("keeps older submission history collapsed until its disclosure is activated", async () => {
    await renderHub();
    const disclosure = screen.getByRole("button", { name: /過去の送信履歴 18件/ });

    expect(screen.queryByText("8月10日 10:11")).toBeNull();
    fireEvent.click(disclosure);

    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("8月10日 10:11")).toBeTruthy();
    expect(screen.getByRole("button", { name: /履歴を閉じる/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /履歴を閉じる/ }));
    expect(screen.queryByText("8月10日 10:11")).toBeNull();
  });

  it("opens the shared J-Planet detail flow from a submission result or a recently viewed product", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch });

    fireEvent.click(screen.getByRole("button", { name: "New Balance 9060の結果を見る" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Nintendo Switch OLEDの商品詳細を見る" }),
    );

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "open-product",
      productId: "rakuten-new-balance",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "open-product",
      productId: "jplanet-nintendo-switch-oled",
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

  it("starts the existing product lookup from the compact composer", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch });

    fireEvent.change(screen.getByPlaceholderText("URL・画像・商品名を送る"), {
      target: { value: "日本限定スニーカー" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(dispatch).toHaveBeenCalledWith({
      type: "start-agent-search",
      request: { imageName: null, summary: "日本限定スニーカー" },
    });
  });

  it("does not render ambiguous purchase status or generic result sections in the normal state", async () => {
    await renderHub();

    expect(screen.queryByText("購入可能")).toBeNull();
    expect(screen.queryByText("確認待ち")).toBeNull();
    expect(screen.queryByText("進行中")).toBeNull();
    expect(screen.queryByText("確認結果")).toBeNull();
    expect(screen.queryByText("カラーを選ぶと確定")).toBeNull();
    expect(screen.queryByRole("button", { name: "カートに入れる" })).toBeNull();
    expect(screen.queryByTestId("agent-customs-action-card")).toBeNull();
  });

  it("only displays the concrete customs action in the fixture-driven exception state", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch, scenario: "customs-action" });

    const action = screen.getByTestId("agent-customs-action-card");
    expect(action.textContent).toContain("通関手続きに必要な情報があります");
    expect(action.textContent).toContain("Air Jordan 1 Retro High OG");
    expect(action.textContent).toContain("SNKRS Japan の商品ページを送信");
    expect(action.textContent).toContain("受取人情報を入力してください");
    expect(action.textContent).toContain("通関に提出する情報として必要です");
    expect(action.textContent).toContain("CPF・お届け先の確認");

    fireEvent.click(screen.getByRole("button", { name: "情報を入力する" }));
    const dialog = screen.getByRole("dialog", { name: "CPF・お届け先を確認" });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "CPF" }), {
      target: { value: "123.456.789-00" },
    });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "お届け先" }), {
      target: { value: "São Paulo, Brazil" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "入力内容を保存する" }));

    expect(screen.queryByTestId("agent-customs-action-card")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("受取人情報を保存しました");
    expect(dispatch).toHaveBeenCalledWith({ type: "complete-agent-customs-action" });
  });

  it("consumes a camera-entry intent through the shared composer", async () => {
    const dispatch = createDispatch();
    await renderHub({ dispatch, entryIntent: "camera" });

    expect(dispatch).toHaveBeenCalledWith({ type: "consume-agent-entry-intent" });
  });
});
