---
title: What time is it?
title_tr: Saat kaç?
skills: [game.loop]
---

# --goal--

A game this short is about speed, so we will add a timer. First, the time itself: `requestAnimationFrame` passes the
loop a timestamp in milliseconds, and we keep it in `now`.

# --goal-tr--

Bu kadar kısa bir oyunda asıl yarış **hız**: bir saat ekleyeceğiz. Önce "şu an"ı bilmeliyiz.

İyi haber: `requestAnimationFrame`, `loop`'u çağırırken ona bir sayı **verir**: sayfa açıldığından beri geçen süre,
**milisaniye** cinsinden (1 saniye = 1000 milisaniye). Onu her karede `now` (şimdi) değişkenine yazarız; böylece kodun
her yerinde "şu an" `now`'dır.

# --code--

```js
let now = 0

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `loop(time)` receives the timestamp; `now = time` keeps it for everyone else.
- `now` starts at 0 until the first frame.

# --meaning-tr--

- `let now = 0` → şu an; ilk kareye kadar 0.
- `function loop(time)` → artık bir **parametre** alıyor: `requestAnimationFrame` onu zaman bilgisiyle çağırır.
- `now = time` → her karede güncelle.

# --task--

1. Under `let state ...`, write `let now = 0`.
2. Give `loop` a `time` parameter, and write `now = time` as its first line. Press **Run**.

# --task-tr--

1. `let state ...` satırının altına `let now = 0` yaz.
2. `function loop()` satırını `function loop(time)` yap ve içine en üste `now = time` yaz.
3. **Çalıştır**. Ekran değişmez; saati sonraki adımda göstereceğiz.

# --tests--

`now` should follow the clock in milliseconds.
tr: `now` saati milisaniye olarak izlemeli.

```js
$.run(2)
assert.closeTo(now, 2000, 50)
$.run(1)
assert.closeTo(now, 3000, 50)
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
let now = 0

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

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
