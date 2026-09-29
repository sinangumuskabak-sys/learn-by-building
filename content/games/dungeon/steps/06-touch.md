---
title: A touch pad
title_tr: Dokunmatik ped
skills: [game.input]
---

# --goal--

On a phone, a faint circle in the bottom-left corner is a pad: hold a side of it to walk that way. Whichever is farther
from the middle, across or down, decides the direction. (A tap elsewhere will swing the sword, soon.)

# --goal-tr--

Telefonda sol alt köşedeki soluk daire bir **ped**: bir kenarını basılı tut, o yöne yürü. Ortadan yana mı aşağı mı
daha uzaksa yön o olur. (Başka bir yere dokunmak yakında kılıç sallayacak.)

# --code--

```js
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

  let dir = padDir

  // The touch pad, faint, in the corner.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
  ctx.stroke()
```

# --meaning--

- The touch position is scaled to canvas pixels, in case the canvas is shown bigger or smaller.
- Inside the circle, `Math.sign` turns the longer of `dx`, `dy` into −1 or 1: one of the four directions.
- `update` starts from `padDir`; a held arrow key still wins.

# --meaning-tr--

- Dokunuşun yeri tuval pikseline çevriliyor; tuval ekranda büyük ya da küçük gösterilse de doğru.
- `Math.hypot(dx, dy) < PAD.r` → dokunuş dairenin **içinde**.
- `Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]` → yana uzaklık büyükse yatay, değilse dikey;
  `Math.sign` → −1 ya da 1: dört yönden biri.
- `update` artık `null` yerine `padDir`'den başlıyor; basılı bir ok tuşu yine önce gelir.
- Ped `ctx.restore()`'dan **sonra** çiziliyor: 48 piksel kaydırma olmadan, tuvalin kendi köşesinde.

# --task--

1. Under the key listeners, write the pad and its two listeners.
2. In `update`, start `dir` from `padDir`.
3. At the end of `draw`, draw the pad.

# --task-tr--

1. Tuş dinleyicilerinin altına pedi ve iki dokunma dinleyicisini yaz.
2. `update`'te `let dir = null` satırını `let dir = padDir` yap.
3. `draw`'ın sonuna (`ctx.restore()`'un altına) ped çizimini yaz. **Çalıştır** ve pede tıklayıp basılı tut.

# --tests--

Holding the pad should walk.
tr: Pedi basılı tutmak yürütmeli.

```js
$.pointerDown(110, 330) // right side of the pad
$.tick(4)
assert.strictEqual(player.x, 111)
$.pointerUp(110, 330)
$.tick(4)
assert.strictEqual(player.x, 111)
assert.deepInclude($.arcs(), { x: 70, y: 330, r: 60, color: $.arcs()[0].color })
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
