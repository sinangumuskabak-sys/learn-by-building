---
title: The clock
title_tr: Saat
skills: [game.state, game.loop]
---

# --goal--

The clock starts at the first click, not when the page loads (that would punish looking at the board). We keep the
start time; the seconds on screen are worked out from it while drawing.

# --goal-tr--

Saat **ilk tıklamada** başlasın; sayfa açılınca değil (yoksa tahtaya bakmak cezalandırılırdı). Başlangıç anını
`startTime`'da saklarız. Ekrandaki saniyeyi bir değişkende tutmayız; her çizimde `now` ile `startTime` arasındaki
farktan **hesaplarız**.

# --code--

```js
let startTime

  startTime = 0

    state = 'playing'
    startTime = now

  const seconds = state === 'ready' ? 0 : Math.floor((now - startTime) / 1000)

  ctx.textAlign = 'right'
  ctx.fillText('⏱ ' + seconds, canvas.width - 10, TOP / 2)
```

# --meaning--

- `startTime` is set on the first reveal, where the game starts.
- Before the first click the clock shows 0; after it, the whole seconds since the start.
- Right-aligned: the text ends at 10 pixels from the right edge.

# --meaning-tr--

- `let startTime` → başlangıç anı; `newGame` içinde 0.
- `startTime = now` → `reveal` içinde, ilk açılışta (`state` `'playing'` olurken).
- `state === 'ready' ? 0 : ...` → henüz başlamadıysa 0.
- `Math.floor((now - startTime) / 1000)` → geçen milisaniye, 1000'e bölünüp aşağı yuvarlanır: **tam saniye**.
- `ctx.textAlign = 'right'` → yazı verilen noktada **biter**: sağ kenara yaslanır.

# --task--

1. Under `let state ...`, write `let startTime`; in `newGame`, `startTime = 0`.
2. In `reveal`, under `state = 'playing'`, write `startTime = now`.
3. In `draw`, under `const flags`, write `const seconds ...`; under the `💣` line write the two clock lines.

# --task-tr--

1. `let state ...` satırının altına `let startTime` yaz; `newGame`'in sonuna `startTime = 0` yaz.
2. `reveal` içinde `state = 'playing'` satırının altına `startTime = now` yaz.
3. `draw` içinde `const flags ...` satırının altına `const seconds ...` satırını yaz.
4. `💣` satırının altına iki saat satırını yaz.
5. **Çalıştır** ve tıkla: sağ üstte saniyeler saymalı.

# --tests--

The clock should start at the first click.
tr: Saat ilk tıklamada başlamalı.

```js
$.run(3)
$.tick()
assert.include($.texts(), '⏱ 0', 'no ticking before the first click')
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
$.run(5.2)
assert.include($.texts(), '⏱ 5')
```

The clock should be at the top right.
tr: Saat sağ üstte olmalı.

```js
$.tick()
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '⏱ 0')
assert.exists(t)
assert.deepEqual(t.args.slice(1), [350, 20])
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
let startTime
let now = 0

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false, flagged: false })),
  )
  state = 'ready'
  startTime = 0
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
    startTime = now
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
  const seconds = state === 'ready' ? 0 : Math.floor((now - startTime) / 1000)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('💣 ' + (MINES - flags), 10, TOP / 2)
  ctx.textAlign = 'right'
  ctx.fillText('⏱ ' + seconds, canvas.width - 10, TOP / 2)

  if (state === 'won' || state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = state === 'won' ? '#4ade80' : '#f87171'
    ctx.fillText(state === 'won' ? 'You win!' : 'Boom! Click to retry', canvas.width / 2, TOP / 2)
  }
}

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
