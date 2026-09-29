---
title: Strike!
title_tr: Vur!
skills: [game.collision]
---

# --goal--

The sword hits an enemy it overlaps: the enemy loses health and is knocked back, sliding 4 pixels a frame for 10 frames
in the direction you face. An enemy with no health left is gone.

# --goal-tr--

Kılıç değdiği düşmana **vursun**: düşman can kaybetsin ve **geri savrulsun**; 10 kare boyunca baktığın yönde karede
4 piksel kaysın. Canı kalmayan düşman yok olsun.

# --code--

```js
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
const box = (body) => ({ x: body.x, y: body.y, w: SIZE, h: SIZE })

  const sword = swing > 0 ? swordBox() : null

  for (const e of enemies) {
    if (e.knock > 0) {
      // Knocked back: slide away from the sword for a few frames.
      e.knock -= 1
      move(e, e.kx, e.ky)
    }
    if (sword && e.knock === 0 && overlap(sword, box(e))) {
      e.hp -= 1
      e.knock = 10
      e.kx = player.dir[0] * 4
      e.ky = player.dir[1] * 4
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
```

# --meaning--

- `overlap` is the classic check for two boxes; `box` makes a box from a body.
- A knocked-back enemy slides with the same `move` as the hero, so walls stop it.
- `e.knock === 0` makes sure one swing hits an enemy only once.
- `filter` keeps only enemies with health left.

# --meaning-tr--

- `overlap(a, b)` → iki kutu **çakışıyor** mu: her biri öbürü bitmeden başlıyor, yana ve dikey. `box(body)` → bir
  gövdeden kutu.
- `sword` → sallama sürüyorsa kılıcın kutusu, değilse `null`.
- Savrulan düşman kahramanla **aynı** `move` ile kayar: duvarlar onu da durdurur.
- `e.knock === 0` → bir sallama bir düşmana yalnız **bir kez** vursun (savrulurken yeniden vurulmaz).
- `e.kx = player.dir[0] * 4` → baktığın yönde karede 4 piksel.
- `filter((e) => e.hp > 0)` → canı kalanları tut. Düşmanların canı 1: tek vuruş yeter.

# --task--

1. Above `update`, write `overlap` and `box`.
2. At the end of `update`, find the sword and go through the enemies.

# --task-tr--

1. `update`'in üstüne `overlap` ve `box` yaz.
2. `update`'in sonuna, geri sayım satırının altına `sword` satırını ve düşman döngüsünü yaz. **Çalıştır** ve bir
   düşmana vur.

# --tests--

The sword should knock an enemy back and defeat it.
tr: Kılıç düşmanı geri savurmalı ve yenmeli.

```js
const e = enemies[0]
player.x = e.x - 24
player.y = e.y
player.dir = [1, 0]
$.press(' ')
$.tick(1)
assert.lengthOf(enemies, 0)
assert.strictEqual(e.knock, 10)
assert.strictEqual(e.kx, 4)
```

A knocked-back enemy should slide and be drawn pale.
tr: Savrulan düşman kaymalı ve soluk çizilmeli.

```js
const e = enemies[0]
e.knock = 5
e.kx = -4
const x = e.x
$.tick(1)
assert.strictEqual(e.x, x - 4)
assert.lengthOf($.rects('#fca5a5'), 1)
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
let enemies
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

function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
  enemies = []
  ROOMS[ry][rx].forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch !== 'e') return
      const x = col * T + (T - SIZE) / 2
      enemies.push({ x, y: row * T + (T - SIZE) / 2, dir: [1, 0], turnIn: 0, hp: 1, knock: 0, kx: 0, ky: 0 })
    })
  })
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
  if (DIRS[event.key] || event.key === ' ') event.preventDefault()
  if (event.key === ' ' && !event.repeat) {
    if (swing === 0) swing = 12
  }
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

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
const box = (body) => ({ x: body.x, y: body.y, w: SIZE, h: SIZE })

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
  const sword = swing > 0 ? swordBox() : null

  for (const e of enemies) {
    if (e.knock > 0) {
      // Knocked back: slide away from the sword for a few frames.
      e.knock -= 1
      move(e, e.kx, e.ky)
    }
    if (sword && e.knock === 0 && overlap(sword, box(e))) {
      e.hp -= 1
      e.knock = 10
      e.kx = player.dir[0] * 4
      e.ky = player.dir[1] * 4
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
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

  for (const e of enemies) {
    ctx.fillStyle = e.knock > 0 ? '#fca5a5' : '#7c3aed'
    ctx.fillRect(e.x, e.y, SIZE, SIZE)
  }
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
