// Stripe JP 精密実測 — P1-P5 / P12 / P14（motion spec の要・精密測定）
// 出力: specs/02-interactions.json + specs/megamenu-dom/panel-*.html
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const OUT = 'design/reproductions/stripe-jp'
mkdirSync(`${OUT}/specs/megamenu-dom`, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const result = {}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://stripe.com/jp', { waitUntil: 'networkidle', timeout: 60000 })
await sleep(2500)
for (const sel of ['button:has-text("同意")', 'button:has-text("Accept")']) {
  try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 1000 })) { await b.click(); await sleep(400) } } catch {}
}

// ───────────────────── P2/P3: megamenu open/morph/close ─────────────────────
await page.evaluate(() => {
  window.__S = []
  window.__stop = false
  const header = document.querySelector('.navigation') || document.querySelector('header')
  const chevron = document.querySelector('.navigation__chevron-down-icon')
  const trigger0 = document.querySelector('.hds-navigation-menu__trigger')
  const loop = () => {
    if (window.__stop) return
    const panel = [...document.querySelectorAll('.hds-navigation-menu__content, .navigation-menu-content, header div, .navigation div')]
      .find((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.height > 120 && r.top > 30 && r.top < 140 && r.width > 300 && s.visibility !== 'hidden' })
    const rec = { t: performance.now() }
    if (panel) {
      const r = panel.getBoundingClientRect(); const s = getComputedStyle(panel)
      rec.panel = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: +s.opacity, clip: s.clipPath !== 'none' ? s.clipPath.slice(0, 60) : null, tf: s.transform !== 'none' ? s.transform.slice(0, 80) : null }
      if (!window.__panelMeta) window.__panelMeta = { cls: (panel.className || '').toString().slice(0, 100), transition: s.transition.slice(0, 300) }
    }
    if (header) rec.headerBg = getComputedStyle(header).backgroundColor
    if (chevron) rec.chev = getComputedStyle(chevron).transform
    if (trigger0) rec.trigOp = +getComputedStyle(trigger0).opacity + '/' + getComputedStyle(trigger0).color
    window.__S.push(rec)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
})

const triggers = await page.locator('.hds-navigation-menu__trigger').all()
result.triggerCount = triggers.length
const panelHtmls = []
for (let i = 0; i < Math.min(triggers.length, 4); i++) {
  await page.evaluate((idx) => { window.__S.push({ t: performance.now(), mark: `hover-${idx}` }) }, i)
  await triggers[i].hover()
  await sleep(1600)
  const html = await page.evaluate(() => {
    const panel = document.querySelector('.hds-navigation-menu__content, .navigation-menu-content')
    return panel ? panel.outerHTML : null
  })
  panelHtmls.push(html)
}
await page.evaluate(() => { window.__S.push({ t: performance.now(), mark: 'leave' }) })
await page.mouse.move(720, 560, { steps: 10 })
await sleep(1400)
result.megamenuSamples = await page.evaluate(() => { window.__stop = true; return { meta: window.__panelMeta, samples: window.__S } })
panelHtmls.forEach((h, i) => { if (h) writeFileSync(`${OUT}/specs/megamenu-dom/panel-${i}.html`, h) })
result.panelsSaved = panelHtmls.filter(Boolean).length

// ───────────────────── P12: GDP ticker（12 秒監視）─────────────────────
result.ticker = await page.evaluate(async () => {
  const el = document.querySelector('.hero-section__eyebrow-value')
  if (!el) return { error: 'not found' }
  const events = []
  let last = el.textContent
  const t0 = performance.now()
  const obs = new MutationObserver(() => {
    const incoming = el.querySelector('[class*="incoming"]')
    const outgoing = el.querySelector('[class*="outgoing"]')
    events.push({
      t: Math.round(performance.now() - t0), text: el.textContent.trim().slice(0, 30),
      incomingCls: incoming ? incoming.className.toString().slice(0, 110) : null,
      incomingTf: incoming ? getComputedStyle(incoming).transform : null,
      incomingTrans: incoming ? getComputedStyle(incoming).transition.slice(0, 150) : null,
      outgoingTf: outgoing ? getComputedStyle(outgoing).transform : null,
    })
  })
  obs.observe(el, { childList: true, subtree: true, characterData: true })
  await new Promise((r) => setTimeout(r, 12000))
  obs.disconnect()
  return { initial: last.trim().slice(0, 30), events: events.slice(0, 60) }
})

// ───────────────────── P14: logo marquee 速度 ─────────────────────
result.marquee = await page.evaluate(async () => {
  const el = document.querySelector('.logo-carousel__marquee')
  if (!el) return { error: 'not found' }
  const read = () => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41
  const t0 = performance.now(); const x0 = read()
  await new Promise((r) => setTimeout(r, 3000))
  const t1 = performance.now(); const x1 = read()
  return { pxPerSec: Math.abs((x1 - x0) / ((t1 - t0) / 1000)).toFixed(2), inlineStyle: (el.getAttribute('style') || '').slice(0, 120), width: el.getBoundingClientRect().width }
})

// ───────────────────── P1: hero wave 静的か動的か（pixel diff）─────────────────────
{
  const hero = await page.evaluate(() => {
    const img = document.querySelector('.hero-section-container img[aria-hidden="true"], .hero-section-container picture img')
    const r = img ? img.getBoundingClientRect() : null
    return { hasCanvas: !!document.querySelector('.hero-section-container canvas'), hasVideo: !!document.querySelector('.hero-section-container video'), imgRect: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null }
  })
  await page.evaluate(() => window.scrollTo({ top: 0 }))
  await sleep(500)
  const clip = { x: 900, y: 100, width: 500, height: 500 }
  const shot1 = PNG.sync.read(await page.screenshot({ clip }))
  await sleep(2500)
  const shot2 = PNG.sync.read(await page.screenshot({ clip }))
  const diff = pixelmatch(shot1.data, shot2.data, null, clip.width, clip.height, { threshold: 0.05 })
  result.heroWave = { ...hero, diffPixels: diff, diffPct: ((diff / (clip.width * clip.height)) * 100).toFixed(2) + '%' }
}

// ───────────────────── P4: header sticky 挙動 ─────────────────────
{
  const readHeader = () => page.evaluate(() => {
    const h = document.querySelector('.navigation') || document.querySelector('header')
    const r = h.getBoundingClientRect(); const s = getComputedStyle(h)
    return { top: Math.round(r.top), position: s.position, bg: s.backgroundColor, tf: s.transform === 'none' ? null : s.transform.slice(0, 60), visible: r.bottom > 0 }
  })
  result.headerSticky = { atTop: await readHeader() }
  await page.evaluate(() => window.scrollTo({ top: 3000 })); await sleep(800)
  result.headerSticky.at3000 = await readHeader()
  await page.evaluate(() => window.scrollBy({ top: -400 })); await sleep(900)
  result.headerSticky.afterScrollUp400 = await readHeader()
}

// ───────────────────── P5: bento カード hover ─────────────────────
{
  await page.evaluate(() => {
    const bento = document.querySelector('[class*="modular-solutions-bento"]')
    if (bento) bento.scrollIntoView({ block: 'center' })
  })
  await sleep(900)
  result.bento = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[class*="modular-solutions-bento__card"]')].filter((el) => !el.className.toString().includes('--hover'))
    return { cardCount: cards.length, classes: cards.slice(0, 8).map((c) => c.className.toString().slice(0, 90)) }
  })
  const card = page.locator('[class*="modular-solutions-bento__card"]:not([class*="--hover"])').first()
  if (await card.count()) {
    const before = await card.evaluate((el) => {
      const s = getComputedStyle(el)
      return { tf: s.transform, transition: s.transition.slice(0, 250), shiftX: s.getPropertyValue('--card-shift-x'), growX: s.getPropertyValue('--card-grow-x') }
    })
    await card.hover(); await sleep(900)
    const after = await card.evaluate((el) => {
      const s = getComputedStyle(el)
      const glyph = el.querySelector('[class*="hover"]') || el.parentElement.querySelector('[class*="--hover"]')
      return { tf: s.transform, shiftX: s.getPropertyValue('--card-shift-x'), glyphOp: glyph ? getComputedStyle(glyph).opacity : null, glyphCls: glyph ? glyph.className.toString().slice(0, 80) : null }
    })
    result.bento.before = before
    result.bento.after = after
  }
}

writeFileSync(`${OUT}/specs/02-interactions.json`, JSON.stringify(result, null, 2))
console.log(JSON.stringify({
  panels: result.panelsSaved, samples: result.megamenuSamples?.samples?.length,
  tickerEvents: result.ticker?.events?.length, marquee: result.marquee?.pxPerSec,
  heroDiff: result.heroWave?.diffPct, sticky3000: result.headerSticky?.at3000?.visible,
  stickyUp: result.headerSticky?.afterScrollUp400?.visible, bentoCards: result.bento?.cardCount,
}))
await browser.close()