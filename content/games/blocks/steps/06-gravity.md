---
title: Falling, landing and a new piece
title_tr: Düşmek, yere oturmak ve yeni parça
skills: [game.loop, game.state]
---

# --explanation--

Now the piece falls by itself: one row every 800 ms. The loop measures time, and when enough has passed since the
last drop, it drops again:

```js
if (time - lastDrop >= dropInterval()) {
  lastDrop = time
  softDrop()
}
```

`softDrop()` tries to move down one row. When that **fails**, the piece has landed, and it **locks**: its cells are
copied into the board, and it stops being a separate object. This is exactly where the number-as-color idea pays off:
copying the numbers is all it takes for the board to remember each block's color.

Then a new piece appears at the top, chosen at random. If the new piece does not even fit where it appears, the stack
has reached the top: **game over**. Notice how "try first" answered every question in this step: can it fall? has it
landed? is there room for the next one?

With a loop running, the key handler no longer needs to call `draw()`; the loop redraws every frame.

# --explanation-tr--

**Bu adımda:** parçalar kendi kendine düşmeye başlayacak. Yere değen parça kuyuya yapışacak, tepeden rastgele yeni
bir parça gelecek. Yığın tepeye ulaşınca kuyunun ortasında **Game Over** yazacak; Boşluk tuşu yeni oyun başlatacak.

**Oyun döngüsü ve zaman.** Şimdiye kadar yalnızca tuşa basınca çiziyorduk. Artık ekranı sürekli yenileyen bir döngü
kuruyoruz:

```js
function loop(time) {
  ...
  draw()
  requestAnimationFrame(loop)
}
```

`requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenilemede `loop`'u çalıştır" der; `loop` de sonunda
aynı isteği tekrarlar. Böylece saniyede yaklaşık 60 kez çizim yapılır. Tarayıcı `loop`'a bir sayı verir: sayfa
açıldığından beri geçen süre, **milisaniye** cinsinden (1000 ms = 1 saniye). Onu `time` adıyla alırız.

**Her 800 ms'de bir düşmek.** En son ne zaman düşürdüğümüzü `lastDrop`'ta tutarız:

```js
if (state === 'playing' && time - lastDrop >= dropInterval()) {
  lastDrop = time
  softDrop()
}
```

"Oyun sürüyorsa **ve** son düşüşten beri en az 800 ms geçtiyse: şimdiyi not et, bir satır düşür." `dropInterval()`
şimdilik hep `800` verir; ileride oyun hızlandıkça küçülecek.

**Yere oturmak (kilitlemek).** `softDrop()` bir satır aşağı gitmeyi dener: `if (!tryMove(0, 1)) lock()`. Deneme
**başarısızsa** parça yere değmiştir ve **kilitlenir**: dolu hücreleri kuyuya kopyalanır, artık ayrı bir parça
değildir. Sayının aynı zamanda renk olması burada işe yarar: yalnızca sayıları kopyalamak, kuyunun her bloğun rengini
hatırlaması için yeter.

**Rastgele parça.**

```js
SHAPES[Math.floor(Math.random() * SHAPES.length)]
```

`Math.random()` 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı verir. 7 ile çarpınca 0 ile 6,99 arası olur;
`Math.floor` aşağı yuvarlar → 0 ile 6 arasında rastgele bir tam sayı, yani rastgele bir şeklin sıra numarası.

**Yeni parça (`spawn`).** Rastgele şeklin kopyası kuyunun ortasına, en üste konur: `(COLS - shape.length) / 2` şekli
ortalar. Yeni parça çıktığı yere bile sığmıyorsa yığın tepeye ulaşmıştır: **oyun bitti** (`state = 'over'`).
"Önce dene" bu adımdaki her soruyu cevapladı: düşebilir mi? yere değdi mi? yenisine yer var mı?

**Oyunun durumu.** `let state` bir yazı tutar: `'playing'` (oynanıyor) ya da `'over'` (bitti). `newGame()` kuyuyu
boşaltır, durumu `'playing'` yapar ve ilk parçayı çıkarır. Değişkenleri (`let board`, `let piece`...) dosyanın üstünde
**boş** açarız; içlerini `newGame()` doldurur. Böylece yeni oyun başlatmak tek bir çağrıdır.

**Oyun bitince.** Tuş fonksiyonunun başında: bittiyse ve basılan Boşluk (`' '`, içinde bir boşluk olan yazı) **veya**
`'Enter'` ise yeni oyun başlat; hangi tuş olursa olsun `return` ile çık, oklar çalışmasın.

**Yarı saydam renk.** `'rgba(0, 0, 0, 0.7)'` → kırmızı, yeşil, mavi 0 (siyah), son sayı **saydamlık**: 0.7 yani %70
kapak. Yazının arkasına koyu ama altı hafif görünen bir şerit çizmek için. `ctx.fillText(yazı, x, y)` canvas'a yazı
yazar; `ctx.font` yazı tipi ve boyu, `ctx.textAlign = 'center'` yazıyı verilen noktaya ortalar.

Artık döngü her karede çizdiği için tuş fonksiyonundaki `draw()` gereksiz; onu sileceğiz.

# --task--

1. Declare `let board`, `let piece`, `let state` and `let lastDrop = 0`. Write `newGame()` (fresh board, `state =
   'playing'`, `spawn()`), `randomShape()` (a copy of a random shape) and `spawn()`: put a new random piece at
   `x = Math.floor((COLS - shape.length) / 2)`, `y = 0`, and set `state = 'over'` if it does not fit.
2. Write `lock()` (copy the piece's non-zero cells into the board, then `spawn()`) and `softDrop()` (move down, or
   `lock()` if it cannot). Add `dropInterval()` returning `800` for now.
3. Write `loop(time)` that calls `softDrop()` every `dropInterval()` ms while playing, draws, and requests the next
   frame. Start with `newGame()` and the loop; remove `draw()` from the key handler.
4. When over: ignore the arrows, start a new game on Space or Enter, and show `Game Over` and
   `Press Space to play again` over the well.

# --task-tr--

1. `SHAPES` listesinin kapanış `]` satırının altına, `function emptyRow()` satırından önce şu dört satırı ekle:

   ```js
   let board
   let piece
   let state // 'playing' or 'over'
   let lastDrop = 0
   ```

2. Şu iki satırı **sil**:

   ```js
   let board = Array.from({ length: ROWS }, emptyRow)
   let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }
   ```

   ve onların yerine (yani `emptyRow` fonksiyonunun altına) üç fonksiyon yaz:

   ```js
   function newGame() {
     board = Array.from({ length: ROWS }, emptyRow)
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
   ```

   `{ shape, x: ... }` içindeki yalnız `shape` yazımı `shape: shape` demenin kısa yoludur.

3. `tryRotate` fonksiyonunun kapanış `}`'sinin altına, `document.addEventListener('keydown', ...)` satırından önce şu
   üç fonksiyonu yaz:

   ```js
   function dropInterval() {
     return 800
   }

   function lock() {
     piece.shape.forEach((cells, r) => {
       cells.forEach((value, c) => {
         if (value) board[piece.y + r][piece.x + c] = value
       })
     })
     spawn()
   }

   function softDrop() {
     if (!tryMove(0, 1)) lock()
   }
   ```

4. `keydown` bloğunu şöyle değiştir (başa oyun bitti kontrolü geldi, sondaki `draw()` silindi):

   ```js
   document.addEventListener('keydown', (event) => {
     if (state === 'over') { // ← yeni
       if (event.key === ' ' || event.key === 'Enter') newGame() // ← yeni
       return // ← yeni
     } // ← yeni
     if (event.key === 'ArrowLeft') tryMove(-1, 0)
     if (event.key === 'ArrowRight') tryMove(1, 0)
     if (event.key === 'ArrowUp' || event.key === 'x') tryRotate()
     if (event.key === 'ArrowDown') tryMove(0, 1)
   })
   ```

5. `draw()` fonksiyonunun sonundaki `drawShape(piece.shape, piece.x, piece.y)` satırını sil ve yerine şunu yaz; sonra
   fonksiyonun kapanış `}`'sinin altına `loop` fonksiyonunu ekle:

   ```js
     if (state === 'playing') {
       drawShape(piece.shape, piece.x, piece.y)
     }

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
   ```

6. Dosyanın en sonundaki `draw()` satırını sil ve yerine oyunu başlatan iki satırı yaz:

   ```js
   newGame()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas. Parçalar kendi kendine düşmeli, yere değince durup yenisi gelmeli. Oynamak için önce oyuna
   tıkla; oklarla yönlendir. Tepeye kadar yığarsan **Game Over** çıkmalı, Boşluk'la yeniden başlamalı. Alttaki
   kontrollerin hepsi yeşil olmalı. Hiçbir şey görünmüyorsa eski `let board = ...` ve `let piece = ...` satırlarını
   silmeyi unutmuş olabilirsin (aynı ad iki kez açılamaz).

# --tests--

The piece should fall one row every 800 ms.
tr: Parça her 800 ms'de bir satır düşmeli.

```js
const y = piece.y
$.run(0.75)
assert.strictEqual(piece.y, y)
$.run(0.1)
assert.strictEqual(piece.y, y + 1)
$.run(0.8)
assert.strictEqual(piece.y, y + 2)
```

A piece that cannot fall should lock into the board, and a new one should appear at the top.
tr: Düşemeyen bir parça tahtaya kilitlenmeli ve tepede yenisi belirmeli.

```js
piece = { shape: SHAPES[1].map((r) => [...r]), x: 0, y: 18 }
softDrop()
assert.strictEqual(board[19][0], 2)
assert.strictEqual(board[18][1], 2)
assert.strictEqual(piece.y, 0)
assert.strictEqual(piece.x, Math.floor((10 - piece.shape.length) / 2))
```

The pieces should be random.
tr: Parçalar rastgele olmalı.

```js
const seen = new Set()
for (let i = 0; i < 50; i++) {
  spawn()
  seen.add(JSON.stringify(piece.shape))
}
assert.isAtLeast(seen.size, 6)
```

A stack reaching the top should end the game; Space should start over.
tr: Tepeye ulaşan bir yığın oyunu bitirmeli; Boşluk yeniden başlatmalı.

```js
for (let row = 0; row < 3; row++) board[row] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
spawn()
assert.strictEqual(state, 'over')
$.tick()
assert.include($.texts(), 'Game Over')
const x = piece.x
$.press('ArrowLeft')
assert.strictEqual(piece.x, x, 'no moving after game over')
$.press(' ')
assert.strictEqual(state, 'playing')
assert.isTrue(board.flat().every((cell) => cell === 0))
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

let board
let piece
let state // 'playing' or 'over'
let lastDrop = 0

function emptyRow() {
  return Array(COLS).fill(0)
}

function newGame() {
  board = Array.from({ length: ROWS }, emptyRow)
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

function dropInterval() {
  return 800
}

function lock() {
  piece.shape.forEach((cells, r) => {
    cells.forEach((value, c) => {
      if (value) board[piece.y + r][piece.x + c] = value
    })
  })
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
