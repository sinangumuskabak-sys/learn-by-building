---
title: Three of a color pop
title_tr: Aynı renkten üçü patlar
skills: [prog.arrays, prog.loops]
---

# --explanation--

When the new bubble joins **two or more** of its own color that touch it (or touch each other), the whole group pops.

First we need the neighbours of a cell, and in a hex grid they depend on the row. Every cell has two neighbours in its own row,
`c - 1` and `c + 1`. Above and below, an **even** row's neighbours are at `c - 1` and `c`, but an **odd** row, being shifted
right, touches `c` and `c + 1`:

```js
const shift = r % 2 === 0 ? -1 : 0
// above: (r - 1, c + shift) and (r - 1, c + shift + 1); below: the same with r + 1
```

Then a **flood fill** collects the group: start from the new bubble, look at its neighbours, add the ones of the same color, then
look at *their* neighbours, and so on until nothing new is found. A queue holds the cells still to look at and a `Set` the cells
already found, so nothing is visited twice. It is the same algorithm as the paint bucket in a drawing program.

The flood fill takes the test as a function, `connected(starts, test)`, because the next step will use it again with a different
test.

# --explanation-tr--

Yeni balon, ona değen (ya da birbirine değen) kendi renginden **iki ya da daha fazla** balona katıldığında bütün grup patlar.

Önce bir hücrenin komşularına ihtiyacımız var ve altıgen ızgarada bunlar satıra bağlıdır. Her hücrenin kendi satırında iki komşusu
vardır: `c - 1` ve `c + 1`. Üstte ve altta **çift** bir satırın komşuları `c - 1` ve `c`'dedir, ama sağa kaymış bir **tek** satır
`c` ve `c + 1`'e değer:

```js
const shift = r % 2 === 0 ? -1 : 0
// üst: (r - 1, c + shift) ve (r - 1, c + shift + 1); alt: aynısı r + 1 ile
```

Sonra bir **flood fill** (taşma doldurma) grubu toplar: yeni balondan başla, komşularına bak, aynı renkte olanları ekle, sonra
*onların* komşularına bak ve yeni hiçbir şey bulunmayana kadar böyle devam et. Bir kuyruk bakılacak hücreleri, bir `Set` de zaten
bulunan hücreleri tutar; böylece hiçbir şey iki kez ziyaret edilmez. Bir çizim programındaki boya kovasıyla aynı algoritmadır.

Flood fill testi bir fonksiyon olarak alır, `connected(starts, test)`, çünkü sonraki adım onu farklı bir testle yeniden kullanacak.

# --task--

1. Write `inGrid(r, c)` and `neighbors(r, c)`: the six cells around, as above, that are in the grid.
2. Write `connected(starts, test)`: a flood fill from the `[r, c]` cells in `starts`, through neighbours for which
   `test(r, c)` is true; return every cell found as `[r, c]`.
3. Add `score` (`0` in `reset()`) and `remove(cells, points)`, which empties the cells and adds `points` each.
4. In `attach`, after placing the bubble, find its same-color group; with 3 or more, remove them for 10 points each.
5. Draw `Score 30` at `(10, 21)` (white, `'bold 16px sans-serif'`).

# --task-tr--

1. `inGrid(r, c)` ve `neighbors(r, c)` yaz: yukarıdaki gibi, ızgarada olan çevredeki altı hücre.
2. `connected(starts, test)` yaz: `starts`'taki `[r, c]` hücrelerinden, `test(r, c)`'nin true olduğu komşular üzerinden bir flood
   fill; bulunan her hücreyi `[r, c]` olarak döndür.
3. `score` (`reset()`'te `0`) ve hücreleri boşaltıp her biri için `points` ekleyen `remove(cells, points)`'i ekle.
4. `attach`'te balonu koyduktan sonra aynı renkteki grubunu bul; 3 ya da daha fazlaysa her biri 10 puana kaldır.
5. `(10, 21)`'e `Score 30` çiz (beyaz, `'bold 16px sans-serif'`).

# --tests--

Neighbours should depend on whether the row is even or odd.
tr: Komşular satırın çift ya da tek olmasına bağlı olmalı.

```js
assert.sameDeepMembers(neighbors(2, 3), [[2, 2], [2, 4], [1, 2], [1, 3], [3, 2], [3, 3]], 'even row')
assert.sameDeepMembers(neighbors(3, 3), [[3, 2], [3, 4], [2, 3], [2, 4], [4, 3], [4, 4]], 'odd row')
assert.sameDeepMembers(neighbors(0, 0), [[0, 1], [1, 0]], 'the corner has only two')
assert.sameDeepMembers(neighbors(1, 8), [[1, 7], [0, 8], [0, 9], [2, 8], [2, 9]])
```

The flood fill should find only the bubbles that touch.
tr: Flood fill yalnızca değen balonları bulmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][3] = grid[0][4] = 1
grid[1][3] = 1
grid[0][6] = 1
const group = connected([[0, 3]], (r, c) => grid[r][c] === 1)
assert.sameDeepMembers(group, [[0, 3], [0, 4], [1, 3]], 'only the touching ones')
```

Two of a color should stay; the third should pop them all.
tr: Aynı renkten iki balon kalmalı; üçüncüsü hepsini patlatmalı.

```js
const empty = () => {
  grid = grid.map((row) => row.map(() => -1))
}
empty()
grid[0][3] = grid[0][4] = 1
attach(0, 5, 2)
assert.strictEqual(grid[0][5], 2, 'no match: it stays')
empty()
grid[0][3] = grid[0][4] = 1
attach(0, 5, 1)
assert.deepEqual([grid[0][3], grid[0][4], grid[0][5]], [-1, -1, -1], 'three pop')
assert.strictEqual(score, 30)
$.tick(1)
assert.include($.texts(), 'Score 30')
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

const pickColor = () => Math.floor(Math.random() * COLORS.length)

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
canvas.addEventListener('pointerup', () => shoot())

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

  // The aim: a short line from the shooter.
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
