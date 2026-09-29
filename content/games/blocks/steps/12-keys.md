---
title: Move with the arrows
title_tr: Oklarla oynat
skills: [game.input]
---

# --goal--

The arrow keys move the piece left, right and down. Each is `tryMove` with a different `(dx, dy)`. Afterwards we
redraw, because nothing redraws the screen by itself yet.

# --goal-tr--

Şimdi ok tuşlarını bağlıyoruz: sol, sağ ve aşağı. Üçü de aynı fonksiyon, yalnız `(dx, dy)` farklı. Parça duvarlardan
geçemeyecek, çünkü her hareket önce `fits`'e soruyor.

Tuşa basınca ekranı elle yeniden çiziyoruz (`draw()`); çünkü ekranı sürekli yenileyen bir döngümüz henüz yok.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
  if (event.key === 'ArrowDown') tryMove(0, 1)
  draw()
})
```

# --meaning--

- `addEventListener('keydown', ...)` runs the function every time a key goes down; `event.key` is its name.
- Each `if` checks one arrow and tries the matching move.
- `draw()` shows the result.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa basıldığında bu fonksiyonu çalıştır".
  Buna **olay dinlemek** (event listener) denir. Fonksiyon hemen çalışmaz; her basışta tarayıcı onu çağırır ve
  basışın bilgisini `event` adıyla verir.
- `event.key` → basılan tuşun adı: `'ArrowLeft'` sol ok, `'ArrowRight'` sağ ok, `'ArrowDown'` aşağı ok.
- `===` → "tam olarak eşit mi?" diye sorar.
- `draw()` → değişikliği ekrana yansıt.

# --task--

Write the listener above `function drawCell(`, then Run, click the game and use the arrows.

# --task-tr--

1. Dinleyiciyi `function drawCell(` satırının **üstüne** yaz; altında bir boş satır kalsın.
2. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin) ve oklarla T'yi gezdir. Duvardan geçmemeli.

# --hint--

Key names start with a capital: `'ArrowLeft'`, not `'arrowleft'`.

# --hint-tr--

Tuş adları büyük harfle başlar: `'arrowleft'` değil, `'ArrowLeft'`.

# --tests--

The arrow keys should move the piece and redraw it.
tr: Ok tuşları parçayı taşımalı ve yeniden çizmeli.

```js
$.press('ArrowLeft')
$.press('ArrowLeft')
$.press('ArrowDown')
assert.deepInclude(piece, { x: 1, y: 1 })
const purple = $.rects('#a855f7').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(purple, [[2, 1], [1, 2], [2, 2], [3, 2]])
```

The piece should stop at the wall.
tr: Parça duvarda durmalı.

```js
for (let i = 0; i < 10; i++) $.press('ArrowLeft')
assert.strictEqual(piece.x, 0)
for (let i = 0; i < 10; i++) $.press('ArrowRight')
assert.strictEqual(piece.x, 7)
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') tryMove(-1, 0)
  if (event.key === 'ArrowRight') tryMove(1, 0)
  if (event.key === 'ArrowDown') tryMove(0, 1)
  draw()
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

draw()
```
