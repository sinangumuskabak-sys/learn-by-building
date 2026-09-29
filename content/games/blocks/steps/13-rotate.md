---
title: Turn a matrix
title_tr: Matrisi döndür
skills: [prog.arrays, prog.functions]
---

# --goal--

Rotating a piece clockwise is a rule about its matrix: the first column, read from the bottom up, becomes the first
row; the second column the second row, and so on. `rotate` builds that new matrix and leaves the old one alone.

# --goal-tr--

Parçayı saat yönünde 90° döndürmek, matrisi için bir kuraldır. T'ye bak:

```
0 3 0        0 3 0
3 3 3   →    0 3 3
0 0 0        0 3 0
```

Soldakinin **ilk sütunu, aşağıdan yukarı okununca** (0, 3, 0) sağdakinin **ilk satırı** olur. İkinci sütun aşağıdan
yukarı (0, 3, 3) → ikinci satır. Üçüncü sütun → üçüncü satır. Kâğıdı saat yönünde çevirmeyi düşün: sol kenar üste
gelir.

Bu kuralı tek satırda yazan bir fonksiyon: `rotate`. Ekranda henüz bir şey değişmeyecek.

# --code--

```js
// Clockwise: the first column, read from the bottom up, becomes the first row.
function rotate(shape) {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse())
}
```

# --meaning--

- `shape.map((row) => row[col])` takes number `col` from every row: column `col`, top to bottom.
- `.reverse()` turns it bottom to top.
- `shape[0].map((_, col) => ...)` does that once for each column and collects the results as the new rows. `_` is the
  name for the element we do not need; only the index `col` matters.
- `map` always makes new arrays, so the original is not changed. This only works for square matrices, which is why
  every piece is square.

# --meaning-tr--

İçten dışa, parça parça oku:

- `shape.map((row) => row[col])` → her satırdan `col` numaralı sayıyı al: `col` sütununu **yukarıdan aşağı** bir liste
  olarak topla.
- `.reverse()` → listeyi ters çevir: artık **aşağıdan yukarı**.
- `shape[0].map((_, col) => ...)` → ilk satırın her elemanı için bir kez, yani **her sütun için** bunu yap; sonuçlar
  yeni matrisin satırları olur. `map` fonksiyona eleman ile sıra numarasını verir; bize yalnız sıra numarası (`col`)
  lazım, kullanmadığımız elemana `_` deriz.
- `map` her zaman **yeni** bir liste yapar: asıl şekil değişmez.
- Bu yöntem yalnız **kare** matrislerde doğru çalışır; bütün parçaları baştan kare yapmamızın sebebi buydu. Dört kez
  döndürünce parça başladığı hâle döner.

# --task--

Write the comment and `rotate` above `function fits(`.

# --task-tr--

1. Yorum satırını ve `rotate` fonksiyonunu `function fits(` satırının **üstüne** yaz; altında bir boş satır kalsın.
2. **Çalıştır**: ekran değişmez; kontroller döndürmeyi deniyor.

# --hint--

Read it from the inside out, and count the parentheses: the line ends with `.reverse())`.

# --hint-tr--

İçten dışa oku ve parantezleri say: satır `.reverse())` ile biter.

# --tests--

`rotate()` should turn a matrix clockwise into a new matrix.
tr: `rotate()` bir matrisi saat yönünde yeni bir matrise döndürmeli.

```js
const T = [[0, 3, 0], [3, 3, 3], [0, 0, 0]]
assert.deepEqual(rotate(T), [[0, 3, 0], [0, 3, 3], [0, 3, 0]])
assert.deepEqual(rotate([[1, 2], [3, 4]]), [[3, 1], [4, 2]])
assert.deepEqual(T, [[0, 3, 0], [3, 3, 3], [0, 0, 0]], 'the original must not change')
```

Four turns should bring every piece back to where it started.
tr: Dört dönüş her parçayı başladığı yere geri getirmeli.

```js
for (const shape of SHAPES) {
  assert.deepEqual(rotate(rotate(rotate(rotate(shape)))), shape)
}
assert.deepEqual(rotate(SHAPES[0]), [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]])
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
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
