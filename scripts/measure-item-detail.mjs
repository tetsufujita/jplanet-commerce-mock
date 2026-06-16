/**
 * Detailed item height analysis in the clone.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// Hover ソリューション
const btn = page.locator('.sj-nav-item').filter({ hasText: 'ソリューション' });
await btn.hover();
await page.waitForTimeout(700);

const data = await page.evaluate(() => {
  const panel = document.querySelector('.sj-megamenu-content');
  if (!panel) return { error: 'no panel' };

  // Get all li items
  const lis = Array.from(panel.querySelectorAll('.sj-plist > li'));
  const results = lis.slice(0, 5).map((li, i) => {
    const lics = window.getComputedStyle(li);
    const a = li.querySelector('.sj-plink');
    const acs = a ? window.getComputedStyle(a) : null;
    const liR = li.getBoundingClientRect();
    const aR = a ? a.getBoundingClientRect() : null;
    return {
      i,
      liH: liR.height,
      liScrollH: li.scrollHeight,
      liMb: lics.marginBottom,
      liDisplay: lics.display,
      liOverflow: lics.overflow,
      aH: aR?.height,
      aDisplay: acs?.display,
      aLH: acs?.lineHeight,
      aFZ: acs?.fontSize,
      text: li.textContent.trim().slice(0, 25),
    };
  });

  // Also check the last li
  const lastLi = lis[lis.length - 1];
  if (lastLi) {
    const lics = window.getComputedStyle(lastLi);
    results.push({
      i: 'last',
      liH: lastLi.getBoundingClientRect().height,
      liMb: lics.marginBottom,
      text: lastLi.textContent.trim().slice(0, 25),
    });
  }

  // Measure the ul itself
  const ul = panel.querySelector('.sj-plist');
  const ulR = ul ? ul.getBoundingClientRect() : null;
  const ulCs = ul ? window.getComputedStyle(ul) : null;

  return {
    items: results,
    ul: {
      h: ulR?.height,
      scrollH: ul?.scrollHeight,
      gap: ulCs?.gap,
      rowGap: ulCs?.rowGap,
      display: ulCs?.display,
    },
  };
});

console.log('Item details:');
console.log(JSON.stringify(data, null, 2));

await browser.close();
