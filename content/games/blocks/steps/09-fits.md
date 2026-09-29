---
title: Does it fit inside the well?
title_tr: Kuyunun içine sığıyor mu?
skills: [game.collision, prog.functions]
---

# --goal--

Every rule of the game comes down to one question: does this shape fit at this place? First part: every filled cell
must be inside the well's sides and above its floor.

# --goal-tr--

Sağa-sola gitmek, döndürmek, düşmek, yere oturmak, kaybetmek... Oyunun bütün kuralları tek bir soruya iner:
**bu şekil bu yere sığar mı?** Bunu bir kez, bir fonksiyonda cevaplarsak gerisi kolaylaşır: `fits` (sığar).

Bu adımda sorunun ilk yarısı: şeklin **her dolu hücresi** kuyunun yan duvarlarının içinde ve zeminin üstünde mi?
Ekranda bir şey değişmeyecek; doğru çalıştığını kontroller söyleyecek.

# --code--

```js
function fits(shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const col = x + c
      const row = y + r
      if (col < 0 || col >= COLS || row >= ROWS) return false
    }
  }
  return true
}
```

# --meaning--

- `fits` takes the shape and a place as parameters, so it can answer "what if?" questions before anything moves.
- Two loops visit every cell of the matrix; `continue` skips the empty ones: empty cells never collide.
- `col` and `row` are where the cell would be in the well. Left of the wall, right of it or under the floor: it does not
  fit, and `return false` ends the function at once.
- If every cell passed, `return true`.

# --meaning-tr--

- `function fits(shape, x, y) {` → şekli ve yeri **parametre** olarak alır, `piece`'i doğrudan okumaz. Böylece bir
  şeyi değiştirmeden önce "ya sağa gitseydi?", "ya döndürseydik?" diye sorabiliriz.
- İki `for` → matrisin her satırını (`r`) ve her sütununu (`c`) gezer. `shape.length` satır sayısı, `shape[r].length`
  o satırın uzunluğu.
- `if (!shape[r][c]) continue` → `!` "değil" demek: hücre **boşsa** atla. `continue` döngünün bu turunu bırakıp
  sonrakine geçer. Matrisin boş hücreleri hiçbir şeye çarpmaz.
- `const col = x + c`, `const row = y + r` → bu hücrenin kuyudaki yeri.
- `col < 0 || col >= COLS || row >= ROWS` → `||` "veya": sol duvarın solunda **veya** sağ duvarın ötesinde **veya**
  zeminin altında. (`>=` büyük ya da eşit; son sütun 9, son satır 19.)
- `return false` → fonksiyonu **hemen bitirir** ve "hayır" der; tek bir hücre sığmıyorsa gerisine bakmaya gerek yok.
- `return true` → bütün hücreler geçtiyse "evet". `true`/`false` evet/hayır değerleridir.

# --task--

Write `fits` under the `let piece` line, after an empty line.

# --task-tr--

1. `let piece = ...` satırının altına bir boş satır bırakıp `fits` fonksiyonunu yaz.
2. **Çalıştır**: ekran değişmez; kontroller fonksiyonu deniyor.

# --predict--

The T at `y: 18` has its matrix reach row 20, which is outside the well. Does it fit?
- [x] Yes
  Its bottom row is empty, and empty cells are skipped.
- [ ] No

# --predict-tr--

`y: 18`'deki T'nin matrisi 20. satıra kadar uzanıyor; o satır kuyunun dışında. Sığar mı?
- [x] Evet
  Alt satırı boş; boş hücreler atlanıyor.
- [ ] Hayır

# --tests--

A piece should fit in the well, and not past its sides or floor.
tr: Bir parça kuyuya sığmalı; yanlarının ve zemininin ötesine sığmamalı.

```js
const T = SHAPES[2]
assert.isTrue(fits(T, 3, 0))
assert.isTrue(fits(T, 0, 0), 'touching the left wall')
assert.isFalse(fits(T, -1, 0), 'one cell past the left wall')
assert.isTrue(fits(T, 7, 0), 'touching the right wall')
assert.isFalse(fits(T, 8, 0), 'past the right wall')
assert.isTrue(fits(T, 3, 18), 'resting on the floor (its bottom row is empty)')
assert.isFalse(fits(T, 3, 19), 'through the floor')
```

Empty cells of the matrix should not count.
tr: Matrisin boş hücreleri sayılmamalı.

```js
const I = SHAPES[0]
assert.isTrue(fits(I, 6, 18), 'the I has its blocks on its second row: here on row 19, the last one')
assert.isFalse(fits(I, 6, 19))
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
    }
  }
  return true
}

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
