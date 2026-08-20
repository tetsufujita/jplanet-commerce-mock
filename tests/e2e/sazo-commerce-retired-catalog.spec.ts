import { expect, test } from "@playwright/test";

const routePath = "/sazo-commerce-mock/?qa=1";

test("opens the current ladies category from the mobile Uniqlo more link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "the reported path is mobile-only");
  await page.setViewportSize({ height: 956, width: 440 });
  await page.goto(`${routePath}&view=home`);

  const discovery = page.getByTestId("mobile-home-uniqlo-discovery");
  await discovery.scrollIntoViewIfNeeded();
  await discovery.getByRole("button", { name: "もっと見る" }).click();

  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "categories");
  await expect(page.getByRole("heading", { level: 2, name: "レディース" })).toBeVisible();
  await expect(page.locator('[data-view-content="catalog"]')).toHaveCount(0);
});

test("keeps the retired cosmetics catalog unavailable from its old deep link", async ({ page }) => {
  await page.goto(`${routePath}&view=catalog`);

  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "categories");
  await expect(page.locator('[data-view-content="catalog"]')).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "カテゴリー" })).toBeVisible();
});
