---
title: Move left
title_tr: Sola hareket
skills: [prog.functions]
---

# --goal--

A move slides every row of the board with `slideRow` and then adds a new tile. We start with left only; `direction`
is there for the others.

# --goal-tr--

Artık bir **hamle** yapabiliriz: tahtanın her satırını `slideRow` ile kaydır, sonra yeni bir karo ekle. Şimdilik
yalnız **sola**; `direction` (yön) parametresini diğer yönler için şimdiden koyuyoruz, birkaç adımda kullanacağız.

# --code--

```js
function move(direction) {
  for (let i = 0; i < SIZE; i++) {
    const line = board[i]
    const { row } = slideRow(line)
    board[i] = row
  }
  addTile()
}
```

# --meaning--

- For each row `i`, `slideRow` gives back a new row, which replaces the old one in the board.
- `const { row } = ...` takes the `row` property out of the returned object into a variable of the same name
  (object destructuring).

# --meaning-tr--

- `for (let i = 0; i < SIZE; i++)` → tahtanın 4 satırı.
- `const line = board[i]` → `i`. satır.
- `const { row } = slideRow(line)` → `slideRow` `{ row, gained }` nesnesi döndürüyor; süslü parantezle **nesneyi
  ayrıştırıp** içindeki `row`'u aynı adlı bir değişkene alırız. `const row = slideRow(line).row` ile aynı şey, daha
  kısa.
- `board[i] = row` → eski satırın yerine kaymış yenisi.
- `addTile()` → hamleden sonra yeni bir karo.

# --task--

Write `move` above `function cellX(col) {`, with an empty line after it.

# --task-tr--

`function cellX(col) {` satırının **üstüne** `move` fonksiyonunu yaz; altında bir boş satır kalsın. **Çalıştır**:
henüz hiçbir tuş `move`'u çağırmıyor.

# --tests--

Moving left should slide and merge every row, and add one tile.
tr: Sola hareket her satırı kaydırıp birleştirmeli ve bir karo eklemeli.

```js
Math.random = () => 0.99 // the new tile goes into the last empty cell
board = [[2, 2, 0, 0], [0, 4, 0, 4], [8, 0, 0, 0], [2, 4, 8, 16]]
move('left')
assert.deepEqual(board.map((r) => r.slice(0, 2)), [[4, 0], [8, 0], [8, 0], [2, 4]])
assert.lengthOf(board.flat().filter((v) => v !== 0), 8, 'seven tiles after merging, plus one new tile')
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
