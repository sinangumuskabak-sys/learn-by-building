---
title: Points for lines
title_tr: Satırlara puan
skills: [game.state, prog.arrays]
---

# --goal--

Clearing lines scores points, and more lines at once score much more: 100, 300, 500 and 800 for 1 to 4. We also count
the cleared lines.

# --goal-tr--

Satır silmek puan getirsin. Aynı anda **çok satır** silmek ödüllendirilir: 1, 2, 3, 4 satır için 100, 300, 500 ve 800
puan. Dört satır birden, dört kez tek satırdan (400) çok daha değerli! Bir de toplam kaç satır silindiğini
sayıyoruz: `lines`.

# --code--

```js
const POINTS = [0, 100, 300, 500, 800] // for clearing 0, 1, 2, 3 or 4 lines at once

let score
let lines

  score = 0
  lines = 0

  score += POINTS[cleared]
  lines += cleared
```

# --meaning--

- `POINTS[n]` is the score for clearing `n` lines at once.
- `newGame` starts both counters at 0.
- `clearLines` adds the points and the number of lines after removing them.

# --meaning-tr--

- `const POINTS = [0, 100, 300, 500, 800]` → sıra numarası = aynı anda silinen satır sayısı. `POINTS[2]` 300.
- `let score`, `let lines` → puan ve silinen satır sayısı; `newGame` ikisini de 0 yapar.
- `score += POINTS[cleared]` → silinen satır sayısına göre puan ekle.
- `lines += cleared` → sayacı artır.
- İkisi de `clearLines`'ta `if (cleared === 0) return`'ün **altında**: hiç satır silinmezse buraya gelinmez.

# --task--

1. Under `SHAPES` write `POINTS`.
2. Above `let state` write `let score` and `let lines`.
3. In `newGame`, under the `board = ...` line, set both to 0.
4. In `clearLines`, at the end, add the points and the lines.

# --task-tr--

1. `SHAPES` listesinin kapanan `]` satırının altına `POINTS` satırını yaz.
2. `let state ...` satırının **üstüne** `let score` ve `let lines` yaz.
3. `newGame` içinde `board = ...` satırının altına `score = 0` ve `lines = 0` yaz.
4. `clearLines` içinde **en sona** iki satırı yaz.
5. **Çalıştır**. Puan henüz görünmez; kontroller sayıları deniyor.

# --tests--

Clearing more lines at once should score more.
tr: Aynı anda daha çok satır silmek daha çok puan getirmeli.

```js
assert.strictEqual(score, 0)
assert.strictEqual(lines, 0)
const fill = (n) => {
  board = Array.from({ length: 20 }, emptyRow)
  for (let i = 0; i < n; i++) board[19 - i] = Array(10).fill(1)
}
fill(1)
clearLines()
assert.strictEqual(score, 100)
fill(4)
clearLines()
assert.strictEqual(score, 900)
assert.strictEqual(lines, 5)
```

No cleared line, no points.
tr: Silinen satır yoksa puan da yok.

```js
board[19] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
clearLines()
assert.strictEqual(score, 0)
assert.strictEqual(lines, 0)
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

function clearLines() {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = ROWS - kept.length
  if (cleared === 0) return
  board = [...Array.from({ length: cleared }, emptyRow), ...kept]
  score += POINTS[cleared]
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
