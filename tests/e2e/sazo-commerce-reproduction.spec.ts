import { expect, test, type Locator, type Page } from "@playwright/test";

const desktopViewport = { height: 828, width: 1_511 };
const mobileViewport = { height: 735, width: 341 };
const localOrigin = "http://127.0.0.1:5190";
const routePath = "/sazo-commerce-mock/?qa=1";

function trackExternalRequests(page: Page) {
  const externalRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());

    if (url.protocol.startsWith("http") && url.origin !== localOrigin) {
      externalRequests.push(request.url());
    }
  });

  return externalRequests;
}

function applicationExternalRequests(requests: readonly string[]) {
  return requests.filter((request) => {
    const hostname = new URL(request).hostname;

    return hostname !== "fonts.googleapis.com" && hostname !== "fonts.gstatic.com";
  });
}

async function expectLoadedDenseHomeProducts(page: Page) {
  const grid = page.locator("[data-mobile-picks-grid] [data-home-dense-product-grid]");
  const cards = grid.getByTestId("home-dense-product-card");
  const images = grid.locator("img");

  await expect(cards).toHaveCount(48);
  await expect(images).toHaveCount(48);
  await expect
    .poll(() =>
      images.evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              element instanceof HTMLImageElement &&
              (!element.complete || element.naturalWidth <= 0),
          )
          .map((element) => (element as HTMLImageElement).src),
      ),
    )
    .toEqual([]);
}

interface TouchPoint {
  x: number;
  y: number;
}

interface ScrollPosition {
  pageY: number;
  railX: number | null;
}

async function readScrollPosition(page: Page, rail?: Locator): Promise<ScrollPosition> {
  if (rail === undefined) {
    return page.evaluate(() => ({ pageY: window.scrollY, railX: null }));
  }

  return rail.evaluate((element) => ({
    pageY: window.scrollY,
    railX: element.scrollLeft,
  }));
}

async function waitForScrollSettle(page: Page, rail?: Locator) {
  let previous = await readScrollPosition(page, rail);
  let stableSamples = 0;

  await expect
    .poll(
      async () => {
        const current = await readScrollPosition(page, rail);
        const railSettled =
          current.railX === null ||
          previous.railX === null ||
          Math.abs(current.railX - previous.railX) < 0.5;
        const pageSettled = Math.abs(current.pageY - previous.pageY) < 0.5;

        stableSamples = railSettled && pageSettled ? stableSamples + 1 : 0;
        previous = current;

        return stableSamples;
      },
      { intervals: [16, 32, 50], timeout: 2_000 },
    )
    .toBeGreaterThanOrEqual(2);

  return previous;
}

async function dispatchNativeTouchGesture(
  page: Page,
  points: readonly [TouchPoint, ...TouchPoint[]],
) {
  const session = await page.context().newCDPSession(page);

  try {
    await session.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 1,
    });
    await session.send("Input.dispatchTouchEvent", {
      touchPoints: [{ ...points[0], force: 1, id: 1, radiusX: 1, radiusY: 1 }],
      type: "touchStart",
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));

    for (const point of points.slice(1)) {
      await session.send("Input.dispatchTouchEvent", {
        touchPoints: [{ ...point, force: 1, id: 1, radiusX: 1, radiusY: 1 }],
        type: "touchMove",
      });
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }

    await session.send("Input.dispatchTouchEvent", {
      touchPoints: [],
      type: "touchEnd",
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  } finally {
    await session.detach();
  }
}

async function pointInsideHero(page: Page, xRatio: number, yRatio: number) {
  const box = await page.locator(".sazo-hero-viewport").boundingBox();

  if (box === null) throw new Error("Missing hero viewport bounds");

  return {
    x: box.x + box.width * xRatio,
    y: box.y + box.height * yRatio,
  };
}

async function expectNoHorizontalPageOverflow(page: Page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(geometry.scrollWidth).toBe(geometry.clientWidth);
}

test("fills every 440px mobile home hero with aligned artwork and real copy", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "The dedicated hero artwork is mobile-only below the 768px boundary.",
  );

  await page.setViewportSize({ height: 956, width: 440 });
  const heroes = [
    {
      copy: "日本の買い物を、もっと確かに。",
      id: "jplanet-home-japan-brazil",
      image: "jplanet-home-japan-brazil-mobile-v4.png",
    },
    {
      copy: "ChatGPTから、J-Planetで買い物しよう！",
      id: "jplanet-home-chatgpt",
      image: "jplanet-home-chatgpt-mobile-v4.png",
    },
    {
      copy: "いま、人気の商品を見つけよう。",
      id: "jplanet-home-popular",
      image: "jplanet-home-popular-mobile-v4.png",
    },
    {
      copy: "探す、確かめる、届けるまで。",
      id: "jplanet-home-service",
      image: "jplanet-home-service-mobile-v4.png",
    },
  ] as const;

  for (const [index, hero] of heroes.entries()) {
    await page.goto(`${routePath}&view=home&heroIndex=${String(index)}`);

    const slide = page.locator(
      `.sazo-hero-slide[data-active="true"][data-hero-slide="${hero.id}"]`,
    );
    const artwork = slide.locator(".sazo-hero-artwork");
    const copy = slide.locator(".sazo-hero-copy");

    await expect(slide).toBeVisible();
    await expect(artwork).toBeVisible();
    await artwork.evaluate(async (element) => {
      await (element as HTMLImageElement).decode();
    });
    expect(await artwork.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
      hero.image,
    );
    await expect(artwork).toHaveCSS("object-fit", "cover");
    await expect(copy).toHaveText(hero.copy);

    const geometry = await slide.evaluate((element) => {
      const artworkElement = element.querySelector(".sazo-hero-artwork");
      const copyElement = element.querySelector(".sazo-hero-copy");
      if (artworkElement === null || copyElement === null) return null;
      const slideRect = element.getBoundingClientRect();
      const artworkRect = artworkElement.getBoundingClientRect();
      const copyRect = copyElement.getBoundingClientRect();

      return {
        artwork: { height: artworkRect.height, width: artworkRect.width },
        copy: {
          right: copyRect.right,
          top: copyRect.top,
          width: copyRect.width,
        },
        slide: { height: slideRect.height, width: slideRect.width },
      };
    });

    expect(geometry?.artwork).toEqual({ height: 320, width: 440 });
    expect(geometry?.slide).toEqual({ height: 320, width: 440 });
    expect(geometry?.copy.top).toBe(92);
    expect(geometry?.copy.right).toBeCloseTo(422, 0);
    expect(geometry?.copy.width).toBeCloseTo(194, 0);
    await expectNoHorizontalPageOverflow(page);
    await slide.screenshot({ path: testInfo.outputPath(`${hero.id}-440.png`) });
  }
});

test("keeps the 767px ChatGPT hero on its existing non-cropped artwork fit", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "The ChatGPT hero artwork is mobile-only below the 768px boundary.",
  );

  await page.setViewportSize({ height: 956, width: 767 });
  await page.goto(`${routePath}&view=home&heroIndex=1`);

  const artwork = page.locator(
    '.sazo-hero-slide[data-active="true"][data-hero-slide="jplanet-home-chatgpt"] .sazo-hero-artwork',
  );

  await expect(artwork).toBeVisible();
  await artwork.evaluate(async (element) => {
    await (element as HTMLImageElement).decode();
  });
  await expect(artwork).toHaveCSS("object-fit", "contain");
  await expectNoHorizontalPageOverflow(page);
});

test("aligns the mobile Uniqlo discovery rail and identifies its source on every card", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "The rail is a mobile-only presentation.",
  );

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${routePath}&view=home`);

    const gram = page.getByTestId("mobile-gram-section");
    const discovery = page.getByTestId("mobile-home-uniqlo-discovery");
    await discovery.scrollIntoViewIfNeeded();

    await expect(
      discovery.getByRole("heading", { name: "ユニクロをお探しですか？" }),
    ).toBeVisible();
    await expect(
      discovery.locator(
        'img[data-brand-source="uniqlo"][src="/sazo-commerce/reference/uniqlo-logo.svg"]',
      ),
    ).toHaveCount(5);

    const bounds = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (element === null) throw new Error(`Missing ${selector}`);
        const { left, right } = element.getBoundingClientRect();
        return { left: Math.round(left), right: Math.round(right) };
      };

      return {
        discoveryGrid: rect(
          ".sazo-mobile-home-uniqlo-discovery .sazo-home-dense-product-grid",
        ),
        discoveryHeading: rect(
          ".sazo-mobile-home-uniqlo-discovery .sazo-home-dense-picks-heading",
        ),
        gramGrid: rect(".sazo-mobile-gram-section .sazo-mobile-gram-grid"),
        gramHeading: rect(".sazo-mobile-gram-section .sazo-section-heading"),
      };
    });

    expect(bounds.discoveryHeading).toEqual(bounds.gramHeading);
    expect(bounds.discoveryGrid).toEqual(bounds.gramGrid);
    await expectNoHorizontalPageOverflow(page);
    await discovery.screenshot({
      path: testInfo.outputPath(`uniqlo-discovery-${viewport.width}.png`),
    });
    if (viewport.width === 390) {
      await page.screenshot({
        path: testInfo.outputPath("uniqlo-discovery-context-390.png"),
      });
    }
  }
});

test("matches the mobile category directory at supported mobile widths and preserves desktop category layout", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "desktop") {
    for (const viewport of [
      { height: 900, width: 768 },
      { height: 900, width: 1_511 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${routePath}&view=categories`);
      await expect(page.locator('[data-view-content="categories"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-agent-entry"]')).toBeVisible();
      await expect(page.locator(".sazo-mobile-category-title")).toHaveCount(0);
      await expect(page.locator(".sazo-category-child-card")).toHaveCount(9);
      await expectNoHorizontalPageOverflow(page);
    }
    return;
  }

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${routePath}&view=categories`);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect(page.locator('[data-view-content="categories"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "カテゴリー" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "カテゴリー" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      page.getByRole("button", { name: "化粧品", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".sazo-category-parent-list button")).toHaveCount(14);

    const grid = page.locator(".sazo-category-child-list");
    const children = grid.locator(".sazo-category-child-card");
    await expect(children).toHaveCount(9);
    await expect
      .poll(() =>
        grid
          .locator("img")
          .evaluateAll(
            (images) =>
              images.filter(
                (image) =>
                  image instanceof HTMLImageElement &&
                  (!image.complete || image.naturalWidth === 0),
              ).length,
          ),
      )
      .toBe(0);
    await grid.locator("img").evaluateAll(async (images) => {
      await Promise.all(
        images.map((image) =>
          image instanceof HTMLImageElement
            ? image.decode().catch(() => undefined)
            : undefined,
        ),
      );
    });
    expect(
      await grid.evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
      ),
    ).toBe(3);
    await expect(children.getByRole("img")).toHaveCount(0);
    expect(
      await children
        .first()
        .locator(".sazo-category-child-image")
        .evaluate((element) => getComputedStyle(element).borderRadius),
    ).toBe("50%");
    if (viewport.width === 341) {
      expect(
        await children
          .filter({ hasText: "ポイントメイク" })
          .locator(".sazo-category-child-copy")
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true);
    }
    await expectNoHorizontalPageOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`category-cosmetics-${viewport.width}.png`),
    });
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=categories`);
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.getByRole("button", { name: "レディース", exact: true }).click();
  await expect(page.getByRole("heading", { name: "レディース" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "レディース", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "トップス", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("category-ladies-390.png") });

  const pcAndGames = page.getByRole("button", { name: "PC・ゲーム", exact: true });
  await pcAndGames.scrollIntoViewIfNeeded();
  await expect(pcAndGames).toBeVisible();
  await pcAndGames.click();
  await expect(page.getByRole("heading", { name: "PC・ゲーム" })).toBeVisible();
  await expect(pcAndGames).toHaveAttribute("aria-current", "page");

  await page.goto(`${routePath}&view=categories`);
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  const bodyCare = page.getByRole("button", { name: "ボディケア" });
  await bodyCare.scrollIntoViewIfNeeded();
  const navTop = await page
    .getByRole("navigation", { name: "モバイルメニュー" })
    .evaluate((element) => element.getBoundingClientRect().top);
  const bodyCareBottom = await bodyCare.evaluate(
    (element) => element.getBoundingClientRect().bottom,
  );
  expect(bodyCareBottom).toBeLessThanOrEqual(navTop);
  await bodyCare.click();
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "skincare-catalog",
  );
  await expect(page.getByTestId("skincare-catalog-view")).toBeVisible();

  await page.goto(`${routePath}&view=categories`);
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.getByRole("tab", { name: "人気ブランド" }).click();
  await expect(page.locator('[data-view-content="brands"]')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("category-popular-brands-390.png") });
});

async function expectComposerBelowAgentHeader(page: Page) {
  await page.evaluate(() => {
    window.scrollTo({ behavior: "instant", top: 0 });
  });

  const measureGap = () =>
    page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".sazo-agent-hub-header");
      const composer = document.querySelector<HTMLElement>(".sazo-mobile-agent-composer");

      if (header === null || composer === null) {
        throw new Error("Missing agent header or composer");
      }

      return composer.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    });

  await expect.poll(measureGap).toBeGreaterThanOrEqual(0);
  await expect.poll(measureGap).toBeLessThanOrEqual(24);
}

async function replayDesktopScenario(page: Page) {
  const externalRequests = trackExternalRequests(page);

  await page.goto(routePath);
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  const desktopShortcuts = page.getByRole("group", {
    exact: true,
    name: "J-Planetショートカット",
  });
  await expect
    .poll(() =>
      desktopShortcuts
        .getByRole("button")
        .evaluateAll((buttons) =>
          buttons.map((button) => button.getAttribute("aria-label")),
        ),
    )
    .toEqual(["J-Planet特集", "限定", "フリマ", "コスメ", "K-POP"]);
  await desktopShortcuts.getByRole("button", { exact: true, name: "コスメ" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "skincare-catalog",
  );
  await expect(page.getByTestId("skincare-catalog-view")).toBeVisible();
  await page
    .getByRole("navigation", { exact: true, name: "メインメニュー" })
    .getByRole("button", { exact: true, name: "ホーム" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  const heroCounter = page.getByTestId("sazo-hero-counter");
  const heroRoot = page.locator(".sazo-root");
  await expect
    .poll(() =>
      page
        .locator(".sazo-hero-slide")
        .evaluateAll((slides) =>
          slides.map((slide) => slide.getAttribute("data-hero-slide")),
        ),
    )
    .toEqual([
      "jplanet-home-japan-brazil",
      "jplanet-home-chatgpt",
      "jplanet-home-popular",
      "jplanet-home-service",
    ]);
  await page.getByRole("button", { exact: true, name: "次のバナー" }).click();
  await expect(heroCounter).toHaveText("2/4");

  await page.getByRole("button", { exact: true, name: "前のバナー" }).click();
  await expect(heroCounter).toHaveText("1/4");
  await expect(heroRoot).toHaveAttribute("data-view", "home");

  await page.goto(routePath);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  externalRequests.length = 0;

  await page.getByTestId("nav-reviews").click();
  await expect(
    page.getByRole("heading", { exact: true, level: 2, name: "みんなの購入体験" }),
  ).toBeVisible();

  await page.getByTestId("chat-launcher").click();
  const chat = page.getByRole("dialog", { exact: true, name: "J-Planetチャット" });
  await expect(chat).toBeVisible();
  await page.getByTestId("chat-close").click();
  await expect(chat).toBeHidden();

  await page.getByTestId("login-launcher").click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await expect(provider).toBeVisible();
  await expect(
    provider.getByRole("button", { exact: true, name: "Googleで続ける" }),
  ).toBeVisible();
  expect(applicationExternalRequests(externalRequests)).toEqual([]);
}

async function replayMobileScenario(page: Page) {
  const externalRequests = trackExternalRequests(page);

  await page.goto(routePath);
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  const compactHeaderGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".sazo-mobile-header");
    const hero = document.querySelector<HTMLElement>(".sazo-hero");

    if (header === null || hero === null) {
      throw new Error("Missing mobile home header or hero");
    }

    return {
      headerBottom: header.getBoundingClientRect().bottom,
      headerHeight: header.getBoundingClientRect().height,
      heroTop: hero.getBoundingClientRect().top,
    };
  });
  expect(compactHeaderGeometry.headerHeight).toBeLessThanOrEqual(60);
  expect(
    compactHeaderGeometry.heroTop - compactHeaderGeometry.headerBottom,
  ).toBeLessThanOrEqual(1);
  const mobileHeader = page.locator('.sazo-mobile-header[data-sazo-topbar="true"]');

  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-header-collapsed",
    "false",
  );
  await expect(mobileHeader).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const headerAgentSearch = mobileHeader.getByRole("button", {
    exact: true,
    name: "AI検索",
  });
  const headerCamera = mobileHeader.getByRole("button", { exact: true, name: "カメラ" });
  const headerChat = mobileHeader.getByRole("button", {
    exact: true,
    name: "チャットを開く",
  });

  await expect(headerAgentSearch).toBeVisible();
  await expect(headerCamera).toBeVisible();
  await expect(headerChat).toBeVisible();
  await headerChat.click();
  await expect(
    page.getByRole("dialog", { exact: true, name: "J-Planetチャット" }),
  ).toBeVisible();
  await page.getByTestId("chat-close").click();

  await headerAgentSearch.click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await page.getByRole("button", { exact: true, name: "ホームに戻る" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await headerCamera.click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await expect(page.locator("input#sazo-mobile-agent-camera")).toHaveAttribute(
    "capture",
    "environment",
  );
  await page.getByRole("button", { exact: true, name: "J-Planet ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await page.evaluate(() => {
    window.scrollTo({ behavior: "instant", top: 32 });
  });
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-header-collapsed",
    "true",
  );
  await expect(mobileHeader).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.evaluate(() => {
    window.scrollTo({ behavior: "instant", top: 0 });
  });
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-header-collapsed",
    "false",
  );
  const heroViewport = page.locator(".sazo-hero-viewport");
  const heroCounter = page.getByTestId("sazo-hero-counter");

  await expect
    .poll(() =>
      heroViewport.locator('[data-active="true"] img').evaluate((image) => {
        const style = getComputedStyle(image);

        return { objectFit: style.objectFit, objectPosition: style.objectPosition };
      }),
    )
    .toEqual({ objectFit: "cover", objectPosition: "50% 50%" });

  await expect(heroCounter).toHaveText("1/4");
  const heroPause = page.getByRole("button", { exact: true, name: "バナーを一時停止" });
  if (await heroPause.isVisible()) {
    await heroPause.click();
    await expect(
      page.getByRole("button", { exact: true, name: "バナーを再生" }),
    ).toBeVisible();
  }
  await heroViewport.dispatchEvent("pointerdown", {
    clientX: 320,
    clientY: 210,
    isPrimary: true,
    pointerId: 41,
    pointerType: "touch",
  });
  await heroViewport.dispatchEvent("pointerup", {
    clientX: 250,
    clientY: 214,
    isPrimary: true,
    pointerId: 41,
    pointerType: "touch",
  });
  await expect(heroCounter).toHaveText("2/4");

  await heroViewport.dispatchEvent("pointerdown", {
    clientX: 250,
    clientY: 210,
    isPrimary: true,
    pointerId: 42,
    pointerType: "touch",
  });
  await heroViewport.dispatchEvent("pointerup", {
    clientX: 245,
    clientY: 285,
    isPrimary: true,
    pointerId: 42,
    pointerType: "touch",
  });
  await expect(heroCounter).toHaveText("2/4");

  await heroViewport.dispatchEvent("pointerdown", {
    clientX: 245,
    clientY: 210,
    isPrimary: true,
    pointerId: 43,
    pointerType: "touch",
  });
  await heroViewport.dispatchEvent("pointerup", {
    clientX: 315,
    clientY: 214,
    isPrimary: true,
    pointerId: 43,
    pointerType: "touch",
  });
  await expect(heroCounter).toHaveText("1/4");

  const nativeStart = await pointInsideHero(page, 0.8, 0.5);
  const nativeMiddle = await pointInsideHero(page, 0.6, 0.51);
  const nativeEnd = await pointInsideHero(page, 0.35, 0.52);
  await dispatchNativeTouchGesture(page, [nativeStart, nativeMiddle, nativeEnd]);
  await expect(heroCounter).toHaveText("2/4");

  const campaignStart = await pointInsideHero(page, 0.75, 0.5);
  const campaignMiddle = await pointInsideHero(page, 0.55, 0.51);
  const campaignEnd = await pointInsideHero(page, 0.3, 0.52);
  await dispatchNativeTouchGesture(page, [campaignStart, campaignMiddle, campaignEnd]);
  await expect(heroCounter).toHaveText("3/4");
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  const shortcutMenu = page.locator("[data-mobile-shortcut-grid]");
  await expect(shortcutMenu).toBeVisible();
  await expect(shortcutMenu).toHaveAttribute("data-layout", "horizontal-menu");
  await expect(shortcutMenu).toHaveAttribute("data-page-size", "9");
  await expect(shortcutMenu.getByRole("button")).toHaveCount(9);
  await expect(
    shortcutMenu.getByRole("button", { exact: true, name: "J-Planet特集" }),
  ).toBeVisible();
  await expect(page.getByTestId("mobile-reference-category-rail")).toHaveCount(0);
  await expect(page.getByTestId("mobile-verified-products")).toHaveCount(0);
  await expect(page.locator(".sazo-interested-items")).toHaveCount(0);
  await expect(page.getByText("MY GIFT FAIR", { exact: false })).toHaveCount(0);

  const scrollBefore = await page.evaluate(() => window.scrollY);
  const verticalStart = await pointInsideHero(page, 0.5, 0.8);
  const verticalMiddle = await pointInsideHero(page, 0.5, 0.5);
  const verticalEnd = await pointInsideHero(page, 0.5, 0.2);
  await dispatchNativeTouchGesture(page, [verticalStart, verticalMiddle, verticalEnd]);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(scrollBefore);
  await waitForScrollSettle(page);
  await expect(heroCounter).toHaveText("3/4");
  const persistentAssurances = page.locator(".sazo-home-agent-assurances");
  await expect(persistentAssurances).toBeVisible();
  await expect(persistentAssurances).toHaveCSS("display", "grid");
  await expect(persistentAssurances).toHaveCSS("border-top-width", "0px");
  const agentEntryAlignment = await page
    .locator("[data-home-agent-entry]")
    .evaluate((entry) => {
      const launcher = entry.querySelector<HTMLElement>(".sazo-home-agent-launcher");
      const assurances = entry.querySelector<HTMLElement>(".sazo-home-agent-assurances");

      return Math.abs(
        (launcher?.getBoundingClientRect().left ?? Number.NaN) -
          (assurances?.getBoundingClientRect().left ?? Number.NaN),
      );
    });
  expect(agentEntryAlignment).toBeLessThanOrEqual(1);
  await expectLoadedDenseHomeProducts(page);
  externalRequests.length = 0;

  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  await expect(
    page.getByRole("navigation", { name: "モバイルサブメニュー" }),
  ).toHaveCount(0);
  await expect(page.locator(".sazo-home-intro")).toHaveCount(0);
  const shortcutRail = page.getByRole("group", {
    exact: true,
    name: "J-Planetショートカット",
  });
  await expect(shortcutRail).toBeVisible();
  await expect(shortcutRail).toHaveAttribute("data-layout", "horizontal-menu");
  await expect(shortcutRail).toHaveAttribute("data-page-size", "9");
  await expect(shortcutRail.getByRole("button")).toHaveCount(9);
  await expect(
    shortcutRail.getByRole("button", { exact: true, name: "J-Planet特集" }),
  ).toBeVisible();
  const shortcutLayout = await shortcutRail.evaluate((element) => {
    const firstItem = element.querySelector<HTMLElement>(".sazo-shortcut");
    const coupon = document.querySelector<HTMLElement>(
      '[data-testid="mobile-coupon-banner"]',
    );
    const railStyle = getComputedStyle(element);

    if (firstItem === null || coupon === null) {
      throw new Error("Missing J-Planet home entrance item");
    }

    const itemRectangle = firstItem.getBoundingClientRect();
    const railRectangle = element.getBoundingClientRect();
    const couponRectangle = coupon.getBoundingClientRect();
    return {
      autoFlow: railStyle.gridAutoFlow,
      borderBottomWidth: railStyle.borderBottomWidth,
      couponBorderTopWidth: getComputedStyle(coupon).borderTopWidth,
      couponOffset: couponRectangle.top - railRectangle.bottom,
      display: railStyle.display,
      itemWidth: itemRectangle.width,
      overflowX: railStyle.overflowX,
    };
  });
  expect(shortcutLayout).toMatchObject({
    autoFlow: "column",
    display: "grid",
    overflowX: "auto",
  });
  expect(shortcutLayout.itemWidth).toBeGreaterThanOrEqual(60);
  expect(shortcutLayout.itemWidth).toBeLessThanOrEqual(68);
  expect(shortcutLayout.borderBottomWidth).toBe("0px");
  expect(shortcutLayout.couponBorderTopWidth).toBe("0px");
  expect(shortcutLayout.couponOffset).toBeLessThanOrEqual(6);

  const couponBanner = page.getByTestId("mobile-coupon-banner");
  await expect(couponBanner).toBeVisible();
  await page.setViewportSize({ height: 844, width: 390 });
  await expectNoHorizontalPageOverflow(page);
  await couponBanner
    .getByRole("button", { exact: true, name: "クーポンを受け取る" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "coupons");
  const coupons = page.locator('[data-view-content="coupons"]');
  await expect(coupons).toBeVisible();
  await expect(
    coupons.getByRole("heading", { exact: true, level: 1, name: "クーポン" }),
  ).toBeVisible();
  const couponLayout = await coupons.evaluate((element) => {
    const styleOf = (selector: string) => {
      const target = element.querySelector<HTMLElement>(selector);

      if (target === null) {
        throw new Error(`Missing coupon layout element: ${selector}`);
      }

      return {
        display: getComputedStyle(target).display,
        rectangle: target.getBoundingClientRect(),
      };
    };
    const header = styleOf(".sazo-coupon-center-header");
    const content = styleOf(".sazo-coupon-center-main");

    return {
      actionsDisplay: styleOf(".sazo-coupon-actions").display,
      cardDisplay: styleOf(".sazo-coupon-ticket").display,
      contentWidth: content.rectangle.width,
      headerDisplay: header.display,
      headerHeight: header.rectangle.height,
      tabsDisplay: styleOf(".sazo-coupon-tabs").display,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(couponLayout).toMatchObject({
    actionsDisplay: "grid",
    cardDisplay: "grid",
    headerDisplay: "grid",
    tabsDisplay: "flex",
    viewportWidth: 390,
  });
  expect(couponLayout.headerHeight).toBeGreaterThanOrEqual(56);
  expect(couponLayout.contentWidth).toBeLessThanOrEqual(couponLayout.viewportWidth);
  await expect(coupons.getByTestId("jplanet-coupon-ticket")).toHaveCount(4);
  await expect(page.getByRole("navigation", { name: "モバイルメニュー" })).toHaveCount(0);
  await coupons.getByRole("button", { name: "コードを入力" }).click();
  const couponCodeForm = page.getByRole("form", { name: "クーポンコードを入力" });
  await expect(couponCodeForm).toBeVisible();
  await expect(couponCodeForm.getByRole("button", { name: "適用" })).toBeDisabled();
  await couponCodeForm
    .getByRole("textbox", { name: "クーポンコードを入力" })
    .fill("JPLANET20");
  await couponCodeForm.getByRole("button", { name: "適用" }).click();
  await expect(couponCodeForm.getByRole("status")).toContainText(
    "クーポンを追加しました",
  );
  await couponCodeForm.getByRole("button", { name: "閉じる" }).click();
  await expect(coupons.getByRole("tab", { name: "すべて (5)" })).toBeVisible();
  await coupons.getByRole("button", { name: "クーポンを探す" }).click();
  await expect(coupons.getByRole("heading", { name: "クーポンを探す" })).toBeVisible();
  await expect(coupons.getByRole("button", { name: "配布終了" })).toBeDisabled();
  await coupons.getByRole("button", { name: "戻る" }).click();
  await coupons.getByRole("button", { name: "利用履歴" }).click();
  await expect(coupons.getByRole("tab", { name: "使用済み" })).toBeVisible();
  await coupons.getByRole("tab", { name: "期限切れ" }).click();
  await expect(coupons.getByText("夏の国際送料 R$20 OFF")).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await page.goto(routePath);
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await expect(
    mobileNavigation.getByRole("button", { exact: true, name: "ホーム" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize(mobileViewport);

  const gramSection = page.getByTestId("mobile-gram-section");
  const recommendations = page.locator("[data-mobile-picks-grid]");
  await expect(gramSection).toBeVisible();
  await expect(page.getByTestId("mobile-category-rail")).toHaveCount(0);
  await expect(recommendations).toBeVisible();
  expect(
    await gramSection.evaluate((element) =>
      element.nextElementSibling?.hasAttribute("data-mobile-picks-grid"),
    ),
  ).toBe(true);
  await expectNoHorizontalPageOverflow(page);

  await page.setViewportSize({ height: 844, width: 390 });
  await expectNoHorizontalPageOverflow(page);
  await page.setViewportSize({ height: 956, width: 440 });
  await expectNoHorizontalPageOverflow(page);
  await page.setViewportSize(mobileViewport);

  const homeAgent = page.locator("[data-home-agent-entry]");
  await expect(homeAgent).toBeVisible();
  await expect(homeAgent.getByText("AIで商品を探す", { exact: true })).toBeVisible();
  await expect(homeAgent.getByText("AI検索", { exact: true })).toHaveCount(0);
  await expect(
    homeAgent.getByText("商品名・キーワード・画像・URLから商品を探します。", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    homeAgent.getByRole("button", { exact: true, name: "AI検索" }),
  ).toBeVisible();
  await expect(
    homeAgent.getByRole("button", { exact: true, name: "入力メニュー" }),
  ).toHaveCount(0);
  await homeAgent.getByRole("button", { exact: true, name: "AI検索" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await page.getByRole("button", { exact: true, name: "J-Planet ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await mobileNavigation.getByRole("button", { exact: true, name: "通知" }).click();
  const notifications = page.locator('[data-view-content="notifications"]');
  await expect(notifications).toBeVisible();
  await expect(
    notifications.getByRole("heading", { exact: true, name: "お知らせ" }),
  ).toBeVisible();
  await expect(
    notifications.getByText("New Balance 9060 のサイズを選ぶ", { exact: true }),
  ).toHaveCount(0);
  await notifications.getByRole("tab", { exact: true, name: "配送" }).click();
  await expect(
    notifications.getByText("Nintendo Switch OLED", { exact: true }),
  ).toBeVisible();
  await expect(notifications.getByText("Air Jordan 1 Retro High OG")).toHaveCount(0);
  await notifications.getByRole("button", { exact: true, name: "通知設定" }).click();
  await expect(
    notifications.getByRole("switch", { exact: true, name: "メール通知" }),
  ).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await mobileNavigation.getByRole("button", { exact: true, name: "ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await mobileNavigation.getByRole("button", { exact: true, name: "AI検索" }).click();
  const hub = page.locator("[data-mobile-agent-hub]");
  await expect(hub).toBeVisible();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("button", { exact: true, name: "AI検索" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("dialog", { exact: true, name: "J-Planet AIエージェント" }),
  ).toHaveCount(0);
  await expect(hub.getByRole("button", { exact: true, name: "送信" })).toBeDisabled();
  await expectNoHorizontalPageOverflow(page);
  for (const viewport of [
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(mobileNavigation).toBeVisible();
    await expect(
      mobileNavigation.getByRole("button", { exact: true, name: "AI検索" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expectNoHorizontalPageOverflow(page);
  }
  await page.setViewportSize(mobileViewport);

  await hub.getByRole("button", { exact: true, name: "J-Planet ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await mobileNavigation.getByRole("button", { exact: true, name: "AI検索" }).click();
  await expect(hub).toBeVisible();
  await hub.locator("#sazo-mobile-agent-image").setInputFiles({
    name: "sample.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z7xkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(hub.getByRole("img", { name: "選択した画像: sample.png" })).toBeVisible();
  await expect(hub.getByRole("button", { exact: true, name: "送信" })).toBeEnabled();

  await hub.getByRole("button", { exact: true, name: "J-Planet ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await mobileNavigation.getByRole("button", { exact: true, name: "AI検索" }).click();
  const agentNavigation = mobileNavigation.getByRole("button", {
    exact: true,
    name: "AI検索",
  });
  await expect(hub).toBeVisible();
  await expect(
    hub.getByRole("heading", { exact: true, name: "最近の検索" }),
  ).toBeVisible();
  await expect(
    hub.getByRole("heading", { exact: true, name: "最近確認した商品" }),
  ).toBeVisible();
  await expect(
    hub.getByRole("list", { name: "最近の検索" }).getByRole("listitem"),
  ).toHaveCount(3);
  await expect(hub.getByText("送信履歴", { exact: true })).toHaveCount(0);
  await expect(hub.getByText("過去の送信履歴 18件", { exact: true })).toHaveCount(0);

  await hub.getByRole("button", { name: "New Balance 9060の商品を見る" }).click();
  const product = page.getByTestId("jplanet-controller-result");
  await expect(product).toBeVisible();
  await product.getByRole("button", { exact: true, name: "戻る" }).click();
  await expect(hub).toBeVisible();

  const composer = hub.locator(".sazo-mobile-agent-composer");
  await composer
    .getByRole("textbox", { name: "AI検索" })
    .fill("https://www.rakuten.co.jp/item/mock-product");
  const submit = composer.getByRole("button", {
    exact: true,
    name: "送信",
  });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");
  await expect(page.locator("[data-agent-pet-stage]")).toHaveCount(0);
  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
  const priceInformation = page.getByRole("region", { name: "価格情報" });
  await expect(priceInformation).toContainText("R$ 429〜");
  await expect(priceInformation).toContainText("R$ 498");
  await expect(priceInformation).toContainText("-14%");
  await expect(priceInformation).toContainText("30mil+ 購入済み");
  await expect(priceInformation).not.toContainText("ブラジル到着総額");

  await page.getByRole("button", { exact: true, name: "AI検索を開く" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await page
    .locator(".sazo-agent-hub")
    .getByRole("button", { exact: true, name: "J-Planet ホーム" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await mobileNavigation.getByRole("button", { exact: true, name: "マイページ" }).click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await expect(provider).toBeVisible();
  await provider.getByRole("button", { exact: true, name: "Googleで続ける" }).click();
  await expect(provider).toBeHidden();
  await expect(page.getByTestId("sazo-google-chooser")).toHaveCount(0);
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);

  let account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await expect(
    account.getByRole("heading", { exact: true, level: 1, name: "マイページ" }),
  ).toBeVisible();
  const myPageGeometry = await account.evaluate((element) => {
    const rectangle = (selector: string) => {
      const target = element.querySelector<HTMLElement>(selector);

      if (target === null) {
        throw new Error(`Missing My Page element: ${selector}`);
      }

      return target.getBoundingClientRect();
    };
    const fontSize = (selector: string) => {
      const target = element.querySelector<HTMLElement>(selector);

      if (target === null) {
        throw new Error(`Missing My Page text: ${selector}`);
      }

      return Number.parseFloat(getComputedStyle(target).fontSize);
    };
    const header = rectangle(".sazo-postpurchase-header");
    const memberName = rectangle(".sazo-mypage-user-row strong");
    const avatar = rectangle(".sazo-mypage-avatar");
    const shopping = rectangle(".sazo-mypage-reference-group");
    const accountLink = rectangle(".sazo-account-link");

    return {
      accountLinkHeight: accountLink.height,
      avatarWidth: avatar.width,
      groupTitleFontSize: fontSize(".sazo-mypage-reference-group h2"),
      headerHeight: header.height,
      memberNameFontSize: fontSize(".sazo-mypage-user-row strong"),
      memberNameTopGap: memberName.top - header.bottom,
      shoppingHeight: shopping.height,
    };
  });
  expect(myPageGeometry.headerHeight).toBeGreaterThanOrEqual(42);
  expect(myPageGeometry.memberNameTopGap).toBeGreaterThanOrEqual(18);
  expect(myPageGeometry.memberNameFontSize).toBeGreaterThanOrEqual(19);
  expect(myPageGeometry.avatarWidth).toBeGreaterThanOrEqual(29);
  expect(myPageGeometry.groupTitleFontSize).toBeGreaterThanOrEqual(18);
  expect(myPageGeometry.accountLinkHeight).toBeGreaterThanOrEqual(42);
  expect(myPageGeometry.shoppingHeight).toBeGreaterThanOrEqual(140);

  await account.getByRole("button", { exact: true, name: "お気に入り" }).click();
  let accountView = page.locator('[data-view-content="favorites"]');
  await expect(accountView).toBeVisible();
  await expect(
    accountView.getByRole("heading", { exact: true, name: "購入条件を確認した商品" }),
  ).toBeVisible();
  await expect(accountView.getByText("New Balance 9060", { exact: true })).toBeVisible();
  await expect(accountView.getByText("Sony α7C II", { exact: true })).toBeVisible();
  await accountView.getByRole("button", { exact: true, name: "確認をはじめる" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");
  await page.getByRole("button", { exact: true, name: "戻る" }).click();
  await expect(accountView).toBeVisible();

  accountView = page.locator('[data-view-content="favorites"]');
  await accountView.getByRole("tab", { name: /ブランド/ }).click();
  await expect(
    accountView.getByRole("heading", { exact: true, name: "保存したブランド" }),
  ).toBeVisible();

  await mobileNavigation.getByRole("button", { exact: true, name: "マイページ" }).click();
  account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await account.getByRole("button", { exact: true, name: "会員情報" }).click();
  accountView = page.locator('[data-view-content="profile"]');
  await expect(accountView).toBeVisible();
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await account.getByRole("button", { exact: true, name: "支払い方法" }).click();
  accountView = page.locator('[data-view-content="cards"]');
  await expect(accountView).toBeVisible();
  await expect(
    accountView.getByRole("heading", {
      exact: true,
      level: 2,
      name: "登録されているカードがありません。",
    }),
  ).toBeVisible();
  expect(applicationExternalRequests(externalRequests)).toEqual([]);
}

test("redirects the retired J-Planet BEAUTY route to the supported skincare catalog", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the replacement catalog is mobile-first",
  );
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=beauty`);

  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "skincare-catalog",
  );
  await expect(page.getByTestId("skincare-catalog-view")).toBeVisible();
  await expect(page.locator("[data-beauty-view]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "すべて見る" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "モバイルメニュー" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("retired-beauty-redirect-390.png") });
});

test("renders Jupi at half of its former scale beside Kurone", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the pet animation is mobile-first");
  await page.goto(`${routePath}&view=agent-searching`);

  const kurone = page.locator('[data-pet-id="kurone"]');
  const jupi = page.locator('[data-pet-id="jupi"]');
  await expect(kurone).toBeVisible();
  await expect(jupi).toBeVisible();

  const [kuroneBox, jupiBox] = await Promise.all([
    kurone.boundingBox(),
    jupi.boundingBox(),
  ]);
  if (kuroneBox === null || jupiBox === null) throw new Error("Missing pet geometry");
  expect(jupiBox.width / kuroneBox.width).toBeLessThanOrEqual(0.3);
});

test("interpolates Jupi's dodge smoothly between pixel-art frames", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the pet animation is mobile-first");
  await page.goto(`${routePath}&view=agent-searching`);

  const stage = page.locator("[data-agent-pet-stage]");
  const jupi = page.locator('[data-pet-id="jupi"]');
  await expect(stage).toBeVisible();
  await expect(jupi).toBeVisible();

  const jupiXAt = async (timelineMs: number) => {
    await stage.evaluate((node, currentTime) => {
      for (const animation of node.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = currentTime;
      }
    }, timelineMs);

    const box = await jupi.boundingBox();
    if (box === null) throw new Error("Missing Jupi geometry");
    return box.x;
  };

  const atZeroPointEightSeconds = await jupiXAt(800);
  const atZeroPointNineSeconds = await jupiXAt(900);
  const atOneSecond = await jupiXAt(1_000);

  expect(Math.abs(atZeroPointNineSeconds - atZeroPointEightSeconds)).toBeGreaterThan(0.1);
  expect(Math.abs(atOneSecond - atZeroPointNineSeconds)).toBeGreaterThan(0.1);
});

test("shows a waterfall home grid with direct-Japan prices and returns each card to the shared controller detail", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the dense home grid is mobile-first");
  await page.goto(routePath);

  const grid = page.locator("[data-mobile-picks-grid] [data-home-dense-product-grid]");
  const cards = grid.getByTestId("home-dense-product-card");
  await grid.evaluate((element) => {
    element.scrollIntoView({ block: "start" });
  });
  await expect(cards).toHaveCount(48);
  await expect(grid).toHaveAttribute("data-column-count", "2");
  await expect(grid.locator(".sazo-home-dense-product-column")).toHaveCount(2);
  expect(
    await cards.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-product-target")),
    ),
  ).toEqual(Array.from({ length: 48 }, () => "jplanet-nintendo-pro-controller"));
  expect(
    await cards.evaluateAll((elements) =>
      elements.map((card) => {
        const image = card.querySelector<HTMLImageElement>(
          ".sazo-home-dense-product-media img",
        );

        if (image === null) throw new Error("Missing dense product image");

        return {
          cardBorderTopWidth: getComputedStyle(card).borderTopWidth,
          imageObjectFit: getComputedStyle(image).objectFit,
          imagePaddingTop: getComputedStyle(image).paddingTop,
        };
      }),
    ),
  ).toEqual(
    Array.from({ length: 48 }, () => ({
      cardBorderTopWidth: "0px",
      imageObjectFit: "cover",
      imagePaddingTop: "0px",
    })),
  );
  await expect(grid).not.toContainText("¥");
  await expect(grid).toContainText("R$ 429");
  await expect(grid).toContainText("14% OFF");
  await expect(grid).toContainText("R$ 498");
  await expect(grid).toContainText("9,450件販売");
  await expect(grid).toContainText("日本から直送");
  await expect(grid).not.toContainText("購入済み");
  await expect(grid.locator(".sazo-home-dense-product-rating")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("home-sales-count-341.png") });
  await expect(grid.locator(".sazo-home-dense-product-add")).toHaveCount(48);
  await expect(grid.locator(".sazo-home-dense-product-copy").first()).toHaveCSS(
    "display",
    "grid",
  );
  expect(
    await cards
      .locator(".sazo-home-dense-product-media")
      .evaluateAll((elements) =>
        elements.map((element) => Math.round(element.getBoundingClientRect().height)),
      ),
  ).not.toEqual(Array.from({ length: 48 }, () => 0));
  expect(
    new Set(
      await cards
        .locator(".sazo-home-dense-product-media")
        .evaluateAll((elements) =>
          elements.map((element) => Math.round(element.getBoundingClientRect().height)),
        ),
    ).size,
  ).toBeGreaterThan(1);
  await cards
    .first()
    .getByRole("button", {
      name: "Nintendo Switch Proコントローラーの購入オプションを選ぶ",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
  await page
    .getByTestId("jplanet-product-media-header")
    .getByRole("button", { name: "戻る" })
    .click();
  await expect(grid).toBeVisible();
  const scrollTopBeforeOpen = await page.evaluate(() => window.scrollY);

  await cards.first().locator(".sazo-home-dense-product-copy").click();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
  await page
    .getByTestId("jplanet-product-media-header")
    .getByRole("button", { name: "戻る" })
    .click();
  await expect(grid).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(Math.max(0, scrollTopBeforeOpen - 2));

  await cards.last().locator(".sazo-home-dense-product-copy").click();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
});

test("keeps the waterfall grid legible on tablet and desktop", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "desktop project supplies the tablet-sized viewport",
  );

  await page.goto(routePath);
  const grid = page.locator(
    ".sazo-desktop-home-product-rail [data-home-dense-product-grid]",
  );

  for (const { width, columns } of [
    { width: 768, columns: 3 },
    { width: 1_024, columns: 4 },
    { width: 1_511, columns: 5 },
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(grid).toHaveAttribute("data-column-count", String(columns));
    await expect(grid.locator(".sazo-home-dense-product-column")).toHaveCount(1);
    await expect(page.locator("html")).toHaveJSProperty("scrollWidth", width);
  }
});

test("completes the J-Planet Nintendo variant sheet into the source-grouped cart", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the reference checkout flow is mobile-first",
  );
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);

  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
  await page.getByRole("button", { exact: true, name: "カートに入れる" }).click();

  const sheet = page.getByRole("dialog", { name: "Proコントローラーをカートに入れる" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("button", { name: /ブラック 在庫あり/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    sheet.getByRole("button", { name: /スプラトゥーン 売り切れ/ }),
  ).toHaveAttribute("disabled", "");
  await sheet.getByRole("button", { name: /ホワイト 在庫あり/ }).click();
  await expect(sheet.getByRole("button", { name: /ホワイト 在庫あり/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await sheet.getByRole("button", { exact: true, name: "カートに入れる" }).click();

  await expect(page.getByRole("heading", { name: "カート (4)" })).toBeVisible();
  await expect(page.getByText("Rakuten Japan 公式ストア", { exact: true })).toBeVisible();
  await expect(page.getByText("Nintendo 公式", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "購入手続きへ (4)" })).toBeVisible();

  await page
    .getByRole("button", { name: "Rakuten Japan 公式ストアのクーポンを選択" })
    .click();
  await expect(page.getByRole("dialog", { name: "クーポンを選択" })).toBeVisible();
  await page.getByRole("button", { name: "適用する" }).click();
  await expect(page.getByText("R$ 20 OFF", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "購入手続きへ (4)" })).toBeVisible();

  await page.getByRole("button", { name: "購入手続きへ (4)" }).click();
  const checkout = page.getByTestId("jplanet-checkout");
  await expect(checkout).toBeVisible();
  await expect(checkout.getByRole("heading", { name: "購入手続き" })).toBeVisible();
  await expect(checkout.getByText("配送先", { exact: true })).toBeVisible();
  await expect(checkout.getByText("支払い内訳", { exact: true })).toBeVisible();
  await expect(checkout.getByRole("button", { name: "注文を確定する" })).toBeVisible();
  await checkout.getByRole("button", { name: "税金の説明を表示" }).click();
  await expect(page.getByRole("dialog", { name: "税金の説明" })).toBeVisible();
  await page.getByRole("button", { name: "確認しました" }).click();
});

test("places the home-style recommendation grid below the cart", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the cart recommendation surface is mobile-first",
  );

  await page.goto(`${routePath}&view=cart`);
  const recommendations = page.getByTestId("jplanet-cart-recommendations");
  await recommendations.evaluate((element) => element.scrollIntoView({ block: "start" }));

  await expect(
    recommendations.getByRole("heading", { name: "あなたへのおすすめ" }),
  ).toBeVisible();
  await expect(recommendations.locator(".sazo-home-dense-product")).toHaveCount(16);
  await expect(recommendations.locator(".sazo-home-dense-product-add")).toHaveCount(16);
  await recommendations
    .getByRole("button", {
      name: "Nintendo Switch Proコントローラーの購入オプションを選ぶ",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
});

test("continues a retrieved Nintendo product with reviews and recommendations in one scroll", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the retrieved-product follow-up flow is mobile-first",
  );
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);

  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  const inlineFollowup = page.getByTestId("jplanet-inline-followup");
  const relatedProducts = page.getByTestId("jplanet-related-product-list");
  await expect(page.getByTestId("jplanet-inline-delivery-detail")).toHaveCount(0);
  await expect(inlineFollowup).toBeAttached();
  await expect(relatedProducts.getByRole("button")).toHaveCount(10);
  const reviewPreview = page.getByTestId("jplanet-product-review-preview");
  await expect(reviewPreview).toBeAttached();
  await expect(reviewPreview.getByText("128件のレビュー", { exact: true })).toBeVisible();
  await expect(reviewPreview.getByRole("img", { name: /のレビュー写真/ })).toHaveCount(3);
  await expect(page.getByText("購入条件を確認中", { exact: true })).toHaveCount(0);
  await expect(page.getByText("限定ハイプラ", { exact: true })).toHaveCount(0);
  await expect(page.getByText("J-Planetの到着実績", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("この商品をブラジルへ届けた記録", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("確認済みの購入のみ", { exact: true })).toHaveCount(0);
  await expect(page.getByText("配送・通関の詳細を見る", { exact: true })).toHaveCount(0);
  await expect(page.getByText("通常日本商品", { exact: true })).toBeVisible();
  await expect(
    page.getByText("日本の素敵な商品をすぐにお届けします。", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("カラーを選ぶと、総額と到着予定を確定します", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("総額に含まれるもの", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("ブラジル到着総額に含まれます", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /ブラジル到着総額 R\$ 2,184 の内訳を見る/ }),
  ).toHaveCount(0);
  const deliveryDetailsButton = page.getByRole("button", {
    exact: true,
    name: "配送・通関の詳細を開く",
  });
  await expect(deliveryDetailsButton).toBeVisible();
  await deliveryDetailsButton.click();
  await expect(page.getByTestId("jplanet-delivery-detail")).toBeVisible();
  await expect(page.getByRole("heading", { name: "配送・通関の詳細" })).toBeVisible();
  await expect(page.getByText("注文確定後 1〜2日", { exact: true })).toBeVisible();
  await page.getByRole("button", { exact: true, name: "戻る" }).click();
  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  await inlineFollowup.scrollIntoViewIfNeeded();
  await expect(inlineFollowup).toBeVisible();
  await reviewPreview
    .getByRole("button", { name: "すべてのレビューを見る" })
    .first()
    .click();
  await expect(page.getByTestId("jplanet-product-reviews")).toBeVisible();
  await expect(page.getByRole("heading", { name: "商品レビュー" })).toBeVisible();
  await page.getByRole("button", { exact: true, name: "写真付き 36" }).click();
  await expect(
    page.getByRole("button", { exact: true, name: "写真付き 36" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("searchbox", { name: "レビューを検索" }).fill("Camila");
  await expect(page.getByText("Camila R.", { exact: true })).toBeVisible();
  await expect(page.getByText("Bruno S.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { exact: true, name: "戻る" }).click();
  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  await inlineFollowup.scrollIntoViewIfNeeded();
  await expect(reviewPreview).toBeVisible();
  await relatedProducts
    .getByRole("button", {
      exact: true,
      name: "Nintendo Switch Proコントローラーの商品詳細を見る",
    })
    .click();
  await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 0 }));
  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  await expect(page.getByRole("button", { name: /バリアントを選択/ })).toHaveCount(0);
  const controllerGallery = page.locator(
    ".sazo-reference-nintendo-controller-thumbnails",
  );
  await expect(controllerGallery.getByRole("button")).toHaveCount(10);
  await controllerGallery
    .getByRole("button", { exact: true, name: "画像2を表示" })
    .click();
  await expect(
    page
      .locator(".sazo-reference-nintendo-controller-media")
      .getByRole("img", { name: "Nintendo Switch Proコントローラー ホワイト" }),
  ).toBeVisible();
  await page.getByRole("button", { exact: true, name: "カートに入れる" }).click();
  const cartDialog = page.getByRole("dialog", {
    exact: true,
    name: "Proコントローラーをカートに入れる",
  });
  await expect(cartDialog).toBeVisible();
  await expect(
    cartDialog.getByText("選択後、この商品をカートに追加します", { exact: true }),
  ).toBeVisible();
  await cartDialog.getByRole("button", { name: /ホワイト 在庫あり/ }).click();
  await cartDialog.getByRole("button", { exact: true, name: "数量を増やす" }).click();
  await cartDialog.getByRole("button", { exact: true, name: "カートに入れる" }).click();
  await expect(page.getByRole("heading", { name: "カート (4)" })).toBeVisible();
});

test("renders structured product specifications and collapsible product description", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the product information surface is a mobile-first flow",
  );

  for (const viewport of [
    { height: 844, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);
    const description = page.locator(".sazo-reference-nintendo-product-description");
    await description.scrollIntoViewIfNeeded();
    await expect(description.getByRole("heading", { name: "商品説明" })).toBeVisible();
    await expect(page.getByRole("button", { name: "商品仕様を開く" })).toContainText(
      "Bluetooth / USB Type-C",
    );
    await expectNoHorizontalPageOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`product-information-collapsed-${viewport.width}.png`),
    });
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);
  await page.getByRole("button", { name: "商品仕様を開く" }).click();
  const specificationSheet = page.getByRole("dialog", { name: "商品仕様" });
  await expect(specificationSheet).toBeVisible();
  await expect(specificationSheet).toContainText("HAC-A-FSSKA");
  await page.screenshot({
    path: testInfo.outputPath("product-specification-sheet-390.png"),
  });
  await page.getByRole("button", { name: "商品仕様を閉じる" }).click();

  const description = page.locator(".sazo-reference-nintendo-product-description");
  await description.scrollIntoViewIfNeeded();
  await description.getByRole("button", { name: "商品説明をもっと見る" }).click();
  await expect(
    page.locator(".sazo-reference-nintendo-product-description-content"),
  ).toHaveAttribute("data-expanded", "true");
  await expect(description.getByText("主な仕様", { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("product-information-expanded-390.png"),
  });
  await description
    .getByRole("button", {
      name: "Nintendo Switch Proコントローラー ブラックの正面を拡大",
    })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "Nintendo Switch Proコントローラー ブラックの正面の拡大表示",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "拡大画像を閉じる" }).click();
  await description.getByRole("button", { name: "商品説明を閉じる" }).click();
  await expectNoHorizontalPageOverflow(page);
});

test("keeps the product media header over the gallery until product information reaches it", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the product-media header is a mobile-first interaction",
  );
  await page.setViewportSize({ height: 956, width: 440 });
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);

  const header = page.getByTestId("jplanet-product-media-header");
  await expect(header).toBeVisible();
  await expect(header).toHaveAttribute("data-header-surface", "transparent");
  await expect(header.locator("[data-jplanet-wordmark]")).toHaveCount(0);
  const controllerMedia = page.locator(".sazo-reference-nintendo-controller-media");
  const controllerVariantRail = page.getByTestId("jplanet-controller-variant-rail");
  await expect(controllerMedia).toBeVisible();
  await expect(
    controllerMedia.locator(".sazo-reference-nintendo-controller-thumbnails"),
  ).toHaveCount(0);
  await expect(controllerVariantRail).toBeVisible();
  await expect(controllerVariantRail).toHaveAttribute("aria-label", "商品画像");
  await expect(controllerVariantRail).toContainText("10枚の商品画像");
  expect(
    await page.evaluate(() =>
      document
        .querySelector(".sazo-reference-nintendo-controller-media")
        ?.nextElementSibling?.getAttribute("data-testid"),
    ),
  ).toBe("jplanet-controller-variant-rail");
  await expect(header.getByRole("button", { name: "戻る" })).toBeVisible();
  await expect(header.getByRole("button", { name: "AI検索を開く" })).toBeVisible();
  await expect(header.getByRole("button", { name: "WhatsAppで共有" })).toBeVisible();
  await expect(header.getByRole("button", { name: "商品を共有" })).toBeVisible();
  await expect(header.getByRole("button", { name: "カート" })).toBeVisible();
  await expect(header.getByRole("button", { name: "商品メニュー" })).toBeVisible();
  await expect(header.getByRole("button", { name: "チャット" })).toHaveCount(0);
  await expect(header.getByRole("button", { name: "画像から検索" })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("controller-top-440.png") });

  await header.getByRole("button", { name: "商品メニュー" }).click();
  await expect(header.getByRole("menu")).toBeVisible();
  await expect(header.getByRole("menuitem", { name: "商品URLをコピー" })).toBeVisible();
  await header.getByRole("button", { name: "商品メニュー" }).click();

  const productInformation = page.getByTestId("jplanet-product-information");
  const bounds = await productInformation.evaluate((element) => {
    const header = document.querySelector<HTMLElement>(
      "[data-testid='jplanet-product-media-header']",
    );
    return {
      headerHeight: header?.getBoundingClientRect().height ?? 56,
      productInformationTop: element.getBoundingClientRect().top + window.scrollY,
    };
  });

  await page.evaluate(
    (top) => window.scrollTo({ behavior: "instant", top }),
    Math.max(0, bounds.productInformationTop - bounds.headerHeight - 4),
  );
  await expect(header).toHaveAttribute("data-header-surface", "transparent");

  await page.evaluate(
    (top) => window.scrollTo({ behavior: "instant", top }),
    Math.max(0, bounds.productInformationTop - bounds.headerHeight + 4),
  );
  await expect(header).toHaveAttribute("data-header-surface", "solid");
  await expect(header).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.evaluate(
    (top) => window.scrollTo({ behavior: "instant", top }),
    Math.max(0, bounds.productInformationTop - bounds.headerHeight - 4),
  );
  await expect(header).toHaveAttribute("data-header-surface", "transparent");
  await header.getByRole("button", { name: "AI検索を開く" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
});

test("keeps controller photos separate from the ten purchase-time variations", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the compact gallery and purchase sheet are the mobile product-detail presentation",
  );

  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);

  const variationRail = page.getByTestId("jplanet-controller-variant-rail");
  await expect(variationRail).toHaveAttribute("aria-label", "商品画像");
  await expect(variationRail).toContainText("10枚の商品画像");
  await expect(variationRail.getByRole("button")).toHaveCount(10);
  await expect
    .poll(() =>
      variationRail
        .locator(".sazo-reference-nintendo-controller-thumbnails")
        .evaluate((node) => node.scrollWidth > node.clientWidth),
    )
    .toBe(true);

  const thirdPhoto = variationRail.getByRole("button", { name: "画像3を表示" });
  await thirdPhoto.click();
  await expect(thirdPhoto).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { exact: true, name: "カートに入れる" }).click();
  const purchaseSheet = page.getByRole("dialog", {
    exact: true,
    name: "Proコントローラーをカートに入れる",
  });
  await expect(purchaseSheet).toBeVisible();
  await expect(
    purchaseSheet.locator(".sazo-reference-controller-sheet-colors button"),
  ).toHaveCount(10);
  await expect(
    purchaseSheet.getByRole("button", { name: /ゼルダ 在庫あり/ }),
  ).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
});

test("renders the AI search as a direct product-search entry at mobile widths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "AI search is a mobile-first flow");

  await page.goto(`${routePath}&view=agent-hub&agentScenario=customs-action`);
  await page.setViewportSize({ height: 844, width: 390 });
  const search = page.locator("[data-ai-search-view]");
  const navigation = page.getByRole("navigation", { name: "モバイルメニュー" });

  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(search).toBeVisible();
  await expect(search.locator("[data-ai-search-input]")).toBeFocused();
  await expect(search.getByText("最近の検索")).toBeVisible();
  await expect(search.getByRole("button", { name: "画像を選択" })).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: testInfo.outputPath("agent-search-default-390.png") });

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(
      navigation.getByRole("button", { name: "AI検索", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expectNoHorizontalPageOverflow(page);
  }

  await search.getByRole("button", { name: "Nintendo Switch" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(search.locator("[data-ai-search-results]")).toBeVisible();
  await expect(search.locator("[data-ai-search-input]")).toHaveValue("Nintendo Switch");
  await expect(search.getByText("「Nintendo Switch」で検索しました。")).toBeVisible();

  await page.goto(`${routePath}&view=ranking`);
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(page.getByText("J-Planet RANKING")).toHaveCount(0);
});

test("opens the dedicated mobile AI search with distinct text, URL, and image paths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "AI search is a mobile-only surface");

  for (const width of [341, 390, 440]) {
    await page.setViewportSize({ height: 844, width });
    await page.goto(routePath);
    await page.locator("[data-mobile-agent-search]").click();

    const search = page.locator("[data-ai-search-view]");
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
    await expect(search).toBeVisible();
    await expect(search.locator("[data-ai-search-input]")).toBeFocused();
    await expect(search.locator("[data-ai-search-input]")).toHaveCSS(
      "font-size",
      "16px",
    );
    await expect(search.locator("[data-ai-search-input]")).toHaveAttribute(
      "placeholder",
      "商品名・キーワード・画像・URLで検索",
    );
    await expect(search.locator("[data-ai-search-image-input]")).toHaveAttribute(
      "capture",
      "environment",
    );
    await expect(search.getByText("最近の検索")).toBeVisible();
    await expect(search.getByText("AI検索で商品を探してみよう！")).toBeVisible();
    await expect(search.getByText("今、人気の検索")).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`ai-search-${width}-initial.png`),
    });
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(routePath);
  await page.locator("[data-shell-search-button]").click();
  const search = page.locator("[data-ai-search-view]");
  const searchInput = search.locator("[data-ai-search-input]");

  await search.getByRole("button", { name: "敏感肌 化粧水を検索履歴から削除" }).click();
  await expect(search.getByText("敏感肌 化粧水")).toHaveCount(0);
  await search.getByRole("button", { name: "すべての検索履歴を削除" }).click();
  await expect(search.getByText("最近の検索")).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("ai-search-390-history-cleared.png"),
  });

  await searchInput.fill("New Balance 9060");
  await page.screenshot({ path: testInfo.outputPath("ai-search-390-text-input.png") });
  await searchInput.press("Enter");
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(search.locator("[data-ai-search-results]")).toBeVisible();
  await expect(search.getByText("海外ショップも含めて検索しました。")).toBeVisible();
  await expect(search.getByText("全体 128件")).toBeVisible();
  await expect(search.getByRole("heading", { name: "一般・すぐ買える" })).toBeVisible();
  await expect(search.getByRole("heading", { name: "限定・ハイブランド" })).toBeVisible();
  await expect(search.getByRole("heading", { name: "フリマ・中古" })).toBeVisible();
  await expect(search.locator(".sazo-ai-search-result-image img")).toHaveCount(9);
  await expectNoHorizontalPageOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath("ai-search-390-new-balance-results.png"),
  });

  await search.getByRole("button", { exact: true, name: "限定" }).click();
  await expect(search.getByText("限定 19件")).toBeVisible();
  await expect(search.locator('[data-result-group="limited"]')).toBeVisible();
  await expect(search.locator('[data-result-group="general"]')).toHaveCount(0);
  await search.getByRole("button", { name: "全体" }).click();
  await search
    .getByRole("button", {
      name: "New Balance 9060 グリーン ホワイトの商品詳細を見る",
    })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");
  await expect(page.locator("h1").filter({ hasText: "New Balance 9060" })).toBeVisible();

  await page.goto(
    `${routePath}&view=ai-search&query=lo%C3%A7%C3%A3o%20facial`,
  );
  const tonerResults = page.locator("[data-ai-search-results]");
  await expect(page.locator("[data-ai-search-input]")).toHaveValue("loção facial");
  await expect(
    tonerResults.getByText("「化粧水」に翻訳して検索しました。", { exact: true }),
  ).toBeVisible();
  await expect(tonerResults.getByText("全体 1726件", { exact: true })).toBeVisible();
  await expect(
    tonerResults.getByRole("heading", { name: "フリマ・未開封" }),
  ).toBeVisible();
  await expect(tonerResults.locator(".sazo-ai-search-result-image img")).toHaveCount(9);
  await expectNoHorizontalPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("ai-search-390-toner-results.png") });

  await page.goto(`${routePath}&view=ai-search`);
  await page.locator("[data-ai-search-input]").fill("https://example.com/product");
  await page.locator("[data-ai-search-input]").press("Enter");
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");
  await page.screenshot({ path: testInfo.outputPath("ai-search-390-url-product.png") });

  await page.goto(`${routePath}&view=ai-search`);
  await page.locator("[data-ai-search-image-input]").setInputFiles({
    mimeType: "image/png",
    name: "reference-shoe.png",
    buffer: Buffer.from("image"),
  });
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "agent-image-resolution",
  );
  await expect(page.locator("[data-agent-image-resolution]")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("ai-search-390-image-candidates.png"),
  });

  await page.goto(`${routePath}&view=ai-search`);
  await page.getByRole("button", { name: "ホームに戻る" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await page
    .locator(".sazo-mobile-nav")
    .getByRole("button", { exact: true, name: "AI検索" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(page.locator("[data-ai-search-input]")).not.toBeFocused();

  await page.goto(`${routePath}&view=agent-hub`);
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(page.locator("[data-ai-search-view]")).toBeVisible();
  await expect(page.locator("[data-ai-search-input]")).toBeFocused();
});

test("keeps the mobile AI search available for an empty first-visit route", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "AI search is a mobile-first flow");

  await page.goto(`${routePath}&view=agent-hub&agentScenario=empty`);
  await page.setViewportSize({ height: 844, width: 390 });
  const search = page.locator("[data-ai-search-view]");

  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(search.locator("[data-ai-search-input]")).toBeVisible();
  await expect(search.getByText("AI検索で商品を探してみよう！")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("agent-search-empty-390.png") });
  await expectNoHorizontalPageOverflow(page);
});

test("keeps the agent search legible on tablet and desktop", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "desktop project covers tablet and desktop widths",
  );

  await page.goto(`${routePath}&view=agent-hub`);
  const hub = page.locator("[data-mobile-agent-hub]");
  const desktopNavigation = page.getByRole("navigation", { name: "メインメニュー" });

  for (const viewport of [
    { height: 900, width: 768 },
    { height: 900, width: 1024 },
    { height: 900, width: 1511 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(desktopNavigation).toBeVisible();
    await expect(
      hub.getByRole("heading", { name: "AIで商品を探す", exact: true }),
    ).toBeVisible();
    await expect(
      hub.getByRole("list", { name: "最近の検索" }).getByRole("listitem"),
    ).toHaveCount(3);
    await expect(hub.getByRole("button", { name: /の商品を見る$/ })).toHaveCount(2);
    await expect(hub.getByRole("button", { name: "すべて見る（8件）" })).toBeVisible();
    await expect(
      hub.getByRole("heading", { name: "よく検索されるキーワード", exact: true }),
    ).toBeVisible();
    await expect(hub.locator(".sazo-agent-hub-header")).toHaveCSS("display", "none");
    await expectNoHorizontalPageOverflow(page);
  }
});

test("continues the Pro controller purchase sheet with its selected color and quantity", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the controller purchase sheet is a mobile-first interaction",
  );
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);
  await page.getByRole("button", { exact: true, name: "購入に進む" }).click();

  const purchaseDialog = page.getByRole("dialog", {
    exact: true,
    name: "Proコントローラーの購入手続き",
  });
  await expect(purchaseDialog).toBeVisible();
  await expect(
    purchaseDialog.getByText("選択後、この商品を購入手続きへ進めます", { exact: true }),
  ).toBeVisible();
  await purchaseDialog.getByRole("button", { name: /ホワイト 在庫あり/ }).click();
  await purchaseDialog.getByRole("button", { exact: true, name: "数量を増やす" }).click();
  await purchaseDialog.getByRole("button", { exact: true, name: "購入手続きへ" }).click();
  await expect(page.getByRole("heading", { name: "カート (4)" })).toBeVisible();
});

test("gives the mobile purchase CTA the same visual prominence as a primary action", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the fixed purchase CTA is a mobile-first interaction",
  );
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);

  const purchaseButton = page.getByRole("button", {
    exact: true,
    name: "購入に進む",
  });

  await expect(purchaseButton).toHaveCSS("background-color", "rgb(233, 76, 104)");
  await expect(purchaseButton).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("completes the My Page post-purchase delivery flow", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the post-purchase account flow is a mobile-first interaction",
  );
  await page.goto(`${routePath}&view=mypage`);

  const myPage = page.locator('[data-view-content="mypage"]');
  await expect(myPage).toBeVisible();
  const myPageNavigation = page.getByRole("navigation", { name: "モバイルメニュー" });
  await expect(myPageNavigation).toBeVisible();
  await expect(
    myPageNavigation.getByRole("button", { name: "マイページ" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(myPageNavigation.getByRole("button")).toHaveCount(5);
  await page.screenshot({ path: testInfo.outputPath("mypage-shortcuts-390.png") });
  await expect(myPage.getByText("500", { exact: true })).toBeVisible();
  await myPage.getByRole("button", { name: /注文・配送/ }).click();

  const orders = page.locator('[data-view-content="orders"]');
  await expect(orders).toBeVisible();
  await expect(
    orders.getByText("CPF情報の確認が必要です", { exact: true }),
  ).toBeVisible();
  await orders.getByRole("button", { name: "Nintendo Switch OLEDを追跡する" }).click();
  await expect(orders.getByRole("status")).toContainText("国際配送の準備状況");
  await orders.getByRole("button", { name: "CPF情報を提出する" }).click();

  const detail = page.locator('[data-view-content="order-detail"]');
  await expect(detail).toBeVisible();
  await detail.getByRole("button", { name: "CPF情報を提出する" }).click();
  await expect(detail.getByRole("status")).toContainText("CPF情報を送信しました");
  await detail.getByRole("button", { name: "前の画面に戻る" }).click();
  await expect(orders).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
});

test("captures the coupon wallet states without mobile navigation", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "desktop") {
    for (const viewport of [
      { height: 900, width: 768 },
      { height: 900, width: 1_024 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${routePath}&view=coupons`);
      await expect(page.getByTestId("jplanet-coupons")).toBeVisible();
      await expect(page.locator(".sazo-desktop-header-band")).toBeVisible();
      await expect(page.getByTestId("jplanet-coupon-ticket")).toHaveCount(4);
      expect(
        await page
          .locator(".sazo-coupon-ticket-list")
          .evaluate(
            (element) =>
              getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean)
                .length,
          ),
      ).toBe(2);
      await expectNoHorizontalPageOverflow(page);
    }
    return;
  }

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${routePath}&view=coupons`);
    await expect(page.getByTestId("jplanet-coupons")).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`coupon-wallet-${viewport.width}.png`),
    });
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=coupons`);
  const ticketList = page.locator(".sazo-coupon-ticket-list");
  const tickets = page.getByTestId("jplanet-coupon-ticket");
  await expect(tickets).toHaveCount(4);
  await expect(tickets.nth(0).getByRole("button", { name: "使う" })).toBeVisible();
  await expect(tickets.nth(1).getByRole("button", { name: "あとで使う" })).toBeVisible();
  await expect(ticketList.getByText("残り3枚")).toBeVisible();
  await expect(ticketList.getByText("残り1時間")).toBeVisible();
  await tickets.nth(0).getByRole("button", { name: "利用条件" }).click();
  await expect(
    page.getByRole("dialog", { name: "国際送料 R$30 OFFの利用条件" }),
  ).toBeVisible();
  await page.getByRole("button", { exact: true, name: "閉じる" }).click();
  await page.getByRole("tab", { name: "商品 (1)" }).click();
  await expect(tickets).toHaveCount(1);
  await page.getByRole("tab", { name: "すべて (4)" }).click();
  await expect(tickets).toHaveCount(4);
  await tickets.nth(1).getByRole("button", { name: "あとで使う" }).click();
  await expect(page.getByRole("status")).toContainText(
    "初回購入の条件を確認後に利用できます",
  );
  await expectNoHorizontalPageOverflow(page);
  await page.getByRole("button", { name: "コードを入力" }).click();
  await page.screenshot({ path: testInfo.outputPath("coupon-code-input-390.png") });
  await page.getByRole("button", { exact: true, name: "閉じる" }).click();
  await page.getByRole("button", { name: "クーポンを探す" }).click();
  await page.screenshot({ path: testInfo.outputPath("coupon-discover-390.png") });
  await page.getByRole("button", { name: "戻る" }).click();
  await page.getByRole("button", { name: "利用履歴" }).click();
  await page.screenshot({ path: testInfo.outputPath("coupon-history-390.png") });
  await page.goto(`${routePath}&view=coupons`);
  await page
    .getByTestId("jplanet-coupon-ticket")
    .nth(0)
    .getByRole("button", { name: "使う" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "cart");
  await page.goto(`${routePath}&view=coupons&couponWallet=empty`);
  await expect(page.getByTestId("jplanet-coupon-empty")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("coupon-empty-390.png") });
});

test("opens one J-Planet brand directory from both entries and keeps NIKE browsing scoped", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the brand directory is a mobile-first flow",
  );

  for (const width of [341, 390, 440]) {
    await page.setViewportSize({ height: 844, width });
    await page.goto(`${routePath}&view=brands`);
    await expect(page.locator('[data-view-content="brands"]')).toBeVisible();
    await expect(page.getByRole("tablist", { name: "ブランド一覧タブ" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "商品カテゴリー" })).toHaveCount(0);
    await expect(
      page.getByRole("searchbox", { name: "AIでブランド・商品を探す" }),
    ).toHaveCount(1);
    await expect(page.getByText("全体 8件", { exact: true })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`brand-directory-route-${width}.png`),
    });
    await expectNoHorizontalPageOverflow(page);
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(routePath);
  await page
    .getByRole("group", { name: "J-Planetショートカット" })
    .getByRole("button", { name: "人気ブランド" })
    .click();
  await expect(page.locator('[data-view-content="brands"]')).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "モバイルメニュー" })
      .getByRole("button", { name: "ブランド" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: testInfo.outputPath("brand-directory-390.png") });

  await page.getByRole("button", { name: "家電" }).click();
  await expect(page.getByText("APPLE", { exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "AIでブランド・商品を探す" }).fill("ソニー");
  await expect(page.getByText("SONY", { exact: true })).toBeVisible();
  await expect(page.getByText("APPLE", { exact: true })).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath("brand-search-390.png") });
  await page.getByRole("searchbox", { name: "AIでブランド・商品を探す" }).fill("");
  await page.getByRole("button", { name: "全体" }).click();

  await page.getByRole("button", { name: "NIKEを開く" }).click();
  await expect(page.locator('[data-view-content="brand-detail"]')).toBeVisible();
  await expect(
    page.getByRole("status", { name: "ブランド商品を読み込んでいます" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "最安値" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("brand-nike-all-390.png") });
  await page.getByRole("tab", { name: "最安値" }).click();
  await expect(
    page.locator(".jplanet-brand-product-grid .jplanet-brand-product-card"),
  ).toHaveCount(12);
  await page.screenshot({ path: testInfo.outputPath("brand-nike-lowest-390.png") });
  await page.getByRole("tab", { name: "コスメ" }).click();
  await expect(page.getByText("現在表示できる商品はありません")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("brand-empty-390.png") });
  await page.getByRole("button", { name: "ほかのカテゴリを見る" }).click();
  await page.getByRole("tab", { name: "最安値" }).click();
  await expectNoHorizontalPageOverflow(page);

  await page
    .getByRole("button", { name: "Air Jordan 1 Retro High OGの商品詳細を開く" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");
});

test("renders mobile purchase experience reviews with working decision filters", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=reviews`);

  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "reviews");
  await expect(page.getByRole("heading", { name: "購入体験レビュー" })).toHaveCount(1);

  const reviewAgentEntry = page.locator("[data-review-agent-entry]");
  await expect(reviewAgentEntry).toBeVisible();
  await expect(
    reviewAgentEntry.getByRole("heading", { name: "AIで商品を探す" }),
  ).toBeVisible();
  await expect(
    reviewAgentEntry.getByText(
      "商品名・キーワード・画像・URLから\n探したい商品を検索してみてください。",
      {
        exact: true,
      },
    ),
  ).toBeVisible();
  await expect(
    reviewAgentEntry.locator(".sazo-review-agent-entry-hint svg"),
  ).toBeVisible();
  const reviewAgentComposer = reviewAgentEntry.locator(".sazo-mobile-agent-composer");
  await expect(
    reviewAgentComposer.getByRole("textbox", { name: "AI検索" }),
  ).toBeVisible();
  await expect(reviewAgentComposer.getByRole("button", { name: "カメラ" })).toBeVisible();
  await expect(
    reviewAgentComposer.locator(".sazo-mobile-agent-composer-input-shell"),
  ).toHaveCSS("min-height", "48px");

  const carousel = page.locator('[data-review-feature-carousel="true"]');
  await expect(carousel).toBeVisible();
  expect(
    await carousel.evaluate((element) => Math.round(element.getBoundingClientRect().top)),
  ).toBeGreaterThan(
    Math.round(
      await reviewAgentEntry.evaluate(
        (element) => element.getBoundingClientRect().bottom,
      ),
    ),
  );

  const featureCards = carousel.locator(".sazo-review-feature-card");
  await expect(featureCards).toHaveCount(3);
  await expect
    .poll(() =>
      carousel.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
    )
    .toMatchObject({ clientWidth: expect.any(Number) });
  expect(
    await carousel.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  expect(
    await featureCards.first().evaluate((element) => element.clientWidth),
  ).toBeGreaterThanOrEqual(300);
  expect(
    await carousel.evaluate((element) => {
      const [firstCard, secondCard] = element.querySelectorAll<HTMLElement>(
        ".sazo-review-feature-card",
      );
      if (firstCard === undefined || secondCard === undefined) {
        return false;
      }
      return (
        secondCard.getBoundingClientRect().left < element.getBoundingClientRect().right
      );
    }),
  ).toBe(true);
  const featureOverlay = await page
    .locator(".sazo-review-feature-copy")
    .first()
    .evaluate((element) => {
      const overlay = getComputedStyle(element, "::before");
      return {
        color: overlay.backgroundColor,
        height: Number.parseFloat(overlay.height),
      };
    });
  expect(featureOverlay.color).toBe("rgba(0, 0, 0, 0.24)");
  expect(featureOverlay.height).toBeGreaterThan(100);
  await expect(featureCards.first().locator("img")).toHaveAttribute(
    "src",
    "/sazo-commerce/review-media/mika-sneakers-arrival-v1.png",
  );
  await expect(page.locator(".sazo-review-tile").first()).toHaveAttribute(
    "data-review-id",
    "purchase-review-yuri",
  );
  await expect(page.locator(".sazo-review-tile")).toHaveCount(18);
  const reviewFeedHeading = page.locator(".sazo-review-feed-heading");
  const reviewCategoryRail = page.locator('[data-review-category-filter="true"]');
  expect(
    await reviewFeedHeading.evaluate((heading) => heading.getBoundingClientRect().top),
  ).toBeLessThan(
    await reviewCategoryRail.evaluate((rail) => rail.getBoundingClientRect().top),
  );
  const firstReviewColumn = page.locator(".sazo-review-masonry-column").first();
  const firstColumnTiles = firstReviewColumn.locator(".sazo-review-tile");
  await expect(firstColumnTiles).toHaveCount(9);
  expect(
    await firstColumnTiles.nth(1).evaluate((tile) => tile.getBoundingClientRect().top),
  ).toBeLessThanOrEqual(
    (await firstColumnTiles
      .nth(0)
      .evaluate((tile) => tile.getBoundingClientRect().bottom)) + 10,
  );
  const reviewMasonry = page.locator(".sazo-review-masonry");
  await expect(reviewMasonry).toHaveCSS("grid-auto-rows", "auto");
  expect(
    await reviewMasonry.evaluate((masonry) => {
      const editorialView = masonry.closest(".sazo-editorial-view");
      return (
        editorialView !== null &&
        editorialView.getBoundingClientRect().bottom >=
          masonry.getBoundingClientRect().bottom
      );
    }),
  ).toBe(true);
  await firstColumnTiles.nth(1).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("reviews-feed-390.png") });

  const mobileNavigation = page.getByRole("navigation", { name: "モバイルメニュー" });
  await expect(mobileNavigation).toBeVisible();
  await expect(mobileNavigation.getByRole("button")).toHaveCount(5);
  await expect(mobileNavigation.getByRole("button", { name: "ホーム" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({ path: testInfo.outputPath("reviews-390.png") });

  await page.getByRole("button", { name: "商品の状態" }).click();
  await expect(page.locator(".sazo-review-tile")).toHaveCount(12);
  await expect(page.getByRole("button", { name: "商品の状態" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  for (const width of [341, 440]) {
    await page.setViewportSize({ height: 844, width });
    await expectNoHorizontalPageOverflow(page);
    await expect(mobileNavigation).toBeVisible();
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await reviewAgentComposer
    .getByRole("textbox", { name: "AI検索" })
    .fill("New Balance 9060");
  await reviewAgentComposer.getByRole("button", { name: "送信" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "agent-searching",
  );
});

test("replays the deterministic SAZO commerce journey", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);

  if (testInfo.project.name === "desktop") {
    expect(page.viewportSize()).toEqual(desktopViewport);
    await page.goto(routePath);
    await expect(page.locator("[data-desktop-home-view]")).toBeVisible();
    await expect(page.getByTestId("desktop-home-product-rail")).toBeVisible();
    await expect(
      page
        .getByTestId("desktop-home-product-rail")
        .getByTestId("home-dense-product-card"),
    ).toHaveCount(6);
    await expect(page.locator(".sazo-mobile-nav")).toBeHidden();

    const desktopNavigation = page.getByRole("navigation", {
      exact: true,
      name: "メインメニュー",
    });
    await expect(desktopNavigation.getByRole("button")).toHaveCount(7);
    expect(
      await desktopNavigation
        .getByRole("button")
        .evaluateAll((buttons) => buttons.map((button) => button.textContent?.trim())),
    ).toEqual([
      "ホーム",
      "ブランド",
      "AI検索",
      "カテゴリー",
      "レビュー",
      "J-Planet GRAM",
      "配送・通関",
    ]);

    await desktopNavigation
      .getByRole("button", { exact: true, name: "ブランド" })
      .click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "brands");
    await expect(page.locator('[data-view-content="brands"]')).toBeVisible();

    await desktopNavigation.getByRole("button", { exact: true, name: "AI検索" }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "brands");
    await expect(page.locator(".sazo-desktop-agent-search-history-popover")).toBeVisible();

    await desktopNavigation.getByRole("button", { exact: true, name: "ホーム" }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
    await expect(
      page
        .getByTestId("desktop-home-product-rail")
        .getByTestId("home-dense-product-card"),
    ).toHaveCount(6);
    await expectNoHorizontalPageOverflow(page);

    const desktopRoutes: readonly [string, string][] = [
      ["home", "home"],
      ["brands", "brands"],
      ["brand-detail", "brand-detail"],
      ["agent-hub", "agent-hub"],
      ["notifications", "notifications"],
      ["mypage", "mypage"],
      ["coupons", "coupons"],
      ["product", "product&product=jplanet-nintendo-pro-controller"],
      ["cart", "cart"],
      ["checkout", "checkout"],
      ["orders", "orders"],
      ["favorites", "favorites"],
    ];
    for (const [expectedView, query] of desktopRoutes) {
      await page.goto(`${routePath}&view=${query}`);
      await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", expectedView);
      await expect(page.locator(".sazo-desktop-header-band")).toBeVisible();
      await expect(page.locator(".sazo-mobile-nav")).toBeHidden();
      await expectNoHorizontalPageOverflow(page);
    }

    return;
  }

  expect(testInfo.project.name).toBe("mobile");
  expect(page.viewportSize()).toEqual(mobileViewport);
  await page.goto(routePath);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  await expect(mobileNavigation.getByRole("button")).toHaveCount(5);
  expect(
    await mobileNavigation
      .getByRole("button")
      .evaluateAll((buttons) => buttons.map((button) => button.textContent?.trim())),
  ).toEqual(["ホーム", "ブランド", "AI検索", "通知", "マイページ"]);
  await expectLoadedDenseHomeProducts(page);

  await mobileNavigation.getByRole("button", { exact: true, name: "ブランド" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "brands");
  await expect(page.locator('[data-view-content="brands"]')).toBeVisible();

  await mobileNavigation.getByRole("button", { exact: true, name: "通知" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "notifications");
  await expect(page.locator('[data-view-content="notifications"]')).toBeVisible();

  await mobileNavigation.getByRole("button", { exact: true, name: "AI検索" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "ai-search");
  await expect(page.locator("[data-ai-search-view]")).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
});

test("keeps the selected agentic-commerce home responsive and interactive on desktop", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "desktop project covers the tablet and desktop home composition",
  );

  for (const viewport of [
    { height: 900, width: 768 },
    { height: 900, width: 1024 },
    { height: 900, width: 1440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(routePath);

    const desktopHome = page.locator("[data-desktop-home-view]");
    const agentLens = page.getByTestId("desktop-agent-lens");
    await expect(desktopHome).toBeVisible();
    await expect(page.locator(".sazo-mobile-nav")).toBeHidden();
    await expect(agentLens).toBeVisible();
    await expect(
      agentLens.getByRole("heading", { name: "AIで商品を探す" }),
    ).toBeVisible();
    await expect(agentLens.getByRole("search", { name: "AI検索" })).toHaveCount(1);
    const lensBanners = agentLens.locator("[data-agent-lens-banner]");
    await expect(lensBanners).toHaveCount(4);
    expect(
      await lensBanners.evaluateAll((banners) =>
        banners.map((banner) => ({
          nestedButtonCount: banner.querySelectorAll("button").length,
          tagName: banner.tagName,
        })),
      ),
    ).toEqual([
      { nestedButtonCount: 0, tagName: "BUTTON" },
      { nestedButtonCount: 0, tagName: "BUTTON" },
      { nestedButtonCount: 0, tagName: "BUTTON" },
      { nestedButtonCount: 0, tagName: "BUTTON" },
    ]);
    expect(
      await lensBanners
        .locator(".sazo-desktop-agent-lens-backdrop-media")
        .evaluateAll((images) =>
          images.map((image) => {
            const style = getComputedStyle(image);
            return {
              filter: style.filter,
              opacity: style.opacity,
              transform: style.transform,
            };
          }),
        ),
    ).toEqual([
      { filter: "none", opacity: "1", transform: "none" },
      { filter: "none", opacity: "1", transform: "none" },
      { filter: "none", opacity: "1", transform: "none" },
      { filter: "none", opacity: "1", transform: "none" },
    ]);
    if (viewport.width === 1440) {
      const control = agentLens.locator(".sazo-desktop-agent-lens-control");
      const lensSearch = agentLens.getByRole("search", { name: "AI検索" });
      const lensDensity = await agentLens.evaluate((lens) => {
        const controlSurface = lens.querySelector<HTMLElement>(
          ".sazo-desktop-agent-lens-control",
        );
        const searchSurface = lens.querySelector<HTMLElement>(
          ".sazo-desktop-agent-lens-search",
        );
        const heading = lens.querySelector<HTMLElement>(
          ".sazo-desktop-agent-lens-control h1",
        );
        const lensRect = lens.getBoundingClientRect();
        const controlRect = controlSurface?.getBoundingClientRect();
        const searchRect = searchSurface?.getBoundingClientRect();

        return {
          controlHeight: controlRect?.height ?? 0,
          headingFontSize: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : 0,
          lensHeight: lensRect.height,
          lensWidth: lensRect.width,
          searchHeight: searchRect?.height ?? 0,
        };
      });
      expect(lensDensity.lensWidth).toBeGreaterThanOrEqual(viewport.width - 64);
      expect(lensDensity.lensHeight).toBeLessThanOrEqual(600);
      expect(lensDensity.controlHeight).toBeLessThanOrEqual(460);
      expect(lensDensity.searchHeight).toBeLessThanOrEqual(78);
      expect(lensDensity.headingFontSize).toBeLessThanOrEqual(48);
      const getStaticSurfaceState = () =>
        control.evaluate((surface) => {
          const search = surface.querySelector<HTMLElement>(".sazo-desktop-agent-lens-search");
          const evidence = surface.querySelector<HTMLElement>(".sazo-desktop-agent-lens-evidence");
          const rect = surface.getBoundingClientRect();
          const searchRect = search?.getBoundingClientRect();
          return {
            control: { x: rect.x, y: rect.y },
            controlTransform: getComputedStyle(surface).transform,
            evidenceTransform: evidence ? getComputedStyle(evidence).transform : null,
            search: searchRect ? { x: searchRect.x, y: searchRect.y } : null,
            searchTransform: search ? getComputedStyle(search).transform : null,
          };
        });
      const staticSurfaceBefore = await getStaticSurfaceState();

      await lensSearch.hover();
      await page.waitForTimeout(350);
      expect(await getStaticSurfaceState()).toEqual(staticSurfaceBefore);

      const lensSearchInput = lensSearch.getByRole("textbox", {
        name: "商品名・キーワード・画像・URLで検索",
      });
      await lensSearchInput.click();
      await page.waitForTimeout(350);
      expect(await getStaticSurfaceState()).toEqual(staticSurfaceBefore);
      expect(
        await lensSearchInput.evaluate((input) => ({
          boxShadow: getComputedStyle(input).boxShadow,
          outlineStyle: getComputedStyle(input).outlineStyle,
          outlineWidth: getComputedStyle(input).outlineWidth,
        })),
      ).toEqual({ boxShadow: "none", outlineStyle: "none", outlineWidth: "0px" });
      await lensSearchInput.press("Escape");

      const firstBanner = lensBanners.first();
      await firstBanner.hover({ position: { x: 24, y: 24 } });
      await page.waitForTimeout(350);
      expect(await firstBanner.evaluate((banner) => getComputedStyle(banner).transform)).not.toBe(
        "none",
      );
    }
    const headerAiSearchTray = page.getByTestId("desktop-header-ai-search-tray");
    await expect(page.getByTestId("desktop-ai-search-trigger")).toHaveCount(0);
    await expect(headerAiSearchTray).toBeVisible();
    await expect(agentLens.getByRole("tablist")).toHaveCount(0);
    await expect(agentLens.getByRole("tab")).toHaveCount(0);
    await expect(
      page
        .getByTestId("desktop-home-product-rail")
        .getByTestId("home-dense-product-card"),
    ).toHaveCount(6);
    await expect(
      page.getByTestId("desktop-home-category-grid").getByRole("button"),
    ).toHaveCount(20);
    const categoryProducts = page.getByTestId("desktop-home-category-products");
    await expect(categoryProducts).toBeVisible();
    await expect(categoryProducts.getByTestId("home-dense-product-card")).toHaveCount(60);
    const categoryProductColumnCount = await categoryProducts
      .locator(".sazo-desktop-home-category-product-grid")
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length);
    expect(categoryProductColumnCount).toBe(
      viewport.width >= 1280 ? 6 : viewport.width >= 1024 ? 5 : 4,
    );
    await expect(page.getByTestId("desktop-home-reviews")).toBeVisible();
    await expect(page.getByTestId("desktop-home-gram")).toBeVisible();
    await expect(
      page.getByTestId("desktop-home-reviews").locator(".sazo-desktop-home-review-card"),
    ).toHaveCount(6);
    await expect(
      page.getByTestId("desktop-home-gram").locator(".sazo-desktop-home-gram-card"),
    ).toHaveCount(5);
    await expect(
      page
        .getByTestId("desktop-home-reviews")
        .getByRole("button", { name: "次のレビューを表示" }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("desktop-home-gram")
        .getByRole("button", { name: "次のJ-Planet GRAM投稿を表示" }),
    ).toBeVisible();
    await agentLens.evaluate((lens) => {
      window.scrollTo({ top: lens.getBoundingClientRect().bottom + window.scrollY + 24 });
    });
    await expect(headerAiSearchTray).toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect(headerAiSearchTray).toBeVisible();
    expect(
      await desktopHome.evaluate((home) => {
        const products = home.querySelector('[data-testid="desktop-home-product-rail"]');
        const community = home.querySelector('[data-testid="desktop-home-community"]');
        const categories = home.querySelector(
          '[data-testid="desktop-home-category-grid"]',
        );
        const categoryProducts = home.querySelector(
          '[data-testid="desktop-home-category-products"]',
        );

        return (
          products !== null &&
          community !== null &&
          categories !== null &&
          categoryProducts !== null &&
          Boolean(
            products.compareDocumentPosition(community) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ) &&
          Boolean(
            community.compareDocumentPosition(categories) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ) &&
          Boolean(
            categories.compareDocumentPosition(categoryProducts) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          )
        );
      }),
    ).toBe(true);
    await expectNoHorizontalPageOverflow(page);
  }

  await page.setViewportSize({ height: 900, width: 1024 });
  await page.goto(routePath);
  const desktopCouponPromotion = page
    .getByTestId("desktop-agent-lens")
    .getByRole("button", { name: "初回クーポンを見る" });
  await expect(desktopCouponPromotion).toBeVisible();
  // The centered purchase-agent surface intentionally covers this banner's
  // middle. Click the exposed outer area, which is the actual PC target.
  await desktopCouponPromotion.click({ position: { x: 36, y: 36 } });
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "coupons");

  await page.goto(routePath);
  const desktopAgentLens = page.getByTestId("desktop-agent-lens");
  await expect(desktopAgentLens.getByRole("tablist")).toHaveCount(0);
  await desktopAgentLens.getByRole("button", { name: "カメラ" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");

  await page.goto(routePath);
  await page
    .getByTestId("desktop-home-reviews")
    .getByRole("button", { exact: true, name: "もっと見る" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "reviews");

  await page.goto(routePath);
  await page
    .getByTestId("desktop-home-gram")
    .getByRole("button", { exact: true, name: "もっと見る" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "gram");

  await page.goto(routePath);
  const header = page.locator(".sazo-desktop-header");
  const headerAiSearchTray = page.getByTestId("desktop-header-ai-search-tray");
  await expect(headerAiSearchTray).toBeVisible();
  const headerAiSearchInput = headerAiSearchTray.getByRole("textbox", {
    name: "商品名・キーワード・画像・URLで検索",
  });
  await headerAiSearchInput.click();
  await expect(headerAiSearchInput).toBeFocused();
  const headerSearchHistoryPopover = page.getByRole("dialog", { name: "最近の検索" });
  await expect(headerSearchHistoryPopover).toBeVisible();
  await expect(
    headerSearchHistoryPopover.getByRole("list", { name: "最近の検索" }),
  ).toBeVisible();
  expect(
    await headerSearchHistoryPopover.evaluate(
      (panel) => panel.parentElement === document.body,
    ),
  ).toBe(true);
  await headerAiSearchInput.fill("Nintendo");
  await page.evaluate(() => window.scrollTo({ top: 700 }));
  await expect(headerAiSearchTray).toBeVisible();
  await headerAiSearchInput.press("Escape");
  await expect(headerAiSearchTray).toBeVisible();
  await expect(headerSearchHistoryPopover).toHaveCount(0);
  await expect(headerAiSearchInput).toBeFocused();
  await headerAiSearchInput.fill("Nintendo");
  await headerAiSearchTray.getByRole("button", { name: "AI検索を実行" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "agent-searching",
  );

  await page.goto(routePath);
  const lensSearch = page
    .getByTestId("desktop-agent-lens")
    .getByRole("search", { name: "AI検索" });
  const lensInput = lensSearch.getByRole("textbox", {
    name: "商品名・キーワード・画像・URLで検索",
  });
  await expect(lensInput).toHaveAttribute(
    "aria-controls",
    "desktop-agent-search-history-popover",
  );
  await expect(lensInput).toHaveAttribute("aria-expanded", "false");
  await lensInput.click();
  const searchHistoryPopover = page.getByRole("dialog", { name: "最近の検索" });
  await expect(searchHistoryPopover).toBeVisible();
  await expect(lensInput).toHaveAttribute("aria-expanded", "true");
  await expect(
    searchHistoryPopover.getByRole("list", { name: "最近の検索" }),
  ).toBeVisible();
  await expect(
    searchHistoryPopover.getByRole("button", { name: /の商品を見る$/ }),
  ).toHaveCount(8);
  expect(
    await searchHistoryPopover.evaluate((panel) => ({
      isDirectBodyChild: panel.parentElement === document.body,
      isInsideLens: Boolean(panel.closest("[data-testid='desktop-agent-lens']")),
    })),
  ).toEqual({ isDirectBodyChild: true, isInsideLens: false });
  await page.keyboard.press("Escape");
  await expect(searchHistoryPopover).toHaveCount(0);
  await expect(lensInput).toHaveAttribute("aria-expanded", "false");

  const recentProductsTrigger = page.getByRole("button", {
    name: "最近確認した商品 続きからすぐに確認できます",
  });
  await expect(recentProductsTrigger).toHaveAttribute(
    "aria-controls",
    "desktop-recent-products-popover",
  );
  await expect(recentProductsTrigger).toHaveAttribute("aria-expanded", "false");
  await recentProductsTrigger.click();
  const recentProductsPopover = page.getByRole("dialog", { name: "最近見た商品" });
  await expect(recentProductsPopover).toBeVisible();
  await expect(recentProductsTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    recentProductsPopover.getByRole("button", { name: /の商品を見る$/ }),
  ).toHaveCount(8);
  expect(
    await recentProductsPopover.evaluate((panel) => ({
      isDirectBodyChild: panel.parentElement === document.body,
      isInsideLens: Boolean(panel.closest("[data-testid='desktop-agent-lens']")),
    })),
  ).toEqual({ isDirectBodyChild: true, isInsideLens: false });
  await recentProductsPopover
    .getByRole("button", { name: "Sony α7C IIを最近見た商品から削除" })
    .click();
  await expect(
    recentProductsPopover.getByRole("button", { name: /の商品を見る$/ }),
  ).toHaveCount(7);
  await page.keyboard.press("Escape");
  await expect(recentProductsPopover).toHaveCount(0);
  await expect(recentProductsTrigger).toHaveAttribute("aria-expanded", "false");

  await lensInput.fill("New Balance 9060");
  await lensSearch.getByRole("button", { name: "AI検索を実行" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "agent-searching",
  );

  await page.goto(routePath);
  await page
    .getByTestId("desktop-agent-lens")
    .getByRole("button", { name: "カメラ" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");

  await page.goto(routePath);
  await header.getByRole("button", { name: "カート" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "cart");

  await page.goto(routePath);
  await header.getByRole("button", { name: "チャット" }).click();
  await expect(page.getByRole("dialog", { name: "J-Planetチャット" })).toBeVisible();

  await page.goto(routePath);
  await page
    .getByTestId("desktop-home-category-grid")
    .getByRole("button", { name: "すべてのカテゴリー" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "categories");

  await page.goto(routePath);
  await page
    .getByRole("navigation", { name: "メインメニュー" })
    .getByRole("button", { name: "カテゴリー", exact: true })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "categories");

  await page.goto(routePath);
  await page
    .getByTestId("desktop-home-product-rail")
    .locator(".sazo-home-dense-product-copy")
    .first()
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");

  await page.goto(routePath);
  await page
    .getByTestId("desktop-home-category-products")
    .getByRole("button", { name: "もっと見る" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "catalog");
});

test("keeps desktop product actions in the purchase column without changing mobile", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "desktop project covers the desktop-only product purchase layout",
  );

  const productPath = `${routePath}&view=product&product=jplanet-nintendo-pro-controller`;

  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto(productPath);

  const desktopPurchase = page.getByTestId("jplanet-desktop-controller-purchase");
  const stickyPurchase = page.getByTestId("jplanet-desktop-controller-sticky-purchase");
  await expect(desktopPurchase).toBeVisible();
  await expect(stickyPurchase).toHaveCSS("position", "sticky");
  await expect(stickyPurchase).toHaveCSS("top", "24px");
  await page
    .getByTestId("jplanet-desktop-controller-information")
    .scrollIntoViewIfNeeded();
  await expect(stickyPurchase).toBeInViewport();
  await expect(
    desktopPurchase.getByTestId("jplanet-desktop-controller-order-total"),
  ).toContainText("R$ 429");
  await expect(
    stickyPurchase.getByTestId("jplanet-desktop-controller-order-total"),
  ).toContainText("R$ 429");
  await stickyPurchase.getByRole("button", { name: "PCで数量を増やす" }).click();
  await expect(
    desktopPurchase.locator(".sazo-desktop-controller-purchase-quantity span"),
  ).toHaveText("2");
  await expect(
    desktopPurchase.getByTestId("jplanet-desktop-controller-order-total"),
  ).toContainText("R$ 858");
  await expect(
    stickyPurchase.getByTestId("jplanet-desktop-controller-order-total"),
  ).toContainText("R$ 858");
  await expect(page.getByTestId("jplanet-desktop-controller-points")).toHaveText(
    /4P \(1%\)/,
  );
  await expect(page.getByTestId("jplanet-desktop-controller-delivery-note")).toHaveCount(
    0,
  );
  await expect(page.getByText("関税込み・国際送料を含む見込みです。")).toHaveCount(0);
  await page.getByRole("button", { name: "配送・通関の詳細を開く" }).click();
  const deliveryGuide = page.getByTestId("jplanet-desktop-delivery-guide");
  await expect(deliveryGuide).toBeVisible();
  await expect(deliveryGuide).toContainText(
    "送料・税金の内訳は、購入前に確認が必要です。",
  );
  await deliveryGuide.getByRole("button", { name: "配送・通関のご案内を閉じる" }).click();
  await expect(deliveryGuide).toHaveCount(0);
  await expect(page.getByTestId("jplanet-controller-variant-rail")).toBeHidden();
  await expect(page.locator(".sazo-reference-nintendo-controller-footer")).toBeHidden();
  const desktopGallery = page.locator(".sazo-desktop-controller-gallery-thumbnails");
  await expect(desktopGallery).toBeVisible();
  await expect(desktopGallery.getByRole("button")).toHaveCount(3);
  await desktopGallery.getByRole("button", { name: "ホワイトの商品画像を表示" }).click();
  await expect(page.locator(".sazo-reference-nintendo-controller-hero")).toHaveAttribute(
    "src",
    "/sazo-commerce/reference/nintendo-pro-controller-white-v1.png",
  );
  await desktopPurchase.getByRole("button", { name: "ホワイト 在庫あり" }).click();
  await expect(page.locator(".sazo-reference-nintendo-controller-hero")).toHaveAttribute(
    "src",
    "/sazo-commerce/reference/nintendo-pro-controller-white-v1.png",
  );
  await desktopPurchase.getByRole("button", { name: "PCで数量を増やす" }).click();
  await desktopPurchase.getByRole("button", { name: "商品をカートに入れる" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "cart");

  await page.goto(productPath);
  await page
    .getByTestId("jplanet-desktop-controller-purchase")
    .getByRole("button", { name: "商品を購入に進む" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "checkout");

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(productPath);
  await expect(page.getByTestId("jplanet-desktop-controller-purchase")).toBeHidden();
  await expect(page.getByTestId("jplanet-desktop-controller-points")).toHaveCount(0);
  await expect(page.getByTestId("jplanet-desktop-controller-delivery-note")).toHaveCount(
    0,
  );
  await expect(page.getByTestId("jplanet-controller-variant-rail")).toBeVisible();
  await expect(page.locator(".sazo-reference-nintendo-controller-footer")).toBeVisible();
  await page.getByRole("button", { name: "配送・通関の詳細を開く" }).click();
  await expect(page.getByTestId("jplanet-delivery-detail")).toBeVisible();
});
