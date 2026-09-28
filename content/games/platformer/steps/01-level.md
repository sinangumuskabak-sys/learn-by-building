---
title: A level made of text
title_tr: Metinden bir bölüm
skills: [game.canvas, prog.arrays]
---

# --explanation--

Platform games are built from **tiles**: a grid of small squares, each either empty or solid. Instead of placing
hundreds of rectangles by hand, write the level as **text**. Each string is one row, each character one tile:

```
'..P...................#...e...'
'################..############'
```

`#` is ground, `B` is brick, `.` is air. Later `P` will mark where the player starts, `o` a coin, `e` an enemy and `F`
the flag. You can *see* the level in the code, edit it in seconds, and design new ones without touching the game
logic. This is **data-driven design**, and it is how real games store their levels (usually in files made by a level
editor, but the idea is the same).

`LEVEL[row][col]` reads one tile: first pick the row (a string), then the character in it. A tile's pixel position is
its column and row times `TILE`.

The level is 64 tiles wide but the canvas only shows 20. For now you simply draw all of it, and the canvas cuts off
what does not fit. A camera comes later.

# --explanation-tr--

**Bu adımda:** bölümü (level) yazıyla tarif edip ekrana çizeceğiz. Sağda mavi bir gökyüzü, altta kahverengi toprak ve
havada turuncu tuğlalar göreceksin.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 640 piksel eninde, 352 piksel boyunda bir resim alanı (`canvas`) var. Oyundaki
her şeyi onun üstüne boyayacağız. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir kutuya
  etiket yapıştırmak gibi, sonra hep o adla çağırırsın.
- `document.getElementById('game')` → "sayfada kimliği (id) `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `canvas.getContext('2d')` → çizim aracını (bağlam, **context**) verir. `ctx` artık senin fırçan.

Çizmek iki hareket: renk seç, şekil boya. `ctx.fillStyle = '#7dd3fc'` rengi seçer (renkler `#` ile başlayan kodlarla
yazılır), `ctx.fillRect(x, y, genişlik, yükseklik)` dikdörtgen boyar. Canvas'ın **sol üst köşesi** `(0, 0)`'dır; `x`
sağa, `y` **aşağı** doğru büyür.

**Döşemeler (tiles).** Platform oyunları küçük karelerden kurulur: bir ızgara (grid) ve her karesi ya boş ya dolu. Her
kare 32×32 pikseldir; bu sayıya `TILE` diyeceğiz. Yüzlerce kareyi tek tek yerleştirmek yerine bölümü **yazı olarak**
yazarız. Her yazı bir satır, her harf bir kare:

```
'..P...................#...e...'
'################..############'
```

`#` toprak, `B` tuğla, `.` hava. İleride `P` oyuncunun başladığı yeri, `o` altını, `e` düşmanı, `F` bayrağı
gösterecek. Bölümü kodun içinde **görebilir**, saniyeler içinde değiştirebilirsin. Gerçek oyunlar da bölümlerini böyle
veri olarak saklar (**veriyle tasarım**).

**Dizi (array).** Satırları köşeli parantez `[ ]` içinde, virgülle ayrılmış bir listeye koyarız. Listenin öğelerine
sıra numarasıyla (**index**) ulaşılır ve sayma **0'dan başlar**: `LEVEL[0]` ilk satır, `LEVEL[8]` dokuzuncu satır.
Bir yazının harflerine de aynı şekilde ulaşılır. `LEVEL[8][2]` → 9. satırın 3. harfi, yani `'P'`. `.length` bir
listenin öğe sayısını ya da bir yazının harf sayısını verir: `LEVEL.length` 11 (satır), `LEVEL[0].length` 64 (sütun).

**Renk tablosu.** `{ '#': '#78350f', B: '#c2410c' }` bir **nesnedir**: süslü parantez içinde `ad: değer` çiftleri.
`COLORS['#']` toprak rengini, `COLORS['B']` tuğla rengini verir.

**Fonksiyon.** `function draw() { ... }` adı `draw` olan bir talimat paketini **tanımlar**; en alttaki `draw()` ise onu
**çağırır**, yani içini o anda çalıştırır.

**İç içe `for` döngüleri.** Her satırı ve her sütunu dolaşmak için sayan bir döngü kullanırız:

```js
for (let row = 0; row < ROWS; row++) {
  // row = 0, 1, 2, ... 10
}
```

`for (başlangıç; koşul; her turdan sonra)`: `let row = 0` ile başla, `row < ROWS` doğru olduğu sürece süslü parantezin
içini yap, her turdan sonra `row++` ile bir artır. `let`, `const` gibi ad verir ama değer değişebilir. Bu döngünün
içine sütunlar için ikinci bir döngü koyarız; böylece her `(satır, sütun)` çifti bir kez ele alınır.

**`if` ile karar.** `if (tile === '#' || tile === 'B') { ... }` → "kare toprak **ya da** tuğlaysa şunu yap". `===`
"eşit mi?" diye sorar, `||` "ya da" demektir. Karenin piksel konumu sütun ve satır numarasının `TILE` ile çarpımıdır
(`*` çarpma): 9. satır, 0. sütun → `(0, 288)`.

Bölüm 64 kare genişliğinde ama canvas yalnızca 20 kare gösteriyor. Şimdilik hepsini çiziyoruz; sığmayanı canvas keser.
Kamerayı sonra ekleyeceğiz.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const TILE = 32`.
2. Add the `LEVEL` array from the solution below (copy it exactly), `const ROWS = LEVEL.length`,
   `const COLS = LEVEL[0].length` and `const COLORS = { '#': '#78350f', B: '#c2410c' }`.
3. Write `draw()`: fill the canvas with the sky color `'#7dd3fc'`, then for every row and column, draw a `TILE` ×
   `TILE` square in `COLORS[tile]` when the tile is `'#'` or `'B'`. Call `draw()`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve kare boyunu ekle:

   ```js
   const TILE = 32
   ```

3. Altına bölümü yaz. Harfleri **tam olarak** kopyala: her satır 64 karakter olmalı. (Uzun gelirse **Çözümü göster**'den
   de kopyalayabilirsin.)

   ```js
   // Bölüm yazı olarak: '#' toprak, 'B' tuğla, 'o' altın, 'e' düşman, 'P' oyuncunun başlangıcı, 'F' bayrak.
   const LEVEL = [
     '................................................................',
     '................................................................',
     '................................................................',
     '................................................................',
     '....................................oooo........................',
     '.........oooo........................e..........................',
     '.........BBBB.................ooo...BBBB....##..................',
     '....ooo...............#....................###.......oooo.......',
     '..P...................#...e...............####.....e.....e...F..',
     '################..############...#############..################',
     '################..############...#############..################',
   ]
   ```

4. Altına satır ve sütun sayısını ve renk tablosunu ekle:

   ```js
   const ROWS = LEVEL.length
   const COLS = LEVEL[0].length
   const COLORS = { '#': '#78350f', B: '#c2410c' }
   ```

5. Bir satır boşluk bırak ve çizim fonksiyonunu yaz. Önce bütün canvas'ı gökyüzü mavisine boyar, sonra her toprak ve
   tuğla karesini kendi renginde çizer:

   ```js
   function draw() {
     ctx.fillStyle = '#7dd3fc'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let row = 0; row < ROWS; row++) {
       for (let col = 0; col < COLS; col++) {
         const tile = LEVEL[row][col]
         if (tile === '#' || tile === 'B') {
           ctx.fillStyle = COLORS[tile]
           ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
         }
       }
     }
   }
   ```

6. En alta, fonksiyonu çağıran satırı ekle:

   ```js
   draw()
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda mavi gökyüzü, altta kahverengi toprak ve havada turuncu tuğlalar
   görünmeli; alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa en sık hata bölüm satırlarından birinin 64
   karakter olmamasıdır; o satırı **Çözümü göster**'deki ile karşılaştır.

# --tests--

The level should be 64 tiles wide and 11 tall.
tr: Bölüm 64 döşeme genişliğinde ve 11 yüksekliğinde olmalı.

```js
assert.strictEqual(TILE, 32)
assert.strictEqual(ROWS, 11)
assert.strictEqual(COLS, 64)
assert.isTrue(LEVEL.every((line) => line.length === COLS))
assert.strictEqual(LEVEL[8][2], 'P')
```

Every ground and brick tile should be drawn at its grid position.
tr: Her zemin ve tuğla döşemesi ızgaradaki konumunda çizilmeli.

```js
const count = (ch) => LEVEL.join('').split(ch).length - 1
assert.lengthOf($.rects('#78350f'), count('#'))
assert.lengthOf($.rects('#c2410c'), count('B'))
assert.deepInclude($.rects('#78350f'), { x: 0, y: 288, w: 32, h: 32, color: '#78350f' })
assert.deepInclude($.rects('#c2410c'), { x: 288, y: 192, w: 32, h: 32, color: '#c2410c' })
assert.isTrue($.rects('#7dd3fc').some((r) => r.w === 640 && r.h === 352))
```

# --seed--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
// The level as text: '#' ground, 'B' brick, 'o' coin, 'e' enemy, 'P' player start, 'F' flag.
const LEVEL = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....................................oooo........................',
  '.........oooo........................e..........................',
  '.........BBBB.................ooo...BBBB....##..................',
  '....ooo...............#....................###.......oooo.......',
  '..P...................#...e...............####.....e.....e...F..',
  '################..############...#############..################',
  '################..############...#############..################',
]
const ROWS = LEVEL.length
const COLS = LEVEL[0].length
const COLORS = { '#': '#78350f', B: '#c2410c' }

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }
}

draw()
```
