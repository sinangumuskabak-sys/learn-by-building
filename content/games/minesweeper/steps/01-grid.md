---
title: A grid of cell objects
title_tr: Hücre nesnelerinden bir ızgara
skills: [prog.arrays]
---

# --explanation--

A grid of plain numbers is not enough here. A Minesweeper cell has to remember several things at once: whether it hides a
mine, how many mines are around it, whether it has been opened, whether it is flagged. So each cell is an **object**,
and the board is a 2D array of objects.

`Array.from` builds it neatly. Its second argument is called with the **index** of each slot, so every cell can store
where it is:

```js
grid = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => ({ row, col })),
)
```

(`_` is a common name for a parameter you do not use; here, the empty slot's value.)

Storing `row` and `col` on the cell itself will pay off soon: functions can be handed a **cell** and still know where
it sits, without passing coordinates around separately.

`grid.flat()` turns the 2D array into one long list of all 81 cells, handy whenever the position does not matter, such
as drawing every cell.

# --explanation-tr--

**Bu adımda:** Mayın Tarlası'nın tahtasını çizeceğiz. Sağda, üstte boş bir şerit ve altında 9 satır, 9 sütunluk
gri karelerden bir ızgara göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) nedir?** Sayfada 360 piksel eninde, 400 piksel boyunda boş bir resim alanı var. Adı `canvas`,
kimliği (id) `game`. Oyundaki her şeyi bu alanın üstüne **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra
fırçayı alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir
  kutuya etiket yapıştırmak gibi, sonra hep o etiketle çağırırsın. Sabitin içeriği bir daha değiştirilmez.
- `document.getElementById('game')` → "sayfada kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx` bizim **fırçamız** (çizim bağlamı, context). `ctx.fillStyle = '#94a3b8'` fırçaya renk sürer,
  `ctx.fillRect(x, y, en, boy)` o renkle bir dikdörtgen boyar. Renkler `'#1e293b'` gibi kodlarla yazılır:
  `'#1e293b'` koyu lacivert, `'#94a3b8'` açık gri.

**Konum:** Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür.

**Sabitler:** `SIZE = 9` (bir kenarda 9 hücre), `CELL = 40` (bir hücre 40 piksel), `TOP = 40` (en üstte mayın
sayacı ve saat için 40 piksellik boş şerit). Sayıları bir kez ad vererek yazarsak, sonra her yerde adıyla kullanırız.

**Değişken (`let`):** `let grid` "adı `grid` olan bir kutu aç, içi şimdilik boş" demektir. `const`'tan farkı, `let`
ile açılan kutunun içine sonradan başka şey koyabilmendir. Her yeni oyunda tahtayı yeniden kuracağımız için `let`.

**Fonksiyon nedir?** Bir işi yapan, adı olan bir talimat paketidir. Tarif kartı gibi: önce kartı yazarsın
(**tanımlamak**), sonra ne zaman istersen "şu tarifi yap" dersin (**çağırmak**).

```js
function newGame() {   // tanımlama: süslü parantezin içi tarifin adımları
  ...
}
newGame()              // çağırma: şimdi yap
```

**Nesne (object):** Birkaç bilgiyi tek pakette tutar. `{ row: 3, col: 7 }` "satırı 3, sütunu 7 olan şey" demektir;
içindeki bilgiye nokta ile ulaşırsın: `cell.row`. Mayın Tarlası'nda her hücre çok şey hatırlayacak (mayın var mı,
açıldı mı, bayrak var mı), o yüzden her hücre bir nesne olacak. `{ row, col }` kısa yazımdır; `{ row: row, col: col }`
ile aynıdır.

**Dizi (array):** Sıralı bir listedir: `[5, 8, 2]`. Sıra numarası (index) **0'dan** başlar: `liste[0]` ilk eleman.
Tahtamız **dizilerden oluşan bir dizi**: 9 satır, her satır da 9 hücreden oluşan bir dizi. `grid[3][7]` "3 numaralı
satırın 7 numaralı hücresi" demektir.

**Izgarayı kuran kod:**

```js
grid = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => ({ row, col })),
)
```

Bunu parça parça okuyalım:

- `Array.from({ length: SIZE }, ...)` → "9 elemanlı bir dizi yap; her elemanı virgülden sonraki küçük fonksiyonla
  üret".
- `(_, row) => ...` → **ok fonksiyonu** (arrow function): kısa yazılmış bir fonksiyondur. Parantezin içi girdiler
  (**parametre**), `=>`'nin sağı ürettiği sonuç. `Array.from` bu fonksiyona her eleman için sırayla 0, 1, 2 ... 8
  sıra numarasını verir, biz ona `row` diyoruz. `_` ise kullanmadığımız ilk girdiye verilen yaygın bir addır.
- İçteki `Array.from` aynı şeyi sütunlar için yapar ve her hücre için `({ row, col })` nesnesini üretir. Nesnenin
  etrafındaki normal parantez, süslü parantezin "fonksiyon gövdesi" sanılmaması için gereklidir.

Böylece her hücre **nerede olduğunu kendisi bilir**; bu ileride çok işimize yarayacak.

**Hepsini çizmek:** `grid.flat()` iç içe diziyi 81 hücrelik tek uzun listeye düzleştirir. `for (const cell of ...)`
**döngüsü** bu listedeki her hücre için süslü parantezin içini bir kez çalıştırır; her turda o anki hücrenin adı
`cell` olur. Hücrenin yeri: sütun × 40 sağa, satır × 40 aşağıya (üstteki 40'lık şeridin altından). Her kenardan 1
piksel boşluk bırakıp `CELL - 2` = 38 piksellik kare boyarız ki kareler arasında ince çizgi kalsın.

**Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenilemede `loop`'u çalıştır" der.
`loop` de önce çizer, sonra aynı isteği tekrarlar; böylece ekran saniyede yaklaşık 60 kez yeniden çizilir.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `SIZE = 9`, `CELL = 40` and `TOP = 40`.
2. Add `let grid` and `function newGame()` that builds a `SIZE` × `SIZE` grid of `{ row, col }` objects with
   `Array.from`. Call it at startup.
3. `draw()`: fill the canvas with `'#1e293b'` and every cell with `'#94a3b8'` at
   `(col * CELL + 1, TOP + row * CELL + 1)`, size `CELL - 2`. Draw in a `requestAnimationFrame` loop.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp üç sabiti ekle:

   ```js
   const SIZE = 9
   const CELL = 40
   const TOP = 40 // room for the mine counter and the timer
   ```

3. Altına tahtayı tutacak değişkeni ve tahtayı kuran fonksiyonu yaz:

   ```js
   let grid

   function newGame() {
     grid = Array.from({ length: SIZE }, (_, row) =>
       Array.from({ length: SIZE }, (_, col) => ({ row, col })),
     )
   }
   ```

4. Altına çizim fonksiyonunu yaz. Önce bütün canvas'ı koyu renge boyar, sonra her hücreyi gri bir kare olarak çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#1e293b'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = '#94a3b8'
     for (const cell of grid.flat()) {
       ctx.fillRect(cell.col * CELL + 1, TOP + cell.row * CELL + 1, CELL - 2, CELL - 2)
     }
   }
   ```

5. Altına oyun döngüsünü ve en sona da açılışta çalışacak iki çağrıyı ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   newGame()
   requestAnimationFrame(loop)
   ```

   `newGame()` tahtayı kurar, `requestAnimationFrame(loop)` çizimi başlatır.

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda, üstte koyu bir şerit ve altında 9×9 gri kare görmelisin;
   alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri say: her `(` ve `{` bir kez kapanmalı.

# --tests--

The grid should be 9×9 cells that know their position.
tr: Izgara, konumlarını bilen 9×9 hücre olmalı.

```js
assert.lengthOf(grid, 9)
assert.isTrue(grid.every((row) => row.length === 9))
assert.deepInclude(grid[3][7], { row: 3, col: 7 })
assert.strictEqual(grid.flat().length, 81)
assert.notStrictEqual(grid[0], grid[1])
```

Every cell should be drawn below the top strip.
tr: Her hücre üst şeridin altına çizilmeli.

```js
$.tick()
const cells = $.rects('#94a3b8')
assert.lengthOf(cells, 81)
assert.deepInclude(cells, { x: 1, y: 41, w: 38, h: 38, color: '#94a3b8' })
assert.deepInclude(cells, { x: 321, y: 361, w: 38, h: 38, color: '#94a3b8' })
```

# --seed--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#94a3b8'
  for (const cell of grid.flat()) {
    ctx.fillRect(cell.col * CELL + 1, TOP + cell.row * CELL + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
