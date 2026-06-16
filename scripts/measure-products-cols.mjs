/**
 * Measure products panel columns in detail.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.mouse.move(720, 500);
await page.waitForTimeout(300);
const btn = page.locator('.sj-nav-item').filter({ hasText: 'サービス' });
await btn.hover();
await page.waitForTimeout(700);

const data = await page.evaluate(() => {
  const panel = document.querySelector('.sj-megamenu-content');
  if (!panel) return { error: 'no panel' };

  // Products panel: sj-panel--products with sj-panel__main + sj-panel__aside
  const main = panel.querySelector('.sj-panel__main');
  const aside = panel.querySelector('.sj-panel__aside');

  const measureCol = (col) => {
    if (!col) return null;
    const cs = window.getComputedStyle(col);
    const r = col.getBoundingClientRect();
    const heading = col.querySelector('.sj-pheading');
    const hcs = heading ? window.getComputedStyle(heading) : null;
    const lis = Array.from(col.querySelectorAll('.sj-plist > li'));
    const firstLi = lis[0];
    const lastLi = lis[lis.length - 1];
    const firstA = firstLi?.querySelector('.sj-plink');
    const firstDesc = firstLi?.querySelector('.sj-pdesc');

    return {
      cls: col.className,
      colH: Math.round(r.height),
      colScrollH: col.scrollHeight,
      pt: cs.paddingTop,
      pb: cs.paddingBottom,
      pl: cs.paddingLeft,
      headingH: heading ? Math.round(heading.getBoundingClientRect().height) : null,
      headingMb: hcs?.marginBottom,
      headingPb: hcs?.paddingBottom,
      itemCount: lis.length,
      firstLiH: firstLi ? Math.round(firstLi.getBoundingClientRect().height) : null,
      firstLiMb: firstLi ? window.getComputedStyle(firstLi).marginBottom : null,
      lastLiMb: lastLi ? window.getComputedStyle(lastLi).marginBottom : null,
      firstAH: firstA ? Math.round(firstA.getBoundingClientRect().height) : null,
      firstDescH: firstDesc ? Math.round(firstDesc.getBoundingClientRect().height) : null,
      firstDescMt: firstDesc ? window.getComputedStyle(firstDesc).marginTop : null,
    };
  };

  // For main: measure all 4 sub-columns
  const mainCols = main ? Array.from(main.children).map(measureCol) : [];
  const asideData = measureCol(aside);

  return { main: measureCol(main), mainCols, aside: asideData };
});

console.log('Products panel:');
console.log('main:', JSON.stringify(data.main, null, 2));
console.log('\nmain columns:');
data.mainCols.forEach((col, i) => console.log(`  col${i}:`, JSON.stringify(col)));
console.log('\naside:', JSON.stringify(data.aside, null, 2));

await browser.close();
