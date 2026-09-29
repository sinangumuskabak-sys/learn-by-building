---
title: Draw the field
title_tr: Tarlayı çiz
skills: [game.canvas, prog.loops]
---

# --goal--

Every cell is a 40-pixel grey square, below a 40-pixel strip at the top that will hold the counter and the timer.
`grid.flat()` gives all 81 cells in one list, and a `for ... of` loop draws each.

# --goal-tr--

Tarlayı görelim. Her hücre 40 piksellik (`CELL`) gri bir kare olacak. En üstte 40 piksellik (`TOP`) bir şerit boş
kalacak: mayın sayacı ve saat oraya gelecek.

Çizerken hücrenin hangi satırda olduğu önemli değil; hepsini sırayla çizmek yeter. `grid.flat()` iç içe diziyi 81
hücrelik **tek bir listeye** düzleştirir.

# --code--

```js
const CELL = 40
const TOP = 40 // room for the mine counter and the timer

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
  }
}

newGame()
draw()
```

# --meaning--

- The background is dark blue. `fillRect(x, y, w, h)` fills a rectangle; (0, 0) is the top-left corner.
- `grid.flat()` turns the 2D array into one list of 81 cells; `for (const cell of list)` runs once per cell.
- A cell's corner is `col * CELL` from the left and `TOP + row * CELL` from the top. Drawing it 1 pixel in on every
  side (`CELL - 2` wide) leaves thin lines between cells.

# --meaning-tr--

- `ctx.fillStyle = '#1e293b'` + `ctx.fillRect(0, 0, canvas.width, canvas.height)` → bütün tuvali koyu laciverte boyar.
  Canvas'ta (0, 0) sol üst köşedir; x sağa, y aşağı büyür.
- `grid.flat()` → iç içe diziyi **düzleştirir**: 9 satırlık dizi → 81 hücrelik tek liste.
- `for (const cell of grid.flat()) { ... }` → **for...of döngüsü**: listedeki her eleman için içini bir kez çalıştırır;
  her turda o anki hücrenin adı `cell`.
- `x = cell.col * CELL` → sütun × 40 piksel sağa. `y = TOP + cell.row * CELL` → üst şeridin altından, satır × 40 aşağı.
- `ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)` → her yandan 1 piksel içeride 38×38'lik kare: aralarda ince koyu
  çizgiler kalır.
- En alttaki `draw()` → tahtayı kurduktan sonra bir kez çiz.

# --task--

1. Under `const SIZE = 9`, write `CELL` and `TOP`.
2. Above `newGame()` at the bottom, write `draw` and leave an empty line. Under `newGame()` write `draw()`.

# --task-tr--

1. `const SIZE = 9` satırının altına `CELL` ve `TOP` satırlarını yaz.
2. En alttaki `newGame()` satırının **üstüne** `draw` fonksiyonunu yaz; arada bir boş satır kalsın.
3. `newGame()` satırının **altına** `draw()` yaz.
4. **Çalıştır**: üstte boş bir şerit ve altında 9×9 gri kareler görmelisin.

# --tests--

Every cell should be drawn below the top strip.
tr: Her hücre üst şeridin altına çizilmeli.

```js
draw()
const cells = $.rects('#94a3b8')
assert.lengthOf(cells, 81)
assert.deepInclude(cells, { x: 1, y: 41, w: 38, h: 38, color: '#94a3b8' })
assert.deepInclude(cells, { x: 321, y: 361, w: 38, h: 38, color: '#94a3b8' })
```

The background should be dark blue.
tr: Arka plan koyu lacivert olmalı.

```js
draw()
assert.deepInclude($.rects(), { x: 0, y: 0, w: 360, h: 400, color: '#1e293b' })
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

  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
  }
}

newGame()
draw()
```
