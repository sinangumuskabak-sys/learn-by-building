---
title: A grid of numbers
title_tr: Sayılardan bir ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

2048 is played on a 4×4 grid, and this time the natural shape for the data is a **2D array**: an array of rows, where
each row is an array of numbers. `0` means an empty cell.

```js
let board = [
  [0, 2, 0, 0],   // board[0] is the top row
  [0, 0, 4, 0],   // board[1][2] is 4: row 1, column 2
  ...
]
```

`board[row][col]` reads a cell: first the row, then the column. It reads like the picture, which makes 2D arrays pleasant
for grid games whose rules talk about rows and columns (and 2048's rules are all about rows and columns).

Each value gets its own color, from a lookup table keyed by the number: `COLORS[value]`. Numbers are drawn centered in
their cell, with smaller text for bigger numbers so that `1024` still fits.

# --explanation-tr--

**Bu adımda:** 2048'in 4×4'lük tahtasını çizeceğiz. Sağda krem bir zemin, üstte skor için boş bir şerit ve altında
kahverengimsi bir kare içinde 16 boş hücre göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 400 piksel eninde, 460 piksel boyunda bir resim alanı (`canvas`) var. Her şeyi onun
üstüne boyayacağız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir kutuya
  etiket yapıştırmak gibi, sonra hep o adla çağırırsın.
- `document.getElementById('game')` → "sayfada kimliği (id) `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `canvas.getContext('2d')` → çizim aracını (bağlam, **context**) verir. `ctx` artık senin fırçan.

Çizmek iki hareket: `ctx.fillStyle = '#faf8ef'` ile renk seç (renkler `#` ile başlayan kodlarla yazılır),
`ctx.fillRect(x, y, genişlik, yükseklik)` ile dikdörtgen boya. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x` sağa,
`y` **aşağı** doğru büyür.

**Sayılarla hesap.** `const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE` → `*` çarpma, `/` bölme, parantez önce
hesaplanır. 400 pikselden 5 boşluk (5 × 12 = 60) çıkarılır, kalan 340 dört hücreye bölünür: her hücre 85 piksel.
`TOP = 60` tahtanın üstünde skor için bırakılan şerit.

**İki boyutlu dizi (2D array).** **Dizi**, köşeli parantez `[ ]` içinde virgülle ayrılmış bir listedir. 2048'de tahta
bir **satırlar listesi**, her satır da bir **sayılar listesi**dir. `0` boş hücre demek:

```js
let board = [
  [0, 2, 0, 0],   // board[0] en üst satır
  [0, 0, 4, 0],   // board[1][2] = 4: 1. satır, 2. sütun
  ...
]
```

Sayma **0'dan başlar**: ilk satır `board[0]`, ikinci satır `board[1]`. `board[satır][sütun]` bir hücreyi okur: önce
satırı, sonra sütunu seçersin. Tıpkı resme bakar gibi okunur. `let`, `const` gibi ad verir ama sonradan değişebilen
şeyler içindir; tahta oyun boyunca değişecek.

**Fonksiyon.** `function cellX(col) { return ... }` bir talimat paketi **tanımlar**. `col` bir **parametredir**:
`cellX(3)` diye çağırınca içeride `col` 3 olur. `return` sonucu geri verir. `cellX(3)` = `12 + 3 × 97 = 303`: 3.
sütunun sol kenarı. `draw()` diye yazmak ise bir fonksiyonu **çağırır**, yani içini o anda çalıştırır.

**Renk tablosu.** `COLORS` bir **nesnedir**: süslü parantez içinde `ad: değer` çiftleri. Burada adlar sayılar:
`COLORS[8]` 8'in rengini verir.

**Her hücreyi dolaşmak: iç içe `for`.** `for (let row = 0; row < SIZE; row++) { ... }` → `row` 0'dan başlar, 4'ten küçük
olduğu sürece içini yapar, her turdan sonra `row++` ile 1 artar. İçindeki ikinci döngü sütunları dolaşır; böylece 16
hücrenin hepsine birer kez bakılır.

**Kısa "eğer": `a ? b : c`.** "`a` doğruysa `b`, değilse `c`". `value === 0 ? '#cdc1b4' : COLORS[value]` → hücre
boşsa (`===` "eşit mi?" demektir) boş hücre rengi, değilse sayının rengi. Sondaki `|| '#3c3a32'` "tabloda yoksa bu koyu
rengi kullan" demektir (2048'den büyük sayılar için). Yazı boyu için iki tane art arda kullanılır: 100'den küçükse 40,
değilse 1000'den küçükse 34, değilse 26. Böylece `1024` bile hücreye sığar.

**Sayıyı ortalamak.** `ctx.textAlign = 'center'` ve `ctx.textBaseline = 'middle'` ile yazı, verilen noktanın tam
ortasına yazılır. Hücrenin ortası: sol kenar + `CELL / 2`. `String(value)` sayıyı yazıya çevirir,
`ctx.fillText(yazı, x, y)` onu boyar. `'bold ' + 40 + 'px sans-serif'` yazıları birleştirir: `'bold 40px sans-serif'`.
`!==` "eşit değil", `<=` "küçük ya da eşit" demektir.

# --task--

1. Store the canvas and context in `canvas` and `ctx`. Add `SIZE = 4`, `GAP = 12`,
   `CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE` (that is 85), `TOP = 60`, the `COLORS` table from the solution, and
   `let board`, a 4×4 array of zeros.
2. Write `cellX(col)` = `GAP + col * (CELL + GAP)` and `cellY(row)` = `TOP + GAP + row * (CELL + GAP)`.
3. Write `draw()`: fill the canvas with `'#faf8ef'`, draw the board background `'#bbada0'` as a square from
   `(0, TOP)` as wide as the canvas, then every cell: `'#cdc1b4'` when empty, `COLORS[value]` otherwise. For non-empty
   cells, draw the number centered in the cell, `'#776e65'` for 2 and 4 and `'#f9f6f2'` for bigger numbers, in
   `bold 40px` below 100, `bold 34px` below 1000 and `bold 26px` otherwise. Call `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve tahtanın ölçülerini ve renk tablosunu ekle:

   ```js
   const SIZE = 4
   const GAP = 12
   const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
   const TOP = 60 // tahtanın üstünde skor için yer
   const COLORS = {
     2: '#eee4da',
     4: '#ede0c8',
     8: '#f2b179',
     16: '#f59563',
     32: '#f67c5f',
     64: '#f65e3b',
     128: '#edcf72',
     256: '#edcc61',
     512: '#edc850',
     1024: '#edc53f',
     2048: '#edc22e',
   }
   ```

3. Bir satır boşluk bırak ve boş tahtayı yaz:

   ```js
   let board = [
     [0, 0, 0, 0],
     [0, 0, 0, 0],
     [0, 0, 0, 0],
     [0, 0, 0, 0],
   ]
   ```

4. Altına, bir sütunun ve bir satırın piksel konumunu veren iki fonksiyonu yaz:

   ```js
   function cellX(col) {
     return GAP + col * (CELL + GAP)
   }

   function cellY(row) {
     return TOP + GAP + row * (CELL + GAP)
   }
   ```

5. Altına çizim fonksiyonunu yaz. Önce arka planı ve tahtanın zeminini boyar, sonra 16 hücreyi ve içlerindeki sayıları
   çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#faf8ef'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#bbada0'
     ctx.fillRect(0, TOP, canvas.width, canvas.width)

     ctx.textAlign = 'center'
     ctx.textBaseline = 'middle'
     for (let row = 0; row < SIZE; row++) {
       for (let col = 0; col < SIZE; col++) {
         const value = board[row][col]
         ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
         ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
         if (value !== 0) {
           ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
           ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
           ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
         }
       }
     }
   }
   ```

   Tahtanın zemini `canvas.width` eninde **ve** boyunda bir karedir (400×400); bu yüzden `fillRect`'e iki kez
   `canvas.width` veriyoruz.

6. En alta fonksiyonu çağıran satırı ekle:

   ```js
   draw()
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda üstte krem bir şerit ve altında 16 boş, açık renkli hücreli bir
   tahta görünmeli; alttaki kontrollerin hepsi yeşil olmalı. Henüz sayı yok, çünkü tahta sıfırlarla dolu. Kırmızı
   kalırsa `'bold '` içindeki boşluğa ve `'px sans-serif'` yazımına dikkat et.

# --tests--

The board should start as a 4×4 grid of zeros.
tr: Tahta sıfırlardan oluşan 4×4'lük bir ızgara olarak başlamalı.

```js
assert.deepEqual([SIZE, GAP, CELL, TOP], [4, 12, 85, 60])
assert.deepEqual(board, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
assert.lengthOf($.rects('#cdc1b4'), 16)
```

Cells should be laid out with gaps below the score strip.
tr: Hücreler skor şeridinin altında boşluklarla dizilmeli.

```js
assert.deepEqual([cellX(0), cellX(3)], [12, 303])
assert.deepEqual([cellY(0), cellY(3)], [72, 363])
```

Numbers should be drawn in their cell with their color.
tr: Sayılar kendi hücrelerinde kendi renkleriyle çizilmeli.

```js
board = [[2, 0, 0, 0], [0, 8, 0, 0], [0, 0, 128, 0], [0, 0, 0, 2048]]
draw()
assert.deepInclude($.rects(), { x: 12, y: 72, w: 85, h: 85, color: '#eee4da' })
assert.deepInclude($.rects(), { x: 303, y: 363, w: 85, h: 85, color: '#edc22e' })
assert.lengthOf($.rects('#cdc1b4'), 12)
const texts = $.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.args[1], c.args[2], c.font, c.fill])
assert.deepInclude(texts, ['2', 54.5, 114.5, 'bold 40px sans-serif', '#776e65'])
assert.deepInclude(texts, ['8', 151.5, 211.5, 'bold 40px sans-serif', '#f9f6f2'])
assert.deepInclude(texts, ['2048', 345.5, 405.5, 'bold 26px sans-serif', '#f9f6f2'])
```

# --seed--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

draw()
```
