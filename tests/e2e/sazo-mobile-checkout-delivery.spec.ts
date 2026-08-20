import { expect, test } from "@playwright/test";

const checkoutPath = "/sazo-commerce-mock/?qa=1&view=checkout";
const mobileWidths = [341, 390, 440] as const;

test.describe("J-Planet mobile checkout synthetic delivery mock", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mock delivery stages are mobile-only.");
  });

  for (const width of mobileWidths) {
    test(`keeps the ${String(width)}px mock delivery details usable when expanded and collapsed`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ height: 956, width });
      await page.goto(checkoutPath);

      const checkout = page.getByTestId("jplanet-checkout");
      const delivery = checkout.locator('[data-delivery-copy-source="synthetic-mock"]');
      const confirmation = checkout.getByRole("button", { name: "注文を確定する" });

      await expect(delivery).toBeVisible();
      await expect(
        delivery.getByRole("button", { name: "配送詳細を閉じる" }),
      ).toHaveAttribute("aria-expanded", "true");
      await expect(delivery.getByText("日本国内配送 2〜4日")).toBeVisible();
      await expect(delivery.getByText("日本 → ブラジル 6〜8日")).toBeVisible();
      await expect(delivery.getByText("合計目安 8〜12日で到着予定")).toBeVisible();
      await expect(delivery.getByRole("button", { name: /国際配送 · 通常便/ })).toBeVisible();
      await expect(confirmation).toBeVisible();
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`checkout-delivery-${String(width)}-expanded.png`),
      });

      await delivery.getByRole("button", { name: "配送詳細を閉じる" }).click();

      await expect(
        delivery.getByRole("button", { name: "配送詳細を見る" }),
      ).toHaveAttribute("aria-expanded", "false");
      await expect(delivery.getByText("通常配送")).toBeVisible();
      await expect(delivery.getByText("8〜12日", { exact: true })).toBeVisible();
      await expect(delivery.getByText("詳細を見る", { exact: true })).toBeVisible();
      await expect(delivery.getByText("日本国内配送 2〜4日")).toHaveCount(0);
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`checkout-delivery-${String(width)}-collapsed.png`),
      });

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      await expect(confirmation).toBeVisible();
    });

    test(`keeps the ${String(width)}px Figma 43:2 review sections open first and foldable in place`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ height: 956, width });
      await page.goto(checkoutPath);

      const checkout = page.getByTestId("jplanet-checkout");
      const order = checkout.getByTestId("checkout-order-review");
      const delivery = checkout.locator('[data-delivery-copy-source="synthetic-mock"]');
      const payment = checkout.getByTestId("checkout-payment-review");

      await expect(checkout).toHaveAttribute(
        "data-checkout-mobile-proposal",
        "figma-43-2",
      );
      await expect(order.getByRole("button", { name: "注文商品を閉じる" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(order.getByText("Nintendo Switch OLED")).toBeVisible();
      await expect(payment.getByRole("button", { name: "支払い方法を閉じる" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(payment.getByRole("button", { name: "Pix すぐに支払い" })).toBeVisible();
      await expect(
        payment.getByRole("button", {
          name: "クレジットカード Visa / Mastercard",
        }),
      ).toBeVisible();
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`checkout-figma-43-2-${String(width)}-expanded.png`),
      });

      await order.getByRole("button", { name: "注文商品を閉じる" }).click();
      await delivery.getByRole("button", { name: "配送詳細を閉じる" }).click();
      await payment.getByRole("button", { name: "支払い方法を閉じる" }).click();

      await expect(order.getByRole("button", { name: "注文商品を見る" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(order.getByRole("img")).toHaveCount(3);
      await expect(delivery.getByRole("button", { name: "配送詳細を見る" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(
        payment.getByRole("button", { name: "支払い方法の詳細を見る" }),
      ).toHaveAttribute("aria-expanded", "false");
      await expect(payment.getByRole("button", { name: "Pix すぐに支払い" })).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp("view=checkout"));
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`checkout-figma-43-2-${String(width)}-collapsed.png`),
      });

      const collapsedGeometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(collapsedGeometry.scrollWidth).toBe(collapsedGeometry.clientWidth);

      await page.goto("/sazo-commerce-mock/?qa=1&view=cart");
      const cart = page.getByTestId("jplanet-cart");
      await expect(cart).toHaveAttribute("data-cart-mobile-proposal", "figma-43-2");
      await expect(page.getByText("販売元・輸入条件を確認済み")).toBeHidden();
      await expect(cart.getByRole("button", { name: /購入手続きへ/ })).toBeVisible();
      const cartGeometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(cartGeometry.scrollWidth).toBe(cartGeometry.clientWidth);
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`cart-figma-43-2-${String(width)}.png`),
      });
    });
  }

  test("keeps the Figma review layer below the 768px boundary", async ({ page }) => {
    await page.setViewportSize({ height: 956, width: 768 });
    await page.goto(checkoutPath);

    const checkout = page.getByTestId("jplanet-checkout");
    await expect(checkout.getByTestId("checkout-order-review")).toBeHidden();
    await expect(checkout.getByTestId("checkout-payment-review")).toBeHidden();
    await expect(
      checkout.getByText("Rakuten Japan 公式ストア", { exact: true }),
    ).toBeVisible();
    await expect(
      checkout.getByRole("button", { name: /国際配送 · 通常便/ }),
    ).toBeVisible();
    await expect(checkout.getByRole("button", { name: /^Pix/ })).toBeVisible();
  });
});
