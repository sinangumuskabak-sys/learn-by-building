---
title: The ghost walks
title_tr: Hayalet yürür
skills: [game.loop, game.state]
---

# --goal--

Every frame, after the player, `advance` each ghost with `chooseGhost`. One catch: if the player's move just cleared
the maze, everyone was placed again, so the ghosts skip that frame.

# --goal-tr--

Şimdi hayaleti gerçekten yürütelim: her karede, oyuncudan sonra her hayalet için `advance(g, chooseGhost)`. Aynı
hareket kodu, farklı beyin.

Küçük bir ayrıntı: oyuncu bu karede **son yemi** yediyse bölüm atlanır ve herkes baştan yerleştirilir. O karede
hayaletleri yürütmek, yeni yerlerini hemen bozmak olurdu; o yüzden bu karede onları atlıyoruz.

# --code--

```js
function update() {
  const startLevel = level
  advance(player, choosePlayer)
  if (level !== startLevel) return

  for (const g of ghosts) advance(g, chooseGhost)
}
```

# --meaning--

- `startLevel` remembers the level before the player moves; a different level afterwards means a new maze was set up.
- The same `advance` moves the ghosts; only the `choose` function differs.

# --meaning-tr--

- `const startLevel = level` → oyuncu yürümeden önceki bölüm.
- `if (level !== startLevel) return` → oyuncunun adımından sonra bölüm değiştiyse herkes yeni yerine kondu; bu karede
  başka bir şey yapma.
- `for (const g of ghosts) advance(g, chooseGhost)` → her hayaleti bir kare ilerlet. `advance` içindeki `arrive`
  hayaletler için hemen döner (`e !== player`); hayaletler yem yemez.

# --task--

Replace the body of `update` as shown.

# --task-tr--

1. `update` fonksiyonunun içini koddaki gibi değiştir: `advance(player, ...)` satırının üstüne ve altına birer satır,
   bir boş satırdan sonra hayalet döngüsü.
2. **Çalıştır**: kırmızı hayalet labirentte dolaşmaya başlamalı.

# --predict--

The ghost starts on the tile above the house, heading left. Which way can it go first?
- [ ] Up
- [x] Only left
  Above and below are walls, and right would be backwards.
- [ ] Right

# --predict-tr--

Hayalet evin üstündeki döşemede, sola bakarak başlıyor. İlk nereye gidebilir?
- [ ] Yukarı
- [x] Yalnız sola
  Üstü ve altı duvar; sağ ise geri dönüş olurdu.
- [ ] Sağa

# --tests--

The ghost should cross a tile in nine frames.
tr: Hayalet bir döşemeyi dokuz karede geçmeli.

```js
const red = ghosts[0]
$.tick(1)
assert.strictEqual(red.frames, 9)
$.tick(8)
assert.deepEqual([red.col, red.row, red.progress], [8, 7, 0])
```

Ghosts should not eat pellets.
tr: Hayaletler yem yememeli.

```js
const red = ghosts[0]
Object.assign(red, { col: 1, row: 1, dir: [1, 0], progress: 0 })
$.tick(40)
assert.strictEqual(pellets.size, 146)
```

The ghost should never turn back on its own.
tr: Hayalet kendi kendine asla geri dönmemeli.

```js
const red = ghosts[0]
for (let i = 0; i < 600; i++) {
  const before = red.dir
  $.tick(1)
  assert.isFalse(red.dir[0] === -before[0] && red.dir[1] === -before[1] && (before[0] || before[1]), 'turned back')
}
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

// Frames a ghost needs to cross one tile (the player always needs PLAYER_FRAMES): smaller is faster.
function ghostFrames(g) {
  return 9
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

function chooseGhost(g) {
  g.frames = ghostFrames(g)
  // Ghosts never turn back on their own: only the open ways that are not backwards.
  const options = Object.values(DIRECTIONS).filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))
  if (options.length === 0) {
    g.dir = reverse(g.dir)
    return
  }
  g.dir = options[0]
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

  for (const g of ghosts) advance(g, chooseGhost)
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
