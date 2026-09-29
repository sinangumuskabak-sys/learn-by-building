---
title: Press to aim
title_tr: Basarak nişan al
skills: [game.input]
---

# --goal--

A press on the table aims with `pull`. The page may show the canvas smaller or larger than 480×340, so `toCanvas` turns the
event's position into canvas pixels. After a win, a press starts a new game.

# --goal-tr--

Masaya **basınca** `pull` o noktaya göre nişan alsın. Bir incelik var: sayfa canvas'ı ekranda 480×340'tan **küçük ya da
büyük** gösterebilir (telefonda küçülür). Olayın verdiği nokta ekran pikseli; `toCanvas` onu canvas pikseline çevirecek.

Kazandıktan sonra bir basış yeni oyun başlatsın; toplar yuvarlanırken ise basış bir şey yapmasın.

# --code--

```js
function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won') return reset()
  if (state !== 'aiming') return
  pull(toCanvas(event))
})
```

# --meaning--

- `getBoundingClientRect()` tells where the canvas is on screen and how big it is shown; the position is scaled by
  `canvas.width / rect.width`.
- `pointerdown` works for mouse, pen and finger. Won: new game. Rolling: nothing. Aiming: pull.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yeri ve gösterilen boyu.
- `event.clientX - rect.left` → canvas'ın sol kenarından uzaklık (ekran pikseli); `* canvas.width / rect.width` →
  canvas pikseline çevir. y aynı hesap.
- `canvas.addEventListener('pointerdown', ...)` → fare, kalem ya da parmakla basılınca.
- `if (state === 'won') return reset()` → kazanıldıysa yeni oyun ve çık.
- `if (state !== 'aiming') return` → toplar yuvarlanıyorsa bir şey yapma.
- `pull(toCanvas(event))` → basılan noktaya göre nişan ve güç.

# --task--

1. Above the `pull` comment write `toCanvas`, with an empty line after it.
2. Under `pull`, leave an empty line and write the `pointerdown` listener.

# --task-tr--

1. `pull`'un yorum satırının **üstüne** `toCanvas` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `pull` fonksiyonunun altına bir boş satır bırak ve `pointerdown` dinleyicisini yaz.
3. **Çalıştır** ve beyaz topun soluna tıkla: çizgi sağa dönmeli, güç çubuğu değişmeli.

# --tests--

A press should aim away from the pointer.
tr: Basmak işaretçinin tersine nişan almalı.

```js
$.pointerDown(70, 160)
assert.closeTo(aim, 0, 1e-9)
assert.closeTo(power, 10, 1e-9)
assert.strictEqual(state, 'aiming')
assert.deepEqual(toCanvas({ clientX: 30, clientY: 45 }), { x: 30, y: 45 })
```

A press while rolling should do nothing; after a win it should start again.
tr: Yuvarlanırken basmak bir şey yapmamalı; kazandıktan sonra yeniden başlatmalı.

```js
shoot()
$.pointerDown(130, 100)
assert.strictEqual(aim, 0)
state = 'won'
balls = [cue]
$.pointerDown(200, 200)
assert.strictEqual(state, 'aiming')
assert.lengthOf(balls, 11)
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
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
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
    b.x += b.vx
    b.y += b.vy
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
  step()
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
  pull(toCanvas(event))
})

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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cue.x, cue.y)
    ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
    ctx.stroke()
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
