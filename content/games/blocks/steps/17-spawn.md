---
title: A random piece at the top
title_tr: Tepede rastgele bir parça
skills: [game.state]
---

# --goal--

Instead of always the T, `spawn()` puts a copy of a random shape at the top of the well, centred.

# --goal-tr--

Hep T gelmesin. `spawn()` (doğur, ortaya çıkar) **rastgele** bir şeklin kopyasını kuyunun en üstüne, **ortaya**
koyacak. `piece` artık boş tanımlanıyor; değerini `spawn` veriyor.

# --code--

```js
let piece

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) => [...row])
}

function spawn() {
  const shape = randomShape()
  piece = { shape, x: Math.floor((COLS - shape.length) / 2), y: 0 }
}

spawn()
requestAnimationFrame(loop)
```

# --meaning--

- `Math.random()` gives a number from 0 up to (not including) 1; times 7 and rounded down with `Math.floor`, it is a
  whole number 0 to 6: a random index into `SHAPES`.
- `(COLS - shape.length) / 2` centres the matrix; `Math.floor` rounds it down to a whole column.
- `{ shape, x, y }` is short for `{ shape: shape, ... }`.
- `spawn()` at the bottom makes the first piece.

# --meaning-tr--

- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı, örneğin 0.62.
- `* SHAPES.length` → 7 ile çarp: 0 ile 6,99 arası.
- `Math.floor(...)` → **aşağı yuvarla**: 0, 1, ..., 6 arasında rastgele bir tam sayı; yani rastgele bir şeklin sıra
  numarası. Sonra her zamanki gibi kopyası alınır.
- `Math.floor((COLS - shape.length) / 2)` → matrisi ortala: 3×3'lük bir parça için (10 - 3) / 2 = 3,5 → 3. sütun.
- `{ shape, x: ..., y: 0 }` → `shape: shape` yazmanın kısası: değişkenin adı alanın adıyla aynıysa bir kez yazmak
  yeter.
- En alttaki `spawn()` → döngü başlamadan ilk parçayı kurar.

# --task--

1. Change `let piece = ...` to just `let piece`.
2. Above the `// Clockwise...` comment write `randomShape` and `spawn`.
3. At the bottom, write `spawn()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `let piece = { ... }` satırını yalnız `let piece` yap.
2. `// Clockwise...` yorum satırının **üstüne** `randomShape` ve `spawn` fonksiyonlarını yaz; altlarında bir boş satır
   kalsın.
3. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `spawn()` yaz.
4. **Çalıştır** ve birkaç kez tekrar çalıştır: her seferinde başka bir parça gelmeli.

# --tests--

A new piece should appear at the top, centred.
tr: Yeni parça tepede, ortada belirmeli.

```js
spawn()
assert.strictEqual(piece.y, 0)
assert.strictEqual(piece.x, Math.floor((10 - piece.shape.length) / 2))
assert.isFalse(SHAPES.includes(piece.shape), 'a copy, not the template')
```

The pieces should be random.
tr: Parçalar rastgele olmalı.

```js
const seen = new Set()
for (let i = 0; i < 50; i++) {
  spawn()
  seen.add(JSON.stringify(piece.shape))
}
assert.isAtLeast(seen.size, 6)
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
let piece
let lastDrop = 0

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
    tryMove(0, 1)
  }
  draw()
  requestAnimationFrame(loop)
}

spawn()
requestAnimationFrame(loop)
```
