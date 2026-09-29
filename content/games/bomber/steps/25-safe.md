---
title: A moment of safety
title_tr: Kısa bir güvenlik
skills: [game.state]
---

# --goal--

After losing a life the player is safe for 120 frames (two seconds), and blinks to show it. Only when `safe` is back
at 0 can flames hurt again.

# --goal-tr--

Can kaybedince oyuncu başa dönüyor; ama orada hâlâ yanan alevler bir sonraki karede **bir can daha** alıyordu. Çözüm:
can kaybından sonra oyuncu 120 kare (iki saniye) **güvende** olsun (`safe`). Bunu göstermek için de **yanıp sönsün**.

# --code--

```js
let safe // frames of invincibility after losing a life

  safe = 0

  safe = 120

  if (safe > 0) safe -= 1
  else if (inFlames(player)) hurt()

  if (safe % 10 < 5) drawCircle(player, '#f8fafc', 12)
```

# --meaning--

- `hurt` sets `safe` to 120; `update` counts it down, and only checks the flames when it is 0.
- The player is drawn only while `safe % 10 < 5`, which switches every 5 frames. At 0 it is always drawn.

# --meaning-tr--

- `let safe` → kalan güvenlik süresi (kare); `reset` içinde 0, `hurt` içinde 120.
- `if (safe > 0) safe -= 1` → güvenlik sürüyorsa bir azalt...
- `else if (inFlames(player)) hurt()` → ...sürmüyorsa **ve** alevdeysen can kaybet.
- `if (safe % 10 < 5) drawCircle(...)` → `safe % 10` her karede değişir; oyuncu 5 kare görünür, 5 kare kaybolur.
  Güvenlik bitince `safe` 0'da kalır, `0 % 10` 0'dır: oyuncu hep görünür.

# --task--

1. Under `let lives` write `let safe`; in `reset`, under `lives = 3`, write `safe = 0`.
2. At the end of `hurt`, write `safe = 120`.
3. In `update`, replace the flame line with the two `safe` lines.
4. In `draw`, put `if (safe % 10 < 5) ` in front of the player's `drawCircle`.

# --task-tr--

1. `let lives` satırının altına `let safe` yaz; `reset` içinde `lives = 3` satırının altına `safe = 0` yaz.
2. `hurt`'ün sonuna `safe = 120` yaz.
3. `update`'in sonundaki `if (inFlames(player)) hurt()` satırını iki satırlık yeni hâliyle değiştir.
4. `draw` içinde oyuncuyu çizen satırın başına `if (safe % 10 < 5) ` ekle.
5. **Çalıştır** ve kendi bombanın yanında dur: bir can kaybedip başta yanıp sönmelisin.

# --tests--

After losing a life, the player should be safe for a while.
tr: Can kaybından sonra oyuncu bir süre güvende olmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  flames.push({ r: 1, c: 1, time: 30 })
  $.tick()
  assert.strictEqual(lives, 2)
  assert.strictEqual(safe, 120)
  $.tick(60)
  flames.push({ r: 1, c: 1, time: 30 })
  $.tick()
  assert.strictEqual(lives, 2, 'safe for a while after losing a life')
  $.tick(80)
  flames.push({ r: 1, c: 1, time: 30 })
  $.tick()
  assert.strictEqual(lives, 1, 'then flames hurt again')
```

The player should blink while safe.
tr: Oyuncu güvendeyken yanıp sönmeli.

```js
safe = 7
$.tick()
assert.notDeepInclude($.arcs(), { x: 48, y: 80, r: 12, color: '#f8fafc' }, 'hidden')
safe = 4
$.tick()
assert.deepInclude($.arcs(), { x: 48, y: 80, r: 12, color: '#f8fafc' }, 'shown')
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
let lives
let safe // frames of invincibility after losing a life

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
  lives = 3
  safe = 0
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

function hurt() {
  lives -= 1
  player = { x: 1, y: 1, target: null }
  safe = 120
}

function update() {
  updatePlayer()
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
  // Bombs blink faster as the fuse runs out.
  for (const b of bombs) drawCircle({ x: b.c, y: b.r }, b.fuse < 45 && b.fuse % 10 < 5 ? '#dc2626' : '#020617', 12)
  if (safe % 10 < 5) drawCircle(player, '#f8fafc', 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
