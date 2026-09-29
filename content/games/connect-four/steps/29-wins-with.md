---
title: Try a move and take it back
title_tr: Hamleyi dene, geri al
skills: [game.state, prog.functions]
---

# --goal--

Now a computer opponent. Its first trick: **try a move and take it back**. Put a disc on the board, ask `wins4`, remove
it again. The computer imagines the move with the same code the real game uses.

# --goal-tr--

Şimdi sarı diskleri **bilgisayar** oynayacak. Onun ilk hilesi: **hamleyi dene ve geri al**. Tahtaya bir disk koy,
`wins4`'e sor, diski geri kaldır. Bilgisayar hamleyi, gerçek oyunun kullandığı kodla "hayal eder".

`winsWith(col, who)` (şununla kazanır mı) "bu sütuna `who` oynasa kazanır mı?" sorusunu cevaplayacak. Bu adımda ekran
değişmez.

# --code--

```js
// Would dropping in this column win for `who`? Try it, look, and take it back.
function winsWith(col, who) {
  const row = dropRow(col)
  if (row === -1) return false
  board[row][col] = who
  const result = wins4(row, col) !== null
  board[row][col] = 0
  return result
}
```

# --meaning--

- A full column cannot win.
- The disc is put in, `wins4` is asked, and the cell is emptied again before returning the answer.

# --meaning-tr--

- `if (row === -1) return false` → dolu sütuna oynanamaz, kazanamaz.
- `board[row][col] = who` → diski **geçici olarak** koy.
- `wins4(row, col) !== null` → "bir dörtlü bulundu mu?" sorusunun evet/hayır (`true`/`false`) cevabı.
- `board[row][col] = 0` → diski geri al; tahta eskisi gibi. Unutursak bilgisayar düşünürken tahtayı bozar!
- `return result` → cevabı ver.

# --task--

Above `function colAt(` write the comment and `winsWith`, followed by an empty line.

# --task-tr--

`function colAt(` satırının **üstüne** yorum satırını ve `winsWith` fonksiyonunu yaz; altında bir boş satır kalsın.
**Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

`winsWith` should tell whether a move would win.
tr: `winsWith` bir hamlenin kazandırıp kazandırmayacağını söylemeli.

```js
board[5][0] = board[5][1] = board[5][2] = 1
assert.isTrue(winsWith(3, 1))
assert.isFalse(winsWith(3, 2))
assert.isFalse(winsWith(5, 1))
```

Trying a move must take it back.
tr: Denenen hamle geri alınmalı.

```js
board[5][0] = board[5][1] = board[5][2] = 1
winsWith(3, 1)
winsWith(4, 2)
assert.strictEqual(board[5][3], 0)
assert.strictEqual(board[5][4], 0)
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
