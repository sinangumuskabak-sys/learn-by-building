---
title: Neighbours
title_tr: Komşular
skills: [prog.loops, prog.arrays]
---

# --goal--

Almost every question in Minesweeper is about a cell's neighbours: the up to eight cells around it. Two loops over the
offsets -1, 0, 1 find them, skipping the cell itself and anything off the board.

# --goal-tr--

Mayın Tarlası'ndaki hemen her soru bir hücrenin **komşularıyla** ilgili: çevresindeki en fazla 8 hücre. Sayılar
komşulardaki mayınları sayar; boş bir alan komşulara doğru açılır.

Komşuları bulmak için satıra ve sütuna −1, 0 ya da +1 ekleriz: 3 × 3 = 9 ihtimal. Birini (0, 0, yani hücrenin
kendisi) atlarız; tahtanın dışına taşanları da.

# --code--

```js
// The up to 8 cells around a cell, skipping the ones that would be off the board.
function neighbors(cell) {
  const list = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const row = cell.row + dr
      const col = cell.col + dc
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
    }
  }
  return list
}
```

# --meaning--

- Two counting loops: `dr` (row offset) and `dc` (column offset) each take -1, 0 and 1.
- `continue` skips the rest of this turn: the offset (0, 0) is the cell itself.
- The bounds check keeps corner cells at 3 neighbours and edge cells at 5. Without it, `grid[-1]` is `undefined` and
  the next line crashes.

# --meaning-tr--

- `for (let dr = -1; dr <= 1; dr++)` → sayarak dönen döngü: `dr` (satır farkı) −1'den başlar, 1'e kadar (`<=` "küçük
  ya da eşit"), her turda 1 artar (`++`). Üç tur: −1, 0, 1.
- İçteki döngü aynısını `dc` (sütun farkı) için yapar: toplam 9 kombinasyon.
- `if (dr === 0 && dc === 0) continue` → iki fark da 0'sa bu hücrenin kendisi. `continue` → "**bu turu bırak**, bir
  sonraki tura geç".
- `row >= 0 && row < SIZE && col >= 0 && col < SIZE` → komşu tahtanın **içinde mi**? Bu kontrol sayesinde köşedeki
  hücrenin 3, kenardakinin 5 komşusu olur. Unutulursa `grid[-1]` okunur, `undefined` gelir ve program çöker.
- `list.push(grid[row][col])` → komşuyu listeye ekle. `return list` → listeyi geri ver.

# --task--

Under the `newGame` function, leave an empty line and write the comment and `neighbors`. Press **Run**.

# --task-tr--

`newGame` fonksiyonunun kapanan `}`'sinin altına bir boş satır bırakıp yorum satırını ve `neighbors` fonksiyonunu yaz.
**Çalıştır**. Ekran değişmez; kontroller komşuları sayıyor.

# --predict--

What happens if you leave out the bounds check (`row >= 0 && ...`) and call `neighbors(grid[0][0])`?
- [ ] It returns 8 cells
- [x] It crashes
  `grid[-1]` is `undefined`, and reading `[col]` from `undefined` is an error.
- [ ] It returns 3 cells anyway

# --predict-tr--

Sınır kontrolünü (`row >= 0 && ...`) çıkarıp `neighbors(grid[0][0])` çağırırsan ne olur?
- [ ] 8 hücre döner
- [x] Program çöker
  `grid[-1]` `undefined`'dır; `undefined`'dan `[col]` okumak hatadır.
- [ ] Yine 3 hücre döner

# --tests--

Corner, edge and middle cells should have 3, 5 and 8 neighbours.
tr: Köşe, kenar ve ortadaki hücrelerin 3, 5 ve 8 komşusu olmalı.

```js
assert.lengthOf(neighbors(grid[0][0]), 3)
assert.lengthOf(neighbors(grid[0][4]), 5)
assert.lengthOf(neighbors(grid[4][4]), 8)
assert.lengthOf(neighbors(grid[8][8]), 3)
assert.sameMembers(neighbors(grid[0][0]), [grid[0][1], grid[1][0], grid[1][1]])
assert.notInclude(neighbors(grid[4][4]), grid[4][4])
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

// The up to 8 cells around a cell, skipping the ones that would be off the board.
function neighbors(cell) {
  const list = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const row = cell.row + dr
      const col = cell.col + dc
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
    }
  }
  return list
}

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
