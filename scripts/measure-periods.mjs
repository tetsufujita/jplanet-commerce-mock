// 原本の ambient 周期実測: 領域ごとに 20s 監視して変化イベント間隔を出す
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const url = process.argv[2] ?? 'https://stripe.com/jp'
const SPOTS = [
  { name: 'connect/locale帯', y: 1400, clip: { x: 80, y: 200, width: 1280, height: 600 } },
  { name: 'billing/odometer帯', y: 2200, clip: { x: 80, y: 100, width: 1280, height: 700 } },
]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3000))
for (const spot of SPOTS) {
  await page.evaluate((to) => window.scrollTo({ top: to }), spot.y)
  await new Promise((r) => setTimeout(r, 1500))
  let prev = null
  const events = []
  const t0 = Date.now()
  while (Date.now() - t0 < 20000) {
    const shot = PNG.sync.read(await page.screenshot({ clip: spot.clip }))
    if (prev) {
      const d = pixelmatch(prev.data, shot.data, null, spot.clip.width, spot.clip.height, { threshold: 0.1 })
      events.push({ t: Date.now() - t0, d })
    }
    prev = shot
    await new Promise((r) => setTimeout(r, 400))
  }
  const big = events.filter((e) => e.d > 3000).map((e) => Math.round(e.t / 100) / 10)
  const small = events.filter((e) => e.d > 200 && e.d <= 3000).length
  console.log(`${spot.name}: 大変化@[${big.join(',')}]s 小変化${small}回/20s 最大${Math.max(...events.map((e) => e.d))}`)
}
await browser.close()
