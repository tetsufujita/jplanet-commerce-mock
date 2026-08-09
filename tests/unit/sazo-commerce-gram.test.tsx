// @vitest-environment jsdom

import type { Dispatch } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { GramCatalogView, GramDetailView } from "@/sazo-commerce/GramView";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import {
  createInitialSazoState,
  type SazoAction,
  type SazoState,
} from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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

async function renderCommercePage() {
  const i18n = await createI18n("ja");
  return render(
    <I18nextProvider i18n={i18n}>
      <SazoCommercePage />
    </I18nextProvider>,
  );
}

async function renderGram(
  state: SazoState,
  dispatch: Dispatch<SazoAction> = vi.fn(),
  view: "catalog" | "detail" = "catalog",
) {
  const i18n = await createI18n("ja");
  const content = (nextState: SazoState) =>
    view === "detail" ? (
      <GramDetailView dispatch={dispatch} state={nextState} />
    ) : (
      <GramCatalogView dispatch={dispatch} state={nextState} />
    );
  const result = render(<I18nextProvider i18n={i18n}>{content(state)}</I18nextProvider>);

  return {
    ...result,
    rerenderWithState: (nextState: SazoState) => {
      result.rerender(
        <I18nextProvider i18n={i18n}>{content(nextState)}</I18nextProvider>,
      );
    },
  };
}

it("opens a post detail with vertical media and related products", async () => {
  const dispatch = vi.fn();
  await renderGram({ ...createInitialSazoState(), view: "gram" }, dispatch);
  const firstPost = screen.getAllByRole("button", { name: /投稿を開く:/ })[0];
  if (firstPost === undefined) {
    throw new Error("The first GRAM post is missing");
  }
  fireEvent.click(firstPost);
  expect(dispatch).toHaveBeenCalledWith({ type: "open-gram-post", postId: "gram-01" });

  cleanup();
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    dispatch,
    "detail",
  );
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("SPAO");
  expect(screen.getByRole("region", { name: "縦型投稿メディア" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "商品一覧" })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: /商品を見る:/ })).toHaveLength(2);
});

it("plays, advances, and pauses the demo progress", async () => {
  vi.useFakeTimers();
  installReducedMotion(false);
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    vi.fn(),
    "detail",
  );
  const progress = screen.getByRole("progressbar", { name: "投稿の再生位置" });

  fireEvent.click(screen.getByRole("button", { name: "再生" }));
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(Number(progress.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
  const paused = progress.getAttribute("aria-valuenow");
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(progress.getAttribute("aria-valuenow")).toBe(paused);
});

it("keeps progress static when reduced motion is requested", async () => {
  vi.useFakeTimers();
  installReducedMotion(true);
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    vi.fn(),
    "detail",
  );
  fireEvent.click(screen.getByRole("button", { name: "再生" }));
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(
    screen
      .getByRole("progressbar", { name: "投稿の再生位置" })
      .getAttribute("aria-valuenow"),
  ).toBe("0");
});

it("opens an existing product detail and leaves demo-only products local", async () => {
  const dispatch = vi.fn();
  await renderGram(
    { ...createInitialSazoState(), selectedGramPostId: "gram-01", view: "gram-detail" },
    dispatch,
    "detail",
  );
  const local = screen.getByRole("button", { name: /商品を見る: \[たまごっち\]/ });
  fireEvent.click(local);
  expect(local.getAttribute("aria-pressed")).toBe("true");
  expect(dispatch).not.toHaveBeenCalled();

  const linked = screen.getByRole("button", { name: /商品を見る:.*リンク済み/ });
  fireEvent.click(linked);
  expect(dispatch).toHaveBeenCalledWith({
    type: "open-product",
    productId: "p01",
  });
});

it("renders the recorded category order and ten interactive post cards", async () => {
  await renderGram({ ...createInitialSazoState(), view: "gram" });

  expect(screen.getAllByRole("button", { name: /カテゴリ:/ })).toHaveLength(11);
  expect(screen.getAllByRole("button", { name: /投稿を開く:/ })).toHaveLength(10);
  expect(document.querySelectorAll(".sazo-gram-catalog-product img")).toHaveLength(10);
  expect(document.querySelectorAll(".sazo-gram-catalog-discount")).toHaveLength(5);
  expect(
    screen.getByText("20%", { selector: ".sazo-gram-catalog-discount" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "カテゴリ: 全体" }).getAttribute("aria-pressed"),
  ).toBe("true");
});

it("dispatches category selection and preserves a ten-card loading outline", async () => {
  const dispatch = vi.fn();
  const { rerenderWithState } = await renderGram(createInitialSazoState(), dispatch);

  fireEvent.click(screen.getByRole("button", { name: "カテゴリ: HOT🔥" }));
  expect(dispatch).toHaveBeenCalledWith({
    type: "select-gram-category",
    category: "hot",
  });

  rerenderWithState({
    ...createInitialSazoState(),
    gramCategory: "hot",
    gramLoading: true,
    view: "gram",
  });
  expect(
    screen
      .getByRole("status", { name: "投稿を読み込み中" })
      .classList.contains("sazo-gram-loading-spinner"),
  ).toBe(true);
  expect(document.querySelectorAll(".sazo-gram-skeleton-card")).toHaveLength(10);
});

it("keeps the last selected category loading for a full 500ms", async () => {
  vi.useFakeTimers();
  installReducedMotion(true);
  await renderCommercePage();
  const section = screen
    .getByRole("heading", { name: "J-Planet GRAM" })
    .closest("section");
  if (section === null) {
    throw new Error("J-Planet GRAM home section is missing");
  }
  fireEvent.click(within(section).getByRole("button", { name: "もっと見る" }));
  fireEvent.click(screen.getByRole("button", { name: "カテゴリ: HOT🔥" }));
  act(() => {
    vi.advanceTimersByTime(200);
  });
  fireEvent.click(screen.getByRole("button", { name: "カテゴリ: 日用品" }));
  act(() => {
    vi.advanceTimersByTime(499);
  });
  expect(screen.getByRole("status", { name: "投稿を読み込み中" })).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(screen.queryByRole("status", { name: "投稿を読み込み中" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "カテゴリ: 日用品" }).getAttribute("aria-pressed"),
  ).toBe("true");
});

it("disables GRAM loading and hover motion for reduced-motion users", () => {
  const css = readFileSync(join(process.cwd(), "src/sazo-commerce/sazo.css"), "utf8");

  expect(css).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.sazo-root \.sazo-gram-skeleton-card::after,\s*\.sazo-root \.sazo-gram-loading-spinner\s*{[^}]*animation:\s*none/s,
  );
  expect(css).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.sazo-root \.sazo-gram-catalog-card:hover\s*{[^}]*transform:\s*none/s,
  );
});
