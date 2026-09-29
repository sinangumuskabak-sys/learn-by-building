---
title: Glide between tiles
title_tr: Döşemeler arasında kay
skills: [game.canvas]
---

# --goal--

The player still jumps a whole tile every 8 frames. `position` gives where it really is: its tile plus the part of the
step already done, `progress / frames` of a tile in its direction. Drawing at that position makes it glide.

# --goal-tr--

Oyuncu artık yürüyor ama **zıplayarak**: 8 kare yerinde durup birden bir döşeme ileri atlıyor. Çünkü onu hep
döşemesinin ortasına çiziyoruz.

Gerçek yeri: döşemesi **artı** adımın ne kadarının bittiği. 8 karelik adımın 4. karesindeyse yarım döşeme ileride.
`position(e)` bunu hesaplayacak; oyuncuyu oraya çizince **akıcı** kayacak.

# --code--

```js
// Where an actor is drawn: its tile plus how far it has come towards the next one.
function position(e) {
  return { x: e.col + (e.dir[0] * e.progress) / e.frames, y: e.row + (e.dir[1] * e.progress) / e.frames }
}

  const p = position(player)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2)
```

# --meaning--

- `progress / frames` is the part of the step done: 4 / 8 is half a tile.
- Times `dir[0]` it goes the right way (and is 0 when not moving that way).
- `x` and `y` are in tiles, with decimals; the drawing multiplies them by `TILE` as before.

# --meaning-tr--

- `(e.dir[0] * e.progress) / e.frames` → adımın biten kısmı, yön kadar: sola giderken 4. karede `-1 * 4 / 8` = `-0.5`.
  O eksende hareket yoksa `dir[0]` 0'dır, sonuç da 0.
- `x: e.col + ...` → döşeme numarası artı biten kısım: `9 + (-0.5)` = `8.5`. Sonuç **ondalıklı** bir döşeme konumu.
- Çizimde `player.col` yerine `p.x`, `player.row` yerine `p.y`: gerisi aynı hesap.

# --task--

1. Above the `// One frame of movement.` comment, write the comment and `position`.
2. In `draw`, write `const p = position(player)` above the player's color, and use `p.x` and `p.y` in the `arc` line.

# --task-tr--

1. `// One frame of movement. ...` yorum satırının **üstüne** yorumu ve `position` fonksiyonunu yaz; altında bir boş
   satır kalsın.
2. `draw` içinde oyuncunun `ctx.fillStyle = '#facc15'` satırının **üstüne** `const p = position(player)` yaz.
3. `ctx.arc(...)` satırında `player.col` yerine `p.x`, `player.row` yerine `p.y` yaz.
4. **Çalıştır** ve dolaş: oyuncu artık akıcı kaymalı.

# --tests--

The player should be drawn part of the way to the next tile.
tr: Oyuncu bir sonraki döşemeye giden yolun bir kısmında çizilmeli.

```js
$.press('ArrowLeft')
$.tick(4)
assert.strictEqual(player.col, 9)
assert.deepEqual(position(player), { x: 8.5, y: 15 })
const me = $.arcs().filter((a) => a.color === '#facc15')[0]
assert.deepEqual([me.x, me.y], [216, 412])
```

A player standing still should be drawn on its tile.
tr: Duran oyuncu kendi döşemesinde çizilmeli.

```js
assert.deepEqual(position(player), { x: 9, y: 15 })
$.tick(1)
const me = $.arcs().filter((a) => a.color === '#facc15')[0]
assert.deepEqual([me.x, me.y], [228, 412])
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

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player

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

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
}

function reset() {
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
}

function choosePlayer(p) {
  // The wanted direction is remembered, so a turn pressed early happens at the next corner.
  if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
  else if (!canGo(p, p.dir)) p.dir = STOP
}

function steer(dir) {
  player.want = dir
}

document.addEventListener('keydown', (event) => {
  const dir = DIRECTIONS[event.key]
  if (dir) {
    event.preventDefault()
    steer(dir)
  }
})

function update() {
  advance(player, choosePlayer)
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

  const p = position(player)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
