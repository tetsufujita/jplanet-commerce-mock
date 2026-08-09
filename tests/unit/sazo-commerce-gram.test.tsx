// @vitest-environment jsdom

import type { Dispatch } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { GramCatalogView } from "@/sazo-commerce/GramView";
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

async function renderGram(state: SazoState, dispatch: Dispatch<SazoAction> = vi.fn()) {
  const i18n = await createI18n("ja");
  const result = render(
    <I18nextProvider i18n={i18n}>
      <GramCatalogView dispatch={dispatch} state={state} />
    </I18nextProvider>,
  );

  return {
    ...result,
    rerenderWithState: (nextState: SazoState) => {
      result.rerender(
        <I18nextProvider i18n={i18n}>
          <GramCatalogView dispatch={dispatch} state={nextState} />
        </I18nextProvider>,
      );
    },
  };
}

it("renders the recorded category order and ten interactive post cards", async () => {
  await renderGram({ ...createInitialSazoState(), view: "gram" });

  expect(screen.getAllByRole("button", { name: /カテゴリ:/ })).toHaveLength(11);
  expect(screen.getAllByRole("button", { name: /投稿を開く:/ })).toHaveLength(10);
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
