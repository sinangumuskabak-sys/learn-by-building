---
title: A piece is a small grid
title_tr: Parça küçük bir ızgaradır
skills: [prog.arrays, game.canvas]
---

# --goal--

A piece is a small matrix of numbers, like a tiny board: `3` is a purple block, `0` nothing. The falling piece is its
shape plus its place in the well, `x` (column) and `y` (row). `drawShape` draws each filled cell of a matrix at that
place.

# --goal-tr--

Her parça kendi başına minik bir tablodur, yani bir **matris**: sayılardan oluşan satırlar. 0 boş, 0 olmayan sayı dolu
hücre. **T** parçası:

```
0 3 0
3 3 3
0 0 0
```

Satırları alt alta yazınca şekli gözünle görürsün: üstte ortada bir blok, altında üç blok. 3 aynı zamanda rengi:
mor.

Düşen parça = **şekil** + kuyudaki **yeri**: `x` sütun, `y` satır (matrisin sol üst köşesinin yeri). Bir nesnede
tutuyoruz ve `drawShape` ile çiziyoruz.

# --code--

```js
let piece = { shape: [[0, 3, 0], [3, 3, 3], [0, 0, 0]], x: 3, y: 0 }

function drawShape(shape, x, y) {
  shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) drawCell(x + c, y + r, COLORS[value])
    })
  })
}

  drawShape(piece.shape, piece.x, piece.y)
```

# --meaning--

- `piece` is an object: `shape` (the matrix), `x` and `y` (where its top-left corner is in the well).
- `forEach` runs a function for every element and gives it the element and its index: the outer one each row (`cells`,
  index `r`), the inner one each number in that row (`value`, index `c`).
- A filled cell at `[r][c]` of the matrix is drawn in the well at `(x + c, y + r)`.
- `draw` draws the piece after the board, on top of it.

# --meaning-tr--

- `let piece = { shape: ..., x: 3, y: 0 }` → bir **nesne**: şekil matrisi ve kuyudaki yeri. `[[0, 3, 0], [3, 3, 3],
  [0, 0, 0]]` üç satırlık matrisin tek satırda yazılışı.
- `function drawShape(shape, x, y) {` → bir matrisi `(x, y)` yerine çizer:
  - `shape.forEach((cells, r) => { ... })` → `forEach` listedeki **her eleman** için fonksiyonu çalıştırır ve ona
    elemanı ve **sıra numarasını** verir. Dıştaki her satırı (`cells`) ve satır numarasını (`r`) alır.
  - `cells.forEach((value, c) => { ... })` → o satırdaki her sayıyı (`value`) ve sütun numarasını (`c`) alır.
  - `if (value) drawCell(x + c, y + r, COLORS[value])` → sayı 0 değilse, kuyuda `(x + c, y + r)` hücresini sayının
    rengiyle çiz. Matristeki yer + parçanın yeri = kuyudaki yer.
- `drawShape(piece.shape, piece.x, piece.y)` (`draw`'ın sonunda) → parçayı tahtanın **üstüne** çiz.

# --task--

1. Under `let board` write `let piece`.
2. Under `drawCell` write `drawShape`.
3. In `draw`, after the two loops, write the `drawShape(...)` call.

# --task-tr--

1. `let board = ...` satırının altına `let piece = ...` satırını yaz.
2. `drawCell` fonksiyonunun altına bir boş satır bırakıp `drawShape` fonksiyonunu yaz.
3. `draw` içinde iki döngünün kapanan `}` satırlarının **altına** `drawShape(piece.shape, piece.x, piece.y)` yaz.
4. **Çalıştır**: kuyunun tepesinde mor bir T görmelisin.

# --try--

Set `x: 7, y: 17` in `piece` and run: the T sits in the bottom-right corner. Put `3, 0` back.

# --try-tr--

`piece` içinde `x: 7, y: 17` yap ve çalıştır: T sağ alt köşeye oturur. Sonra `3, 0`'a geri al.

# --tests--

The T should be drawn at the top of the well.
tr: T kuyunun tepesinde çizilmeli.

```js
const purple = $.rects('#a855f7').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(purple, [[4, 0], [3, 1], [4, 1], [5, 1]])
```

The piece should be drawn wherever `piece` says.
tr: Parça, `piece` neredeyse orada çizilmeli.

```js
piece.x = 0
piece.y = 5
draw()
const purple = $.rects('#a855f7').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(purple, [[1, 5], [0, 6], [1, 6], [2, 6]])
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

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)
let piece = { shape: [[0, 3, 0], [3, 3, 3], [0, 0, 0]], x: 3, y: 0 }

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
