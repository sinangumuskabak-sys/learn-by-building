---
title: Painting cells
title_tr: Hücre boyamak
skills: [game.input, game.state]
---

# --explanation--

Random soup is fun, but the real game is drawing your own patterns and watching what they do. A click should flip a cell,
and **dragging** should paint a line of cells.

Dragging needs to remember something between events: is the pointer down, and what are we painting? One variable does both.
`painting` is `null` while the pointer is up. On `pointerdown` it becomes the **opposite** of the pressed cell: pressing on a
dead cell paints live ones, pressing on a live cell erases. Every `pointermove` then writes `painting` into the cell under
the pointer, and `pointerup` sets it back to `null`.

```js
painting = grid[cell.r][cell.c] ? 0 : 1
```

Why decide once, at the start, instead of flipping each cell the pointer crosses? Because a slow drag fires several moves
over the same cell, and flipping would turn it on, off, on... Painting one value is stable.

Listen for `pointerup` on the **document**, not the canvas: if the player lets go outside the canvas, the canvas never hears
about it and the game would keep painting.

Two more keys: C clears the world (and stops it), R throws in a new random soup.

# --explanation-tr--

Rastgele çorba eğlenceli ama asıl oyun kendi desenlerini çizip ne yaptıklarını izlemektir. Bir tıklama bir hücreyi tersine
çevirmeli, **sürüklemek** de bir hücre çizgisi boyamalı.

Sürüklemenin olaylar arasında bir şey hatırlaması gerekir: işaretçi basılı mı ve ne boyuyoruz? Tek değişken ikisini birden
yapar. İşaretçi yukarıdayken `painting` `null`'dır. `pointerdown`'da basılan hücrenin **tersi** olur: ölü bir hücreye basmak
canlı boyar, canlı bir hücreye basmak siler. Sonra her `pointermove`, işaretçinin altındaki hücreye `painting`'i yazar ve
`pointerup` onu yeniden `null` yapar.

```js
painting = grid[cell.r][cell.c] ? 0 : 1
```

Neden işaretçinin geçtiği her hücreyi tersine çevirmek yerine başta bir kez karar veriyoruz? Çünkü yavaş bir sürükleme aynı
hücre üzerinde birkaç hareket olayı üretir ve tersine çevirmek onu açık, kapalı, açık... yapardı. Tek bir değer boyamak
kararlıdır.

`pointerup`'ı canvas'ta değil **document**'ta dinle: oyuncu canvas'ın dışında bırakırsa canvas bunu hiç duymaz ve oyun boyamaya
devam ederdi.

İki tuş daha: C dünyayı temizler (ve durdurur), R yeni bir rastgele çorba atar.

# --task--

1. Write `toCanvas(event)` (the pointer in canvas pixels) and `cellAt(point)` (the `{ r, c }` under it, or `null` off the
   grid).
2. Add `painting = null`. On `pointerdown` over a cell, set `painting` to the opposite of that cell and write it into the
   cell. On `pointermove`, while `painting` is not `null`, write it into the cell under the pointer. On the document's
   `pointerup`, set `painting = null`.
3. Write `clear()`: an empty grid, `generation = 0`, `playing = false`.
4. `press('Random')` calls `randomize()` and `press('Clear')` calls `clear()`; the R and C keys press them.

# --task-tr--

1. `toCanvas(event)` (canvas piksellerinde işaretçi) ve `cellAt(point)` (altındaki `{ r, c }`, ızgaranın dışında `null`) yaz.
2. `painting = null` ekle. Bir hücre üzerinde `pointerdown`'da `painting`'i o hücrenin tersi yap ve hücreye yaz.
   `pointermove`'da, `painting` `null` değilken, onu işaretçinin altındaki hücreye yaz. Document'ın `pointerup`'ında
   `painting = null` yap.
3. `clear()` yaz: boş bir ızgara, `generation = 0`, `playing = false`.
4. `press('Random')` `randomize()`'ı, `press('Clear')` `clear()`'ı çağırır; R ve C tuşları onlara basar.

# --tests--

A click should bring a cell to life, and a second click should erase it.
tr: Bir tıklama bir hücreyi canlandırmalı, ikinci bir tıklama onu silmeli.

```js
grid = emptyGrid()
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 1)
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 0, 'a second click erases')
$.click(200, 10)
assert.strictEqual(population(), 0, 'nothing happens above the grid')
```

Dragging should paint a line of live cells, and dragging from a live cell should erase.
tr: Sürüklemek bir canlı hücre çizgisi boyamalı, canlı bir hücreden sürüklemek silmeli.

```js
grid = emptyGrid()
$.pointerDown(4, 36 + 20 * 8 + 4)
for (let c = 1; c < 10; c++) $.move(c * 8 + 4, 36 + 20 * 8 + 4)
$.pointerUp(9 * 8 + 4, 36 + 20 * 8 + 4)
assert.deepEqual(grid[20].slice(0, 11), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], 'dragging paints live cells')
$.move(11 * 8 + 4, 36 + 20 * 8 + 4)
assert.strictEqual(grid[20][11], 0, 'moving without pressing does nothing')
$.pointerDown(3 * 8 + 4, 36 + 20 * 8 + 4)
for (let c = 4; c < 7; c++) $.move(c * 8 + 4, 36 + 20 * 8 + 4)
$.pointerUp(6 * 8 + 4, 36 + 20 * 8 + 4)
assert.deepEqual(grid[20].slice(0, 10), [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], 'dragging from a live cell erases')
```

C should clear and stop the world, and R should fill it again.
tr: C dünyayı temizleyip durdurmalı, R onu yeniden doldurmalı.

```js
$.press(' ')
$.tick(SPEED * 3)
$.press('c')
assert.strictEqual(population(), 0)
assert.strictEqual(generation, 0)
assert.isFalse(playing, 'clearing stops the game')
$.press('r')
assert.isAbove(population(), 300)
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
const SPEED = 6 // frames per generation while playing

let grid // grid[row][col]: 1 alive, 0 dead
let generation
let playing
let frames
let painting = null // while the pointer is down: the value being painted, 1 or 0

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function clear() {
  grid = emptyGrid()
  generation = 0
  playing = false
}

function reset() {
  grid = emptyGrid()
  randomize()
  playing = false
  frames = 0
}

// Live neighbours among the 8 around (r, c). The edges wrap around, so the world has no border.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      count += grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
    }
  }
  return count
}

// Every cell changes at the same moment, so the next generation is built in a new grid.
function step() {
  const next = emptyGrid()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(r, c)
      // A live cell survives with 2 or 3 neighbours; a dead cell comes alive with exactly 3.
      next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
    }
  }
  grid = next
  generation += 1
}

const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  } else if (button === 'Random') randomize()
  else if (button === 'Clear') clear()
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

function cellAt({ x, y }) {
  const r = Math.floor((y - TOP) / CELL)
  const c = Math.floor(x / CELL)
  return r >= 0 && r < ROWS && c >= 0 && c < COLS ? { r, c } : null
}

// Pressing on a dead cell paints live cells as you drag; pressing on a live one erases.
canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(toCanvas(event))
  if (!cell) return
  painting = grid[cell.r][cell.c] ? 0 : 1
  grid[cell.r][cell.c] = painting
})

canvas.addEventListener('pointermove', (event) => {
  if (painting === null) return
  const cell = cellAt(toCanvas(event))
  if (cell) grid[cell.r][cell.c] = painting
})

document.addEventListener('pointerup', () => {
  painting = null
})

function update() {
  frames += 1
  if (playing && frames % SPEED === 0) step()
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
