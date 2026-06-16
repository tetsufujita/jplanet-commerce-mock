// Stripe JP 実測 — section 構造 / typography / 色 / transition / CSS animation
// 出力: design/reproductions/stripe-jp/stripe-jp-specs.json
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'

const OUT = 'design/reproductions/stripe-jp'
const URL = 'https://stripe.com/jp'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
await sleep(2500)

const pick = `(el) => {
  const s = getComputedStyle(el)
  return {
    fontFamily: s.fontFamily.split(',')[0],
    fontSize: s.fontSize, fontWeight: s.fontWeight,
    lineHeight: s.lineHeight, letterSpacing: s.letterSpacing,
    color: s.color, background: s.backgroundColor,
    borderRadius: s.borderRadius, padding: s.padding,
    transition: s.transition, transform: s.transform,
  }
}`

const specs = await page.evaluate((pickSrc) => {
  const pick = eval(pickSrc)
  const out = {}

  // sections: 上から順の主要ブロック
  out.sections = []
  document.querySelectorAll('main > *, body > div > main > *').forEach((el) => {
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    const h = el.querySelector('h1,h2,h3')
    if (r.height > 80)
      out.sections.push({
        tag: el.tagName, cls: (el.className || '').toString().slice(0, 80),
        top: Math.round(top), height: Math.round(r.height),
        heading: h ? h.textContent.trim().slice(0, 60) : null,
      })
  })

  // typography
  out.type = {}
  const h1 = document.querySelector('h1')
  if (h1) out.type.h1 = { text: h1.textContent.trim().slice(0, 80), ...pick(h1) }
  out.type.h2 = [...document.querySelectorAll('h2')].slice(0, 6).map((el) => ({
    text: el.textContent.trim().slice(0, 50), ...pick(el),
  }))
  const body = document.querySelector('main p')
  if (body) out.type.body = { ...pick(body) }

  // buttons / links
  out.buttons = [...document.querySelectorAll('a[class*="Button"], main a, header a')]
    .filter((el) => getComputedStyle(el).borderRadius !== '0px')
    .slice(0, 8)
    .map((el) => ({ text: el.textContent.trim().slice(0, 30), ...pick(el) }))

  // header / nav
  const header = document.querySelector('header')
  if (header) out.header = { ...pick(header), height: header.getBoundingClientRect().height }
  out.navItems = [...document.querySelectorAll('header nav a, header nav button')]
    .slice(0, 10)
    .map((el) => ({ text: el.textContent.trim().slice(0, 20), transition: getComputedStyle(el).transition }))

  // CSS animations（marquee 等）
  out.cssAnimations = []
  document.querySelectorAll('*').forEach((el) => {
    const s = getComputedStyle(el)
    if (s.animationName !== 'none' && out.cssAnimations.length < 20)
      out.cssAnimations.push({
        cls: (el.className || '').toString().slice(0, 60),
        name: s.animationName, duration: s.animationDuration,
        timing: s.animationTimingFunction, iteration: s.animationIterationCount,
      })
  })

  // canvas（hero gradient）
  out.canvases = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect()
    return { w: r.width, h: r.height, top: r.top + window.scrollY, cls: (c.className || '').toString().slice(0, 60) }
  })

  out.bodyBg = getComputedStyle(document.body).backgroundColor
  out.pageHeight = document.body.scrollHeight
  return out
}, pick)

// megamenu: 開いた状態の panel を実測
try {
  const nav = page.locator('header nav button, header nav a').first()
  await nav.hover()
  await sleep(1300)
  specs.megamenuOpen = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('header [class*="Popup"], header [class*="popup"], header [class*="Menu"], header div')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return r.height > 150 && r.top > 30 && r.top < 120 && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.5
      })
      .slice(0, 3)
    return candidates.map((el) => {
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        cls: (el.className || '').toString().slice(0, 80),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        background: s.backgroundColor, borderRadius: s.borderRadius,
        boxShadow: s.boxShadow.slice(0, 120),
        transition: s.transition.slice(0, 200), transform: s.transform,
      }
    })
  })
} catch (e) {
  specs.megamenuOpen = { error: String(e).slice(0, 200) }
}

writeFileSync(`${OUT}/stripe-jp-specs.json`, JSON.stringify(specs, null, 2))
console.log(`sections: ${specs.sections.length}, animations: ${specs.cssAnimations.length}, canvases: ${specs.canvases.length}`)
await browser.close()
