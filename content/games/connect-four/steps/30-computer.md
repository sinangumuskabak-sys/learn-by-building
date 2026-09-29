---
title: Win, or block
title_tr: Kazan ya da engelle
skills: [game.state, prog.arrays]
---

# --goal--

`computerMove()` picks a column. The first two rules: if the computer can win with a move, play it; if the player could
win next move, block that column. For now, otherwise it takes the first open column.

# --goal-tr--

`computerMove()` (bilgisayarın hamlesi) bir sütun seçecek. İyi bir rakibin çok zeki olması gerekmez, **mantıklı** olması
yeter. İlk iki kural:

1. Bu hamleyle **kazanabiliyorsam**, oyna.
2. Oyuncu bir sonraki hamlede kazanabilecekse, o sütunu **kapat**.

Hiçbiri yoksa şimdilik ilk açık sütunu seçiyor; daha iyisini sonraki adımlarda yapacağız. Bu adımda ekran değişmez.

# --code--

```js
function computerMove() {
  const open = [...Array(COLS).keys()].filter((col) => dropRow(col) !== -1)
  // 1. Win if we can. 2. Block the player's win.
  for (const who of [2, 1]) {
    const col = open.find((c) => winsWith(c, who))
    if (col !== undefined) return col
  }
  return open[0]
}
```

# --meaning--

- `[...Array(COLS).keys()]` is `[0, 1, 2, 3, 4, 5, 6]`; `filter` keeps the columns that are not full.
- The loop tries the computer (2) first, then the player (1): `find` gives the first column where that player would win.
- `find` returns `undefined` when nothing matches; column 0 is a real answer, so we check `!== undefined`.

# --meaning-tr--

- `[...Array(COLS).keys()]` → `[0, 1, 2, 3, 4, 5, 6]`: bütün sütun numaralarının listesi.
- `.filter((col) => dropRow(col) !== -1)` → testi geçenlerden **yeni bir liste**: dolu olmayan sütunlar (`open`, açık).
- `for (const who of [2, 1])` → önce bilgisayar (2) için: kazanabilir miyim? Sonra oyuncu (1) için: o kazanabilir mi?
  Oyuncunun kazanacağı sütuna oynamak onu **engeller**.
- `open.find((c) => winsWith(c, who))` → testi geçen **ilk** sütun; yoksa `undefined` ("yok").
- `if (col !== undefined) return col` → bulunduysa onu seç. Sadece `if (col)` yazamayız, çünkü `0` da geçerli bir sütun
  ama yanlış sayılır.
- `return open[0]` → yoksa ilk açık sütun (geçici).

# --task--

Above `function colAt(` write `computerMove`, followed by an empty line.

# --task-tr--

`function colAt(` satırının **üstüne** `computerMove` fonksiyonunu yaz; altında bir boş satır kalsın. **Çalıştır**:
ekran değişmez, kontroller yeşil olmalı.

# --tests--

The computer should take a win.
tr: Bilgisayar kazancı almalı.

```js
board[5][0] = board[5][1] = board[5][2] = 2
assert.strictEqual(computerMove(), 3)
```

The computer should block your win.
tr: Bilgisayar senin kazancını engellemeli.

```js
board[5][4] = board[5][5] = board[5][6] = 1
assert.strictEqual(computerMove(), 3)
assert.strictEqual(board[5][3], 0, 'trying a move must take it back')
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
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
]

let board // board[row][col]: 0 empty, 1 or 2
let turn
let winner // 0 while playing, 1 or 2, or 'draw'
let line // the four winning cells
let falling // the disc on its way down, or null
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  winner = 0
  line = []
  falling = null
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

const inside = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLS

// Count the discs in a row through (row, col) in one direction and its opposite.
function lineThrough(row, col, [dx, dy]) {
  const who = board[row][col]
  const cells = [[row, col]]
  for (const sign of [1, -1]) {
    let r = row + dy * sign
    let c = col + dx * sign
    while (inside(r, c) && board[r][c] === who) {
      cells.push([r, c])
      r += dy * sign
      c += dx * sign
    }
  }
  return cells
}

function wins4(row, col) {
  for (const dir of DIRECTIONS) {
    const cells = lineThrough(row, col, dir)
    if (cells.length >= 4) return cells
  }
  return null
}

function play(col) {
  if (winner || falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
  const four = wins4(row, col)
  if (four) {
    winner = who
    line = four
  } else if (board[0].every((cell) => cell !== 0)) {
    winner = 'draw'
  } else {
    turn = 3 - turn
  }
}

// Would dropping in this column win for `who`? Try it, look, and take it back.
function winsWith(col, who) {
  const row = dropRow(col)
  if (row === -1) return false
  board[row][col] = who
  const result = wins4(row, col) !== null
  board[row][col] = 0
  return result
}

function computerMove() {
  const open = [...Array(COLS).keys()].filter((col) => dropRow(col) !== -1)
  // 1. Win if we can. 2. Block the player's win.
  for (const who of [2, 1]) {
    const col = open.find((c) => winsWith(c, who))
    if (col !== undefined) return col
  }
  return open[0]
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
  if (winner) {
    reset()
    return
  }
  hoverCol = colAt(event)
  play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    if (winner) reset()
    else play(hoverCol)
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

  for (const [row, col] of line) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(col * CELL + CELL / 2, TOP + row * CELL + CELL / 2, CELL / 2 - 10, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  if (winner === 1) message = 'Red wins! Click to play again'
  if (winner === 2) message = 'Yellow wins! Click to play again'
  if (winner === 'draw') message = 'Draw. Click to play again'
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
