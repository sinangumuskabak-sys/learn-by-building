---
title: Hidden power-ups
title_tr: Saklı güçlendirmeler
skills: [prog.arrays, game.state]
---

# --goal--

About one crate in five hides a **power-up**: `'bomb'` (one more bomb at a time) or `'fire'` (longer flames). They are
kept in a `Map` from a tile to its item; only tiles that have something take space.

# --goal-tr--

Kasa patlatmak, bazıları bir **ödül** saklayınca daha heyecanlı olur. Kabaca her beş kasadan biri bir **güçlendirme**
saklayacak:

- `'bomb'` → aynı anda bir bomba fazla,
- `'fire'` → daha uzun alevler.

Nerede tutalım? İkinci bir ızgara çoğunlukla boş kalırdı. Bir kareden eşyasına giden bir **`Map`** (eşleme tablosu)
daha uygun: yalnız bir şeyi olan kareler yer kaplar. Bir sözlük gibi: her **anahtara** bir **değer** karşılık gelir.

# --code--

```js
let items // 'r,c' -> 'bomb' or 'fire', hidden under crates until they burn

const key = (r, c) => r + ',' + c

  items = new Map()

      else {
        grid[r].push('+')
        if (Math.random() < 0.2) items.set(key(r, c), Math.random() < 0.5 ? 'bomb' : 'fire')
      }
```

# --meaning--

- A `Map` stores values under keys: `set(key, value)`, `get(key)`, `has(key)`, `delete(key)`.
- Keys must be simple values to be found again, so a tile becomes a string: `key(3, 5)` is `'3,5'`.
- The crate branch now does two things, so it gets `{ }`: place the crate, then a 20% chance to hide an item, half
  bombs and half fire.

# --meaning-tr--

- `let items` → saklı eşyalar tablosu.
- `const key = (r, c) => r + ',' + c` → kareyi yazıya çevirir: `key(3, 5)` → `'3,5'`. Sayıyla yazıyı `+` ile yan yana
  ekler. Anahtarların yeniden bulunabilmesi için basit değerler olmalı; `[3, 5]` gibi bir dizi her seferinde yeni bir
  dizi olurdu ve bulunamazdı.
- `items = new Map()` → her yeni arenada boş bir tablo:
  - `items.set('3,5', 'fire')` → anahtara değer yazar,
  - `items.get('3,5')` → okur (yoksa `undefined`),
  - `items.delete('3,5')` → siler.
- Kasa kolu artık iki iş yapıyor; o yüzden `else`'ten sonra süslü parantez:
  - `grid[r].push('+')` → kasayı koy,
  - `if (Math.random() < 0.2) items.set(...)` → %20 ihtimalle altına bir eşya sakla; hangisi olacağını ikinci bir
    yazı-tura seçer: `Math.random() < 0.5 ? 'bomb' : 'fire'`.

# --task--

1. Under `let grid` write `let items`; above `near` write `key`.
2. In `makeGrid`, under `grid = []`, write `items = new Map()`.
3. Replace `else grid[r].push('+')` with the `else { ... }` block.

# --task-tr--

1. `let grid` satırının altına `let items` yaz.
2. `const near = ...` satırının **üstüne** `key` satırını yaz.
3. `makeGrid` içinde `grid = []` satırının altına `items = new Map()` yaz.
4. `else grid[r].push('+')` satırını sil; yerine `else { ... }` bloğunu yaz.
5. **Çalıştır**: ekranda fark yok; eşyalar kasaların altında saklı.

# --tests--

`key` should turn a tile into a string.
tr: `key` bir kareyi yazıya çevirmeli.

```js
assert.strictEqual(key(3, 5), '3,5')
```

About one crate in five should hide a power-up, and only crates should.
tr: Beş kasadan yaklaşık biri güçlendirme saklamalı; yalnız kasalar.

```js
let crates = 0
let hidden = 0
const kinds = new Set()
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const row of grid) for (const t of row) if (t === '+') crates++
  hidden += items.size
  for (const [k, v] of items) {
    const [r, c] = k.split(',').map(Number)
    assert.strictEqual(grid[r][c], '+', 'power-ups hide under crates')
    kinds.add(v)
  }
}
assert.isAbove(hidden / crates, 0.1)
assert.isBelow(hidden / crates, 0.3)
assert.sameMembers([...kinds], ['bomb', 'fire'])
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
    ctx.fillText(state === 'won' ? 'All enemies gone!' : 'Game over', canvas.width / 2, 190)
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
