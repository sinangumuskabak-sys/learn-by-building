---
title: Moving with "try first"
title_tr: "\"Önce dene\" ile hareket"
skills: [game.input, game.collision]
---

# --explanation--

With `fits` in hand, moving is a two-step pattern you will use again and again: **try first, then commit**.

```js
function tryMove(dx, dy) {
  if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false   // would it fit there?
  piece.x += dx                                                       // yes: actually move
  piece.y += dy
  return true
}
```

Never move first and "undo" if it went wrong. Checking on a hypothetical position keeps the real state valid at all
times, and returning `true`/`false` lets the caller know whether the move happened. The next steps rely on that answer.

Left, right and down are all the same function with a different `(dx, dy)`. The key handler just maps keys to calls,
then redraws, because nothing moves between key presses yet.

# --explanation-tr--

**Bu adımda:** ok tuşlarıyla parçayı sola, sağa ve aşağı hareket ettireceğiz. Parça duvarlardan ve bloklardan
geçemeyecek.

**Önce dene, sonra yap.** Elimizde `fits` olduğuna göre hareket, oyun boyunca tekrar tekrar kullanacağın iki adımlı
bir kalıptır:

```js
function tryMove(dx, dy) {
  if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false   // oraya sığar mı?
  piece.x += dx                                                       // evet: gerçekten taşı
  piece.y += dy
  return true
}
```

Parça parça:

- `dx` ve `dy` → "kaç sütun sağa, kaç satır aşağı". Sola gitmek `dx = -1`, sağa `dx = 1`, aşağı `dy = 1`.
- `if (!fits(...)) return false` → **yeni** konumda sığmıyorsa hiçbir şeye dokunmadan "hayır" (`false`) cevabıyla çık.
  `!` "değil" demektir.
- `piece.x += dx` → `+=` "üstüne ekle" demektir: `piece.x = piece.x + dx` ile aynı.
- `return true` → "evet, hareket oldu".

Asla önce taşıyıp, yanlış olursa geri almaya çalışma. Varsayımsal bir konumu kontrol etmek gerçek durumu her an
geçerli tutar. `true`/`false` cevabı da çağıran yere hareketin olup olmadığını bildirir; sonraki adımlar bu cevaba
dayanacak.

**Klavyeyi dinlemek (olay, event).** Tarayıcı tuşa basılınca haber verebilir:

```js
document.addEventListener('keydown', (event) => {
  ...
})
```

"Sayfada bir tuşa basıldığında (`'keydown'`) bu fonksiyonu çalıştır" demektir. Fonksiyon hemen çalışmaz; her tuş
basışında tarayıcı onu çağırır ve basışın bilgilerini `event` adıyla verir. `event.key` basılan tuşun adıdır:
`'ArrowLeft'` sol ok, `'ArrowRight'` sağ ok, `'ArrowDown'` aşağı ok.

`if (event.key === 'ArrowLeft') tryMove(-1, 0)` → `===` "eşit mi?" diye karşılaştırır. Sol oksa bir sütun sola
gitmeyi dene.

Sol, sağ ve aşağı aynı fonksiyondur, yalnız `(dx, dy)` farklı. Sonunda `draw()` ile yeniden çizeriz, çünkü henüz
ekranı sürekli yenileyen bir döngümüz yok; bir şey değişince elle çizmemiz gerekiyor.

# --task--

1. Write `function tryMove(dx, dy)` as above.
2. On `keydown`: `ArrowLeft` tries `(-1, 0)`, `ArrowRight` tries `(1, 0)`, `ArrowDown` tries `(0, 1)`. Then `draw()`.

# --task-tr--

1. `fits` fonksiyonunun kapanış `}`'sinin altına, bir satır boşlukla hareket fonksiyonunu yaz:

   ```js
   function tryMove(dx, dy) {
     if (!fits(piece.shape, piece.x + dx, piece.y + dy)) return false
     piece.x += dx
     piece.y += dy
     return true
   }
   ```

2. Onun altına, bir satır boşlukla tuşları dinleyen bloğu yaz:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === 'ArrowLeft') tryMove(-1, 0)
     if (event.key === 'ArrowRight') tryMove(1, 0)
     if (event.key === 'ArrowDown') tryMove(0, 1)
     draw()
   })
   ```

3. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra ok tuşlarına bas: T parçası sola, sağa ve aşağı gitmeli,
   duvarı geçmemeli. Alttaki kontrollerin hepsi yeşil olmalı. Tuşlar çalışmıyorsa `'ArrowLeft'` gibi adların büyük
   harflerini kontrol et.

# --tests--

`tryMove()` should move the piece when it fits and report it.
tr: `tryMove()` sığdığında parçayı taşımalı ve bunu bildirmeli.

```js
assert.isTrue(tryMove(1, 0))
assert.deepInclude(piece, { x: 4, y: 0 })
assert.isTrue(tryMove(0, 1))
assert.deepInclude(piece, { x: 4, y: 1 })
```

It should refuse moves into walls or blocks, leaving the piece where it was.
tr: Duvarlara ya da bloklara doğru hamleleri reddetmeli ve parçayı yerinde bırakmalı.

```js
piece.x = 0
assert.isFalse(tryMove(-1, 0))
assert.strictEqual(piece.x, 0)
board[2][1] = 4
assert.isFalse(tryMove(0, 1))
assert.strictEqual(piece.y, 0)
```

The arrow keys should move the piece and redraw it.
tr: Ok tuşları parçayı taşımalı ve yeniden çizmeli.

```js
$.press('ArrowLeft')
$.press('ArrowLeft')
$.press('ArrowDown')
assert.deepInclude(piece, { x: 1, y: 1 })
const purple = $.rects('#a855f7').map((r) => [(r.x - 1) / 24, (r.y - 1) / 24])
assert.sameDeepMembers(purple, [[2, 1], [1, 2], [2, 2], [3, 2]])
for (let i = 0; i < 10; i++) $.press('ArrowLeft')
assert.strictEqual(piece.x, 0)
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
