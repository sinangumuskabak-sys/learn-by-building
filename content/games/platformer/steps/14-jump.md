---
title: Jump
title_tr: Zıpla
skills: [game.input, game.physics]
---

# --goal--

A jump is just an upward speed: `vy = JUMP`, a negative number. Gravity does the rest: it slows the rise, turns it into a
fall and lands the player. You may only jump while standing on something.

# --goal-tr--

Zıplamak yalnızca **yukarı doğru bir hızdır**: `vy = JUMP`. Canvas'ta yukarı y'nin **azalması** demek, bu yüzden sayı
eksi. Gerisini yerçekimi yapar: yükselişi yavaşlatır, düşüşe çevirir ve oyuncuyu yere indirir. Gerçek bir top atışı gibi
bir kavis çıkar.

Yalnız **yerdeyken** zıplanabilir; yoksa havada zıplaya zıplaya uçardın.

# --code--

```js
const JUMP = -11.5

function jump() {
  if (player.grounded) {
    player.vy = JUMP
  }
}

  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
```

# --meaning--

- `JUMP` is negative because up is negative y.
- `jump` only works when `grounded`.
- Space or the up arrow call it. `event.repeat` is true for the automatic repeats of a held key, so holding the key does
  not jump again and again.

# --meaning-tr--

- `const JUMP = -11.5` → zıplama hızı; eksi, çünkü yukarı.
- `function jump()` → yalnız `player.grounded` doğruysa hızı `JUMP` yap.
- `if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()` → Boşluk **veya** yukarı ok basıldıysa
  **ve** bu bir tekrar değilse zıpla. Bir tuşu basılı tutunca tarayıcı saniyede birkaç kez "yine basıldı" der; bunlarda
  `event.repeat` doğrudur. Böylece tuşu basılı tutmak zıplamayı tekrarlamaz.

# --task--

1. Under `FRICTION` write `JUMP`.
2. Above the `keydown` listener write `jump`, with an empty line after it.
3. In the `keydown` listener, under `keys[event.key] = true`, write the jump line.

# --task-tr--

1. `FRICTION` satırının altına `JUMP` yaz.
2. `keydown` dinleyicisinin **üstüne** `jump` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `keydown` dinleyicisinde `keys[event.key] = true` satırının altına zıplama satırını yaz.
4. **Çalıştır** ve Boşluk'a bas: kutu zıplamalı. Sütunun üstüne zıplayabilir misin?

# --predict--

Jump under the brick platform. What happens when the box reaches the bricks?
- [ ] It bumps its head and falls back
- [x] It flies up through the bricks
  `moveY` only handles falling into a tile so far. The next step adds bumping.
- [ ] It sticks to them

# --predict-tr--

Tuğla platformun altına gidip zıpla. Kutu tuğlalara ulaşınca ne olur?
- [ ] Kafasını çarpıp geri düşer
- [x] Tuğlaların içinden geçip yükselir
  `moveY` şimdilik yalnız döşemeye düşmeyi ele alıyor. Kafa çarpmayı bir sonraki adımda ekleyeceğiz.
- [ ] Onlara yapışır

# --tests--

The player should jump from the ground about four tiles high.
tr: Oyuncu zeminden yaklaşık dört döşeme yükseğe zıplamalı.

```js
$.tick()
$.press(' ')
assert.strictEqual(player.vy, -11.5)
let highest = player.y
for (let i = 0; i < 60; i++) {
  $.tick()
  highest = Math.min(highest, player.y)
}
assert.closeTo(258 - highest, 126, 4)
assert.isTrue(player.grounded)
```

There should be no jumping in the air, and the up arrow should work too.
tr: Havada zıplama olmamalı; yukarı ok da çalışmalı.

```js
$.tick()
$.press('ArrowUp')
assert.strictEqual(player.vy, -11.5)
$.release('ArrowUp')
$.tick(3)
const vy = player.vy
$.press(' ')
assert.strictEqual(player.vy, vy, 'no jumping in the air')
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
