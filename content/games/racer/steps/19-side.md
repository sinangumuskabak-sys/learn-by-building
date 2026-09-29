---
title: Move the camera sideways
title_tr: Kamerayı yana kaydır
skills: [game.state]
---

# --goal--

The car always stays in the middle of the screen, so steering moves the **camera** sideways and the road moves the other
way. `playerX` is where we are across the road: 0 the middle, -1 the left edge, 1 the right edge.

# --goal-tr--

Araba hep ekranın ortasında duruyor. O zaman direksiyon çevirince ne kayacak? **Kamera**! Kamera sağa kayınca yol sola
gider; arabadan bakınca da tam böyle görünür.

Arabanın yoldaki yan konumunu `playerX` tutacak: `0` yolun ortası, `-1` sol kenarı, `1` sağ kenarı. Her noktayı ekrana
çevirirken yan uzaklıktan `playerX * ROAD` çıkaracağız.

# --code--

```js
let playerX // -1 is the left edge of the road, 1 the right edge

  playerX = 0

    const near = project(-playerX * ROAD, -CAMERA_HEIGHT, z)
    const far = project(-playerX * ROAD, -CAMERA_HEIGHT, z + SEG)
```

# --meaning--

- `playerX` times `ROAD` (half the road's width) is how far the camera is from the middle, in world units.
- The road's middle is then `-playerX * ROAD` to the side of the camera. Nearer segments are wider on screen, so they
  shift a lot and far ones hardly at all.

# --meaning-tr--

- `let playerX` → yoldaki yan konum. `reset` onu 0 (yolun ortası) yapar.
- `playerX * ROAD` → `ROAD` yolun yarı genişliği; `playerX` 1 olunca kamera tam sağ kenarın üstündedir.
- `project(-playerX * ROAD, ...)` → kamera sağa kayınca yolun ortası kameranın **soluna** düşer; o yüzden eksi.
- Yakın parçalar ekranda geniş olduğu için çok, uzak parçalar çok az kayar. Uzaktaki dağ yerinden oynamaz, yanındaki
  direk hızla geçer; aynı şey.

# --task--

1. Under `let position` write `let playerX`.
2. In `reset`, under `position = 0`, write `playerX = 0`.
3. In the first loop of `draw`, change the first `0` in the `near` and `far` lines to `-playerX * ROAD`.

# --task-tr--

1. `let position ...` satırının altına `let playerX ...` satırını yaz.
2. `reset` içinde `position = 0` satırının altına `playerX = 0` yaz.
3. `draw` içindeki ilk döngüde, `near` ve `far` satırlarındaki **ilk** `0`'ı `-playerX * ROAD` yap.
4. **Çalıştır**: şimdilik hiçbir şey değişmez, çünkü `playerX` 0.

# --try--

Set `playerX = 0.8` in `reset` and run: you are driving near the right edge. Put 0 back.

# --try-tr--

`reset` içinde `playerX = 0.8` yap ve çalıştır: yolun sağ kenarına yakın gidiyorsun. Sonra 0'a geri al.

# --tests--

`playerX` should start in the middle of the road.
tr: `playerX` yolun ortasından başlamalı.

```js
assert.strictEqual(playerX, 0)
playerX = 2
reset()
assert.strictEqual(playerX, 0)
```

Moving across should shift the near road much more than the far road.
tr: Yana kaymak yakın yolu uzak yoldan çok daha fazla kaydırmalı.

```js
playerX = 0.5
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
const furthest = roads[0]
assert.closeTo(nearest.x, 240 - (DEPTH / 200) * 500 * 240, 1e-6)
assert.isBelow(nearest.x, furthest.x)
assert.isAbove(furthest.x, 230)
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
