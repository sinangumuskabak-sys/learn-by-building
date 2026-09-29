---
title: Score
title_tr: Skor
skills: [game.state]
---

# --goal--

Every merge scores the value of the new tile: `slideRow` already returns it as `gained`. We add it up in `score` and
show it in the strip above the board.

# --goal-tr--

Her birleşme, yeni karonun değeri kadar puan getirir: iki 8 birleşince 16 puan. `slideRow` bunu zaten `gained` olarak
döndürüyordu; şimdi toplayıp `score`'da tutuyor ve tahtanın üstündeki şeride yazıyoruz: `Score: 12`.

# --code--

```js
let score

  score = 0

    const { row, gained } = slideRow(line)
    if (reversed) row.reverse()
    score += gained

  ctx.fillStyle = '#776e65'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Score: ' + score, GAP, TOP / 2)
```

# --meaning--

- `score` is 0 in a new game.
- `const { row, gained }` now takes both properties out of `slideRow`'s result, and `gained` is added to `score`.
- The score is drawn left-aligned in the middle of the top strip, where `textBaseline = 'middle'` already applies.

# --meaning-tr--

- `let score` → skor. `newGame` içinde `score = 0`.
- `const { row, gained } = slideRow(line)` → nesneden artık iki özelliği birden alıyoruz.
- `score += gained` → her satırın/sütunun kazandırdığı puanı ekle.
- Skor yazısı: koyu gri, kalın 22 piksel, **sola hizalı** (`textAlign = 'left'`), şeridin dikey ortasında
  (`TOP / 2` = 30). `textBaseline = 'middle'` zaten burada; bu yüzden skor satırları onun etrafına geliyor. Döngüden
  önceki `textAlign = 'center'` sayılar için hizayı yeniden ortalar.

# --task--

1. Under `let board` write `let score`; in `newGame`, under `board = ...`, write `score = 0`.
2. In `move`, take `gained` too and add it to `score` after the `row.reverse()` line.
3. In `draw`, write the three pen lines above `textBaseline`, and the `fillText` line under it.

# --task-tr--

1. `let board` satırının altına `let score` yaz; `newGame` içinde `board = ...` satırının altına `score = 0` yaz.
2. `move` içinde `const { row } = ...` satırını `const { row, gained } = ...` yap; `if (reversed) row.reverse()`
   satırının altına `score += gained` yaz.
3. `draw` içinde `ctx.textBaseline = 'middle'` satırının **üstüne** üç kalem satırını (`fillStyle`, `font`,
   `textAlign`), **altına** `fillText` satırını yaz.
4. **Çalıştır** ve oyna: sol üstte skor artmalı.

# --tests--

Merges should add their value to the score.
tr: Birleşmeler değerlerini skora eklemeli.

```js
Math.random = () => 0.99
board = [[2, 2, 0, 0], [0, 4, 0, 4], [8, 0, 0, 0], [2, 4, 8, 16]]
score = 0
move('left')
assert.strictEqual(score, 12)
newGame()
assert.strictEqual(score, 0)
```

The score should be drawn in the top strip.
tr: Skor üstteki şeride yazılmalı.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
score = 0
$.press('ArrowLeft')
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Score: 4')
assert.exists(call, 'Score: 4 is drawn')
assert.deepEqual(call.args.slice(1, 3), [12, 30])
assert.strictEqual(call.font, 'bold 22px sans-serif')
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
