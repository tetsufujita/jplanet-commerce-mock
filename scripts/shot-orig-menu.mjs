import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://stripe.com/jp', { waitUntil: 'networkidle', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1500))
await page.locator('.hds-navigation-menu__trigger').first().hover()
await new Promise((r) => setTimeout(r, 1600))
await page.screenshot({ path: 'design/reproductions/stripe-jp/shots/orig-megamenu-0.png' })
// sessions card の DOM 位置と中身も取得
const info = await page.evaluate(() => {
  const cands = [...document.querySelectorAll('.hds-navigation-menu__content *')].filter((el) => /Sessions/.test(el.textContent || '') && el.children.length < 8)
  const el = cands[cands.length - 1]
  if (!el) return null
  const card = el.closest('a, div')
  const r = card.getBoundingClientRect()
  return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, html: card.outerHTML.slice(0, 1500) }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
