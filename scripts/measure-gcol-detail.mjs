/**
 * Detailed per-column height measurement for all panels.
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5180/stripe-jp';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

async function measureDetailedPanel(label) {
  await page.mouse.move(720, 500);
  await page.waitForTimeout(400);
  const btn = page.locator('.sj-nav-item').filter({ hasText: label });
  await btn.hover();
  await page.waitForTimeout(800);

  return await page.evaluate((lbl) => {
    const content = document.querySelector('.sj-megamenu-content');
    if (!content) return { error: 'no content' };
    const panelBody = content.querySelector('.sj-panel');
    if (!panelBody) return [];

    const children = Array.from(panelBody.children);
    return children.map(c => {
      const cs = window.getComputedStyle(c);
      const heading = c.querySelector('.sj-pheading');
      const listItems = Array.from(c.querySelectorAll('.sj-plist > li'));
      const headingStyle = heading ? window.getComputedStyle(heading) : null;
      return {
        cls: [...c.classList].filter(x => x).join('.'),
        scrollH: c.scrollHeight,
        pt: cs.paddingTop,
        pb: cs.paddingBottom,
        headingMb: headingStyle?.marginBottom,
        headingH: heading?.offsetHeight,
        itemCount: listItems.length,
        items: listItems.map(li => {
          const lis = window.getComputedStyle(li);
          const link = li.querySelector('.sj-plink');
          const desc = li.querySelector('.sj-pdesc');
          return {
            liH: li.scrollHeight,
            liMb: lis.marginBottom,
            linkH: link?.offsetHeight,
            descH: desc?.offsetHeight,
          };
        }),
      };
    });
  }, label);
}

const panels = ['サービス', 'ソリューション', '開発者', 'リソース'];
const targets = { 'サービス': 654, 'ソリューション': 654, '開発者': 403, 'リソース': 307 };

for (const label of panels) {
  const cols = await measureDetailedPanel(label);
  console.log(`\n=== ${label} (target: ${targets[label]}) ===`);
  if (cols.error) { console.log(cols.error); continue; }

  for (const col of cols) {
    console.log(`  ${col.cls || '(main/aside)'}: scrollH=${col.scrollH} pt=${col.pt} pb=${col.pb} headingMb=${col.headingMb} headingH=${col.headingH} items=${col.itemCount}`);
    if (col.items.length > 0) {
      const firstItem = col.items[0];
      console.log(`    firstItem: liH=${firstItem.liH} liMb=${firstItem.liMb} linkH=${firstItem.linkH} descH=${firstItem.descH}`);
      // Sum up to verify
      const totalItemH = col.items.reduce((sum, it, idx) => {
        return sum + it.liH + (idx < col.items.length - 1 ? parseFloat(it.liMb) : 0);
      }, 0);
      console.log(`    totalItemH (sum): ~${Math.round(totalItemH)}`);
    }
  }
}

await browser.close();
