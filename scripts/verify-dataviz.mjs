// §4 dataviz 検証: 4 formation screenshot + 動作 burst + モーフ確認
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await new Promise((r) => setTimeout(r, 2000))
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((h) => (h.textContent || '').includes('グローバル'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 1500))

// 4 stat を順に click → 各形態を screenshot（モーフ完了 2s 待ち）
const stats = await page.locator('button[aria-pressed]').all()
console.log('stat buttons:', stats.length)
const names = ['burst', 'globe', 'wave', 'strands']
for (let i = 0; i < Math.min(4, stats.length); i++) {
  await stats[i].click()
  await new Promise((r) => setTimeout(r, 2300))
  await page.screenshot({ path: `design/reproductions/stripe-jp/shots/dataviz-${names[i]}.png` })
}

// 動作 burst（strands 形態で 6 連写）
const shots = []
for (let i = 0; i < 6; i++) {
  shots.push(PNG.sync.read(await page.screenshot()))
  await new Promise((r) => setTimeout(r, 500))
}
let total = 0
for (let i = 1; i < 6; i++) total += pixelmatch(shots[i - 1].data, shots[i].data, null, shots[0].width, shots[0].height, { threshold: 0.1 })
console.log('ambient motion (diff px/frame):', Math.round(total / 5))
await browser.close()
