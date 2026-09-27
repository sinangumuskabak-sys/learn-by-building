---
title: Mines and neighbour counts
title_tr: Mayınlar ve komşu sayıları
skills: [prog.loops, prog.arrays]
---

# --explanation--

Almost every question in Minesweeper is about a cell's **neighbours**: the up to eight cells around it. Get them with
two small loops over the offsets `-1, 0, 1`, skipping `(0, 0)` (the cell itself) and anything off the board:

```js
for (let dr = -1; dr <= 1; dr++) {
  for (let dc = -1; dc <= 1; dc++) {
    if (dr === 0 && dc === 0) continue
    const row = cell.row + dr
    const col = cell.col + dc
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
  }
}
```

The bounds check is what makes corner cells have 3 neighbours and edge cells 5. Forgetting it is the classic grid bug:
reading `grid[-1]` gives `undefined`, and the next line crashes.

Now the mines. A player hates losing on the very first click, so the real game places mines **after** it, and never on
the clicked cell or next to it. That way the first click always opens an area. `placeMines(safe)` does exactly that:
take every cell except the safe ones, shuffle them (Fisher–Yates), and put mines on the first ten. Then each cell counts
its mine neighbours once, up front, so the numbers never have to be recomputed.

# --explanation-tr--

Mayın Tarlası'ndaki neredeyse her soru bir hücrenin **komşularıyla** ilgili: çevresindeki en fazla sekiz hücre. Onları
`-1, 0, 1` kaydırmaları üzerinde iki küçük döngüyle al; `(0, 0)`'ı (hücrenin kendisi) ve tahtanın dışındaki her şeyi
atla:

```js
for (let dr = -1; dr <= 1; dr++) {
  for (let dc = -1; dc <= 1; dc++) {
    if (dr === 0 && dc === 0) continue
    const row = cell.row + dr
    const col = cell.col + dc
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
  }
}
```

Köşe hücrelerinin 3, kenar hücrelerinin 5 komşusu olmasını sağlayan sınır kontrolüdür. Onu unutmak klasik ızgara
hatasıdır: `grid[-1]`'i okumak `undefined` verir ve bir sonraki satır çöker.

Şimdi mayınlar. Oyuncu ilk tıklamada kaybetmekten nefret eder; bu yüzden gerçek oyun mayınları ilk tıklamadan **sonra**
koyar, asla tıklanan hücreye ya da yanına değil. Böylece ilk tıklama her zaman bir alan açar. `placeMines(safe)` tam
olarak bunu yapar: güvenli olanlar dışındaki her hücreyi al, karıştır (Fisher–Yates) ve ilk ona mayın koy. Sonra her
hücre mayınlı komşularını baştan bir kez sayar; böylece sayıların yeniden hesaplanmasına hiç gerek kalmaz.

# --task--

1. Add `MINES = 10`, and give every cell `mine: false, count: 0, revealed: false`.
2. Write `function neighbors(cell)` returning the up to 8 cells around `cell`.
3. Write `function placeMines(safe)`: leave out `safe` and its neighbours, shuffle the other cells, set `mine = true`
   on the first `MINES` of them, then set every cell's `count` to the number of its neighbours that are mines.

# --task-tr--

1. `MINES = 10` ekle ve her hücreye `mine: false, count: 0, revealed: false` ver.
2. `cell`'in çevresindeki en fazla 8 hücreyi döndüren `function neighbors(cell)` yaz.
3. `function placeMines(safe)` yaz: `safe`'i ve komşularını dışarıda bırak, diğer hücreleri karıştır, ilk `MINES`
   tanesinde `mine = true` yap, sonra her hücrenin `count`'unu mayın olan komşularının sayısı yap.

# --tests--

Corner, edge and middle cells should have 3, 5 and 8 neighbours.
tr: Köşe, kenar ve ortadaki hücrelerin 3, 5 ve 8 komşusu olmalı.

```js
assert.lengthOf(neighbors(grid[0][0]), 3)
assert.lengthOf(neighbors(grid[0][4]), 5)
assert.lengthOf(neighbors(grid[4][4]), 8)
assert.sameMembers(neighbors(grid[0][0]), [grid[0][1], grid[1][0], grid[1][1]])
assert.notInclude(neighbors(grid[4][4]), grid[4][4])
```

There should be exactly 10 mines, never on or next to the safe cell.
tr: Tam 10 mayın olmalı; asla güvenli hücrenin üstünde ya da yanında değil.

```js
for (let i = 0; i < 50; i++) {
  newGame()
  const safe = grid[i % 9][(i * 4) % 9]
  placeMines(safe)
  assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
  assert.isFalse(safe.mine)
  assert.isTrue(neighbors(safe).every((c) => !c.mine))
}
```

Every cell should count the mines around it.
tr: Her hücre çevresindeki mayınları saymalı.

```js
placeMines(grid[8][8])
for (const cell of grid.flat()) {
  assert.strictEqual(cell.count, neighbors(cell).filter((n) => n.mine).length)
}
assert.strictEqual(grid[8][8].count, 0)
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
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
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

  ctx.fillStyle = '#94a3b8'
  for (const cell of grid.flat()) {
    ctx.fillRect(cell.col * CELL + 1, TOP + cell.row * CELL + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
