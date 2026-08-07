// @vitest-environment jsdom

import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { HomeView } from "@/sazo-commerce/HomeView";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import { createInitialSazoState } from "@/sazo-commerce/model";
import { useSazoHero } from "@/sazo-commerce/useSazoHero";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function includesInOrder(markup: string, values: readonly string[]) {
  let previousIndex = -1;

  for (const value of values) {
    const nextIndex = markup.indexOf(value, previousIndex + 1);

    expect(
      nextIndex,
      `Expected ${value} after index ${String(previousIndex)}`,
    ).toBeGreaterThan(previousIndex);
    previousIndex = nextIndex;
  }
}

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

async function renderHomePage() {
  const i18n = await createI18n("ja");

  return render(
    <I18nextProvider i18n={i18n}>
      <SazoCommercePage />
    </I18nextProvider>,
  );
}

function HeroTicker({
  intervalMs = 5_000,
  onNext,
  paused = false,
}: {
  intervalMs?: number;
  onNext: () => void;
  paused?: boolean;
}) {
  useSazoHero({ intervalMs, onNext, paused });

  return null;
}

describe("SAZO home composition", () => {
  it("renders the captured home sections and fixture content in order", async () => {
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={createInitialSazoState()} />
      </I18nextProvider>,
    );

    includesInOrder(markup, [
      "新規特典がリニューアル",
      "SAZO特集",
      "日本最大級",
      "みんなの口コミ",
      "SAZO GRAM",
      "レビュー高評価のおすすめ",
      "SAZO RANKING",
    ]);
    expect(markup).toContain('aria-label="次のバナー"');
    expect(markup).toContain("1/5");
    expect(markup).toContain("¥3,799");
  });

  it("mounts the stateful home view only once across responsive shells", async () => {
    const { container } = await renderHomePage();

    expect(container.querySelectorAll("[data-home-view]")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "次のバナー" })).toHaveLength(1);
  });

  it("keeps GRAM, customer review, and recommendation assets in their captured sections", async () => {
    const { container } = await renderHomePage();
    const sectionImages = (heading: string) => {
      const section = screen.getByRole("heading", { name: heading }).closest("section");

      expect(section).not.toBeNull();

      return Array.from(section?.querySelectorAll<HTMLImageElement>("img") ?? []).map(
        ({ src }) => new URL(src).pathname,
      );
    };

    expect(sectionImages("みんなの口コミ")).toEqual([
      "/sazo-commerce/community/06.webp",
      "/sazo-commerce/community/07.webp",
      "/sazo-commerce/community/05.webp",
      "/sazo-commerce/community/04.webp",
      "/sazo-commerce/community/08.webp",
      "/sazo-commerce/community/09.webp",
    ]);
    const reviewSection = screen
      .getByRole("heading", { name: "みんなの口コミ" })
      .closest("section");

    includesInOrder(reviewSection?.textContent ?? "", [
      "17♡",
      "なー",
      "T",
      "mm",
      "村上ラッペ",
      "코코",
    ]);
    expect(sectionImages("SAZO GRAM")).toEqual([
      "/sazo-commerce/community/01.webp",
      "/sazo-commerce/community/02.webp",
      "/sazo-commerce/community/03.webp",
    ]);
    expect(sectionImages("レビュー高評価のおすすめ")).toEqual([
      "/sazo-commerce/recommendations/01.webp",
      "/sazo-commerce/recommendations/02.webp",
    ]);
    expect(container.querySelectorAll(".sazo-recommendation")).toHaveLength(2);
    expect(container.querySelectorAll(".sazo-gram-catalog-card")).toHaveLength(10);
    expect(
      Array.from(
        container.querySelectorAll<HTMLImageElement>(".sazo-gram-catalog-card img"),
      ).map(({ src }) => new URL(src).pathname),
    ).toEqual([
      "/sazo-commerce/community/12.webp",
      "/sazo-commerce/community/13.webp",
      "/sazo-commerce/community/14.webp",
      "/sazo-commerce/gram/list-02.png",
      "/sazo-commerce/gram/list-04.png",
      "/sazo-commerce/gram/list-05.png",
    ]);
  });
});

describe("SAZO hero controls", () => {
  it("advances, reverses, wraps, and pauses through the live controls", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    await renderHomePage();

    const counter = screen.getByTestId("sazo-hero-counter");
    const next = screen.getByRole("button", { name: "次のバナー" });
    const previous = screen.getByRole("button", { name: "前のバナー" });

    expect(counter.textContent).toBe("1/5");
    fireEvent.click(previous);
    expect(counter.textContent).toBe("5/5");
    fireEvent.click(next);
    expect(counter.textContent).toBe("1/5");

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(counter.textContent).toBe("2/5");

    fireEvent.click(screen.getByRole("button", { name: "バナーを一時停止" }));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(counter.textContent).toBe("2/5");
    expect(screen.getByRole("button", { name: "バナーを再生" })).toBeTruthy();
  });

  it("keeps the live pause control visible, focusable, and visually stateful on every slide", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    await renderHomePage();

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    const pause = screen.getByRole("button", { name: "バナーを一時停止" });
    const status = screen.getByTestId("sazo-hero-counter").parentElement;

    pause.focus();
    expect(document.activeElement).toBe(pause);
    expect(status).not.toBeNull();
    expect(pause.querySelector(".lucide-pause")).not.toBeNull();

    fireEvent.click(pause);
    const play = screen.getByRole("button", { name: "バナーを再生" });
    expect(play.querySelector(".lucide-play")).not.toBeNull();
  });

  it("uses one-slot circular neighbors at both wrap boundaries", async () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const { container } = await renderHomePage();
    const offsetFor = (slide: string) =>
      container
        .querySelector(`[data-hero-slide="${slide}"]`)
        ?.getAttribute("data-hero-offset");

    expect(offsetFor("delivery-line")).toBe("0");
    expect(offsetFor("friend-invite")).toBe("-2");
    expect(offsetFor("new-benefits")).toBe("-1");

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    }
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("4/5");
    expect(screen.getAllByText("4/5")).toHaveLength(1);
    expect(
      container
        .querySelector('[data-hero-slide="friend-invite"] img')
        ?.getAttribute("src"),
    ).toBe("/sazo-commerce/hero/slide-5.webp");
    expect(
      container.querySelectorAll(
        '[data-hero-slide="friend-invite"] .sazo-hero-arrow, [data-hero-slide="friend-invite"] .sazo-hero-status',
      ),
    ).toHaveLength(0);
    expect(offsetFor("friend-invite")).toBe("0");
    expect(offsetFor("cold-delivery")).toBe("-1");
    expect(offsetFor("new-benefits")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("5/5");
    expect(offsetFor("friend-invite")).toBe("-1");
    expect(offsetFor("new-benefits")).toBe("0");
    expect(offsetFor("delivery-line")).toBe("1");
  });

  it("provides isotropic mobile hero sources at the rendered 1.62 ratio", async () => {
    const { container } = await renderHomePage();
    const sources = Array.from(
      container.querySelectorAll<HTMLSourceElement>(
        '.sazo-hero-slide source[media="(max-width: 767px)"]',
      ),
    );

    expect(sources).toHaveLength(5);
    expect(
      sources.map((source) => ({
        height: source.getAttribute("height"),
        srcSet: source.getAttribute("srcset"),
        width: source.getAttribute("width"),
      })),
    ).toEqual([
      {
        height: "490",
        srcSet: "/sazo-commerce/hero/slide-1.webp",
        width: "1200",
      },
      {
        height: "490",
        srcSet: "/sazo-commerce/hero/slide-3.webp",
        width: "1200",
      },
      ...[4, 5, 2].map((slide) => ({
        height: "490",
        srcSet: `/sazo-commerce/hero/mobile/slide-${String(slide)}.webp`,
        width: "794",
      })),
    ]);
  });
});

describe("useSazoHero", () => {
  it("advances every interval and clears the timer on unmount", () => {
    installReducedMotion(false);
    vi.useFakeTimers();
    const onNext = vi.fn();
    const { unmount } = render(<HeroTicker onNext={onNext} />);

    act(() => {
      vi.advanceTimersByTime(9_999);
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onNext).toHaveBeenCalledTimes(2);

    unmount();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it("does not auto-advance while paused or reduced motion is requested", () => {
    vi.useFakeTimers();
    const pausedNext = vi.fn();
    installReducedMotion(false);
    const { unmount } = render(<HeroTicker onNext={pausedNext} paused />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(pausedNext).not.toHaveBeenCalled();
    unmount();

    const reducedMotionNext = vi.fn();
    installReducedMotion(true);
    render(<HeroTicker onNext={reducedMotionNext} />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(reducedMotionNext).not.toHaveBeenCalled();
  });
});
