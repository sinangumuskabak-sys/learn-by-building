---
title: Patterns from text
title_tr: Metinden desenler
skills: [prog.arrays, prog.loops]
---

# --goal--

Famous patterns are shared as text: one line per row, `O` for a live cell and `.` for a dead one. `stamp` copies such
a picture onto the grid.

# --goal-tr--

Hayat Oyunu meraklıları ünlü desenleri **yazı olarak** paylaşır: her satır bir yazı, `O` canlı hücre, `.` ölü hücre.
Bir planör şöyle görünür:

```js
['.O.',
 '..O',
 'OOO']
```

`stamp` (damga) böyle bir resmi ızgaraya **mühür gibi basar**: desenin sol üst köşesi verdiğimiz satır ve sütuna gelir.

# --code--

```js
// Copy a text pattern onto the grid with its top left corner at (row, col).
function stamp(pattern, row, col) {
  pattern.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) if (line[c] === 'O') grid[(row + r) % ROWS][(col + c) % COLS] = 1
  })
}
```

# --meaning--

- `pattern.forEach((line, r) => ...)` runs once for each line of text; `r` is the line's number.
- A text works like a list of letters: `line[c]` is the letter at `c`, `line.length` how many letters there are.
- Every `'O'` sets the cell `(row + r, col + c)`, wrapped with `%` like the rest of this world.

# --meaning-tr--

- `pattern.forEach((line, r) => { ... })` → `forEach`, listenin **her elemanı için** içini çalıştırır. `line` o
  anki satır yazısı (`'.O.'`), `r` onun sırası (0, 1, 2...).
- Bir yazı da liste gibi davranır: `'.O.'[1]` → `'O'` (sayma 0'dan), `'.O.'.length` → 3 (kaç harf olduğu).
- `for (let c = 0; c < line.length; c++)` → satırın her harfine bakar.
- `if (line[c] === 'O') grid[...][...] = 1` → harf `O` ise o hücreyi canlandır. Desenin satırı `row + r`, sütunu
  `col + c`.
- `% ROWS` ve `% COLS` → dünya başa sardığı için, kenardan taşan desen karşı taraftan devam eder.

# --task--

Write `stamp` under `clear`, after an empty line.

# --task-tr--

`clear` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak ve yorum satırıyla birlikte `stamp`'i yaz.
**Çalıştır**: ekran değişmez; desenleri birazdan basacağız.

# --try--

For a moment, add `grid = emptyGrid()` and `stamp(['.O.', '..O', 'OOO'], 1, 1)` in `reset` under `frames = 0`, run
and press Space: a glider walks diagonally. Then remove the two lines.

# --try-tr--

`reset` içinde `frames = 0` satırının altına geçici olarak `grid = emptyGrid()` ve `stamp(['.O.', '..O', 'OOO'], 1, 1)`
yaz, çalıştır ve Boşluk'a bas: bir planörün çapraz yürüyüşünü izle. Sonra bu iki satırı sil.

# --tests--

`stamp` should copy a text pattern onto the grid.
tr: `stamp` bir metin desenini ızgaraya kopyalamalı.

```js
grid = emptyGrid()
stamp(['.O.', '..O', 'OOO'], 10, 20)
assert.deepEqual([grid[10][21], grid[11][22], grid[12][20], grid[12][21], grid[12][22]], [1, 1, 1, 1, 1])
assert.strictEqual(population(), 5)
```

A pattern should wrap around at the edges.
tr: Bir desen kenarlarda başa sarmalı.

```js
grid = emptyGrid()
stamp(['OO'], 47, 59)
assert.strictEqual(grid[47][59] + grid[47][0], 2)
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
