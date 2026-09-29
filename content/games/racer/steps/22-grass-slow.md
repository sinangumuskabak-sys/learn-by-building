---
title: The grass is slow
title_tr: Çimen yavaşlatır
skills: [game.physics]
---

# --goal--

Driving off the road should cost you. On the grass (`playerX` below -1 or above 1) a car faster than a third of the top
speed loses another 2.5 every frame.

# --goal-tr--

Yoldan çıkmanın bir bedeli olmalı. Çimende (`playerX` -1'den küçük ya da 1'den büyükken) araba en yüksek hızının
**üçte birinden** hızlı gidemesin: o hızın üstündeyse her karede 2.5 daha kaybetsin.

# --code--

```js
else speed -= 0.4
const offRoad = Math.abs(playerX) > 1
if (offRoad && speed > MAX_SPEED / 3) speed -= 2.5 // grass slows you down
```

# --meaning--

- `Math.abs` drops the sign (`Math.abs(-1.5)` is `1.5`), so one question covers both sides of the road.
- `&&` means "and": off the road **and** faster than a third of the top speed.

# --meaning-tr--

- `Math.abs(playerX)` → sayının **işaretsiz** hâli: `Math.abs(-1.5)` → `1.5`. Böylece "sağa ya da sola 1'den fazla mı
  çıktım?" tek soruda sorulur. `offRoad` (yol dışı) cevabı tutar.
- `&&` → "**ve**": yoldan çıktıysan **ve** hızın 40'tan (120'nin üçte biri) fazlaysa.
- `speed -= 2.5` → gaz her karede +1.2 veriyor, çimen -2.5 alıyor: hız 40 civarına düşüp orada kalır.
- Bu satırlar hızı sıkıştıran `Math.max` satırından **önce**; hız yine eksiye düşemez.

# --task--

In `update`, under `else speed -= 0.4`, write the two grass lines.

# --task-tr--

`update` içinde `else speed -= 0.4` satırının hemen **altına** iki çimen satırını yaz. **Çalıştır**: tam hızda çimene
çık, göstergenin 100 km/h civarına düştüğünü gör.

# --tests--

The grass should slow the car down to a third of its top speed.
tr: Çimen arabayı en yüksek hızının üçte birine yavaşlatmalı.

```js
speed = MAX_SPEED
playerX = -1.5
$.press('ArrowUp')
$.tick(200)
assert.isBelow(speed, MAX_SPEED / 3 + 2)
assert.isAbove(speed, MAX_SPEED / 4)
playerX = 0
$.tick(100)
assert.strictEqual(speed, MAX_SPEED)
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
  const offRoad = Math.abs(playerX) > 1
  if (offRoad && speed > MAX_SPEED / 3) speed -= 2.5 // grass slows you down
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
