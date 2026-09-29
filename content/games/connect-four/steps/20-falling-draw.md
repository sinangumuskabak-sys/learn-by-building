---
title: Watch it fall
title_tr: Düşüşü izle
skills: [game.canvas]
---

# --goal--

Now we draw the falling disc, over the board, so you can watch it drop into its hole. While a disc falls, the waiting
disc above the board is hidden.

# --goal-tr--

Şimdi düşen diski **çizelim**; tahtanın **üstüne**, ki deliğine girişini izleyebilesin. Bir disk düşerken yukarıda
bekleyen disk gizlensin; aynı anda iki disk görünmesin.

# --code--

```js
if (!falling) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

// The falling disc goes over the board, on its way to its hole.
if (falling) disc(falling.col * CELL + CELL / 2, falling.y, COLORS[falling.who])
```

# --meaning--

- `!falling` means "nothing is falling": only then the waiting disc is drawn.
- The falling disc is drawn after the board, in the middle of its column, at its current `y`, in its player's color.

# --meaning-tr--

- `if (!falling)` → `!` "değil": düşen disk **yoksa** bekleyen diski çiz.
- `if (falling) disc(falling.col * CELL + CELL / 2, falling.y, COLORS[falling.who])` → düşen disk varsa: sütununun
  ortasında, o anki `y` yüksekliğinde, atan oyuncunun renginde.
- Bu satır mavi tahtadan ve deliklerden **sonra**; yoksa tahta diski örterdi.

# --task--

1. In `draw`, put `if (!falling) ` in front of the waiting disc line.
2. After the two loops, leave an empty line and write the comment and the falling disc line.

# --task-tr--

1. `draw` içinde bekleyen diski çizen satırın başına `if (!falling) ` ekle.
2. İki döngüyü kapatan `}`'lerin altına (yazıların üstüne) bir boş satır bırakıp yorum satırını ve düşen disk satırını yaz.
3. **Çalıştır** ve tıkla: disk yukarıdan hızlanarak düşmeli.

# --tests--

The falling disc should be drawn at its height, and the waiting disc hidden.
tr: Düşen disk kendi yüksekliğinde çizilmeli, bekleyen disk gizlenmeli.

```js
$.click(224, 300)
$.tick(5)
const red = $.arcs().filter((a) => a.color === '#ef4444')
assert.deepEqual(red.map((a) => [a.x, a.y]), [[224, falling.y]])
```

After landing, the waiting disc should come back.
tr: İndikten sonra bekleyen disk geri gelmeli.

```js
$.click(224, 300)
$.tick(40)
assert.deepEqual($.arcs().filter((a) => a.y === 64).map((a) => [a.x, a.color]), [[224, '#facc15']])
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
const COLORS = { 1: '#ef4444', 2: '#facc15' }

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
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  ctx.fillText(message, canvas.width / 2, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
