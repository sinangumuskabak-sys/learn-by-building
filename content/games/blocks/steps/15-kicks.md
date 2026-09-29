---
title: Wall kicks
title_tr: Duvar itmesi
skills: [game.collision, prog.loops]
---

# --goal--

A piece against a wall often cannot turn in place, and a game that says "no" feels bad. So we also try the turn
nudged one or two cells sideways, and take the first place that fits.

# --goal-tr--

Duvara dayanmış bir parça çoğu zaman yerinde dönemez ve oyunun "hayır" demesi çok kötü hissettirir. Çözüm **duvar
itmesi** (wall kick): aynı dönüşü 1 ya da 2 hücre **yana kaydırarak** da deneriz. Sığan ilk yer kazanır.

Deneme sırası: hiç kaydırmadan (0), 1 sola, 1 sağa, 2 sola, 2 sağa. Gerçek oyunlar büyük itme tabloları kullanır;
bu basit liste çoğu durumu çözer.

# --code--

```js
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
```

# --meaning--

- `for (const kick of [0, -1, 1, -2, 2])` tries each offset in turn.
- The first offset where the turned shape fits wins: the piece takes the shape and moves by `kick`, and `return true`
  stops the search.
- If none fits, `return false` after the loop.

# --meaning-tr--

- `for (const kick of [0, -1, 1, -2, 2]) {` → listedeki her sayı için içini sırayla bir kez çalıştır.
- `if (fits(turned, piece.x + kick, piece.y)) {` → dönmüş şekil `kick` kadar kaymış hâlde sığıyor mu?
  - Sığıyorsa şekli al, parçayı `kick` kadar kaydır ve `return true`. `return` fonksiyonu bitirdiği için geri kalan
    kaymalar **denenmez**.
- Hiçbiri sığmazsa döngü biter ve en alttaki `return false` çalışır.
- İlk deneme `0`: açık alanda parça yine yerinde döner.

# --task--

In `tryRotate`, replace everything under `const turned = ...` with the lines shown.

# --task-tr--

1. `tryRotate` içinde `const turned = rotate(piece.shape)` satırının **altındaki** her şeyi (kapanan `}` dahil) sil;
   yerine koddaki satırları yaz.
2. **Çalıştır**: T'yi duvara yasla ve döndür: artık yana kayarak dönmeli.

# --tests--

Against a wall, the piece should be kicked sideways to turn.
tr: Duvara yaslıyken parça dönmek için yana itilmeli.

```js
piece = { shape: rotate(SHAPES[0]), x: 7, y: 5 } // an upright I in the last column
assert.isTrue(fits(piece.shape, 7, 5))
$.press('ArrowUp')
assert.deepEqual(piece.shape.map((row) => row.join('')).join('/'), '0000/0000/1111/0000')
assert.strictEqual(piece.x, 6, 'nudged one cell left so the flat I fits')
```

In open space it should still turn in place.
tr: Açık alanda yine yerinde dönmeli.

```js
assert.isTrue(tryRotate())
assert.strictEqual(piece.x, 3)
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
  draw()
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

draw()
```
