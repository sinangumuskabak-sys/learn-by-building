---
title: Show the mines
title_tr: Mayınları göster
skills: [game.canvas]
---

# --goal--

An open mine is drawn on a light red square with a 💣, so after a loss you can see where every mine was.

# --goal-tr--

Kaybedince bütün mayınlar açılıyor ama açık gri görünüyor. Onları belli edelim: açık bir mayın **kırmızımsı** bir
karede `💣` olarak çizilsin.

# --code--

```js
ctx.fillStyle = cell.mine ? '#fca5a5' : '#e2e8f0'
ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
if (cell.mine) ctx.fillText('💣', x + CELL / 2, y + CELL / 2 + 1)
else if (cell.count > 0) {
```

# --meaning--

- `cell.mine ? a : b` picks light red for a mine, light grey otherwise.
- A mine shows a bomb; `else if` shows the number only when it is not a mine.

# --meaning-tr--

- `cell.mine ? '#fca5a5' : '#e2e8f0'` → **kısa if**: mayınsa kırmızımsı, değilse açık gri.
- `if (cell.mine) ctx.fillText('💣', ...)` → mayınsa bomba yaz (emoji de bir yazıdır).
- `else if (cell.count > 0) {` → **değilse**, sayısı varsa sayıyı yaz. Mayının `count`'u da olabilir; `else` sayesinde
  mayının üstüne sayı yazılmaz.

# --task--

In the `if (cell.revealed)` block, change the colour line, add the bomb line, and put `else ` in front of
`if (cell.count > 0)`.

# --task-tr--

`if (cell.revealed)` bloğunda:
1. `ctx.fillStyle = '#e2e8f0'` satırını `ctx.fillStyle = cell.mine ? '#fca5a5' : '#e2e8f0'` yap.
2. `fillRect` satırının altına bomba satırını yaz.
3. `if (cell.count > 0) {` satırının başına `else ` ekle.
4. **Çalıştır** ve bir mayına bas.

# --tests--

After a loss every mine should be drawn as a bomb on red.
tr: Kaybedince her mayın kırmızı üstünde bomba olarak çizilmeli.

```js
reveal(grid[0][0])
reveal(grid.flat().find((c) => c.mine))
$.tick()
assert.lengthOf($.texts().filter((t) => t === '💣'), 10)
assert.lengthOf($.rects('#fca5a5'), 10)
```

Numbers should still be drawn on safe cells.
tr: Güvenli hücrelerde sayılar yine çizilmeli.

```js
reveal(grid[0][0])
const numbered = grid.flat().find((c) => !c.mine && c.count > 0)
reveal(numbered)
$.tick()
assert.include($.texts(), String(numbered.count))
assert.notInclude($.texts(), '💣')
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
