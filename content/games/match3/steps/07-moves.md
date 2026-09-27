---
title: Twenty moves
title_tr: Yirmi hamle
skills: [game.state]
---

# --explanation--

Without a limit, match three never ends, and a score means nothing. Real games give you a **move budget**: here 20 swaps to
score as much as you can. That one number changes how you play. With endless moves any match will do; with 20 you start
hunting for moves that set up cascades.

Only a swap that **matched** costs a move. A swap that bounced back was a mistake the game already undid, so it is free.

When the last move's cascades have settled (the phase is back to `'idle'` and `movesLeft` is `0`), the game is over. Compare
the score with the best one, kept in `localStorage` so it survives a reload, and a click starts again. Note the order: we
wait for the falling to finish, because the last move's cascades still add to the score.

# --explanation-tr--

Sınır olmadan üçlü eşleştirme hiç bitmez ve bir puan hiçbir şey ifade etmez. Gerçek oyunlar sana bir **hamle bütçesi** verir:
burada olabildiğince çok puan için 20 takas. O tek sayı nasıl oynadığını değiştirir. Sonsuz hamleyle her eşleşme işini görür;
20 ile zincirleme kuran hamleleri kovalamaya başlarsın.

Yalnızca **eşleşen** bir takas bir hamleye mal olur. Geri seken bir takas, oyunun zaten geri aldığı bir hataydı, bu yüzden
bedavadır.

Son hamlenin zincirlemeleri yatıştığında (evre yeniden `'idle'` ve `movesLeft` `0` olduğunda) oyun biter. Puanı, yeniden
yüklemeden sağ çıksın diye `localStorage`'da tutulan en iyisiyle karşılaştır; bir tıklama yeniden başlatır. Sıraya dikkat:
düşüşün bitmesini bekleriz, çünkü son hamlenin zincirlemeleri de puana eklenir.

# --task--

1. Add `MOVES = 20` and `movesLeft` (`MOVES` in `reset()`); a matching swap takes 1 from it.
2. Keep `best` in `localStorage` under `'match3-best'`. When the gems land and `movesLeft` is `0`, save the score if it beats
   `best`.
3. On `pointerdown`, when `movesLeft` is `0`: `reset()` if the phase is `'idle'`, and do nothing else.
4. Draw `Moves 20  Best 0` right-aligned at `canvas.width - LEFT`, `y = 30`, and when the game is over,
   `No moves left! Click to play again` centered at `y = 58`.

# --task-tr--

1. `MOVES = 20` ve `movesLeft` ekle (`reset()`'te `MOVES`); eşleşen bir takas ondan 1 düşer.
2. `best`'i `localStorage`'da `'match3-best'` adıyla tut. Mücevherler indiğinde ve `movesLeft` `0` olduğunda puan `best`'i
   geçiyorsa kaydet.
3. `pointerdown`'da `movesLeft` `0` iken: evre `'idle'` ise `reset()` et, başka hiçbir şey yapma.
4. `Moves 20  Best 0`'ı `canvas.width - LEFT`, `y = 30`'a sağa hizalı çiz; oyun bittiğinde
   `No moves left! Click to play again`'i `y = 58`'e ortalı çiz.

# --tests--

A game should start with 20 moves, and only a swap that matches should use one.
tr: Bir oyun 20 hamleyle başlamalı ve yalnızca eşleşen bir takas bir hamle harcamalı.

```js
$.tick(1)
assert.strictEqual(movesLeft, 20)
assert.include($.texts(), 'Moves 20  Best 0')
const move = hasMove()
assert.isFalse(trySwap({ r: 0, c: 0 }, { r: 7, c: 7 }))
assert.strictEqual(movesLeft, 20, 'a failed swap is free')
trySwap(move.a, move.b)
assert.strictEqual(movesLeft, 19)
```

After the last move the best score should be saved, and a click should start a new game.
tr: Son hamleden sonra en iyi puan kaydedilmeli ve bir tıklama yeni bir oyun başlatmalı.

```js
let guard = 0
while (movesLeft > 0 && guard++ < 50000) {
  if (phase !== 'idle') { $.tick(1); continue }
  const move = hasMove()
  trySwap(move.a, move.b)
}
while (phase !== 'idle') $.tick(1)
assert.strictEqual(movesLeft, 0)
assert.strictEqual(best, score)
assert.strictEqual(Number(localStorage.getItem('match3-best')), score)
$.tick(1)
assert.include($.texts(), 'No moves left! Click to play again')
$.click(200, 300)
assert.strictEqual(movesLeft, 20)
assert.strictEqual(score, 0)
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
