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

function isMobilePickRequest(url: string) {
  return new URL(url).pathname.startsWith("/sazo-commerce/mobile-picks/");
}

function trackMobilePickFailures(page: Page) {
  const failures: string[] = [];

  page.on("requestfailed", (request) => {
    if (isMobilePickRequest(request.url())) {
      failures.push(`${request.url()}: ${request.failure()?.errorText ?? "request failed"}`);
    }
  });
  page.on("response", (response) => {
    if (isMobilePickRequest(response.url()) && !response.ok()) {
      failures.push(`${response.url()}: HTTP ${String(response.status())}`);
    }
  });

  return failures;
}

async function expectLoadedMobilePicks(page: Page, failures: readonly string[]) {
  const images = page.locator(
    '[data-mobile-picks-grid] img[src^="/sazo-commerce/mobile-picks/"]',
  );

  await expect(images).toHaveCount(31);
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
  expect(failures).toEqual([]);
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

async function expectMobileGridLayout(
  grid: Locator,
  expectedColumns: number,
  expectedPageSize: number,
  expectedOverflow: "horizontal" | "vertical" | "none",
) {
  await expect(grid).toHaveAttribute("data-page-size", String(expectedPageSize));
  await expect(grid).toHaveAttribute(
    "data-layout",
    expectedColumns === 5 ? "five-column-two-row" : "four-column-page",
  );

  const layout = await grid.evaluate((element) => {
    const layoutElement = element.querySelector<HTMLElement>(
      "[data-mobile-category-page]",
    ) ?? element;
    const style = getComputedStyle(layoutElement);
    return {
      display: style.display,
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    };
  });

  expect(layout.display).toBe("grid");
  expect(layout.columns).toBe(expectedColumns);
  if (expectedOverflow === "vertical") {
    expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight);
  } else if (expectedOverflow === "horizontal") {
    expect(layout.scrollWidth).toBeGreaterThan(layout.clientWidth);
  } else {
    expect(layout.scrollWidth).toBe(layout.clientWidth);
    expect(layout.scrollHeight).toBe(layout.clientHeight);
  }
}

async function expectComposerBelowAgentHeader(page: Page) {
  const measureGap = () =>
    page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".sazo-agent-hub-header");
      const composer = document.querySelector<HTMLElement>(
        ".sazo-mobile-agent-composer",
      );

      if (header === null || composer === null) {
        throw new Error("Missing agent header or composer");
      }

      return composer.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    });

  await expect.poll(measureGap).toBeGreaterThanOrEqual(0);
  await expect
    .poll(measureGap)
    .toBeLessThanOrEqual(1);
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
        .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label"))),
    )
    .toEqual(["J-Planet特集", "限定", "フリマ", "コスメ", "K-POP"]);
  await desktopShortcuts.getByRole("button", { exact: true, name: "コスメ" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
  await expect(page.locator("[data-beauty-view]")).toBeVisible();
  await page
    .getByRole("navigation", { exact: true, name: "メインメニュー" })
    .getByRole("button", { exact: true, name: "ホーム" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  const heroCounter = page.getByTestId("sazo-hero-counter");
  const heroRoot = page.locator(".sazo-root");
  const campaign = page.getByRole("button", {
    exact: true,
    name: "クーポンキャンペーンを見る",
  });

  await page.getByRole("button", { exact: true, name: "次のバナー" }).click();
  await expect(heroCounter).toHaveText("2/5");

  const dragStart = await pointInsideHero(page, 0.65, 0.5);
  const dragEnd = await pointInsideHero(page, 0.35, 0.52);
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 4 });
  await page.mouse.up();

  await expect(heroRoot).toHaveAttribute("data-view", "home");
  await expect(heroCounter).toHaveText("3/5");

  await page.getByRole("button", { exact: true, name: "前のバナー" }).click();
  await campaign.click();
  await expect(heroRoot).toHaveAttribute("data-view", "campaign");

  await page.goto(routePath);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  externalRequests.length = 0;

  await page.getByTestId("nav-reviews").click();
  await expect(
    page.getByRole("heading", { exact: true, level: 1, name: "利用レビュー" }),
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
  const mobilePickFailures = trackMobilePickFailures(page);

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
  expect(compactHeaderGeometry.heroTop - compactHeaderGeometry.headerBottom).toBeLessThanOrEqual(1);
  const heroViewport = page.locator(".sazo-hero-viewport");
  const heroCounter = page.getByTestId("sazo-hero-counter");

  await expect(heroCounter).toHaveText("1/5");
  await page
    .getByRole("button", { exact: true, name: "バナーを一時停止" })
    .click();
  await expect(
    page.getByRole("button", { exact: true, name: "バナーを再生" }),
  ).toBeVisible();
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
  await expect(heroCounter).toHaveText("2/5");

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
  await expect(heroCounter).toHaveText("2/5");

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
  await expect(heroCounter).toHaveText("1/5");

  const nativeStart = await pointInsideHero(page, 0.8, 0.5);
  const nativeMiddle = await pointInsideHero(page, 0.6, 0.51);
  const nativeEnd = await pointInsideHero(page, 0.35, 0.52);
  await dispatchNativeTouchGesture(page, [nativeStart, nativeMiddle, nativeEnd]);
  await expect(heroCounter).toHaveText("2/5");

  const campaignStart = await pointInsideHero(page, 0.75, 0.5);
  const campaignMiddle = await pointInsideHero(page, 0.55, 0.51);
  const campaignEnd = await pointInsideHero(page, 0.3, 0.52);
  await dispatchNativeTouchGesture(page, [
    campaignStart,
    campaignMiddle,
    campaignEnd,
  ]);
  await expect(heroCounter).toHaveText("3/5");
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  const scrollBefore = await page.evaluate(() => window.scrollY);
  const verticalStart = await pointInsideHero(page, 0.5, 0.8);
  const verticalMiddle = await pointInsideHero(page, 0.5, 0.5);
  const verticalEnd = await pointInsideHero(page, 0.5, 0.2);
  await dispatchNativeTouchGesture(page, [
    verticalStart,
    verticalMiddle,
    verticalEnd,
  ]);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(
    scrollBefore,
  );
  await waitForScrollSettle(page);
  await expect(heroCounter).toHaveText("3/5");
  await expectLoadedMobilePicks(page, mobilePickFailures);
  externalRequests.length = 0;

  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  const shortcutRail = page.getByRole("group", {
    exact: true,
    name: "J-Planetショートカット",
  });
  await expect(page.getByRole("navigation", { name: "モバイルサブメニュー" })).toHaveCount(0);
  await expect(page.locator(".sazo-home-intro")).toHaveCount(0);
  await expect(shortcutRail.getByRole("button")).toHaveText([
    "J-Planet特集",
    "限定",
    "フリマ",
    "サービス紹介",
    "人気ブランド",
    "カテゴリー",
    "レビュー",
    "ヘルプ",
    "お知らせ",
  ]);
  await expect(shortcutRail.getByRole("button", { exact: true, name: "コスメ" })).toHaveCount(0);
  await expect(shortcutRail.getByRole("button", { exact: true, name: "K-POP" })).toHaveCount(0);
  await expectMobileGridLayout(shortcutRail, 5, 10, "none");

  const couponBanner = page.getByTestId("mobile-coupon-banner");
  await expect(couponBanner).toBeVisible();
  expect(
    await couponBanner.evaluate((element) => {
      const interested = document.querySelector(".sazo-interested-items");
      return interested === null
        ? false
        : Boolean(element.compareDocumentPosition(interested) & Node.DOCUMENT_POSITION_FOLLOWING);
    }),
  ).toBe(true);
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
    const header = styleOf(".sazo-account-header");
    const content = styleOf(".sazo-account-screen-content");

    return {
      cardDisplay: styleOf(".sazo-coupon-card").display,
      contentWidth: content.rectangle.width,
      countDisplay: styleOf(".sazo-coupon-count").display,
      formDisplay: styleOf(".sazo-coupon-register > div").display,
      headerDisplay: header.display,
      headerHeight: header.rectangle.height,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(couponLayout).toMatchObject({
    cardDisplay: "grid",
    countDisplay: "flex",
    formDisplay: "grid",
    headerDisplay: "grid",
    viewportWidth: 390,
  });
  expect(couponLayout.headerHeight).toBeGreaterThanOrEqual(56);
  expect(couponLayout.contentWidth).toBeLessThanOrEqual(couponLayout.viewportWidth);
  await expectNoHorizontalPageOverflow(page);
  await mobileNavigation.getByRole("button", { exact: true, name: "ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await expect(
    mobileNavigation.getByRole("button", { exact: true, name: "ホーム" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize(mobileViewport);

  const gramSection = page.getByTestId("mobile-gram-section");
  const categorySection = page.getByTestId("mobile-category-rail");
  const categoryRail = categorySection.getByRole("group", {
    exact: true,
    name: "商品カテゴリーから探す",
  });
  await expect(gramSection).toBeVisible();
  await expect(categorySection).toBeVisible();
  expect(
    await categorySection.evaluate(
      (element) => element.previousElementSibling?.getAttribute("data-testid"),
    ),
  ).toBe("mobile-gram-section");
  await expectMobileGridLayout(categoryRail, 4, 8, "horizontal");
  await expectNoHorizontalPageOverflow(page);

  await categorySection.getByRole("button", { exact: true, name: "カテゴリーをもっと見る" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "categories");
  await expect(page.getByTestId("category-agent-entry")).toBeVisible();
  await expect(
    page.getByTestId("category-agent-entry").getByPlaceholder("URL・画像・商品名をAIに渡す"),
  ).toBeVisible();
  await page.getByRole("navigation", { exact: true, name: "カテゴリー" })
    .getByRole("button", { exact: true, name: "メンズ" })
    .click();
  await expect(page.getByRole("heading", { exact: true, name: "メンズ" })).toBeVisible();
  await page.getByRole("button", { exact: true, name: "トップス" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
  await expect(page.locator('[data-beauty-view][data-category-id="mens"]')).toBeVisible();
  await expect(page.getByTestId("category-agent-intro")).toBeVisible();
  await expect(
    page.getByTestId("category-agent-intro").getByPlaceholder("URL・画像・商品名をAIに渡す"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /J-Planetで探す/ })).toBeVisible();
  await mobileNavigation.getByRole("button", { exact: true, name: "ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await page.setViewportSize({ height: 844, width: 390 });
  await expectNoHorizontalPageOverflow(page);
  await page.setViewportSize({ height: 956, width: 440 });
  await expectNoHorizontalPageOverflow(page);
  await page.setViewportSize(mobileViewport);

  for (const label of ["メンズ", "食品"] as const) {
    const currentCategoryRail = page
      .getByTestId("mobile-category-rail")
      .getByRole("group", { exact: true, name: "商品カテゴリーから探す" });
    await currentCategoryRail.getByRole("button", { exact: true, name: label }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
    const categoryId = label === "メンズ" ? "mens" : "food";
    await expect(page.getByTestId("category-agent-intro")).toBeVisible();
    await expect(page.getByTestId("category-agent-intro")).toHaveAttribute(
      "data-category-id",
      categoryId,
    );
    await expect(page.getByRole("heading", { name: /J-Planetで探す/ })).toBeVisible();
    await mobileNavigation.getByRole("button", { exact: true, name: "ホーム" }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  }

  const homeAgent = page.locator("[data-home-agent-entry]");
  await expect(homeAgent).toBeVisible();
  await expect(
    homeAgent.getByRole("textbox", { exact: true, name: "URL・画像・商品名をAIに渡す" }),
  ).toBeVisible();
  await homeAgent.getByRole("button", { exact: true, name: "入力メニュー" }).click();
  await expect(
    homeAgent.getByRole("menuitem", { exact: true, name: "ギャラリー" }),
  ).toBeVisible();
  await expect(homeAgent.getByRole("menuitem", { exact: true, name: "カメラ" })).toBeVisible();
  await homeAgent.getByRole("menuitem", { exact: true, name: "ギャラリー" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await mobileNavigation.getByRole("button", { exact: true, name: "エージェント" }).click();
  const hub = page.locator("[data-mobile-agent-hub]");
  await expect(hub).toBeVisible();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await expect(
    page.getByRole("dialog", { exact: true, name: "J-Planet AIエージェント" }),
  ).toHaveCount(0);
  await expect(hub.getByRole("button", { exact: true, name: "送信" }))
    .toBeDisabled();
  await expectNoHorizontalPageOverflow(page);
  await page.setViewportSize({ height: 956, width: 440 });
  await expectNoHorizontalPageOverflow(page);
  await page.setViewportSize(mobileViewport);

  await hub.getByRole("button", { exact: true, name: "ホームへ戻る" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await mobileNavigation.getByRole("button", { exact: true, name: "エージェント" }).click();
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
  await expect(hub.getByRole("button", { exact: true, name: "送信" }))
    .toBeEnabled();

  await hub.getByRole("button", { exact: true, name: "ホームへ戻る" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");

  await mobileNavigation
    .getByRole("button", { exact: true, name: "エージェント" })
    .click();
  const agentNavigation = mobileNavigation.getByRole("button", {
    exact: true,
    name: "エージェント",
  });
  await expect(hub).toBeVisible();
  await expect(hub.getByRole("heading", { exact: true, name: "最近の相談" })).toBeVisible();
  await expect(hub.getByRole("heading", { exact: true, name: "最近見た商品" })).toBeVisible();
  await expect(
    hub.getByRole("heading", {
      exact: true,
      name: "人気キーワード",
    }),
  ).toBeVisible();
  await expect(agentNavigation).toHaveAttribute("aria-pressed", "true");

  await hub.getByRole("button", { exact: true, name: "最近の相談を削除" }).click();
  await expect(hub.getByText("日本限定スニーカーを探したい", { exact: true })).toHaveCount(
    0,
  );
  await expect(hub.getByRole("button", { name: /商品詳細を見る/ })).toHaveCount(3);

  await hub.getByRole("button", { name: /商品詳細を見る/ }).first().click();
  const product = page.locator("[data-product-detail]");
  await expect(product).toBeVisible();
  await product.locator(".sazo-product-detail-header .sazo-product-detail-back").click();
  await expect(hub).toBeVisible();
  await expect(agentNavigation).toHaveAttribute("aria-pressed", "true");

  await hub.getByRole("button", { exact: true, name: "AIエージェントに相談" }).click();
  await expect(
    page.getByRole("dialog", { exact: true, name: "J-Planet AIエージェント" }),
  ).toHaveCount(0);
  await expectComposerBelowAgentHeader(page);
  await hub.getByRole("button", { exact: true, name: "1位 アニメグッズ" }).click();
  await expectComposerBelowAgentHeader(page);
  const composer = hub.locator(".sazo-mobile-agent-composer");
  await expect(
    composer.getByRole("textbox", {
      name: "URL・画像・商品名をAIに渡す",
    }),
  )
    .toHaveValue("アニメグッズ");
  const submit = composer.getByRole("button", {
    exact: true,
    name: "送信",
  });
  const [submitBackground, sakuraColor] = await Promise.all([
    submit.evaluate((element) => getComputedStyle(element).backgroundColor),
    page.locator(".sazo-root").evaluate((element) => {
      const variable = window.innerWidth <= 767 ? "--jplanet-navy" : "--jplanet-sakura";
      const swatch = document.createElement("span");
      swatch.style.color = getComputedStyle(element).getPropertyValue(variable);
      document.body.append(swatch);
      const color = getComputedStyle(swatch).color;
      swatch.remove();

      return color;
    }),
  ]);
  expect(submitBackground).toBe(sakuraColor);
  await submit.click();
  await expect(composer.getByRole("status")).toHaveText(
    "AIエージェントが商品を探し始めました",
  );

  await mobileNavigation
    .getByRole("button", { exact: true, name: "マイページ" })
    .click();
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
    const header = rectangle(".sazo-account-header");
    const memberName = rectangle(".sazo-member-name strong");
    const avatar = rectangle(".sazo-member-avatar");
    const orderSummary = rectangle(".sazo-order-summary");
    const shopping = rectangle(".sazo-account-group");
    const accountLink = rectangle(".sazo-account-link");

    return {
      accountLinkHeight: accountLink.height,
      avatarWidth: avatar.width,
      groupTitleFontSize: fontSize(".sazo-account-group h2"),
      headerHeight: header.height,
      memberNameFontSize: fontSize(".sazo-member-name strong"),
      memberNameTopGap: memberName.top - header.bottom,
      orderSummaryHeight: orderSummary.height,
      shoppingHeight: shopping.height,
    };
  });
  expect(myPageGeometry.headerHeight).toBeGreaterThanOrEqual(42);
  expect(myPageGeometry.memberNameTopGap).toBeGreaterThanOrEqual(48);
  expect(myPageGeometry.memberNameFontSize).toBeGreaterThanOrEqual(19);
  expect(myPageGeometry.avatarWidth).toBeGreaterThanOrEqual(29);
  expect(myPageGeometry.orderSummaryHeight).toBeGreaterThanOrEqual(58);
  expect(myPageGeometry.groupTitleFontSize).toBeGreaterThanOrEqual(18);
  expect(myPageGeometry.accountLinkHeight).toBeGreaterThanOrEqual(42);
  expect(myPageGeometry.shoppingHeight).toBeGreaterThanOrEqual(235);

  await account.getByRole("button", { exact: true, name: "お気に入り" }).click();
  let accountView = page.locator('[data-view-content="favorites"]');
  await expect(accountView).toBeVisible();
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await account.getByRole("button", { exact: true, name: "会員情報の修正" }).click();
  accountView = page.locator('[data-view-content="profile"]');
  await expect(accountView).toBeVisible();
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await account.getByRole("button", { exact: true, name: "登録カード管理" }).click();
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

test("opens the J-Planet BEAUTY route with an inline AI composer and touch rails", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "BEAUTY reproduction is mobile-first");
  // Mobile intentionally removes the desktop-only コスメ shortcut. Start
  // from the QA deep-link so this existing BEAUTY journey remains covered
  // without reintroducing that shortcut into the mobile rail.
  await page.goto(`${routePath}&view=beauty`);

  const beauty = page.locator("[data-beauty-view]");
  await expect(beauty).toBeVisible();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
  await expect(beauty.locator(".sazo-beauty-logo img")).toBeVisible();
  await expect(beauty.getByText("BEAUTY", { exact: true })).toBeVisible();

  const composer = beauty.getByPlaceholder("URL・画像・商品名をAIに渡す");
  await composer.fill("美容液");
  await beauty.getByRole("button", { exact: true, name: "送信" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
  await expect(page.getByRole("dialog", { name: "J-Planet AIエージェント" })).toHaveCount(0);
  await expect(beauty.getByText("AIエージェントが商品を探し始めました", { exact: true })).toBeVisible();
  await composer.fill("");

  const categoryRail = beauty.locator(".sazo-beauty-category-rail");
  const categoryBox = await categoryRail.boundingBox();
  if (categoryBox === null) throw new Error("Missing BEAUTY category rail geometry");
  await dispatchNativeTouchGesture(page, [
    { x: categoryBox.x + categoryBox.width - 18, y: categoryBox.y + categoryBox.height / 2 },
    { x: categoryBox.x + categoryBox.width / 2, y: categoryBox.y + categoryBox.height / 2 },
    { x: categoryBox.x + 22, y: categoryBox.y + categoryBox.height / 2 },
  ]);
  await expect.poll(() => categoryRail.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);

  await beauty.getByRole("button", { exact: true, name: "マスクパック" }).click();
  await expect(beauty.getByRole("status", { name: "マスクパックの商品を読み込んでいます" })).toBeVisible();
  await expect(beauty.getByRole("button", { exact: true, name: "マスクパック" })).toHaveAttribute(
    "aria-pressed",
    "true",
    { timeout: 800 },
  );
  await expect(beauty.locator(".sazo-beauty-product-card")).toHaveCount(6);

  const productRail = beauty.locator(".sazo-beauty-product-rail");
  const productBox = await productRail.boundingBox();
  if (productBox === null) throw new Error("Missing BEAUTY product rail geometry");
  await dispatchNativeTouchGesture(page, [
    { x: productBox.x + productBox.width - 18, y: productBox.y + productBox.height / 2 },
    { x: productBox.x + productBox.width / 2, y: productBox.y + productBox.height / 2 },
    { x: productBox.x + 22, y: productBox.y + productBox.height / 2 },
  ]);
  await expect.poll(() => productRail.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);

  await beauty.locator(".sazo-beauty-product-card button").first().click();
  await expect(page.locator("[data-product-detail]")).toBeVisible();
  await page.locator(".sazo-product-detail-header .sazo-product-detail-back").click();
  await expect(beauty).toBeVisible();
  await expect(page.getByRole("navigation", { name: "モバイルメニュー" })).toBeVisible();
});

test("replays the deterministic SAZO commerce journey", async ({ page }, testInfo) => {
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);

  if (testInfo.project.name === "desktop") {
    expect(page.viewportSize()).toEqual(desktopViewport);
    await replayDesktopScenario(page);

    return;
  }

  expect(testInfo.project.name).toBe("mobile");
  expect(page.viewportSize()).toEqual(mobileViewport);
  await replayMobileScenario(page);
});
