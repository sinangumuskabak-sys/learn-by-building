---
title: Enemies wander
title_tr: Düşmanlar dolaşır
skills: [game.state]
---

# --goal--

Enemies move like the player, from tile to tile with a target and `moveTo`, only slower. On each tile they list the
ways they can go and pick one at random.

# --goal-tr--

Düşmanlar tıpkı oyuncu gibi yürür: kareden kareye, bir hedef ve `moveTo` ile. Yalnız daha yavaştır ve yollarını
kendileri seçer. Her karede gidebilecekleri yönleri listeler ve **rastgele** birini seçerler.

Bombalar `walkable` için engel olduğundan düşmanlar bombaların da etrafından dolaşır.

# --code--

```js
const ENEMY_SPEED = 0.05

function updateEnemy(e) {
  if (!e.target) {
    const options = Object.values(DIRS).filter(([dr, dc]) => walkable(e.y + dr, e.x + dc))
    if (options.length === 0) return
    e.dir = options[Math.floor(Math.random() * options.length)]
    e.target = { r: e.y + e.dir[0], c: e.x + e.dir[1] }
  }
  moveTo(e, ENEMY_SPEED)
}

  for (const e of enemies) updateEnemy(e)
```

# --meaning--

- `options` keeps the four directions whose next tile is walkable; with none, the enemy waits.
- `Math.floor(Math.random() * options.length)` is a random index: `Math.floor` rounds down, so 0 to length − 1.
- The chosen way becomes `e.dir` and the next tile the target.

# --meaning-tr--

- `const ENEMY_SPEED = 0.05` → düşmanlar oyuncunun yarı hızında.
- `if (!e.target) {` → düşman tam bir karenin üstündeyse (hedefi yoksa) yeni yön seçer:
  - `Object.values(DIRS).filter(...)` → dört yönden, bir sonraki karesi **yürünebilir** olanlar.
  - `if (options.length === 0) return` → hiç yol yoksa (etrafı kapalıysa) bekler.
  - `Math.floor(Math.random() * options.length)` → rastgele bir sıra numarası. `Math.random() * 3` 0 ile 3 arası bir
    sayı; `Math.floor` aşağı yuvarlar: 0, 1 ya da 2.
  - `e.dir = options[...]` → seçilen yön; `e.target = ...` → o yöndeki kare.
- `moveTo(e, ENEMY_SPEED)` → hedefe doğru kay; oyuncuyla aynı fonksiyon.
- `for (const e of enemies) updateEnemy(e)` → `update` içinde her düşman.

# --task--

1. Under `SPEED` write `ENEMY_SPEED`.
2. Above `function hurt() {` write `updateEnemy`.
3. In `update`, under `updatePlayer()`, write the enemies line.

# --task-tr--

1. `const SPEED = ...` satırının altına `ENEMY_SPEED` satırını yaz.
2. `function hurt() {` satırının **üstüne** `updateEnemy` fonksiyonunu yaz.
3. `update` içinde `updatePlayer()` satırının altına düşman satırını yaz.
4. **Çalıştır** ve düşmanları izle. Nasıl yürüyorlar?

# --predict--

How will the enemies move with a purely random choice on every tile?
- [ ] Smoothly along the corridors
- [x] Often back and forth on the spot, like they cannot decide
  Going back is one of the options on almost every tile. The next step fixes that.
- [ ] Straight into the walls

# --predict-tr--

Her karede tamamen rastgele seçimle düşmanlar nasıl yürüyecek?
- [ ] Koridorlar boyunca akıcı
- [x] Sık sık yerinde ileri geri, karar veremiyormuş gibi
  Neredeyse her karede geri dönmek de seçeneklerden biri. Bir sonraki adım bunu düzeltecek.
- [ ] Doğruca duvarlara

# --tests--

Enemies should wander without walking into walls or crates.
tr: Düşmanlar duvarlara ya da kasalara girmeden dolaşmalı.

```js
const seen = new Set()
for (let i = 0; i < 600; i++) {
  $.tick()
  for (const e of enemies) {
    const t = tileOf(e)
    assert.notStrictEqual(grid[t.r][t.c], '#', 'enemies never go into walls')
    assert.notStrictEqual(grid[t.r][t.c], '+', 'or crates')
    seen.add(t.r + ',' + t.c)
  }
  safe = 10
}
assert.isAbove(seen.size, 3, 'enemies move')
```

An enemy should slide at `ENEMY_SPEED` towards a walkable tile.
tr: Düşman `ENEMY_SPEED` hızla yürünebilir bir kareye kaymalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  enemies = [{ x: 5, y: 1, target: null, dir: [0, 0] }]
  grid[2][5] = '+'
  updateEnemy(enemies[0])
  const e = enemies[0]
  assert.strictEqual(e.y, 1, 'up is a wall and down a crate: it goes sideways')
  assert.closeTo(Math.abs(e.x - 5), 0.05, 1e-9)
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

function updateEnemy(e) {
  if (!e.target) {
    const options = Object.values(DIRS).filter(([dr, dc]) => walkable(e.y + dr, e.x + dc))
    if (options.length === 0) return
    e.dir = options[Math.floor(Math.random() * options.length)]
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
  if (safe > 0) safe -= 1
  else if (inFlames(player)) hurt()
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
