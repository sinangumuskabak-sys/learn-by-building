---
title: Two tanks
title_tr: İki tank
skills: [game.canvas, prog.arrays]
---

# --goal--

Two tanks: yours (blue) on the left, the computer's (red) on the right. Each remembers where it is, its health, and how
it aims. They sit on the ground: `groundAt(x)` tells the ground's height at any x, even between or outside columns.

# --goal-tr--

İki tank: seninki (mavi) solda, bilgisayarınki (kırmızı) sağda. Her tank yerini, **canını** (`hp`) ve nasıl nişan
aldığını (`angle` açı, `power` güç) hatırlıyor. Zeminin üstünde duruyorlar: `groundAt(x)` herhangi bir x'te zeminin
yüksekliğini söylüyor; sütunların arasında ya da tuvalin dışında bile. `reset` yeni bir oyun kuruyor.

# --code--

```js
let tanks // [you, the computer]: { x, y, hp, angle, power, color }

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
}

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
  }

reset()
```

# --meaning--

- `groundAt` rounds x to a column and keeps it on the canvas, so any x is safe.
- A tank's `x, y` is the middle of its bottom edge, so it is drawn 10 pixels to each side and 8 up.
- The angles point up-right (−45°) for you and up-left (−135°) for the computer: up is negative on a canvas.

# --meaning-tr--

- `groundAt(x)` → x'i en yakın sütuna yuvarlar (`Math.round`) ve 0 ile W − 1 arasında tutar: her x güvenli.
- Tankın `x, y`'si **alt kenarının ortası**: 20×8'lik gövde 10 piksel sola ve 8 piksel yukarı çizilir.
- `y: 0` → önce 0; hemen alttaki satır her tankı zemine oturtur.
- `angle: -Math.PI / 4` → −45°: sağ üste. `(-3 * Math.PI) / 4` → −135°: sol üste. Tuvalde yukarı **eksi** yön.
- `reset()` → en alttaki `makeGround()` yerine: zemini de o kuruyor.

# --task--

1. Under `ground`, write `tanks`.
2. Under `makeGround`, write `groundAt` and `reset`.
3. At the end of `draw`, draw the tanks; at the bottom, call `reset()` instead of `makeGround()`.

# --task-tr--

1. `let ground` satırının altına `tanks` yaz.
2. `makeGround`'un altına `groundAt` ve `reset` yaz.
3. `draw`'ın sonuna tankları çizen döngüyü yaz; en alttaki `makeGround()` satırını `reset()` yap. **Çalıştır**.

# --tests--

The tanks should sit on the ground, and groundAt should stay on the canvas.
tr: Tanklar zeminde durmalı, groundAt tuvalde kalmalı.

```js
for (const t of tanks) assert.strictEqual(t.y, groundAt(t.x), 'the tanks sit on the ground')
assert.strictEqual(tanks[0].x, 70)
assert.strictEqual(tanks[1].x, W - 70)
assert.strictEqual(groundAt(-5), ground[0], 'off the left edge: the first column')
assert.strictEqual(groundAt(9999), ground[W - 1])
assert.strictEqual(groundAt(10.4), ground[10])
assert.deepInclude($.rects('#2563eb'), { x: 60, y: tanks[0].y - 8, w: 20, h: 8, color: '#2563eb' })
assert.lengthOf($.rects('#dc2626'), 1)
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

let ground // ground[x]: the y of the surface in column x
let tanks // [you, the computer]: { x, y, hp, angle, power, color }

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
  }
}

reset()
draw()
```
