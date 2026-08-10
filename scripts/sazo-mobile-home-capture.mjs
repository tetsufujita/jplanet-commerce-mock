import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

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

  const header = await page.locator(".sazo-mobile-header").boundingBox();
  const search = await page.locator(".sazo-mobile-search-pill").boundingBox();
  const shortcuts = await page.locator(".sazo-mobile-shortcut-grid").boundingBox();
  const hero = await page.locator(".sazo-hero-viewport").boundingBox();
  const navigation = await page.locator(".sazo-mobile-nav").boundingBox();

  assert(header && search && shortcuts && hero && navigation);
  assert(Math.abs(header.height - 84) < 2);
  assert(Math.abs(search.width - 416) < 2);
  assert(Math.abs(search.height - 50) < 2);
  assert.equal(
    await page.locator("[data-mobile-shortcut-grid] button").count(),
    10,
  );
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
  assert.equal(await page.getByRole("button", { name: "エージェント" }).count(), 1);
  assert.equal(
    await page.getByRole("button", { name: "URL・画像・商品名をAIに相談" }).count(),
    1,
  );

  await page.getByRole("button", { name: "URL・画像・商品名をAIに相談" }).click();
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
    path: "/tmp/jplanet-mobile-home-top.png",
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

  const compactPage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 735, width: 341 },
  });

  await compactPage.goto(url, { waitUntil: "networkidle" });
  await compactPage.locator("[data-mobile-home]").waitFor();
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

  const desktopPage = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 828, width: 1511 },
  });

  await desktopPage.goto(url, { waitUntil: "networkidle" });
  await desktopPage.locator("[data-home-view]").waitFor();
  assert.equal(await desktopPage.locator("[data-mobile-home]").count(), 0);
  assert.equal(await desktopPage.locator(".sazo-shortcuts .sazo-shortcut").count(), 5);
  await desktopPage.screenshot({
    animations: "disabled",
    caret: "hide",
    path: "/tmp/jplanet-desktop-home-regression.png",
  });
  await desktopPage.close();

  process.stdout.write(
    `${JSON.stringify({
      header,
      hero,
      hubHeader,
      hubNavigation,
      compactLauncherGeometry,
      navigation,
      search,
      shortcuts,
      url,
    })}\n`,
  );
  process.stdout.write("sazo-mobile-home-capture-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
