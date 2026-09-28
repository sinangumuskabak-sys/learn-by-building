---
title: Rotating a matrix
title_tr: Bir matrisi döndürmek
skills: [prog.arrays, prog.functions]
---

# --explanation--

Turning a piece 90° clockwise is a neat bit of array work. Look at what happens to the T:

```
0 3 0        0 3 0
3 3 3   →    0 3 3
0 0 0        0 3 0
```

The **first column, read from the bottom up**, becomes the **first row**. The second column, bottom up, becomes the
second row, and so on. In code:

```js
shape[0].map((_, col) => shape.map((row) => row[col]).reverse())
```

`shape.map((row) => row[col])` collects column `col` from top to bottom; `.reverse()` makes it bottom-up. The outer
`map` does that for every column. This only works on **square** matrices, which is why every piece was square from the
start.

Rotating uses "try first" too: compute the turned shape, and only keep it if it fits. But a piece pressed against a wall
often cannot turn in place, and simply refusing feels awful. So try a few **wall kicks**: the same turn, nudged 1 or 2
cells sideways. The first position that fits wins. Real games use tables of kicks; this simple list covers most
situations.

# --explanation-tr--

**Bu adımda:** yukarı ok (ya da `x` tuşu) ile parçayı saat yönünde 90° döndüreceğiz. Duvara yaslı parça da yana
kayarak dönebilecek.

**Döndürmek nasıl olur?** T parçasına bak:

```
0 3 0        0 3 0
3 3 3   →    0 3 3
0 0 0        0 3 0
```

Soldaki matrisin **ilk sütunu, aşağıdan yukarı okununca** sağdakinin **ilk satırı** olur (0, 3, 0). İkinci sütun
aşağıdan yukarı → ikinci satır (0, 3, 3). Üçüncü sütun → üçüncü satır. Kodda:

```js
shape[0].map((_, col) => shape.map((row) => row[col]).reverse())
```

İçten dışa parça parça okuyalım:

- `shape.map((row) => row[col])` → her satırdan `col` numaralı sayıyı al; yani `col` sütununu **yukarıdan aşağı** bir
  liste olarak topla.
- `.reverse()` → listeyi ters çevir; artık **aşağıdan yukarı**.
- `shape[0].map((_, col) => ...)` → ilk satırın her elemanı için bir kez, yani **her sütun için** bunu yap ve
  sonuçları yeni bir listede topla. `map` fonksiyona eleman ile sıra numarasını verir; bize yalnız sıra numarası
  (`col`) lazım, kullanmadığımız elemana `_` deriz.

`map` her zaman **yeni** bir liste yaptığı için asıl şekil değişmez. Bu yöntem yalnız **kare** matrislerde çalışır;
bütün parçaları baştan kare yapmamızın sebebi buydu. Dört kez döndürünce parça başladığı hâle döner.

**Döndürürken de önce dene.** Dönmüş şekli hesapla, yalnızca sığıyorsa kullan. Ama duvara dayanmış bir parça çoğu
zaman yerinde dönemez ve oyunun "hayır" demesi çok kötü hissettirir. O yüzden birkaç **duvar itmesi** (wall kick)
deneriz: aynı dönüşü 1 ya da 2 hücre yana kaydırarak. Sığan ilk konum kazanır:

```js
for (const kick of [0, -1, 1, -2, 2]) { ... }
```

`for (const kick of liste)` listedeki her sayı için içini sırayla bir kez çalıştırır: önce hiç kaydırmadan (0), sonra
1 sola, 1 sağa, 2 sola, 2 sağa. Sığan bulunduğu an `return true` fonksiyonu bitirir; geri kalanlar denenmez. Hiçbiri
sığmazsa en sondaki `return false` çalışır. Gerçek oyunlar itme tabloları kullanır; bu basit liste çoğu durumu çözer.

Tuş kontrolünde `event.key === 'ArrowUp' || event.key === 'x'` → `||` "veya": yukarı ok **veya** x tuşu.

# --task--

1. Write `function rotate(shape)` that returns a **new** matrix turned 90° clockwise, without changing `shape`.
2. Write `function tryRotate()`: compute the turned shape; for each kick in `[0, -1, 1, -2, 2]`, if it fits at
   `piece.x + kick`, keep it (update `shape` and `x`) and return `true`. Return `false` if none fit.
3. Call `tryRotate()` on `ArrowUp` or `x`.

# --task-tr--

1. `let piece = ...` satırının altına, `function fits` satırından önce döndürme fonksiyonunu yaz (arada birer satır
   boşluk bırak):

   ```js
   // Clockwise: the first column, read from the bottom up, becomes the first row.
   function rotate(shape) {
     return shape[0].map((_, col) => shape.map((row) => row[col]).reverse())
   }
   ```

2. `tryMove` fonksiyonunun kapanış `}`'sinin altına, bir satır boşlukla şunu yaz:

   ```js
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
   ```

3. `keydown` bloğunda, `ArrowRight` satırının altına döndürme satırını ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (event.key === 'ArrowLeft') tryMove(-1, 0)
     if (event.key === 'ArrowRight') tryMove(1, 0)
     if (event.key === 'ArrowUp' || event.key === 'x') tryRotate() // ← yeni
     if (event.key === 'ArrowDown') tryMove(0, 1)
     draw()
   })
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra yukarı oka bas: T her basışta saat yönünde dönmeli.
   Alttaki kontrollerin hepsi yeşil olmalı. Parça ters yöne dönüyorsa `.reverse()`'ün yerini kontrol et: içteki
   `map`'in hemen arkasında olmalı.

# --tests--

`rotate()` should turn a matrix clockwise into a new matrix.
tr: `rotate()` bir matrisi saat yönünde yeni bir matrise döndürmeli.

```js
const T = [[0, 3, 0], [3, 3, 3], [0, 0, 0]]
assert.deepEqual(rotate(T), [[0, 3, 0], [0, 3, 3], [0, 3, 0]])
assert.deepEqual(rotate([[1, 2], [3, 4]]), [[3, 1], [4, 2]])
assert.deepEqual(T, [[0, 3, 0], [3, 3, 3], [0, 0, 0]], 'the original must not change')
```

Four turns should bring every piece back to where it started.
tr: Dört dönüş her parçayı başladığı yere geri getirmeli.

```js
for (const shape of SHAPES) {
  assert.deepEqual(rotate(rotate(rotate(rotate(shape)))), shape)
}
assert.deepEqual(rotate(SHAPES[0]), [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]])
```

Rotating in open space should turn the piece in place.
tr: Açık alanda döndürmek parçayı yerinde çevirmeli.

```js
assert.isTrue(tryRotate())
assert.deepEqual(piece.shape, [[0, 3, 0], [0, 3, 3], [0, 3, 0]])
assert.strictEqual(piece.x, 3)
$.press('x')
assert.deepEqual(piece.shape, [[0, 0, 0], [3, 3, 3], [0, 3, 0]])
```

Against a wall, the piece should be kicked sideways to turn.
tr: Duvara yaslıyken parça dönmek için yana itilmeli.

```js
piece = { shape: rotate(SHAPES[0]), x: 7, y: 5 } // an upright I in the last column
assert.isTrue(fits(piece.shape, 7, 5))
$.press('ArrowUp')
assert.deepEqual(piece.shape.map((row) => row.join('')).join('/'), '0000/0000/1111/0000')
assert.strictEqual(piece.x, 6, 'nudged one cell left so the flat I fits')
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
