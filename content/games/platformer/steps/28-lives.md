---
title: Lives and a fresh start
title_tr: Canlar ve yeniden başlamak
skills: [game.state]
---

# --goal--

Getting hurt will cost a **life** and restart the level. Remember the blueprint? Restarting is now trivial: throw the live
objects away and build them again from the level text with `loadLevel()`. `newGame()` does the same, plus three lives.

# --goal-tr--

İncinmek bir **cana** mal olacak ve bölüm baştan başlayacak. Hatırlıyor musun: bölüm yazısı hiç değişmeyen bir plandı.
Yeniden başlamak artık çok kolay: canlı nesneleri (oyuncu, altınlar, düşmanlar) at ve `loadLevel()` ile plandan **yeniden
kur**. Toplanan altınlar da geri gelir: gerçek bir baştan başlama.

`newGame()` (yeni oyun) aynısını yapar, bir de canları 3'e doldurur. `die()` (öl) bir can eksiltir ve bölümü yeniden
yükler. Bu adımda henüz kimse `die`'ı çağırmıyor.

# --code--

```js
let lives

function newGame() {
  lives = 3
  loadLevel()
}

function die() {
  lives -= 1
  loadLevel()
}

newGame()
```

# --meaning--

- `newGame` sets three lives and loads the level; it replaces the `loadLevel()` call at the bottom.
- `die` takes a life away and rebuilds everything from the level text.

# --meaning-tr--

- `let lives` → kalan can sayısı.
- `function newGame()` → canları 3 yap, bölümü yükle. En alttaki `loadLevel()` çağrısının yerini alır.
- `function die()` → `lives -= 1` bir can eksilt, `loadLevel()` ile her şeyi plandan yeniden kur: oyuncu başa döner,
  altınlar geri gelir, düşmanlar yerlerine döner.

# --task--

1. Under `let collected` write `let lives`.
2. Above `function jump() {` write `newGame`; above `function updatePlayer() {` write `die`.
3. At the bottom, replace `loadLevel()` with `newGame()`.

# --task-tr--

1. `let collected` satırının altına `let lives` yaz.
2. `function jump() {` satırının **üstüne** `newGame` fonksiyonunu yaz; aralarında bir boş satır kalsın.
3. `function updatePlayer() {` satırının **üstüne** `die` fonksiyonunu yaz; aralarında bir boş satır kalsın.
4. En alttaki `loadLevel()` satırını `newGame()` yap. **Çalıştır**.

# --tests--

A new game should start with three lives.
tr: Yeni oyun üç canla başlamalı.

```js
assert.strictEqual(lives, 3)
```

`die()` should cost a life and rebuild the level from the text.
tr: `die()` bir cana mal olmalı ve bölümü yazıdan yeniden kurmalı.

```js
coins[0].taken = true
collected = 1
player.x = 500
enemies[0].x = 100
die()
assert.strictEqual(lives, 2)
assert.strictEqual(player.x, 68, 'back at the start')
assert.strictEqual(collected, 0)
assert.isFalse(coins[0].taken, 'the coins come back')
assert.notStrictEqual(enemies[0].x, 100, 'the enemies are rebuilt')
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
let enemies
let camera
let collected
let lives
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
  enemies = []
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
      if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
      if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1 })
    }
  })
  camera = 0
  collected = 0
  coyote = 0
}

function newGame() {
  lives = 3
  loadLevel()
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

function die() {
  lives -= 1
  loadLevel()
}

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

function updateEnemy(enemy) {
  enemy.vx = enemy.dir
  if (moveX(enemy)) enemy.dir = -enemy.dir
  enemy.vy = Math.min(MAX_FALL, enemy.vy + GRAVITY)
  moveY(enemy)
  // Turn around at ledges: is there ground just ahead of the front foot?
  if (enemy.grounded) {
    const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1
    if (!solidAt(aheadX, enemy.y + enemy.h)) enemy.dir = -enemy.dir
  }
}

function update() {
  updatePlayer()
  for (const enemy of enemies) updateEnemy(enemy)

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
      collected += 1
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

  ctx.fillStyle = '#7c2d12'
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h)
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected, 12, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
