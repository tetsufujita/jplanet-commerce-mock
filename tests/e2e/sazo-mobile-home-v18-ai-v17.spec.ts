import { expect, test, type Page } from "@playwright/test";

const routePath = "/sazo-commerce-mock/?qa=1";

async function expectNoHorizontalPageOverflow(page: Page) {
  expect(
    await page.evaluate(() => ({
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    })),
  ).toEqual(
    expect.objectContaining({
      body: expect.any(Number),
      document: expect.any(Number),
      viewport: expect.any(Number),
    }),
  );

  const overflow = await page.evaluate(
    () =>
      Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) -
      document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

test("implements the approved Home v1.8 product masonry and support footer", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Home v1.8 is mobile-only");

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(routePath);

  const grid = page.locator("[data-mobile-picks-grid] [data-home-dense-product-grid]");
  const cards = grid.getByTestId("home-dense-product-card");
  await expect(cards).toHaveCount(16);
  await expect(grid.locator(".sazo-home-dense-product-column")).toHaveCount(2);

  const firstCard = cards.first();
  await expect(firstCard).toHaveCSS("border-top-width", "1px");
  await expect(firstCard).toHaveCSS("border-radius", "16px");
  expect(await firstCard.evaluate((card) => getComputedStyle(card).boxShadow)).not.toBe(
    "none",
  );
  await expect(firstCard.locator(".sazo-home-dense-product-media-open img")).toHaveCSS(
    "object-fit",
    "contain",
  );
  await expect(firstCard.locator(".sazo-home-dense-product-add")).toHaveCSS(
    "width",
    "44px",
  );
  await expect(firstCard.locator(".sazo-home-dense-product-add")).toHaveCSS(
    "height",
    "44px",
  );

  const mediaHeights = await cards.locator(".sazo-home-dense-product-media").evaluateAll(
    (elements) => elements.map((element) => Math.round(element.getBoundingClientRect().height)),
  );
  expect(new Set(mediaHeights).size).toBeGreaterThan(1);

  const footer = page.locator(".sazo-mobile-support-footer");
  await expect(footer).toHaveCSS("border-top-width", "1px");
  await expect(footer).toHaveCSS("padding-left", "16px");
  await expect(footer.locator(".sazo-mobile-contact")).toHaveCSS("height", "56px");
  await expectNoHorizontalPageOverflow(page);
});

test("implements AI Search v1.10 fidelity without changing its content or paths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "AI Search v1.10 is mobile-only");

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`${routePath}&view=ai-search`);

  const search = page.locator("[data-ai-search-view]");
  const header = search.locator(".sazo-ai-search-header");
  await expect(header).toHaveCSS("height", "64px");
  await expect(header).toHaveCSS("background-color", "rgba(251, 252, 254, 0.96)");
  await expect(header).toHaveCSS("backdrop-filter", "none");
  await expect(header).toHaveCSS("border-bottom-width", "1px");

  const back = search.locator(".sazo-ai-search-back");
  await expect(back).toHaveCSS("width", "44px");
  await expect(back).toHaveCSS("height", "44px");
  expect(await back.evaluate((element) => getComputedStyle(element).backdropFilter)).toContain(
    "blur(8px)",
  );
  expect(await back.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    "none",
  );

  const searchForm = search.locator(".sazo-ai-search-form");
  await expect(searchForm).toHaveCSS("height", "42px");
  expect(
    await searchForm.evaluate((element) => getComputedStyle(element).backdropFilter),
  ).toContain("blur(8px)");

  const bridge = search.locator(".sazo-ai-search-agent-bridge");
  await expect(bridge).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(bridge).toHaveCSS("border-radius", "18px");
  for (const side of ["top", "right", "bottom", "left"] as const) {
    await expect(bridge).toHaveCSS(`border-${side}-width`, "1px");
  }
  expect(await bridge.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    "none",
  );
  await expect(bridge.locator("p")).toHaveCSS("font-size", "14px");
  const bridgeParagraphLines = await bridge.locator("p").evaluate((paragraph) => {
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    return range.getClientRects().length;
  });
  expect(bridgeParagraphLines).toBe(2);
  for (const item of await bridge.locator("li").all()) {
    await expect(item).toHaveCSS("font-size", "14px");
  }
  await expect(search.locator(".sazo-ai-search-agent-bridge-intro img")).toHaveCSS(
    "width",
    "20px",
  );
  await expect(search.locator(".sazo-ai-search-agent-bridge-intro img")).toHaveCSS(
    "height",
    "20px",
  );
  const aiMarkAlignment = await search
    .locator(".sazo-ai-search-agent-bridge-intro")
    .evaluate((intro) => {
      const mark = intro.querySelector("img")?.getBoundingClientRect();
      const title = intro.querySelector("h2")?.getBoundingClientRect();

      if (mark === undefined || title === undefined) {
        throw new Error("Missing AI mark or title");
      }

      return Math.abs(mark.top + mark.height / 2 - (title.top + title.height / 2));
    });
  expect(aiMarkAlignment).toBeLessThanOrEqual(1);
  await expect(search.getByText("欲しい商品を、J-Planetに相談")).toBeVisible();
  await expect(search.getByText("日本の商品を、ブラジルで買える条件まで確認します。")).toBeVisible();
  await expect(search.getByRole("heading", { name: "今、人気の検索" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "モバイルメニュー" }).getByRole("button", {
      name: "AI検索",
      exact: true,
    }),
  ).toHaveCSS("background-color", "rgba(255, 241, 244, 0.92)");
  const navBox = await page
    .getByRole("navigation", { name: "モバイルメニュー" })
    .boundingBox();
  expect(navBox).not.toBeNull();
  expect(navBox?.x).toBeCloseTo(11, 0);
  expect(navBox?.width).toBeCloseTo(368, 0);
  expect(navBox?.height).toBeCloseTo(68, 0);
  expect(844 - (navBox?.y ?? 0) - (navBox?.height ?? 0)).toBeCloseTo(10, 0);
  await expectNoHorizontalPageOverflow(page);

  await page.goto(`${routePath}&view=ai-search&query=New%20Balance%209060`);
  const results = page.locator("[data-ai-search-results]");
  await expect(results.locator(".sazo-ai-search-result-image img")).toHaveCount(9);
  const firstResult = results.locator(".sazo-ai-search-result-group li").first();
  await expect(firstResult).toHaveCSS("border-top-width", "1px");
  await expect(firstResult).toHaveCSS("border-radius", "16px");
  expect(await firstResult.evaluate((card) => getComputedStyle(card).boxShadow)).not.toBe(
    "none",
  );
  await expect(firstResult.locator(".sazo-ai-search-result-image img")).toHaveCSS(
    "object-fit",
    "contain",
  );
  await expect(results.getByText("海外ショップも含めて検索しました。")).toBeVisible();
  await expect(results.getByText("全体 128件")).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
});

test("keeps Home v1.8 and AI Search v1.10 overflow-free at supported mobile widths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "The boundary belongs to mobile");

  for (const width of [341, 390, 440]) {
    await page.setViewportSize({ height: 844, width });
    await page.goto(routePath);
    await expectNoHorizontalPageOverflow(page);
    await page.goto(`${routePath}&view=ai-search`);
    await expectNoHorizontalPageOverflow(page);
  }
});
