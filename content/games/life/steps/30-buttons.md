---
title: Buttons on the screen
title_tr: Ekranda düğmeler
skills: [game.canvas, prog.arrays]
---

# --goal--

A phone has no keyboard, so the game gets a row of five buttons under the grid. We draw them from a list of names;
the Play button reads Pause while the world runs.

# --goal-tr--

Telefonda klavye yok; bu yüzden ızgaranın altına **beş düğme** koyacağız: Play, Step, Random, Clear, Gun. Bu adımda
onları **çiziyoruz**; tıklamayı bir sonraki adımda bağlayacağız.

Düğme adları bir listede durur. Canvas 480 piksel geniş, 5 düğme var: her birine 480 ÷ 5 = **96 piksel** düşer.
Dünya çalışırken Play düğmesinde **Pause** (duraklat) yazacak.

# --code--

```js
const BAR_Y = TOP + ROWS * CELL + 12 // the row of buttons
const BUTTONS = ['Play', 'Step', 'Random', 'Clear', 'Gun']
const BUTTON_W = canvas.width / BUTTONS.length

  BUTTONS.forEach((label, i) => {
    ctx.fillStyle = '#334155'
    ctx.fillRect(i * BUTTON_W + 4, BAR_Y, BUTTON_W - 8, 36)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label === 'Play' && playing ? 'Pause' : label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 24)
  })
```

# --meaning--

- `BAR_Y` is 12 pixels below the grid. `BUTTON_W` is 480 / 5 = 96, one fifth of the width each.
- `forEach` draws each button: a box starting at `i * BUTTON_W`, 4 pixels in from each side, 36 tall.
- `textAlign = 'center'` centres the label on `x`, the middle of the box.
- `label === 'Play' && playing ? 'Pause' : label` shows Pause on the Play button while the world runs.

# --meaning-tr--

- `const BAR_Y = TOP + ROWS * CELL + 12` → düğme sırasının üst kenarı: ızgaranın bittiği yerin (36 + 384 = 420)
  12 piksel altı, yani **432**.
- `const BUTTONS = [...]` → beş düğmenin adı. `BUTTONS.length` → listenin eleman sayısı: 5.
- `const BUTTON_W = canvas.width / BUTTONS.length` → bir düğmenin payı: 480 / 5 = **96** piksel. `/` bölme demek.
- `BUTTONS.forEach((label, i) => { ... })` → her düğme için bir kez: `label` adı, `i` sırası (0...4).
  - `ctx.fillRect(i * BUTTON_W + 4, BAR_Y, BUTTON_W - 8, 36)` → `i`. düğmenin kutusu. Her yandan 4 piksel içeri
    çekeriz (`+ 4`, `- 8`) ki düğmeler arasında boşluk kalsın. Yüksekliği 36.
  - `ctx.textAlign = 'center'` → yazıyı verdiğin `x`'e **ortalar**; `x` de kutunun ortası:
    `i * BUTTON_W + BUTTON_W / 2`.
  - `label === 'Play' && playing ? 'Pause' : label` → "bu Play düğmesiyse **ve** dünya çalışıyorsa `Pause` yaz,
    değilse kendi adını".

# --task--

1. Under `const TOP = 36` write the three button constants.
2. In `draw`, after the two loops, leave an empty line and write the `forEach` block.

# --task-tr--

1. `const TOP = 36` satırının altına üç düğme sabitini yaz (`SPEED` satırı onların altında kalır).
2. `draw` içinde, iki döngünün kapanışından (`  }`) sonra bir boş satır bırak ve `forEach` bloğunu yaz. `Generation`
   yazısını çizen satırlar onun altında kalır.
3. **Çalıştır**: ızgaranın altında beş gri düğme görmelisin. Boşluk'a basınca Play, Pause olur.

# --tests--

Five `#334155` buttons should be drawn in a row under the grid.
tr: Izgaranın altına yan yana beş `#334155` düğme çizilmeli.

```js
assert.strictEqual(BAR_Y, 432)
assert.strictEqual(BUTTON_W, 96)
$.tick(1)
assert.deepEqual($.rects('#334155').map((r) => [r.x, r.y, r.w, r.h]), [
  [4, 432, 88, 36], [100, 432, 88, 36], [196, 432, 88, 36], [292, 432, 88, 36], [388, 432, 88, 36],
])
```

Each button should show its label, and Play should read Pause while playing.
tr: Her düğme kendi adını göstermeli; dünya çalışırken Play yerine Pause yazmalı.

```js
$.tick(1)
for (const label of ['Play', 'Step', 'Random', 'Clear', 'Gun']) assert.include($.texts(), label)
$.press(' ')
$.tick(1)
assert.include($.texts(), 'Pause')
assert.notInclude($.texts(), 'Play')
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
