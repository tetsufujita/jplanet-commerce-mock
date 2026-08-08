import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const origins = ["home", "catalog", "ranking", "reviews"];
const viewports = [
  { label: "desktop", width: 1512, height: 982 },
  { label: "mobile", width: 390, height: 844 },
  { label: "mobile-320", width: 320, height: 844 },
];
const mockSourceBase = "https://example.com/jplanet/source";
const screenshotPaths = {
  desktop: "/tmp/jplanet-product-reference-desktop.png",
  mobile: "/tmp/jplanet-product-reference-mobile.png",
  "mobile-320": "/tmp/jplanet-product-reference-mobile-320.png",
};
const forbiddenProductCopy = [/sazo/i, /韓国/, /korea/i, /to\s+japan/i];
const forbiddenBrandAssetBasename =
  /^(?:(?:sazo|sazoshop)(?:[-_.](?:logo|wordmark)(?:[-_.][a-z0-9]+)*)?|(?:logo|wordmark)[-_.](?:sazo|sazoshop)(?:[-_.][a-z0-9]+)*)(?:@[1-9][0-9]*x)?\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const forbiddenRouteAssetBasename = /(?:korea|to[-_]?japan)/i;
const productBrandAssetPredicateCases = [
  { expected: true, source: "/assets/sazo.png" },
  { expected: true, source: "/assets/sazoshop.webp" },
  { expected: false, source: "/sazo-commerce/products/01.webp" },
  { expected: false, source: "/sazo-commerce/jplanet-sakura-mark.png" },
];
const notoFontRequest = /\/sazo-commerce\/fonts\/noto-sans-jp\/files\/.*\.woff2(?:\?|$)/i;

function isForbiddenBrandAssetSource(source) {
  const basename = source.split(/[?#]/u)[0]?.split("/").pop() ?? "";

  return (
    forbiddenBrandAssetBasename.test(basename) ||
    forbiddenRouteAssetBasename.test(basename)
  );
}

for (const { expected, source } of productBrandAssetPredicateCases) {
  assert.equal(
    isForbiddenBrandAssetSource(source),
    expected,
    `product brand asset predicate: ${source}`,
  );
}

const server = await createServer({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

function contentSelector(view) {
  return view === "home" ? "[data-home-view]" : `[data-view-content="${view}"]`;
}

function rectanglesOverlap(first, second) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function assertMinimumTapTarget(locator, label) {
  const bounds = await locator.boundingBox();

  assert(bounds !== null, `${label} bounds`);
  assert.ok(bounds.width >= 44, `${label} width=${String(bounds.width)}`);
  assert.ok(bounds.height >= 44, `${label} height=${String(bounds.height)}`);
  return bounds;
}

async function setUpNotoFontAudit(page) {
  const failures = [];

  page.on("requestfailed", (request) => {
    if (notoFontRequest.test(request.url())) {
      failures.push(
        `${request.url()} requestfailed=${request.failure()?.errorText ?? "unknown"}`,
      );
    }
  });
  page.on("response", (response) => {
    const status = response.status();
    const successfulResponse = response.ok() || status === 304;

    if (notoFontRequest.test(response.url()) && !successfulResponse) {
      failures.push(`${response.url()} status=${String(response.status())}`);
    }
  });

  if (process.env.SAZO_QA_ABORT_FONTS === "1") {
    await page.route(notoFontRequest, async (route) => {
      await route.abort("failed");
    });
  }

  return failures;
}

async function assertDetailImages(page, label) {
  const detailImages = page.locator("[data-product-detail] img");

  await detailImages.evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        image.loading = "eager";
        if (image.complete) return;

        await new Promise((resolve) => {
          const finish = () => resolve();
          image.addEventListener("error", finish, { once: true });
          image.addEventListener("load", finish, { once: true });
          setTimeout(finish, 8_000);
        });
      }),
    );
  });

  const imageAudit = await detailImages.evaluateAll((images) => ({
    count: images.length,
    failures: images
      .filter(
        (image) => !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0,
      )
      .map((image) => {
        const source = image.currentSrc || image.getAttribute("src") || "<missing-src>";
        return `${source} complete=${String(image.complete)} size=${String(image.naturalWidth)}x${String(image.naturalHeight)}`;
      }),
    sources: images.map(
      (image) => image.currentSrc || image.getAttribute("src") || "<missing-src>",
    ),
  }));

  assert.ok(imageAudit.count > 0, `${label} detail image count`);
  assert.deepEqual(imageAudit.failures, [], `${label} detail image load failures`);
  assert.deepEqual(
    imageAudit.sources.filter(isForbiddenBrandAssetSource),
    [],
    `${label} forbidden product image branding`,
  );
  return imageAudit.count;
}

async function assertMobilePurchaseGeometry(page, viewport, label) {
  const purchaseBar = page.locator(".sazo-product-mobile-purchase");
  const chatButton = page.getByTestId("chat-launcher");
  const purchaseBounds = await purchaseBar.boundingBox();
  const chatBounds = await chatButton.boundingBox();

  assert(purchaseBounds !== null, `${label} fixed purchase bar bounds`);
  assert(chatBounds !== null, `${label} chat launcher bounds`);
  assert.ok(
    purchaseBounds.x >= -1,
    `${label} fixed purchase x=${String(purchaseBounds.x)}`,
  );
  assert.ok(
    purchaseBounds.x + purchaseBounds.width <= viewport.width + 1,
    `${label} fixed purchase right=${String(purchaseBounds.x + purchaseBounds.width)}`,
  );
  assert.ok(
    purchaseBounds.y >= -1,
    `${label} fixed purchase y=${String(purchaseBounds.y)}`,
  );
  assert.ok(
    purchaseBounds.y + purchaseBounds.height <= viewport.height + 1,
    `${label} fixed purchase bottom=${String(purchaseBounds.y + purchaseBounds.height)}`,
  );
  assert.equal(
    rectanglesOverlap(purchaseBounds, chatBounds),
    false,
    `${label} fixed purchase/chat overlap`,
  );

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(
    () =>
      Math.abs(
        window.scrollY + window.innerHeight - document.documentElement.scrollHeight,
      ) <= 2,
  );

  const footerContent = page
    .locator(".sazo-mobile-shell .sazo-footer")
    .locator("a, button, small")
    .last();
  const footerBounds = await footerContent.boundingBox();
  const bottomPurchaseBounds = await purchaseBar.boundingBox();
  const bottomChatBounds = await chatButton.boundingBox();

  assert(footerBounds !== null, `${label} last footer content bounds`);
  assert(bottomPurchaseBounds !== null, `${label} bottom fixed purchase bounds`);
  assert(bottomChatBounds !== null, `${label} bottom chat launcher bounds`);
  assert.ok(
    footerBounds.y + footerBounds.height <= bottomPurchaseBounds.y + 1,
    `${label} fixed purchase covers last footer content`,
  );
  assert.equal(
    rectanglesOverlap(bottomPurchaseBounds, bottomChatBounds),
    false,
    `${label} bottom fixed purchase/chat overlap`,
  );
}

async function assertMobileDetailTapTargets(page, label) {
  const targets = [
    [
      "detail favorite",
      page.locator(".sazo-product-detail-quick-actions button[aria-pressed]").first(),
    ],
    [
      "recommended product favorite",
      page.locator(".sazo-product-detail .sazo-product-favorite").first(),
    ],
    ["image check", page.locator(".sazo-product-detail-check")],
  ];

  for (const [name, target] of targets) {
    const bounds = await target.boundingBox();

    assert(bounds !== null, `${label} ${name} bounds`);
    assert.ok(bounds.width >= 44, `${label} ${name} width=${String(bounds.width)}`);
    assert.ok(bounds.height >= 44, `${label} ${name} height=${String(bounds.height)}`);
  }
}

async function assertReviewRailClearance(page, label) {
  const reviewView = page.locator('[data-view-content="reviews"]');
  const reviewImages = reviewView.locator(".sazo-review-tile img");

  await reviewImages.evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        image.loading = "eager";
        if (image.complete) return;

        await new Promise((resolve) => {
          const finish = () => resolve();
          image.addEventListener("error", finish, { once: true });
          image.addEventListener("load", finish, { once: true });
          setTimeout(finish, 8_000);
        });
      }),
    );
  });
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );

  const geometry = await reviewView.evaluate((element) => {
    const rail = element.querySelector(".sazo-review-product-recommendations");
    assertElement(rail);
    const railTop = rail.getBoundingClientRect().top;
    const tiles = [...element.querySelectorAll(".sazo-review-tile")]
      .map((tile) => {
        const bounds = tile.getBoundingClientRect();
        return {
          bottom: bounds.bottom,
          id: tile.getAttribute("data-review-id") ?? "<missing-id>",
          visible: bounds.width > 0 && bounds.height > 0,
        };
      })
      .filter(({ visible }) => visible);

    return {
      overlaps: tiles
        .filter(({ bottom }) => bottom > railTop + 1)
        .map(({ bottom, id }) => ({ bottom, id, overlap: bottom - railTop })),
      railTop,
      tileCount: tiles.length,
    };

    function assertElement(value) {
      if (!(value instanceof HTMLElement)) {
        throw new Error("Reviews recommendation rail was not rendered");
      }
    }
  });

  assert.ok(geometry.tileCount > 0, `${label} visible editorial review tiles`);
  assert.deepEqual(
    geometry.overlaps,
    [],
    `${label} reviews rail overlaps editorial tiles at railTop=${String(geometry.railTop)}`,
  );
}

async function assertOriginReturn(page, baseUrl, origin, label) {
  await page.goto(`${baseUrl}?qa=1&view=${origin}`, { waitUntil: "networkidle" });
  const originContent = page.locator(contentSelector(origin));
  await originContent.waitFor();
  if (origin === "reviews") {
    await assertReviewRailClearance(page, label);
    const reviewCopy = await originContent.innerText();
    const firstReviewImage = originContent.locator(".sazo-review-tile img").first();

    assert.equal(/sazo/i.test(reviewCopy), false, `${label} reviews legacy brand copy`);
    assert.equal(
      await firstReviewImage.getAttribute("src"),
      "/sazo-commerce/jplanet-sakura-mark.png",
      `${label} first review J-Planet image`,
    );
  }
  await originContent.locator(".sazo-product-open").first().click();
  await page.locator("[data-product-detail]").waitFor();
  await page.getByRole("button", { exact: true, name: "戻る" }).click();
  await page.locator(contentSelector(origin)).waitFor();
  assert.equal(
    await page.locator("[data-product-detail]").count(),
    0,
    `${label}/${origin} product detail closed`,
  );
}

async function auditProductViewport(page, baseUrl, viewport, fontNetworkFailures) {
  const label = viewport.label;

  await page.goto(`${baseUrl}?qa=1&view=product&product=p01`, {
    waitUntil: "networkidle",
  });
  const detail = page.locator("[data-product-detail]");
  await detail.waitFor();

  const fontFamily = await detail.evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  assert.match(fontFamily, /Noto Sans JP/i, `${label} computed font`);

  const fontAudit = await detail.evaluate(async () => {
    const descriptor = '400 16px "Noto Sans JP Variable"';
    const sample = "日本の商品をブラジルへ";
    let loadError = null;
    let loadedFaces = [];

    try {
      loadedFaces = await document.fonts.load(descriptor, sample);
    } catch (error) {
      loadError = error instanceof Error ? error.message : String(error);
    }

    await document.fonts.ready;
    const matchingFaces = [...document.fonts].filter(
      (face) => face.family.replaceAll(/["']/g, "") === "Noto Sans JP Variable",
    );

    return {
      check: document.fonts.check(descriptor, sample),
      loadError,
      loadedFaceCount: loadedFaces.length,
      matchingLoadedCount: matchingFaces.filter(({ status }) => status === "loaded")
        .length,
      matchingStatuses: [...new Set(matchingFaces.map(({ status }) => status))],
    };
  });

  assert.equal(fontAudit.loadError, null, `${label} Noto explicit load error`);
  assert.ok(fontAudit.loadedFaceCount > 0, `${label} Noto explicit load result`);
  assert.ok(fontAudit.matchingLoadedCount > 0, `${label} loaded Noto FontFace`);
  assert.equal(fontAudit.check, true, `${label} document.fonts.check`);
  assert.deepEqual(
    fontNetworkFailures,
    [],
    `${label} Noto font network failures statuses=${fontAudit.matchingStatuses.join(",")}`,
  );

  const renderedCopy = (await detail.innerText()).normalize("NFKC").replace(/\s+/g, " ");
  for (const forbiddenPattern of forbiddenProductCopy) {
    assert.equal(
      forbiddenPattern.test(renderedCopy),
      false,
      `${label} forbidden product copy: ${forbiddenPattern.source}`,
    );
  }
  assert.equal(
    renderedCopy.includes("日本の販売サイトから直接購入"),
    true,
    `${label} direct purchase copy`,
  );
  assert.equal(
    renderedCopy.includes("ブラジルへお届け"),
    true,
    `${label} Brazil delivery copy`,
  );

  const sourceLink = page.locator(".sazo-product-source-link");
  assert.equal(await sourceLink.count(), 1, `${label} source link count`);
  assert.equal(
    await sourceLink.getAttribute("href"),
    `${mockSourceBase}/p01`,
    `${label} deterministic source href`,
  );
  const sourceBounds = await assertMinimumTapTarget(sourceLink, `${label} source link`);

  const purchaseForm = page.locator("form[data-product-purchase-form]");
  assert.equal(await purchaseForm.count(), 1, `${label} single purchase form`);
  assert.equal(
    await page.locator(".sazo-product-detail-cart-button").count(),
    2,
    `${label} shared desktop/mobile cart actions`,
  );

  const recommendationRegion = page.locator(".sazo-product-detail-recommendations");
  assert.equal(
    await recommendationRegion.locator(".sazo-product-card").count(),
    6,
    `${label} recommendation card count`,
  );
  await assertMinimumTapTarget(
    recommendationRegion.getByRole("button", { name: "次の商品" }),
    `${label} recommendation next`,
  );

  await page.getByRole("button", { name: "画像2を表示" }).click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".sazo-product-detail-image")
        ?.getAttribute("src")
        ?.endsWith("/sazo-commerce/products/02.webp") === true,
  );

  const option = purchaseForm.getByLabel("商品オプション");
  await assertMinimumTapTarget(option, `${label} product option`);
  await option.selectOption("標準");
  const decreaseQuantity = purchaseForm.getByRole("button", {
    name: "数量を減らす",
  });
  const increaseQuantity = purchaseForm.getByRole("button", {
    name: "数量を増やす",
  });
  await assertMinimumTapTarget(decreaseQuantity, `${label} quantity decrease`);
  const increaseBounds = await assertMinimumTapTarget(
    increaseQuantity,
    `${label} quantity increase`,
  );
  await increaseQuantity.click();
  assert.equal(
    await page.getByTestId("product-quantity").innerText(),
    "2",
    `${label} product quantity`,
  );
  assert.equal(
    await page.getByTestId("product-total-value").innerText(),
    "¥7,948",
    `${label} deterministic total`,
  );
  const formCartButton = purchaseForm.getByRole("button", {
    exact: true,
    name: "カートに入れる",
  });
  assert.equal(await formCartButton.count(), 1, `${label} intended form cart action`);
  await formCartButton.click();
  await page.getByRole("status").filter({ hasText: "カートに追加しました" }).waitFor();

  const cautionTab = page.getByRole("tab", { name: "注意事項" });
  const informationTab = page.getByRole("tab", { name: "商品情報" });
  await cautionTab.click();
  assert.equal(
    await cautionTab.getAttribute("aria-selected"),
    "true",
    `${label} caution tab`,
  );
  await informationTab.click();
  assert.equal(
    await informationTab.getAttribute("aria-selected"),
    "true",
    `${label} information tab`,
  );

  const imageCount = await assertDetailImages(page, label);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
    `${label} horizontal overflow`,
  );

  const commerceGrid = page.locator(".sazo-product-detail-commerce-grid");
  const checkoutRail = page.locator(".sazo-product-detail-checkout-rail");
  const leftFlow = page.locator(".sazo-product-detail-left-flow");
  const campaign = page.locator(".sazo-product-campaign");
  await campaign.scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
  const campaignBounds = await campaign.boundingBox();
  assert(campaignBounds !== null, `${label} campaign bounds`);
  assert.ok(
    campaignBounds.y < viewport.height && campaignBounds.y + campaignBounds.height > 0,
    `${label} campaign visibility y=${String(campaignBounds.y)} height=${String(campaignBounds.height)}`,
  );

  const gridGeometry = await commerceGrid.evaluate((element) => ({
    columnCount: getComputedStyle(element).gridTemplateColumns.split(" ").length,
    columns: getComputedStyle(element).gridTemplateColumns,
  }));
  const checkoutBounds = await checkoutRail.boundingBox();
  const leftFlowBounds = await leftFlow.boundingBox();
  assert(checkoutBounds !== null, `${label} checkout rail bounds`);
  assert(leftFlowBounds !== null, `${label} left flow bounds`);

  if (viewport.width <= 390) {
    assert.equal(gridGeometry.columnCount, 1, `${label} commerce grid one column`);
    assert.equal(
      await checkoutRail.evaluate((element) => getComputedStyle(element).position),
      "static",
      `${label} checkout non-sticky`,
    );
    assert.ok(
      leftFlowBounds.y >= checkoutBounds.y + checkoutBounds.height - 1,
      `${label} checkout precedes left flow`,
    );
    await assertMobilePurchaseGeometry(page, viewport, label);
    await assertMobileDetailTapTargets(page, label);
  } else {
    assert.equal(gridGeometry.columnCount, 2, `${label} commerce grid two columns`);
    assert.equal(
      await checkoutRail.evaluate((element) => getComputedStyle(element).position),
      "sticky",
      `${label} checkout sticky position`,
    );
    assert.ok(
      Math.abs(checkoutBounds.y - 112) <= 1,
      `${label} sticky top=${String(checkoutBounds.y)}`,
    );
    assert.ok(checkoutBounds.y >= -1, `${label} checkout rail viewport top`);
    assert.ok(
      checkoutBounds.y + checkoutBounds.height <= viewport.height + 1,
      `${label} checkout rail viewport bottom=${String(checkoutBounds.y + checkoutBounds.height)}`,
    );
    assert.equal(
      rectanglesOverlap(leftFlowBounds, checkoutBounds),
      false,
      `${label} left flow/checkout overlap`,
    );
    await page.screenshot({ path: "/tmp/jplanet-product-reference-sticky.png" });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => window.scrollY <= 1);
  await page.screenshot({
    fullPage: true,
    path: screenshotPaths[label],
  });

  return {
    campaignHeight: Math.round(campaignBounds.height),
    checkoutHeight: Math.round(checkoutBounds.height),
    columns: gridGeometry.columns,
    imageCount,
    quantityControl: `${Math.round(increaseBounds.width)}x${Math.round(increaseBounds.height)}`,
    sourceControl: `${Math.round(sourceBounds.width)}x${Math.round(sourceBounds.height)}`,
  };
}

let browser;
let auditedImages = 0;
let auditedOriginStates = 0;

try {
  await server.listen();
  const address = server.httpServer?.address();

  assert(address !== null && typeof address === "object");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const baseUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { height: viewport.height, width: viewport.width },
    });
    page.setDefaultTimeout(10_000);
    const fontNetworkFailures = await setUpNotoFontAudit(page);

    for (const origin of origins) {
      await assertOriginReturn(page, baseUrl, origin, viewport.label);
      auditedOriginStates += 1;
    }

    const summary = await auditProductViewport(
      page,
      baseUrl,
      viewport,
      fontNetworkFailures,
    );
    auditedImages += summary.imageCount;
    process.stdout.write(
      `product-viewport ${viewport.label} ${JSON.stringify(summary)}\n`,
    );
    await page.close();
  }

  assert.equal(auditedImages, 33, "product detail audited image count");
  process.stdout.write(
    `sazo-product-detail-browser-ok viewports=${String(viewports.length)} originStates=${String(auditedOriginStates)} images=${String(auditedImages)}\n`,
  );
} finally {
  await browser?.close();
  await server.close();
}
