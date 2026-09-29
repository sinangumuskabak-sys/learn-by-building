---
title: Collect them
title_tr: Topla
skills: [game.collision]
---

# --goal--

Collecting is a box overlap between the player and each coin not yet taken. Two boxes overlap when each one starts before
the other one ends, on both axes.

# --goal-tr--

Oyuncu bir altına değince altın **toplansın**. Bunun için iki kutunun **üst üste binip binmediğini** soracağız.

Kural: iki kutu, **her iki eksende de** biri öbürü bitmeden başlıyorsa çakışır. Yatayda: A, B'nin sağ kenarından önce
başlıyor **ve** A'nın sağ kenarı B'nin başlangıcından sonra. Dikeyde aynısı.

# --code--

```js
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
    }
  }
```

# --meaning--

- `a.x < b.x + b.w`: A starts before B ends; `a.x + a.w > b.x`: A ends after B starts. The same for y. All four: overlap.
- In `update`, every coin that is not taken and overlaps the player becomes taken, so it is no longer drawn.

# --meaning-tr--

- `a.x < b.x + b.w` → A'nın solu, B'nin sağından **önce**.
- `a.x + a.w > b.x` → A'nın sağı, B'nin solundan **sonra**. İkisi birden: yatayda çakışıyorlar.
- `a.y < b.y + b.h && a.y + a.h > b.y` → aynısı dikeyde. Dördü de doğruysa kutular üst üste biner.
- `update` içinde: `for (const coin of coins)` → her altın için; `!coin.taken && overlaps(player, coin)` → henüz
  toplanmamış **ve** oyuncuya değiyorsa `coin.taken = true`. Toplanan altın artık çizilmez.

# --task--

1. Above the `// Move along one axis ...` comment write `overlaps`, with an empty line after it.
2. In `update`, under `updatePlayer()`, leave an empty line and write the coin loop.

# --task-tr--

1. `// Move along one axis ...` yorum satırının **üstüne** `overlaps` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `update` içinde `updatePlayer()` satırının altına bir boş satır bırak ve altın döngüsünü yaz.
3. **Çalıştır** ve soldaki üç altına zıpla: kaybolmalılar.

# --tests--

`overlaps` should find overlapping boxes, not touching ones.
tr: `overlaps` üst üste binen kutuları bulmalı, yalnız değenleri değil.

```js
const a = { x: 0, y: 0, w: 10, h: 10 }
assert.isTrue(overlaps(a, { x: 5, y: 5, w: 10, h: 10 }))
assert.isFalse(overlaps(a, { x: 10, y: 0, w: 10, h: 10 }), 'touching on the right')
assert.isFalse(overlaps(a, { x: 0, y: 12, w: 10, h: 10 }), 'below')
```

Touching a coin should take it.
tr: Bir altına dokunmak onu toplamalı.

```js
player.x = 4 * 32
player.y = 7 * 32 + 2
player.vy = -1
update()
const coin = coins.find((c) => c.x === 4 * 32 + 8 && c.y === 7 * 32 + 8)
assert.isTrue(coin.taken)
assert.isFalse(coins.find((c) => c.x === 9 * 32 + 8).taken, 'coins far away stay')
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
let coins
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

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
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
  coins = []
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
      if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
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

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
    }
  }

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

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
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
