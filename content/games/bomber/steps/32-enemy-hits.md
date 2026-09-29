---
title: Fight and touch
title_tr: Vur ve değme
skills: [game.collision]
---

# --goal--

Enemies die in flames, and touching one costs a life. "Touching" is measured between the real positions, not the
tiles: closer than 0.6 of a tile.

# --goal-tr--

Şimdi düşmanlarla savaş: **alevde kalan düşman ölür**, ama bir düşmana **değmek** bir cana mal olur.

"Değmek" kareler arasında değil, **gerçek konumlar** arasında ölçülür: aradaki düz uzaklık 0.6 kareden azsa değmişsin
demektir. Böylece yan karede kayıp giden bir düşmanın yanından sıyrılabilirsin.

# --code--

```js
enemies = enemies.filter((e) => !inFlames(e))

else if (inFlames(player) || enemies.some((e) => Math.hypot(e.x - player.x, e.y - player.y) < 0.6)) hurt()
```

# --meaning--

- `filter` keeps the enemies that are not in flames.
- `Math.hypot(dx, dy)` is the straight distance between two points (Pythagoras).
- Being in flames **or** touching an enemy hurts, still only when not safe.

# --meaning-tr--

- `enemies.filter((e) => !inFlames(e))` → alevde **olmayan** düşmanları tutar; alevdekiler gider.
- `Math.hypot(e.x - player.x, e.y - player.y)` → iki nokta arasındaki **düz uzaklık** (Pisagor: √(dx² + dy²)).
- `enemies.some(... < 0.6)` → 0.6 kareden yakın **en az bir** düşman var mı?
- `inFlames(player) || ...` → alevdeysen **ya da** bir düşmana değiyorsan can kaybet. Hâlâ `else` içinde: güvendeyken
  ikisi de zarar vermez.

# --task--

1. In `update`, under the flames `filter`, write the enemies `filter`.
2. Extend the `else if (inFlames(player))` condition with `|| enemies.some(...)`.

# --task-tr--

1. `update` içinde `flames = flames.filter(...)` satırının altına düşman `filter` satırını yaz.
2. `else if (inFlames(player)) hurt()` satırındaki koşula ` || enemies.some(...)` kısmını ekle.
3. **Çalıştır**: bir düşmanın yoluna bomba koy ve patlat; sonra bir düşmana değ ve can kaybet.

# --tests--

Flames should kill enemies, and touching an enemy should hurt.
tr: Alevler düşmanları öldürmeli; bir düşmana değmek zarar vermeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  enemies = [{ x: 5, y: 1, target: null, dir: [0, 0] }, { x: 9, y: 9, target: null, dir: [0, 0] }]
  flames.push({ r: 1, c: 5, time: 30 })
  $.tick()
  assert.lengthOf(enemies, 1, 'flames kill enemies')
  enemies[0].x = 1.3
  enemies[0].y = 1
  enemies[0].target = null
  $.tick()
  assert.strictEqual(lives, 2, 'touching an enemy hurts')
```

An enemy one tile away should not hurt.
tr: Bir kare ötedeki düşman zarar vermemeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  grid[1][3] = '#'
  enemies = [{ x: 2, y: 1, target: null, dir: [0, 0] }]
  grid[2][2] = '#'
  $.tick()
  assert.strictEqual(lives, 3)
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
const ENEMY_SPEED = 0.05
const FUSE = 150 // frames until a bomb goes off
const FLAME_TIME = 30
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let enemies
let bombs // { r, c, fuse }
let flames // { r, c, time }
let held // arrow keys being held, the last one pressed at the end
let maxBombs
let power
let lives
let safe // frames of invincibility after losing a life
let state // 'playing', 'won' or 'lost'

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
  enemies = ENEMY_STARTS.map(([r, c]) => ({ x: c, y: r, target: null, dir: [0, 0] }))
  bombs = []
  flames = []
  held = []
  maxBombs = 1
  power = 2
  lives = 3
  safe = 0
  state = 'playing'
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
  if (state !== 'playing' || bombs.length >= maxBombs) return
  const t = tileOf(player)
  if (bombAt(t.r, t.c)) return
  bombs.push({ r: t.r, c: t.c, fuse: FUSE })
}

// A cross of flames, `power` tiles each way. Walls stop it; a crate burns and stops it; another bomb goes off too.
function explode(bomb) {
  bombs = bombs.filter((b) => b !== bomb)
  flames.push({ r: bomb.r, c: bomb.c, time: FLAME_TIME })
  for (const [dr, dc] of Object.values(DIRS)) {
    for (let i = 1; i <= power; i++) {
      const r = bomb.r + dr * i
      const c = bomb.c + dc * i
      if (grid[r][c] === '#') break
      flames.push({ r, c, time: FLAME_TIME })
      if (grid[r][c] === '+') {
        grid[r][c] = ' '
        break
      }
      const other = bombAt(r, c)
      if (other) {
        other.fuse = 1 // a chain reaction: it goes off next frame
        break
      }
    }
  }
}

const inFlames = (m) => {
  const t = tileOf(m)
  return flames.some((f) => f.r === t.r && f.c === t.c)
}

// Enemies wander: at each tile they pick a way they can go, and only turn back at a dead end.
function updateEnemy(e) {
  if (!e.target) {
    const options = Object.values(DIRS).filter(([dr, dc]) => walkable(e.y + dr, e.x + dc))
    if (options.length === 0) return
    const forward = options.filter(([dr, dc]) => dr !== -e.dir[0] || dc !== -e.dir[1])
    const pick = forward.length ? forward : options
    e.dir = pick[Math.floor(Math.random() * pick.length)]
    e.target = { r: e.y + e.dir[0], c: e.x + e.dir[1] }
  }
  moveTo(e, ENEMY_SPEED)
}

function hurt() {
  lives -= 1
  if (lives === 0) {
    state = 'lost'
    return
  }
  player = { x: 1, y: 1, target: null }
  safe = 120
}

function update() {
  if (state !== 'playing') return
  updatePlayer()
  for (const e of enemies) updateEnemy(e)
  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
  for (const f of flames) f.time -= 1
  flames = flames.filter((f) => f.time > 0)
  enemies = enemies.filter((e) => !inFlames(e))
  if (safe > 0) safe -= 1
  else if (inFlames(player) || enemies.some((e) => Math.hypot(e.x - player.x, e.y - player.y) < 0.6)) hurt()
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  } else if (event.key === ' ') {
    event.preventDefault()
    dropBomb()
  } else if (event.key === 'Enter' && state !== 'playing') reset()
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
  // Bombs blink faster as the fuse runs out.
  for (const b of bombs) drawCircle({ x: b.c, y: b.r }, b.fuse < 45 && b.fuse % 10 < 5 ? '#dc2626' : '#020617', 12)
  for (const e of enemies) drawCircle(e, '#e11d48', 12)
  if (safe % 10 < 5) drawCircle(player, '#f8fafc', 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('♥'.repeat(lives), 8, 22)
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(40, 150, canvas.width - 80, 90)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('Game over', canvas.width / 2, 190)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Enter to play again', canvas.width / 2, 222)
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
