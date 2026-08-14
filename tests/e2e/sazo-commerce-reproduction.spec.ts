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
  const cards = page.getByTestId("home-dense-product-card");
  const images = page.locator("[data-home-dense-product-grid] img");

  await expect(cards).toHaveCount(16);
  await expect(images).toHaveCount(16);
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

async function expectMobileGridLayout(
  grid: Locator,
  expectedColumns: number,
  expectedPageSize: number,
  expectedOverflow: "horizontal" | "vertical" | "none",
) {
  await expect(grid).toHaveAttribute("data-page-size", String(expectedPageSize));
  await expect(grid).toHaveAttribute(
    "data-layout",
    expectedColumns === 5
      ? "five-column-two-row"
      : expectedColumns === 7
        ? "seven-column-quick-row"
        : "four-column-page",
  );

  const layout = await grid.evaluate((element) => {
    const layoutElement =
      element.querySelector<HTMLElement>("[data-mobile-category-page]") ?? element;
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
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
  await expect(page.locator("[data-beauty-view]")).toBeVisible();
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
    .toEqual(["jplanet-ai-emerald", "jplanet-ai-violet", "jplanet-ai-coral"]);
  await page.getByRole("button", { exact: true, name: "次のバナー" }).click();
  await expect(heroCounter).toHaveText("2/3");

  await page.getByRole("button", { exact: true, name: "前のバナー" }).click();
  await expect(heroCounter).toHaveText("1/3");
  await expect(heroRoot).toHaveAttribute("data-view", "home");

  await page.goto(routePath);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  externalRequests.length = 0;

  await page.getByTestId("nav-reviews").click();
  await expect(
    page.getByRole("heading", { exact: true, level: 2, name: "利用レビュー" }),
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
    name: "URL・画像・商品名をAIに渡す",
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
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await page.getByRole("button", { exact: true, name: "J-Planet ホーム" }).click();
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

  await expect(heroCounter).toHaveText("1/3");
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
  await expect(heroCounter).toHaveText("2/3");

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
  await expect(heroCounter).toHaveText("2/3");

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
  await expect(heroCounter).toHaveText("1/3");

  const nativeStart = await pointInsideHero(page, 0.8, 0.5);
  const nativeMiddle = await pointInsideHero(page, 0.6, 0.51);
  const nativeEnd = await pointInsideHero(page, 0.35, 0.52);
  await dispatchNativeTouchGesture(page, [nativeStart, nativeMiddle, nativeEnd]);
  await expect(heroCounter).toHaveText("2/3");

  const campaignStart = await pointInsideHero(page, 0.75, 0.5);
  const campaignMiddle = await pointInsideHero(page, 0.55, 0.51);
  const campaignEnd = await pointInsideHero(page, 0.3, 0.52);
  await dispatchNativeTouchGesture(page, [campaignStart, campaignMiddle, campaignEnd]);
  await expect(heroCounter).toHaveText("3/3");
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
  await expect(heroCounter).toHaveText("3/3");
  const persistentAssurances = page.locator(".sazo-home-agent-assurances");
  await expect(persistentAssurances).toBeVisible();
  await expect(persistentAssurances).toHaveCSS("display", "grid");
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
  await couponCodeForm.getByRole("textbox", { name: "クーポンコードを入力" }).fill("JPLANET20");
  await couponCodeForm.getByRole("button", { name: "適用" }).click();
  await expect(couponCodeForm.getByRole("status")).toContainText("クーポンを追加しました");
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
  const categorySection = page.getByTestId("mobile-category-rail");
  const categoryRail = categorySection.getByRole("group", {
    exact: true,
    name: "商品カテゴリーから探す",
  });
  await expect(gramSection).toBeVisible();
  await expect(categorySection).toBeVisible();
  expect(
    await gramSection.evaluate((element) =>
      element.nextElementSibling?.hasAttribute("data-mobile-category-rail"),
    ),
  ).toBe(true);
  await expect(categorySection).not.toHaveClass(/sazo-mobile-category-section--compact/);
  await expectMobileGridLayout(categoryRail, 4, 8, "horizontal");
  await expectNoHorizontalPageOverflow(page);

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
    homeAgent.getByRole("button", { exact: true, name: "URL・画像・商品名をAIに渡す" }),
  ).toBeVisible();
  await expect(
    homeAgent.getByRole("button", { exact: true, name: "入力メニュー" }),
  ).toHaveCount(0);
  await homeAgent
    .getByRole("button", { exact: true, name: "URL・画像・商品名をAIに渡す" })
    .click();
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

  await mobileNavigation
    .getByRole("button", { exact: true, name: "エージェント" })
    .click();
  const hub = page.locator("[data-mobile-agent-hub]");
  await expect(hub).toBeVisible();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("button", { exact: true, name: "エージェント" }),
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
      mobileNavigation.getByRole("button", { exact: true, name: "エージェント" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expectNoHorizontalPageOverflow(page);
  }
  await page.setViewportSize(mobileViewport);

  await hub.getByRole("button", { exact: true, name: "J-Planet ホーム" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
  await mobileNavigation
    .getByRole("button", { exact: true, name: "エージェント" })
    .click();
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

  await mobileNavigation
    .getByRole("button", { exact: true, name: "エージェント" })
    .click();
  const agentNavigation = mobileNavigation.getByRole("button", {
    exact: true,
    name: "エージェント",
  });
  await expect(hub).toBeVisible();
  await expect(
    hub.getByRole("heading", { exact: true, name: "送信履歴" }),
  ).toBeVisible();
  await expect(
    hub.getByRole("heading", { exact: true, name: "最近見た商品" }),
  ).toBeVisible();
  await expect(
    hub.getByRole("button", { name: /過去の送信履歴 18件/ }),
  ).toHaveAttribute("aria-expanded", "false");

  await hub.getByRole("button", { name: /過去の送信履歴 18件/ }).click();
  await expect(
    hub.getByText("8月10日 10:11", { exact: true }),
  ).toBeVisible();
  await hub.getByRole("button", { name: /履歴を閉じる/ }).click();
  await expect(hub.getByText("8月10日 10:11", { exact: true })).toHaveCount(0);

  await hub
    .getByRole("button", { name: "New Balance 9060の結果を見る" })
    .click();
  const product = page.getByTestId("jplanet-controller-result");
  await expect(product).toBeVisible();
  await product.getByRole("button", { exact: true, name: "戻る" }).click();
  await expect(hub).toBeVisible();

  await expectComposerBelowAgentHeader(page);
  const composer = hub.locator(".sazo-mobile-agent-composer");
  await composer
    .getByRole("textbox", { name: "URL・画像・商品名をAIに渡す" })
    .fill("rakuten.co.jp の商品を確認したい");
  const submit = composer.getByRole("button", {
    exact: true,
    name: "送信",
  });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "agent-searching",
  );
  await expect(page.locator("[data-agent-pet-stage]")).toBeVisible();
  await expect(page.getByText("商品情報を確認しています", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product", {
    timeout: 12_000,
  });
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

test("opens the J-Planet BEAUTY route with an inline AI composer and touch rails", async ({
  page,
}, testInfo) => {
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
  await expect(page.locator(".sazo-root")).toHaveAttribute(
    "data-view",
    "agent-searching",
  );
  await expect(page.getByRole("dialog", { name: "J-Planet AIエージェント" })).toHaveCount(
    0,
  );
  await expect(page.locator("[data-agent-pet-stage]")).toBeVisible();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product", {
    timeout: 12_000,
  });
  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  await page.goto(`${routePath}&view=beauty`);
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "beauty");
  await composer.fill("");

  const categoryRail = beauty.locator(".sazo-beauty-category-rail");
  const categoryBox = await categoryRail.boundingBox();
  if (categoryBox === null) throw new Error("Missing BEAUTY category rail geometry");
  await dispatchNativeTouchGesture(page, [
    {
      x: categoryBox.x + categoryBox.width - 18,
      y: categoryBox.y + categoryBox.height / 2,
    },
    {
      x: categoryBox.x + categoryBox.width / 2,
      y: categoryBox.y + categoryBox.height / 2,
    },
    { x: categoryBox.x + 22, y: categoryBox.y + categoryBox.height / 2 },
  ]);
  await expect
    .poll(() => categoryRail.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);

  await beauty.getByRole("button", { exact: true, name: "マスクパック" }).click();
  await expect(
    beauty.getByRole("status", { name: "マスクパックの商品を読み込んでいます" }),
  ).toBeVisible();
  await expect(
    beauty.getByRole("button", { exact: true, name: "マスクパック" }),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 800 });
  await expect(beauty.locator(".sazo-beauty-product-card")).toHaveCount(6);

  const productRail = beauty.locator(".sazo-beauty-product-rail");
  const productBox = await productRail.boundingBox();
  if (productBox === null) throw new Error("Missing BEAUTY product rail geometry");
  await dispatchNativeTouchGesture(page, [
    { x: productBox.x + productBox.width - 18, y: productBox.y + productBox.height / 2 },
    { x: productBox.x + productBox.width / 2, y: productBox.y + productBox.height / 2 },
    { x: productBox.x + 22, y: productBox.y + productBox.height / 2 },
  ]);
  await expect
    .poll(() =>
      productRail.evaluate((node) => ({
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
      })),
    )
    .toMatchObject({ clientWidth: expect.any(Number), scrollWidth: expect.any(Number) });
  await expect
    .poll(() => productRail.evaluate((node) => node.scrollWidth > node.clientWidth))
    .toBe(true);
  await productRail.evaluate((node) => {
    node.scrollBy({ behavior: "instant", left: node.clientWidth });
  });
  await expect
    .poll(() => productRail.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);

  await beauty.locator(".sazo-beauty-product-card button").first().click();
  await expect(page.locator("[data-product-detail]")).toBeVisible();
  await page
    .getByTestId("jplanet-product-media-header")
    .getByRole("button", { exact: true, name: "戻る" })
    .click();
  await expect(beauty).toBeVisible();
  await expect(page.getByRole("navigation", { name: "モバイルメニュー" })).toBeVisible();
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

  const [kuroneBox, jupiBox] = await Promise.all([kurone.boundingBox(), jupi.boundingBox()]);
  if (kuroneBox === null || jupiBox === null) throw new Error("Missing pet geometry");
  expect(jupiBox.width / kuroneBox.width).toBeLessThanOrEqual(0.3);
});

test("interpolates Jupi's dodge smoothly between pixel-art frames", async ({ page }, testInfo) => {
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

test("shows a dense BRL-only home grid and returns each card to the shared controller detail", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the dense home grid is mobile-first");
  await page.goto(routePath);

  const grid = page.locator("[data-home-dense-product-grid]");
  const cards = page.getByTestId("home-dense-product-card");
  await grid.evaluate((element) => {
    element.scrollIntoView({ block: "start" });
  });
  await expect(cards).toHaveCount(16);
  expect(
    await cards.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-product-target")),
    ),
  ).toEqual(Array.from({ length: 16 }, () => "jplanet-nintendo-pro-controller"));
  await expect(grid).not.toContainText("¥");
  await expect(grid).toContainText("R$ 429");
  const scrollTopBeforeOpen = await page.evaluate(() => window.scrollY);

  await cards.first().getByRole("button").click();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
  await page.getByTestId("jplanet-product-media-header").getByRole("button", { name: "戻る" }).click();
  await expect(grid).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(Math.max(0, scrollTopBeforeOpen - 2));

  await cards.last().getByRole("button").click();
  await expect(
    page.getByRole("heading", { name: "Nintendo Switch Proコントローラー" }),
  ).toBeVisible();
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
  await expect(sheet.getByRole("button", { name: /スプラトゥーン 売り切れ/ })).toHaveAttribute(
    "disabled",
    "",
  );
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

  await page.getByRole("button", { name: "Rakuten Japan 公式ストアのクーポンを選択" }).click();
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
  await expect(page.getByText("この商品をブラジルへ届けた記録", { exact: true })).toHaveCount(0);
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
  await reviewPreview.getByRole("button", { name: "すべてのレビューを見る" }).first().click();
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
    .getByRole("button", { exact: true, name: "Nintendo Switch Proコントローラーの商品詳細を見る" })
    .click();
  await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 0 }));
  await expect(page.getByTestId("jplanet-controller-result")).toBeVisible();
  await expect(page.getByRole("button", { name: /バリアントを選択/ })).toHaveCount(0);
  const controllerGallery = page.locator(".sazo-reference-nintendo-controller-thumbnails");
  await expect(controllerGallery.getByRole("button")).toHaveCount(3);
  await controllerGallery.getByRole("button", { exact: true, name: "ホワイトを表示" }).click();
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
    await page.screenshot({ path: testInfo.outputPath(`product-information-collapsed-${viewport.width}.png`) });
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);
  await page.getByRole("button", { name: "商品仕様を開く" }).click();
  const specificationSheet = page.getByRole("dialog", { name: "商品仕様" });
  await expect(specificationSheet).toBeVisible();
  await expect(specificationSheet).toContainText("HAC-A-FSSKA");
  await page.screenshot({ path: testInfo.outputPath("product-specification-sheet-390.png") });
  await page.getByRole("button", { name: "商品仕様を閉じる" }).click();

  const description = page.locator(".sazo-reference-nintendo-product-description");
  await description.scrollIntoViewIfNeeded();
  await description.getByRole("button", { name: "商品説明をもっと見る" }).click();
  await expect(
    page.locator(".sazo-reference-nintendo-product-description-content"),
  ).toHaveAttribute("data-expanded", "true");
  await expect(description.getByText("主な仕様", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("product-information-expanded-390.png") });
  await description
    .getByRole("button", { name: "Nintendo Switch Proコントローラー ブラックの正面を拡大" })
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

test("keeps the product media header over the gallery until product information reaches it", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the product-media header is a mobile-first interaction",
  );
  await page.goto(`${routePath}&view=product&product=jplanet-nintendo-pro-controller`);

  const header = page.getByTestId("jplanet-product-media-header");
  await expect(header).toBeVisible();
  await expect(header).toHaveAttribute("data-header-surface", "transparent");
  await expect(header.locator("[data-jplanet-wordmark]")).toHaveCount(0);
  const controllerMedia = page.locator(".sazo-reference-nintendo-controller-media");
  const controllerVariantRail = page.getByTestId("jplanet-controller-variant-rail");
  await expect(controllerMedia).toBeVisible();
  await expect(controllerMedia.locator(".sazo-reference-nintendo-controller-thumbnails")).toHaveCount(0);
  await expect(controllerVariantRail).toBeVisible();
  await expect(controllerVariantRail).toContainText("3色のバリエーション");
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".sazo-reference-nintendo-controller-media")?.nextElementSibling?.getAttribute(
          "data-testid",
        ),
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

  await header.getByRole("button", { name: "商品メニュー" }).click();
  await expect(header.getByRole("menu")).toBeVisible();
  await expect(header.getByRole("menuitem", { name: "商品URLをコピー" })).toBeVisible();
  await header.getByRole("button", { name: "商品メニュー" }).click();

  const productInformation = page.getByTestId("jplanet-product-information");
  const bounds = await productInformation.evaluate((element) => {
    const header = document.querySelector<HTMLElement>("[data-testid='jplanet-product-media-header']");
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
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
});

test("keeps agent submissions compact and exposes customs input only for the exception scenario", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the agent hub is a mobile-first flow");

  await page.goto(`${routePath}&view=agent-hub&agentScenario=customs-action`);
  const hub = page.locator("[data-mobile-agent-hub]");
  const navigation = page.getByRole("navigation", { name: "モバイルメニュー" });

  await expect(hub).toHaveAttribute("data-scenario", "customs-action");
  await expect(hub.getByRole("heading", { name: "送信履歴", exact: true })).toBeVisible();
  await expect(hub.getByRole("button", { name: /過去の送信履歴 18件/ })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(hub.getByRole("button", { name: /の結果を見る$/ })).toHaveCount(2);
  await expect(hub.locator(".sazo-agent-hub-product-card")).toHaveCount(4);
  const recentProductRail = hub.locator(".sazo-agent-hub-product-rail");
  await expect
    .poll(() =>
      recentProductRail.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    )
    .toBe(true);
  await recentProductRail.evaluate((element) => {
    element.scrollTo({ left: element.scrollWidth, behavior: "instant" });
  });
  await expect.poll(() => recentProductRail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect(hub.getByText("購入可能", { exact: true })).toHaveCount(0);

  const action = hub.getByTestId("agent-customs-action-card");
  await expect(action).toContainText("受取人情報を入力してください");
  await expect(action).toContainText("CPF・お届け先の確認");
  await action.getByRole("button", { name: "情報を入力する" }).click();
  const dialog = page.getByRole("dialog", { name: "CPF・お届け先を確認" });
  await dialog.getByRole("textbox", { name: "CPF" }).fill("123.456.789-00");
  await dialog.getByRole("textbox", { name: "お届け先" }).fill("São Paulo, Brazil");
  await dialog.getByRole("button", { name: "入力内容を保存する" }).click();
  await expect(action).toHaveCount(0);
  await expect(hub.getByRole("status")).toContainText("受取人情報を保存しました");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(navigation.getByRole("button", { name: "エージェント", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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

test("completes the My Page post-purchase delivery flow", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "the post-purchase account flow is a mobile-first interaction",
  );
  await page.goto(`${routePath}&view=mypage`);

  const myPage = page.locator('[data-view-content="mypage"]');
  await expect(myPage).toBeVisible();
  await expect(myPage.getByText("500", { exact: true })).toBeVisible();
  await myPage.getByRole("button", { name: /注文・配送/ }).click();

  const orders = page.locator('[data-view-content="orders"]');
  await expect(orders).toBeVisible();
  await expect(orders.getByText("CPF情報の確認が必要です", { exact: true })).toBeVisible();
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

test("captures the coupon wallet states without mobile navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the coupon wallet is a mobile-first flow");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${routePath}&view=coupons`);
    await expect(page.getByTestId("jplanet-coupons")).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`coupon-wallet-${viewport.width}.png`) });
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=coupons`);
  await page.getByRole("button", { name: "コードを入力" }).click();
  await page.screenshot({ path: testInfo.outputPath("coupon-code-input-390.png") });
  await page.getByRole("button", { exact: true, name: "閉じる" }).click();
  await page.getByRole("button", { name: "クーポンを探す" }).click();
  await page.screenshot({ path: testInfo.outputPath("coupon-discover-390.png") });
  await page.getByRole("button", { name: "戻る" }).click();
  await page.getByRole("button", { name: "利用履歴" }).click();
  await page.screenshot({ path: testInfo.outputPath("coupon-history-390.png") });
  await page.goto(`${routePath}&view=coupons&couponWallet=empty`);
  await expect(page.getByTestId("jplanet-coupon-empty")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("coupon-empty-390.png") });
});

test("opens one J-Planet brand directory from both entries and keeps NIKE browsing scoped", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the brand directory is a mobile-first flow");

  for (const width of [341, 390, 440]) {
    await page.setViewportSize({ height: 844, width });
    await page.goto(`${routePath}&view=brands`);
    await expect(page.locator('[data-view-content="brands"]')).toBeVisible();
    await expect(page.getByText("全体 8件", { exact: true })).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
  }

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(routePath);
  await page
    .getByRole("group", { name: "J-Planetショートカット" })
    .getByRole("button", { name: "人気ブランド" })
    .click();
  await expect(page.locator('[data-view-content="brands"]')).toBeVisible();
  await expect(page.getByRole("navigation", { name: "モバイルメニュー" }).getByRole("button", { name: "ブランド" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({ path: testInfo.outputPath("brand-directory-390.png") });

  await page.getByRole("button", { name: "家電" }).click();
  await expect(page.getByText("APPLE", { exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "ブランド内検索" }).fill("ソニー");
  await expect(page.getByText("SONY", { exact: true })).toBeVisible();
  await expect(page.getByText("APPLE", { exact: true })).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath("brand-search-390.png") });
  await page.getByRole("searchbox", { name: "ブランド内検索" }).fill("");
  await page.getByRole("button", { name: "全体" }).click();

  await page.getByRole("button", { name: "NIKEを開く" }).click();
  await expect(page.locator('[data-view-content="brand-detail"]')).toBeVisible();
  await expect(page.getByRole("status", { name: "ブランド商品を読み込んでいます" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "最安値" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("brand-nike-all-390.png") });
  await page.getByRole("tab", { name: "最安値" }).click();
  await expect(page.locator(".jplanet-brand-product-grid .jplanet-brand-product-card")).toHaveCount(12);
  await page.screenshot({ path: testInfo.outputPath("brand-nike-lowest-390.png") });
  await page.getByRole("tab", { name: "コスメ" }).click();
  await expect(page.getByText("現在表示できる商品はありません")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("brand-empty-390.png") });
  await page.getByRole("button", { name: "ほかのカテゴリを見る" }).click();
  await page.getByRole("tab", { name: "最安値" }).click();
  await expectNoHorizontalPageOverflow(page);

  await page.getByRole("button", { name: "Air Jordan 1 Retro High OGの商品詳細を開く" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "product");
});

test("replays the deterministic SAZO commerce journey", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);

  if (testInfo.project.name === "desktop") {
    expect(page.viewportSize()).toEqual(desktopViewport);
    await page.goto(routePath);
    await expect(page.getByTestId("sazo-hero")).toBeVisible();
    await expect(page.locator(".sazo-mobile-nav")).toBeHidden();

    const desktopNavigation = page.getByRole("navigation", {
      exact: true,
      name: "メインメニュー",
    });
    await expect(desktopNavigation.getByRole("button")).toHaveCount(5);
    expect(
      await desktopNavigation.getByRole("button").evaluateAll((buttons) =>
        buttons.map((button) => button.textContent?.trim()),
      ),
    ).toEqual(["ホーム", "ブランド", "エージェント", "通知", "マイページ"]);

    await desktopNavigation.getByRole("button", { exact: true, name: "ブランド" }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "brands");
    await expect(page.locator('[data-view-content="brands"]')).toBeVisible();

    await desktopNavigation.getByRole("button", { exact: true, name: "エージェント" }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
    await expect(page.locator("[data-mobile-agent-hub]")).toBeVisible();

    await desktopNavigation.getByRole("button", { exact: true, name: "ホーム" }).click();
    await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "home");
    await expectLoadedDenseHomeProducts(page);
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
    await mobileNavigation.getByRole("button").evaluateAll((buttons) =>
      buttons.map((button) => button.textContent?.trim()),
    ),
  ).toEqual(["ホーム", "ブランド", "エージェント", "通知", "マイページ"]);
  await expectLoadedDenseHomeProducts(page);

  await mobileNavigation.getByRole("button", { exact: true, name: "ブランド" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "brands");
  await expect(page.locator('[data-view-content="brands"]')).toBeVisible();

  await mobileNavigation.getByRole("button", { exact: true, name: "通知" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "notifications");
  await expect(page.locator('[data-view-content="notifications"]')).toBeVisible();

  await mobileNavigation.getByRole("button", { exact: true, name: "エージェント" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");
  await expect(page.locator("[data-mobile-agent-hub]")).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
});
