---
title: Paint or erase?
title_tr: Boya mı sil mi?
skills: [game.state]
---

# --goal--

Next we want to drag and paint a whole line. First we remember what the press decided: `painting` holds the value
being painted, `1` when you pressed on a dead cell and `0` (erase) when you pressed on a live one.

# --goal-tr--

Sıradaki hedef: basılı tutup **sürükleyerek** bir çizgi boyamak. Sürüklerken her hücrede şunu bilmemiz gerekecek:
"şu an **boyuyor muyuz, siliyor muyuz**?"

Karar, basıldığı an verilir: ölü bir hücreye bastıysan **canlı boya** (`1`), canlı bir hücreye bastıysan **silgi**
(`0`). Bu kararı `painting` değişkeninde tutacağız. Parmak kalkıkken `painting` `null` olacak: "hiçbir şey boyanmıyor".

# --code--

```js
let painting = null // while the pointer is down: the value being painted, 1 or 0

// Pressing on a dead cell paints live cells as you drag; pressing on a live one erases.
canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(toCanvas(event))
  if (!cell) return
  painting = grid[cell.r][cell.c] ? 0 : 1
  grid[cell.r][cell.c] = painting
})
```

# --meaning--

- `painting` starts as `null`: nothing is being painted.
- On a press it becomes the opposite of the pressed cell, and that value is written into the cell.
- A click still flips a cell, as before; the difference is that the choice is now remembered.

# --meaning-tr--

- `let painting = null` → başta `null`: parmak kalkık, hiçbir şey boyanmıyor.
- `painting = grid[cell.r][cell.c] ? 0 : 1` → basılan hücrenin **tersi**: canlıya bastıysan `0` (silgi), ölüye
  bastıysan `1` (boya).
- `grid[cell.r][cell.c] = painting` → o değeri basılan hücreye yazar. Tek tıklama yine eskisi gibi hücreyi çevirir;
  fark, kararın artık **hatırlanması**.
- Üstteki yorum satırı, ne yaptığımızı anlatan bir not.

# --task--

1. Under `let frames` write the `painting` line.
2. Above the `pointerdown` listener write the comment; inside it, replace the last line with the two `painting` lines.

# --task-tr--

1. `let frames` satırının altına `let painting = null ...` satırını yaz.
2. `canvas.addEventListener('pointerdown', ...` satırının **üstüne** yorum satırını yaz.
3. Dinleyicinin içindeki son satırı (`grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1`) sil; yerine iki
   `painting` satırını yaz.
4. **Çalıştır**: tıklamak eskisi gibi çalışmalı.

# --tests--

`painting` should start as `null`.
tr: `painting` `null` başlamalı.

```js
assert.isNull(painting)
```

Pressing on a dead cell should choose to paint (1); on a live cell, to erase (0).
tr: Ölü hücreye basmak boyamayı (1), canlı hücreye basmak silmeyi (0) seçmeli.

```js
grid = emptyGrid()
$.pointerDown(4, 36 + 20 * 8 + 4)
assert.strictEqual(painting, 1)
assert.strictEqual(grid[20][0], 1)
$.pointerDown(4, 36 + 20 * 8 + 4)
assert.strictEqual(painting, 0)
assert.strictEqual(grid[20][0], 0)
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
