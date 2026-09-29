---
title: A list of shapes
title_tr: Şekil listesi
skills: [prog.arrays]
---

# --goal--

All the shapes go in one list, `SHAPES`. We start with three: the long I, the square O and the T. Every matrix is
square, even if it has empty rows: that is what lets us rotate them later. The falling piece takes a **copy** of the
T.

# --goal-tr--

Bütün parça şekillerini tek bir listede toplayacağız: `SHAPES`. Önce üçüyle başlıyoruz: uzun **I**, kare **O** ve
**T**. Sayılar renk: I camgöbeği (1), O sarı (2), T mor (3).

Dikkat: bütün matrisler **kare** (4×4, 2×2, 3×3); bazılarında boş satırlar var. Boşa yer harcıyor gibi görünür ama
birkaç adım sonra parçayı **merkezi etrafında döndürmemizi** sağlayan şey bu.

Düşen parça, şablonun kendisini değil bir **kopyasını** alacak. Sebebi: parçayı döndürüp değiştirdiğimizde asıl
şablon bozulmasın.

# --code--

```js
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
]

let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }
```

# --meaning--

- `SHAPES` is a list of matrices; `SHAPES[2]` is the T.
- `.map((row) => [...row])` makes a new list whose rows are new arrays: `[...row]` spreads a row's numbers into a new
  array. So `piece.shape` looks the same as the T but is a separate copy.

# --meaning-tr--

- `const SHAPES = [ ... ]` → matrislerin listesi. Matrisi satır satır alt alta yazmak şekli gözle görmeyi kolaylaştırır.
- `SHAPES[2]` → üçüncü şekil (sayma 0'dan): T.
- `SHAPES[2].map((row) => [...row])` → **kopya** çıkarır:
  - `.map(...)` listedeki her elemanı bir fonksiyondan geçirip **yeni bir liste** yapar.
  - `(row) => [...row]` → kısa yazılmış bir fonksiyon (**ok fonksiyonu**): girdisi `row`, sonucu `=>`'nin sağı.
  - `[...row]` → üç nokta (**yayma**, spread): satırın elemanlarını yeni bir diziye döker. Yani satırın kopyası.
  - Sonuç: aynı görünen ama **ayrı** bir matris. Onu değiştirmek `SHAPES`'e dokunmaz.

# --task--

1. Under `COLORS` write the comment and `SHAPES` with the three matrices.
2. Change the `shape:` of `piece` to `SHAPES[2].map((row) => [...row])`.

# --task-tr--

1. `COLORS` satırının altına yorum satırını ve üç matrisli `SHAPES` listesini yaz.
2. `let piece` satırında `shape:` değerini `SHAPES[2].map((row) => [...row])` yap.
3. **Çalıştır**: T aynı yerde durmalı.

# --hint--

`[...row]` has three dots before `row`, inside square brackets.

# --hint-tr--

`[...row]` içinde `row`'dan önce üç nokta var, köşeli parantezin içinde.

# --try--

Use `SHAPES[0]` for the piece and run: the long I. Put `SHAPES[2]` back.

# --try-tr--

Parça için `SHAPES[0]` kullan ve çalıştır: uzun I. Sonra `SHAPES[2]`'ye geri al.

# --tests--

`SHAPES` should start with the I, the O and the T, all square.
tr: `SHAPES` I, O ve T ile başlamalı; hepsi kare.

```js
assert.deepEqual(SHAPES[0], [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]])
assert.deepEqual(SHAPES[1], [[2, 2], [2, 2]])
assert.deepEqual(SHAPES[2], [[0, 3, 0], [3, 3, 3], [0, 0, 0]])
```

The falling piece should be a copy of the T, rows and all.
tr: Düşen parça T'nin satırlarıyla birlikte kopyası olmalı.

```js
assert.deepEqual(piece.shape, SHAPES[2])
assert.notStrictEqual(piece.shape, SHAPES[2], 'take a copy of the shape')
assert.notStrictEqual(piece.shape[0], SHAPES[2][0], 'copy the rows too')
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
