---
title: Falling by itself
title_tr: Kendiliğinden düşüş
skills: [game.loop]
---

# --goal--

A game loop redraws about 60 times a second. The browser passes the time in milliseconds; every 800 ms the piece
moves one row down.

# --goal-tr--

Parça artık **kendi kendine düşecek**. Bunun için bir **oyun döngüsü** kuruyoruz: saniyede yaklaşık 60 kez çalışan
ve her seferinde ekranı yeniden çizen bir fonksiyon.

Ama parça her karede düşerse göz açıp kapayıncaya kadar dibe iner. O yüzden saati kullanıyoruz: tarayıcı döngüye her
seferinde **şu anki zamanı** (milisaniye) verir. Son düşüşten bu yana **800 ms** geçtiyse bir satır düşeriz.

Döngü her karede çizdiği için tuş dinleyicisindeki `draw()` artık gereksiz; onu siliyoruz.

# --code--

```js
let lastDrop = 0

function loop(time) {
  if (time - lastDrop >= 800) {
    lastDrop = time
    tryMove(0, 1)
  }
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh; `loop` asks again at its
  end, so it keeps running.
- `time` is the time since the page opened, in milliseconds; `lastDrop` remembers when the piece last fell.
- When 800 ms have passed, note the time and try to move one row down. `draw()` runs every frame.

# --meaning-tr--

- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenilemeden önce `loop`'u çalıştır" der. `loop` da
  sonunda aynı isteği tekrarlar; böylece döngü hiç durmaz (saniyede ~60 tur).
- `function loop(time) {` → tarayıcı `time` olarak sayfa açıldığından beri geçen süreyi **milisaniye** cinsinden
  verir (1000 ms = 1 saniye).
- `let lastDrop = 0` → parçanın **en son ne zaman** düştüğü.
- `if (time - lastDrop >= 800) {` → son düşüşten beri en az 800 ms geçtiyse:
  - `lastDrop = time` → "şimdi düştü" diye not al;
  - `tryMove(0, 1)` → bir satır aşağı gitmeyi dene.
- `draw()` → `if`'in dışında: çizim her karede.
- En alttaki `requestAnimationFrame(loop)` → döngüyü başlatır; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

1. Under `let piece` write `let lastDrop = 0`.
2. Delete the `draw()` line in the key listener.
3. Replace the `draw()` call at the very bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

1. `let piece = ...` satırının altına `let lastDrop = 0` yaz.
2. Tuş dinleyicisinin içindeki `draw()` satırını sil.
3. En alttaki `draw()` satırını sil; yerine `loop` fonksiyonunu ve bir boş satırdan sonra `requestAnimationFrame(loop)`
   yaz.
4. **Çalıştır**: T yavaş yavaş düşmeli ve dibe varınca durmalı.

# --predict--

The T reaches the bottom. What happens then?
- [ ] A new piece appears at the top
- [x] It just stays there; nothing else happens
  `tryMove` refuses to go through the floor, and nothing makes a new piece yet.
- [ ] It falls out of the well

# --predict-tr--

T dibe ulaşıyor. Sonra ne olur?
- [ ] Tepede yeni bir parça belirir
- [x] Orada durur; başka bir şey olmaz
  `tryMove` zeminden geçmeyi reddediyor ve yeni parça yapan bir şey henüz yok.
- [ ] Kuyudan düşüp gider

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

The loop should keep drawing every frame.
tr: Döngü her karede çizmeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
piece.x = 0
$.tick(1)
const purple = $.rects('#a855f7').map((r) => (r.x - 1) / 24)
assert.include(purple, 0, 'the new place is drawn without a key press')
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

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)
let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }
let lastDrop = 0

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

document.addEventListener('keydown', (event) => {
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
  drawShape(piece.shape, piece.x, piece.y)
}

function loop(time) {
  if (time - lastDrop >= 800) {
    lastDrop = time
    tryMove(0, 1)
  }
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
