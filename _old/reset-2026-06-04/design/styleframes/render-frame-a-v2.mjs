import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, "frame-a-v2-corridor.html");
const outDir = resolve(__dirname, "renders");
const outPath = resolve(outDir, "frame-a-v2-corridor-infrastructure.png");

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(htmlPath).href);
await page.screenshot({ path: outPath });
await browser.close();

console.log(`Rendered ${outPath}`);
