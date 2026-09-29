---
title: Game over
title_tr: Oyun bitti
skills: [game.canvas, game.input]
---

# --goal--

When the game is over, a dark see-through panel says `Game over`, and Enter starts again.

# --goal-tr--

Oyun bitince oyuncuya söyleyelim: ortada yarı saydam koyu bir **panel**, üstünde `Game over`, altında nasıl yeniden
oynanacağı. **Enter** tuşu da oyunu baştan başlatsın.

# --code--

```js
} else if (event.key === 'Enter' && state !== 'playing') reset()

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
```

# --meaning--

- Enter calls `reset()` only when the game is not being played.
- `rgba(15, 23, 42, 0.85)` is dark blue at 85%: the arena still shows faintly behind the panel.
- `textAlign = 'center'` makes `x` the middle of the text; `canvas.width / 2` centers it.

# --meaning-tr--

- `else if (event.key === 'Enter' && state !== 'playing') reset()` → Enter'a basıldı **ve** oyun sürmüyorsa baştan
  başla.
- `'rgba(15, 23, 42, 0.85)'` → kırmızı, yeşil, mavi (0–255) ve **saydamlık** (0–1): %85 koyu lacivert. Arena arkadan
  hafifçe görünür.
- `ctx.fillRect(40, 150, canvas.width - 80, 90)` → iki yandan 40'ar piksel boşluklu, 90 piksel boyunda panel.
- `ctx.textAlign = 'center'` → verilen `x` yazının **ortası** olur; `canvas.width / 2` ile yazı tam ortalanır.

# --task--

1. In the `keydown` listener, after the Space block's `}`, add the Enter line.
2. At the end of `draw`, under the hearts, write the panel.

# --task-tr--

1. `keydown` dinleyicisinde Boşluk bloğunun kapanan `}` satırını `} else if (event.key === 'Enter' && state !== 'playing') reset()`
   yap.
2. `draw`'un sonunda kalp satırının **altına** panel bloğunu yaz.
3. **Çalıştır**, üç kez yan: `Game over` çıkmalı; Enter oyunu baştan başlatmalı.

# --tests--

The end should show `Game over` on a panel.
tr: Oyun sonu bir panelde `Game over` göstermeli.

```js
$.tick()
assert.lengthOf($.rects('rgba(15, 23, 42, 0.85)'), 0, 'no panel while playing')
state = 'lost'
$.tick()
assert.include($.texts(), 'Game over')
assert.deepInclude($.rects('rgba(15, 23, 42, 0.85)'), { x: 40, y: 150, w: 336, h: 90, color: 'rgba(15, 23, 42, 0.85)' })
```

Enter should start again, but only after the end.
tr: Enter yeniden başlatmalı, ama yalnız oyun bitince.

```js
lives = 2
$.press('Enter')
assert.strictEqual(lives, 2, 'Enter does nothing while playing')
lives = 0
state = 'lost'
$.press('Enter')
assert.strictEqual(state, 'playing')
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
