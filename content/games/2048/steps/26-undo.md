---
title: "Build it yourself: undo"
title_tr: "Kendin yap: geri al"
skills: [game.state, prog.arrays]
---

# --goal--

Everyone makes a bad move sometimes. Add an undo: the U key takes the last move back, board and score, once.

# --goal-tr--

Herkes bazen kötü bir hamle yapar. Bir **geri al** ekle: **U** tuşu son hamleyi geri alsın; tahta ve skor hamleden
önceki hâline dönsün. Yalnız **bir** hamle geri alınabilsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `move`'da hamleden önceki hâli zaten `before` olarak tutuyorsun.
Kontroller çalıştığında yeşile döner.

# --task--

Keep a copy of the board and the score before each real move. The U key (small or capital) restores them once;
a second U does nothing until the next move. Undo also brings a finished game back to playing.

# --task-tr--

- Her **gerçek** hamleden önce tahtanın ve skorun bir **kopyasını** sakla. Hiçbir şeyi değiştirmeyen bir hamle eski
  kopyayı silmesin.
- **U** (küçük ya da büyük) tahtayı ve skoru o kopyaya döndürsün; ikinci bir U, yeni bir hamle yapılana kadar hiçbir
  şey yapmasın.
- Oyun bitmiş (`'over'`) olsa bile U son hamleyi geri alıp oyunu sürdürsün.
- Yeni oyunda geri alınacak bir şey olmasın.

Dikkat: kopya gerçekten kopya olmalı; tahtanın kendisini saklarsan hamle onu da değiştirir. Takılırsan Maymun'a sor ya
da ipucu kutusuna bak.

# --hint--

In `move`, after the "nothing changed" check, save `{ board: JSON.parse(before), score }` from before the move
(keep the old score in a variable at the top). `JSON.parse` turns the saved text back into a brand new board.

# --hint-tr--

`move`'un başında eski skoru bir değişkende tut. "Hiçbir şey değişmedi" kontrolünden **sonra** hamle öncesini sakla:
`{ board: JSON.parse(before), score: eskiSkor }`. `JSON.parse`, `before` yazısını yepyeni bir tahtaya geri çevirir;
böylece gerçek bir kopya olur. U'ya basınca saklananı geri koy, `state`'i `'playing'` yap ve kopyayı `null` yap ki
ikinci U bir şey yapmasın. `newGame`'de de kopyayı sil.

# --tests--

U should take the last move back, board and score.
tr: U son hamleyi, tahtayı ve skoru geri almalı.

```js
board = [[2, 2, 0, 0], [0, 4, 0, 4], [0, 0, 0, 0], [0, 0, 0, 0]]
score = 20
$.press('ArrowLeft')
assert.strictEqual(score, 32)
$.press('u')
assert.deepEqual(board, [[2, 2, 0, 0], [0, 4, 0, 4], [0, 0, 0, 0], [0, 0, 0, 0]])
assert.strictEqual(score, 20)
assert.include($.texts(), 'Score: 20')
```

Only one move can be taken back, and nothing at the start.
tr: Yalnız bir hamle geri alınabilmeli; başta hiçbir şey.

```js
const start = JSON.stringify(board)
$.press('U')
assert.strictEqual(JSON.stringify(board), start, 'nothing to undo at the start')
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.press('ArrowLeft')
const afterOne = JSON.stringify(board)
$.press('ArrowDown')
$.press('u')
assert.strictEqual(JSON.stringify(board), afterOne)
$.press('u')
assert.strictEqual(JSON.stringify(board), afterOne, 'a second U does nothing')
```

A move that changes nothing should not replace the saved copy.
tr: Hiçbir şeyi değiştirmeyen bir hamle saklanan kopyayı değiştirmemeli.

```js
Math.random = () => 0 // the new tile is a 2 in the first empty cell
board = [[0, 0, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.press('ArrowLeft')
assert.deepEqual(board[0], [4, 2, 0, 0])
$.press('ArrowLeft')
assert.deepEqual(board[0], [4, 2, 0, 0], 'nothing could move')
$.press('u')
assert.deepEqual(board[0], [0, 0, 2, 2])
```

Undo should bring a finished game back.
tr: Geri al, bitmiş bir oyunu geri getirmeli.

```js
Math.random = () => 0
board = [[4, 2, 4, 0], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
move('right')
assert.strictEqual(state, 'over')
$.press('u')
assert.strictEqual(state, 'playing')
assert.deepEqual(board[0], [4, 2, 4, 0])
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
let keepPlaying // true once the player chose to continue after making 2048
let best = Number(localStorage.getItem('2048-best')) || 0
let undo = null // { board, score } before the last move

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
  keepPlaying = false
  undo = null
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
  const scoreBefore = score
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
  undo = { board: JSON.parse(before), score: scoreBefore }
  addTile()
  if (score > best) {
    best = score
    localStorage.setItem('2048-best', best)
  }
  if (!keepPlaying && board.some((row) => row.includes(2048))) state = 'won'
  else if (!canMove()) state = 'over'
  return true
}

const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

// Space, Enter or a tap: start again after game over, or keep playing after a win.
function next() {
  if (state === 'over') newGame()
  else if (state === 'won') {
    state = 'playing'
    keepPlaying = true
  }
}

// U: take the last move back.
function undoMove() {
  if (!undo) return
  board = undo.board
  score = undo.score
  state = 'playing'
  undo = null
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') next()
  if (event.key === 'u' || event.key === 'U') undoMove()
  const direction = directions[event.key]
  if (direction) {
    event.preventDefault()
    move(direction)
  }
  draw()
})

// A swipe is where the pointer came up compared to where it went down.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) next() // too short for a swipe: a tap
  else if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
  else move(dy > 0 ? 'down' : 'up')
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
  ctx.textAlign = 'right'
  ctx.fillText('Best: ' + best, canvas.width - GAP, TOP / 2)

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

  if (state !== 'playing') {
    ctx.fillStyle = state === 'won' ? 'rgba(237, 194, 46, 0.5)' : 'rgba(238, 228, 218, 0.75)'
    ctx.fillRect(0, TOP, canvas.width, canvas.width)
    ctx.fillStyle = state === 'won' ? '#f9f6f2' : '#776e65'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, TOP + 170)
    ctx.font = '18px sans-serif'
    ctx.fillText(state === 'won' ? 'Space or tap to keep going' : 'Space or tap to try again', canvas.width / 2, TOP + 220)
  }
}

newGame()
draw()
```
