---
title: A fair bag of pieces
title_tr: Adil bir parça torbası
skills: [prog.arrays, game.state]
---

# --goal--

Fully random pieces are fair on average but not in the moment: sometimes the long I does not come for 30 turns. The
7-bag deals each of the seven pieces once, in a shuffled order, then shuffles a new bag.

# --goal-tr--

Her parçayı ötekilerden bağımsız rastgele seçmek **ortalamada** adildir ama **o anda** değil. Arada bir üst üste dört
S gelir ya da 30 tur boyunca uzun I hiç gelmez; oyuncu kötü oyundan değil kötü şanstan kaybeder.

Modern oyunlar **7'li torba** kullanır: yedi parçanın her birinden birer tane torbaya koy, torbayı **karıştır**,
boşalana kadar ondan dağıt; boşalınca yeniden doldur. Her parça her yedili grupta **tam bir kez** gelir. Sıra yine
tahmin edilemez, ama kuraklık da sel de olmaz. Bir iskambil destesini karıştırıp dağıtmak gibi.

# --code--

```js
let bag

  bag = []

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

  const shape = takeFromBag()
```

# --meaning--

- An empty bag is refilled with the seven shape numbers and shuffled (Fisher–Yates): from the end to the start, each
  element swaps with a random one at or before it.
- `[a, b] = [b, a]` swaps two values. The `;` at the start keeps it from being read as part of the line above.
- `bag.pop()` takes the last number out of the bag; we return a copy of that shape.

# --meaning-tr--

- `if (bag.length === 0) {` → torba boşsa (`length` eleman sayısı):
  - `bag = [0, 1, 2, 3, 4, 5, 6]` → yedi şeklin sıra numaraları torbaya.
  - `for (let i = bag.length - 1; i > 0; i--)` → sondan başa doğru sayan döngü: `i` 6'dan başlar, her turda `i--`
    ile 1 azalır.
  - `const j = Math.floor(Math.random() * (i + 1))` → 0 ile `i` arasında rastgele bir sıra numarası.
  - `;[bag[i], bag[j]] = [bag[j], bag[i]]` → `i`. ve `j`. elemanın **yerini değiştir**. Baştaki `;` bu satırın bir
    önceki satırla birleştirilip yanlış okunmasını önler; yazman gerekir.
  - Bu karıştırma yönteminin adı **Fisher–Yates**: her sıralama eşit şansla çıkar.
- `bag.pop()` → torbanın **son** elemanını çıkarır ve verir; torba bir küçülür.
- `SHAPES[...].map((row) => [...row])` → o şeklin kopyası, her zamanki gibi.
- `bag = []` (`newGame`) → her oyun boş torbayla başlar; ilk çekişte doldurulur.

# --task--

1. Under `let piece` write `let bag`; in `newGame`, under the `board` line, write `bag = []`.
2. Replace `randomShape` with the comment and `takeFromBag`.
3. In `spawn`, call `takeFromBag()` instead of `randomShape()`.

# --task-tr--

1. `let piece` satırının altına `let bag` yaz; `newGame` içinde `board = ...` satırının altına `bag = []` yaz.
2. `randomShape` fonksiyonunu sil; yerine yorum satırını ve `takeFromBag` fonksiyonunu yaz.
3. `spawn` içinde `randomShape()` yerine `takeFromBag()` yaz.
4. **Çalıştır** ve parçaları izle: yedi parçada her biri bir kez.

# --hint--

Do not forget the `;` at the start of the swap line.

# --hint-tr--

Yer değiştirme satırının başındaki `;` işaretini unutma.

# --tests--

Every group of seven pieces should contain each piece exactly once.
tr: Her yedili parça grubu her parçayı tam bir kez içermeli.

```js
bag = []
const order = []
for (let i = 0; i < 7 * 20; i++) order.push(JSON.stringify(takeFromBag()))
for (let g = 0; g < 20; g++) {
  const group = order.slice(g * 7, g * 7 + 7)
  assert.lengthOf(new Set(group), 7, `group ${g + 1} should have all seven pieces`)
}
assert.notDeepEqual(order.slice(0, 7), order.slice(7, 14), 'each bag is shuffled')
```

`takeFromBag()` should return a copy, not the template itself.
tr: `takeFromBag()` şablonun kendisini değil bir kopyasını döndürmeli.

```js
const shape = takeFromBag()
assert.isFalse(SHAPES.includes(shape))
assert.isTrue(SHAPES.some((s) => JSON.stringify(s) === JSON.stringify(shape)))
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
  const shape = takeFromBag()
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
