---
title: Next room
title_tr: Sonraki oda
skills: [game.state]
---

# --goal--

When the middle of the hero leaves the room through a gap, the room next to it is loaded, and the hero appears on the
opposite side, as if walking through the doorway.

# --goal-tr--

Kahramanın **ortası** bir boşluktan odanın dışına çıkınca yandaki oda yüklensin ve kahraman **karşı kenarda**
belirsin; kapıdan geçiyormuş gibi.

# --code--

```js
// Walking out through a gap in the wall: into the next room, on the opposite side.
const cx = player.x + SIZE / 2
const cy = player.y + SIZE / 2
if (cx < 0 || cx > COLS * T || cy < 0 || cy > ROWS * T) {
  const rx = room.rx + (cx < 0 ? -1 : cx > COLS * T ? 1 : 0)
  const ry = room.ry + (cy < 0 ? -1 : cy > ROWS * T ? 1 : 0)
  if (cx < 0) player.x += COLS * T - 4
  if (cx > COLS * T) player.x -= COLS * T - 4
  if (cy < 0) player.y += ROWS * T - 4
  if (cy > ROWS * T) player.y -= ROWS * T - 4
  enter(rx, ry)
  return
}
```

# --meaning--

- `cx`, `cy` is the middle of the hero; the room is `COLS * T` pixels wide and `ROWS * T` high.
- Leaving on the left means the room one to the left (`rx - 1`), and so on.
- The hero is moved almost a whole room across (4 pixels less), so it lands just inside the other side.

# --meaning-tr--

- `cx`, `cy` → kahramanın ortası. Oda `COLS * T` = 480 piksel genişliğinde, `ROWS * T` = 352 piksel yüksekliğinde.
- Soldan çıktıysa bir sol oda (`rx - 1`), sağdan çıktıysa bir sağ oda; üst ve alt için de aynısı.
- `player.x += COLS * T - 4` → neredeyse bir oda boyu (4 piksel eksik) karşıya: kahraman öbür kenarın hemen içine
  düşer, hemen geri çıkmaz.
- `return` → bu kareyi bitir; yeni oda bir sonraki karede oynanır.

# --task--

At the end of `update`, walk into the next room.

# --task-tr--

`update`'in sonuna, bir boş satırdan sonra oda geçiş bloğunu yaz. **Çalıştır** ve sağdaki boşluktan çık.

# --tests--

Walking out through the right gap should lead into the next room, on its left side.
tr: Sağdaki boşluktan çıkmak yandaki odaya, sol kenarına götürmeli.

```js
player.x = 14 * T + 5
player.y = 5 * T + 5
$.press('ArrowRight')
$.tick(7)
assert.deepEqual(room, { rx: 1, ry: 0 })
assert.isBelow(player.x, 0)
assert.deepEqual(tiles[10].join(''), '#######D#######', 'the tiles of the second room')
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(4)
assert.deepEqual(room, { rx: 0, ry: 0 }, 'and back')
```

Walking down through the bottom gap should lead into the room below.
tr: Alttaki boşluktan inmek alttaki odaya götürmeli.

```js
player.x = 7 * T + 5
player.y = 10 * T + 5
$.press('ArrowDown')
$.tick(8)
assert.deepEqual(room, { rx: 0, ry: 1 })
assert.isBelow(player.y, 10)
assert.strictEqual(tiles[5][6], 'k')
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

// Touch: the pad in the corner moves, a tap anywhere else swings the sword.
const PAD = { x: 70, y: 330, r: 60 }
let padDir = null
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const dx = x - PAD.x
  const dy = y - PAD.y
  if (Math.hypot(dx, dy) < PAD.r) padDir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
})
canvas.addEventListener('pointerup', () => {
  padDir = null
})

function update() {
  let dir = padDir
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir) {
    player.dir = dir
    move(player, dir[0] * SPEED, dir[1] * SPEED)
  }

  // Walking out through a gap in the wall: into the next room, on the opposite side.
  const cx = player.x + SIZE / 2
  const cy = player.y + SIZE / 2
  if (cx < 0 || cx > COLS * T || cy < 0 || cy > ROWS * T) {
    const rx = room.rx + (cx < 0 ? -1 : cx > COLS * T ? 1 : 0)
    const ry = room.ry + (cy < 0 ? -1 : cy > ROWS * T ? 1 : 0)
    if (cx < 0) player.x += COLS * T - 4
    if (cx > COLS * T) player.x -= COLS * T - 4
    if (cy < 0) player.y += ROWS * T - 4
    if (cy > ROWS * T) player.y -= ROWS * T - 4
    enter(rx, ry)
    return
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

  // The touch pad, faint, in the corner.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
  ctx.stroke()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
