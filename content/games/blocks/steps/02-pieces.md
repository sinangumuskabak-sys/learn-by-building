---
title: Pieces as little grids
title_tr: Küçük ızgaralar olarak parçalar
skills: [prog.arrays, game.state]
---

# --explanation--

Each of the seven pieces is itself a tiny grid, a **matrix**, where non-zero numbers mark the filled cells:

```js
[
  [0, 3, 0],   // the T piece
  [3, 3, 3],
  [0, 0, 0],
]
```

The number doubles as the piece's **color**: `COLORS[3]` is purple. The same number is later copied into the board when
the piece lands, so the board remembers the color of every block without any extra data.

All matrices are **square** (2×2, 3×3 or 4×4), with some empty rows. That looks wasteful, but it is what lets a piece
rotate around its center in a later step.

The falling piece is a matrix plus a position in the well, `{ shape, x, y }`, measured in cells. Drawing it means: for
every filled cell of the matrix at `[r][c]`, draw a cell at `(x + c, y + r)`. Take a **copy** of the shape
(`SHAPES[2].map((row) => [...row])`) so that turning or changing the falling piece later never changes the original
template.

# --explanation-tr--

**Bu adımda:** yedi parçanın şeklini ve rengini tanımlayıp ilk parçayı çizeceğiz. Kuyunun üst ortasında mor bir
**T** parçası göreceksin.

**Parça = küçük bir ızgara.** Her parça kendi başına minik bir tablodur (**matris**): sayılardan oluşan satırların
listesi. 0 boş, 0 olmayan sayı dolu hücre demektir:

```js
[
  [0, 3, 0],   // T parçası
  [3, 3, 3],
  [0, 0, 0],
]
```

Satırları alt alta yazınca şekli gözünle görebilirsin: üstte ortada bir blok, altında üç blok → T.

**Sayı aynı zamanda renktir.** `COLORS` bir renk listesidir; `COLORS[3]` mor. Parça yere oturunca bu sayı kuyuya
kopyalanacak; böylece kuyu her bloğun rengini ekstra bilgi tutmadan hatırlar. Listenin ilk elemanı `null` ("boş"),
çünkü 0 boş hücre demek ve rengi yok.

**Neden hepsi kare?** Bütün matrisler kare (2×2, 3×3 ya da 4×4), bazılarında boş satırlar var. Boşa yer harcıyor gibi
görünür ama sonraki bir adımda parçayı merkezi etrafında döndürmemizi sağlayan şey budur.

**Nesne (object).** Birkaç bilgiyi tek pakette tutar: `{ shape: ..., x: 3, y: 0 }` "şekli şu, sütunu 3, satırı 0 olan
şey". İçindeki bilgiye nokta ile ulaşırsın: `piece.x`. Düşen parça = şekil + kuyudaki yeri (hücre cinsinden).

**Kopya almak.**

```js
SHAPES[2].map((row) => [...row])
```

- `SHAPES[2]` üçüncü şekil (sayma 0'dan başlar), yani T.
- `.map(...)` listedeki her elemanı bir fonksiyondan geçirip **yeni bir liste** yapar.
- `(row) => [...row]` bir **ok fonksiyonu**dur (kısa yazılmış fonksiyon): soldaki `row` girdi, `=>`'nin sağı sonuç.
  `[...row]` satırın elemanlarını yeni bir diziye döker, yani satırın **kopyasını** çıkarır.

Kopya şart: sonra düşen parçayı döndürdüğümüzde asıl şablon `SHAPES` bozulmasın.

**Parçayı çizmek.** Matrisin `[r][c]` konumundaki her dolu hücreyi kuyuda `(x + c, y + r)`'ye çizeriz:

```js
shape.forEach((cells, r) => {
  cells.forEach((value, c) => {
    if (value) drawCell(x + c, y + r, color || COLORS[value])
  })
})
```

- `forEach` listedeki her eleman için fonksiyonu çalıştırır; fonksiyona eleman ile **sıra numarasını** verir. Dıştaki
  her satırı (`cells`, satır no `r`), içteki o satırdaki her sayıyı (`value`, sütun no `c`) gezer.
- `color || COLORS[value]` → `||` burada "yoksa" gibi çalışır: `color` verildiyse onu, verilmediyse sayının rengini
  kullan. `drawShape`'i dördüncü girdi olmadan çağırırsak `color` boş kalır.

Kuyudaki dolu hücreler de artık gri değil, kendi sayılarının rengiyle çizilir: `COLORS[board[row][col]]`.

# --task--

1. Add the `COLORS` and `SHAPES` constants (seven square matrices; the number in a cell is its color):

   ```js
   const COLORS = [null, '#22d3ee', '#facc15', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316']
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
   ```

2. Add `let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }` (the T piece, near the middle).
3. Write `drawShape(shape, x, y, color)` that draws every non-zero cell of `shape` at `(x + c, y + r)`, in `color` if
   given, otherwise `COLORS[value]`. Draw board cells in `COLORS[value]` too, and draw the piece at the end of `draw()`.

# --task-tr--

1. `const CELL = 24` satırının altına renk listesini ve yedi şekli ekle:

   ```js
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
   ```

   Sırayla: I, O, T, S, Z, J, L parçaları. Her birinde tam 4 dolu hücre var.

2. `let board = ...` satırının altına düşen parçayı ekle:

   ```js
   let piece = { shape: SHAPES[2].map((row) => [...row]), x: 3, y: 0 }
   ```

3. `drawCell` fonksiyonunun kapanış `}`'sinin altına, bir satır boşlukla şekil çizen fonksiyonu yaz:

   ```js
   function drawShape(shape, x, y, color) {
     shape.forEach((cells, r) => {
       cells.forEach((value, c) => {
         if (value) drawCell(x + c, y + r, color || COLORS[value])
       })
     })
   }
   ```

4. `draw()` fonksiyonunda kuyu hücrelerini çizen satırı değiştir ve en sona parçayı çizen satırı ekle:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#1e293b'
     ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

     for (let row = 0; row < ROWS; row++) {
       for (let col = 0; col < COLS; col++) {
         if (board[row][col]) drawCell(col, row, COLORS[board[row][col]]) // ← değişti
       }
     }
     drawShape(piece.shape, piece.x, piece.y) // ← yeni
   }
   ```

5. **Çalıştır**'a bas. Kuyunun tepesinde, ortanın biraz solunda mor bir T görmelisin; alttaki kontrollerin hepsi yeşil
   olmalı. "copy" diyen kontrol kırmızıysa `.map((row) => [...row])` kısmını unutmuşsundur.

# --tests--

There should be seven square pieces, each with four blocks of one color.
tr: Her biri tek renkli dört bloktan oluşan yedi kare parça olmalı.

```js
assert.lengthOf(SHAPES, 7)
SHAPES.forEach((shape, i) => {
  assert.isTrue(shape.every((row) => row.length === shape.length), `piece ${i} should be square`)
  const cells = shape.flat().filter((v) => v !== 0)
  assert.lengthOf(cells, 4, `piece ${i} should have 4 blocks`)
  assert.isTrue(cells.every((v) => v === i + 1), `piece ${i} should use the number ${i + 1}`)
})
```

The falling piece should be a copy of the T, drawn at its position.
tr: Düşen parça T'nin bir kopyası olmalı ve kendi konumunda çizilmeli.

```js
assert.deepEqual(piece.shape, SHAPES[2])
assert.notStrictEqual(piece.shape, SHAPES[2], 'take a copy of the shape')
assert.notStrictEqual(piece.shape[0], SHAPES[2][0], 'copy the rows too')
const purple = $.rects('#a855f7').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(purple, [[4, 0], [3, 1], [4, 1], [5, 1]])
```

Board cells should use the color of their number.
tr: Tahta hücreleri sayılarının rengini kullanmalı.

```js
board[19][0] = 6
draw()
assert.deepInclude($.rects('#3b82f6'), { x: 1, y: 457, w: 22, h: 22, color: '#3b82f6' })
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
  drawShape(piece.shape, piece.x, piece.y)
}

draw()
```
