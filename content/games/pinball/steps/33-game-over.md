---
title: Balls left and game over
title_tr: Kalan toplar ve oyun sonu
skills: [game.canvas]
---

# --goal--

The balls left are written at the top right. When the game is over, a dark box in the middle says so.

# --goal-tr--

Oyuncu kaç topu kaldığını görmeli: sağ üste `Balls 3` yazacağız. Oyun bitince de masanın ortasında yarı saydam koyu
bir kutu ve içinde `Game over` yazısı çıksın.

# --code--

```js
ctx.textAlign = 'right'
ctx.fillText('Balls ' + balls, 330, 50)
ctx.textAlign = 'center'
if (state === 'over') {
  ctx.fillStyle = 'rgba(12, 10, 9, 0.85)'
  ctx.fillRect(60, 330, 280, 80)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText('Game over', 200, 364)
  ctx.font = '15px sans-serif'
  ctx.fillText('Space to play again', 200, 392)
}
```

# --meaning--

- `textAlign = 'right'` makes the text end at the given x, so `Balls` lines up with the right side of the table.
- `textAlign = 'center'` centres the texts that follow on x = 200.
- `rgba(12, 10, 9, 0.85)` is the table's color with 85% opacity: a box you can faintly see through.

# --meaning-tr--

- `ctx.textAlign = 'right'` → yazı verilen `x`'te **bitsin** (sağa hizalı). `Balls 3` masanın sağ üstüne yaslanır.
- `ctx.textAlign = 'center'` → bundan sonraki yazılar verilen `x`'e göre **ortalansın**. Masanın ortası `x = 200`.
- `if (state === 'over') {` → yalnız oyun bitince:
  - `'rgba(12, 10, 9, 0.85)'` → renk kırmızı, yeşil, mavi ve **saydamlıkla** verilir. İlk üçü masanın rengi; `0.85`
    %85 opak demek: arkası hafifçe görünen bir kutu.
  - `ctx.fillRect(60, 330, 280, 80)` → ortada 280×80'lik kutu.
  - Kalın `Game over` ve altında küçük bir açıklama. (Boşluk'la yeniden başlatmayı sonraki adımda yazacağız.)

# --task--

In `draw`, under the `Score` line, write the lines shown.

# --task-tr--

1. `draw` içinde `ctx.fillText('Score ' + score, 30, 50)` satırının **altına** koddaki satırları yaz.
2. **Çalıştır**: sağ üstte `Balls 3` görünmeli; üç topu kaçırınca ortada `Game over` kutusu çıkmalı.

# --tests--

The balls left should be written on the table.
tr: Kalan toplar masaya yazılmalı.

```js
$.tick(1)
assert.include($.texts(), 'Balls 3')
balls = 1
$.tick(1)
assert.include($.texts(), 'Balls 1')
```

A finished game should show a box with `Game over`.
tr: Biten oyun `Game over` yazılı bir kutu göstermeli.

```js
$.tick(1)
assert.notInclude($.texts(), 'Game over', 'not while playing')
state = 'over'
$.tick(1)
assert.include($.texts(), 'Game over')
assert.include($.texts(), 'Space to play again')
assert.deepInclude($.rects(), { x: 60, y: 330, w: 280, h: 80, color: 'rgba(12, 10, 9, 0.85)' })
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
const FLIP_SPEED = 0.25 // radians per frame
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let pressed // { left, right }
let state // 'ready' (in the lane), 'playing' or 'over'
let score
let balls
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false }
  score = 0
  balls = 3
  flash = BUMPERS.map(() => 0)
  newBall()
}

const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

// Push the ball out of a segment and bounce it. `surface` is how fast the segment itself moves at that point:
// the bounce works on the speed of the ball relative to the surface, which is how a flipper throws the ball.
function hitSegment(x1, y1, x2, y2, bounce, surface) {
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
  const sx = surface ? surface(px, py).x : 0
  const sy = surface ? surface(px, py).y : 0
  const vn = (ball.vx - sx) * nx + (ball.vy - sy) * ny
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
  for (const f of flippers) {
    f.angle += f.speed / SUB
    const t = tip(f)
    // A point on a turning flipper moves at speed × distance from the pivot, at right angles to it.
    hitSegment(f.x, f.y, t.x, t.y, 0.3, (px, py) => ({ x: -f.speed * (py - f.y), y: f.speed * (px - f.x) }))
  }
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  for (const f of flippers) {
    // Up while the key is held, back down when it is let go, and stop at either end.
    const target = pressed[f.key] ? f.up : f.rest
    const dir = Math.sign(target - f.angle)
    f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
  }
  if (state === 'ready') {
    for (const f of flippers) f.angle += f.speed
    return
  }
  if (state !== 'playing') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) {
    balls -= 1
    if (balls > 0) newBall()
    else {
      state = 'over'
    }
  }
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}

function key(event, down) {
  const k = event.key
  if (k === 'ArrowLeft' || k === 'z' || k === 'Z') pressed.left = down
  else if (k === 'ArrowRight' || k === '/' || k === 'm' || k === 'M') pressed.right = down
  else if (k === ' ' || k === 'ArrowDown') {
    if (down) launch()
  } else return
  event.preventDefault()
}

document.addEventListener('keydown', (event) => key(event, true))
document.addEventListener('keyup', (event) => key(event, false))

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
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 10
  for (const f of flippers) {
    const t = tip(f)
    ctx.beginPath()
    ctx.moveTo(f.x, f.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
  ctx.textAlign = 'right'
  ctx.fillText('Balls ' + balls, 330, 50)
  ctx.textAlign = 'center'
  if (state === 'over') {
    ctx.fillStyle = 'rgba(12, 10, 9, 0.85)'
    ctx.fillRect(60, 330, 280, 80)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Game over', 200, 364)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space to play again', 200, 392)
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
