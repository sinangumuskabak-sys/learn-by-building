---
title: We have a winner
title_tr: Kazanan var
skills: [game.state]
---

# --goal--

When a disc lands, `land` asks `wins4`. If there is a line of four, that player is the `winner` and the line is kept;
otherwise the turn passes. Once there is a winner, `play` does nothing.

# --goal-tr--

Bir disk inince `land` artık `wins4`'e soracak. Dörtlü varsa o oyuncu **kazanır**: `winner` (kazanan) onun numarası olur,
dört hücre de `line`'da saklanır. Yoksa sıra eskisi gibi geçer.

Kazanan belli olunca oyun durur: `play` artık hamle kabul etmez.

# --code--

```js
let winner // 0 while playing, 1 or 2, or 'draw'
let line // the four winning cells

  winner = 0
  line = []

function play(col) {
  if (winner || falling || dropRow(col) === -1) return

  falling = null
  const four = wins4(row, col)
  if (four) {
    winner = who
    line = four
  } else {
    turn = 3 - turn
  }
```

# --meaning--

- `winner` is 0 while playing. 0 counts as false, so `if (winner ...)` in `play` means "the game is over".
- `if ... else`: a win sets `winner` and `line`, otherwise the turn passes.

# --meaning-tr--

- `let winner` → oynanırken `0`, sonra kazananın numarası (1 ya da 2). `let line` → kazanan dört hücre; `reset` içinde
  boş liste `[]`.
- `if (winner || falling || ...) return` → `0` yanlış sayıldığı için `winner` "oyun bitti mi?" sorusu olur.
- `const four = wins4(row, col)` → inen diskten geçen dörtlü var mı?
- `if (four) { ... } else { ... }` → varsa kazanan ve çizgi kaydedilir; **değilse** (`else`) sıra geçer.

# --task--

1. Under `let turn` write `let winner` and `let line`; in `reset`, under `turn = 1`, write `winner = 0` and `line = []`.
2. In `play`, add `winner || ` at the start of the check.
3. In `land`, replace `turn = 3 - turn` with the `if ... else`.

# --task-tr--

1. `let turn` satırının altına `let winner ...` ve `let line ...` satırlarını yaz.
2. `reset` içinde `turn = 1` satırının altına `winner = 0` ve `line = []` yaz.
3. `play`'in ilk satırında `falling ||`'in önüne `winner || ` ekle.
4. `land` içindeki `turn = 3 - turn` satırını sil; yerine `four` satırını ve `if ... else` bloğunu yaz.
5. **Çalıştır** ve dört tane yan yana getir: oyun durmalı. (Kazananı birazdan göstereceğiz.)

# --tests--

Four across should win, even when the last disc goes into the middle.
tr: Yatay dört kazandırmalı, son disk ortaya gitse bile.

```js
board[5][0] = 1
board[5][1] = 1
board[5][3] = 1
play(2)
$.tick(60)
assert.strictEqual(winner, 1)
assert.sameDeepMembers(line, [[5, 0], [5, 1], [5, 2], [5, 3]])
```

After a win, no more discs should drop.
tr: Kazanmadan sonra disk bırakılmamalı.

```js
board[5][0] = board[5][1] = board[5][3] = 1
play(2)
$.tick(60)
play(5)
assert.isNull(falling)
assert.strictEqual(board[5][5], 0)
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
  } else {
    turn = 3 - turn
  }
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
