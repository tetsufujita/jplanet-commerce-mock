import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://stripe.com/jp', { waitUntil: 'networkidle', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2000))
const m = await page.evaluate(() => {
  const g = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), pt: s.paddingTop, pb: s.paddingBottom, mt: s.marginTop, mb: s.marginBottom }
  }
  return {
    section: g('.hero-section-container'),
    eyebrow: g('.hero-section__eyebrow'),
    title: g('.hero-section__title-main'),
    actions: g('.hero-section__actions'),
    logoCarousel: g('.logo-carousel__marquee-container'),
    logoSection: g('[class*="logo-carousel"]'),
    cta: (() => { const el = document.querySelector('.hero-section__actions a'); if (!el) return null; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { h: Math.round(r.height), pad: s.padding, fs: s.fontSize } })(),
    waveImg: (() => { const el = document.querySelector('.hero-section-container img[aria-hidden="true"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top + window.scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) } })(),
  }
})
console.log(JSON.stringify(m, null, 1))
await browser.close()
