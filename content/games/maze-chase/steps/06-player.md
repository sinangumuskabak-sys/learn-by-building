---
title: The player
title_tr: Oyuncu
skills: [game.state, game.canvas]
---

# --goal--

The player is an object with a column and a row. `placeActors` finds the `P` in the map and puts the player there;
`draw` paints a yellow circle on that tile.

# --goal-tr--

Oyuncuyu sahneye çıkaralım. Oyuncu bir **nesne**: hangi sütunda (`col`) ve hangi sırada (`row`) olduğunu bilir.
Başlangıç yeri haritadaki `P` harfi; onu kodla **arayıp bulacağız**.

Oyuncuyu ve (sonra) hayaletleri yerlerine koyan fonksiyonun adı `placeActors` (oyuncuları yerleştir) olacak; `reset`
onu da çağıracak. Ekranda sarı bir daire görünecek.

# --code--

```js
let player

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row }
}

function reset() {
  fillPellets()
  placeActors()
}

  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
```

# --meaning--

- `findIndex` returns the position of the first item for which the function is true: the row that contains `'P'`.
- `indexOf('P')` is the position of `P` inside that string: the column.
- `{ col: ..., row }` is short for `{ col: ..., row: row }`.
- The player is drawn last, on top of everything, as a circle of radius 10 in the middle of its tile.

# --meaning-tr--

- `let player` → oyuncu nesnesi.
- `MAZE.findIndex((line) => line.includes('P'))` → `findIndex` koşula uyan **ilk elemanın sıra numarasını** verir.
  `line.includes('P')` → "bu metinde `P` var mı?". Sonuç: `P`'nin bulunduğu sıra (15).
- `MAZE[row].indexOf('P')` → o metinde `P`'nin **kaçıncı harf** olduğu: sütun (9).
- `{ col: ..., row }` → `row` yazmak `row: row` demektir: değişkenin adı alanın adı olur.
- `reset` artık `placeActors()`'ı da çağırır.
- Çizim en sonda, her şeyin **üstünde**: döşemenin ortasında, 10 yarıçaplı sarı bir daire.

# --task--

1. Under `let powers ...` write `let player`.
2. Above `function reset()` write `placeActors`; inside `reset` add `placeActors()`.
3. At the end of `draw`, after an empty line, write the four player lines.

# --task-tr--

1. `let powers ...` satırının **altına** `let player` yaz.
2. `function reset() {` satırının **üstüne** `placeActors` fonksiyonunu yaz (altında bir boş satır kalsın).
3. `reset` içinde `fillPellets()` satırının **altına** `placeActors()` yaz.
4. `draw`'un sonunda, güç yemi döngüsünün altına bir boş satır bırakıp dört oyuncu satırını yaz.
5. **Çalıştır**: labirentin alt yarısında, ortada sarı bir daire görünmeli.

# --tests--

The player should start on the P.
tr: Oyuncu P'nin üstünde başlamalı.

```js
assert.deepEqual(player, { col: 9, row: 15 })
```

The player should be drawn in the middle of its tile.
tr: Oyuncu döşemesinin ortasında çizilmeli.

```js
$.tick(1)
const me = $.arcs().filter((a) => a.color === '#facc15')
assert.lengthOf(me, 1)
assert.deepEqual([me[0].x, me[0].y, me[0].r], [228, 412, 10])
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

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player

const key = (col, row) => col + ',' + row

function fillPellets() {
  pellets = new Set()
  powers = new Set()
  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '.') pellets.add(key(col, row))
      if (ch === 'o') powers.add(key(col, row))
    })
  })
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row }
}

function reset() {
  fillPellets()
  placeActors()
}

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

  ctx.fillStyle = '#fde68a'
  for (const k of pellets) {
    const [col, row] = k.split(',').map(Number)
    ctx.fillRect(col * TILE + 10, TOP + row * TILE + 10, 4, 4)
  }
  for (const k of powers) {
    const [col, row] = k.split(',').map(Number)
    ctx.beginPath()
    ctx.arc(col * TILE + TILE / 2, TOP + row * TILE + TILE / 2, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
