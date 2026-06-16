import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://stripe.com/jp', { waitUntil: 'networkidle', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1500))
await page.locator('.hds-navigation-menu__trigger').first().hover()
await new Promise((r) => setTimeout(r, 1500))
const imgs = await page.evaluate(() => {
  const panel = document.querySelector('.hds-navigation-menu__content')
  if (!panel) return []
  return [...panel.querySelectorAll('img, [style*="background-image"]')].map((el) => {
    if (el.tagName === 'IMG') return el.currentSrc || el.src
    return getComputedStyle(el).backgroundImage.slice(0, 200)
  })
})
console.log(JSON.stringify(imgs, null, 1))
await browser.close()
