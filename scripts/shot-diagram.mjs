import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h3, p, figcaption, div')].find((h) => (h.textContent || '').startsWith('既存のシステムと接続'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 2000))
await page.screenshot({ path: '/tmp/clone-diagram.png' })
await browser.close()
console.log('saved')
