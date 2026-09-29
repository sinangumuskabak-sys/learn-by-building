---
title: Which cell?
title_tr: Hangi hücre?
skills: [game.input]
---

# --goal--

From a point in canvas pixels to a cell: divide by the cell size and round down. Points outside the grid give `null`.

# --goal-tr--

Artık noktayı biliyoruz; şimdi o noktanın **hangi hücreye** düştüğünü bulacağız. Bu, çizimin tersi: çizerken hücreden
piksele gitmiştik (`c * CELL`), şimdi pikselden hücreye dönüyoruz (`x / CELL`).

# --code--

```js
function cellAt({ x, y }) {
  const r = Math.floor((y - TOP) / CELL)
  const c = Math.floor(x / CELL)
  return r >= 0 && r < ROWS && c >= 0 && c < COLS ? { r, c } : null
}
```

# --meaning--

- `{ x, y }` in the parentheses takes `x` and `y` out of the object passed in.
- `Math.floor` rounds down: `x = 85` gives `85 / 8 = 10.6`, so column 10. For the row, `TOP` is taken off first.
- `{ r, c }` is short for `{ r: r, c: c }`. Outside the grid it returns `null`, "nothing".

# --meaning-tr--

- `function cellAt({ x, y })` → parantezdeki `{ x, y }`: "gelen nesnenin `x`'ini ve `y`'sini al, bu adlarla kullan".
- `Math.floor` → sayıyı **aşağı yuvarlar**: `Math.floor(10.6)` = 10. `x = 85` ise `85 / 8` = 10.6 → **10. sütun**.
- `(y - TOP) / CELL` → satır için önce üstteki `TOP` şeridini çıkarırız; ızgara oradan başlıyor.
- `koşul ? { r, c } : null` → nokta ızgaranın içindeyse hücreyi, değilse `null` verir. `null` "**hiçbir şey**"
  demektir (örneğin üstteki yazı şeridine tıklanınca).
- `{ r, c }` → `{ r: r, c: c }`'nin kısa yazılışı.

# --task--

Write `cellAt` under `toCanvas`, above `function update() {`, with empty lines around it.

# --task-tr--

`toCanvas`'ın altına, `function update() {` satırının **üstüne** `cellAt` fonksiyonunu yaz; üstünde ve altında birer
boş satır kalsın. **Çalıştır**.

# --tests--

`cellAt` should find the cell under a point.
tr: `cellAt` bir noktanın altındaki hücreyi bulmalı.

```js
assert.deepEqual(cellAt({ x: 85, y: 36 + 5 * 8 + 3 }), { r: 5, c: 10 })
assert.deepEqual(cellAt({ x: 0, y: 36 }), { r: 0, c: 0 })
assert.deepEqual(cellAt({ x: 479, y: 36 + 384 - 1 }), { r: 47, c: 59 })
```

Points outside the grid should give `null`.
tr: Izgaranın dışındaki noktalar `null` vermeli.

```js
assert.isNull(cellAt({ x: 200, y: 10 }), 'the text strip above the grid')
assert.isNull(cellAt({ x: 200, y: 36 + 384 + 5 }), 'below the grid')
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
