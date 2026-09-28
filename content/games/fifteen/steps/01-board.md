---
title: A board in one array
title_tr: Tek bir dizide bir tahta
skills: [prog.arrays]
---

# --explanation--

The board is 4 by 4, but it does not need a 2D array. A **flat** array of 16 numbers, read row by row, is simpler to shuffle
and compare:

```
position:  0  1  2  3        tiles: 1  2  3  4
           4  5  6  7               5  6  7  8
           8  9 10 11               9 10 11 12
          12 13 14 15              13 14 15  0     (0 is the gap)
```

Row and column come back with division and remainder:

```js
const rowOf = (i) => Math.floor(i / N)   // position 6 -> row 1
const colOf = (i) => i % N               // position 6 -> column 2
```

This trick (a grid stored in one array, with `row * N + col` one way and `/` and `%` the other) is used everywhere: images
are stored exactly like this, pixel by pixel, row by row.

The solved board is `1` to `15` followed by the gap, and each tile is drawn at its square with its number in the middle.

# --explanation-tr--

**Bu adımda:** 15 bulmacasının tahtasını çizeceğiz. Sağda koyu bir zeminde 1'den 15'e kadar numaralı 15 turuncu taş
göreceksin; sağ alt köşe boş kalacak (taşların kayacağı **boşluk**).

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 400×460 piksellik bir çizim alanı (**canvas**, kimliği `game`) var. Önce onu buluruz,
sonra çizim aracını (**context**, bağlam) alırız:

```js
const canvas = document.getElementById('game')  // kâğıdı bul
const ctx = canvas.getContext('2d')             // fırçayı al
```

`const ad = ...` bir şeye ad verir (**sabit**); `let ad` ise değeri sonradan değişebilen bir kutu açar (**değişken**).
Nokta (`.`) "bunun içindeki şu komut" demektir; tırnak içindeki `'game'` bir **yazıdır**. Canvas'ın **sol üst köşesi**
`(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür. `ctx.fillStyle = 'renk'` rengi seçer, `ctx.fillRect(x, y, en, boy)`
dikdörtgen boyar, `ctx.fillText(yazı, x, y)` yazı yazar.

**Tahta tek bir liste.** Tahta 4×4 ama onu tek sıralı bir liste (**dizi**, array) olarak tutarız: 16 sayı, satır
satır okunur. Boşluk `0` ile gösterilir:

```
konum:   0  1  2  3        taşlar:  1  2  3  4
         4  5  6  7                 5  6  7  8
         8  9 10 11                 9 10 11 12
        12 13 14 15                13 14 15  0
```

`tiles[6]` 6. konumdaki taşın numarasıdır (sayma 0'dan başlar). Satırı ve sütunu bölme ve kalanla geri buluruz:

```js
const rowOf = (i) => Math.floor(i / N)   // konum 6 -> satır 1
const colOf = (i) => i % N               // konum 6 -> sütun 2
```

`(i) => ...` kısa yazılmış bir **fonksiyondur** (ok fonksiyonu): `i` verilir, oktan sonrası sonuçtur. `Math.floor`
aşağı yuvarlar (6 / 4 = 1.5 → 1), `%` bölümden kalandır (6 % 4 → 2). Bir ızgarayı tek listede tutmak her yerde
kullanılır; resimler de piksel piksel, satır satır böyle saklanır.

**Çözülmüş tahta.** `[...Array(N * N - 1).keys()]` → 0'dan 14'e sayılar; `.map((i) => i + 1)` her birine 1 ekler
(1…15); `.concat(0)` sona `0` ekler. Sonuç: `[1, 2, ..., 15, 0]`.

**Fonksiyonlar.** `function drawTile(number, x, y) { ... }` → verilen numarayı verilen yere çizen bir iş tanımlar;
`number`, `x`, `y` ona verilen değerlerdir (**parametre**). `return` sonucu geri verir. Tanımlamak çalıştırmaz,
`drawTile(5, 11, 60)` diye **çağırınca** çalışır. `String(number)` sayıyı yazıya çevirir.

**Taşları çizmek.** `tiles.forEach((number, i) => { ... })` listedeki her eleman için bir kez döner: `number` taşın
numarası, `i` konumu. `if (number === 0) return` → "boşluksa bu turu atla" (`===` "eşit mi?" demektir).

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki karede `loop`'u çağır" der; `loop` sonunda
kendini yine istediği için ekran saniyede ~60 kez yeniden çizilir.

# --task--

1. Add `N = 4`, `SIZE = 90`, `GAP = 6`, `TOP = 60` and `LEFT` so the board is centered.
2. Add `rowOf`, `colOf` and `solvedTiles()` returning `[1, 2, ..., 15, 0]`. `reset()` sets `tiles` to it.
3. Write `squareX(i)` and `squareY(i)`, the top-left corner of square `i`, and `drawTile(number, x, y)`: a `'#f59e0b'` square
   with the number centered in `'#1c1917'`, `'bold 36px sans-serif'` (at `y + SIZE / 2 + 2`, `textBaseline` `'middle'`).
4. Every frame, fill `'#292524'` and draw every tile except the gap.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunu yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve ölçüleri ekle. `LEFT`, tahtayı ortalamak için soldan bırakılacak boşluk (4 taş ve 3
   aralık canvas'ın eninden çıkar, kalan ikiye bölünür):

   ```js
   const N = 4 // 4 by 4: tiles 1 to 15 and one gap
   const SIZE = 90
   const GAP = 6
   const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
   const TOP = 60
   ```

3. Bir satır boşluk bırak ve tahtayı tutacak değişkeni, yardımcıları ve `reset`'i ekle:

   ```js
   let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

   const rowOf = (i) => Math.floor(i / N)
   const colOf = (i) => i % N
   const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

   function reset() {
     tiles = solvedTiles()
   }
   ```

4. Altına bir karenin sol üst köşesini hesaplayan iki fonksiyon ve taş çizen fonksiyonu ekle:

   ```js
   function squareX(i) {
     return LEFT + colOf(i) * (SIZE + GAP)
   }
   function squareY(i) {
     return TOP + rowOf(i) * (SIZE + GAP)
   }

   function drawTile(number, x, y) {
     ctx.fillStyle = '#f59e0b'
     ctx.fillRect(x, y, SIZE, SIZE)
     ctx.fillStyle = '#1c1917'
     ctx.font = 'bold 36px sans-serif'
     ctx.textAlign = 'center'
     ctx.textBaseline = 'middle'
     ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
   }
   ```

5. Altına çizim fonksiyonunu ve oyun döngüsünü ekle, en sonda ikisini başlat:

   ```js
   function draw() {
     ctx.fillStyle = '#292524'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     tiles.forEach((number, i) => {
       if (number === 0) return
       drawTile(number, squareX(i), squareY(i))
     })
   }

   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda 1'den 15'e sıralı turuncu taşlar ve sağ altta bir boşluk
   görmelisin; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri ve büyük/küçük harfleri harf harf
   karşılaştır.

# --tests--

The board should start solved, with the gap last.
tr: Tahta, boşluk sonda olmak üzere çözülmüş başlamalı.

```js
assert.deepEqual(tiles, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
assert.deepEqual([rowOf(6), colOf(6)], [1, 2])
assert.deepEqual([rowOf(15), colOf(15)], [3, 3])
assert.strictEqual(LEFT, 11)
```

Each tile should be drawn on its square with its number.
tr: Her taş karesinde numarasıyla çizilmeli.

```js
$.tick(1)
const squares = $.rects('#f59e0b')
assert.lengthOf(squares, 15)
assert.deepEqual([squares[0].x, squares[0].y, squares[0].w], [11, 60, 90])
assert.deepEqual([squares[14].x, squares[14].y], [11 + 2 * 96, 60 + 3 * 96])
assert.deepEqual($.texts(), ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'])
```

# --seed--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

function reset() {
  tiles = solvedTiles()
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  tiles.forEach((number, i) => {
    if (number === 0) return
    drawTile(number, squareX(i), squareY(i))
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
