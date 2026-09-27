---
title: Gliding from tile to tile
title_tr: Döşemeden döşemeye kaymak
skills: [game.input, game.state]
---

# --explanation--

The player moves on the grid, but it should **glide**, not jump. So besides its tile (`col`, `row`) and direction
`dir`, it has a `progress`: how many frames of the current step have passed. Crossing a tile takes `PLAYER_FRAMES = 8`
frames, and the player is drawn part of the way there:

```js
x = col + dir[0] * progress / frames
```

When `progress` reaches `frames`, the player **arrives**: `col`/`row` move one tile and `progress` starts again at `0`.

Directions are only decided at the **center of a tile** (`progress === 0`). That is what keeps everything lined up with
the corridors. The arrow key does not change the direction directly; it sets `want`, the direction the player would
like. At the next tile center: if `want` is open, turn; otherwise keep going if possible, or stop at the wall. Because
`want` is remembered, you can press "up" a little **before** a corner and the turn happens exactly at the corner. This
is called input buffering, and it is a big part of why maze games feel responsive.

Row 9 has open ends: a **tunnel**. Wrapping the column with `(col + COLS) % COLS` makes the left end lead to the right
end.

# --explanation-tr--

Oyuncu ızgarada hareket eder ama zıplamamalı, **kaymalı**. Bu yüzden döşemesi (`col`, `row`) ve yönü `dir` dışında bir de
`progress`'i vardır: şu anki adımın kaç karesi geçti. Bir döşemeyi geçmek `PLAYER_FRAMES = 8` kare sürer ve oyuncu yolun bir
kısmında çizilir:

```js
x = col + dir[0] * progress / frames
```

`progress` `frames`'e ulaşınca oyuncu **varır**: `col`/`row` bir döşeme ilerler ve `progress` yeniden `0`'dan başlar.

Yönlere yalnızca **döşemenin ortasında** (`progress === 0`) karar verilir. Her şeyi koridorlarla hizalı tutan budur. Ok tuşu
yönü doğrudan değiştirmez; oyuncunun gitmek istediği yön olan `want`'ı ayarlar. Bir sonraki döşeme ortasında: `want` açıksa
dön; değilse mümkünse devam et ya da duvarda dur. `want` hatırlandığı için "yukarı"ya bir köşeden biraz **önce** basabilirsin
ve dönüş tam köşede olur. Buna girdi tamponlama denir ve labirent oyunlarının neden hızlı tepki veriyormuş gibi
hissettirdiğinin büyük bir parçasıdır.

9. satırın uçları açık: bir **tünel**. Sütunu `(col + COLS) % COLS` ile sarmak sol ucun sağ uca çıkmasını sağlar.

# --task--

1. Add `DIRECTIONS` (arrow key to `[dx, dy]`, in the order up, left, down, right), `STOP = [0, 0]` and
   `PLAYER_FRAMES = 8`. The player gets `dir: STOP`, `want: STOP`, `progress: 0` and `frames: PLAYER_FRAMES`.
2. Write `wrap(col)`, `isWall(col, row)` (a `#` or `-`, using the wrapped column), `canGo(e, dir)` and `same(a, b)` for
   comparing directions.
3. Write `position(e)` (see above) and `advance(e, choose)`: at `progress === 0` call `choose(e)`; if the direction is not
   `STOP`, add 1 to `progress`, and when it reaches `e.frames`, set it to `0` and move `col` (wrapped) and `row` one step.
4. Write `choosePlayer(p)`: turn to `want` if it is not `STOP` and open; otherwise stop if the current direction is
   blocked. On an arrow key, `preventDefault()` and set `player.want`. Every frame, `advance(player, choosePlayer)` and draw
   the player at its `position`.

# --task-tr--

1. `DIRECTIONS` (ok tuşundan `[dx, dy]`'ye; sıra yukarı, sol, aşağı, sağ), `STOP = [0, 0]` ve `PLAYER_FRAMES = 8` ekle.
   Oyuncu `dir: STOP`, `want: STOP`, `progress: 0` ve `frames: PLAYER_FRAMES` alır.
2. `wrap(col)`, `isWall(col, row)` (sarılmış sütunla bir `#` ya da `-`), `canGo(e, dir)` ve yönleri karşılaştırmak için
   `same(a, b)` yaz.
3. `position(e)` (yukarıya bak) ve `advance(e, choose)` yaz: `progress === 0` iken `choose(e)` çağır; yön `STOP` değilse
   `progress`'e 1 ekle ve `e.frames`'e ulaşınca onu `0` yap, `col`'u (sarılmış) ve `row`'u bir adım taşı.
4. `choosePlayer(p)` yaz: `want` `STOP` değilse ve açıksa ona dön; değilse şu anki yön kapalıysa dur. Bir ok tuşunda
   `preventDefault()` yap ve `player.want`'ı ayarla. Her karede `advance(player, choosePlayer)` yap ve oyuncuyu
   `position`'ında çiz.

# --tests--

The player should glide one tile in eight frames.
tr: Oyuncu sekiz karede bir döşeme kaymalı.

```js
$.press('ArrowLeft')
$.tick(4)
assert.strictEqual(player.col, 9)
assert.deepEqual(position(player), { x: 8.5, y: 15 })
const me = $.arcs().filter((a) => a.color === '#facc15')[0]
assert.deepEqual([me.x, me.y], [216, 412])
$.tick(4)
assert.strictEqual(player.col, 8)
assert.strictEqual(player.progress, 0)
```

A turn pressed before a corner should happen at the corner.
tr: Köşeden önce basılan dönüş köşede olmalı.

```js
$.press('ArrowLeft')
$.tick(4)
$.press('ArrowUp') // there is a wall above (9, 15), but not above (8, 15)
$.tick(4)
assert.deepEqual([player.col, player.row], [8, 15])
$.tick(8)
assert.deepEqual([player.col, player.row], [8, 14])
assert.deepEqual(player.dir, [0, -1])
```

The player should stop at a wall.
tr: Oyuncu bir duvarda durmalı.

```js
$.press('ArrowRight')
$.tick(80)
assert.deepEqual([player.col, player.row], [14, 15])
assert.deepEqual(player.dir, [0, 0])
$.press('ArrowRight') // still a wall: nothing happens
$.tick(8)
assert.deepEqual([player.col, player.row], [14, 15])
```

The tunnel should lead from one side to the other.
tr: Tünel bir taraftan öbür tarafa çıkarmalı.

```js
assert.isFalse(isWall(-1, 9))
assert.isTrue(isWall(0, 0))
assert.isTrue(isWall(9, 8), 'the ghost house is a wall for the player')
player = { col: 1, row: 9, dir: [-1, 0], want: [-1, 0], progress: 0, frames: 8 }
$.tick(16)
assert.deepEqual([player.col, player.row], [18, 9])
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
