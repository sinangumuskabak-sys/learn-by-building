---
title: A cross of flames
title_tr: Artı biçiminde alev
skills: [prog.loops]
---

# --goal--

The explosion is a **cross**: from the bomb's tile, `power` tiles in each of the four directions. Each arm walks out
tile by tile; a wall stops it.

# --goal-tr--

Patlama bir **artıdır** (+): bombanın karesinden dört yönün her birine `power` (güç) kare. Her kol kare kare dışarı
yürür; bir **duvara** gelince durur, duvarın içine alev girmez.

Dört yönü yeniden yazmamıza gerek yok: ok tuşları için yaptığımız `DIRS` tablosunun **değerleri** zaten dört yön.

# --code--

```js
let power

  power = 2

  for (const [dr, dc] of Object.values(DIRS)) {
    for (let i = 1; i <= power; i++) {
      const r = bomb.r + dr * i
      const c = bomb.c + dc * i
      if (grid[r][c] === '#') break
      flames.push({ r, c, time: FLAME_TIME })
    }
  }
```

# --meaning--

- `Object.values(DIRS)` is the list of the four steps: `[[-1, 0], [1, 0], [0, -1], [0, 1]]`.
- The inner loop goes 1, 2, ... `power` tiles out along one direction.
- `break` leaves the inner loop only: that arm ends and the next direction starts.
- `{ r, c, time: ... }` is short for `{ r: r, c: c, time: ... }`.

# --meaning-tr--

- `let power` → alevin menzili; `reset` içinde 2.
- `Object.values(DIRS)` → bir nesnenin yalnız **değerlerini** liste olarak verir: `[[-1, 0], [1, 0], [0, -1], [0, 1]]`.
- `for (const [dr, dc] of ...)` → her yön için; iki sayıyı `dr` (satır adımı) ve `dc` (sütun adımı) adlarına açar.
- `for (let i = 1; i <= power; i++)` → o yönde 1., 2., ... `power`. kare.
- `const r = bomb.r + dr * i` → bombadan o yönde `i` kare ötesi.
- `if (grid[r][c] === '#') break` → duvarsa `break`: **içteki** döngüden çıkar. O kol biter, sıradaki yöne geçilir.
- `flames.push({ r, c, time: FLAME_TIME })` → o kare yanar. `{ r, c }` yazmak `{ r: r, c: c }` demenin kısası.

# --task--

1. Under `let maxBombs` write `let power`; in `reset`, under `maxBombs = 1`, write `power = 2`.
2. At the end of `explode`, under the first flame, write the two loops.

# --task-tr--

1. `let maxBombs` satırının altına `let power` yaz.
2. `reset` içinde `maxBombs = 1` satırının altına `power = 2` yaz.
3. `explode`'un **sonuna**, ilk `flames.push` satırının altına iki döngüyü yaz.
4. **Çalıştır** ve bomba bırak: artı biçiminde bir patlama görmelisin. (Henüz kasaların içinden geçiyor.)

# --hint--

`break` must come before the `push`, so no flame is added on the wall itself.

# --hint-tr--

`break` satırı `push`'tan **önce** gelmeli; yoksa duvarın kendisine de alev eklenir.

# --try--

Set `power = 5` in `reset` and drop a bomb in a long corridor. Put 2 back.

# --try-tr--

`reset` içinde `power = 5` yap ve uzun bir koridora bomba bırak. Sonra 2'ye geri al.

# --tests--

A bomb should go off in a cross of `power` tiles, stopped by the walls.
tr: Bomba, duvarların durdurduğu `power` karelik bir artı biçiminde patlamalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  $.press(' ')
  $.tick(FUSE)
  const tiles = flames.map((f) => f.r + ',' + f.c)
  assert.sameMembers(tiles, ['1,1', '1,2', '1,3', '2,1', '3,1'], 'a cross of power 2, stopped by the walls')
```

A bigger `power` should reach further.
tr: Daha büyük `power` daha uzağa ulaşmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  power = 3
  bombs.push({ r: 5, c: 5, fuse: 1 })
  $.tick()
  assert.sameMembers(flames.map((f) => f.r + ',' + f.c), ['5,5', '4,5', '3,5', '2,5', '6,5', '7,5', '8,5', '5,4', '5,3', '5,2', '5,6', '5,7', '5,8'])
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time
const SPEED = 0.1 // tiles per frame
const FUSE = 150 // frames until a bomb goes off
const FLAME_TIME = 30
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let bombs // { r, c, fuse }
let flames // { r, c, time }
let held // arrow keys being held, the last one pressed at the end
let maxBombs
let power

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

const bombAt = (r, c) => bombs.find((b) => b.r === r && b.c === c)
const walkable = (r, c) => grid[r][c] === ' ' && !bombAt(r, c)
const tileOf = (m) => ({ r: Math.round(m.y), c: Math.round(m.x) })

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
  bombs = []
  flames = []
  held = []
  maxBombs = 1
  power = 2
}

// Step a mover towards its target tile, and drop the target once it is there.
function moveTo(m, speed) {
  const dx = m.target.c - m.x
  const dy = m.target.r - m.y
  if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {
    m.x = m.target.c
    m.y = m.target.r
    m.target = null
    return
  }
  m.x += Math.sign(dx) * speed
  m.y += Math.sign(dy) * speed
}

// On a tile, the last arrow key held picks the next tile; then the player keeps sliding towards it.
function updatePlayer() {
  const dir = DIRS[held[held.length - 1]]
  if (!player.target && dir && walkable(player.y + dir[0], player.x + dir[1])) {
    player.target = { r: player.y + dir[0], c: player.x + dir[1] }
  }
  if (player.target) moveTo(player, SPEED)
}

function dropBomb() {
  if (bombs.length >= maxBombs) return
  const t = tileOf(player)
  if (bombAt(t.r, t.c)) return
  bombs.push({ r: t.r, c: t.c, fuse: FUSE })
}

function explode(bomb) {
  bombs = bombs.filter((b) => b !== bomb)
  flames.push({ r: bomb.r, c: bomb.c, time: FLAME_TIME })
  for (const [dr, dc] of Object.values(DIRS)) {
    for (let i = 1; i <= power; i++) {
      const r = bomb.r + dr * i
      const c = bomb.c + dc * i
      if (grid[r][c] === '#') break
      flames.push({ r, c, time: FLAME_TIME })
    }
  }
}

function update() {
  updatePlayer()
  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
  for (const f of flames) f.time -= 1
  flames = flames.filter((f) => f.time > 0)
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  } else if (event.key === ' ') {
    event.preventDefault()
    dropBomb()
  }
})

document.addEventListener('keyup', (event) => {
  held = held.filter((k) => k !== event.key)
})

function drawCircle(m, color, radius) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(m.x * TILE + TILE / 2, TOP + m.y * TILE + TILE / 2, radius, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
    }
  }
  for (const f of flames) {
    ctx.fillStyle = '#f97316'
    ctx.fillRect(f.c * TILE + 2, TOP + f.r * TILE + 2, TILE - 4, TILE - 4)
    ctx.fillStyle = '#fde047'
    ctx.fillRect(f.c * TILE + 9, TOP + f.r * TILE + 9, TILE - 18, TILE - 18)
  }
  for (const b of bombs) drawCircle({ x: b.c, y: b.r }, '#020617', 12)
  drawCircle(player, '#f8fafc', 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
