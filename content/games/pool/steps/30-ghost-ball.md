---
title: Draw the ghost ball
title_tr: Hayalet topu çiz
skills: [game.canvas]
---

# --goal--

While aiming, the aim line now ends at the ghost ball, and an outlined circle shows where the cue ball will touch.

# --goal-tr--

Nişan alırken çizgi artık **hayalet topta** bitsin ve orada içi boş bir daire, isteka topunun değeceği yeri göstersin.
Önüne top yoksa çizgi eskisi gibi 400 piksel.

# --code--

```js
const g = ghost()
const length = g ? g.hit : 400

ctx.lineTo(cue.x + Math.cos(aim) * length, cue.y + Math.sin(aim) * length)
ctx.stroke()
if (g) {
  ctx.beginPath()
  ctx.arc(g.x, g.y, R, 0, Math.PI * 2)
  ctx.stroke()
}
```

# --meaning--

- `length` is the distance to the ghost ball, or 400 when nothing is in the way.
- `stroke` instead of `fill` draws only the outline of the circle.

# --meaning-tr--

- `const g = ghost()` → tahmin edilen çarpma (ya da `null`).
- `const length = g ? g.hit : 400` → çizginin uzunluğu: çarpma varsa oraya kadar, yoksa 400.
- `lineTo` artık `400` yerine `length` kullanıyor.
- `if (g) { ... }` → çarpma varsa hayalet topu çiz: `arc` ile daire, ama `fill` yerine `stroke`: yalnız **çerçeve**.

# --task--

1. In `draw`, at the top of `if (state === 'aiming') {`, write the `g` and `length` lines.
2. In the `lineTo` line, replace both `400`s with `length`.
3. Under `ctx.stroke()`, write the `if (g)` block.

# --task-tr--

1. `draw` içinde `if (state === 'aiming') {` satırının hemen altına `g` ve `length` satırlarını yaz.
2. `lineTo` satırındaki iki `400`'ü `length` yap.
3. `ctx.stroke()` satırının altına `if (g) { ... }` bloğunu yaz.
4. **Çalıştır** ve nişanı çevir: hayalet top hedefteki topun önünde görünmeli.

# --tests--

The aim line should end at the ghost ball, and the ghost ball should be drawn.
tr: Nişan çizgisi hayalet topta bitmeli ve hayalet top çizilmeli.

```js
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends, '312,160', 'the aim line stops at the ghost ball')
assert.deepInclude($.arcs().map(({ x, y, r }) => ({ x: Math.round(x), y, r })), { x: 312, y: 160, r: 9 }, 'the ghost ball is drawn')
```

With nothing in the way, the line should be 400 pixels long.
tr: Önünde bir şey yokken çizgi 400 piksel olmalı.

```js
aim = Math.PI / 2
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends, '130,560')
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
