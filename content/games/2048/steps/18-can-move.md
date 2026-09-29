---
title: Is there a move left?
title_tr: Hamle kaldı mı?
skills: [prog.loops]
---

# --goal--

The game is not over when the board is full: a full board can still have merges. It is over when there is no empty
cell **and** no two equal tiles side by side or one above the other.

# --goal-tr--

2048 tahta dolunca bitmez; dolu bir tahtada hâlâ birleşme olabilir. Oyun, hiçbir hamle bir şey değiştiremeyince
biter. Bir hamle mümkünse şunlardan biri doğrudur:

- boş bir hücre var, **ya da**
- iki eşit karo yan yana ya da üst üste duruyor.

Her hücrenin yalnız **sağ** ve **alt** komşusuna bakmak yeter: her komşu çifti, birinin "sağı" ya da "altı"dır. Dört
yöne bakmak aynı işi iki kez yapmak olurdu.

# --code--

```js
// Any empty cell, or two equal neighbours (checking right and below covers every pair once).
function canMove() {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      if (value === 0) return true
      if (col < SIZE - 1 && value === board[row][col + 1]) return true
      if (row < SIZE - 1 && value === board[row + 1][col]) return true
    }
  }
  return false
}
```

# --meaning--

- The first empty cell or equal pair found ends the search with `return true`.
- `col < SIZE - 1` makes sure there is a right neighbour before looking at it (the last column has none); the same
  for the row below.
- If the loops finish without finding anything, the player is stuck: `false`.

# --meaning-tr--

- `return true` → bir boşluk ya da eşit çift bulunduğu an fonksiyon biter; gerisine bakmaya gerek yok.
- `col < SIZE - 1 && value === board[row][col + 1]` → sağda komşu **varsa** (son sütunda yok) ve eşitse. `&&`'nin
  solu yanlışsa sağına hiç bakılmaz; böylece tahtanın dışını okumayız.
- `row < SIZE - 1 && value === board[row + 1][col]` → aynısı alttaki komşu için. Son satırda `board[4]` yok; ona
  bakmak hata verirdi.
- Döngüler hiçbir şey bulmadan biterse: `return false`, oyuncu sıkıştı.

# --task--

Write the comment and `canMove` above the comment `// Every direction is ...`, with an empty line after it.

# --task-tr--

`// Every direction is ...` yorum satırının **üstüne** yorum satırını ve `canMove` fonksiyonunu yaz; altında bir boş
satır kalsın. **Çalıştır**.

# --tests--

`canMove()` should look for empty cells and equal neighbours.
tr: `canMove()` boş hücrelere ve eşit komşulara bakmalı.

```js
board = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 0]]
assert.isTrue(canMove(), 'one empty cell')
board = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
assert.isFalse(canMove(), 'full checkerboard: stuck')
board = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 2, 8]]
assert.isTrue(canMove(), 'two 2s side by side')
board = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 8], [4, 2, 4, 8]]
assert.isTrue(canMove(), 'two 8s one above the other')
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
let score

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
  score = 0
  addTile()
  addTile()
}

// Slides one row to the left. Pure: returns a new row and the points gained, and changes nothing else.
function slideRow(row) {
  const tiles = row.filter((value) => value !== 0)
  const result = []
  let gained = 0
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      result.push(tiles[i] * 2)
      gained += tiles[i] * 2
      i++ // the next tile was used up by this merge
    } else {
      result.push(tiles[i])
    }
  }
  while (result.length < SIZE) result.push(0)
  return { row: result, gained }
}

// Any empty cell, or two equal neighbours (checking right and below covers every pair once).
function canMove() {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      if (value === 0) return true
      if (col < SIZE - 1 && value === board[row][col + 1]) return true
      if (row < SIZE - 1 && value === board[row + 1][col]) return true
    }
  }
  return false
}

// Every direction is "slide left" on a row or a column, possibly reversed.
function move(direction) {
  const before = JSON.stringify(board)
  const horizontal = direction === 'left' || direction === 'right'
  const reversed = direction === 'right' || direction === 'down'
  for (let i = 0; i < SIZE; i++) {
    const line = horizontal ? [...board[i]] : board.map((row) => row[i])
    if (reversed) line.reverse()
    const { row, gained } = slideRow(line)
    if (reversed) row.reverse()
    score += gained
    if (horizontal) board[i] = row
    else row.forEach((value, r) => (board[r][i] = value))
  }
  if (JSON.stringify(board) === before) return false
  addTile()
  return true
}

const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

document.addEventListener('keydown', (event) => {
  const direction = directions[event.key]
  if (direction) {
    event.preventDefault()
    move(direction)
  }
  draw()
})

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

  ctx.fillStyle = '#776e65'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Score: ' + score, GAP, TOP / 2)

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
