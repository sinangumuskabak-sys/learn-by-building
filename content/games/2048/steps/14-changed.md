---
title: Only real moves count
title_tr: Yalnız gerçek hamleler sayılır
skills: [game.state]
---

# --goal--

A move only counts if it changed something; otherwise a player could fill the board by pressing a useless direction.
We compare the board before and after, and add a tile only when they differ.

# --goal-tr--

Bir hamle ancak **bir şeyi değiştirdiyse** sayılmalı. Yoksa oyuncu işe yaramayan bir yöne basıp durarak tahtayı yeni
karolarla doldurabilirdi.

Tahtanın hamleden önceki hâlini saklayıp sonrakiyle karşılaştıracağız. İki diziyi `===` ile karşılaştıramayız (iki
ayrı dizi, içleri aynı olsa da "aynı nesne" değildir); bu yüzden tahtayı **yazıya** çeviririz ve yazıları
karşılaştırırız.

# --code--

```js
function move(direction) {
  const before = JSON.stringify(board)

  if (JSON.stringify(board) === before) return false
  addTile()
  return true
}
```

# --meaning--

- `JSON.stringify(board)` turns the whole board into one text, like `'[[2,4,0,0],...]'`, which can be compared with
  `===`.
- If nothing changed, `move` returns `false` before adding a tile; otherwise it adds one and returns `true`.

# --meaning-tr--

- `JSON.stringify(board)` → bütün tahtayı tek bir yazıya çevirir: `'[[2,4,0,0],[0,0,0,0],...]'`. Yazılar `===` ile
  harf harf karşılaştırılabilir.
- `const before = ...` → hamleden **önceki** hâl.
- `if (JSON.stringify(board) === before) return false` → hamleden sonra yazı aynıysa hiçbir şey değişmemiş: karo
  eklemeden çık ve `false` ("hamle olmadı") döndür.
- `return true` → hamle oldu. Bu cevabı ileride kullanacağız.

# --task--

1. At the top of `move`, write the `before` line.
2. After the loop, write the comparison above `addTile()`, and `return true` under it.

# --task-tr--

1. `move`'un **ilk satırı** olarak `const before = JSON.stringify(board)` yaz.
2. Döngünün kapanan `}`'sinden sonra, `addTile()` satırının **üstüne** karşılaştırma satırını, altına `return true`
   yaz.
3. **Çalıştır**: artık boşuna basılan sol ok karo eklemez.

# --tests--

A move that changes nothing should not add a tile.
tr: Hiçbir şeyi değiştirmeyen bir hamle karo eklememeli.

```js
board = [[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
assert.isFalse(move('left'))
assert.deepEqual(board[0], [2, 4, 0, 0])
assert.lengthOf(board.flat().filter((v) => v !== 0), 2)
```

A move that changes something should add a tile and return `true`.
tr: Bir şeyi değiştiren hamle karo eklemeli ve `true` döndürmeli.

```js
board = [[0, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
assert.isTrue(move('left'))
assert.lengthOf(board.flat().filter((v) => v !== 0), 2)
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
  const before = JSON.stringify(board)
  for (let i = 0; i < SIZE; i++) {
    const line = board[i]
    const { row } = slideRow(line)
    board[i] = row
  }
  if (JSON.stringify(board) === before) return false
  addTile()
  return true
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
