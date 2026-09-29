---
title: Levels
title_tr: Seviyeler
skills: [game.state]
---

# --goal--

Every 10 lines is a new level, and points are multiplied by the level. The level is worked out from `lines` each time
we need it.

# --goal-tr--

Her **10 satır** yeni bir seviye. Seviye yükseldikçe puanlar da o kadar değerli: silinen satırın puanı seviyeyle
**çarpılır**. Seviyeyi ayrı bir değişkende tutmuyoruz; ne zaman lazımsa `lines`'tan hesaplıyoruz. Böylece ikisi hiç
birbirinden kopamaz.

# --code--

```js
function level() {
  return Math.floor(lines / 10) + 1
}

  score += POINTS[cleared] * level()

  ctx.fillText('Level', panel, 300)
  ctx.fillText(String(level()), panel, 322)
```

# --meaning--

- `lines / 10` rounded down with `Math.floor`, plus 1: 0–9 lines is level 1, 10–19 level 2, and so on.
- `clearLines` multiplies the points by the level (it uses `level()` before adding the new lines).
- The panel shows the level under `Lines`.

# --meaning-tr--

- `Math.floor(lines / 10) + 1` → 0–9 satır: 0 + 1 = **1**. 10–19 satır: 1 + 1 = **2**. 25 satır: 2 + 1 = 3.
- `score += POINTS[cleared] * level()` → seviye 2'de tek satır 200 puan. Dikkat: bu satır `lines += cleared`'dan
  **önce**; puan, satırlar sayılmadan önceki seviyeyle hesaplanır.
- Panelde `Lines`'ın altına `Level` ve seviye sayısı.

# --task--

1. Write `level` above `function clearLines() {`.
2. In `clearLines`, multiply the points by `level()`.
3. In `draw`, under the lines number, write the two `Level` lines.

# --task-tr--

1. `level` fonksiyonunu `function clearLines() {` satırının **üstüne** yaz; altında bir boş satır kalsın.
2. `clearLines` içinde `score += POINTS[cleared]` satırının sonuna ` * level()` ekle.
3. `draw` içinde `ctx.fillText(String(lines), panel, 262)` satırının **altına** iki `Level` satırını yaz.
4. **Çalıştır**: panelde Level 1 görmelisin.

# --tests--

Every 10 lines should be a new level.
tr: Her 10 satır yeni bir seviye olmalı.

```js
assert.strictEqual(level(), 1)
lines = 9
assert.strictEqual(level(), 1)
lines = 10
assert.strictEqual(level(), 2)
lines = 25
assert.strictEqual(level(), 3)
```

Points should be multiplied by the level, and the level shown.
tr: Puanlar seviyeyle çarpılmalı ve seviye gösterilmeli.

```js
lines = 10
board[19] = Array(10).fill(1)
clearLines()
assert.strictEqual(score, 200)
lines = 500
$.tick(1)
assert.includeMembers($.texts(), ['Level', '51'])
```

# --solution--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 10
const ROWS = 20
const CELL = 24
const COLORS = [null, '#22d3ee', '#facc15', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316']
// Each piece is a square matrix; the number is its color. Square matrices rotate around their center.
const SHAPES = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ],
  [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ],
]
const POINTS = [0, 100, 300, 500, 800] // for clearing 0, 1, 2, 3 or 4 lines at once

let board
let piece
let score
let lines
let state // 'playing' or 'over'
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
  score = 0
  lines = 0
  state = 'playing'
  spawn()
}

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) => [...row])
}

function spawn() {
  const shape = randomShape()
  piece = { shape, x: Math.floor((COLS - shape.length) / 2), y: 0 }
  if (!fits(piece.shape, piece.x, piece.y)) state = 'over'
}

// Clockwise: the first column, read from the bottom up, becomes the first row.
function rotate(shape) {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse())
}

function fits(shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const col = x + c
      const row = y + r
      if (col < 0 || col >= COLS || row >= ROWS) return false
      if (row >= 0 && board[row][col]) return false
    }
  }
  return true
}

function tryMove(dx, dy) {
  if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false
  piece.x += dx
  piece.y += dy
  return true
}

function tryRotate() {
  const turned = rotate(piece.shape)
  // Wall kicks: if the turned piece does not fit, try nudging it sideways.
  for (const kick of [0, -1, 1, -2, 2]) {
    if (fits(turned, piece.x + kick, piece.y)) {
      piece.shape = turned
      piece.x += kick
      return true
    }
  }
  return false
}

function level() {
  return Math.floor(lines / 10) + 1
}

function clearLines() {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = ROWS - kept.length
  if (cleared === 0) return
  board = [...Array.from({ length: cleared }, emptyRow), ...kept]
  score += POINTS[cleared] * level()
  lines += cleared
}

function lock() {
  piece.shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) board[piece.y + r][piece.x + c] = value
    })
  })
  clearLines()
  spawn()
}

function softDrop() {
  if (!tryMove(0, 1)) lock()
}

document.addEventListener('keydown', (event) => {
  if (state === 'over') {
    if (event.key === ' ' || event.key === 'Enter') newGame()
    return
  }
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
  if (event.key === 'ArrowUp' || event.key === 'x') tryRotate()
  if (event.key === 'ArrowDown') tryMove(0, 1)
})

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function drawShape(shape, x, y) {
  shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) drawCell(x + c, y + r, COLORS[value])
    })
  })
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, COLORS[board[row][col]])
    }
  }
  if (state === 'playing') {
    drawShape(piece.shape, piece.x, piece.y)
  }

  const panel = COLS * CELL + 20
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score', panel, 180)
  ctx.fillText(String(score), panel, 202)
  ctx.fillText('Lines', panel, 240)
  ctx.fillText(String(lines), panel, 262)
  ctx.fillText('Level', panel, 300)
  ctx.fillText(String(level()), panel, 322)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 180, COLS * CELL, 110)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', (COLS * CELL) / 2, 225)
    ctx.font = '14px sans-serif'
    ctx.fillText('Press Space to play again', (COLS * CELL) / 2, 260)
  }
}

function loop(time) {
  if (state === 'playing' && time - lastDrop >= 800) {
    lastDrop = time
    softDrop()
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
