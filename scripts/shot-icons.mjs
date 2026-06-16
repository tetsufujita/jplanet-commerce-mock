import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h4')].find((h) => h.textContent.includes('市場投入'))
  if (el) el.scrollIntoView({ block: 'center' })
})
await new Promise((r) => setTimeout(r, 1200))
await page.screenshot({ path: 'design/reproductions/stripe-jp/shots/fix-charm-icons.png', clip: { x: 80, y: 300, width: 1280, height: 300 } })
await browser.close()
console.log('saved')
