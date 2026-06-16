/**
 * Granular height verification for products panel col0.
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
  const main = panel?.querySelector('.sj-panel__main');
  if (!main) return { error: 'no main' };

  // Get col0 (first child of main)
  const col0 = main.children[0];
  if (!col0) return { error: 'no col0' };

  // Get all direct children of col0
  const children = Array.from(col0.children);
  const childData = children.map(c => ({
    tag: c.tagName,
    cls: c.className,
    h: Math.round(c.getBoundingClientRect().height),
    scrollH: c.scrollHeight,
    mb: window.getComputedStyle(c).marginBottom,
    mt: window.getComputedStyle(c).marginTop,
    display: window.getComputedStyle(c).display,
  }));

  // Also walk all grandchildren (li)
  const lis = Array.from(col0.querySelectorAll('.sj-plist > li'));
  const liDetails = lis.map((li, i) => {
    const lics = window.getComputedStyle(li);
    const a = li.querySelector('.sj-plink');
    const desc = li.querySelector('.sj-pdesc');
    return {
      i,
      liH: Math.round(li.getBoundingClientRect().height),
      liMb: lics.marginBottom,
      liDisplay: lics.display,
      aH: a ? Math.round(a.getBoundingClientRect().height) : null,
      aDisplay: a ? window.getComputedStyle(a).display : null,
      descH: desc ? Math.round(desc.getBoundingClientRect().height) : null,
      descMt: desc ? window.getComputedStyle(desc).marginTop : null,
    };
  });

  // Sum all heights manually
  let runningSum = 0;
  const rects = lis.map(li => {
    const r = li.getBoundingClientRect();
    const cs = window.getComputedStyle(li);
    const mb = parseFloat(cs.marginBottom);
    const top = r.top;
    runningSum += r.height + mb;
    return { top: Math.round(r.top), h: Math.round(r.height), mb };
  });

  // Find the position of first li relative to col0 top
  const col0Top = col0.getBoundingClientRect().top;
  const firstLiTop = lis[0]?.getBoundingClientRect().top ?? col0Top;
  const lastLiBottom = lis[lis.length-1]?.getBoundingClientRect().bottom ?? col0Top;

  return {
    col0H: Math.round(col0.getBoundingClientRect().height),
    col0Top: Math.round(col0Top),
    children: childData,
    firstLiRelTop: Math.round(firstLiTop - col0Top),
    lastLiRelBottom: Math.round(lastLiBottom - col0Top),
    liDetails: liDetails.slice(0, 5).concat(liDetails.slice(-2)),
    liCount: liDetails.length,
    rects: rects.slice(0, 3),
  };
});

console.log(JSON.stringify(data, null, 2));

await browser.close();
