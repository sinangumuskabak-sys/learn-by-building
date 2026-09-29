---
title: Short hops
title_tr: Kısa zıplamalar
skills: [game.input, game.physics]
---

# --goal--

Good platformers let you choose the height: hold the button for a full jump, tap it for a short hop. When the button is
released while still rising fast, the upward speed is cut to `CUT`.

# --goal-tr--

İyi platform oyunlarında zıplamanın yüksekliğini **sen** seçersin: tuşu basılı tutarsan tam zıplama, kısa dokunursan
küçük bir sekme. Bunu yapmanın basit bir yolu var: tuş **bırakıldığında** oyuncu hâlâ hızla yükseliyorsa, yukarı hızını
`CUT`'a (−4) indir. Yükseliş hemen yavaşlar.

# --code--

```js
const CUT = -4 // letting go early caps the upward speed at this

function endJump() {
  if (player.vy < CUT) player.vy = CUT
}

  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
```

# --meaning--

- Rising faster than 4 means `vy` is below -4 (more negative); then it is set to -4.
- Falling, or rising slowly, is left alone.
- `keyup` of Space or up calls it.

# --meaning-tr--

- `const CUT = -4` → bırakınca kalacak en büyük yukarı hız.
- `if (player.vy < CUT) player.vy = CUT` → eksi sayılarda dikkat: −11 **küçüktür** −4'ten, yani daha hızlı yükseliyor.
  O zaman hızı −4'e indir. Zaten yavaş yükseliyor ya da düşüyorsa (`vy` −4'ten büyük) dokunma.
- `keyup` içinde → Boşluk ya da yukarı ok **bırakılınca** `endJump()`.

# --task--

1. Under `JUMP` write `CUT`.
2. Under `jump`, leave an empty line and write `endJump`.
3. In the `keyup` listener, under `keys[event.key] = false`, write the `endJump` line.

# --task-tr--

1. `JUMP` satırının altına `CUT` yaz.
2. `jump` fonksiyonunun altına bir boş satır bırak ve `endJump` fonksiyonunu yaz.
3. `keyup` dinleyicisinde `keys[event.key] = false` satırının altına `endJump` satırını yaz.
4. **Çalıştır**: Boşluk'a kısa dokun, sonra uzun bas; farkı gör.

# --tests--

A released jump should be shorter.
tr: Bırakılan zıplama daha kısa olmalı.

```js
$.tick()
$.press(' ')
$.tick(2)
$.release(' ')
assert.strictEqual(player.vy, -4)
let highest = player.y
for (let i = 0; i < 30; i++) {
  $.tick()
  highest = Math.min(highest, player.y)
}
assert.isBelow(258 - highest, 60, 'a short hop')
```

Releasing while falling should change nothing.
tr: Düşerken bırakmak bir şey değiştirmemeli.

```js
player.vy = 3
endJump()
assert.strictEqual(player.vy, 3)
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
