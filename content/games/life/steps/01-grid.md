---
title: A grid of cells
title_tr: Hücrelerden bir ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

The Game of Life, invented by the mathematician John Conway in 1970, is a "zero-player game": you set up a pattern of cells,
and simple rules decide everything after that. Out of those rules come creatures that move, blink, grow and even build other
creatures.

The world is a grid. Each cell is either **alive** (`1`) or **dead** (`0`), so the grid is a 2D array of numbers:
`grid[row][col]`. We keep a small helper that makes an all-dead grid, because we will need fresh ones often:

```js
const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

Why `Array.from` with a function, and not `Array(ROWS).fill(Array(COLS).fill(0))`? `fill` would put **the same row array**
in every slot, so changing one cell would change it in every row. `Array.from` calls the function once per row and makes a
new row each time.

To start, a quarter of the cells come alive at random: `Math.random() < 0.25` is true about one time in four.

Each live cell is a square `CELL - 1` pixels wide, so a 1 pixel gap separates neighbours and the grid stays readable.

# --explanation-tr--

Matematikçi John Conway'in 1970'te icat ettiği Hayat Oyunu "sıfır oyunculu bir oyundur": bir hücre deseni kurarsın ve
sonrasındaki her şeye basit kurallar karar verir. O kurallardan hareket eden, yanıp sönen, büyüyen, hatta başka canlılar
inşa eden canlılar çıkar.

Dünya bir ızgaradır. Her hücre ya **canlı** (`1`) ya da **ölü**dür (`0`), yani ızgara 2 boyutlu bir sayı dizisidir:
`grid[row][col]`. Tamamen ölü bir ızgara yapan küçük bir yardımcı tutarız, çünkü sık sık yenilerine ihtiyacımız olacak:

```js
const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

Neden bir fonksiyonla `Array.from` da `Array(ROWS).fill(Array(COLS).fill(0))` değil? `fill` her yuvaya **aynı satır dizisini**
koyardı; bir hücreyi değiştirmek onu her satırda değiştirirdi. `Array.from` fonksiyonu her satır için bir kez çağırır ve her
seferinde yeni bir satır yapar.

Başlangıçta hücrelerin dörtte biri rastgele canlanır: `Math.random() < 0.25` yaklaşık dört seferde bir doğrudur.

Her canlı hücre `CELL - 1` piksel genişliğinde bir karedir; böylece komşuları 1 piksellik bir boşluk ayırır ve ızgara okunur
kalır.

# --task--

1. Add `CELL = 8`, `COLS = 60`, `ROWS = 48`, `TOP = 36` and `emptyGrid()`.
2. Write `randomize()`: every cell becomes `1` with a chance of `0.25`, otherwise `0`. `reset()` starts from an empty grid
   and randomizes it.
3. Each frame fill the canvas with `'#0f172a'`, the grid area (`COLS * CELL` by `ROWS * CELL` at `y = TOP`) with `'#1e293b'`,
   and every live cell as a `'#4ade80'` square at `x = c * CELL`, `y = TOP + r * CELL`, `CELL - 1` wide.

# --task-tr--

1. `CELL = 8`, `COLS = 60`, `ROWS = 48`, `TOP = 36` ve `emptyGrid()` ekle.
2. `randomize()` yaz: her hücre `0.25` olasılıkla `1`, değilse `0` olur. `reset()` boş bir ızgarayla başlar ve onu rastgele
   doldurur.
3. Her karede canvas'ı `'#0f172a'` ile, ızgara alanını (`y = TOP`'ta `COLS * CELL`'e `ROWS * CELL`) `'#1e293b'` ile ve her
   canlı hücreyi `x = c * CELL`, `y = TOP + r * CELL`'de `CELL - 1` genişliğinde `'#4ade80'` bir kare olarak doldur.

# --tests--

The grid should be 48 rows of 60 cells, about a quarter of them alive.
tr: Izgara 60 hücrelik 48 satır olmalı ve yaklaşık dörtte biri canlı olmalı.

```js
assert.lengthOf(grid, 48)
for (const row of grid) assert.lengthOf(row, 60)
const alive = grid.flat().filter((cell) => cell === 1).length
assert.strictEqual(grid.flat().filter((cell) => cell !== 0 && cell !== 1).length, 0, 'every cell is 0 or 1')
assert.isAbove(alive, 2880 * 0.18, 'about a quarter of the cells are alive')
assert.isBelow(alive, 2880 * 0.32)
```

`randomize` should make a new pattern each time.
tr: `randomize` her seferinde yeni bir desen yapmalı.

```js
const before = grid.flat().join('')
randomize()
assert.notStrictEqual(grid.flat().join(''), before, 'randomize makes a new pattern')
```

Each live cell should be drawn as a small green square.
tr: Her canlı hücre küçük yeşil bir kare olarak çizilmeli.

```js
grid = emptyGrid()
grid[2][3] = 1
grid[47][59] = 1
$.tick(1)
assert.deepEqual($.rects('#4ade80'), [
  { x: 24, y: 52, w: 7, h: 7, color: '#4ade80' },
  { x: 472, y: 412, w: 7, h: 7, color: '#4ade80' },
])
```

# --seed--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

let grid // grid[row][col]: 1 alive, 0 dead

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
}

function reset() {
  grid = emptyGrid()
  randomize()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
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
