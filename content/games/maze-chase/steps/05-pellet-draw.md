---
title: Draw the pellets
title_tr: Yemleri çiz
skills: [game.canvas]
---

# --goal--

Draw from the sets, not from the map, so eaten pellets disappear by themselves. A key is turned back into numbers with
`split` and `map(Number)`. Pellets are small 4×4 squares in the middle of their tile, power pellets circles of radius 6.

# --goal-tr--

Yemleri haritadan değil, **kümelerden** çizeceğiz. Böylece bir yem kümeden çıkınca ekrandan da kendiliğinden
kaybolacak.

Kümede adlar metin (`'8,15'`); çizmek için onları yeniden **sayıya** çevirmemiz gerek. Küçük yemler döşemenin
ortasında 4 × 4 kareler, güç yemleri 6 yarıçaplı daireler olacak.

# --code--

```js
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
```

# --meaning--

- `for (const k of pellets)` visits every key in the set.
- `'8,15'.split(',')` is `['8', '15']`; `.map(Number)` turns both into numbers; `[col, row] =` unpacks them.
- `+ 10` and size 4 put the square in the middle of the 24-pixel tile.
- `arc(x, y, radius, 0, Math.PI * 2)` is a full circle; `beginPath` starts it and `fill` paints it.

# --meaning-tr--

- `for (const k of pellets) {` → kümedeki her ad için bir tur.
- `k.split(',')` → metni virgülden **böler**: `'8,15'` → `['8', '15']`.
- `.map(Number)` → her parçayı `Number` ile **sayıya** çevirir: `[8, 15]`.
- `const [col, row] = ...` → iki elemanlı diziyi **açarak** iki ada koyar.
- `col * TILE + 10`, boyut 4 → 24 piksellik döşemenin tam ortasında 4 × 4 bir kare (10 + 4 + 10 = 24).
- `ctx.beginPath()` → yeni bir şekle başla. `ctx.arc(x, y, 6, 0, Math.PI * 2)` → merkezi döşemenin ortası, yarıçapı 6
  olan bir **tam daire** (açılar radyanla: `Math.PI * 2` = 360°). `ctx.fill()` → içini boyar.
- `fillStyle` bir kez seçildi; iki döngü de aynı sarımsı rengi kullanır.

# --task--

In `draw`, under the maze loops, leave an empty line and write the pellet lines.

# --task-tr--

1. `draw` içinde labirent döngüleri (`})` ile biten iki satır) kapandıktan **sonra** bir boş satır bırak ve yem
   satırlarını yaz (`draw`'un son `}`'inden önce).
2. **Çalıştır**: koridorlar küçük yemlerle, dört köşe büyük güç yemleriyle dolmalı.

# --tests--

Every pellet should be a 4×4 square in the middle of its tile.
tr: Her yem döşemesinin ortasında 4×4 bir kare olmalı.

```js
$.tick(1)
const dots = $.rects('#fde68a')
assert.lengthOf(dots, 146)
assert.deepEqual(dots[0], { x: 34, y: 74, w: 4, h: 4, color: '#fde68a' })
```

Power pellets should be circles of radius 6, and eaten pellets should not be drawn.
tr: Güç yemleri 6 yarıçaplı daireler olmalı; yenen yemler çizilmemeli.

```js
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.color === '#fde68a' && a.r === 6), 4)
pellets.delete('1,1')
$.tick(1)
assert.lengthOf($.rects('#fde68a'), 145)
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

function reset() {
  fillPellets()
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
