---
title: Your car
title_tr: Senin araban
skills: [game.canvas]
---

# --goal--

Time for a car. It always sits at the bottom middle of the screen; the road moves under it. A red body and two dark
wheels, painted after the road so they are on top.

# --goal-tr--

Sıra arabada. Araba ekranın **altında, ortada** sabit durur; hareket eden yoldur. Kırmızı bir gövde ve iki koyu
tekerlek yeter. Yoldan **sonra** boyanacak ki yolun üstünde görünsün.

# --code--

```js
// Your car.
ctx.fillStyle = '#ef4444'
ctx.fillRect(W / 2 - 34, H - 44, 68, 30)
ctx.fillStyle = '#111827'
ctx.fillRect(W / 2 - 38, H - 22, 14, 12)
ctx.fillRect(W / 2 + 24, H - 22, 14, 12)
```

# --meaning--

- The body is 68 by 30, centered (`W / 2 - 34`), 44 pixels above the bottom.
- The wheels are 14 by 12, one on each side, sticking out a little below the body.

# --meaning-tr--

- `ctx.fillRect(W / 2 - 34, H - 44, 68, 30)` → 68 piksel eninde, 30 piksel boyunda kırmızı gövde. `W / 2 - 34`
  gövdenin yarısı kadar sola kayarak **ortalar**; `H - 44` alttan 44 piksel yukarıda.
- İki `'#111827'` dikdörtgen → tekerlekler: 14 × 12, biri solda, biri sağda, gövdenin altından biraz taşar.
- Sonra boyanan öncekinin üstünü örttüğü için araba yolun **üstünde** görünür.

# --task--

In `draw`, after the `}` that closes the second loop, leave an empty line and write the car.

# --task-tr--

`draw` içinde, ikinci `for` döngüsünü kapatan `}`'nin altına bir boş satır bırak ve araba satırlarını yaz (`draw`'u
kapatan son `}`'nin üstüne). **Çalıştır**: ekranın altında kırmızı bir araba görmelisin.

# --tests--

A red car with two wheels should be drawn at the bottom middle.
tr: Altta ortada iki tekerlekli kırmızı bir araba çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#ef4444').map((r) => [r.x, r.y, r.w, r.h]), [[206, 276, 68, 30]])
assert.deepEqual($.rects('#111827').map((r) => [r.x, r.y, r.w, r.h]), [[202, 298, 14, 12], [264, 298, 14, 12]])
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
const MAX_SPEED = 120 // world units per frame

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is
let speed
const keys = {}

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
  speed = 0
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

  position += speed
  if (position >= trackLength) position -= trackLength
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

  // Your car.
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(W / 2 - 34, H - 44, 68, 30)
  ctx.fillStyle = '#111827'
  ctx.fillRect(W / 2 - 38, H - 22, 14, 12)
  ctx.fillRect(W / 2 + 24, H - 22, 14, 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
