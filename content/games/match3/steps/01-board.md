---
title: A board with no matches
title_tr: Eşleşmesiz bir tahta
skills: [prog.arrays, game.canvas]
---

# --explanation--

A match three game is an 8 by 8 grid of gems in six colors. Swap two neighbouring gems to line up three or more of the same
color and they disappear. The whole game lives in one **2D array**: `board[row][col]` holds a color index from `0` to `5`.

The first surprise: a board filled with plain random colors almost always **already contains** three in a row, and the game
would start by clearing gems the player never touched. So each gem is chosen with a rule. We fill the board row by row, left
to right, so when we place a gem only the cells to its **left** and **above** exist yet. If the two on the left are the same
color as the new gem, or the two above are, we would make a run, so we roll again:

```js
let gem
do gem = randomGem()
while (makesRun(r, c, gem))   // try again until it doesn't make three
```

`do ... while` runs its body at least once and repeats while the condition holds. It always ends: at most two colors are
forbidden, and there are six.

Every cell is `SIZE` pixels; the board starts at `LEFT` and `TOP`, so cell `(r, c)` is at `x = LEFT + c * SIZE`,
`y = TOP + r * SIZE`. A gem is a circle in the middle of its cell.

# --explanation-tr--

Üçlü eşleştirme oyunu altı renkte 8'e 8 bir mücevher ızgarasıdır. Aynı renkten üç ya da daha fazlasını sıraya dizmek için
yan yana iki mücevheri takas edersin, onlar da kaybolur. Bütün oyun tek bir **2 boyutlu dizide** yaşar: `board[row][col]`,
`0`'dan `5`'e bir renk sırası tutar.

İlk sürpriz: düz rastgele renklerle doldurulan bir tahta neredeyse her zaman **zaten** yan yana üç içerir ve oyun, oyuncunun
hiç dokunmadığı mücevherleri temizleyerek başlar. Bu yüzden her mücevher bir kuralla seçilir. Tahtayı satır satır, soldan
sağa dolduruyoruz; yani bir mücevher yerleştirirken yalnızca **solundaki** ve **üstündeki** hücreler vardır. Soldaki iki
mücevher yenisiyle aynı renkteyse ya da üstteki ikisi öyleyse bir sıra oluşturacağız, o yüzden yeniden zar atarız:

```js
let gem
do gem = randomGem()
while (makesRun(r, c, gem))   // üç yapmayana kadar yeniden dene
```

`do ... while` gövdesini en az bir kez çalıştırır ve koşul doğru kaldıkça tekrarlar. Her zaman biter: en fazla iki renk
yasaktır ve altı renk vardır.

Her hücre `SIZE` pikseldir; tahta `LEFT` ve `TOP`'tan başlar, yani `(r, c)` hücresi `x = LEFT + c * SIZE`,
`y = TOP + r * SIZE`'dadır. Bir mücevher, hücresinin ortasında bir dairedir.

# --task--

1. Add `N = 8`, `SIZE = 48`, `LEFT = (canvas.width - N * SIZE) / 2`, `TOP = 72` and the six `COLORS`
   (`'#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'`).
2. Write `randomGem()` (a random index into `COLORS`) and `makesRun(r, c, gem)`: true if the two cells to the left, or the
   two cells above, both hold `gem`.
3. Write `newBoard()`, which builds `board` row by row with the `do ... while` above, and `reset()`, which calls it.
4. Each frame, fill the canvas with `'#1e1b4b'`, then draw every cell as a square (`'#312e81'` when `(r + c)` is even,
   otherwise `'#3730a3'`) and its gem as a circle of radius `SIZE / 2 - 6` in its color.

# --task-tr--

1. `N = 8`, `SIZE = 48`, `LEFT = (canvas.width - N * SIZE) / 2`, `TOP = 72` ve altı `COLORS`'ı
   (`'#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'`) ekle.
2. `randomGem()` (`COLORS` içine rastgele bir sıra) ve `makesRun(r, c, gem)` yaz: soldaki iki hücre ya da üstteki iki hücre
   ikisi de `gem` tutuyorsa true.
3. `board`'u yukarıdaki `do ... while` ile satır satır kuran `newBoard()`'u ve onu çağıran `reset()`'i yaz.
4. Her karede canvas'ı `'#1e1b4b'` ile doldur, sonra her hücreyi bir kare (`(r + c)` çiftse `'#312e81'`, değilse
   `'#3730a3'`) ve mücevherini kendi renginde `SIZE / 2 - 6` yarıçaplı bir daire olarak çiz.

# --tests--

The board should be 8 rows of 8 gems, each a color index from 0 to 5.
tr: Tahta 8 mücevherden 8 satır olmalı; her biri 0'dan 5'e bir renk sırası.

```js
assert.lengthOf(board, 8)
for (const row of board) assert.lengthOf(row, 8)
for (const row of board) for (const gem of row) assert.include([0, 1, 2, 3, 4, 5], gem)
```

A new board should never contain three of a color in a row or a column.
tr: Yeni bir tahta asla bir satırda ya da sütunda aynı renkten üç içermemeli.

```js
for (let i = 0; i < 200; i++) {
  newBoard()
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (c >= 2) assert.isFalse(board[r][c] === board[r][c - 1] && board[r][c] === board[r][c - 2], 'three in a row at row ' + r)
    if (r >= 2) assert.isFalse(board[r][c] === board[r - 1][c] && board[r][c] === board[r - 2][c], 'three in a column at column ' + c)
  }
}
```

Each gem should be drawn as a circle in the middle of its cell, in its color.
tr: Her mücevher kendi hücresinin ortasında, kendi renginde bir daire olarak çizilmeli.

```js
$.tick(1)
const gems = $.arcs().filter((a) => a.r === 18)
assert.lengthOf(gems, 64)
assert.deepInclude(gems, { x: 32, y: 96, r: 18, color: COLORS[board[0][0]] })
assert.deepInclude(gems, { x: 368, y: 432, r: 18, color: COLORS[board[7][7]] })
```

# --seed--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

let board // board[row][col]: a color index

const randomGem = () => Math.floor(Math.random() * COLORS.length)

// Would this gem make three in a row with the two to its left, or the two above it?
function makesRun(r, c, gem) {
  const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
  const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
  return left || up
}

// A new board with no three in a row: each gem avoids the colors that would make one.
function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      let gem
      do gem = randomGem()
      while (makesRun(r, c, gem))
      board[r].push(gem)
    }
  }
}

function reset() {
  newBoard()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
      const gem = board[r][c]
      ctx.fillStyle = COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
