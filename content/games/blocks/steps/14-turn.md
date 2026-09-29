---
title: Turn with Up
title_tr: Yukarı okla döndür
skills: [game.input, game.collision]
---

# --goal--

Turning is like moving: work out the turned shape, and use it only if it fits. The Up arrow or `x` turns the piece.

# --goal-tr--

Döndürmek de hareket gibi: **önce dene.** Dönmüş şekli hesapla; yalnız sığıyorsa kullan. Yukarı ok (ya da `x` tuşu)
parçayı döndürecek.

# --code--

```js
function tryRotate() {
  const turned = rotate(piece.shape)
  if (!fits(turned, piece.x, piece.y)) return false
  piece.shape = turned
  return true
}

  if (event.key === 'ArrowUp' || event.key === 'x') tryRotate()
```

# --meaning--

- `turned` is a new, rotated matrix; `piece` is not touched yet.
- Only if it fits at the same place does it become the piece's shape.
- `||` means "or": the Up arrow or `x`.

# --meaning-tr--

- `const turned = rotate(piece.shape)` → dönmüş **yeni** matris. `piece` henüz değişmedi.
- `if (!fits(turned, piece.x, piece.y)) return false` → aynı yerde sığmıyorsa vazgeç.
- `piece.shape = turned` → sığıyorsa parçanın şekli artık dönmüş hâli.
- `event.key === 'ArrowUp' || event.key === 'x'` → `||` "veya": yukarı ok **veya** x tuşu.

# --task--

1. Write `tryRotate` under `tryMove`.
2. In the key listener, under the `ArrowRight` line, write the `ArrowUp` line.

# --task-tr--

1. `tryMove` fonksiyonunun altına bir boş satır bırakıp `tryRotate` fonksiyonunu yaz.
2. Tuş dinleyicisinde `ArrowRight` satırının **altına** `ArrowUp` satırını yaz.
3. **Çalıştır**: Yukarı okla T'yi döndür. Sonra T'yi sağ duvara yasla ve döndürmeyi dene.

# --predict--

Push the T against the right wall and keep pressing Up. Does it always turn?
- [ ] Yes, always
- [x] Not always: in some positions the turned shape would stick into the wall, so the turn is refused
  The next step fixes this.
- [ ] It turns and sticks into the wall

# --predict-tr--

T'yi sağ duvara yasla ve Yukarı oka art arda bas. Her seferinde döner mi?
- [ ] Evet, her seferinde
- [x] Hayır: bazı duruşlarda dönmüş şekil duvara taşacağı için dönüş reddedilir
  Bir sonraki adım bunu düzeltecek.
- [ ] Döner ve duvara gömülür

# --tests--

Rotating in open space should turn the piece in place.
tr: Açık alanda döndürmek parçayı yerinde çevirmeli.

```js
assert.isTrue(tryRotate())
assert.deepEqual(piece.shape, [[0, 3, 0], [0, 3, 3], [0, 3, 0]])
assert.strictEqual(piece.x, 3)
$.press('x')
assert.deepEqual(piece.shape, [[0, 0, 0], [3, 3, 3], [0, 3, 0]])
$.press('ArrowUp')
assert.deepEqual(piece.shape, [[0, 3, 0], [3, 3, 0], [0, 3, 0]])
```

A turn that does not fit should be refused.
tr: Sığmayan bir dönüş reddedilmeli.

```js
piece = { shape: SHAPES[0].map((r) => [...r]), x: 3, y: 18 } // a flat I lying on the floor
assert.isFalse(tryRotate(), 'standing up would go through the floor')
assert.deepEqual(piece.shape, SHAPES[0])
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
  if (!fits(turned, piece.x, piece.y)) return false
  piece.shape = turned
  return true
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
