---
title: A bumper kicks
title_tr: Tampon tekmeler
skills: [game.physics]
---

# --goal--

A wall gives back part of the speed; a bumper adds energy. We cancel the ball's speed into the bumper and give it a
fixed kick of 6 outwards, so even a slow ball flies away.

# --goal-tr--

Duvar, topun hızının bir kısmını geri verir. Tampon ise tersine **hız ekler**: içinde küçük bir mıknatıs var ve
değen topu tekmeler. Pinball'u canlı yapan bu.

Formül duvardakine benziyor: önce topun tampona **doğru** olan hızını buluruz (`vn`). Sonra onu sıfırlar ve üstüne
dışarı doğru **sabit 6** ekleriz. Yavaş gelen top da hızlı gelen top da tampondan 6 hızla fırlar.

# --code--

```js
// A bumper kicks the ball away, faster than it came.
const vn = ball.vx * nx + ball.vy * ny
ball.vx += (-vn + 6) * nx
ball.vy += (-vn + 6) * ny
```

# --meaning--

- `vn` is the speed along the normal (negative: towards the bumper).
- Adding `-vn` along the normal cancels it; adding `6` more sends the ball away at exactly 6, whatever it came in at.
- The speed along the bumper's edge is kept, so the ball glances off at an angle.

# --meaning-tr--

- `const vn = ball.vx * nx + ball.vy * ny` → nokta çarpımı: hızın normal yönündeki payı. Top tampona doğru
  geliyorsa eksi.
- `ball.vx += (-vn + 6) * nx` → hıza normal yönünde `-vn + 6` ekle:
  - `-vn` eklemek tampona doğru olan hızı **sıfırlar**;
  - `+ 6` topu dışarı doğru **6 hızla** yollar.
- Normal yönünde olmayan pay (tamponun kenarı boyunca kayma) aynen kalır: top düz geri değil, açıyla seker.

# --task--

In `hitBumper`, at the end, under `ball.y = b.y + ...`, write the comment and the three lines.

# --task-tr--

1. `hitBumper` içinde **en sona**, `ball.y = b.y + ny * (b.r + R)` satırının altına yorum satırını ve üç satırı yaz.
2. **Çalıştır** ve fırlat: top tamponlara çarpınca hızla fırlamalı.

# --try--

Change both `6`s to `12`: wild bumpers. Put `6` back.

# --try-tr--

İki `6`'yı da `12` yap: çılgın tamponlar. Sonra `6`'ya geri al.

# --tests--

A bumper should kick the ball away harder than it came.
tr: Tampon topu geldiğinden daha sert tekmelemeli.

```js
const b = BUMPERS[0]
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b)
assert.closeTo(ball.vx, -6, 1e-9, 'kicked away at 6')
ball = { x: b.x, y: b.y + b.r + R - 1, vx: 0.5, vy: -1 }
hitBumper(b)
assert.closeTo(ball.vy, 6, 1e-9, 'a slow ball is kicked at 6 too')
assert.strictEqual(ball.vx, 0.5, 'the speed along the edge is kept')
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

let ball // { x, y, vx, vy }
let state // 'ready' (in the lane) or 'playing'

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
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

function hitBumper(b) {
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
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
  BUMPERS.forEach(hitBumper)
}

function update() {
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
  BUMPERS.forEach((b) => {
    ctx.fillStyle = '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
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
