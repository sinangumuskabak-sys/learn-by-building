---
title: A road from corners
title_tr: Köşelerden bir yol
skills: [prog.arrays]
---

# --explanation--

Enemies will walk along a winding road. You could list every road tile by hand, but it is shorter and harder to get
wrong to list only the **corners** and let the code fill in the straight lines between them:

```js
const PATH = [[-1, 1], [3, 1], [3, 6], [7, 6], ...]   // tile coordinates of the corners
```

Between two corners, one coordinate stays the same and the other walks towards the target one step at a time.
`Math.sign(tx - x)` is `1`, `-1` or `0`, exactly the step to take, so the same loop works for all four directions:

```js
x += Math.sign(tx - x)
y += Math.sign(ty - y)
```

The road starts at column `-1` and ends at column `12`, just off the screen, so enemies walk in from the left edge and out
on the right. The road tiles go into a `Set` of keys like `'3,4'`, so later "is this tile road?" is a single `has`.

# --explanation-tr--

**Bu adımda:** kule savunması oyununun haritasını çizeceğiz. Sağda yeşil çimenden bir alan ve içinde soldan sağa
kıvrılarak giden gri bir yol göreceksin. Düşmanlar ileride bu yolda yürüyecek.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480 piksel eninde, 440 piksel boyunda boş bir resim alanı var; kimliği (id)
`game`. Oyundaki her şeyi bu alana **boyayarak** göstereceğiz:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

- `const canvas =` → "Bundan sonra şuna `canvas` diyeceğim." `const` ile ad verilen şeye **sabit** denir: bir kutuya
  etiket yapıştırmak gibi, sonra hep o etiketle çağırırsın.
- `document.getElementById('game')` → "sayfada kimliği `game` olanı bul". Nokta (`.`) "bunun içindeki şu komut"
  demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx` bizim **fırçamız** (çizim bağlamı, context). `ctx.fillStyle = '#3f6212'` fırçaya renk sürer,
  `ctx.fillRect(x, y, en, boy)` o renkle dikdörtgen boyar. `'#3f6212'` koyu yeşil, `'#a8a29e'` gri.

**Konum:** Canvas'ın **sol üst köşesi** `(0, 0)`'dır. `x` sağa gittikçe, `y` **aşağı** indikçe büyür.

**Döşemeler (tile).** Harita 40 piksellik karelerden oluşur: 12 sütun, 9 satır. Üstte 40 piksellik bir şerit
ileride durum yazısı için boş kalır (`TOP`). Satır `r`'nin karesi `TOP + r * TILE` yüksekliğinden başlar (`*` çarpma).

**Yolu köşeleriyle yazmak.** Yolun her karesini tek tek yazmak uzun ve hataya açık olurdu. Yalnızca **köşeleri**
yazar, aradaki düz çizgileri koda doldurturuz:

```js
const PATH = [[-1, 1], [3, 1], [3, 6], ...]
```

Bu bir **dizi** (array), yani sıralı bir liste; her elemanı da `[sütun, satır]` diye iki sayılık bir liste. Sıra
numarası 0'dan başlar: `PATH[0]` ilk köşe. Yol `-1`. sütundan başlayıp `12`. sütunda biter; ikisi de ekranın hemen
dışında, böylece düşmanlar soldan girip sağdan çıkar.

**Anahtar ve küme (Set).** Yol karelerini `'3,4'` gibi yazılarla bir **kümeye** koyarız. Küme "şu içinde var mı?"
sorusunu tek adımda cevaplar: `road.has('3,4')`. Yazıyı üreten küçük fonksiyon:

```js
const key = (col, row) => col + ',' + row
```

Bu bir **ok fonksiyonu** (arrow function), yani kısa yazılmış bir fonksiyon: soldaki parantez **girdiler**
(parametre), `=>`'nin sağı sonuç. `+` yazıları yan yana birleştirir: `key(3, 4)` → `'3,4'`.

**`findRoad()`, parça parça.** Bir **fonksiyon**, adı olan bir talimat paketidir; `function ad() { ... }` ile
tanımlanır, `ad()` ile çağrılınca içi çalışır.

- `road = new Set()` → boş bir küme aç. `let road` ile açılan kutunun içine sonradan bir şey koyabiliriz (`const`'un
  tersine).
- `for (let i = 1; i < PATH.length; i++)` → sayarak dönen döngü: `i` 1'den başlar, köşe sayısından küçük olduğu sürece
  içi çalışır, her turun sonunda `i++` ile 1 artar. Her turda bir önceki köşeden (`PATH[i - 1]`) şimdiki köşeye
  (`PATH[i]`) yürürüz.
- `let [x, y] = PATH[i - 1]` → iki sayılık listeyi açıp ilkine `x`, ikincisine `y` adını verir.
- `while (true) { ... }` → "sonsuza kadar tekrar et"; içindeki `break` döngüden çıkar. Her turda kareyi kümeye
  ekleriz (`road.add`); hedefe vardıysak (`x === tx && y === ty`: `===` "eşit mi", `&&` "ve") dururuz.
- `x += Math.sign(tx - x)` → `Math.sign` bir sayının **işaretini** verir: pozitifse `1`, negatifse `-1`, sıfırsa `0`.
  Tam atmamız gereken adım budur; aynı döngü dört yön için de çalışır. `+=` "üstüne ekle" demektir.

**Çizim.** İki iç içe döngü her kareyi gezer. `road.has(key(col, row)) ? '#a8a29e' : '#3f6212'` → **kısa if**: "yolsa
gri, değilse yeşil".

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "ekranı bir sonraki yenilemede `loop`'u çalıştır" der;
`loop` de çizip aynı isteği tekrarlar. Böylece ekran saniyede yaklaşık 60 kez yeniden çizilir.

# --task--

1. Add `TILE = 40`, `COLS = 12`, `ROWS = 9`, `TOP = 40` and the `PATH` from the solution.
2. Write `key(col, row)` and `findRoad()`: for each pair of neighbouring corners, walk from the first to the second with
   `Math.sign` steps, adding every tile (both corners included) to the `road` set. `reset()` calls it.
3. Draw every frame: a `'#0f172a'` background, then each map tile as a full tile, `'#a8a29e'` if it is road and
   `'#3f6212'` if not. Row `r` starts at `TOP + r * TILE`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı alan iki satırı yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp sabitleri ve yolun köşelerini ekle:

   ```js
   const TILE = 40
   const COLS = 12
   const ROWS = 9
   const TOP = 40 // room for a status line (it comes later)
   // The road, as corners in tiles. It starts off the left edge and ends off the right edge.
   const PATH = [
     [-1, 1],
     [3, 1],
     [3, 6],
     [7, 6],
     [7, 2],
     [10, 2],
     [10, 7],
     [12, 7],
   ]
   ```

3. Altına yol kümesini, anahtar fonksiyonunu ve yolu dolduran fonksiyonu yaz:

   ```js
   let road // keys of the tiles the road covers

   const key = (col, row) => col + ',' + row

   // Every tile between two corners, corner included.
   function findRoad() {
     road = new Set()
     for (let i = 1; i < PATH.length; i++) {
       let [x, y] = PATH[i - 1]
       const [tx, ty] = PATH[i]
       while (true) {
         road.add(key(x, y))
         if (x === tx && y === ty) break
         x += Math.sign(tx - x)
         y += Math.sign(ty - y)
       }
     }
   }
   ```

4. Altına oyunu hazırlayan fonksiyonu ve çizim fonksiyonunu yaz:

   ```js
   function reset() {
     findRoad()
   }

   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let row = 0; row < ROWS; row++) {
       for (let col = 0; col < COLS; col++) {
         ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
         ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
       }
     }
   }
   ```

5. En sona oyun döngüsünü ve başlatan iki satırı ekle:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda üstte koyu bir şerit, altında yeşil bir alan ve içinde kıvrılan
   gri bir yol görmelisin; alttaki kontrollerin hepsi yeşil olmalı. Sayfa donarsa `while` döngüsündeki `break`
   satırını ve köşe sayılarını kontrol et.

# --tests--

The road should fill in the straight lines between the corners.
tr: Yol köşeler arasındaki düz çizgileri doldurmalı.

```js
assert.strictEqual(key(3, 4), '3,4')
for (const k of ['-1,1', '0,1', '3,1', '3,4', '5,6', '7,3', '9,2', '10,5', '11,7', '12,7']) {
  assert.isTrue(road.has(k), k + ' should be road')
}
assert.isFalse(road.has('4,4'))
assert.isFalse(road.has('0,0'))
assert.strictEqual(road.size, 28, '26 tiles on the map plus one off each edge')
```

The map should be drawn with road and grass tiles.
tr: Harita yol ve çimen döşemeleriyle çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#a8a29e'), 26)
assert.lengthOf($.rects('#3f6212'), 82)
const first = $.rects('#a8a29e')[0]
assert.deepEqual([first.x, first.y, first.w, first.h], [0, 80, 40, 40])
```

# --seed--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for a status line (it comes later)
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]

let road // keys of the tiles the road covers

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
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
