/**
 * Measure all 4 panels on live stripe.com/jp with full detail.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('https://stripe.com/jp', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);

const PANELS = [
  { testid: 'header-products-nav-item',   label: 'サービス' },
  { testid: 'header-solutions-nav-item',  label: 'ソリューション' },
  { testid: 'header-developers-nav-item', label: '開発者' },
  { testid: 'header-resources-nav-item',  label: 'リソース' },
];

for (const { testid, label } of PANELS) {
  await page.mouse.move(720, 500);
  await page.waitForTimeout(400);

  const btn = page.locator(`[data-testid="${testid}"] button`).first();
  await btn.hover();
  await page.waitForTimeout(800);

  const data = await page.evaluate(() => {
    // The viewport that holds the panel
    const vp = document.querySelector('.hds-navigation-menu__viewport');
    const vpH = vp ? Math.round(vp.getBoundingClientRect().height) : -1;

    // The navigation content element (the actual grid)
    const navContent = document.querySelector('[class*="navigation__content--"]') ??
                       document.querySelector('.hds-navigation-menu__content > *');
    if (!navContent) return { vpH, error: 'no navContent' };

    const navH = Math.round(navContent.getBoundingClientRect().height);
    const navCs = window.getComputedStyle(navContent);

    // Columns (direct children)
    const cols = Array.from(navContent.children);
    const colData = cols.map(col => {
      const ccs = window.getComputedStyle(col);
      const heading = col.querySelector('h3, [class*="heading"], [class*="label"]');
      const hcs = heading ? window.getComputedStyle(heading) : null;
      const ul = col.querySelector('ul, [class*="links"]');
      const items = ul ? Array.from(ul.querySelectorAll('li')) : [];
      const firstLi = items[0];
      const firstLics = firstLi ? window.getComputedStyle(firstLi) : null;
      const firstA = firstLi?.querySelector('a');
      const firstAcs = firstA ? window.getComputedStyle(firstA) : null;

      return {
        cls: col.className.slice(0, 60),
        colH: Math.round(col.getBoundingClientRect().height),
        pt: ccs.paddingTop,
        pb: ccs.paddingBottom,
        pl: ccs.paddingLeft,
        gap: ccs.gap || ccs.rowGap,
        headingText: heading?.textContent.trim().slice(0, 20),
        headingH: heading ? Math.round(heading.getBoundingClientRect().height) : null,
        headingMb: hcs?.marginBottom,
        headingFZ: hcs?.fontSize,
        headingFW: hcs?.fontWeight,
        headingLH: hcs?.lineHeight,
        itemCount: items.length,
        firstLiH: firstLi ? Math.round(firstLi.getBoundingClientRect().height) : null,
        firstLiMb: firstLics?.marginBottom,
        firstAH: firstA ? Math.round(firstA.getBoundingClientRect().height) : null,
        firstALH: firstAcs?.lineHeight,
        firstAFZ: firstAcs?.fontSize,
        firstAFW: firstAcs?.fontWeight,
      };
    });

    return {
      vpH,
      navH,
      navCls: navContent.className.slice(0, 80),
      colData,
    };
  });

  console.log(`\n=== ${label} ===`);
  console.log(`  viewport h: ${data.vpH}px  navContent h: ${data.navH}px`);
  console.log(`  cls: ${data.navCls}`);
  data.colData?.forEach((col, i) => {
    console.log(`  col${i}: h=${col.colH} pt=${col.pt} pb=${col.pb} pl=${col.pl} gap=${col.gap}`);
    console.log(`    heading: "${col.headingText}" h=${col.headingH} mb=${col.headingMb} fz=${col.headingFZ} fw=${col.headingFW} lh=${col.headingLH}`);
    console.log(`    items: ${col.itemCount} | firstLi: h=${col.firstLiH} mb=${col.firstLiMb} | firstA: h=${col.firstAH} lh=${col.firstALH} fz=${col.firstAFZ} fw=${col.firstAFW}`);
  });
}

await browser.close();
