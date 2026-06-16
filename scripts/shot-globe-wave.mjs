import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((h) => (h.textContent || '').includes('グローバル'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 1000))
// sunrise（初期値）のまま globe へ
const stats = await page.locator('button[aria-pressed]').all()
await stats[1].click()
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: '/tmp/clone-globe-sunrise.png' })
// wave へ
await stats[2].click()
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: '/tmp/clone-wave-sunrise.png' })
await browser.close()
console.log('saved')
