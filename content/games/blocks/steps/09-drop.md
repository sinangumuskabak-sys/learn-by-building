---
title: Hard drop and a ghost piece
title_tr: Sert düşürme ve hayalet parça
skills: [game.input, prog.loops]
---

# --explanation--

Two finishing touches that every modern version has:

- **Hard drop** (Space): drop the piece all the way down and lock it at once. "Keep moving down while it fits" is a
  one-line `while` loop around `tryMove(0, 1)`, which is only possible because `tryMove` reports whether it moved.
  Reward it with 2 points per row.
- **Ghost piece**: a faint outline showing where the piece would land. It uses the same idea without moving anything:
  start at the piece's row and step down while `fits(...)` says the next row is free.

```js
let y = piece.y
while (fits(piece.shape, piece.x, y + 1)) y++
```

Notice the ghost reuses `fits` again. A small, well-tested function that answers one question clearly ends up doing an
astonishing amount of work: movement, rotation with kicks, falling, locking, game over, hard drops and the ghost all
come from it.

Draw the ghost **before** the real piece, in a translucent white, so the real piece always sits on top.

# --explanation-tr--

**Bu adımda:** her modern sürümde olan iki son dokunuşu ekleyeceğiz. Boşluk tuşu parçayı bir anda en alta
bırakacak; kuyunun dibinde de parçanın nereye düşeceğini gösteren soluk bir **hayalet** görünecek.

**Sert bırakma (hard drop).** Boşluk'a basınca parça sonuna kadar düşer ve hemen kilitlenir. "Sığdıkça aşağı in" tek
satırlık bir `while` döngüsüdür:

```js
while (tryMove(0, 1)) score += 2
```

`while (koşul) ...` koşul doğru olduğu sürece tekrar eder. Burada koşulun kendisi hareketi yapar: `tryMove(0, 1)` bir
satır inmeyi dener ve başarırsa `true` döner, döngü sürer ve 2 puan eklenir; inemediği an `false` döner ve döngü
biter. Bu ancak `tryMove` hareketin olup olmadığını bildirdiği için mümkün. Sonra `lock()` parçayı yerine sabitler.

**Hayalet parça.** Aynı fikir, ama hiçbir şeyi taşımadan: parçanın satırından başla, bir alt satır boş olduğu sürece
bir aşağı in.

```js
let y = piece.y
while (fits(piece.shape, piece.x, y + 1)) y++
return y
```

Burada gerçek `piece.y`'ye dokunmayız; kendi `y` kopyamızı artırırız (`y++` → 1 artır). Sonuç, parçanın inebileceği en
alt satırdır.

Hayaletin de `fits`'i kullandığına dikkat et. Tek bir soruyu açıkça cevaplayan küçük, iyi test edilmiş bir fonksiyon
şaşırtıcı miktarda iş yaptı: hareket, itmeli döndürme, düşme, kilitleme, oyun sonu, sert bırakma ve hayaletin hepsi
ondan geliyor.

**Çizim sırası.** Hayaleti gerçek parçadan **önce** çizeriz, yarı saydam beyazla (`'rgba(255, 255, 255, 0.15)'`:
beyaz, yalnız %15 görünür). Sonra çizilen her şey öncekinin üstüne boyandığı için gerçek parça hep üstte kalır.
`drawShape`'in dördüncü girdisi burada işe yarıyor: renk verince parçanın kendi rengi yerine o kullanılır.

# --task--

1. Write `hardDrop()`: while `tryMove(0, 1)` succeeds, add 2 to `score`; then `lock()`. Call it on Space while playing.
2. Write `ghostY()` returning the lowest `y` the current piece can reach.
3. In `draw()`, before the piece, draw its shape at `ghostY()` in `'rgba(255, 255, 255, 0.15)'`.

# --task-tr--

1. `softDrop()` fonksiyonunun kapanış `}`'sinin altına, `keydown` bloğundan önce iki fonksiyon yaz:

   ```js
   function hardDrop() {
     while (tryMove(0, 1)) score += 2
     lock()
   }

   function ghostY() {
     let y = piece.y
     while (fits(piece.shape, piece.x, y + 1)) y++
     return y
   }
   ```

2. `keydown` bloğunun sonuna, `ArrowDown` kısmını kapatan `}`'nin altına Boşluk satırını ekle:

   ```js
     if (event.key === 'ArrowDown') {
       if (tryMove(0, 1)) score += 1
     }
     if (event.key === ' ') hardDrop() // ← yeni
   })
   ```

   `' '` tırnakların arasında tek bir boşluk olan yazıdır: Boşluk tuşunun adı. Oyun bittiğinde Boşluk yine yeni oyun
   başlatır, çünkü blok başındaki `if (state === 'over')` kısmı daha önce çalışıp `return` ile çıkar.

3. `draw()` içinde parçayı çizen bloğa, gerçek parçadan önce hayalet satırını ekle:

   ```js
     if (state === 'playing') {
       drawShape(piece.shape, piece.x, ghostY(), 'rgba(255, 255, 255, 0.15)') // ← yeni
       drawShape(piece.shape, piece.x, piece.y)
     }
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Kuyunun dibinde düşen parçanın soluk bir gölgesi görünmeli;
   Boşluk'a basınca parça bir anda oraya inmeli ve puan artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Hayalet
   kontrolü kırmızıysa iki `drawShape` satırının sırasına bak: hayalet önce gelmeli.

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

Space should drop the piece to the bottom, lock it and score 2 per row.
tr: Boşluk parçayı en alta düşürmeli, kilitlemeli ve satır başına 2 puan vermeli.

```js
score = 0
piece = { shape: SHAPES[1].map((r) => [...r]), x: 4, y: 0 }
$.press(' ')
assert.strictEqual(board[19][4], 2)
assert.strictEqual(board[18][5], 2)
assert.strictEqual(score, 36)
assert.strictEqual(piece.y, 0, 'a new piece has appeared')
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
