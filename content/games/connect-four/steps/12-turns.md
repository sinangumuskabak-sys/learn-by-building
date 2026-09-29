---
title: Taking turns
title_tr: Sırayla
skills: [game.state]
---

# --goal--

Two players take turns. `turn` is 1 (red) or 2 (yellow); after each move `turn = 3 - turn` switches it without an `if`:
3 − 1 is 2 and 3 − 2 is 1.

# --goal-tr--

İki oyuncu sırayla oynar. Sırası gelen oyuncuyu `turn` (sıra) tutacak: 1 kırmızı, 2 sarı. Kırmızı başlar.

Her hamleden sonra sıra değişir. Küçük bir hile: `turn = 3 - turn` bir `if` olmadan ikisi arasında gidip gelir:
3 − 1 = 2, 3 − 2 = 1.

# --code--

```js
let turn

  turn = 1

  board[row][col] = turn
  turn = 3 - turn
```

# --meaning--

- `reset` starts with red (1). `play` puts the current player's disc and passes the turn.

# --meaning-tr--

- `let turn` → sıra kimde. `reset` içinde `turn = 1`: her oyun kırmızıyla başlar.
- `board[row][col] = turn` → hücreye sırası gelen oyuncunun numarası.
- `turn = 3 - turn` → sağ taraf önce hesaplanır, sonuç `turn`'e yazılır: 1 idiyse 2, 2 idiyse 1 olur.

# --task--

1. Under `let board` write `let turn`; in `reset`, under `board = ...`, write `turn = 1`.
2. In `play`, put `turn` instead of `1` and switch the turn after it.

# --task-tr--

1. `let board ...` satırının altına `let turn` yaz.
2. `reset` içinde `board = ...` satırının altına `turn = 1` yaz.
3. `play` içinde `board[row][col] = 1` satırındaki `1` yerine `turn` yaz; altına `turn = 3 - turn` ekle.
4. **Çalıştır**.

# --tests--

The players should take turns, starting with red.
tr: Oyuncular kırmızıdan başlayarak sırayla oynamalı.

```js
assert.strictEqual(turn, 1)
play(3)
assert.strictEqual(board[5][3], 1)
assert.strictEqual(turn, 2)
play(3)
assert.strictEqual(board[4][3], 2)
assert.strictEqual(turn, 1)
```

A full column should not pass the turn.
tr: Dolu bir sütun sırayı geçirmemeli.

```js
for (let i = 0; i < 6; i++) play(0)
const before = turn
play(0)
assert.strictEqual(turn, before)
assert.deepEqual(board.map((row) => row[0]), [2, 1, 2, 1, 2, 1])
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

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
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
