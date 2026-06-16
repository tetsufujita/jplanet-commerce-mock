/**
 * Precisely measure the actual panel container and column padding on stripe.com/jp.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false }); // visible for debugging
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('https://stripe.com/jp', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);

// Take a screenshot of the baseline
await page.mouse.move(720, 500);
await page.waitForTimeout(300);

// Hover ソリューション
const btn = page.locator('[data-testid="header-solutions-nav-item"] button').first();
await btn.hover();
await page.waitForTimeout(800);

// Screenshot to verify panel is open
await page.screenshot({ path: '/Users/fujitatetsu/Desktop/Andes-Website/design/reproductions/stripe-jp/shots/orig-solutions-panel.png' });

const data = await page.evaluate(() => {
  // Find every element with height > 200 and top between 71 and 80 (starts at panel top)
  const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
    const r = el.getBoundingClientRect();
    return r.top >= 71 && r.top <= 82 && r.height > 200 && r.width > 500;
  });

  const results = candidates.map(el => {
    const cs = window.getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: el.className.slice(0, 100),
      h: Math.round(el.getBoundingClientRect().height),
      w: Math.round(el.getBoundingClientRect().width),
      pt: cs.paddingTop,
      pb: cs.paddingBottom,
      pl: cs.paddingLeft,
      pr: cs.paddingRight,
      display: cs.display,
      children: el.children.length,
    };
  });
  return results;
});

console.log('Panel containers (solutions open):');
data.forEach(d => console.log(JSON.stringify(d)));

// Also measure the direct children of the tallest container
const colData = await page.evaluate(() => {
  // Find the grid container at top of panel
  const allEls = Array.from(document.querySelectorAll('*')).filter(el => {
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return r.top >= 71 && r.top <= 90 && r.height > 200 &&
           (cs.display === 'grid' || cs.display === 'flex') && r.width > 800;
  });

  return allEls.map(el => {
    const cs = window.getComputedStyle(el);
    const children = Array.from(el.children);
    return {
      cls: el.className.slice(0, 100),
      h: Math.round(el.getBoundingClientRect().height),
      pt: cs.paddingTop,
      pb: cs.paddingBottom,
      display: cs.display,
      gridTemplate: cs.gridTemplateColumns,
      gap: cs.gap || cs.columnGap,
      cols: children.map(c => {
        const ccs = window.getComputedStyle(c);
        return {
          cls: c.className.slice(0, 60),
          h: Math.round(c.getBoundingClientRect().height),
          pt: ccs.paddingTop,
          pb: ccs.paddingBottom,
          pl: ccs.paddingLeft,
        };
      }),
    };
  });
});

console.log('\nGrid containers:');
colData.forEach(d => console.log(JSON.stringify(d, null, 2)));

// Measure items within the tallest column
const itemData = await page.evaluate(() => {
  // Find the column with most items (ユースケース別 = 9 items)
  const allUls = Array.from(document.querySelectorAll('ul, [role="list"]')).filter(ul => {
    const r = ul.getBoundingClientRect();
    return r.top > 71 && r.top < 200 && r.height > 100;
  });

  return allUls.map(ul => {
    const cs = window.getComputedStyle(ul);
    const items = Array.from(ul.querySelectorAll('li, [role="listitem"]'));
    return {
      cls: ul.className.slice(0, 60),
      h: Math.round(ul.getBoundingClientRect().height),
      ulPt: cs.paddingTop,
      ulPb: cs.paddingBottom,
      itemCount: items.length,
      firstItem: items[0] ? (() => {
        const li = items[0];
        const lics = window.getComputedStyle(li);
        const a = li.querySelector('a');
        const acs = a ? window.getComputedStyle(a) : null;
        return {
          liH: Math.round(li.getBoundingClientRect().height),
          liMb: lics.marginBottom,
          liPt: lics.paddingTop,
          liPb: lics.paddingBottom,
          aH: a ? Math.round(a.getBoundingClientRect().height) : null,
          aPt: acs?.paddingTop,
          aPb: acs?.paddingBottom,
          aLH: acs?.lineHeight,
          aFZ: acs?.fontSize,
          text: li.textContent.trim().slice(0, 30),
        };
      })() : null,
    };
  });
});

console.log('\nLists in panel:');
itemData.forEach(d => console.log(JSON.stringify(d, null, 2)));

await browser.close();
