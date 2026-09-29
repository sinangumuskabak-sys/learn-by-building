---
title: Reach the flag
title_tr: Bayrağa ulaş
skills: [game.state]
---

# --goal--

Touching the pole wins the level: one overlap check and one more state, `'won'`. The end screen already appears for any
state that is not `'playing'`; it only needs the right words.

# --goal-tr--

Direğe dokunan oyuncu bölümü **kazanır**. Ne kadar az kod gerektiğine dikkat et: bir çakışma kontrolü ve bir durum daha,
`'won'`. Bitiş ekranı zaten `'playing'` olmayan her durumda çıkıyor; yalnız doğru yazıyı seçmesi gerek.

Bu, kurduğun yapının ödülü: bölüm yazısında **veri**, her kutu için **ortak** hareket ve çarpışma, oyunun akışı için
bir **durum makinesi**. Yeni içerik artık birkaç satıra mal oluyor.

# --code--

```js
if (overlaps(player, flag)) state = 'won'

  ctx.fillText(state === 'won' ? 'Level complete!' : 'Game Over', canvas.width / 2, 160)
```

# --meaning--

- After the pit check, touching the pole sets `state = 'won'`; `update` stops, the end screen shows.
- The big text is `Level complete!` when won, `Game Over` otherwise. Space starts a new game in both cases.

# --meaning-tr--

- `if (overlaps(player, flag)) state = 'won'` → direğe değdiysen kazandın. `update` durur, bitiş ekranı çıkar.
- `state === 'won' ? 'Level complete!' : 'Game Over'` → kazandıysan `Level complete!`, değilse `Game Over`.
- Boşluk her iki durumda da yeni oyun başlatır: `jump` yalnız `'playing'`e bakıyor.

# --task--

1. In `update`, under the pit check, write the flag line.
2. In `draw`, change `'Game Over'` in the end screen to the conditional.

# --task-tr--

1. `update` içinde çukur kontrolünün (kapanan `}`) altına bayrak satırını yaz.
2. `draw`'daki bitiş ekranında `'Game Over'` yazısını koşul işleciyle değiştir.
3. **Çalıştır** ve bölümü bitir! Sonra `LEVEL`'ı değiştirip kendi bölümünü tasarla.

# --tests--

Touching the flag should win the level and freeze the game.
tr: Bayrağa dokunmak bölümü kazandırmalı ve oyunu dondurmalı.

```js
player.x = flag.x - 20
player.y = 258
player.vx = 4
update()
assert.strictEqual(state, 'won')
const x = player.x
update()
assert.strictEqual(player.x, x)
draw()
assert.include($.texts(), 'Level complete!')
```

Space after winning should start a new game.
tr: Kazandıktan sonra Boşluk yeni bir oyun başlatmalı.

```js
state = 'won'
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(player.x, 68)
```

The whole level should be beatable by running right and jumping at obstacles.
tr: Bölümün tamamı sağa koşup engellerde zıplayarak bitirilebilmeli.

```js
$.press('ArrowRight')
for (let f = 0; f < 60 * 60 && state === 'playing'; f++) {
  const front = player.x + player.w
  const feet = player.y + player.h
  const gap = !solidAt(front + 40, feet + 2) || !solidAt(front + 10, feet + 2)
  const wall = solidAt(front + 20, player.y + 10) || solidAt(front + 20, feet - 2)
  const enemy = enemies.some((e) => e.alive && e.x - front < 110 && e.x - front > -10 && Math.abs(e.y - player.y) < 40)
  if (player.grounded && (gap || wall || enemy)) {
    $.release(' ')
    $.press(' ')
  }
  $.tick()
}
assert.strictEqual(state, 'won')
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
let enemies
let flag
let camera
let collected
let lives
let coyote
let state // 'playing', 'won' or 'over'
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
  enemies = []
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
      if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
      if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1, alive: true })
      if (line[col] === 'F') flag = { x: x + 14, y: 3 * TILE, w: 4, h: y + TILE - 3 * TILE }
    }
  })
  camera = 0
  collected = 0
  coyote = 0
  state = 'playing'
}

function newGame() {
  lives = 3
  loadLevel()
}

function jump() {
  if (state !== 'playing') {
    newGame()
    return
  }
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

function die() {
  lives -= 1
  if (lives === 0) state = 'over'
  else loadLevel()
}

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

function updateEnemy(enemy) {
  enemy.vx = enemy.dir
  if (moveX(enemy)) enemy.dir = -enemy.dir
  enemy.vy = Math.min(MAX_FALL, enemy.vy + GRAVITY)
  moveY(enemy)
  // Turn around at ledges: is there ground just ahead of the front foot?
  if (enemy.grounded) {
    const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1
    if (!solidAt(aheadX, enemy.y + enemy.h)) enemy.dir = -enemy.dir
  }
}

function update() {
  if (state !== 'playing') return
  updatePlayer()
  for (const enemy of enemies) if (enemy.alive) updateEnemy(enemy)

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
      collected += 1
    }
  }

  for (const enemy of enemies) {
    if (!enemy.alive || !overlaps(player, enemy)) continue
    // A stomp: falling, with the feet still in the top half of the enemy. Anything else is a hit.
    const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
    if (stomp) {
      enemy.alive = false
      player.vy = JUMP * 0.6
    } else {
      die()
      return
    }
  }

  if (player.y > ROWS * TILE) {
    die()
    return
  }
  if (overlaps(player, flag)) state = 'won'

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

  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(flag.x, flag.y, flag.w, flag.h)
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(flag.x + flag.w, flag.y, 24, 16)

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#7c2d12'
  for (const enemy of enemies) {
    if (enemy.alive) ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h)
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected + '   Lives: ' + lives, 12, 26)

  ctx.textAlign = 'center'
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(state === 'won' ? 'Level complete!' : 'Game Over', canvas.width / 2, 160)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, 200)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
