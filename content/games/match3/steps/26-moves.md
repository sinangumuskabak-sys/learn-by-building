---
title: Twenty moves
title_tr: Yirmi hamle
skills: [game.state]
---

# --goal--

Without a limit the game never ends and the score means little. A game has 20 moves; only a swap that matches uses
one. The moves left are written at the top right.

# --goal-tr--

Sınır olmadan oyun hiç bitmez ve puanın anlamı kalmaz. Gerçek oyunlar bir **hamle bütçesi** verir: burada mümkün
olduğunca çok puan için **20 takas**. Bu tek sayı oyun tarzını değiştirir: artık zincirleme kuracak hamleleri
ararsın.

Yalnız **eşleşen** takas bir hamle harcar. Geri seken takas, oyunun zaten geri aldığı bir hataydı; bedava.

# --code--

```js
const MOVES = 20

let movesLeft

  movesLeft = MOVES

  movesLeft -= 1

  ctx.textAlign = 'right'
  ctx.fillText('Moves ' + movesLeft, canvas.width - LEFT, 30)
```

# --meaning--

- `reset` gives `MOVES` moves.
- `movesLeft -= 1` comes after the "no match" check in `trySwap`, so a swap that bounces back is free.
- `textAlign = 'right'` makes the text end at the given x: the right edge of the grid.

# --meaning-tr--

- `const MOVES = 20` → bir oyundaki hamle sayısı. `let movesLeft` → kalan hamle; `reset` onu 20 yapar.
- `movesLeft -= 1` (`trySwap`) → eşleşme kontrolünün **altında**: geri seken takas buraya hiç gelmez, hamle harcamaz.
- `ctx.textAlign = 'right'` → yazı verilen `x`'te **bitsin**. `canvas.width - LEFT` → ızgaranın sağ kenarı.

# --task--

1. Above `FALL` write `MOVES`; under `let score` write `let movesLeft`.
2. In `reset`, under `score = 0`, write `movesLeft = MOVES`.
3. In `trySwap`, above `chain = 0`, write `movesLeft -= 1`.
4. In `draw`, under the `Score` line, write the two `Moves` lines.

# --task-tr--

1. `const FALL ...` satırının **üstüne** `const MOVES = 20` yaz; `let score` satırının altına `let movesLeft` yaz.
2. `reset` içinde `score = 0` satırının altına `movesLeft = MOVES` yaz.
3. `trySwap` içinde `chain = 0` satırının **üstüne** `movesLeft -= 1` yaz.
4. `draw` içinde `Score` satırının altına iki `Moves` satırını yaz.
5. **Çalıştır**: sağ üstte `Moves 20` görmeli, her üçlüde bir azaldığını izlemelisin.

# --tests--

A game should start with 20 moves, and only a swap that matches should use one.
tr: Bir oyun 20 hamleyle başlamalı ve yalnız eşleşen bir takas bir hamle harcamalı.

```js
$.tick(1)
assert.strictEqual(movesLeft, 20)
assert.include($.texts(), 'Moves 20')
const move = hasMove()
assert.isFalse(trySwap({ r: 0, c: 0 }, { r: 7, c: 7 }))
assert.strictEqual(movesLeft, 20, 'a failed swap is free')
trySwap(move.a, move.b)
assert.strictEqual(movesLeft, 19)
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
