---
title: The well
title_tr: Kuyu
skills: [prog.arrays, game.canvas]
---

# --explanation--

The playing field is a **well** 10 cells wide and 20 tall. Like 2048, it is a 2D array of numbers: `0` for an empty
cell, anything else for a filled one (later, the number will say which color).

The well is 240 pixels wide (10 cells of 24), and the canvas is 360, which leaves a side panel for the score and the
next piece.

Each cell is drawn 1 pixel smaller on every side than its slot (`col * CELL + 1`, size `CELL - 2`). That leaves a thin
dark line between blocks, so a stack of them reads as separate pieces instead of one big blob. Small visual decisions
like this cost one line and make a game much easier to read.

# --explanation-tr--

Oyun alanı 10 hücre genişliğinde ve 20 hücre yüksekliğinde bir **kuyu**. 2048'deki gibi 2 boyutlu bir sayı dizisi: boş
hücre için `0`, dolu hücre için başka bir şey (ileride sayı hangi renk olduğunu söyleyecek).

Kuyu 240 piksel genişliğinde (24'lük 10 hücre), canvas ise 360; geriye skor ve sıradaki parça için bir yan panel kalır.

Her hücre, yuvasından her kenarda 1 piksel küçük çizilir (`col * CELL + 1`, boyut `CELL - 2`). Bu, bloklar arasında ince
koyu bir çizgi bırakır; böylece bir yığın blok büyük tek bir leke yerine ayrı parçalar olarak okunur. Böyle küçük görsel
kararlar tek satıra mal olur ve bir oyunu çok daha okunur yapar.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `COLS = 10`, `ROWS = 20` and `CELL = 24`.
2. Write `emptyRow()` returning an array of `COLS` zeros, and build `let board` with
   `Array.from({ length: ROWS }, emptyRow)` (each row its own array).
3. Write `drawCell(col, row, color)` that fills `(col * CELL + 1, row * CELL + 1)` with size `CELL - 2`, and `draw()`:
   background `'#0f172a'`, well `'#1e293b'` (`COLS * CELL` × `ROWS * CELL` from the top left), and every non-zero cell
   in `'#94a3b8'`. Call `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut; `COLS = 10`, `ROWS = 20` ve `CELL = 24` ekle.
2. `COLS` sıfırdan oluşan bir dizi döndüren `emptyRow()` yaz ve `let board`'u `Array.from({ length: ROWS }, emptyRow)`
   ile kur (her satır kendi dizisi).
3. `(col * CELL + 1, row * CELL + 1)` noktasını `CELL - 2` boyutunda dolduran `drawCell(col, row, color)` ile şu
   `draw()`'u yaz: arka plan `'#0f172a'`, kuyu `'#1e293b'` (sol üstten `COLS * CELL` × `ROWS * CELL`) ve sıfır olmayan
   her hücre `'#94a3b8'`. `draw()`'u çağır.

# --tests--

The well should be 20 rows of 10 empty cells, each row its own array.
tr: Kuyu, her satırı kendi dizisi olan 10 boş hücreli 20 satır olmalı.

```js
assert.deepEqual([COLS, ROWS, CELL], [10, 20, 24])
assert.lengthOf(board, 20)
assert.isTrue(board.every((row) => row.length === 10 && row.every((cell) => cell === 0)))
assert.notStrictEqual(board[0], board[1])
```

The well and the filled cells should be drawn with a 1-pixel gap.
tr: Kuyu ve dolu hücreler 1 piksellik boşlukla çizilmeli.

```js
assert.deepEqual($.rects('#1e293b'), [{ x: 0, y: 0, w: 240, h: 480, color: '#1e293b' }])
board[19][0] = 1
board[18][9] = 1
draw()
assert.sameDeepMembers($.rects('#94a3b8'), [
  { x: 1, y: 457, w: 22, h: 22, color: '#94a3b8' },
  { x: 217, y: 433, w: 22, h: 22, color: '#94a3b8' },
])
```

# --seed--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
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

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, '#94a3b8')
    }
  }
}

draw()
```
