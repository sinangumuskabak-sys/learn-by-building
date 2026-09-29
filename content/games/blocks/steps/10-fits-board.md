---
title: Blocks are in the way
title_tr: Bloklar yolu kapatır
skills: [game.collision]
---

# --goal--

Second part: a cell does not fit where the board already has a block. Rows above the top of the well count as empty,
so a piece can stick out above the well for a moment.

# --goal-tr--

Sorunun ikinci yarısı: hücrenin gideceği yerde kuyuda **zaten bir blok** varsa sığmaz.

Bir özel durum: kuyunun **üstündeki** satırlar (`satır < 0`) boş sayılır. Tepede döndürülen bir parça bir an kuyunun
üstüne taşabilir; bu çarpışma sayılmamalı. Zaten `board[-1]` diye bir satır yok; bakmaya çalışsak program hata verirdi.

# --code--

```js
if (row >= 0 && board[row][col]) return false
```

# --meaning--

- `&&` means "and": only inside the well (`row >= 0`) do we look at the board, and a filled cell there means no fit.
- Because `&&` stops at the first false part, `board[row]` is never read for a row above the well.

# --meaning-tr--

- `row >= 0 && board[row][col]` → `&&` "ve": satır kuyunun içindeyse **ve** o hücre doluysa sığmaz.
- `&&` soldaki kısım yanlışsa sağdakine **hiç bakmaz**. Bu yüzden satır eksi olduğunda `board[row]` okunmaz ve hata
  çıkmaz.

# --task--

In `fits`, under the walls line (`if (col < 0 || ...`), write the new line.

# --task-tr--

1. `fits` içinde `if (col < 0 || col >= COLS || row >= ROWS) return false` satırının **altına** yeni satırı yaz.
2. **Çalıştır**: kontroller yeşil olmalı.

# --tests--

A piece should not fit over blocks on the board.
tr: Bir parça tahtadaki blokların üstüne sığmamalı.

```js
board[10][4] = 5
assert.isFalse(fits(SHAPES[2], 3, 9))
assert.isTrue(fits(SHAPES[2], 3, 8))
assert.isTrue(fits(SHAPES[1], 5, 9), 'right next to the block')
```

Rows above the top of the well should count as empty.
tr: Kuyunun tepesinin üstündeki satırlar boş sayılmalı.

```js
board[0][4] = 1
assert.isTrue(fits(SHAPES[2], 3, -2), 'the T sticks out above the well')
assert.isTrue(fits(SHAPES[0], 0, -1), 'the I has empty rows above its blocks')
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

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)
let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }

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
  drawShape(piece.shape, piece.x, piece.y)
}

draw()
```
