---
title: Best lap
title_tr: En iyi tur
skills: [game.state]
---

# --goal--

When a lap ends, its time is compared with the best lap so far. Fewer frames is better, so a lap is a record when there
is no record yet or it is smaller. The record is saved in `localStorage`, so it stays after the page is closed.

# --goal-tr--

Bir tur bitince süresini **en iyi turla** karşılaştıracağız. Burada **az olan iyidir**: süre ne kadar kısaysa o kadar
iyi. Yeni süre, henüz rekor yoksa **ya da** eskisinden küçükse yeni rekordur.

Rekoru tarayıcının küçük defteri `localStorage`'a yazacağız; sayfayı kapatıp açsan bile yerinde durur.

# --code--

```js
let best = Number(localStorage.getItem('racer-best')) || 0

    position -= trackLength
    if (best === 0 || lapTime < best) {
      best = lapTime
      localStorage.setItem('racer-best', best)
    }
    lap += 1
```

# --meaning--

- `localStorage.getItem` reads the saved text (or `null`); `Number(...) || 0` turns it into a number, or 0 if there is
  none. 0 means "no record yet".
- `||` means "or": no record yet, or a faster lap. Then it becomes the best and is saved with `setItem`.

# --meaning-tr--

- `localStorage.getItem('racer-best')` → defterden `racer-best` kaydını okur. Kayıtlar hep **yazı** olarak gelir; hiç
  kayıt yoksa `null`.
- `Number(...)` → yazıyı sayıya çevirir. `|| 0` → "o bir şey vermezse 0 al". `best` 0 ise "henüz rekor yok" demek.
- `best === 0 || lapTime < best` → `||` "**ya da**": rekor yoksa ya da bu tur daha kısaysa.
- `best = lapTime` → yeni rekor. `localStorage.setItem('racer-best', best)` → deftere **yaz**.

# --task--

1. Under `let lapTime` write the `best` line.
2. In the lap block, between `position -= trackLength` and `lap += 1`, write the record `if`.

# --task-tr--

1. `let lapTime ...` satırının altına `best` satırını yaz.
2. `update`'in sonundaki tur bloğunda `position -= trackLength` satırı ile `lap += 1` satırının **arasına** rekor
   `if`'ini yaz.
3. **Çalıştır**: ekran değişmez; rekoru bir sonraki adımda göstereceğiz.

# --predict--

Why do we also check `best === 0`?
- [x] Otherwise no lap could ever beat a record of 0
  Nothing is smaller than 0 frames, so without it the first lap would never be saved.
- [ ] To reset the record
- [ ] It is not needed

# --predict-tr--

`best === 0` kontrolüne neden gerek var?
- [x] Yoksa hiçbir tur 0'lık bir rekoru geçemezdi
  Hiçbir süre 0 kareden küçük değil; o kontrol olmasa ilk tur hiç kaydedilmezdi.
- [ ] Rekoru sıfırlamak için
- [ ] Gerek yok

# --tests--

Crossing the line should record the first lap as the best.
tr: Çizgiyi geçmek ilk turu en iyi tur olarak kaydetmeli.

```js
assert.strictEqual(best, 0)
lapTime = 1500
position = trackLength - 50
speed = 100
$.tick(1)
assert.strictEqual(best, 1501)
assert.strictEqual(localStorage.getItem('racer-best'), '1501')
```

A slower lap should not replace the best one, a faster one should.
tr: Daha yavaş bir tur en iyisinin yerini almamalı, daha hızlısı almalı.

```js
best = 1000
lapTime = 1500
position = trackLength - 50
speed = 100
$.tick(1)
assert.strictEqual(best, 1000)
lapTime = 900
position = trackLength - 50
speed = 100
$.tick(1)
assert.strictEqual(best, 901)
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
const LAPS = 3

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is
let playerX // -1 is the left edge of the road, 1 the right edge
let speed
let cars
let lap
let lapTime // frames
let best = Number(localStorage.getItem('racer-best')) || 0
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
  lap = 1
  lapTime = 0
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
  lapTime += 1
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

  for (const car of cars) {
    car.z = (car.z + car.speed) % trackLength
    const gap = ahead(position + PLAYER_Z, car.z)
    // Driving into a car from behind: you slow down to half its speed.
    if (gap < 120 && Math.abs(car.x - playerX) < 0.35 && speed > car.speed) speed = car.speed / 2
  }

  position += speed
  if (position >= trackLength) {
    position -= trackLength
    if (best === 0 || lapTime < best) {
      best = lapTime
      localStorage.setItem('racer-best', best)
    }
    lap += 1
    lapTime = 0
  }
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

  const seconds = (f) => (f / 60).toFixed(1)
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(Math.round((speed / MAX_SPEED) * 300) + ' km/h', 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('Lap ' + lap + '/' + LAPS + '  ' + seconds(lapTime), W - 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
