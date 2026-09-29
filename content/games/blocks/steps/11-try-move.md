---
title: Try, then move
title_tr: Önce dene, sonra taşı
skills: [game.collision, prog.functions]
---

# --goal--

`tryMove(dx, dy)` asks `fits` about the new place first and moves only if the answer is yes. It returns whether it
moved.

# --goal-tr--

Elimizde `fits` olduğuna göre hareket iki adımlı bir kalıp: **önce sor, sonra yap.** "Bir sütun sola gitse sığar
mı?" Evetse gerçekten taşı, hayırsa hiçbir şeye dokunma.

Asla önce taşıyıp, yanlış olursa geri almaya çalışma. Böylece parça **hiçbir an** duvarın ya da blokların içinde
olmaz. Fonksiyon bir de cevap verir: hareket oldu mu (`true`), olmadı mı (`false`). Sonraki adımlar bu cevaba
dayanacak.

# --code--

```js
function tryMove(dx, dy) {
  if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false
  piece.x += dx
  piece.y += dy
  return true
}
```

# --meaning--

- `dx` and `dy` say how many columns right and rows down: left is `(-1, 0)`, down is `(0, 1)`.
- If the piece would not fit at the new place, return `false` without changing anything.
- Otherwise move it (`+=` adds) and return `true`.

# --meaning-tr--

- `dx`, `dy` → "kaç sütun sağa, kaç satır aşağı". Sola `(-1, 0)`, sağa `(1, 0)`, aşağı `(0, 1)`.
- `if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false` → **yeni** yerde sığmıyorsa hiçbir şeye dokunmadan
  "hayır" ile çık.
- `piece.x += dx` → `+=` "üstüne ekle": `piece.x = piece.x + dx` ile aynı.
- `return true` → "evet, hareket oldu".

# --task--

Write `tryMove` under `fits`, after an empty line.

# --task-tr--

1. `fits` fonksiyonunun altına bir boş satır bırakıp `tryMove` fonksiyonunu yaz.
2. **Çalıştır**: ekran değişmez; tuşları bir sonraki adımda bağlayacağız.

# --tests--

`tryMove()` should move the piece when it fits and report it.
tr: `tryMove()` sığdığında parçayı taşımalı ve bunu bildirmeli.

```js
assert.isTrue(tryMove(1, 0))
assert.deepInclude(piece, { x: 4, y: 0 })
assert.isTrue(tryMove(0, 1))
assert.deepInclude(piece, { x: 4, y: 1 })
```

It should refuse moves into walls or blocks, leaving the piece where it was.
tr: Duvarlara ya da bloklara doğru hamleleri reddetmeli ve parçayı yerinde bırakmalı.

```js
piece.x = 0
assert.isFalse(tryMove(-1, 0))
assert.strictEqual(piece.x, 0)
board[2][1] = 4
assert.isFalse(tryMove(0, 1))
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

function tryMove(dx, dy) {
  if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false
  piece.x += dx
  piece.y += dy
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
