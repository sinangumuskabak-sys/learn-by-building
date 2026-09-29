---
title: Win or lose
title_tr: Kazan ya da kaybet
skills: [game.state]
---

# --goal--

You win when the board is empty (plus 1000 points). You lose when any bubble hangs below the danger line near the
shooter.

# --goal-tr--

Oyunun sonu: tahtada **hiç balon kalmazsa** kazanırsın (1000 puan ödül). Herhangi bir balon nişancının yakınındaki
**tehlike çizgisinin** altına sarkarsa kaybedersin.

# --code--

```js
const DANGER = 440 // a bubble below this line ends the game
let state // 'playing', 'won' or 'lost'
  state = 'playing'

  const cells = grid.flatMap((row, r2) => row.map((color2, c2) => ({ r: r2, c: c2, color: color2 })))
  if (cells.every((cell) => cell.color < 0)) {
    state = 'won'
    score += 1000
  } else if (cells.some((cell) => cell.color >= 0 && cellPos(cell.r, cell.c).y + R > DANGER)) state = 'lost'
```

# --meaning--

- `cells` is every cell as `{ r, c, color }`, in one list.
- `every` empty: won. Otherwise, `some` bubble whose bottom edge is below `DANGER`: lost.

# --meaning-tr--

- `grid.flatMap(...)` → her satırı `{ r, c, color }` nesnelerine çevirip hepsini **tek listede** toplar.
- `cells.every((cell) => cell.color < 0)` → **her** hücre boş mu? Evetse kazandın: `'won'` ve 1000 puan.
- `cells.some(...)` → dolu bir hücrenin balonunun **alt kenarı** (`y + R`) tehlike çizgisinin altında mı? Tek biri
  bile yeterse kaybettin: `'lost'`.

# --task--

1. Under `SPEED`, write `DANGER`; under `let drop`, write `let state`; in `reset`, under `drop = 0`, write `state = 'playing'`.
2. At the end of `attach`, under the `drop` line, write the check.

# --task-tr--

1. `const SPEED = 12` satırının altına `DANGER`, `let drop ...` satırının altına `let state ...` yaz; `reset` içinde
   `drop = 0` satırının altına `state = 'playing'` yaz.
2. `attach`'in sonunda, `drop` satırının altına kontrol satırlarını yaz.
3. **Çalıştır**.

# --tests--

Clearing the board should win, with 1000 extra points.
tr: Tahtayı temizlemek kazandırmalı; 1000 ek puanla.

```js
grid = Array.from({ length: 14 }, (_, r) => Array(r % 2 === 0 ? 10 : 9).fill(-1))
grid[0][0] = 1
grid[0][1] = 1
attach(0, 2, 1)
assert.strictEqual(state, 'won')
assert.strictEqual(score, 1030)
```

A bubble below the danger line should lose.
tr: Tehlike çizgisinin altındaki bir balon kaybettirmeli.

```js
grid = Array.from({ length: 14 }, (_, r) => Array(r % 2 === 0 ? 10 : 9).fill(-1))
grid[0][0] = 3
attach(12, 0, 0)
assert.strictEqual(state, 'lost')
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
const DANGER = 440 // a bubble below this line ends the game
const DROP_EVERY = 8 // shots between the ceiling coming down

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null
let falling // popped and dropped bubbles on their way out: { x, y, vy, r, color }
let score
let shots
let drop // how many rows the ceiling has come down
let state // 'playing', 'won' or 'lost'

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + drop * ROW_H + R + r * ROW_H })

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

// The colors still on the board, so the shooter never offers a useless one.
function pickColor() {
  const present = [...new Set(grid.flat().filter((color) => color >= 0))]
  const choices = present.length ? present : COLORS.map((_, i) => i)
  return choices[Math.floor(Math.random() * choices.length)]
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
  shots = 0
  drop = 0
  state = 'playing'
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
  if (y - R <= TOP + drop * ROW_H) return true
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
  shots += 1
  // Three or more of one color, touching: they pop.
  const group = connected([[r, c]], (nr, nc) => grid[nr][nc] === color)
  if (group.length >= 3) {
    remove(group, 10)
    // Whatever no longer hangs from the ceiling drops, worth double.
    const top = []
    for (let c2 = 0; c2 < cols(0); c2++) if (grid[0][c2] >= 0) top.push([0, c2])
    const held = new Set(connected(top, (nr, nc) => grid[nr][nc] >= 0).map(([hr, hc]) => hr * COLS + hc))
    const loose = []
    for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < cols(r2); c2++) {
      if (grid[r2][c2] >= 0 && !held.has(r2 * COLS + c2)) loose.push([r2, c2])
    }
    remove(loose, 20)
  }
  if (shots % DROP_EVERY === 0) drop += 1
  const cells = grid.flatMap((row, r2) => row.map((color2, c2) => ({ r: r2, c: c2, color: color2 })))
  if (cells.every((cell) => cell.color < 0)) {
    state = 'won'
    score += 1000
  } else if (cells.some((cell) => cell.color >= 0 && cellPos(cell.r, cell.c).y + R > DANGER)) state = 'lost'
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
  // The ceiling comes down as a solid block.
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP + drop * ROW_H)

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 10, 21)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
