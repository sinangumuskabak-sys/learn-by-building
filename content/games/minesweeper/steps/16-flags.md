---
title: Flags with the right button
title_tr: Sağ tuşla bayrak
skills: [game.input]
---

# --goal--

Players mark cells they are sure hide a mine with a **flag**, using the right mouse button. A right click fires a
`contextmenu` event; `event.preventDefault()` stops the browser's menu from opening.

# --goal-tr--

Oyuncular altında mayın olduğundan emin oldukları hücreyi **bayrakla** işaretler; bunun için **sağ tuş** kullanılır.
Hücreye yeni bir bilgi: `flagged` (bayraklı mı).

Sağ tıklayınca tarayıcı `'contextmenu'` olayını gönderir ve normalde **kendi menüsünü** açar. Olayı dinleyen fonksiyonda
`event.preventDefault()` çağırırsak bu **varsayılan davranış** durur; sağ tuş artık sadece oyunundur.

# --code--

```js
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false, flagged: false })),

function toggleFlag(cell) {
  if (cell.revealed || state === 'lost') return
  cell.flagged = !cell.flagged
}

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault() // no browser menu: right click places a flag
  const cell = cellAt(event)
  if (cell) toggleFlag(cell)
})
```

# --meaning--

- `cell.flagged = !cell.flagged` flips the flag: `!true` is `false`, `!false` is `true`.
- Open cells and lost games get no flags.
- The listener reuses `cellAt` to find the cell under the pointer.

# --meaning-tr--

- `flagged: false` → her hücre bayraksız başlar.
- `cell.flagged = !cell.flagged` → **aç/kapa** (toggle): `!` tersini alır; bayrak varsa kaldırır, yoksa koyar.
- `if (cell.revealed || state === 'lost') return` → açık hücreye ya da kaybedilmiş oyunda bayrak konmaz.
- `canvas.addEventListener('contextmenu', ...)` → sağ tıklamayı dinler.
- `event.preventDefault()` → tarayıcının menüsü açılmasın.
- `cellAt(event)` → sol tıklamadaki gibi hücreyi bulur; varsa bayrağını değiştir.

# --task--

1. In `newGame`, add `flagged: false` to the cell.
2. Above `function lose()`, write `toggleFlag`.
3. Above `function draw()`, write the `contextmenu` listener. Press **Run**.

# --task-tr--

1. `newGame` içindeki hücre nesnesine `flagged: false` ekle.
2. `function lose() {` satırının **üstüne** `toggleFlag` fonksiyonunu yaz; arada bir boş satır kalsın.
3. `function draw() {` satırının **üstüne** `contextmenu` dinleyicisini yaz; arada bir boş satır kalsın.
4. **Çalıştır**. Bayrağı bir sonraki adımlarda çizeceğiz; kontroller onu okuyor.

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

Open cells should not take a flag.
tr: Açık hücreye bayrak konmamalı.

```js
reveal(grid[4][4])
toggleFlag(grid[4][4])
assert.isFalse(grid[4][4].flagged)
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
  if (start.revealed) return
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
    if (cell.revealed) continue
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
