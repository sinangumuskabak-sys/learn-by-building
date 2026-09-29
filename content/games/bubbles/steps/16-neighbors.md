---
title: Six neighbours
title_tr: Altı komşu
skills: [prog.arrays]
---

# --goal--

To find bubbles of the same color that touch, we need each cell's neighbours. In a honeycomb grid a cell has six: two
beside it, two above and two below. Which columns those are depends on whether the row is shifted.

# --goal-tr--

Aynı renkte **değen** balonları bulmak için her hücrenin **komşularını** bilmeliyiz. Bal peteği gibi dizilmiş bir
ızgarada bir hücrenin **altı** komşusu var: iki yanında, iki üstünde, iki altında.

Püf nokta: tek satırlar yarım balon sağa kaymış. Bu yüzden üst ve alt komşuların hangi sütunlarda olduğu satırın çift
mi tek mi olduğuna bağlı.

# --code--

```js
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < cols(r)

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
```

# --meaning--

- `inGrid` checks that a row and column exist (odd rows have one cell less).
- `shift` is -1 on even rows and 0 on odd rows; the cells above and below are at `c + shift` and `c + shift + 1`.
- `filter` drops the neighbours that would be outside the grid.

# --meaning-tr--

- `inGrid(r, c)` → böyle bir hücre var mı? Satır 0–13 arasında, sütun 0 ile o satırın uzunluğu arasında olmalı (tek
  satırlar bir hücre kısa).
- `const shift = r % 2 === 0 ? -1 : 0` → çift satırda -1, tek satırda 0. Üst ve alt komşular `c + shift` ve
  `c + shift + 1` sütunlarında.
- Dizinin ilk satırı iki yandaki komşular: aynı satır, bir sol bir sağ sütun.
- `.filter(([nr, nc]) => inGrid(nr, nc))` → ızgaranın dışına düşenleri at (kenardaki hücrelerin daha az komşusu olur).

# --task--

1. Above the `cellPos` line, write `inGrid`.
2. Under the `cellPos` line, write the comment and `neighbors`.

# --task-tr--

1. `const cellPos = ...` satırının **üstüne** `inGrid` satırını yaz.
2. `cellPos` satırının altına bir boş satır bırakıp yorumu ve `neighbors` fonksiyonunu yaz.
3. **Çalıştır**. (Ekranda değişiklik yok; komşuları sonraki adımlarda kullanacağız.)

# --tests--

A corner cell should have only its two neighbours inside the grid.
tr: Köşedeki hücrenin yalnız ızgara içindeki iki komşusu olmalı.

```js
const sort = (list) => list.map(String).sort()
assert.deepEqual(sort(neighbors(0, 0)), sort([[0, 1], [1, 0]]))
```

A cell in the middle should have six neighbours, shifted the right way on odd rows.
tr: Ortadaki bir hücrenin altı komşusu olmalı; tek satırlarda doğru yöne kaymış.

```js
const sort = (list) => list.map(String).sort()
assert.deepEqual(sort(neighbors(2, 5)), sort([[2, 4], [2, 6], [1, 4], [1, 5], [3, 4], [3, 5]]))
assert.deepEqual(sort(neighbors(3, 5)), sort([[3, 4], [3, 6], [2, 5], [2, 6], [4, 5], [4, 6]]))
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
