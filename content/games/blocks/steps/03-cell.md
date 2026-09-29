---
title: Draw one cell
title_tr: Bir hücre çiz
skills: [game.canvas, prog.functions]
---

# --goal--

`drawCell(col, row, color)` paints the cell at a column and row. It is drawn one pixel smaller on every side, so
stacked blocks show a thin dark line between them. We try it on the bottom-left cell.

# --goal-tr--

Kuyuya hücre çizecek bir fonksiyon yazıyoruz: `drawCell(sütun, satır, renk)`. Hücre numarasını piksele çevirmek
kolay: sütun × 24 ve satır × 24.

Bir incelik: her hücreyi yuvasından **her kenarda 1 piksel küçük** çizeceğiz. Aradaki ince koyu çizgi sayesinde üst
üste yığılan bloklar tek bir leke değil, ayrı ayrı kareler gibi görünecek. Denemek için sol alt köşeye gri bir hücre
çiziyoruz.

# --code--

```js
function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

drawCell(0, 19, '#94a3b8')
```

# --meaning--

- The three parameters are the column, the row and the color.
- `col * CELL + 1` is 1 pixel right of the cell's left edge; `CELL - 2` is 22, so there is a 1-pixel gap on each side.
- The last line is a test call: column 0, row 19, grey.

# --meaning-tr--

- `function drawCell(col, row, color) {` → üç **parametre** (girdi): sütun, satır, renk. Çağırırken verilen değerler
  içeride bu adlarla kullanılır.
- `col * CELL + 1` → hücrenin sol kenarı `col * CELL`; `+ 1` bir piksel içeriden başlat.
- `CELL - 2` → en ve boy 22 piksel: iki yandan birer piksel boşluk.
- `drawCell(0, 19, '#94a3b8')` → **deneme çağrısı**: 0. sütun, 19. satır (en alt), gri. Bir sonraki adımda bunun
  yerine bütün tahtayı çizeceğiz.

# --task--

1. Under the `let board` line write `drawCell`.
2. At the very end, leave an empty line and write the test call.

# --task-tr--

1. `let board = ...` satırının altına bir boş satır bırakıp `drawCell` fonksiyonunu yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra `drawCell(0, 19, '#94a3b8')` yaz.
3. **Çalıştır**: kuyunun sol alt köşesinde gri bir kare görmelisin.

# --try--

Call `drawCell(4, 10, 'orange')` as well and run. Then remove it.

# --try-tr--

Bir de `drawCell(4, 10, 'orange')` çağır ve çalıştır. Sonra geri sil.

# --tests--

`drawCell` should paint a cell with a 1-pixel gap around it.
tr: `drawCell` bir hücreyi etrafında 1 piksel boşlukla boyamalı.

```js
assert.deepInclude($.rects('#94a3b8'), { x: 1, y: 457, w: 22, h: 22, color: '#94a3b8' })
drawCell(9, 0, 'red')
assert.deepInclude($.rects('red'), { x: 217, y: 1, w: 22, h: 22, color: 'red' })
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

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

drawCell(0, 19, '#94a3b8')
```
