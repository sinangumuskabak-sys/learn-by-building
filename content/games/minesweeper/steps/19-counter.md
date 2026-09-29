---
title: Mines left
title_tr: Kalan mayınlar
skills: [game.state, game.canvas]
---

# --goal--

The top left shows `MINES - flags`: how many mines are left if every flag is right. It is not stored anywhere; it is
counted from the grid each time it is drawn, so it can never be out of date.

# --goal-tr--

Sol üstte `💣 7` gibi bir sayaç: **kalan mayın** sayısı, yani bütün bayraklar doğruysa kaç mayın kaldı. Oyuncu fazla
bayrak koyarsa eksiye bile düşebilir; bu da işe yarar bir ipucu.

Bu sayıyı bir değişkende tutmuyoruz: her çizimde tahtadan **yeniden sayıyoruz**. Böylece hiçbir zaman eskimez.

# --code--

```js
const flags = grid.flat().filter((cell) => cell.flagged).length
ctx.fillStyle = 'white'
ctx.font = 'bold 18px monospace'
ctx.textAlign = 'left'
ctx.fillText('💣 ' + (MINES - flags), 10, TOP / 2)
```

# --meaning--

- `flags` counts the flagged cells.
- The parentheses make the subtraction happen before the text is joined.
- Left-aligned at x = 10, in the middle of the top strip.

# --meaning-tr--

- `grid.flat().filter((cell) => cell.flagged).length` → bayraklı hücreleri süz, **kaç tane** olduklarına bak.
- `'💣 ' + (MINES - flags)` → yazı ile sayıyı birleştirir: `'💣 7'`. **Parantez** şart: önce çıkarma yapılır; yoksa
  `'💣 10'` yazısına `- flags` eklenmeye çalışılırdı.
- `ctx.textAlign = 'left'` → yazı x = 10'dan başlayıp sağa uzar. `TOP / 2` → üst şeridin ortası (yazının dikey hizası
  zaten `'middle'`).

# --task--

In `draw`, under the cell loop, leave an empty line and write the five lines. Press **Run**.

# --task-tr--

`draw` içinde hücre döngüsünü kapatan `}` satırının altına bir boş satır bırakıp beş satırı yaz. **Çalıştır**: sol
üstte `💣 10` görmelisin; bayrak koydukça azalmalı.

# --tests--

The counter should show the mines left.
tr: Sayaç kalan mayınları göstermeli.

```js
$.tick()
assert.include($.texts(), '💣 10')
toggleFlag(grid[0][0])
toggleFlag(grid[0][1])
toggleFlag(grid[0][2])
$.tick()
assert.include($.texts(), '💣 7')
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '💣 7')
assert.deepEqual(t.args.slice(1), [10, 20])
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
}

function toggleFlag(cell) {
  if (cell.revealed || state === 'lost') return
  cell.flagged = !cell.flagged
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
