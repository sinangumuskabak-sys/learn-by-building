---
title: Remember which bumper was hit
title_tr: Hangi tampon vuruldu, hatırla
skills: [prog.arrays, game.state]
---

# --goal--

A hit bumper should light up for a moment. We keep one number per bumper in `flash`: how many more frames it stays
lit. A hit sets it to 10.

# --goal-tr--

Vurulan tampon bir an **yansın**. Bunun için her tampon için bir sayı tutacağız: `flash` (parlama). Sayı, tamponun
**daha kaç kare** yanık kalacağını söyler. 0 ise sönük; bir vuruş onu 10 yapar.

Bu adımda yalnız sayıları tutuyoruz; ekranda bir şey değişmeyecek. Yakmayı bir sonraki adımda çizeceğiz.

# --code--

```js
let flash // frames each bumper stays lit

  flash = BUMPERS.map(() => 0)

function hitBumper(b, i) {

  flash[i] = 10
```

# --meaning--

- `BUMPERS.map(() => 0)` makes a new list with a `0` for every bumper: `[0, 0, 0]`.
- `forEach` gives the function a second value, the index `i` (0, 1, 2), so `hitBumper(b, i)` knows which bumper it is.
- `flash[i] = 10` lights bumper number `i` for 10 frames.

# --meaning-tr--

- `let flash` → her tampon için bir sayı tutacak liste.
- `flash = BUMPERS.map(() => 0)` → `map` bir listenin **her elemanı için yeni bir değer** üretip yeni bir liste
  yapar. Burada her tampon için `0`: sonuç `[0, 0, 0]`. Tampon sayısı değişirse liste de kendiliğinden uyar.
- `function hitBumper(b, i) {` → `forEach` fonksiyona tamponun yanında **sırasını** da verir: `i` 0, 1 ya da 2.
  Şimdiye kadar kullanmıyorduk; artık "kaçıncı tampon" bilgisi lazım.
- `flash[i] = 10` → listenin `i`. elemanını 10 yap: bu tampon 10 kare yanacak.

# --task--

1. Under `let score` write `let flash`.
2. In `reset`, under `score = 0`, write the `flash` line.
3. Add `, i` to `hitBumper`'s parameters, and write `flash[i] = 10` at its end.

# --task-tr--

1. `let score` satırının altına `let flash ...` yaz.
2. `reset` içinde `score = 0` satırının altına `flash = BUMPERS.map(() => 0)` yaz.
3. `function hitBumper(b) {` satırını `function hitBumper(b, i) {` yap.
4. `hitBumper` içinde en sona, `score += 100` satırının altına `flash[i] = 10` yaz.
5. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

`flash` should start with a 0 for every bumper.
tr: `flash` her tampon için bir 0 ile başlamalı.

```js
assert.deepEqual(flash, [0, 0, 0])
```

Hitting a bumper should set its own counter to 10.
tr: Bir tampona vurmak kendi sayacını 10 yapmalı.

```js
const b = BUMPERS[1]
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b, 1)
assert.deepEqual(flash, [0, 10, 0])
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
  score += 100
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
