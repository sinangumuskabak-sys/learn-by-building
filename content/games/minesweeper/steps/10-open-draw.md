---
title: Open cells look different
title_tr: Açık hücre farklı görünür
skills: [game.canvas]
---

# --goal--

An open cell is drawn light grey, a hidden one stays darker grey.

# --goal-tr--

Açılan hücre **görünmeli**: açık hücreler açık gri, kapalılar eskisi gibi koyu gri olacak.

# --code--

```js
if (cell.revealed) {
  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
} else {
  ctx.fillStyle = '#94a3b8'
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
}
```

# --meaning--

- `if ... else` draws one of two squares: light for an open cell, the old grey otherwise.

# --meaning-tr--

- `if (cell.revealed) { ... } else { ... }` → hücre açıksa ilk blok (açık gri `'#e2e8f0'`), **değilse** ikinci blok
  (eski koyu gri). İki blokta da kare aynı yere çizilir; sadece renk değişir. Sonraki adımlarda iki bloğa da yeni
  şeyler ekleyeceğiz.

# --task--

In `draw`, inside the `for` loop, wrap the two square lines in `if (cell.revealed) { ... } else { ... }` as shown.

# --task-tr--

`draw` içindeki `for` döngüsünde, kareyi çizen iki satırı kod bloğundaki `if ... else` ile değiştir: açık hücre için
`'#e2e8f0'`, kapalı için eski iki satır. **Çalıştır**. Tıklamayı birazdan bağlayacağız; kontroller hücreyi kendileri
açıyor.

# --tests--

An open cell should be drawn light grey.
tr: Açık hücre açık gri çizilmeli.

```js
reveal(grid[4][4])
$.tick()
assert.deepInclude($.rects('#e2e8f0'), { x: 161, y: 201, w: 38, h: 38, color: '#e2e8f0' })
assert.lengthOf($.rects('#94a3b8'), 80)
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

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    if (cell.revealed) {
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
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
