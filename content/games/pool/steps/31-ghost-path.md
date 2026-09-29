---
title: Where the hit ball goes
title_tr: Çarpılan top nereye gider
skills: [game.physics, game.canvas]
---

# --goal--

The hit ball leaves along the line from the ghost ball's centre through its own centre: that is the normal of the
collision. We draw that line too, so you can aim a ball into a pocket.

# --goal-tr--

Çarpılan top hangi yöne gidecek? `collide`'ı hatırla: hız **normal boyunca** aktarılıyordu, yani hayalet topun
merkezinden çarpılan topun merkezine giden çizgi boyunca. Bu çizgiyi de çizeceğiz. Artık bir topu cebe **nişanlayabilirsin**.

# --code--

```js
// The ball that is hit goes off along the line from the ghost ball through its centre.
const dx = g.ball.x - g.x
const dy = g.ball.y - g.y
ctx.beginPath()
ctx.moveTo(g.ball.x, g.ball.y)
ctx.lineTo(g.ball.x + dx * 3, g.ball.y + dy * 3)
ctx.stroke()
```

# --meaning--

- `(dx, dy)` goes from the ghost ball's centre to the hit ball's centre: `2R` long, pointing where it will go.
- The line starts at the hit ball and goes three times that far: 54 pixels.

# --meaning-tr--

- `dx`, `dy` → hayalet topun merkezinden çarpılan topun merkezine: uzunluğu tam `2R` (18), yönü topun gideceği yön.
- `ctx.moveTo(g.ball.x, g.ball.y)` → çarpılan topun merkezinden başla.
- `ctx.lineTo(g.ball.x + dx * 3, g.ball.y + dy * 3)` → o yönde üç katı kadar, 54 piksel.

# --task--

In the `if (g)` block, under the ghost ball's `ctx.stroke()`, write the comment and the six lines.

# --task-tr--

`if (g)` bloğunda hayalet topu çizen `ctx.stroke()` satırının altına yorum satırını ve altı satırı yaz. **Çalıştır**:
nişanı bir topun kenarına getir ve kısa çizginin nereyi gösterdiğine bak.

# --try--

Aim at the edge of a ball near a pocket, and turn the aim until the short line points into the pocket. Then shoot!

# --try-tr--

Bir cebin yakınındaki bir topun kenarına nişan al ve kısa çizgi cebe bakana kadar nişanı çevir. Sonra vur!

# --tests--

A line should show where the hit ball will go.
tr: Çarpılan topun gideceği yönü bir çizgi göstermeli.

```js
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends, '384,160', 'straight on: ball 1 goes straight ahead')
balls = [cue, ball(230, 170, '#fff', 3)]
$.tick(1)
const g = ghost()
const ends2 = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map((v) => v.toFixed(2)).join())
assert.include(ends2, [230 + (230 - g.x) * 3, 170 + (170 - g.y) * 3].map((v) => v.toFixed(2)).join())
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
const POCKETS = [
  [LEFT, TOP], [240, TOP], [RIGHT, TOP],
  [LEFT, BOTTOM], [240, BOTTOM], [RIGHT, BOTTOM],
]
const POCKET_R = 15
const FRICTION = 0.985 // speed kept each frame
const BOUNCE = 0.8 // speed kept when hitting a cushion
const MAX_POWER = 16
const SUB = 8 // physics steps per frame, so fast balls cannot jump through each other
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let dragging
let shots
let state // 'aiming', 'rolling' or 'won'

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}

function reset() {
  rack()
  aim = 0
  power = 8
  dragging = false
  shots = 0
  state = 'aiming'
}

function shoot() {
  if (state !== 'aiming') return
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
  shots += 1
  state = 'rolling'
}

// Two balls of the same mass that touch swap the parts of their velocities that point along the line between them.
function collide(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  if (dist >= R * 2 || dist === 0) return
  const nx = dx / dist
  const ny = dy / dist
  // Push them apart so they only just touch.
  const overlap = (R * 2 - dist) / 2
  a.x -= nx * overlap
  a.y -= ny * overlap
  b.x += nx * overlap
  b.y += ny * overlap
  const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (along <= 0) return // already moving apart
  a.vx -= along * nx
  a.vy -= along * ny
  b.vx += along * nx
  b.vy += along * ny
}

function pocketed(b) {
  return POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)
}

function step() {
  for (const b of balls) {
    b.x += b.vx / SUB
    b.y += b.vy / SUB
    // Cushions: reflect the velocity and lose a little speed.
    if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
    if (b.x > RIGHT - R) [b.x, b.vx] = [RIGHT - R, -b.vx * BOUNCE]
    if (b.y < TOP + R) [b.y, b.vy] = [TOP + R, -b.vy * BOUNCE]
    if (b.y > BOTTOM - R) [b.y, b.vy] = [BOTTOM - R, -b.vy * BOUNCE]
  }
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j])
  balls = balls.filter((b) => {
    if (!pocketed(b)) return true
    if (b.cue) shots += 1 // a scratch costs a shot
    return false
  })
}

// The cue ball comes back on its spot, or as close to it as there is room.
function respot() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  while (balls.some((b) => Math.hypot(b.x - cue.x, b.y - cue.y) < R * 2)) cue.x -= R
  balls.unshift(cue)
}

function update() {
  if (state !== 'rolling') return
  for (let i = 0; i < SUB; i++) step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (moving) return
  if (!balls.includes(cue)) respot()
  if (balls.length === 1) {
    state = 'won'
  } else state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === 'ArrowUp') power = Math.min(MAX_POWER, power + 1)
  else if (event.key === 'ArrowDown') power = Math.max(2, power - 1)
  else if (event.key === ' ') state === 'won' ? reset() : shoot()
  else return
  event.preventDefault()
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

// Pull back from the cue ball like a slingshot: the shot goes the other way, harder the further you pull.
function pull(point) {
  aim = Math.atan2(cue.y - point.y, cue.x - point.x)
  power = Math.min(MAX_POWER, Math.hypot(point.x - cue.x, point.y - cue.y) / 6)
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won') return reset()
  if (state !== 'aiming') return
  dragging = true
  pull(toCanvas(event))
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (power >= 1) shoot()
})

// Where the cue ball will first touch another ball along the aim: the "ghost ball".
function ghost() {
  const ux = Math.cos(aim)
  const uy = Math.sin(aim)
  let first = null
  for (const b of balls) {
    if (b === cue) continue
    const dx = b.x - cue.x
    const dy = b.y - cue.y
    const t = dx * ux + dy * uy // how far along the aim line the ball is
    const side = dx * dx + dy * dy - t * t // squared distance from the line
    if (t <= 0 || side >= R * R * 4) continue
    const hit = t - Math.sqrt(R * R * 4 - side)
    if (!first || hit < first.hit) first = { hit, ball: b, x: cue.x + ux * hit, y: cue.y + uy * hit }
  }
  return first
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
  for (const [px, py] of POCKETS) {
    ctx.fillStyle = '#020617'
    ctx.beginPath()
    ctx.arc(px, py, POCKET_R, 0, Math.PI * 2)
    ctx.fill()
  }

  if (state === 'aiming') {
    const g = ghost()
    const length = g ? g.hit : 400
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cue.x, cue.y)
    ctx.lineTo(cue.x + Math.cos(aim) * length, cue.y + Math.sin(aim) * length)
    ctx.stroke()
    if (g) {
      ctx.beginPath()
      ctx.arc(g.x, g.y, R, 0, Math.PI * 2)
      ctx.stroke()
      // The ball that is hit goes off along the line from the ghost ball through its centre.
      const dx = g.ball.x - g.x
      const dy = g.ball.y - g.y
      ctx.beginPath()
      ctx.moveTo(g.ball.x, g.ball.y)
      ctx.lineTo(g.ball.x + dx * 3, g.ball.y + dy * 3)
      ctx.stroke()
    }
  }

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
    if (b.cue) continue
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(b.number), b.x, b.y + 3)
  }

  // Power bar
  ctx.fillStyle = '#334155'
  ctx.fillRect(LEFT, 304, RIGHT - LEFT, 14)
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(LEFT, 304, ((RIGHT - LEFT) * power) / MAX_POWER, 14)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Shots ' + shots + '  Left ' + (balls.filter((b) => !b.cue).length), LEFT, 22)
  if (state === 'won') {
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Table cleared in ' + shots + ' shots!', canvas.width / 2, 170)
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
