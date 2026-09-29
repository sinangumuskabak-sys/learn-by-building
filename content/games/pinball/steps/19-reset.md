---
title: A score and a fresh start
title_tr: Skor ve yeni başlangıç
skills: [game.state, prog.functions]
---

# --goal--

Bumpers will give points, so we need a `score`. A new game sets it to 0: `reset()` sets up everything a game starts
with, and it runs once when the page loads.

# --goal-tr--

Tamponlar puan verecek; bunun için bir `score` (skor) değişkeni lazım. Her yeni oyun sıfırdan başlamalı.

`newBall` yalnız bir top hazırlıyor; bir oyunun başlangıcı ise daha fazlası: skor, birazdan paletler, top hakları...
Hepsini tek bir fonksiyonda toplayacağız: `reset()` (sıfırla). Sayfa açılınca bir kez çağrılacak; ileride oyun
bitince de.

# --code--

```js
let score

function reset() {
  score = 0
  newBall()
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `score` is declared empty; `reset` gives it its starting value.
- `reset()` also makes the first ball, so it replaces the `newBall()` call at the bottom.

# --meaning-tr--

- `let score` → skor değişkeni; değerini `reset` verecek.
- `function reset() {` → **yeni bir oyunu** kuran fonksiyon: skoru sıfırlar ve ilk topu hazırlar. Oyunun başında ne
  varsa burada toplanacak.
- `newBall()` → `reset`'in içinde çağrılıyor; bu yüzden en alttaki tek başına `newBall()` çağrısının yerini
  `reset()` alıyor.

# --task--

1. Under `let state` write `let score`.
2. Under `newBall` write `reset`.
3. At the bottom, replace `newBall()` with `reset()`.

# --task-tr--

1. `let state ...` satırının altına `let score` yaz.
2. `newBall` fonksiyonunun altına bir boş satır bırak ve `reset` fonksiyonunu yaz.
3. En alttaki `newBall()` satırını `reset()` yap.
4. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --hint--

Inside `reset` write `score = 0`, not `let score = 0`: a `let` there would make a new variable that lives only inside `reset`.

# --hint-tr--

`reset` içinde `let score = 0` değil `score = 0` yaz: oradaki bir `let`, yalnız `reset`'in içinde yaşayan yeni bir değişken yaratır.

# --tests--

A new game should start with a score of 0 and a ball in the lane.
tr: Yeni oyun 0 skorla ve kanalda bir topla başlamalı.

```js
assert.strictEqual(score, 0)
score = 500
ball = { x: 100, y: 100, vx: 1, vy: 1 }
state = 'playing'
reset()
assert.strictEqual(score, 0)
assert.deepEqual(ball, { x: 375, y: 570, vx: 0, vy: 0 })
assert.strictEqual(state, 'ready')
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
let score

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  score = 0
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

reset()
requestAnimationFrame(loop)
```
