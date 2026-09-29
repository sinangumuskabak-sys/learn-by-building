---
title: Game over
title_tr: Oyun bitti
skills: [game.state]
---

# --goal--

The game ends when the last life is lost, or when an invader reaches the ship's height. Then everything stops and a
dark band says GAME OVER.

# --goal-tr--

Oyun iki şekilde **bitsin**: son can gidince ya da bir istilacı geminin hizasına inince. Sonra her şey dursun ve koyu
bir bant **GAME OVER** yazsın. Oyunun hâlini `state` tutuyor: `'playing'` (oynanıyor) ya da `'over'` (bitti).

# --code--

```js
let state = 'playing' // 'playing' or 'over'

  if (lives <= 0) endGame()
}

function endGame() {
  state = 'over'
}

  if (state !== 'playing') return

  if (state !== 'playing') return

  if (alive().some((invader) => invader.y + invader.h >= SHIP_Y)) endGame()

  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 200, canvas.width, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px monospace'
    ctx.fillText('GAME OVER', canvas.width / 2, 250)
  }
```

# --meaning--

- `update` does nothing once the game is over, so nothing moves.
- The second check stops the frame right after the last life is lost.
- An invader whose bottom reaches `SHIP_Y` has landed: the game ends.

# --meaning-tr--

- `update`'in başındaki `if (state !== 'playing') return` → oyun bittiyse hiçbir şey hareket etmesin.
- İkinci aynı satır, `loseLife()`'ın hemen altında → son can o karede gittiyse karenin geri kalanını da yapma.
- `invader.y + invader.h >= SHIP_Y` → bir istilacının alt kenarı geminin hizasına indi: **istila** oldu, oyun biter.
- `rgba(0, 0, 0, 0.7)` → %70 opak siyah: arkadaki oyun hafifçe görünür.

# --task--

1. Under `lives`, write `state`; in `loseLife`, end the game on the last life, and write `endGame` below it.
2. At the top of `update`, and under the ship check, write the stop line.
3. At the end of `update`, end the game when an invader lands.
4. At the end of `draw`, draw the GAME OVER band.

# --task-tr--

1. `let lives` satırının altına `state` satırını yaz.
2. `loseLife`'ın sonuna `if (lives <= 0) endGame()` yaz; altına `endGame` fonksiyonunu yaz.
3. `update`'in en üstüne durdurma satırını ve bir boş satır yaz; gemi kontrolünün (`loseLife()`) altına aynı satırı yaz.
4. `update`'in sonuna, yürüyüş bloğunun altına istila satırını yaz.
5. `draw`'ın sonuna, bir boş satırdan sonra GAME OVER bloğunu yaz. **Çalıştır**.

# --tests--

Losing the last life should end the game and show GAME OVER.
tr: Son canı kaybetmek oyunu bitirmeli ve GAME OVER göstermeli.

```js
lives = 1
bombs = [{ x: 230, y: 470, w: 4, h: 10 }]
$.tick()
assert.strictEqual(state, 'over')
assert.include($.texts(), 'GAME OVER')
$.press('ArrowLeft')
$.tick(5)
assert.strictEqual(ship.x, 222)
```

An invader reaching the ship's height should end the game.
tr: Geminin hizasına inen istilacı oyunu bitirmeli.

```js
invaders[40].y = 470
update()
assert.strictEqual(state, 'over')
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
const BOMB_SPEED = 3
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
let bombs = []
let dir = 1 // +1 marching right, -1 marching left
let lastStep = 0
let score = 0
let lives = 3
let state = 'playing' // 'playing' or 'over'
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

// Only the lowest invader in a column can fire, so bombs never pass through other invaders.
function dropBomb() {
  const living = alive()
  const shooter = living[Math.floor(Math.random() * living.length)]
  const lowest = living.filter((invader) => invader.x === shooter.x).reduce((a, b) => (b.y > a.y ? b : a))
  bombs.push({ x: lowest.x + INVADER_W / 2 - 2, y: lowest.y + INVADER_H, w: 4, h: 10 })
}

function loseLife() {
  lives -= 1
  bombs = []
  if (lives <= 0) endGame()
}

function endGame() {
  state = 'over'
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (state !== 'playing') return

  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

  for (const bullet of bullets) bullet.y -= BULLET_SPEED
  for (const bomb of bombs) bomb.y += BOMB_SPEED

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
      score += ROW_POINTS[hit.row]
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
  bombs = bombs.filter((bomb) => bomb.y < canvas.height)

  if (bombs.some((bomb) => overlaps(bomb, ship))) loseLife()
  if (state !== 'playing') return

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
    if (Math.random() < 0.35) dropBomb()
  }
  if (alive().some((invader) => invader.y + invader.h >= SHIP_Y)) endGame()
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
  ctx.fillStyle = '#fb923c'
  for (const bomb of bombs) ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + score, 10, 24)
  ctx.textAlign = 'right'
  ctx.fillText('LIVES ' + lives, canvas.width - 10, 24)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 200, canvas.width, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px monospace'
    ctx.fillText('GAME OVER', canvas.width / 2, 250)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
