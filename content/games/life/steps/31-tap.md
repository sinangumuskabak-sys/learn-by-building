---
title: Tap the buttons
title_tr: Düğmelere dokun
skills: [game.input]
---

# --goal--

A press at or below `BAR_Y` is on a button: `Math.floor(point.x / BUTTON_W)` finds which one, and we call the same
`press` as the keyboard.

# --goal-tr--

Son adım: düğmelere dokunulduğunda çalışsınlar. Basılan nokta düğme sırasındaysa (`BAR_Y`'nin altında) hangi düğme
olduğunu bulup **klavyeyle aynı** `press`'i çağıracağız. Böylece "Play ne yapar?" sorusunun cevabı hâlâ tek bir yerde.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const point = toCanvas(event)
  if (point.y >= BAR_Y) {
    press(BUTTONS[Math.floor(point.x / BUTTON_W)])
    return
  }
  const cell = cellAt(point)
  if (!cell) return
```

# --meaning--

- The point is computed once and kept in `point`.
- At or below `BAR_Y`, `Math.floor(point.x / BUTTON_W)` is the button's number: `x = 150` gives 1, `'Step'`. We press
  it and `return`, so no cell is painted.
- Otherwise `cellAt(point)` works as before.

# --meaning-tr--

- `const point = toCanvas(event)` → noktayı bir kez hesaplayıp `point`'te tutarız; iki yerde kullanacağız.
- `if (point.y >= BAR_Y) {` → nokta düğme sırasında mı? (`>=` "büyük **ya da eşit**".)
- `Math.floor(point.x / BUTTON_W)` → düğmenin sırası: `x = 150` ise `150 / 96` = 1.56 → **1** →
  `BUTTONS[1]` = `'Step'`.
- `press(...)` → klavyedeki gibi o düğmeye bas. `return` → hücre boyamaya geçme.
- `const cell = cellAt(point)` → düğme değilse eskisi gibi hücreyi bul; artık `toCanvas`'ı yeniden çağırmaya gerek yok.

# --task--

In the `pointerdown` listener, replace the line `const cell = cellAt(toCanvas(event))` with the new lines.

# --task-tr--

1. `pointerdown` dinleyicisinde `const cell = cellAt(toCanvas(event))` satırını sil.
2. Yerine `const point = ...`, beş satırlık `if` bloğunu ve `const cell = cellAt(point)` satırını yaz. Alttaki
   satırlar aynı kalır.
3. **Çalıştır** ve düğmelere tıkla: **Gun**, sonra **Play**. Oyun tamam!

# --tests--

Tapping the buttons should do the same as the keys.
tr: Düğmelere dokunmak tuşlarla aynı işi yapmalı.

```js
$.click(48, 450)
assert.isTrue(playing)
$.tick(1)
assert.include($.texts(), 'Pause')
$.click(96 + 48, 450)
assert.isFalse(playing)
assert.strictEqual(generation, 1)
$.click(96 * 3 + 48, 450)
assert.strictEqual(population(), 0)
$.click(96 * 4 + 48, 450)
assert.strictEqual(population(), 36)
$.click(96 * 2 + 48, 450)
assert.isAbove(population(), 300)
```

Clicking on the grid should still paint.
tr: Izgaraya tıklamak yine boyamalı.

```js
grid = emptyGrid()
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 1)
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
const BAR_Y = TOP + ROWS * CELL + 12 // the row of buttons
const BUTTONS = ['Play', 'Step', 'Random', 'Clear', 'Gun']
const BUTTON_W = canvas.width / BUTTONS.length
const SPEED = 6 // frames per generation while playing

// Patterns drawn as text: O is a live cell.
const GUN = [
  '........................O...........',
  '......................O.O...........',
  '............OO......OO............OO',
  '...........O...O....OO............OO',
  'OO........O.....O...OO..............',
  'OO........O...O.OO....O.O...........',
  '..........O.....O.......O...........',
  '...........O...O....................',
  '............OO......................',
]

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

// Copy a text pattern onto the grid with its top left corner at (row, col).
function stamp(pattern, row, col) {
  pattern.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) if (line[c] === 'O') grid[(row + r) % ROWS][(col + c) % COLS] = 1
  })
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
  else if (button === 'Gun') {
    clear()
    stamp(GUN, 4, 4)
  }
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear', g: 'Gun' }
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
  const point = toCanvas(event)
  if (point.y >= BAR_Y) {
    press(BUTTONS[Math.floor(point.x / BUTTON_W)])
    return
  }
  const cell = cellAt(point)
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

  BUTTONS.forEach((label, i) => {
    ctx.fillStyle = '#334155'
    ctx.fillRect(i * BUTTON_W + 4, BAR_Y, BUTTON_W - 8, 36)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label === 'Play' && playing ? 'Pause' : label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 24)
  })

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
