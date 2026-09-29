---
title: Two tiles to start
title_tr: Başlangıçta iki karo
skills: [game.state]
---

# --goal--

A game starts with two tiles in random cells.

# --goal-tr--

Her oyun **iki karoyla** başlar. `newGame`'in sonunda `addTile`'ı iki kez çağırıyoruz. Sayfayı her çalıştırışta
karolar başka yerlerde çıkacak.

# --code--

```js
function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  addTile()
  addTile()
}
```

# --meaning--

- Two calls, two tiles: the second call only sees the cells still empty after the first.

# --meaning-tr--

- İki çağrı, iki karo. İkinci `addTile` birincinin doldurduğu hücreyi artık boş saymaz, bu yüzden iki karo asla aynı
  yere düşmez.

# --task--

At the end of `newGame`, under the `board = ...` line, call `addTile()` twice.

# --task-tr--

`newGame`'in sonunda, `board = ...` satırının altına iki kez `addTile()` yaz. **Çalıştır**: tahtada iki karo görmelisin.

# --predict--

Can the two tiles land in the same cell?
- [ ] Yes, sometimes
- [x] No
  The second `addTile` asks `emptyCells` again, and the first tile's cell is no longer empty.

# --predict-tr--

İki karo aynı hücreye düşebilir mi?
- [ ] Evet, bazen
- [x] Hayır
  İkinci `addTile` `emptyCells`'e yeniden sorar; ilk karonun hücresi artık boş değil.

# --tests--

A new game should start with exactly two tiles, 2s or 4s.
tr: Yeni bir oyun, 2 ya da 4 olan tam iki karoyla başlamalı.

```js
for (let i = 0; i < 20; i++) {
  newGame()
  const tiles = board.flat().filter((v) => v !== 0)
  assert.lengthOf(tiles, 2)
  assert.isTrue(tiles.every((v) => v === 2 || v === 4))
}
```

The two tiles should be on the screen.
tr: İki karo ekranda olmalı.

```js
assert.lengthOf($.rects('#cdc1b4'), 14)
assert.lengthOf($.texts(), 2)
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
