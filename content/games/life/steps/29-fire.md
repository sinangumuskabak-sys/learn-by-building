---
title: Fire the gun
title_tr: Topu ateşle
skills: [game.input]
---

# --goal--

A `'Gun'` button clears the world and stamps the gun near the top left; the G key presses it.

# --goal-tr--

Şimdi topu sahneye çıkarıyoruz: **Gun** düğmesi dünyayı temizleyecek ve topu sol üste basacak. Klavyede **G** tuşu.
Sonra Boşluk'a basınca topun durmadan planör fırlattığını göreceksin.

# --code--

```js
  else if (button === 'Clear') clear()
  else if (button === 'Gun') {
    clear()
    stamp(GUN, 4, 4)
  }
}

  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear', g: 'Gun' }
```

# --meaning--

- `'Gun'` first clears (empty and stopped), then stamps `GUN` with its top left corner at row 4, column 4.
- `g: 'Gun'` in the table makes the G key press it.

# --meaning-tr--

- `else if (button === 'Gun') {` → Gun düğmesi iki iş yapar, bu yüzden süslü parantez:
  - `clear()` → önce boş ve duran bir dünya.
  - `stamp(GUN, 4, 4)` → topun sol üst köşesi 4. satır, 4. sütuna gelir.
- Tabloya `g: 'Gun'` eklendi.

# --task--

1. In `press`, under the `'Clear'` line, add the `'Gun'` case (four lines).
2. Add `g: 'Gun'` to the key table.

# --task-tr--

1. `press` içinde `else if (button === 'Clear') clear()` satırının altına `'Gun'` bölümünü (dört satır) yaz.
   Fonksiyonun son `}`'si altta kalır.
2. `keydown` içindeki tabloya `g: 'Gun'` ekle.
3. **Çalıştır**, oyuna tıkla, **G**'ye ve sonra **Boşluk**'a bas.

# --predict--

The gliders fly off towards the bottom right. What happens when they come back around the wrapped world?
- [ ] They pass through the gun
- [x] They crash into the gun and mess it up
  The world has no edges, so the gliders return from the top left, right into the gun.
- [ ] They disappear at the edge

# --predict-tr--

Planörler sağ alta doğru uçuyor. Başa saran dünyada dönüp geri geldiklerinde ne olur?
- [ ] Topun içinden geçerler
- [x] Topa çarpar ve onu bozarlar
  Dünyanın kenarı yok; planörler sol üstten geri gelip topa çarpar. Bir süre izle!
- [ ] Kenarda kaybolurlar

# --tests--

G should clear the world and stamp the gun.
tr: G dünyayı temizlemeli ve topu basmalı.

```js
$.press(' ')
$.tick(SPEED * 3)
$.press('g')
assert.strictEqual(population(), 36)
assert.strictEqual(generation, 0)
assert.isFalse(playing)
assert.strictEqual(grid[4 + 4][4] + grid[4 + 4][5] + grid[4 + 5][4], 3, 'the gun sits at row 4, column 4')
```

After G and Space, the gun should keep firing.
tr: G ve Boşluk'tan sonra top ateş etmeye devam etmeli.

```js
$.press('g')
$.press(' ')
$.tick(SPEED * 120)
assert.isAbove(population(), 50)
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
