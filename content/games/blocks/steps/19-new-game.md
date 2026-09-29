---
title: One function starts a game
title_tr: Oyunu başlatan tek fonksiyon
skills: [game.state, prog.functions]
---

# --goal--

To play again later we must be able to set everything back to the start. `newGame()` empties the board and brings the
first piece; the variables are declared at the top without values.

# --goal-tr--

Oyun bitince yeniden oynayabilmek için her şeyi **başlangıç hâline** döndürebilmeliyiz: boş tahta, yeni parça,
ileride skor... Bu yüzden başlangıcı tek bir fonksiyonda topluyoruz: `newGame()` (yeni oyun).

Değişkenleri dosyanın üstünde **boş** tanımlıyoruz; değerlerini `newGame` veriyor. Oyun açılırken bir kez
çağrılıyor. Ekranda bir şey değişmeyecek.

# --code--

```js
let board
let piece
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
  spawn()
}

newGame()
requestAnimationFrame(loop)
```

# --meaning--

- `let board` and `let piece` move above `emptyRow`, without values.
- `newGame()` gives `board` a fresh, empty well and spawns the first piece. It replaces the `spawn()` call at the bottom.

# --meaning-tr--

- `let board` → artık değer verilmeden, `emptyRow`'un **üstünde** tanımlanıyor. `let piece` ve `let lastDrop = 0` da
  onunla birlikte yukarı taşınıyor.
- `function newGame() {` → yeni bir oyun: `board`'a boş bir kuyu ver, ilk parçayı çıkar. Dikkat: içeride `let`
  yok; değişkenler zaten yukarıda tanımlı, burada yalnız **değer veriyoruz**.
- En alttaki `spawn()` yerine `newGame()`.

# --task--

1. Move the three `let` lines above `function emptyRow()`, and make `let board` empty.
2. Under `emptyRow` write `newGame`.
3. At the bottom, replace `spawn()` with `newGame()`.

# --task-tr--

1. `let board = ...`, `let piece` ve `let lastDrop = 0` satırlarını `function emptyRow()` satırının **üstüne** taşı
   (altlarında bir boş satır kalsın); `let board = ...` satırını yalnız `let board` yap.
2. `emptyRow` fonksiyonunun altına bir boş satır bırakıp `newGame` fonksiyonunu yaz.
3. En alttaki `spawn()` satırını `newGame()` yap.
4. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --hint--

Inside `newGame` write `board = ...`, not `let board = ...`: a `let` there would make a new variable that lives only inside `newGame`.

# --hint-tr--

`newGame` içinde `let board = ...` değil `board = ...` yaz: oradaki bir `let`, yalnız `newGame`'in içinde yaşayan yeni bir değişken yaratır.

# --tests--

`newGame()` should empty the board and bring a new piece.
tr: `newGame()` tahtayı boşaltmalı ve yeni bir parça getirmeli.

```js
board[19][5] = 3
board[5][5] = 1
piece.y = 12
newGame()
assert.lengthOf(board, 20)
assert.isTrue(board.flat().every((cell) => cell === 0))
assert.strictEqual(piece.y, 0)
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
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
  spawn()
}

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) => [...row])
}

function spawn() {
  const shape = randomShape()
  piece = { shape, x: Math.floor((COLS - shape.length) / 2), y: 0 }
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
  if (time - lastDrop >= 800) {
    lastDrop = time
    softDrop()
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
