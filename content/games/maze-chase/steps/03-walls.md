---
title: Draw the walls
title_tr: Duvarları çiz
skills: [game.canvas, prog.arrays]
---

# --goal--

Walk through every character of the map: a `#` becomes a blue square slightly smaller than its tile, so walls read as
blocks with thin gaps; a `-` (the ghost house) fills its whole tile in dark purple.

# --goal-tr--

Haritayı ekrana dökme zamanı. Her sıranın her harfine bakacağız:

- `#` → mavi bir kare. Döşemeden her yanda 2 piksel **küçük** çizeceğiz; duvarlar aralarında ince çizgiler olan
  bloklar gibi görünecek.
- `-` → hayalet evi: döşemenin tamamı koyu mor.

Her harfin **hangi sıra ve sütunda** olduğunu da bilmemiz gerek; çünkü karenin yeri ona göre hesaplanır.

# --code--

```js
  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '#') {
        ctx.fillStyle = '#1d4ed8'
        ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
      }
      if (ch === '-') {
        ctx.fillStyle = '#312e81'
        ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
      }
    })
  })
```

# --meaning--

- `forEach((item, index) => ...)` runs the function for every item and also gives its position: here the row text and
  its row number, then each character and its column.
- `[...line]` splits a string into characters. The `;` in front stops JavaScript from gluing a line that starts with
  `[` to the line before it.
- Column `col` starts at `col * TILE` pixels, row `row` at `TOP + row * TILE`.

# --meaning-tr--

- `MAZE.forEach((line, row) => { ... })` → `forEach` dizinin **her elemanı için** fonksiyonu çalıştırır. İkinci ad
  (`row`) elemanın **sıra numarasıdır**: ilk turda `line` en üst sıranın metni, `row` 0.
- `[...line]` → metni **harflerine ayırır**: `[...'#.o']` → `['#', '.', 'o']`. İçteki `forEach` her harfi (`ch`) ve
  sütununu (`col`) verir.
- Baştaki `;` → satır `[` ile başlıyor. JavaScript satır sonlarında bazen noktalı virgül varsaymaz ve bu satırı bir
  üstteki satıra **yapıştırabilir**. Önüne `;` koymak bunu önler.
- `col * TILE + 2` → sütunun soldan uzaklığı, artı 2 piksel boşluk. `TOP + row * TILE + 2` → üstten uzaklık (skor
  alanı dahil). `TILE - 4` → iki yandan 2'şer piksel eksik: 20 × 20.
- `'-'` → ev: `col * TILE` ile tam döşeme, boşluksuz.

# --task--

In `draw`, under the background lines, leave an empty line and write the loops.

# --task-tr--

1. `draw` içinde arka planı boyayan `ctx.fillRect(0, 0, ...)` satırının **altına** bir boş satır bırak ve döngüleri
   yaz (`draw`'un kapanan `}`'inden önce).
2. **Çalıştır**: mavi duvarlı labirent ve ortada mor ev görünmeli.

# --hint--

If nothing shows up, check the `;` before `[...line]` and that both `forEach` calls close with `})`.

# --hint-tr--

Hiçbir şey görünmüyorsa `[...line]`'ın önündeki `;`'yi ve iki `forEach`'in de `})` ile kapandığını kontrol et.

# --tests--

Every `#` should be drawn as a blue 20×20 square inside its tile.
tr: Her `#` döşemesinin içinde mavi 20×20 bir kare olarak çizilmeli.

```js
$.tick(1)
const walls = $.rects('#1d4ed8')
assert.lengthOf(walls, 196)
assert.deepEqual(walls[0], { x: 2, y: 42, w: 20, h: 20, color: '#1d4ed8' })
```

The ghost house should fill 6 whole tiles.
tr: Hayalet evi 6 tam döşemeyi doldurmalı.

```js
$.tick(1)
const house = $.rects('#312e81')
assert.lengthOf(house, 6)
assert.deepEqual(house[0], { x: 8 * 24, y: 40 + 8 * 24, w: 24, h: 24, color: '#312e81' })
```

# --solution--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 24
const TOP = 40 // room for the score and the lives
// # wall, - the ghost house, . pellet, o power pellet, P player start. Row 9 is a tunnel: its ends are open.
const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# #---# #.####',
  '    .  #---#  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]
const ROWS = MAZE.length
const COLS = MAZE[0].length

function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '#') {
        ctx.fillStyle = '#1d4ed8'
        ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
      }
      if (ch === '-') {
        ctx.fillStyle = '#312e81'
        ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
      }
    })
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
