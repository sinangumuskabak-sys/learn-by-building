---
title: No turning on the spot
title_tr: Duran araba dönmez
skills: [game.physics]
---

# --goal--

Real cars do not turn when they stand still. We multiply the steering by `ratio`, the speed compared with the top speed:
0 when standing, 1 at full speed. It is worked out at the very top of `update`, before the speed changes.

# --goal-tr--

Gerçek bir araba dururken dönmez. Direksiyonun etkisini `ratio` (oran) ile çarpacağız: hızın en yüksek hıza oranı.
Dururken `0`, tam hızda `1`, yarı hızda `0.5`.

Oranı `update`'in **en başında**, hız değişmeden önce hesaplıyoruz.

# --code--

```js
function update() {
  const ratio = speed / MAX_SPEED

  // Steering works better the faster you go.
  const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  playerX += steer * 0.04 * ratio
```

# --meaning--

- `ratio = speed / MAX_SPEED` goes from 0 (standing) to 1 (top speed).
- `steer * 0.04 * ratio`: no steering when standing, full steering at top speed.

# --meaning-tr--

- `const ratio = speed / MAX_SPEED` → dururken 0, 60 hızla 0.5, 120 hızla 1.
- `playerX += steer * 0.04 * ratio` → dururken `0.04 * 0 = 0`: hiç dönmez. Tam hızda yine 0.04.
- Yorum satırı kuralı hatırlatır: hız arttıkça direksiyon daha etkili.

# --task--

1. At the top of `update` write the `ratio` line and an empty line.
2. Above the `steer` line write the comment.
3. Multiply the steering by `ratio`.

# --task-tr--

1. `update` içinde en üste (`if (keys.ArrowUp)` satırının üstüne) `ratio` satırını yaz; altında bir boş satır kalsın.
2. `const steer = ...` satırının üstüne yorum satırını yaz.
3. `playerX += steer * 0.04` satırının sonuna `* ratio` ekle.
4. **Çalıştır**: dururken sağ-sol oklar artık bir şey yapmamalı.

# --hint--

`ratio` must be worked out before the speed changes, so it goes at the very top of `update`.

# --hint-tr--

`ratio` hız değişmeden **önce** hesaplanmalı; o yüzden `update`'in en başına yazılır.

# --tests--

Steering should do nothing when standing still and most at top speed.
tr: Direksiyon dururken hiçbir şey yapmamalı, en yüksek hızda en çok çevirmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(playerX, 0, 'standing still')
speed = MAX_SPEED
$.press('ArrowUp')
$.tick(10)
assert.closeTo(playerX, 0.4, 1e-9)
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
let playerX // -1 is the left edge of the road, 1 the right edge
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
  playerX = 0
  speed = 0
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
// Touch: hold anywhere to accelerate.
canvas.addEventListener('pointerdown', () => {
  keys.ArrowUp = true
})
function stopTouch() {
  keys.ArrowUp = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  const ratio = speed / MAX_SPEED

  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

  // Steering works better the faster you go.
  const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  playerX += steer * 0.04 * ratio
  playerX = Math.max(-2.5, Math.min(2.5, playerX))

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
    const near = project(-playerX * ROAD, -CAMERA_HEIGHT, z)
    const far = project(-playerX * ROAD, -CAMERA_HEIGHT, z + SEG)
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

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(Math.round((speed / MAX_SPEED) * 300) + ' km/h', 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
