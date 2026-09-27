---
title: Flags with the right button
title_tr: Sağ tuşla bayraklar
skills: [game.input]
---

# --explanation--

Players mark cells they are sure hide a mine with a **flag**, using the right mouse button. A right click fires a
`contextmenu` event, and by default the browser opens its menu. Calling `event.preventDefault()` in the handler stops
that, so the game gets the right button to itself.

A flag protects its cell: a flagged cell cannot be opened by a click, and the flood fill steps around it. This is a
small safety feature with a big effect on how the game feels. One misclick near the end would otherwise ruin a long
game.

The counter at the top shows `MINES - flags`: how many mines are left **if** all the flags are right. It can even go
negative if the player over-flags, which is itself a useful hint. The count is not stored anywhere: it is computed from
the grid each time it is drawn, so it can never be out of date.

# --explanation-tr--

Oyuncular altında mayın olduğundan emin oldukları hücreleri farenin sağ tuşuyla bir **bayrakla** işaretler. Sağ
tıklama bir `contextmenu` olayı üretir ve tarayıcı varsayılan olarak menüsünü açar. İşleyicide
`event.preventDefault()` çağırmak bunu durdurur; böylece sağ tuş tamamen oyunun olur.

Bayrak hücresini korur: bayraklı bir hücre tıklamayla açılamaz ve taşma dolgusu onun etrafından dolanır. Oyunun
hissi üzerinde büyük etkisi olan küçük bir güvenlik özelliği. Yoksa sona yakın tek bir yanlış tıklama uzun bir oyunu
mahvederdi.

Tepedeki sayaç `MINES - flags`'i gösterir: bütün bayraklar doğruysa kaç mayın kaldığını. Oyuncu fazla bayrak koyarsa
eksiye bile düşebilir; bu da kendi başına yararlı bir ipucudur. Sayı hiçbir yerde saklanmaz: her çizildiğinde ızgaradan
hesaplanır, bu yüzden asla güncelliğini yitiremez.

# --task--

1. Give every cell `flagged: false`. Write `toggleFlag(cell)` that flips `flagged` on hidden cells (not when lost).
2. On `contextmenu`, call `event.preventDefault()` and toggle the flag on the cell under the pointer.
3. `reveal()` and the flood fill should skip flagged cells.
4. Draw a `🚩` on flagged hidden cells, and `💣 7` (mines minus flags) at the top left in white `'bold 18px monospace'`.

# --task-tr--

1. Her hücreye `flagged: false` ver. Kapalı hücrelerde (kaybedilmediyse) `flagged`'i tersine çeviren
   `toggleFlag(cell)` yaz.
2. `contextmenu`'da `event.preventDefault()` çağır ve işaretçinin altındaki hücrenin bayrağını değiştir.
3. `reveal()` ve taşma dolgusu bayraklı hücreleri atlamalı.
4. Bayraklı kapalı hücrelere `🚩`, sol üste de beyaz `'bold 18px monospace'` ile `💣 7` (mayınlar eksi bayraklar) çiz.

# --tests--

A right click should place and remove a flag, without opening the menu.
tr: Sağ tıklama menüyü açmadan bayrak koymalı ve kaldırmalı.

```js
let prevented = false
$.canvas.addEventListener('contextmenu', (event) => {
  prevented = event.defaultPrevented
})
$.rightClick(20, 60)
assert.isTrue(grid[0][0].flagged)
assert.isTrue(prevented, 'call event.preventDefault() so the browser menu stays closed')
$.rightClick(20, 60)
assert.isFalse(grid[0][0].flagged)
```

A flagged cell should not open, even during a flood fill.
tr: Bayraklı bir hücre, taşma dolgusu sırasında bile açılmamalı.

```js
toggleFlag(grid[4][5])
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
assert.isTrue(grid[4][4].revealed)
assert.isFalse(grid[4][5].revealed)
$.click(5 * 40 + 20, 40 + 4 * 40 + 20)
assert.isFalse(grid[4][5].revealed, 'clicking a flag does nothing')
```

The counter should show the mines left.
tr: Sayaç kalan mayınları göstermeli.

```js
toggleFlag(grid[0][0])
toggleFlag(grid[0][1])
toggleFlag(grid[0][2])
$.tick()
assert.include($.texts(), '💣 7')
assert.lengthOf($.texts().filter((t) => t === '🚩'), 3)
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
let state // 'ready' (before the first click), 'playing' or 'lost'

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

  if (state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f87171'
    ctx.fillText('Boom!', canvas.width / 2, TOP / 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
