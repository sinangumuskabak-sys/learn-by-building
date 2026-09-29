---
title: "Build it yourself: swipe to swap"
title_tr: "Kendin yap: kaydırarak takas"
skills: [game.input]
---

# --goal--

Your game, your rules. On a phone, players swipe: finger down on one gem, lift it on a neighbour. Make that swap the
two gems too, while two taps keep working.

# --goal-tr--

Oyun senin! Telefonda oyuncular iki kez dokunmak yerine **kaydırır**: parmağını bir mücevhere koyar, komşusunun
üstünde kaldırır. Bu hareket de iki mücevheri takas etsin. İki dokunuşla takas da eskisi gibi çalışmaya devam
etsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `pointerdown` zaten seçimi yapıyor; parmağın **kalktığı** anı ve yeri
de dinleyebilirsin. Kontroller çalıştığında yeşile döner.

# --task--

When a finger (or the mouse) is pressed on a gem and released on a neighbour, swap them with `trySwap`, just like two
taps. A swap that makes no match still bounces back, and nothing happens while the game is busy or over.

# --task-tr--

- Parmak (ya da fare) bir mücevherde basılıp **komşu** bir mücevherde kaldırılınca ikisi `trySwap` ile takas edilsin;
  iki dokunuştaki gibi.
- Eşleşme yapmayan kaydırma yine geri seksin ve hamle harcamasın.
- Oyun meşgulken (`phase` `'idle'` değilken) ya da bittiğinde kaydırma bir şey yapmasın.
- Bir mücevhere dokunup aynı yerde kaldırmak yine yalnız **seçsin**.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Listen to `pointerup` too. `pointerdown` has already put the first gem in `selected`; on `pointerup`, find the cell
under the finger with `cellAt(event)`, and if it is a different cell, call `trySwap(selected, cell)`.

# --hint-tr--

`pointerup`'ı da dinle. `pointerdown` ilk mücevheri zaten `selected`'a koydu; `pointerup`'ta parmağın altındaki hücreyi
`cellAt(event)` ile bul ve **başka** bir hücreyse `trySwap(selected, cell)` çağır. Başarılıysa seçimi bitir
(`selected = null`). Oyun `'idle'` değilken ya da hamle kalmamışken hiçbir şey yapma.

# --tests--

Swiping from a gem onto a neighbour should swap them.
tr: Bir mücevherden komşusuna kaydırmak ikisini takas etmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.pointerDown(32 + 48 * 2, 96 + 48)
$.pointerUp(32 + 48 * 2, 96)
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1], 'swapped into a match')
assert.strictEqual(movesLeft, 19)
assert.strictEqual(phase, 'clearing')
```

A swipe that makes no match should bounce back and use no move.
tr: Eşleşme yapmayan bir kaydırma geri sekmeli ve hamle harcamamalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.pointerDown(32 + 48 * 4, 96 + 48 * 5)
$.pointerUp(32 + 48 * 5, 96 + 48 * 5)
assert.strictEqual(board[5][4], (5 + 8) % 6)
assert.strictEqual(board[5][5], (5 + 10) % 6)
assert.strictEqual(movesLeft, 20)
```

Two taps should still swap, and one tap should still just select.
tr: İki dokunuş yine takas etmeli, tek dokunuş yine yalnız seçmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 5, 96 + 48 * 5)
assert.deepEqual(selected, { r: 5, c: 5 }, 'a tap selects')
$.click(32 + 48 * 5, 96 + 48 * 5)
assert.isNull(selected, 'a second tap on it unselects')
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1])
assert.strictEqual(movesLeft, 19)
```

Swiping should do nothing while the game is busy.
tr: Oyun meşgulken kaydırma bir şey yapmamalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.pointerDown(32 + 48 * 2, 96 + 48)
$.pointerUp(32 + 48 * 2, 96)
$.pointerDown(32 + 48 * 5, 96 + 48 * 5)
$.pointerUp(32 + 48 * 6, 96 + 48 * 5)
assert.strictEqual(movesLeft, 19, 'only the first swipe counted')
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
let best = Number(localStorage.getItem('match3-best')) || 0

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

function afterMoves() {
  if (movesLeft === 0 && score > best) {
    best = score
    localStorage.setItem('match3-best', best)
  }
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
      afterMoves()
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

canvas.addEventListener('pointerup', (event) => {
  if (phase !== 'idle' || movesLeft === 0 || !selected) return
  const cell = cellAt(event)
  if (cell && (cell.r !== selected.r || cell.c !== selected.c) && trySwap(selected, cell)) selected = null
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
  ctx.fillText('Moves ' + movesLeft + '  Best ' + best, canvas.width - LEFT, 30)
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
