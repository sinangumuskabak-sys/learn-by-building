---
title: Eat the pellets
title_tr: Yemleri ye
skills: [game.state, game.collision]
---

# --goal--

When a step ends, the mover **arrives** on a tile. `arrive` removes the pellet there (10 points) or the power pellet
(50 points). `delete` tells whether something was removed, so a tile scores only the first time.

# --goal-tr--

Yeme zamanı! Bir adım bitince hareket eden bir döşemeye **varmış** olur. Tam o an `arrive` (var) çağrılacak ve
oradaki yemi kümeden çıkaracak: yem 10 puan, güç yemi 50 puan.

Skor ve bölüm için iki değişken de ekliyoruz: `score` (skor) ve `level` (bölüm). `reset` onları 0 ve 1 yapar.

# --code--

```js
let score
let level

  score = 0
  level = 1

  e.row += e.dir[1]
  arrive(e)
}

function arrive(e) {
  if (e !== player) return
  const here = key(player.col, player.row)
  if (pellets.delete(here)) score += 10
  if (powers.delete(here)) score += 50
}
```

# --meaning--

- `advance` calls `arrive` right after the tile changes.
- Only the player eats: ghosts will use `advance` too.
- `Set.delete` returns `true` if the key was there (and removes it), `false` if not: eating and "was there a pellet?"
  in one call.

# --meaning-tr--

- `let score`, `let level` → skor ve bölüm; `reset` içinde 0 ve 1.
- `arrive(e)` → `advance` içinde, döşeme değiştikten hemen **sonra**: "yeni döşemeye vardın".
- `if (e !== player) return` → yalnız **oyuncu** yer. (Hayaletler de `advance` kullanacak.) `!==` "aynı şey değil".
- `const here = key(player.col, player.row)` → varılan döşemenin adı.
- `pellets.delete(here)` → kümeden çıkarır **ve** bir şey çıktıysa `true`, yoksa `false` döndürür. Böylece "yem var
  mıydı?" sorusu ile "ye" işi tek çağrıda: `true` ise 10 puan. Aynı döşemeye tekrar gelince `false` döner, puan
  gelmez.

# --task--

1. Under `let player` write `let score` and `let level`; in `reset`, set them to 0 and 1 above `fillPellets()`.
2. At the end of `advance` call `arrive(e)`, and under `advance` write `arrive`.

# --task-tr--

1. `let player` satırının **altına** `let score` ve `let level` yaz.
2. `reset` içinde `fillPellets()` satırının **üstüne** `score = 0` ve `level = 1` yaz.
3. `advance` içinde son satırın (`e.row += e.dir[1]`) **altına** `arrive(e)` yaz.
4. `advance`'in altına bir boş satır bırakıp `arrive` fonksiyonunu yaz.
5. **Çalıştır** ve dolaş: yemler yendikçe kaybolmalı.

# --tests--

Walking over a pellet should eat it once.
tr: Bir yemin üstünden yürümek onu bir kez yemeli.

```js
$.press('ArrowLeft')
$.tick(8)
assert.strictEqual(score, 10)
assert.strictEqual(pellets.size, 145)
assert.isFalse(pellets.has('8,15'))
$.press('ArrowRight')
$.tick(16)
assert.strictEqual(score, 20, 'walking back over (8, 15) scores nothing, (10, 15) scores 10')
$.tick(1)
assert.lengthOf($.rects('#fde68a'), 144)
```

A power pellet should be worth 50.
tr: Bir güç yemi 50 değerinde olmalı.

```js
player = { col: 2, row: 15, dir: [-1, 0], want: [-1, 0], progress: 0, frames: 8 }
$.tick(8)
assert.strictEqual(score, 50)
assert.strictEqual(powers.size, 3)
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

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
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
}

function choosePlayer(p) {
  // The wanted direction is remembered, so a turn pressed early happens at the next corner.
  if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
  else if (!canGo(p, p.dir)) p.dir = STOP
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
