import { readFileSync } from 'node:fs'
import { PNG } from 'pngjs'

function sample(file, points) {
  const png = PNG.sync.read(readFileSync(file))
  const out = {}
  for (const [name, x, y] of points) {
    let r = 0, g = 0, b = 0, n = 0
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const i = (png.width * (y + dy) + (x + dx)) << 2
      r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++
    }
    out[name] = [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
  }
  return out
}

// 原本 f010: 720x385 前後。sky 右上 / ray 帯 / 中心核
console.log('ORIG', JSON.stringify(sample(
  'design/reproductions/stripe-jp/recordings/f-pointer/010.png',
  [['skyTop', 640, 75], ['skyMid', 60, 200], ['rayZone', 250, 140], ['core', 360, 330]],
)))
// クローン: 1440x900 viewport、canvas x104-1336 y374-892
console.log('CLONE', JSON.stringify(sample(
  '/tmp/clone-daytime-burst.png',
  [['skyTop', 1250, 400], ['skyMid', 150, 600], ['rayZone', 500, 560], ['core', 720, 860]],
)))
