// 原本 vs クローン: section ごとに静止連写 → pixel-diff で「動いているか」比較
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const SPOTS = [
  { name: 'hero(ticker+marquee)', y: 0 },
  { name: 'platform(bento+locale)', y: 1400 },
  { name: 'platform(odometer/glow)', y: 2200 },
  { name: 'support(chat-banner)', y: 3000 },
  { name: 'usecases(testimonial)', y: 5200 },
  { name: 'usecases(issuing)', y: 7600 },
  { name: 'devs(dashflow+flip)', y: 9400 },
  { name: 'news(carousel)', y: 11600 },
]
const N = 6, INTERVAL = 500

async function burst(url, label) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 3000))
  const out = {}
  for (const spot of SPOTS) {
    await page.evaluate((to) => window.scrollTo({ top: to }), spot.y)
    await new Promise((r) => setTimeout(r, 1200))
    const shots = []
    for (let i = 0; i < N; i++) {
      shots.push(PNG.sync.read(await page.screenshot()))
      await new Promise((r) => setTimeout(r, INTERVAL))
    }
    let total = 0
    for (let i = 1; i < N; i++) {
      total += pixelmatch(shots[i - 1].data, shots[i].data, null, shots[0].width, shots[0].height, { threshold: 0.1 })
    }
    out[spot.name] = Math.round(total / (N - 1))
  }
  await browser.close()
  console.log(label, JSON.stringify(out, null, 1))
  return out
}

const orig = await burst('https://stripe.com/jp', 'ORIGINAL')
const clone = await burst('http://localhost:5180/stripe-jp', 'CLONE')
console.log('--- 比較（平均diffピクセル/frame） ---')
for (const k of Object.keys(orig)) {
  const o = orig[k], c = clone[k]
  const verdict = (o > 500) === (c > 500) ? 'OK' : '★MISMATCH'
  console.log(`${k}: orig=${o} clone=${c} ${verdict}`)
}
