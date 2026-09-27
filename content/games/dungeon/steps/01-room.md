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

Zindan 2'ye 2 bir ızgarada dört odadır ve her oda Sokoban ya da labirent oyunundaki bölümler gibi, 15 karakterlik 11 satır olarak
metinle yazılır:

```
'#.............#'   # duvar   . zemin   D kilitli kapı   k anahtar   h kalp   e düşman   E merdiven   P başlangıç
```

Yani `ROOMS[ry][rx]` bir odadır, satırlardan oluşan bir liste, `ROOMS[0][0][row][col]` de bir karodur. Dış duvardaki boşluklar bir
odadan sonrakine geçiş yollarıdır; 3. adımda geliyorlar.

Ekrandaki oda metin olarak değil **karakter dizileri** (`tiles`) olarak tutulur, çünkü sonra içindeki şeyler değişecek: bir anahtar
alınır, bir kapı açılır. JavaScript'te metinler yerinde değiştirilemez, diziler değiştirilebilir.

Oyuncunun konumu karo olarak değil piksel olarak tutulur; böylece akıcı hareket edebilir. Gövdesi 32 piksellik bir karodan biraz
küçük, 22 piksellik bir karedir; bu da tek karolu koridorlardan geçmeyi kolaylaştıracak. Oda, kalpler ve anahtarlar için bir
şeridin altına çizilir: `ctx.translate(0, TOP)` kendisinden sonra çizilen her şeyi kaydırır; böylece oda `y = 0`'da başlıyormuş
gibi çizilebilir.

# --task--

1. Add `T = 32`, `TOP = 48`, `SIZE = 22`, the `ROOMS` from the solution, `COLS = 15` and `ROWS = 11`.
2. Write `findIn(lines, ch)` returning the `{ row, col }` of a character in a room. `reset()` puts the player, as
   `{ x, y, dir: [0, 1] }`, centered on the `P` tile of the first room, and makes `tiles` from that room as arrays of characters
   (the `P` becomes floor).
3. Draw every frame: fill `'#0c0a09'`; then, translated down by `TOP` (with `save`/`restore`), every tile as a 32 by 32 square,
   `'#57534e'` for walls and `'#d6c7a1'` for everything else, with a `'#92400e'` square 2 pixels inside it for a door; then the
   player as a `'#16a34a'` 22 by 22 square.

# --task-tr--

1. `T = 32`, `TOP = 48`, `SIZE = 22`, çözümdeki `ROOMS`, `COLS = 15` ve `ROWS = 11` ekle.
2. Bir odadaki bir karakterin `{ row, col }`'unu döndüren `findIn(lines, ch)` yaz. `reset()` oyuncuyu `{ x, y, dir: [0, 1] }`
   olarak ilk odanın `P` karosunda ortalar ve `tiles`'ı o odadan karakter dizileri olarak yapar (`P` zemin olur).
3. Her karede çiz: `'#0c0a09'` ile doldur; sonra `TOP` kadar aşağı kaydırılmış olarak (`save`/`restore` ile) her karoyu 32'ye 32
   bir kare olarak, duvarlar için `'#57534e'`, diğer her şey için `'#d6c7a1'`, bir kapı için içinde 2 piksel içeride `'#92400e'` bir
   kare; sonra oyuncuyu `'#16a34a'` 22'ye 22 bir kare olarak.

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
