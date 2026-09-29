---
title: Lit for a moment, points once
title_tr: Bir an yanık, bir kez puan
skills: [game.state]
---

# --goal--

Each frame every counter goes down by one, so a bumper goes out after 10 frames. And while a bumper is still lit, a
touch gives no points: a ball stuck against it would otherwise score in every small step.

# --goal-tr--

İki küçük düzeltme, ikisi de sayaçla:

1. **Sönme:** her karede bütün sayaçlar 1 azalsın. 10 kare sonra (1/6 saniye) tampon söner.
2. **Bir kez puan:** tampon hâlâ yanarken gelen değişler puan vermesin. Yoksa tampona yaslanan bir top her küçük
   adımda değip binlerce puan toplardı.

# --code--

```js
function update() {
  flash = flash.map((n) => Math.max(0, n - 1))

  if (flash[i] === 0) score += 100
  flash[i] = 10
```

# --meaning--

- `flash.map((n) => Math.max(0, n - 1))` makes a new list with every number one smaller, but never under 0.
- It is the first line of `update`, before the `'ready'` check, so lights go out even while a ball waits.
- `if (flash[i] === 0)` gives the points only if the bumper was dark.

# --meaning-tr--

- `flash.map((n) => Math.max(0, n - 1))` → listedeki her sayıyı (`n`) 1 azaltıp yeni bir liste yapar.
  `Math.max(0, ...)` iki sayıdan büyüğünü seçtiği için sayı 0'ın altına inmez: `[10, 0, 3]` → `[9, 0, 2]`.
- Bu satır `update`'in **en üstünde**, `'ready'` kontrolünden önce: top kanalda beklerken de ışıklar söner.
- `if (flash[i] === 0) score += 100` → puan yalnız tampon **sönükken** verilir. Yanıyorsa değiş sayılmaz, ama
  tekme yine atılır ve sayaç yine 10 olur.

# --task--

1. Make the `flash.map(...)` line the first line of `update`.
2. In `hitBumper`, put `if (flash[i] === 0)` in front of `score += 100`.

# --task-tr--

1. `update` içinde **en üste**, `if (state === 'ready') return` satırının üstüne `flash = flash.map(...)` satırını yaz.
2. `hitBumper` içinde `score += 100` satırının başına `if (flash[i] === 0) ` ekle.
3. **Çalıştır**: tamponlar vuruldukça kısa bir an yanıp sönmeli; her vuruş 100 puan.

# --tests--

Every frame the counters should go down by one, never below 0.
tr: Her kare sayaçlar bir azalmalı, 0'ın altına inmemeli.

```js
flash = [3, 0, 1]
$.tick(1)
assert.deepEqual(flash, [2, 0, 0])
```

A lit bumper should go out after a moment.
tr: Yanan tampon bir an sonra sönmeli.

```js
flash[1] = 5
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.color === '#fde047'), 1, 'lit')
$.tick(10)
assert.lengthOf($.arcs().filter((a) => a.color === '#fde047'), 0, 'and it goes out')
```

A bumper should give no points while it is still lit.
tr: Tampon hâlâ yanarken puan vermemeli.

```js
const b = BUMPERS[0]
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b, 0)
assert.strictEqual(score, 100)
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b, 0)
assert.strictEqual(score, 100, 'no double points while it is still lit')
assert.isBelow(ball.vx, -5.9, 'but it still kicks')
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
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
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
