---
title: A grid of numbers
title_tr: Sayılardan bir ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

2048 is played on a 4×4 grid, and this time the natural shape for the data is a **2D array**: an array of rows, where
each row is an array of numbers. `0` means an empty cell.

```js
let board = [
  [0, 2, 0, 0],   // board[0] is the top row
  [0, 0, 4, 0],   // board[1][2] is 4: row 1, column 2
  ...
]
```

`board[row][col]` reads a cell: first the row, then the column. It reads like the picture, which makes 2D arrays pleasant
for grid games whose rules talk about rows and columns (and 2048's rules are all about rows and columns).

Each value gets its own color, from a lookup table keyed by the number: `COLORS[value]`. Numbers are drawn centered in
their cell, with smaller text for bigger numbers so that `1024` still fits.

# --explanation-tr--

2048, 4×4'lük bir ızgarada oynanır ve bu kez verinin doğal biçimi **2 boyutlu bir dizidir**: her satırı bir sayı dizisi
olan satırlar dizisi. `0` boş hücre demek.

```js
let board = [
  [0, 2, 0, 0],   // board[0] en üst satır
  [0, 0, 4, 0],   // board[1][2] 4'tür: 1. satır, 2. sütun
  ...
]
```

`board[row][col]` bir hücreyi okur: önce satır, sonra sütun. Resim gibi okunur; bu da kuralları satır ve sütunlardan söz
eden ızgara oyunları için 2 boyutlu dizileri hoş yapar (2048'in kurallarının hepsi satırlar ve sütunlarla ilgili).

Her değerin kendi rengi var; sayıya göre anahtarlanan bir arama tablosundan: `COLORS[value]`. Sayılar hücrelerinin
ortasına çizilir; büyük sayılar için yazı küçülür ki `1024` da sığsın.

# --task--

1. Store the canvas and context in `canvas` and `ctx`. Add `SIZE = 4`, `GAP = 12`,
   `CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE` (that is 85), `TOP = 60`, the `COLORS` table from the solution, and
   `let board`, a 4×4 array of zeros.
2. Write `cellX(col)` = `GAP + col * (CELL + GAP)` and `cellY(row)` = `TOP + GAP + row * (CELL + GAP)`.
3. Write `draw()`: fill the canvas with `'#faf8ef'`, draw the board background `'#bbada0'` as a square from
   `(0, TOP)` as wide as the canvas, then every cell: `'#cdc1b4'` when empty, `COLORS[value]` otherwise. For non-empty
   cells, draw the number centered in the cell, `'#776e65'` for 2 and 4 and `'#f9f6f2'` for bigger numbers, in
   `bold 40px` below 100, `bold 34px` below 1000 and `bold 26px` otherwise. Call `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut. `SIZE = 4`, `GAP = 12`,
   `CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE` (yani 85), `TOP = 60`, çözümdeki `COLORS` tablosunu ve sıfırlardan
   oluşan 4×4'lük bir dizi olan `let board`'u ekle.
2. `cellX(col)` = `GAP + col * (CELL + GAP)` ve `cellY(row)` = `TOP + GAP + row * (CELL + GAP)` yaz.
3. `draw()` yaz: canvas'ı `'#faf8ef'` ile doldur, tahta arka planını `(0, TOP)`'tan canvas genişliğinde bir kare olarak
   `'#bbada0'` ile çiz, sonra her hücreyi: boşsa `'#cdc1b4'`, değilse `COLORS[value]`. Boş olmayan hücrelere sayıyı
   ortalayarak çiz: 2 ve 4 için `'#776e65'`, daha büyükler için `'#f9f6f2'`; 100'ün altında `bold 40px`, 1000'in
   altında `bold 34px`, diğerlerinde `bold 26px`. `draw()`'u çağır.

# --tests--

The board should start as a 4×4 grid of zeros.
tr: Tahta sıfırlardan oluşan 4×4'lük bir ızgara olarak başlamalı.

```js
assert.deepEqual([SIZE, GAP, CELL, TOP], [4, 12, 85, 60])
assert.deepEqual(board, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
assert.lengthOf($.rects('#cdc1b4'), 16)
```

Cells should be laid out with gaps below the score strip.
tr: Hücreler skor şeridinin altında boşluklarla dizilmeli.

```js
assert.deepEqual([cellX(0), cellX(3)], [12, 303])
assert.deepEqual([cellY(0), cellY(3)], [72, 363])
```

Numbers should be drawn in their cell with their color.
tr: Sayılar kendi hücrelerinde kendi renkleriyle çizilmeli.

```js
board = [[2, 0, 0, 0], [0, 8, 0, 0], [0, 0, 128, 0], [0, 0, 0, 2048]]
draw()
assert.deepInclude($.rects(), { x: 12, y: 72, w: 85, h: 85, color: '#eee4da' })
assert.deepInclude($.rects(), { x: 303, y: 363, w: 85, h: 85, color: '#edc22e' })
assert.lengthOf($.rects('#cdc1b4'), 12)
const texts = $.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.args[1], c.args[2], c.font, c.fill])
assert.deepInclude(texts, ['2', 54.5, 114.5, 'bold 40px sans-serif', '#776e65'])
assert.deepInclude(texts, ['8', 151.5, 211.5, 'bold 40px sans-serif', '#f9f6f2'])
assert.deepInclude(texts, ['2048', 345.5, 405.5, 'bold 26px sans-serif', '#f9f6f2'])
```

# --seed--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

draw()
```
