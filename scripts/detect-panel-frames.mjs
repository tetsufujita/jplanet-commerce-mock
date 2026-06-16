// hover 録画の panel 開閉 frame 検出（領域の白さで判定）
import { readFileSync, readdirSync } from 'node:fs'
import { PNG } from 'pngjs'

function analyze(dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
  const states = []
  for (const f of files) {
    const png = PNG.sync.read(readFileSync(`${dir}/${f}`))
    let sum = 0, sat = 0, n = 0
    for (let y = 80; y < 180; y += 4) {
      for (let x = 150; x < 550; x += 4) {
        const i = (png.width * y + x) << 2
        const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2]
        sum += (r + g + b) / 3
        sat += Math.max(r, g, b) - Math.min(r, g, b)
        n++
      }
    }
    const bright = sum / n, satAvg = sat / n
    states.push({ open: bright > 230 && satAvg < 12 })
  }
  const segs = []
  let cur = null
  states.forEach((s, i) => {
    if (s.open && !cur) cur = { from: i + 1 }
    if (!s.open && cur) { cur.to = i; segs.push(cur); cur = null }
  })
  if (cur) { cur.to = states.length; segs.push(cur) }
  return segs
}

for (const [name, dir] of [
  ['original', 'design/reproductions/stripe-jp/recordings/f-hover'],
  ['clone', 'design/reproductions/stripe-jp/clone-rec/recordings/f-hover'],
]) {
  const segs = analyze(dir)
  console.log(`${name}: ${segs.map((s) => `${s.from}-${s.to}(${s.to - s.from + 1}f)`).join(' ')}`)
}
