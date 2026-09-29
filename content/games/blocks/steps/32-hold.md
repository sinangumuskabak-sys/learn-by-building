---
title: "Build it yourself: hold a piece"
title_tr: "Kendin yap: parçayı beklet"
skills: [game.state, game.input]
---

# --goal--

Your game, your rules. Add a hold: pressing C puts the falling piece aside and brings in another, once per piece.

# --goal-tr--

Oyun senin! Bir **bekletme** (hold) ekle: **C** tuşu düşen parçayı kenara koysun, yerine başka bir parça gelsin.
Kenardaki parçayı sonra geri çağırabilesin. Ama her parça için **yalnız bir kez**; yoksa oyuncu sonsuza kadar
değiştirip zaman kazanırdı.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `piece`, `next`, `spawn`, bir `true`/`false` bayrağı ve panel... Kontroller
çalıştığında yeşile döner.

# --task--

Keep the held shape in `held` (`null` when empty). C puts the falling piece aside: the first time the next piece comes
in, later the held one comes back at the top, centred. Only once until the piece locks. Show `Hold` and the held piece
in the panel.

# --task-tr--

- Kenardaki parçanın şeklini `held` adlı bir değişkende tut; boşken `null` olsun. Yeni oyun onu boşaltsın.
- **C** (ya da `c`) basılınca:
  - kenarda parça yoksa: düşen parça kenara gitsin, sıradaki (`next`) düşmeye başlasın;
  - kenarda parça varsa: ikisi yer değiştirsin; kenardaki parça tepede, ortada yeniden başlasın.
- Bir parça kilitlenene kadar C yalnız **bir kez** çalışsın.
- Panelde, Level'in altında `Hold` yazsın ve kenardaki parça görünsün.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Keep a flag like `canHold`: set it to `false` when C is used, and back to `true` in `lock()` after the new piece
appears. When swapping, put the held shape back like `spawn` does: `x: Math.floor((COLS - shape.length) / 2), y: 0`.

# --hint-tr--

`canHold` gibi bir bayrak tut: C kullanılınca `false` yap, `lock()` içinde yeni parça geldikten sonra yine `true`
yap. Yer değiştirirken kenardaki şekli `spawn`'daki gibi yerleştir: `x: Math.floor((COLS - shape.length) / 2), y: 0`.
Paneli çizerken `drawShape(held, 11, 16)` iyi bir yer.

# --tests--

C should put the falling piece aside and bring in the next one.
tr: C düşen parçayı kenara koymalı ve sıradakini getirmeli.

```js
const current = piece.shape
const upcoming = next
$.press('c')
assert.deepEqual(held, current)
assert.deepEqual(piece.shape, upcoming)
assert.strictEqual(piece.y, 0)
```

C should work only once per piece.
tr: C her parça için yalnız bir kez çalışmalı.

```js
$.press('c')
const now = piece.shape
const aside = held
$.press('C')
assert.deepEqual(piece.shape, now)
assert.deepEqual(held, aside)
```

After the piece locks, C should swap the held piece back in at the top.
tr: Parça kilitlenince C, kenardaki parçayı tepeye geri getirmeli.

```js
$.press('c')
const aside = held
$.press(' ')
const current = piece.shape
$.press('c')
assert.deepEqual(piece.shape, aside)
assert.deepEqual(held, current)
assert.strictEqual(piece.y, 0)
assert.strictEqual(piece.x, Math.floor((10 - aside.length) / 2))
```

The held piece should be shown in the panel, and a new game should start with nothing held.
tr: Kenardaki parça panelde görünmeli ve yeni oyun boş başlamalı.

```js
$.tick(1)
assert.include($.texts(), 'Hold')
$.press('c')
$.tick(1)
const inPanel = $.rects().filter((r) => r.x >= 240 && r.w === 22)
assert.lengthOf(inPanel, 8, 'the next piece and the held piece')
newGame()
assert.notOk(held, 'a new game starts with nothing held')
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
let held // the piece put aside with C, or null
let canHold // one hold per piece
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
  held = null
  canHold = true
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
  canHold = true
}

function softDrop() {
  if (!tryMove(0, 1)) lock()
}

function hardDrop() {
  while (tryMove(0, 1)) score += 2
  lock()
}

function ghostY() {
  let y = piece.y
  while (fits(piece.shape, piece.x, y + 1)) y++
  return y
}

function hold() {
  if (!canHold) return
  canHold = false
  const shape = piece.shape
  if (held) piece = { shape: held, x: Math.floor((COLS - held.length) / 2), y: 0 }
  else spawn()
  held = shape
}

document.addEventListener('keydown', (event) => {
  if (state === 'over') {
    if (event.key === ' ' || event.key === 'Enter') newGame()
    return
  }
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
  if (event.key === 'ArrowUp' || event.key === 'x') tryRotate()
  if (event.key === 'ArrowDown') {
    if (tryMove(0, 1)) score += 1
  }
  if (event.key === ' ') hardDrop()
  if (event.key === 'c' || event.key === 'C') hold()
})

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function drawShape(shape, x, y, color) {
  shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) drawCell(x + c, y + r, color || COLORS[value])
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
    drawShape(piece.shape, piece.x, ghostY(), 'rgba(255, 255, 255, 0.15)')
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
  ctx.fillText('Hold', panel, 360)
  if (held) drawShape(held, 11, 16)

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
