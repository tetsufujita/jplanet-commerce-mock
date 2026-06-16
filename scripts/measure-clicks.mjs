// click 系モーションの transition 時間実測（原本 vs クローン）
// 方式: click → 120ms ごとに screenshot → 連続 diff が閾値超の時間幅 = transition duration
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const url = process.argv[2]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3000))

async function clickAndMeasure(name, scrollToText, clickSel) {
  try {
    const found = await page.evaluate((txt) => {
      const el = [...document.querySelectorAll('h2, h3')].find((h) => (h.textContent || '').includes(txt))
      if (!el) return false
      el.scrollIntoView({ block: 'start' })
      return true
    }, scrollToText)
    if (!found) { console.log(`${name}: section not found`); return }
    await new Promise((r) => setTimeout(r, 1500))
    const btn = page.locator(clickSel).first()
    if (!(await btn.count())) { console.log(`${name}: button not found`); return }
    // 静止確認 shot → click → burst
    const frames = [PNG.sync.read(await page.screenshot())]
    await btn.click()
    const times = [0]
    const t0 = Date.now()
    while (Date.now() - t0 < 1800) {
      frames.push(PNG.sync.read(await page.screenshot()))
      times.push(Date.now() - t0)
    }
    const diffs = []
    for (let i = 1; i < frames.length; i++) {
      diffs.push({ t: times[i], d: pixelmatch(frames[i - 1].data, frames[i].data, null, frames[0].width, frames[0].height, { threshold: 0.1 }) })
    }
    const active = diffs.filter((x) => x.d > 1500)
    const last = active.length ? active[active.length - 1].t : 0
    console.log(`${name}: 変化継続 ~${last}ms  (samples: ${diffs.map((x) => `${x.t}:${x.d}`).join(' ')})`)
  } catch (e) {
    console.log(`${name}: error ${String(e).slice(0, 120)}`)
  }
}

await clickAndMeasure('news-carousel-next', 'Stripe の最前線', 'button[aria-label="次のスライド"]')
await clickAndMeasure('testimonial-logo', 'SaaS プラットフォーム', '[class*="customer-btn"]:not([class*="active"]), [class*="customer"] button')
await browser.close()
