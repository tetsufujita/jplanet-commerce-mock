/**
 * Measure each panel by hovering and waiting for full stable height.
 * Reports both the panelBody scrollHeight and the individual column content.
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5180/stripe-jp';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

async function measurePanel(label) {
  // Move away first to reset
  await page.mouse.move(720, 500);
  await page.waitForTimeout(500);

  const btn = page.locator('.sj-nav-item').filter({ hasText: label });
  await btn.hover();
  // wait generously for full open + stable
  await page.waitForTimeout(800);

  return await page.evaluate((lbl) => {
    const content = document.querySelector('.sj-megamenu-content');
    if (!content) return { error: 'no content' };

    const panelBody = content.querySelector('.sj-panel');
    if (!panelBody) return { error: 'no panel body' };

    // scrollHeight gives the natural full height
    const contentSH = content.scrollHeight;
    const panelSH = panelBody.scrollHeight;

    // Tallest child
    const children = Array.from(panelBody.children);
    const childHeights = children.map(c => ({
      cls: [...c.classList].join('.'),
      scrollH: c.scrollHeight,
    }));

    // Measure list items in tallest column
    const tallestCol = children.reduce((a, b) => a.scrollHeight > b.scrollHeight ? a : b, children[0]);
    const listItems = Array.from(tallestCol.querySelectorAll('.sj-plist > li'));
    const firstItem = listItems[0];
    const firstItemStyle = firstItem ? window.getComputedStyle(firstItem) : null;
    const firstPdesc = tallestCol.querySelector('.sj-pdesc');
    const firstPdescStyle = firstPdesc ? window.getComputedStyle(firstPdesc) : null;

    return {
      label: lbl,
      contentScrollH: contentSH,
      panelBodyScrollH: panelSH,
      children: childHeights,
      tallestColCls: [...tallestCol.classList].join('.'),
      itemCount: listItems.length,
      firstLiMb: firstItemStyle?.marginBottom,
      hasDesc: !!firstPdesc,
      pdescMt: firstPdescStyle?.marginTop,
    };
  }, label);
}

const panels = ['サービス', 'ソリューション', '開発者', 'リソース'];
const targets = { 'サービス': 654, 'ソリューション': 654, '開発者': 403, 'リソース': 307 };

for (const label of panels) {
  const data = await measurePanel(label);
  const target = targets[label];
  const diff = data.contentScrollH - target;
  console.log(`\n=== ${label} (target: ${target}, clone: ${data.contentScrollH}, diff: ${diff > 0 ? '+' : ''}${diff}) ===`);
  console.log('children:', data.children);
  console.log('itemCount in tallest col:', data.itemCount, '| hasDesc:', data.hasDesc);
  console.log('firstLiMb:', data.firstLiMb, '| pdescMt:', data.pdescMt);
}

await browser.close();
