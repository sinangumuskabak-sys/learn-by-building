---
title: The next piece
title_tr: Sıradaki parça
skills: [game.state, game.canvas]
---

# --goal--

We always draw one piece ahead and keep it in `next`, so the player can plan. `spawn` uses `next` and draws a new one;
the panel shows it.

# --goal-tr--

Oyuncu ileriyi planlayabilsin: bir sonraki parçayı **önceden** çekip `next`'te tutuyoruz ve panelin tepesinde
gösteriyoruz. `spawn` artık yeni parça olarak `next`'i kullanıyor ve torbadan yeni bir `next` çekiyor.

# --code--

```js
let next

  next = takeFromBag()
  spawn()

  const shape = next
  next = takeFromBag()

  ctx.fillText('Next', panel, 30)
  drawShape(next, 11, 2)
  ctx.fillStyle = 'white' // drawShape changed the fill color; the labels below need white again
```

# --meaning--

- `newGame` draws the first `next` before the first `spawn`.
- `spawn` turns `next` into the falling piece and draws a new `next`.
- The panel draws `next` at column 11, row 2 (in the panel, since the well has columns 0–9).
- `drawShape` changes `fillStyle`, so we set it back to white for the labels below.

# --meaning-tr--

- `let next` → sıradaki parçanın şekli.
- `next = takeFromBag()` (`newGame`, `spawn()`'dan önce) → ilk `spawn` kullanabilsin diye önce bir `next` çek.
- `const shape = next` ve `next = takeFromBag()` (`spawn`) → sıradaki şimdi düşer; yerine yenisi çekilir.
- `drawShape(next, 11, 2)` → kuyunun sütunları 0–9; 11. sütun panelin içine düşer. Satır 2, `Next` yazısının altı.
- `ctx.fillStyle = 'white'` → **renk tuzağı**: `drawShape` her hücre için `fillStyle`'ı parçanın rengine çevirir.
  Bu satır olmasa alttaki yazılar parçanın renginde çıkardı.

# --task--

1. Under `let piece` write `let next`.
2. In `newGame`, above `spawn()`, write `next = takeFromBag()`.
3. In `spawn`, replace `const shape = takeFromBag()` with the two lines.
4. In `draw`, under `ctx.textAlign = 'left'`, write the three `Next` lines.

# --task-tr--

1. `let piece` satırının altına `let next` yaz.
2. `newGame` içinde `spawn()` satırının **üstüne** `next = takeFromBag()` yaz.
3. `spawn` içinde `const shape = takeFromBag()` satırını iki satırla değiştir.
4. `draw` içinde `ctx.textAlign = 'left'` satırının **altına** üç `Next` satırını yaz.
5. **Çalıştır**: panelin tepesinde sıradaki parça görünmeli.

# --predict--

What would happen without the `ctx.fillStyle = 'white'` line?
- [ ] Nothing
- [x] Score, Lines and Level would be written in the next piece's color
  `drawShape` leaves `fillStyle` set to the last block's color.
- [ ] The next piece would be white

# --predict-tr--

`ctx.fillStyle = 'white'` satırı olmasaydı ne olurdu?
- [ ] Hiçbir şey
- [x] Score, Lines ve Level sıradaki parçanın renginde yazılırdı
  `drawShape`, `fillStyle`'ı son bloğun renginde bırakır.
- [ ] Sıradaki parça beyaz olurdu

# --tests--

The next piece should become the falling piece.
tr: Sıradaki parça düşen parçaya dönüşmeli.

```js
const upcoming = JSON.stringify(next)
spawn()
assert.strictEqual(JSON.stringify(piece.shape), upcoming)
assert.isArray(next, 'and a new next is drawn')
```

The next piece should be shown in the panel, and the labels should stay white.
tr: Sıradaki parça panelde gösterilmeli ve yazılar beyaz kalmalı.

```js
$.tick()
assert.include($.texts(), 'Next')
const inPanel = $.rects().filter((r) => r.x >= 240 && r.w === 22)
assert.lengthOf(inPanel, 4, 'four blocks of the next piece in the side panel')
const label = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Score')
assert.strictEqual(label.fill, 'white', 'the labels after the next piece should still be white')
```

# --solution--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 10
const ROWS = 20
const CELL = 24
const COLORS = [null, '#22d3ee', '#facc15', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316']
// Each piece is a square matrix; the number is its color. Square matrices rotate around their center.
const SHAPES = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ],
  [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ],
]
const POINTS = [0, 100, 300, 500, 800] // for clearing 0, 1, 2, 3 or 4 lines at once

let board
let piece
let next
let bag
let score
let lines
let state // 'playing' or 'over'
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
  bag = []
  score = 0
  lines = 0
  state = 'playing'
  next = takeFromBag()
  spawn()
}

// The "7-bag": deal all seven pieces in a random order, then shuffle a new bag.
function takeFromBag() {
  if (bag.length === 0) {
    bag = [0, 1, 2, 3, 4, 5, 6]
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bag[i], bag[j]] = [bag[j], bag[i]]
    }
  }
  return SHAPES[bag.pop()].map((row) => [...row])
}

function spawn() {
  const shape = next
  next = takeFromBag()
  piece = { shape, x: Math.floor((COLS - shape.length) / 2), y: 0 }
  if (!fits(piece.shape, piece.x, piece.y)) state = 'over'
}

// Clockwise: the first column, read from the bottom up, becomes the first row.
function rotate(shape) {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse())
}

function fits(shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const col = x + c
      const row = y + r
      if (col < 0 || col >= COLS || row >= ROWS) return false
      if (row >= 0 && board[row][col]) return false
    }
  }
  return true
}

function tryMove(dx, dy) {
  if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false
  piece.x += dx
  piece.y += dy
  return true
}

function tryRotate() {
  const turned = rotate(piece.shape)
  // Wall kicks: if the turned piece does not fit, try nudging it sideways.
  for (const kick of [0, -1, 1, -2, 2]) {
    if (fits(turned, piece.x + kick, piece.y)) {
      piece.shape = turned
      piece.x += kick
      return true
    }
  }
  return false
}

function level() {
  return Math.floor(lines / 10) + 1
}

function dropInterval() {
  return Math.max(100, 800 - (level() - 1) * 70)
}

function clearLines() {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = ROWS - kept.length
  if (cleared === 0) return
  board = [...Array.from({ length: cleared }, emptyRow), ...kept]
  score += POINTS[cleared] * level()
  lines += cleared
}

function lock() {
  piece.shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) board[piece.y + r][piece.x + c] = value
    })
  })
  clearLines()
  spawn()
}

function softDrop() {
  if (!tryMove(0, 1)) lock()
}

document.addEventListener('keydown', (event) => {
  if (state === 'over') {
    if (event.key === ' ' || event.key === 'Enter') newGame()
    return
  }
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
  if (event.key === 'ArrowUp' || event.key === 'x') tryRotate()
  if (event.key === 'ArrowDown') tryMove(0, 1)
})

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function drawShape(shape, x, y) {
  shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) drawCell(x + c, y + r, COLORS[value])
    })
  })
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, COLORS[board[row][col]])
    }
  }
  if (state === 'playing') {
    drawShape(piece.shape, piece.x, piece.y)
  }

  const panel = COLS * CELL + 20
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Next', panel, 30)
  drawShape(next, 11, 2)
  ctx.fillStyle = 'white' // drawShape changed the fill color; the labels below need white again
  ctx.fillText('Score', panel, 180)
  ctx.fillText(String(score), panel, 202)
  ctx.fillText('Lines', panel, 240)
  ctx.fillText(String(lines), panel, 262)
  ctx.fillText('Level', panel, 300)
  ctx.fillText(String(level()), panel, 322)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 180, COLS * CELL, 110)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', (COLS * CELL) / 2, 225)
    ctx.font = '14px sans-serif'
    ctx.fillText('Press Space to play again', (COLS * CELL) / 2, 260)
  }
}

function loop(time) {
  if (state === 'playing' && time - lastDrop >= dropInterval()) {
    lastDrop = time
    softDrop()
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
