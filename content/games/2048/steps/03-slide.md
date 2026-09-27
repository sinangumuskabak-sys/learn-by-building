---
title: Slide and merge one row
title_tr: Bir satırı kaydır ve birleştir
skills: [prog.functions, prog.arrays]
---

# --explanation--

The whole game hangs on one rule. Sliding a row to the left:

1. every tile slides as far left as it can;
2. two equal neighbours merge into one tile of double the value;
3. a tile that was just made by a merge **cannot merge again in the same move**.

Rule 3 is where most first attempts go wrong:

```
[2, 2, 2, 2]  →  [4, 4, 0, 0]    not [8, 0, 0, 0]
[4, 4, 8, 0]  →  [8, 8, 0, 0]    not [16, 0, 0, 0]
[2, 2, 4, 0]  →  [4, 4, 0, 0]    the new 4 does not merge with the old 4
```

A clean way to get it right: first **drop the zeros**, then walk the tiles left to right. If a tile equals the next
one, write their sum and **skip the next one** (`i++`), so it cannot be used twice. Otherwise write the tile as it is.
Finally, pad with zeros back to four.

Write this as a **pure function**: it takes a row and returns a new row plus the points gained, without touching the
board or any other global. Pure functions are the easiest code to test and to trust: the same input always gives the
same output, so you can check every tricky case directly, as the tests here do.

# --explanation-tr--

Bütün oyun tek bir kurala bağlı. Bir satırı sola kaydırmak:

1. her karo gidebildiği kadar sola kayar;
2. eşit iki komşu, değeri iki katı olan tek bir karoda birleşir;
3. birleşmeyle az önce oluşan bir karo **aynı hamlede yeniden birleşemez**.

İlk denemelerin çoğu 3. kuralda yanılır:

```
[2, 2, 2, 2]  →  [4, 4, 0, 0]    [8, 0, 0, 0] değil
[4, 4, 8, 0]  →  [8, 8, 0, 0]    [16, 0, 0, 0] değil
[2, 2, 4, 0]  →  [4, 4, 0, 0]    yeni 4, eski 4 ile birleşmez
```

Doğru yapmanın temiz bir yolu: önce **sıfırları at**, sonra karoları soldan sağa gez. Bir karo sonrakine eşitse
toplamlarını yaz ve **sonrakini atla** (`i++`); böylece iki kez kullanılamaz. Değilse karoyu olduğu gibi yaz. Son olarak
sıfırlarla yeniden dörde tamamla.

Bunu **saf bir fonksiyon** olarak yaz: bir satır alır ve tahtaya ya da başka bir globale dokunmadan yeni bir satırla
kazanılan puanları döndürür. Saf fonksiyonlar test etmesi ve güvenmesi en kolay koddur: aynı girdi hep aynı çıktıyı
verir; burada testlerin yaptığı gibi her zor durumu doğrudan kontrol edebilirsin.

# --task--

Write `function slideRow(row)` that returns `{ row: newRow, gained }` for sliding `row` to the left: `newRow` is a new
array of `SIZE` numbers following the three rules, and `gained` is the sum of all merged tiles. It must not change the
array it was given.

# --task-tr--

`row`'u sola kaydırmak için `{ row: yeniSatır, gained }` döndüren `function slideRow(row)` yaz: `yeniSatır`, üç kurala
uyan `SIZE` sayılık yeni bir dizi; `gained` ise birleşen bütün karoların toplamı. Kendisine verilen diziyi
değiştirmemeli.

# --tests--

Tiles should slide left over the gaps.
tr: Karolar boşlukların üstünden sola kaymalı.

```js
assert.deepEqual(slideRow([0, 0, 0, 2]), { row: [2, 0, 0, 0], gained: 0 })
assert.deepEqual(slideRow([0, 4, 0, 2]), { row: [4, 2, 0, 0], gained: 0 })
assert.deepEqual(slideRow([0, 0, 0, 0]), { row: [0, 0, 0, 0], gained: 0 })
```

Equal neighbours should merge, even across gaps.
tr: Eşit komşular, aralarında boşluk olsa bile birleşmeli.

```js
assert.deepEqual(slideRow([2, 2, 0, 0]), { row: [4, 0, 0, 0], gained: 4 })
assert.deepEqual(slideRow([2, 0, 0, 2]), { row: [4, 0, 0, 0], gained: 4 })
assert.deepEqual(slideRow([4, 0, 4, 8]), { row: [8, 8, 0, 0], gained: 8 })
```

A merged tile should not merge again in the same move.
tr: Birleşmiş bir karo aynı hamlede yeniden birleşmemeli.

```js
assert.deepEqual(slideRow([2, 2, 2, 2]), { row: [4, 4, 0, 0], gained: 8 })
assert.deepEqual(slideRow([4, 4, 8, 0]), { row: [8, 8, 0, 0], gained: 8 })
assert.deepEqual(slideRow([2, 2, 4, 0]), { row: [4, 4, 0, 0], gained: 4 })
assert.deepEqual(slideRow([2, 2, 2, 0]), { row: [4, 2, 0, 0], gained: 4 })
assert.deepEqual(slideRow([8, 4, 4, 0]), { row: [8, 8, 0, 0], gained: 8 })
```

`slideRow()` should not change the row it is given.
tr: `slideRow()` kendisine verilen satırı değiştirmemeli.

```js
const row = [2, 2, 0, 4]
const result = slideRow(row)
assert.deepEqual(row, [2, 2, 0, 4])
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
