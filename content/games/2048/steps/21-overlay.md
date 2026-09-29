---
title: Win and lose screens
title_tr: Kazanma ve kaybetme ekranları
skills: [game.canvas]
---

# --goal--

When the game is not playing, a see-through layer covers the board with a message: gold with `You win!`, or pale with
`Game Over`.

# --goal-tr--

Oyun durunca oyuncu nedenini görmeli. Tahtanın üstüne **yarı saydam** bir katman çizip üstüne mesaj yazacağız:
kazandıysa altın rengi ve `You win!`, bittiyse soluk bir katman ve `Game Over`. Altta küçük bir yazı ne yapılacağını
söyleyecek.

# --code--

```js
if (state !== 'playing') {
  ctx.fillStyle = state === 'won' ? 'rgba(237, 194, 46, 0.5)' : 'rgba(238, 228, 218, 0.75)'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)
  ctx.fillStyle = state === 'won' ? '#f9f6f2' : '#776e65'
  ctx.font = 'bold 44px sans-serif'
  ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, TOP + 170)
  ctx.font = '18px sans-serif'
  ctx.fillText(state === 'won' ? 'Press Space to keep going' : 'Press Space to try again', canvas.width / 2, TOP + 220)
}
```

# --meaning--

- `rgba(r, g, b, a)` is a color with transparency `a` (0 clear, 1 solid), so the tiles still show through.
- Every line picks between the two screens with `state === 'won' ? ... : ...`.
- The text is still centred, since `textAlign` is `'center'` from the cells.

# --meaning-tr--

- `if (state !== 'playing')` → yalnız oyun durduğunda. `draw`'un sonunda olduğu için tahtanın **üstüne** çizilir.
- `'rgba(237, 194, 46, 0.5)'` → kırmızı, yeşil, mavi (0-255) ve **saydamlık** (0 tam saydam, 1 tam dolu). 0.5 ile
  karolar altından görünür.
- Her satır iki ekrandan birini seçer: `state === 'won' ? kazanınca : bitince`.
- Yazılar ortalı; `textAlign` hücre sayılarından beri `'center'`. `TOP + 170` tahtanın ortasına yakın.

# --task--

At the end of `draw`, after the loops, leave an empty line and write the `if` block.

# --task-tr--

`draw`'un sonunda, döngülerin kapanışından sonra bir boş satır bırak ve `if` bloğunu yaz; fonksiyonun son `}`'si
altta kalsın. **Çalıştır**.

# --tests--

A finished game should show Game Over.
tr: Biten bir oyun Game Over göstermeli.

```js
state = 'over'
draw()
assert.includeMembers($.texts(), ['Game Over', 'Press Space to try again'])
assert.deepInclude($.rects(), { x: 0, y: 60, w: 400, h: 400, color: 'rgba(238, 228, 218, 0.75)' })
```

A win should show You win!.
tr: Kazanınca You win! görünmeli.

```js
state = 'won'
draw()
assert.includeMembers($.texts(), ['You win!', 'Press Space to keep going'])
assert.deepInclude($.rects(), { x: 0, y: 60, w: 400, h: 400, color: 'rgba(237, 194, 46, 0.5)' })
```

There should be no layer while playing.
tr: Oyun sürerken katman olmamalı.

```js
draw()
assert.notInclude($.texts(), 'Game Over')
assert.notInclude($.texts(), 'You win!')
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
