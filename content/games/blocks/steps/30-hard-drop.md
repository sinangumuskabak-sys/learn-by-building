---
title: Drop it
title_tr: Bırak gitsin
skills: [game.input, prog.loops]
---

# --goal--

Space drops the piece to the bottom at once and locks it. Dropping on purpose is rewarded: 1 point per row with the
Down arrow, 2 per row with Space.

# --goal-tr--

**Boşluk** parçayı bir anda en alta bıraksın ve hemen kilitlesin (sert bırakma, hard drop). Bilerek hızlı oynamak
ödüllendirilir: Aşağı okla indirilen her satır **1**, Boşlukla bırakılan her satır **2** puan.

"Sığdıkça aşağı in" tek satırlık bir `while` döngüsü.

# --code--

```js
function hardDrop() {
  while (tryMove(0, 1)) score += 2
  lock()
}

  if (event.key === 'ArrowDown') {
    if (tryMove(0, 1)) score += 1
  }
  if (event.key === ' ') hardDrop()
```

# --meaning--

- `while (condition) ...` repeats as long as the condition is true. Here the condition itself moves the piece: each
  successful `tryMove(0, 1)` adds 2 points, and the first refusal ends the loop. Then `lock()`.
- The Down arrow scores 1 only if the piece really moved.

# --meaning-tr--

- `while (koşul) ...` → koşul doğru olduğu sürece **tekrar eder**.
- `while (tryMove(0, 1)) score += 2` → koşulun kendisi hareketi yapıyor: `tryMove` bir satır inmeyi dener; başarırsa
  `true` döner, 2 puan eklenir ve döngü sürer. İnemediği an `false` döner ve döngü biter. Bu, ancak `tryMove`
  hareketin olup olmadığını bildirdiği için mümkün.
- `lock()` → sonra parçayı yerine sabitle.
- `if (tryMove(0, 1)) score += 1` → Aşağı ok: parça **gerçekten** indiyse 1 puan. Dipteyken basmak puan getirmez.
- `if (event.key === ' ') hardDrop()` → Boşluk. Oyun bittiyse dinleyicinin başındaki blok zaten `return` ettiği
  için Boşluk o zaman yeni oyun başlatır.

# --task--

1. Write `hardDrop` under `softDrop`.
2. In the key listener, replace the `ArrowDown` line with the block and add the Space line under it.

# --task-tr--

1. `softDrop` fonksiyonunun altına bir boş satır bırakıp `hardDrop` fonksiyonunu yaz.
2. Tuş dinleyicisinde `ArrowDown` satırını koddaki üç satırlık blokla değiştir; altına Boşluk satırını yaz.
3. **Çalıştır** ve Boşluk'a bas: parça bir anda dibe inmeli.

# --tests--

Space should drop the piece to the bottom, lock it and score 2 per row.
tr: Boşluk parçayı en alta düşürmeli, kilitlemeli ve satır başına 2 puan vermeli.

```js
score = 0
piece = { shape: SHAPES[1].map((r) => [...r]), x: 4, y: 0 }
$.press(' ')
assert.strictEqual(board[19][4], 2)
assert.strictEqual(board[18][5], 2)
assert.strictEqual(score, 36)
assert.strictEqual(piece.y, 0, 'a new piece has appeared')
```

The Down arrow should score 1 for each row it really moves.
tr: Aşağı ok gerçekten indirdiği her satır için 1 puan vermeli.

```js
score = 0
piece = { shape: SHAPES[1].map((r) => [...r]), x: 4, y: 17 }
$.press('ArrowDown')
assert.strictEqual(score, 1)
$.press('ArrowDown')
assert.strictEqual(score, 1, 'at the bottom it cannot move, so no point')
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
let next
let bag
let score
let lines
let state // 'playing' or 'over'
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
  bag = []
  score = 0
  lines = 0
  state = 'playing'
  next = takeFromBag()
  spawn()
}

// The "7-bag": deal all seven pieces in a random order, then shuffle a new bag.
function takeFromBag() {
  if (bag.length === 0) {
    bag = [0, 1, 2, 3, 4, 5, 6]
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bag[i], bag[j]] = [bag[j], bag[i]]
    }
  }
  return SHAPES[bag.pop()].map((row) => [...row])
}

function spawn() {
  const shape = next
  next = takeFromBag()
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

function hardDrop() {
  while (tryMove(0, 1)) score += 2
  lock()
}

document.addEventListener('keydown', (event) => {
  if (state === 'over') {
    if (event.key === ' ' || event.key === 'Enter') newGame()
    return
  }
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
  if (event.key === 'ArrowUp' || event.key === 'x') tryRotate()
  if (event.key === 'ArrowDown') {
    if (tryMove(0, 1)) score += 1
  }
  if (event.key === ' ') hardDrop()
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
  ctx.fillText('Next', panel, 30)
  drawShape(next, 11, 2)
  ctx.fillStyle = 'white' // drawShape changed the fill color; the labels below need white again
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
