---
title: No jumps in the curve
title_tr: Virajda sıçrama olmasın
skills: [game.physics]
---

# --goal--

In a curve the road jumps a little each time the camera enters a new segment, because the bending always starts from
the segment under the camera. Starting `dx` at a fraction of that segment's curve, how far through it we are, makes it
smooth.

# --goal-tr--

Virajda sürerken yol her yeni parçaya girişte **hafifçe sıçrıyor**. Sebebi: kıvırma hep kameranın altındaki parçanın
**başından** hesaplanıyor; kamera parçanın içinde ilerlese de resim değişmiyor, sonra birden bir parça atlıyor.

Çözüm: `dx`'i 0'dan değil, o parçanın ne kadarını geçtiğimize göre küçük bir **eksi** değerden başlatmak. Böylece kıvrım
kamera ilerledikçe yavaş yavaş kayar.

# --code--

```js
let dx = -segments[base % segments.length].curve * ((position % SEG) / SEG)
```

# --meaning--

- `position % SEG` is how far into the current segment the camera is (0 to 199); divided by `SEG` it is 0 to 1.
- Starting `dx` at minus that fraction of the curve moves the bend back smoothly while we cross the segment.

# --meaning-tr--

- `segments[base % segments.length].curve` → kameranın altındaki parçanın kıvrımı.
- `position % SEG` → o parçanın içinde kaç birim ilerlediğimiz (0–199). `/ SEG` bunu 0 ile 1 arasına getirir: parçanın
  başında 0, ortasında 0.5.
- Eksi işaret → kamera parçanın içinde ilerledikçe kıvrım o oranda **geri kayar**. Parçanın sonuna gelindiğinde tam
  bir parçalık kayma olmuştur; bir sonraki parçaya geçerken resim sıçramaz.

# --task--

Change `let dx = 0` to the new line.

# --task-tr--

`let dx = 0` satırını yeni satırla değiştir. **Çalıştır** ve virajda sür: yol artık titremeden kıvrılmalı.

# --tests--

Halfway through a curve segment, the bend should already have moved back by half a segment.
tr: Virajdaki bir parçanın ortasında kıvrım yarım parça kadar geri kaymış olmalı.

```js
position = 320 * SEG + 100
$.tick(1)
const calls = $.screen()
const shapes = []
let path = []
for (const c of calls) {
  if (c.op === 'moveTo') path = [c.args]
  else if (c.op === 'lineTo') path.push(c.args)
  else if (c.op === 'fill') shapes.push({ color: c.fill, x: (path[0][0] + path[3][0]) / 2, y: path[0][1], w: path[3][0] - path[0][0] })
}
const roads = shapes.filter((s) => s.color === '#6b7280' || s.color === '#646b75')

const nearest = roads[roads.length - 1]
assert.closeTo(nearest.x, 240 + (DEPTH / 100) * -2 * 240, 1e-6)
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
