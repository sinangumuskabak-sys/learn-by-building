---
title: Clearing lines and levelling up
title_tr: Satır silmek ve seviye atlamak
skills: [prog.arrays, game.state]
---

# --explanation--

A full row disappears, and everything above it falls down. That sounds like it needs careful moving of blocks, but
with a board of rows it is two array operations:

```js
const kept = board.filter((row) => row.some((cell) => cell === 0))   // keep rows that still have a gap
const cleared = ROWS - kept.length                                     // how many were full
board = [...Array.from({ length: cleared }, emptyRow), ...kept]        // new empty rows on top
```

Filtering out the full rows makes everything above them "fall" automatically, because the remaining rows keep their
order and the new empty rows go on top. Choosing the right shape for your data (a list of rows) turned a fiddly
problem into two lines.

Scoring rewards clearing several lines at once: 100, 300, 500 or 800 points for 1 to 4 lines, times the **level**. Every
10 lines is a new level, and each level drops pieces 70 ms faster (never faster than every 100 ms). That is a
difficulty curve, like the ones in the other games, driven by how well the player is doing.

# --explanation-tr--

**Bu adımda:** dolan satırlar silinecek ve üstündekiler aşağı inecek. Sağdaki yan panelde **Score** (puan),
**Lines** (silinen satır) ve **Level** (seviye) yazacak; seviye arttıkça parçalar hızlanacak.

**Satır silmek.** Dolu bir satır kaybolur ve üstündeki her şey aşağı düşer. Blokları tek tek taşımak gerekiyormuş gibi
görünür, ama kuyu satırlardan oluşan bir liste olduğu için iş iki liste işlemidir:

```js
const kept = board.filter((row) => row.some((cell) => cell === 0))   // hâlâ boşluğu olan satırları tut
const cleared = ROWS - kept.length                                     // kaç tanesi doluydu
board = [...Array.from({ length: cleared }, emptyRow), ...kept]        // yeni boş satırlar en üste
```

Parça parça:

- `row.some((cell) => cell === 0)` → `some` "listede bu koşulu sağlayan **en az bir** eleman var mı?" diye sorar.
  Yani "bu satırda en az bir boş hücre var mı?"
- `board.filter(...)` → `filter` listeden yalnız koşulu sağlayanları tutan yeni bir liste yapar. Sonuç: dolu
  **olmayan** satırlar, eski sıralarıyla.
- `ROWS - kept.length` → 20'den kalan satır sayısını çıkarınca silinen (dolu) satır sayısı çıkar.
- `[...a, ...b]` → `...` (yayma) bir listenin elemanlarını buraya dök demektir. Önce `cleared` kadar yeni boş satır,
  arkasından tutulan satırlar: toplam yine 20 satır.

Dolu satırları çıkarınca üsttekiler kendiliğinden "düşer", çünkü kalan satırlar sıralarını korur ve yeni boş
satırlar tepeye gelir. Verin için doğru şekli (satırlardan bir liste) seçmek, zor bir problemi iki satıra indirdi.
Hiç satır dolmadıysa `if (cleared === 0) return` ile hemen çıkarız.

**Puan.** Aynı anda çok satır silmek ödüllendirilir: 1, 2, 3, 4 satır için 100, 300, 500, 800 puan, **seviye** ile
çarpılır. `POINTS[cleared]` bu listeden doğru puanı alır (0 satır = 0 puan). `score += ...` "puanın üstüne ekle"
demektir. Aşağı oka basarak parçayı elle bir satır indirmek de 1 puan getirir: `if (tryMove(0, 1)) score += 1` →
hareket gerçekten olduysa (`tryMove` `true` döndürdüyse).

**Seviye ve hız.** Her 10 satır yeni bir seviyedir: `Math.floor(lines / 10) + 1` (0–9 satır → 1, 10–19 → 2...).
Her seviye parçaları 70 ms daha hızlı düşürür:

```js
Math.max(100, 800 - (level() - 1) * 70)
```

`Math.max(a, b)` iki sayıdan **büyüğünü** verir. Hesap 100'ün altına düşse bile sonuç 100 olur; parçalar 100 ms'den
hızlı düşmez. Oyuncu iyi oynadıkça zorlaşan bir zorluk eğrisi.

**Yan panel.** Kuyu 240 piksel; panel onun 20 piksel sağından başlar: `COLS * CELL + 20`. `String(score)` sayıyı
yazıya çevirir, çünkü `fillText` yazı ister. `ctx.textAlign = 'left'` yazıyı verilen noktadan sağa doğru yazar.

# --task--

1. Add `let score` and `let lines` (reset to `0` in `newGame()`), `const POINTS = [0, 100, 300, 500, 800]`,
   `level()` = `Math.floor(lines / 10) + 1`, and change `dropInterval()` to
   `Math.max(100, 800 - (level() - 1) * 70)`.
2. Write `clearLines()` as above; when rows were cleared, add `POINTS[cleared] * level()` to `score` and `cleared` to
   `lines`. Call it in `lock()` before spawning.
3. Pressing Down (a manual soft drop that succeeds) scores 1 point.
4. Draw the side panel at `x = COLS * CELL + 20`: white `'bold 16px sans-serif'` labels `Score`, `Lines`, `Level` at
   `y` 180, 240, 300, each with its value 22 pixels below.

# --task-tr--

1. `SHAPES` listesinin kapanış `]`'sinin altına puan tablosunu ekle:

   ```js
   const POINTS = [0, 100, 300, 500, 800] // for clearing 0, 1, 2, 3 or 4 lines at once
   ```

2. `let state // 'playing' or 'over'` satırının üstüne, `let piece` satırının altına iki değişken ekle:

   ```js
   let board
   let piece
   let score // ← yeni
   let lines // ← yeni
   let state // 'playing' or 'over'
   let lastDrop = 0
   ```

3. `newGame()` içinde `state = 'playing'` satırının altına sıfırlamaları ekle:

   ```js
   function newGame() {
     board = Array.from({ length: ROWS }, emptyRow)
     state = 'playing'
     score = 0 // ← yeni
     lines = 0 // ← yeni
     spawn()
   }
   ```

4. `function dropInterval()` fonksiyonunu sil ve yerine şu üç fonksiyonu yaz:

   ```js
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
   ```

5. `lock()` fonksiyonunda `spawn()` satırının üstüne `clearLines()` ekle:

   ```js
   function lock() {
     piece.shape.forEach((cells, r) => {
       cells.forEach((value, c) => {
         if (value) board[piece.y + r][piece.x + c] = value
       })
     })
     clearLines() // ← yeni
     spawn()
   }
   ```

6. `keydown` bloğundaki `if (event.key === 'ArrowDown') tryMove(0, 1)` satırını sil ve yerine şunu yaz:

   ```js
     if (event.key === 'ArrowDown') {
       if (tryMove(0, 1)) score += 1
     }
   ```

7. `draw()` içinde, `drawShape(...)` satırını saran `if (state === 'playing') { ... }` bloğunun altına ve
   `if (state === 'over')` satırının üstüne yan paneli çizen satırları ekle:

   ```js
     if (state === 'playing') {
       drawShape(piece.shape, piece.x, piece.y)
     }

     const panel = COLS * CELL + 20 // ← yeni
     ctx.fillStyle = 'white' // ← yeni
     ctx.font = 'bold 16px sans-serif' // ← yeni
     ctx.textAlign = 'left' // ← yeni
     ctx.fillText('Score', panel, 180) // ← yeni
     ctx.fillText(String(score), panel, 202) // ← yeni
     ctx.fillText('Lines', panel, 240) // ← yeni
     ctx.fillText(String(lines), panel, 262) // ← yeni
     ctx.fillText('Level', panel, 300) // ← yeni
     ctx.fillText(String(level()), panel, 322) // ← yeni

     if (state === 'over') {
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sağ panelde Score, Lines, Level görünmeli. Bir satırı
   tamamen doldurunca satır kaybolmalı ve puan artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Satır silinmiyorsa
   `lock()` içindeki `clearLines()` çağrısına bak.

# --tests--

Full rows should disappear and the rows above should fall.
tr: Dolu satırlar kaybolmalı ve üstteki satırlar düşmeli.

```js
board[19] = Array(10).fill(1)
board[18] = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
board[17] = Array(10).fill(3)
clearLines()
assert.strictEqual(lines, 2)
assert.deepEqual(board[19], [2, 0, 0, 0, 0, 0, 0, 0, 0, 0])
assert.isTrue(board.slice(0, 19).every((row) => row.every((cell) => cell === 0)))
assert.lengthOf(board, 20)
assert.notStrictEqual(board[0], board[1], 'new rows are separate arrays')
```

Clearing more lines at once should score more, times the level.
tr: Aynı anda daha çok satır silmek, seviyeyle çarpılarak daha çok puan getirmeli.

```js
const fill = (n) => {
  board = Array.from({ length: 20 }, emptyRow)
  for (let i = 0; i < n; i++) board[19 - i] = Array(10).fill(1)
}
score = 0
fill(1)
clearLines()
assert.strictEqual(score, 100)
fill(4)
clearLines()
assert.strictEqual(score, 900)
lines = 10
score = 0
fill(1)
clearLines()
assert.strictEqual(level(), 2)
assert.strictEqual(score, 200)
```

Locking a piece that completes a row should clear it.
tr: Bir satırı tamamlayan parçayı kilitlemek o satırı silmeli.

```js
board[19] = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0]
piece = { shape: SHAPES[1].map((r) => [...r]), x: 8, y: 18 }
softDrop()
assert.strictEqual(lines, 1)
assert.deepEqual(board[19], [0, 0, 0, 0, 0, 0, 0, 0, 2, 2])
```

Higher levels should drop faster, with a limit.
tr: Yüksek seviyeler daha hızlı düşürmeli, bir sınırla.

```js
assert.strictEqual(dropInterval(), 800)
lines = 30
assert.strictEqual(dropInterval(), 590)
lines = 500
assert.strictEqual(dropInterval(), 100)
$.tick()
assert.includeMembers($.texts(), ['Score', 'Lines', '500', 'Level', '51'])
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
let score
let lines
let state // 'playing' or 'over'
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
  score = 0
  lines = 0
  state = 'playing'
  spawn()
}

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) => [...row])
}

function spawn() {
  const shape = randomShape()
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
