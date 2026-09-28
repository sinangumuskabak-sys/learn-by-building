---
title: The well
title_tr: Kuyu
skills: [prog.arrays, game.canvas]
---

# --explanation--

The playing field is a **well** 10 cells wide and 20 tall. It is a 2D array of numbers (an array of rows): `0` for an empty
cell, anything else for a filled one (later, the number will say which color).

The well is 240 pixels wide (10 cells of 24), and the canvas is 360, which leaves a side panel for the score and the
next piece.

Each cell is drawn 1 pixel smaller on every side than its slot (`col * CELL + 1`, size `CELL - 2`). That leaves a thin
dark line between blocks, so a stack of them reads as separate pieces instead of one big blob. Small visual decisions
like this cost one line and make a game much easier to read.

# --explanation-tr--

**Bu adımda:** düşen blok oyununun (Tetris benzeri) oyun alanını çizeceğiz. Sağda, koyu bir zeminin solunda biraz
daha açık renkli, uzun bir dikdörtgen göreceksin: blokların düşeceği **kuyu**. Sağda kalan boşluk ileride skor ve
sıradaki parça için.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 360 piksel eninde, 480 piksel boyunda boş bir resim alanı var; kimliği (id)
`game`. Oyundaki her şeyi bu alana **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir
  kutuya etiket yapıştırmak gibi, sonra hep o etiketle çağırırsın.
- `document.getElementById('game')` → "sayfada kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx` bizim **fırçamız** (çizim bağlamı, context). `ctx.fillStyle = '#1e293b'` fırçaya renk sürer,
  `ctx.fillRect(x, y, en, boy)` o renkle dikdörtgen boyar. Renkler `'#0f172a'` gibi kodlarla yazılır.

**Konum:** Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür.

**Sabitler:** kuyu 10 sütun (`COLS`), 20 satır (`ROWS`), bir hücre 24 piksel (`CELL`). Kuyu 10 × 24 = 240 piksel
eninde; canvas 360 olduğu için sağda 120 piksellik bir yan panel kalır.

**Dizi (array) ve kuyu.** Dizi sıralı bir listedir: `[0, 0, 1]`. Sıra numarası (index) **0'dan** başlar. Kuyumuz
**dizilerden oluşan bir dizi**: 20 satır, her satır 10 sayılık bir dizi. `0` boş hücre demek, başka bir sayı dolu
hücre (ileride sayı, hangi renk olduğunu da söyleyecek). `board[19][0]` "en alttaki satırın en soldaki hücresi"dir.

**Fonksiyon.** Bir işi yapan, adı olan bir talimat paketidir. Önce tanımlarsın, sonra adıyla çağırırsın:

```js
function emptyRow() {
  return Array(COLS).fill(0)
}
```

- `Array(COLS)` 10 yuvalı bir dizi açar, `.fill(0)` hepsini 0 ile doldurur.
- `return` sonucu **geri verir**: `emptyRow()` yazılan yere `[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]` gelir.

```js
let board = Array.from({ length: ROWS }, emptyRow)
```

`let` ile açılan kutunun içine sonradan başka şey konabilir (`const`'un tersine). `Array.from({ length: ROWS }, emptyRow)`
"20 elemanlı bir dizi yap, her elemanı `emptyRow`'u çağırarak üret" demektir. Böylece her satır **kendi** dizisi olur;
bir satırı değiştirmek ötekileri etkilemez.

**Parametre.** `drawCell(col, row, color)` üç **girdi** alır: çağırırken `drawCell(0, 19, '#94a3b8')` dersen içeride
`col` 0, `row` 19, `color` gri olur. Her hücreyi yuvasından her kenarda 1 piksel küçük çizeriz (`+ 1`, boy `CELL - 2`);
aradaki ince koyu çizgi sayesinde üst üste yığılan bloklar tek bir yığın değil, ayrı parçalar gibi okunur.

**Döngü.** `for (let row = 0; row < ROWS; row++) { ... }` bir sayaçla döner: `row` 0'dan başlar, 20'den küçük olduğu
sürece içi çalışır, her turun sonunda `row++` ile 1 artar. İçindeki ikinci döngü sütunları gezer; böylece 200 hücrenin
hepsine bakılır. `if (board[row][col])` "bu hücre 0 değilse (doluysa)" demektir: 0 "yok", diğer sayılar "var" sayılır.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `COLS = 10`, `ROWS = 20` and `CELL = 24`.
2. Write `emptyRow()` returning an array of `COLS` zeros, and build `let board` with
   `Array.from({ length: ROWS }, emptyRow)` (each row its own array).
3. Write `drawCell(col, row, color)` that fills `(col * CELL + 1, row * CELL + 1)` with size `CELL - 2`, and `draw()`:
   background `'#0f172a'`, well `'#1e293b'` (`COLS * CELL` × `ROWS * CELL` from the top left), and every non-zero cell
   in `'#94a3b8'`. Call `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp üç sabiti ekle:

   ```js
   const COLS = 10
   const ROWS = 20
   const CELL = 24
   ```

3. Altına boş satır üreten fonksiyonu ve kuyuyu yaz:

   ```js
   function emptyRow() {
     return Array(COLS).fill(0)
   }

   let board = Array.from({ length: ROWS }, emptyRow)
   ```

4. Altına tek bir hücre çizen fonksiyonu yaz:

   ```js
   function drawCell(col, row, color) {
     ctx.fillStyle = color
     ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
   }
   ```

5. Altına her şeyi çizen `draw()` fonksiyonunu yaz ve en sona onu çağıran satırı ekle:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#1e293b'
     ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

     for (let row = 0; row < ROWS; row++) {
       for (let col = 0; col < COLS; col++) {
         if (board[row][col]) drawCell(col, row, '#94a3b8')
       }
     }
   }

   draw()
   ```

   Önce bütün canvas'ı en koyu renge, sonra kuyuyu biraz daha açık bir laciverte boyar, en son dolu hücreleri çizer.
   Kuyu şimdilik tamamen boş.

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda solda duran uzun, lacivert bir kuyu görmelisin; alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa büyük/küçük harfleri ve parantezleri kontrol et.

# --tests--

The well should be 20 rows of 10 empty cells, each row its own array.
tr: Kuyu, her satırı kendi dizisi olan 10 boş hücreli 20 satır olmalı.

```js
assert.deepEqual([COLS, ROWS, CELL], [10, 20, 24])
assert.lengthOf(board, 20)
assert.isTrue(board.every((row) => row.length === 10 && row.every((cell) => cell === 0)))
assert.notStrictEqual(board[0], board[1])
```

The well and the filled cells should be drawn with a 1-pixel gap.
tr: Kuyu ve dolu hücreler 1 piksellik boşlukla çizilmeli.

```js
assert.deepEqual($.rects('#1e293b'), [{ x: 0, y: 0, w: 240, h: 480, color: '#1e293b' }])
board[19][0] = 1
board[18][9] = 1
draw()
assert.sameDeepMembers($.rects('#94a3b8'), [
  { x: 1, y: 457, w: 22, h: 22, color: '#94a3b8' },
  { x: 217, y: 433, w: 22, h: 22, color: '#94a3b8' },
])
```

# --seed--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
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

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, '#94a3b8')
    }
  }
}

draw()
```
