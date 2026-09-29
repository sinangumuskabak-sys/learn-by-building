---
title: Count, and screen versus world
title_tr: "Say: ekran ve dünya"
skills: [game.state, game.canvas]
---

# --goal--

`collected` counts the coins. The counter is drawn **after** `ctx.restore()`, in screen coordinates, so it stays in the
corner while the world scrolls.

# --goal-tr--

Toplanan altınları sayacağız: `collected`. Sayaç ekranın sol üst köşesinde yazacak.

Önemli bir ayrım: **dünyanın** parçaları (döşemeler, altınlar, oyuncu) `save` ile `restore` **arasında** çizilir ve
kamerayla kayar. **Arayüz** (sayaç, canlar, mesajlar) `restore`'dan **sonra**, ekran koordinatında çizilir ve köşede
sabit kalır.

# --code--

```js
let collected

  collected = 0

      collected += 1

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected, 12, 26)
```

# --meaning--

- `collected` starts at 0 in `loadLevel` and goes up by one for each coin taken.
- The text is written after `restore`, so `(12, 26)` is always the screen's top-left corner.

# --meaning-tr--

- `let collected` → toplanan altın sayısı; `loadLevel` içinde `collected = 0`.
- `collected += 1` → altın alınınca bir artır. `if` içinde olduğu için her altın **bir kez** sayılır.
- Dört yazı satırı `ctx.restore()`'dan **sonra**: `(12, 26)` kamera nerede olursa olsun ekranın sol üst köşesi.

# --task--

1. Under `let camera` write `let collected`; in `loadLevel`, under `camera = 0`, write `collected = 0`.
2. In the coin loop, under `coin.taken = true`, write `collected += 1`.
3. At the end of `draw`, under `ctx.restore()`, leave an empty line and write the four text lines.

# --task-tr--

1. `let camera` satırının altına `let collected` yaz.
2. `loadLevel` içinde `camera = 0` satırının altına `collected = 0` yaz.
3. `update`'teki altın döngüsünde `coin.taken = true` satırının altına `collected += 1` yaz.
4. `draw`'ın sonunda `ctx.restore()` satırının altına bir boş satır bırak ve dört yazı satırını yaz.
5. **Çalıştır**: sağa koşarken sayaç köşede sabit kalmalı.

# --tests--

Touching a coin should count it once.
tr: Bir altına dokunmak onu bir kez saymalı.

```js
player.x = 4 * 32
player.y = 7 * 32 + 2
player.vy = -1
update()
assert.strictEqual(collected, 1)
update()
assert.strictEqual(collected, 1)
```

The counter should stay on the screen, drawn after `ctx.restore()`.
tr: Sayaç ekranda sabit kalmalı, `ctx.restore()`'dan sonra çizilmeli.

```js
player.x = 1000
$.tick()
const calls = $.screen()
const restoreAt = calls.findIndex((c) => c.op === 'restore')
const text = calls.findIndex((c) => c.op === 'fillText' && String(c.args[0]).startsWith('Coins: 0'))
assert.isAbove(text, restoreAt, 'draw the counter after ctx.restore()')
assert.deepEqual(calls[text].args.slice(1), [12, 26])
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
let collected
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

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
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
  collected = 0
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

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
      collected += 1
    }
  }

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected, 12, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
