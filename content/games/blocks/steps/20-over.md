---
title: When the pile reaches the top
title_tr: Yığın tepeye ulaşınca
skills: [game.state]
---

# --goal--

If a new piece does not even fit where it appears, the pile has reached the top: the game is over. A `state` variable
remembers it, and the loop stops dropping.

# --goal-tr--

Yeni parça **çıktığı yere bile sığmıyorsa** yığın tepeye ulaşmış demektir: oyun biter. Yine aynı soru: `fits`.

Oyunun durumunu bir değişkende tutuyoruz: `state`. Değeri ya `'playing'` (oynanıyor) ya da `'over'` (bitti). Oyun
bitince döngü parçayı düşürmeyi bırakacak.

# --code--

```js
let state // 'playing' or 'over'

  state = 'playing'

  if (!fits(piece.shape, piece.x, piece.y)) state = 'over'

  if (state === 'playing' && time - lastDrop >= 800) {
```

# --meaning--

- `newGame` sets `state` to `'playing'`.
- `spawn` checks the new piece: if it does not fit where it appears, the game is `'over'`.
- The loop only drops the piece while playing.

# --meaning-tr--

- `let state` → oyunun durumu. Değeri bir **yazı**: `'playing'` ya da `'over'`.
- `state = 'playing'` (`newGame` içinde) → her yeni oyun oynanarak başlar.
- `if (!fits(piece.shape, piece.x, piece.y)) state = 'over'` (`spawn`'ın sonunda) → yeni parça yerine sığmıyorsa oyun
  bitti.
- `state === 'playing' && time - lastDrop >= 800` → `&&` "ve": oyun sürüyorsa **ve** zamanı geldiyse düşür.

# --task--

1. Above `let lastDrop = 0` write `let state`.
2. In `newGame`, under the `board = ...` line, write `state = 'playing'`.
3. In `spawn`, at the end, write the `fits` check.
4. In `loop`, add `state === 'playing' &&` to the `if`.

# --task-tr--

1. `let lastDrop = 0` satırının **üstüne** `let state ...` yaz.
2. `newGame` içinde `board = ...` satırının altına `state = 'playing'` yaz.
3. `spawn` içinde en sona, `piece = { ... }` satırının altına `fits` kontrolünü yaz.
4. `loop` içindeki `if (time - lastDrop >= 800) {` satırının başına `state === 'playing' && ` ekle.
5. **Çalıştır** ve parçaları üst üste yığ: yığın tepeye varınca düşüş durmalı.

# --tests--

A stack reaching the top should end the game.
tr: Tepeye ulaşan bir yığın oyunu bitirmeli.

```js
assert.strictEqual(state, 'playing')
for (let row = 0; row < 3; row++) board[row] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
spawn()
assert.strictEqual(state, 'over')
```

After the game is over, nothing should fall.
tr: Oyun bittikten sonra hiçbir şey düşmemeli.

```js
state = 'over'
const y = piece.y
$.run(2)
assert.strictEqual(piece.y, y)
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
  drawShape(piece.shape, piece.x, piece.y)
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
