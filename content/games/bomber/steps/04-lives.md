---
title: Mind the flames
title_tr: Alevlere dikkat
skills: [game.state, game.collision]
---

# --explanation--

Now the flames are dangerous: standing in one costs a **life**. The player's tile is `tileOf(player)`, the nearest tile to
where it is, so a player halfway out of the blast is safe only once more than half of it has left the burning tile.

After losing a life the player goes back to the start. Without protection, the flames still burning there could take a second
life on the very next frame. So the player is **safe** for 120 frames (two seconds), and blinks to show it: drawn only when
`safe % 10 < 5`, which switches every 5 frames.

At zero lives the game is over. `update` stops, bombs cannot be dropped, and Enter starts again.

# --explanation-tr--

Artık alevler tehlikeli: birinin içinde durmak bir **cana** mal olur. Oyuncunun karesi `tileOf(player)`'dır, yani bulunduğu
yere en yakın kare; bu yüzden patlamadan yarı yarıya çıkmış bir oyuncu, ancak yarısından fazlası yanan kareden çıktığında
güvendedir.

Bir can kaybettikten sonra oyuncu başlangıca döner. Koruma olmasa, orada hâlâ yanan alevler bir sonraki karede ikinci bir canı
alabilirdi. Bu yüzden oyuncu 120 kare (iki saniye) boyunca **güvende**dir ve bunu yanıp sönerek gösterir: yalnızca her 5 karede
bir değişen `safe % 10 < 5` iken çizilir.

Sıfır canda oyun biter. `update` durur, bomba bırakılamaz ve Enter yeniden başlatır.

# --task--

1. Add `lives`, `safe` and `state` (`3`, `0` and `'playing'` in `reset()`).
2. Write `inFlames(m)`: true if a flame is on `m`'s tile.
3. Write `hurt()`: take a life; at `0` set `state = 'lost'`; otherwise put the player back at `(1, 1)` and set `safe = 120`.
4. `update` works only while `'playing'`: count `safe` down while it is above 0, otherwise `hurt()` if the player is in flames.
   `dropBomb` works only while `'playing'`, and Enter restarts when the game is not.
5. Draw the player only when `safe % 10 < 5`. Draw the hearts at `(8, 22)` (white, `'bold 16px sans-serif'`), and when lost,
   a `'rgba(15, 23, 42, 0.85)'` panel at `(40, 150)`, `canvas.width - 80` by `90`, with `Game over` (`'bold 24px sans-serif'`,
   `y = 190`) and `Press Enter to play again` (`'16px sans-serif'`, `y = 222`), centered.

# --task-tr--

1. `lives`, `safe` ve `state` ekle (`reset()`'te `3`, `0` ve `'playing'`).
2. `inFlames(m)` yaz: `m`'nin karesinde bir alev varsa true.
3. `hurt()` yaz: bir can al; `0`'da `state = 'lost'` yap; değilse oyuncuyu `(1, 1)`'e geri koy ve `safe = 120` yap.
4. `update` yalnızca `'playing'` iken çalışır: `safe` 0'ın üstündeyken onu azalt, değilse oyuncu alevdeyse `hurt()` et.
   `dropBomb` yalnızca `'playing'` iken çalışır ve oyun öyle değilken Enter yeniden başlatır.
5. Oyuncuyu yalnızca `safe % 10 < 5` iken çiz. Kalpleri `(8, 22)`'ye çiz (beyaz, `'bold 16px sans-serif'`) ve kaybedince
   `(40, 150)`'de `canvas.width - 80`'e `90` bir `'rgba(15, 23, 42, 0.85)'` panel ile `Game over` (`'bold 24px sans-serif'`,
   `y = 190`) ve `Press Enter to play again` (`'16px sans-serif'`, `y = 222`) yazılarını ortalı çiz.

# --tests--

A flame should cost a life and send the player back to the start, safe for a while.
tr: Bir alev bir cana mal olmalı ve oyuncuyu bir süre güvende olarak başlangıca göndermeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
flames.push({ r: 1, c: 1, time: 30 })
$.tick(1)
assert.strictEqual(lives, 2)
assert.deepEqual([player.x, player.y], [1, 1])
assert.strictEqual(safe, 120)
$.tick(60)
flames.push({ r: 1, c: 1, time: 30 })
$.tick(1)
assert.strictEqual(lives, 2, 'safe for a while after losing a life')
```

Losing the last life should end the game, and Enter should restart it.
tr: Son canı kaybetmek oyunu bitirmeli ve Enter onu yeniden başlatmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
for (let i = 0; i < 3; i++) {
  safe = 0
  flames = [{ r: 1, c: 1, time: 30 }]
  $.tick(1)
}
assert.strictEqual(lives, 0)
assert.strictEqual(state, 'lost')
$.press(' ')
assert.lengthOf(bombs, 0, 'no bombs after the end')
$.tick(1)
assert.include($.texts(), 'Game over')
$.press('Enter')
assert.strictEqual(state, 'playing')
assert.strictEqual(lives, 3)
```

The hearts should be drawn, and the player should blink while safe.
tr: Kalpler çizilmeli ve oyuncu güvendeyken yanıp sönmeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
$.tick(1)
assert.include($.texts(), '♥♥♥')
safe = 7
$.tick(1)
assert.notDeepInclude($.arcs(), { x: 48, y: 80, r: 12, color: '#f8fafc' }, 'the player blinks while safe')
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
let state // 'playing' or 'lost'

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
