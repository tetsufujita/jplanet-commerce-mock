// Stripe JP 再現用 — 画面録画 + DOM/インベントリ採取
// 出力: design/reproductions/stripe-jp/recordings/{clone-scroll,clone-hover}.webm
//       design/reproductions/stripe-jp/{clone-dom.html,clone-fullpage-rec.png,clone-hover-inventory.json}
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'design/reproductions/stripe-jp'
const REC = `${OUT}/recordings`
mkdirSync(REC, { recursive: true })

const VIEWPORT = { width: 1440, height: 900 }
const URL = 'http://localhost:5180/stripe-jp'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function dismissCookies(page) {
  for (const sel of [
    'button:has-text("同意")',
    'button:has-text("すべて受け入れる")',
    'button:has-text("Accept")',
    '[data-js-target="CookieSettingsNotification.acceptButton"]',
  ]) {
    try {
      const btn = page.locator(sel).first()
      if (await btn.isVisible({ timeout: 1500 })) {
        await btn.click()
        await sleep(500)
        return
      }
    } catch { /* not present */ }
  }
}

async function newRecordingPage(browser) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: REC, size: VIEWPORT },
    locale: 'ja-JP',
  })
  const page = await context.newPage()
  return { context, page }
}

const browser = await chromium.launch()

// ── 1. スクロール録画（ページ全体のモーション）─────────────────
{
  const { context, page } = await newRecordingPage(browser)
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
  await dismissCookies(page)
  await sleep(3000) // hero の初期アニメを収録

  const total = await page.evaluate(() => document.body.scrollHeight)
  console.log(`page height: ${total}px`)
  for (let y = 0; y < total; y += 300) {
    await page.evaluate((to) => window.scrollTo({ top: to }), y)
    await sleep(280)
  }
  await sleep(2000)

  // DOM とフルページ screenshot もこのページで採取
  const html = await page.content()
  writeFileSync(`${OUT}/clone-dom.html`, html)
  await page.evaluate(() => window.scrollTo({ top: 0 }))
  await sleep(1000)
  await page.screenshot({ path: `${OUT}/clone-fullpage-rec.png`, fullPage: true })

  const video = page.video()
  await context.close()
  await video.saveAs(`${REC}/clone-scroll.webm`)
  console.log('clone-scroll.webm saved')
}

// ── 2. hover / マウス操作録画（megamenu・ボタン・カード）────────
{
  const { context, page } = await newRecordingPage(browser)
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
  await dismissCookies(page)
  await sleep(2000)

  // header nav の hover 対象を列挙
  const navItems = await page.evaluate(() => {
    const items = []
    document
      .querySelectorAll('header a, header button, nav a, nav button')
      .forEach((el) => {
        const r = el.getBoundingClientRect()
        const text = (el.textContent || '').trim().slice(0, 40)
        if (r.width > 0 && r.height > 0 && r.top < 120 && text)
          items.push({ text, x: r.x + r.width / 2, y: r.y + r.height / 2 })
      })
    return items
  })
  console.log('nav items:', navItems.map((i) => i.text).join(' | '))

  // 各 nav item を hover → megamenu 展開を収録
  for (const item of navItems) {
    await page.mouse.move(item.x, item.y, { steps: 12 })
    await sleep(1800)
  }
  await page.mouse.move(720, 500, { steps: 12 }) // メニューを閉じる
  await sleep(1200)

  // 本文の hover 対象（CTA ボタン・カード）: 上から 6000px ぶんを巡回
  const hoverTargets = await page.evaluate(() => {
    const out = []
    const seen = new Set()
    document
      .querySelectorAll('main a, main button, [class*="Card"], [class*="card"]')
      .forEach((el) => {
        const r = el.getBoundingClientRect()
        const y = r.top + window.scrollY
        const text = (el.textContent || '').trim().slice(0, 50)
        const key = `${Math.round(y / 50)}:${text}`
        if (r.width > 40 && r.height > 20 && y < 6000 && text && !seen.has(key)) {
          seen.add(key)
          out.push({ text, absY: y, x: r.x + r.width / 2, relY: r.height / 2 })
        }
      })
    return out.slice(0, 25)
  })

  for (const t of hoverTargets) {
    const scrollTo = Math.max(0, t.absY - 400)
    await page.evaluate((to) => window.scrollTo({ top: to }), scrollTo)
    await sleep(600)
    const yInViewport = t.absY - scrollTo + t.relY
    if (yInViewport > 0 && yInViewport < 880) {
      await page.mouse.move(t.x, yInViewport, { steps: 8 })
      await sleep(1100)
    }
  }

  writeFileSync(
    `${OUT}/clone-hover-inventory.json`,
    JSON.stringify({ navItems, hoverTargets }, null, 2),
  )

  const video = page.video()
  await context.close()
  await video.saveAs(`${REC}/clone-hover.webm`)
  console.log('clone-hover.webm saved')
}

await browser.close()
console.log('done')
