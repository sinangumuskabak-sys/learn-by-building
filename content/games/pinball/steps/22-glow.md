---
title: Light it up
title_tr: Yak
skills: [game.canvas]
---

# --goal--

While a bumper's counter is above 0 it is drawn yellow instead of red.

# --goal-tr--

Şimdi yakmayı çiziyoruz: bir tamponun sayacı 0'dan büyükse **sarı**, değilse kırmızı çizilsin.

# --code--

```js
BUMPERS.forEach((b, i) => {
  ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
```

# --meaning--

- The drawing's `forEach` also takes the index `i`.
- `condition ? a : b` picks `a` if the condition is true, otherwise `b`: yellow while lit, red otherwise.

# --meaning-tr--

- `(b, i) =>` → çizimdeki `forEach` de artık tamponun sırasını alıyor.
- `flash[i] > 0 ? '#fde047' : '#e11d48'` → **koşul ? a : b** yazımı: koşul doğruysa `a`'yı, değilse `b`'yi seçer.
  Kısa bir `if`/`else` gibi. Sayaç 0'dan büyükse sarı, değilse kırmızı.

# --task--

In `draw`, change the bumpers' `forEach` to `(b, i)` and its color line to the `? :` choice.

# --task-tr--

1. `draw` içinde `BUMPERS.forEach((b) => {` satırını `BUMPERS.forEach((b, i) => {` yap.
2. Altındaki `ctx.fillStyle = '#e11d48'` satırını koddaki gibi değiştir.
3. **Çalıştır**, fırlat ve bir tampona çarpmasını izle.

# --predict--

A bumper is hit. What happens to its color?
- [ ] It turns yellow for a moment, then red again
- [x] It turns yellow and stays yellow
  Nothing counts the 10 frames down yet.
- [ ] It stays red

# --predict-tr--

Bir tampon vuruldu. Rengine ne olur?
- [ ] Bir an sarı olur, sonra yine kırmızı
- [x] Sarı olur ve sarı kalır
  10 kareyi geri sayan bir şey henüz yok.
- [ ] Kırmızı kalır

# --tests--

A lit bumper should be drawn yellow, the others red.
tr: Yanan tampon sarı, diğerleri kırmızı çizilmeli.

```js
flash[1] = 5
$.tick(1)
const b = BUMPERS[1]
assert.deepInclude($.arcs(), { x: b.x, y: b.y, r: 22, color: '#fde047' })
assert.lengthOf($.arcs().filter((a) => a.color === '#e11d48'), 2)
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
