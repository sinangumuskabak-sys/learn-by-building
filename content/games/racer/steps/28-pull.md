---
title: Curves pull you outwards
title_tr: Viraj dışarı çeker
skills: [game.physics]
---

# --goal--

Like a real car, a curve pushes you outwards, and much harder the faster you go: with the speed **squared**. In gentle
curves steering wins easily; in the sharpest ones at top speed the pull is stronger, and you must lift off the gas.

# --goal-tr--

Gerçek bir arabada olduğu gibi viraj seni **dışa doğru** iter. Bu itme hızla birlikte değil, hızın **karesiyle** büyür
(`ratio * ratio`): yarı hızda itme dörtte birine düşer.

Sonuç: hafif virajlarda direksiyon kolayca kazanır. En keskin virajlarda tam hızda ise itme direksiyondan güçlüdür; gazı
biraz bırakman gerekir. Yarış çizgisi öğrenmeye değer hâle gelir.

# --code--

```js
// Steering works better the faster you go; curves push you outwards.
const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
playerX += steer * 0.04 * ratio
playerX -= segmentAt(position + PLAYER_Z).curve * 0.012 * ratio * ratio
```

# --meaning--

- The curve under the car times `0.012` times `ratio` squared is subtracted from `playerX`: a right curve (positive)
  pushes you left.
- At top speed a curve of 4 pulls 0.048 per frame, more than the 0.04 of full steering.

# --meaning-tr--

- `segmentAt(position + PLAYER_Z).curve` → arabanın altındaki parçanın kıvrımı.
- `* 0.012 * ratio * ratio` → itmenin gücü. `ratio * ratio` hızın karesi: tam hızda 1, yarı hızda 0.25.
- `playerX -= ...` → **çıkarıyoruz**: sağ viraj (artı kıvrım) arabayı **sola**, yani dışa iter; sol viraj sağa.
- Tam hızda kıvrımı 4 olan virajda itme 4 × 0.012 = **0.048**, direksiyonun en fazlası 0.04. Direksiyon yetmez; yavaşla.
- Bu satır, `playerX`'i sınırlayan `Math.max` satırının **üstünde** olmalı.

# --task--

Add `; curves push you outwards` to the comment, and under the steering line write the pull line.

# --task-tr--

1. `// Steering works better the faster you go.` yorumunu `// Steering works better the faster you go; curves push you
   outwards.` yap (sadece yorum).
2. `playerX += steer * 0.04 * ratio` satırının **altına** itme satırını yaz.
3. **Çalıştır**, tam hızla virajlara gir: araba dışa kaymalı, direksiyonla karşı koymalısın.

# --predict--

At top speed in the sharpest right curve (curve 4) you hold the right arrow. What happens?
- [ ] You stay in the middle of the road
- [x] You still drift to the left, slowly
  Steering gives +0.04 a frame, the curve takes 0.048: the curve wins by a little.
- [ ] You shoot off to the right

# --predict-tr--

En keskin sağ virajda (kıvrım 4) tam hızla gidiyorsun ve sağ oku basılı tutuyorsun. Ne olur?
- [ ] Yolun ortasında kalırsın
- [x] Yine de yavaş yavaş sola kayarsın
  Direksiyon karede +0.04 veriyor, viraj 0.048 alıyor: viraj az farkla kazanıyor.
- [ ] Sağa fırlarsın

# --tests--

A curve should pull a fast car outwards.
tr: Viraj hızlı bir arabayı dışarı çekmeli.

```js
position = 310 * SEG + 100 - PLAYER_Z
speed = MAX_SPEED
$.tick(1)
assert.closeTo(playerX, -4 * 0.012, 1e-9)
```

At half the speed, the pull should be a quarter.
tr: Yarı hızda itme dörtte bir olmalı.

```js
position = 310 * SEG + 100 - PLAYER_Z
speed = MAX_SPEED / 2
$.tick(1)
assert.closeTo(playerX, (-4 * 0.012) / 4, 1e-6)
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
const PLAYER_Z = CAMERA_HEIGHT * DEPTH // how far in front of the camera the player's car is
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
  add(80, 0)
  add(60, 2)
  add(50, 0)
  add(80, -3)
  add(40, 0)
  add(50, 4)
  add(30, -1)
  add(60, -2)
  add(70, 0)
  add(90, 3)
  add(40, 0)
  add(60, -4)
  add(90, 0)
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
// Touch: hold the left or right third to steer; the car accelerates on its own while you touch.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys.ArrowUp = true
  if (third < 1) keys.ArrowLeft = true
  if (third >= 2) keys.ArrowRight = true
})
function stopTouch() {
  keys.ArrowUp = keys.ArrowLeft = keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

const segmentAt = (z) => segments[Math.floor(z / SEG) % segments.length]

function update() {
  const ratio = speed / MAX_SPEED

  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  const offRoad = Math.abs(playerX) > 1
  if (offRoad && speed > MAX_SPEED / 3) speed -= 2.5 // grass slows you down
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

  // Steering works better the faster you go; curves push you outwards.
  const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  playerX += steer * 0.04 * ratio
  playerX -= segmentAt(position + PLAYER_Z).curve * 0.012 * ratio * ratio
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

  // Work out where every segment is on screen, from near to far, bending the road a little more at each curve.
  const base = Math.floor(position / SEG)
  let x = 0
  let dx = -segments[base % segments.length].curve * ((position % SEG) / SEG)
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(x - playerX * ROAD, -CAMERA_HEIGHT, z)
    const far = project(x + dx - playerX * ROAD, -CAMERA_HEIGHT, z + SEG)
    x += dx
    dx += segments[index].curve
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
