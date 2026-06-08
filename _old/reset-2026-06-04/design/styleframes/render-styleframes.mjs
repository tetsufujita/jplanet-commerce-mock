import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, "andes-investor-motion-frames.html");
const outDir = resolve(__dirname, "renders");

const frames = [
  ["frame-a", "frame-a-hero-corridor.png"],
  ["frame-b", "frame-b-friction-field.png"],
  ["frame-c", "frame-c-operating-wedge.png"],
  ["frame-d", "frame-d-two-layer-architecture.png"],
  ["frame-e", "frame-e-expansion-rails.png"],
  ["frame-f", "frame-f-protocol-close.png"],
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(htmlPath).href);

for (const [id, fileName] of frames) {
  const frame = page.locator(`#${id}`);
  await frame.scrollIntoViewIfNeeded();
  await frame.screenshot({
    path: resolve(outDir, fileName),
  });
}

await browser.close();

console.log(`Rendered ${frames.length} styleframes to ${outDir}`);
