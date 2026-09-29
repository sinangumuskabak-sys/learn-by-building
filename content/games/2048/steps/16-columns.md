---
title: Up and down are columns
title_tr: Yukarı ve aşağı sütunlardır
skills: [prog.arrays, prog.functions]
---

# --goal--

Up and down work on **columns**: read a column from top to bottom as if it were a row, slide it "left" (towards the
top), and write it back. Down is the same, reversed. One tested function, reused four ways.

# --goal-tr--

Yukarı ve aşağı **sütunlarla** çalışır. Yine aynı hile: bir sütunu yukarıdan aşağı **bir satırmış gibi** oku, sola
(yani yukarıya) kaydır, sonra sütuna geri yaz. Aşağı da bunun ters çevrilmişi.

Tek bir test edilmiş fonksiyon, dört yönde. Küçük farklarla kod kopyalamak üzereyken böyle bir **dönüşüm** ara; bir
parça kod bütün işi yapsın.

# --code--

```js
// Every direction is "slide left" on a row or a column, possibly reversed.
function move(direction) {
  const before = JSON.stringify(board)
  const horizontal = direction === 'left' || direction === 'right'
  const reversed = direction === 'right' || direction === 'down'
  for (let i = 0; i < SIZE; i++) {
    const line = horizontal ? [...board[i]] : board.map((row) => row[i])

    if (horizontal) board[i] = row
    else row.forEach((value, r) => (board[r][i] = value))

const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
```

# --meaning--

- `horizontal` is `true` for left and right; for up and down, `i` is a column.
- `board.map((row) => row[i])` makes a new array of the `i`th item of every row: the column, top to bottom.
- `forEach((value, r) => ...)` writes the slid column back, one row at a time.
- Down is reversed like right, so `reversed` includes `'down'`.

# --meaning-tr--

- Üstteki yorum, fonksiyonun fikrini anlatıyor.
- `horizontal` → sol ya da sağ mı? Değilse `i` bir **sütun** numarasıdır.
- `reversed` → artık aşağı da ters çevrilir (yukarı = sütunda sola, aşağı = ters sütunda sola).
- `horizontal ? [...board[i]] : board.map((row) => row[i])` → yataysa satırın kopyası; değilse `map` her satırın
  `i`. elemanını alıp **yeni** bir dizi yapar: sütun, yukarıdan aşağı. (`map` hep yeni dizi verdiği için ayrıca
  kopyalamaya gerek yok.)
- `if (horizontal) board[i] = row` → satırı geri koy.
- `else row.forEach((value, r) => (board[r][i] = value))` → sütunu geri yaz: kaymış dizinin her değerini (`value`)
  kendi satırının (`r`) `i`. hücresine. `forEach` her eleman için çalışır; sırasını da verir.
- Tabloya iki ok daha eklendi.

# --task--

1. Above `function move`, write the comment.
2. Replace the `reversed` line with the `horizontal` and `reversed` lines shown.
3. In the loop, change the `line` line, and replace `board[i] = row` with the two lines.
4. Add `ArrowUp` and `ArrowDown` to the table.

# --task-tr--

1. `function move(direction) {` satırının **üstüne** yorum satırını yaz.
2. `const reversed = direction === 'right'` satırını sil; yerine `horizontal` ve yeni `reversed` satırlarını yaz.
3. Döngüde `const line = [...board[i]]` satırını yenisiyle değiştir; `board[i] = row` satırını sil, yerine iki
   satırı (`if` ve `else`) yaz.
4. `directions` tablosuna `ArrowUp: 'up', ArrowDown: 'down'` ekle.
5. **Çalıştır** ve dört okla oyna. Oyun artık oynanabilir!

# --hint--

For a column, `i` is the column number: read it with `board.map((row) => row[i])`, and write it back into
`board[r][i]` for each row `r`.

# --hint-tr--

Sütunda `i` sütun numarasıdır: `board.map((row) => row[i])` ile oku, her `r` satırı için `board[r][i]`'ye geri yaz.

# --tests--

Moving up and down should slide and merge the columns.
tr: Yukarı ve aşağı hareket sütunları kaydırıp birleştirmeli.

```js
Math.random = () => 0.99 // new tiles go into the last empty cell, as 4s
board = [[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]]
move('up')
assert.deepEqual(board.map((r) => r[0]), [4, 4, 0, 0])
board = [[2, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0]]
move('down')
assert.deepEqual(board.map((r) => r[0]), [0, 0, 0, 4])
assert.isFalse(move('down'), 'nothing left to slide down')
```

All four arrow keys should work.
tr: Dört ok tuşu da çalışmalı.

```js
board = [[0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [2, 0, 0, 0]]
$.press('ArrowUp')
assert.strictEqual(board[0][0], 4)
$.press('ArrowDown')
assert.strictEqual(board[3][0], 4)
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

// Every direction is "slide left" on a row or a column, possibly reversed.
function move(direction) {
  const before = JSON.stringify(board)
  const horizontal = direction === 'left' || direction === 'right'
  const reversed = direction === 'right' || direction === 'down'
  for (let i = 0; i < SIZE; i++) {
    const line = horizontal ? [...board[i]] : board.map((row) => row[i])
    if (reversed) line.reverse()
    const { row } = slideRow(line)
    if (reversed) row.reverse()
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
