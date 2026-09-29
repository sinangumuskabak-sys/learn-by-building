---
title: Walls
title_tr: Duvarlar
skills: [game.collision]
---

# --goal--

Walls work like floors: move **sideways first**, and if that lands inside a tile, snap back to its side. Then move
vertically, as before. Handling the two axes **separately** is the key trick of tile collisions.

# --goal-tr--

Kutu şu an duvarların içinden geçiyor. Duvarlar da zemin gibi çalışır: önce **yatay** hareket et; bir döşemenin içine
girdiysen onun **yanına** geri yapıştır. Sonra, önceki gibi, dikey hareket.

İki ekseni **ayrı ayrı** ele almak, döşeme çarpışmalarının anahtar hilesidir. İkisini birden hareket ettirip sonra bir
çakışma bulsaydın, çarptığın şeyin duvar mı zemin mi olduğunu anlayamazdın; kutu döşemelerin eklem yerlerine takılırdı.

# --code--

```js
// Move along one axis at a time; if that ends inside a wall, snap back to the wall's edge.
function moveX(body) {
  body.x += body.vx
  if (!overlapsSolid(body)) return false
  if (body.vx > 0) body.x = Math.floor((body.x + body.w - EPS) / TILE) * TILE - body.w
  else body.x = Math.floor(body.x / TILE) * TILE + TILE
  body.vx = 0
  return true
}

  moveX(player)
```

# --meaning--

- Moving right into a tile: its left edge is `Math.floor((x + w - EPS) / TILE) * TILE`; the body's right side goes there.
- Moving left: the body's left side goes to the right edge of the tile it entered, `Math.floor(x / TILE) * TILE + TILE`.
- It returns `true` when it hit a wall, `false` otherwise. The enemies will use that answer to turn around.

# --meaning-tr--

- `body.x += body.vx` → önce yatay hareket.
- `if (!overlapsSolid(body)) return false` → bir şeye girmediyse "duvara çarpmadım" (`false`) de ve çık.
- `if (body.vx > 0)` → **sağa** gidiyorduk: `Math.floor((body.x + body.w - EPS) / TILE) * TILE` sağ kenarın girdiği
  döşemenin **sol kenarı**; `- body.w` ile kutunun sağ tarafı tam oraya yaslanır.
- `else` → **sola** gidiyorduk: `Math.floor(body.x / TILE) * TILE` sol kenarın girdiği döşemenin sol kenarı; `+ TILE` o
  döşemenin **sağ kenarı**. Kutunun sol tarafı oraya yaslanır.
- `body.vx = 0` → duvara çarpınca yatay hız biter.
- `return true` → "duvara çarptım". Bu cevabı ileride düşmanlar geri dönmek için kullanacak.
- `updatePlayer` içinde `player.x += player.vx` yerine `moveX(player)`.

# --task--

1. Above `function moveY(body) {` write `moveX` with its comment, and an empty line after it.
2. In `updatePlayer`, replace `player.x += player.vx` with `moveX(player)`.

# --task-tr--

1. `function moveY(body) {` satırının **üstüne** yorumuyla birlikte `moveX` fonksiyonunu yaz; altında bir boş satır
   kalsın.
2. `updatePlayer` içindeki `player.x += player.vx` satırını sil; yerine `moveX(player)` yaz.
3. **Çalıştır** ve sağa koş: kutu ilk sütuna çarpıp durmalı.

# --hint--

Moving left, the body goes to the tile's **right** edge: `Math.floor(body.x / TILE) * TILE + TILE`.

# --hint-tr--

Sola giderken kutu döşemenin **sağ** kenarına yaslanır: `Math.floor(body.x / TILE) * TILE + TILE`.

# --tests--

Walls should stop the player exactly at their side.
tr: Duvarlar oyuncuyu tam yanlarında durdurmalı.

```js
player.x = 600
$.press('ArrowRight')
$.tick(60)
assert.strictEqual(player.x, 22 * 32 - 24, 'right side of the player against the pillar')
assert.strictEqual(player.vx, 0)
```

The left end of the level should be a wall too.
tr: Bölümün sol ucu da bir duvar olmalı.

```js
$.press('ArrowLeft')
$.tick(60)
assert.strictEqual(player.x, 0)
assert.strictEqual(player.y, 258, 'still standing on the ground')
```

`moveX` should say whether it hit a wall.
tr: `moveX` duvara çarpıp çarpmadığını söylemeli.

```js
const box = { x: 600, y: 240, w: 24, h: 30, vx: 3 }
assert.isFalse(moveX(box))
box.x = 22 * 32 - 26
assert.isTrue(moveX(box))
assert.strictEqual(box.x, 22 * 32 - 24)
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
