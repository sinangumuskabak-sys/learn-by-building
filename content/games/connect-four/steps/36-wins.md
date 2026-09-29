---
title: Counting wins
title_tr: Galibiyetleri say
skills: [game.state]
---

# --goal--

The fun is in the series: you against the computer, game after game. Both sides' wins are kept in one object and saved in
`localStorage` after every win, as JSON text, so they survive a page reload.

# --goal-tr--

Tek bir oyun kısa sürer; eğlence **seride**: oyun oyun sen bilgisayara karşı. İki tarafın galibiyetlerini tek bir
**nesnede** tutacağız: `{ 1: 0, 2: 0 }` → senin ve bilgisayarın galibiyet sayısı.

Değişkenler sayfa kapanınca silinir. Tarayıcının her site için tuttuğu küçük bir defteri var: `localStorage`. Ama defter
sadece **yazı** saklar; nesneyi yazıya çevirmemiz gerekir. Bu yazı biçimine **JSON** denir.

# --code--

```js
let wins = JSON.parse(localStorage.getItem('connect4-wins') || '{"1":0,"2":0}')

    wins[who] += 1
    localStorage.setItem('connect4-wins', JSON.stringify(wins))
```

# --meaning--

- `getItem` reads the saved text, or `null` the first time; `|| '{"1":0,"2":0}'` falls back to a zero score.
- `JSON.parse` turns the text into an object, `JSON.stringify` an object into text.
- On a win, the winner's count goes up by one and the whole object is saved.

# --meaning-tr--

- `localStorage.getItem('connect4-wins')` → defterdeki `connect4-wins` kaydını oku. İlk oyunda kayıt yok: `null`.
- `|| '{"1":0,"2":0}'` → `||` "yoksa şunu kullan": sıfır skorlu bir başlangıç yazısı.
- `JSON.parse(...)` → yazıyı nesneye çevirir: `'{"1":0,"2":0}'` → `{ 1: 0, 2: 0 }`.
- `wins[who] += 1` → köşeli parantezle kazananın sayısını 1 artır.
- `JSON.stringify(wins)` → nesneyi yazıya çevirir; `localStorage.setItem(ad, yazı)` → deftere yaz.

# --task--

1. Under `let thinking` write the `wins` line.
2. In `land`, under `line = four`, write the two lines.

# --task-tr--

1. `let thinking ...` satırının altına `wins` satırını yaz.
2. `land` içinde `line = four` satırının altına iki satırı yaz.
3. **Çalıştır**: skor henüz görünmez; bir sonraki adımda yazacağız.

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
