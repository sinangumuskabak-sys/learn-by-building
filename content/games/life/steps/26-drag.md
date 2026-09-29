---
title: Drag to paint
title_tr: Sürükleyerek boya
skills: [game.input]
---

# --goal--

While the pointer is down, every move writes `painting` into the cell under it. Letting go sets `painting` back to
`null`.

# --goal-tr--

Şimdi sürükleme. İşaretçi her hareket ettiğinde tarayıcı `pointermove` olayını yayar. Basılıyken (`painting` `null`
değilken) altındaki hücreye `painting` değerini yazacağız. Bırakınca (`pointerup`) `painting` yeniden `null` olacak.

Neden her hücreyi çevirmiyoruz? Yavaş sürüklerken aynı hücrenin üstünde birkaç hareket olayı gelir; çevirseydik
aç–kapa–aç yapardı. **Tek bir değeri boyamak** sağlamdır.

# --code--

```js
canvas.addEventListener('pointermove', (event) => {
  if (painting === null) return
  const cell = cellAt(toCanvas(event))
  if (cell) grid[cell.r][cell.c] = painting
})

document.addEventListener('pointerup', () => {
  painting = null
})
```

# --meaning--

- `pointermove`: if nothing is being painted, stop; otherwise write `painting` into the cell under the pointer.
- `pointerup` is heard on the whole **document**, not the canvas: if you let go outside the canvas, the canvas would
  never hear it and painting would go on.

# --meaning-tr--

- `canvas.addEventListener('pointermove', ...)` → işaretçi canvas'ın üstünde **her kıpırdadığında** çalışır.
- `if (painting === null) return` → parmak kalkıksa (boyamıyorsak) hiçbir şey yapma. Fare boşta gezinirken
  hücreler değişmez.
- `if (cell) grid[cell.r][cell.c] = painting` → ızgaranın içindeysek altındaki hücreye seçilen değeri yaz.
- `document.addEventListener('pointerup', ...)` → bırakma olayını canvas'ta değil **bütün sayfada** dinleriz.
  Oyuncu parmağını canvas'ın dışında kaldırırsa canvas bunu duymaz ve boyama hiç bitmezdi.
- `painting = null` → bıraktın, boyama bitti.

# --task--

Write the two listeners under the `pointerdown` listener, above `function update() {`.

# --task-tr--

`pointerdown` dinleyicisinin kapanan `})` satırının altına, `function update() {` satırının **üstüne** iki dinleyiciyi
yaz; aralarında ve altlarında birer boş satır kalsın. **Çalıştır**: **C** ile temizle, basılı tutup sürükleyerek bir
şekil çiz, sonra **Boşluk** ile çalıştır.

# --hint--

If painting never stops, check that `pointerup` is on `document` and sets `painting = null`.

# --hint-tr--

Boyama hiç bitmiyorsa `pointerup`'ın `document`'e bağlı olduğuna ve `painting = null` yaptığına bak.

# --tests--

Dragging should paint a line of live cells.
tr: Sürüklemek bir canlı hücre çizgisi boyamalı.

```js
grid = emptyGrid()
$.pointerDown(4, 36 + 20 * 8 + 4)
for (let c = 1; c < 10; c++) $.move(c * 8 + 4, 36 + 20 * 8 + 4)
$.pointerUp(9 * 8 + 4, 36 + 20 * 8 + 4)
assert.deepEqual(grid[20].slice(0, 11), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0])
$.move(11 * 8 + 4, 36 + 20 * 8 + 4)
assert.strictEqual(grid[20][11], 0, 'moving without pressing does nothing')
```

Dragging from a live cell should erase.
tr: Canlı bir hücreden sürüklemek silmeli.

```js
grid = emptyGrid()
for (let c = 0; c < 10; c++) grid[20][c] = 1
$.pointerDown(3 * 8 + 4, 36 + 20 * 8 + 4)
for (let c = 4; c < 7; c++) $.move(c * 8 + 4, 36 + 20 * 8 + 4)
$.pointerUp(6 * 8 + 4, 36 + 20 * 8 + 4)
assert.deepEqual(grid[20].slice(0, 10), [1, 1, 1, 0, 0, 0, 0, 1, 1, 1])
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
