---
title: "Build it yourself: a world at rest"
title_tr: "Kendin yap: duran dünya"
skills: [game.state, prog.loops]
---

# --goal--

A random soup always calms down in the end: only still blocks remain, or nothing at all. Make the game notice when a
step changes nothing: it pauses by itself and shows the generation it happened.

# --goal-tr--

Rastgele bir çorba sonunda hep yatışır; bazen geriye yalnız kıpırdamayan bloklar kalır, bazen hiçbir şey. Oyun bunu
**kendisi fark etsin**: bir nesil hiçbir hücreyi değiştirmiyorsa dünya **durmuştur**. O zaman oyun kendiliğinden
duraklasın ve bunun hangi nesilde olduğunu yazsın.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `step`'teki döngüler, `playing`, `generation`, bir değişken ve
`fillText`. Kontroller çalıştığında yeşile döner.

# --task--

When a step would change no cell: set `playing` to `false`, do not count a new generation, and draw the text
`Still at N` (N is the current generation) until the world changes again or a new one is made.

# --task-tr--

- `step` hiçbir hücreyi değiştirmeyecekse: `playing` `false` olsun ve `generation` **artmasın**.
- Ekranın üst şeridine `Still at N` yazılsın; `N` o anki nesil (`generation`). Yer senin seçimin; ortası boş.
- Dünya yeniden değişince (örneğin bir hücre boyayıp N'ye basınca) ya da **Random**, **Clear**, **Gun** ile yeni bir
  dünya kurulunca yazı kaybolsun.
- Hiç durmayan desenler (yanıp sönen, planör) oyunu durdurmamalı.

Değiştireceğin yerler: yeni bir değişken, `step`, `randomize`, `clear` ve `draw`. Takılırsan Maymun'a sor ya da
ipucu kutusuna bak.

# --hint--

In `step`, keep a variable `changed = false` before the loops and set it to `true` when `next[r][c] !== grid[r][c]`.
After the loops, if nothing changed, pause, remember the generation and `return` before `grid = next`.

# --hint-tr--

`step` içinde döngülerden önce `let changed = false` aç; döngüde `next[r][c] !== grid[r][c]` ise `changed = true` yap
(`!==` "eşit değil mi?"). Döngülerden sonra `!changed` ise duraklat, nesli bir değişkende (`stillAt` gibi) hatırla ve
`grid = next` satırına gelmeden `return` ile çık. `draw`'da o değişken `null` değilse yazıyı çiz; `randomize`,
`clear` ve dünyanın yeniden değiştiği yerde onu `null` yap.

# --tests--

A world that stops changing should pause and not count new generations.
tr: Değişmeyi bırakan bir dünya duraklamalı ve yeni nesil saymamalı.

```js
grid = emptyGrid()
grid[20][20] = grid[20][21] = grid[21][20] = grid[21][21] = 1 // a block never changes
$.press(' ')
$.tick(SPEED * 3)
assert.isFalse(playing, 'the game pauses by itself')
assert.strictEqual(generation, 0)
```

`Still at N` should show the generation the world stopped at.
tr: `Still at N` dünyanın durduğu nesli göstermeli.

```js
grid = emptyGrid()
grid[5][5] = 1 // dies in one generation, then nothing changes
step()
assert.strictEqual(generation, 1)
step()
assert.strictEqual(generation, 1, 'a step that changes nothing does not count')
$.tick(1)
assert.include($.texts(), 'Still at 1')
```

A blinker never stops, so the game should keep playing.
tr: Yanıp sönen hiç durmaz; oyun çalışmaya devam etmeli.

```js
grid = emptyGrid()
grid[5][4] = grid[5][5] = grid[5][6] = 1
$.press(' ')
$.tick(SPEED * 20)
assert.isTrue(playing)
assert.strictEqual(generation, 20)
assert.isFalse($.texts().some((t) => t.startsWith('Still')))
```

The text should go away when the world changes again or a new world is made.
tr: Dünya yeniden değişince ya da yeni bir dünya kurulunca yazı kaybolmalı.

```js
const still = () => $.texts().some((t) => t.startsWith('Still'))
grid = emptyGrid()
grid[20][20] = grid[20][21] = grid[21][20] = grid[21][21] = 1
step()
$.tick(1)
assert.isTrue(still())
grid[20][22] = 1 // the block gets a neighbour
step()
$.tick(1)
assert.isFalse(still(), 'the world changed again')
for (const key of ['r', 'c', 'g']) {
  grid = emptyGrid()
  step()
  $.tick(1)
  assert.isTrue(still())
  $.press(key)
  $.tick(1)
  assert.isFalse(still(), 'a new world after ' + key)
}
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
let stillAt = null // the generation at which the world stopped changing

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
  stillAt = null
}

function clear() {
  grid = emptyGrid()
  generation = 0
  playing = false
  stillAt = null
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
  let changed = false
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(r, c)
      // A live cell survives with 2 or 3 neighbours; a dead cell comes alive with exactly 3.
      next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
      if (next[r][c] !== grid[r][c]) changed = true
    }
  }
  if (!changed) {
    playing = false
    stillAt = generation
    return
  }
  stillAt = null
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
  if (stillAt !== null) {
    ctx.textAlign = 'center'
    ctx.fillText('Still at ' + stillAt, canvas.width / 2, 24)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
