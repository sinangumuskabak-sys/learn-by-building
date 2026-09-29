---
title: Eat a scared ghost
title_tr: Korkmuş hayaleti ye
skills: [game.collision, game.state]
---

# --goal--

Meeting a scared ghost is good news: it is eaten. You get `chain` points, and `chain` doubles for the next one (200,
400, 800, 1600). The ghost goes back into the house and waits 3 seconds before it comes out again, no longer scared.

# --goal-tr--

Korkmuş bir hayaletle karşılaşmak artık **iyi haber**: onu yersin!

- `chain` kadar puan alırsın, sonra `chain` **iki katına** çıkar. Tek bir güç yemiyle art arda yenen hayaletler 200,
  400, 800, 1600 eder.
- Yenen hayalet eve döner, 3 saniye (180 kare) bekler ve korkusu geçmiş olarak yeniden çıkar.

Korkmamış bir hayalet ise yine seni yakalar.

# --code--

```js
    if (!g.scared) {
      caught()
      return
    }
    // A scared ghost is eaten: points, and back to the house for a while.
    score += chain
    chain *= 2
    Object.assign(g, { col: 9, row: 9, dir: STOP, progress: 0, waiting: 180, scared: false })
```

# --meaning--

- Only an unscared ghost catches you now.
- `chain *= 2` doubles the value for the next ghost; `frighten` puts it back to 200.
- The eaten ghost is placed in the house with `waiting: 180`, so the countdown in `update` releases it later.

# --meaning-tr--

- `if (!g.scared) { caught(); return }` → yakalama artık yalnız **korkmamış** hayalet için.
- `score += chain` → yenen hayaletin puanı.
- `chain *= 2` → `*=` "kendisiyle çarp": 200 → 400. Bir sonraki güç yemi `frighten` ile yine 200'den başlatır.
- `Object.assign(g, { col: 9, row: 9, ..., waiting: 180, scared: false })` → hayalet evin ortasına, 180 kare
  beklemeye. `update`'teki geri sayım onu zamanı gelince `release` ile çıkaracak.
- Burada `return` yok: aynı karede başka bir korkmuş hayaleti de yiyebilirsin.

# --task--

In the catch loop of `update`, put `caught(); return` inside `if (!g.scared) { ... }` and write the eating lines under
it.

# --task-tr--

1. `update`'teki yakalama döngüsünde `caught()` ve `return` satırlarını `if (!g.scared) { ... }` bloğunun içine al.
2. Bloğun altına yorumu ve yeme satırlarını yaz.
3. **Çalıştır**, bir güç yemi ye ve bir hayalete dal: skor 200 artmalı, hayalet eve dönmeli.

# --tests--

Eating scared ghosts one after another should double the points.
tr: Korkmuş hayaletleri art arda yemek puanı ikiye katlamalı.

```js
state = 'playing' // the player stands still on (9, 15)
frighten()
Object.assign(ghosts[0], { col: 9, row: 15, dir: [1, 0], progress: 0 })
$.tick(1)
assert.strictEqual(score, 200)
assert.deepEqual([ghosts[0].col, ghosts[0].row, ghosts[0].waiting], [9, 9, 180])
assert.isFalse(ghosts[0].scared)
Object.assign(ghosts[1], { col: 9, row: 15, dir: [1, 0], progress: 0, waiting: 0, scared: true })
$.tick(1)
assert.strictEqual(score, 600)
assert.strictEqual(chain, 800)
assert.strictEqual(lives, 3)
```

An eaten ghost should come out again after 3 seconds.
tr: Yenen hayalet 3 saniye sonra yeniden çıkmalı.

```js
state = 'playing'
frighten()
Object.assign(ghosts[0], { col: 9, row: 15, dir: [1, 0], progress: 0 })
$.tick(1)
$.tick(179)
assert.deepEqual([ghosts[0].col, ghosts[0].row], [9, 9])
$.tick(1)
assert.deepEqual([ghosts[0].col, ghosts[0].row], [9, 7])
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
const SCATTER = 420 // frames of scatter at the start of every 27-second cycle
const CYCLE = 1620

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player
let ghosts
let score
let lives
let level
let state // 'ready', 'playing' or 'over'
let clock // frames played on this life, for the scatter / chase cycle
let scaredFor // frames the ghosts stay scared
let chain // points for the next ghost eaten

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
  if (g.scared) return 16
  return 9
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
  ghosts = GHOSTS.map((g, i) => ({ ...g, col: 8 + (i % 3), row: 9, dir: STOP, progress: 0, frames: 10, waiting: g.delay, scared: false }))
  for (const g of ghosts) if (g.waiting === 0) release(g)
  clock = 0
  scaredFor = 0
  state = 'ready'
}

// Out of the house: the ghost starts on the tile above it, heading left.
function release(g) {
  Object.assign(g, { col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0 })
}

function reset() {
  score = 0
  lives = 3
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
  if (powers.delete(here)) {
    score += 50
    frighten()
  }
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

function mode() {
  return clock % CYCLE < SCATTER ? 'scatter' : 'chase'
}

function target(g) {
  if (mode() === 'scatter') return g.corner
  if (g.name === 'pink') return { col: player.col + player.dir[0] * 4, row: player.row + player.dir[1] * 4 }
  if (g.name === 'orange') {
    const far = (g.col - player.col) ** 2 + (g.row - player.row) ** 2 > 64
    return far ? player : g.corner
  }
  if (g.name === 'cyan') {
    // Double the arrow from the red ghost to two tiles ahead of the player: it cuts the player off from the other side.
    const red = ghosts[0]
    return { col: 2 * (player.col + player.dir[0] * 2) - red.col, row: 2 * (player.row + player.dir[1] * 2) - red.row }
  }
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
  if (g.scared) {
    g.dir = options[Math.floor(Math.random() * options.length)]
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
  if (state === 'over') return
  state = 'playing'
  player.want = dir
  if (same(dir, reverse(player.dir)) && !same(dir, STOP)) turnAround(player)
}

function frighten() {
  scaredFor = 420
  chain = 200
  for (const g of ghosts) {
    if (g.waiting > 0) continue
    g.scared = true
    turnAround(g)
  }
}

function caught() {
  lives -= 1
  if (lives > 0) {
    placeActors()
    return
  }
  state = 'over'
}

document.addEventListener('keydown', (event) => {
  const dir = DIRECTIONS[event.key]
  if (dir) {
    event.preventDefault()
    steer(dir)
  }
  if (event.key === ' ' && state === 'over') reset()
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
  if (state === 'over') {
    reset()
    return
  }
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
  if (Math.abs(dx) > Math.abs(dy)) steer([Math.sign(dx), 0])
  else steer([0, Math.sign(dy)])
})

function update() {
  if (state !== 'playing') return
  clock += 1
  if (scaredFor > 0) {
    scaredFor -= 1
    if (scaredFor === 0) for (const g of ghosts) g.scared = false
  }

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

  const p = position(player)
  for (const g of ghosts) {
    if (g.waiting > 0) continue
    const q = position(g)
    if (Math.abs(p.x - q.x) + Math.abs(p.y - q.y) > 0.6) continue
    if (!g.scared) {
      caught()
      return
    }
    // A scared ghost is eaten: points, and back to the house for a while.
    score += chain
    chain *= 2
    Object.assign(g, { col: 9, row: 9, dir: STOP, progress: 0, waiting: 180, scared: false })
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
  ctx.fillText('Level ' + level + '   Lives: ' + lives, canvas.width - 10, 27)

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillStyle = '#facc15'
    ctx.fillText('Press an arrow key', canvas.width / 2, TOP + 11 * TILE + 18)
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(11, 16, 32, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
