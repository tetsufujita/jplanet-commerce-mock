// megamenu サンプル分析 — open/morph/close の実測 duration 導出
import { readFileSync } from 'node:fs'

const d = JSON.parse(readFileSync('design/reproductions/stripe-jp/specs/02-interactions.json', 'utf8'))
const S = d.megamenuSamples.samples
console.log('panel meta:', JSON.stringify(d.megamenuSamples.meta))

const marks = S.filter((s) => s.mark).map((s) => ({ mark: s.mark, t: s.t }))
console.log('marks:', marks.map((m) => `${m.mark}@${Math.round(m.t)}`).join(' '))

function analyze(fromMark, toMark) {
  const t0 = marks.find((m) => m.mark === fromMark).t
  const t1 = toMark ? marks.find((m) => m.mark === toMark).t : Infinity
  const seg = S.filter((s) => !s.mark && s.t >= t0 && s.t < t1)
  const ps = seg.filter((s) => s.panel)
  const first = ps[0]
  if (!first) { console.log(`${fromMark}: panel never appeared`); return }
  let stable = null
  for (let i = 4; i < ps.length; i++) {
    const w5 = ps.slice(i - 4, i + 1)
    const hs = w5.map((s) => s.panel.h)
    const ws = w5.map((s) => s.panel.w)
    if (Math.max(...hs) - Math.min(...hs) <= 2 && Math.max(...ws) - Math.min(...ws) <= 2 && w5.every((s) => s.panel.op > 0.98)) { stable = w5[0]; break }
  }
  const fmt = (v) => (v == null ? '?' : v)
  console.log(
    `${fromMark}: appear+${Math.round(first.t - t0)}ms  ` +
    `h:${first.panel.h}->${fmt(stable && stable.panel.h)}  w:${first.panel.w}->${fmt(stable && stable.panel.w)}  ` +
    `stable@+${stable ? Math.round(stable.t - t0) : '?'}ms  ` +
    `op0:${first.panel.op}  clip:${first.panel.clip || 'none'}  tf:${first.panel.tf || 'none'}`,
  )
}
const order = ['hover-0', 'hover-1', 'hover-2', 'hover-3', 'leave']
order.slice(0, 4).forEach((m, i) => analyze(m, order[i + 1]))

const tl = marks.find((m) => m.mark === 'leave').t
const after = S.filter((s) => !s.mark && s.t >= tl)
const firstNoPanel = after.find((s) => !s.panel)
const lastPanel = [...after].reverse().find((s) => s.panel)
console.log(`close: panel gone @+${firstNoPanel ? Math.round(firstNoPanel.t - tl) : 'never'}ms  last op:${lastPanel ? lastPanel.panel.op : '-'}`)

// panel h の時系列（hover-0 の open カーブ → easing 推定用）
const t0 = marks[0].t
const curve = S.filter((s) => !s.mark && s.panel && s.t >= t0 && s.t < t0 + 700).map((s) => `${Math.round(s.t - t0)}:${s.panel.h}`)
console.log('open curve (t:h):', curve.join(' '))

console.log('headerBg:', [...new Set(S.filter((s) => s.headerBg).map((s) => s.headerBg))].join(' | '))
console.log('chevron:', [...new Set(S.filter((s) => s.chev).map((s) => s.chev))].slice(0, 4).join(' | '))
console.log('trigger:', [...new Set(S.filter((s) => s.trigOp).map((s) => s.trigOp))].slice(0, 6).join(' | '))
