---
title: A board of rows and columns
title_tr: Satır ve sütunlardan bir tahta
skills: [prog.arrays]
---

# --explanation--

The board is a **2D array**: an array of rows, each row an array of cells. `board[row][col]` is `0` for an empty hole,
`1` for a red disc and `2` for a yellow one. Row 0 is at the top, so the bottom row is `ROWS - 1`.

Making the rows needs care. This looks right but is a classic bug:

```js
Array(ROWS).fill(Array(COLS).fill(0))   // every row is the SAME array!
```

`fill` puts the same value in every slot, and here the value is one array, so changing a cell in one row changes it in all
rows. `Array.from` calls a function for each row, so each row is a new array:

```js
Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

The board is drawn as a blue rectangle with a circle for every hole. Drawing a circle in a hole's color, dark for empty,
red or yellow for a disc, means one small function, `disc(x, y, color)`, draws the whole board.

# --explanation-tr--

**Bu adımda:** Dört Bağla (Connect Four) tahtasını çizeceğiz. Çalıştırınca sağda, üstte boşluk bırakılmış mavi bir
tahta ve üzerinde 7 sütun, 6 satır halinde 42 koyu yuvarlak delik göreceksin.

**Kod nerede, nasıl çalışır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar atlar, sadece insanlar için not. **Çalıştır** düğmesine basınca kod çalışır; sonucu sağ üstteki
**Oyun** alanında, kodunun doğru olup olmadığını sağ alttaki **Kontroller**'de görürsün.

**Canvas ve fırça.** Sayfada 448×520 piksellik boş bir resim alanı (`canvas`, tuval) var. Her şeyi onun üstüne
boyarız. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')   // kimliği "game" olan canvas'ı bul
const ctx = canvas.getContext('2d')              // onun 2D çizim aracını (fırçayı) al
```

`const ad = ...` bir şeye **ad verir** (sabit): kutuya etiket yapıştırmak gibi. Nokta (`.`) "bunun içindeki şu
komut" demektir. Tırnak içindeki `'game'` bir **yazıdır**; sayılar tırnaksız yazılır. Canvas'ın **sol üst köşesi**
`(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür. Renkler `'#1d4ed8'` gibi kodlarla yazılır; verileni aynen yaz.

```js
ctx.fillStyle = '#1d4ed8'       // renk seç (mavi)
ctx.fillRect(0, 96, 448, 384)   // dikdörtgen boya: x, y, genişlik, yükseklik
```

**Tahta: iki boyutlu dizi.** **Dizi** (array) sıralı bir listedir: `[0, 0, 0]`. Elemanlar **0'dan** numaralanır.
Tahta **satırlardan oluşan bir liste**, her satır da **hücrelerden oluşan bir liste**: listelerin listesi.
`board[row][col]` → önce satırı, sonra sütunu seç. Değer `0` boş delik, `1` kırmızı disk, `2` sarı disktir.
0. satır en üsttedir, en alt satır `ROWS - 1` (yani 5).

**Satırları yaparken dikkat.** Şu doğru görünür ama bilinen bir hatadır:

```js
Array(ROWS).fill(Array(COLS).fill(0))   // bütün satırlar AYNI dizi!
```

`Array(7)` 7 boş yeri olan bir dizi yapar, `.fill(0)` hepsine 0 koyar. Ama dıştaki `fill` her yere **aynı** satırı
koyar; bir satırdaki hücreyi değiştirirsen hepsi değişir. Altı kişiye tek bir defterin fotokopisi yerine **aynı
defteri** vermek gibi. `Array.from` ise her satır için bir fonksiyon çağırır, böylece her satır **yeni** bir
dizidir:

```js
Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

`{ length: ROWS }` "6 elemanlı olsun" demek; `() => ...` her eleman için çalışan küçük bir fonksiyondur (`=>`
fonksiyon yazmanın kısa yolu).

**Değişken ve fonksiyon.** `let board` bir **değişken** tanıtır: `const`'tan farkı, değeri sonradan
değiştirilebilir. Değerini `reset()` fonksiyonu verir. **Fonksiyon**, birkaç satıra bir ad vermektir:
`function reset() { ... }` tarifi yazar, `reset()` tarifi uygular.

**Daire çizmek.** Daire için dört komut gerekir:

```js
ctx.fillStyle = color
ctx.beginPath()                                // yeni bir şekle başla
ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)    // merkez x, y; yarıçap; tam tur
ctx.fill()                                     // şekli boya
```

`Math.PI * 2` "tam bir tur" demektir (360 derece). Yarıçap `CELL / 2 - 6` = 26: delikler arasında boşluk kalır.
Bunu `disc(x, y, color)` adlı bir fonksiyona koyarız; boş delikleri de diskleri de o çizer.

**Her delik için: iç içe döngü.** `for (let row = 0; row < ROWS; row++) { ... }` → `row` 0'dan başlar, 6'dan küçük
olduğu sürece (`<`) içeriyi yapar, her turdan sonra 1 artar (`++`). İçine bir döngü daha koyunca her satır için 7
sütunu gezeriz: 6 × 7 = 42 delik.

**Rengi seçmek.**

```js
board[row][col] ? COLORS[board[row][col]] : '#0f172a'
```

`? :` kısa bir seçimdir: "delikte bir şey var mı? Varsa oyuncunun rengi, yoksa koyu." `0` "yok" sayılır, `1` ve `2`
"var" sayılır. `COLORS[1]` köşeli parantezle `COLORS` nesnesinin `1` alanını okur: kırmızı.

**Oyun döngüsü.** Tahta ileride hareket edecek, bu yüzden saniyede yaklaşık 60 kez yeniden çizeriz:
`requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran boyamasından önce `loop`'u çağır" der; `loop` da
kendini yeniden ister.

# --task--

1. Add `COLS = 7`, `ROWS = 6`, `CELL = 64`, `TOP = 96` and `COLORS = { 1: '#ef4444', 2: '#facc15' }`.
2. `reset()` makes `board` a `ROWS` by `COLS` array of zeros, with a new array for every row.
3. Write `disc(x, y, color)`: a filled circle of radius `CELL / 2 - 6`.
4. Draw every frame: a `'#0f172a'` background, a `'#1d4ed8'` rectangle for the board from `TOP`, and a disc in the middle
   of every cell, `'#0f172a'` if empty or the color of its player.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan satırları yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve ölçüleri, renkleri ve tahta değişkenini ekle:

   ```js
   const COLS = 7
   const ROWS = 6
   const CELL = 64
   const TOP = 96 // room above the board (for later)
   const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 red, player 2 yellow

   let board // board[row][col]: 0 empty, 1 or 2
   ```

   `COLS` sütun, `ROWS` satır sayısı, `CELL` bir hücrenin piksel boyu, `TOP` tahtanın üstünde bırakılan boşluk.

3. Bir satır boşluk bırak ve tahtayı kuran fonksiyonu yaz:

   ```js
   function reset() {
     board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
   }
   ```

4. Bir satır boşluk bırak ve daire çizen fonksiyonu yaz:

   ```js
   function disc(x, y, color) {
     ctx.fillStyle = color
     ctx.beginPath()
     ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
     ctx.fill()
   }
   ```

5. Bir satır boşluk bırak ve çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#1d4ed8'
     ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
     for (let row = 0; row < ROWS; row++) {
       for (let col = 0; col < COLS; col++) {
         const x = col * CELL + CELL / 2
         const y = TOP + row * CELL + CELL / 2
         disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
       }
     }
   }
   ```

   Önce bütün alanı koyu boyar, sonra mavi tahtayı, sonra her deliği. `+ CELL / 2` deliğin **ortasını** bulur.

6. Bir satır boşluk bırak ve döngüyü yazıp oyunu başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda 42 koyu delikli mavi bir tahta görmelisin ve alttaki
   kontrollerin hepsi yeşil olmalı. "Bir satırı değiştirmek diğerlerini değiştirmemeli" kontrolü kırmızıysa
   `reset()` içinde `Array.from` yerine `fill` kullanmış olabilirsin.

# --tests--

The board should be 6 rows of 7 empty cells, each row its own array.
tr: Tahta her biri kendi dizisi olan 7 boş hücreli 6 satır olmalı.

```js
assert.lengthOf(board, 6)
assert.isTrue(board.every((row) => row.length === 7 && row.every((cell) => cell === 0)))
board[5][0] = 1
assert.strictEqual(board[4][0], 0, 'changing one row must not change the others')
```

The board should be drawn with a hole for every cell.
tr: Tahta her hücre için bir delikle çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#1d4ed8').map((r) => [r.x, r.y, r.w, r.h]), [[0, 96, 448, 384]])
const holes = $.arcs().filter((a) => a.color === '#0f172a' && a.r === 26)
assert.lengthOf(holes, 42)
assert.deepEqual([holes[0].x, holes[0].y], [32, 128])
```

Discs should be drawn in their player's color.
tr: Diskler oyuncularının renginde çizilmeli.

```js
board[5][3] = 1
board[5][4] = 2
$.tick(1)
assert.deepEqual($.arcs().filter((a) => a.color === '#ef4444').map((a) => [a.x, a.y]), [[224, 448]])
assert.deepEqual($.arcs().filter((a) => a.color === '#facc15').map((a) => [a.x, a.y]), [[288, 448]])
```

# --seed--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board (for later)
const COLORS = { 1: '#ef4444', 2: '#facc15' } // player 1 red, player 2 yellow

let board // board[row][col]: 0 empty, 1 or 2

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
