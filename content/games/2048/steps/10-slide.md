---
title: Slide a row
title_tr: Bir satırı kaydır
skills: [prog.functions, prog.arrays]
---

# --goal--

The whole game hangs on one function: slide one row to the left. First only the sliding: drop the zeros, then pad
with zeros back to four. It is a **pure** function: it returns a new row and changes nothing else.

# --goal-tr--

Bütün oyun tek bir fonksiyona dayanıyor: **bir satırı sola kaydırmak**. Diğer üç yönü de sonra buna çevireceğiz.

Önce yalnız kayma: karolar boşlukların üstünden sola kayar. Kolay bir yolu var: **sıfırları at**, kalanları sırayla
yaz, sonra sonunu yine sıfırla doldur. `[0, 4, 0, 2]` → `[4, 2]` → `[4, 2, 0, 0]`.

Fonksiyonu **saf** (pure) yazacağız: satırı alır, **yeni** bir satır ve kazanılan puanı geri verir; tahtaya ya da
başka hiçbir şeye dokunmaz. Saf fonksiyonlar test etmesi ve güvenmesi en kolay koddur: aynı girdi hep aynı sonucu
verir.

# --code--

```js
// Slides one row to the left. Pure: returns a new row and the points gained, and changes nothing else.
function slideRow(row) {
  const tiles = row.filter((value) => value !== 0)
  const result = []
  let gained = 0
  for (let i = 0; i < tiles.length; i++) {
    result.push(tiles[i])
  }
  while (result.length < SIZE) result.push(0)
  return { row: result, gained }
}
```

# --meaning--

- `filter` makes a new array with only the items for which the arrow function is true: the non-zero tiles.
- The loop copies them into `result` (the merging will go here in the next step).
- `while` repeats as long as its condition holds: it pads `result` with zeros up to `SIZE`.
- `{ row: result, gained }` returns two things at once in an object; `gained` stays 0 for now.

# --meaning-tr--

- `row.filter((value) => value !== 0)` → `filter` yalnız koşulu doğru olan elemanlardan **yeni** bir liste yapar:
  sıfır olmayan karolar. Asıl `row`'a dokunmaz.
- `const result = []` → yeni satır burada kurulacak. `let gained = 0` → bu kaydırmada kazanılan puan.
- `for` döngüsü karoları sırayla `result`'a ekler. (Birleştirme bir sonraki adımda buraya gelecek.)
- `while (result.length < SIZE) result.push(0)` → `while`, koşul doğru olduğu **sürece** tekrarlar: `result` 4
  elemana ulaşana kadar sonuna `0` ekler.
- `return { row: result, gained }` → iki şeyi birden bir **nesne** içinde geri verir: yeni satır ve puan.

# --task--

Write the comment and `slideRow` above `function cellX(col) {`, with an empty line after it.

# --task-tr--

`function cellX(col) {` satırının **üstüne** yorum satırını ve `slideRow` fonksiyonunu yaz; altında bir boş satır
kalsın. **Çalıştır**: ekran değişmez.

# --tests--

Tiles should slide left over the gaps.
tr: Karolar boşlukların üstünden sola kaymalı.

```js
assert.deepEqual(slideRow([0, 0, 0, 2]), { row: [2, 0, 0, 0], gained: 0 })
assert.deepEqual(slideRow([0, 4, 0, 2]), { row: [4, 2, 0, 0], gained: 0 })
assert.deepEqual(slideRow([0, 0, 0, 0]), { row: [0, 0, 0, 0], gained: 0 })
assert.deepEqual(slideRow([2, 4, 8, 16]), { row: [2, 4, 8, 16], gained: 0 })
```

`slideRow()` should not change the row it is given.
tr: `slideRow()` kendisine verilen satırı değiştirmemeli.

```js
const row = [0, 2, 0, 4]
const result = slideRow(row)
assert.deepEqual(row, [0, 2, 0, 4])
assert.notStrictEqual(result.row, row)
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
    result.push(tiles[i])
  }
  while (result.length < SIZE) result.push(0)
  return { row: result, gained }
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
