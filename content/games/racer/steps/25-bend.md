---
title: Bend the road
title_tr: Yolu kıvır
skills: [game.physics, game.canvas]
---

# --goal--

The cleverest trick of the old racers: the road is not really curved. While drawing, each segment is shifted sideways a
little **more** than the one before: `x += dx`, then `dx += curve`. A growing shift makes a smooth curve.

# --goal-tr--

Eski yarış oyunlarının en akıllıca hilesi: yol aslında **hiç kıvrılmıyor**. Çizerken her parçayı bir öncekinden **biraz
daha fazla** yana kaydırıyoruz:

- `x` → bu parçanın ne kadar kaydığı,
- `dx` → bir sonrakinin ne kadar **daha** kayacağı; her parçada `curve` kadar büyür.

Bir örnek: `curve` 2 ise kaymalar 0, 2, 6, 12, 20... diye gider. Her seferinde artan bir miktar eklemek düzgün bir
**eğri** (parabol) çizer; göz bunu uzaklaşırken kıvrılan bir yol olarak görür. Düzlükte `curve` 0: kayma artmaz.

# --code--

```js
// Work out where every segment is on screen, from near to far, bending the road a little more at each curve.
const base = Math.floor(position / SEG)
let x = 0
let dx = 0
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
```

# --meaning--

- `x` is how far the current segment is shifted sideways, `dx` how much more the next one will be.
- The near edge is shifted by `x`, the far edge by `x + dx`; then `x` grows by `dx`, and `dx` grows by this segment's
  `curve`.
- On a straight, `curve` is 0 and the shift stops growing; the road goes on in the direction it has.

# --meaning-tr--

- `let x = 0` → şu anki parçanın **yana kayması**. `let`, çünkü döngüde değişecek.
- `let dx = 0` → bir sonraki parçanın **ne kadar daha** kayacağı.
- `project(x - playerX * ROAD, ...)` → yakın kenar `x` kadar yana; `project(x + dx - playerX * ROAD, ...)` → uzak kenar
  `x + dx` kadar. Böylece parçanın uzak ucu yakın ucundan biraz daha kaymış olur.
- `x += dx` → sonraki parça bu parçanın uzak ucundan başlasın.
- `dx += segments[index].curve` → kayma artsın. `segments[index]` listenin `index` numaralı elemanı; `.curve` onun kıvrımı.
- Düzlükte `curve` 0: `dx` artmaz, yol gittiği yönde düz devam eder.

# --task--

1. Change the comment and write `let x = 0` and `let dx = 0` under `base`.
2. In the `near` line put `x` in front of `- playerX * ROAD`; in the `far` line put `x + dx`.
3. Under the `far` line write `x += dx` and `dx += segments[index].curve`.

# --task-tr--

1. `// Work out where ...` yorumunun sonuna `, bending the road a little more at each curve` ekle (yorum, zorunlu değil).
2. `base` satırının altına `let x = 0` ve `let dx = 0` yaz.
3. `near` satırında `-playerX * ROAD`'un önüne `x` yaz: `x - playerX * ROAD`. `far` satırında `x + dx - playerX * ROAD` yap.
4. `far` satırının altına `x += dx` ve `dx += segments[index].curve` satırlarını yaz.
5. **Çalıştır**, hızlan: ileride yolun kıvrıldığını görmelisin.

# --try--

Change `add(60, 2)` to `add(60, 10)` and drive: a very sharp curve. Put 2 back.

# --try-tr--

`add(60, 2)`'yi `add(60, 10)` yap ve sür: çok keskin bir viraj. Sonra 2'ye geri al.

# --tests--

The road ahead should bend where the curve starts.
tr: Öndeki yol virajın başladığı yerde kıvrılmalı.

```js
position = 300 * SEG // the sharp right curve starts 10 segments ahead
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

assert.isAbove(roads[0].x, 300, 'far away, in the curve, the road bends right')
assert.closeTo(roads[roads.length - 1].x, 240, 1e-6, 'right in front it is still straight')
```

A left curve should bend the road to the left.
tr: Sol viraj yolu sola kıvırmalı.

```js
position = 180 * SEG // a left curve starts 10 segments ahead
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

assert.isBelow(roads[0].x, 180)
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
  let dx = 0
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
