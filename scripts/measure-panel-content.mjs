/**
 * Measure .sj-megamenu-content natural height (matches interaction JSON measurement).
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5180/stripe-jp';
const PANELS = [
  { label: 'サービス',     target: 654 },
  { label: 'ソリューション', target: 654 },
  { label: '開発者',       target: 403 },
  { label: 'リソース',     target: 307 },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });

console.log('Panel content heights (sj-megamenu-content):');
console.log('─'.repeat(55));
console.log('Panel         | Clone   | Target | Diff');
console.log('─'.repeat(55));

for (const { label, target } of PANELS) {
  const btn = page.locator('.sj-nav-item').filter({ hasText: label });
  await btn.hover();
  await page.waitForTimeout(600);

  const h = await page.evaluate(() => {
    // The inner content div (not the animated outer wrapper)
    const content = document.querySelector('.sj-megamenu-content');
    if (!content) return -1;
    // scroll height gives natural height regardless of parent clip
    return content.scrollHeight;
  });

  const diff = h - target;
  const sign = diff > 0 ? '+' : '';
  console.log(`${label.padEnd(14)}| ${String(h).padEnd(8)}| ${String(target).padEnd(7)}| ${sign}${diff}`);
}

// Move mouse away to close
await page.mouse.move(720, 500);
await page.waitForTimeout(400);

// Now measure tallest PanelBody child per panel (to understand where the height comes from)
console.log('\nTallest column heights:');
for (const { label } of PANELS) {
  const btn = page.locator('.sj-nav-item').filter({ hasText: label });
  await btn.hover();
  await page.waitForTimeout(500);

  const cols = await page.evaluate(() => {
    const content = document.querySelector('.sj-megamenu-content');
    if (!content) return [];
    // Direct children of the panel body
    const panel = content.querySelector('.sj-panel');
    if (!panel) return [];
    const children = Array.from(panel.children);
    return children.map(c => ({
      cls: c.className.split(' ').filter(x => x).join('.'),
      scrollH: c.scrollHeight,
      offsetH: c.offsetHeight,
    }));
  });
  console.log(`${label}:`, cols);
}

await browser.close();
