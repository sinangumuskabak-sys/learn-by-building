---
title: Making discs fall
title_tr: Diskleri düşürmek
skills: [game.physics, game.state]
---

# --explanation--

A disc that simply appears in its hole feels flat. A disc that **falls**, speeding up like a real one, makes every move
satisfying, and it only takes the same two lines of gravity as in Flappy Bird:

```js
falling.vy += GRAVITY
falling.y += falling.vy
```

`play` no longer changes the board. It creates `falling`, a disc on its way down that already knows its target `row`.
When its `y` reaches the middle of that hole, it **lands**: the board changes and the turn passes. Splitting "the move is
decided" from "the move is finished" is useful in every animated game.

While a disc is falling, `play` does nothing, so impatient clicks cannot drop two discs at once. The falling disc is drawn
over the board, on its way into its hole.

# --explanation-tr--

Deliğinde birden beliren bir disk yavan hissettirir. Gerçeği gibi hızlanarak **düşen** bir disk her hamleyi tatmin edici
yapar ve bunun için Flappy Bird'deki yerçekiminin aynı iki satırı yeter:

```js
falling.vy += GRAVITY
falling.y += falling.vy
```

`play` artık tahtayı değiştirmez. Hedef `row`'unu zaten bilen, aşağı giden bir disk olan `falling`'i yaratır. `y`'si o deliğin
ortasına ulaşınca **yere iner**: tahta değişir ve sıra geçer. "Hamleye karar verildi"yi "hamle bitti"den ayırmak her
animasyonlu oyunda işe yarar.

Bir disk düşerken `play` hiçbir şey yapmaz; böylece sabırsız tıklamalar aynı anda iki disk bırakamaz. Düşen disk tahtanın
üstüne, deliğine giderken çizilir.

# --task--

1. Add `GRAVITY = 1.2` and `falling` (`null` in `reset()`).
2. `play(col)` does nothing while a disc is falling or the column is full; otherwise it sets
   `falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }`.
3. Write `land()`: put `falling.who` on the board at its row and column, clear `falling` and switch `turn`.
4. Write `update()`: while a disc is falling, apply gravity; once `y` reaches the middle of its hole
   (`TOP + row * CELL + CELL / 2`), snap it there and `land()`. Call it every frame.
5. Draw the falling disc over the board, and the hovering disc only when nothing is falling.

# --task-tr--

1. `GRAVITY = 1.2` ve `falling` (`reset()`'te `null`) ekle.
2. `play(col)` bir disk düşerken ya da sütun doluyken hiçbir şey yapmaz; değilse
   `falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }` ayarlar.
3. `land()` yaz: `falling.who`'yu tahtada satırına ve sütununa koy, `falling`'i temizle ve `turn`'ü değiştir.
4. `update()` yaz: bir disk düşerken yerçekimi uygula; `y` deliğinin ortasına (`TOP + row * CELL + CELL / 2`) ulaşınca onu
   oraya oturt ve `land()` çağır. Her karede çağır.
5. Düşen diski tahtanın üstüne, süzülen diski yalnızca hiçbir şey düşmezken çiz.

# --tests--

A disc should fall faster and faster, and land in its hole.
tr: Bir disk gittikçe hızlanarak düşmeli ve deliğine inmeli.

```js
$.click(224, 300)
assert.isNotNull(falling)
assert.strictEqual(board[5][3], 0, 'not on the board until it lands')
$.tick(5)
assert.closeTo(falling.y, -32 + 1.2 * 15, 1e-9)
const drawn = $.arcs().filter((a) => a.color === '#ef4444')
assert.deepEqual(drawn.map((a) => a.x), [224])
$.tick(22)
assert.isNotNull(falling)
$.tick(1)
assert.isNull(falling)
assert.strictEqual(board[5][3], 1)
assert.strictEqual(turn, 2)
```

No second disc should drop while one is falling.
tr: Biri düşerken ikinci bir disk bırakılmamalı.

```js
$.click(224, 300)
$.click(288, 300)
$.tick(60)
assert.strictEqual(board[5][3], 1)
assert.strictEqual(board[5][4], 0)
assert.strictEqual(turn, 2)
```

A disc dropped on a stack should stop on top of it.
tr: Bir yığına bırakılan disk onun üstünde durmalı.

```js
board[5][2] = 1
board[4][2] = 2
play(2)
assert.strictEqual(falling.row, 3)
$.tick(60)
assert.strictEqual(board[3][2], 1)
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc
const GRAVITY = 1.2
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 red, player 2 yellow

let board // board[row][col]: 0 empty, 1 or 2
let turn
let falling // the disc on its way down, or null
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  falling = null
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

function play(col) {
  if (falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
  turn = 3 - turn
}

function colAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  return Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)))
}

canvas.addEventListener('pointermove', (event) => {
  hoverCol = colAt(event)
})
canvas.addEventListener('pointerdown', (event) => {
  hoverCol = colAt(event)
  play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    play(hoverCol)
  }
})

function update() {
  if (falling) {
    falling.vy += GRAVITY
    falling.y += falling.vy
    const bottom = TOP + falling.row * CELL + CELL / 2
    if (falling.y >= bottom) {
      falling.y = bottom
      land()
    }
  }
}

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The next disc waits above the column it would drop into.
  if (!falling) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  // The falling disc goes over the board, on its way to its hole.
  if (falling) disc(falling.col * CELL + CELL / 2, falling.y, COLORS[falling.who])

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(turn === 1 ? "Red's turn" : "Yellow's turn", canvas.width / 2, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
