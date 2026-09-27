---
title: A camera that follows
title_tr: Takip eden kamera
skills: [game.canvas, game.state]
---

# --explanation--

The level is 2048 pixels wide; the screen shows 640. Run right and the player leaves the screen. You need a **camera**:
a window onto the world that follows the player.

The camera is just one number, `camera`: the world x coordinate of the screen's left edge. To keep the player in the
middle of the screen:

```js
camera = player.x + player.w / 2 - canvas.width / 2
```

and **clamp** it so the window never shows beyond the ends of the level (`0` to `COLS * TILE - canvas.width`).

Now the trick that makes a camera almost free: do not change how anything is drawn. Just shift the whole canvas before
drawing the world, and shift it back afterwards:

```js
ctx.save()
ctx.translate(-camera, 0)   // everything drawn now moves left by `camera` pixels
// ...draw tiles and the player at their normal world positions...
ctx.restore()               // back to screen coordinates, e.g. for the score
```

Each thing keeps its **world coordinates**; only the view moves. `Math.round(camera)` avoids blurry half-pixel
drawing.

A bonus: since you know which part of the world is visible, only draw the tile columns on screen, about 21 of 64. This
is called **culling**, and it is how huge levels stay fast.

# --explanation-tr--

Bölüm 2048 piksel genişliğinde; ekran 640'ını gösteriyor. Sağa koş, oyuncu ekrandan çıkar. Bir **kameraya** ihtiyacın
var: dünyaya açılan ve oyuncuyu takip eden bir pencere.

Kamera yalnızca bir sayıdır, `camera`: ekranın sol kenarının dünyadaki x koordinatı. Oyuncuyu ekranın ortasında tutmak
için:

```js
camera = player.x + player.w / 2 - canvas.width / 2
```

ve pencere bölümün uçlarının ötesini hiç göstermesin diye onu **sınırla** (`0` ile `COLS * TILE - canvas.width` arası).

Şimdi kamerayı neredeyse bedava yapan hile: hiçbir şeyin çizilişini değiştirme. Dünyayı çizmeden önce tüm canvas'ı
kaydır, sonra geri al:

```js
ctx.save()
ctx.translate(-camera, 0)   // şimdi çizilen her şey `camera` piksel sola kayar
// ...döşemeleri ve oyuncuyu normal dünya konumlarına çiz...
ctx.restore()               // ekran koordinatlarına geri dön, örneğin skor için
```

Her şey kendi **dünya koordinatlarını** korur; yalnızca görünüm hareket eder. `Math.round(camera)` bulanık yarım piksel
çizimleri önler.

Bir bonus: dünyanın hangi kısmının göründüğünü bildiğin için yalnızca ekrandaki döşeme sütunlarını çiz, 64'ün yaklaşık
21'ini. Buna **ayıklama** (culling) denir ve dev bölümler böyle hızlı kalır.

# --task--

1. Add `let camera = 0`. At the end of `update()`, set it so the player is centered, clamped between `0` and
   `COLS * TILE - canvas.width`.
2. In `draw()`, after the sky: `ctx.save()` and `ctx.translate(-Math.round(camera), 0)`; draw the tiles and the
   player as before; then `ctx.restore()`.
3. Only draw the columns from `first = Math.floor(camera / TILE)` to
   `last = Math.min(COLS - 1, first + Math.ceil(canvas.width / TILE))`.

# --task-tr--

1. `let camera = 0` ekle. `update()`'in sonunda onu, oyuncu ortada olacak şekilde, `0` ile `COLS * TILE - canvas.width`
   arasında sınırlayarak ayarla.
2. `draw()` içinde gökyüzünden sonra: `ctx.save()` ve `ctx.translate(-Math.round(camera), 0)`; döşemeleri ve oyuncuyu
   eskisi gibi çiz; sonra `ctx.restore()`.
3. Yalnızca `first = Math.floor(camera / TILE)` ile `last = Math.min(COLS - 1, first + Math.ceil(canvas.width / TILE))`
   arasındaki sütunları çiz.

# --tests--

At the start of the level the camera should stay at 0.
tr: Bölümün başında kamera 0'da kalmalı.

```js
$.tick()
assert.strictEqual(camera, 0)
```

The camera should keep the player centered while running.
tr: Koşarken kamera oyuncuyu ortada tutmalı.

```js
player.x = 1000
$.tick()
assert.closeTo(camera, player.x + 12 - 320, 0.001)
const shift = $.screen().find((c) => c.op === 'translate')
assert.deepEqual(shift.args, [-Math.round(camera), 0])
```

The camera should stop at the right end of the level.
tr: Kamera bölümün sağ ucunda durmalı.

```js
player.x = 2000
player.y = 100
$.tick()
assert.strictEqual(camera, 2048 - 640)
```

Only the tiles on screen should be drawn.
tr: Yalnızca ekrandaki döşemeler çizilmeli.

```js
player.x = 1000
$.tick()
const tiles = [...$.rects('#78350f'), ...$.rects('#c2410c')]
assert.isAbove(tiles.length, 20)
assert.isTrue(tiles.every((t) => t.x >= camera - 32 && t.x <= camera + 640), 'every drawn tile is on screen')
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
LEVEL.forEach((line, row) => {
  const col = line.indexOf('P')
  if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
})
let coyote = 0
let camera = 0 // world x of the screen's left edge
const keys = {}

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

// Move along one axis at a time; if that ends inside a tile, snap back to the tile's edge.
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

function update() {
  const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  if (input !== 0) player.vx += input * ACCEL
  else player.vx *= FRICTION
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
  if (Math.abs(player.vx) < 0.05) player.vx = 0
  moveX(player)

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  moveY(player)
  coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)

  // Keep the player in the middle of the screen, without showing past either end of the level.
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

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
