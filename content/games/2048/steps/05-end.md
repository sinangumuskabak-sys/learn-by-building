---
title: Winning, and knowing when it is over
title_tr: Kazanmak ve bittiğini anlamak
skills: [game.state, prog.loops]
---

# --explanation--

When is 2048 over? Not when the board is full: a full board can still have merges. It is over when **no move could
change anything**:

- there is an empty cell, **or**
- two equal tiles sit next to each other, side by side or one above the other.

If neither is true anywhere, the player is stuck. Checking only the right and the lower neighbour of every cell is
enough, because every pair of neighbours is somebody's "right" or "below" pair. Checking all four directions would do
the same work twice.

Reaching 2048 is a win, but the game can go on to 4096 and beyond. So winning is its own state: the game pauses on
`'won'`, and Space continues. A `keepPlaying` flag remembers the choice so the win screen does not come back every
move. This is one more small state machine:

```
'playing' --2048 made--> 'won' --Space--> 'playing' (keepPlaying)
'playing' --no moves-->  'over' --Space--> new game
```

# --explanation-tr--

2048 ne zaman biter? Tahta dolunca değil: dolu bir tahtada hâlâ birleşmeler olabilir. **Hiçbir hamle bir şeyi
değiştiremiyorsa** biter:

- boş bir hücre var, **ya da**
- iki eşit karo yan yana ya da üst üste duruyor.

İkisi de hiçbir yerde doğru değilse oyuncu sıkışmıştır. Her hücrenin yalnızca sağ ve alt komşusuna bakmak yeter, çünkü
her komşu çifti birinin "sağ" ya da "alt" çiftidir. Dört yöne birden bakmak aynı işi iki kez yapmak olurdu.

2048'e ulaşmak bir galibiyettir, ama oyun 4096'ya ve ötesine devam edebilir. Bu yüzden kazanmak kendi durumudur: oyun
`'won'`da durur, Boşluk devam ettirir. `keepPlaying` bayrağı bu seçimi hatırlar; böylece kazanma ekranı her hamlede geri
gelmez. Bir küçük durum makinesi daha:

```
'playing' --2048 yapıldı--> 'won' --Boşluk--> 'playing' (keepPlaying)
'playing' --hamle yok-->    'over' --Boşluk--> yeni oyun
```

# --task--

1. Write `function canMove()` that returns `true` if any cell is empty or equals its right or lower neighbour.
2. Add `let state` and `let keepPlaying`, set to `'playing'` and `false` in `newGame()`.
3. In `move()`: do nothing unless playing. After a successful move and new tile: if `keepPlaying` is false and any
   tile is `2048`, set `state = 'won'`; otherwise, if `!canMove()`, set `state = 'over'`.
4. On Space (or Enter): when over, start a `newGame()`; when won, go back to `'playing'` with `keepPlaying = true`.
5. Draw a translucent overlay on the board with `Game Over` / `Press Space to try again` or `You win!` /
   `Press Space to keep going`.

# --task-tr--

1. Herhangi bir hücre boşsa ya da sağ veya alt komşusuna eşitse `true` döndüren `function canMove()` yaz.
2. `let state` ve `let keepPlaying` ekle; `newGame()` içinde `'playing'` ve `false` yap.
3. `move()` içinde: oyun sürmüyorsa hiçbir şey yapma. Başarılı bir hamle ve yeni karodan sonra: `keepPlaying` yanlışsa
   ve herhangi bir karo `2048` ise `state = 'won'`; değilse `!canMove()` ise `state = 'over'`.
4. Boşluk (ya da Enter) ile: oyun bittiyse `newGame()` başlat; kazanıldıysa `keepPlaying = true` ile `'playing'`e dön.
5. Tahtanın üstüne yarı saydam bir katman çiz: `Game Over` / `Press Space to try again` ya da `You win!` /
   `Press Space to keep going`.

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

A move that leaves no moves should end the game.
tr: Hiç hamle bırakmayan bir hamle oyunu bitirmeli.

```js
Math.random = () => 0 // the new tile is a 2 in the first empty cell
board = [[4, 2, 4, 0], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
move('right') // the top row becomes [0, 4, 2, 4], then a 2 fills the gap: a stuck checkerboard
assert.strictEqual(state, 'over')
assert.isFalse(move('left'))
draw()
assert.includeMembers($.texts(), ['Game Over', 'Press Space to try again'])
$.tap(' ')
assert.strictEqual(state, 'playing')
assert.lengthOf(board.flat().filter((v) => v !== 0), 2)
```

Making 2048 should pause on a win, and Space should keep playing.
tr: 2048 yapmak kazanma ekranında durmalı, Boşluk da oyuna devam ettirmeli.

```js
board = [[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
move('left')
assert.strictEqual(state, 'won')
draw()
assert.includeMembers($.texts(), ['You win!', 'Press Space to keep going'])
$.tap(' ')
assert.strictEqual(state, 'playing')
assert.isTrue(keepPlaying)
board[1] = [1024, 1024, 0, 0]
move('left')
assert.strictEqual(state, 'playing', 'the win screen does not come back')
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
  if (event.key === ' ' || event.key === 'Enter') {
    if (state === 'over') newGame()
    else if (state === 'won') {
      state = 'playing'
      keepPlaying = true
    }
  }
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
