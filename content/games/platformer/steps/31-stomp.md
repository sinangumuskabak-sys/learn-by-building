---
title: Stomp!
title_tr: Ez!
skills: [game.collision, game.state]
---

# --goal--

Touching an enemy has two outcomes, and the difference is only **direction**. Coming down onto its head is a **stomp**:
the enemy is squashed and the player bounces up. Anything else hurts. The rule is forgiving: falling, with the feet still
in the top half of the enemy.

# --goal-tr--

Bir düşmana değmenin iki sonucu var; fark yalnız **yönde**:

- Üstüne **düşerek** gelirsen: **ezersin**. Düşman yok olur, oyuncu havaya sıçrar.
- Başka her durumda (içine yürümek, yanına zıplamak): incinirsin.

Kural hoşgörülü: oyuncu **düşüyorsa** ve ayakları hâlâ düşmanın **üst yarısındaysa** ezmedir. Oyuncular "üstüne indim"
kararını cömert verir; kural da öyle olmalı. Ezilen düşman `alive: false` olur ve artık çarpışmaz.

# --code--

```js
  if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1, alive: true })

if (!enemy.alive || !overlaps(player, enemy)) continue
// A stomp: falling, with the feet still in the top half of the enemy. Anything else is a hit.
const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
if (stomp) {
  enemy.alive = false
  player.vy = JUMP * 0.6
} else {
  die()
  return
}
```

# --meaning--

- Every enemy starts `alive: true`; dead ones are skipped.
- `stomp` is true when falling (`vy > 0`) and the feet (`y + h`) are above the enemy's middle (`y + h / 2`).
- A stomp kills the enemy and bounces the player up at 60% of a jump; otherwise `die()`.

# --meaning-tr--

- `alive: true` → her düşman canlı başlar.
- `if (!enemy.alive || !overlaps(player, enemy)) continue` → düşman ölüyse **veya** değmiyorsa geç.
- `const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2` → oyuncu **düşüyor** (`vy > 0`) **ve**
  ayakları (`y + h`) düşmanın ortasından (`enemy.y + enemy.h / 2`) yukarıda.
- `if (stomp) {` → ezme:
  - `enemy.alive = false` → düşman öldü.
  - `player.vy = JUMP * 0.6` → oyuncu zıplamanın %60'ı kadar yukarı sıçrar. O ana tuşa basıyorsan bile sıçrayış
    kendiliğinden olur.
- `else { die(); return }` → ezme değilse, eskisi gibi incin.

# --task--

1. In `loadLevel`, add `alive: true` to the enemy.
2. In `update`, replace the three lines inside the enemy loop with the new ones.

# --task-tr--

1. `loadLevel` içindeki düşman nesnesine `alive: true` ekle (`dir: -1`'den sonra).
2. `update` içinde düşman döngüsünün içindeki üç satırı sil; yerine yeni satırları yaz.
3. **Çalıştır** ve bir düşmanın üstüne zıpla. (Ezilen düşman şimdilik hâlâ görünüyor ve yürüyor; bir sonraki adım.)

# --tests--

Landing on an enemy should squash it and bounce the player up.
tr: Bir düşmanın üstüne inmek onu ezmeli ve oyuncuyu yukarı sıçratmalı.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
enemy.dir = 0
player.x = enemy.x
player.y = enemy.y - 34
player.vy = 6
update()
assert.isFalse(enemy.alive)
assert.isBelow(player.vy, 0)
assert.strictEqual(lives, 3)
```

Walking into an enemy should still hurt, and a dead enemy should not.
tr: Bir düşmanın içine yürümek yine incitmeli, ölü bir düşman incitmemeli.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
const other = enemies.find((e) => e.x === 51 * 32 + 2)
enemy.alive = false
player.x = enemy.x - 20
player.y = 258
update()
assert.strictEqual(lives, 3, 'a dead enemy is harmless')
player.x = other.x - 20
update()
assert.strictEqual(lives, 2)
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
      if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1, alive: true })
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

  for (const enemy of enemies) {
    if (!enemy.alive || !overlaps(player, enemy)) continue
    // A stomp: falling, with the feet still in the top half of the enemy. Anything else is a hit.
    const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
    if (stomp) {
      enemy.alive = false
      player.vy = JUMP * 0.6
    } else {
      die()
      return
    }
  }

  if (player.y > ROWS * TILE) {
    die()
    return
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
  ctx.fillText('Coins: ' + collected + '   Lives: ' + lives, 12, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
