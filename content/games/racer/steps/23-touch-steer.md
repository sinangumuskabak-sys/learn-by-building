---
title: Steering by touch
title_tr: Dokunarak direksiyon
skills: [game.input]
---

# --goal--

On a phone, a finger on the left third of the game steers left, on the right third steers right, and anywhere it also
accelerates. We work out which third the finger is in from its position.

# --goal-tr--

Telefonda direksiyon da parmakla olsun: oyunun **sol üçte birine** dokunmak sola, **sağ üçte birine** dokunmak sağa
çevirsin; nereye dokunursan dokun gaz da verilsin. Ortaya dokunmak sadece gaz.

Bunun için parmağın ekranın hangi üçte birinde olduğunu hesaplayacağız.

# --code--

```js
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
```

# --meaning--

- `getBoundingClientRect()` gives where the canvas is on the page and how wide it is; `event.clientX` is where the finger
  is.
- `(finger - left edge) / width` is 0 to 1; times 3, `third` is 0 to 3. Below 1 is the left third, 2 or more the right.
- `stopTouch` lets go of all three keys at once.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki **yerini ve boyunu** verir: `rect.left` sol kenarı, `rect.width`
  eni. (Telefonda canvas ekrana sığsın diye küçülebilir; bu yüzden 480'e güvenmiyoruz.)
- `event.clientX` → parmağın yatay konumu.
- `(event.clientX - rect.left) / rect.width` → parmak canvas'ın neresinde: sol kenarda 0, sağ kenarda 1. `* 3` ile
  `third` 0 ile 3 arasında olur.
- `third < 1` → sol üçte bir: sola çevir. `third >= 2` → sağ üçte bir: sağa çevir.
- `keys.ArrowUp = keys.ArrowLeft = keys.ArrowRight = false` → üçüne birden `false` koyar; sağdan sola doğru okunur.

# --task--

Replace the old touch code (from its comment to the end of `stopTouch`) with the new one. The two lines below it stay.

# --task-tr--

1. `// Touch: hold anywhere to accelerate.` yorumundan `stopTouch` fonksiyonunun kapanış `}`'sine kadar olan kısmı sil.
2. Yerine yeni kodu yaz. Altındaki `pointerup` ve `pointercancel` satırları aynen kalır.
3. **Çalıştır**: fareyle canvas'ın sol kenarına basılı tutunca araba hızlanıp sola dönmeli.

# --tests--

Touching the left third should steer left and accelerate.
tr: Sol üçte bire dokunmak sola çevirmeli ve hızlandırmalı.

```js
speed = MAX_SPEED
$.pointerDown(20, 100)
$.tick(5)
assert.closeTo(playerX, -0.2, 1e-9)
$.pointerUp(20, 100)
$.tick(1)
assert.isFalse(!!keys.ArrowLeft)
```

Touching the right third should steer right; the middle only accelerates.
tr: Sağ üçte bire dokunmak sağa çevirmeli; orta sadece hızlandırmalı.

```js
speed = MAX_SPEED
$.pointerDown(460, 100)
$.tick(5)
assert.closeTo(playerX, 0.2, 1e-9)
$.pointerUp(460, 100)
$.pointerDown(240, 100)
$.tick(5)
assert.closeTo(playerX, 0.2, 1e-9)
assert.isTrue(keys.ArrowUp)
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
