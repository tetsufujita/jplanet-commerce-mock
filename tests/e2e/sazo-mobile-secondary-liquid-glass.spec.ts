import { expect, test, type Locator } from "@playwright/test";

const qaPath = "/sazo-commerce-mock/?qa=1";

async function readSurface(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backdropFilter: style.backdropFilter,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
    };
  });
}

function alphaFrom(color: string) {
  const match = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/.exec(color);
  return match === null ? 1 : Number(match[1]);
}

test("keeps Liquid Glass on mobile interaction layers and commerce content opaque", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "The v1.9 proposal is mobile-only.");
  await page.setViewportSize({ height: 956, width: 440 });

  const secondaryViews = [
    {
      content: ".jplanet-brand-directory-row",
      header: ".jplanet-brand-header",
      hasNav: true,
      view: "brands",
    },
    {
      content: ".jplanet-brand-product-card",
      header: ".jplanet-brand-header",
      hasNav: false,
      view: "brand-detail",
    },
    {
      content: ".sazo-notifications-update > button",
      header: ".sazo-notifications-header",
      hasNav: true,
      view: "notifications",
    },
    {
      content: ".sazo-mypage-user-row",
      header: ".sazo-postpurchase-header",
      hasNav: true,
      view: "mypage",
    },
  ] as const;

  for (const target of secondaryViews) {
    await page.goto(`${qaPath}&view=${target.view}`);
    const headerSurface = await readSurface(page.locator(target.header).first());
    const contentSurface = await readSurface(page.locator(target.content).first());

    expect(headerSurface.backdropFilter).toContain("blur");
    expect(alphaFrom(headerSurface.backgroundColor)).toBeLessThan(1);
    if (target.hasNav) {
      const navSurface = await readSurface(page.locator(".sazo-mobile-nav"));
      expect(navSurface.backdropFilter).toContain("blur");
      expect(alphaFrom(navSurface.backgroundColor)).toBeLessThan(1);
    } else {
      await expect(page.locator(".sazo-mobile-nav")).toHaveCount(0);
    }
    expect(contentSurface.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(contentSurface.backdropFilter).toBe("none");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBe(0);
  }

  for (const target of [
    {
      content: ".sazo-jplanet-cart-group",
      footer: ".sazo-jplanet-cart-summary",
      header: ".sazo-jplanet-cart-header",
      view: "cart",
    },
    {
      content: ".sazo-jplanet-checkout-address",
      footer: ".sazo-jplanet-checkout-footer",
      header: ".sazo-jplanet-checkout-header",
      view: "checkout",
    },
  ] as const) {
    await page.goto(`${qaPath}&view=${target.view}`);
    const headerSurface = await readSurface(page.locator(target.header));
    const footerSurface = await readSurface(page.locator(target.footer));
    const contentSurface = await readSurface(page.locator(target.content).first());

    expect(headerSurface.backdropFilter).toContain("blur");
    expect(alphaFrom(headerSurface.backgroundColor)).toBeLessThan(1);
    expect(footerSurface.backdropFilter).toContain("blur");
    expect(alphaFrom(footerSurface.backgroundColor)).toBeLessThan(1);
    expect(contentSurface.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(contentSurface.backdropFilter).toBe("none");
  }

  await page.getByRole("button", { name: "注文を確定する" }).click();
  await expect(page.getByRole("heading", { name: "注文を受け付けました" })).toBeVisible();
  const successHeader = await readSurface(page.locator(".sazo-jplanet-checkout-header"));
  expect(successHeader.backdropFilter).toContain("blur");
  expect(alphaFrom(successHeader.backgroundColor)).toBeLessThan(1);
  await expect(page.locator(".sazo-jplanet-checkout-success")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
});

test("keeps v1.9 glass outside the 768px boundary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The desktop project checks 768px.");
  await page.setViewportSize({ height: 900, width: 768 });

  for (const target of [
    { header: ".sazo-jplanet-cart-header", view: "cart" },
    { header: ".sazo-jplanet-checkout-header", view: "checkout" },
  ] as const) {
    await page.goto(`${qaPath}&view=${target.view}`);
    const surface = await readSurface(page.locator(target.header));
    expect(surface.backdropFilter).toBe("none");
    expect(alphaFrom(surface.backgroundColor)).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBe(0);
  }
});
