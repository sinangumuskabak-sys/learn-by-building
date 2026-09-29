---
title: A red ghost
title_tr: Kırmızı bir hayalet
skills: [game.state, prog.arrays]
---

# --goal--

Ghosts are described once in `GHOSTS` (for now one: red) and turned into moving objects by `placeActors`, each
starting on `EXIT`, the tile just above the house, heading left. They have the same fields as the player, so `position`
works for them too.

# --goal-tr--

Sıra avcılarda. Hayaletleri önce bir **tarif listesinde** tanımlayacağız: `GHOSTS` (şimdilik tek bir tane: kırmızı).
`placeActors` bu listeden, oyunda gerçekten dolaşacak nesneleri (`ghosts`) yapacak.

Her hayalet oyuncuyla **aynı alanlara** sahip: `col`, `row`, `dir`, `progress`, `frames`. Böylece `position` ve
birazdan `advance` onlar için de aynen çalışacak. Kırmızı hayalet evin hemen üstündeki döşemede (`EXIT`, çıkış)
başlıyor, sola bakıyor. Bu adımda yalnız çizeceğiz; henüz kıpırdamayacak.

# --code--

```js
const EXIT = { col: 9, row: 7 } // the tile just above the ghost house
const GHOSTS = [{ name: 'red', color: '#ef4444' }]

let ghosts

  ghosts = GHOSTS.map((g) => ({ ...g, col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0, frames: 10 }))

  for (const g of ghosts) {
    const q = position(g)
    ctx.fillStyle = g.color
    ctx.fillRect(q.x * TILE + 3, TOP + q.y * TILE + 3, TILE - 6, TILE - 6)
  }
```

# --meaning--

- `GHOSTS.map(...)` makes one new object per description. `{ ...g, col: ... }` copies the description's fields (name,
  color) and adds the moving ones.
- The object in `map`'s arrow function is wrapped in `( )`, so the braces are read as an object, not a function body.
- Each ghost is drawn as a square in its color, 3 pixels smaller than its tile on every side, at its `position`.

# --meaning-tr--

- `const EXIT = { col: 9, row: 7 }` → evin hemen üstündeki döşeme: hayaletlerin çıkış kapısı.
- `const GHOSTS = [{ name: 'red', color: '#ef4444' }]` → hayalet **tarifleri**: adı ve rengi. Hiç değişmezler.
- `let ghosts` → oyunda dolaşan hayaletler; her oyunda ve her turda yeniden yapılır.
- `GHOSTS.map((g) => ({ ... }))` → her tariften **yeni bir nesne**. Ok fonksiyonu bir nesne döndürürken onu `( )`
  içine alırız; yoksa `{` fonksiyon gövdesi sanılır.
- `...g` → tarifin alanlarını (ad, renk) yeni nesneye **kopyalar**; sonra hareket alanları eklenir. Tarif
  değişmeden kalır.
- `frames: 10` → hayaletin bir adımı kaç kare sürer (birazdan ayarlayacağız).
- Çizim: her hayalet için `position` ile yerini bul; döşemeden her yanda 3 piksel küçük bir kare çiz (18 × 18).
  Oyuncudan **önce** çiziliyor; oyuncu üstte görünsün.

# --task--

1. Under `PLAYER_FRAMES` write `EXIT` and `GHOSTS`; under `let player` write `let ghosts`.
2. In `placeActors`, under the `player` line, write the `ghosts` line.
3. In `draw`, above `const p = position(player)`, write the ghost loop and an empty line.

# --task-tr--

1. `const PLAYER_FRAMES = ...` satırının **altına** `EXIT` ve `GHOSTS` satırlarını yaz.
2. `let player` satırının **altına** `let ghosts` yaz.
3. `placeActors` içinde `player = { ... }` satırının **altına** `ghosts = ...` satırını yaz.
4. `draw` içinde `const p = position(player)` satırının **üstüne** hayalet döngüsünü yaz; altında bir boş satır
   kalsın.
5. **Çalıştır**: evin üstünde kırmızı bir kare görünmeli.

# --tests--

The red ghost should start on the tile above the house, heading left.
tr: Kırmızı hayalet evin üstündeki döşemede, sola bakarak başlamalı.

```js
assert.lengthOf(ghosts, 1)
const red = ghosts[0]
assert.deepEqual([red.name, red.color, red.col, red.row, red.progress], ['red', '#ef4444', 9, 7, 0])
assert.deepEqual(red.dir, [-1, 0])
assert.notStrictEqual(red, GHOSTS[0], 'a new object, not the description itself')
```

The ghost should be drawn as a square in its color.
tr: Hayalet kendi renginde bir kare olarak çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#ef4444'), [{ x: 9 * 24 + 3, y: 40 + 7 * 24 + 3, w: 18, h: 18, color: '#ef4444' }])
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
const DIRECTIONS = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] }
const STOP = [0, 0]
const PLAYER_FRAMES = 8 // frames the player needs to cross one tile
const EXIT = { col: 9, row: 7 } // the tile just above the ghost house
const GHOSTS = [{ name: 'red', color: '#ef4444' }]

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player
let ghosts
let score
let level

const key = (col, row) => col + ',' + row
const wrap = (col) => (col + COLS) % COLS

function isWall(col, row) {
  const ch = MAZE[row][wrap(col)]
  return ch === '#' || ch === '-'
}

function canGo(e, dir) {
  return !isWall(e.col + dir[0], e.row + dir[1])
}

const same = (a, b) => a[0] === b[0] && a[1] === b[1]
const reverse = (dir) => [-dir[0], -dir[1]]

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
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
  ghosts = GHOSTS.map((g) => ({ ...g, col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0, frames: 10 }))
}

function reset() {
  score = 0
  level = 1
  fillPellets()
  placeActors()
}

// Where an actor is drawn: its tile plus how far it has come towards the next one.
function position(e) {
  return { x: e.col + (e.dir[0] * e.progress) / e.frames, y: e.row + (e.dir[1] * e.progress) / e.frames }
}

// One frame of movement. Directions are only chosen at the center of a tile, by `choose`.
function advance(e, choose) {
  if (e.progress === 0) choose(e)
  if (same(e.dir, STOP)) return
  e.progress += 1
  if (e.progress < e.frames) return
  e.progress = 0
  e.col = wrap(e.col + e.dir[0])
  e.row += e.dir[1]
  arrive(e)
}

function arrive(e) {
  if (e !== player) return
  const here = key(player.col, player.row)
  if (pellets.delete(here)) score += 10
  if (powers.delete(here)) score += 50
  if (pellets.size === 0 && powers.size === 0) {
    level += 1
    fillPellets()
    placeActors()
  }
}

function choosePlayer(p) {
  // The wanted direction is remembered, so a turn pressed early happens at the next corner.
  if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
  else if (!canGo(p, p.dir)) p.dir = STOP
}

// Turning around in the middle of a tile: step into the next tile and walk back the rest of the way.
function turnAround(e) {
  if (e.progress === 0 || same(e.dir, STOP)) {
    e.dir = reverse(e.dir)
    return
  }
  e.col = wrap(e.col + e.dir[0])
  e.row += e.dir[1]
  e.dir = reverse(e.dir)
  e.progress = e.frames - e.progress
}

function steer(dir) {
  player.want = dir
  if (same(dir, reverse(player.dir)) && !same(dir, STOP)) turnAround(player)
}

document.addEventListener('keydown', (event) => {
  const dir = DIRECTIONS[event.key]
  if (dir) {
    event.preventDefault()
    steer(dir)
  }
})

// Touch: swipe in the direction to go.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
  if (Math.abs(dx) > Math.abs(dy)) steer([Math.sign(dx), 0])
  else steer([0, Math.sign(dy)])
})

function update() {
  advance(player, choosePlayer)
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

  for (const g of ghosts) {
    const q = position(g)
    ctx.fillStyle = g.color
    ctx.fillRect(q.x * TILE + 3, TOP + q.y * TILE + 3, TILE - 6, TILE - 6)
  }

  const p = position(player)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 10, 27)
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level, canvas.width - 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
