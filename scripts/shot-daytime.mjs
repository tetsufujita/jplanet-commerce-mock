import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((h) => (h.textContent || '').includes('グローバル'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 1000))
// 時間帯を日中へ
await page.locator('[role="combobox"][aria-controls="sj-time-of-day-listbox"]').click()
await new Promise((r) => setTimeout(r, 300))
await page.locator('[role="option"]:has-text("日中")').click()
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: '/tmp/clone-daytime-burst.png' })
await browser.close()
console.log('saved')
