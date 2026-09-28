---
title: A fair random bag, and the next piece
title_tr: Adil bir rastgele torba ve sıradaki parça
skills: [prog.arrays, game.state]
---

# --explanation--

Picking each piece independently at random is fair on average, but not in the moment. Now and then it deals four S
pieces in a row, or no long I piece for 30 turns, and the player loses to bad luck rather than bad play.

Modern falling-block games use a **7-bag**: put one of each of the seven pieces in a bag, shuffle it, and deal from it
until it is empty; then refill and shuffle again. Every piece now appears exactly once in every group of seven. The
order is still unpredictable, but droughts and floods are impossible: you never wait more than 12 pieces for an I.

This is a lesson that goes far beyond games: **"random" is a design choice**. Sometimes true independence is right
(dice); sometimes the player's experience needs randomness with guarantees (shuffled playlists, card decks, loot).

The bag also makes it easy to show the **next piece**: always keep one piece dealt in advance, and draw it in the side
panel so the player can plan ahead.

# --explanation-tr--

**Bu adımda:** parçaları daha adil bir yöntemle, "torbadan" dağıtacağız ve sıradaki parçayı sağ panelde göstereceğiz.
Panelin tepesinde **Next** yazısı ve altında bir sonraki parça görünecek.

**Tam rastgelenin sorunu.** Her parçayı ötekilerden bağımsız rastgele seçmek ortalamada adildir ama o anda değil. Arada
bir üst üste dört S parçası gelir ya da 30 tur boyunca uzun I hiç gelmez; oyuncu kötü oyundan değil kötü şanstan
kaybeder.

**7'li torba (7-bag).** Modern düşen blok oyunları şöyle yapar: yedi parçanın her birinden birer tane torbaya koy,
torbayı karıştır, boşalana kadar ondan dağıt; boşalınca yeniden doldur ve karıştır. Artık her parça her yedili grupta
**tam bir kez** gelir. Sıra yine tahmin edilemez, ama kuraklık da sel de olmaz: bir I için hiçbir zaman 12 parçadan
fazla beklemezsin.

Bu, oyunların çok ötesinde bir derstir: **"rastgele" bir tasarım kararıdır**. Bazen gerçek bağımsızlık doğrudur (zar);
bazen oyuncunun deneyimi garantili bir rastgelelik ister (karışık çalma listesi, iskambil destesi).

**Torba kodu, parça parça:**

- `bag = [0, 1, 2, 3, 4, 5, 6]` → torbada şekillerin sıra numaraları var.
- Sonraki `for` döngüsü torbayı **karıştırır** (Fisher–Yates yöntemi): sondan başa gelir, her elemanı kendisinden önceki
  (ya da kendisi olan) rastgele bir elemanla yer değiştirir. `Math.floor(Math.random() * (i + 1))` 0 ile `i` arasında
  rastgele bir tam sayı verir. `i--` sayacı her turda 1 azaltır.
- `[bag[i], bag[j]] = [bag[j], bag[i]]` → iki elemanın yerini değiştirir. Satırın başındaki `;` bir önceki satırla
  karışmasın diye konmuştur; yazman gerekir.
- `bag.pop()` → torbanın **son** elemanını çıkarır ve verir; torba bir küçülür. `bag.length === 0` torba boş demektir.
- `SHAPES[...].map((row) => [...row])` → o şeklin **kopyası** (asıl şablon bozulmasın diye, önceki gibi).

**Sıradaki parça.** Torba sayesinde bir sonraki parçayı göstermek kolay: her zaman bir parçayı önceden çekip `next`'te
tutarız. `spawn()` artık yeni parça olarak `next`'i kullanır ve torbadan yeni bir `next` çeker. Oyuncu böylece ileriyi
planlayabilir.

**Renk tuzağı.** `drawShape` her hücre için `ctx.fillStyle`'ı parçanın rengine değiştirir. Onun ardından yazılar da o
renkte çıkardı; bu yüzden hemen sonra fırçayı yeniden beyaza boyarız.

`randomShape()` artık kullanılmıyor, onu sileceğiz.

# --task--

1. Add `let bag` and `let next`. Write `takeFromBag()`: if the bag is empty, refill it with `[0, 1, 2, 3, 4, 5, 6]`
   and shuffle it (Fisher–Yates, as in the memory game); then `pop()` an index and return a copy of that shape.
   Remove `randomShape()`.
2. In `newGame()`, empty the bag and deal `next` before spawning. In `spawn()`, the new piece is `next`, and a new
   `next` is taken from the bag.
3. In the side panel, draw the label `Next` at `(COLS * CELL + 20, 30)` and the next piece with `drawShape(next, 11, 2)`.

# --task-tr--

1. `let piece` satırının altına iki değişken ekle:

   ```js
   let board
   let piece
   let next // ← yeni
   let bag // ← yeni
   let score
   ```

2. `newGame()` fonksiyonunu şöyle yap:

   ```js
   function newGame() {
     board = Array.from({ length: ROWS }, emptyRow)
     bag = [] // ← yeni
     score = 0
     lines = 0
     state = 'playing'
     next = takeFromBag() // ← yeni
     spawn()
   }
   ```

3. `randomShape()` fonksiyonunun tamamını sil ve yerine torba fonksiyonunu yaz:

   ```js
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
   ```

4. `spawn()` fonksiyonunun ilk satırını değiştir ve altına bir satır ekle:

   ```js
   function spawn() {
     const shape = next // ← değişti
     next = takeFromBag() // ← yeni
     piece = { shape, x: Math.floor((COLS - shape.length) / 2), y: 0 }
     if (!fits(piece.shape, piece.x, piece.y)) state = 'over'
   }
   ```

5. `draw()` içindeki yan panelde, `ctx.textAlign = 'left'` satırı ile `ctx.fillText('Score', panel, 180)` satırı
   arasına üç satır ekle:

   ```js
     ctx.textAlign = 'left'
     ctx.fillText('Next', panel, 30) // ← yeni
     drawShape(next, 11, 2) // ← yeni
     ctx.fillStyle = 'white' // drawShape changed the fill color; the labels below need white again // ← yeni
     ctx.fillText('Score', panel, 180)
   ```

   `drawShape(next, 11, 2)` sıradaki parçayı kuyunun dışına, 11. sütun ve 2. satır hizasına çizer.

6. **Çalıştır**'a bas. Sağ panelin tepesinde **Next** ve altında bir parça görünmeli; o parça bir sonra düşen parça
   olmalı. Alttaki kontrollerin hepsi yeşil olmalı. "white" diyen kontrol kırmızıysa `drawShape`'ten sonraki
   `ctx.fillStyle = 'white'` satırını unutmuşsundur.

# --tests--

Every group of seven pieces should contain each piece exactly once.
tr: Her yedili parça grubu her parçayı tam bir kez içermeli.

```js
bag = [] // start from a fresh bag, so the groups of seven line up with the bags
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

The next piece should become the falling piece, and be shown in the panel.
tr: Sıradaki parça düşen parçaya dönüşmeli ve panelde gösterilmeli.

```js
const upcoming = JSON.stringify(next)
spawn()
assert.strictEqual(JSON.stringify(piece.shape), upcoming)
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
  if (event.key === 'ArrowDown') {
    if (tryMove(0, 1)) score += 1
  }
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
