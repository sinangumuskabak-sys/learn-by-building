---
title: Pull the spring
title_tr: Yayı ger
skills: [game.physics, game.input]
---

# --goal--

The longer you hold, the harder the launch. While the ball waits and the key is held, `charge` grows from 0 to 1 in
about a second; letting go launches at a speed between 13 and 19.

# --goal-tr--

Yay ne kadar çekilirse top o kadar hızlı fırlar. Bunu bir sayıyla tutuyoruz: `charge` (gerginlik).

- Top beklerken tuş basılıysa, `charge` her karede biraz artar: yaklaşık **bir saniyede 0'dan 1'e**.
- Bırakınca hız `13 + 6 × charge`: hemen bırakırsan 13, tam gerersen 19.

Böylece topu kanaldan zar zor çıkarmak da, tepeye fırlatmak da senin elinde.

# --code--

```js
let charge // 0 to 1 while the launcher is held

  charge = 0

    if (pressed.launch) charge = Math.min(1, charge + 0.02)

  ball.vy = -(13 + 6 * charge)
  charge = 0
```

# --meaning--

- `newBall` resets `charge` for each new ball.
- In the ready block, holding adds 0.02 a frame; `Math.min(1, ...)` stops it at 1 (50 frames, under a second).
- `launch` turns the charge into speed and empties the spring.

# --meaning-tr--

- `let charge` → yayın gerginliği: 0 (gevşek) ile 1 (tam gerili) arası.
- `charge = 0` (`newBall` içinde) → her yeni top gevşek bir yayla başlar.
- `if (pressed.launch) charge = Math.min(1, charge + 0.02)` → `'ready'` bloğunda: tuş basılıysa her karede 0.02
  ekle. `Math.min(1, ...)` iki sayıdan **küçüğünü** seçer, yani `charge` 1'i geçmez. 50 karede (bir saniyeden az)
  tam gerilir.
- `ball.vy = -(13 + 6 * charge)` → gerginliği hıza çevir: 13 ile 19 arası, yukarı (eksi).
- `charge = 0` → fırlattıktan sonra yay boşalır.

# --task--

1. Under `let pressed` write `let charge`.
2. In `newBall`, under the `ball = ...` line, write `charge = 0`.
3. In `update`'s ready block, under the flippers line, write the `charge` line.
4. In `launch`, replace `ball.vy = -16` with the two lines.

# --task-tr--

1. `let pressed ...` satırının altına `let charge ...` yaz.
2. `newBall` içinde `ball = { ... }` satırının altına `charge = 0` yaz.
3. `update` içindeki `'ready'` bloğunda `for (const f of flippers) f.angle += f.speed` satırının altına `charge`
   satırını yaz.
4. `launch` içinde `ball.vy = -16` satırını sil; yerine iki satırı yaz.
5. **Çalıştır**: Boşluk'a kısa bas ve bırak, sonra uzun tut ve bırak. Farkı gör.

# --try--

Launch with a very short tap: sometimes the ball does not leave the lane and rolls back to wait again.

# --try-tr--

Çok kısa bir basışla fırlat: bazen top kanaldan çıkamaz ve geri yuvarlanıp yine bekler.

# --tests--

Holding Space should pull the spring, and letting go should launch harder the longer it was held.
tr: Boşluk'u tutmak yayı germeli; bırakmak, ne kadar uzun tutulduysa o kadar sert fırlatmalı.

```js
assert.strictEqual(charge, 0)
$.press(' ')
$.tick(25)
assert.closeTo(charge, 0.5, 1e-9, 'holding pulls the spring')
$.tick(50)
assert.strictEqual(charge, 1, 'but never past 1')
$.release(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(ball.vy, -19, 'a full pull launches hardest')
assert.strictEqual(charge, 0, 'and the spring is empty again')
```

A quick tap should launch at the weakest speed.
tr: Kısa bir dokunuş en zayıf hızla fırlatmalı.

```js
$.press(' ')
$.release(' ')
assert.strictEqual(ball.vy, -13)
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
let charge // 0 to 1 while the launcher is held
let state // 'ready' (in the lane), 'playing' or 'over'
let score
let balls
let flash // frames each bumper stays lit
let best = Number(localStorage.getItem('pinball-best')) || 0

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  charge = 0
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
    if (pressed.launch) charge = Math.min(1, charge + 0.02)
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
  ball.vy = -(13 + 6 * charge)
  charge = 0
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
