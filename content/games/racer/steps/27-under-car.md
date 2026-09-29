---
title: Which segment am I on?
title_tr: Hangi parçadayım?
skills: [prog.arrays]
---

# --goal--

To feel a curve, the car must know which segment it is on. `segmentAt(z)` gives the segment at a distance `z` along the
track. Our car is `PLAYER_Z` in front of the camera, so it is on `segmentAt(position + PLAYER_Z)`.

# --goal-tr--

Virajı hissedebilmek için arabanın **hangi parçanın üstünde** olduğunu bilmesi gerek. `segmentAt(z)` pist boyunca `z`
uzaklıktaki parçayı verecek.

Bir ayrıntı: arabamız kameranın tam altında değil, biraz **önünde** duruyor (ekranın altında gördüğümüz yer). O uzaklık
`PLAYER_Z`. Yani arabanın altındaki parça `segmentAt(position + PLAYER_Z)`. Bu adımda ekran değişmez.

# --code--

```js
const PLAYER_Z = CAMERA_HEIGHT * DEPTH // how far in front of the camera the player's car is

const segmentAt = (z) => segments[Math.floor(z / SEG) % segments.length]
```

# --meaning--

- `PLAYER_Z` is how far in front of the camera the bottom of the screen is: about 839 units.
- `Math.floor(z / SEG)` is the segment number, `% segments.length` wraps past the end of the track, and
  `segments[...]` takes that element (numbers start at 0).

# --meaning-tr--

- `PLAYER_Z = CAMERA_HEIGHT * DEPTH` → ekranın alt kenarının kameradan uzaklığı, yaklaşık 839 birim. Araba orada.
- `const segmentAt = (z) => ...` → tek satırlık **ok fonksiyonu**; süslü parantez ve `return` yazmadan sonucu verir.
- `Math.floor(z / SEG)` → `z` kaçıncı parçada (tam sayı).
- `% segments.length` → pistin sonu geçildiyse başa sarar.
- `segments[5]` → listenin 5 numaralı elemanı. Dikkat: numaralar (**index**) **0'dan** başlar; ilk eleman `segments[0]`.

# --task--

1. Under the `DEPTH` line write `PLAYER_Z`.
2. Above `function update() {` write `segmentAt`, followed by an empty line.

# --task-tr--

1. `const DEPTH = ...` satırının altına `PLAYER_Z` satırını yaz.
2. `function update() {` satırının **üstüne** `segmentAt` satırını yaz; altında bir boş satır kalsın.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

`PLAYER_Z` should be the distance from the camera to the bottom of the screen.
tr: `PLAYER_Z` kameradan ekranın altına olan uzaklık olmalı.

```js
assert.closeTo(PLAYER_Z, CAMERA_HEIGHT * DEPTH, 1e-9)
assert.closeTo(project(0, -CAMERA_HEIGHT, PLAYER_Z).y, H, 1e-9)
```

`segmentAt` should find the segment at any distance, looping around the track.
tr: `segmentAt` her uzaklıktaki parçayı bulmalı, pist dönünce başa sarmalı.

```js
assert.strictEqual(segmentAt(310 * SEG + 5).curve, 4)
assert.strictEqual(segmentAt(0), segments[0])
assert.strictEqual(segmentAt(trackLength + 81 * SEG).curve, 2, 'the track loops')
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
