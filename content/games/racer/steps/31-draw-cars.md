---
title: Cars that shrink with distance
title_tr: Uzaklaştıkça küçülen arabalar
skills: [game.canvas, prog.arrays]
---

# --goal--

To draw a car, find its segment in `shown`: its near edge tells where on screen that distance is and how wide the road
is there. The car is a third of that width: far cars come out tiny, near ones big. Far cars are drawn first.

# --goal-tr--

Arabayı nereye ve ne büyüklükte çizeceğiz? Hilesi şu: arabanın bulunduğu parça, yol çizilirken **zaten** ekrana
çevrilmişti ve `shown` listesinde duruyor. O parçanın yakın kenarı bize ekrandaki yeri ve yolun oradaki **genişliğini**
söylüyor.

Arabayı yolun genişliğinin üçte biri kadar çizersek uzaktaki araba minik, yakındaki büyük çıkar. Eski oyunlardaki bütün
**ölçekleme** sırrı bu. Uzaktakileri önce çizeceğiz ki yakındakiler onları örtsün.

# --code--

```js
// The other cars, far ones first, sized by their distance.
const visible = cars
  .map((car) => ({ car, gap: ahead(position, car.z) }))
  .filter((c) => c.gap > PLAYER_Z * 0.5 && c.gap < DRAW * SEG)
  .sort((a, b) => b.gap - a.gap)
for (const { car } of visible) {
  const seg = shown.find((s) => s.index === Math.floor(car.z / SEG) % segments.length)
  if (!seg) continue
  const w = seg.near.w * 0.35
  ctx.fillStyle = '#facc15'
  ctx.fillRect(seg.near.x + car.x * seg.near.w - w / 2, seg.near.y - w * 0.6, w, w * 0.6)
}
```

# --meaning--

- `map` pairs each car with its distance ahead of the camera, `filter` keeps those in view, and `sort` puts the
  furthest first.
- `for (const { car } of visible)` goes through that list. `shown.find(...)` finds the car's segment, or nothing
  (`continue` skips it).
- The car is `0.35` of the road's half width wide and `0.6` of that high, standing on the near edge at its place across
  the road.

# --meaning-tr--

- `.map((car) => ({ car, gap: ... }))` → her arabayı, kameranın ne kadar önünde olduğuyla (`gap`, aralık) eşleyip
  **yeni bir liste** yapar. Nesneyi parantez içine alıyoruz ki `{` fonksiyon gövdesi sanılmasın.
- `.filter(...)` → sadece şartı tutanları bırakır: arabanın çok yakınında olmayan (`PLAYER_Z * 0.5`'ten uzak) ve çizdiğimiz
  yolun içinde kalan (`DRAW * SEG`'den yakın) arabalar.
- `.sort((a, b) => b.gap - a.gap)` → listeyi `gap`'e göre **büyükten küçüğe** dizer: en uzak önce.
- Satır başındaki noktalar bir önceki satırın devamı; uzun zincir okunsun diye alt alta yazılır.
- `for (const { car } of visible)` → listedeki her eleman için, içinden `car`'ı çıkarıp `{ }` içini yap.
- `shown.find(...)` → şartı tutan **ilk** elemanı verir: bu arabanın parçası. Yoksa `undefined` (hiçbir şey).
- `if (!seg) continue` → `!` "değil": parça bulunamadıysa bu arabayı bırak, **sıradakine geç**.
- `w = seg.near.w * 0.35` → arabanın eni o uzaklıktaki yola göre; boyu `w * 0.6`.
- `seg.near.x + car.x * seg.near.w` → yolun ortası + arabanın şeridi. `- w / 2` ortalar, `seg.near.y - w * 0.6` arabayı
  yolun üstüne **oturtur**.

# --task--

In `draw`, above the `// Your car.` comment, write the other cars' code followed by an empty line.

# --task-tr--

`draw` içinde `// Your car.` yorumunun **üstüne** rakip arabaları çizen kodu yaz; altında bir boş satır kalsın.
**Çalıştır**, hızlan: ileride sarı arabalar görmeli, yaklaştıkça büyüdüklerini izlemelisin. (Henüz yerlerinde
duruyorlar.)

# --hint--

No cars at all? Check that the code is inside `draw`, before its last `}`.

# --hint-tr--

Hiç araba görünmüyor mu? Kodun `draw`'un **içinde**, son `}`'sinden önce olduğunu kontrol et.

# --tests--

Cars should get smaller with distance, and the far one is drawn first.
tr: Arabalar uzaklıkla küçülmeli ve uzaktaki önce çizilmeli.

```js
cars = [{ z: 3000, x: 0, speed: 0 }, { z: 12000, x: 0, speed: 0 }]
$.tick(1)
const drawn = $.rects('#facc15')
assert.lengthOf(drawn, 2)
assert.isBelow(drawn[0].w, drawn[1].w / 3, 'the far one is drawn first, and much smaller')
```

A car should stand on the road at its own lane.
tr: Araba kendi şeridinde yolun üstünde durmalı.

```js
cars = [{ z: 3000, x: 0.5, speed: 0 }]
$.tick(1)
const near = project(0, -CAMERA_HEIGHT, 3000)
const [car] = $.rects('#facc15')
assert.closeTo(car.w, near.w * 0.35, 1e-9)
assert.closeTo(car.y + car.h, near.y, 1e-9)
assert.closeTo(car.x + car.w / 2, near.x + 0.5 * near.w, 1e-9)
```

Cars behind the camera or too far away should not be drawn.
tr: Kameranın arkasındaki ya da çok uzaktaki arabalar çizilmemeli.

```js
cars = [{ z: trackLength - 500, x: 0, speed: 0 }, { z: 30000, x: 0, speed: 0 }]
$.tick(1)
assert.lengthOf($.rects('#facc15'), 0)
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

  // The other cars, far ones first, sized by their distance.
  const visible = cars
    .map((car) => ({ car, gap: ahead(position, car.z) }))
    .filter((c) => c.gap > PLAYER_Z * 0.5 && c.gap < DRAW * SEG)
    .sort((a, b) => b.gap - a.gap)
  for (const { car } of visible) {
    const seg = shown.find((s) => s.index === Math.floor(car.z / SEG) % segments.length)
    if (!seg) continue
    const w = seg.near.w * 0.35
    ctx.fillStyle = '#facc15'
    ctx.fillRect(seg.near.x + car.x * seg.near.w - w / 2, seg.near.y - w * 0.6, w, w * 0.6)
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
