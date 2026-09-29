---
title: A tap is not a swipe
title_tr: Dokunmak kaydırmak değildir
skills: [game.input]
---

# --goal--

If the finger barely moved (less than 30 pixels either way), it was a **tap**, not a swipe. A tap does what Space
does: go on after a win or a game over.

# --goal-tr--

Parmak neredeyse hiç kıpırdamadıysa (iki yönde de 30 pikselden az) bu bir kaydırma değil, bir **dokunuştur**. Şu an
küçük bir dokunuş bile karoları kaydırıyor. Dokunuş, Boşluk tuşunun işini yapsın: kazanınca ya da bitince devam.
Ekrandaki yazılar da bunu söylesin.

# --code--

```js
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) next() // too short for a swipe: a tap
  else if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')

// Space, Enter or a tap: start again after game over, or keep playing after a win.
function next() {

    ctx.fillText(state === 'won' ? 'Space or tap to keep going' : 'Space or tap to try again', canvas.width / 2, TOP + 220)
```

# --meaning--

- `Math.max(...)` is the bigger of the two distances; under 30 pixels it is a tap and calls `next()`. The swipe line
  becomes `else if`.
- `next` gets a comment, and the screens now mention the tap.

# --meaning-tr--

- `Math.max(Math.abs(dx), Math.abs(dy)) < 30` → iki mesafenin **büyüğü** bile 30'dan küçükse parmak neredeyse hiç
  kaymamış: dokunuş. `next()` çağrılır.
- Eski `if` satırı `else if` oldu: dokunuş değilse kaydırma.
- `next`'in üstündeki yorum artık dokunuşu da anlatıyor.
- Katman yazıları: `'Space or tap to ...'`.

# --task--

1. In the `pointerup` listener, write the tap line above the `if` line, and make that line `else if`.
2. Above `function next() {` write the comment.
3. Change the two overlay texts to `'Space or tap to keep going'` and `'Space or tap to try again'`.

# --task-tr--

1. `pointerup` dinleyicisinde `if (Math.abs(dx) > ...` satırının **üstüne** dokunuş satırını yaz; eski satırın başını
   `else if` yap.
2. `function next() {` satırının **üstüne** yorum satırını yaz.
3. Katmandaki iki yazıyı `'Space or tap to keep going'` ve `'Space or tap to try again'` yap.
4. **Çalıştır**. Oyun tamam!

# --tests--

A short tap should not move the board.
tr: Kısa bir dokunuş tahtayı hareket ettirmemeli.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.pointerDown(100, 200)
$.pointerUp(110, 205)
assert.deepEqual(board[0], [2, 2, 0, 0])
```

A tap should keep playing after a win and start again after a game over.
tr: Bir dokunuş kazandıktan sonra devam ettirmeli, oyun bittikten sonra yeniden başlatmalı.

```js
state = 'won'
$.pointerDown(100, 200)
$.pointerUp(100, 200)
assert.strictEqual(state, 'playing')
assert.isTrue(keepPlaying)
state = 'over'
score = 99
$.click(200, 300)
assert.strictEqual(state, 'playing')
assert.strictEqual(score, 0)
```

The screens should mention the tap.
tr: Ekranlar dokunuştan da söz etmeli.

```js
state = 'over'
draw()
assert.include($.texts(), 'Space or tap to try again')
state = 'won'
draw()
assert.include($.texts(), 'Space or tap to keep going')
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

// Space, Enter or a tap: start again after game over, or keep playing after a win.
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
