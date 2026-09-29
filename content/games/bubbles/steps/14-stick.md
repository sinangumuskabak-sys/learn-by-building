---
title: Stick into the grid
title_tr: Izgaraya otur
skills: [game.collision, prog.arrays]
---

# --goal--

Where the shot stopped is almost never exactly a cell, so it **snaps** to the nearest empty cell. That one step turns free
movement back into the grid, and everything after only has to think about cells.

# --goal-tr--

Balonun durduğu yer neredeyse hiçbir zaman tam bir hücre değildir. Bu yüzden **en yakın boş hücreye** oturtacağız:
`snap` (yapış). Bu tek adım, serbest uçuşu yeniden ızgaraya çevirir; bundan sonraki her şey (eşleşme, düşme) yalnız
**hücrelerle** uğraşacak.

`attach` (tak) rengi o hücreye yazacak. Şimdilik tek işi bu; ileride patlatmayı da o yapacak.

# --code--

```js
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

  if (touches(shot.x, shot.y)) {
    const cell = snap(shot.x, shot.y)
    attach(cell.r, cell.c, shot.color)
    shot = null
  }
```

# --meaning--

- `snap` looks at every empty cell and keeps the one with the smallest distance: `{ r, c, d }`.
- `attach` writes the color into the cell.
- In `update`, a shot that touches something snaps, attaches and is gone: `shot = null`, so the next one can be fired.

# --meaning-tr--

- `snap`: `let nearest = null` → şimdiye kadar bulunan en yakın boş hücre.
  - `if (grid[r][c] >= 0) continue` → **dolu** hücreleri atla; yalnız boşlar aday.
  - `const d = Math.hypot(...)` → hücrenin merkezi ile balon arasındaki uzaklık.
  - `if (!nearest || d < nearest.d) nearest = { r, c, d }` → ilk aday ya da daha yakınsa sakla.
- `attach(r, c, color)` → rengi hücreye yaz: balon artık ızgaranın parçası.
- `update` içinde: `touches` doğruysa en yakın boş hücreyi bul, balonu oraya tak ve `shot = null`: havada balon kalmadı,
  sıradaki atılabilir.

# --task--

1. Above `function update() {` write `snap` (with its comment) and `attach`, each followed by an empty line.
2. In `update`, under the wall block, write the `if (touches(...))` block.

# --task-tr--

1. `function update() {` satırının **üstüne** yorumuyla `snap` ve `attach` fonksiyonlarını yaz; her birinin altında bir
   boş satır kalsın.
2. `update` içinde duvar bloğunun kapanan `}`'sinin altına `if (touches(...)) { ... }` bloğunu yaz.
3. **Çalıştır** ve ateş et: balon diğerlerine yapışmalı!

# --tests--

A shot straight up on an empty board should stick to the ceiling above the shooter.
tr: Boş tahtada dümdüz yukarı bir atış atıcının üstünde tavana yapışmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
const color = loaded
$.press(' ')
for (let i = 0; i < 100 && shot; i++) $.tick(1)
assert.isNull(shot)
assert.isTrue(grid[0][4] === color || grid[0][5] === color, 'it sticks to the ceiling above the shooter')
```

A shot should stop against a bubble and snap into the row below it.
tr: Bir atış bir balona çarpıp durmalı ve altındaki satıra oturmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[5][4] = 2
const color = loaded
$.move(200 + 10, 300)
$.pointerDown(210, 300)
$.pointerUp(210, 300)
for (let i = 0; i < 100 && shot; i++) $.tick(1)
const placed = []
for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols(r); c++) if (grid[r][c] >= 0 && !(r === 5 && c === 4)) placed.push([r, c])
assert.lengthOf(placed, 1)
assert.strictEqual(placed[0][0], 6, 'it stops against the bubble, in the row below it')
assert.strictEqual(grid[placed[0][0]][placed[0][1]], color)
```

`snap` should find the nearest empty cell.
tr: `snap` en yakın boş hücreyi bulmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
const p = cellPos(3, 2)
const cell = snap(p.x + 3, p.y - 2)
assert.deepEqual([cell.r, cell.c], [3, 2])
grid[3][2] = 1
const other = snap(p.x + 3, p.y - 2)
assert.notDeepEqual([other.r, other.c], [3, 2], 'a filled cell is skipped')
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
  shot.x += shot.vx
  shot.y += shot.vy
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
