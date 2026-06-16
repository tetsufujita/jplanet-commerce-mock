/**
 * Measure all item heights in products col0.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.mouse.move(720, 500);
const btn = page.locator('.sj-nav-item').filter({ hasText: 'サービス' });
await btn.hover();
await page.waitForTimeout(700);

const data = await page.evaluate(() => {
  const panel = document.querySelector('.sj-megamenu-content');
  const main = panel?.querySelector('.sj-panel__main');
  const col0 = main?.children[0];
  if (!col0) return { error: 'no col0' };
  const ul = col0.querySelector('.sj-plist');
  if (!ul) return { error: 'no ul' };

  const lis = Array.from(ul.querySelectorAll('li'));
  return {
    ulH: Math.round(ul.getBoundingClientRect().height),
    items: lis.map((li, i) => {
      const desc = li.querySelector('.sj-pdesc');
      return {
        i,
        liH: Math.round(li.getBoundingClientRect().height),
        liMb: window.getComputedStyle(li).marginBottom,
        descH: desc ? Math.round(desc.getBoundingClientRect().height) : null,
        text: li.querySelector('.sj-plink')?.textContent?.trim().slice(0, 25),
      };
    }),
  };
});

console.log(JSON.stringify(data, null, 2));
console.log('\nManual sum:');
let sum = 0;
for (const item of data.items) {
  const mb = parseFloat(item.liMb);
  sum += item.liH + mb;
}
console.log('Sum of liH+mb:', sum, '(ul measured:', data.ulH + ')');

await browser.close();
