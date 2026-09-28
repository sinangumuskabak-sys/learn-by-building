---
title: Two seas, two fleets
title_tr: İki deniz, iki filo
skills: [prog.arrays, prog.loops]
---

# --explanation--

Battleship is played on two 10 by 10 seas: the enemy's, where you shoot, with its ships hidden, and yours, small at the bottom,
where you can see your own fleet. Each fleet has ships of length 5, 4, 3, 3 and 2.

A ship is a list of the squares it covers. `shipCells(r, c, length, down)` builds that list for a ship starting at `(r, c)`, going
right or down.

**Placing a fleet at random** is a classic small algorithm: for each ship, pick a random direction and a random start where it
fits on the sea, and check it does not overlap a ship already placed. If it does, just try again. A grid of `taken` squares makes
the check quick. `for (;;)` is a loop with no condition, left with `return` as soon as a spot works. With a 10 by 10 sea and only
17 squares of ships, a free spot is always found within a few tries.

# --explanation-tr--

**Bu adımda:** Amiral Battı'nın iki denizini çizeceğiz. Üstte büyük, lacivert, 10×10 kareli düşman denizi (gemileri
gizli), altta küçük bir deniz: senin donanman, gemilerin gri karelerle görünür. Her çalıştırmada gemiler rastgele yere
dizilir.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur. `//` ile başlayan kısımlar **yorumdur**: bilgisayar atlar.

**Canvas ve fırça.** Sayfada 420×620 piksellik boş bir resim alanı (`canvas`) var; her şeyi onun üstüne boyarız.

```js
const canvas = document.getElementById('game')   // kimliği 'game' olan alanı bul
const ctx = canvas.getContext('2d')              // onun fırçasını al
```

`const ad = ...` bir şeye **sabit** bir ad (etiket) verir. Nokta (`.`) "bunun içindeki" demektir, tırnak içi **yazıdır**.
Fırçayla renk seçilir (`ctx.fillStyle = '#1e3a8a'`) ve dikdörtgen boyanır (`ctx.fillRect(x, y, en, boy)`). Sol üst
köşe `(0, 0)`; `x` sağa, `y` **aşağı** doğru büyür. `ctx.fillText('yazı', x, y)` de yazı boyar.

**Nesne ve dizi.** `{ x: 30, y: 50 }` bir **nesnedir**: bilgileri adlarıyla tutan bir paket (`SEA.x` → 30). `[5, 4, 3]`
bir **dizidir** (liste); elemanlar sıra numarasıyla okunur ve sayma **0'dan başlar**: `SHIPS[0]` → 5.

**Deniz = liste içinde liste.** 10×10'luk deniz 10 satırlık bir listedir; her satır da 10 karelik bir liste.
`deniz[2][5]` → 2. satırın 5. karesi (ikisi de 0'dan sayılır). Kare konumlarını hep **(satır, sütun)** yani `(r, c)`
diye yazacağız. Bu tabloyu üreten küçük fonksiyon:

```js
const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
```

- `(value) => ...` bir **fonksiyondur** (ok `=>` "şunu ver" diye okunur). `grid(false)` yazınca çalışır, `value`
  yerine `false` geçer. Tek satırlık ok fonksiyonu sonucunu kendiliğinden geri verir.
- `Array(N).fill(value)` → N elemanlı, hepsi `value` olan bir satır.
- `Array.from({ length: N }, () => ...)` → N kez verilen fonksiyonu çalıştırıp sonuçlardan liste yapar: 10 ayrı satır.

**Bir gemi = kapladığı karelerin listesi.** Örneğin `[[2, 3], [2, 4], [2, 5]]` 2. satırda yan yana üç kare.

```js
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))
```

- `(r, c, length, down)` fonksiyonun **parametreleri**: çağırırken verdiğin değerlerin içerideki adları.
- `{ length }`, `{ length: length }`in kısaltmasıdır.
- `(_, i)` → `Array.from` fonksiyona sıra numarasını da verir: `i` 0, 1, 2... Kullanmadığımız ilk değere `_` deriz.
- `koşul ? A : B` → "doğruysa A, değilse B". Gemi aşağı (`down`) gidiyorsa satır artar, yoksa sütun.

**Donanmayı rastgele dizmek** klasik küçük bir algoritmadır. Her gemi için: rastgele yön ve denize sığan rastgele bir
başlangıç seç; önceki bir gemiyle çakışıyorsa **yeniden dene**. Dolu kareleri `taken` (alındı) tablosunda işaretleriz.

- `Math.random()` 0 ile 1 arasında rastgele sayı verir. `Math.random() < 0.5` yarı yarıya `true` (aşağı) olur.
- `Math.floor(Math.random() * 6)` → 0 ile 5 arasında rastgele bir tam sayı (`floor` aşağı yuvarlar). Aşağı giden 5'lik
  gemi 10 satıra sığsın diye başlangıç satırı `N - length + 1` = 6 seçenekten seçilir.
- `SHIPS.map((length) => { ... })` → her gemi uzunluğu için içerideki kodu çalıştırıp sonuçlarından (gemilerden) liste
  yapar.
- `for (;;) { ... }` koşulsuz, **sonsuz** bir döngüdür; `return` ile çıkılır. `continue` "bu turu bırak, baştan dene"
  demektir. 100 karelik denizde gemiler yalnızca 17 kare tuttuğu için birkaç denemede boş yer bulunur.
- `cells.some(([cr, cc]) => taken[cr][cc])` → "karelerden **en az biri** dolu mu?". `[cr, cc]` yazmak, gelen iki
  elemanlı listeyi açıp adlarını vermektir: ilki satır, ikincisi sütun.

**Çizmek.** `drawSea` iç içe iki `for` döngüsüyle her kareyi boyar. `for (let r = 0; r < N; r++)` "r 0'dan başlasın,
N'den küçükken devam et, her turda 1 artsın (`++`)" demektir. Kareleri `size - 2` boyunda ve 1 piksel içeriden
çizeriz; aralarında ince çizgiler kalır. `showShips` doğruysa **ve** (`&&`) kare bir gemiye aitse gri boyanır.
`===` iki değerin eşit olup olmadığını sorar.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "sonraki ekran yenilemesinde `loop`'u çalıştır" der; `loop`
kendini yeniden çağırdığı için ekran saniyede 60 kez yeniden boyanır. En sonda `reset()` donanmaları bir kez dizer.

# --task--

1. Add `N = 10`, `SHIPS = [5, 4, 3, 3, 2]`, `BIG = 36`, `SMALL = 20`, `SEA = { x: 30, y: 50 }` and `HOME = { x: 30, y: 440 }`.
2. Write `grid(value)` (an `N` by `N` array filled with `value`) and `shipCells(r, c, length, down)`.
3. Write `placeFleet()`: for each length in `SHIPS`, retry random placements until one fits without overlapping, and return the
   ships as `{ cells }`. `reset()` places `enemyFleet` and `myFleet`.
4. Write `drawSea(origin, size, fleet, showShips)`: every square `'#1e3a8a'` (1 pixel in from its sides), or `'#64748b'` for a ship
   square when `showShips`. Draw the enemy sea with `BIG` squares and ships hidden, and yours with `SMALL` squares and ships shown,
   with the titles in the solution.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** kâğıdı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir boş satır bırakıp ayarları ekle:

   ```js
   const N = 10
   const SHIPS = [5, 4, 3, 3, 2]
   const BIG = 36 // cell size of the enemy's sea, where you shoot
   const SMALL = 20 // cell size of your own sea
   const SEA = { x: 30, y: 50 }
   const HOME = { x: 30, y: 440 }
   ```

3. Bir boş satır bırakıp iki donanmanın değişkenlerini ekle (değerleri `reset()`'te verilecek; `let` sonradan
   değişebilen ad demektir):

   ```js
   let enemyFleet // ships: { cells: [[r, c], ...] }
   let myFleet
   ```

4. Bir boş satır bırakıp iki yardımcı fonksiyonu yaz:

   ```js
   const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
   const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))
   ```

5. Altına donanmayı rastgele dizen fonksiyonu ve `reset`'i yaz:

   ```js
   // A random fleet: each ship tries random spots until it fits on the sea without overlapping another.
   function placeFleet() {
     const taken = grid(false)
     return SHIPS.map((length) => {
       for (;;) {
         const down = Math.random() < 0.5
         const r = Math.floor(Math.random() * (down ? N - length + 1 : N))
         const c = Math.floor(Math.random() * (down ? N : N - length + 1))
         const cells = shipCells(r, c, length, down)
         if (cells.some(([cr, cc]) => taken[cr][cc])) continue
         for (const [cr, cc] of cells) taken[cr][cc] = true
         return { cells }
       }
     })
   }

   function reset() {
     enemyFleet = placeFleet()
     myFleet = placeFleet()
   }
   ```

   `for (const [cr, cc] of cells)` geminin her karesini sırayla dolaşır ve `taken`'da doldu diye işaretler.

6. Altına bir denizi çizen fonksiyonu yaz:

   ```js
   function drawSea(origin, size, fleet, showShips) {
     for (let r = 0; r < N; r++) {
       for (let c = 0; c < N; c++) {
         const x = origin.x + c * size
         const y = origin.y + r * size
         ctx.fillStyle = '#1e3a8a'
         if (showShips && fleet.some((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))) ctx.fillStyle = '#64748b'
         ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
       }
     }
   }
   ```

7. Altına bütün ekranı çizen `draw`'u yaz: koyu arka plan, başlık ve düşman denizi (gemiler gizli), sonra senin
   başlığın ve küçük denizin (gemiler görünür):

   ```js
   function draw() {
     ctx.fillStyle = '#0f172a'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('The enemy fleet is hidden here', SEA.x, 34)
     drawSea(SEA, BIG, enemyFleet, false)

     ctx.fillStyle = 'white'
     ctx.font = 'bold 14px sans-serif'
     ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
     drawSea(HOME, SMALL, myFleet, true)
   }
   ```

   `ctx.font` yazının kalınlığını, boyunu ve yazı tipini seçer; `ctx.textAlign = 'left'` yazıyı verilen noktadan
   sağa doğru yazar.

8. En alta döngüyü ekle, donanmaları diz ve başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

9. **Çalıştır**'a bas. Üstte büyük lacivert bir deniz, altta gri gemileri görünen küçük bir deniz görmelisin. Her
   çalıştırmada gemilerin yeri değişir. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantezleri say:
   her `(` ve `{` için bir `)` ve `}` olmalı.

# --tests--

Every fleet should have straight ships of the right lengths, on the sea, never overlapping.
tr: Her filonun doğru uzunlukta, denizde, asla örtüşmeyen düz gemileri olmalı.

```js
for (let i = 0; i < 50; i++) {
  const fleet = placeFleet()
  assert.deepEqual(fleet.map((s) => s.cells.length), [5, 4, 3, 3, 2])
  const seen = new Set()
  for (const ship of fleet) {
    const rows = new Set(ship.cells.map(([r]) => r))
    const cols = new Set(ship.cells.map(([, c]) => c))
    assert.isTrue(rows.size === 1 || cols.size === 1, 'a ship is a straight line')
    for (const [r, c] of ship.cells) {
      assert.isTrue(r >= 0 && r < N && c >= 0 && c < N, 'on the sea')
      assert.isFalse(seen.has(r * N + c), 'ships do not overlap')
      seen.add(r * N + c)
    }
  }
}
```

`shipCells` and `grid` should build the right lists.
tr: `shipCells` ve `grid` doğru listeleri kurmalı.

```js
assert.deepEqual(shipCells(2, 3, 3, false), [[2, 3], [2, 4], [2, 5]])
assert.deepEqual(shipCells(2, 3, 2, true), [[2, 3], [3, 3]])
assert.lengthOf(grid(0), N)
assert.deepEqual(grid(7)[4], Array(N).fill(7))
```

Your ships should be shown on your small sea, and the enemy's hidden.
tr: Gemilerin küçük denizinde gösterilmeli, düşmanınkiler gizlenmeli.

```js
$.tick(1)
const gray = $.rects('#64748b')
assert.lengthOf(gray, 17, 'your 17 ship squares, on the small sea')
for (const g of gray) assert.strictEqual(g.w, SMALL - 2)
assert.lengthOf($.rects('#1e3a8a').filter((r) => r.w === BIG - 2), 100, 'the enemy sea shows nothing')
```

# --seed--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const SHIPS = [5, 4, 3, 3, 2]
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }

let enemyFleet // ships: { cells: [[r, c], ...] }
let myFleet

const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))

// A random fleet: each ship tries random spots until it fits on the sea without overlapping another.
function placeFleet() {
  const taken = grid(false)
  return SHIPS.map((length) => {
    for (;;) {
      const down = Math.random() < 0.5
      const r = Math.floor(Math.random() * (down ? N - length + 1 : N))
      const c = Math.floor(Math.random() * (down ? N : N - length + 1))
      const cells = shipCells(r, c, length, down)
      if (cells.some(([cr, cc]) => taken[cr][cc])) continue
      for (const [cr, cc] of cells) taken[cr][cc] = true
      return { cells }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
}

function drawSea(origin, size, fleet, showShips) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && fleet.some((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))) ctx.fillStyle = '#64748b'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('The enemy fleet is hidden here', SEA.x, 34)
  drawSea(SEA, BIG, enemyFleet, false)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, myFleet, true)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
