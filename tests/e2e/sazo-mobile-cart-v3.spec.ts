import { expect, test } from "@playwright/test";

const route = "/sazo-commerce-mock/?qa=1&view=cart";

test("keeps the Figma v3 cart readable and actionable at 341, 390, and 440px", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "This proposal is mobile-only.");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(route);

    const cart = page.getByTestId("jplanet-cart");
    const summary = cart.locator(".sazo-jplanet-cart-summary");
    const cta = summary.getByRole("button", { name: "購入手続きへ (3)" });

    await expect(cart).toHaveAttribute("data-cart-mobile-redesign", "figma-47-30");
    await expect(cart.getByRole("heading", { name: "カート" })).toBeVisible();
    await expect(cart.locator(".sazo-jplanet-cart-mobile-count")).toHaveText("3商品");
    await expect(cart.getByText("Rakuten Japan", { exact: true })).toBeVisible();
    await expect(cart.locator(".sazo-jplanet-cart-mobile-shipping").first()).toBeVisible();
    await expect(cart.locator(".sazo-jplanet-cart-purchase-note")).toBeVisible();
    await expect(cta).toBeVisible();

    const geometry = await cart.evaluate((element) => {
      const summary = element.querySelector<HTMLElement>(".sazo-jplanet-cart-summary");
      const cta = summary?.querySelector<HTMLElement>("button");
      const evidence = element.querySelector<HTMLElement>(".sazo-jplanet-cart-item-copy > p");
      const recommendation = element.querySelector<HTMLElement>(".sazo-jplanet-cart-recommendations");
      const purchaseNote = element.querySelector<HTMLElement>(".sazo-jplanet-cart-purchase-note");
      if (!summary || !cta || !evidence || !recommendation || !purchaseNote) {
        throw new Error("Missing cart v3 structure");
      }
      const summaryRect = summary.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      return {
        ctaHeight: Math.round(ctaRect.height),
        ctaInside: ctaRect.left >= 0 && ctaRect.right <= window.innerWidth,
        evidenceDisplay: getComputedStyle(evidence).display,
        footerBottom: Math.round(window.innerHeight - summaryRect.bottom),
        footerHeight: Math.round(summaryRect.height),
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        recommendationAfterNote:
          recommendation.getBoundingClientRect().top >= purchaseNote.getBoundingClientRect().bottom,
      };
    });

    expect(geometry).toMatchObject({
      ctaInside: true,
      evidenceDisplay: "none",
      footerBottom: 8,
      pageOverflow: 0,
      recommendationAfterNote: true,
    });
    expect(geometry.ctaHeight).toBeGreaterThanOrEqual(44);
    expect(geometry.footerHeight).toBeGreaterThanOrEqual(88);
    expect(geometry.footerHeight).toBeLessThanOrEqual(96);
  }
});

test("keeps the v3 mobile-only additions hidden at the 768px boundary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The desktop project checks the boundary.");
  await page.setViewportSize({ height: 900, width: 768 });
  await page.goto(route);

  const cart = page.getByTestId("jplanet-cart");
  await expect(cart.locator(".sazo-jplanet-cart-mobile-count")).toBeHidden();
  await expect(cart.locator(".sazo-jplanet-cart-mobile-source-name").first()).toBeHidden();
  await expect(cart.locator(".sazo-jplanet-cart-purchase-note")).toBeHidden();
  await expect(cart.getByRole("button", { name: "チャット" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0);
});
