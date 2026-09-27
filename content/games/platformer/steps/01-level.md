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

Platform oyunları **döşemelerden** kurulur: her biri boş ya da katı olan küçük karelerden oluşan bir ızgara. Yüzlerce
dikdörtgeni elle yerleştirmek yerine bölümü **metin** olarak yaz. Her metin bir satır, her karakter bir döşemedir:

```
'..P...................#...e...'
'################..############'
```

`#` zemin, `B` tuğla, `.` hava. İleride `P` oyuncunun başladığı yeri, `o` altını, `e` düşmanı, `F` de bayrağı
gösterecek. Bölümü kodda *görebilir*, saniyeler içinde düzenleyebilir ve oyun mantığına dokunmadan yenilerini
tasarlayabilirsin. Buna **veri güdümlü tasarım** denir; gerçek oyunlar bölümlerini böyle saklar (genelde bir bölüm
editörünün ürettiği dosyalarda, ama fikir aynı).

`LEVEL[row][col]` tek bir döşemeyi okur: önce satırı (bir metin), sonra içindeki karakteri seç. Bir döşemenin piksel
konumu sütunu ve satırı çarpı `TILE`'dır.

Bölüm 64 döşeme genişliğinde ama canvas yalnızca 20'sini gösteriyor. Şimdilik tamamını çiziyorsun; sığmayanı canvas
kesiyor. Kamera sonra gelecek.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const TILE = 32`.
2. Add the `LEVEL` array from the solution below (copy it exactly), `const ROWS = LEVEL.length`,
   `const COLS = LEVEL[0].length` and `const COLORS = { '#': '#78350f', B: '#c2410c' }`.
3. Write `draw()`: fill the canvas with the sky color `'#7dd3fc'`, then for every row and column, draw a `TILE` ×
   `TILE` square in `COLORS[tile]` when the tile is `'#'` or `'B'`. Call `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut, `const TILE = 32` ekle.
2. Aşağıdaki çözümdeki `LEVEL` dizisini (birebir kopyala), `const ROWS = LEVEL.length`, `const COLS = LEVEL[0].length`
   ve `const COLORS = { '#': '#78350f', B: '#c2410c' }` ekle.
3. `draw()` yaz: canvas'ı gökyüzü rengi `'#7dd3fc'` ile doldur, sonra her satır ve sütun için döşeme `'#'` ya da
   `'B'` ise `COLORS[tile]` renginde `TILE` × `TILE` bir kare çiz. `draw()`'u çağır.

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
