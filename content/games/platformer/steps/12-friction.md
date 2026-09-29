---
title: Friction
title_tr: Sürtünme
skills: [game.physics]
---

# --goal--

When no direction is held, the speed should bleed away: each frame it keeps only 80% of itself. Tiny speeds are snapped to
exactly 0, or the player would drift forever by fractions of a pixel.

# --goal-tr--

Tuş bırakılınca hız **erimeli**. Her karede hızın yalnız **%80'ini** tutacağız: 4 → 3.2 → 2.56 → 2.05... Hızlıca küçülür.

Ama bir sorun var: bir sayıyı 0.8 ile çarpmaya devam edersen **hiçbir zaman tam 0 olmaz** (0.001, 0.0008...). Oyuncu
piksel kesirleriyle sonsuza kadar kayar. Bu yüzden çok küçük hızları **tam 0** yapacağız. `ACCEL` ile `FRICTION`'ı
ayarlamak, bir oyunun "kaygan" ya da "sıkı" hissettirmesinin büyük kısmıdır.

# --code--

```js
const FRICTION = 0.8

  else player.vx *= FRICTION

  if (Math.abs(player.vx) < 0.05) player.vx = 0
```

# --meaning--

- `else` runs when no direction is held: `vx *= 0.8` keeps 80% of the speed.
- `Math.abs` is the size of a number without its sign; under 0.05 either way, the speed becomes exactly 0.

# --meaning-tr--

- `const FRICTION = 0.8` → sürtünme: her karede hızın kalan payı.
- `else player.vx *= FRICTION` → hiçbir yöne basılmıyorsa hızı 0.8 ile çarp. `*=` "kendisiyle çarp".
- `Math.abs(player.vx)` → sayının **işaretsiz** büyüklüğü: `Math.abs(-0.03)` → 0.03. Sağa da sola da gidiyor olsa...
- `< 0.05` → ...hız çok küçükse `player.vx = 0`: tam dur.

# --task--

1. Under `MAX_SPEED` write `FRICTION`.
2. In `updatePlayer`, write the `else` line under the `if (input !== 0)` line.
3. Write the `Math.abs` line under the `clamp` line.

# --task-tr--

1. `MAX_SPEED` satırının altına `FRICTION` yaz.
2. `updatePlayer` içinde `if (input !== 0) ...` satırının altına `else` satırını yaz.
3. `player.vx = clamp(...)` satırının altına `Math.abs` satırını yaz.
4. **Çalıştır**: sağ oka basıp bırakınca kutu kayarak durmalı.

# --try--

Try `FRICTION = 0.97`: the box slides like on ice. Put 0.8 back.

# --try-tr--

`FRICTION = 0.97` dene: kutu buz üstündeymiş gibi kayar. Sonra 0.8'e geri al.

# --tests--

Letting go should slow down smoothly to a full stop.
tr: Bırakmak yumuşakça tam bir duruşa kadar yavaşlatmalı.

```js
assert.strictEqual(FRICTION, 0.8)
$.press('ArrowRight')
$.tick(20)
$.release('ArrowRight')
$.tick()
assert.closeTo(player.vx, 3.2, 0.001)
$.tick(40)
assert.strictEqual(player.vx, 0)
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

function moveY(body) {
  body.grounded = false
  body.y += body.vy
  if (!overlapsSolid(body)) return
  if (body.vy > 0) {
    body.y = Math.floor((body.y + body.h - EPS) / TILE) * TILE - body.h
    body.grounded = true
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

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
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
  player.x += player.vx

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
