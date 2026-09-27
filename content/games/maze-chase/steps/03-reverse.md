---
title: Instant reverse and swipes
title_tr: Anında geri dönüş ve kaydırmalar
skills: [game.input]
---

# --explanation--

Waiting for the next tile center is right for turning into a side corridor, but wrong for turning **back**. If a ghost
appears ahead, the player needs to reverse now, not after finishing the step. And reversing mid-step is always possible:
the way back is the way you just came.

The trick is to look at it from the other tile. A player 3 frames into a step from tile 9 to tile 8 is also 5 frames
into a step from tile 8 back to tile 9. So reversing is: move `col` to the tile you were heading to, flip `dir`, and set
`progress` to `frames - progress`. The drawn position does not change at all, so there is no jump, only an instant
change of direction.

On a phone, a **swipe** sets `want` the same way an arrow key does. A tiny movement is ignored, so a tap does not turn the
player by accident.

# --explanation-tr--

Bir sonraki döşeme ortasını beklemek yan koridora dönmek için doğrudur ama **geri** dönmek için yanlıştır. Önde bir hayalet
belirirse oyuncunun adımı bitirdikten sonra değil, hemen geri dönmesi gerekir. Ve adımın ortasında geri dönmek her zaman
mümkündür: geri giden yol az önce geldiğin yoldur.

Püf noktası ona öbür döşemeden bakmaktır. 9. döşemeden 8. döşemeye adımının 3. karesindeki bir oyuncu, aynı zamanda 8.
döşemeden 9. döşemeye geri adımının 5. karesindedir. Yani geri dönmek: `col`'u gittiğin döşemeye taşı, `dir`'i ters çevir ve
`progress`'i `frames - progress` yap. Çizilen konum hiç değişmez; zıplama olmaz, yalnızca yön anında değişir.

Telefonda bir **kaydırma** `want`'ı bir ok tuşuyla aynı biçimde ayarlar. Çok küçük bir hareket yok sayılır; böylece bir
dokunuş oyuncuyu yanlışlıkla döndürmez.

# --task--

1. Add `reverse(dir)` and write `turnAround(e)`: at a tile center (or when stopped) just flip `dir`; otherwise move
   `col` (wrapped) and `row` one step, flip `dir` and set `progress = frames - progress`.
2. Move the key handling into `steer(dir)`: set `player.want`, and call `turnAround(player)` if `dir` is the reverse of the
   player's direction.
3. Remember where a `pointerdown` on the canvas started. On `pointerup`, ignore movements under 20 pixels; otherwise
   `steer` along the longer axis.

# --task-tr--

1. `reverse(dir)` ekle ve `turnAround(e)` yaz: döşeme ortasında (ya da dururken) yalnızca `dir`'i ters çevir; değilse
   `col`'u (sarılmış) ve `row`'u bir adım taşı, `dir`'i ters çevir ve `progress = frames - progress` yap.
2. Tuş işlemeyi `steer(dir)`'e taşı: `player.want`'ı ayarla ve `dir` oyuncunun yönünün tersiyse `turnAround(player)`
   çağır.
3. Canvas'ta bir `pointerdown`'ın nerede başladığını hatırla. `pointerup`'ta 20 pikselin altındaki hareketleri yok say;
   değilse uzun eksen boyunca `steer` et.

# --tests--

Reversing mid-step should turn at once without moving the player.
tr: Adımın ortasında geri dönmek oyuncuyu kıpırdatmadan hemen döndürmeli.

```js
$.press('ArrowLeft')
$.tick(3)
assert.deepEqual(position(player), { x: 8.625, y: 15 })
$.press('ArrowRight')
assert.strictEqual(player.dir.join(), '1,0')
assert.strictEqual(player.col, 8)
assert.strictEqual(player.progress, 5)
assert.deepEqual(position(player), { x: 8.625, y: 15 })
$.tick(3)
assert.deepEqual([player.col, player.progress], [9, 0])
```

Reversing should also work through the tunnel.
tr: Geri dönmek tünelde de çalışmalı.

```js
player = { col: 0, row: 9, dir: [-1, 0], want: [-1, 0], progress: 2, frames: 8 }
turnAround(player)
assert.deepEqual([player.col, player.progress], [18, 6])
assert.strictEqual(player.dir.join(), '1,0')
```

A swipe should steer, and a tap should not.
tr: Kaydırma yönlendirmeli, dokunuş yönlendirmemeli.

```js
$.pointerDown(200, 300)
$.pointerUp(205, 304)
assert.deepEqual(player.want, [0, 0], 'a tap is ignored')
$.pointerDown(200, 300)
$.pointerUp(140, 310)
assert.deepEqual(player.want, [-1, 0])
$.tick(8)
assert.strictEqual(player.col, 8)
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
