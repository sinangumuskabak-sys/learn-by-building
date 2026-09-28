---
title: A grid of cells
title_tr: Hücrelerden bir ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

The Game of Life, invented by the mathematician John Conway in 1970, is a "zero-player game": you set up a pattern of cells,
and simple rules decide everything after that. Out of those rules come creatures that move, blink, grow and even build other
creatures.

The world is a grid. Each cell is either **alive** (`1`) or **dead** (`0`), so the grid is a 2D array of numbers:
`grid[row][col]`. We keep a small helper that makes an all-dead grid, because we will need fresh ones often:

```js
const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))
```

Why `Array.from` with a function, and not `Array(ROWS).fill(Array(COLS).fill(0))`? `fill` would put **the same row array**
in every slot, so changing one cell would change it in every row. `Array.from` calls the function once per row and makes a
new row each time.

To start, a quarter of the cells come alive at random: `Math.random() < 0.25` is true about one time in four.

Each live cell is a square `CELL - 1` pixels wide, so a 1 pixel gap separates neighbours and the grid stays readable.

# --explanation-tr--

**Bu adımda:** küçük karelerden oluşan bir ızgara çizeceğiz ve karelerin yaklaşık dörtte birini rastgele yeşile
boyayacağız. Sağda, koyu bir zeminin üstüne serpilmiş binlerce minik yeşil kare göreceksin.

**Hayat Oyunu nedir?** Matematikçi John Conway'in 1970'te bulduğu "sıfır oyunculu" bir oyun. Dünya bir **ızgaradır**
(kareli defter gibi). Her kare, yani her **hücre**, ya **canlı** (`1`) ya da **ölü**dür (`0`). Başta bir desen kurarsın,
sonrasına basit kurallar karar verir. Bu adımda sadece dünyayı kurup çiziyoruz; kurallar sonraki adımda.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480×480 piksellik boş bir resim alanı var: `<canvas id="game">`. Önce onu
buluruz, sonra onun çizim aracını (bağlam, **context**) alırız:

```js
const canvas = document.getElementById('game') // "game" kimlikli alanı bul
const ctx = canvas.getContext('2d')            // onun fırçasını al
```

- `const ad = ...` → "Bundan sonra şuna `ad` diyeceğim." Buna **sabit** (constant) denir: bir kutuya etiket yapıştırmak
  gibi. Değeri bir daha değişmez.
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- Fırçayla iki şey yaparsın: `ctx.fillStyle = '#4ade80'` ile **renk seçer**, `ctx.fillRect(x, y, genişlik, yükseklik)`
  ile **dikdörtgen boyarsın**. Renkler `'#4ade80'` (yeşil) gibi kodlarla yazılır.
- Konum: sol üst köşe `(0, 0)`'dır. `x` sağa, `y` **aşağı** gittikçe büyür.

**Sayılar ve hesap.** `CELL = 8` bir karenin 8 piksel olduğunu söyler. `*` çarpma, `+` toplama, `-` çıkarmadır:
`COLS * CELL` = 60 × 8 = 480.

**Değişken (`let`).** `let grid` "adı `grid` olan bir kutu aç, içini sonra dolduracağım" demektir. `const`'tan farkı:
`let` ile açılan kutunun içi sonradan `grid = ...` diye **değiştirilebilir**.

**Dizi (array) ve ızgara.** Dizi, sıralı bir listedir: `[0, 1, 0]`. Listedeki yere **index** denir ve sayma
**0'dan başlar**: `liste[0]` ilk eleman. Izgara, **satırlardan oluşan bir listedir**; her satır da hücrelerden oluşan bir
liste. Bu yüzden bir hücreye iki index ile ulaşırız: `grid[r][c]` = "`r` numaralı satırın `c` numaralı hücresi".

**Fonksiyon (function).** Bir işe ad verip paketlemektir; yemek tarifi gibi. Önce tarifi **yazarsın** (tanımlarsın),
sonra adını söyleyip **çalıştırırsın** (çağırırsın):

```js
function reset() {   // tarifi yaz: { } arası tarifin adımları
  grid = emptyGrid()
}
reset()              // tarifi çalıştır
```

Kısa bir yazılışı da vardır: `const emptyGrid = () => ...` → "`emptyGrid` adında, `=>` işaretinin sağındakini yapıp
sonucunu **geri veren** bir fonksiyon".

**Boş ızgara yapmak.** `Array(COLS).fill(0)` 60 tane `0`'dan oluşan bir satır yapar. `Array.from({ length: ROWS }, () => ...)`
ise 48 kere o fonksiyonu çağırıp 48 satırlık bir liste yapar. Neden her satır ayrı ayrı yapılıyor? Tek bir satırı 48 yere
koysaydık, hepsi **aynı satır** olurdu; birini değiştirmek hepsini değiştirirdi.

**Rastgelelik.** `Math.random()` her çağrıldığında 0 ile 1 arasında rastgele bir sayı verir. `Math.random() < 0.25`
yaklaşık dört seferde bir doğrudur. `koşul ? 1 : 0` şöyle okunur: "koşul doğruysa `1`, değilse `0`".
`grid.map(...)` bir listenin **her elemanı için** bir iş yapıp yeni bir liste verir; iç içe iki `map` her satırın her
hücresine yeni değer verir.

**Döngü (`for`).** Aynı işi birçok kez yapmak için:

```js
for (let r = 0; r < ROWS; r++) { ... }
```

"`r` 0'dan başlasın; `r < ROWS` (48'den küçük) olduğu sürece `{ }` içini yap; her turdan sonra `r++` ile 1 artır."
İçine ikinci bir döngü koyunca bütün satırları ve her satırdaki bütün hücreleri tek tek geziriz.
`if (grid[r][c]) ...` → "hücre `1` ise (canlıysa) şunu yap". Kare `CELL - 1` = 7 piksel çizilir, aradaki 1 piksellik boşluk
ızgarayı okunur kılar.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenilemede `loop`'u çalıştır" der.
`loop` her seferinde çizip kendini yeniden sıraya koyduğu için ekran saniyede yaklaşık 60 kez (60 **kare**, frame)
yeniden çizilir.

# --task--

1. Add `CELL = 8`, `COLS = 60`, `ROWS = 48`, `TOP = 36` and `emptyGrid()`.
2. Write `randomize()`: every cell becomes `1` with a chance of `0.25`, otherwise `0`. `reset()` starts from an empty grid
   and randomizes it.
3. Each frame fill the canvas with `'#0f172a'`, the grid area (`COLS * CELL` by `ROWS * CELL` at `y = TOP`) with `'#1e293b'`,
   and every live cell as a `'#4ade80'` square at `x = c * CELL`, `y = TOP + r * CELL`, `CELL - 1` wide.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp dört sabiti ekle (hücre boyu, sütun sayısı, satır sayısı, ızgaranın üstten boşluğu):

   ```js
   const CELL = 8
   const COLS = 60
   const ROWS = 48
   const TOP = 36
   ```

3. Altına ızgarayı tutacak değişkeni ve boş ızgara yapan fonksiyonu yaz:

   ```js
   let grid // grid[row][col]: 1 alive, 0 dead

   const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))
   ```

4. Altına her hücreyi rastgele `1` ya da `0` yapan `randomize()` fonksiyonunu ve baştan kuran `reset()`'i yaz:

   ```js
   function randomize() {
     grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
   }

   function reset() {
     grid = emptyGrid()
     randomize()
   }
   ```

5. Altına çizim fonksiyonu `draw()`'u yaz. Önce bütün canvas'ı, sonra ızgara alanını boyar, en son her canlı hücreyi yeşil
   bir kare olarak çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#1e293b'
     ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

     ctx.fillStyle = '#4ade80'
     for (let r = 0; r < ROWS; r++) {
       for (let c = 0; c < COLS; c++) {
         if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
       }
     }
   }
   ```

6. En alta oyun döngüsünü ve başlatan iki satırı ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda koyu zeminde rastgele serpilmiş yeşil kareler görmelisin ve alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri say: her `(` ve `{` için bir `)` ve `}` olmalı.

# --tests--

The grid should be 48 rows of 60 cells, about a quarter of them alive.
tr: Izgara 60 hücrelik 48 satır olmalı ve yaklaşık dörtte biri canlı olmalı.

```js
assert.lengthOf(grid, 48)
for (const row of grid) assert.lengthOf(row, 60)
const alive = grid.flat().filter((cell) => cell === 1).length
assert.strictEqual(grid.flat().filter((cell) => cell !== 0 && cell !== 1).length, 0, 'every cell is 0 or 1')
assert.isAbove(alive, 2880 * 0.18, 'about a quarter of the cells are alive')
assert.isBelow(alive, 2880 * 0.32)
```

`randomize` should make a new pattern each time.
tr: `randomize` her seferinde yeni bir desen yapmalı.

```js
const before = grid.flat().join('')
randomize()
assert.notStrictEqual(grid.flat().join(''), before, 'randomize makes a new pattern')
```

Each live cell should be drawn as a small green square.
tr: Her canlı hücre küçük yeşil bir kare olarak çizilmeli.

```js
grid = emptyGrid()
grid[2][3] = 1
grid[47][59] = 1
$.tick(1)
assert.deepEqual($.rects('#4ade80'), [
  { x: 24, y: 52, w: 7, h: 7, color: '#4ade80' },
  { x: 472, y: 412, w: 7, h: 7, color: '#4ade80' },
])
```

# --seed--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

let grid // grid[row][col]: 1 alive, 0 dead

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
}

function reset() {
  grid = emptyGrid()
  randomize()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
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
