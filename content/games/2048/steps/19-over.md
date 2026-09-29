---
title: Game over
title_tr: Oyun bitti
skills: [game.state]
---

# --goal--

A `state` variable says whether the game is `'playing'` or `'over'`. After a move, if no move is left, it is over, and
`move` does nothing any more.

# --goal-tr--

Oyunun **durumunu** bir değişkende tutacağız: `state`. Oyun sürerken `'playing'`; hiç hamle kalmayınca `'over'`
(bitti). Oyun bitince `move` artık hiçbir şey yapmayacak.

# --code--

```js
let state // 'playing', 'won' or 'over'

  state = 'playing'

function move(direction) {
  if (state !== 'playing') return false

  addTile()
  if (!canMove()) state = 'over'
  return true
}
```

# --meaning--

- A new game is `'playing'`. `move` stops at once unless the game is playing.
- After the new tile, `!canMove()` means stuck: the state becomes `'over'`.

# --meaning-tr--

- `let state` → oyunun durumu. Yorumda üç durum yazıyor; `'won'` (kazandı) bir sonraki adımda gelecek.
- `newGame` içinde `state = 'playing'`.
- `if (state !== 'playing') return false` → oyun sürmüyorsa hamle yok.
- `if (!canMove()) state = 'over'` → yeni karo **eklendikten sonra** bak: hamle kalmadıysa oyun bitti. (`!`
  "değil".) Kontrol karodan sonra olmalı; tahtayı son karo doldurur.

# --task--

1. Under `let score` write `let state`; in `newGame`, under `score = 0`, write `state = 'playing'`.
2. Write the guard as the first line of `move`.
3. In `move`, under `addTile()`, write the `canMove` line.

# --task-tr--

1. `let score` satırının altına `let state ...` yaz; `newGame` içinde `score = 0` satırının altına
   `state = 'playing'` yaz.
2. `move`'un **ilk satırı** olarak `if (state !== 'playing') return false` yaz.
3. `move` içinde `addTile()` satırının altına `if (!canMove()) state = 'over'` yaz.
4. **Çalıştır**. Bitişi görmek zor; kontroller onu senin yerine dener.

# --tests--

A move that leaves no moves should end the game.
tr: Hiç hamle bırakmayan bir hamle oyunu bitirmeli.

```js
assert.strictEqual(state, 'playing')
Math.random = () => 0 // the new tile is a 2 in the first empty cell
board = [[4, 2, 4, 0], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
move('right') // the top row becomes [0, 4, 2, 4], then a 2 fills the gap: a stuck checkerboard
assert.strictEqual(state, 'over')
```

After the game is over, moves should do nothing.
tr: Oyun bittikten sonra hamleler hiçbir şey yapmamalı.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
state = 'over'
assert.isFalse(move('left'))
assert.deepEqual(board[0], [2, 2, 0, 0])
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
let state // 'playing', 'won' or 'over'

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
  state = 'playing'
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
  if (state !== 'playing') return false
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
  if (!canMove()) state = 'over'
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
