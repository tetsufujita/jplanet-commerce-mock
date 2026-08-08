// @vitest-environment jsdom

import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PNG } from "pngjs";
import { createI18n } from "@/i18n/createI18n";
import { HomeView } from "@/sazo-commerce/HomeView";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";
import { searchDiscoveryMediaCrops } from "@/sazo-commerce/fixtures";
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
  it("promotes the Japan-to-Brazil direct-shipping offer", async () => {
    const { container } = await renderHomePage();
    const introHeading = container.querySelector(".sazo-home-intro h1");
    const introBody = container.querySelector(".sazo-home-intro p");

    expect(introHeading?.textContent.trim().split("\n")).toEqual([
      "ブラジル最大級",
      "日本直輸入ショップ",
    ]);
    expect(introBody?.textContent).toBe(
      "J-Planetは日本の人気ショップの商品を購入し、ブラジルへ直接お届けします",
    );
  });

  it("renders deterministic keyword skeletons without product-card UI", async () => {
    const i18n = await createI18n("ja");
    const state = {
      ...createInitialSazoState(),
      loadingSurface: "keyword-products",
    } as ReturnType<typeof createInitialSazoState>;
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={state} />
      </I18nextProvider>,
    );
    const keywordSection = container.querySelector(".sazo-keyword-section");

    expect(keywordSection?.querySelectorAll(".sazo-keyword-skeleton")).toHaveLength(5);
    expect(keywordSection?.querySelectorAll(".sazo-product-card")).toHaveLength(0);
  });

  it("keeps the first recorded search image pending only for its QA checkpoint", async () => {
    const i18n = await createI18n("ja");
    const state = {
      ...createInitialSazoState(),
      loadingSurface: "search-first",
    } as ReturnType<typeof createInitialSazoState>;
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={state} />
      </I18nextProvider>,
    );
    const cards = container.querySelectorAll(
      ".sazo-search-discovery .sazo-product-card-media",
    );

    expect(cards).toHaveLength(4);
    expect(cards[0]?.querySelector("img")).toBeNull();
    expect(container.querySelectorAll(".sazo-search-discovery img")).toHaveLength(3);
    const firstCard = cards[0]?.closest(".sazo-product-card");

    expect(
      firstCard?.querySelector(":scope > button.sazo-product-favorite"),
    ).not.toBeNull();
    expect(
      firstCard?.querySelector(".sazo-product-open .sazo-product-favorite"),
    ).toBeNull();
  });

  it("renders the captured home sections and fixture content in order", async () => {
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <HomeView dispatch={() => undefined} state={createInitialSazoState()} />
      </I18nextProvider>,
    );

    includesInOrder(markup, [
      "新規特典がリニューアル",
      "J-Planet特集",
      "ブラジル最大級",
      "みんなの口コミ",
      "J-Planet GRAM",
      "レビュー高評価のおすすめ",
      "J-Planet RANKING",
    ]);
    expect(markup).toContain('aria-label="次のバナー"');
    expect(markup).toContain("1/5");
    expect(markup).toContain("¥3,799");
  });

  it("renders crisp pop J-Planet shortcut artwork", async () => {
    const { container } = await renderHomePage();
    const shortcutGroup = screen.getByRole("group", {
      name: "J-Planetショートカット",
    });

    expect(
      screen.getByRole("button", { name: "J-Planet特集" }),
    ).toBeTruthy();
    expect(
      shortcutGroup.querySelectorAll("img[data-jplanet-sakura-mark]"),
    ).toHaveLength(1);
    expect(
      shortcutGroup.querySelectorAll("svg[data-jplanet-shortcut-icon]"),
    ).toHaveLength(4);
    expect(shortcutGroup.querySelectorAll('img[src*="/shortcuts/"]')).toHaveLength(0);
    expect(container.querySelectorAll(".sazo-shortcut-badge")).toHaveLength(2);
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
      "/sazo-commerce/review-media/r06.jpg",
      "/sazo-commerce/review-media/r02.jpg",
      "/sazo-commerce/review-media/r03.jpg",
      "/sazo-commerce/review-media/r01.jpg",
      "/sazo-commerce/review-media/r04.jpg",
      "/sazo-commerce/review-media/r05.jpg",
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
    for (const card of reviewSection?.querySelectorAll(".sazo-review-card") ?? []) {
      expect(card.querySelectorAll("[data-review-author-layer='dom']")).toHaveLength(1);
      expect(
        new URL(card.querySelector("img")?.src ?? "", window.location.origin).pathname,
      ).toMatch(/^\/sazo-commerce\/review-media\/r\d{2}\.jpg$/);
    }
    expect(sectionImages("J-Planet GRAM")).toEqual([
      "/sazo-commerce/community/01.webp",
      "/sazo-commerce/community/01.webp",
      "/sazo-commerce/gram/home/02.png",
      "/sazo-commerce/gram/home/02-thumb.png",
      "/sazo-commerce/community/03.webp",
      "/sazo-commerce/community/03.webp",
    ]);
    const gramSection = screen
      .getByRole("heading", { name: "J-Planet GRAM" })
      .closest("section");
    includesInOrder(gramSection?.textContent ?? "", [
      "[たまごっち]長袖パジャマ(Blue)_SPPPG49U09",
      "￥4,594",
      "スノーイヤホン / Cタイプ",
      "￥2,185",
      "ユアサマーグラスプレートセット（2p）",
      "20%",
      "￥3,495",
    ]);
    expect(sectionImages("レビュー高評価のおすすめ")).toEqual([
      "/sazo-commerce/recommendations/01.webp",
      "/sazo-commerce/recommendations/02.webp",
    ]);
    expect(container.querySelectorAll(".sazo-recommendation")).toHaveLength(2);
    expect(
      container.querySelector<HTMLElement>(".sazo-search-callout")?.dataset.guidanceArrow,
    ).toBe("true");
    expect(
      Array.from(
        container.querySelectorAll<HTMLImageElement>(
          ".sazo-search-discovery img.sazo-recorded-product-media",
        ),
      ).map(({ src }) => new URL(src).pathname),
    ).toEqual(searchDiscoveryMediaCrops.map(({ image }) => image));
    expect(container.querySelectorAll(".sazo-gram-catalog-card")).toHaveLength(10);
    expect(
      Array.from(
        container.querySelectorAll<HTMLImageElement>(".sazo-gram-catalog-media img"),
      ).map(({ src }) => new URL(src).pathname),
    ).toEqual([
      "/sazo-commerce/community/12.webp",
      "/sazo-commerce/community/13.webp",
      "/sazo-commerce/community/14.webp",
      "/sazo-commerce/gram/list-02.png",
      "/sazo-commerce/gram/list-04.png",
      "/sazo-commerce/gram/list-05.png",
    ]);
    includesInOrder(
      container.querySelector(".sazo-gram-catalog-section")?.textContent ?? "",
      [
        "バニーバニートートバッグ",
        "50%¥9,719",
        "サブアークケル Thin バッグ",
        "42%¥2,280",
        "マイメロディードール",
        "¥110",
        "スピアソ ARVO デニム",
        "24%¥11,272",
        "購入代行依頼",
        "¥1",
        "[20%無制限] バイミー",
        "77%¥703",
        "REMINI Plush キャラぬいキーリング",
        "10%¥4,914",
        "rd check pants スウェットパンツまとめ",
        "50%¥12,469",
        "[@xanaduany SET] 夏の日本トレンドまとめ",
        "¥12,160",
      ],
    );
  });

  it("keeps recorded search-product crops inside media-only boundaries", () => {
    expect(searchDiscoveryMediaCrops).toHaveLength(4);

    for (const fixture of searchDiscoveryMediaCrops) {
      const png = PNG.sync.read(readFileSync(resolve(`public${fixture.image}`)));

      expect(fixture.sourceSecond).toBe(37.5);
      expect(fixture.crop.y + fixture.crop.height).toBeLessThanOrEqual(
        fixture.controlBoundaryY,
      );
      expect({ height: png.height, width: png.width }).toEqual({
        height: fixture.crop.height,
        width: fixture.crop.width,
      });
    }
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
    expect(offsetFor("friend-invite")).toBe("-1");
    expect(offsetFor("new-benefits")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("2/5");
    expect(screen.getAllByText("2/5")).toHaveLength(1);
    expect(
      container
        .querySelector('[data-hero-slide="new-benefits"] img')
        ?.getAttribute("src"),
    ).toBe("/sazo-commerce/hero/slide-2.webp");
    expect(
      container.querySelectorAll(
        '[data-hero-slide="new-benefits"] .sazo-hero-arrow, [data-hero-slide="new-benefits"] .sazo-hero-status',
      ),
    ).toHaveLength(0);
    expect(offsetFor("new-benefits")).toBe("0");
    expect(offsetFor("delivery-line")).toBe("-1");
    expect(offsetFor("large-furniture")).toBe("1");

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "次のバナー" }));
    }
    expect(screen.getByTestId("sazo-hero-counter").textContent).toBe("5/5");
    expect(offsetFor("friend-invite")).toBe("0");
    expect(offsetFor("cold-delivery")).toBe("-1");
    expect(offsetFor("delivery-line")).toBe("1");
  });

  it.each([
    {
      active: "new-benefits",
      counter: "2/5",
      feed: "natural",
      index: 1,
      next: "large-furniture",
      previous: "delivery-line",
    },
    {
      active: "friend-invite",
      counter: "2/5",
      feed: "cold-first",
      index: 1,
      next: "new-benefits",
      previous: "cold-delivery",
    },
    {
      active: "delivery-line",
      counter: "5/5",
      feed: "delivery-last",
      index: 4,
      next: "new-benefits",
      previous: "friend-invite",
    },
    {
      active: "large-furniture",
      counter: "1/5",
      feed: "large-first",
      index: 0,
      next: "cold-delivery",
      previous: "new-benefits",
    },
  ] as const)(
    "renders the $feed QA snapshot as $counter with evidenced neighbors",
    async ({ active, counter, feed, index, next, previous }) => {
      const i18n = await createI18n("ja");
      const state = {
        ...createInitialSazoState(),
        heroFeed: feed,
        heroIndex: index,
      };
      const { container } = render(
        <I18nextProvider i18n={i18n}>
          <HomeView dispatch={() => undefined} state={state} />
        </I18nextProvider>,
      );
      const offsetFor = (slide: string) =>
        container
          .querySelector(`[data-hero-slide="${slide}"]`)
          ?.getAttribute("data-hero-offset");

      expect(screen.getByTestId("sazo-hero-counter").textContent).toBe(counter);
      expect(offsetFor(active)).toBe("0");
      expect(offsetFor(previous)).toBe("-1");
      expect(offsetFor(next)).toBe("1");
    },
  );

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
        srcSet: "/sazo-commerce/hero/mobile/slide-2.webp",
        width: "794",
      },
      {
        height: "490",
        srcSet: "/sazo-commerce/hero/slide-3.webp",
        width: "1200",
      },
      ...[4, 5].map((slide) => ({
        height: "490",
        srcSet: `/sazo-commerce/hero/mobile/slide-${String(slide)}.webp`,
        width: "794",
      })),
    ]);
  });

  it("marks all five baked hero artworks for reference-scale rendering", async () => {
    const { container } = await renderHomePage();

    expect(container.querySelectorAll(".sazo-hero-artwork")).toHaveLength(5);
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
