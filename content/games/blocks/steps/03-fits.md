---
title: Does it fit?
title_tr: Sığıyor mu?
skills: [game.collision, prog.functions]
---

# --explanation--

Every rule in this game (moving, rotating, falling, landing, losing) comes down to one question: **would this shape
fit at this position?** Answer it once, in a function, and everything else becomes easy.

A shape at `(x, y)` fits when every one of its filled cells lands on a spot that is:

- inside the well horizontally (`0 ≤ col < COLS`),
- not below the floor (`row < ROWS`),
- and not already taken on the board.

One special case: rows **above** the top (`row < 0`) are allowed. A piece that has just appeared, or has just been
turned near the top, may stick out above the well for a moment, and that must not count as a collision. So only look
the cell up on the board when `row >= 0`.

Notice that `fits` takes the shape and position as **parameters** instead of reading `piece`. That way you can ask
"what if?" about a moved or rotated shape **before** changing anything, and only commit the change if the answer is
yes.

# --explanation-tr--

**Bu adımda:** "bu şekil şu konuma sığar mı?" sorusunu cevaplayan bir fonksiyon yazacağız. Ekranda bir şey
değişmeyecek; doğru çalıştığını alttaki kontroller söyleyecek. Ama oyunun bütün kuralları bu fonksiyona dayanacak.

**Neden bu kadar önemli?** Sağa-sola gitmek, döndürmek, düşmek, yere oturmak, kaybetmek... Hepsi aynı soruya
iner: **bu şekil bu konuma sığar mı?** Bunu bir kez, bir fonksiyonda cevaplarsak gerisi kolaylaşır.

`(x, y)` konumundaki bir şeklin **her dolu hücresi** şu yere düşüyorsa şekil sığar:

- kuyunun yanlarının içinde (`0 ≤ sütun < COLS`),
- zeminin altında değil (`satır < ROWS`),
- ve kuyuda zaten dolu olmayan bir yer.

**Özel durum:** kuyunun **üstündeki** satırlara (`satır < 0`) izin verilir. Yeni çıkan ya da tepede döndürülen bir
parça bir an kuyunun üstüne taşabilir; bu çarpışma sayılmamalı. Bu yüzden kuyuya yalnızca `row >= 0` ise bakarız.
(Ayrıca `board[-1]` diye bir satır yok; bakmaya çalışsak program hata verirdi.)

**Fonksiyonun cevabı: `true` / `false`.** `true` "evet", `false` "hayır" demektir (mantıksal değer, boolean).
`return false` fonksiyonu **hemen bitirir** ve "hayır" cevabını verir; tek bir hücre bile sığmıyorsa geri kalanına
bakmaya gerek yok. Bütün hücreler kontrolden geçerse en sondaki `return true` çalışır.

Kodu parça parça okuyalım:

- İki `for` döngüsü matrisin her satırını (`r`) ve her sütununu (`c`) gezer. `shape.length` matrisin satır sayısı,
  `shape[r].length` o satırın uzunluğu. `r++` sayacı 1 artırır.
- `if (!shape[r][c]) continue` → `!` "değil" demektir. "Hücre boşsa (0 ise) atla, sonrakine geç." `continue`
  döngünün bu turunu bırakır. Matrisin boş hücreleri hiçbir şeye çarpmaz.
- `const col = x + c` ve `const row = y + r` → bu hücrenin kuyudaki yeri.
- `col < 0 || col >= COLS || row >= ROWS` → `||` "veya" demektir. Sol duvarın solunda **veya** sağ duvarın ötesinde
  **veya** zeminin altındaysa sığmaz. (`<` küçük, `>=` büyük ya da eşit.)
- `row >= 0 && board[row][col]` → `&&` "ve" demektir. Kuyunun içindeyse **ve** o yer doluysa sığmaz.

**Neden `piece`'i doğrudan okumuyor?** `fits` şekli ve konumu **girdi** (parametre) olarak alır. Böylece bir şeyi
değiştirmeden önce "ya sağa gitseydi?", "ya döndürseydik?" diye sorabilir, cevap "evet" ise değişikliği yaparız.

# --task--

Write `function fits(shape, x, y)` that returns `true` when every non-zero cell of `shape`, placed with its top-left at
column `x` and row `y`, is inside the well's sides, above its floor, and on an empty board cell (rows above the top
count as empty).

# --task-tr--

1. `let piece = ...` satırının altına, bir satır boşlukla `fits` fonksiyonunu yaz:

   ```js
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
   ```

2. **Çalıştır**'a bas. Oyun alanı aynı görünecek; alttaki kontrollerin hepsi yeşil olmalı. "above the top" kontrolü
   kırmızıysa ikinci `if`'teki `row >= 0 &&` kısmını unutmuşsundur.

# --tests--

A piece should fit in an empty well, and not past its sides or floor.
tr: Bir parça boş kuyuya sığmalı; yanlarının ve zemininin ötesine sığmamalı.

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
assert.isTrue(fits(I, 0, -1), 'the I piece has empty rows above and below its blocks')
assert.isTrue(fits(I, 6, 18), 'its blocks are on row 19, the last row')
```

A piece should not fit over blocks on the board.
tr: Bir parça tahtadaki blokların üstüne sığmamalı.

```js
board[10][4] = 5
assert.isFalse(fits(SHAPES[2], 3, 9))
assert.isTrue(fits(SHAPES[2], 3, 8))
assert.isTrue(fits(SHAPES[1], 5, 9), 'right next to the block')
```

Rows above the top of the well should count as empty.
tr: Kuyunun tepesinin üstündeki satırlar boş sayılmalı.

```js
assert.isTrue(fits(SHAPES[2], 3, -1))
assert.isTrue(fits(SHAPES[5], 0, -1))
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
