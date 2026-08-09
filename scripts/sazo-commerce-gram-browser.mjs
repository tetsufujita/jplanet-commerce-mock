import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const desktopViewport = { height: 828, width: 1511 };
const mobileViewports = [
  { height: 844, width: 390 },
  { height: 720, width: 320 },
];

function recordPageFailures(page, failures) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      const location = message.location();
      failures.push(
        `console: ${message.text()}${location.url === "" ? "" : ` (${location.url}:${String(location.lineNumber)})`}`,
      );
    }
  });
  page.on("pageerror", (error) => {
    failures.push(`pageerror: ${error.message}`);
  });
}

async function captureDeterministicScreenshot(page, path) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const screenshotOptions = { animations: "disabled", caret: "hide" };
  const first = await page.screenshot(screenshotOptions);
  const second = await page.screenshot({ ...screenshotOptions, path });

  assert.equal(
    first.equals(second),
    true,
    `${path} changed between consecutive captures`,
  );
}

async function waitForImages(locator) {
  const metrics = await locator.evaluate(async (element) => {
    const images = Array.from(element.querySelectorAll("img"));
    const scrollPosition = { x: window.scrollX, y: window.scrollY };

    for (const image of images) {
      image.loading = "eager";
      image.scrollIntoView({ block: "nearest" });
      await image.decode();
    }

    window.scrollTo(scrollPosition.x, scrollPosition.y);
    await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));

    return images.map((image) => ({
      complete: image.complete,
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      src: image.currentSrc,
    }));
  });

  assert(metrics.length > 0, "GRAM view must contain images");
  for (const metric of metrics) {
    assert.equal(metric.complete, true, `image did not complete: ${metric.src}`);
    assert(metric.naturalWidth > 0, `image has zero natural width: ${metric.src}`);
    assert(metric.naturalHeight > 0, `image has zero natural height: ${metric.src}`);
  }

  return metrics.length;
}

async function getFirstRowGeometry(locator) {
  const cards = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();

      return { left: bounds.left, top: bounds.top, width: bounds.width };
    }),
  );
  assert(cards.length > 0, "GRAM grid must contain cards");
  const firstTop = Math.min(...cards.map(({ top }) => top));
  const firstRow = cards.filter(({ top }) => Math.abs(top - firstTop) < 2);

  return {
    cardWidths: firstRow.map(({ width }) => width),
    lefts: [...new Set(firstRow.map(({ left }) => Math.round(left * 10) / 10))],
  };
}

async function getProductGridExpectation(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const innerWidth =
      element.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);
    const gap = Number.parseFloat(style.columnGap);
    const twoColumnCardWidth = (innerWidth - gap) / 2;

    return {
      expectedColumns: twoColumnCardWidth >= 132 ? 2 : 1,
      gap,
      innerWidth,
      twoColumnCardWidth,
    };
  });
}

async function getFocusedChipClearance(page, rail, chip, label) {
  await page.keyboard.press("Tab");
  await chip.focus();
  assert.equal(
    await chip.evaluate((element) => element.matches(":focus-visible")),
    true,
    `${label} must use keyboard-visible focus`,
  );

  const [railBounds, chipMetrics] = await Promise.all([
    rail.boundingBox(),
    chip.evaluate((element) => {
      const chipBounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const outlineWidth = Number.parseFloat(style.outlineWidth);
      const outlineOffset = Number.parseFloat(style.outlineOffset);

      return {
        bounds: {
          bottom: chipBounds.bottom,
          left: chipBounds.left,
          right: chipBounds.right,
          top: chipBounds.top,
        },
        outlineOffset,
        outlineWidth,
        requiredExtent: outlineWidth + Math.max(0, outlineOffset),
      };
    }),
  ]);
  assert(railBounds !== null);
  const metrics = {
    clearance: {
      bottom: railBounds.y + railBounds.height - chipMetrics.bounds.bottom,
      left: chipMetrics.bounds.left - railBounds.x,
      right: railBounds.x + railBounds.width - chipMetrics.bounds.right,
      top: chipMetrics.bounds.top - railBounds.y,
    },
    outlineOffset: chipMetrics.outlineOffset,
    outlineWidth: chipMetrics.outlineWidth,
    requiredExtent: chipMetrics.requiredExtent,
  };

  for (const [edge, clearance] of Object.entries(metrics.clearance)) {
    assert(
      clearance >= metrics.requiredExtent,
      `${label} ${edge} focus clearance=${String(clearance)} required=${String(metrics.requiredExtent)}`,
    );
  }

  return metrics;
}

async function openGramFromHome(page, baseUrl) {
  await page.goto(`${baseUrl}/sazo-commerce-mock/?qa=1&cursor=0`);
  const homeGram = page.getByRole("heading", { name: "J-Planet GRAM" }).locator("..");
  await homeGram.getByRole("button", { name: "もっと見る" }).click();
  await page.locator('[data-view-content="gram"]').waitFor();
  await page.waitForFunction(() => window.scrollY === 0);
}

async function assertFunctionalJourney(browser, baseUrl, failures) {
  const page = await browser.newPage({ viewport: desktopViewport });
  await page.route("**/favicon.ico", (route) => route.fulfill({ status: 204 }));
  recordPageFailures(page, failures);

  try {
    await openGramFromHome(page, baseUrl);
    assert.equal(await page.getByRole("button", { name: /カテゴリ:/ }).count(), 11);
    assert.equal(await page.getByRole("button", { name: /投稿を開く:/ }).count(), 10);

    await page.getByRole("button", { name: "カテゴリ: HOT🔥" }).click();
    const loading = page.getByRole("status", { name: "投稿を読み込み中" });
    await loading.waitFor();
    await loading.waitFor({ state: "hidden" });
    assert.equal(
      await page
        .getByRole("button", { name: "カテゴリ: HOT🔥" })
        .getAttribute("aria-pressed"),
      "true",
    );

    await page
      .getByRole("button", { name: /投稿を開く:/ })
      .first()
      .click();
    await page.locator('[data-view-content="gram-detail"]').waitFor();
    await page.getByRole("button", { name: "再生" }).click();
    const progress = page.getByRole("progressbar", { name: "投稿の再生位置" });
    const before = Number(await progress.getAttribute("aria-valuenow"));
    await page.waitForTimeout(350);
    const after = Number(await progress.getAttribute("aria-valuenow"));
    assert(after > before);
    await page.getByRole("button", { name: "一時停止" }).click();
    await page.getByRole("button", { name: "J-Planet ホーム" }).click();
    await page.locator("[data-home-view]").waitFor();

    const homeGram = page.getByRole("heading", { name: "J-Planet GRAM" }).locator("..");
    await homeGram.getByRole("button", { name: "もっと見る" }).click();
    const revisit = page.locator('[data-view-content="gram"]');
    await revisit.waitFor();
    const revisitPost = page.getByRole("button", { name: /投稿を開く:/ }).first();
    assert.equal(await page.locator('[data-view-content="gram-detail"]').count(), 0);
    assert.equal(new URL(page.url()).searchParams.has("gramPost"), false);
    assert.equal(await revisit.count(), 1);
    assert.equal(await page.locator(".sazo-root").getAttribute("data-view"), "gram");
    assert.equal(
      await page
        .getByRole("button", { name: "カテゴリ: HOT🔥" })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(await revisitPost.isVisible(), true);
    assert.equal(await revisitPost.isEnabled(), true);
    await revisitPost.click();
    await page.locator('[data-view-content="gram-detail"]').waitFor();

    return { after, before, revisited: true };
  } finally {
    await page.close();
  }
}

async function assertDesktopJourney(browser, baseUrl, failures) {
  const page = await browser.newPage({ viewport: desktopViewport });
  await page.route("**/favicon.ico", (route) => route.fulfill({ status: 204 }));
  recordPageFailures(page, failures);

  try {
    await openGramFromHome(page, baseUrl);
    const catalogue = page.locator('[data-view-content="gram"]');
    assert.equal(await page.getByRole("button", { name: /カテゴリ:/ }).count(), 11);
    assert.equal(await page.getByRole("button", { name: /投稿を開く:/ }).count(), 10);

    const catalogueBounds = await catalogue.boundingBox();
    assert(catalogueBounds !== null);
    assert(
      catalogueBounds.width >= 1168 && catalogueBounds.width <= 1172,
      `desktop catalogue width=${String(catalogueBounds.width)}`,
    );
    const catalogueRow = await getFirstRowGeometry(
      page.getByRole("button", { name: /投稿を開く:/ }),
    );
    assert.equal(
      catalogueRow.lefts.length,
      5,
      `desktop first-row columns=${String(catalogueRow.lefts.length)}`,
    );
    assert.equal(await catalogue.locator(".sazo-gram-catalog-product img").count(), 10);
    assert.equal(await catalogue.locator(".sazo-gram-catalog-discount").count(), 5);
    const catalogueImageCount = await waitForImages(catalogue);
    await captureDeterministicScreenshot(page, "/tmp/jplanet-gram-catalog-desktop.png");

    await page.getByRole("button", { name: "カテゴリ: HOT🔥" }).click();
    const loading = page.getByRole("status", { name: "投稿を読み込み中" });
    await loading.waitFor();
    const loadingRow = await getFirstRowGeometry(
      page.locator(".sazo-gram-skeleton-card"),
    );
    assert.deepEqual(loadingRow.lefts, catalogueRow.lefts);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await loading.isVisible(), true);
    assert.equal(
      await loading.evaluate((element) => getComputedStyle(element).animationName),
      "none",
    );
    await captureDeterministicScreenshot(page, "/tmp/jplanet-gram-loading-desktop.png");
    await loading.waitFor({ state: "hidden" });

    const activeChip = page.getByRole("button", { name: "カテゴリ: HOT🔥" });
    assert.equal(await activeChip.getAttribute("aria-pressed"), "true");
    const activeChipBounds = await activeChip.boundingBox();
    assert(activeChipBounds !== null);
    assert(
      activeChipBounds.height >= 44,
      `desktop active chip height=${String(activeChipBounds.height)}`,
    );
    assert.equal(
      await activeChip.evaluate((element) => getComputedStyle(element).backgroundColor),
      "rgb(31, 56, 100)",
    );

    await page
      .getByRole("button", { name: /投稿を開く:/ })
      .first()
      .click();
    const detail = page.locator('[data-view-content="gram-detail"]');
    await detail.waitFor();
    await page.waitForFunction(() => window.scrollY === 0);
    const player = page.locator(".sazo-gram-player");
    const products = page.locator(".sazo-gram-products");
    const [detailBounds, playerBounds, productBounds] = await Promise.all([
      detail.boundingBox(),
      player.boundingBox(),
      products.boundingBox(),
    ]);
    assert(detailBounds !== null && playerBounds !== null && productBounds !== null);
    assert(
      productBounds.x > playerBounds.x + playerBounds.width,
      "desktop GRAM detail must use two columns",
    );
    assert(
      playerBounds.width >= 388 && playerBounds.width <= 392,
      `desktop player width=${String(playerBounds.width)}`,
    );
    const detailImageCount = await waitForImages(detail);
    const toggle = page.locator(".sazo-gram-player-toggle");
    await toggle.scrollIntoViewIfNeeded();
    await toggle.evaluate((element) => {
      const bounds = element.getBoundingClientRect();

      if (bounds.bottom > window.innerHeight) {
        window.scrollBy(0, Math.ceil(bounds.bottom - window.innerHeight));
      }
    });
    const toggleBounds = await toggle.boundingBox();
    assert(toggleBounds !== null);
    assert(toggleBounds.y >= 0, `desktop toggle top=${String(toggleBounds.y)}`);
    assert(
      toggleBounds.y + toggleBounds.height <= desktopViewport.height,
      `desktop toggle bottom=${String(toggleBounds.y + toggleBounds.height)}`,
    );
    await captureDeterministicScreenshot(page, "/tmp/jplanet-gram-detail-desktop.png");
    await page.getByRole("button", { name: "J-Planet ホーム" }).click();
    await page.locator("[data-home-view]").waitFor();

    return {
      activeChipHeight: activeChipBounds.height,
      catalogueImageCount,
      catalogueWidth: catalogueBounds.width,
      detailColumns: 2,
      detailImageCount,
      firstRowCardWidths: catalogueRow.cardWidths,
      firstRowLefts: catalogueRow.lefts,
      playerWidth: playerBounds.width,
      toggleBounds: {
        bottom: toggleBounds.y + toggleBounds.height,
        height: toggleBounds.height,
        top: toggleBounds.y,
      },
    };
  } finally {
    await page.close();
  }
}

async function assertMobileViewport(browser, baseUrl, viewport, failures) {
  const page = await browser.newPage({ viewport });
  await page.route("**/favicon.ico", (route) => route.fulfill({ status: 204 }));
  recordPageFailures(page, failures);

  try {
    await openGramFromHome(page, baseUrl);
    const catalogue = page.locator('[data-view-content="gram"]');
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.equal(documentWidth, viewport.width);
    const catalogueRow = await getFirstRowGeometry(
      page.getByRole("button", { name: /投稿を開く:/ }),
    );
    const [titleBounds, firstChipBounds] = await Promise.all([
      catalogue.getByRole("heading", { name: "J-Planet GRAM" }).boundingBox(),
      page
        .getByRole("button", { name: /カテゴリ:/ })
        .first()
        .boundingBox(),
    ]);
    assert(titleBounds !== null && firstChipBounds !== null);
    assert(
      Math.abs(catalogueRow.lefts[0] - titleBounds.x) < 0.5 &&
        Math.abs(firstChipBounds.x - titleBounds.x) < 0.5,
      `${String(viewport.width)}px alignment title=${String(titleBounds.x)} chip=${String(firstChipBounds.x)} grid=${String(catalogueRow.lefts[0])}`,
    );
    assert.equal(
      catalogueRow.lefts.length,
      2,
      `${String(viewport.width)}px first-row columns=${String(catalogueRow.lefts.length)}`,
    );
    const chipHeights = await page
      .getByRole("button", { name: /カテゴリ:/ })
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getBoundingClientRect().height),
      );
    assert(
      chipHeights.every((height) => height >= 44),
      `${String(viewport.width)}px category heights=${chipHeights.join(",")}`,
    );
    let focusClearance;
    if (viewport.width === 390) {
      const filter = page.locator(".sazo-gram-filter");
      const categoryChips = page.getByRole("button", { name: /カテゴリ:/ });
      focusClearance = {
        first: await getFocusedChipClearance(
          page,
          filter,
          categoryChips.first(),
          "390px first category",
        ),
        last: await getFocusedChipClearance(
          page,
          filter,
          categoryChips.last(),
          "390px last category",
        ),
      };
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth),
        viewport.width,
      );
      await filter.evaluate((element) => {
        element.scrollLeft = 0;
      });
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    }
    const catalogueImageCount = await waitForImages(catalogue);
    if (viewport.width === 390) {
      await captureDeterministicScreenshot(page, "/tmp/jplanet-gram-catalog-mobile.png");
    }

    await page
      .getByRole("button", { name: /投稿を開く:/ })
      .first()
      .click();
    const detail = page.locator('[data-view-content="gram-detail"]');
    await detail.waitFor();
    await page.waitForFunction(() => window.scrollY === 0);
    const player = page.locator(".sazo-gram-player");
    const products = page.locator(".sazo-gram-products");
    const [detailBounds, playerBounds, productBounds] = await Promise.all([
      detail.boundingBox(),
      player.boundingBox(),
      products.boundingBox(),
    ]);
    assert(detailBounds !== null && playerBounds !== null && productBounds !== null);
    assert(
      productBounds.y >= playerBounds.y + playerBounds.height,
      `${String(viewport.width)}px GRAM detail must use one column`,
    );
    assert(
      playerBounds.width <= detailBounds.width,
      `${String(viewport.width)}px player width=${String(playerBounds.width)} content width=${String(detailBounds.width)}`,
    );

    const productGrid = page.locator(".sazo-gram-product-grid");
    const productExpectation = await getProductGridExpectation(productGrid);
    const productRow = await getFirstRowGeometry(
      page.getByRole("button", { name: /商品を見る:/ }),
    );
    if (viewport.width === 390) {
      assert.equal(productExpectation.expectedColumns, 2);
      assert.equal(productRow.lefts.length, 2);
    } else {
      assert.equal(viewport.width, 320);
      assert.equal(
        productRow.lefts.length,
        productExpectation.expectedColumns,
        `320px product columns=${String(productRow.lefts.length)} expected=${String(productExpectation.expectedColumns)} inner=${String(productExpectation.innerWidth)} gap=${String(productExpectation.gap)} two-column-card=${String(productExpectation.twoColumnCardWidth)}`,
      );
    }

    const detailImageCount = await waitForImages(detail);
    if (viewport.width === 390) {
      await captureDeterministicScreenshot(page, "/tmp/jplanet-gram-detail-mobile.png");
    }

    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      viewport.width,
    );

    return {
      catalogueImageCount,
      categoryHeights: chipHeights,
      contentAlignmentX: titleBounds.x,
      detailColumns: 1,
      detailImageCount,
      documentWidth,
      firstRowCardWidths: catalogueRow.cardWidths,
      firstRowLefts: catalogueRow.lefts,
      focusClearance,
      playerWidth: playerBounds.width,
      productCardWidths: productRow.cardWidths,
      productColumns: productRow.lefts.length,
      productGrid: productExpectation,
      viewport,
    };
  } finally {
    await page.close();
  }
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
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const baseUrl = `http://127.0.0.1:${String(address.port)}`;
  const failures = [];
  const progress = await assertFunctionalJourney(browser, baseUrl, failures);
  const desktop = {
    ...(await assertDesktopJourney(browser, baseUrl, failures)),
    progress,
  };
  const mobile = [];

  for (const viewport of mobileViewports) {
    mobile.push(await assertMobileViewport(browser, baseUrl, viewport, failures));
  }

  assert.deepEqual(failures, [], failures.join("\n"));
  process.stdout.write(
    `${JSON.stringify({ desktop, mobile }, null, 2)}\nsazo-gram-browser-ok\n`,
  );
} finally {
  await browser?.close();
  await server.close();
}
