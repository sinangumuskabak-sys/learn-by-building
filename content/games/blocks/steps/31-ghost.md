---
title: The ghost piece
title_tr: Hayalet parça
skills: [game.canvas, prog.loops]
---

# --goal--

A faint ghost at the bottom shows where the piece would land. `ghostY` finds that row without moving the piece, and
`drawShape` gets an optional color to draw it see-through.

# --goal-tr--

Son dokunuş: kuyunun dibinde, parçanın **nereye düşeceğini** gösteren soluk bir **hayalet**. Oyuncu Boşluk'a basmadan
önce sonucu görür.

Hayalet için sert bırakmadaki fikri kullanıyoruz ama **hiçbir şeyi taşımadan**: parçanın satırından başla, bir alt
satıra sığdıkça bir aşağı in. Sonra parçayı o satırda yarı saydam beyazla çiz.

# --code--

```js
function ghostY() {
  let y = piece.y
  while (fits(piece.shape, piece.x, y + 1)) y++
  return y
}

function drawShape(shape, x, y, color) {
      if (value) drawCell(x + c, y + r, color || COLORS[value])

    drawShape(piece.shape, piece.x, ghostY(), 'rgba(255, 255, 255, 0.15)')
```

# --meaning--

- `ghostY` counts down its own copy `y`, never `piece.y`, and returns the lowest row where the piece fits.
- `drawShape` takes a fourth parameter `color`; `color || COLORS[value]` uses it if given, otherwise the block's own
  color.
- The ghost is drawn before the real piece, so the real piece is always on top.

# --meaning-tr--

- `let y = piece.y` → gerçek `piece.y`'ye dokunmayız; kendi `y` kopyamızı artırırız.
- `while (fits(piece.shape, piece.x, y + 1)) y++` → bir alt satıra sığdıkça bir aşağı in (`y++` 1 artır). Sonuç
  parçanın inebileceği **en alt** satır.
- `function drawShape(shape, x, y, color) {` → dördüncü, isteğe bağlı bir parametre: `color`.
- `color || COLORS[value]` → `||` burada "yoksa" gibi çalışır: `color` verildiyse onu, verilmediyse (boşsa) sayının
  kendi rengini kullan. Eski çağrılar dördüncü değeri vermediği için eskisi gibi çalışır.
- `'rgba(255, 255, 255, 0.15)'` → beyaz, yalnız %15 görünür.
- Hayalet gerçek parçadan **önce** çizilir; sonra çizilen üstte olduğu için gerçek parça hep önde kalır.
- `fits` tek bir soruyu açıkça cevaplayan küçük bir fonksiyondu; hareket, döndürme, düşme, kilitleme, oyun sonu, sert
  bırakma ve hayaletin hepsi ondan çıktı.

# --task--

1. Write `ghostY` under `hardDrop`.
2. Add `color` to `drawShape`'s parameters and use `color || COLORS[value]`.
3. In `draw`, inside `if (state === 'playing')`, draw the ghost above the real piece's line.

# --task-tr--

1. `hardDrop` fonksiyonunun altına bir boş satır bırakıp `ghostY` fonksiyonunu yaz.
2. `function drawShape(shape, x, y) {` satırına `, color` ekle; içinde `COLORS[value]` yerine `color || COLORS[value]`
   yaz.
3. `draw` içinde `if (state === 'playing') {` bloğunda, gerçek parçayı çizen satırın **üstüne** hayalet satırını yaz.
4. **Çalıştır**: dipte soluk bir hayalet görmelisin. Tebrikler, oyun tamam!

# --tests--

`ghostY()` should find where the piece would land.
tr: `ghostY()` parçanın nereye oturacağını bulmalı.

```js
piece = { shape: SHAPES[1].map((r) => [...r]), x: 0, y: 0 }
assert.strictEqual(ghostY(), 18)
board[15][1] = 3
assert.strictEqual(ghostY(), 13)
assert.strictEqual(piece.y, 0, 'finding the ghost must not move the piece')
```

The ghost should be drawn under the real piece.
tr: Hayalet gerçek parçanın altında çizilmeli.

```js
piece = { shape: SHAPES[1].map((r) => [...r]), x: 4, y: 0 }
$.tick()
const ghost = $.rects('rgba(255, 255, 255, 0.15)').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(ghost, [[4, 18], [5, 18], [4, 19], [5, 19]])
const calls = $.screen()
const firstGhost = calls.findIndex((c) => c.fill === 'rgba(255, 255, 255, 0.15)')
const firstPiece = calls.findIndex((c) => c.op === 'fillRect' && c.fill === '#facc15' && c.args[1] === 1)
assert.isBelow(firstGhost, firstPiece)
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

function hardDrop() {
  while (tryMove(0, 1)) score += 2
  lock()
}

function ghostY() {
  let y = piece.y
  while (fits(piece.shape, piece.x, y + 1)) y++
  return y
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
