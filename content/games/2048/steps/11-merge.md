---
title: Merge equal tiles
title_tr: Eşit karoları birleştir
skills: [prog.loops]
---

# --goal--

Two equal neighbours merge into one tile of double the value, and a tile made by a merge **cannot merge again in the
same move**: `[2, 2, 2, 2]` becomes `[4, 4, 0, 0]`, not `[8, 0, 0, 0]`.

# --goal-tr--

Şimdi oyunun kalbi: **birleştirme**. İki eşit komşu karo tek bir karoda birleşir, değeri iki katına çıkar. Ama bir
kural var ve ilk denemelerin çoğu burada yanılır: **birleşmeden yeni çıkan karo aynı hamlede bir daha birleşemez.**

```
[2, 2, 2, 2]  →  [4, 4, 0, 0]    [8, 0, 0, 0] değil
[4, 4, 8, 0]  →  [8, 8, 0, 0]    [16, 0, 0, 0] değil
```

Sıfırları zaten attık; karoları soldan sağa yürürken bir karo **bir sonrakine** eşitse toplamlarını yazıp sonrakini
**atlarız**. Böylece bir karo iki kez kullanılamaz.

# --code--

```js
if (tiles[i] === tiles[i + 1]) {
  result.push(tiles[i] * 2)
  gained += tiles[i] * 2
  i++ // the next tile was used up by this merge
} else {
  result.push(tiles[i])
}
```

# --meaning--

- If a tile equals the next one, their sum goes into `result` and is added to `gained`.
- `i++` inside the loop skips the next tile, which was used up by the merge. So a merged tile is never looked at again.
- Otherwise the tile is copied as it is. For the last tile `tiles[i + 1]` is `undefined`, never equal.

# --meaning-tr--

- `if (tiles[i] === tiles[i + 1])` → bu karo bir sonrakiyle aynı mı?
- `result.push(tiles[i] * 2)` → birleşmiş karo: iki katı. `gained += tiles[i] * 2` → birleşmenin değeri puana eklenir.
- `i++` → döngünün kendi `i++`'sına ek olarak bir kez daha artırır: **sonraki karoyu atla**, çünkü birleşmede
  kullanıldı. Yeni çıkan 4 `result`'ta durur, `tiles`'a hiç geri bakılmaz; bu yüzden aynı hamlede yeniden
  birleşemez.
- `else` → eşit değilse karoyu olduğu gibi yaz.
- Son karoda `tiles[i + 1]` listenin dışına düşer ve `undefined` verir; hiçbir sayıya eşit değildir.

# --task--

In `slideRow`, replace `result.push(tiles[i])` in the loop with the `if ... else` block.

# --task-tr--

`slideRow` içindeki döngüde `result.push(tiles[i])` satırını sil; yerine `if ... else` bloğunu yaz. **Çalıştır**.

# --predict--

What does `slideRow([2, 2, 2, 0])` give?
- [ ] `[6, 0, 0, 0]`
- [ ] `[2, 4, 0, 0]`
- [x] `[4, 2, 0, 0]`
  The first two merge (left first), and the third 2 has no partner left.

# --predict-tr--

`slideRow([2, 2, 2, 0])` ne verir?
- [ ] `[6, 0, 0, 0]`
- [ ] `[2, 4, 0, 0]`
- [x] `[4, 2, 0, 0]`
  Önce soldaki iki 2 birleşir; üçüncü 2'nin eşi kalmaz.

# --hint--

If `[2, 2, 2, 2]` gives `[8, 0, 0, 0]`, you are merging a tile that was just made. Did you write `i++` inside the `if`?

# --hint-tr--

`[2, 2, 2, 2]` `[8, 0, 0, 0]` veriyorsa yeni çıkan karoyu yeniden birleştiriyorsun. `if`'in içine `i++` yazdın mı?

# --tests--

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
