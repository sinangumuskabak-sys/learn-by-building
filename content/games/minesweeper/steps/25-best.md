---
title: The best time
title_tr: En iyi süre
skills: [game.state]
---

# --goal--

The best (lowest) time is saved in `localStorage`. Two traps: "best" means smaller, so the comparison is `<`; and "no
best yet" must be `null`, not `0`, because a very fast win really can take 0 whole seconds.

# --goal-tr--

Son dokunuş: **en iyi süre** (rekor). Tarayıcının küçük not defterine, `localStorage`'a yazacağız; sayfa kapansa da
kalır. Kazanınca mesajda görünecek: `You win! Best: 12s`.

İki tuzak var:
- "En iyi" demek **daha küçük** süre demek; karşılaştırma `<` ile.
- "Henüz rekor yok" için `0` kullanılamaz: şimşek hızında bir galibiyet gerçekten 0 saniye sürebilir; o zaman "rekor
  yok" gibi görünür ve daha yavaş bir süre onun üstüne yazılırdı. "Hiçbir şey" için `null` kullanırız.

# --code--

```js
// null means "no best time yet"; 0 would be a real (very fast) time.
const saved = localStorage.getItem('mines-best')
let best = saved === null ? null : Number(saved)

  const seconds = Math.floor((endTime - startTime) / 1000)
  if (best === null || seconds < best) {
    best = seconds
    localStorage.setItem('mines-best', best)
  }

    ctx.fillText(state === 'won' ? 'You win! Best: ' + best + 's' : 'Boom! Click to retry', canvas.width / 2, TOP / 2)
```

# --meaning--

- `localStorage.getItem` gives the saved text, or `null` if nothing was ever saved. Text becomes a number with
  `Number(...)`.
- On a win, the seconds become the new best when there is no best yet or they are fewer.
- The win message shows the best.

# --meaning-tr--

- `localStorage.getItem('mines-best')` → defterden okur; hiç yazılmamışsa `null` ("hiçbir şey") verir.
- `saved === null ? null : Number(saved)` → kayıt yoksa `null`, varsa yazıyı sayıya çevir (defter her şeyi yazı
  olarak saklar).
- `win` içinde: `seconds` → oyunun süresi. `best === null || seconds < best` → "rekor yok **veya** daha hızlı".
  Açıkça `=== null` diye soruyoruz; `!best` yazsaydık 0 da "yok" sayılırdı.
- `localStorage.setItem('mines-best', best)` → deftere yaz.
- Mesaj: `'You win! Best: ' + best + 's'` → `'You win! Best: 12s'`.

# --task--

1. Under `let now = 0`, write the comment, `saved` and `best`.
2. At the end of `win`, write the `seconds` line and the `if` block.
3. In `draw`, change `'You win!'` to `'You win! Best: ' + best + 's'`. Press **Run**.

# --task-tr--

1. `let now = 0` satırının altına yorum satırını, `saved` ve `best` satırlarını yaz.
2. `win`'in sonuna `seconds` satırını ve `if (best === null || ...) { ... }` bloğunu yaz.
3. `draw`'daki mesajda `'You win!'` yerine `'You win! Best: ' + best + 's'` yaz.
4. **Çalıştır** ve kazanmaya çalış. Oyun bitti!

# --tests--

A win should save the time as the best.
tr: Galibiyet süreyi rekor olarak kaydetmeli.

```js
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
  $.run(5.2)
  for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
  assert.strictEqual(best, 5)
  assert.strictEqual(localStorage.getItem('mines-best'), '5')
  $.tick()
  assert.include($.texts(), 'You win! Best: 5s')
```

A win in under a second is a real best of 0, not "no best".
tr: Bir saniyeden kısa galibiyet "rekor yok" değil, gerçek bir 0 rekorudur.

```js
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
  for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
  assert.strictEqual(best, 0)
  $.click(20, 60)
  $.click(4 * 40 + 20, 40 + 4 * 40 + 20)
  $.run(4)
  for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
  assert.strictEqual(best, 0, 'a slower win must not replace a best of 0')
```

A slower win should not replace a faster best.
tr: Daha yavaş galibiyet daha hızlı rekorun yerini almamalı.

```js
best = 3
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
$.run(10)
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
assert.strictEqual(best, 3)
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
let endTime
let now = 0
// null means "no best time yet"; 0 would be a real (very fast) time.
const saved = localStorage.getItem('mines-best')
let best = saved === null ? null : Number(saved)

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false, flagged: false })),
  )
  state = 'ready'
  startTime = 0
  endTime = 0
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
  endTime = now
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
}

function win() {
  state = 'won'
  endTime = now
  for (const cell of grid.flat()) if (cell.mine) cell.flagged = true
  const seconds = Math.floor((endTime - startTime) / 1000)
  if (best === null || seconds < best) {
    best = seconds
    localStorage.setItem('mines-best', best)
  }
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
  const seconds = state === 'ready' ? 0 : Math.floor(((state === 'playing' ? now : endTime) - startTime) / 1000)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('💣 ' + (MINES - flags), 10, TOP / 2)
  ctx.textAlign = 'right'
  ctx.fillText('⏱ ' + seconds, canvas.width - 10, TOP / 2)

  if (state === 'won' || state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = state === 'won' ? '#4ade80' : '#f87171'
    ctx.fillText(state === 'won' ? 'You win! Best: ' + best + 's' : 'Boom! Click to retry', canvas.width / 2, TOP / 2)
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
