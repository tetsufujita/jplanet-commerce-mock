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
  const homeUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { height: 828, width: 1511 } });

  await page.goto(homeUrl);
  await page.locator("[data-home-view]").waitFor();

  const desktopHeaderBand = page.locator(".sazo-desktop-header-band");
  const desktopHeaderBandBounds = await desktopHeaderBand.boundingBox();
  const desktopHeaderCardBounds = await page
    .locator(".sazo-desktop-header-card")
    .boundingBox();
  const desktopHeaderBounds = await page.locator(".sazo-desktop-header").boundingBox();
  const desktopNavBounds = await page.locator(".sazo-desktop-nav").boundingBox();
  const desktopHeroBounds = await page
    .locator('.sazo-hero-slide[data-active="true"]')
    .boundingBox();
  const desktopHomeSectionBounds = await page
    .locator(".sazo-home-section")
    .first()
    .boundingBox();
  const desktopGramCardBounds = await page
    .locator(".sazo-gram-card")
    .first()
    .boundingBox();
  const desktopIntroHeadingBounds = await page
    .locator(".sazo-home-intro h1")
    .boundingBox();
  const desktopSearchBounds = await page
    .locator(".sazo-desktop-header .sazo-search")
    .boundingBox();
  const desktopIntroButtonBounds = await page
    .locator(".sazo-home-intro > button")
    .boundingBox();
  const desktopLogin = page.getByTestId("login-launcher");
  const desktopLanguageFlag = page.locator(".sazo-language-flag");

  assert(
    desktopHeaderBandBounds !== null &&
      desktopHeaderCardBounds !== null &&
      desktopHeaderBounds !== null &&
      desktopNavBounds !== null,
  );
  assert(
    desktopHeroBounds !== null &&
      desktopHomeSectionBounds !== null &&
      desktopGramCardBounds !== null &&
      desktopIntroHeadingBounds !== null &&
      desktopSearchBounds !== null &&
      desktopIntroButtonBounds !== null,
  );
  assert(Math.abs(desktopHeaderBandBounds.x) < 1);
  assert(Math.abs(desktopHeaderBandBounds.width - 1511) < 1);
  assert(Math.abs(desktopHeaderBandBounds.height - 116) < 1);
  assert.equal(
    await desktopHeaderBand.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
    "rgb(255, 255, 255)",
  );
  assert(Math.abs(desktopHeaderCardBounds.x - 179.5) < 3);
  assert(Math.abs(desktopHeaderCardBounds.width - 1152) < 3);
  assert(Math.abs(desktopHeaderCardBounds.height - 116) < 3);
  assert.equal(desktopHeaderBounds.x, desktopHeaderCardBounds.x);
  assert.equal(desktopHeaderBounds.width, desktopHeaderCardBounds.width);
  assert.equal(desktopNavBounds.x, desktopHeaderCardBounds.x);
  assert.equal(desktopNavBounds.width, desktopHeaderCardBounds.width);
  assert(Math.abs(desktopHeroBounds.y - 157) < 3);
  assert(Math.abs(desktopHeroBounds.width / desktopHeroBounds.height - 3) < 0.01);
  assert(Math.abs(desktopHomeSectionBounds.x - 171) < 12);
  assert(Math.abs(desktopHomeSectionBounds.width - 1170) < 24);
  assert(Math.abs(desktopGramCardBounds.width - 214) < 3);
  assert(
    Math.abs(desktopIntroHeadingBounds.y - 709) < 10,
    `desktop intro heading y=${String(desktopIntroHeadingBounds.y)}`,
  );
  assert.equal(
    await page
      .locator(".sazo-home-intro h1")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "40px",
  );
  assert(desktopSearchBounds.width > 700);
  assert(Math.abs(desktopSearchBounds.height - 48) < 2);
  assert.equal(
    await page
      .locator(".sazo-desktop-header .sazo-search")
      .evaluate((element) => getComputedStyle(element).borderStyle),
    "solid",
  );
  assert.equal(
    await page
      .locator("#sazo-desktop-search")
      .evaluate((element) => getComputedStyle(element).textAlign),
    "center",
  );
  assert(Math.abs(desktopIntroButtonBounds.x - 1000) < 20);
  assert(Math.abs(desktopIntroButtonBounds.width - 340) < 4);
  assert.equal(
    await desktopLogin.evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  assert.equal(await desktopLanguageFlag.isVisible(), true);
  const interestedSection = page.locator(".sazo-interested-items");
  const interestedTrack = page.getByTestId("interested-items-track");
  const interestedCards = interestedTrack.locator('[data-variant="interest"]');
  const interestedNext = interestedSection.getByRole("button", {
    name: "次の商品を表示",
  });

  await interestedSection.scrollIntoViewIfNeeded();
  assert.equal(await interestedCards.count(), 5);
  const desktopInterestSectionBounds = await interestedSection.boundingBox();
  const desktopInterestCardBounds = await interestedCards.first().boundingBox();
  const desktopInterestNextBounds = await interestedNext.boundingBox();
  assert(
    desktopInterestSectionBounds !== null &&
      desktopInterestCardBounds !== null &&
      desktopInterestNextBounds !== null,
  );
  assert(Math.abs(desktopInterestSectionBounds.width - 1170) < 24);
  assert(desktopInterestCardBounds.width > 270 && desktopInterestCardBounds.width < 290);
  assert(desktopInterestNextBounds.width >= 44);
  assert(desktopInterestNextBounds.height >= 44);
  const desktopFavorite = interestedCards.first().locator(".sazo-product-favorite");
  await desktopFavorite.click();
  assert.equal(await desktopFavorite.getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator(".sazo-root").getAttribute("data-view"), "home");
  assert.equal(
    await interestedCards.nth(4).evaluate((element) => {
      const card = element.getBoundingClientRect();
      const track = element.parentElement?.getBoundingClientRect();

      return track === undefined ? false : card.left >= track.right - 1;
    }),
    true,
  );

  const desktopInterestPrimary = interestedCards.first().locator(".sazo-product-open");
  await page.locator(".sazo-home-intro > button").focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await desktopInterestPrimary.evaluate(
      (element) => document.activeElement === element,
    ),
    true,
  );
  assert.equal(
    await desktopInterestPrimary.evaluate((element) => element.matches(":focus-visible")),
    true,
  );
  assert.equal(
    await desktopInterestPrimary.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    ),
    "solid",
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await desktopFavorite.evaluate((element) => document.activeElement === element),
    true,
  );
  assert.equal(
    await desktopFavorite.evaluate((element) => element.matches(":focus-visible")),
    true,
  );
  for (let index = 0; index < 9; index += 1) {
    await page.keyboard.press("Tab");
  }
  assert.equal(
    await interestedNext.evaluate((element) => document.activeElement === element),
    true,
  );
  assert.equal(
    await interestedNext.evaluate((element) => element.matches(":focus-visible")),
    true,
  );

  await interestedTrack.evaluate((element) => {
    element.scrollLeft = 0;
  });
  const desktopInterestScrollBefore = await interestedTrack.evaluate(
    (element) => element.scrollLeft,
  );
  await interestedNext.click();
  await page.waitForFunction(
    () =>
      (document.querySelector('[data-testid="interested-items-track"]')?.scrollLeft ??
        0) > 0,
  );
  assert(
    (await interestedTrack.evaluate((element) => element.scrollLeft)) >
      desktopInterestScrollBefore,
  );
  await interestedSection.screenshot({
    path: "/tmp/jplanet-interested-items-desktop.png",
  });

  const interestedDetailPage = await browser.newPage({
    viewport: { height: 828, width: 1511 },
  });
  await interestedDetailPage.goto(homeUrl);
  await interestedDetailPage.locator("[data-home-view]").waitFor();
  await interestedDetailPage
    .getByRole("button", {
      name: "商品詳細を開く: [ナイキ] ファンダメンタル 重量減り(AC4197-010)",
    })
    .click();
  await interestedDetailPage.locator('[data-view-content="product"]').waitFor();
  assert.equal(
    await interestedDetailPage.locator(".sazo-product-detail-price").innerText(),
    "¥3,339",
  );
  assert.equal(
    await interestedDetailPage.locator(".sazo-product-detail h1").innerText(),
    "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
  );
  await interestedDetailPage.close();

  const tabletInterestMetrics = [];
  const tabletInterestContracts = [
    { cardMaximum: 273, cardMinimum: 268, fullyVisible: 2, width: 768 },
    { cardMaximum: 290, cardMinimum: 284, fullyVisible: 2, width: 820 },
    { cardMaximum: 313, cardMinimum: 309, fullyVisible: 3, width: 1024 },
  ];

  for (const tabletContract of tabletInterestContracts) {
    const tabletPage = await browser.newPage({
      viewport: { height: 900, width: tabletContract.width },
    });
    await tabletPage.goto(homeUrl);
    await tabletPage.locator("[data-home-view]").waitFor();
    const tabletTrack = tabletPage.getByTestId("interested-items-track");
    await tabletTrack.scrollIntoViewIfNeeded();
    const tabletMetrics = await tabletTrack.evaluate((element) => {
      const track = element.getBoundingClientRect();
      const cards = Array.from(
        element.querySelectorAll('[data-variant="interest"]'),
        (card) => card.getBoundingClientRect(),
      );

      return {
        cardWidth: cards[0]?.width ?? 0,
        fullyVisible: cards.filter(
          (card) => card.left >= track.left - 1 && card.right <= track.right + 1,
        ).length,
        trackWidth: track.width,
      };
    });

    tabletInterestMetrics.push({
      ...tabletMetrics,
      viewportWidth: tabletContract.width,
    });

    if (tabletContract.width === 768) {
      const tabletScrollBefore = await tabletTrack.evaluate(
        (element) => element.scrollLeft,
      );
      await tabletTrack.hover();
      await tabletPage.mouse.wheel(180, 0);
      await tabletPage.waitForFunction(
        () =>
          (document.querySelector('[data-testid="interested-items-track"]')?.scrollLeft ??
            0) > 0,
      );
      assert(
        (await tabletTrack.evaluate((element) => element.scrollLeft)) >
          tabletScrollBefore,
      );
    }

    await tabletPage.close();
  }
  assert.deepEqual(
    tabletInterestMetrics.map(({ fullyVisible, viewportWidth }) => ({
      fullyVisible,
      viewportWidth,
    })),
    [
      { fullyVisible: 2, viewportWidth: 768 },
      { fullyVisible: 2, viewportWidth: 820 },
      { fullyVisible: 3, viewportWidth: 1024 },
    ],
  );
  for (const [index, tabletContract] of tabletInterestContracts.entries()) {
    const tabletMetric = tabletInterestMetrics[index];
    assert(tabletMetric !== undefined);
    assert(
      tabletMetric.cardWidth > tabletContract.cardMinimum &&
        tabletMetric.cardWidth < tabletContract.cardMaximum,
      `tablet ${String(tabletContract.width)} card width=${String(tabletMetric.cardWidth)}`,
    );
  }
  await page.screenshot({ path: "/tmp/sazo-header-refined.png" });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(100);
  const scrolledHeaderBandBounds = await desktopHeaderBand.boundingBox();
  assert(scrolledHeaderBandBounds !== null);
  assert(Math.abs(scrolledHeaderBandBounds.y) < 1);
  await page.screenshot({ path: "/tmp/sazo-header-band-scrolled.png" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "次のバナー" }).click();
  await assert.doesNotReject(() =>
    page.getByTestId("sazo-hero-counter").getByText("2/5").waitFor(),
  );

  const status = page.locator(".sazo-hero-status");
  assert.notEqual(
    await status.evaluate((element) => getComputedStyle(element).opacity),
    "0",
  );

  const pause = page.getByRole("button", { name: "バナーを一時停止" });
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
    "バナーを一時停止",
  );
  assert.equal(
    await pause.evaluate((element) => element.matches(":focus-visible")),
    true,
  );
  assert.equal(
    await pause.evaluate((element) => getComputedStyle(element).outlineStyle),
    "solid",
  );
  await pause.click();
  await page.getByRole("button", { name: "バナーを再生" }).waitFor();

  await page.evaluate(() => document.fonts.ready);
  const searchCallout = page.locator(".sazo-search-callout");
  await searchCallout.scrollIntoViewIfNeeded();
  const searchField = searchCallout.locator(".sazo-large-search");
  const searchButton = searchField.getByRole("button", { name: "検索" });
  const searchIcon = searchField.locator(":scope > svg").first();
  const guidance = searchCallout.locator("svg[data-search-guidance-arrow]");
  const guidanceCurve = guidance.locator("[data-search-guidance-curve]");
  const guidanceHead = guidance.locator("[data-search-guidance-head]");
  const hint = searchCallout.locator(":scope > p");
  const [calloutBounds, fieldBounds, buttonBounds, iconBounds, hintBounds] =
    await Promise.all([
      searchCallout.boundingBox(),
      searchField.boundingBox(),
      searchButton.boundingBox(),
      searchIcon.boundingBox(),
      hint.boundingBox(),
    ]);

  assert(calloutBounds && fieldBounds && buttonBounds && iconBounds && hintBounds);
  assert(Math.abs(calloutBounds.width - 640) < 2);
  assert(
    Math.abs(fieldBounds.height - 82) < 2,
    `search field height=${String(fieldBounds.height)}`,
  );
  assert(
    Math.abs(buttonBounds.height - 64) < 2,
    `search button height=${String(buttonBounds.height)}`,
  );
  assert.equal(
    await searchButton.evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgb(254, 162, 172)",
  );
  assert.equal(await guidance.getAttribute("aria-hidden"), "true");
  assert.equal(await guidance.locator("path").count(), 2);
  assert.equal(
    await guidanceCurve.evaluate((element) => getComputedStyle(element).strokeLinecap),
    "round",
  );
  assert.equal(
    await guidanceCurve.evaluate((element) => getComputedStyle(element).strokeLinejoin),
    "round",
  );
  const curveGeometry = await guidanceCurve.evaluate((path) => {
    const matrix = path.getScreenCTM();
    const totalLength = path.getTotalLength();
    const toScreen = (length) => {
      const point = path.getPointAtLength(length);

      return new DOMPoint(point.x, point.y).matrixTransform(matrix ?? undefined);
    };
    const tipPoint = toScreen(totalLength);
    const priorPoint = toScreen(Math.max(0, totalLength - 2));
    const tangentDelta = {
      x: tipPoint.x - priorPoint.x,
      y: tipPoint.y - priorPoint.y,
    };
    const tangentLength = Math.hypot(tangentDelta.x, tangentDelta.y);
    const samples = Array.from({ length: 241 }, (_, index) =>
      toScreen((totalLength * index) / 240),
    );

    return {
      bounds: {
        bottom: Math.max(...samples.map((point) => point.y)),
        left: Math.min(...samples.map((point) => point.x)),
        right: Math.max(...samples.map((point) => point.x)),
        top: Math.min(...samples.map((point) => point.y)),
      },
      tangent: {
        x: tangentDelta.x / tangentLength,
        y: tangentDelta.y / tangentLength,
      },
      tip: { x: tipPoint.x, y: tipPoint.y },
    };
  });
  const tip = curveGeometry.tip;
  const iconCenter = {
    x: iconBounds.x + iconBounds.width / 2,
    y: iconBounds.y + iconBounds.height / 2,
  };
  const tipDistance = Math.hypot(tip.x - iconCenter.x, tip.y - iconCenter.y);
  const tipToIcon = {
    x: (iconCenter.x - tip.x) / tipDistance,
    y: (iconCenter.y - tip.y) / tipDistance,
  };
  const tangentCosine =
    curveGeometry.tangent.x * tipToIcon.x + curveGeometry.tangent.y * tipToIcon.y;

  assert(tipDistance < 30, `guidance tip distance=${String(tipDistance)}`);
  assert(tipDistance > 8, `guidance tip distance=${String(tipDistance)}`);
  assert(tip.x < iconCenter.x, "guidance tip must sit left of the magnifier");
  assert(tip.y > iconCenter.y, "guidance tip must sit below the magnifier");
  assert(tangentCosine > 0.8, `guidance tangent cosine=${String(tangentCosine)}`);
  const headGeometry = await guidanceHead.evaluate((path, curveTip) => {
    const matrix = path.getScreenCTM();
    const totalLength = path.getTotalLength();
    const toScreen = (length) => {
      const point = path.getPointAtLength(length);

      return new DOMPoint(point.x, point.y).matrixTransform(matrix ?? undefined);
    };
    const samples = Array.from({ length: 2001 }, (_, index) =>
      toScreen((totalLength * index) / 2000),
    );
    const tipPoint = samples.reduce((nearest, point) =>
      Math.hypot(point.x - curveTip.x, point.y - curveTip.y) <
      Math.hypot(nearest.x - curveTip.x, nearest.y - curveTip.y)
        ? point
        : nearest,
    );
    const startPoint = toScreen(0);
    const endPoint = toScreen(totalLength);

    return {
      bounds: {
        bottom: Math.max(...samples.map((point) => point.y)),
        left: Math.min(...samples.map((point) => point.x)),
        right: Math.max(...samples.map((point) => point.x)),
        top: Math.min(...samples.map((point) => point.y)),
      },
      end: { x: endPoint.x, y: endPoint.y },
      start: { x: startPoint.x, y: startPoint.y },
      tip: { x: tipPoint.x, y: tipPoint.y },
      tipDistance: Math.hypot(tipPoint.x - curveTip.x, tipPoint.y - curveTip.y),
    };
  }, tip);
  assert(
    headGeometry.tipDistance < 0.05,
    `arrowhead attachment distance=${String(headGeometry.tipDistance)}`,
  );
  const normalizeFromTip = (point) => {
    const delta = { x: point.x - tip.x, y: point.y - tip.y };
    const length = Math.hypot(delta.x, delta.y);

    return { x: delta.x / length, y: delta.y / length };
  };
  const headStartDirection = normalizeFromTip(headGeometry.start);
  const headEndDirection = normalizeFromTip(headGeometry.end);
  const headStartTrailCosine =
    headStartDirection.x * curveGeometry.tangent.x +
    headStartDirection.y * curveGeometry.tangent.y;
  const headEndTrailCosine =
    headEndDirection.x * curveGeometry.tangent.x +
    headEndDirection.y * curveGeometry.tangent.y;

  assert(
    headStartTrailCosine < -0.35,
    `arrowhead start trail cosine=${String(headStartTrailCosine)}`,
  );
  assert(
    headEndTrailCosine < -0.35,
    `arrowhead end trail cosine=${String(headEndTrailCosine)}`,
  );
  const pathBounds = {
    bottom: Math.max(curveGeometry.bounds.bottom, headGeometry.bounds.bottom),
    left: Math.min(curveGeometry.bounds.left, headGeometry.bounds.left),
    right: Math.max(curveGeometry.bounds.right, headGeometry.bounds.right),
    top: Math.min(curveGeometry.bounds.top, headGeometry.bounds.top),
  };
  const guidanceStrokeWidth = Number.parseFloat(
    await guidanceCurve.evaluate((element) => getComputedStyle(element).strokeWidth),
  );
  const guidanceStrokeRadius = guidanceStrokeWidth / 2;
  const containmentTolerance = 2;

  assert(
    pathBounds.left - guidanceStrokeRadius >= calloutBounds.x - containmentTolerance,
  );
  assert(pathBounds.top - guidanceStrokeRadius >= calloutBounds.y - containmentTolerance);
  assert(
    pathBounds.right + guidanceStrokeRadius <=
      calloutBounds.x + calloutBounds.width + containmentTolerance,
  );
  assert(
    pathBounds.bottom + guidanceStrokeRadius <=
      calloutBounds.y + calloutBounds.height + containmentTolerance,
  );
  assert.equal(
    await guidance.evaluate((element) => getComputedStyle(element).overflow),
    "visible",
  );
  const hintLineHeight = Number.parseFloat(
    await hint.evaluate((element) => getComputedStyle(element).lineHeight),
  );

  assert.deepEqual((await hint.innerText()).split("\n"), [
    "欲しい商品の「名前」か",
    "「URL」をここに入力！",
  ]);
  assert.equal(Math.round(hintBounds.height / hintLineHeight), 2);
  assert.equal(await searchButton.locator("svg[data-search-submit-arrow]").count(), 1);
  await searchCallout.screenshot({
    path: "/tmp/jplanet-home-search-callout-desktop.png",
  });

  await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 700 }));
  await page.locator('.sazo-root[data-header-collapsed="true"]').waitFor();
  assert.equal(await page.evaluate(() => window.scrollY), 700);
  await page
    .locator(".sazo-desktop-nav")
    .getByRole("button", { exact: true, name: "サービス紹介" })
    .click();
  await page.locator('[data-view-content="service"]').waitFor();
  await page.waitForFunction(() => window.scrollY === 0);
  assert.equal(await page.locator(".sazo-root").getAttribute("data-view"), "service");
  const serviceScrollY = await page.evaluate(() => window.scrollY);
  assert.equal(serviceScrollY, 0);
  const serviceStep = page.locator('.sazo-service-step[data-step="01"]');
  const serviceStepDocumentTop = await serviceStep.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return window.scrollY + bounds.top;
  });
  const serviceStepBounds = await serviceStep.boundingBox();

  assert(serviceStepBounds !== null);
  assert.equal(await page.locator(".sazo-service-url-card").isVisible(), false);
  assert.equal(await page.locator(".sazo-top-actions").isVisible(), true);
  assert(
    Math.abs(serviceStepDocumentTop - 3544.5) < 12,
    `service step document top=${String(serviceStepDocumentTop)}`,
  );
  assert(Math.abs(serviceStepBounds.y - serviceStepDocumentTop) < 1);
  assert(
    Math.abs(serviceStepBounds.width - 1156) < 12,
    `service step width=${String(serviceStepBounds.width)}`,
  );
  assert(
    Math.abs(serviceStepBounds.height - 500) < 12,
    `service step height=${String(serviceStepBounds.height)}`,
  );
  assert.equal(
    await page
      .locator(".sazo-service-title h2")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "54px",
  );

  await page.reload();
  await page.locator("[data-home-view]").waitFor();
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "次のバナー" }).click();
  }
  await page.waitForTimeout(500);
  const centerOf = (slide) =>
    page.locator(`[data-hero-slide="${slide}"]`).evaluate((element) => {
      const bounds = element.getBoundingClientRect();

      return bounds.left + bounds.width / 2;
    });
  const visibleHeroSlides = () =>
    page
      .locator("[data-hero-slide]")
      .evaluateAll((elements) =>
        elements
          .filter(
            (element) => Number.parseFloat(getComputedStyle(element).opacity) > 0.01,
          )
          .map((element) => element.getAttribute("data-hero-slide")),
      );
  const farHeroSlideStyles = () =>
    page
      .locator('[data-hero-offset="-2"], [data-hero-offset="2"]')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const styles = getComputedStyle(element);

          return {
            opacity: styles.opacity,
            pointerEvents: styles.pointerEvents,
            transitionDuration: styles.transitionDuration,
          };
        }),
      );
  const friendBeforeWrap = await centerOf("friend-invite");
  const deliveryBeforeWrap = await centerOf("delivery-line");
  const slotWidth = deliveryBeforeWrap - friendBeforeWrap;

  await page.getByRole("button", { name: "次のバナー" }).click();
  await page.waitForTimeout(45);
  assert.deepEqual((await visibleHeroSlides()).sort(), [
    "delivery-line",
    "friend-invite",
    "new-benefits",
  ]);
  assert(
    (await farHeroSlideStyles()).every(
      ({ opacity, pointerEvents, transitionDuration }) =>
        opacity === "0" && pointerEvents === "none" && transitionDuration === "0s",
    ),
  );
  await page.waitForTimeout(500);
  const friendAfterWrap = await centerOf("friend-invite");
  const deliveryAfterWrap = await centerOf("delivery-line");

  assert(Math.abs(friendAfterWrap - friendBeforeWrap + slotWidth) < 2);
  assert(Math.abs(deliveryAfterWrap - deliveryBeforeWrap + slotWidth) < 2);

  await page.getByRole("button", { name: "前のバナー" }).click();
  await page.waitForTimeout(45);
  assert.deepEqual((await visibleHeroSlides()).sort(), [
    "cold-delivery",
    "delivery-line",
    "friend-invite",
  ]);
  assert(
    (await farHeroSlideStyles()).every(
      ({ opacity, pointerEvents, transitionDuration }) =>
        opacity === "0" && pointerEvents === "none" && transitionDuration === "0s",
    ),
  );

  await page.getByTestId("nav-reviews").click();
  await page.locator('[data-view-content="reviews"]').waitFor();
  const reviewGeometry = await page.locator(".sazo-review-tile").evaluateAll((tiles) =>
    tiles.slice(4, 8).map((tile) => {
      const bounds = tile.getBoundingClientRect();

      return {
        image: tile.querySelector("img")?.getAttribute("src"),
        x: Math.round(bounds.x),
      };
    }),
  );

  assert.deepEqual(reviewGeometry, [
    { image: "/sazo-commerce/review-media/r07.jpg", x: 171 },
    { image: undefined, x: 759 },
    { image: "/sazo-commerce/review-media/r08.jpg", x: 1053 },
    { image: "/sazo-commerce/reviews/unseen-media.png", x: 465 },
  ]);
  const reviewPlaceholderBounds = await page
    .locator(".sazo-review-tile-placeholder")
    .boundingBox();
  const reviewPlaceholderMediaBounds = await page
    .locator(".sazo-review-tile")
    .nth(5)
    .locator(".sazo-review-tile-media")
    .boundingBox();

  assert(reviewPlaceholderBounds !== null && reviewPlaceholderMediaBounds !== null);
  assert(Math.abs(reviewPlaceholderBounds.width - 270) < 4);
  assert(Math.abs(reviewPlaceholderBounds.height - 190) < 4);
  assert(Math.abs(reviewPlaceholderMediaBounds.height - 190) < 4);
  assert.deepEqual(
    await page
      .locator(".sazo-review-tile")
      .evaluateAll((tiles) =>
        tiles.slice(8, 12).map((tile) => getComputedStyle(tile).transform),
      ),
    [
      "matrix(1, 0, 0, 1, 0, 16)",
      "matrix(1, 0, 0, 1, 0, 37)",
      "matrix(1, 0, 0, 1, 0, 15)",
      "matrix(1, 0, 0, 1, 0, -50)",
    ],
  );

  const mobilePage = await browser.newPage({ viewport: { height: 735, width: 341 } });

  await mobilePage.goto(homeUrl);
  await mobilePage.locator("[data-home-view]").waitFor();
  const mobileHeaderActions = mobilePage.getByRole("group", {
    name: "モバイルヘッダー操作",
  });

  assert.equal(await mobileHeaderActions.getByRole("button").count(), 3);
  const mobileHeaderBounds = await mobilePage
    .locator(".sazo-mobile-header")
    .boundingBox();
  const mobileHeroBounds = await mobilePage.locator(".sazo-hero").boundingBox();
  const mobileSearchBounds = await mobilePage.locator(".sazo-hero-search").boundingBox();
  const mobileShortcutBounds = await mobilePage.locator(".sazo-shortcuts").boundingBox();
  const mobileIntroHeadingBounds = await mobilePage
    .locator(".sazo-home-intro h1")
    .boundingBox();
  const mobileIntroButtonBounds = await mobilePage
    .locator(".sazo-home-intro > button")
    .boundingBox();
  const mobileInterestedSection = mobilePage.locator(".sazo-interested-items");
  const mobileInterestedSectionBounds = await mobileInterestedSection.boundingBox();
  const mobileInterestedCardBounds = await mobileInterestedSection
    .locator('[data-variant="interest"]')
    .first()
    .boundingBox();
  const mobileCommunityHeadingBounds = await mobilePage
    .locator(".sazo-review-section h2")
    .boundingBox();
  const mobileReviewCardBounds = await mobilePage
    .locator(".sazo-review-card")
    .first()
    .boundingBox();
  const mobileShortcutIconBounds = await mobilePage
    .locator(".sazo-shortcut-icon")
    .first()
    .boundingBox();
  const mobileNavigationBounds = await mobilePage
    .locator(".sazo-mobile-nav")
    .boundingBox();
  const mobileChatBounds = await mobilePage.locator(".sazo-chat-button").boundingBox();

  assert(
    mobileHeaderBounds !== null &&
      mobileHeroBounds !== null &&
      mobileSearchBounds !== null &&
      mobileShortcutBounds !== null &&
      mobileIntroHeadingBounds !== null &&
      mobileIntroButtonBounds !== null &&
      mobileInterestedSectionBounds !== null &&
      mobileInterestedCardBounds !== null &&
      mobileCommunityHeadingBounds !== null &&
      mobileReviewCardBounds !== null &&
      mobileShortcutIconBounds !== null &&
      mobileNavigationBounds !== null &&
      mobileChatBounds !== null,
  );
  assert.equal(Math.round(mobileHeaderBounds.y), 0);
  assert.equal(Math.round(mobileHeaderBounds.width), 341);
  assert(Math.abs(mobileHeaderBounds.height - 76) < 3);
  assert(Math.abs(mobileHeroBounds.y - 76) < 3);
  assert(Math.abs(mobileSearchBounds.y - 228) < 4);
  assert(Math.abs(mobileSearchBounds.height - 38) < 2);
  assert(Math.abs(mobileShortcutBounds.y - 284) < 4);
  assert(Math.abs(mobileShortcutBounds.height - 109) < 3);
  assert(Math.abs(mobileIntroHeadingBounds.y - 423) < 4);
  assert.equal(
    await mobilePage
      .locator(".sazo-home-intro h1")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "28px",
  );
  assert(Math.abs(mobileIntroButtonBounds.y - 548) < 6);
  assert(Math.abs(mobileIntroButtonBounds.height - 46) < 3);
  assert(mobileInterestedSectionBounds.y > mobileIntroButtonBounds.y);
  assert(
    mobileCommunityHeadingBounds.y >=
      mobileInterestedSectionBounds.y + mobileInterestedSectionBounds.height,
  );
  assert(Math.abs(mobileReviewCardBounds.width - 123) < 3);
  assert(mobileReviewCardBounds.y > mobileCommunityHeadingBounds.y);
  assert(
    mobileInterestedCardBounds.width > 225 && mobileInterestedCardBounds.width < 250,
  );
  assert.match(
    await mobileInterestedSection
      .locator(".sazo-interested-items-track")
      .evaluate((element) => getComputedStyle(element).scrollSnapType),
    /mandatory/,
  );
  assert.equal(
    await mobileInterestedSection
      .getByRole("button", { name: "次の商品を表示" })
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();

        return bounds.width >= 44 && bounds.height >= 44;
      }),
    true,
  );
  await mobileInterestedSection.screenshot({
    path: "/tmp/jplanet-interested-items-mobile.png",
  });
  assert(Math.abs(mobileShortcutIconBounds.width - 42) < 2);
  assert(Math.abs(mobileNavigationBounds.height - 44) < 2);
  assert(Math.abs(mobileChatBounds.width - 36) < 2);
  assert(Math.abs(mobileChatBounds.y + mobileChatBounds.height - 705) < 3);
  assert.equal(
    await mobilePage
      .locator(".sazo-review-section h2")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "20px",
  );

  await mobilePage.evaluate(() => {
    window.scrollTo({ behavior: "instant", top: 86 });
  });
  await mobilePage.locator('.sazo-root[data-header-collapsed="true"]').waitFor();
  assert.equal(
    await mobilePage.locator(".sazo-mobile-header-primary").isVisible(),
    false,
  );
  const collapsedNavBounds = await mobilePage
    .locator(".sazo-mobile-secondary-nav")
    .boundingBox();
  const collapsedIntroParagraphBounds = await mobilePage
    .locator(".sazo-home-intro p")
    .boundingBox();
  const collapsedIntroButtonBounds = await mobilePage
    .locator(".sazo-home-intro > button")
    .boundingBox();

  assert(
    collapsedNavBounds !== null &&
      collapsedIntroParagraphBounds !== null &&
      collapsedIntroButtonBounds !== null,
  );
  assert.equal(Math.round(collapsedNavBounds.y), 0);
  assert(Math.abs(collapsedNavBounds.height - 35) < 2);
  assert(
    Math.abs(
      ((await mobilePage.locator(".sazo-hero-search").boundingBox())?.y ?? -1) - 137,
    ) < 3,
  );
  assert(
    Math.abs(collapsedIntroParagraphBounds.y - 405) < 3,
    `collapsed paragraph y=${String(collapsedIntroParagraphBounds.y)}`,
  );
  assert(
    Math.abs(collapsedIntroButtonBounds.y - 461) < 3,
    `collapsed intro button y=${String(collapsedIntroButtonBounds.y)}`,
  );
  await mobilePage.evaluate(() => {
    window.scrollTo({ behavior: "instant", top: 0 });
  });
  await mobilePage.locator('.sazo-root[data-header-collapsed="false"]').waitFor();
  const activeMobileImage = mobilePage.locator(
    '.sazo-hero-slide[data-active="true"] img',
  );
  assert.equal(
    await activeMobileImage.evaluate((element) => getComputedStyle(element).objectFit),
    "fill",
  );
  const mobileMetrics = await activeMobileImage.evaluate(async (element) => {
    await element.decode();
    const bounds = element.getBoundingClientRect();

    return {
      currentSrc: element.currentSrc,
      displayRatio: bounds.width / bounds.height,
      naturalHeight: element.naturalHeight,
      naturalWidth: element.naturalWidth,
    };
  });

  assert.equal(
    new URL(mobileMetrics.currentSrc).pathname,
    "/sazo-commerce/hero/slide-1.webp",
  );
  assert.equal(mobileMetrics.naturalWidth, 1200);
  assert.equal(mobileMetrics.naturalHeight, 490);
  assert(Math.abs(mobileMetrics.displayRatio - 2) < 0.01);

  await mobilePage.locator(".sazo-hero-arrow-next").evaluate((button) => {
    button.click();
  });
  await mobilePage.getByRole("button", { name: "クーポンキャンペーンを見る" }).click();
  await mobilePage.locator('[data-campaign-loaded="true"]').waitFor();
  const campaignBannerBounds = await mobilePage
    .locator(".sazo-campaign-banner")
    .boundingBox();
  const campaignSecondRailImageBounds = await mobilePage
    .locator(".sazo-campaign-rail")
    .nth(1)
    .locator(".sazo-campaign-thumbnail")
    .first()
    .boundingBox();
  const campaignUrlBounds = await mobilePage.locator(".sazo-campaign-url").boundingBox();

  assert(
    campaignBannerBounds !== null &&
      campaignSecondRailImageBounds !== null &&
      campaignUrlBounds !== null,
  );
  assert.equal(Math.round(campaignBannerBounds.y), 38);
  assert.equal(Math.round(campaignBannerBounds.height), 233);
  assert(Math.abs(campaignSecondRailImageBounds.y - 586) < 3);
  assert(Math.abs(campaignUrlBounds.y - 664) < 4);

  const mobileCalloutMeasurements = [];

  for (const viewport of [
    { height: 844, width: 390 },
    { height: 844, width: 320 },
  ]) {
    const mobile = await browser.newPage({ viewport });
    await mobile.goto(homeUrl);
    await mobile.locator("[data-home-view]").waitFor();
    await mobile.evaluate(() => document.fonts.ready);
    const mobileCallout = mobile.locator(".sazo-search-callout");
    await mobileCallout.scrollIntoViewIfNeeded();

    assert.equal(
      await mobileCallout.locator("svg[data-search-guidance-arrow]").isVisible(),
      false,
    );
    const mobileScrollWidth = await mobile.evaluate(
      () => document.documentElement.scrollWidth,
    );
    assert.equal(mobileScrollWidth, viewport.width);
    const mobileButtonBounds = await mobileCallout
      .getByRole("button", { name: "検索" })
      .boundingBox();
    const mobileCalloutBounds = await mobileCallout.boundingBox();
    const mobileHint = mobileCallout.locator(":scope > p");
    const mobileHintBounds = await mobileHint.boundingBox();
    const mobileHintMetrics = await mobileHint.evaluate((element) => {
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
      const bounds = element.getBoundingClientRect();

      return {
        clientWidth: element.clientWidth,
        lineCount: Math.round(bounds.height / lineHeight),
        scrollWidth: element.scrollWidth,
      };
    });

    assert(mobileButtonBounds && mobileCalloutBounds && mobileHintBounds);
    assert(mobileButtonBounds.height >= 44);
    assert(mobileHintMetrics.scrollWidth <= mobileHintMetrics.clientWidth);
    assert(mobileHintBounds.x >= mobileCalloutBounds.x);
    assert(
      mobileHintBounds.x + mobileHintBounds.width <=
        mobileCalloutBounds.x + mobileCalloutBounds.width,
    );
    assert(mobileHintMetrics.lineCount >= 2);
    mobileCalloutMeasurements.push({
      buttonHeight: mobileButtonBounds.height,
      calloutHeight: mobileCalloutBounds.height,
      calloutWidth: mobileCalloutBounds.width,
      hintLineCount: mobileHintMetrics.lineCount,
      hintScrollWidth: mobileHintMetrics.scrollWidth,
      scrollWidth: mobileScrollWidth,
      viewportWidth: viewport.width,
    });
    if (viewport.width === 390) {
      await mobileCallout.screenshot({
        path: "/tmp/jplanet-home-search-callout-mobile.png",
      });
    }
    await mobile.close();
  }

  process.stdout.write(
    `sazo-home-search-callout-metrics ${JSON.stringify({
      desktop: {
        buttonHeight: buttonBounds.height,
        calloutBounds,
        calloutHeight: calloutBounds.height,
        calloutWidth: calloutBounds.width,
        containmentTolerance,
        fieldHeight: fieldBounds.height,
        guidanceStrokeRadius,
        hintHeight: hintBounds.height,
        hintLineHeight,
        headEndTrailCosine,
        headStartTrailCosine,
        headTip: headGeometry.tip,
        headTipDistance: headGeometry.tipDistance,
        iconCenter,
        pathBounds,
        tangent: curveGeometry.tangent,
        tangentCosine,
        tip,
        tipDistance,
      },
      mobile: mobileCalloutMeasurements,
      service: {
        documentTop: serviceStepDocumentTop,
        height: serviceStepBounds.height,
        scrollY: serviceScrollY,
        viewportY: serviceStepBounds.y,
        width: serviceStepBounds.width,
      },
      tabletInterest: tabletInterestMetrics,
    })}\n`,
  );

  process.stdout.write("sazo-home-browser-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
