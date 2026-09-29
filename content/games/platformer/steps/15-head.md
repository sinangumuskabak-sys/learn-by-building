---
title: Bump your head
title_tr: Kafanı çarp
skills: [game.collision]
---

# --goal--

Rising into a tile, the head went into the tile above: put the head exactly at that tile's bottom. `vy = 0` then lets
gravity pull the body back down.

# --goal-tr--

Yükselirken (`vy < 0`) kafa üstteki döşemeye girmiştir. Kafayı o döşemenin **tam altına** koyarız. Sonra zaten yazdığımız
`body.vy = 0` yükselişi bitirir; yerçekimi oyuncuyu geri çeker.

# --code--

```js
} else {
  body.y = Math.floor(body.y / TILE) * TILE + TILE
}
```

# --meaning--

- `Math.floor(y / TILE)` is the row the head went into; times `TILE` plus `TILE` is that tile's bottom edge.

# --meaning-tr--

- `else` → `vy > 0` değilse, yani **yukarı** gidiyorduk.
- `Math.floor(body.y / TILE)` → kafanın girdiği **satır**; `* TILE + TILE` → o döşemenin **alt kenarı**. Kutunun üstü
  (`body.y`) tam oraya gelir.
- `grounded` burada `false` kalır: tavana çarpmak yere basmak değildir.

# --task--

In `moveY`, after the `if (body.vy > 0) { ... }` block, add the `else` block before `body.vy = 0`.

# --task-tr--

`moveY` içinde `if (body.vy > 0) { ... }` bloğunun kapanan `}`'sini `} else {` yap, altına yeni satırı yaz ve bloğu `}`
ile kapat; `body.vy = 0` satırı altında kalsın. **Çalıştır**, tuğlaların altına git ve zıpla.

# --tests--

Jumping into a brick from below should bump the head.
tr: Alttan bir tuğlaya zıplamak kafayı çarptırmalı.

```js
player.x = 9 * 32 + 4
player.y = 230
player.vy = -8
moveY(player)
assert.strictEqual(player.y, 224, 'the head is right under the brick')
assert.strictEqual(player.vy, 0)
assert.isFalse(player.grounded)
```

A jump under the bricks should never go into them.
tr: Tuğlaların altındaki bir zıplama hiç içlerine girmemeli.

```js
player.x = 10 * 32 + 4
$.tick()
$.press(' ')
let highest = player.y
for (let i = 0; i < 40; i++) {
  $.tick()
  highest = Math.min(highest, player.y)
}
assert.strictEqual(highest, 224)
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

let player
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
}

function jump() {
  if (player.grounded) {
    player.vy = JUMP
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
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
}

function update() {
  updatePlayer()
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
