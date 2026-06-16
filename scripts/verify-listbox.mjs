import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5180/stripe-jp', { waitUntil: 'networkidle', timeout: 30000 })
await page.evaluate(() => {
  const el = [...document.querySelectorAll('h2')].find((h) => (h.textContent || '').includes('グローバル'))
  if (el) el.scrollIntoView({ block: 'start' })
})
await new Promise((r) => setTimeout(r, 1200))
await page.locator('[role="combobox"][aria-controls="sj-time-of-day-listbox"]').click()
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: 'design/reproductions/stripe-jp/shots/fix-listbox-open.png', clip: { x: 900, y: 250, width: 540, height: 500 } })
// 日没 を選択 → テーマ変化 + 閉じることを確認
await page.locator('[role="option"]:has-text("日没")').click()
await new Promise((r) => setTimeout(r, 1500))
const state = await page.evaluate(() => ({
  open: !!document.getElementById('sj-time-of-day-listbox'),
  combobox: document.querySelector('[aria-controls="sj-time-of-day-listbox"]')?.getAttribute('data-value'),
}))
console.log(JSON.stringify(state))
await page.screenshot({ path: 'design/reproductions/stripe-jp/shots/fix-listbox-sunset.png' })
await browser.close()
