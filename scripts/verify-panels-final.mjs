/**
 * Final panel height verification against live stripe.com/jp targets.
 * Targets sourced from live site measurement (2026-06-11):
 *   サービス=654, ソリューション=403, 開発者=307, リソース=271
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5180/stripe-jp';
const PANELS = [
  { label: 'サービス',      target: 654 },
  { label: 'ソリューション',  target: 403 },
  { label: '開発者',        target: 307 },
  { label: 'リソース',      target: 271 },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

let pass = true;

console.log('Panel height verification (target = live stripe.com/jp 2026-06-11)');
console.log('─'.repeat(60));
console.log('Panel          | Clone  | Target | Diff  | Status');
console.log('─'.repeat(60));

for (const { label, target } of PANELS) {
  await page.mouse.move(720, 500);
  await page.waitForTimeout(400);

  const btn = page.locator('.sj-nav-item').filter({ hasText: label });
  await btn.hover();
  await page.waitForTimeout(700);

  const h = await page.evaluate(() => {
    const content = document.querySelector('.sj-megamenu-content');
    return content ? content.scrollHeight : -1;
  });

  const diff = h - target;
  const sign = diff > 0 ? '+' : '';
  const status = Math.abs(diff) <= 12 ? '✓ PASS' : '✗ FAIL';
  if (Math.abs(diff) > 12) pass = false;

  console.log(`${label.padEnd(15)}| ${String(h).padEnd(7)}| ${String(target).padEnd(7)}| ${(sign + diff).padEnd(6)}| ${status}`);
}

console.log('─'.repeat(60));
console.log(pass ? 'ALL PASS ✓' : 'SOME FAILED ✗');

await browser.close();
