---
title: A room made of tiles
title_tr: Karolardan bir oda
skills: [prog.arrays, game.canvas]
---

# --explanation--

The dungeon is four rooms in a 2 by 2 grid, and each room is written as text, 15 characters by 11 rows, like the levels in
Sokoban or the maze game:

```
'#.............#'   # wall   . floor   D locked door   k key   h heart   e enemy   E stairs   P start
```

So `ROOMS[ry][rx]` is one room, a list of rows, and `ROOMS[0][0][row][col]` is one tile. Gaps in the outer wall are the ways
from one room to the next; they come in step 3.

The room on screen is kept as **arrays of characters** (`tiles`), not strings, because later things in it will change: a key is
picked up, a door opens. Strings in JavaScript cannot be changed in place, arrays can.

The player's position is in pixels, not tiles, so it can move smoothly. Its body is a 22-pixel square, a little smaller than a
32-pixel tile, which will make it easy to walk through one-tile corridors. The room is drawn below a strip for the hearts and
keys: `ctx.translate(0, TOP)` shifts everything drawn after it, so the room can be drawn as if it started at `y = 0`.

# --explanation-tr--

**Bu adımda:** zindanın ilk odasını çizeceğiz. Sağda gri duvarlarla çevrili bej bir oda ve içinde yeşil bir kare
(sen) göreceksin. Henüz hareket yok; önce haritayı kuruyoruz.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur ve yapar. `//` ile başlayan kısımlar
**yorumdur**: bilgisayar onları atlar, sadece insanlar için not.

**Canvas (tuval) ve fırça.** Sayfada 480×400 piksellik boş bir resim alanı var: `canvas`, kimliği (id) `game`. Oyundaki her
şeyi bu alana **boyayarak** göstereceğiz. Önce kâğıdı buluruz, sonra fırçayı alırız:

```js
const canvas = document.getElementById('game')   // sayfada kimliği 'game' olanı bul
const ctx = canvas.getContext('2d')              // onun 2B çizim aracını (context) al
```

- `const canvas =` → "Bundan sonra buna `canvas` diyeceğim." Buna **sabit** denir: kutuya yapıştırılmış bir etiket gibi.
  `let` ile verilen adlar ise **değişkendir**: değerleri sonradan değişebilir.
- Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır** (metin).
- `ctx.fillStyle = '#57534e'` fırçaya renk sürer; `ctx.fillRect(x, y, en, boy)` dikdörtgen boyar. Canvas'ın sol üst
  köşesi `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür.

**Harita yazıyla çizilir.** Zindan, 2'ye 2 dizilmiş dört odadır. Her oda 15 karakter eninde, 11 satır boyunda bir
yazı listesidir. Her karakter 32×32 piksellik bir **karodur** (kare zemin taşı):

```
#  duvar    .  zemin    D  kilitli kapı    k  anahtar    h  kalp
e  düşman   E  çıkış merdiveni             P  başlangıç
```

**Dizi (array) nedir?** Köşeli parantezle yazılmış sıralı bir listedir: `['a', 'b', 'c']`. İçindeki elemanlara
numarayla (**index**) ulaşırsın ve numaralar **0'dan başlar**: `liste[0]` ilk eleman. `ROOMS` iç içe listelerdir:
`ROOMS[0][0]` sol üst oda, `ROOMS[0][0][2]` o odanın 3. satırı, `ROOMS[0][0][2][3]` o satırın 4. karakteri (`'P'`).

**Neden odayı karakter listesine çeviriyoruz?** Oyunda odadaki şeyler değişecek: anahtarı alacaksın, kapı açılacak.
JavaScript'te bir yazının içindeki tek harfi değiştiremezsin, ama bir dizinin elemanını değiştirebilirsin. Bu yüzden
ekrandaki odayı (`tiles`) her satırı bir karakter dizisi olacak şekilde kurarız.

**Fonksiyon (function)** bir işe verilmiş addır, bir **tarif** gibi. Önce yazılır (tanımlanır), sonra adıyla
**çağrılır**. Parantez içindeki adlar (**parametre**) tarifin malzemeleridir; `return` sonucu geri verir:

```js
function topla(a, b) {
  return a + b
}
topla(2, 3)   // 5
```

**Nesne (object):** `{ x: 101, y: 69 }` etiketli bir bilgi kutusudur. İçindekilere `player.x` diye ulaşılır.

**Bu adımda kullanılan liste araçları:**

- `lines.findIndex(f)` → `f`'in doğru dediği ilk elemanın numarasını verir.
- `line.includes('P')` → "bu satırda `P` var mı?"; `line.indexOf('P')` → "`P` kaçıncı sırada?"
- `[...line]` → yazıyı harflerine ayırıp bir dizi yapar: `[...'#.P']` → `['#', '.', 'P']`.
- `liste.map(f)` → her elemanı `f`'in sonucuyla değiştirip yeni bir liste yapar.
- `liste.forEach((eleman, numara) => { ... })` → her eleman için `{ }` içini yapar.
- `(ch) => ...` fonksiyonun kısa yazılışıdır (ok fonksiyonu). `=>` "şunu yap" gibi okunur.
- `ch === 'P' ? '.' : ch` → "`ch` `P` mi? Öyleyse `'.'`, değilse `ch`'nin kendisi". `===` eşitlik sorar.
- `if (koşul) { ... }` → koşul doğruysa süslü parantez içini yap.

**Oyuncu piksel olarak durur.** Oyuncunun yeri karo değil piksel cinsindendir; böylece yumuşakça kayabilir. Gövdesi
22 piksellik bir kare, yani 32'lik karodan biraz küçük; bu, tek karoluk koridorlardan geçmeyi kolaylaştıracak.
`(T - SIZE) / 2` onu karonun ortasına oturtur. `dir: [0, 1]` baktığı yöndür (şimdilik aşağı); ileride kılıç için gerekecek.

**Üst şerit ve `translate`.** Odanın üstünde kalpler ve anahtarlar için 48 piksellik bir şerit bırakıyoruz.
`ctx.translate(0, TOP)` ondan sonra çizilen her şeyi 48 piksel aşağı kaydırır; böylece odayı `y = 0`'dan başlıyormuş
gibi çizebiliriz. `ctx.save()` ayarları kaydeder, `ctx.restore()` eski hâline döndürür.

**Oyun döngüsü:** `requestAnimationFrame(loop)` tarayıcıya "ekranı yenilemeden önce `loop`'u çağır" der. `loop`
çizer ve kendini yeniden ister; böylece saniyede ~60 kez çizim yapılır.

# --task--

1. Add `T = 32`, `TOP = 48`, `SIZE = 22`, `COLS = 15`, `ROWS = 11` and the `ROOMS` below: four rooms in a 2 by 2 grid
   (`#` wall, `D` locked door, `k` key, `h` heart, `e` enemy, `E` the stairs out, `P` the start; a gap in the wall at the
   edge of a room leads to the room next to it).

   ```js
   const ROOMS = [
     [
       [
         '###############',
         '#.............#',
         '#..P..........#',
         '#....###......#',
         '#....#.....e..#',
         '#....#.........',
         '#.............#',
         '#..........h..#',
         '#.............#',
         '#.............#',
         '#######.#######',
       ],
       [
         '###############',
         '#.............#',
         '#..e......e...#',
         '#....#####....#',
         '#.............#',
         '..............#',
         '#.............#',
         '#...##...##...#',
         '#.......e.....#',
         '#.............#',
         '#######D#######',
       ],
     ],
     [
       [
         '#######.#######',
         '#.............#',
         '#..e..........#',
         '#...#######...#',
         '#.............#',
         '#.....k.......#',
         '#.............#',
         '#...#######...#',
         '#..........e..#',
         '#.............#',
         '###############',
       ],
       [
         '#######.#######',
         '#.............#',
         '#.e.........e.#',
         '#.............#',
         '#....#####....#',
         '#....#.E.#....#',
         '#....#...#....#',
         '#.............#',
         '#......e......#',
         '#.............#',
         '###############',
       ],
     ],
   ]
   ```

2. Write `findIn(lines, ch)` returning the `{ row, col }` of a character in a room. `reset()` puts the player, as
   `{ x, y, dir: [0, 1] }`, centered on the `P` tile of the first room, and makes `tiles` from that room as arrays of characters
   (the `P` becomes floor).
3. Draw every frame: fill `'#0c0a09'`; then, translated down by `TOP` (with `save`/`restore`), every tile as a 32 by 32 square,
   `'#57534e'` for walls and `'#d6c7a1'` for everything else, with a `'#92400e'` square 2 pixels inside it for a door; then the
   player as a `'#16a34a'` 22 by 22 square.

# --task-tr--

Kodu aşağıdaki sırayla, hep bir öncekinin **altına** yaz.

1. En alttaki `// Write your code below.` satırının altına kâğıdı, fırçayı ve ölçüleri yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const T = 32 // one tile
   const TOP = 48 // room for hearts, keys and the timer
   const SIZE = 22 // the player's body
   ```

2. Altına dört odanın haritasını yaz. Uzun ama tamamen kopyalama işi; her satır tam 15 karakter olmalı. Kenarlardaki
   boşluklar (`#` yerine `.`) odadan odaya geçitlerdir:

   ```js
   // Four rooms, in a 2 by 2 grid. # wall, D locked door, k key, h heart, e enemy, E the stairs out, P the start.
   // A gap in the wall at the edge of a room leads to the room next to it.
   const ROOMS = [
     [
       [
         '###############',
         '#.............#',
         '#..P..........#',
         '#....###......#',
         '#....#.....e..#',
         '#....#.........',
         '#.............#',
         '#..........h..#',
         '#.............#',
         '#.............#',
         '#######.#######',
       ],
       [
         '###############',
         '#.............#',
         '#..e......e...#',
         '#....#####....#',
         '#.............#',
         '..............#',
         '#.............#',
         '#...##...##...#',
         '#.......e.....#',
         '#.............#',
         '#######D#######',
       ],
     ],
     [
       [
         '#######.#######',
         '#.............#',
         '#..e..........#',
         '#...#######...#',
         '#.............#',
         '#.....k.......#',
         '#.............#',
         '#...#######...#',
         '#..........e..#',
         '#.............#',
         '###############',
       ],
       [
         '#######.#######',
         '#.............#',
         '#.e.........e.#',
         '#.............#',
         '#....#####....#',
         '#....#.E.#....#',
         '#....#...#....#',
         '#.............#',
         '#......e......#',
         '#.............#',
         '###############',
       ],
     ],
   ]
   const COLS = 15
   const ROWS = 11
   ```

3. Altına ekrandaki oda ve oyuncu için iki değişken ekle:

   ```js
   let tiles // the current room
   let player
   ```

4. Altına oyunu başlatan `reset` ve bir karakterin yerini bulan `findIn` fonksiyonlarını yaz:

   ```js
   function reset() {
     const start = findIn(ROOMS[0][0], 'P')
     player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
     tiles = ROOMS[0][0].map((line) => [...line].map((ch) => (ch === 'P' ? '.' : ch)))
   }

   function findIn(lines, ch) {
     const row = lines.findIndex((line) => line.includes(ch))
     return { row, col: lines[row].indexOf(ch) }
   }
   ```

   `reset`, ilk odada `P`'yi bulur, oyuncuyu o karonun ortasına koyar ve odayı karakter dizilerine çevirir (`P` zemin olur).
   `{ row, col: ... }` içindeki `row`, `row: row`'un kısaltmasıdır.

5. Altına odayı çizen `draw` fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#0c0a09'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.save()
     ctx.translate(0, TOP)
     tiles.forEach((line, row) => {
       line.forEach((ch, col) => {
         const x = col * T
         const y = row * T
         ctx.fillStyle = ch === '#' ? '#57534e' : '#d6c7a1'
         ctx.fillRect(x, y, T, T)
         if (ch === 'D') {
           ctx.fillStyle = '#92400e'
           ctx.fillRect(x + 2, y + 2, T - 4, T - 4)
         }
       })
     })

     ctx.fillStyle = '#16a34a'
     ctx.fillRect(player.x, player.y, SIZE, SIZE)
     ctx.restore()
   }
   ```

   Önce bütün alanı koyuya boyar. Sonra her satırı, o satırın her karakterini dolaşır: duvarlar gri, geri kalan her
   şey bej bir kare olur; kapının içine 2 piksel içeriden kahverengi bir kare çizilir. En son oyuncu yeşil kare olarak çizilir.

6. En alta oyun döngüsünü ve başlatma satırlarını yaz:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda, üstte koyu bir şerit ve altında gri duvarlı bir oda, sol üst
   köşesine yakın yeşil bir kare görmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Duvar sayısı kontrolü kırmızıysa
   ilk odanın satırlarını harf harf karşılaştır; bir `#` eksik ya da fazla olabilir.

# --tests--

The room should be loaded as arrays of characters, and the player placed on the start.
tr: Oda karakter dizileri olarak yüklenmeli ve oyuncu başlangıca konmalı.

```js
assert.lengthOf(tiles, 11)
assert.isArray(tiles[0])
assert.lengthOf(tiles[0], 15)
assert.strictEqual(tiles[2][3], '.', 'the P became floor')
assert.deepEqual(findIn(ROOMS[1][1], 'E'), { row: 5, col: 7 })
assert.deepEqual(player, { x: 101, y: 69, dir: [0, 1] })
```

The room should be drawn tile by tile below the top strip.
tr: Oda üst şeridin altına karo karo çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#57534e'), 51)
assert.lengthOf($.rects().filter((r) => r.w === 32), 165)
assert.deepEqual($.rects('#16a34a').map((r) => [r.x, r.y, r.w]), [[101, 69, 22]])
assert.isTrue($.screen().some((c) => c.op === 'translate' && c.args[1] === 48))
```

# --seed--

```js
// Dungeon adventure, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Dungeon adventure, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const T = 32 // one tile
const TOP = 48 // room for hearts, keys and the timer
const SIZE = 22 // the player's body
// Four rooms, in a 2 by 2 grid. # wall, D locked door, k key, h heart, e enemy, E the stairs out, P the start.
// A gap in the wall at the edge of a room leads to the room next to it.
const ROOMS = [
  [
    [
      '###############',
      '#.............#',
      '#..P..........#',
      '#....###......#',
      '#....#.....e..#',
      '#....#.........',
      '#.............#',
      '#..........h..#',
      '#.............#',
      '#.............#',
      '#######.#######',
    ],
    [
      '###############',
      '#.............#',
      '#..e......e...#',
      '#....#####....#',
      '#.............#',
      '..............#',
      '#.............#',
      '#...##...##...#',
      '#.......e.....#',
      '#.............#',
      '#######D#######',
    ],
  ],
  [
    [
      '#######.#######',
      '#.............#',
      '#..e..........#',
      '#...#######...#',
      '#.............#',
      '#.....k.......#',
      '#.............#',
      '#...#######...#',
      '#..........e..#',
      '#.............#',
      '###############',
    ],
    [
      '#######.#######',
      '#.............#',
      '#.e.........e.#',
      '#.............#',
      '#....#####....#',
      '#....#.E.#....#',
      '#....#...#....#',
      '#.............#',
      '#......e......#',
      '#.............#',
      '###############',
    ],
  ],
]
const COLS = 15
const ROWS = 11

let tiles // the current room
let player

function reset() {
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  tiles = ROOMS[0][0].map((line) => [...line].map((ch) => (ch === 'P' ? '.' : ch)))
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(0, TOP)
  tiles.forEach((line, row) => {
    line.forEach((ch, col) => {
      const x = col * T
      const y = row * T
      ctx.fillStyle = ch === '#' ? '#57534e' : '#d6c7a1'
      ctx.fillRect(x, y, T, T)
      if (ch === 'D') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 2, y + 2, T - 4, T - 4)
      }
    })
  })

  ctx.fillStyle = '#16a34a'
  ctx.fillRect(player.x, player.y, SIZE, SIZE)
  ctx.restore()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
