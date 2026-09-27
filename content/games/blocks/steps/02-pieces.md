---
title: Pieces as little grids
title_tr: Küçük ızgaralar olarak parçalar
skills: [prog.arrays, game.state]
---

# --explanation--

Each of the seven pieces is itself a tiny grid, a **matrix**, where non-zero numbers mark the filled cells:

```js
[
  [0, 3, 0],   // the T piece
  [3, 3, 3],
  [0, 0, 0],
]
```

The number doubles as the piece's **color**: `COLORS[3]` is purple. The same number is later copied into the board when
the piece lands, so the board remembers the color of every block without any extra data.

All matrices are **square** (2×2, 3×3 or 4×4), with some empty rows. That looks wasteful, but it is what lets a piece
rotate around its center in a later step.

The falling piece is a matrix plus a position in the well, `{ shape, x, y }`, measured in cells. Drawing it means: for
every filled cell of the matrix at `[r][c]`, draw a cell at `(x + c, y + r)`. Take a **copy** of the shape
(`SHAPES[2].map((row) => [...row])`) so that turning or changing the falling piece later never changes the original
template.

# --explanation-tr--

Yedi parçanın her biri kendi başına minik bir ızgaradır, bir **matris**; sıfır olmayan sayılar dolu hücreleri gösterir:

```js
[
  [0, 3, 0],   // T parçası
  [3, 3, 3],
  [0, 0, 0],
]
```

Sayı aynı zamanda parçanın **rengidir**: `COLORS[3]` mor. Parça yere inince aynı sayı tahtaya kopyalanır; böylece tahta,
fazladan hiçbir veri olmadan her bloğun rengini hatırlar.

Bütün matrisler **kare**dir (2×2, 3×3 ya da 4×4), bazılarında boş satırlar vardır. İsraf gibi görünür, ama ileriki bir
adımda bir parçanın merkezi etrafında dönmesini sağlayan budur.

Düşen parça, bir matris artı kuyudaki bir konumdur, `{ shape, x, y }`; hücre cinsinden. Onu çizmek şu demek: matrisin
`[r][c]` konumundaki her dolu hücre için `(x + c, y + r)` noktasına bir hücre çiz. Şeklin bir **kopyasını** al
(`SHAPES[2].map((row) => [...row])`); böylece ileride düşen parçayı döndürmek ya da değiştirmek asıl şablonu asla
değiştirmez.

# --task--

1. Add the `COLORS` and `SHAPES` constants from the solution (seven square matrices).
2. Add `let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }` (the T piece, near the middle).
3. Write `drawShape(shape, x, y, color)` that draws every non-zero cell of `shape` at `(x + c, y + r)`, in `color` if
   given, otherwise `COLORS[value]`. Draw board cells in `COLORS[value]` too, and draw the piece at the end of `draw()`.

# --task-tr--

1. Çözümdeki `COLORS` ve `SHAPES` sabitlerini ekle (yedi kare matris).
2. `let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }` ekle (T parçası, ortaya yakın).
3. `shape`'in sıfır olmayan her hücresini `(x + c, y + r)` noktasına; `color` verildiyse o renkte, değilse
   `COLORS[value]` renginde çizen `drawShape(shape, x, y, color)` yaz. Tahta hücrelerini de `COLORS[value]` ile çiz ve
   `draw()`'un sonunda parçayı çiz.

# --tests--

There should be seven square pieces, each with four blocks of one color.
tr: Her biri tek renkli dört bloktan oluşan yedi kare parça olmalı.

```js
assert.lengthOf(SHAPES, 7)
SHAPES.forEach((shape, i) => {
  assert.isTrue(shape.every((row) => row.length === shape.length), `piece ${i} should be square`)
  const cells = shape.flat().filter((v) => v !== 0)
  assert.lengthOf(cells, 4, `piece ${i} should have 4 blocks`)
  assert.isTrue(cells.every((v) => v === i + 1), `piece ${i} should use the number ${i + 1}`)
})
```

The falling piece should be a copy of the T, drawn at its position.
tr: Düşen parça T'nin bir kopyası olmalı ve kendi konumunda çizilmeli.

```js
assert.deepEqual(piece.shape, SHAPES[2])
assert.notStrictEqual(piece.shape, SHAPES[2], 'take a copy of the shape')
assert.notStrictEqual(piece.shape[0], SHAPES[2][0], 'copy the rows too')
const purple = $.rects('#a855f7').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(purple, [[4, 0], [3, 1], [4, 1], [5, 1]])
```

Board cells should use the color of their number.
tr: Tahta hücreleri sayılarının rengini kullanmalı.

```js
board[19][0] = 6
draw()
assert.deepInclude($.rects('#3b82f6'), { x: 1, y: 457, w: 22, h: 22, color: '#3b82f6' })
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

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function drawShape(shape, x, y, color) {
  shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) drawCell(x + c, y + r, color || COLORS[value])
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
