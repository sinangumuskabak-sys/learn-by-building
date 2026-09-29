---
title: Walls
title_tr: Duvarlar
skills: [game.collision]
---

# --goal--

Walls `#` and locked doors `D` stop bodies. `blocked` checks the four corners of a 22-pixel box. `move` tries across
and down separately, so a body slides along a wall instead of sticking to it, and says whether it was stopped. Doors are
drawn brown.

# --goal-tr--

Duvarlar `#` ve kilitli kapılar `D` gövdeleri **durdursun**. `blocked` 22 piksellik bir kutunun dört köşesine bakıyor.
`move` yana ve aşağı hareketi **ayrı ayrı** deniyor: gövde duvara yapışmak yerine duvar boyunca kayar; durdurulup
durdurulmadığını da söylüyor. Kapılar kahverengi çiziliyor.

# --code--

```js
const solidTile = (ch) => ch === '#' || ch === 'D'

// Does a box at (x, y) overlap a wall? Outside the room counts as open, so the player can walk out of a gap.
function blocked(x, y) {
  for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
    const row = Math.floor(cy / T)
    const col = Math.floor(cx / T)
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && solidTile(tiles[row][col])) return true
  }
  return false
}

// Move a body, one axis at a time, stopping at walls. Returns true if it was stopped.
function move(body, dx, dy) {
  let stopped = false
  if (blocked(body.x + dx, body.y)) stopped = true
  else body.x += dx
  if (blocked(body.x, body.y + dy)) stopped = true
  else body.y += dy
  return stopped
}

      if (ch === 'D') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 2, y + 2, T - 4, T - 4)
      }
```

# --meaning--

- The corners are at `x` and `x + SIZE - 1` (the last pixel of the body), same for `y`.
- `Math.floor(cy / T)` turns a pixel into a tile number.
- Outside the room is not a wall: a gap in the wall leads out, and the next step uses it.
- `stopped` will tell the enemies to turn around.

# --meaning-tr--

- Köşeler `x` ve `x + SIZE - 1`'de (gövdenin **son** pikseli), `y` için de aynısı.
- `Math.floor(cy / T)` → pikselden **kare numarası**.
- `row >= 0 && row < ROWS && ...` → oda dışı duvar **sayılmaz**: duvardaki boşluk dışarı açılır; sonraki adımda
  oradan başka odaya geçeceğiz.
- `move` → önce yana, sonra (belki yeni `x`'le) aşağı; kapalıysa o payı yapma. `stopped` → bir yerde durduruldu mu;
  düşmanlar duvara çarpınca dönmek için kullanacak.

# --task--

1. Replace `move` with `solidTile`, `blocked` and the new `move`, with their comments.
2. In the tile drawing, draw doors after the floor.

# --task-tr--

1. `move` fonksiyonunu sil; yerine yorumlarıyla `solidTile`, `blocked` ve yeni `move`'u yaz.
2. Kare çiziminde `ctx.fillRect(x, y, T, T)` altına kapı bloğunu yaz. **Çalıştır** ve bir duvara yürü.

# --tests--

A wall should stop the hero just before it.
tr: Duvar kahramanı hemen önünde durdurmalı.

```js
$.press('ArrowUp')
$.tick(30)
assert.strictEqual(player.y, 34)
assert.isTrue(blocked(101, 31.5))
assert.isFalse(blocked(101, 34))
```

The hero should slide along a wall, and doors should be drawn.
tr: Kahraman duvar boyunca kaymalı, kapılar çizilmeli.

```js
player.y = 34
const x = player.x
assert.isTrue(move(player, 3, -3))
assert.strictEqual(player.x, x + 3, 'the part along the wall still moves')
assert.strictEqual(player.y, 34)
enter(1, 0)
$.tick(1)
assert.lengthOf($.rects('#92400e'), 1)
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
const SIZE = 22 // the player's and the enemies' bodies
const SPEED = 2.5
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
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
let room // { rx, ry }: which room we are in
let player
const held = {}

function reset() {
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
}

const solidTile = (ch) => ch === '#' || ch === 'D'

// Does a box at (x, y) overlap a wall? Outside the room counts as open, so the player can walk out of a gap.
function blocked(x, y) {
  for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
    const row = Math.floor(cy / T)
    const col = Math.floor(cx / T)
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && solidTile(tiles[row][col])) return true
  }
  return false
}

// Move a body, one axis at a time, stopping at walls. Returns true if it was stopped.
function move(body, dx, dy) {
  let stopped = false
  if (blocked(body.x + dx, body.y)) stopped = true
  else body.x += dx
  if (blocked(body.x, body.y + dy)) stopped = true
  else body.y += dy
  return stopped
}

document.addEventListener('keydown', (event) => {
  held[event.key] = true
  if (DIRS[event.key]) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  held[event.key] = false
})

function update() {
  let dir = null
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir) {
    player.dir = dir
    move(player, dir[0] * SPEED, dir[1] * SPEED)
  }
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
