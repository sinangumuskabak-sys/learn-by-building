---
title: New tiles, and a sneaky array bug
title_tr: Yeni karolar ve sinsi bir dizi hatası
skills: [prog.arrays]
---

# --explanation--

A game starts with two tiles in random empty cells, and every move adds one more: a `2` nine times out of ten, a `4`
otherwise.

To pick a random **empty** cell, first collect all of them as `[row, col]` pairs, then pick one from that list. This is
far better than "try random cells until one is empty", which gets slower and slower as the board fills up, and never
ends when it is full.

Building an empty board hides one of JavaScript's most famous traps:

```js
Array(4).fill(Array(4).fill(0))   // looks right... but it is ONE row, shared four times
```

`fill` puts the **same** array object in every slot. Set `board[0][0] = 2` and `board[1][0]`, `board[2][0]` and
`board[3][0]` all become 2 too, because they are the same row. `Array.from` calls a function for **each** slot, so each
row is a brand new array:

```js
Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
```

This difference between a *value* and a *reference to an object* is behind countless bugs, far beyond games.

# --explanation-tr--

Oyun rastgele boş hücrelerdeki iki karoyla başlar ve her hamle bir tane daha ekler: ondan dokuzunda `2`, diğerinde `4`.

Rastgele bir **boş** hücre seçmek için önce hepsini `[row, col]` çiftleri olarak topla, sonra o listeden birini seç.
Bu, "boş olana kadar rastgele hücre dene"den çok daha iyidir; o yöntem tahta doldukça yavaşlar ve tahta dolunca hiç
bitmez.

Boş bir tahta kurmak JavaScript'in en ünlü tuzaklarından birini saklar:

```js
Array(4).fill(Array(4).fill(0))   // doğru görünür... ama bu dört kez paylaşılan TEK bir satır
```

`fill` her yuvaya **aynı** dizi nesnesini koyar. `board[0][0] = 2` yap; `board[1][0]`, `board[2][0]` ve `board[3][0]`
de 2 olur, çünkü hepsi aynı satır. `Array.from` **her** yuva için bir fonksiyon çağırır; böylece her satır yepyeni bir
dizi olur:

```js
Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
```

Bir *değer* ile bir *nesneye başvuru* arasındaki bu fark, oyunların çok ötesinde sayısız hatanın arkasındadır.

# --task--

1. Write `function emptyCells()` returning every `[row, col]` whose value is `0`.
2. Write `function addTile()`: if there are empty cells, pick one at random and set it to `2` if
   `Math.random() < 0.9`, otherwise `4`.
3. Write `function newGame()`: build a fresh board with `Array.from` (each row its own array), then add two tiles. Call
   it before `draw()`, and declare `let board` without a value.

# --task-tr--

1. Değeri `0` olan her `[row, col]`'u döndüren `function emptyCells()` yaz.
2. `function addTile()` yaz: boş hücre varsa rastgele birini seç ve `Math.random() < 0.9` ise `2`, değilse `4` yap.
3. `function newGame()` yaz: `Array.from` ile (her satır kendi dizisi) yeni bir tahta kur, sonra iki karo ekle.
   `draw()`'dan önce çağır; `let board`'u değersiz tanımla.

# --tests--

Each row should be its own array.
tr: Her satır kendi dizisi olmalı.

```js
newGame()
assert.notStrictEqual(board[0], board[1])
board[0][0] = 64
assert.strictEqual(board[1][0] === 64, false, 'changing one row must not change the others')
```

A new game should start with exactly two tiles.
tr: Yeni bir oyun tam olarak iki karoyla başlamalı.

```js
for (let i = 0; i < 20; i++) {
  newGame()
  const tiles = board.flat().filter((v) => v !== 0)
  assert.lengthOf(tiles, 2)
  assert.isTrue(tiles.every((v) => v === 2 || v === 4))
}
```

`emptyCells()` should list the empty cells as [row, col].
tr: `emptyCells()` boş hücreleri [row, col] olarak listelemeli.

```js
board = [[2, 2, 2, 2], [2, 0, 2, 2], [2, 2, 2, 2], [2, 2, 2, 0]]
assert.sameDeepMembers(emptyCells(), [[1, 1], [3, 3]])
```

`addTile()` should fill empty cells only, with 2 about 90% of the time.
tr: `addTile()` yalnızca boş hücreleri, yaklaşık %90 oranında 2 ile doldurmalı.

```js
let twos = 0
for (let i = 0; i < 1000; i++) {
  board = [[8, 8, 8, 8], [8, 0, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8]]
  addTile()
  assert.notStrictEqual(board[1][1], 0)
  if (board[1][1] === 2) twos++
}
assert.isAbove(twos, 850)
assert.isBelow(twos, 950)
board = [[8, 8, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8], [8, 8, 8, 8]]
addTile()
assert.deepEqual(board.flat(), Array(16).fill(8), 'a full board stays as it is')
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

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
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
