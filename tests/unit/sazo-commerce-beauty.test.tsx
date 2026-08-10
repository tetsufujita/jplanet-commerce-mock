// @vitest-environment jsdom
import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { BeautyView } from "@/sazo-commerce/BeautyView";
import type { SazoAction } from "@/sazo-commerce/model";
import {
  beautyCategories,
  beautyProductsByCategory,
  beautyTrendKeywords,
  beautyTrendProducts,
} from "@/sazo-commerce/beautyFixtures";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function renderBeauty(dispatch: (action: SazoAction) => void = () => undefined) {
  const i18n = await createI18n("ja");

  return render(
    <I18nextProvider i18n={i18n}>
      <BeautyView dispatch={dispatch} />
    </I18nextProvider>,
  );
}

describe("J-Planet BEAUTY fixtures", () => {
  it("keeps the recorded category order and scrollable three-column mobile rails", () => {
    expect(beautyCategories.map(({ id, label }) => [id, label])).toEqual([
      ["skincare", "スキンケア"],
      ["mask-pack", "マスクパック"],
      ["cleansing", "クレンジング"],
      ["sun-care", "日焼け止め"],
      ["makeup", "メイクアップ"],
      ["mens-care", "メンズケア"],
      ["fragrance", "香水"],
      ["hair-care", "ヘアケア"],
    ]);

    for (const { id } of beautyCategories) {
      expect(beautyProductsByCategory[id]).toHaveLength(6);
    }
    expect(beautyTrendProducts).toHaveLength(6);
    expect(beautyTrendKeywords).toHaveLength(7);
  });

  it("keeps search input inside BEAUTY and never opens the agent", async () => {
    const dispatch = vi.fn();
    await renderBeauty(dispatch);

    const input = screen.getByRole("searchbox", { name: "BEAUTYの商品を検索" });
    fireEvent.change(input, { target: { value: "美容液" } });
    const form = input.closest("form");
    expect(form).not.toBeNull();
    if (form === null) return;
    fireEvent.submit(form);

    expect((input as HTMLInputElement).value).toBe("美容液");
    expect(dispatch).not.toHaveBeenCalledWith({ type: "open-agent" });
    expect(dispatch).not.toHaveBeenCalledWith({ type: "navigate", view: "agent-hub" });
    expect(screen.getByRole("button", { name: "検索する" })).toBeTruthy();
  });

  it("loads a category and renders six products after the latest request settles", async () => {
    vi.useFakeTimers();
    await renderBeauty();

    expect(screen.getByRole("button", { name: "スキンケア" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "マスクパック" }));
    expect(screen.getByRole("status", { name: "マスクパックの商品を読み込んでいます" })).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByRole("button", { name: "マスクパック" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("sazo-beauty-product-rail").querySelectorAll("article")).toHaveLength(6);
  });

  it("opens product detail from a BEAUTY card and handles empty results", async () => {
    const dispatch = vi.fn();
    await renderBeauty(dispatch);

    fireEvent.click(screen.getByRole("button", { name: /高保湿ビタミンC美容液/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: "open-product", productId: "p01" });

    const input = screen.getByRole("searchbox", { name: "BEAUTYの商品を検索" });
    fireEvent.change(input, { target: { value: "__該当なし__" } });
    const form = input.closest("form");
    expect(form).not.toBeNull();
    if (form === null) return;
    fireEvent.submit(form);
    expect(screen.getByText("該当する商品がありません")).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "BEAUTYの商品を検索" })).toBeTruthy();
  });

  it("renders the dedicated header, trends, focus action, and image fallback", async () => {
    await renderBeauty();

    expect(screen.getByText("J-Planet")).toBeTruthy();
    expect(screen.getByText("BEAUTY")).toBeTruthy();
    for (const label of ["コスメ", "ヘルプ", "お知らせ"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByText("今話題のJ-Beautyトレンド")).toBeTruthy();
    expect(screen.getAllByRole("listitem", { name: /トレンドキーワード/ })).toHaveLength(7);

    const searchAction = screen.getByRole("button", { name: "検索へ移動" });
    fireEvent.click(searchAction);
    expect(document.activeElement).toBe(screen.getByRole("searchbox", { name: "BEAUTYの商品を検索" }));

    const image = screen.getByRole("img", { name: "高保湿ビタミンC美容液" });
    fireEvent.error(image);
    await waitFor(() => {
    expect(screen.getByTestId("sazo-beauty-image-fallback")).toBeTruthy();
    });
  });

  it("keeps the recorded mobile geometry contract in the authoritative stylesheet", () => {
    const css = readFileSync(join(process.cwd(), "src/sazo-commerce/sazo.css"), "utf8");

    expect(css).toContain('.sazo-root[data-view="beauty"] .sazo-beauty-header');
    expect(css).toContain("position: fixed");
    expect(css).toContain("--sazo-beauty-green: #63df16");
    expect(css).toContain("grid-auto-columns: calc((100% - 16px) / 3)");
    expect(css).toContain("overflow-x: auto");
    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain('.sazo-root[data-view="beauty"] .sazo-beauty-search:focus-within');
  });
});
