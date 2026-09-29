---
title: "Build it yourself: jump buffering"
title_tr: "Kendin yap: zıplama tamponu"
skills: [game.input, game.state]
---

# --goal--

Coyote time forgives a jump pressed a little too **late**. Now forgive one pressed a little too **early**: if the player
presses jump up to 6 frames before landing, remember it and jump the moment they land.

# --goal-tr--

Coyote time, biraz **geç** basılan zıplamayı affediyordu. Şimdi biraz **erken** basılanı affet: oyuncu yere inmeden
en fazla 6 kare önce zıplamaya basarsa bunu **hatırla** ve yere değdiği anda zıpla. Buna **zıplama tamponu** (jump
buffering) denir; iyi platform oyunlarının çoğunda gizlice vardır.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: coyote sayacına çok benzeyen bir sayaç, `jump`, `grounded`... Kontroller
çalıştığında yeşile döner.

# --task--

- A jump pressed in the air, up to 6 frames before landing, happens as soon as the player lands.
- A jump pressed earlier than that is forgotten.
- Jumping from the ground works as before, and a press in the air still does not jump there and then.

# --task-tr--

- Havadayken, yere inmeden en fazla **6 kare** önce basılan zıplama, oyuncu yere iner inmez gerçekleşsin.
- Bundan daha erken basılan zıplama **unutulsun**.
- Yerden zıplamak eskisi gibi çalışsın; havada basmak da o anda zıplatmasın.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Keep a counter `buffer`, like `coyote`. When `jump()` is refused, set it to 6. At the end of `updatePlayer`, count it down,
and if the player is grounded while it is above 0, empty it and call `jump()`.

# --hint-tr--

`coyote` gibi bir sayaç tut: `buffer`. `jump()` zıplatamadığında (havadayken) onu 6 yap. `updatePlayer`'ın sonunda her
karede bir azalt; sayaç 0'dan büyükken oyuncu **yerdeyse** sayacı sıfırla ve `jump()` çağır. `loadLevel`'da da 0'la.

# --tests--

A jump pressed 4 frames before landing should happen on landing.
tr: Yere inmeden 4 kare önce basılan zıplama inince gerçekleşmeli.

```js
player.y = 258 - 40
player.vy = 0
coyote = 0
$.tick(9)
$.press(' ')
$.release(' ')
assert.isAtLeast(player.vy, 0, 'no jump in the air')
$.tick(8)
assert.isBelow(player.y, 250, 'the jump happened on landing')
```

A jump pressed long before landing should be forgotten.
tr: İnmeden çok önce basılan zıplama unutulmalı.

```js
player.y = 258 - 200
player.vy = 0
coyote = 0
$.tick(2)
$.press(' ')
$.release(' ')
$.tick(40)
assert.strictEqual(player.y, 258)
assert.isTrue(player.grounded)
```

A jump from the ground should work as before.
tr: Yerden zıplama eskisi gibi çalışmalı.

```js
$.tick(1)
$.press(' ')
assert.strictEqual(player.vy, -11.5)
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
const BUFFER = 6 // frames a jump pressed just before landing is remembered

let player
let coins
let enemies
let flag
let camera
let collected
let lives
let coyote
let buffer
let state // 'playing', 'won' or 'over'
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
      if (line[col] === 'F') flag = { x: x + 14, y: 3 * TILE, w: 4, h: y + TILE - 3 * TILE }
    }
  })
  camera = 0
  collected = 0
  coyote = 0
  buffer = 0
  state = 'playing'
}

function newGame() {
  lives = 3
  loadLevel()
}

function jump() {
  if (state !== 'playing') {
    newGame()
    return
  }
  if (coyote > 0) {
    player.vy = JUMP
    coyote = 0
  } else buffer = BUFFER
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
  if (lives === 0) state = 'over'
  else loadLevel()
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
  if (buffer > 0) {
    buffer -= 1
    if (player.grounded) {
      buffer = 0
      jump()
    }
  }
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
  if (state !== 'playing') return
  updatePlayer()
  for (const enemy of enemies) if (enemy.alive) updateEnemy(enemy)

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
  if (overlaps(player, flag)) state = 'won'

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

  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(flag.x, flag.y, flag.w, flag.h)
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(flag.x + flag.w, flag.y, 24, 16)

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#7c2d12'
  for (const enemy of enemies) {
    if (enemy.alive) ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h)
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected + '   Lives: ' + lives, 12, 26)

  ctx.textAlign = 'center'
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(state === 'won' ? 'Level complete!' : 'Game Over', canvas.width / 2, 160)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, 200)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
