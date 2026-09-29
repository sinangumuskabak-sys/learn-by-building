---
title: The glider gun
title_tr: Planör topu
skills: [prog.arrays]
---

# --goal--

The most famous pattern: Bill Gosper's glider gun (1970). Conway offered a prize for a pattern that grows forever;
this was the answer. 36 cells that shuttle back and forth and fire a new glider every 30 generations.

# --goal-tr--

Şimdi en ünlü desen: **Gosper'ın planör topu** (glider gun). Conway, sonsuza kadar büyüyen bir desen bulana ödül
vaat etmişti; Bill Gosper 1970'te buldu. 36 hücre ileri geri gidip gelir ve **her 30 nesilde bir** yeni bir planör
fırlatır.

Bu adımda deseni yazı olarak koda ekliyoruz. Bu bir kod değil, bir **resim**: her satır 36 karakter.

# --code--

```js
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
```

# --meaning--

- `GUN` is a list of 9 texts, 36 characters each: the gun, row by row. `O` is a big letter O, not a zero.
- The comma after the last line is allowed and keeps the lines alike.

# --meaning-tr--

- `const GUN = [ ... ]` → 9 yazıdan oluşan bir liste: topun satır satır resmi. Her satır 36 karakter.
- `O` büyük **O harfi**, sıfır değil. `.` ölü hücre.
- Son satırdan sonraki virgüle izin var; bütün satırlar aynı görünsün diye yazılır.
- Sağ ortadaki `OO` blokları topun iki yanındaki "duvarlar"; ortadaki şekiller ileri geri giderek planörü üretir.

# --task--

Under the `SPEED` line, after an empty line, write the comment and `GUN`.

# --task-tr--

`const SPEED = 6 ...` satırının altında bir boş satır bırak; yorum satırını ve `GUN` listesini yaz. Uzun satırları
dikkatle yaz (ya da buradan kopyala: bu kod değil, bir resim). **Çalıştır**: ekran değişmez.

# --hint--

Count the dots: every line has exactly 36 characters. A mistyped line breaks the gun.

# --hint-tr--

Noktaları say: her satır tam 36 karakter. Tek bir yanlış satır topu bozar.

# --tests--

`GUN` should be 9 lines of 36 characters with 36 live cells.
tr: `GUN` 36 karakterlik 9 satır olmalı ve 36 canlı hücre içermeli.

```js
assert.lengthOf(GUN, 9)
for (const line of GUN) assert.lengthOf(line, 36)
assert.strictEqual(GUN.join('').split('').filter((ch) => ch === 'O').length, 36)
```

Stamped on an empty grid, the gun should fire its first glider within 30 generations and keep growing.
tr: Boş ızgaraya basılan top ilk planörünü 30 nesil içinde fırlatmalı ve büyümeye devam etmeli.

```js
grid = emptyGrid()
stamp(GUN, 4, 4)
assert.strictEqual(population(), 36)
for (let i = 0; i < 30; i++) step()
assert.strictEqual(population(), 41, 'the gun has fired its first glider')
for (let i = 0; i < 90; i++) step()
assert.isAbove(population(), 50, 'and keeps firing')
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
