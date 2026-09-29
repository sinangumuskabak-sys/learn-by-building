---
title: Three in a row pop
title_tr: Üç tane olunca patla
skills: [game.collision]
---

# --goal--

The heart of the game: when the new bubble makes a group of three or more of its color, the whole group pops, 10 points
each.

# --goal-tr--

Oyunun kalbi: yeni balon kendi renginden **üç ya da daha fazla** balonluk bir grup oluşturursa, grubun **tamamı**
patlar. Her balon 10 puan.

# --code--

```js
let score
  score = 0

function remove(cells, points) {
  for (const [r, c] of cells) {
    grid[r][c] = -1
    score += points
  }
}

  // Three or more of one color, touching: they pop.
  const group = connected([[r, c]], (nr, nc) => grid[nr][nc] === color)
  if (group.length >= 3) {
    remove(group, 10)
  }
```

# --meaning--

- `remove` empties a list of cells (`-1`) and adds points for each.
- In `attach`, `connected` starts at the new bubble and spreads only through its own color.
- A group of 3 or more is removed.

# --meaning-tr--

- `let score` → puan; `reset` onu 0 yapar.
- `function remove(cells, points)` → verilen hücreleri **boşaltır** (`-1`) ve her biri için puan ekler.
- `connected([[r, c]], (nr, nc) => grid[nr][nc] === color)` → yeni balondan başla, yalnız **aynı renge** yayıl.
  Test fonksiyonunu burada kısa bir ok fonksiyonu olarak veriyoruz.
- `if (group.length >= 3)` → grup en az 3 balonsa patlat.

# --task--

1. Under `let shot`, write `let score`; in `reset`, under `shot = null`, write `score = 0`.
2. Under `connected`, write `remove`.
3. In `attach`, write the comment and the group lines under `grid[r][c] = color`.

# --task-tr--

1. `let shot ...` satırının altına `let score`, `reset` içinde `shot = null` satırının altına `score = 0` yaz.
2. `connected` fonksiyonunun altına bir boş satır bırakıp `remove` fonksiyonunu yaz.
3. `attach` içinde `grid[r][c] = color` satırının altına yorumu ve grup satırlarını yaz.
4. **Çalıştır** ve aynı renkten iki balonun yanına nişan al.

# --tests--

A new bubble making three of a color should pop them all, 10 points each.
tr: Üçlü aynı renk oluşturan yeni balon hepsini patlatmalı; her biri 10 puan.

```js
grid = Array.from({ length: 14 }, (_, r) => Array(r % 2 === 0 ? 10 : 9).fill(-1))
grid[0][0] = 1
grid[0][1] = 1
attach(1, 0, 1)
assert.deepEqual([grid[0][0], grid[0][1], grid[1][0]], [-1, -1, -1])
assert.strictEqual(score, 30)
```

Two of a color should not pop.
tr: Aynı renkten iki balon patlamamalı.

```js
grid = Array.from({ length: 14 }, (_, r) => Array(r % 2 === 0 ? 10 : 9).fill(-1))
grid[0][0] = 1
attach(1, 0, 1)
assert.deepEqual([grid[0][0], grid[1][0]], [1, 1])
assert.strictEqual(score, 0)
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
let score

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

// The six cells around (r, c). Odd rows are shifted right, so their neighbours above and below are at c and c + 1;
// even rows' are at c - 1 and c.
function neighbors(r, c) {
  const shift = r % 2 === 0 ? -1 : 0
  return [
    [r, c - 1], [r, c + 1],
    [r - 1, c + shift], [r - 1, c + shift + 1],
    [r + 1, c + shift], [r + 1, c + shift + 1],
  ].filter(([nr, nc]) => inGrid(nr, nc))
}

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
  score = 0
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

// Flood fill: every cell connected to (r, c) through neighbours that pass the test.
function connected(starts, test) {
  const seen = new Set(starts.map(([r, c]) => r * COLS + c))
  const queue = [...starts]
  while (queue.length) {
    const [r, c] = queue.shift()
    for (const [nr, nc] of neighbors(r, c)) {
      if (seen.has(nr * COLS + nc) || !test(nr, nc)) continue
      seen.add(nr * COLS + nc)
      queue.push([nr, nc])
    }
  }
  return [...seen].map((k) => [Math.floor(k / COLS), k % COLS])
}

function remove(cells, points) {
  for (const [r, c] of cells) {
    grid[r][c] = -1
    score += points
  }
}

function attach(r, c, color) {
  grid[r][c] = color
  // Three or more of one color, touching: they pop.
  const group = connected([[r, c]], (nr, nc) => grid[nr][nc] === color)
  if (group.length >= 3) {
    remove(group, 10)
  }
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
