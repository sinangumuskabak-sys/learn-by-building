---
title: Shuffle the candidates
title_tr: Adayları karıştır
skills: [prog.loops, prog.arrays]
---

# --goal--

Right now the mines always fill the first rows. Shuffling the candidates first (the Fisher–Yates shuffle) makes every
layout equally likely.

# --goal-tr--

Şu an mayınlar hep **ilk satırlara** diziliyor; oyun hep aynı. Adayları önce **karıştırırsak** ilk 10 aday rastgele
olur.

Karıştırmanın doğru ve hızlı bir yolu var: **Fisher–Yates**. Listenin sonundan başa doğru gel; her elemanı, kendisi
dahil **önündeki** rastgele bir elemanla yer değiştir. Bir deste kartı sondan başa doğru tek tek karıştırmak gibi.

# --code--

```js
for (let i = candidates.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
}
```

# --meaning--

- The loop counts down from the last index to 1 (`i--`).
- `Math.random()` is a number from 0 up to 1; times `i + 1`, rounded down, it is a whole number from 0 to `i`.
- `[a, b] = [b, a]` swaps two items. The `;` in front stops the line from joining the one above.

# --meaning-tr--

- `for (let i = candidates.length - 1; i > 0; i--)` → sondan başa sayan döngü: `i--` her turda 1 **azaltır**.
- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı.
- `Math.floor(Math.random() * (i + 1))` → `i + 1` ile çarpıp **aşağı yuvarla**: 0 ile `i` arasında rastgele tam sayı.
- `[candidates[i], candidates[j]] = [candidates[j], candidates[i]]` → iki elemanın **yerini değiştirir** (sağdaki
  iki değer sırayla soldaki iki yere yazılır).
- Baştaki `;` → satır `[` ile başladığı için şart: yoksa JavaScript onu bir önceki satıra yapıştırmaya çalışır.
- Her diziliş eşit ihtimalle çıkar; `slice(0, MINES)` artık rastgele 10 hücre seçer.

# --task--

In `placeMines`, under the `candidates` line, write the loop. Press **Run**.

# --task-tr--

`placeMines` içinde `const candidates = ...` satırının altına döngüyü yaz (mayın koyan `for` satırının üstüne).
**Çalıştır**.

# --tests--

Mines should be placed at random, not always on the first rows.
tr: Mayınlar rastgele yerleşmeli, hep ilk satırlara değil.

```js
const layouts = new Set()
let lowRows = 0
for (let i = 0; i < 20; i++) {
  newGame()
  placeMines(grid[8][8])
  const mines = grid.flat().filter((c) => c.mine)
  assert.lengthOf(mines, 10)
  layouts.add(mines.map((c) => c.row + ',' + c.col).join(' '))
  lowRows += mines.filter((c) => c.row >= 4).length
}
assert.isAbove(layouts.size, 15, 'a different layout almost every game')
assert.isAbove(lowRows, 20, 'mines also land on the lower rows')
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
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
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
