---
title: Stepping on a mine
title_tr: Mayına basmak
skills: [game.state]
---

# --goal--

Opening a mine loses the game: `lose()` sets `state` to `'lost'` and opens every mine. After that, clicks do nothing.

# --goal-tr--

Mayına basarsan **kaybedersin**. `lose` (kaybet) fonksiyonu durumu `'lost'` yapar ve **bütün mayınları** açar: nerede
olduklarını gör. Kaybettikten sonra tıklamalar artık hiçbir şey açmamalı.

# --code--

```js
  if (start.mine) {
    lose()
    return
  }
  start.revealed = true
}

function lose() {
  state = 'lost'
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
}

canvas.addEventListener('click', (event) => {
  if (state === 'lost') return
```

# --meaning--

- In `reveal`, a mine calls `lose()` and stops there.
- `lose` opens every mine cell.
- The click listener ignores clicks once the game is lost.

# --meaning-tr--

- `if (start.mine) { lose(); return }` → `reveal` içinde, ilk tıklama kontrolünden sonra: mayınsa kaybet ve çık.
  (İlk tıklama asla mayın olamaz; mayınlar onun çevresine konmuyor.)
- `function lose()` → `state = 'lost'` ve bütün mayınlı hücreleri aç (`revealed = true`).
- `if (state === 'lost') return` → tıklama dinleyicisinin en başında: kaybettiysen hiçbir şey yapma.

# --task--

1. In `reveal`, above `start.revealed = true`, write the `if (start.mine)` block.
2. Above `function cellAt`, write `lose` and leave an empty line.
3. In the click listener, write the `if (state === 'lost') return` line at the top. Press **Run**.

# --task-tr--

1. `reveal` içinde `start.revealed = true` satırının **üstüne** `if (start.mine) { ... }` bloğunu yaz.
2. `function cellAt(event) {` satırının **üstüne** `lose` fonksiyonunu yaz; arada bir boş satır kalsın.
3. Tıklama dinleyicisinin **en üstüne** `if (state === 'lost') return` yaz.
4. **Çalıştır**. Mayınları bir sonraki adımda çizeceğiz; şimdilik açık gri görünürler.

# --tests--

Opening a mine should lose the game and open every mine.
tr: Mayın açmak oyunu kaybettirmeli ve bütün mayınları açmalı.

```js
reveal(grid[0][0])
const mine = grid.flat().find((c) => c.mine)
reveal(mine)
assert.strictEqual(state, 'lost')
assert.isTrue(grid.flat().filter((c) => c.mine).every((c) => c.revealed))
```

After losing, clicks should open nothing.
tr: Kaybettikten sonra tıklamalar hiçbir şey açmamalı.

```js
reveal(grid[0][0])
reveal(grid.flat().find((c) => c.mine))
const hidden = grid.flat().find((c) => !c.revealed)
$.click(hidden.col * 40 + 20, 40 + hidden.row * 40 + 20)
assert.isFalse(hidden.revealed, 'no more opening after losing')
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
  if (start.mine) {
    lose()
    return
  }
  start.revealed = true
}

function lose() {
  state = 'lost'
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
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
  if (state === 'lost') return
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
