---
title: Bounce off the wall
title_tr: Duvardan sek
skills: [game.physics, game.collision]
---

# --goal--

Pushing the ball out is not enough: its speed still points into the wall. We reflect the part of the velocity that
goes into the wall, keeping half of it (`bounce = 0.5`).

# --goal-tr--

Topu dışarı ittik ama **hızı** hâlâ duvarın içine doğru. Gerçek bir top duvara çarpınca **geri seker**. Bunu hızı
ikiye ayırarak yaparız:

- duvara **doğru** giden kısım (normal yönündeki hız): bu kısım **ters çevrilir**,
- duvar **boyunca** giden kısım: o aynen kalır; top kaymaya devam eder.

Ters çevirirken biraz enerji kaybolur: `bounce = 0.5` ile top duvardan **yarı hızla** döner. Bu birkaç satır dik
duvarda da, eğik duvarda da, köşede de aynı şekilde çalışır. Masanın yalnız çizgilerden yapılmasının sebebi bu.

# --code--

```js
const vn = ball.vx * nx + ball.vy * ny
if (vn < 0) {
  ball.vx -= (1 + bounce) * vn * nx
  ball.vy -= (1 + bounce) * vn * ny
}
```

# --meaning--

- `vn` is the dot product of the velocity and the normal: how fast the ball moves out of the wall. Negative means into it.
- Only then do we change the velocity: taking away `vn` along the normal would stop it; taking away `(1 + bounce) × vn`
  sends it back out at `bounce` times the speed.

# --meaning-tr--

- `const vn = ball.vx * nx + ball.vy * ny` → yine bir **nokta çarpımı**: hızın normal yönündeki payı. Yani top
  duvardan ne hızla **uzaklaşıyor**.
  - `vn` **eksi** ise top duvara doğru gidiyor (çarpıyor).
  - artı ise zaten uzaklaşıyor; karışmayız.
- `if (vn < 0) {` → yalnız duvara doğru gidiyorsa sektir.
- `ball.vx -= (1 + bounce) * vn * nx` → hızdan normal yönünde `(1 + bounce) × vn` çıkar:
  - yalnız `vn` çıkarsaydık duvara doğru hız **sıfırlanırdı** (top yapışırdı);
  - fazladan `bounce × vn` daha çıkarmak onu **ters** yöne çevirir. `bounce = 0.5` ile geri dönüş hızı gelişin
    yarısı.
- `-=` → "şundan çıkar" (`a -= 2`, `a = a - 2` ile aynı). `vn` eksi olduğu için çıkarmak aslında dışarı doğru ekler.

# --task--

In `hitSegment`, write the five lines under `ball.y = py + ny * R`, above `return true`.

# --task-tr--

1. `hitSegment` içinde `ball.y = py + ny * R` satırının **altına**, `return true` satırının **üstüne** beş satırı
   yaz.
2. **Çalıştır**: top artık kanalın tabanında durmalı. **Boşluk**'a bas: top tepeye çıkıp duvarlardan sekmeli.

# --hint--

Check the signs: `-=` in both lines, and `(1 + bounce)` in parentheses.

# --hint-tr--

İşaretleri kontrol et: iki satırda da `-=`, ve `(1 + bounce)` parantez içinde.

# --try--

In `update`, change `0.5` to `1`: walls give back all the speed and the ball bounces forever. Put `0.5` back.

# --try-tr--

`update` içinde `0.5`'i `1` yap: duvarlar bütün hızı geri verir ve top durmadan seker. Sonra `0.5`'e geri al.

# --tests--

A ball hitting a wall should bounce back at half the speed.
tr: Duvara çarpan top yarı hızla geri sekmeli.

```js
ball = { x: 25, y: 300, vx: -5, vy: 0 }
hitSegment(20, 470, 20, 120, 0.5)
assert.closeTo(ball.vx, 2.5, 1e-9)
ball = { x: 25, y: 300, vx: 5, vy: 0 }
hitSegment(20, 470, 20, 120, 0.5)
assert.strictEqual(ball.vx, 5, 'a ball already moving away keeps its speed')
```

The ball in the lane should come to rest on the floor.
tr: Kanaldaki top tabanda durmalı.

```js
$.run(3)
assert.strictEqual(ball.x, 375)
assert.closeTo(ball.y, 582, 1, 'resting on the lane floor at y 590')
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
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
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

function update() {
  ball.vy += GRAVITY
  ball.x += ball.vx
  ball.y += ball.vy
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
}

function launch() {
  ball.vy = -16
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
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
