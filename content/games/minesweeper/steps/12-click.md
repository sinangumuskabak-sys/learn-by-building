---
title: Click to open
title_tr: Tıkla ve aç
skills: [game.input]
---

# --goal--

A click opens the cell under the pointer. `cellAt(event)` scales the click into canvas pixels and divides by `CELL` to
find the column and row; clicks on the top strip give `undefined`.

# --goal-tr--

Şimdi fareyle oynayalım: tıklanan hücre açılsın. Tıklamanın **hangi hücre** olduğunu bulan bir fonksiyon yazacağız:
`cellAt(event)`.

Hesap basit: x'i 40'a bölüp aşağı yuvarlarsan sütun (130 / 40 = 3,25 → 3). Satır için önce üst şeridi (40) çıkar.
Şeride ya da tahtanın dışına tıklanırsa "hücre yok" (`undefined`) döner.

# --code--

```js
function cellAt(event) {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const col = Math.floor(x / CELL)
  const row = Math.floor((y - TOP) / CELL)
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return undefined
  return grid[row][col]
}

canvas.addEventListener('click', (event) => {
  const cell = cellAt(event)
  if (cell) reveal(cell)
})
```

# --meaning--

- `getBoundingClientRect()` gives the canvas's place and size on the screen; the pointer is scaled into canvas pixels.
- Division by `CELL`, rounded down, gives the column and row.
- Outside the board the function returns `undefined`, which `if (cell)` treats as "no cell".
- `addEventListener('click', ...)` runs the function on every click, with the click's details in `event`.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → tuvalin ekrandaki **yeri ve boyu**. Tuval ekranda küçültülmüş ya da büyütülmüş
  olabilir; bu yüzden fare konumundan tuvalin sol üst köşesini çıkarıp `canvas.width / rect.width` oranıyla çarparız:
  **tuval pikseli**.
- `Math.floor(x / CELL)` → sütun; `Math.floor((y - TOP) / CELL)` → satır (üst şerit hariç).
- `row < 0 || row >= SIZE || ...` → `||` "veya": biri bile tahtanın dışındaysa `return undefined` ("hücre yok").
- `return grid[row][col]` → tıklanan hücre.
- `canvas.addEventListener('click', (event) => { ... })` → tuvale her **tıklandığında** çalışır; `event` tıklamanın
  bilgilerini (`clientX`, `clientY`) taşır.
- `if (cell) reveal(cell)` → hücre bulunduysa aç; `undefined` "yanlış" sayılır.

# --task--

Above `function draw() {`, write `cellAt` and the click listener, with an empty line after each. Press **Run** and click.

# --task-tr--

`function draw() {` satırının **üstüne** `cellAt` fonksiyonunu ve tıklama dinleyicisini yaz; ikisinden sonra birer boş
satır kalsın. **Çalıştır** ve hücrelere tıkla: açılıp sayılarını göstermeli. (Mayına basarsan şimdilik bir şey olmaz;
sıradaki adım.)

# --tests--

A click should open the cell under it, and the first click places the mines.
tr: Tıklama altındaki hücreyi açmalı; ilk tıklama da mayınları yerleştirmeli.

```js
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
assert.isTrue(grid[4][4].revealed)
assert.strictEqual(state, 'playing')
assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
```

Clicks outside the board should find no cell.
tr: Tahtanın dışındaki tıklamalar hücre bulmamalı.

```js
assert.isUndefined(cellAt({ clientX: 100, clientY: 10 }), 'the top strip is not a cell')
assert.strictEqual(cellAt({ clientX: 359, clientY: 399 }), grid[8][8])
$.click(100, 10)
assert.strictEqual(state, 'ready')
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer
const MINES = 10
const NUMBER_COLORS = [null, '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']

let grid
let state // 'ready' (before the first click), 'playing', 'won' or 'lost'

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
  )
  state = 'ready'
}

// The up to 8 cells around a cell, skipping the ones that would be off the board.
function neighbors(cell) {
  const list = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const row = cell.row + dr
      const col = cell.col + dc
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
    }
  }
  return list
}

// Mines are placed on the first click, never on or next to the clicked cell, so the first click always opens space.
function placeMines(safe) {
  const forbidden = new Set([safe, ...neighbors(safe)])
  const candidates = grid.flat().filter((cell) => !forbidden.has(cell))
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  for (const cell of candidates.slice(0, MINES)) cell.mine = true
  for (const cell of grid.flat()) cell.count = neighbors(cell).filter((n) => n.mine).length
}

function reveal(start) {
  if (start.revealed) return
  if (state === 'ready') {
    placeMines(start)
    state = 'playing'
  }
  start.revealed = true
}

function cellAt(event) {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const col = Math.floor(x / CELL)
  const row = Math.floor((y - TOP) / CELL)
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return undefined
  return grid[row][col]
}

canvas.addEventListener('click', (event) => {
  const cell = cellAt(event)
  if (cell) reveal(cell)
})

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    if (cell.revealed) {
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.count > 0) {
        ctx.fillStyle = NUMBER_COLORS[cell.count]
        ctx.fillText(String(cell.count), x + CELL / 2, y + CELL / 2 + 1)
      }
    } else {
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
