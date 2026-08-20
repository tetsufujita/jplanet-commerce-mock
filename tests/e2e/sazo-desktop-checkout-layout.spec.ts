import { expect, test, type Page } from "@playwright/test";

const routePath = "/sazo-commerce-mock/?qa=1";
const desktopWidths = [1_024, 1_280, 1_536] as const;

async function expectNoHorizontalPageOverflow(page: Page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(geometry.scrollWidth).toBe(geometry.clientWidth);
}

test.describe("J-Planet desktop checkout", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "PC checkout is desktop-only.");
  });

  for (const width of desktopWidths) {
    test(`keeps the ${String(width)}px checkout summary beside the procedure and sticky`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 900, width });
      await page.goto(`${routePath}&view=checkout`);

      const checkout = page.getByTestId("jplanet-checkout");
      const main = checkout.locator(".sazo-jplanet-checkout-main");
      const address = checkout.locator(".sazo-jplanet-checkout-address");
      const payment = checkout
        .getByRole("heading", { name: "支払い方法" })
        .locator("..");
      const summary = checkout.locator(".sazo-jplanet-checkout-summary");
      const footer = checkout.locator(".sazo-jplanet-checkout-footer");
      const confirmation = checkout.getByRole("button", { name: "注文を確定する" });

      await expect(checkout.getByRole("heading", { name: "購入手続き" })).toBeVisible();
      await expect(summary.getByRole("heading", { name: "支払い内訳" })).toBeVisible();
      await expect(confirmation).toHaveCount(1);
      await expect(confirmation).toBeVisible();
      await expect(summary).toHaveCSS("position", "sticky");
      await expect(footer).toHaveCSS("position", "static");

      const geometry = await Promise.all([
        main.boundingBox(),
        address.boundingBox(),
        payment.boundingBox(),
        summary.boundingBox(),
        confirmation.boundingBox(),
      ]);
      const [mainBox, addressBox, paymentBox, summaryBox, confirmationBox] = geometry;
      expect(mainBox).not.toBeNull();
      expect(addressBox).not.toBeNull();
      expect(paymentBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(confirmationBox).not.toBeNull();
      if (
        mainBox === null ||
        addressBox === null ||
        paymentBox === null ||
        summaryBox === null ||
        confirmationBox === null
      ) {
        return;
      }

      expect(mainBox.width).toBeLessThanOrEqual(1_280);
      expect(mainBox.x).toBeGreaterThanOrEqual(24);
      expect(width - mainBox.x - mainBox.width).toBeGreaterThanOrEqual(24);
      expect(summaryBox.width).toBeGreaterThanOrEqual(360);
      expect(summaryBox.width).toBeLessThanOrEqual(420);
      expect(summaryBox.x - addressBox.x - addressBox.width).toBeGreaterThanOrEqual(24);
      expect(summaryBox.x - addressBox.x - addressBox.width).toBeLessThanOrEqual(32);
      expect(paymentBox.x).toBeCloseTo(addressBox.x, 0);
      expect(paymentBox.width).toBeCloseTo(addressBox.width, 0);
      expect(confirmationBox.x).toBeGreaterThanOrEqual(summaryBox.x);
      expect(confirmationBox.x + confirmationBox.width).toBeLessThanOrEqual(
        summaryBox.x + summaryBox.width,
      );

      const desktopHeader = page.locator(".sazo-desktop-header-band");
      await payment.scrollIntoViewIfNeeded();
      const stickyGeometry = await Promise.all([
        desktopHeader.boundingBox(),
        summary.boundingBox(),
      ]);
      const [desktopHeaderBox, stickySummaryBox] = stickyGeometry;
      expect(desktopHeaderBox).not.toBeNull();
      expect(stickySummaryBox).not.toBeNull();
      if (desktopHeaderBox !== null && stickySummaryBox !== null) {
        const desktopHeaderBottom = desktopHeaderBox.y + desktopHeaderBox.height;
        expect(stickySummaryBox.y).toBeGreaterThanOrEqual(desktopHeaderBottom + 16);
        expect(stickySummaryBox.y).toBeLessThanOrEqual(desktopHeaderBottom + 32);
      }

      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      const endGeometry = await Promise.all([checkout.boundingBox(), summary.boundingBox()]);
      const [checkoutEndBox, summaryEndBox] = endGeometry;
      expect(checkoutEndBox).not.toBeNull();
      expect(summaryEndBox).not.toBeNull();
      if (checkoutEndBox !== null && summaryEndBox !== null) {
        expect(summaryEndBox.y + summaryEndBox.height).toBeLessThanOrEqual(
          checkoutEndBox.y + checkoutEndBox.height + 1,
        );
      }

      await expectNoHorizontalPageOverflow(page);
    });
  }

  test("keeps the existing checkout dialogs, payment choice, and submit result", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1_280 });
    await page.goto(`${routePath}&view=checkout`);

    const checkout = page.getByTestId("jplanet-checkout");
    await checkout.getByRole("button", { name: /Tetsu Fujita/ }).click();
    await expect(page.getByRole("dialog", { name: "配送先を選択" })).toBeVisible();
    await page.getByRole("button", { name: /Rua dos Pinheiros 540/ }).click();
    await expect(checkout.getByText(/Rua dos Pinheiros 540/)).toBeVisible();

    await checkout.getByRole("button", { name: /国際配送 · 通常便/ }).click();
    await expect(page.getByRole("dialog", { name: "配送方法を選択" })).toBeVisible();
    await page.getByRole("button", { name: /優先便/ }).click();
    await expect(checkout.getByRole("button", { name: /国際配送 · 優先便/ })).toBeVisible();

    await checkout.getByRole("button", { name: /使えるクーポン/ }).click();
    await expect(page.getByRole("dialog", { name: "クーポンを選択" })).toBeVisible();
    await page.getByRole("button", { name: /クーポンを使わない/ }).click();
    await expect(checkout.getByText("クーポン割引", { exact: true })).toHaveCount(0);

    await checkout.getByRole("button", { name: /ポイントを使う/ }).click();
    await expect(checkout.getByText("ポイント利用", { exact: true })).toBeVisible();

    await checkout.getByRole("button", { name: /^Pix/ }).click();
    await expect(page.getByRole("dialog", { name: "支払い方法を選択" })).toBeVisible();
    await page.getByRole("button", { name: /クレジットカード/ }).click();
    await expect(checkout.getByText("Visa •••• 2048", { exact: true })).toBeVisible();

    await checkout.getByRole("button", { name: "税金の説明を表示" }).click();
    await expect(page.getByRole("dialog", { name: "税金の説明" })).toBeVisible();
    await page.getByRole("button", { name: "確認しました" }).click();

    await checkout.getByRole("button", { name: "注文を確定する" }).click();
    await expect(checkout.getByRole("heading", { name: "注文を受け付けました" })).toBeVisible();
  });

  test("keeps the product-detail purchase path into checkout", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1_280 });
    await page.goto(
      `${routePath}&view=product&product=jplanet-nintendo-pro-controller`,
    );

    await page
      .getByTestId("jplanet-desktop-controller-purchase")
      .getByRole("button", { name: "商品を購入に進む" })
      .click();
    await expect(page.getByTestId("jplanet-checkout")).toBeVisible();
    await expect(page.getByRole("heading", { name: "購入手続き" })).toBeVisible();
  });
});
