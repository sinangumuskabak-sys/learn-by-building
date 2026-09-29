---
title: Faster every level
title_tr: Her seviyede daha hızlı
skills: [game.loop]
---

# --goal--

Each level makes the pieces fall 70 ms sooner, but never faster than every 100 ms.

# --goal-tr--

Oyun iyi oynadıkça zorlaşsın: her seviye parçaları **70 ms daha sık** düşürsün. Seviye 1'de 800 ms, seviye 2'de 730,
seviye 3'te 660... Ama sonsuza kadar değil: 100 ms'nin altına inmesin, yoksa oynanamaz.

# --code--

```js
function dropInterval() {
  return Math.max(100, 800 - (level() - 1) * 70)
}

  if (state === 'playing' && time - lastDrop >= dropInterval()) {
```

# --meaning--

- `800 - (level() - 1) * 70` is 800 at level 1 and 70 less for each level after.
- `Math.max(100, ...)` picks the bigger number, so the wait never goes below 100 ms.
- The loop asks `dropInterval()` instead of using 800.

# --meaning-tr--

- `800 - (level() - 1) * 70` → seviye 1'de 800 - 0 = 800; seviye 4'te 800 - 3 × 70 = 590.
- `Math.max(100, ...)` → iki sayıdan **büyüğünü** verir. Hesap 100'ün altına düşse bile sonuç 100: parçalar 100 ms'den
  hızlı düşmez.
- `loop` içinde sabit `800` yerine `dropInterval()`.

# --task--

1. Write `dropInterval` above `function clearLines() {` (under `level`).
2. In `loop`, replace `800` with `dropInterval()`.

# --task-tr--

1. `dropInterval` fonksiyonunu `function clearLines() {` satırının **üstüne** (`level`'in altına) yaz; altında bir
   boş satır kalsın.
2. `loop` içinde `800` yerine `dropInterval()` yaz.
3. **Çalıştır**. Hızlanmayı görmek için `newGame` içinde bir an `lines = 40` dene, sonra geri al.

# --tests--

Higher levels should drop faster, with a limit.
tr: Yüksek seviyeler daha hızlı düşürmeli, bir sınırla.

```js
assert.strictEqual(dropInterval(), 800)
lines = 30
assert.strictEqual(dropInterval(), 590)
lines = 500
assert.strictEqual(dropInterval(), 100)
```

The loop should use the current speed.
tr: Döngü o anki hızı kullanmalı.

```js
lines = 30
const y = piece.y
$.run(0.62)
assert.strictEqual(piece.y, y + 1, 'one row after 590 ms')
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

function dropInterval() {
  return Math.max(100, 800 - (level() - 1) * 70)
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
  if (state === 'playing' && time - lastDrop >= dropInterval()) {
    lastDrop = time
    softDrop()
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
