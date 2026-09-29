---
title: Do not walk off ledges
title_tr: Kenardan düşme
skills: [game.collision]
---

# --goal--

The second rule of a walker: after moving, look at the ground **just ahead of the front foot**. Nothing to stand on
there? Turn around. This one probe makes enemies patrol platforms instead of marching into every pit.

# --goal-tr--

Yürüyen düşmanın ikinci kuralı: hareket ettikten sonra **ön ayağının hemen önündeki** zemine bak. Orada basacak bir şey
yoksa **geri dön**. Bu tek kontrol düşmanları çukurlara yürüyen şaşkınlardan, platformlarında **devriye gezen**
bekçilere çevirir.

Bu, olabilecek en basit **yapay zekâ**: iki kural, hiç plan yok. Yine de bir bölümü ilginç yapmaya yeter; oyuncunun işi
düşmanı alt etmek değil, **zamanlamak**.

# --code--

```js
// Turn around at ledges: is there ground just ahead of the front foot?
if (enemy.grounded) {
  const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1
  if (!solidAt(aheadX, enemy.y + enemy.h)) enemy.dir = -enemy.dir
}
```

# --meaning--

- Only while standing on something (not while falling).
- `aheadX` is one step past the front edge: the right edge when walking right, one pixel left of the left edge otherwise.
- `enemy.y + enemy.h` is the first pixel below the feet, where the floor should be.

# --meaning-tr--

- `if (enemy.grounded)` → yalnız bir şeyin üstünde dururken bak; düşerken değil.
- `const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1` → **ön ayağın bir adım ötesi**: sağa gidiyorsa sağ
  kenarın hemen dışı (`x + w`), sola gidiyorsa sol kenarın bir piksel solu (`x - 1`).
- `enemy.y + enemy.h` → ayakların hemen **altındaki** ilk piksel: zeminin olması gereken yer.
- `if (!solidAt(...)) enemy.dir = -enemy.dir` → orada katı bir şey **yoksa** geri dön.

# --task--

In `updateEnemy`, under `moveY(enemy)`, write the comment and the `if` block.

# --task-tr--

`updateEnemy` içinde `moveY(enemy)` satırının altına yorum satırını ve `if` bloğunu yaz. **Çalıştır**: tuğla
platformdaki düşman artık kenarlarda dönmeli.

# --tests--

An enemy should turn around at a ledge instead of falling.
tr: Bir düşman düşmek yerine kenarda geri dönmeli.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
enemy.dir = 1
enemy.x = 30 * 32 - 30
for (let i = 0; i < 20; i++) update()
assert.strictEqual(enemy.dir, -1)
assert.strictEqual(enemy.y + enemy.h, 9 * 32, 'still on the ground')
assert.isAtMost(enemy.x + enemy.w, 30 * 32)
```

The enemy on the brick platform should patrol it without falling off.
tr: Tuğla platformdaki düşman düşmeden onun üstünde devriye gezmeli.

```js
const enemy = enemies.find((e) => e.y === 5 * 32 + 4)
for (let i = 0; i < 400; i++) update()
assert.strictEqual(enemy.y + enemy.h, 6 * 32)
assert.isAtLeast(enemy.x, 36 * 32)
assert.isAtMost(enemy.x + enemy.w, 40 * 32)
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

loadLevel()
requestAnimationFrame(loop)
```
