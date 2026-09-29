---
title: Smaller steps
title_tr: Daha küçük adımlar
skills: [game.physics, game.collision]
---

# --goal--

At 12 pixels a frame, a shot can jump over a narrow gap or deep into a bubble before we check. So each frame is split into
three smaller steps of 4 pixels, each checking for a touch.

# --goal-tr--

Balon karede 12 piksel gidiyor. Tek adımda bu kadar ilerleyince dar bir aralığın **üstünden atlayabilir** ya da bir
balonun **içine** gömüldükten sonra fark edilebilir; o zaman yanlış hücreye oturur.

Çözüm: her kareyi **üç küçük adıma** böl. Her adım 4 piksel ilerler ve değmeyi kontrol eder. Karede yine 12 piksel gider,
ama çok daha dikkatli.

# --code--

```js
// A few small steps per frame, so the bubble cannot jump past a gap.
for (let i = 0; i < 3 && shot; i++) {
  shot.x += shot.vx / 3
  shot.y += shot.vy / 3
  if (shot.x < R || shot.x > canvas.width - R) {
    shot.vx = -shot.vx // bounce off the side walls
    shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
  }
  if (touches(shot.x, shot.y)) {
    const cell = snap(shot.x, shot.y)
    attach(cell.r, cell.c, shot.color)
    shot = null
  }
}
```

# --meaning--

- The loop runs three times, but stops early once `shot` is `null` (`&& shot`): after sticking there is nothing to move.
- Each step moves a third of the velocity.

# --meaning-tr--

- `for (let i = 0; i < 3 && shot; i++)` → üç kez dön; ama `&& shot` sayesinde balon yapıştığı anda (`shot = null`) dur.
  Yoksa bir sonraki turda `shot.x` diye `null`'ın içine bakmaya çalışıp hata verirdi.
- `shot.x += shot.vx / 3`, `shot.y += shot.vy / 3` → her adım hızın üçte biri: 4 piksel.
- Duvar ve değme kontrolleri artık **her küçük adımda**; döngünün içine, iki boşluk daha içeri girdiler.

# --task--

In `update`, put the lines after `if (!shot) return` inside the `for` loop (with its comment), indented, and divide the
velocities by 3.

# --task-tr--

1. `update` içinde `if (!shot) return` satırının altına yorum satırını ve `for (let i = 0; i < 3 && shot; i++) {` yaz.
2. Altındaki bütün satırları iki boşluk içeri al; en sona döngüyü kapatan `}` ekle.
3. `shot.vx` ve `shot.vy` eklemelerini `/ 3` ile böl. **Çalıştır**: oyun aynı hissettirir, ama atışlar daha isabetli.

# --tests--

The shot should be checked for touching every 4 pixels.
tr: Atış her 4 pikselde bir değme için kontrol edilmeli.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
const seen = []
const real = touches
touches = (x, y) => {
  seen.push(y)
  return real(x, y)
}
shoot()
$.tick(2)
assert.isAtLeast(seen.length, 6)
assert.closeTo(seen[0], 486, 1e-9)
assert.closeTo(seen[1] - seen[2], 4, 1e-9)
```

A frame should still move the shot 12 pixels, and it should stick as before.
tr: Bir kare atışı yine 12 piksel ilerletmeli ve atış eskisi gibi yapışmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
const color = loaded
shoot()
$.tick(1)
assert.closeTo(shot.y, 478, 1e-9)
for (let i = 0; i < 100 && shot; i++) $.tick(1)
assert.isTrue(grid[0][4] === color || grid[0][5] === color)
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SHOOTER = { x: 200, y: 490 }
const SPEED = 12

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

function pickColor() {
  return Math.floor(Math.random() * COLORS.length)
}

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  shot = null
  loaded = pickColor()
  next = pickColor()
}

function shoot() {
  if (shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

// Does a bubble at (x, y) touch the ceiling or a bubble in the grid?
function touches(x, y) {
  if (y - R <= TOP) return true
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      if (Math.hypot(p.x - x, p.y - y) < 2 * R - 4) return true
    }
  }
  return false
}

// The empty cell closest to where the bubble stopped.
function snap(x, y) {
  let nearest = null
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] >= 0) continue
      const p = cellPos(r, c)
      const d = Math.hypot(p.x - x, p.y - y)
      if (!nearest || d < nearest.d) nearest = { r, c, d }
    }
  }
  return nearest
}

function attach(r, c, color) {
  grid[r][c] = color
}

function update() {
  if (!shot) return
  // A few small steps per frame, so the bubble cannot jump past a gap.
  for (let i = 0; i < 3 && shot; i++) {
    shot.x += shot.vx / 3
    shot.y += shot.vy / 3
    if (shot.x < R || shot.x > canvas.width - R) {
      shot.vx = -shot.vx // bounce off the side walls
      shot.x = Math.max(R, Math.min(canvas.width - R, shot.x))
    }
    if (touches(shot.x, shot.y)) {
      const cell = snap(shot.x, shot.y)
      attach(cell.r, cell.c, shot.color)
      shot = null
    }
  }
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y < SHOOTER.y) aim = clampAim(Math.atan2(y - SHOOTER.y, x - SHOOTER.x))
}

canvas.addEventListener('pointermove', pointAt)
canvas.addEventListener('pointerdown', pointAt)
canvas.addEventListener('pointerup', shoot)

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHOOTER.x, SHOOTER.y)
  ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
  ctx.stroke()
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
  if (shot) drawBubble(shot.x, shot.y, shot.color)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
