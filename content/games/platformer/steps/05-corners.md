---
title: Is a box touching anything?
title_tr: Kutu bir şeye değiyor mu?
skills: [game.collision]
---

# --goal--

The player (and later the enemies) is a box `{ x, y, w, h }`. Is it inside anything solid? Checking its **four corners**
is enough, as long as the box is no bigger than a tile. The right and bottom edges are taken a hair inside the box.

# --goal-tr--

Oyuncu (ve ileride düşmanlar) bir **kutu**: `{ x, y, w, h }` → sol üst köşesi, eni ve boyu. Kutu katı bir şeyin içine
girdi mi? Kutu bir döşemeden büyük olmadığı sürece **dört köşesine** bakmak yeter: iki köşe arasına bir döşeme sığamaz.

İnce bir ayrıntı var: x = 0'da duran 24 piksel genişliğindeki bir kutu 0'dan 24'e kadar **ama 24 hariç** yer kaplar;
24. piksel artık yanındakine aittir. Bu yüzden sağ ve alt kenarı **kıl payı** içeride sayacağız: `EPS = 0.01`. Böyle
olmazsa zeminin **tam üstünde** duran kutu, zeminin **içinde** sanılır.

# --code--

```js
const EPS = 0.01 // a hair: the right and bottom edges are just inside the box

// Bodies are never bigger than a tile, so checking their four corners is enough.
function overlapsSolid(body) {
  const right = body.x + body.w - EPS
  const bottom = body.y + body.h - EPS
  return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
}
```

# --meaning--

- `right` and `bottom` are the last points inside the box, a hair (0.01) before `x + w` and `y + h`.
- The four `solidAt` calls check the top-left, top-right, bottom-left and bottom-right corners; `||` is true if any is.
- The hair is tiny because positions have fractions: with `- 1`, a body could sink half a pixel into the floor unnoticed.

# --meaning-tr--

- `const right = body.x + body.w - EPS` → kutunun **en sağdaki** noktası: sağ kenardan kıl payı içeride.
- `const bottom = body.y + body.h - EPS` → **en alttaki** noktası.
- `solidAt(body.x, body.y)` → sol üst köşe; sonra sağ üst, sol alt, sağ alt. `||` → herhangi biri katıysa `true`.
- Neden `- 1` değil de `- 0.01`? Oyuncu yarım piksel gibi **küsuratlı** yerlerde durabilecek. `- 1` olsaydı yarım piksel
  zemine gömülmesi fark edilmezdi. Böyle kenar hataları birçok oyunda karakterin duvara yapışmasına, zeminde
  titremesine yol açar.

# --task--

1. Under `const TILE = 32` write `EPS`.
2. Under `solidAt`, leave an empty line and write `overlapsSolid` with its comment.

# --task-tr--

1. `const TILE = 32` satırının altına `EPS` satırını yaz.
2. `solidAt` fonksiyonunun altına bir boş satır bırak ve yorumuyla birlikte `overlapsSolid` fonksiyonunu yaz.
3. **Çalıştır**: ekran aynı, kontroller yeşil.

# --predict--

A 24×30 box stands at y = 258, so its bottom is at 288, exactly the top of the ground. Without `- EPS`, what would
`overlapsSolid` say?
- [x] `true`: it is inside the ground
  Pixel 288 is the ground's first row, and the bottom corner would be checked right there.
- [ ] `false`: it is only touching
- [ ] It would throw an error

# --predict-tr--

24×30'luk bir kutu y = 258'de duruyor; alt kenarı 288'de, yani tam zeminin üstünde. `- EPS` olmasaydı `overlapsSolid`
ne derdi?
- [x] `true`: zeminin içinde
  288. piksel zeminin ilk sırası; alt köşe tam orada kontrol edilirdi.
- [ ] `false`: yalnız değiyor
- [ ] Hata verirdi

# --tests--

`overlapsSolid()` should check the corners, without counting a box that only touches.
tr: `overlapsSolid()` köşeleri kontrol etmeli, yalnızca değen bir kutuyu saymamalı.

```js
assert.isFalse(overlapsSolid({ x: 64, y: 258, w: 24, h: 30 }), 'standing exactly on the ground')
assert.isTrue(overlapsSolid({ x: 64, y: 259, w: 24, h: 30 }), 'one pixel into the ground')
assert.isTrue(overlapsSolid({ x: 64, y: 258.5, w: 24, h: 30 }), 'even half a pixel into the ground counts')
assert.isTrue(overlapsSolid({ x: 22 * 32 - 23, y: 240, w: 24, h: 30 }), 'right edge inside the pillar')
assert.isFalse(overlapsSolid({ x: 22 * 32 - 24, y: 240, w: 24, h: 30 }), 'right edge touching the pillar')
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
