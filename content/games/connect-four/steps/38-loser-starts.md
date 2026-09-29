---
title: "Build it yourself: the loser starts"
title_tr: "Kendin yap: kaybeden başlasın"
skills: [game.state]
---

# --goal--

Starting is an advantage in Connect Four. Make it fair over a series: the loser of the last game starts the next one.

# --goal-tr--

Dört Bağla'da **ilk oynayan** avantajlıdır. Seriyi adil yapalım: son oyunu **kaybeden** bir sonrakine başlasın. Sen
kazandıysan yeni oyuna bilgisayar başlar (yine yarım saniye düşünerek); bilgisayar kazandıysa ya da ilk oyunsa sen
başlarsın.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `reset`, `turn`, `winner` ve `thinking`. Kontroller çalıştığında yeşile
döner.

# --task--

- After you win, the new game starts with the computer's turn, and the computer plays after its usual pause.
- After the computer wins, after a draw, and in the very first game, you start.

# --task-tr--

- Sen kazandıktan sonra yeni oyunda sıra bilgisayarda başlasın ve bilgisayar her zamanki beklemesinden sonra oynasın.
- Bilgisayar kazandıktan sonra, berabere biten oyundan sonra ve en ilk oyunda sen başla.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

`reset` is where a new game starts, and it can still see the old `winner` before it sets it back to 0. Choose `turn` from
it there, and do not forget the computer's countdown.

# --hint-tr--

Yeni oyun `reset` içinde başlıyor ve orada, `winner`'ı 0'a çekmeden **önce**, eski kazananı hâlâ görebilirsin. `turn`'ü
ona göre seç (`koşul ? 2 : 1` işine yarar). Bilgisayar başlıyorsa onun geri sayımını (`thinking`) da kurmayı unutma.

# --tests--

After you win, the computer should start the next game.
tr: Sen kazanınca sonraki oyuna bilgisayar başlamalı.

```js
board[5][0] = board[5][1] = board[5][2] = 1
play(3)
$.tick(60)
assert.strictEqual(winner, 1)
$.click(100, 300)
assert.strictEqual(winner, 0)
assert.strictEqual(turn, 2)
$.tick(80)
assert.strictEqual(board.flat().filter((cell) => cell === 2).length, 1, 'the computer made the first move')
assert.strictEqual(turn, 1)
```

After the computer wins, you should start.
tr: Bilgisayar kazanınca sen başlamalısın.

```js
turn = 2
board[5][0] = board[5][1] = board[5][2] = 2
play(3)
$.tick(60)
assert.strictEqual(winner, 2)
$.click(100, 300)
assert.strictEqual(turn, 1)
```

The first game and a game after a draw should start with you.
tr: İlk oyun ve beraberlikten sonraki oyun seninle başlamalı.

```js
assert.strictEqual(turn, 1)
winner = 'draw'
reset()
assert.strictEqual(turn, 1)
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
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 is you, player 2 the computer
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
let thinking // frames until the computer moves
let wins = JSON.parse(localStorage.getItem('connect4-wins') || '{"1":0,"2":0}')

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = winner === 1 ? 2 : 1
  winner = 0
  line = []
  falling = null
  thinking = 30
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
    wins[who] += 1
    localStorage.setItem('connect4-wins', JSON.stringify(wins))
  } else if (board[0].every((cell) => cell !== 0)) {
    winner = 'draw'
  } else {
    turn = 3 - turn
    if (turn === 2) thinking = 30
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
  // 3. Do not play right under a square where the player would win.
  const safe = open.filter((col) => {
    const row = dropRow(col)
    if (row === 0) return true
    board[row][col] = 2
    const danger = winsWith(col, 1)
    board[row][col] = 0
    return !danger
  })
  const choices = safe.length > 0 ? safe : open
  // 4. Prefer the middle, where most lines of four pass; a little randomness breaks ties.
  let best = choices[0]
  let bestScore = -Infinity
  for (const col of choices) {
    const score = -Math.abs(col - 3) + Math.random() * 0.5
    if (score > bestScore) {
      best = col
      bestScore = score
    }
  }
  return best
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
  if (turn === 1) play(hoverCol)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    if (winner) reset()
    else if (turn === 1) play(hoverCol)
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
    return
  }
  if (!winner && turn === 2) {
    thinking -= 1
    if (thinking <= 0) play(computerMove())
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
  if (!winner && !falling && turn === 1) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[1])

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
  ctx.fillText('You ' + wins[1] + ' - ' + wins[2] + ' Computer', canvas.width / 2, canvas.height - 12)
  let message = turn === 1 ? 'Your turn' : 'Computer...'
  if (winner === 1) message = 'You win! Click to play again'
  if (winner === 2) message = 'Computer wins. Click to play again'
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
