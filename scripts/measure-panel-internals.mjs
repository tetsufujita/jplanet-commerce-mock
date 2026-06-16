/**
 * Playwright script to measure panel internals in the clone.
 * Run: node scripts/measure-panel-internals.mjs
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5180/stripe-jp';
const PANELS = ['サービス', 'ソリューション', '開発者', 'リソース'];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });

const results = {};

for (const label of PANELS) {
  // Hover trigger
  const btn = page.locator(`.sj-nav-item`).filter({ hasText: label });
  await btn.hover();
  // Wait for panel to fully open (stable height)
  await page.waitForTimeout(500);

  const data = await page.evaluate((lbl) => {
    const panel = document.querySelector('.sj-megamenu-panel');
    if (!panel) return { error: 'no panel' };

    const panelH = panel.getBoundingClientRect().height;

    // For products panel, measure main and aside
    const main = panel.querySelector('.sj-panel__main');
    const aside = panel.querySelector('.sj-panel__aside');
    const gcol = panel.querySelector('.sj-gcol');

    const cs = (el) => el ? window.getComputedStyle(el) : null;

    const measureEl = (el) => {
      if (!el) return null;
      const s = cs(el);
      return {
        h: el.getBoundingClientRect().height,
        pt: s.paddingTop,
        pb: s.paddingBottom,
        pl: s.paddingLeft,
        pr: s.paddingRight,
      };
    };

    // measure a plist item
    const firstLi = panel.querySelector('.sj-plist > li');
    const liStyle = firstLi ? cs(firstLi) : null;
    const firstPheading = panel.querySelector('.sj-pheading');
    const phStyle = firstPheading ? cs(firstPheading) : null;
    const firstPlink = panel.querySelector('.sj-plink');
    const plStyle = firstPlink ? cs(firstPlink) : null;
    const firstPdesc = panel.querySelector('.sj-pdesc');
    const pdStyle = firstPdesc ? cs(firstPdesc) : null;

    return {
      label: lbl,
      panelH,
      main: measureEl(main),
      aside: measureEl(aside),
      gcol: measureEl(gcol),
      li: liStyle ? { mb: liStyle.marginBottom } : null,
      pheading: phStyle ? { mb: phStyle.marginBottom, h: firstPheading.getBoundingClientRect().height } : null,
      plink: plStyle ? { lh: plStyle.lineHeight, fz: plStyle.fontSize } : null,
      pdesc: pdStyle ? { mt: pdStyle.marginTop, lh: pdStyle.lineHeight, fz: pdStyle.fontSize } : null,
    };
  }, label);

  results[label] = data;
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
}

// Also check all sj-gcol heights in each panel
for (const label of PANELS) {
  const btn = page.locator(`.sj-nav-item`).filter({ hasText: label });
  await btn.hover();
  await page.waitForTimeout(400);

  const colHeights = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll('.sj-gcol, .sj-panel__main > div'));
    return cols.map(c => ({
      cls: c.className,
      h: Math.round(c.getBoundingClientRect().height),
    }));
  });
  console.log(`\n${label} column heights:`, colHeights);
}

await browser.close();
