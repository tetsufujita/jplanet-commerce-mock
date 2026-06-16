import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const SHOTS = [
  { label: 'サービス',      file: 'clone-megamenu-0' },
  { label: 'ソリューション',  file: 'clone-megamenu-1' },
  { label: '開発者',        file: 'clone-megamenu-2' },
  { label: 'リソース',      file: 'clone-megamenu-3' },
];

for (const { label, file } of SHOTS) {
  await page.mouse.move(720, 500);
  await page.waitForTimeout(400);
  const btn = page.locator('.sj-nav-item').filter({ hasText: label });
  await btn.hover();
  await page.waitForTimeout(700);
  await page.screenshot({
    path: `/Users/fujitatetsu/Desktop/Andes-Website/design/reproductions/stripe-jp/shots/${file}.png`,
    clip: { x: 0, y: 0, width: 1440, height: 850 },
  });
  console.log(`Shot: ${file}.png`);
}

await browser.close();
