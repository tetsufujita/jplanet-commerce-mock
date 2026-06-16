/**
 * Measure original stripe.com/jp products panel container.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('https://stripe.com/jp', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);

const btn = page.locator('[data-testid="header-products-nav-item"] button').first();
await btn.hover();
await page.waitForTimeout(800);

const data = await page.evaluate(() => {
  const navContent = document.querySelector('.navigation__content--products');
  if (!navContent) return { error: 'not found' };
  const cs = window.getComputedStyle(navContent);
  const r = navContent.getBoundingClientRect();

  // Children (cols)
  const cols = Array.from(navContent.children);
  const colData = cols.map(col => {
    const ccs = window.getComputedStyle(col);
    const cr = col.getBoundingClientRect();
    // heading
    const h3 = col.querySelector('h3, [class*="heading"], [class*="label"]');
    const hcs = h3 ? window.getComputedStyle(h3) : null;
    // items
    const lis = Array.from(col.querySelectorAll('li'));
    const firstLi = lis[0];
    const firstLics = firstLi ? window.getComputedStyle(firstLi) : null;
    const firstA = firstLi?.querySelector('a');
    const firstAcs = firstA ? window.getComputedStyle(firstA) : null;
    const firstDesc = firstLi?.querySelectorAll('*')[1];
    const firstDescCs = firstDesc ? window.getComputedStyle(firstDesc) : null;

    return {
      cls: col.className.slice(0, 80),
      h: Math.round(cr.height),
      pt: ccs.paddingTop,
      pb: ccs.paddingBottom,
      pl: ccs.paddingLeft,
      pr: ccs.paddingRight,
      headingText: h3?.textContent?.trim().slice(0, 25),
      headingH: h3 ? Math.round(h3.getBoundingClientRect().height) : null,
      headingMb: hcs?.marginBottom,
      headingPb: hcs?.paddingBottom,
      headingFZ: hcs?.fontSize,
      itemCount: lis.length,
      firstLiH: firstLi ? Math.round(firstLi.getBoundingClientRect().height) : null,
      firstLiMb: firstLics?.marginBottom,
      firstAH: firstA ? Math.round(firstA.getBoundingClientRect().height) : null,
      firstALH: firstAcs?.lineHeight,
      firstAFZ: firstAcs?.fontSize,
      firstAFW: firstAcs?.fontWeight,
      firstDescH: firstDesc ? Math.round(firstDesc.getBoundingClientRect().height) : null,
      firstDescMt: firstDescCs?.marginTop,
      firstDescFZ: firstDescCs?.fontSize,
    };
  });

  return {
    navH: Math.round(r.height),
    navPt: cs.paddingTop,
    navPb: cs.paddingBottom,
    navPl: cs.paddingLeft,
    navDisplay: cs.display,
    navGridTemplate: cs.gridTemplateColumns,
    colCount: cols.length,
    cols: colData,
  };
});

console.log(JSON.stringify(data, null, 2));

await browser.close();
