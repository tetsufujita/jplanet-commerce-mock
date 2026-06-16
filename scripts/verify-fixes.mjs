// 修正検証: ①megamenu open 中の サインイン 可読性 ②platform burst 再計測
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await new Promise((r) => setTimeout(r, 2500))

// ① megamenu open → サインイン 領域 screenshot
await page.locator('header nav button').first().hover()
await new Promise((r) => setTimeout(r, 900))
await page.screenshot({ path: 'design/reproductions/stripe-jp/shots/fix-signin-open.png', clip: { x: 1050, y: 0, width: 390, height: 60 } })
await page.mouse.move(720, 700); await new Promise((r) => setTimeout(r, 800))

// ② platform burst（y1400 / y2200）
const spots = [{ name: 'bento+locale', y: 1400 }, { name: 'odometer/glow', y: 2200 }]
for (const spot of spots) {
  await page.evaluate((to) => window.scrollTo({ top: to }), spot.y)
  await new Promise((r) => setTimeout(r, 1200))
  const shots = []
  for (let i = 0; i < 6; i++) {
    shots.push(PNG.sync.read(await page.screenshot()))
    await new Promise((r) => setTimeout(r, 500))
  }
  let total = 0
  for (let i = 1; i < 6; i++) total += pixelmatch(shots[i - 1].data, shots[i].data, null, shots[0].width, shots[0].height, { threshold: 0.1 })
  console.log(`${spot.name}: ${Math.round(total / 5)} (原本: ${spot.name === 'bento+locale' ? 2644 : 927})`)
}
await browser.close()
