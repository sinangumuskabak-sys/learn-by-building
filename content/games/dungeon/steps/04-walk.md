---
title: Walk
title_tr: Yürü
skills: [game.input]
---

# --goal--

Holding an arrow walks the hero that way, 2.5 pixels a frame, and turns it to face that way. `DIRS` gives each arrow
key its direction. Walls don't stop you yet.

# --goal-tr--

Bir ok tuşunu basılı tutmak kahramanı o yöne karede 2.5 piksel yürütsün ve o yöne **döndürsün**. `DIRS` her ok tuşuna
yönünü veriyor. Duvarlar henüz durdurmuyor.

# --code--

```js
const SPEED = 2.5
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
const held = {}

function move(body, dx, dy) {
  body.x += dx
  body.y += dy
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

  update()
```

# --meaning--

- `held` remembers which keys are down.
- `for (const key in DIRS)` visits the names of the four arrows; the last one held wins.
- `move` takes any body (the hero now, enemies later) and moves it.

# --meaning-tr--

- `DIRS` → her ok tuşunun adına yönü: `[yana, aşağı]`.
- `held` → basılı tuşlar; basınca `true`, bırakınca `false`.
- `for (const key in DIRS)` → nesnenin **alan adlarını** gezer: dört okun adı. Basılı olanın yönü `dir` olur.
- `if (dir)` → bir ok basılıysa: o yöne dön ve yürü. `null` "yok" demek, `if` onu yanlış sayar.
- `move(body, dx, dy)` → herhangi bir gövdeyi (şimdi kahraman, sonra düşmanlar) kaydırır; bir sonraki adımda duvar
  kontrolü buraya girecek.

# --task--

1. Under `SIZE`, write `SPEED`; under `ROWS`, write `DIRS`; under `player`, write `held`.
2. Above `draw`, write `move`, the key listeners and `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `SIZE` altına `SPEED`, `ROWS` altına `DIRS`, `let player` altına `held` yaz.
2. `draw`'ın üstüne `move`, iki tuş dinleyicisini ve `update`'i yaz.
3. `loop` içinde `draw()`'ın üstüne `update()` yaz. **Çalıştır**, oyuna tıkla ve oklarla yürü.

# --tests--

Holding an arrow should walk that way and turn the hero.
tr: Bir oku basılı tutmak o yöne yürütmeli ve kahramanı döndürmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 126)
assert.deepEqual(player.dir, [1, 0])
$.release('ArrowRight')
$.tick(5)
assert.strictEqual(player.x, 126)
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

function move(body, dx, dy) {
  body.x += dx
  body.y += dy
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
