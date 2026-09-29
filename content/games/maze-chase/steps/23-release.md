---
title: One by one out of the house
title_tr: Evden birer birer
skills: [game.state, game.loop]
---

# --goal--

A waiting ghost counts its `waiting` down by one every frame instead of moving, and is released when it reaches 0. So
pink comes out after 2 seconds, orange after 5 and cyan after 8.

# --goal-tr--

Evdeki hayaletler her karede `waiting`'lerini **bir azaltsın**; 0'a inince evden çıksınlar. Saniyede 60 kare
olduğuna göre pembe 2, turuncu 5, camgöbeği 8 saniye sonra çıkacak. Böylece labirentin başı sakin, sonra gittikçe
kalabalık.

# --code--

```js
  for (const g of ghosts) {
    if (g.waiting > 0) {
      g.waiting -= 1
      if (g.waiting === 0) release(g)
      continue
    }
    advance(g, chooseGhost)
  }
```

# --meaning--

- A waiting ghost counts down and `continue` skips the rest of the loop for it: it does not move this frame.
- On the frame the count reaches 0, `release` puts it on the exit.

# --meaning-tr--

- `if (g.waiting > 0) {` → hayalet hâlâ bekliyorsa:
  - `g.waiting -= 1` → bir kare daha geçti.
  - `if (g.waiting === 0) release(g)` → süre dolduysa evden çıkar.
  - `continue` → döngünün **bu hayalet için** kalanını atla: bu karede yürümez.
- Beklemeyen hayaletler eskisi gibi `advance` ile yürür.

# --task--

In `update`, replace the one-line ghost loop with the new loop.

# --task-tr--

1. `update` içinde tek satırlık `for (const g of ghosts) advance(g, chooseGhost)` satırını sil; yerine yeni döngüyü
   yaz.
2. **Çalıştır** ve izle: hayaletler birer birer evden çıkmalı.

# --predict--

After how many seconds does the cyan ghost come out? (`delay: 480`, 60 frames a second.)
- [ ] 4.8
- [x] 8
  480 ÷ 60 = 8.
- [ ] 480

# --predict-tr--

Camgöbeği hayalet kaç saniye sonra çıkar? (`delay: 480`, saniyede 60 kare.)
- [ ] 4,8
- [x] 8
  480 ÷ 60 = 8.
- [ ] 480

# --tests--

Ghosts should leave the house one by one.
tr: Hayaletler evden birer birer çıkmalı.

```js
const [red, pink, orange, cyan] = ghosts
assert.deepEqual([red.col, red.row], [9, 7])
$.tick(119)
assert.strictEqual(pink.row, 9)
$.tick(1)
assert.deepEqual([pink.col, pink.row], [9, 7])
assert.strictEqual(orange.row, 9)
$.tick(360)
assert.strictEqual(cyan.waiting, 0)
assert.notStrictEqual(orange.row, 9)
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
const GHOSTS = [
  { name: 'red', color: '#ef4444', corner: { col: 18, row: 0 }, delay: 0 },
  { name: 'pink', color: '#f9a8d4', corner: { col: 0, row: 0 }, delay: 120 },
  { name: 'orange', color: '#fb923c', corner: { col: 0, row: 20 }, delay: 300 },
  { name: 'cyan', color: '#22d3ee', corner: { col: 18, row: 20 }, delay: 480 },
]

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

// Frames a ghost needs to cross one tile (the player always needs PLAYER_FRAMES): smaller is faster.
function ghostFrames(g) {
  return 9
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
  ghosts = GHOSTS.map((g, i) => ({ ...g, col: 8 + (i % 3), row: 9, dir: STOP, progress: 0, frames: 10, waiting: g.delay }))
  for (const g of ghosts) if (g.waiting === 0) release(g)
}

// Out of the house: the ghost starts on the tile above it, heading left.
function release(g) {
  Object.assign(g, { col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0 })
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

function target(g) {
  return player
}

function chooseGhost(g) {
  g.frames = ghostFrames(g)
  // Ghosts never turn back on their own: only the open ways that are not backwards.
  const options = Object.values(DIRECTIONS).filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))
  if (options.length === 0) {
    g.dir = reverse(g.dir)
    return
  }
  const t = target(g)
  const distance = (d) => (g.col + d[0] - t.col) ** 2 + (g.row + d[1] - t.row) ** 2
  g.dir = options.reduce((bestDir, d) => (distance(d) < distance(bestDir) ? d : bestDir))
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
  const startLevel = level
  advance(player, choosePlayer)
  if (level !== startLevel) return

  for (const g of ghosts) {
    if (g.waiting > 0) {
      g.waiting -= 1
      if (g.waiting === 0) release(g)
      continue
    }
    advance(g, chooseGhost)
  }
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
