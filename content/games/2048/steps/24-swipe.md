---
title: Swipes
title_tr: Kaydırmalar
skills: [game.input]
---

# --goal--

2048 is at its best on a phone, played with swipes. A swipe is built from two events: remember where the finger went
down, and on the way up measure how far it moved. The bigger of the two distances decides the direction.

# --goal-tr--

2048 en güzel telefonda, parmakla **kaydırarak** oynanır. Kaydırma hazır bir olay değil; onu bildiğimiz iki olaydan
kurarız:

1. `pointerdown`: parmak (ya da fare) nereye bastı, hatırla.
2. `pointerup`: kalktığında ne kadar yol aldı, ölç: yatayda `dx`, dikeyde `dy`.

Hangisi **daha büyükse** o kazanır: çoğunlukla yanlamasına ise sol ya da sağ, çoğunlukla dikey ise yukarı ya da
aşağı. İşaret (artı/eksi) yönü söyler.

# --code--

```js
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
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
  else move(dy > 0 ? 'down' : 'up')
  draw()
})
```

# --meaning--

- `pointerdown` stores the start point; `pointerup` works out `dx` and `dy` and forgets the start.
- `Math.abs` drops the sign, so the bigger movement wins; the sign of that one picks the direction.
- Page pixels are fine here: a swipe is about how far the finger travelled, not a spot in the game.

# --meaning-tr--

- `let swipeStart = null` → basılan nokta; parmak kalkıkken `null`.
- `pointerdown` → `event.clientX` ve `event.clientY` parmağın sayfadaki yeri; bir nesne olarak saklanır.
- `pointerup` → başlangıç yoksa (`!swipeStart`) hiçbir şey yapma. Varsa `dx` (sağa pozitif) ve `dy` (aşağı pozitif)
  hesapla, başlangıcı unut.
- `Math.abs(dx) > Math.abs(dy)` → `Math.abs` işareti atar: yatay hareket dikeyden büyükse yatay bir kaydırma.
  `dx > 0 ? 'right' : 'left'` → sağa mı sola mı.
- `else` → dikey: `dy > 0` aşağı, değilse yukarı.
- Burada sayfa pikseli yeterli, canvas pikseline çevirmeye gerek yok: kaydırmada önemli olan oyundaki bir yer
  değil, parmağın ne kadar yol aldığı.

# --task--

Write the comment, `swipeStart` and the two listeners above `function cellX(col) {`, with an empty line after them.

# --task-tr--

`function cellX(col) {` satırının **üstüne** yorumu, `swipeStart` satırını ve iki dinleyiciyi yaz; altlarında bir boş
satır kalsın. **Çalıştır**, fareyle basılı tutup sürükleyerek dene.

# --tests--

A mostly horizontal swipe should move left or right.
tr: Çoğunlukla yatay bir kaydırma sola ya da sağa hareket ettirmeli.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.pointerDown(100, 200)
$.pointerUp(220, 230)
assert.strictEqual(board[0][3], 4)
$.pointerDown(300, 200)
$.pointerUp(100, 180)
assert.strictEqual(board[0][0], 4)
```

A mostly vertical swipe should move up or down.
tr: Çoğunlukla dikey bir kaydırma yukarı ya da aşağı hareket ettirmeli.

```js
board = [[0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [2, 0, 0, 0]]
$.pointerDown(200, 400)
$.pointerUp(190, 250)
assert.strictEqual(board[0][0], 4)
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
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
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
    ctx.fillText(state === 'won' ? 'Press Space to keep going' : 'Press Space to try again', canvas.width / 2, TOP + 220)
  }
}

newGame()
draw()
```
