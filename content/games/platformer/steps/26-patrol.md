---
title: Enemies that walk
title_tr: Yürüyen düşmanlar
skills: [game.physics, prog.functions]
---

# --goal--

Here the work on `moveX` and `moveY` pays off: they take **any** body. An enemy walks one pixel a frame in its direction,
turns around when `moveX` reports a wall, and falls and lands with the same gravity as the player.

# --goal-tr--

`moveX` ve `moveY`'yi **her kutu** için yazmıştık; şimdi karşılığını alıyoruz. Bir düşman, oyuncuyla **aynı
fonksiyonlarla** yürür, düşer, zemine iner ve duvara çarpar. Fiziği bir kez yaz, hareket eden her şey için kullan.

Düşmanın ilk kuralı: yönünde karede bir piksel yürü; `moveX` "duvara çarptım" (`true`) derse **geri dön**.

# --code--

```js
function updateEnemy(enemy) {
  enemy.vx = enemy.dir
  if (moveX(enemy)) enemy.dir = -enemy.dir
  enemy.vy = Math.min(MAX_FALL, enemy.vy + GRAVITY)
  moveY(enemy)
}

  for (const enemy of enemies) updateEnemy(enemy)
```

# --meaning--

- `vx = dir`: one pixel per frame left or right.
- `moveX` returns `true` at a wall; then `dir = -dir` turns the enemy around.
- Gravity and `moveY` exactly as for the player.
- `update` calls it for every enemy, after the player.

# --meaning-tr--

- `enemy.vx = enemy.dir` → hız yön kadar: karede 1 piksel sola ya da sağa.
- `if (moveX(enemy)) enemy.dir = -enemy.dir` → `moveX` hem hareket ettirir hem "duvara çarptım mı?" diye cevap verir.
  Çarptıysa yönü **ters çevir**: −1 → 1, 1 → −1.
- `enemy.vy = ...` ve `moveY(enemy)` → oyuncununkiyle aynı yerçekimi ve iniş.
- `update` içinde `for (const enemy of enemies) updateEnemy(enemy)` → oyuncudan sonra her düşmanı güncelle. Döngünün
  gövdesi tek satırsa süslü parantez gerekmez.

# --task--

1. Above `function update() {` write `updateEnemy`, with an empty line after it.
2. In `update`, under `updatePlayer()`, write the enemy loop.

# --task-tr--

1. `function update() {` satırının **üstüne** `updateEnemy` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `update` içinde `updatePlayer()` satırının hemen altına düşman döngüsünü yaz.
3. **Çalıştır**: düşmanlar yürümeli. (Oyuncu şimdilik içlerinden geçebilir.)

# --predict--

The enemy on the brick platform walks left. What happens at the platform's edge?
- [ ] It turns around
- [x] It walks off and falls
  Only walls turn it around so far. Ledges come next.
- [ ] It stops

# --predict-tr--

Tuğla platformdaki düşman sola yürüyor. Platformun kenarında ne olur?
- [ ] Geri döner
- [x] Kenardan yürüyüp düşer
  Şimdilik yalnız duvarlar onu döndürüyor. Kenarlar bir sonraki adımda.
- [ ] Durur

# --tests--

Enemies should walk one pixel per frame and stay on the ground.
tr: Düşmanlar karede bir piksel yürümeli ve zeminde kalmalı.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
$.tick(10)
assert.strictEqual(enemy.x, 26 * 32 + 2 - 10)
assert.strictEqual(enemy.y + enemy.h, 9 * 32)
```

An enemy should turn around at a wall.
tr: Bir düşman duvarda geri dönmeli.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
enemy.x = 23 * 32 + 3
$.tick(5)
assert.strictEqual(enemy.dir, 1, 'it walked into the pillar and turned')
assert.isAtLeast(enemy.x, 23 * 32)
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
