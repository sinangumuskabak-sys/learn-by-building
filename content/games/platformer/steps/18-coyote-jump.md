---
title: Coyote time
title_tr: Coyote time
skills: [game.input, game.state]
---

# --goal--

`jump` now asks the counter instead of `grounded`. Using the jump empties the counter, so there is no second jump in the
air.

# --goal-tr--

Şimdi `jump`, `grounded` yerine **sayaca** bakacak: sayaç 0'dan büyükse zıpla. Yerdeyken sayaç zaten dolu; kenardan
yeni çıktıysan da birkaç kare dolu kalıyor.

Zıplayınca sayacı **sıfırlıyoruz**. Yoksa havadaki o birkaç karede ikinci kez zıplayabilirdin.

# --code--

```js
if (coyote > 0) {
  player.vy = JUMP
  coyote = 0
}
```

# --meaning--

- The jump is allowed while the counter is above 0.
- `coyote = 0` uses it up: no double jump.

# --meaning-tr--

- `if (coyote > 0) {` → sayaçta kare varsa zıplamaya izin ver.
- `player.vy = JUMP` → zıpla.
- `coyote = 0` → hakkı **kullandın**; havada ikinci zıplama yok.

# --task--

In `jump`, replace `player.grounded` with `coyote > 0` and add `coyote = 0` under `player.vy = JUMP`.

# --task-tr--

`jump` içinde `if (player.grounded) {` satırını `if (coyote > 0) {` yap ve `player.vy = JUMP` satırının altına
`coyote = 0` yaz. **Çalıştır** ve bir çukurun kenarından koşarken geç zıplamayı dene.

# --predict--

What would happen without `coyote = 0`?
- [ ] Nothing different
- [x] A quick second press right after a jump would jump again in the air
  The counter would still be above 0 for a few frames.
- [ ] You could never jump

# --predict-tr--

`coyote = 0` olmasaydı ne olurdu?
- [ ] Hiçbir fark olmazdı
- [x] Zıpladıktan hemen sonra hızlı ikinci bir basış havada yine zıplatırdı
  Sayaç birkaç kare daha 0'ın üstünde kalırdı.
- [ ] Hiç zıplayamazdın

# --tests--

A jump pressed a few frames after running off a ledge should still work.
tr: Kenardan çıktıktan birkaç kare sonra basılan zıplama yine çalışmalı.

```js
player.x = 480
$.tick(5)
player.x = 16 * 32 + 1
player.vx = 0
$.tick(3)
assert.isFalse(player.grounded)
$.press(' ')
assert.strictEqual(player.vy, -11.5)
```

Too long after leaving the ground, the jump should be refused, and there is no double jump.
tr: Yerden ayrıldıktan çok sonra zıplama reddedilmeli; çift zıplama da olmamalı.

```js
player.x = 480
$.tick(5)
player.x = 16 * 32 + 1
player.vx = 0
$.tick(8)
const vy = player.vy
$.press(' ')
assert.strictEqual(player.vy, vy)
loadLevel()
$.tick(2)
$.press(' ')
$.release(' ')
$.tick(1)
const up = player.vy
$.press(' ')
assert.strictEqual(player.vy, up, 'no second jump in the air')
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
