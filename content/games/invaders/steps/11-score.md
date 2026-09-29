---
title: Score
title_tr: Puan
skills: [game.state, game.canvas]
---

# --goal--

Each invader is worth points: the top row 30, the middle rows 20, the bottom rows 10. The score is shown top left.

# --goal-tr--

Her istilacı **puan** getirsin: en üst sıra 30, ortadaki iki sıra 20, alttaki iki sıra 10. Puan sol üstte yazsın.

# --code--

```js
const ROW_POINTS = [30, 20, 20, 10, 10]
let score = 0

      score += ROW_POINTS[hit.row]

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + score, 10, 24)
```

# --meaning--

- `ROW_POINTS[hit.row]` gives the points of the row the hit invader was in.
- `textAlign = 'left'` makes the text start at x = 10.

# --meaning-tr--

- `ROW_POINTS` → sıra başına puan; `ROW_COLORS` gibi sıra numarasıyla okunur.
- `score += ROW_POINTS[hit.row]` → vurulan istilacının sırasının puanını ekle.
- `ctx.textAlign = 'left'` → yazı verilen x'ten (10) **başlasın**. Birazdan ortaya ve sağa hizalı yazılar da gelecek.

# --task--

1. Under `SPACING_Y`, write `ROW_POINTS`; under `lastStep`, write `score`.
2. In the hits loop, add the points after `bullet.y = -100`.
3. At the end of `draw`, write the score.

# --task-tr--

1. `SPACING_Y` satırının altına `ROW_POINTS`, `let lastStep` satırının altına `let score = 0` yaz.
2. Vuruş döngüsünde `bullet.y = -100` satırının altına puan satırını yaz.
3. `draw`'ın sonuna, bir boş satırdan sonra puan yazısının dört satırını yaz.
4. **Çalıştır** ve bir istilacı vur.

# --tests--

Hitting a top-row invader should add 30 points and show them.
tr: En üst sıradan birini vurmak 30 puan eklemeli ve göstermeli.

```js
bullets = [{ x: 50, y: 80, w: 4, h: 12 }]
$.tick()
assert.strictEqual(score, 30)
assert.include($.texts(), 'SCORE 30')
```

A bottom-row invader should be worth 10.
tr: En alt sıradaki 10 puan etmeli.

```js
bullets = [{ x: 50, y: 220, w: 4, h: 12 }]
update()
assert.strictEqual(score, 10)
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4
const BULLET_SPEED = 8
const COOLDOWN = 350 // milliseconds between shots
const ROWS = 5
const COLS = 9
const INVADER_W = 28
const INVADER_H = 20
const SPACING_X = 44
const SPACING_Y = 36
const ROW_POINTS = [30, 20, 20, 10, 10]
const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let invaders = []
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
  }
}
let dir = 1 // +1 marching right, -1 marching left
let lastStep = 0
let score = 0
let now = 0
const keys = {}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

function stepInterval() {
  return 500
}

function march() {
  const living = alive()
  const left = Math.min(...living.map((invader) => invader.x))
  const right = Math.max(...living.map((invader) => invader.x + invader.w))
  if ((dir > 0 && right + 10 > canvas.width - 10) || (dir < 0 && left - 10 < 10)) {
    for (const invader of living) invader.y += 16
    dir = -dir
  } else {
    for (const invader of living) invader.x += 10 * dir
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

  for (const bullet of bullets) bullet.y -= BULLET_SPEED

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
      score += ROW_POINTS[hit.row]
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
  }
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const invader of alive()) {
    ctx.fillStyle = ROW_COLORS[invader.row]
    ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
  }

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + score, 10, 24)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
