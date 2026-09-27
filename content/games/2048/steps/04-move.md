---
title: Four directions, one function
title_tr: Dört yön, tek fonksiyon
skills: [prog.functions, prog.arrays, game.input]
---

# --explanation--

You have `slideRow`, which slides **left**. Do you need three more functions for right, up and down? No. Turn every
direction into "left" by looking at the board differently:

- **Right**: reverse the row, slide it left, reverse it back. Sliding a reversed row left is the same as sliding the
  original row right.
- **Up**: read a **column** from top to bottom as if it were a row (`board.map((row) => row[col])`), slide it "left"
  (towards the top), and write it back into the column.
- **Down**: read the column, reverse, slide, reverse back.

One tested function, reused four ways. When you find yourself about to copy-paste logic with small changes, look for a
transformation like this that lets one piece of code do the work.

A move only counts if it **changed something**. Pressing left when nothing can slide left must not add a new tile, or
the player could fill the board by mashing a useless direction. Compare the board before and after (`JSON.stringify`
turns it into text you can compare in one go), and only add a tile and redraw when they differ.

# --explanation-tr--

Elinde **sola** kaydıran `slideRow` var. Sağ, yukarı ve aşağı için üç fonksiyon daha mı gerekiyor? Hayır. Tahtaya farklı
bakarak her yönü "sol"a çevir:

- **Sağ**: satırı ters çevir, sola kaydır, geri ters çevir. Ters çevrilmiş bir satırı sola kaydırmak, orijinal satırı
  sağa kaydırmakla aynıdır.
- **Yukarı**: bir **sütunu** yukarıdan aşağı sanki bir satırmış gibi oku (`board.map((row) => row[col])`), "sola"
  (yukarıya doğru) kaydır ve sütuna geri yaz.
- **Aşağı**: sütunu oku, ters çevir, kaydır, geri ters çevir.

Test edilmiş tek bir fonksiyon, dört şekilde yeniden kullanılıyor. Küçük değişikliklerle mantık kopyalamak üzere
olduğunu fark ettiğinde, tek bir kod parçasının işi yapmasını sağlayan böyle bir dönüşüm ara.

Bir hamle yalnızca **bir şeyi değiştirdiyse** sayılır. Hiçbir şey sola kayamazken sola basmak yeni bir karo eklememeli;
yoksa oyuncu işe yaramaz bir yöne basıp duvararak tahtayı doldurabilir. Tahtayı önce ve sonra karşılaştır
(`JSON.stringify` onu tek seferde karşılaştırabileceğin bir metne çevirir) ve yalnızca farklıysa karo ekle ve yeniden çiz.

# --task--

1. Add `let score = 0` (reset it in `newGame()`).
2. Write `function move(direction)` for `'left'`, `'right'`, `'up'` and `'down'`: for each of the 4 lines (rows for
   left/right, columns for up/down), read the line, reverse it for right/down, `slideRow` it, reverse back, write it
   into the board and add `gained` to `score`. If the board changed, `addTile()` and return `true`; otherwise return
   `false`.
3. On `keydown`, map the arrow keys to directions, call `move`, and `draw()`.
4. Draw `Score: 12` (the real number) in the top strip: `'#776e65'`, `'bold 22px sans-serif'`, left-aligned at
   `(GAP, TOP / 2)`.

# --task-tr--

1. `let score = 0` ekle (`newGame()` içinde sıfırla).
2. `'left'`, `'right'`, `'up'` ve `'down'` için `function move(direction)` yaz: 4 çizginin her biri için (sol/sağ için
   satırlar, yukarı/aşağı için sütunlar) çizgiyi oku, sağ/aşağı için ters çevir, `slideRow` uygula, geri ters çevir,
   tahtaya yaz ve `gained`'i `score`'a ekle. Tahta değiştiyse `addTile()` çağır ve `true` döndür; değilse `false`.
3. `keydown`'da ok tuşlarını yönlere eşle, `move` çağır ve `draw()`.
4. Üst şeride `Score: 12` (gerçek sayı) yaz: `'#776e65'`, `'bold 22px sans-serif'`, `(GAP, TOP / 2)` noktasına sola
   hizalı.

# --tests--

Moving left should slide and merge every row.
tr: Sola hareket her satırı kaydırıp birleştirmeli.

```js
Math.random = () => 0.99 // the new tile goes into the last empty cell
board = [[2, 2, 0, 0], [0, 4, 0, 4], [8, 0, 0, 0], [2, 4, 8, 16]]
score = 0
assert.isTrue(move('left'))
assert.deepEqual(board.map((r) => r.slice(0, 2)), [[4, 0], [8, 0], [8, 0], [2, 4]])
assert.strictEqual(score, 12)
assert.lengthOf(board.flat().filter((v) => v !== 0), 8, 'seven tiles after merging, plus one new tile')
```

Moving right, up and down should work the same way in their directions.
tr: Sağa, yukarı ve aşağı hareket kendi yönlerinde aynı şekilde çalışmalı.

```js
Math.random = () => 0.99 // new tiles go into the last empty cell, as 4s
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
move('right')
assert.deepEqual(board[0], [0, 0, 0, 4])
board = [[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]]
move('up')
assert.deepEqual(board.map((r) => r[0]), [4, 4, 0, 0])
board = [[2, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0]]
move('down')
assert.deepEqual(board.map((r) => r[0]), [0, 0, 0, 4])
```

A move that changes nothing should not add a tile.
tr: Hiçbir şeyi değiştirmeyen bir hamle karo eklememeli.

```js
board = [[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
assert.isFalse(move('left'))
assert.deepEqual(board[0], [2, 4, 0, 0])
assert.lengthOf(board.flat().filter((v) => v !== 0), 2)
assert.isFalse(move('up'))
```

The arrow keys should move the board and update the score on screen.
tr: Ok tuşları tahtayı hareket ettirmeli ve ekrandaki skoru güncellemeli.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
score = 0
$.press('ArrowLeft')
assert.strictEqual(board[0][0], 4)
assert.include($.texts(), 'Score: 4')
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
  if (!direction) return
  event.preventDefault()
  move(direction)
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
