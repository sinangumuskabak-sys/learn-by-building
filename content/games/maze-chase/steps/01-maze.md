---
title: A maze made of text
title_tr: Metinden bir labirent
skills: [prog.arrays]
---

# --explanation--

A maze is a grid, and the easiest way to design a grid is to **draw it as text**. Each string is one row, each
character one tile:

```
'#o##.###.#.###.##o#'
 # wall   . pellet   o power pellet   - ghost house   P player start   (space) empty
```

You can see the level while you edit it, and changing the maze never means changing code. `MAZE[row][col]` answers
"what is on this tile?".

Pellets get eaten, so they need a data structure you can **remove from**. A `Set` of keys like `'8,15'` is perfect:
`has`, `add` and `delete` are all instant, and `size` is how many are left. The maze text itself never changes; it is the
starting layout, and `fillPellets()` rebuilds the sets from it whenever a new maze starts.

Keeping "the level" (the text) apart from "the state of this game" (the sets) is a pattern you will see in every game:
the level is data you design, the state is what changes while you play.

# --explanation-tr--

Labirent bir ızgaradır ve bir ızgarayı tasarlamanın en kolay yolu onu **metin olarak çizmektir**. Her metin bir satır, her
karakter bir döşemedir:

```
'#o##.###.#.###.##o#'
 # duvar   . yem   o güç yemi   - hayalet evi   P oyuncu başlangıcı   (boşluk) boş
```

Düzenlerken bölümü görebilirsin ve labirenti değiştirmek hiçbir zaman kodu değiştirmek demek değildir. `MAZE[row][col]`
"bu döşemede ne var?" sorusunu cevaplar.

Yemler yenir; bu yüzden **içinden silebileceğin** bir veri yapısı gerekir. `'8,15'` gibi anahtarlardan oluşan bir `Set`
tam uygun: `has`, `add` ve `delete` anında çalışır, `size` de kaç tane kaldığıdır. Labirent metninin kendisi hiç değişmez;
o başlangıç düzenidir ve `fillPellets()` yeni bir labirent başladığında kümeleri ondan yeniden kurar.

"Bölümü" (metin) "bu oyunun durumundan" (kümeler) ayrı tutmak her oyunda göreceğin bir kalıptır: bölüm senin tasarladığın
veridir, durum ise oynarken değişendir.

# --task--

1. Add `TILE = 24`, `TOP = 40` and the `MAZE` from the solution, with `ROWS` and `COLS` taken from it.
2. Write `key(col, row)` returning `'col,row'`, and `fillPellets()` that makes `pellets` (every `.`) and `powers` (every
   `o`) new `Set`s of keys.
3. Write `placeActors()` that puts `player = { col, row }` on the `P`, and `reset()` that calls both.
4. Draw every frame: a `'#0b1020'` background; walls as `'#1d4ed8'` squares 2 pixels smaller than their tile on each side;
   house tiles as full `'#312e81'` tiles; pellets as 4 by 4 `'#fde68a'` squares in the middle of their tile; power pellets
   as `'#fde68a'` circles of radius 6; the player as a `'#facc15'` circle of radius 10. Row `r` starts at `TOP + r * TILE`.

# --task-tr--

1. `TILE = 24`, `TOP = 40` ve çözümdeki `MAZE`'i, ondan alınan `ROWS` ve `COLS` ile ekle.
2. `'col,row'` döndüren `key(col, row)` ve `pellets` (her `.`) ile `powers`'ı (her `o`) anahtarlardan oluşan yeni `Set`'ler
   yapan `fillPellets()` yaz.
3. `player = { col, row }`'u `P`'nin üstüne koyan `placeActors()` ve ikisini çağıran `reset()` yaz.
4. Her karede çiz: `'#0b1020'` bir arka plan; duvarlar her yandan döşemesinden 2 piksel küçük `'#1d4ed8'` kareler; ev
   döşemeleri tam `'#312e81'` döşemeler; yemler döşemelerinin ortasında 4'e 4 `'#fde68a'` kareler; güç yemleri 6
   yarıçaplı `'#fde68a'` daireler; oyuncu 10 yarıçaplı `'#facc15'` bir daire. `r` satırı `TOP + r * TILE`'da başlar.

# --tests--

The maze text should become sets of pellets and power pellets.
tr: Labirent metni yem ve güç yemi kümelerine dönüşmeli.

```js
assert.strictEqual(ROWS, 21)
assert.strictEqual(COLS, 19)
assert.strictEqual(key(8, 15), '8,15')
assert.strictEqual(pellets.size, 146)
assert.strictEqual(powers.size, 4)
assert.isTrue(pellets.has('1,1'))
assert.isTrue(powers.has('17,2'))
assert.isFalse(pellets.has('0,0'), 'no pellets in walls')
```

The player should start on the P.
tr: Oyuncu P'nin üstünde başlamalı.

```js
assert.strictEqual(player.col, 9)
assert.strictEqual(player.row, 15)
```

The maze should be drawn tile by tile.
tr: Labirent döşeme döşeme çizilmeli.

```js
$.tick(1)
const walls = $.rects('#1d4ed8')
assert.lengthOf(walls, 196)
assert.deepEqual(walls[0], { x: 2, y: 42, w: 20, h: 20, color: '#1d4ed8' })
assert.lengthOf($.rects('#312e81'), 6)
const dots = $.rects('#fde68a')
assert.lengthOf(dots, 146)
assert.deepEqual(dots[0], { x: 34, y: 74, w: 4, h: 4, color: '#fde68a' })
assert.lengthOf($.arcs().filter((a) => a.color === '#fde68a' && a.r === 6), 4)
```

The player should be drawn in the middle of its tile.
tr: Oyuncu döşemesinin ortasında çizilmeli.

```js
$.tick(1)
const me = $.arcs().filter((a) => a.color === '#facc15')
assert.lengthOf(me, 1)
assert.deepEqual([me[0].x, me[0].y, me[0].r], [228, 412, 10])
```

# --seed--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
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
// Checked in this order, so ties go to up, then left, then down.

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
