---
title: Distance on a loop
title_tr: Döngüde uzaklık
skills: [prog.types]
---

# --goal--

"How far ahead is that car?" is harder on a looping track: a car at 100 may be just ahead of us at 159 900. `ahead(a, b)`
is the distance going forwards from `a` to `b`, always between 0 and the track length.

# --goal-tr--

"O araba ne kadar önümde?" Düz bir yolda cevap `b - a`. Ama pistimiz **dönüyor**: 159 900'deyken 100'deki araba aslında
hemen önümüzde, sadece 200 birim ileride. `b - a` ise kocaman bir **eksi** sayı verir.

`ahead(a, b)` (önde) "`a`'dan **ileri** doğru giderek `b`'ye kaç birim var?" sorusunu cevaplar; sonuç hep 0 ile pist
uzunluğu arasında olur.

# --code--

```js
// Distance from a to b going forwards along the looping track.
const ahead = (a, b) => (((b - a) % trackLength) + trackLength) % trackLength
```

# --meaning--

- `(b - a) % trackLength` can still be negative in JavaScript: `-30 % 100` is `-30`.
- Adding `trackLength` makes it positive, and the second `%` brings a positive result back under `trackLength`.

# --meaning-tr--

- `(b - a) % trackLength` → farkı pist uzunluğuna göre kalana indirir. Ama dikkat: JavaScript'te eksi sayının kalanı
  **eksi** kalır: `-30 % 100` → `-30`.
- `+ trackLength` → eksiyi artıya çevirir: `-30 + 100` → `70`.
- Sondaki ikinci `% trackLength` → fark zaten artıysa (ör. `30 + 100 = 130`) onu yine pistin içine indirir: `30`.
- Kısacası: önce kalan, sonra "bir tur ekle", sonra yine kalan. Her durumda 0 ile pist uzunluğu arası.

# --task--

Under the `segmentAt` line write the comment and `ahead`.

# --task-tr--

`const segmentAt = ...` satırının hemen **altına** yorum satırını ve `ahead` satırını yaz. **Çalıştır**: ekran değişmez.

# --predict--

What is `-30 % 100` in JavaScript?
- [ ] `70`
- [x] `-30`
  The remainder keeps the sign of the left number. That is why `ahead` adds `trackLength` before the second `%`.
- [ ] `30`

# --predict-tr--

JavaScript'te `-30 % 100` kaçtır?
- [ ] `70`
- [x] `-30`
  Kalan, soldaki sayının işaretini taşır. `ahead`'in ikinci `%`'den önce `trackLength` eklemesinin sebebi bu.
- [ ] `30`

# --tests--

`ahead` should measure forwards, across the end of the track too.
tr: `ahead` ileri doğru ölçmeli, pistin sonunu geçerken de.

```js
assert.strictEqual(ahead(50, 100), 50)
assert.strictEqual(ahead(trackLength - 10, 20), 30)
assert.strictEqual(ahead(100, 50), trackLength - 50)
assert.strictEqual(ahead(20, 20), 0)
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
let cars
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
  cars = []
  for (let i = 0; i < 12; i++) {
    cars.push({ z: (i + 1) * (trackLength / 12), x: Math.random() * 1.2 - 0.6, speed: 40 + Math.random() * 30 })
  }
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
// Distance from a to b going forwards along the looping track.
const ahead = (a, b) => (((b - a) % trackLength) + trackLength) % trackLength

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
