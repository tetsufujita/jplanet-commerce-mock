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
  const page = await browser.newPage({ viewport: { height: 360, width: 900 } });

  await page.goto(`http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`);

  const search = page.locator(".sazo-desktop-header .sazo-search");
  const input = page.locator("#sazo-desktop-search");

  await input.click();
  assert.equal(
    await input.evaluate((element) => getComputedStyle(element).outlineStyle),
    "none",
  );
  assert.notEqual(
    await search.evaluate((element) => getComputedStyle(element).boxShadow),
    "none",
  );

  await page.screenshot({ path: "/tmp/sazo-search-focus-fixed.png" });
} finally {
  await browser?.close();
  await server.close();
}
