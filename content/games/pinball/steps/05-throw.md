---
title: The throw
title_tr: Fırlatış
skills: [game.physics]
---

# --explanation--

Try it now: a ball resting on a flipper barely moves when you flip. The flipper pushes the ball out of the way, but our bounce only
looks at the **ball's** speed, and the ball was still. A real flipper *throws* the ball because the flipper itself is moving.

The fix is to bounce off the **relative** speed: the ball's velocity minus the velocity of the surface at the point of contact.

How fast does a point on a turning flipper move? A point at distance `r` from the pivot, turning at `speed` radians per frame,
moves `speed × r` pixels per frame, at right angles to the flipper:

```js
surface = { x: -speed * (py - pivotY), y: speed * (px - pivotX) }
```

So the **tip** moves much faster than the part near the pivot: hitting the ball with the end of the flipper sends it farther, just
like on a real table.

`hitSegment` now takes an optional `surface(px, py)` function. Walls do not pass one (they do not move), flippers do. When the
surface moves into the ball, the ball gets that speed on top of its bounce. A still ball hit by a surface moving up at 10 leaves at
10.

# --explanation-tr--

Şimdi dene: bir paletin üstünde duran top palete bastığında zar zor kıpırdar. Palet topu yoldan iter ama sekme yalnızca **topun**
hızına bakar ve top duruyordu. Gerçek bir palet topu *fırlatır*, çünkü paletin kendisi hareket ediyordur.

Çözüm **göreli** hızdan sekmektir: topun hızı eksi yüzeyin temas noktasındaki hızı.

Dönen bir paletteki bir nokta ne kadar hızlı hareket eder? Eksenden `r` uzaklıktaki, karede `speed` radyan dönen bir nokta, palete dik
olarak karede `speed × r` piksel hareket eder:

```js
surface = { x: -speed * (py - pivotY), y: speed * (px - pivotX) }
```

Yani **uç**, eksene yakın kısımdan çok daha hızlı hareket eder: topa paletin ucuyla vurmak onu daha uzağa gönderir, tıpkı gerçek bir
masadaki gibi.

`hitSegment` artık isteğe bağlı bir `surface(px, py)` fonksiyonu alır. Duvarlar bir tane vermez (hareket etmezler), paletler verir.
Yüzey topa doğru hareket ettiğinde top sekmesinin üstüne o hızı alır. Yukarı 10 hızla hareket eden bir yüzeyin vurduğu duran top 10
hızla ayrılır.

# --task--

1. Give `hitSegment` a sixth parameter, `surface`: when there is one, compute the surface velocity `(sx, sy)` at the closest point
   and bounce on the relative velocity: `vn = (vx - sx) * nx + (vy - sy) * ny`.
2. When `step()` collides the ball with a flipper, pass `(px, py) => ({ x: -f.speed * (py - f.y), y: f.speed * (px - f.x) })`.

# --task-tr--

1. `hitSegment`'e altıncı bir parametre, `surface` ver: varsa en yakın noktadaki yüzey hızını `(sx, sy)` hesapla ve göreli hız
   üzerinden sektir: `vn = (vx - sx) * nx + (vy - sy) * ny`.
2. `step()` topu bir paletle çarpıştırırken `(px, py) => ({ x: -f.speed * (py - f.y), y: f.speed * (px - f.x) })` ver.

# --tests--

A ball resting on the left flipper should be thrown when it flips.
tr: Sol paletin üstünde duran bir top, palet kalkınca fırlatılmalı.

```js
launch()
const f = flippers[0]
const t = tip(f)
ball = { x: f.x + (t.x - f.x) * 0.8, y: f.y + (t.y - f.y) * 0.8 - R - 1, vx: 0, vy: 0 }
$.tick(2)
pressed.left = true
$.tick(4)
assert.isBelow(ball.vy, -6, 'the flipper throws the ball')
```

The far end should move faster, and a moving surface should give a still ball its speed.
tr: Uzak uç daha hızlı hareket etmeli ve hareket eden bir yüzey duran bir topa hızını vermeli.

```js
const f = { x: 0, y: 0, speed: 0.25 }
const point = { x: 50, y: 0 }
const v = { x: -f.speed * (point.y - f.y), y: f.speed * (point.x - f.x) }
assert.deepEqual(v, { x: -0, y: 12.5 }, 'the far end moves faster')
launch()
ball = { x: 200, y: 400, vx: 0, vy: 0 }
assert.isTrue(hitSegment(190, 405, 210, 405, 0, () => ({ x: 0, y: -10 })), 'a surface moving up into a still ball')
assert.closeTo(ball.vy, -10, 1e-9, 'gives it the surface speed')
```

The right flipper should throw too.
tr: Sağ palet de fırlatmalı.

```js
launch()
const f = flippers[1]
const t = tip(f)
ball = { x: f.x + (t.x - f.x) * 0.8, y: f.y + (t.y - f.y) * 0.8 - R - 1, vx: 0, vy: 0 }
$.tick(2)
pressed.right = true
$.tick(4)
assert.isBelow(ball.vy, -6, 'the right one too')
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
