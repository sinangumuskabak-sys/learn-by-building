---
title: Two flippers
title_tr: İki palet
skills: [game.state, prog.arrays]
---

# --goal--

A flipper is a bar that turns around a fixed pivot. Each has a pivot `(x, y)`, a resting angle and an up angle. In
the game each flipper also has its current `angle` and turning `speed`.

# --goal-tr--

Şimdi oyunun kalbi: **paletler** (flipper). Palet, bir ucu sabit (**eksen**) olan ve o eksenin etrafında dönen
bir çubuk. Dinlenirken aşağı eğik durur, tuşa basınca yukarı kalkar.

Her paletin sabit bilgileri: eksenin yeri (`x`, `y`), dinlenme açısı (`rest`), kalkık açısı (`up`) ve hangi tuşa
bağlı olduğu (`key`). Oyun sırasında bir de **değişen** bilgileri var: şu anki açısı (`angle`) ve dönüş hızı
(`speed`). Sabitleri `FLIPPERS`'ta, oyunun kendi kopyasını `flippers`'ta tutuyoruz. Ekranda henüz bir şey
değişmeyecek.

# --code--

```js
const FLIPPER_LENGTH = 62
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let flippers // { ...FLIPPERS[i], angle, speed }

  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
```

# --meaning--

- Angles are in radians and measured from "pointing right"; because `y` grows downwards, a positive angle tilts down.
  The left flipper rests at `0.45` (right and down) and goes up to `-0.45`.
- The right flipper points left, so its angles are around `Math.PI` (half a turn).
- `{ ...f, angle: f.rest, speed: 0 }` copies all of `f`'s fields into a new object and adds two more, so `FLIPPERS`
  itself never changes. The parentheses around `{ }` make the arrow function return the object.

# --meaning-tr--

- `const FLIPPER_LENGTH = 62` → paletin boyu: 62 piksel.
- Açılar **radyan** ile, "sağı gösteriyor" yönünden ölçülür. `Math.PI` yarım tur (180°). `y` aşağı doğru büyüdüğü
  için **artı açı aşağı**, eksi açı yukarı eğer.
  - Sol palet `(130, 530)`'da, sağa bakar: dinlenirken `0.45` (≈ 26° aşağı), kalkınca `-0.45` (≈ 26° yukarı).
  - Sağ palet `(270, 530)`'da, **sola** bakar: açıları yarım tur, `Math.PI` civarında. `Math.PI - 0.45` sola-aşağı,
    `Math.PI + 0.45` sola-yukarı.
- `key: 'left'` → bu palet hangi tuş bilgisine bakacak (birkaç adım sonra kullanacağız).
- `flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))` → her palet için **yeni bir nesne**:
  - `...f` → üç nokta (**yayma**, spread): `f`'nin bütün alanlarını (`x`, `y`, `rest`, `up`, `key`) yeni nesneye
    kopyalar;
  - `angle: f.rest, speed: 0` → üstüne iki alan ekler: palet dinlenme açısında ve duruyor.
  - `({ ... })` → ok fonksiyonu bir nesne döndürürken süslü parantez **normal parantez içine** alınır; yoksa
    JavaScript onu fonksiyon gövdesi sanar.
  - Böylece sabit `FLIPPERS` hiç değişmez; oyun kendi kopyasıyla oynar ve her `reset` temiz kopyalar yapar.

# --task--

1. Under the `BUMPERS` list write `FLIPPER_LENGTH` and `FLIPPERS`.
2. Under `let ball` write `let flippers`.
3. Make the `flippers = ...` line the first line of `reset`.

# --task-tr--

1. `BUMPERS` listesinin kapanan `]` satırının altına `FLIPPER_LENGTH` ve `FLIPPERS` satırlarını yaz.
2. `let ball ...` satırının altına `let flippers ...` yaz.
3. `reset` içinde **en üste**, `score = 0` satırının üstüne `flippers = ...` satırını yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

Do not forget the parentheses in `(f) => ({ ...f, angle: f.rest, speed: 0 })`.

# --hint-tr--

`(f) => ({ ...f, angle: f.rest, speed: 0 })` içindeki normal parantezleri unutma.

# --tests--

There should be two flippers, resting, each a copy of its `FLIPPERS` entry.
tr: İki palet olmalı; dinlenme açısında, her biri kendi `FLIPPERS` kaydının kopyası.

```js
assert.strictEqual(FLIPPER_LENGTH, 62)
assert.lengthOf(flippers, 2)
assert.deepEqual(flippers[0], { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left', angle: 0.45, speed: 0 })
assert.closeTo(flippers[1].angle, Math.PI - 0.45, 1e-9)
assert.strictEqual(flippers[1].key, 'right')
assert.notStrictEqual(flippers[0], FLIPPERS[0], 'a copy, not the same object')
assert.isUndefined(FLIPPERS[0].angle, 'FLIPPERS itself is not changed')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const SUB = 4 // physics steps per frame
const MAX_SPEED = 18
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]
const BUMPERS = [
  { x: 100, y: 160, r: 22 },
  { x: 200, y: 120, r: 22 },
  { x: 280, y: 280, r: 22 },
]
const FLIPPER_LENGTH = 62
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let state // 'ready' (in the lane) or 'playing'
let score
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  score = 0
  flash = BUMPERS.map(() => 0)
  newBall()
}

// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  const nx = (ball.x - px) / d
  const ny = (ball.y - py) / d
  ball.x = px + nx * R
  ball.y = py + ny * R
  const vn = ball.vx * nx + ball.vy * ny
  if (vn < 0) {
    ball.vx -= (1 + bounce) * vn * nx
    ball.vy -= (1 + bounce) * vn * ny
  }
  return true
}

function hitBumper(b, i) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const d = Math.hypot(dx, dy)
  if (d >= b.r + R) return
  const nx = dx / d
  const ny = dy / d
  ball.x = b.x + nx * (b.r + R)
  ball.y = b.y + ny * (b.r + R)
  // A bumper kicks the ball away, faster than it came.
  const vn = ball.vx * nx + ball.vy * ny
  ball.vx += (-vn + 6) * nx
  ball.vy += (-vn + 6) * ny
  if (flash[i] === 0) score += 100
  flash[i] = 10
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
  BUMPERS.forEach(hitBumper)
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  if (state === 'ready') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) newBall() // drained: the next ball
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  BUMPERS.forEach((b, i) => {
    ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
