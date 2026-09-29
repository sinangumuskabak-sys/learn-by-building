---
title: Winning
title_tr: Kazanmak
skills: [game.state]
---

# --goal--

You win when every cell **without** a mine is open; flags do not count. The check runs after every reveal. On a win,
the remaining mines are flagged automatically to show the solved board.

# --goal-tr--

Ne zaman kazanırsın? **Mayınsız bütün hücreler** açıldığında. Bayraklar önemli değil: hiç bayrak koymadan her şeyi açan
oyuncu da kazanmıştır.

Bunu her açılıştan sonra kontrol edeceğiz. Kazanınca kalan mayınlara otomatik bayrak koymak, çözülmüş tahtayı güzelce
gösterir. Kazandıktan sonra da (kaybettikten sonraki gibi) tıklama ve bayrak işe yaramamalı.

# --code--

```js
  if (grid.flat().every((cell) => cell.mine || cell.revealed)) win()
}

function win() {
  state = 'won'
  for (const cell of grid.flat()) if (cell.mine) cell.flagged = true
}

  if (cell.revealed || state === 'won' || state === 'lost') return

  if (state === 'won' || state === 'lost') return
```

# --meaning--

- `every` is `true` when the test holds for every cell: each is either a mine or open.
- `win` sets `'won'` and flags every mine.
- `toggleFlag` and the click listener now also stop after a win.

# --meaning-tr--

- `grid.flat().every((cell) => cell.mine || cell.revealed)` → `every` "**her** hücre bu koşulu sağlıyor mu?" diye
  sorar: hücre ya mayınlı ya da açık. Hepsi öyleyse `win()`.
- Bu satır `reveal`'ın **en sonuna**, dolgudan sonra gelir.
- `function win()` → `state = 'won'` ve bütün mayınlara bayrak.
- `toggleFlag` ve tıklama dinleyicisindeki koşullara `state === 'won' ||` ekleniyor: oyun bitti, ister kazan ister kaybet.

# --task--

1. At the end of `reveal`, write the `every` line.
2. Above `function cellAt`, write `win`.
3. Add `state === 'won' ||` to the checks in `toggleFlag` and in the click listener. Press **Run**.

# --task-tr--

1. `reveal`'ın en sonuna, dolgunun `while` bloğunu kapatan `}` satırının altına `every` satırını yaz.
2. `function cellAt(event) {` satırının **üstüne** `win` fonksiyonunu yaz; arada bir boş satır kalsın.
3. `toggleFlag`'in ilk satırını `if (cell.revealed || state === 'won' || state === 'lost') return` yap.
4. Tıklama dinleyicisinin ilk satırını `if (state === 'won' || state === 'lost') return` yap.
5. **Çalıştır**.

# --tests--

Opening every safe cell should win, even without flags.
tr: Her güvenli hücreyi açmak bayraksız bile kazandırmalı.

```js
reveal(grid[4][4])
assert.strictEqual(state, 'playing')
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
assert.strictEqual(state, 'won')
assert.isTrue(grid.flat().filter((c) => c.mine).every((c) => c.flagged), 'the mines get flags')
```

After a win, clicks and flags should change nothing.
tr: Kazandıktan sonra tıklama ve bayrak hiçbir şey değiştirmemeli.

```js
reveal(grid[4][4])
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
const mine = grid.flat().find((c) => c.mine)
toggleFlag(mine)
assert.isTrue(mine.flagged)
$.click(mine.col * 40 + 20, 40 + mine.row * 40 + 20)
assert.isFalse(mine.revealed)
assert.strictEqual(state, 'won')
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
  if (state === 'won' || state === 'lost') return
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
