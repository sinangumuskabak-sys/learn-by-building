---
title: Draw only what is on screen
title_tr: Yalnız ekrandakini çiz
skills: [game.canvas]
---

# --goal--

We still draw all 64 columns, though only about 21 are on screen. Knowing the camera, we draw only the visible columns.
This is called **culling**, and it keeps huge levels fast.

# --goal-tr--

Hâlâ 64 sütunun hepsini çiziyoruz, oysa ekranda aynı anda ancak ~21'i görünüyor. Kalanlar ekranın dışına çiziliyor ve
boşa gidiyor. Kamerayı bildiğimize göre yalnız **görünen sütunları** çizebiliriz. Buna **culling** (ayıklama) denir;
dev bölümler bu sayede hızlı kalır.

Ekranda bir fark görmeyeceksin; ama bilgisayar üç kat daha az iş yapıyor.

# --code--

```js
// Only draw the columns that are on screen.
const first = Math.floor(camera / TILE)
const last = Math.min(COLS - 1, first + Math.ceil(canvas.width / TILE))
for (let row = 0; row < ROWS; row++) {
  for (let col = first; col <= last; col++) {
```

# --meaning--

- `first` is the column at the screen's left edge.
- `Math.ceil` rounds up: 640 / 32 = 20 columns fit; from `first` to `first + 20` covers a column cut in half at each
  edge. `Math.min(COLS - 1, ...)` keeps it inside the level.
- The inner loop now runs from `first` to `last`, including `last` (`<=`).

# --meaning-tr--

- `const first = Math.floor(camera / TILE)` → ekranın sol kenarındaki sütun. Kamera 692'deyse 692 / 32 = 21.6 → 21.
- `Math.ceil(canvas.width / TILE)` → `Math.ceil` **yukarı** yuvarlar: 640 / 32 = 20. Kenarda yarım görünen sütunlar
  için `first`'ten `first + 20`'ye kadar 21 sütun çizeriz.
- `Math.min(COLS - 1, ...)` → son sütun bölümün dışına taşmasın (en fazla 63).
- `for (let col = first; col <= last; col++)` → iç döngü artık yalnız bu aralıkta; `<=` çünkü `last` da çizilecek.

# --task--

In `draw`, above the tile loops write the comment, `first` and `last`, and make the inner loop go from `first` to `last`.

# --task-tr--

1. `draw` içinde `for (let row = 0; ...)` satırının **üstüne** yorum satırını, `first` ve `last` satırlarını yaz.
2. İç döngüyü `for (let col = first; col <= last; col++)` yap.
3. **Çalıştır**: oyun aynı görünmeli.

# --tests--

Only the tiles on screen should be drawn.
tr: Yalnızca ekrandaki döşemeler çizilmeli.

```js
player.x = 1000
$.tick()
const tiles = [...$.rects('#78350f'), ...$.rects('#c2410c')]
assert.isAbove(tiles.length, 20)
assert.isTrue(tiles.every((t) => t.x >= camera - 32 && t.x <= camera + 640), 'every drawn tile is on screen')
```

The screen should still be full of tiles at the right end.
tr: Sağ uçta da ekran döşemelerle dolu olmalı.

```js
player.x = 2000
player.y = 100
$.tick()
const ground = $.rects('#78350f').filter((t) => t.y === 9 * 32)
assert.isAtLeast(ground.length, 18)
assert.isTrue(ground.some((t) => t.x === 63 * 32), 'the last column')
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
const EPS = 0.01 // a hair: the right and bottom edges are just inside the box
// The level as text: '#' ground, 'B' brick, 'o' coin, 'e' enemy, 'P' player start, 'F' flag.
const LEVEL = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....................................oooo........................',
  '.........oooo........................e..........................',
  '.........BBBB.................ooo...BBBB....##..................',
  '....ooo...............#....................###.......oooo.......',
  '..P...................#...e...............####.....e.....e...F..',
  '################..############...#############..################',
  '################..############...#############..################',
]
const ROWS = LEVEL.length
const COLS = LEVEL[0].length
const COLORS = { '#': '#78350f', B: '#c2410c' }

const GRAVITY = 0.5
const MAX_FALL = 12 // must stay below TILE, or a fast fall could skip over a whole tile
const ACCEL = 0.5
const MAX_SPEED = 4
const FRICTION = 0.8
const JUMP = -11.5
const CUT = -4 // letting go early caps the upward speed at this
const COYOTE = 6 // frames you can still jump after running off a ledge

let player
let camera
let coyote
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}

// Bodies are never bigger than a tile, so checking their four corners is enough.
function overlapsSolid(body) {
  const right = body.x + body.w - EPS
  const bottom = body.y + body.h - EPS
  return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
}

// Move along one axis at a time; if that ends inside a wall, snap back to the wall's edge.
function moveX(body) {
  body.x += body.vx
  if (!overlapsSolid(body)) return false
  if (body.vx > 0) body.x = Math.floor((body.x + body.w - EPS) / TILE) * TILE - body.w
  else body.x = Math.floor(body.x / TILE) * TILE + TILE
  body.vx = 0
  return true
}

function moveY(body) {
  body.grounded = false
  body.y += body.vy
  if (!overlapsSolid(body)) return
  if (body.vy > 0) {
    body.y = Math.floor((body.y + body.h - EPS) / TILE) * TILE - body.h
    body.grounded = true
  } else {
    body.y = Math.floor(body.y / TILE) * TILE + TILE
  }
  body.vy = 0
}

function loadLevel() {
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
    }
  })
  camera = 0
  coyote = 0
}

function jump() {
  if (coyote > 0) {
    player.vy = JUMP
    coyote = 0
  }
}

function endJump() {
  if (player.vy < CUT) player.vy = CUT
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})

function updatePlayer() {
  const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  if (input !== 0) player.vx += input * ACCEL
  else player.vx *= FRICTION
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
  if (Math.abs(player.vx) < 0.05) player.vx = 0
  moveX(player)

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  moveY(player)
  coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)
}

function update() {
  updatePlayer()

  camera = clamp(player.x + player.w / 2 - canvas.width / 2, 0, COLS * TILE - canvas.width)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(-Math.round(camera), 0)

  // Only draw the columns that are on screen.
  const first = Math.floor(camera / TILE)
  const last = Math.min(COLS - 1, first + Math.ceil(canvas.width / TILE))
  for (let row = 0; row < ROWS; row++) {
    for (let col = first; col <= last; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
