---
title: What is solid?
title_tr: Ne katı?
skills: [game.collision, prog.functions]
---

# --explanation--

Everything the player does will ask one question over and over: **is this point inside a solid tile?** Answer it in
one function, `solidAt(x, y)`, that turns pixels into a tile:

```js
const col = Math.floor(x / TILE)
const row = Math.floor(y / TILE)
```

Then decide what happens **outside** the level, because a body will reach the edges:

- left of column 0 or right of the last column: solid, like invisible walls, so the player cannot walk off the level;
- above row 0: air (you can jump above the top of the screen);
- below the last row: air, so pits are bottomless and the player falls out of the world.

A body (the player, later enemies) is a box. Is it touching anything solid? Check its **four corners**. That is enough
as long as the box is no bigger than a tile, since a tile could not fit between two corners without one of them
landing in it.

One subtle detail: a box at `x = 0` that is 24 wide covers the space from 0 **up to, but not including,** 24. Pixel 24
already belongs to whatever is next to it. So the box's right edge is a hair less than `x + w`: `x + w - EPS`, with
`EPS = 0.01`. Without that, a box standing *exactly* on the ground (its bottom touching the ground's top) would count as
being *inside* the ground. And because positions have fractions (the player moves by 0.5 px at a time), the hair must be
tiny: using `- 1` instead would let a body sink half a pixel into the floor unnoticed. Edge bugs like these make
characters stick to walls and jitter on floors in countless games.

# --explanation-tr--

**Bu adımda:** oyunun her yerde kullanacağı soruyu cevaplayan fonksiyonları yazacağız: "bu nokta dolu bir karenin
içinde mi?" Bir de oyuncuyu ekliyoruz: `P` harfinin olduğu yerde, toprağın üstünde duran kırmızı bir dikdörtgen
göreceksin.

**Piksel → kare.** Bir noktanın hangi karede olduğunu bulmak için pikseli `TILE`'a böler ve aşağı yuvarlarız:

```js
const col = Math.floor(x / TILE)   // 100 / 32 = 3.125 → 3. sütun
const row = Math.floor(y / TILE)
```

`/` bölmedir, `Math.floor(...)` sayının virgülden sonrasını atar (**aşağı yuvarlar**).

**Fonksiyon bir cevap döndürebilir: `return`.** `function solidAt(x, y) { ... }` iki **parametre** alır: çağırırken
parantez içine verdiğin iki sayı (`solidAt(100, 300)`) fonksiyonun içinde `x` ve `y` adıyla kullanılır. `return`
fonksiyonu hemen bitirir ve bir sonucu geri verir; burada sonuç `true` (doğru, dolu) ya da `false` (yanlış, boş)
olur. Bu iki değere **mantıksal değer** (boolean) denir.

**Bölümün dışı.** Oyuncu kenarlara ulaşacak, orada ne olacağına karar vermeliyiz:

- 0. sütunun solu ya da son sütunun sağı (`col < 0 || col >= COLS`): **dolu**, görünmez duvar gibi. Oyuncu bölümden
  çıkamaz.
- 0. satırın üstü: **hava** (ekranın üstüne zıplayabilirsin).
- son satırın altı: **hava**; yani çukurların dibi yok, düşen oyuncu dünyadan çıkar.

`<` küçük, `>=` büyük ya da eşit demektir.

**Kutunun dört köşesi.** Oyuncu (ileride düşmanlar da) bir kutudur: `{ x, y, w, h }`. Bir yere değip değmediğini
anlamak için **dört köşesine** bakarız. Kutu bir kareden büyük olmadığı için bu yeter: iki köşenin arasına bir kare
sığamaz. `overlapsSolid(body)` dört `solidAt` sorusunu `||` (ya da) ile birleştirir: köşelerden **biri** bile doluysa
sonuç doğrudur.

**Küçük ama önemli ayrıntı: `EPS`.** `x = 0`'da duran 24 piksel genişliğindeki kutu 0'dan 24'e **kadar** yer kaplar ama
24 hariçtir; 24. piksel yanındakine aittir. Bu yüzden kutunun sağ kenarını `x + w`'den bir tüy kadar içeride alırız:
`x + w - EPS`, `EPS = 0.01`. Bunu yapmazsak zemine **tam** değen bir kutu zeminin **içinde** sayılırdı. Konumlar kesirli
olabildiği için (oyuncu yarım piksel yarım piksel hareket edecek) tüy çok ince olmalı: `- 1` kullansaydık kutu fark
edilmeden yarım piksel zemine gömülebilirdi. Karakterlerin duvara yapışması, zeminde titremesi gibi hatalar hep bu
kenar ayrıntılarından çıkar.

**Oyuncuyu `P`'de başlatmak.** Her satırda `P` harfini ararız:

- `LEVEL.forEach((line, row) => { ... })` → listedeki her satır için içerdekini yap. `line` satırın yazısı, `row` onun
  sıra numarasıdır. `(...) => { ... }` kısa yazılmış, adsız bir fonksiyondur (**ok fonksiyonu**).
- `line.indexOf('P')` → `P`'nin yazıdaki yerini verir; yoksa `-1` verir.
- `col !== -1` → "`-1` değilse", yani bu satırda `P` varsa. `!==` "eşit değil" demektir.

Oyuncu 24×30 boyunda; karenin içinde ortalansın diye `x`'e 4, zemine otursun diye `y`'ye 2 ekleriz. `let player` önce
değersiz yazılır (sadece ad ayrılır), değerini `forEach` içinde alır.

# --task--

1. Write `function solidAt(x, y)`: return `true` left of column 0 or right of the last column, `false` above row 0 or
   below the last row, and otherwise whether the tile is `'#'` or `'B'`.
2. Add `const EPS = 0.01` and write `function overlapsSolid(body)` that checks the four corners of `body`
   (`{ x, y, w, h }`) with `solidAt`, using `x + w - EPS` and `y + h - EPS` for the right and bottom edges.
3. Find the `'P'` in `LEVEL` and create `let player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30 }` there.
   Draw it in `draw()` as a `'#dc2626'` rectangle.

# --task-tr--

1. `const TILE = 32` satırının hemen altına tüy payını ekle:

   ```js
   const EPS = 0.01 // bir tüy: sağ ve alt kenar kutunun hemen içinde sayılır
   ```

2. `const COLORS = ...` satırının altına bir satır boşluk bırakıp oyuncuyu `P`'nin yerinde oluşturan kısmı yaz:

   ```js
   let player
   LEVEL.forEach((line, row) => {
     const col = line.indexOf('P')
     if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30 }
   })
   ```

3. Altına, bir noktanın dolu olup olmadığını söyleyen fonksiyonu yaz:

   ```js
   function solidAt(x, y) {
     const col = Math.floor(x / TILE)
     const row = Math.floor(y / TILE)
     if (col < 0 || col >= COLS) return true // bölümün iki ucunda görünmez duvar
     if (row < 0 || row >= ROWS) return false // üstte açık gökyüzü, altta dipsiz çukur
     const tile = LEVEL[row][col]
     return tile === '#' || tile === 'B'
   }
   ```

   Son satır, `tile` toprak ya da tuğlaysa `true`, değilse `false` döndürür.

4. Altına, bir kutunun dört köşesini kontrol eden fonksiyonu yaz:

   ```js
   // Kutular bir kareden büyük değil, dört köşeye bakmak yeter.
   function overlapsSolid(body) {
     const right = body.x + body.w - EPS
     const bottom = body.y + body.h - EPS
     return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
   }
   ```

5. `draw()` fonksiyonunun sonunda, iki `for` döngüsünün kapanışından sonra ama fonksiyonun son `}`'inden **önce**
   oyuncuyu çizen satırları ekle:

   ```js
         }
       }
     }

     ctx.fillStyle = '#dc2626' // ← yeni
     ctx.fillRect(player.x, player.y, player.w, player.h) // ← yeni
   }
   ```

6. **Çalıştır**'a bas. Solda, `P`'nin olduğu yerde toprağın üstünde kırmızı bir dikdörtgen görünmeli; alttaki
   kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `solidAt`'teki `true`/`false`'ların yerini ve `- EPS`'leri kontrol
   et.

# --tests--

`solidAt()` should read tiles by pixel position.
tr: `solidAt()` döşemeleri piksel konumuna göre okumalı.

```js
assert.isTrue(solidAt(0, 300), 'ground at the bottom left')
assert.isTrue(solidAt(9 * 32 + 5, 6 * 32 + 5), 'a brick')
assert.isFalse(solidAt(100, 100), 'sky')
assert.isFalse(solidAt(16 * 32 + 5, 300), 'a pit')
```

Outside the level: walls at the sides, air above and below.
tr: Bölümün dışı: yanlarda duvar, üstte ve altta hava.

```js
assert.isTrue(solidAt(-1, 100))
assert.isTrue(solidAt(64 * 32, 100))
assert.isFalse(solidAt(100, -50))
assert.isFalse(solidAt(100, 11 * 32 + 10))
```

`overlapsSolid()` should check the corners, without counting a box that only touches.
tr: `overlapsSolid()` köşeleri kontrol etmeli, yalnızca değen bir kutuyu saymamalı.

```js
assert.isFalse(overlapsSolid({ x: 64, y: 258, w: 24, h: 30 }), 'standing exactly on the ground')
assert.isTrue(overlapsSolid({ x: 64, y: 259, w: 24, h: 30 }), 'one pixel into the ground')
assert.isTrue(overlapsSolid({ x: 64, y: 258.5, w: 24, h: 30 }), 'even half a pixel into the ground counts')
assert.isTrue(overlapsSolid({ x: 22 * 32 - 23, y: 240, w: 24, h: 30 }), 'right edge inside the pillar')
assert.isFalse(overlapsSolid({ x: 22 * 32 - 24, y: 240, w: 24, h: 30 }), 'right edge touching the pillar')
```

The player should start at the P, standing on the ground.
tr: Oyuncu P'de, zeminde durarak başlamalı.

```js
assert.deepEqual(player, { x: 68, y: 258, w: 24, h: 30 })
assert.deepEqual($.rects('#dc2626'), [{ x: 68, y: 258, w: 24, h: 30, color: '#dc2626' }])
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
const EPS = 0.01 // a hair: the right and bottom edges are just inside the box
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

let player
LEVEL.forEach((line, row) => {
  const col = line.indexOf('P')
  if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30 }
})

function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}

// Bodies are never bigger than a tile, so checking their four corners is enough.
function overlapsSolid(body) {
  const right = body.x + body.w - EPS
  const bottom = body.y + body.h - EPS
  return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
}

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

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

draw()
```
