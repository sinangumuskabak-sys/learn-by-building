---
title: Hints and stuck boards
title_tr: İpuçları ve sıkışan tahtalar
skills: [prog.functions, game.state]
---

# --explanation--

A board can run out of moves: no swap anywhere would make a match, and the player is stuck forever. The game has to notice.

How do we know whether **any** move exists? The simplest honest answer: try them all. There are only 112 neighbour pairs
(each cell with its right and its lower neighbour), and for each one we swap, call `findMatches()`, and swap back. The board
ends exactly as it was, and we learn whether a move exists and which one:

```js
swap(a, b)
const found = findMatches().size > 0
swap(a, b)            // always undo, whatever we found
if (found) return { a, b }
```

This "try it and undo" pattern is how game AIs think, too: a chess engine plays a move on its board, looks, and takes it back.

The same function gives us two features:

- **no stuck boards:** a new game rerolls until `hasMove()` finds something, and when the gems settle after a move with no
  move left, a fresh board replaces the old one;
- **a hint:** after five idle seconds (300 frames), outline a possible move in yellow.

# --explanation-tr--

Bir tahtanın hamlesi bitebilir: hiçbir yerdeki hiçbir takas eşleşme yapmaz ve oyuncu sonsuza dek sıkışır. Oyunun bunu fark
etmesi gerekir.

**Herhangi** bir hamlenin var olup olmadığını nasıl bilebiliriz? En basit dürüst cevap: hepsini dene. Yalnızca 112 komşu çift
var (her hücre sağındaki ve altındaki komşusuyla) ve her biri için takas eder, `findMatches()`'i çağırır ve geri takas ederiz.
Tahta tam olarak eski hâlinde kalır ve bir hamle olup olmadığını, hangisi olduğunu öğreniriz:

```js
swap(a, b)
const found = findMatches().size > 0
swap(a, b)            // ne bulursak bulalım her zaman geri al
if (found) return { a, b }
```

Bu "dene ve geri al" kalıbı oyun yapay zekâlarının da düşünme biçimidir: bir satranç motoru tahtasında bir hamle oynar, bakar
ve geri alır.

Aynı fonksiyon bize iki özellik verir:

- **sıkışan tahta yok:** yeni bir oyun `hasMove()` bir şey bulana kadar yeniden zar atar ve bir hamleden sonra mücevherler
  yerleştiğinde hiç hamle kalmamışsa eskisinin yerine taze bir tahta gelir;
- **bir ipucu:** beş saniye boşta kalınca (300 kare) olası bir hamleyi sarıyla çerçevele.

# --task--

1. Write `hasMove()`: try every cell with its right and its lower neighbour; return the first `{ a, b }` that makes a match,
   or `null`.
2. In `reset()`, repeat `newBoard()` while `!hasMove()` (a `do ... while`).
3. When the gems land with no new matches, go back to `'idle'` and, while there is no move, make a `newBoard()`.
4. Add `idleFor` and `hint` (`0` and `null` in `reset()` and after every matching swap). In `'idle'`, count `idleFor` up and
   at `300` set `hint = hasMove()`.
5. Draw the hint's two cells with a yellow (`'#fde047'`) outline, the same way as the selection.

# --task-tr--

1. `hasMove()` yaz: her hücreyi sağındaki ve altındaki komşusuyla dene; eşleşme yapan ilk `{ a, b }`'yi ya da `null`
   döndür.
2. `reset()`'te `!hasMove()` olduğu sürece `newBoard()`'u tekrarla (bir `do ... while`).
3. Mücevherler yeni eşleşme olmadan yere indiğinde `'idle'`'a dön ve hamle olmadığı sürece bir `newBoard()` yap.
4. `idleFor` ve `hint` ekle (`reset()`'te ve eşleşen her takastan sonra `0` ve `null`). `'idle'`'da `idleFor`'u artır ve
   `300`'de `hint = hasMove()` yap.
5. İpucunun iki hücresini seçimle aynı biçimde sarı (`'#fde047'`) bir çerçeveyle çiz.

# --tests--

`hasMove` should return `null` on a board with no moves, and a real move otherwise.
tr: `hasMove`, hamlesi olmayan bir tahtada `null`, yoksa gerçek bir hamle döndürmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + c) % 2 === 0 ? (r % 3) : 3 + (c % 3)))
assert.isNull(hasMove(), 'no swap makes a match here')
board[0][0] = board[0][1] = board[1][2] = 1
const move = hasMove()
assert.isNotNull(move)
swap(move.a, move.b)
assert.isAbove(findMatches().size, 0, 'the move it found really makes a match')
```

A new game should always have a move, and a stuck board should be replaced when the gems land.
tr: Yeni bir oyunun her zaman bir hamlesi olmalı ve mücevherler indiğinde sıkışmış bir tahta değiştirilmeli.

```js
for (let i = 0; i < 30; i++) {
  reset()
  assert.isNotNull(hasMove(), 'a new game always has a move')
}
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + c) % 2 === 0 ? (r % 3) : 3 + (c % 3)))
phase = 'falling'
$.tick(1)
assert.strictEqual(phase, 'idle')
assert.isNotNull(hasMove(), 'a stuck board is replaced')
```

After 300 idle frames a possible move should be outlined in yellow, and making a move should clear it.
tr: 300 boş kareden sonra olası bir hamle sarıyla çerçevelenmeli ve bir hamle yapmak onu temizlemeli.

```js
$.tick(299)
assert.isNull(hint)
$.tick(1)
assert.isNotNull(hint)
$.tick(1)
assert.lengthOf($.screen().filter((d) => d.op === 'strokeRect' && d.stroke === '#fde047'), 2)
$.click(hint.a.c * 48 + 32, hint.a.r * 48 + 96)
$.click(hint.b.c * 48 + 32, hint.b.r * 48 + 96)
assert.isNull(hint, 'a move clears the hint')
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
const FALL = 8 // pixels a gem falls per frame

let board // board[row][col]: a color index, or -1 while empty
let selected
let score
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, LEFT, 30)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
