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
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { height: 828, width: 1511 } });

  await page.goto(`http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`);
  await page.locator("[data-home-view]").waitFor();

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

  assert(desktopHeaderBounds !== null && desktopNavBounds !== null);
  assert(
    desktopHeroBounds !== null &&
      desktopHomeSectionBounds !== null &&
      desktopGramCardBounds !== null &&
      desktopIntroHeadingBounds !== null &&
      desktopSearchBounds !== null &&
      desktopIntroButtonBounds !== null,
  );
  assert(Math.abs(desktopHeaderBounds.x - 171) < 12);
  assert(Math.abs(desktopHeaderBounds.width - 1170) < 24);
  assert(Math.abs(desktopNavBounds.x - 171) < 12);
  assert(Math.abs(desktopNavBounds.width - 1170) < 24);
  assert(Math.abs(desktopHeroBounds.y - 165) < 3);
  assert(Math.abs(desktopHeroBounds.width / desktopHeroBounds.height - 3) < 0.01);
  assert(Math.abs(desktopHomeSectionBounds.x - 171) < 12);
  assert(Math.abs(desktopHomeSectionBounds.width - 1170) < 24);
  assert(Math.abs(desktopGramCardBounds.width - 214) < 3);
  assert(
    Math.abs(desktopIntroHeadingBounds.y - 717) < 10,
    `desktop intro heading y=${String(desktopIntroHeadingBounds.y)}`,
  );
  assert.equal(
    await page
      .locator(".sazo-home-intro h1")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "40px",
  );
  assert(desktopSearchBounds.width > 680);
  assert(Math.abs(desktopIntroButtonBounds.x - 1000) < 20);
  assert(Math.abs(desktopIntroButtonBounds.width - 340) < 4);
  assert.notEqual(
    await desktopLogin.evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
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

  await page
    .locator(".sazo-desktop-nav")
    .getByRole("button", { exact: true, name: "サービス紹介" })
    .click();
  await page.locator('[data-view-content="service"]').waitFor();
  const serviceStepBounds = await page
    .locator('.sazo-service-step[data-step="01"]')
    .boundingBox();

  assert(serviceStepBounds !== null);
  assert.equal(await page.locator(".sazo-service-url-card").isVisible(), false);
  assert.equal(await page.locator(".sazo-top-actions").isVisible(), true);
  assert(
    Math.abs(serviceStepBounds.y - 268) < 12,
    `service step y=${String(serviceStepBounds.y)}`,
  );
  assert(Math.abs(serviceStepBounds.width - 1010) < 12);
  assert(Math.abs(serviceStepBounds.height - 436) < 12);
  assert.equal(
    await page
      .locator(".sazo-service-title h1")
      .evaluate((element) => getComputedStyle(element).fontSize),
    "42px",
  );

  await page.reload();
  await page.locator("[data-home-view]").waitFor();
  await page.getByRole("button", { name: "前のバナー" }).click();
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
  const fifthAtFive = await centerOf("friend-invite");
  const firstAtFive = await centerOf("delivery-line");
  const slotWidth = firstAtFive - fifthAtFive;

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
  const fifthAtOne = await centerOf("friend-invite");
  const firstAtOne = await centerOf("delivery-line");

  assert(Math.abs(fifthAtOne - fifthAtFive + slotWidth) < 2);
  assert(Math.abs(firstAtOne - firstAtFive + slotWidth) < 2);

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
    { image: "/sazo-commerce/community/10.webp", x: 176 },
    { image: undefined, x: 766 },
    { image: "/sazo-commerce/community/11.webp", x: 1061 },
    { image: "/sazo-commerce/reviews/unseen.png", x: 471 },
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
  assert(Math.abs(reviewPlaceholderBounds.width - 275) < 4);
  assert(Math.abs(reviewPlaceholderBounds.height - 275) < 4);
  assert(Math.abs(reviewPlaceholderMediaBounds.height - 275) < 4);
  assert.deepEqual(
    await page
      .locator(".sazo-review-tile")
      .evaluateAll((tiles) =>
        tiles.slice(8, 12).map((tile) => getComputedStyle(tile).transform),
      ),
    [
      "matrix(1, 0, 0, 1, 0, 16)",
      "matrix(1, 0, 0, 1, 0, -43)",
      "matrix(1, 0, 0, 1, 0, 15)",
      "matrix(1, 0, 0, 1, 0, 15)",
    ],
  );

  const mobilePage = await browser.newPage({ viewport: { height: 735, width: 341 } });

  await mobilePage.goto(`http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`);
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
  assert(Math.abs(mobileCommunityHeadingBounds.y - 638) < 4);
  assert(Math.abs(mobileReviewCardBounds.width - 123) < 3);
  assert(Math.abs(mobileReviewCardBounds.y - 668) < 4);
  assert(Math.abs(mobileShortcutIconBounds.width - 42) < 2);
  assert(Math.abs(mobileNavigationBounds.height - 44) < 2);
  assert(Math.abs(mobileChatBounds.width - 44) < 2);
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

  process.stdout.write("sazo-home-browser-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
