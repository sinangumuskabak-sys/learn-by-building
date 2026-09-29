---
title: The ball meets a bumper
title_tr: Top tampona çarpıyor
skills: [game.collision]
---

# --goal--

A ball touches a bumper when the distance between their centres is less than the two radii together. Then we push it
out along the line from the bumper's centre, like with the walls.

# --goal-tr--

İki daire ne zaman birbirine değer? **Merkezleri arasındaki uzaklık**, iki yarıçapın toplamından küçükse. İki
bozuk parayı masada birbirine yaklaştırmayı düşün: kenarları merkezler arası `r + R` olduğunda değer.

Duvarda olduğu gibi, değen topu **dışarı iteceğiz**. Burada normal daha da kolay: tamponun merkezinden topun
merkezine giden yön.

# --code--

```js
function hitBumper(b) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const d = Math.hypot(dx, dy)
  if (d >= b.r + R) return
  const nx = dx / d
  const ny = dy / d
  ball.x = b.x + nx * (b.r + R)
  ball.y = b.y + ny * (b.r + R)
}

  BUMPERS.forEach(hitBumper)
```

# --meaning--

- `dx`, `dy` go from the bumper's centre to the ball's; `d` is the distance.
- If `d` is at least `b.r + R` they do not touch.
- Otherwise `(nx, ny)` is that direction made one pixel long, and the ball is put exactly `b.r + R` away from the
  centre.
- `BUMPERS.forEach(hitBumper)` in `step` checks every bumper in every small step.

# --meaning-tr--

- `dx`, `dy` → tamponun merkezinden topun merkezine giden ok; `d` onun uzunluğu, yani iki merkez arası uzaklık.
- `if (d >= b.r + R) return` → uzaklık iki yarıçapın toplamından küçük değilse değmiyorlar: bir şey yapmadan çık.
- `nx = dx / d`, `ny = dy / d` → oku 1 piksel uzunluğa indir: tampondan dışarı bakan **normal**.
- `ball.x = b.x + nx * (b.r + R)` → topu merkezden bu yönde tam `b.r + R` uzağa koy: tampona **tam değiyor**.
- `BUMPERS.forEach(hitBumper)` → `step` içinde her tamponu dene. `forEach`'e bir fonksiyonun **adını** verdik;
  o da `hitBumper`'ı her tamponla kendisi çağırır: `hitBumper(BUMPERS[0])`, `hitBumper(BUMPERS[1])`, ...

# --task--

1. Write `hitBumper` above `function step() {`, with an empty line after it.
2. In `step`, under the walls line, write `BUMPERS.forEach(hitBumper)`.

# --task-tr--

1. `hitBumper` fonksiyonunu `function step() {` satırının **üstüne** yaz; altında bir boş satır kalsın.
2. `step` içinde duvarları deneyen `for (const w of WALLS) ...` satırının **altına** `BUMPERS.forEach(hitBumper)` yaz.
3. **Çalıştır** ve fırlat.

# --predict--

The ball falls onto a bumper. What does it do now?
- [ ] It bounces off hard
- [x] It slides around the bumper, without bouncing
  We push it out, but we do not change its speed yet.
- [ ] It goes through it

# --predict-tr--

Top bir tamponun üstüne düşüyor. Şimdi ne yapar?
- [ ] Sertçe geri seker
- [x] Sekmeden, tamponun etrafından kayarak geçer
  Onu dışarı itiyoruz ama hızını henüz değiştirmiyoruz.
- [ ] İçinden geçer

# --tests--

`hitBumper` should push a touching ball out of the bumper.
tr: `hitBumper` değen topu tampondan dışarı itmeli.

```js
const b = BUMPERS[0]
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b)
assert.closeTo(ball.x, b.x - b.r - R, 1e-9, 'pushed out to the left')
assert.strictEqual(ball.y, b.y)
ball = { x: 250, y: 400, vx: 3, vy: 0 }
hitBumper(b)
assert.deepEqual(ball, { x: 250, y: 400, vx: 3, vy: 0 }, 'a far ball is left alone')
```

During play, the ball should never be inside a bumper.
tr: Oyun sırasında top asla bir tamponun içinde olmamalı.

```js
launch()
const b = BUMPERS[2]
ball = { x: b.x, y: b.y - 40, vx: 0, vy: 4 }
for (let i = 0; i < 20; i++) {
  $.tick(1)
  assert.isAtLeast(Math.hypot(ball.x - b.x, ball.y - b.y), b.r + R - 1e-6)
}
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
