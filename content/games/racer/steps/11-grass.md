---
title: Striped grass
title_tr: Şeritli çimen
skills: [game.canvas]
---

# --goal--

When the grass has stripes too, speed is much easier to feel. Behind every segment we paint a band of grass across the
whole width: light green on light segments, dark green on dark ones.

# --goal-tr--

Çimen de şeritli olursa hız çok daha kolay hissedilir. Her parçanın **arkasına**, ekranın bütün eni boyunca bir çimen
şeridi boyayacağız: açık parçalarda açık yeşil, koyu parçalarda koyu yeşil.

# --code--

```js
const light = Math.floor(index / 3) % 2 === 0
ctx.fillStyle = light ? '#16a34a' : '#15803d'
ctx.fillRect(0, far.y, W, near.y - far.y + 1)
```

# --meaning--

- The band goes from the left edge to the right (`0` to `W`), from the segment's far edge (`far.y`) down to its near
  edge (`near.y`). The `+ 1` leaves no gap between bands.
- It is painted before the kerb and the road, so they come on top of it.

# --meaning-tr--

- `ctx.fillStyle = light ? '#16a34a' : '#15803d'` → açık parçada açık yeşil, koyuda koyu yeşil (zeminle aynı renk).
- `ctx.fillRect(0, far.y, W, near.y - far.y + 1)` → soldan (`0`) başlayıp tuvalin bütün eni (`W`) boyunca bir şerit.
  Parçanın uzak kenarının yüksekliğinden (`far.y`) başlar, yakın kenarına (`near.y`) kadar iner. `+ 1` şeritlerin
  arasında ince bir boşluk kalmasın diye.
- Şerit bordürden **önce** boyanıyor; bordür ve yol onun üstüne gelir.

# --task--

In the second loop, right under the `light` line, write the two grass lines.

# --task-tr--

İkinci döngüde, `light` satırının hemen **altına** (bordür satırının üstüne) iki çimen satırını yaz. **Çalıştır**:
çimen de yol gibi şeritli olmalı.

# --tests--

Every piece should have a band of grass behind it, light or dark.
tr: Her parçanın arkasında açık ya da koyu bir çimen şeridi olmalı.

```js
$.tick(1)
const fills = $.screen().filter((c) => c.op === 'fill').map((c) => c.fill)
const bands = $.rects().filter((r) => r.x === 0 && r.w === 480 && r.y > 160)
assert.strictEqual(bands.filter((r) => r.color === '#16a34a').length, fills.filter((f) => f === '#6b7280').length)
assert.strictEqual(bands.filter((r) => r.color === '#15803d').length, fills.filter((f) => f === '#646b75').length)
```

Each band should cover its piece of road from the far edge to the near edge.
tr: Her şerit, yol parçasını uzak kenarından yakın kenarına kadar kaplamalı.

```js
$.tick(1)
const far = project(0, -CAMERA_HEIGHT, 1000)
const near = project(0, -CAMERA_HEIGHT, 800)
const band = $.rects().find((r) => r.x === 0 && r.w === 480 && Math.abs(r.y - far.y) < 1e-9)
assert.isOk(band, 'a band should start at the far edge of the segment 800 units ahead')
assert.closeTo(band.h, near.y - far.y + 1, 1e-9)
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const SEG = 200 // length of one road segment, in world units
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view
const DRAW = 100 // segments drawn

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
}

function reset() {
  buildTrack()
  position = 0
}

// Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
function project(dx, dy, dz) {
  const scale = DEPTH / dz
  return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
}

function quad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x2 - w2, y2)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x1 + w1, y1)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)

  // Work out where every segment is on screen, from near to far.
  const base = Math.floor(position / SEG)
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) shown.push({ index, near, far })
  }

  // Paint from far to near, so nearer road covers what is behind it.
  for (let i = shown.length - 1; i >= 0; i--) {
    const { index, near, far } = shown[i]
    const light = Math.floor(index / 3) % 2 === 0
    ctx.fillStyle = light ? '#16a34a' : '#15803d'
    ctx.fillRect(0, far.y, W, near.y - far.y + 1)
    quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
    quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
    if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
