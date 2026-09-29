---
title: Bubbles that fall
title_tr: Düşen balonlar
skills: [game.physics]
---

# --goal--

Popped bubbles should not just vanish. Each one jumps up a little and falls off the screen, pulled by gravity.

# --goal-tr--

Patlayan balonlar bir anda yok olmasın: her biri **hafifçe zıplayıp** yer çekimiyle ekrandan **düşsün**. Çok küçük bir
fizik ama oyuna can katar.

# --code--

```js
let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
  falling = []

    const p = cellPos(r, c)
    falling.push({ x: p.x, y: p.y, vy: -2, r: R, color: grid[r][c] })

  for (const f of falling) {
    f.vy += 0.4
    f.y += f.vy
  }
  falling = falling.filter((f) => f.y - f.r < canvas.height)

  for (const f of falling) drawBubble(f.x, f.y, f.color, f.r)
```

# --meaning--

- Before a cell is emptied, a copy of its bubble goes into `falling`, moving up (`vy: -2`).
- Every frame gravity adds 0.4 to `vy`, so it slows, turns and falls faster and faster.
- Bubbles below the bottom are dropped from the list; the rest are drawn over the grid.

# --meaning-tr--

- `falling` → düşmekte olan balonların listesi.
- `remove` içinde: hücre boşaltılmadan **önce** balonun bir kopyası listeye girer: yeri, rengi ve `vy: -2` (yukarı
  doğru küçük bir hız, zıplama).
- `f.vy += 0.4` → **yer çekimi**: her karede aşağı doğru hız biraz artar. Önce yavaşlar, durur, sonra hızlanarak
  düşer.
- `f.y += f.vy` → hıza göre hareket.
- `falling.filter((f) => f.y - f.r < canvas.height)` → ekranın altından tamamen çıkanları listeden at.
- Son satır düşenleri ızgaranın üstüne çizer.

# --task--

1. Under `let shot`, write `let falling`; in `reset`, under `shot = null`, write `falling = []`.
2. In `remove`, write the two lines at the top of the loop.
3. At the start of `update`, write the gravity loop and the `filter` line.
4. In `draw`, under the grid loop, draw the falling bubbles.

# --task-tr--

1. `let shot ...` satırının altına `let falling ...`; `reset` içinde `shot = null` satırının altına `falling = []` yaz.
2. `remove` içindeki döngünün **en üstüne** iki satırı yaz (`grid[r][c] = -1` satırından önce).
3. `update` fonksiyonunun **en başına** yer çekimi döngüsünü ve `filter` satırını yaz (`if (!shot) return`'den önce).
4. `draw` içinde ızgarayı çizen iç içe döngünün altına düşenleri çizen satırı yaz.
5. **Çalıştır** ve bir grup patlat.

# --tests--

Popped bubbles should start falling from where they were.
tr: Patlayan balonlar bulundukları yerden düşmeye başlamalı.

```js
grid = Array.from({ length: 14 }, (_, r) => Array(r % 2 === 0 ? 10 : 9).fill(-1))
grid[0][0] = 1
grid[0][1] = 1
attach(1, 0, 1)
assert.lengthOf(falling, 3)
assert.strictEqual(falling[0].vy, -2)
const y = falling[0].y
update()
assert.closeTo(falling[0].vy, -1.6, 0.001)
assert.closeTo(falling[0].y, y - 1.6, 0.001)
```

Bubbles that fell off the screen should be forgotten.
tr: Ekrandan düşen balonlar unutulmalı.

```js
falling = [{ x: 100, y: 600, vy: 5, r: 20, color: 0 }]
update()
assert.lengthOf(falling, 0)
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
let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
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
  falling = []
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
    const p = cellPos(r, c)
    falling.push({ x: p.x, y: p.y, vy: -2, r: R, color: grid[r][c] })
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
  for (const f of falling) {
    f.vy += 0.4
    f.y += f.vy
  }
  falling = falling.filter((f) => f.y - f.r < canvas.height)
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
  for (const f of falling) drawBubble(f.x, f.y, f.color, f.r)

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
