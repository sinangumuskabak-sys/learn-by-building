---
title: Coins
title_tr: Altınlar
skills: [prog.arrays, game.canvas]
---

# --goal--

The `o` characters are coins. Tiles stay in the level forever, but coins disappear when collected, so `loadLevel` copies
each one out of the text into an object in `coins`. They are drawn as yellow circles, in the world.

# --goal-tr--

Bölümdeki `o` harfleri **altın**. Zemin döşemeleri bölümde sonsuza kadar kalır, ama altınlar **toplanınca kaybolur**:
değişen şeylerdir. Bu yüzden oyuncu gibi, `loadLevel` onları da yazıdan çıkarıp **nesnelere** çevirecek: her `o` için
`coins` dizisine bir altın.

Altınları sarı **daire** olarak çizeceğiz. Daire çizmek dikdörtgenden biraz farklı: önce bir yol (path) çizilir, sonra
içi doldurulur.

# --code--

```js
let coins

  coins = []

      if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- A coin is a 16×16 box in the middle of its tile (8 pixels in), and `taken: false`.
- `coins = []` at the start of `loadLevel` empties the list before filling it.
- `beginPath` starts a shape; `arc(cx, cy, r, 0, Math.PI * 2)` is a full circle of radius `r` around `(cx, cy)`; `fill`
  paints it.
- Taken coins are skipped with `continue`. The coins are drawn before `restore`, so they scroll with the world.

# --meaning-tr--

- `let coins` → altınların listesi. `loadLevel`'ın başında `coins = []` → her yüklemede boşalt, sonra doldur.
- `if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })` → döşemenin ortasında (8
  piksel içeride) 16×16'lık bir kutu; `taken` → toplandı mı?
- `ctx.fillStyle = '#facc15'` → sarı.
- `if (coin.taken) continue` → toplanmış altını atla (bir sonraki adımda toplamaya başlayacağız).
- `ctx.beginPath()` → yeni bir **şekil** başlat.
- `ctx.arc(merkezX, merkezY, yarıçap, 0, Math.PI * 2)` → bir **yay** çizer: son iki sayı başlangıç ve bitiş açısı
  (radyan). `Math.PI * 2` bir tam tur, yani **tam daire**. Merkez kutunun ortası: `coin.x + coin.w / 2`.
- `ctx.fill()` → şeklin içini boya.
- Altınlar `restore`'dan **önce** çizilir: dünyanın parçası oldukları için kamerayla birlikte kayarlar.

# --task--

1. Under `let player` write `let coins`.
2. In `loadLevel`, write `coins = []` first, and the `'o'` line under the `'P'` line.
3. In `draw`, above `ctx.fillStyle = '#dc2626'`, write the coin drawing and an empty line.

# --task-tr--

1. `let player` satırının altına `let coins` yaz.
2. `loadLevel` içinde **ilk satır** olarak `coins = []` yaz; `'P'` satırının altına `'o'` satırını yaz.
3. `draw` içinde `ctx.fillStyle = '#dc2626'` satırının **üstüne** altınları çizen satırları yaz ve bir boş satır bırak.
4. **Çalıştır**: havada sarı altınlar görmelisin.

# --tests--

Every `o` in the level should become a coin.
tr: Bölümdeki her `o` bir altına dönüşmeli.

```js
const count = LEVEL.join('').split('o').length - 1
assert.lengthOf(coins, count)
assert.deepInclude(coins, { x: 4 * 32 + 8, y: 7 * 32 + 8, w: 16, h: 16, taken: false })
```

Coins should be drawn as yellow circles at their centers.
tr: Altınlar merkezlerinde sarı daireler olarak çizilmeli.

```js
$.tick()
const arcs = $.arcs().filter((a) => a.color === '#facc15')
assert.deepInclude(arcs, { x: 4 * 32 + 16, y: 7 * 32 + 16, r: 8, color: '#facc15' })
coins[0].taken = true
$.tick()
assert.lengthOf($.arcs().filter((a) => a.color === '#facc15'), arcs.length - 1, 'taken coins are not drawn')
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
let coins
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
  coins = []
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
      if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
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

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
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
