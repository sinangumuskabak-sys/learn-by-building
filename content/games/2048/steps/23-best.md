---
title: Best score
title_tr: Rekor
skills: [game.state]
---

# --goal--

The best score is kept in `localStorage`, which the browser keeps after the page is closed, and shown at the top
right.

# --goal-tr--

Rekoru saklayalım. Tarayıcının küçük bir **kalıcı defteri** var: `localStorage`. Oraya yazılan, sayfa kapansa da
kalır. Her hamleden sonra skor rekordan büyükse rekoru güncelleyip deftere yazacağız ve sağ üstte göstereceğiz:
`Best: 40`.

# --code--

```js
let best = Number(localStorage.getItem('2048-best')) || 0

  addTile()
  if (score > best) {
    best = score
    localStorage.setItem('2048-best', best)
  }

  ctx.textAlign = 'right'
  ctx.fillText('Best: ' + best, canvas.width - GAP, TOP / 2)
```

# --meaning--

- `getItem` reads the saved text or `null`; `Number(...) || 0` makes it a number, 0 the first time.
- After each real move a higher score becomes the new `best` and is saved with `setItem`.
- `textAlign = 'right'` puts the text's right end `GAP` pixels from the right edge.

# --meaning-tr--

- `localStorage.getItem('2048-best')` → defterdeki kaydı okur; yoksa `null`.
- `Number(...) || 0` → yazıyı sayıya çevirir; ilk kez oynuyorsan 0.
- `if (score > best) { ... }` → skor rekoru geçtiyse `best`'i güncelle ve `localStorage.setItem` ile deftere yaz.
  Gerçek bir hamleden sonra çalışır (boş hamleler daha önce `return false` ile çıktı).
- `ctx.textAlign = 'right'` → yazının **sağ ucu** `canvas.width - GAP`'e (sağdan 12 piksel içeri) gelsin.

# --task--

1. Under `let keepPlaying` write `let best`.
2. In `move`, under `addTile()`, write the `if (score > best)` block.
3. In `draw`, under the `Score` line, write the two `Best` lines.

# --task-tr--

1. `let keepPlaying ...` satırının altına `let best = ...` yaz.
2. `move` içinde `addTile()` satırının altına `if (score > best) { ... }` bloğunu yaz.
3. `draw` içinde `ctx.fillText('Score: ' ...` satırının altına iki `Best` satırını yaz.
4. **Çalıştır**, oyna, sayfayı yenile: rekor yerinde durmalı.

# --tests--

The best score should be kept and shown.
tr: Rekor saklanmalı ve gösterilmeli.

```js
assert.strictEqual(best, 0)
board = [[16, 16, 0, 0], [8, 8, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
score = 0
$.press('ArrowLeft')
assert.strictEqual(best, 48)
assert.strictEqual(localStorage.getItem('2048-best'), '48')
assert.include($.texts(), 'Best: 48')
```

A lower score should not replace the best.
tr: Daha düşük bir skor rekorun yerini almamalı.

```js
best = 1000
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.press('ArrowLeft')
assert.strictEqual(best, 1000)
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
  if (score > best) {
    best = score
    localStorage.setItem('2048-best', best)
  }
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
    ctx.fillText(state === 'won' ? 'Press Space to keep going' : 'Press Space to try again', canvas.width / 2, TOP + 220)
  }
}

newGame()
draw()
```
