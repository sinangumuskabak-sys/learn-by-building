---
title: A few frames of grace
title_tr: Birkaç karelik tolerans
skills: [game.state]
---

# --goal--

Run toward a ledge and press jump at the very edge: very often the player has *just* stepped off, a frame or two too late,
and the game says no. The fix is **coyote time**: a counter that is full while grounded and runs down for a few frames
after leaving the ground.

# --goal-tr--

Bir kenara koş ve tam ucunda zıpla. Çoğu zaman oyuncu kenardan **bir iki kare önce** çıkmış olur ve oyun "havadasın"
deyip zıplamaz. Oyuncuya göre oyun onu **duymamıştır**.

Çözümün eğlenceli bir adı var: **coyote time** (çakal süresi). Çizgi filmdeki çakal uçurumdan koşup çıkar ve ancak aşağı
baktığında düşer. Biz de bir sayaç tutacağız: yerdeyken dolu (6), yerden ayrılınca her karede bir azalır. Bu adımda
sayacı kuruyoruz; zıplamada bir sonraki adımda kullanacağız.

# --code--

```js
const COYOTE = 6 // frames you can still jump after running off a ledge

let coyote

  coyote = 0

  coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)
```

# --meaning--

- `coyote` starts at 0 in `loadLevel`.
- At the end of `updatePlayer`: grounded refills it to 6; in the air it counts down, never below 0.

# --meaning-tr--

- `const COYOTE = 6` → yerden ayrıldıktan sonra zıplamaya izin verilecek kare sayısı. 6 kare saniyenin onda biri:
  oyuncu fark etmez ama "bastım ama zıplamadı!" anları kaybolur.
- `let coyote` → sayaç; `loadLevel`'ın sonunda `coyote = 0`.
- `coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)` → yerdeyse 6'ya **doldur**; havadaysa bir **azalt**
  ama `Math.max(0, ...)` ile 0'ın altına inme.

# --task--

1. Under `CUT` write `COYOTE`; above `const keys = {}` write `let coyote`.
2. In `loadLevel`, after the `forEach` block's `})`, write `coyote = 0`.
3. At the end of `updatePlayer`, under `moveY(player)`, write the `coyote` line.

# --task-tr--

1. `CUT` satırının altına `COYOTE` yaz.
2. `const keys = {}` satırının **üstüne** `let coyote` yaz.
3. `loadLevel` içinde `forEach` bloğunu kapatan `})` satırının altına `coyote = 0` yaz.
4. `updatePlayer`'ın sonunda `moveY(player)` satırının altına `coyote` satırını yaz. **Çalıştır**.

# --predict--

Does this step change how jumping feels?
- [ ] Yes, you can jump just after leaving a ledge
- [x] Not yet: `jump` still asks `grounded`
  We only built the counter. The next step lets `jump` use it.

# --predict-tr--

Bu adım zıplamanın hissini değiştirir mi?
- [ ] Evet, kenardan çıktıktan hemen sonra zıplayabilirsin
- [x] Henüz değil: `jump` hâlâ `grounded`'a bakıyor
  Yalnız sayacı kurduk. Bir sonraki adımda `jump` onu kullanacak.

# --tests--

`coyote` should be full on the ground and count down in the air.
tr: `coyote` yerde dolu olmalı, havada geri saymalı.

```js
$.tick(2)
assert.strictEqual(coyote, 6)
player.x = 16 * 32 + 4
$.tick(1)
assert.strictEqual(coyote, 5)
$.tick(3)
assert.strictEqual(coyote, 2)
$.tick(10)
assert.strictEqual(coyote, 0)
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
  coyote = 0
}

function jump() {
  if (player.grounded) {
    player.vy = JUMP
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
