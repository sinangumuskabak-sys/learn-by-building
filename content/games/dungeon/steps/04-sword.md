---
title: A sword
title_tr: Bir kılıç
skills: [game.collision, game.input]
---

# --explanation--

Space swings the sword. A swing lasts 12 frames, and during it the player stands still and the sword sticks out in the
direction the player faces. That is where remembering `dir` pays off.

The sword is just a box, worked out from the player's position and direction:

```js
const cx = player.x + SIZE / 2 + dx * 15   // 15 pixels from the middle, in the facing direction
const w = dx ? 30 : 8                       // long along the facing direction, thin across it
```

It reaches from the middle of the player out to 30 pixels in front. Starting from the middle, not from the edge, matters: an
enemy that has already reached you is still inside the sword's box.

A swing cannot start while one is already going on, so holding Space does not make the sword a wall of blades. On a phone, a tap
anywhere outside the pad swings.

# --explanation-tr--

Boşluk kılıcı savurur. Bir savurma 12 kare sürer ve bu sırada oyuncu yerinde durur, kılıç oyuncunun baktığı yöne doğru dışarı
çıkar. `dir`'i hatırlamanın karşılığı buradadır.

Kılıç, oyuncunun konumundan ve yönünden hesaplanan bir kutudan ibarettir:

```js
const cx = player.x + SIZE / 2 + dx * 15   // ortadan, bakılan yönde 15 piksel
const w = dx ? 30 : 8                       // bakılan yönde uzun, enine ince
```

Oyuncunun ortasından önündeki 30 piksele kadar uzanır. Kenardan değil ortadan başlaması önemlidir: sana zaten ulaşmış bir düşman
hâlâ kılıcın kutusunun içindedir.

Bir savurma sürerken yenisi başlayamaz; bu yüzden Boşluk'u basılı tutmak kılıcı bir bıçak duvarına çevirmez. Telefonda yön tuşunun
dışında herhangi bir yere dokunmak savurur.

# --task--

1. Add `swing` (`0` in `reset()`). Space (not a repeat) starts a swing of 12 frames if none is going on; so does a tap outside the
   pad.
2. The player only walks while not swinging. Count `swing` down every frame.
3. Write `swordBox()` returning `{ x, y, w, h }` as described, and draw it in `'#e5e7eb'` while swinging.

# --task-tr--

1. `swing` ekle (`reset()`'te `0`). Boşluk (tekrar olmayan), sürmekte olan yoksa 12 karelik bir savurma başlatır; yön tuşunun
   dışına dokunmak da.
2. Oyuncu yalnızca savurmuyorken yürür. `swing`'i her karede geri say.
3. Anlatıldığı gibi `{ x, y, w, h }` döndüren `swordBox()` yaz ve savururken `'#e5e7eb'` ile çiz.

# --tests--

Space should swing the sword in front of the player for 12 frames.
tr: Boşluk kılıcı oyuncunun önünde 12 kare savurmalı.

```js
$.press(' ')
assert.strictEqual(swing, 12)
assert.deepEqual(swordBox(), { x: 108, y: 80, w: 8, h: 30 }, 'facing down')
$.tick(1)
assert.lengthOf($.rects('#e5e7eb'), 1)
$.tick(11)
assert.strictEqual(swing, 0)
$.tick(1)
assert.lengthOf($.rects('#e5e7eb'), 0)
player.dir = [-1, 0]
assert.deepEqual(swordBox(), { x: 82, y: 76, w: 30, h: 8 }, 'facing left')
```

The player should not walk while swinging, and a swing should not restart while it goes on.
tr: Oyuncu savururken yürümemeli ve savurma sürerken yeniden başlamamalı.

```js
$.press(' ')
$.press('ArrowRight')
$.tick(5)
assert.strictEqual(player.x, 101)
$.release(' ')
$.press(' ')
assert.strictEqual(swing, 7)
$.tick(7)
$.tick(2)
assert.strictEqual(player.x, 106)
```

A tap away from the pad should swing.
tr: Yön tuşundan uzağa bir dokunuş savurmalı.

```js
$.pointerDown(400, 200)
assert.strictEqual(swing, 12)
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
const SIZE = 22 // the player's body
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

let tiles // the current room
let room // { rx, ry }: which room we are in
let player
let swing // frames left of the sword swing
const held = {}

function reset() {
  swing = 0
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

// Load a room: its tiles.
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

// Move a body, one axis at a time, stopping at walls.
function move(body, dx, dy) {
  if (!blocked(body.x + dx, body.y)) body.x += dx
  if (!blocked(body.x, body.y + dy)) body.y += dy
}

document.addEventListener('keydown', (event) => {
  held[event.key] = true
  if (DIRS[event.key] || event.key === ' ') event.preventDefault()
  if (event.key === ' ' && !event.repeat && swing === 0) swing = 12
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
  else if (swing === 0) swing = 12
})
canvas.addEventListener('pointerup', () => {
  padDir = null
})

// The sword: a box from the middle of the player out to 30 pixels in front, so it also hits an enemy right on top of you.
function swordBox() {
  const [dx, dy] = player.dir
  const cx = player.x + SIZE / 2 + dx * 15
  const cy = player.y + SIZE / 2 + dy * 15
  const w = dx ? 30 : 8
  const h = dy ? 30 : 8
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}

function update() {
  let dir = padDir
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir && swing === 0) {
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

  if (swing > 0) swing -= 1
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
  if (swing > 0) {
    const s = swordBox()
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(s.x, s.y, s.w, s.h)
  }
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
