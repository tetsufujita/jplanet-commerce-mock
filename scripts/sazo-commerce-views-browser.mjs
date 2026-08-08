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
  const baseUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;
  const desktopPage = await browser.newPage({ viewport: { height: 828, width: 1511 } });

  await desktopPage.goto(baseUrl);
  const desktopNavigation = desktopPage.getByRole("navigation", {
    name: "メインメニュー",
  });
  await desktopNavigation.getByRole("button", { name: "人気ブランド" }).click();
  await desktopPage.locator('[data-view-content="brands"]').waitFor();
  assert.equal(await desktopPage.getByText("LONGCHAMP", { exact: true }).count(), 1);
  assert.equal(await desktopPage.locator('[data-view-content="brands"]').count(), 1);
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-brands.png" });

  await desktopNavigation.getByRole("button", { name: "カテゴリー" }).click();
  await desktopPage.locator('[data-view-content="categories"]').waitFor();
  assert.equal(await desktopPage.getByText("スキンケア", { exact: true }).count(), 1);
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-categories.png" });

  await desktopNavigation.getByRole("button", { name: "レビュー" }).click();
  await desktopPage.locator('[data-view-content="reviews"]').waitFor();
  assert.equal(await desktopPage.locator(".sazo-review-tile").count(), 12);
  const reviewPositions = await desktopPage
    .locator(".sazo-review-tile")
    .evaluateAll((tiles) =>
      tiles.map((tile) => {
        const bounds = tile.getBoundingClientRect();

        return {
          author: tile.querySelector(".sazo-review-tile-media > span")?.textContent,
          left: bounds.left,
          top: bounds.top,
        };
      }),
    );
  const firstReviewTop = Math.min(...reviewPositions.map(({ top }) => top));
  assert.deepEqual(
    reviewPositions
      .filter(({ top }) => Math.abs(top - firstReviewTop) < 2)
      .sort((left, right) => left.left - right.left)
      .map(({ author }) => author),
    ["MKT", "加藤奈実", "あ", "かと"],
  );
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-reviews.png" });

  await desktopNavigation.getByRole("button", { name: "ホーム" }).click();
  await desktopPage
    .locator(".sazo-ranking-section")
    .getByRole("button", { name: "もっと見る" })
    .click();
  await desktopPage.locator('[data-view-content="ranking"]').waitFor();
  assert.equal(await desktopPage.evaluate(() => window.scrollY), 0);
  assert.equal(await desktopPage.locator(".sazo-ranked-product").count(), 8);
  assert.match(
    await desktopPage.locator(".sazo-ranked-product h3").first().innerText(),
    /プチプチ犬ヘッドピン/,
  );
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-ranking.png" });

  await desktopNavigation.getByRole("button", { name: "サービス紹介" }).click();
  await desktopPage.locator('[data-view-content="service"]').waitFor();
  await desktopPage.setViewportSize({ height: 1264, width: 1726 });
  assert.equal(await desktopPage.evaluate(() => window.scrollY), 0);
  await desktopPage.waitForFunction(() =>
    document.fonts.check('700 24px "Noto Sans JP Variable"', "韓国商品"),
  );
  const serviceEntry = desktopPage.locator(".sazo-service-url-entry").first();
  const serviceInput = serviceEntry.locator("input");
  const serviceButton = serviceEntry.locator("button");
  const serviceButtonIcon = serviceButton.locator("svg");
  const entryBounds = await serviceEntry.boundingBox();
  assert(entryBounds !== null);
  assert.ok(Math.abs(entryBounds.height - 100) <= 2);
  assert.ok(Math.abs(entryBounds.width - 1154) <= 2);
  const serviceButtonIconBounds = await serviceButtonIcon.boundingBox();
  assert(serviceButtonIconBounds !== null);
  assert.ok(Math.abs(serviceButtonIconBounds.width - 30) <= 1);
  assert.ok(Math.abs(serviceButtonIconBounds.height - 30) <= 1);
  assert.match(
    await serviceInput.evaluate((element) => getComputedStyle(element).fontFamily),
    /^"?Noto Sans JP Variable"?/,
  );
  await serviceInput.focus();
  await desktopPage.waitForTimeout(200);
  assert.match(
    await serviceEntry.evaluate((element) => getComputedStyle(element).boxShadow),
    /0px 0px 0px 4px/,
  );
  const restingButtonColor = await serviceButton.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await serviceButton.hover();
  assert.notEqual(
    await serviceButton.evaluate((element) => getComputedStyle(element).backgroundColor),
    restingButtonColor,
  );
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-service-top.png" });
  await desktopPage.locator(".sazo-service-problem").scrollIntoViewIfNeeded();
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-service-problem.png" });
  await desktopPage
    .locator('.sazo-service-step[data-step="03"]')
    .scrollIntoViewIfNeeded();
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-service-step-03.png" });
  await desktopPage.locator(".sazo-service-trust").scrollIntoViewIfNeeded();
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-service-trust.png" });
  const faq = desktopPage.getByRole("button", {
    name: /販売者に問い合わせることはできますか/,
  });
  await faq.scrollIntoViewIfNeeded();
  await faq.focus();
  assert.equal(await faq.getAttribute("aria-expanded"), "false");
  const faqAnswer = desktopPage.locator(
    `#${String(await faq.getAttribute("aria-controls"))}`,
  );
  assert.equal(await faqAnswer.getAttribute("aria-hidden"), "true");
  await desktopPage.keyboard.press("Enter");
  assert.equal(await faq.getAttribute("aria-expanded"), "true");
  assert.equal(await faqAnswer.getAttribute("aria-hidden"), "false");
  await desktopPage.keyboard.press("Escape");
  assert.equal(await faq.getAttribute("aria-expanded"), "false");
  assert.equal(await faqAnswer.getAttribute("aria-hidden"), "true");
  assert.equal(await faq.evaluate((element) => element === document.activeElement), true);
  await desktopPage.keyboard.press("Enter");
  assert.equal(await faq.getAttribute("aria-expanded"), "true");
  await desktopPage.waitForTimeout(320);
  const expandedAnswer = desktopPage.locator('.sazo-faq-answer[data-expanded="true"]');
  assert.notEqual(
    await expandedAnswer.evaluate((element) => getComputedStyle(element).maxHeight),
    "0px",
  );
  assert.notEqual(
    await expandedAnswer.evaluate((element) => getComputedStyle(element).opacity),
    "0",
  );
  await desktopPage.screenshot({ path: "/tmp/sazo-task5-desktop-service.png" });

  const mobilePage = await browser.newPage({ viewport: { height: 844, width: 390 } });
  mobilePage.setDefaultTimeout(3_000);

  await mobilePage.goto(baseUrl);
  const mobileNavigation = mobilePage.getByRole("navigation", {
    name: "モバイルメニュー",
  });
  await mobileNavigation.getByRole("button", { name: "検索" }).click();
  await mobilePage.getByRole("button", { name: "グリッド表示" }).click();
  assert.equal(
    await mobilePage.locator("[data-catalog-mode]").getAttribute("data-catalog-mode"),
    "grid",
  );
  await mobilePage.screenshot({ path: "/tmp/sazo-task5-mobile-catalog-grid.png" });
  await mobilePage.locator("[data-view-back]").click();
  await mobileNavigation.getByRole("button", { name: "検索" }).click();
  assert.equal(
    await mobilePage.locator("[data-catalog-mode]").getAttribute("data-catalog-mode"),
    "grid",
  );
  await mobilePage.locator("[data-view-back]").click();

  const mobileSecondaryNavigation = mobilePage.getByRole("navigation", {
    name: "モバイルサブメニュー",
  });
  await mobilePage.screenshot({ path: "/tmp/sazo-task5-mobile-secondary-nav.png" });
  const mobileBrands = mobileSecondaryNavigation.getByRole("button", {
    name: "人気ブランド",
  });
  assert.equal(await mobileBrands.isVisible(), true);
  await mobileBrands.focus();
  assert.equal(
    await mobileBrands.evaluate((element) => element === document.activeElement),
    true,
  );
  await mobileBrands.click();
  await mobilePage.locator('[data-view-content="brands"]').waitFor();
  await mobilePage.screenshot({ path: "/tmp/sazo-task5-mobile-brands.png" });
  await mobilePage.locator("[data-view-back]").click();
  await mobileSecondaryNavigation.getByRole("button", { name: "カテゴリー" }).click();
  await mobilePage.locator('[data-view-content="categories"]').waitFor();
  await mobilePage.screenshot({ path: "/tmp/sazo-task5-mobile-categories.png" });
  await mobilePage.locator("[data-view-back]").click();
  await mobileSecondaryNavigation.getByRole("button", { name: "サービス紹介" }).click();
  await mobilePage.locator('[data-view-content="service"]').waitFor();
  await mobilePage.setViewportSize({ height: 844, width: 320 });
  const mobileServiceEntry = mobilePage.locator(".sazo-service-url-entry").first();
  const mobileEntryBounds = await mobileServiceEntry.boundingBox();
  assert(mobileEntryBounds !== null);
  assert.ok(mobileEntryBounds.x >= 0);
  assert.ok(mobileEntryBounds.x + mobileEntryBounds.width <= 320);
  assert.equal(
    await mobilePage.locator('[data-view-content="service"]').evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
    true,
  );
  await mobilePage.screenshot({ path: "/tmp/sazo-task5-mobile-service.png" });

  process.stdout.write("sazo-views-browser-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
