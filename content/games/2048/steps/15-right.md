---
title: Right is left, reversed
title_tr: Sağ, ters çevrilmiş sol
skills: [prog.arrays]
---

# --goal--

Do we need a second function for right? No: reverse the row, slide it left, reverse it back. Sliding a reversed row
left is the same as sliding the original row right.

# --goal-tr--

Sağa kaydırmak için ikinci bir fonksiyon gerekmez. Bir hile: satırı **ters çevir**, sola kaydır, sonucu **geri
çevir**. Ters çevrilmiş satırı sola kaydırmak, asıl satırı sağa kaydırmakla aynı şeydir.

```
[2, 2, 0, 0]  → ters →  [0, 0, 2, 2]  → sola →  [4, 0, 0, 0]  → ters →  [0, 0, 0, 4]
```

Bir aynaya bakıp sola yürümek gibi.

# --code--

```js
  const reversed = direction === 'right'

    const line = [...board[i]]
    if (reversed) line.reverse()
    const { row } = slideRow(line)
    if (reversed) row.reverse()

const directions = { ArrowLeft: 'left', ArrowRight: 'right' }
```

# --meaning--

- `reversed` is `true` for right.
- `reverse()` turns an array around **in place**: it changes the array itself. So we reverse a copy: `[...board[i]]`
  spreads the row's items into a new array.
- After sliding, the result is reversed back, and the table gets the right arrow.

# --meaning-tr--

- `const reversed = direction === 'right'` → sağa mı gidiyoruz? `true` ya da `false`.
- `line.reverse()` → diziyi **yerinde** ters çevirir: yeni bir dizi yapmaz, dizinin **kendisini** değiştirir.
  `board[i]`'yi doğrudan çevirseydik tahtanın satırı da çevrilirdi.
- Bu yüzden `[...board[i]]` → `...` (**yayma**, spread) satırın elemanlarını yeni bir dizinin içine döker: bir
  **kopya**. Kopyayı çevirmek tahtaya dokunmaz.
- `if (reversed) row.reverse()` → kaymış satırı geri çevir. `row` zaten `slideRow`'un yeni dizisi, onu çevirmek
  güvenli.
- Tabloya `ArrowRight: 'right'` eklendi.

# --task--

1. In `move`, under `before`, write the `reversed` line.
2. In the loop, change `line` to a copy and add the two `reverse` lines.
3. Add `ArrowRight` to the table.

# --task-tr--

1. `move` içinde `const before = ...` satırının altına `reversed` satırını yaz.
2. Döngüde `const line = board[i]` satırını `const line = [...board[i]]` yap; altına `if (reversed) line.reverse()`
   yaz. `const { row } = ...` satırının altına `if (reversed) row.reverse()` yaz.
3. `directions` tablosuna `ArrowRight: 'right'` ekle.
4. **Çalıştır**, sol ve sağ oklarla oyna.

# --hint--

If the board itself flips around, you are reversing `board[i]` and not a copy: write `[...board[i]]`.

# --hint-tr--

Tahtanın kendisi ters dönüyorsa kopya yerine `board[i]`'yi çeviriyorsun: `[...board[i]]` yaz.

# --tests--

Moving right should slide and merge to the right.
tr: Sağa hareket sağa doğru kaydırıp birleştirmeli.

```js
Math.random = () => 0.99 // new tiles go into the last empty cell, as 4s
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
assert.isTrue(move('right'))
assert.deepEqual(board[0], [0, 0, 0, 4])
board = [[2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
move('right')
assert.deepEqual(board[0], [0, 0, 2, 4], 'the two on the right merge first')
```

The right arrow should move right, and moving left should still work.
tr: Sağ ok sağa hareket ettirmeli; sola hareket de hâlâ çalışmalı.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.press('ArrowRight')
assert.strictEqual(board[0][3], 4)
$.press('ArrowLeft')
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
  const reversed = direction === 'right'
  for (let i = 0; i < SIZE; i++) {
    const line = [...board[i]]
    if (reversed) line.reverse()
    const { row } = slideRow(line)
    if (reversed) row.reverse()
    board[i] = row
  }
  if (JSON.stringify(board) === before) return false
  addTile()
  return true
}

const directions = { ArrowLeft: 'left', ArrowRight: 'right' }

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
