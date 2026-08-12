import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const videoDirectory = "/tmp/sazo-service-video-check";
const videoOutput = "/tmp/sazo-service-video-check.webm";
await mkdir(videoDirectory, { recursive: true });

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
  const context = await browser.newContext({
    recordVideo: { dir: videoDirectory, size: { height: 1264, width: 1726 } },
    viewport: { height: 1264, width: 1726 },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().startsWith("Failed to load resource")
    ) {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${String(response.status())} ${response.url()}`);
    }
  });

  const baseUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;
  await page.goto(baseUrl);
  await page
    .getByRole("navigation", { name: "メインメニュー" })
    .getByRole("button", { name: "サービス紹介" })
    .click();
  await page.locator('[data-view-content="service"]').waitFor();
  await page.waitForTimeout(700);

  const heroInput = page.locator("#sazo-service-hero-url");
  await heroInput.fill("https://www.your.item.com/products/20260807");
  await page.waitForTimeout(650);
  await heroInput.clear();

  for (const selector of [
    ".sazo-service-problem",
    '.sazo-service-step[data-step="01"]',
    '.sazo-service-step[data-step="02"]',
    '.sazo-service-step[data-step="03"]',
    ".sazo-service-shipping-panel",
    ".sazo-service-try",
    ".sazo-service-partners",
    ".sazo-service-trust",
    ".sazo-service-faq",
  ]) {
    await page.locator(selector).evaluate((element) => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await page.waitForTimeout(900);
  }

  const firstQuestion = page.getByRole("button", {
    name: /販売者に問い合わせることはできますか/,
  });
  await firstQuestion.click();
  await page.waitForTimeout(650);
  assert.equal(await firstQuestion.getAttribute("aria-expanded"), "true");
  await firstQuestion.click();
  await page.waitForTimeout(350);
  assert.equal(await firstQuestion.getAttribute("aria-expanded"), "false");

  await page.getByRole("button", { name: "ページ上部へ戻る" }).click();
  await page.waitForTimeout(1_200);
  assert.equal(consoleErrors.length, 0, consoleErrors.join("\n"));
  assert.equal(failedResponses.length, 0, failedResponses.join("\n"));

  const video = page.video();
  await page.close();
  assert(video !== null);
  await video.saveAs(videoOutput);
  await context.close();
  console.log(`sazo-service-video-ok ${videoOutput}`);
} finally {
  await browser?.close();
  await server.close();
}
