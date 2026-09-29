---
title: All seven pieces
title_tr: Yedi parçanın hepsi
skills: [prog.arrays]
---

# --goal--

Four more pieces complete the set: S and Z (zigzags) and J and L (hooks). Each has four blocks, all with its own
number.

# --goal-tr--

Takımı tamamlıyoruz: iki zikzak (**S** ve **Z**) ve iki kanca (**J** ve **L**). Her parçada tam **dört blok** var
ve hepsi kendi numarasını taşıyor: S 4 (yeşil), Z 5 (kırmızı), J 6 (mavi), L 7 (turuncu).

Ekranda değişiklik yok; düşen parça hâlâ T.

# --code--

```js
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
```

# --meaning--

- S and Z are mirror images, and so are J and L. All four are 3×3 with an empty bottom row, like the T.

# --meaning-tr--

- S ve Z birbirinin **aynadaki görüntüsü**; J ve L de öyle.
- Dördü de T gibi 3×3 ve alt satırları boş. Boş satır döndürmede merkezin doğru yerde kalmasını sağlar.
- Her matriste yalnız **bir** sayı var (kendi rengi) ve o sayı dört kez geçiyor.

# --task--

In `SHAPES`, after the T's closing `],`, write the four matrices, before the list's closing `]`.

# --task-tr--

1. `SHAPES` içinde T matrisinin kapanan `],` satırının **altına**, listenin kapanan `]` satırından önce dört matrisi
   yaz.
2. **Çalıştır**. Görmek istersen `piece` için `SHAPES[4]` dene (Z), sonra `SHAPES[2]`'ye geri al.

# --hint--

Every matrix ends with `],` and the whole list ends with one `]` on its own line.

# --hint-tr--

Her matris `],` ile biter; bütün liste de kendi satırındaki tek bir `]` ile biter.

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
assert.deepEqual(SHAPES[3], [[0, 4, 4], [4, 4, 0], [0, 0, 0]], 'the S')
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
