---
title: The ghost hunts you
title_tr: Hayalet seni avlar
skills: [game.state, prog.arrays]
---

# --goal--

The famous ghost brain is simple: of the allowed directions, take the one whose next tile is **closest to a target**,
in a straight line. There is no path-finding: the ghost can take a wrong turn, and that is why you can outsmart it.
For now the target is the player.

# --goal-tr--

Şimdi hayalete akıl verelim. Orijinal atari oyunundaki hayalet beyni şaşırtıcı derecede basit:

1. İzin verilen yönleri listele (geri dönüş hariç, bunu zaten yaptık).
2. Hangisinin bir sonraki döşemesi **hedefe kuş uçuşu en yakınsa** onu seç.

Yol bulma (harita üstünde en kısa yolu hesaplama) **yok**. Hayalet bazen yanlış yola sapar; bu onu canlı gösterir ve
sen onu atlatabilirsin. Şimdilik hedef: **oyuncu**.

# --code--

```js
function target(g) {
  return player
}

  const t = target(g)
  const distance = (d) => (g.col + d[0] - t.col) ** 2 + (g.row + d[1] - t.row) ** 2
  g.dir = options.reduce((bestDir, d) => (distance(d) < distance(bestDir) ? d : bestDir))
```

# --meaning--

- `distance(d)` is the squared straight-line distance from the next tile in direction `d` to the target. Squares are
  enough for comparing and avoid `Math.sqrt`. `**` is "to the power of".
- `reduce` walks the list keeping one "best so far": each option replaces it only if it is strictly closer, so ties
  go to the earlier one (up, left, down, right).

# --meaning-tr--

- `function target(g)` → hayaletin **hedefi**. Şimdilik hep oyuncu; ileride her hayalete farklı bir hedef vereceğiz.
- `const distance = (d) => ...` → `d` yönündeki sonraki döşemenin hedefe uzaklığının **karesi** (Pisagor: `x² + y²`).
  `**` üs alma: `3 ** 2` → 9. Karşılaştırmak için kareler yeter; karekök (`Math.sqrt`) almaya gerek yok, çünkü küçük
  olanın karesi de küçüktür.
- `options.reduce((bestDir, d) => ...)` → `reduce` listeyi gezerken elinde bir "şimdiye kadarki en iyi"yi taşır. İlk
  eleman başlangıçtır; sonraki her `d`, ancak **kesinlikle daha yakınsa** (`<`) onun yerini alır.
- Eşitlikte önce gelen kalır; `DIRECTIONS`'ın sırası (yukarı, sol, aşağı, sağ) burada işe yarar.

# --task--

1. Above `chooseGhost`, write `target`.
2. In `chooseGhost`, replace `g.dir = options[0]` with the three new lines.

# --task-tr--

1. `function chooseGhost(g) {` satırının **üstüne** `target` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `chooseGhost` içinde son satırı (`g.dir = options[0]`) sil; yerine üç yeni satırı yaz.
3. **Çalıştır** ve kaç! Kırmızı hayalet artık peşinde.

# --predict--

The ghost comes down into a crossing, and you are straight above it. Which way does it go?
- [ ] Up, towards you
- [x] Left or right: up is backwards, so it is not allowed
  Of the two, which tie, left wins because it comes first in `DIRECTIONS`.
- [ ] It stops

# --predict-tr--

Hayalet aşağı inerek bir kavşağa geliyor ve sen tam onun yukarısındasın. Hangi yöne gider?
- [ ] Yukarı, sana doğru
- [x] Sola ya da sağa: yukarı geri dönüş olduğu için yasak
  İkisi eşit uzaklıkta; `DIRECTIONS`'ta önce geldiği için sol kazanır.
- [ ] Durur

# --tests--

At a crossing the ghost should take the way closest to its target, but never turn back.
tr: Kavşakta hayalet hedefine en yakın yolu seçmeli ama asla geri dönmemeli.

```js
const red = ghosts[0]
Object.assign(red, { col: 4, row: 9, dir: [0, 1], progress: 0 }) // came down into the crossing at (4, 9)
chooseGhost(red)
assert.deepEqual(red.dir, [0, 1], 'down is closest to the player at (9, 15)')
Object.assign(player, { col: 4, row: 3 })
red.dir = [0, 1]
chooseGhost(red)
assert.deepEqual(red.dir, [-1, 0], 'up would be closest, but that is back: left and right tie, left wins')
```

The ghost should find a player who stands still.
tr: Hayalet duran bir oyuncuyu bulmalı.

```js
const red = ghosts[0]
let reached = false
for (let i = 0; i < 1500 && !reached; i++) {
  $.tick(1)
  reached = red.col === player.col && red.row === player.row
}
assert.isTrue(reached)
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
