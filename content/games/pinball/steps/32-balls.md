---
title: Three balls
title_tr: Üç top
skills: [game.state]
---

# --goal--

A game has three balls. Each drained ball uses one; when none are left the state becomes `'over'` and the physics
stops.

# --goal-tr--

Şimdiye kadar top düştükçe sonsuza kadar yenisi geliyordu. Gerçek pinball'da **üç top** hakkın vardır: her düşen
top bir hak yer, hak bitince oyun biter.

`state`'e üçüncü bir değer ekliyoruz: `'over'` (bitti). Oyun bitince fizik de durmalı.

# --code--

```js
let state // 'ready' (in the lane), 'playing' or 'over'
let balls

  balls = 3

  if (state !== 'playing') return

  if (ball.y > canvas.height + R) {
    balls -= 1
    if (balls > 0) newBall()
    else {
      state = 'over'
    }
  }
```

# --meaning--

- `reset` gives three balls.
- A drained ball takes one away; if any are left a new ball comes, otherwise the game is `'over'`.
- `if (state !== 'playing') return` after the ready block stops the physics when the game is over; without it the
  lost ball would keep falling and take away a ball every frame.

# --meaning-tr--

- `let balls` → kalan top hakkı; `reset` onu 3 yapar.
- `balls -= 1` → düşen top bir hak yer.
- `if (balls > 0) newBall()` → hak kaldıysa kanalda yeni top.
- `else { state = 'over' }` → kalmadıysa oyun biter. Süslü parantez şimdilik tek satırı sarıyor; birazdan içine bir
  şey daha ekleyeceğiz.
- `if (state !== 'playing') return` → `'ready'` bloğunun altında: durum `'playing'` değilse (yani `'over'` ise) fizik
  çalışmaz. Bu satır olmasaydı düşen top düşmeye devam eder, drenaj kontrolü **her karede** bir hak daha silerdi.
- `let state` yorumu da üç değeri söyleyecek şekilde güncelleniyor.

# --task--

1. Update the comment of `let state`; under `let score` write `let balls`.
2. In `reset`, under `score = 0`, write `balls = 3`.
3. In `update`, under the ready block's `}`, write `if (state !== 'playing') return`.
4. Replace the last line of `update` (the drained ball) with the new block.

# --task-tr--

1. `let state` satırının yorumunu koddaki gibi yap; `let score` satırının altına `let balls` yaz.
2. `reset` içinde `score = 0` satırının altına `balls = 3` yaz.
3. `update` içinde `'ready'` bloğunun kapanan `}` satırının **altına** `if (state !== 'playing') return` yaz.
4. `update`'in son satırını (`if (ball.y > canvas.height + R) newBall() ...`) sil; yerine yeni bloğu yaz.
5. **Çalıştır** ve üç topu da kaçır: dördüncü top gelmemeli.

# --tests--

A game should start with three balls, and losing all three should end it.
tr: Oyun üç topla başlamalı; üçünü de kaybetmek oyunu bitirmeli.

```js
assert.strictEqual(balls, 3)
for (let n = 3; n > 0; n--) {
  assert.strictEqual(state, 'ready')
  launch()
  ball = { x: 200, y: 590, vx: 0, vy: 3 }
  $.tick(10)
}
assert.strictEqual(state, 'over')
assert.strictEqual(balls, 0)
```

After the game is over, nothing more should happen.
tr: Oyun bittikten sonra başka bir şey olmamalı.

```js
state = 'over'
balls = 0
ball = { x: 200, y: 300, vx: 0, vy: 2 }
$.tick(30)
assert.deepEqual(ball, { x: 200, y: 300, vx: 0, vy: 2 }, 'the physics stops')
assert.strictEqual(balls, 0)
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
