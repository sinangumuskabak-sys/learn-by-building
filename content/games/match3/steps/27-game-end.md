---
title: The end of a game
title_tr: Oyunun sonu
skills: [game.state, game.input]
---

# --goal--

When the moves are used up and the last cascade has landed, the game is over: a line says so, and a click starts a
new game.

# --goal-tr--

Hamleler bitince oyun biter. Ama sıra önemli: son hamlenin **zincirleri bitene** kadar bekleriz, çünkü onlar hâlâ
puana ekleniyor olabilir. Yani oyun, `movesLeft` 0 **ve** evre yine `'idle'` olduğunda biter.

O zaman ekrana bir yazı çıkar ve bir tıklama yeni oyun başlatır. Bitmiş oyunda takas yapılamaz.

# --code--

```js
if (movesLeft === 0) {
  if (phase === 'idle') reset()
  return
}

if (movesLeft === 0 && phase === 'idle') {
  ctx.textAlign = 'center'
  ctx.fillText('No moves left! Click to play again', canvas.width / 2, 58)
}
```

# --meaning--

- With no moves left, a click starts a new game once everything has settled, and does nothing else either way.
- The message is shown only when the game is really over.

# --meaning-tr--

- `if (movesLeft === 0) {` (dinleyicinin en başı) → hamle kalmadıysa:
  - `if (phase === 'idle') reset()` → her şey durduysa yeni oyun;
  - `return` → her durumda başka bir şey yapma: bitmiş oyunda takas yok.
- `if (movesLeft === 0 && phase === 'idle') {` (çizim) → oyun gerçekten bittiyse ortalanmış bir yazı. `canvas.width / 2`
  canvas'ın ortası; 58 skor satırının altı.

# --task--

1. Make the `movesLeft` block the first lines of the click listener.
2. In `draw`, under the `Moves` line, write the message block.

# --task-tr--

1. Tıklama dinleyicisinin içinde **en üste** `if (movesLeft === 0) { ... }` bloğunu yaz.
2. `draw` içinde `Moves` satırının altına mesaj bloğunu yaz.
3. **Çalıştır** ve 20 hamleyi bitir: mesaj çıkmalı, tıklayınca yeni oyun başlamalı.

# --tests--

With no moves left, the game should say so and a click should start a new game.
tr: Hamle kalmayınca oyun bunu söylemeli ve bir tıklama yeni oyun başlatmalı.

```js
movesLeft = 0
score = 450
$.tick(1)
assert.include($.texts(), 'No moves left! Click to play again')
$.click(200, 300)
assert.strictEqual(movesLeft, 20)
assert.strictEqual(score, 0)
```

After the last move, a click should wait for the cascades, then start a new game.
tr: Son hamleden sonra tıklama zincirlerin bitmesini beklemeli, sonra yeni oyun başlatmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
movesLeft = 0
phase = 'clearing'
$.click(32 + 48 * 2, 96 + 48)
assert.strictEqual(movesLeft, 0, 'while the last cascade runs, a click waits')
assert.isNull(selected)
phase = 'idle'
$.click(32 + 48 * 2, 96 + 48)
assert.strictEqual(movesLeft, 20, 'once everything has settled, a click starts a new game')
assert.isNull(selected, 'and does not select a gem')
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
const MOVES = 20
const FALL = 8 // pixels a gem falls per frame

let board // board[row][col]: a color index, or -1 while empty
let selected
let score
let movesLeft
let chain // how many clears in a row this move has caused
let phase // 'idle', 'clearing' (matched gems flash) or 'falling'
let timer
let matched // the cells being cleared
let drop // drop[row][col]: how many pixels above its place a gem is still drawn
let idleFor // frames since the last move
let hint // a possible move, shown after five idle seconds

const randomGem = () => Math.floor(Math.random() * COLORS.length)

// Would this gem make three in a row with the two to its left, or the two above it?
function makesRun(r, c, gem) {
  const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
  const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
  return left || up
}

// A new board with no three in a row: each gem avoids the colors that would make one.
function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      let gem
      do gem = randomGem()
      while (makesRun(r, c, gem))
      board[r].push(gem)
    }
  }
}

function reset() {
  do newBoard()
  while (!hasMove())
  selected = null
  score = 0
  movesLeft = MOVES
  phase = 'idle'
  drop = board.map((row) => row.map(() => 0))
  idleFor = 0
  hint = null
}

// Every cell that is part of three or more of the same color in a row or a column.
function findMatches() {
  const cells = new Set()
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const gem = board[r][c]
      if (gem < 0) continue
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        // Only start counting at the first gem of a run.
        const pr = r - dr
        const pc = c - dc
        if (pr >= 0 && pc >= 0 && board[pr][pc] === gem) continue
        let length = 1
        while (r + dr * length < N && c + dc * length < N && board[r + dr * length][c + dc * length] === gem) length++
        if (length >= 3) for (let i = 0; i < length; i++) cells.add((r + dr * i) * N + (c + dc * i))
      }
    }
  }
  return cells
}

function swap(a, b) {
  const gem = board[a.r][a.c]
  board[a.r][a.c] = board[b.r][b.c]
  board[b.r][b.c] = gem
}

// Is there any swap that would make a match? Try each one, look, and swap back.
function hasMove() {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (r + dr >= N || c + dc >= N) continue
        const a = { r, c }
        const b = { r: r + dr, c: c + dc }
        swap(a, b)
        const found = findMatches().size > 0
        swap(a, b)
        if (found) return { a, b }
      }
    }
  }
  return null
}

function trySwap(a, b) {
  if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
  swap(a, b)
  if (findMatches().size === 0) {
    swap(a, b) // no match: the gems go back
    return false
  }
  movesLeft -= 1
  chain = 0
  idleFor = 0
  hint = null
  startClearing()
  return true
}

function startClearing() {
  matched = findMatches()
  chain += 1
  score += matched.size * 10 * chain // cascades are worth more and more
  phase = 'clearing'
  timer = 14
}

// Remove the matched gems; everything above falls down to fill the gaps, and new gems drop in from the top.
function collapse() {
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
  for (let c = 0; c < N; c++) {
    let write = N - 1
    for (let r = N - 1; r >= 0; r--) {
      if (board[r][c] < 0) continue
      board[write][c] = board[r][c]
      drop[write][c] = (write - r) * SIZE
      write--
    }
    for (let r = write; r >= 0; r--) {
      board[r][c] = randomGem()
      drop[r][c] = (write + 1) * SIZE
    }
  }
  phase = 'falling'
}

function update() {
  if (phase === 'clearing') {
    timer -= 1
    if (timer === 0) collapse()
    return
  }
  if (phase === 'falling') {
    let moving = false
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        drop[r][c] = Math.max(0, drop[r][c] - FALL)
        if (drop[r][c] > 0) moving = true
      }
    }
    if (moving) return
    // Landed: new matches make a cascade; otherwise the move is over.
    if (findMatches().size > 0) startClearing()
    else {
      phase = 'idle'
      // No swap left anywhere: a fresh board.
      while (!hasMove()) newBoard()
    }
    return
  }
  idleFor += 1
  if (idleFor === 300) hint = hasMove()
}

function cellAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SIZE)
  const c = Math.floor(x / SIZE)
  return r >= 0 && r < N && c >= 0 && c < N ? { r, c } : null
}

canvas.addEventListener('pointerdown', (event) => {
  if (movesLeft === 0) {
    if (phase === 'idle') reset()
    return
  }
  if (phase !== 'idle') return
  const cell = cellAt(event)
  if (!cell) return
  if (selected && trySwap(selected, cell)) selected = null
  else selected = selected && selected.r === cell.r && selected.c === cell.c ? null : cell
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
      const gem = board[r][c]
      if (gem < 0) continue
      const flashing = phase === 'clearing' && matched.has(r * N + c) && Math.floor(timer / 3) % 2 === 0
      ctx.fillStyle = flashing ? '#ffffff' : COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2 - drop[r][c], SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // Outline the selected gem, and after five idle seconds, a possible move.
  ctx.lineWidth = 3
  for (const [cell, color] of [[selected, '#ffffff'], [hint && hint.a, '#fde047'], [hint && hint.b, '#fde047']]) {
    if (!cell) continue
    ctx.strokeStyle = color
    ctx.strokeRect(LEFT + cell.c * SIZE + 2, TOP + cell.r * SIZE + 2, SIZE - 4, SIZE - 4)
  }

  // New gems fall in from above the board: paint the score strip again, so they come out from under it.
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, TOP)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, LEFT, 30)
  ctx.textAlign = 'right'
  ctx.fillText('Moves ' + movesLeft, canvas.width - LEFT, 30)
  if (movesLeft === 0 && phase === 'idle') {
    ctx.textAlign = 'center'
    ctx.fillText('No moves left! Click to play again', canvas.width / 2, 58)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
