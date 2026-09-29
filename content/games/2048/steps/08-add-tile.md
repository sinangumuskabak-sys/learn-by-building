---
title: A new tile
title_tr: Yeni bir karo
skills: [prog.arrays]
---

# --goal--

`addTile` picks one empty cell at random and puts a `2` there nine times out of ten, a `4` otherwise.

# --goal-tr--

Şimdi yeni karoyu koyan fonksiyon: boş hücrelerden **rastgele birini** seçer ve oraya **on seferde dokuzunda 2**,
kalanında **4** koyar. Tahta doluysa hiçbir şey yapmaz.

# --code--

```js
function addTile() {
  const cells = emptyCells()
  if (cells.length === 0) return
  const [row, col] = cells[Math.floor(Math.random() * cells.length)]
  board[row][col] = Math.random() < 0.9 ? 2 : 4
}
```

# --meaning--

- `Math.floor(Math.random() * cells.length)` is a random position in the list, from 0 to `length - 1`.
- `const [row, col] = ...` takes the pair apart into two names (array destructuring).
- `Math.random() < 0.9` is true 9 times in 10.

# --meaning-tr--

- `if (cells.length === 0) return` → boş hücre yoksa dur.
- `Math.random() * cells.length` → 0 ile liste uzunluğu arasında rastgele bir ondalık sayı; `Math.floor` aşağı
  yuvarlar: 0, 1, ..., `length - 1`. Yani listeden rastgele bir **sıra**.
- `const [row, col] = cells[...]` → seçilen `[2, 3]` gibi çifti **iki ayrı ada** açar: `row` 2, `col` 3. Buna dizi
  **ayrıştırma** (destructuring) denir.
- `Math.random() < 0.9 ? 2 : 4` → `Math.random()` 0.9'dan küçükse (on seferde dokuz) 2, değilse 4.

# --task--

Write `addTile` above `function newGame() {` (under `emptyCells`), with an empty line after it.

# --task-tr--

`emptyCells`'in altına, `function newGame() {` satırının **üstüne** `addTile` fonksiyonunu yaz; altında bir boş satır
kalsın. **Çalıştır**.

# --tests--

`addTile()` should fill empty cells only, with 2 about 90% of the time.
tr: `addTile()` yalnızca boş hücreleri, yaklaşık %90 oranında 2 ile doldurmalı.

```js
let twos = 0
for (let i = 0; i < 1000; i++) {
  board = [[8, 8, 8, 8], [8, 0, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8]]
  addTile()
  assert.notStrictEqual(board[1][1], 0)
  if (board[1][1] === 2) twos++
}
assert.isAbove(twos, 850)
assert.isBelow(twos, 950)
```

A full board should stay as it is.
tr: Dolu bir tahta olduğu gibi kalmalı.

```js
board = [[8, 8, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8]]
addTile()
assert.deepEqual(board.flat(), Array(16).fill(8))
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

let board

function emptyCells() {
  const cells = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) cells.push([row, col])
    }
  }
  return cells
}

function addTile() {
  const cells = emptyCells()
  if (cells.length === 0) return
  const [row, col] = cells[Math.floor(Math.random() * cells.length)]
  board[row][col] = Math.random() < 0.9 ? 2 : 4
}

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  ctx.textBaseline = 'middle'

  ctx.textAlign = 'center'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

newGame()
draw()
```
