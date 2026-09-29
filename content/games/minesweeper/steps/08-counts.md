---
title: Count the mines around
title_tr: Çevredeki mayınları say
skills: [prog.arrays]
---

# --goal--

Each cell counts its mine neighbours once, right after the mines are placed, so the numbers never have to be worked out
again.

# --goal-tr--

Oyunun ipuçları sayılar: her hücre **çevresinde kaç mayın** olduğunu bilmeli. Bu sayıyı mayınlar yerleşir yerleşmez
**bir kez** hesaplayıp hücreye yazarız (`count`); oyun boyunca hazır durur.

# --code--

```js
  Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0 })),

for (const cell of grid.flat()) cell.count = neighbors(cell).filter((n) => n.mine).length
```

# --meaning--

- Every cell starts with `count: 0`.
- For each cell, `filter` keeps the neighbours that are mines, and `.length` is how many there are.

# --meaning-tr--

- `count: 0` → her hücre 0 ile başlar.
- `for (const cell of grid.flat())` → bütün hücreler için:
  - `neighbors(cell).filter((n) => n.mine)` → komşulardan **mayınlı** olanlar.
  - `.length` → kaç tane oldukları. Sonuç `cell.count`'a yazılır.

# --task--

1. In `newGame`, add `count: 0` to the cell object.
2. At the end of `placeMines`, write the counting line. Press **Run**.

# --task-tr--

1. `newGame` içindeki hücre nesnesine `count: 0` ekle.
2. `placeMines`'ın **sonuna**, mayın koyan satırın altına sayma satırını yaz.
3. **Çalıştır**.

# --tests--

Every cell should count the mines around it.
tr: Her hücre çevresindeki mayınları saymalı.

```js
placeMines(grid[8][8])
for (const cell of grid.flat()) {
  assert.strictEqual(cell.count, neighbors(cell).filter((n) => n.mine).length)
}
assert.strictEqual(grid[8][8].count, 0, 'the safe cell has no mines around it')
assert.isTrue(grid.flat().some((c) => c.count > 0))
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

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0 })),
  )
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
