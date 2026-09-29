---
title: Whose turn?
title_tr: Sıra kimde?
skills: [game.canvas]
---

# --goal--

At the top, a message says whose turn it is: `Red's turn` or `Yellow's turn`.

# --goal-tr--

En üste sıranın kimde olduğunu yazalım: `Red's turn` (sıra kırmızıda) ya da `Yellow's turn` (sıra sarıda).

# --code--

```js
ctx.fillStyle = 'white'
ctx.font = 'bold 18px sans-serif'
ctx.textAlign = 'center'
let message = turn === 1 ? "Red's turn" : "Yellow's turn"
ctx.fillText(message, canvas.width / 2, 26)
```

# --meaning--

- `font` sets the letters, `textAlign = 'center'` makes `x` the middle of the text, `fillText(text, x, y)` paints it.
- `message` is chosen with `? :`. The texts use double quotes because they contain a single quote.

# --meaning-tr--

- `ctx.font = 'bold 18px sans-serif'` → kalın, 18 piksel yazı.
- `ctx.textAlign = 'center'` → verilen `x` yazının **ortası** olur; yazı tam ortalanır.
- `let message = turn === 1 ? "Red's turn" : "Yellow's turn"` → sıra 1'deyse ilk yazı, değilse ikincisi. `let`, çünkü
  ileride oyun bitince başka bir yazıyla değiştireceğiz.
- Yazılar **çift tırnakla** yazıldı, çünkü içlerinde tek tırnak (`'`) var; tek tırnakla yazsaydık yazı orada biterdi.
- `ctx.fillText(message, canvas.width / 2, 26)` → yazıyı ekranın ortasına, üstten 26 piksele boyar.

# --task--

At the end of `draw`, after the loops, leave an empty line and write the five lines.

# --task-tr--

`draw` içinde, iki döngüyü kapatan `}`'lerden sonra (`draw`'un son `}`'sinden önce) bir boş satır bırakıp beş satırı yaz.
**Çalıştır**: üstte `Red's turn` yazmalı; bir hamleden sonra `Yellow's turn`.

# --tests--

The message should say whose turn it is.
tr: Yazı sıranın kimde olduğunu söylemeli.

```js
$.tick(1)
assert.include($.texts(), "Red's turn")
play(0)
$.tick(1)
assert.include($.texts(), "Yellow's turn")
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
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2
let turn
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

function play(col) {
  if (dropRow(col) === -1) return
  const row = dropRow(col)
  board[row][col] = turn
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
  disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  ctx.fillText(message, canvas.width / 2, 26)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
