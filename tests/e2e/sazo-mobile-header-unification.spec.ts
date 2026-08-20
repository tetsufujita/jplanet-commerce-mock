import { expect, test } from "@playwright/test";

const routePath = "/sazo-commerce-mock/?qa=1";

test("uses one compact mobile content-header geometry without horizontal overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile header contract");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);

    for (const view of ["categories", "brands", "brand-detail", "mypage"]) {
      await page.goto(`${routePath}&view=${view}`);
      const header = page.locator(".sazo-unified-mobile-header").first();
      await expect(header).toBeVisible();
      await expect(header).toHaveCSS("min-height", "64px");

      const bounds = await header.boundingBox();
      expect(Math.round(bounds?.height ?? 0)).toBe(64);
      expect(
        await page.evaluate(
          () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        ),
      ).toBe(0);

      for (const control of await header.locator("button").all()) {
        const controlBounds = await control.boundingBox();
        expect(Math.round(controlBounds?.height ?? 0)).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test("keeps the shared mobile shell out of the 768px category boundary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop boundary contract");
  await page.setViewportSize({ height: 900, width: 768 });
  await page.goto(`${routePath}&view=categories`);

  await expect(page.locator(".sazo-unified-mobile-header")).toHaveCount(0);
  await expect(page.locator('[data-testid="category-agent-entry"]')).toBeVisible();
  expect(
    await page.evaluate(
      () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    ),
  ).toBe(0);
});
