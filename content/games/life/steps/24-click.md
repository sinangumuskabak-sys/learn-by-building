---
title: Click a cell
title_tr: Hücreye tıkla
skills: [game.input]
---

# --goal--

Now a click (or a tap) flips the cell under the pointer: dead becomes alive, alive becomes dead.

# --goal-tr--

Parçaları birleştirme zamanı: bir hücreye **tıklayınca** (ya da parmakla dokununca) o hücre değişsin. Ölüyse canlansın,
canlıysa ölsün; bir lambanın düğmesi gibi.

Fare ve parmak için tarayıcı `pointerdown` (bastın) olayını yayar. `keydown`'ı dinlediğimiz gibi onu da dinleriz.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(toCanvas(event))
  if (!cell) return
  grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1
})
```

# --meaning--

- `pointerdown` fires when a mouse button or a finger goes down on the canvas.
- `cellAt(toCanvas(event))` turns the event into a cell; off the grid we `return` and do nothing.
- The last line writes the opposite of the cell: `1` becomes `0`, `0` becomes `1`.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → **canvas'ın üstüne** basıldığında (fare tuşu ya da parmak) içini
  çalıştır.
- `cellAt(toCanvas(event))` → önce olaydan canvas noktasını, sonra noktadan hücreyi bulur: iki fonksiyon iç içe.
- `if (!cell) return` → hücre yoksa (`null`, ızgaranın dışı) hiçbir şey yapma.
- `grid[cell.r][cell.c] ? 0 : 1` → hücre canlıysa `0`, ölüyse `1`: **tersini** yazar.

# --task--

Write the listener under `cellAt`, above `function update() {`, with an empty line after it.

# --task-tr--

`cellAt`'ın altına, `function update() {` satırının **üstüne** dinleyiciyi yaz; altında bir boş satır kalsın.
**Çalıştır**: **C** ile temizle, sonra birkaç hücreye tıkla ve **N** ile ne olduğuna bak.

# --try--

Clear with C, click three cells in a row, then press N a few times: you built a blinker.

# --try-tr--

C ile temizle, yan yana üç hücreye tıkla, sonra N'ye birkaç kez bas: bir yanıp sönen (blinker) yaptın.

# --tests--

A click should bring a cell to life, and a second click should erase it.
tr: Bir tıklama bir hücreyi canlandırmalı, ikinci tıklama onu silmeli.

```js
grid = emptyGrid()
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 1)
$.click(10 * 8 + 4, 36 + 5 * 8 + 4)
assert.strictEqual(grid[5][10], 0, 'a second click erases')
```

A click above the grid should do nothing.
tr: Izgaranın üstüne tıklamak hiçbir şey yapmamalı.

```js
grid = emptyGrid()
$.click(200, 10)
assert.strictEqual(population(), 0)
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

canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(toCanvas(event))
  if (!cell) return
  grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1
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
