---
title: Find the empty cells
title_tr: Boş hücreleri bul
skills: [prog.arrays, prog.loops]
---

# --goal--

New tiles appear in random **empty** cells. First we collect all of them as `[row, col]` pairs.

# --goal-tr--

Her hamleden sonra rastgele bir **boş** hücrede yeni bir karo çıkar. Önce bütün boş hücreleri bir listeye
toplayacağız; sonra o listeden birini seçeceğiz.

Bu, "boş olana denk gelene kadar rastgele hücre dene" yönteminden çok daha iyidir: o yöntem tahta doldukça yavaşlar,
tahta tamamen doluysa **hiç bitmez**.

# --code--

```js
function emptyCells() {
  const cells = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) cells.push([row, col])
    }
  }
  return cells
}
```

# --meaning--

- The loops visit all 16 cells; each empty one is pushed as a small array `[row, col]`.
- The result is a list of pairs, like `[[1, 1], [3, 3]]`.

# --meaning-tr--

- `const cells = []` → boş bir liste.
- İki döngü 16 hücreyi gezer; `board[row][col] === 0` ise hücrenin yerini `[row, col]` diye iki sayılık küçük bir
  dizi olarak listeye ekler (`push`).
- `return cells` → sonuç bir **çiftler listesi**: `[[1, 1], [3, 3]]` gibi.

# --task--

Write `emptyCells` above `function newGame() {`, with an empty line after it.

# --task-tr--

`function newGame() {` satırının **üstüne** `emptyCells` fonksiyonunu yaz; altında bir boş satır kalsın.
**Çalıştır**: ekran değişmez.

# --tests--

`emptyCells()` should list the empty cells as [row, col].
tr: `emptyCells()` boş hücreleri [row, col] olarak listelemeli.

```js
board = [[2, 2, 2, 2], [2, 0, 2, 2], [2, 2, 2, 2], [2, 2, 2, 0]]
assert.sameDeepMembers(emptyCells(), [[1, 1], [3, 3]])
board = [[2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2]]
assert.deepEqual(emptyCells(), [])
newGame()
assert.lengthOf(emptyCells(), 16)
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
