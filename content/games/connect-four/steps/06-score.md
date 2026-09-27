---
title: Keeping score
title_tr: Skor tutmak
skills: [game.state]
---

# --explanation--

A single game of Connect Four is short, so the fun is in the **series**: you against the computer, game after game. Keep
the wins of both sides in one object and save it after every win:

```js
let wins = JSON.parse(localStorage.getItem('connect4-wins') || '{"1":0,"2":0}')
wins[who] += 1
localStorage.setItem('connect4-wins', JSON.stringify(wins))
```

Storing an **object** as JSON keeps related numbers together under one key. The same pattern works for any settings or
statistics a game wants to remember: one object, one `JSON.stringify`, one `JSON.parse` with a sensible default.

# --explanation-tr--

Tek bir Dört Bağla oyunu kısadır; bu yüzden eğlence **seride**dir: oyun üstüne oyun, sen bilgisayara karşı. İki tarafın
galibiyetlerini tek bir nesnede tut ve her galibiyetten sonra kaydet:

```js
let wins = JSON.parse(localStorage.getItem('connect4-wins') || '{"1":0,"2":0}')
wins[who] += 1
localStorage.setItem('connect4-wins', JSON.stringify(wins))
```

Bir **nesneyi** JSON olarak saklamak ilgili sayıları tek bir anahtar altında bir arada tutar. Aynı kalıp bir oyunun hatırlamak
istediği her ayar ya da istatistik için çalışır: bir nesne, bir `JSON.stringify`, makul bir varsayılanla bir `JSON.parse`.

# --task--

1. Add `wins`, read from `localStorage` `'connect4-wins'` as above.
2. When someone wins, add 1 to their count and save the whole object.
3. Draw `You 2 - 1 Computer` centered at the bottom of the canvas (`y = canvas.height - 12`).

# --task-tr--

1. Yukarıdaki gibi `localStorage` `'connect4-wins'`'ten okunan `wins`'i ekle.
2. Biri kazandığında onun sayısına 1 ekle ve bütün nesneyi kaydet.
3. `You 2 - 1 Computer`'ı canvas'ın altında ortalı çiz (`y = canvas.height - 12`).

# --tests--

A win should be counted and saved.
tr: Bir galibiyet sayılmalı ve kaydedilmeli.

```js
assert.deepEqual(wins, { 1: 0, 2: 0 })
board[5][0] = board[5][1] = board[5][2] = 1
play(3)
$.tick(60)
assert.strictEqual(winner, 1)
assert.deepEqual(wins, { 1: 1, 2: 0 })
assert.deepEqual(JSON.parse(localStorage.getItem('connect4-wins')), { 1: 1, 2: 0 })
assert.include($.texts(), 'You 1 - 0 Computer')
```

The computer's wins should count too, across games.
tr: Bilgisayarın galibiyetleri de oyunlar boyunca sayılmalı.

```js
wins = { 1: 3, 2: 4 }
reset()
turn = 2
board[5][0] = board[5][1] = board[5][2] = 2
play(3)
$.tick(60)
assert.deepEqual(wins, { 1: 3, 2: 5 })
$.tick(1)
assert.include($.texts(), 'You 3 - 5 Computer')
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
  turn = 1
  winner = 0
  line = []
  falling = null
  thinking = 0
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
