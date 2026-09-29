---
title: Making 2048
title_tr: 2048 yapmak
skills: [game.state, prog.arrays]
---

# --goal--

Making a 2048 tile is a win, but the game can go on to 4096 and beyond. So winning is its own state, `'won'`, and a
`keepPlaying` flag remembers when the player chose to continue, so the win does not come back every move.

# --goal-tr--

2048 karosunu yapmak **kazanmak** demek. Ama oyun 4096'ya ve ötesine devam edebilir. Bu yüzden kazanmak ayrı bir
durum olacak: `'won'`. Oyuncu devam etmeyi seçerse bunu `keepPlaying` bayrağında hatırlarız; yoksa kazanma ekranı
her hamlede yeniden gelirdi.

```
'playing' --2048 yapıldı--> 'won' --devam--> 'playing' (keepPlaying)
'playing' --hamle yok-->    'over'
```

# --code--

```js
let keepPlaying // true once the player chose to continue after making 2048

  keepPlaying = false

  if (!keepPlaying && board.some((row) => row.includes(2048))) state = 'won'
  else if (!canMove()) state = 'over'
```

# --meaning--

- `row.includes(2048)` is `true` if the row has a 2048; `board.some(...)` is `true` if any row does.
- Only when the player has not already chosen to keep playing does it become `'won'`; otherwise, as before, a stuck
  board is `'over'`.

# --meaning-tr--

- `let keepPlaying` → oyuncu 2048'den sonra devam etmeyi seçti mi? `newGame` içinde `false`.
- `row.includes(2048)` → satırda 2048 **var mı**?
- `board.some((row) => ...)` → `some`, listenin elemanlarından **en az biri** için koşul doğruysa `true` verir:
  herhangi bir satırda 2048 var mı?
- `!keepPlaying && ...` → oyuncu henüz devam etmeyi seçmediyse ve 2048 varsa: `'won'`.
- `else if (!canMove())` → değilse, eskisi gibi hamle kalmadıysa `'over'`.

# --task--

1. Under `let state` write `let keepPlaying`; in `newGame`, under `state = 'playing'`, write `keepPlaying = false`.
2. In `move`, replace the `canMove` line with the two lines.

# --task-tr--

1. `let state` satırının altına `let keepPlaying ...` yaz; `newGame` içinde `state = 'playing'` satırının altına
   `keepPlaying = false` yaz.
2. `move` içindeki `if (!canMove()) state = 'over'` satırını sil; yerine iki satırı yaz.
3. **Çalıştır**.

# --tests--

Making 2048 should win.
tr: 2048 yapmak kazandırmalı.

```js
assert.isFalse(keepPlaying)
board = [[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
move('left')
assert.strictEqual(state, 'won')
assert.isFalse(move('right'), 'the game waits on the win')
```

After choosing to keep playing, another 2048 should not win again.
tr: Devam etmeyi seçtikten sonra yeni bir 2048 yeniden kazandırmamalı.

```js
board = [[2048, 0, 0, 0], [1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
keepPlaying = true
move('left')
assert.strictEqual(state, 'playing')
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
}

newGame()
draw()
```
