---
title: The arrow key
title_tr: Ok tuşu
skills: [game.input]
---

# --goal--

A table turns arrow keys into directions. On a key press we move and then redraw: this game has no loop, the screen
changes only when something happens.

# --goal-tr--

Şimdi oynayalım. Bir **tabloda** ok tuşlarını yönlere çeviriyoruz; şimdilik yalnız sol ok. Tuşa basılınca hamle
yapılır ve ekran **yeniden çizilir**. Bu oyunda sürekli dönen bir döngü yok: ekran yalnız bir şey olunca değişir.

# --code--

```js
const directions = { ArrowLeft: 'left' }

document.addEventListener('keydown', (event) => {
  const direction = directions[event.key]
  if (direction) {
    event.preventDefault()
    move(direction)
  }
  draw()
})
```

# --meaning--

- `directions[event.key]` is the direction for the key, or `undefined` for other keys.
- `preventDefault()` stops the arrow keys from scrolling the page.
- `draw()` repaints after every key.

# --meaning-tr--

- `const directions = { ArrowLeft: 'left' }` → tuş adından yöne bir tablo. Diğer okları yönleri çalışınca ekleyeceğiz.
- `document.addEventListener('keydown', (event) => { ... })` → her tuş basışında çalışır; `event.key` tuşun adı.
- `directions[event.key]` → tabloda varsa yön, yoksa `undefined` (yanlış sayılır).
- `event.preventDefault()` → ok tuşlarının sayfayı kaydırmasını engeller.
- `draw()` → her tuştan sonra ekranı yeniden çiz.

# --task--

Write the table and the listener above `function cellX(col) {`, with an empty line after them.

# --task-tr--

`function cellX(col) {` satırının **üstüne** tabloyu ve dinleyiciyi yaz (aralarında bir boş satır); altında bir boş
satır kalsın. **Çalıştır**, oyuna tıkla ve **sol oka** bas.

# --predict--

Press the left arrow when nothing can slide left (all tiles already at the left edge). What happens?
- [ ] Nothing
- [x] A new tile appears anyway
  `move` always calls `addTile`. We fix that in the next step.

# --predict-tr--

Hiçbir şeyin sola kayamadığı bir anda (bütün karolar zaten sol kenarda) sol oka bas. Ne olur?
- [ ] Hiçbir şey
- [x] Yine de yeni bir karo çıkar
  `move` her seferinde `addTile`'ı çağırıyor. Bunu bir sonraki adımda düzelteceğiz.

# --tests--

The left arrow should move the board and redraw it.
tr: Sol ok tahtayı hareket ettirmeli ve yeniden çizmeli.

```js
board = [[0, 0, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.press('ArrowLeft')
assert.strictEqual(board[0][0], 4)
assert.include($.texts(), '4')
```

Other keys should not move the board.
tr: Başka tuşlar tahtayı hareket ettirmemeli.

```js
board = [[0, 0, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.press('a')
assert.deepEqual(board[0], [0, 0, 2, 2])
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

function move(direction) {
  for (let i = 0; i < SIZE; i++) {
    const line = board[i]
    const { row } = slideRow(line)
    board[i] = row
  }
  addTile()
}

const directions = { ArrowLeft: 'left' }

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

  ctx.textBaseline = 'middle'

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
