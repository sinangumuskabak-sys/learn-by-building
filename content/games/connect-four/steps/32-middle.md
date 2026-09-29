---
title: Prefer the middle
title_tr: Ortayı tercih et
skills: [game.state]
---

# --goal--

Rule 4: most lines of four pass through the middle columns, so they are the most useful. Each choice gets a score, higher
closer to the middle, plus a little randomness so games differ, and the best score wins.

# --goal-tr--

4. kural: dörtlülerin en çoğu **ortadaki sütunlardan** geçer; o yüzden orta sütunlar en değerli. Her seçeneğe bir **puan**
vereceğiz: ortaya yakın olan yüksek. Oyunlar hep aynı gitmesin diye küçük bir rastgelelik de ekleyeceğiz. En yüksek puanlı
sütun seçilir.

# --code--

```js
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
```

# --meaning--

- `-Math.abs(col - 3)` is 0 for the middle column and -1, -2, -3 towards the edges.
- `Math.random() * 0.5` adds up to 0.5, enough to pick between equal columns but never to beat a column nearer the middle.
- The loop keeps the column with the highest score so far, starting from `-Infinity`, below every number.

# --meaning-tr--

- `Math.abs(sayı)` → eksi işaretini atar: `Math.abs(-2)` → `2`. `-Math.abs(col - 3)` ortadaki sütun (3) için `0`,
  kenarlara doğru `-1`, `-2`, `-3`: ortaya en yüksek puan.
- `Math.random()` → 0 ile 1 arasında rastgele bir sayı; `* 0.5` → en fazla 0.5 ek. Eşit sütunlar (2 ile 4 gibi) arasında
  şans karar verir, ama ortaya daha yakın bir sütunu asla geçemez.
- `let bestScore = -Infinity` → "eksi sonsuz", her sayıdan küçük: ilk sütun mutlaka "şimdiye kadarki en iyi" olur.
- `if (score > bestScore) { ... }` → daha iyisini bulunca onu ve puanını sakla.
- `return best` → en iyi sütun.

# --task--

In `computerMove`, replace `return choices[0]` with the scoring lines.

# --task-tr--

`computerMove` içindeki `return choices[0]` satırını sil; yerine yorum satırını ve puanlama satırlarını yaz. **Çalıştır**:
ekran değişmez, kontroller yeşil olmalı.

# --tests--

On an empty board the computer should take the middle.
tr: Boş bir tahtada bilgisayar ortayı almalı.

```js
assert.strictEqual(computerMove(), 3)
```

Otherwise it should play as close to the middle as it safely can.
tr: Yoksa güvenle oynayabileceği en orta sütuna oynamalı.

```js
board[5] = [2, 2, 1, 0, 0, 0, 0]
board[4] = [1, 1, 1, 0, 0, 0, 0]
for (let i = 0; i < 20; i++) {
  const col = computerMove()
  assert.notStrictEqual(col, 3, 'a disc in column 3 would let red win on top of it')
  assert.include([2, 4], col, 'otherwise as close to the middle as possible')
}
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
