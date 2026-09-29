---
title: Fire!
title_tr: Ateş!
skills: [game.state, game.canvas]
---

# --goal--

An explosion leaves **flames**: short-lived objects `{ r, c, time }`. The first flame burns on the bomb's own tile,
drawn as an orange square with a yellow heart.

# --goal-tr--

Patlama **alev** bırakır. Her alev küçük bir nesne: hangi karede (`r`, `c`) ve ne kadar yanacağı (`time`,
`FLAME_TIME` = 30 kare, yarım saniye).

İlk alev bombanın **kendi karesinde** yanar. Turuncu bir kare, ortasında sarı bir çekirdek. Bu adımda alevler henüz
sönmeyecek.

# --code--

```js
const FLAME_TIME = 30

let flames // { r, c, time }

  flames = []

  flames.push({ r: bomb.r, c: bomb.c, time: FLAME_TIME })

  for (const f of flames) {
    ctx.fillStyle = '#f97316'
    ctx.fillRect(f.c * TILE + 2, TOP + f.r * TILE + 2, TILE - 4, TILE - 4)
    ctx.fillStyle = '#fde047'
    ctx.fillRect(f.c * TILE + 9, TOP + f.r * TILE + 9, TILE - 18, TILE - 18)
  }
```

# --meaning--

- `explode` adds a flame on the bomb's tile.
- Each flame is drawn as two squares: orange, 2 pixels in from the tile's edge, and yellow, 9 pixels in.
- The flames are drawn after the tiles and before the bombs and the player.

# --meaning-tr--

- `const FLAME_TIME = 30` → bir alevin ömrü: 30 kare. `let flames` → yanan alevler; `reset` içinde boş.
- `flames.push({ r: bomb.r, c: bomb.c, time: FLAME_TIME })` → patlayan bombanın karesine bir alev.
- `f.c * TILE + 2` → karenin sol kenarından 2 piksel içeri; `TILE - 4` → iki yandan 2'şer piksel kısa. Turuncu kare.
- `+ 9` ve `TILE - 18` → 9 piksel içeriden, 14 × 14'lük sarı çekirdek.
- Alevler karelerden **sonra**, bombalardan ve oyuncudan **önce** çizilir.

# --task--

1. Above `DIRS` write `FLAME_TIME`; above `let held` write `let flames`; in `reset`, above `held = []`, write
   `flames = []`.
2. In `explode`, under the `filter` line, write the `push`.
3. In `draw`, above the bombs line, write the flames loop.

# --task-tr--

1. `const DIRS = ...` satırının **üstüne** `FLAME_TIME` satırını yaz.
2. `let held` satırının **üstüne** `let flames` yaz; `reset` içinde `held = []` satırının üstüne `flames = []` yaz.
3. `explode` içinde `filter` satırının altına `flames.push(...)` satırını yaz.
4. `draw` içinde bombaları çizen satırın **üstüne** alev döngüsünü yaz.
5. **Çalıştır**, bomba bırak ve uzaklaş: bomba patlayınca yerinde bir ateş yanmalı.

# --predict--

How long will the flame burn?
- [ ] Half a second
- [x] Forever
  `time` is set, but nothing counts it down yet.
- [ ] It does not show at all

# --predict-tr--

Alev ne kadar yanacak?
- [ ] Yarım saniye
- [x] Sonsuza kadar
  `time` verildi ama onu azaltan bir kod henüz yok.
- [ ] Hiç görünmez

# --tests--

An explosion should leave a flame on the bomb's tile.
tr: Patlama, bombanın karesinde bir alev bırakmalı.

```js
assert.deepEqual(flames, [])
bombs.push({ r: 3, c: 5, fuse: 1 })
$.tick()
assert.deepEqual(flames, [{ r: 3, c: 5, time: FLAME_TIME }])
```

Flames should be drawn orange with a yellow heart.
tr: Alevler sarı çekirdekli turuncu çizilmeli.

```js
flames.push({ r: 3, c: 5, time: 30 })
$.tick()
assert.deepInclude($.rects('#f97316'), { x: 162, y: 130, w: 28, h: 28, color: '#f97316' })
assert.deepInclude($.rects('#fde047'), { x: 169, y: 137, w: 14, h: 14, color: '#fde047' })
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
}

function update() {
  updatePlayer()
  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
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
