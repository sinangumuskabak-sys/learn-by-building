---
title: Space to go on
title_tr: Devam için Boşluk
skills: [game.input, game.state]
---

# --goal--

Space (or Enter) goes on: after a game over it starts a new game, after a win it keeps playing.

# --goal-tr--

Ekranlar "Press Space" diyor; sözlerini tutalım. **Boşluk** (ya da Enter) oyunun durumuna göre devam ettirir:
bittiyse **yeni oyun**, kazandıysa **oynamaya devam** (`keepPlaying` artık `true`).

# --code--

```js
function next() {
  if (state === 'over') newGame()
  else if (state === 'won') {
    state = 'playing'
    keepPlaying = true
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') next()
```

# --meaning--

- `next` does the right thing for the state; while playing it does nothing.
- The key handler calls it for Space (`' '`) or Enter, and then redraws as for every key.

# --meaning-tr--

- `function next()` → durum `'over'` ise `newGame()`; `'won'` ise oyuna dön ve devam seçimini hatırla. Oyun sürerken
  hiçbir şey yapmaz.
- Dinleyicinin ilk satırı: tuş Boşluk (`' '`) **ya da** Enter ise `next()`. Dinleyicinin sonundaki `draw()` ekranı
  yeniler.

# --task--

1. Above the `keydown` listener write `next`, with an empty line after it.
2. Write the Space/Enter line as the first line of the listener.

# --task-tr--

1. `document.addEventListener('keydown', ...` satırının **üstüne** `next` fonksiyonunu yaz; altında bir boş satır
   kalsın.
2. Dinleyicinin **ilk satırı** olarak Boşluk/Enter satırını yaz.
3. **Çalıştır**.

# --tests--

Space after a game over should start a new game.
tr: Oyun bittikten sonra Boşluk yeni oyun başlatmalı.

```js
board = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
score = 500
state = 'over'
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(score, 0)
assert.lengthOf(board.flat().filter((v) => v !== 0), 2)
```

Space or Enter after a win should keep playing, and the win should not come back.
tr: Kazandıktan sonra Boşluk ya da Enter oyuna devam ettirmeli ve kazanma ekranı geri gelmemeli.

```js
board = [[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
move('left')
assert.strictEqual(state, 'won')
$.press('Enter')
assert.strictEqual(state, 'playing')
assert.isTrue(keepPlaying)
board[1] = [1024, 1024, 0, 0]
move('left')
assert.strictEqual(state, 'playing', 'the win screen does not come back')
```

While playing, Space should change nothing.
tr: Oyun sürerken Boşluk hiçbir şeyi değiştirmemeli.

```js
const before = JSON.stringify(board)
$.press(' ')
assert.strictEqual(JSON.stringify(board), before)
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
  if (!keepPlaying && board.some((row) => row.includes(2048))) state = 'won'
  else if (!canMove()) state = 'over'
  return true
}

const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

function next() {
  if (state === 'over') newGame()
  else if (state === 'won') {
    state = 'playing'
    keepPlaying = true
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') next()
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

  if (state !== 'playing') {
    ctx.fillStyle = state === 'won' ? 'rgba(237, 194, 46, 0.5)' : 'rgba(238, 228, 218, 0.75)'
    ctx.fillRect(0, TOP, canvas.width, canvas.width)
    ctx.fillStyle = state === 'won' ? '#f9f6f2' : '#776e65'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, TOP + 170)
    ctx.font = '18px sans-serif'
    ctx.fillText(state === 'won' ? 'Press Space to keep going' : 'Press Space to try again', canvas.width / 2, TOP + 220)
  }
}

newGame()
draw()
```
