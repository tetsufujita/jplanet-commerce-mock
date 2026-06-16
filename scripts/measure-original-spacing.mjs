/**
 * Scrape the live stripe.com/jp megamenu to get exact computed styles.
 * Only reads — no writes to stripe.com.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

try {
  await page.goto('https://stripe.com/jp', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Hover サービス
  const trigger = page.locator('[data-testid="header-products-nav-item"] button').first();
  await trigger.hover();
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    // Find the megamenu panel
    const menu = document.querySelector('[id^=":"]') ??
                 document.querySelector('.hds-navigation-menu__viewport') ??
                 document.querySelector('[class*="navigation-menu__viewport"]');

    // Try to find the content panel
    const panels = document.querySelectorAll('[class*="navigation-menu"]');
    const results = [];

    // Measure all visible li elements in the open panel
    const allLi = document.querySelectorAll('[role="listitem"], li');
    const visLi = Array.from(allLi).filter(li => {
      const r = li.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top > 60 && r.top < 800;
    });

    if (visLi.length > 0) {
      const sample = visLi.slice(0, 5);
      return sample.map(li => {
        const cs = window.getComputedStyle(li);
        const a = li.querySelector('a');
        const acs = a ? window.getComputedStyle(a) : null;
        const desc = li.querySelector('p');
        const dcs = desc ? window.getComputedStyle(desc) : null;
        return {
          liH: li.getBoundingClientRect().height,
          liMb: cs.marginBottom,
          linkText: a?.textContent?.trim().slice(0, 30),
          linkLH: acs?.lineHeight,
          linkFZ: acs?.fontSize,
          descMT: dcs?.marginTop,
          descH: desc?.getBoundingClientRect().height,
        };
      });
    }
    return { panels: Array.from(panels).map(p => p.className).slice(0, 5) };
  });

  console.log('サービス panel items:');
  console.log(JSON.stringify(data, null, 2));

} catch (e) {
  console.log('Could not load stripe.com/jp:', e.message);
  console.log('Falling back to screenshot pixel analysis...');
}

await browser.close();
