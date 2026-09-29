---
title: The fuse burns down
title_tr: Fitil yanar
skills: [game.state, game.loop]
---

# --goal--

Every frame, every fuse gets one shorter. A bomb whose fuse reaches 0 explodes; for now exploding only removes it.

# --goal-tr--

Fitil yanmalı: her karede (frame) her bombanın `fuse`'u **bir azalır**. Sıfıra ya da altına inen bomba **patlar**.

Patlamanın kendisini adım adım kuracağız. Bu adımda `explode` (patla) yalnız bombayı listeden siliyor: bomba 2.5
saniye sonra kaybolacak.

# --code--

```js
function explode(bomb) {
  bombs = bombs.filter((b) => b !== bomb)
}

  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
```

# --meaning--

- `b.fuse -= 1` takes one frame off each fuse.
- `bombs.filter((b) => b.fuse <= 0)` makes a list of the bombs whose time is up; each of them explodes.
- `explode` keeps every bomb except this one: `!==` means "is not the same".

# --meaning-tr--

- `for (const b of bombs) b.fuse -= 1` → her bombanın fitilinden bir kare düş (`-=` "şu kadar azalt").
- `bombs.filter((b) => b.fuse <= 0)` → fitili bitmiş bombaların **ayrı bir listesi**. Önce ayrı listeye alıyoruz,
  çünkü `explode` asıl listeyi değiştiriyor; üzerinde gezdiğimiz liste döngü sırasında değişmesin.
- `for (const bomb of ...) explode(bomb)` → her biri patlar.
- `bombs = bombs.filter((b) => b !== bomb)` → patlayan bomba **dışındakileri** tutar, yani onu siler. `!==` "aynısı
  değil".

# --task--

1. Above `function update() {` write `explode`.
2. In `update`, under `updatePlayer()`, write the two fuse lines.

# --task-tr--

1. `function update() {` satırının **üstüne** `explode` fonksiyonunu yaz.
2. `update` içinde `updatePlayer()` satırının altına iki fitil satırını yaz.
3. **Çalıştır**, bomba bırak ve say: yaklaşık 2.5 saniye sonra kaybolmalı.

# --tests--

A bomb should last exactly `FUSE` frames.
tr: Bir bomba tam `FUSE` kare durmalı.

```js
$.press(' ')
$.tick(FUSE - 1)
assert.lengthOf(bombs, 1)
assert.strictEqual(bombs[0].fuse, 1)
$.tick()
assert.lengthOf(bombs, 0, 'boom')
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
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let bombs // { r, c, fuse }
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
