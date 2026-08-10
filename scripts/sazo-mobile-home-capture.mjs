import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

function parseCssRgb(color) {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);

  assert(channels && channels.length === 3, `Expected an RGB color, received ${color}`);
  return channels;
}

function relativeLuminance(color) {
  const [red, green, blue] = parseCssRgb(color).map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function assertContrastAtLeast(label, foreground, background, minimum) {
  const ratio = contrastRatio(foreground, background);

  assert(
    ratio >= minimum,
    `${label} contrast ${ratio.toFixed(2)}:1 is below ${minimum}:1 (${foreground} on ${background})`,
  );

  return ratio;
}

async function inspectBottomNavigation(page, expectedWidth) {
  const navigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  const navigationBox = await navigation.boundingBox();
  const chatBox = await page.getByRole("button", { name: "チャットを開く" }).boundingBox();
  const myPageIconBox = await navigation
    .getByRole("button", { exact: true, name: "マイページ" })
    .locator("svg")
    .boundingBox();
  const position = await navigation.evaluate((element) => getComputedStyle(element).position);

  assert(navigationBox && chatBox && myPageIconBox);
  assert.equal(await navigation.getByRole("button").count(), 5);
  assert.deepEqual(
    await navigation.getByRole("button").allTextContents(),
    ["ホーム", "通知", "エージェント", "お気に入り", "マイページ"],
  );
  assert.equal(position, "fixed");
  assert(Math.abs(navigationBox.width - expectedWidth) < 1);
  assert(Math.abs(navigationBox.height - 76) < 2);
  assert(chatBox.y + chatBox.height <= myPageIconBox.y);
  assert(
    Math.abs(
      (await page.evaluate(() => document.documentElement.scrollWidth)) - expectedWidth,
    ) <= 1,
  );

  return { chatBox, navigationBox };
}

async function inspectMobileHomeGeometry(page, expectedWidth) {
  const header = await page.locator(".sazo-mobile-header").boundingBox();
  const primary = await page.locator(".sazo-mobile-header-primary").boundingBox();
  const secondary = await page.locator(".sazo-mobile-secondary-nav").boundingBox();
  const hero = await page.locator(".sazo-hero-viewport").boundingBox();
  const search = await page.locator("[data-mobile-agent-search]").boundingBox();
  const shortcuts = await page.locator(".sazo-shortcuts").boundingBox();
  const intro = await page.locator(".sazo-home-intro").boundingBox();
  const interested = await page.locator(".sazo-interested-items").boundingBox();
  const secondaryNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルサブメニュー",
  });
  const selectedHome = secondaryNavigation.getByRole("button", {
    exact: true,
    name: "ホーム",
  });

  assert(header && primary && secondary && hero && search && shortcuts && intro && interested);
  assert(header.height >= 120 && header.height <= 132);
  assert(Math.abs(header.height - primary.height - secondary.height) < 2);
  assert.equal(await secondaryNavigation.getByRole("button").count(), 5);
  assert.equal(await selectedHome.getAttribute("aria-pressed"), "true");
  assert.equal(await secondaryNavigation.getByRole("button", { pressed: true }).count(), 1);
  const selectedHomeColors = await selectedHome.evaluate((element) => {
    const style = getComputedStyle(element);
    let backgroundElement = element;

    while (
      backgroundElement.parentElement !== null &&
      getComputedStyle(backgroundElement).backgroundColor === "rgba(0, 0, 0, 0)"
    ) {
      backgroundElement = backgroundElement.parentElement;
    }

    return {
      background: getComputedStyle(backgroundElement).backgroundColor,
      borderBottom: style.borderBottomColor,
      foreground: style.color,
    };
  });
  assert.deepEqual(parseCssRgb(selectedHomeColors.foreground), [168, 61, 83]);
  assert.deepEqual(parseCssRgb(selectedHomeColors.borderBottom), [254, 162, 172]);
  assertContrastAtLeast(
    "Selected mobile home navigation",
    selectedHomeColors.foreground,
    selectedHomeColors.background,
    4.5,
  );
  assert(Math.abs(hero.y - (header.y + header.height)) < 2);
  const searchOverlapRatio = (hero.y + hero.height - search.y) / search.height;
  assert(Math.abs(searchOverlapRatio - 0.5) <= 0.1);
  assert(hero.y < search.y);
  assert(search.y < shortcuts.y);
  assert(shortcuts.y < intro.y);
  assert(intro.y < interested.y);
  assert.equal(await page.locator(".sazo-shortcuts .sazo-shortcut").count(), 5);
  assert(
    Math.abs(
      (await page.evaluate(() => document.documentElement.scrollWidth)) - expectedWidth,
    ) <= 1,
  );

  return {
    header,
    hero,
    interested,
    intro,
    primary,
    search,
    searchOverlapRatio,
    secondary,
    selectedHomeColors,
    shortcuts,
  };
}

const server = await createServer({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

let browser;

try {
  await server.listen();
  const address = server.httpServer?.address();

  assert(address !== null && typeof address === "object");
  const url = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 956, width: 440 },
  });
  const failedPickResponses = [];

  page.on("requestfailed", (request) => {
    if (new URL(request.url()).pathname.startsWith("/sazo-commerce/mobile-picks/")) {
      failedPickResponses.push(
        `${request.url()}: ${request.failure()?.errorText ?? "request failed"}`,
      );
    }
  });
  page.on("response", (response) => {
    if (
      new URL(response.url()).pathname.startsWith("/sazo-commerce/mobile-picks/") &&
      !response.ok()
    ) {
      failedPickResponses.push(`${response.url()}: HTTP ${String(response.status())}`);
    }
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("[data-mobile-home]").waitFor();
  await page.evaluate(async () => document.fonts.ready);

  const mobileHomeGeometry = await inspectMobileHomeGeometry(page, 440);
  const navigation = await page.locator(".sazo-mobile-nav").boundingBox();

  assert(navigation);
  assert.equal(await page.locator("[data-mobile-gift-fair]").count(), 4);
  assert.equal(
    await page.locator("[data-mobile-picks-grid] .sazo-product-card").count(),
    31,
  );
  const pickImages = page.locator(
    '[data-mobile-picks-grid] img[src^="/sazo-commerce/mobile-picks/"]',
  );
  assert.equal(await pickImages.count(), 31);
  await page.waitForFunction(() =>
    Array.from(
      document.querySelectorAll(
        '[data-mobile-picks-grid] img[src^="/sazo-commerce/mobile-picks/"]',
      ),
    ).every(
      (element) =>
        element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  );
  assert.deepEqual(
    await pickImages.evaluateAll((elements) =>
      elements
        .filter(
          (element) =>
            !(element instanceof HTMLImageElement) ||
            !element.complete ||
            element.naturalWidth <= 0,
        )
        .map((element) => element.getAttribute("src")),
    ),
    [],
  );
  assert.deepEqual(failedPickResponses, []);
  assert(Math.abs(navigation.height - 76) < 2);
  const mobileBottomNavigation = await inspectBottomNavigation(page, 440);
  assert.equal(await page.getByRole("button", { name: "エージェント" }).count(), 1);
  const mobileAgentSearch = page.locator("[data-mobile-agent-search]");
  assert.equal(await mobileAgentSearch.count(), 1);

  await mobileAgentSearch.click();
  const agent = page.getByRole("dialog", { name: "J-Planet AIエージェント" });
  await agent.waitFor();
  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-agent-sheet.png",
  });
  await agent.getByRole("button", { name: "閉じる" }).click();

  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-home-440x956.png",
  });
  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-bottom-nav-440x956.png",
  });

  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  await mobileNavigation
    .getByRole("button", { exact: true, name: "エージェント" })
    .click();
  const hub = page.locator("[data-mobile-agent-hub]");
  await hub.waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));

  const hubHeader = await hub.locator(".sazo-agent-hub-header").boundingBox();
  const hubNavigation = await page.locator(".sazo-mobile-nav").boundingBox();
  assert(hubHeader && hubNavigation);
  assert(Math.abs(hubHeader.x) < 1);
  assert(Math.abs(hubHeader.width - 440) < 1);
  assert(Math.abs(hubNavigation.height - 76) < 2);
  assert.equal(await page.locator(".sazo-mobile-header").count(), 0);
  assert.equal(await mobileNavigation.getByRole("button").count(), 5);
  assert.equal(await hub.locator(".sazo-agent-hub-product-card").count(), 3);
  assert.equal(await hub.locator(".sazo-agent-hub-ranked-row").count(), 20);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 440);

  const hubContrastColors = await hub.evaluate((element) => {
    const getColors = (selector) => {
      const target = element.querySelector(selector);

      if (!(target instanceof HTMLElement)) {
        throw new Error(`Missing contrast target: ${selector}`);
      }

      const style = getComputedStyle(target);

      return {
        background: style.backgroundColor,
        foreground: style.color,
      };
    };
    const surface = getComputedStyle(element).backgroundColor;

    return {
      brand: getColors('[data-section="popular-topics"] > p'),
      clear: getColors('[data-section="consultations"] > header > button'),
      rank: getColors(
        ".sazo-agent-hub-ranked-row:first-child > button > span:first-child",
      ),
      surface,
    };
  });
  const hubContrastRatios = {
    brand: assertContrastAtLeast(
      "Agent hub brand text",
      hubContrastColors.brand.foreground,
      hubContrastColors.surface,
      4.5,
    ),
    clear: assertContrastAtLeast(
      "Agent hub clear icon",
      hubContrastColors.clear.foreground,
      hubContrastColors.clear.background,
      3,
    ),
    rank: assertContrastAtLeast(
      "Agent hub top rank text",
      hubContrastColors.rank.foreground,
      hubContrastColors.surface,
      4.5,
    ),
  };

  await page.keyboard.press("Tab");
  await hub.locator(".sazo-agent-hub-header > button:first-child").focus();
  const focusVisible = hub.locator(":focus-visible");
  assert.equal(await focusVisible.count(), 1);
  const focusColors = await focusVisible.evaluate((element) => {
    const style = getComputedStyle(element);
    const parentStyle = getComputedStyle(element.parentElement ?? element);

    return {
      background: parentStyle.backgroundColor,
      foreground: style.outlineColor,
      style: style.outlineStyle,
      width: style.outlineWidth,
    };
  });
  assert.notEqual(focusColors.style, "none");
  assert(parseFloat(focusColors.width) >= 3);
  hubContrastRatios.focus = assertContrastAtLeast(
    "Agent hub focus outline",
    focusColors.foreground,
    focusColors.background,
    3,
  );
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  const hubProductImages = hub.locator(".sazo-agent-hub-product-card img");
  assert.equal(await hubProductImages.count(), 3);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".sazo-agent-hub-product-card img")).every(
      (element) =>
        element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  );
  assert.deepEqual(
    await hubProductImages.evaluateAll((elements) =>
      elements
        .filter(
          (element) =>
            !(element instanceof HTMLImageElement) ||
            !element.complete ||
            element.naturalWidth <= 0,
        )
        .map((element) => element.getAttribute("src")),
    ),
    [],
  );

  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-agent-hub.png",
  });

  await hub.getByRole("button", { exact: true, name: "ホームへ戻る" }).click();
  await page.locator("[data-mobile-home]").waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));

  const checkpoints = [
    ["reviews", ".sazo-review-section"],
    ["gift", ".sazo-mobile-gift-fairs"],
    ["gram", ".sazo-mobile-gram-section"],
    ["picks", ".sazo-mobile-picks-section"],
    ["footer", ".sazo-mobile-support-footer"],
  ];

  for (const [label, selector] of checkpoints) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -92));
    await page.screenshot({
      animations: "disabled",
      caret: "hide",
      path: `/tmp/jplanet-mobile-home-${label}.png`,
    });
  }

  const tabletPage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 956, width: 822 },
  });

  await tabletPage.goto(url, { waitUntil: "networkidle" });
  await tabletPage.locator("[data-home-view]").waitFor();
  const tabletBottomNavigation = await inspectBottomNavigation(tabletPage, 822);
  assert.equal(await tabletPage.locator(".sazo-mobile-header").isVisible(), false);
  assert.equal(await tabletPage.locator(".sazo-mobile-shell > .sazo-footer").count(), 1);
  assert.equal(
    await tabletPage.locator(".sazo-mobile-shell > .sazo-footer").evaluate(
      (element) => getComputedStyle(element).display,
    ),
    "none",
  );
  await tabletPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-bottom-nav-822x956.png",
  });
  const tabletRoot = tabletPage.locator(".sazo-root");

  for (const view of ["service", "campaign", "product"]) {
    await tabletRoot.evaluate((element, nextView) => {
      element.setAttribute("data-view", nextView);
    }, view);
    assert.equal(await tabletPage.locator(".sazo-mobile-nav").boundingBox(), null);
    assert.equal(
      await tabletPage.locator(".sazo-content-main").evaluate(
        (element) => getComputedStyle(element).paddingBottom,
      ),
      "0px",
    );
    assert.equal(
      await tabletPage.getByRole("button", { name: "チャットを開く" }).evaluate(
        (element) => getComputedStyle(element).bottom,
      ),
      "24px",
    );
  }

  await tabletRoot.evaluate((element) => {
    element.setAttribute("data-view", "home");
  });
  await tabletPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const tabletFooterTextBox = await tabletPage
    .locator(".sazo-desktop-shell > .sazo-footer small")
    .boundingBox();
  const tabletNavigationAtBottom = await tabletPage.locator(".sazo-mobile-nav").boundingBox();
  assert(tabletFooterTextBox && tabletNavigationAtBottom);
  assert(tabletFooterTextBox.y + tabletFooterTextBox.height <= tabletNavigationAtBottom.y);
  await tabletPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-bottom-nav-822x956-footer.png",
  });
  await tabletPage.close();

  const compactPage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 735, width: 341 },
  });

  await compactPage.goto(url, { waitUntil: "networkidle" });
  await compactPage.locator("[data-mobile-home]").waitFor();
  const compactHomeGeometry = await inspectMobileHomeGeometry(compactPage, 341);
  const compactBottomNavigation = await inspectBottomNavigation(compactPage, 341);
  assert.equal(
    await compactPage.evaluate(() => document.documentElement.scrollWidth),
    341,
  );
  await compactPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-home-341x735.png",
  });

  await compactPage.goto(`${url}?qa=1&view=agent-hub`, { waitUntil: "networkidle" });
  const compactHub = compactPage.locator("[data-mobile-agent-hub]");
  await compactHub.waitFor();
  assert.equal(
    await compactPage.evaluate(() => document.documentElement.scrollWidth),
    341,
  );
  const compactLauncher = compactHub.locator(".sazo-agent-hub-launcher > span");
  const compactLauncherGeometry = await compactLauncher.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      clientWidth: element.clientWidth,
      lineHeight: style.lineHeight,
      overflow: style.overflow,
      scrollWidth: element.scrollWidth,
      textOverflow: style.textOverflow,
      whiteSpace: style.whiteSpace,
    };
  });
  assert.equal(compactLauncherGeometry.overflow, "hidden");
  assert.equal(compactLauncherGeometry.textOverflow, "ellipsis");
  assert.equal(compactLauncherGeometry.whiteSpace, "nowrap");
  assert(compactLauncherGeometry.scrollWidth > compactLauncherGeometry.clientWidth);
  await compactPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-agent-hub-341x735.png",
  });
  await compactPage.close();

  const largeMobilePage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 1472, width: 676 },
  });
  await largeMobilePage.goto(url, { waitUntil: "networkidle" });
  await largeMobilePage.locator("[data-mobile-home]").waitFor();
  const largeMobileHomeGeometry = await inspectMobileHomeGeometry(largeMobilePage, 676);
  await inspectBottomNavigation(largeMobilePage, 676);
  await largeMobilePage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-home-676x1472.png",
  });
  await largeMobilePage.close();

  const desktopBoundaryPage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 900, width: 900 },
  });
  await desktopBoundaryPage.goto(url, { waitUntil: "networkidle" });
  await desktopBoundaryPage.locator("[data-home-view]").waitFor();
  assert.equal(await desktopBoundaryPage.locator(".sazo-mobile-nav").boundingBox(), null);
  await desktopBoundaryPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-mobile-home-900x900.png",
  });
  await desktopBoundaryPage.close();

  const desktopPage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 900, width: 1511 },
  });

  await desktopPage.goto(url, { waitUntil: "networkidle" });
  await desktopPage.locator("[data-home-view]").waitFor();
  assert.equal(await desktopPage.locator(".sazo-mobile-nav").boundingBox(), null);
  assert.equal(await desktopPage.locator("[data-mobile-home]").count(), 0);
  assert.equal(await desktopPage.locator(".sazo-shortcuts .sazo-shortcut").count(), 5);
  await desktopPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-desktop-home-1511x900.png",
  });
  await desktopPage.close();

  process.stdout.write(
    `${JSON.stringify({
      compactHomeGeometry,
      hubHeader,
      hubNavigation,
      hubContrastColors,
      hubContrastRatios,
      largeMobileHomeGeometry,
      mobileBottomNavigation,
      compactLauncherGeometry,
      compactBottomNavigation,
      navigation,
      mobileHomeGeometry,
      tabletBottomNavigation,
      url,
    })}\n`,
  );
  process.stdout.write("sazo-mobile-home-capture-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
