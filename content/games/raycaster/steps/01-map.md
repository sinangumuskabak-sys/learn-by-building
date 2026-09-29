---
title: The map
title_tr: Harita
skills: [game.canvas, prog.arrays]
---

# --goal--

We are building a 3D maze like the first 3D shooters (Wolfenstein 3D): you walk inside it and see walls in perspective.
The trick: the world is really a flat grid. First we write that grid as a list of strings and draw it small in the
corner, as a minimap.

# --goal-tr--

İlk 3B nişancılar (Wolfenstein 3D) gibi bir **3B labirent** yapıyoruz: içinde yürüyüp duvarları perspektifle
göreceksin. Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

İşin sırrı: dünya aslında **düz bir ızgara**. Önce bu ızgarayı bir yazı listesi olarak yazıyor ve köşeye küçük bir
**mini harita** olarak çiziyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const MINI = 8 // minimap pixels per tile

function draw() {
  // The minimap, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
}

draw()
```

# --meaning--

- Each string is a row, each character a tile: `#` and `2` are walls, `E` the exit, `.` floor.
- `MAP.forEach((line, row) => ...)` visits each row with its number; `[...line]` splits a row into characters.
- Each tile becomes an 8×8 square: dark floor, green exit, light walls.
- The `;` in front of `[...line]` keeps JavaScript from gluing that line to the one before.

# --meaning-tr--

- `MAP` → her yazı bir **satır**, her karakter bir **kare**: `#` taş duvar, `2` tuğla duvar, `E` çıkış, `.` zemin.
  12 × 12'lik bir labirent.
- `MAP.forEach((line, row) => ...)` → her satırı **numarasıyla** gezer.
- `[...line]` → satırı tek tek karakterlere böler; `forEach((ch, col) => ...)` her karakteri sütun numarasıyla gezer.
- `ch === '.' ? ... : ch === 'E' ? ... : ...` → zemin koyu, çıkış yeşil, geri kalan (duvarlar) açık renk.
- `col * MINI, row * MINI` → her kare 8×8 piksel.
- `;[...line]` → baştaki `;` JavaScript'in bu satırı öncekiyle **yapıştırmasını** önler; `[` ile başlayan satırlarda
  alışkanlık.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: sol üstte küçük bir labirent görmelisin.

# --tests--

Every tile should be drawn as an 8×8 square, the exit in green.
tr: Her kare 8×8 çizilmeli, çıkış yeşil.

```js
assert.lengthOf($.rects(), 144)
assert.lengthOf($.rects('rgba(226, 232, 240, 0.8)'), 82)
assert.deepEqual($.rects('#22c55e'), [{ x: 80, y: 80, w: 8, h: 8, color: '#22c55e' }])
```

# --seed--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const MINI = 8 // minimap pixels per tile

function draw() {
  // The minimap, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
}

draw()
```
