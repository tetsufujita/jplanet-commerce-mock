// pointer repel 検証: ①hover 時に粒子が曲がる ②離れると戻る
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((h) => (h.textContent || '').includes('グローバル'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 1500))

const canvas = await page.locator('#sj-time-of-day canvas').boundingBox()
console.log('canvas:', JSON.stringify(canvas))
const cx = canvas.x + canvas.width / 2
const cy = canvas.y + canvas.height / 2

const clip = { x: cx - 250, y: Math.max(0, cy - 200), width: 500, height: 400 }
const base = PNG.sync.read(await page.screenshot({ clip }))
await page.mouse.move(cx, cy, { steps: 10 })
await new Promise((r) => setTimeout(r, 1200))
const hover = PNG.sync.read(await page.screenshot({ clip }))
await page.screenshot({ path: 'design/reproductions/stripe-jp/shots/fix-pointer-hover.png', clip })
await page.mouse.move(canvas.x - 50, canvas.y - 50, { steps: 10 })
await new Promise((r) => setTimeout(r, 2500))
const after = PNG.sync.read(await page.screenshot({ clip }))

const dHover = pixelmatch(base.data, hover.data, null, clip.width, clip.height, { threshold: 0.1 })
const dAfter = pixelmatch(base.data, after.data, null, clip.width, clip.height, { threshold: 0.1 })
console.log(`hover diff: ${dHover} / after-leave diff: ${dAfter}`)
await browser.close()
