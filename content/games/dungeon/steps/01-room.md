---
title: A room
title_tr: Bir oda
skills: [game.canvas, prog.arrays]
---

# --goal--

We are building a Zelda-style dungeon: walk through four rooms, fight with a sword, find the key, open the door and
escape down the stairs. First the world: four rooms written as text, 15 tiles wide and 11 high, arranged 2 by 2. We load
the first room and draw it tile by tile, below a strip at the top kept free for hearts and keys.

# --goal-tr--

**Zelda tarzı bir zindan** yapıyoruz: dört odada gez, kılıçla dövüş, anahtarı bul, kapıyı aç ve merdivenden kaç.
Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

Önce dünya: yazıyla çizilmiş **dört oda**, her biri 15 kare genişliğinde ve 11 kare yüksekliğinde, 2'ye 2 dizilmiş.
Harita uzun ama sadece bir çizim; dikkatle kopyala. İlk odayı yükleyip kare kare çiziyoruz; üstte kalp ve anahtarlar
için bir şerit boş kalıyor.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const T = 32 // one tile
const TOP = 48 // room for hearts, keys and the timer
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

let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
let room // { rx, ry }: which room we are in

function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
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
    })
  })
  ctx.restore()
}

enter(0, 0)
draw()
```

# --meaning--

- `ROOMS[ry][rx]` is the room in row `ry`, column `rx` of the 2×2 grid; each room is a list of strings.
- `enter` copies the room into `tiles` as arrays of characters, so single tiles can change later. The start `P` and
  the enemies `e` become floor: they are not tiles.
- `ctx.translate(0, TOP)` moves everything down 48 pixels until `ctx.restore()`; `save` remembers how it was.

# --meaning-tr--

- `ROOMS[ry][rx]` → 2×2 ızgarada `ry`. satır, `rx`. sütundaki oda. Her oda yazılardan oluşan bir liste: `#` duvar,
  `.` zemin; öbür harfler (kapı, anahtar, kalp, düşman, merdiven, başlangıç) sonraki adımlarda anlam kazanacak.
- `enter(rx, ry)` → odayı `tiles`'a **karakter dizileri** olarak kopyalar (`[...line]`): ileride tek tek kareler
  değişebilsin (kapı açılır, anahtar alınır). Yazılar değiştirilemez, diziler değiştirilebilir.
- `ch === 'P' || ch === 'e' ? '.' : ch` → başlangıç ve düşmanlar kare değil: yerlerine zemin.
- `ctx.save()` → çizim ayarlarını hatırla; `ctx.translate(0, TOP)` → bundan sonra her şey 48 piksel aşağıda çizilsin;
  `ctx.restore()` → eski hâle dön. Böylece odanın içinde 0,0 odanın sol üst köşesi olur.

# --task--

Write the lines under the comments (the map carefully), then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz (haritayı dikkatle) ve **Çalıştır**'a bas: ilk oda görünmeli.

# --tests--

The room should be loaded as arrays of characters.
tr: Oda karakter dizileri olarak yüklenmeli.

```js
assert.lengthOf(tiles, 11)
assert.isArray(tiles[0])
assert.lengthOf(tiles[0], 15)
assert.strictEqual(tiles[2][3], '.', 'the P became floor')
assert.strictEqual(tiles[4][11], '.', 'the e became floor')
assert.deepEqual(room, { rx: 0, ry: 0 })
```

The room should be drawn tile by tile below the top strip.
tr: Oda üst şeridin altında kare kare çizilmeli.

```js
assert.lengthOf($.rects('#57534e'), 51)
assert.lengthOf($.rects().filter((r) => r.w === 32), 165)
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

let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
let room // { rx, ry }: which room we are in

function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
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
    })
  })
  ctx.restore()
}

enter(0, 0)
draw()
```
