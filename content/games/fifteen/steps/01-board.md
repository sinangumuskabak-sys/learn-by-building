---
title: A board in one array
title_tr: Tek bir dizide bir tahta
skills: [prog.arrays]
---

# --explanation--

The board is 4 by 4, but it does not need a 2D array. A **flat** array of 16 numbers, read row by row, is simpler to shuffle
and compare:

```
position:  0  1  2  3        tiles: 1  2  3  4
           4  5  6  7               5  6  7  8
           8  9 10 11               9 10 11 12
          12 13 14 15              13 14 15  0     (0 is the gap)
```

Row and column come back with division and remainder:

```js
const rowOf = (i) => Math.floor(i / N)   // position 6 -> row 1
const colOf = (i) => i % N               // position 6 -> column 2
```

This trick (a grid stored in one array, with `row * N + col` one way and `/` and `%` the other) is used everywhere: images
are stored exactly like this, pixel by pixel, row by row.

The solved board is `1` to `15` followed by the gap, and each tile is drawn at its square with its number in the middle.

# --explanation-tr--

Tahta 4'e 4 ama iki boyutlu bir diziye gerek yok. Satır satır okunan 16 sayılık **düz** bir dizi karıştırmak ve karşılaştırmak
için daha basittir:

```
konum:     0  1  2  3        taşlar: 1  2  3  4
           4  5  6  7                5  6  7  8
           8  9 10 11                9 10 11 12
          12 13 14 15               13 14 15  0     (0 boşluktur)
```

Satır ve sütun bölme ve kalanla geri gelir:

```js
const rowOf = (i) => Math.floor(i / N)   // konum 6 -> satır 1
const colOf = (i) => i % N               // konum 6 -> sütun 2
```

Bu hile (tek bir dizide saklanan bir ızgara; bir yönde `row * N + col`, öbür yönde `/` ve `%`) her yerde kullanılır: resimler
tam olarak böyle, piksel piksel, satır satır saklanır.

Çözülmüş tahta `1`'den `15`'e, ardından boşluktur ve her taş karesine ortasında numarasıyla çizilir.

# --task--

1. Add `N = 4`, `SIZE = 90`, `GAP = 6`, `TOP = 60` and `LEFT` so the board is centered.
2. Add `rowOf`, `colOf` and `solvedTiles()` returning `[1, 2, ..., 15, 0]`. `reset()` sets `tiles` to it.
3. Write `squareX(i)` and `squareY(i)`, the top-left corner of square `i`, and `drawTile(number, x, y)`: a `'#f59e0b'` square
   with the number centered in `'#1c1917'`, `'bold 36px sans-serif'` (at `y + SIZE / 2 + 2`, `textBaseline` `'middle'`).
4. Every frame, fill `'#292524'` and draw every tile except the gap.

# --task-tr--

1. `N = 4`, `SIZE = 90`, `GAP = 6`, `TOP = 60` ve tahta ortalı olsun diye `LEFT` ekle.
2. `rowOf`, `colOf` ve `[1, 2, ..., 15, 0]` döndüren `solvedTiles()` ekle. `reset()` `tiles`'ı ona ayarlar.
3. `i` karesinin sol üst köşesi olan `squareX(i)` ve `squareY(i)` ile `drawTile(number, x, y)` yaz: numarası ortada
   `'#1c1917'` renkte, `'bold 36px sans-serif'` ile (`y + SIZE / 2 + 2`'de, `textBaseline` `'middle'`) `'#f59e0b'` bir kare.
4. Her karede `'#292524'` ile doldur ve boşluk dışındaki her taşı çiz.

# --tests--

The board should start solved, with the gap last.
tr: Tahta, boşluk sonda olmak üzere çözülmüş başlamalı.

```js
assert.deepEqual(tiles, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
assert.deepEqual([rowOf(6), colOf(6)], [1, 2])
assert.deepEqual([rowOf(15), colOf(15)], [3, 3])
assert.strictEqual(LEFT, 11)
```

Each tile should be drawn on its square with its number.
tr: Her taş karesinde numarasıyla çizilmeli.

```js
$.tick(1)
const squares = $.rects('#f59e0b')
assert.lengthOf(squares, 15)
assert.deepEqual([squares[0].x, squares[0].y, squares[0].w], [11, 60, 90])
assert.deepEqual([squares[14].x, squares[14].y], [11 + 2 * 96, 60 + 3 * 96])
assert.deepEqual($.texts(), ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'])
```

# --seed--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

function reset() {
  tiles = solvedTiles()
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  tiles.forEach((number, i) => {
    if (number === 0) return
    drawTile(number, squareX(i), squareY(i))
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
