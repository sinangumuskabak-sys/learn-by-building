---
title: A camera that follows
title_tr: Takip eden kamera
skills: [game.canvas, game.state]
---

# --goal--

The level is 2048 pixels wide; the screen shows 640. We need a **camera**: one number, `camera`, the world x of the
screen's left edge. Before drawing the world we shift the whole canvas left by `camera`, and shift it back afterwards.

# --goal-tr--

Bölüm 2048 piksel genişliğinde, ekran ise 640. Sağa koşunca oyuncu ekrandan çıkıyor. Bir **kamera** lazım: dünyaya açılan
ve oyuncuyu izleyen bir pencere.

Kamera tek bir sayı: `camera` → ekranın sol kenarının dünyadaki x'i. Oyuncuyu ekranın ortasında tutmak için onu her
karede hesaplayacağız.

İşin güzel tarafı: hiçbir şeyin çizimini değiştirmeyeceğiz. Dünyayı çizmeden önce **bütün canvas'ı** `camera` kadar sola
kaydıracağız, çizimden sonra geri alacağız. Her şey kendi dünya koordinatında çizilir; yalnız bakış açısı kayar.

# --code--

```js
let camera

  camera = 0

  camera = player.x + player.w / 2 - canvas.width / 2

  ctx.save()
  ctx.translate(-Math.round(camera), 0)

  ctx.restore()
```

# --meaning--

- `camera` puts the player's middle (`x + w / 2`) in the middle of the screen (`canvas.width / 2`).
- `ctx.save()` remembers the drawing settings; `ctx.translate(-camera, 0)` moves everything drawn after it left by
  `camera` pixels; `ctx.restore()` goes back to normal.
- `Math.round` avoids blurry drawing at half pixels.

# --meaning-tr--

- `let camera` → kameranın x'i; `loadLevel` içinde `camera = 0`.
- `camera = player.x + player.w / 2 - canvas.width / 2` → oyuncunun **ortası** (`x + w / 2`) ekranın ortasına
  (`canvas.width / 2`, yani 320) gelsin. Oyuncu x = 1000'deyse kamera 1000 + 12 − 320 = 692.
- `ctx.save()` → çizim ayarlarının o anki hâlini **kaydeder**.
- `ctx.translate(-Math.round(camera), 0)` → bundan sonra çizilen **her şeyi** `camera` kadar sola kaydırır. Dünyada
  x = 692'de duran şey ekranda 0'a düşer. `Math.round` en yakın tam sayıya yuvarlar; yarım piksellerde çizim bulanık olmaz.
- `ctx.restore()` → kaydedilen ayarlara **geri döner**: kaydırma biter. (Ekranda sabit kalacak yazılar ileride bunun
  altına gelecek.)

# --task--

1. Above `let coyote` write `let camera`; in `loadLevel`, above `coyote = 0`, write `camera = 0`.
2. In `update`, under `updatePlayer()`, leave an empty line and write the `camera` line.
3. In `draw`, after the sky, leave an empty line and write `ctx.save()` and `ctx.translate(...)`.
4. At the end of `draw`, under the player's `fillRect`, write `ctx.restore()`.

# --task-tr--

1. `let coyote` satırının **üstüne** `let camera` yaz.
2. `loadLevel` içinde `coyote = 0` satırının **üstüne** `camera = 0` yaz.
3. `update` içinde `updatePlayer()` satırının altına bir boş satır bırak ve `camera` satırını yaz.
4. `draw` içinde gökyüzü `fillRect` satırının altına bir boş satır bırak; `ctx.save()` ve `ctx.translate(...)` yaz.
5. `draw`'ın sonunda, oyuncunun `fillRect` satırının altına `ctx.restore()` yaz.
6. **Çalıştır** ve sağa koş.

# --predict--

At the start the player is at x = 68. What will the screen look like?
- [ ] The same as before
- [x] The level slides right, with empty sky on the left
  `camera` is 68 + 12 − 320 = −240: the view starts 240 pixels left of the level. The next step fixes it.
- [ ] The player is at the left edge

# --predict-tr--

Başlangıçta oyuncu x = 68'de. Ekran nasıl görünecek?
- [ ] Öncekiyle aynı
- [x] Bölüm sağa kayar, solda boş gökyüzü kalır
  `camera` 68 + 12 − 320 = −240: görüntü bölümün 240 piksel solundan başlıyor. Bir sonraki adımda düzelteceğiz.
- [ ] Oyuncu sol kenarda

# --tests--

The camera should keep the player centered while running.
tr: Koşarken kamera oyuncuyu ortada tutmalı.

```js
player.x = 1000
$.tick()
assert.closeTo(camera, player.x + 12 - 320, 0.001)
const shift = $.screen().find((c) => c.op === 'translate')
assert.deepEqual(shift.args, [-Math.round(camera), 0])
```

The world should be drawn shifted, the player in the middle of the screen.
tr: Dünya kaydırılmış çizilmeli; oyuncu ekranın ortasında.

```js
player.x = 1000
$.tick()
const calls = $.screen()
const shift = calls.findIndex((c) => c.op === 'translate')
const body = calls.findIndex((c) => c.op === 'fillRect' && c.fill === '#dc2626')
assert.isAbove(body, shift, 'the player is drawn after ctx.translate')
assert.strictEqual(calls[body].args[0], player.x, 'at its world position')
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
let camera
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
  camera = 0
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

  camera = player.x + player.w / 2 - canvas.width / 2
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(-Math.round(camera), 0)

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
  ctx.restore()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
