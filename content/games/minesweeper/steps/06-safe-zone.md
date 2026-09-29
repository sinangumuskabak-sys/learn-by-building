---
title: Mines, but not under the first click
title_tr: Mayınlar, ama ilk tıklamanın altına değil
skills: [prog.arrays]
---

# --goal--

Nobody likes losing on the very first click, so the real game places the mines **after** it, never on the clicked cell
or next to it. `placeMines(safe)` leaves those cells out and puts mines on the others.

# --goal-tr--

Kimse **ilk tıklamada** patlamayı sevmez. Gerçek oyun bu yüzden mayınları ilk tıklamadan **sonra** koyar: tıklanan
hücreye ve komşularına asla koymaz. Böylece ilk tıklama hep biraz alan açar.

Her hücreye yeni bir bilgi ekliyoruz: `mine` (mayın var mı). `placeMines(safe)` yasak hücreleri ayırıp kalanlara 10
mayın koyacak. Bu adımda mayınları henüz **sırayla** koyuyoruz; bir sonraki adımda karıştıracağız.

# --code--

```js
const MINES = 10

    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false })),

// Mines are placed on the first click, never on or next to the clicked cell, so the first click always opens space.
function placeMines(safe) {
  const forbidden = new Set([safe, ...neighbors(safe)])
  const candidates = grid.flat().filter((cell) => !forbidden.has(cell))
  for (const cell of candidates.slice(0, MINES)) cell.mine = true
}
```

# --meaning--

- Every cell starts with `mine: false`.
- `forbidden` is a `Set` of the safe cell and its neighbours; `...` spreads the neighbours list into the array.
- `filter` keeps only the cells that are not forbidden.
- `slice(0, MINES)` takes the first 10 of them, and each gets a mine.

# --meaning-tr--

- `mine: false` → her hücre mayınsız başlar. `true`/`false` → "evet"/"hayır" (**mantıksal değer**, boolean).
- `new Set([safe, ...neighbors(safe)])` → yasak hücrelerin **kümesi**. `Set` (küme) "içinde var mı?" sorusunu
  (`forbidden.has(cell)`) hızla cevaplar. `...` (yayma) komşu listesinin elemanlarını tek tek buraya döker: küme =
  güvenli hücre + komşuları.
- `grid.flat().filter((cell) => !forbidden.has(cell))` → `filter` listeden koşulu sağlayanları **tutar**. `!` "değil":
  yasak **olmayan** hücreler aday olur.
- `candidates.slice(0, MINES)` → listenin **ilk 10** elemanı (0'dan başlayıp 10'a kadar, 10 hariç).
- `cell.mine = true` → bu hücreye mayın koy. Tek komutlu `for` süslü parantezsiz yazılabilir.

# --task--

1. Under the `TOP` line, write `const MINES = 10`.
2. In `newGame`, add `mine: false` to the cell object.
3. Under `neighbors`, leave an empty line and write the comment and `placeMines`. Press **Run**.

# --task-tr--

1. `TOP` satırının altına `const MINES = 10` yaz.
2. `newGame` içindeki hücre nesnesine `mine: false` ekle: `({ row, col, mine: false })`.
3. `neighbors` fonksiyonunun altına bir boş satır bırakıp yorum satırını ve `placeMines`'ı yaz.
4. **Çalıştır**. Mayınlar gizli; kontroller onları sayıyor.

# --tests--

There should be exactly 10 mines, never on or next to the safe cell.
tr: Tam 10 mayın olmalı; asla güvenli hücrenin üstünde ya da yanında değil.

```js
assert.isTrue(grid.flat().every((c) => c.mine === false), 'no mines before placeMines')
for (let i = 0; i < 20; i++) {
  newGame()
  const safe = grid[i % 9][(i * 4) % 9]
  placeMines(safe)
  assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
  assert.isFalse(safe.mine)
  assert.isTrue(neighbors(safe).every((c) => !c.mine))
}
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
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false })),
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
  for (const cell of candidates.slice(0, MINES)) cell.mine = true
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
