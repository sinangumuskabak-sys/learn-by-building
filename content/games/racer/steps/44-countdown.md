---
title: "Build it yourself: beat the clock"
title_tr: "Kendin yap: saate karşı"
skills: [game.state, game.loop]
---

# --goal--

In the arcade original the clock was the enemy: time runs down, the game ends at zero, and every lap you finish buys
more time. Add that to your racer.

# --goal-tr--

Orijinal atari oyununda asıl düşman **saatti**: süre azalır, sıfıra inince oyun biter; her bitirdiğin tur sana ek süre
kazandırır. Şimdi bunu senin oyununa ekle.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: kare sayarak süre tutmak (`lapTime` gibi), `state`, tur bitişi ve
`seconds` ile yazı yazmak. Kontroller çalıştığında yeşile döner.

# --task--

- Keep the time left in a variable `timeLeft`, in frames. `reset` sets it to 60 seconds (`60 * 60`).
- While racing it goes down by 1 every frame; at 0 the race is `'finished'`.
- Every finished lap adds 30 seconds (`30 * 60` frames).
- Show it on screen as text starting with `Time `, like `Time 59.9`.

# --task-tr--

- Kalan süreyi `timeLeft` adlı bir değişkende **kare** olarak tut. `reset` onu 60 saniyeye (`60 * 60` kare) kursun.
- Yarış sürerken her karede 1 azalsın; sıfıra inince yarış bitsin (`state = 'finished'`).
- Bitirdiğin her tur 30 saniye (`30 * 60` kare) eklesin.
- Kalan süreyi ekranda `Time 59.9` gibi, `Time ` ile başlayan bir yazıyla göster (üst ortada güzel durur).

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Put `timeLeft -= 1` next to `lapTime += 1` (after the `return` line, so it stops with the race), add the time where a lap
ends, and draw it with `seconds(timeLeft)`.

# --hint-tr--

`timeLeft -= 1` satırını `lapTime += 1`'in yanına koy (`return` satırının altına; yarış bitince saat de dursun) ve hemen
altına sıfır kontrolünü ekle. Ek süre, turun bittiği blokta (`position -= trackLength` olan yerde). Yazı için
`seconds(timeLeft)` kullan; `ctx.textAlign = 'center'` ile ortalayabilirsin.

# --tests--

`timeLeft` should start at 60 seconds and count down while racing.
tr: `timeLeft` 60 saniyeden başlamalı ve yarış sürerken azalmalı.

```js
assert.strictEqual(timeLeft, 60 * 60)
$.tick(60)
assert.strictEqual(timeLeft, 60 * 60 - 60)
state = 'finished'
$.tick(10)
assert.strictEqual(timeLeft, 60 * 60 - 60, 'the clock stops when the race is over')
timeLeft = 5
reset()
assert.strictEqual(timeLeft, 60 * 60)
```

When the time runs out, the race should be over.
tr: Süre bitince yarış bitmeli.

```js
timeLeft = 2
speed = 50
$.tick(3)
assert.strictEqual(state, 'finished')
const p = position
$.tick(5)
assert.strictEqual(position, p)
```

Finishing a lap should add 30 seconds.
tr: Bir tur bitirmek 30 saniye eklemeli.

```js
timeLeft = 1000
position = trackLength - 50
speed = 100
$.tick(1)
assert.strictEqual(lap, 2)
assert.strictEqual(timeLeft, 1000 - 1 + 30 * 60)
```

The time left should be shown on screen.
tr: Kalan süre ekranda yazmalı.

```js
timeLeft = 1500
$.tick(1)
assert.isTrue($.texts().some((t) => /^Time \d+(\.\d)?$/.test(t) && t.includes('25')), 'expected a text like "Time 25.0"')
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
let timeLeft // frames
let state // 'racing' or 'finished'
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
  state = 'racing'
  timeLeft = 60 * 60
  cars = []
  for (let i = 0; i < 12; i++) {
    cars.push({ z: (i + 1) * (trackLength / 12), x: Math.random() * 1.2 - 0.6, speed: 40 + Math.random() * 30 })
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
  if (event.key === ' ' && state === 'finished') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
// Touch: hold the left or right third to steer; the car accelerates on its own while you touch.
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'finished') {
    reset()
    return
  }
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
  if (state !== 'racing') return
  lapTime += 1
  timeLeft -= 1
  if (timeLeft <= 0) state = 'finished'
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
    timeLeft += 30 * 60
    if (best === 0 || lapTime < best) {
      best = lapTime
      localStorage.setItem('racer-best', best)
    }
    if (lap === LAPS) state = 'finished'
    else {
      lap += 1
      lapTime = 0
    }
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
  ctx.fillText('Lap ' + lap + '/' + LAPS + '  ' + seconds(lapTime) + (best ? '  Best ' + seconds(best) : ''), W - 10, 22)
  ctx.textAlign = 'center'
  ctx.fillText('Time ' + seconds(timeLeft), W / 2, 46)
  if (state === 'finished') {
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Finished!', W / 2, H / 2 - 30)
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('Press Space to race again', W / 2, H / 2 - 6)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
