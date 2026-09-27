---
title: A board of rows and columns
title_tr: Satır ve sütunlardan bir tahta
skills: [prog.arrays]
---

# --explanation--

The board is a **2D array**: an array of rows, each row an array of cells. `board[row][col]` is `0` for an empty hole,
`1` for a red disc and `2` for a yellow one. Row 0 is at the top, so the bottom row is `ROWS - 1`.

Making the rows needs care. This looks right but is a classic bug:

```js
Array(ROWS).fill(Array(COLS).fill(0))   // every row is the SAME array!
```

`fill` puts the same value in every slot, and here the value is one array, so changing a cell in one row changes it in all
rows. `Array.from` calls a function for each row, so each row is a new array:

```js
Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

The board is drawn as a blue rectangle with a circle for every hole. Drawing a circle in a hole's color, dark for empty,
red or yellow for a disc, means one small function, `disc(x, y, color)`, draws the whole board.

# --explanation-tr--

Tahta **iki boyutlu bir dizidir**: satırlardan oluşan bir dizi, her satır da hücrelerden oluşan bir dizi. `board[row][col]`
boş bir delik için `0`, kırmızı bir disk için `1`, sarı bir disk için `2`'dir. 0. satır en üsttedir; yani en alt satır
`ROWS - 1`'dir.

Satırları yapmak dikkat ister. Şu doğru görünür ama bilinen bir hatadır:

```js
Array(ROWS).fill(Array(COLS).fill(0))   // her satır AYNI dizi!
```

`fill` her yuvaya aynı değeri koyar ve buradaki değer tek bir dizidir; bu yüzden bir satırdaki hücreyi değiştirmek hepsini
değiştirir. `Array.from` her satır için bir fonksiyon çağırır; böylece her satır yeni bir dizi olur:

```js
Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

Tahta, her delik için bir daire olan mavi bir dikdörtgen olarak çizilir. Deliğin renginde bir daire çizmek (boşsa koyu,
diskse kırmızı ya da sarı), tek bir küçük fonksiyonun, `disc(x, y, color)`'un bütün tahtayı çizmesi demektir.

# --task--

1. Add `COLS = 7`, `ROWS = 6`, `CELL = 64`, `TOP = 96` and `COLORS = { 1: '#ef4444', 2: '#facc15' }`.
2. `reset()` makes `board` a `ROWS` by `COLS` array of zeros, with a new array for every row.
3. Write `disc(x, y, color)`: a filled circle of radius `CELL / 2 - 6`.
4. Draw every frame: a `'#0f172a'` background, a `'#1d4ed8'` rectangle for the board from `TOP`, and a disc in the middle
   of every cell, `'#0f172a'` if empty or the color of its player.

# --task-tr--

1. `COLS = 7`, `ROWS = 6`, `CELL = 64`, `TOP = 96` ve `COLORS = { 1: '#ef4444', 2: '#facc15' }` ekle.
2. `reset()`, `board`'u her satır için yeni bir dizi olan `ROWS`'a `COLS` sıfırlardan oluşan bir dizi yapar.
3. `disc(x, y, color)` yaz: `CELL / 2 - 6` yarıçaplı dolu bir daire.
4. Her karede çiz: `'#0f172a'` bir arka plan, tahta için `TOP`'tan başlayan `'#1d4ed8'` bir dikdörtgen ve her hücrenin
   ortasında bir disk; boşsa `'#0f172a'`, değilse oyuncusunun renginde.

# --tests--

The board should be 6 rows of 7 empty cells, each row its own array.
tr: Tahta her biri kendi dizisi olan 7 boş hücreli 6 satır olmalı.

```js
assert.lengthOf(board, 6)
assert.isTrue(board.every((row) => row.length === 7 && row.every((cell) => cell === 0)))
board[5][0] = 1
assert.strictEqual(board[4][0], 0, 'changing one row must not change the others')
```

The board should be drawn with a hole for every cell.
tr: Tahta her hücre için bir delikle çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#1d4ed8').map((r) => [r.x, r.y, r.w, r.h]), [[0, 96, 448, 384]])
const holes = $.arcs().filter((a) => a.color === '#0f172a' && a.r === 26)
assert.lengthOf(holes, 42)
assert.deepEqual([holes[0].x, holes[0].y], [32, 128])
```

Discs should be drawn in their player's color.
tr: Diskler oyuncularının renginde çizilmeli.

```js
board[5][3] = 1
board[5][4] = 2
$.tick(1)
assert.deepEqual($.arcs().filter((a) => a.color === '#ef4444').map((a) => [a.x, a.y]), [[224, 448]])
assert.deepEqual($.arcs().filter((a) => a.color === '#facc15').map((a) => [a.x, a.y]), [[288, 448]])
```

# --seed--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board (for later)
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 red, player 2 yellow

let board // board[row][col]: 0 empty, 1 or 2

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
