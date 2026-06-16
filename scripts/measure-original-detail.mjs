/**
 * Deep-measure all 4 megamenu panels on live stripe.com/jp.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('https://stripe.com/jp', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);

const PANELS = [
  { testid: 'header-products-nav-item',   label: 'サービス',     target: 654 },
  { testid: 'header-solutions-nav-item',  label: 'ソリューション', target: 654 },
  { testid: 'header-developers-nav-item', label: '開発者',       target: 403 },
  { testid: 'header-resources-nav-item',  label: 'リソース',     target: 307 },
];

for (const { testid, label, target } of PANELS) {
  // Move away first
  await page.mouse.move(720, 500);
  await page.waitForTimeout(400);

  const btn = page.locator(`[data-testid="${testid}"] button`).first();
  await btn.hover();
  await page.waitForTimeout(700);

  const data = await page.evaluate(() => {
    // Find the open megamenu panel (it has data-status="open" or is visible)
    // The viewport/background element
    const bg = document.querySelector('[class*="navigation-menu__background"]') ??
               document.querySelector('[class*="NavigationMenu"] [class*="viewport"]');

    const panelH = bg ? bg.getBoundingClientRect().height : -1;

    // Find visible li items in the megamenu area (y between 71 and 800)
    const visibleLis = Array.from(document.querySelectorAll('li')).filter(li => {
      const r = li.getBoundingClientRect();
      return r.height > 5 && r.top > 71 && r.top < 750 && r.width > 50;
    });

    // Get unique items (dedupe by text+position)
    const seen = new Set();
    const uniqueLis = visibleLis.filter(li => {
      const key = li.textContent.trim().slice(0, 20) + '|' + Math.round(li.getBoundingClientRect().top);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const sampleLis = uniqueLis.slice(0, 12);

    // Get the panel container dimensions
    const allPanelEls = document.querySelectorAll('[class*="navigation-menu__content"]');
    const openPanel = Array.from(allPanelEls).find(el => {
      const s = window.getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetHeight > 100;
    });

    const panelContent = openPanel;
    const contentH = panelContent ? panelContent.offsetHeight : -2;

    // Sample first few items
    const liData = sampleLis.map(li => {
      const cs = window.getComputedStyle(li);
      const a = li.querySelector('a, [role="link"]');
      const acs = a ? window.getComputedStyle(a) : null;
      const p = li.querySelector('p, span:not(:first-child)');
      const pcs = p ? window.getComputedStyle(p) : null;
      const r = li.getBoundingClientRect();
      const ar = a ? a.getBoundingClientRect() : null;
      return {
        liH: Math.round(r.height),
        liMb: cs.marginBottom,
        liPt: cs.paddingTop,
        liPb: cs.paddingBottom,
        text: li.textContent.trim().slice(0, 35),
        aH: ar ? Math.round(ar.height) : null,
        aPt: acs?.paddingTop,
        aPb: acs?.paddingBottom,
        aLH: acs?.lineHeight,
        aFZ: acs?.fontSize,
        aFW: acs?.fontWeight,
        descH: p ? Math.round(p.getBoundingClientRect().height) : null,
        descMT: pcs?.marginTop,
        descLH: pcs?.lineHeight,
        descFZ: pcs?.fontSize,
      };
    });

    // Also measure section headings
    const headings = Array.from(document.querySelectorAll('h3, [class*="heading"], [class*="label"]')).filter(h => {
      const r = h.getBoundingClientRect();
      return r.height > 0 && r.top > 71 && r.top < 750;
    }).slice(0, 4);

    const headingData = headings.map(h => {
      const cs = window.getComputedStyle(h);
      return {
        text: h.textContent.trim().slice(0, 30),
        h: Math.round(h.getBoundingClientRect().height),
        mb: cs.marginBottom,
        pb: cs.paddingBottom,
        fz: cs.fontSize,
        fw: cs.fontWeight,
        lh: cs.lineHeight,
      };
    });

    // Get panel wrapper (the actual white rounded box)
    const possiblePanels = document.querySelectorAll('[class*="navigation-menu__panel"], [class*="NavigationMenuPanel"], [class*="menu-panel"]');
    const mainPanelEl = Array.from(possiblePanels).find(el => el.offsetHeight > 100) ?? bg;
    const mainPanelH = mainPanelEl ? mainPanelEl.offsetHeight : panelH;

    return { liData, headingData, panelH: mainPanelH, contentH, bgH: panelH };
  });

  console.log(`\n=== ${label} (target: ${target}) ===`);
  console.log(`  panel height: ${data.panelH}px (bg: ${data.bgH}px, content: ${data.contentH}px)`);
  if (data.liData.length > 0) {
    const first = data.liData[0];
    console.log(`  first li: h=${first.liH} mb=${first.liMb} pt=${first.liPt} pb=${first.liPb}`);
    console.log(`    link: h=${first.aH} pt=${first.aPt} pb=${first.aPb} lh=${first.aLH} fz=${first.aFZ} fw=${first.aFW}`);
    if (first.descH) console.log(`    desc: h=${first.descH} mt=${first.descMT} lh=${first.descLH}`);
  }
  if (data.headingData.length > 0) {
    const h = data.headingData[0];
    console.log(`  first heading: h=${h.h} mb=${h.mb} pb=${h.pb} fz=${h.fz} fw=${h.fw} lh=${h.lh}`);
  }
  console.log('  all lis:');
  data.liData.forEach(li => {
    console.log(`    h=${li.liH} mb=${li.liMb} | "${li.text}"`);
  });
}

// Also check panel padding via the background div
await page.mouse.move(720, 500);
await page.waitForTimeout(300);
const btn = page.locator('[data-testid="header-solutions-nav-item"] button').first();
await btn.hover();
await page.waitForTimeout(700);

const containerData = await page.evaluate(() => {
  // Find the grid/flex container inside the open megamenu
  const allDivs = Array.from(document.querySelectorAll('div')).filter(d => {
    const r = d.getBoundingClientRect();
    return r.top > 71 && r.top < 90 && r.height > 100 && r.width > 300;
  });
  return allDivs.map(d => {
    const cs = window.getComputedStyle(d);
    return {
      cls: d.className.slice(0, 80),
      h: Math.round(d.getBoundingClientRect().height),
      pt: cs.paddingTop,
      pb: cs.paddingBottom,
      pl: cs.paddingLeft,
      pr: cs.paddingRight,
      display: cs.display,
    };
  }).slice(0, 5);
});
console.log('\n=== Container padding (solutions panel) ===');
containerData.forEach(d => console.log(d));

await browser.close();
