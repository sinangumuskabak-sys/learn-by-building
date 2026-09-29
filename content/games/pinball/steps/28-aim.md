---
title: Which way to turn
title_tr: Hangi yöne dönmeli
skills: [game.physics, game.state]
---

# --goal--

Each frame a flipper picks a target (up if its key is held, rest otherwise) and a turning speed towards it:
`FLIP_SPEED` a frame, or just the rest of the way when it is nearly there.

# --goal-tr--

Palet ışınlanmaz; hedefine doğru **döner**. Her karede şuna karar veriyoruz:

1. **Hedef:** tuşu basılıysa `up` açısı, değilse `rest` açısı.
2. **Hız:** hedefe doğru karede `FLIP_SPEED` (0.25 radyan). Ama hedefe bundan daha az kaldıysa, yalnız **kalan
   kadar**; böylece hedefi aşmaz, tam üstünde durur.

Bu adımda yalnız hızı hesaplıyoruz. Açıyı değiştirmek bir sonraki adımda.

# --code--

```js
const FLIP_SPEED = 0.25 // radians per frame

  for (const f of flippers) {
    // Up while the key is held, back down when it is let go, and stop at either end.
    const target = pressed[f.key] ? f.up : f.rest
    const dir = Math.sign(target - f.angle)
    f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
  }
```

# --meaning--

- `pressed[f.key]` reads the field named by `f.key`: `pressed.left` for the left flipper.
- `Math.sign` gives 1, -1 or 0: which way to turn. `Math.abs` drops the minus: how far there is to go.
- If the distance is less than one step, the speed is exactly the distance; otherwise a full step in direction `dir`.
- Using `dir` instead of assuming "up is smaller" makes the same code right for the right flipper, whose up angle is
  the bigger one.

# --meaning-tr--

- `const FLIP_SPEED = 0.25` → paletin bir karede dönebileceği en büyük açı.
- `pressed[f.key]` → **köşeli parantezle alan okumak**. `f.key` `'left'` ise bu `pressed.left` ile aynı. Böylece
  her palet kendi tuşuna bakar.
- `const target = pressed[f.key] ? f.up : f.rest` → tuş basılıysa hedef yukarı, değilse dinlenme açısı.
- `Math.sign(sayı)` → sayının **işareti**: artıysa `1`, eksiyse `-1`, sıfırsa `0`. `dir` hangi yöne döneceğimiz.
- `Math.abs(sayı)` → sayının eksisini atar: hedefe **ne kadar** kaldığı.
- `f.speed = ... < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED` → kalan yol bir adımdan azsa hız tam kalan
  yol; değilse `dir` yönünde tam bir adım.
- Sağ palet sola baktığı için onun "yukarısı" **daha büyük** açı (`Math.PI + 0.45`). "Yukarı hep küçük açı" diye
  varsaysaydık sağ palet ters dönerdi; `dir` ile çalışmak iki palette de doğru.

# --task--

1. Under `FLIPPER_LENGTH` write `FLIP_SPEED`.
2. In `update`, under the `flash = ...` line, write the `for` loop.

# --task-tr--

1. `const FLIPPER_LENGTH = 62` satırının altına `FLIP_SPEED` satırını yaz.
2. `update` içinde `flash = flash.map(...)` satırının **altına**, `if (state === 'ready') return` satırının üstüne
   `for` döngüsünü yaz.
3. **Çalıştır** ve Sol oka bas.

# --predict--

You hold the Left arrow. What does the left flipper do?
- [ ] It flips up
- [x] Nothing yet
  Its `speed` is set, but nothing adds the speed to the angle yet.
- [ ] It flips down

# --predict-tr--

Sol oku basılı tutuyorsun. Sol palet ne yapar?
- [ ] Yukarı kalkar
- [x] Henüz hiçbir şey
  `speed` hesaplanıyor ama onu açıya ekleyen bir satır henüz yok.
- [ ] Aşağı iner

# --tests--

Holding a key should give its flipper a full turning speed towards up.
tr: Tuşu basılı tutmak paletine yukarı doğru tam dönüş hızı vermeli.

```js
assert.strictEqual(FLIP_SPEED, 0.25)
pressed.left = true
$.tick(1)
assert.closeTo(flippers[0].speed, -0.25, 1e-9, 'the left flipper turns up: to smaller angles')
assert.strictEqual(flippers[1].speed, 0, 'the right one is already at its target')
pressed.right = true
$.tick(1)
assert.closeTo(flippers[1].speed, 0.25, 1e-9, 'the right flipper turns up: to bigger angles')
```

Near the target, the speed should be just the rest of the way.
tr: Hedefe yakınken hız yalnız kalan yol kadar olmalı.

```js
flippers[0].angle = -0.4
pressed.left = true
$.tick(1)
assert.closeTo(flippers[0].speed, -0.05, 1e-9)
pressed.left = false
$.tick(1)
assert.closeTo(flippers[0].speed, 0.25, 1e-9, 'let go: back down')
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
let state // 'ready' (in the lane) or 'playing'
let score
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false }
  score = 0
  flash = BUMPERS.map(() => 0)
  newBall()
}

const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

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
  for (const f of flippers) {
    const t = tip(f)
    hitSegment(f.x, f.y, t.x, t.y, 0.3)
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
