---
title: Play with a finger
title_tr: Parmakla oyna
skills: [game.input]
---

# --goal--

Touch fills the same `held` list the keyboard fills: `['ArrowRight']` while the finger is to the right, `[]` when it
lifts. A tap on the player drops a bomb, and a tap after the end starts again.

# --goal-tr--

Güzel kısım şu: dokunmatik **kendi hareket kodunu istemez**. Klavyenin doldurduğu aynı `held` listesini doldurur:
parmak sağdayken `['ArrowRight']`, kalkınca `[]`. Hedefler, kayma, duvarlar, bombalar... geri kalan her şey olduğu
gibi çalışır. **Girdiyi** (oyuncu ne istiyor) **kurallardan** (ne olur) ayırmanın ödülü budur.

- Parmağı bas: yön varsa o yöne yürü, oyuncunun üstündeyse bomba bırak; oyun bittiyse baştan başla.
- Parmağı kaydır: yürüyorsan yön değişir.
- Parmağı kaldır: dur.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') return reset()
  const dir = touch(event)
  if (dir) held = [dir]
  else dropBomb()
})

canvas.addEventListener('pointermove', (event) => {
  if (held.length === 0) return
  const dir = touch(event)
  if (dir) held = [dir]
})

document.addEventListener('pointerup', () => {
  held = []
})

    ctx.fillText('Press Enter or tap to play again', canvas.width / 2, 222)
```

# --meaning--

- `pointerdown`: after the end, `return reset()` starts again and stops there. Otherwise a direction replaces `held`,
  and a tap on the player drops a bomb.
- `pointermove` only changes the way while walking (`held` not empty).
- `pointerup` is on the whole `document`, so lifting the finger outside the canvas stops too.

# --meaning-tr--

- `pointerdown` → parmak ya da fare **basınca**:
  - `if (state !== 'playing') return reset()` → oyun bittiyse baştan başla; `return` hem çağırır hem çıkar.
  - `const dir = touch(event)` → hangi yön?
  - `if (dir) held = [dir]` → yön varsa `held` yalnız o tuş olur, `else dropBomb()` → yoksa (oyuncunun üstü) bomba.
- `pointermove` → parmak **kayınca**: `held` boşsa (yürümüyorsak) bir şey yapma; değilse yönü güncelle.
- `pointerup` → parmak **kalkınca** `held = []`: dur. Bunu `document`'te dinleriz ki parmak canvas dışında kalksa da
  dursun.
- Paneldeki yazı da artık dokunmayı anlatıyor: `Press Enter or tap to play again`.

# --task--

1. Above `function drawCircle(` write the three listeners.
2. In the panel, change the last text to `'Press Enter or tap to play again'`.

# --task-tr--

1. `function drawCircle(` satırının **üstüne** üç dinleyiciyi yaz.
2. Paneldeki `'Press Enter to play again'` yazısını `'Press Enter or tap to play again'` yap.
3. **Çalıştır**: oyuncunun sağına tıkla ve basılı tut: sağa yürümeli. Oyuncunun üstüne tıkla: bomba.

# --tests--

A finger beside the player should walk that way, and a tap on the player should drop a bomb.
tr: Oyuncunun yanındaki parmak o yöne yürütmeli; oyuncuya dokunmak bomba bırakmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  $.pointerDown(200, 80)
  assert.deepEqual(held, ['ArrowRight'], 'a finger to the right walks right')
  $.tick(10)
  assert.closeTo(player.x, 2, 1e-9)
  $.move(64 + 16, 200)
  assert.deepEqual(held, ['ArrowDown'])
  $.pointerUp(64 + 16, 200)
  assert.deepEqual(held, [])
  $.tick(20)
  $.click(player.x * 32 + 16, 32 + player.y * 32 + 16)
  assert.lengthOf(bombs, 1, 'a tap on the player drops a bomb')
```

A tap after the end should start again.
tr: Oyun bitince bir dokunuş yeniden başlatmalı.

```js
lives = 0
state = 'lost'
$.tick()
assert.include($.texts(), 'Press Enter or tap to play again')
$.click(200, 200)
assert.strictEqual(state, 'playing', 'a tap starts again')
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
let items // 'r,c' -> 'bomb' or 'fire', hidden under crates until they burn
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

const key = (r, c) => r + ',' + c
const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  items = new Map()
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else {
        grid[r].push('+')
        if (Math.random() < 0.2) items.set(key(r, c), Math.random() < 0.5 ? 'bomb' : 'fire')
      }
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

function pickUp() {
  const t = tileOf(player)
  const item = items.get(key(t.r, t.c))
  if (!item || grid[t.r][t.c] !== ' ') return
  items.delete(key(t.r, t.c))
  if (item === 'bomb') maxBombs += 1
  else power += 1
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
  pickUp()
  for (const e of enemies) updateEnemy(e)
  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
  for (const f of flames) f.time -= 1
  flames = flames.filter((f) => f.time > 0)
  enemies = enemies.filter((e) => !inFlames(e))
  if (safe > 0) safe -= 1
  else if (inFlames(player) || enemies.some((e) => Math.hypot(e.x - player.x, e.y - player.y) < 0.6)) hurt()
  if (state === 'playing' && enemies.length === 0) {
    state = 'won'
  }
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

// Touch: hold a finger on one side of the player to walk that way; tap on the player to drop a bomb.
function touch(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const dx = x - (player.x * TILE + TILE / 2)
  const dy = y - (TOP + player.y * TILE + TILE / 2)
  if (Math.abs(dx) < TILE / 2 && Math.abs(dy) < TILE / 2) return null
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'ArrowRight' : 'ArrowLeft'
  return dy > 0 ? 'ArrowDown' : 'ArrowUp'
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') return reset()
  const dir = touch(event)
  if (dir) held = [dir]
  else dropBomb()
})

canvas.addEventListener('pointermove', (event) => {
  if (held.length === 0) return
  const dir = touch(event)
  if (dir) held = [dir]
})

document.addEventListener('pointerup', () => {
  held = []
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
      const item = items.get(key(r, c))
      if (item && tile === ' ') {
        ctx.fillStyle = item === 'bomb' ? '#2563eb' : '#ea580c'
        ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item === 'bomb' ? 'B' : 'F', x + TILE / 2, y + 21)
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
  ctx.fillText('♥'.repeat(lives) + '  Bombs ' + maxBombs + '  Fire ' + power, 8, 22)
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(40, 150, canvas.width - 80, 90)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(state === 'won' ? 'All enemies gone!' : 'Game over', canvas.width / 2, 190)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Enter or tap to play again', canvas.width / 2, 222)
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
