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

Oyuncunun yapacağı her şey aynı soruyu tekrar tekrar soracak: **bu nokta katı bir döşemenin içinde mi?** Onu pikselleri
döşemeye çeviren tek bir fonksiyonda cevapla, `solidAt(x, y)`:

```js
const col = Math.floor(x / TILE)
const row = Math.floor(y / TILE)
```

Sonra bölümün **dışında** ne olacağına karar ver, çünkü bir gövde kenarlara ulaşacak:

- 0. sütunun solu ya da son sütunun sağı: katı, görünmez duvarlar gibi; oyuncu bölümden yürüyüp çıkamaz;
- 0. satırın üstü: hava (ekranın tepesinin üstüne zıplayabilirsin);
- son satırın altı: hava; böylece çukurların dibi yoktur ve oyuncu dünyadan düşer.

Bir gövde (oyuncu, sonra düşmanlar) bir kutudur. Katı bir şeye değiyor mu? **Dört köşesine** bak. Kutu bir döşemeden
büyük olmadığı sürece bu yeterlidir; çünkü bir döşeme, biri içine düşmeden iki köşenin arasına sığamaz.

İnce bir ayrıntı: `x = 0`'da duran 24 genişliğindeki bir kutu 0'dan 24'e kadar olan alanı kaplar, **ama 24 dahil
değil**. 24. piksel artık yanındaki şeye aittir. Yani kutunun sağ kenarı `x + w`'den bir kıl payı küçüktür:
`x + w - EPS`, `EPS = 0.01` ile. Bu olmadan, zeminin *tam* üstünde duran (alt kenarı zeminin üstüne değen) bir kutu
zeminin *içinde* sayılırdı. Konumların küsuratı olduğu için (oyuncu 0,5 px'lik adımlarla hareket ediyor) bu kıl payı
çok küçük olmalı: yerine `- 1` kullanmak, bir gövdenin fark edilmeden yarım piksel zemine batmasına izin verirdi. Bu tür
kenar hataları, sayısız oyunda karakterlerin duvarlara yapışmasına ve zeminde titremesine yol açar.

# --task--

1. Write `function solidAt(x, y)`: return `true` left of column 0 or right of the last column, `false` above row 0 or
   below the last row, and otherwise whether the tile is `'#'` or `'B'`.
2. Add `const EPS = 0.01` and write `function overlapsSolid(body)` that checks the four corners of `body`
   (`{ x, y, w, h }`) with `solidAt`, using `x + w - EPS` and `y + h - EPS` for the right and bottom edges.
3. Find the `'P'` in `LEVEL` and create `let player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30 }` there.
   Draw it in `draw()` as a `'#dc2626'` rectangle.

# --task-tr--

1. `function solidAt(x, y)` yaz: 0. sütunun solunda ya da son sütunun sağında `true`, 0. satırın üstünde ya da son
   satırın altında `false`, aksi hâlde döşeme `'#'` ya da `'B'` mi, onu döndür.
2. `const EPS = 0.01` ekle ve `body`'nin (`{ x, y, w, h }`) dört köşesini `solidAt` ile kontrol eden, sağ ve alt
   kenarlar için `x + w - EPS` ve `y + h - EPS` kullanan `function overlapsSolid(body)` yaz.
3. `LEVEL`'daki `'P'`yi bul ve orada `let player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30 }` oluştur.
   `draw()` içinde onu `'#dc2626'` bir dikdörtgen olarak çiz.

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
