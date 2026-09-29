---
title: The end and a new game
title_tr: Son ve yeni oyun
skills: [game.state, game.input]
---

# --goal--

When the game is over, the top strip says so, in green or red, and a click starts a new game.

# --goal-tr--

Oyun bitince bunu **söyleyelim**: üst şeritte ortada, kazandıysan yeşil `You win!` (kazandın), kaybettiysen kırmızı
`Boom! Click to retry` (bum, tekrar denemek için tıkla). Ve gerçekten de bir tıklama **yeni oyun** başlatsın:
`newGame` zaten her şeyi sıfırlıyor.

# --code--

```js
canvas.addEventListener('click', (event) => {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }

  if (state === 'won' || state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = state === 'won' ? '#4ade80' : '#f87171'
    ctx.fillText(state === 'won' ? 'You win!' : 'Boom! Click to retry', canvas.width / 2, TOP / 2)
  }
```

# --meaning--

- A click on a finished game calls `newGame()` instead of doing nothing.
- The message is centred in the top strip; `? :` picks its colour and text.

# --meaning-tr--

- Tıklama dinleyicisinde `return` yerine artık `{ newGame(); return }`: oyun bittiyse yeni oyun başlat ve çık.
- `if (state === 'won' || state === 'lost')` → oyun bittiyse mesaj yaz:
  - `ctx.textAlign = 'center'` → üst şeridin ortasına.
  - `state === 'won' ? '#4ade80' : '#f87171'` → kazandıysan yeşil, değilse kırmızı. Aynı soru yazıyı da seçer.

# --task--

1. In the click listener, turn the first line into the `if` block with `newGame()`.
2. In `draw`, under the `💣` line, leave an empty line and write the message block. Press **Run**.

# --task-tr--

1. Tıklama dinleyicisinin ilk satırını kod bloğundaki gibi `if (...) { newGame(); return }` bloğuna çevir.
2. `draw` içinde `💣` satırının altına bir boş satır bırakıp mesaj bloğunu yaz.
3. **Çalıştır**, bir mayına bas, sonra tıkla: yeni oyun başlamalı.

# --tests--

A loss should say Boom, a win You win.
tr: Kayıp Boom, kazanç You win demeli.

```js
reveal(grid[4][4])
reveal(grid.flat().find((c) => c.mine))
$.tick()
assert.include($.texts(), 'Boom! Click to retry')
newGame()
reveal(grid[4][4])
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
$.tick()
const t = $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith('You win!'))
assert.exists(t)
assert.strictEqual(t.fill, '#4ade80')
```

A click after the game ends should start a new one.
tr: Oyun bittikten sonraki tıklama yenisini başlatmalı.

```js
reveal(grid[4][4])
reveal(grid.flat().find((c) => c.mine))
assert.strictEqual(state, 'lost')
$.click(20, 60)
assert.strictEqual(state, 'ready')
assert.isTrue(grid.flat().every((c) => !c.revealed && !c.mine))
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
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false, flagged: false })),
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
  if (start.revealed || start.flagged) return
  if (state === 'ready') {
    placeMines(start)
    state = 'playing'
  }
  if (start.mine) {
    lose()
    return
  }
  // Flood fill with our own stack: open the cell, and keep opening around every empty (0) cell.
  const stack = [start]
  while (stack.length > 0) {
    const cell = stack.pop()
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.count === 0) {
      for (const next of neighbors(cell)) {
        if (!next.revealed && !next.mine) stack.push(next)
      }
    }
  }
  if (grid.flat().every((cell) => cell.mine || cell.revealed)) win()
}

function toggleFlag(cell) {
  if (cell.revealed || state === 'won' || state === 'lost') return
  cell.flagged = !cell.flagged
}

function lose() {
  state = 'lost'
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
}

function win() {
  state = 'won'
  for (const cell of grid.flat()) if (cell.mine) cell.flagged = true
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
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }
  const cell = cellAt(event)
  if (cell) reveal(cell)
})

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault() // no browser menu: right click places a flag
  const cell = cellAt(event)
  if (cell) toggleFlag(cell)
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
      ctx.fillStyle = cell.mine ? '#fca5a5' : '#e2e8f0'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.mine) ctx.fillText('💣', x + CELL / 2, y + CELL / 2 + 1)
      else if (cell.count > 0) {
        ctx.fillStyle = NUMBER_COLORS[cell.count]
        ctx.fillText(String(cell.count), x + CELL / 2, y + CELL / 2 + 1)
      }
    } else {
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.flagged) ctx.fillText('🚩', x + CELL / 2, y + CELL / 2 + 1)
    }
  }

  const flags = grid.flat().filter((cell) => cell.flagged).length
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('💣 ' + (MINES - flags), 10, TOP / 2)

  if (state === 'won' || state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = state === 'won' ? '#4ade80' : '#f87171'
    ctx.fillText(state === 'won' ? 'You win!' : 'Boom! Click to retry', canvas.width / 2, TOP / 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
