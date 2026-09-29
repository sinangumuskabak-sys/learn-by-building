---
title: Speed up
title_tr: Hızlan
skills: [game.physics, game.input]
---

# --goal--

A platformer hero feels better with **momentum**: holding a direction builds up speed bit by bit, up to `MAX_SPEED`,
instead of jumping to full speed at once.

# --goal-tr--

En basit hareket: tuşa basınca hemen sabit hızla git. Ama platform kahramanı **momentumla** daha iyi hissettirir: bir
yöne bastıkça hız **azar azar** artar, `MAX_SPEED`'e kadar. Gerçek bir koşucu gibi.

Tuşların durumunu tek bir sayıya çevireceğiz: sağ `1`, sol `-1`, ikisi de değil (ya da ikisi birden) `0`.

# --code--

```js
const ACCEL = 0.5
const MAX_SPEED = 4

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

  const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  if (input !== 0) player.vx += input * ACCEL
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
  player.x += player.vx
```

# --meaning--

- `clamp` keeps a value between `min` and `max`.
- `input` is 1 for right, -1 for left, 0 for neither or both.
- Each frame a direction is held, `vx` grows by `ACCEL` in that direction, clamped to ±4.
- `x += vx` moves the player sideways.

# --meaning-tr--

- `function clamp(value, min, max)` → bir sayıyı iki sınır **arasında tutar**: `Math.min(max, value)` üst sınırı,
  `Math.max(min, ...)` alt sınırı uygular. `clamp(7, -4, 4)` → 4, `clamp(-9, -4, 4)` → −4, `clamp(2, -4, 4)` → 2.
- `const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)` → koşul işleciyle her tuş 1 ya da 0 olur; farkı
  yön verir: yalnız sağ → 1, yalnız sol → −1, hiçbiri ya da ikisi → 0.
- `if (input !== 0) player.vx += input * ACCEL` → bir yöne basılıyorsa hıza o yönde 0.5 ekle.
- `player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)` → hız −4 ile 4 arasında kalsın.
- `player.x += player.vx` → oyuncuyu yatay hızı kadar kaydır.

# --task--

1. Under `MAX_FALL` write `ACCEL` and `MAX_SPEED`.
2. Above `function solidAt(x, y) {` write `clamp`.
3. At the top of `updatePlayer` write the four lines and an empty line.

# --task-tr--

1. `MAX_FALL` satırının altına `ACCEL` ve `MAX_SPEED` satırlarını yaz.
2. `function solidAt(x, y) {` satırının **üstüne** `clamp` fonksiyonunu yaz; aralarında bir boş satır kalsın.
3. `updatePlayer` içinde **en üste** dört satırı yaz, altlarında bir boş satır bırak.
4. **Çalıştır**, oyuna tıkla ve sağ oka bas.

# --predict--

Hold right for a while, then let go. What happens?
- [ ] The box stops at once
- [ ] The box slows down and stops
- [x] The box keeps sliding at full speed
  Nothing ever takes speed away yet. The next step fixes that.

# --predict-tr--

Sağ oku bir süre basılı tut, sonra bırak. Ne olur?
- [ ] Kutu hemen durur
- [ ] Kutu yavaşlayıp durur
- [x] Kutu tam hızla kaymaya devam eder
  Henüz hızı azaltan hiçbir şey yok. Bir sonraki adımda düzelteceğiz.

# --tests--

Holding right should build up speed to `MAX_SPEED`.
tr: Sağı basılı tutmak hızı `MAX_SPEED`'e kadar artırmalı.

```js
assert.deepEqual([ACCEL, MAX_SPEED], [0.5, 4])
$.press('ArrowRight')
$.tick()
assert.strictEqual(player.vx, 0.5)
$.tick(3)
assert.strictEqual(player.vx, 2)
$.tick(20)
assert.strictEqual(player.vx, 4)
assert.isAbove(player.x, 68)
```

Holding left should go the other way; both keys cancel out.
tr: Solu tutmak ters yöne götürmeli; iki tuş birbirini götürmeli.

```js
assert.deepEqual([clamp(7, -4, 4), clamp(-9, -4, 4), clamp(2, -4, 4)], [4, -4, 2])
player.x = 200
$.press('ArrowLeft')
$.tick(2)
assert.strictEqual(player.vx, -1)
$.press('ArrowRight')
$.tick(2)
assert.strictEqual(player.vx, -1, 'both held: no change')
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
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
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
