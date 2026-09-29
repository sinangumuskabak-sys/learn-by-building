---
title: Landing on tiles
title_tr: Döşemelere inmek
skills: [game.physics, game.collision]
---

# --goal--

The recipe for collisions: **move, then check**. If the move ended inside something solid, snap back to the edge of the
tile you ran into. Falling into a tile puts the feet exactly on its top, and the body is `grounded`.

# --goal-tr--

Çarpışmanın tarifi: **önce hareket et, sonra kontrol et.** Hareket katı bir şeyin içinde bittiyse, çarptığın döşemenin
**kenarına geri yapıştır**.

Düşerken (`vy > 0`) ayaklar alttaki döşemeye girmiştir: ayakları o döşemenin **tam üstüne** koyarız ve oyuncu artık
**yerde** (`grounded`). Her durumda dikey hız sıfırlanır. `moveY` her kutuyla çalışacak; ileride düşmanlar da onu
kullanacak.

# --code--

```js
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

  moveY(player)
```

# --meaning--

- `grounded` is false unless this move lands on something.
- If after moving the body overlaps nothing, we are done.
- Falling: `Math.floor((y + h - EPS) / TILE)` is the row the feet went into; times `TILE` is that tile's top; minus `h`
  puts the feet exactly on it.
- `vy = 0` stops the fall.

# --meaning-tr--

- `body.grounded = false` → bir şeye inmedikçe yerde sayılmaz.
- `body.y += body.vy` → önce hareket et.
- `if (!overlapsSolid(body)) return` → bir şeye girmediyse iş bitti.
- `if (body.vy > 0) {` → aşağı gidiyorduk, yani ayaklar bir döşemeye girdi:
  - `Math.floor((body.y + body.h - EPS) / TILE)` → ayakların girdiği **satır**.
  - `* TILE` → o döşemenin **üst kenarı** (piksel). `- body.h` → ayaklar tam oraya gelsin diye kutunun y'si.
  - `body.grounded = true` → artık yerde.
- `body.vy = 0` → dikey hareket durur.
- `updatePlayer` içinde `player.y += player.vy` yerine `moveY(player)`.

# --task--

1. Under `overlapsSolid`, leave an empty line and write `moveY`.
2. In `updatePlayer`, replace `player.y += player.vy` with `moveY(player)`. Press **Run**.

# --task-tr--

1. `overlapsSolid` fonksiyonunun altına bir boş satır bırak ve `moveY` fonksiyonunu yaz.
2. `updatePlayer` içindeki `player.y += player.vy` satırını sil; yerine `moveY(player)` yaz.
3. **Çalıştır**: kutu artık zeminde duruyor.

# --try--

Set `player.y` to `20` in `loadLevel` for a moment (`y: 20`) and run: the box drops from the sky and lands. Put `y + 2` back.

# --try-tr--

Bir anlığına `loadLevel` içinde oyuncunun `y`'sini `20` yap ve çalıştır: kutu gökten düşüp zemine iner. Sonra `y + 2`'ye geri al.

# --tests--

Standing on the ground, the player should stay put and be grounded.
tr: Zeminde dururken oyuncu yerinde kalmalı ve yerde sayılmalı.

```js
$.tick(30)
assert.strictEqual(player.y, 258)
assert.strictEqual(player.vy, 0)
assert.isTrue(player.grounded)
```

Dropped from the sky, the player should land exactly on the ground.
tr: Gökyüzünden bırakılan oyuncu tam zeminin üstüne inmeli.

```js
player.y = 20
$.tick(10)
assert.isFalse(player.grounded)
$.tick(60)
assert.strictEqual(player.y, 258)
assert.isTrue(player.grounded)
```

Over a pit, the player should fall out of the world.
tr: Çukurun üstünde oyuncu dünyadan düşmeli.

```js
player.x = 16 * 32 + 4
$.tick(40)
assert.isAbove(player.y, 352)
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

let player

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

function updatePlayer() {
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
