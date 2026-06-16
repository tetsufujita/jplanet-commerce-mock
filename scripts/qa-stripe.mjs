// Stripe JP 再現 QA — クローンのスクリーンショット + section 高さ + megamenu 動作確認
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'design/reproductions/stripe-jp/shots'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await sleep(2500)

// console error 収集
const errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))

// section 高さ実測（クローン）
const sections = await page.evaluate(() => {
  const out = []
  document.querySelectorAll('main > *').forEach((el) => {
    const r = el.getBoundingClientRect()
    const h = el.querySelector('h1,h2,h3')
    out.push({ top: Math.round(r.top + window.scrollY), height: Math.round(r.height), heading: h ? h.textContent.trim().slice(0, 40) : el.tagName })
  })
  return { sections: out, pageHeight: document.body.scrollHeight }
})

// fullpage screenshot
await page.screenshot({ path: `${OUT}/clone-fullpage.png`, fullPage: true })

// hero viewport
await page.screenshot({ path: `${OUT}/clone-hero.png` })

// megamenu: 各 trigger を hover して screenshot
const triggers = await page.locator('header button, nav button').all()
let menuShots = 0
for (let i = 0; i < Math.min(triggers.length, 4); i++) {
  try {
    await triggers[i].hover()
    await sleep(900)
    await page.screenshot({ path: `${OUT}/clone-megamenu-${i}.png` })
    menuShots++
  } catch { /* skip */ }
}
await page.mouse.move(720, 600); await sleep(600)

writeFileSync('design/reproductions/stripe-jp/clone-measure.json', JSON.stringify({ ...sections, errors }, null, 2))
console.log(JSON.stringify({ pageHeight: sections.pageHeight, sectionCount: sections.sections.length, menuShots, errors: errors.length }))
console.log(sections.sections.map((s) => `${s.top}\t${s.height}\t${s.heading}`).join('\n'))
await browser.close()