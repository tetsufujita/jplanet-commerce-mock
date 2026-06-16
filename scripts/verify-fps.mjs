// §4 canvas の rAF フレーム間隔実測（globe = 最重 formation で 5s）
import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((h) => (h.textContent || '').includes('グローバル'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 1000))
const stats = await page.locator('button[aria-pressed]').all()
await stats[1].click() // globe（ghost pass 込み = 最重）
await new Promise((r) => setTimeout(r, 2000))
const m = await page.evaluate(async () => {
  const gaps = []
  let last = performance.now()
  await new Promise((done) => {
    const tick = (now) => {
      gaps.push(now - last)
      last = now
      if (gaps.length >= 300) { done(); return }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  gaps.sort((a, b) => a - b)
  const avg = gaps.reduce((s, v) => s + v, 0) / gaps.length
  return { avg: avg.toFixed(2), p95: gaps[Math.floor(gaps.length * 0.95)].toFixed(2), max: gaps[gaps.length - 1].toFixed(2) }
})
console.log(`frame gap avg=${m.avg}ms p95=${m.p95}ms max=${m.max}ms（60fps 基準 16.7ms）`)
await browser.close()
