---
title: Launch on letting go
title_tr: Bırakınca fırlat
skills: [game.input]
---

# --goal--

A real launcher is a spring: you pull it back and let go. So Space launches when it is released, and only if it was
really held: `pressed.launch` remembers that.

# --goal-tr--

Gerçek pinball'da fırlatıcı bir **yaydır**: kolu geri çekersin ve **bırakınca** top fırlar. Bizde de Boşluk'a
basmak yayı çekecek, **bırakmak** fırlatacak.

Bırakma anında "bu tuş gerçekten basılı tutulmuş muydu?" diye soruyoruz; basılmadan gelen tek başına bir
"bırakıldı" olayı topu fırlatmasın. Bu bilgiyi paletlerinki gibi `pressed`'te tutuyoruz: `pressed.launch`. Bu adımda
hız yine sabit; bir sonraki adımda ne kadar tuttuğuna göre değişecek.

# --code--

```js
let pressed // { left, right, launch }

  pressed = { left: false, right: false, launch: false }

    if (down && state === 'over') reset()
    else if (!down && pressed.launch) launch()
    pressed.launch = down
```

# --meaning--

- `pressed.launch` is true while the launch key is held.
- On the way up (`!down`), if the key was held, we launch. Then `pressed.launch = down` records the new state.
- After game over, the press that restarts the game also starts holding the new ball's launcher: letting go launches it.

# --meaning-tr--

- `pressed.launch` → fırlatma tuşu şu an basılı mı. `reset` onu da `false` yapar.
- `else if (!down && pressed.launch) launch()` → `!` "değil" demek: `!down` tuş **bırakılıyorsa**. Bırakılıyorsa ve
  önceden basılı tutulmuşsa: fırlat.
- `pressed.launch = down` → her seferinde tuşun yeni durumunu kaydet: basınca `true`, bırakınca `false`.
- Oyun bitmişken basılan Boşluk önce `reset()`'i çağırır, sonra alttaki satır `pressed.launch`'ı `true` yapar. Yani
  aynı basış hem yeni oyunu başlatır hem de yeni topun yayını tutmaya başlar; bırakınca top fırlar.

# --task--

1. Add `launch` to the comment of `let pressed` and to the `pressed` object in `reset`.
2. In `key`, replace `else if (down) launch()` with the two lines.

# --task-tr--

1. `let pressed` satırının yorumuna `launch` ekle; `reset` içindeki `pressed = { ... }` nesnesine `launch: false`
   ekle.
2. `key` içinde `else if (down) launch()` satırını sil; yerine iki satırı yaz.
3. **Çalıştır**: Boşluk'a bas, bekle, bırak: top **bırakınca** fırlamalı.

# --tests--

Pressing Space should not launch yet; letting go should.
tr: Boşluk'a basmak henüz fırlatmamalı; bırakmak fırlatmalı.

```js
$.press(' ')
assert.isTrue(pressed.launch, 'the launch key is held')
assert.strictEqual(state, 'ready', 'not launched while held')
$.release(' ')
assert.isFalse(pressed.launch)
assert.strictEqual(state, 'playing', 'launched on letting go')
```

Letting go of a key that was not held should do nothing.
tr: Basılı tutulmamış bir tuşu bırakmak bir şey yapmamalı.

```js
$.release(' ')
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
const FLIPPER_LENGTH = 62
const FLIP_SPEED = 0.25 // radians per frame
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let pressed // { left, right, launch }
let state // 'ready' (in the lane), 'playing' or 'over'
let score
let balls
let flash // frames each bumper stays lit
let best = Number(localStorage.getItem('pinball-best')) || 0

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false, launch: false }
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
      if (score > best) {
        best = score
        localStorage.setItem('pinball-best', best)
      }
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
    if (down && state === 'over') reset()
    else if (!down && pressed.launch) launch()
    pressed.launch = down
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
  ctx.font = '13px sans-serif'
  ctx.fillText('Best ' + best, 200, 50)
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
