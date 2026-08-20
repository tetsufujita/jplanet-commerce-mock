// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiSearchView } from "@/sazo-commerce/AiSearchView";
import { imageSearchResolvedNewBalanceProductId } from "@/sazo-commerce/imageProductResolutionFixtures";
import { createInitialSazoState, JPLANET_PRODUCT_DETAIL_ID } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderAiSearch(state = createInitialSazoState()) {
  const dispatch = vi.fn();
  const result = render(<AiSearchView dispatch={dispatch} state={state} />);

  return { dispatch, ...result };
}

describe("AiSearchView", () => {
  it("autofocuses agent entry but keeps direct AI search idle", () => {
    renderAiSearch();

    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");
    expect(input).toBeTruthy();
    expect(document.activeElement).not.toBe(input);

    cleanup();
    renderAiSearch({
      ...createInitialSazoState(),
      agentEntryIntent: "compose",
      view: "agent-hub",
    });

    expect(document.activeElement).toBe(
      screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索"),
    );
  });

  it("keeps history first and presents a non-interactive J-Planet bridge", () => {
    const { container } = renderAiSearch();
    const main = container.querySelector<HTMLElement>(".sazo-ai-search-main");
    if (main === null) throw new Error("Missing AI-search initial state");

    expect(Array.from(main.children).map((child) => child.className)).toEqual([
      "sazo-ai-search-recent",
      "sazo-ai-search-agent-bridge",
      "sazo-ai-search-popular",
    ]);

    const bridge = within(main).getByRole("region", {
      name: "欲しい商品を、J-Planetに相談",
    });
    expect(
      within(bridge).getByText(
        "日本の商品を、ブラジルで買える条件まで確認します。",
      ),
    ).toBeTruthy();
    for (const label of ["販売元", "購入可否", "関税・配送", "BRL総額"]) {
      expect(within(bridge).getByText(label, { exact: true })).toBeTruthy();
    }
    expect(bridge.querySelectorAll("button, a, input")).toHaveLength(0);

    expect(screen.queryByText("AI検索で商品を探してみよう！")).toBeNull();
    expect(screen.queryByText("商品名や型番を入力")).toBeNull();
    for (const label of ["写真から探す", "URLを貼る", "商品名を入力"]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }

    const popular = within(main).getByRole("region", { name: "今、人気の検索" });
    expect(within(popular).getAllByRole("button")).toHaveLength(5);
    for (const label of [
      "New Balance 9060",
      "Nintendo Switch",
      "ユニクロ",
      "SK-II 化粧水",
      "アネッサ 日焼け止め",
    ]) {
      expect(within(popular).getByRole("button", { name: label })).toBeTruthy();
    }
    expect(
      within(popular).queryByRole("button", {
        name: "オニツカタイガー",
      }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "敏感肌 化粧水を検索履歴から削除" }),
    );
    expect(screen.queryByText("敏感肌 化粧水")).toBeNull();
    expect(screen.getByRole("list", { name: "最近の検索" }).textContent).toContain(
      "New Balance 9060",
    );

    fireEvent.click(screen.getByRole("button", { name: "すべての検索履歴を削除" }));
    expect(screen.queryByText("最近の検索")).toBeNull();
    expect(Array.from(main.children).map((child) => child.className)).toEqual([
      "sazo-ai-search-agent-bridge",
      "sazo-ai-search-popular",
    ]);
  });

  it("keeps text, URL, and image search paths distinct", () => {
    const { dispatch } = renderAiSearch();
    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "New Balance 9060" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(dispatch).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText("海外ショップも含めて検索しました。")).toBeTruthy();
    expect(screen.getByText("全体 128件")).toBeTruthy();

    fireEvent.change(input, { target: { value: "https://example.com/product" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-product",
      productId: JPLANET_PRODUCT_DETAIL_ID,
    });

    const imageInput = screen.getByTestId("ai-search-image-input") as HTMLInputElement;
    const image = new File(["image"], "shoe.png", { type: "image/png" });
    fireEvent.change(imageInput, { target: { files: [image] } });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "start-agent-search",
      request: {
        candidateResolution: true,
        imageName: "shoe.png",
        imageResolution: true,
        summary: "shoe.png",
      },
    });
  });

  it("groups New Balance 9060 results by purchase certainty and opens the existing detail", () => {
    const { dispatch, container } = renderAiSearch();
    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");

    fireEvent.change(input, { target: { value: "New Balance 9060" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(screen.getByRole("heading", { name: "一般・すぐ買える" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "限定・ハイブランド" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "フリマ・中古" })).toBeTruthy();
    expect(container.querySelectorAll(".sazo-ai-search-result-image img")).toHaveLength(
      9,
    );
    expect(
      Array.from(container.querySelectorAll(".sazo-ai-search-result-copy strong")).every(
        (name) => name.textContent?.includes("New Balance 9060") === true,
      ),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "限定" }));
    expect(screen.getByText("限定 19件")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "一般・すぐ買える" })).toBeNull();
    expect(screen.getByRole("heading", { name: "限定・ハイブランド" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "全体" }));
    const saveButton = screen.getByRole("button", {
      name: "New Balance 9060 グリーン ホワイトを保存",
    });
    fireEvent.click(saveButton);
    expect(saveButton.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(
      screen.getByRole("button", {
        name: "New Balance 9060 グリーン ホワイトの商品詳細を見る",
      }),
    );
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-image-search-product",
      productId: imageSearchResolvedNewBalanceProductId,
    });

    fireEvent.click(screen.getByRole("button", { name: "検索語を削除" }));
    expect(screen.getByText("最近の検索")).toBeTruthy();
  });

  it("omits fulfillment and quote status copy from compact result cards", () => {
    renderAiSearch();
    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");

    fireEvent.change(input, { target: { value: "New Balance 9060" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(screen.queryAllByText("日本から直送")).toHaveLength(0);
    expect(screen.queryAllByText("見積確認")).toHaveLength(0);
    expect(screen.queryAllByText("状態確認")).toHaveLength(0);
  });

  it("shows varied marketplace logos instead of repeated J-Planet labels", () => {
    const { container } = renderAiSearch();
    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");

    fireEvent.change(input, { target: { value: "New Balance 9060" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    const results = container.querySelector<HTMLElement>(
      "[data-ai-search-results]",
    );
    if (results === null) throw new Error("Missing AI-search results");

    expect(within(results).queryAllByText("J-Planet")).toHaveLength(0);

    const sourceLogos = within(results).getAllByRole("img", {
      name: /販売サイト.*モック/,
    });
    expect(sourceLogos).toHaveLength(9);
    expect(
      new Set(sourceLogos.map((logo) => logo.getAttribute("src"))).size,
    ).toBeGreaterThanOrEqual(3);
  });

  it("translates Portuguese toner searches and renders the dedicated cosmetics result", () => {
    const { dispatch, container } = renderAiSearch();
    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");

    fireEvent.change(input, { target: { value: "loção facial" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect((input as HTMLInputElement).value).toBe("loção facial");
    expect(screen.getByText("「化粧水」")).toBeTruthy();
    expect(screen.getByText("に翻訳して検索しました。")).toBeTruthy();
    expect(screen.getByText("全体 1726件")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "一般・すぐ買える" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "限定・ハイブランド" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "フリマ・未開封" })).toBeTruthy();
    expect(container.querySelectorAll(".sazo-ai-search-result-image img")).toHaveLength(
      9,
    );
    expect(screen.getByText("肌ラボ 極潤ヒアルロン液 しっとりタイプ")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "フリマ" }));
    expect(screen.getByText("フリマ 92件")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "一般・すぐ買える" })).toBeNull();
    expect(screen.getByRole("heading", { name: "フリマ・未開封" })).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: "雪肌精 薬用雪肌精 化粧水 未開封のスキンケア商品を見る",
      }),
    );
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "navigate",
      view: "skincare-catalog",
    });

    fireEvent.change(input, { target: { value: "化粧水" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(screen.getByText("日本語の商品名「化粧水」で検索しました。")).toBeTruthy();
    expect(screen.getByText("全体 1726件")).toBeTruthy();
  });

  it("does not submit blank text and keeps a popular keyword search in AI results", () => {
    const { dispatch } = renderAiSearch();
    const input = screen.getByPlaceholderText("商品名・キーワード・画像・URLで検索");

    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(dispatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Nintendo Switch" }));
    expect(dispatch).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("Nintendo Switch");
    expect(screen.getByText("「Nintendo Switch」で検索しました。")).toBeTruthy();
    expect(screen.getByText("全体 9件")).toBeTruthy();
  });

  it("shows the top five ranked searches and keeps the fifth row actionable", () => {
    const { dispatch } = renderAiSearch();
    const popularSection = screen
      .getByRole("heading", { name: "今、人気の検索" })
      .closest("section");

    if (popularSection === null) {
      throw new Error("Popular search section was not rendered");
    }

    const popularSearches = within(popularSection).getAllByRole("button");

    expect(popularSearches.map((button) => button.textContent)).toEqual([
      "1New Balance 9060",
      "2Nintendo Switch",
      "3ユニクロ",
      "4SK-II 化粧水",
      "5アネッサ 日焼け止め",
    ]);

    fireEvent.click(popularSearches[4]!);
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText("「アネッサ 日焼け止め」で検索しました。")).toBeTruthy();
    expect(screen.getByText("全体 9件")).toBeTruthy();
  });

  it("returns to home and preserves the shared cart action", () => {
    const { dispatch } = renderAiSearch();

    fireEvent.click(screen.getByRole("button", { name: "ホームに戻る" }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "navigate", view: "home" });

    fireEvent.click(screen.getByRole("button", { name: "カート" }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "navigate", view: "cart" });
  });
});
