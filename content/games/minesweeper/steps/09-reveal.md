---
title: Open a cell
title_tr: Hücre aç
skills: [game.state]
---

# --goal--

`reveal(cell)` opens a cell. The very first reveal also places the mines around it and starts the game: a `state` goes
from `'ready'` to `'playing'`.

# --goal-tr--

Hücre açmanın kurallarını `reveal` (aç, göster) fonksiyonuna yazacağız. Hücreye yeni bir bilgi: `revealed` (açıldı mı).

Oyunun **aşamasını** da bir değişkende tutacağız: `state`. İlk tıklamadan önce `'ready'` (hazır); ilk açılışta mayınlar
**o hücrenin çevresi hariç** yerleşir ve durum `'playing'` (oynanıyor) olur.

# --code--

```js
let state // 'ready' (before the first click), 'playing', 'won' or 'lost'

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
  )
  state = 'ready'
}

function reveal(start) {
  if (start.revealed) return
  if (state === 'ready') {
    placeMines(start)
    state = 'playing'
  }
  start.revealed = true
}
```

# --meaning--

- Every cell starts with `revealed: false`; every new game starts `'ready'`.
- An open cell cannot be opened again: `return` right away.
- Only the first reveal places mines, around the cell being opened.

# --meaning-tr--

- `revealed: false` → her hücre kapalı başlar.
- `let state` → oyunun aşaması; `newGame` içinde `state = 'ready'`.
- `if (start.revealed) return` → zaten açıksa hiçbir şey yapma.
- `if (state === 'ready') { ... }` → bu **ilk açılışsa**: mayınları bu hücre güvende kalacak şekilde yerleştir ve
  oyunu başlat. Sonraki açılışlarda `state` artık `'playing'` olduğu için mayınlar bir daha yerleşmez.
- `start.revealed = true` → hücreyi aç.

# --task--

1. In `newGame`, add `revealed: false` to the cell, and write `state = 'ready'` at the end.
2. Under `let grid`, write `let state ...`.
3. Under `placeMines`, leave an empty line and write `reveal`. Press **Run**.

# --task-tr--

1. `newGame` içindeki hücre nesnesine `revealed: false` ekle; fonksiyonun sonuna (`)` satırının altına)
   `state = 'ready'` yaz.
2. `let grid` satırının altına yorumuyla birlikte `let state` satırını yaz.
3. `placeMines` fonksiyonunun altına bir boş satır bırakıp `reveal` fonksiyonunu yaz.
4. **Çalıştır**. Açılan hücreyi bir sonraki adımda çizeceğiz.

# --tests--

The first reveal should place the mines and start the game.
tr: İlk açılış mayınları yerleştirmeli ve oyunu başlatmalı.

```js
assert.strictEqual(state, 'ready')
reveal(grid[4][4])
assert.isTrue(grid[4][4].revealed)
assert.strictEqual(state, 'playing')
assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
assert.isFalse(grid[4][4].mine)
```

Later reveals should not place mines again.
tr: Sonraki açılışlar yeniden mayın koymamalı.

```js
reveal(grid[0][0])
const safe = grid.flat().find((c) => !c.mine && !c.revealed)
reveal(safe)
assert.isTrue(safe.revealed)
assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
newGame()
assert.strictEqual(state, 'ready')
assert.isFalse(grid[0][0].revealed)
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
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
