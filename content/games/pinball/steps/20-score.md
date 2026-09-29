---
title: Points for every hit
title_tr: Her vuruşa puan
skills: [game.state, game.canvas]
---

# --goal--

Each bumper hit gives 100 points, and the score is written at the top left of the table.

# --goal-tr--

Her tampon vuruşu **100 puan** versin ve skor masanın sol üstünde yazsın.

# --code--

```js
score += 100

ctx.fillStyle = 'white'
ctx.font = 'bold 16px sans-serif'
ctx.textAlign = 'left'
ctx.fillText('Score ' + score, 30, 50)
```

# --meaning--

- `score += 100` at the end of `hitBumper` adds the points.
- `font` sets the size and style of text; `textAlign = 'left'` makes it start at the given x.
- `fillText(text, x, y)` writes the text; `'Score ' + score` joins the word and the number.

# --meaning-tr--

- `score += 100` (`hitBumper`'ın sonunda) → her vuruşta skora 100 ekle.
- `ctx.fillStyle = 'white'` → yazının rengi.
- `ctx.font = 'bold 16px sans-serif'` → yazı tipi: kalın, 16 piksel, düz (tırnaksız) harfler.
- `ctx.textAlign = 'left'` → yazı verilen `x` noktasından **başlasın** (sola hizalı).
- `ctx.fillText('Score ' + score, 30, 50)` → yazıyı `(30, 50)` noktasına yazar. `+` bir yazıyla bir sayıyı yan yana
  ekler: `score` 300 ise `'Score 300'` olur.

# --task--

1. In `hitBumper`, at the end, write `score += 100`.
2. In `draw`, at the end (under the ball), leave an empty line and write the four text lines.

# --task-tr--

1. `hitBumper` içinde **en sona**, `ball.vy += (-vn + 6) * ny` satırının altına `score += 100` yaz.
2. `draw` içinde **en sona**, topu çizen `ctx.fill()` satırının altına bir boş satır bırak ve dört yazı satırını yaz.
3. **Çalıştır**, fırlat ve tamponları vurdukça skorun arttığını izle.

# --predict--

The ball hits a bumper once. How many points do you think you get?
- [ ] Exactly 100
- [x] Sometimes more than 100
  The ball can touch the bumper in more than one small step before it flies away, and every touch counts. We fix
  that soon.
- [ ] 0, the text does not change

# --predict-tr--

Top bir tampona bir kez çarpıyor. Kaç puan alırsın sence?
- [ ] Tam 100
- [x] Bazen 100'den fazla
  Top uçup gitmeden önce birden fazla küçük adımda tampona değebilir ve her değiş sayılır. Bunu birazdan
  düzelteceğiz.
- [ ] 0, yazı değişmez

# --tests--

A bumper hit should give 100 points.
tr: Tampon vuruşu 100 puan vermeli.

```js
const b = BUMPERS[0]
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b)
assert.strictEqual(score, 100)
```

The score should be written on the table.
tr: Skor masaya yazılmalı.

```js
$.tick(1)
assert.include($.texts(), 'Score 0')
score = 300
$.tick(1)
assert.include($.texts(), 'Score 300')
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
  score += 100
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
