---
title: Game Over on screen
title_tr: Ekranda Game Over
skills: [game.canvas]
---

# --goal--

The falling piece is drawn only while playing. When the game is over, a dark band across the well says `Game Over`.

# --goal-tr--

Oyuncu oyunun bittiğini görmeli. Düşen parçayı yalnız oyun sürerken çiziyoruz; oyun bitince kuyunun ortasında yarı
saydam koyu bir şerit ve üstünde **Game Over** yazısı çıkıyor.

# --code--

```js
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
```

# --meaning--

- `rgba(0, 0, 0, 0.7)` is black at 70% opacity: a dark band you can still faintly see through.
- `font` sets the text size, `textAlign = 'center'` centres it on the given x; `fillText(text, x, y)` writes it.
- `(COLS * CELL) / 2` is the middle of the well, 120.

# --meaning-tr--

- `if (state === 'playing') { ... }` → parça yalnız oyun sürerken çizilir.
- `'rgba(0, 0, 0, 0.7)'` → kırmızı, yeşil, mavi 0 (siyah); son sayı **saydamlık**: 0.7 yani %70 kapak. Arkası hafif
  görünen koyu bir şerit.
- `ctx.fillRect(0, 180, COLS * CELL, 110)` → kuyunun ortasında, kuyu eninde 110 piksellik şerit.
- `ctx.font = 'bold 28px sans-serif'` → yazı tipi ve boyu. `ctx.textAlign = 'center'` → yazıyı verilen `x`'e ortala.
- `ctx.fillText('Game Over', (COLS * CELL) / 2, 225)` → yazıyı kuyunun ortasına (`x` = 120) yazar.

# --task--

In `draw`, replace the last line `drawShape(piece.shape, ...)` with the lines shown.

# --task-tr--

1. `draw` içindeki son satırı, `drawShape(piece.shape, piece.x, piece.y)`, sil; yerine koddaki satırları yaz
   (`draw`'ı kapatan `}` en sonda kalsın).
2. **Çalıştır** ve yığını tepeye kadar yükselt: **Game Over** görmelisin.

# --tests--

A finished game should show `Game Over` and no falling piece.
tr: Biten oyun `Game Over` göstermeli, düşen parça çizilmemeli.

```js
piece = { shape: SHAPES[1].map((r) => [...r]), x: 0, y: 0 }
$.tick(1)
assert.lengthOf($.rects('#facc15'), 4, 'the piece while playing')
assert.notInclude($.texts(), 'Game Over')
state = 'over'
$.tick(1)
assert.lengthOf($.rects('#facc15'), 0, 'no piece after the game')
assert.include($.texts(), 'Game Over')
assert.include($.texts(), 'Press Space to play again')
assert.deepInclude($.rects(), { x: 0, y: 180, w: 240, h: 110, color: 'rgba(0, 0, 0, 0.7)' })
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

let board
let piece
let state // 'playing' or 'over'
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
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

function lock() {
  piece.shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) board[piece.y + r][piece.x + c] = value
    })
  })
  spawn()
}

function softDrop() {
  if (!tryMove(0, 1)) lock()
}

document.addEventListener('keydown', (event) => {
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
