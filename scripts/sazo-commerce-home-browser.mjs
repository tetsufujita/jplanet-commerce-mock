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

  await page.reload();
  await page.locator("[data-home-view]").waitFor();
  await page.getByRole("button", { name: "前のバナー" }).click();
  await page.waitForTimeout(500);
  const centerOf = (slide) =>
    page.locator(`[data-hero-slide="${slide}"]`).evaluate((element) => {
      const bounds = element.getBoundingClientRect();

      return bounds.left + bounds.width / 2;
    });
  const fifthAtFive = await centerOf("friend-invite");
  const firstAtFive = await centerOf("delivery-line");
  const slotWidth = firstAtFive - fifthAtFive;

  await page.getByRole("button", { name: "次のバナー" }).click();
  await page.waitForTimeout(500);
  const fifthAtOne = await centerOf("friend-invite");
  const firstAtOne = await centerOf("delivery-line");

  assert(Math.abs(fifthAtOne - fifthAtFive + slotWidth) < 2);
  assert(Math.abs(firstAtOne - firstAtFive + slotWidth) < 2);

  const mobilePage = await browser.newPage({ viewport: { height: 844, width: 390 } });

  await mobilePage.goto(`http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`);
  await mobilePage.locator("[data-home-view]").waitFor();
  const activeMobileImage = mobilePage.locator(
    '.sazo-hero-slide[data-active="true"] img',
  );
  assert.equal(
    await activeMobileImage.evaluate((element) => getComputedStyle(element).objectFit),
    "cover",
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
    "/sazo-commerce/hero/mobile/slide-1.webp",
  );
  assert.equal(mobileMetrics.naturalWidth, 450);
  assert.equal(mobileMetrics.naturalHeight, 278);
  assert(Math.abs(mobileMetrics.displayRatio - 1.62) < 0.01);

  process.stdout.write("sazo-home-browser-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
