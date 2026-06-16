import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/preview/stats', { waitUntil: 'networkidle', timeout: 30000 })
await new Promise((r) => setTimeout(r, 2500))
const names = ['globe', 'burst', 'strands', 'wave']
const stats = await page.locator('button[aria-pressed]').all()
for (let i = 0; i < Math.min(4, stats.length); i++) {
  await stats[i].click()
  await new Promise((r) => setTimeout(r, 2300))
  await page.screenshot({ path: `/tmp/andes-stats-${names[i]}.png` })
}
await browser.close()
console.log('saved')
