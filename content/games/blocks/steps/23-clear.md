---
title: Clear full rows
title_tr: Dolu satırları sil
skills: [prog.arrays]
---

# --goal--

A full row disappears and everything above falls down. Because the board is a list of rows, this is two list
operations: keep the rows that still have a gap, and put new empty rows on top.

# --goal-tr--

Oyunun amacı: bir satırı **tamamen doldurmak**. Dolan satır kaybolur ve üstündeki her şey bir satır aşağı iner.

Blokları tek tek taşımak gerekiyormuş gibi görünür. Ama tahta **satırlardan oluşan bir liste** olduğu için iş iki
liste işlemi:

1. hâlâ boşluğu olan satırları **tut**,
2. silinen kadar yeni boş satırı **en üste** ekle.

Kalan satırlar sıralarını koruduğu için üsttekiler kendiliğinden "düşer". Verin için doğru şekli seçmek, zor bir
problemi birkaç satıra indirdi.

# --code--

```js
function clearLines() {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = ROWS - kept.length
  if (cleared === 0) return
  board = [...Array.from({ length: cleared }, emptyRow), ...kept]
}

  clearLines()
```

# --meaning--

- `row.some((cell) => cell === 0)` asks "is there at least one empty cell in this row?".
- `board.filter(...)` keeps only the rows where that is true: the rows that are not full, in their old order.
- `ROWS - kept.length` is how many rows were full.
- `[...a, ...b]` spreads two lists into one: `cleared` new empty rows first, then the kept rows. 20 rows again.
- `lock` clears lines after writing the piece and before the next one appears.

# --meaning-tr--

- `row.some((cell) => cell === 0)` → `some` "listede bu koşulu sağlayan **en az bir** eleman var mı?" diye sorar. Yani
  "bu satırda en az bir boş hücre var mı?"
- `board.filter(...)` → `filter` listeden yalnız koşulu sağlayanları tutan **yeni** bir liste yapar: dolu **olmayan**
  satırlar, eski sıralarıyla.
- `const cleared = ROWS - kept.length` → 20'den kalan satır sayısını çıkar: kaç satır doluydu.
- `if (cleared === 0) return` → hiç dolmadıysa hemen çık.
- `board = [...Array.from({ length: cleared }, emptyRow), ...kept]` → `...` (yayma) bir listenin elemanlarını buraya
  döker: önce `cleared` kadar yeni boş satır, arkasından tutulan satırlar. Toplam yine 20.
- `clearLines()` (`lock` içinde) → parça tahtaya yazıldıktan sonra, yenisi gelmeden önce.

# --task--

1. Write `clearLines` above `function lock() {`.
2. In `lock`, call `clearLines()` above `spawn()`.

# --task-tr--

1. `clearLines` fonksiyonunu `function lock() {` satırının **üstüne** yaz; altında bir boş satır kalsın.
2. `lock` içinde `spawn()` satırının **üstüne** `clearLines()` yaz.
3. **Çalıştır** ve bir satırı doldur: kaybolmalı.

# --try--

Fill the bottom row except one gap and drop the long I standing up into it: up to four rows at once.

# --try-tr--

Alt satırları birer boşluk bırakarak doldur ve uzun I'yı dik hâlde boşluğa bırak: aynı anda dört satıra kadar silinir.

# --tests--

Full rows should disappear and the rows above should fall.
tr: Dolu satırlar kaybolmalı ve üstteki satırlar düşmeli.

```js
board[19] = Array(10).fill(1)
board[18] = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
board[17] = Array(10).fill(3)
clearLines()
assert.deepEqual(board[19], [2, 0, 0, 0, 0, 0, 0, 0, 0, 0])
assert.isTrue(board.slice(0, 19).every((row) => row.every((cell) => cell === 0)))
assert.lengthOf(board, 20)
assert.notStrictEqual(board[0], board[1], 'new rows are separate arrays')
```

Locking a piece that completes a row should clear it.
tr: Bir satırı tamamlayan parçayı kilitlemek o satırı silmeli.

```js
board[19] = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0]
piece = { shape: SHAPES[1].map((r) => [...r]), x: 8, y: 18 }
softDrop()
assert.deepEqual(board[19], [0, 0, 0, 0, 0, 0, 0, 0, 2, 2])
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

function clearLines() {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = ROWS - kept.length
  if (cleared === 0) return
  board = [...Array.from({ length: cleared }, emptyRow), ...kept]
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
