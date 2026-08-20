// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  jplanetBrandDirectory,
  nikeBrandProducts,
} from "@/sazo-commerce/fixtures";
import {
  JplanetBrandDetailView,
  JplanetBrandsView,
} from "@/sazo-commerce/JplanetBrandViews";
import { createInitialSazoState } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
});

function brandState() {
  return { ...createInitialSazoState(), view: "brands" as const };
}

describe("J-Planet brand directory", () => {
  it("filters the eight structured brands by category and English or Japanese name", () => {
    const dispatch = vi.fn();
    render(<JplanetBrandsView dispatch={dispatch} state={brandState()} />);

    expect(screen.getByText("全体 8件")).toBeTruthy();
    expect(jplanetBrandDirectory).toHaveLength(8);

    fireEvent.click(screen.getByRole("button", { name: "家電" }));
    expect(screen.getByText("APPLE")).toBeTruthy();
    expect(screen.getByText("SONY")).toBeTruthy();
    expect(screen.queryByText("NIKE")).toBeNull();

    fireEvent.change(screen.getByRole("searchbox", { name: "ブランド・商品を検索" }), {
      target: { value: "ソニー" },
    });
    expect(screen.getByText("家電 1件")).toBeTruthy();
    expect(screen.getByText("SONY")).toBeTruthy();
    expect(screen.queryByText("APPLE")).toBeNull();
  });

  it("shows an actionable empty search state and clears its criteria", () => {
    render(<JplanetBrandsView dispatch={vi.fn()} state={brandState()} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "ブランド・商品を検索" }), {
      target: { value: "存在しないブランド" },
    });
    expect(screen.getByText("該当するブランドはありません")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "検索条件をクリア" }));
    expect(screen.getByText("全体 8件")).toBeTruthy();
  });

  it("keeps brand saving separate from opening the shared NIKE detail", () => {
    const dispatch = vi.fn();
    render(<JplanetBrandsView dispatch={dispatch} state={brandState()} />);

    const [saveNike] = screen.getAllByRole("button", { name: "ブランドを保存" });
    if (saveNike === undefined) throw new Error("Missing NIKE save button");
    fireEvent.click(saveNike);
    expect(dispatch).toHaveBeenLastCalledWith({ type: "toggle-saved-brand", brandId: "nike" });
    expect(dispatch).not.toHaveBeenCalledWith({ type: "open-brand-detail" });

    fireEvent.click(screen.getByRole("button", { name: "NIKEを開く" }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "open-brand-detail" });
  });

  it("keeps the brand directory focused on search and brand filters", () => {
    render(<JplanetBrandsView dispatch={vi.fn()} state={brandState()} />);

    expect(screen.queryByRole("tablist", { name: "ブランド一覧タブ" })).toBeNull();
    expect(screen.queryByRole("region", { name: "商品カテゴリー" })).toBeNull();
    expect(screen.getAllByRole("searchbox")).toHaveLength(1);
    expect(screen.getByRole("searchbox", { name: "ブランド・商品を検索" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "全体" })).toBeTruthy();
    expect(screen.getByText("全体 8件")).toBeTruthy();
  });
});

describe("J-Planet NIKE brand detail", () => {
  it("renders data-derived rails and changes every section more link into its tab", () => {
    const dispatch = vi.fn();
    const state = { ...brandState(), brandLoading: false, view: "brand-detail" as const };
    render(<JplanetBrandDetailView dispatch={dispatch} state={state} />);

    expect(screen.getByText(`全体${String(nikeBrandProducts.length)}件`)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "最安値・一般" })).toBeTruthy();

    const [moreGeneral] = screen.getAllByRole("button", { name: "最安値・一般をもっと見る" });
    if (moreGeneral === undefined) throw new Error("Missing general more button");
    fireEvent.click(moreGeneral);
    expect(screen.getByRole("tab", { name: "最安値" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("最安値 12件")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /商品詳細を開く/ })).toHaveLength(12);
  });

  it("keeps product saves separate and routes a product card through the common product detail", () => {
    const dispatch = vi.fn();
    const state = { ...brandState(), brandLoading: false, view: "brand-detail" as const };
    render(<JplanetBrandDetailView dispatch={dispatch} state={state} />);

    const [saveProduct] = screen.getAllByRole("button", { name: "商品を保存" });
    if (saveProduct === undefined) throw new Error("Missing product save button");
    fireEvent.click(saveProduct);
    expect(dispatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Air Jordan 1 Retro High OGの商品詳細を開く" }));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "open-product",
      productId: "nike-air-jordan-1-retro",
    });
  });

  it("uses the J-Planet loading state and an empty cosmetics category", () => {
    const loadingState = { ...brandState(), brandLoading: true, view: "brand-detail" as const };
    const { rerender } = render(<JplanetBrandDetailView dispatch={vi.fn()} state={loadingState} />);
    expect(screen.getByRole("status", { name: "ブランド商品を読み込んでいます" })).toBeTruthy();

    rerender(
      <JplanetBrandDetailView
        dispatch={vi.fn()}
        state={{ ...loadingState, brandLoading: false }}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "コスメ" }));
    expect(screen.getByText("現在表示できる商品はありません")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ほかのカテゴリを見る" })).toBeTruthy();
  });
});
