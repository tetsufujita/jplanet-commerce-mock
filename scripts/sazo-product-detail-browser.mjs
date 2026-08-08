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
const forbiddenVisibleBrandPatterns = [
  /\bsazo(?:[\s._-]*shop)?\b/iu,
  /\bkorea\b/iu,
  /韓国/u,
  /\bto[\s._-]+japan\b/iu,
];
const productBrandAssetPredicateCases = [
  { expected: true, source: "/assets/sazo.png" },
  { expected: true, source: "/assets/sazoshop.webp" },
  { expected: true, source: "/assets/sazo-banner.png" },
  { expected: true, source: "/assets/sazo-shop.png" },
  { expected: true, source: "/assets/brand-sazo.png" },
  { expected: true, source: "/assets/SAZO.png?cache=1#hero" },
  {
    expected: true,
    source: "https://cdn.example.test/assets/brand-sazo.webp?v=2#card",
  },
  { expected: false, source: "/sazo-commerce/products/01.webp" },
  { expected: false, source: "/sazo-commerce/jplanet-sakura-mark.png" },
  { expected: false, source: "/assets/sazonic.png" },
  { expected: false, source: "/assets/brand-sazora.webp" },
];
const productVisibleBrandPredicateCases = [
  { expected: true, value: "SAZO" },
  { expected: true, value: "sazo shop" },
  { expected: true, value: "Sazo-Shop" },
  { expected: true, value: "Republic of Korea" },
  { expected: true, value: "韓国" },
  { expected: true, value: "TO   JAPAN" },
  { expected: true, value: "TO-JAPAN" },
  { expected: false, value: "J-Planet 日本からブラジルへ" },
  { expected: false, value: "Japan to Brazil" },
];
const notoFontRequest = /\/sazo-commerce\/fonts\/noto-sans-jp\/files\/.*\.woff2(?:\?|$)/i;

function isForbiddenBrandAssetSource(source) {
  let pathname;

  try {
    pathname = new URL(source, "https://jplanet.example").pathname;
  } catch {
    pathname = source.split(/[?#]/u)[0] ?? "";
  }

  const encodedBasename = pathname.split("/").pop() ?? "";
  let basename;

  try {
    basename = decodeURIComponent(encodedBasename);
  } catch {
    basename = encodedBasename;
  }

  const tokens = basename
    .toLowerCase()
    .split(/[-_.\s]+/u)
    .filter(Boolean);

  return (
    tokens.includes("sazo") ||
    tokens.includes("sazoshop") ||
    tokens.includes("korea") ||
    tokens.includes("tojapan") ||
    tokens.some((token, index) => token === "to" && tokens[index + 1] === "japan")
  );
}

function isForbiddenVisibleBrandCopy(value) {
  return forbiddenVisibleBrandPatterns.some((pattern) => pattern.test(value));
}

for (const { expected, value } of productVisibleBrandPredicateCases) {
  assert.equal(
    isForbiddenVisibleBrandCopy(value),
    expected,
    `product visible brand predicate: ${value}`,
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

function roundBounds(bounds) {
  if (bounds === null) return null;

  return {
    bottom: Math.round(bounds.y + bounds.height),
    height: Math.round(bounds.height),
    left: Math.round(bounds.x),
    right: Math.round(bounds.x + bounds.width),
    top: Math.round(bounds.y),
    width: Math.round(bounds.width),
  };
}

async function visibleLocatorCount(locator) {
  const visibility = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        bounds.width > 0 &&
        bounds.height > 0
      );
    }),
  );

  return visibility.filter(Boolean).length;
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

async function assertMobileDetailTapTargets(page, heroForm, label) {
  const targets = [
    [
      "detail favorite",
      page.locator(".sazo-product-detail-quick-actions button[aria-pressed]").first(),
    ],
    [
      "recommended product favorite",
      page.locator(".sazo-product-detail .sazo-product-favorite").first(),
    ],
    ["image check", heroForm.locator(".sazo-product-detail-check")],
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
  assert.equal(
    isForbiddenVisibleBrandCopy(renderedCopy),
    false,
    `${label} forbidden product copy`,
  );
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

  const heroForm = page.locator(
    ".sazo-product-detail-purchase-panel form[data-product-purchase-form]",
  );
  const stickyForm = page.locator(
    ".sazo-product-detail-checkout-rail form[data-product-purchase-form]",
  );
  const purchaseForms = page.locator("form[data-product-purchase-form]");
  const mobilePurchase = page.locator(".sazo-product-mobile-purchase");
  const recommendationRegion = page.locator(".sazo-product-detail-recommendations");
  const commerceGrid = page.locator(".sazo-product-detail-commerce-grid");
  const checkoutRail = page.locator(".sazo-product-detail-checkout-rail");
  const orderFlow = page.locator(".sazo-product-order-flow");
  const orderStages = orderFlow.locator("li[data-stage][data-state]");

  assert.equal(await heroForm.count(), 1, `${label} hero purchase form count`);
  assert.equal(await stickyForm.count(), 1, `${label} sticky purchase form count`);
  assert.equal(await purchaseForms.count(), 2, `${label} purchase form DOM count`);
  assert.equal(await heroForm.isVisible(), true, `${label} hero purchase form visible`);
  assert.equal(await mobilePurchase.count(), 1, `${label} mobile purchase group count`);
  const visibleFormCount = await visibleLocatorCount(purchaseForms);
  const heroFormBounds = await heroForm.boundingBox();
  const stickyFormBoundsBeforeScroll = await stickyForm.boundingBox();

  assert(heroFormBounds !== null, `${label} hero purchase form bounds`);
  assert.equal(
    await page.locator(".sazo-product-detail-cart-button").count(),
    3,
    `${label} hero/sticky/mobile cart actions`,
  );
  assert.equal(
    await heroForm.locator(".sazo-product-detail-cart-button").count(),
    1,
    `${label} hero cart action`,
  );
  assert.equal(
    await stickyForm.locator(".sazo-product-detail-cart-button").count(),
    1,
    `${label} sticky cart action`,
  );
  assert.equal(
    await mobilePurchase.locator(".sazo-product-detail-cart-button").count(),
    1,
    `${label} mobile cart action`,
  );

  if (label === "desktop") {
    assert.equal(visibleFormCount, 2, `${label} visible purchase form count`);
    assert.equal(
      await stickyForm.isVisible(),
      true,
      `${label} sticky purchase form visible`,
    );
    assert(stickyFormBoundsBeforeScroll !== null, `${label} sticky form initial bounds`);
    assert.equal(
      await mobilePurchase.isVisible(),
      false,
      `${label} mobile purchase group hidden`,
    );
  } else {
    assert.equal(visibleFormCount, 1, `${label} visible purchase form count`);
    assert.equal(
      await stickyForm.isVisible(),
      false,
      `${label} sticky purchase form hidden`,
    );
    assert.equal(
      await mobilePurchase.isVisible(),
      true,
      `${label} mobile purchase group visible`,
    );
    assert.equal(
      stickyFormBoundsBeforeScroll,
      null,
      `${label} hidden sticky form has no bounds`,
    );
  }

  const hierarchyGeometry = await recommendationRegion.evaluate((recommendation) => {
    const grid = recommendation.nextElementSibling;
    const checkout = grid?.querySelector(".sazo-product-detail-checkout-rail");
    const lowerForm = checkout?.querySelector("form[data-product-purchase-form]");
    const recommendationBounds = recommendation.getBoundingClientRect();
    const gridBounds = grid?.getBoundingClientRect();
    const checkoutBounds = checkout?.getBoundingClientRect();
    const lowerFormBounds = lowerForm?.getBoundingClientRect();
    const documentY = window.scrollY;

    return {
      checkoutTop: checkoutBounds === undefined ? null : checkoutBounds.top + documentY,
      commerceGridTop: gridBounds === undefined ? null : gridBounds.top + documentY,
      gridIsDirectSibling:
        grid?.classList.contains("sazo-product-detail-commerce-grid") === true,
      lowerFormTop:
        lowerFormBounds === undefined ? null : lowerFormBounds.top + documentY,
      recommendationBottom: recommendationBounds.bottom + documentY,
    };
  });

  assert.equal(
    hierarchyGeometry.gridIsDirectSibling,
    true,
    `${label} recommendation directly precedes commerce grid`,
  );
  assert(hierarchyGeometry.commerceGridTop !== null, `${label} commerce grid top`);
  assert.ok(
    hierarchyGeometry.recommendationBottom <= hierarchyGeometry.commerceGridTop + 1,
    `${label} recommendation/grid order geometry=${JSON.stringify(hierarchyGeometry)}`,
  );
  if (label === "desktop") {
    assert(hierarchyGeometry.checkoutTop !== null, `${label} checkout document top`);
    assert.ok(
      hierarchyGeometry.recommendationBottom <= hierarchyGeometry.checkoutTop + 1,
      `${label} recommendation/checkout order geometry=${JSON.stringify(hierarchyGeometry)}`,
    );
  }

  const stageStates = await orderStages.evaluateAll((stages) =>
    stages.map((stage) => stage.getAttribute("data-state")),
  );
  const stageStateCounts = {
    complete: stageStates.filter((state) => state === "complete").length,
    current: stageStates.filter((state) => state === "current").length,
    pending: stageStates.filter((state) => state === "pending").length,
  };
  const stageStatusCopy = await orderStages
    .locator(".sazo-visually-hidden")
    .allInnerTexts();
  const orderHeadingId = await orderFlow.getAttribute("aria-labelledby");

  assert.equal(await orderStages.count(), 6, `${label} order stage count`);
  assert.deepEqual(
    stageStates,
    ["complete", "complete", "current", "pending", "pending", "pending"],
    `${label} order stage state sequence`,
  );
  assert.deepEqual(
    stageStateCounts,
    { complete: 2, current: 1, pending: 3 },
    `${label} order stage state counts`,
  );
  assert.deepEqual(
    stageStatusCopy,
    ["完了", "完了", "現在のステップ", "未完了", "未完了", "未完了"],
    `${label} localized order stage status copy`,
  );
  assert.equal(
    orderHeadingId,
    "sazo-product-order-flow-heading",
    `${label} order flow heading relationship`,
  );
  assert.equal(
    await page.locator(`#${orderHeadingId}`).count(),
    1,
    `${label} order flow heading target`,
  );
  assert.equal(
    await orderFlow.locator('li[data-state="current"]').getAttribute("aria-current"),
    "step",
    `${label} current order stage semantics`,
  );
  assert.equal(
    await orderFlow.locator("ol").getAttribute("aria-label"),
    "注文からお届けまで",
    `${label} localized order stage list label`,
  );

  assert.equal(
    await recommendationRegion.locator(".sazo-product-card").count(),
    6,
    `${label} recommendation card count`,
  );
  const recommendationGeometry = await recommendationRegion
    .locator(".sazo-product-detail-recommendation-track")
    .evaluate((track) => {
      const trackBounds = track.getBoundingClientRect();
      const cardBounds = [...track.querySelectorAll(".sazo-product-card")].map((card) => {
        const bounds = card.getBoundingClientRect();

        return {
          left: bounds.left,
          right: bounds.right,
          width: bounds.width,
        };
      });

      return {
        cardBounds,
        clientWidth: track.clientWidth,
        scrollWidth: track.scrollWidth,
        trackLeft: trackBounds.left,
        trackRight: trackBounds.right,
      };
    });

  if (label === "desktop") {
    const fullyVisibleCards = recommendationGeometry.cardBounds.filter(
      ({ left, right }) =>
        left >= recommendationGeometry.trackLeft - 1 &&
        right <= recommendationGeometry.trackRight + 1,
    );

    assert.equal(
      fullyVisibleCards.length,
      6,
      `${label} fully visible recommendation cards geometry=${JSON.stringify(recommendationGeometry)}`,
    );
    for (const [index, { width }] of recommendationGeometry.cardBounds.entries()) {
      assert.ok(
        width >= 149 && width <= 171,
        `${label} recommendation card ${String(index + 1)} width=${String(width)}`,
      );
    }
  }
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

  const option = heroForm.getByLabel("商品オプション");
  await assertMinimumTapTarget(option, `${label} product option`);
  await option.selectOption("標準");
  assert.equal(
    await stickyForm.getByLabel("商品オプション").inputValue(),
    "標準",
    `${label} hero-to-sticky option sync`,
  );
  const decreaseQuantity = heroForm.getByRole("button", {
    name: "数量を減らす",
  });
  const increaseQuantity =
    label === "desktop"
      ? stickyForm.getByRole("button", { name: "数量を増やす" })
      : heroForm.getByRole("button", { name: "数量を増やす" });
  const heroIncreaseQuantity = heroForm.getByRole("button", {
    name: "数量を増やす",
  });
  await assertMinimumTapTarget(decreaseQuantity, `${label} quantity decrease`);
  const increaseBounds = await assertMinimumTapTarget(
    heroIncreaseQuantity,
    `${label} quantity increase`,
  );
  await increaseQuantity.click();
  assert.equal(
    await heroForm.getByTestId("product-quantity").innerText(),
    "2",
    `${label} hero product quantity sync`,
  );
  assert.equal(
    await stickyForm.getByTestId("product-quantity").innerText(),
    "2",
    `${label} sticky product quantity sync`,
  );
  assert.equal(
    await heroForm.getByTestId("product-total-value").innerText(),
    "¥7,948",
    `${label} hero deterministic total sync`,
  );
  assert.equal(
    await stickyForm.getByTestId("product-total-value").innerText(),
    "¥7,948",
    `${label} sticky deterministic total sync`,
  );
  const formCartButton = heroForm.getByRole("button", {
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
  const overflowGeometry = await page.evaluate(() => ({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.equal(
    overflowGeometry.scrollWidth <= overflowGeometry.innerWidth + 1,
    true,
    `${label} horizontal overflow geometry=${JSON.stringify(overflowGeometry)}`,
  );

  const leftFlow = page.locator(".sazo-product-detail-left-flow");
  const campaign = page.locator(".sazo-product-campaign");
  const orderFlowStyles = await orderFlow.evaluate((element) => {
    const completeIcon = element.querySelector(
      'li[data-state="complete"] .sazo-product-detail-stage-icon',
    );
    const currentIcon = element.querySelector(
      'li[data-state="current"] .sazo-product-detail-stage-icon',
    );
    const pendingIcon = element.querySelector(
      'li[data-state="pending"] .sazo-product-detail-stage-icon',
    );

    return {
      cardBackground: getComputedStyle(element).backgroundColor,
      cardBorder: getComputedStyle(element).borderStyle,
      cardShadow: getComputedStyle(element).boxShadow,
      completeBackground:
        completeIcon === null ? null : getComputedStyle(completeIcon).backgroundColor,
      currentBackground:
        currentIcon === null ? null : getComputedStyle(currentIcon).backgroundColor,
      pendingBackground:
        pendingIcon === null ? null : getComputedStyle(pendingIcon).backgroundColor,
    };
  });
  assert.equal(
    orderFlowStyles.cardBackground,
    "rgb(255, 255, 255)",
    `${label} order flow white card`,
  );
  assert.equal(orderFlowStyles.cardBorder, "solid", `${label} order flow card border`);
  assert.notEqual(orderFlowStyles.cardShadow, "none", `${label} order flow card shadow`);
  assert.notEqual(
    orderFlowStyles.currentBackground,
    orderFlowStyles.completeBackground,
    `${label} current/complete order state styling`,
  );
  assert.notEqual(
    orderFlowStyles.currentBackground,
    orderFlowStyles.pendingBackground,
    `${label} current/pending order state styling`,
  );
  assert.notEqual(
    orderFlowStyles.completeBackground,
    orderFlowStyles.pendingBackground,
    `${label} complete/pending order state styling`,
  );

  await orderFlow.evaluate((element) => {
    const targetTop = element.getBoundingClientRect().top + window.scrollY - 112;

    window.scrollTo(0, targetTop);
  });
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
  const checkoutBounds = await checkoutRail.boundingBox();
  const stickyFormBoundsAfterScroll = await stickyForm.boundingBox();
  const leftFlowBounds = await leftFlow.boundingBox();
  const orderFlowBounds = await orderFlow.boundingBox();

  assert(leftFlowBounds !== null, `${label} left flow bounds`);
  assert(orderFlowBounds !== null, `${label} order flow bounds`);

  const gridGeometry = await commerceGrid.evaluate((element) => ({
    columnCount: getComputedStyle(element).gridTemplateColumns.split(" ").length,
    columns: getComputedStyle(element).gridTemplateColumns,
  }));

  if (viewport.width <= 390) {
    assert.equal(gridGeometry.columnCount, 1, `${label} commerce grid one column`);
    assert.equal(
      await checkoutRail.evaluate((element) => getComputedStyle(element).display),
      "none",
      `${label} lower checkout hidden`,
    );
    assert.equal(checkoutBounds, null, `${label} hidden checkout has no bounds`);
    assert.equal(
      stickyFormBoundsAfterScroll,
      null,
      `${label} hidden sticky form remains without bounds`,
    );
  } else {
    assert.equal(gridGeometry.columnCount, 2, `${label} commerce grid two columns`);
    assert.equal(
      await checkoutRail.evaluate((element) => getComputedStyle(element).position),
      "sticky",
      `${label} checkout sticky position`,
    );
    assert(checkoutBounds !== null, `${label} checkout rail bounds`);
    assert(stickyFormBoundsAfterScroll !== null, `${label} sticky form scrolled bounds`);
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
    assert.equal(
      rectanglesOverlap(orderFlowBounds, checkoutBounds),
      false,
      `${label} six-stage flow/checkout overlap`,
    );
    assert.ok(
      orderFlowBounds.y < viewport.height &&
        orderFlowBounds.y + orderFlowBounds.height > 0,
      `${label} six-stage flow visibility y=${String(orderFlowBounds.y)} height=${String(orderFlowBounds.height)}`,
    );
    await page.screenshot({ path: "/tmp/jplanet-product-reference-sticky.png" });
  }

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

  if (viewport.width <= 390) {
    await assertMobilePurchaseGeometry(page, viewport, label);
    await assertMobileDetailTapTargets(page, heroForm, label);
  } else {
    const campaignCheckoutBounds = await checkoutRail.boundingBox();

    assert(campaignCheckoutBounds !== null, `${label} campaign checkout bounds`);
    assert.ok(
      Math.abs(campaignCheckoutBounds.y - 112) <= 1,
      `${label} checkout remains sticky at campaign top=${String(campaignCheckoutBounds.y)}`,
    );
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => window.scrollY <= 1);
  await page.screenshot({
    fullPage: true,
    path: screenshotPaths[label],
  });

  return {
    campaignHeight: Math.round(campaignBounds.height),
    checkout: roundBounds(checkoutBounds),
    checkoutForms: {
      dom: await purchaseForms.count(),
      hero: roundBounds(heroFormBounds),
      mobileGroups: await mobilePurchase.count(),
      stickyAfterScroll: roundBounds(stickyFormBoundsAfterScroll),
      stickyBeforeScroll: roundBounds(stickyFormBoundsBeforeScroll),
      visible: visibleFormCount,
    },
    columns: gridGeometry.columns,
    hierarchy: hierarchyGeometry,
    imageCount,
    orderFlow: {
      bounds: roundBounds(orderFlowBounds),
      stateCounts: stageStateCounts,
      states: stageStates,
      styles: orderFlowStyles,
    },
    overflow: overflowGeometry,
    quantityControl: `${Math.round(increaseBounds.width)}x${Math.round(increaseBounds.height)}`,
    recommendation: {
      cards: recommendationGeometry.cardBounds.map(({ left, right, width }) => ({
        left: Math.round(left),
        right: Math.round(right),
        width: Math.round(width),
      })),
      clientWidth: recommendationGeometry.clientWidth,
      fullyVisible: recommendationGeometry.cardBounds.filter(
        ({ left, right }) =>
          left >= recommendationGeometry.trackLeft - 1 &&
          right <= recommendationGeometry.trackRight + 1,
      ).length,
      scrollWidth: recommendationGeometry.scrollWidth,
      trackLeft: Math.round(recommendationGeometry.trackLeft),
      trackRight: Math.round(recommendationGeometry.trackRight),
    },
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
