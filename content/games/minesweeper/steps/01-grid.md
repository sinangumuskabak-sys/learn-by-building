---
title: A grid of cell objects
title_tr: Hücre nesnelerinden bir ızgara
skills: [prog.arrays]
---

# --explanation--

In 2048 each cell was a plain number. A Minesweeper cell has to remember several things at once: whether it hides a
mine, how many mines are around it, whether it has been opened, whether it is flagged. So each cell is an **object**,
and the board is a 2D array of objects.

`Array.from` builds it neatly. Its second argument is called with the **index** of each slot, so every cell can store
where it is:

```js
grid = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => ({ row, col })),
)
```

(`_` is a common name for a parameter you do not use; here, the empty slot's value.)

Storing `row` and `col` on the cell itself will pay off soon: functions can be handed a **cell** and still know where
it sits, without passing coordinates around separately.

`grid.flat()` turns the 2D array into one long list of all 81 cells, handy whenever the position does not matter, such
as drawing every cell.

# --explanation-tr--

2048'de her hücre düz bir sayıydı. Mayın Tarlası'ndaki bir hücrenin aynı anda birkaç şeyi hatırlaması gerekir: altında
mayın var mı, çevresinde kaç mayın var, açıldı mı, bayrak kondu mu. Bu yüzden her hücre bir **nesnedir** ve tahta
nesnelerden oluşan 2 boyutlu bir dizidir.

`Array.from` onu düzgünce kurar. İkinci argümanı her yuvanın **indeksiyle** çağrılır; böylece her hücre nerede olduğunu
saklayabilir:

```js
grid = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => ({ row, col })),
)
```

(`_`, kullanmadığın bir parametre için yaygın bir addır; burada boş yuvanın değeri.)

`row` ve `col`'ü hücrenin kendisinde saklamanın faydası yakında görülecek: fonksiyonlara bir **hücre** verilebilir ve
koordinatları ayrıca taşımadan onun nerede durduğunu bilirler.

`grid.flat()` 2 boyutlu diziyi 81 hücrenin hepsinden oluşan tek uzun bir listeye çevirir; konumun önemli olmadığı her
durumda, örneğin her hücreyi çizerken, işe yarar.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `SIZE = 9`, `CELL = 40` and `TOP = 40`.
2. Add `let grid` and `function newGame()` that builds a `SIZE` × `SIZE` grid of `{ row, col }` objects with
   `Array.from`. Call it at startup.
3. `draw()`: fill the canvas with `'#1e293b'` and every cell with `'#94a3b8'` at
   `(col * CELL + 1, TOP + row * CELL + 1)`, size `CELL - 2`. Draw in a `requestAnimationFrame` loop.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut; `SIZE = 9`, `CELL = 40` ve `TOP = 40` ekle.
2. `let grid` ve `Array.from` ile `{ row, col }` nesnelerinden `SIZE` × `SIZE` bir ızgara kuran `function newGame()`
   ekle. Açılışta çağır.
3. `draw()`: canvas'ı `'#1e293b'` ile, her hücreyi de `(col * CELL + 1, TOP + row * CELL + 1)` noktasında `CELL - 2`
   boyutunda `'#94a3b8'` ile doldur. Bir `requestAnimationFrame` döngüsünde çiz.

# --tests--

The grid should be 9×9 cells that know their position.
tr: Izgara, konumlarını bilen 9×9 hücre olmalı.

```js
assert.lengthOf(grid, 9)
assert.isTrue(grid.every((row) => row.length === 9))
assert.deepInclude(grid[3][7], { row: 3, col: 7 })
assert.strictEqual(grid.flat().length, 81)
assert.notStrictEqual(grid[0], grid[1])
```

Every cell should be drawn below the top strip.
tr: Her hücre üst şeridin altına çizilmeli.

```js
$.tick()
const cells = $.rects('#94a3b8')
assert.lengthOf(cells, 81)
assert.deepInclude(cells, { x: 1, y: 41, w: 38, h: 38, color: '#94a3b8' })
assert.deepInclude(cells, { x: 321, y: 361, w: 38, h: 38, color: '#94a3b8' })
```

# --seed--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#94a3b8'
  for (const cell of grid.flat()) {
    ctx.fillRect(cell.col * CELL + 1, TOP + cell.row * CELL + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
