---
title: "Build it yourself: an extra life"
title_tr: "Kendin yap: fazladan can"
skills: [game.state]
---

# --goal--

Now it's your turn, without code to copy: every 1500 points you earn an extra life. At 1500 points the lives go up by
one, at 3000 again, and so on.

# --goal-tr--

Şimdi sıra sende, kopyalanacak kod yok: her **1500 puanda** bir **fazladan can** kazanılsın. Puan 1500'e ulaşınca
canlar bir artsın, 3000'de bir daha, böyle sürsün.

# --task--

Change the code so that crossing 1500, 3000, 4500… points gives one more life, only once for each.

# --task-tr--

Kodu değiştir: puan 1500, 3000, 4500… sınırını **geçtiğinde** can bir artsın; her sınır için **yalnız bir kez**.

# --hint--

Remember the score before adding the points, then compare `Math.floor(score / 1500)` before and after.

# --hint-tr--

Puanı eklemeden önce eski puanı bir değişkende tut; sonra `Math.floor(eski / 1500)` ile `Math.floor(score / 1500)`
farklıysa bir sınır geçildi demektir.

# --tests--

Crossing 1500 points should give one extra life.
tr: 1500 puanı geçmek bir fazladan can vermeli.

```js
score = 1490
bullets = [{ x: 50, y: 220, w: 4, h: 12 }]
update()
assert.strictEqual(score, 1500)
assert.strictEqual(lives, 4)
```

More points below the next 1500 should not give another.
tr: Sonraki 1500'e varmadan kazanılan puan yeni can vermemeli.

```js
score = 1490
bullets = [{ x: 50, y: 220, w: 4, h: 12 }]
update()
bullets = [{ x: 94, y: 220, w: 4, h: 12 }]
update()
assert.strictEqual(score, 1510)
assert.strictEqual(lives, 4)
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

let ship
let bullets
let invaders
let bombs
let dir // +1 marching right, -1 marching left
let lastStep
let lastShot
let wave
let score
let lives
let state // 'playing' or 'over'
let now = 0
let best = Number(localStorage.getItem('invaders-best')) || 0
const keys = {}

function spawnWave() {
  invaders = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
    }
  }
  bullets = []
  bombs = []
  dir = 1
  lastStep = now
}

function newGame() {
  ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
  wave = 1
  score = 0
  lives = 3
  lastShot = -COOLDOWN
  state = 'playing'
  spawnWave()
}

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

// Fewer invaders march faster: from 588 ms with all 45 alive down to 60 ms for the last one, quicker in later waves.
function stepInterval() {
  return Math.max(40, 60 + (alive().length - 1) * 12 - (wave - 1) * 40)
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
  if (score > best) {
    best = score
    localStorage.setItem('invaders-best', best)
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') {
    if (state === 'over') newGame()
    else shoot()
  }
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
      const before = score
      score += ROW_POINTS[hit.row]
      if (Math.floor(score / 1500) > Math.floor(before / 1500)) lives += 1
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
  bombs = bombs.filter((bomb) => bomb.y < canvas.height)

  if (bombs.some((bomb) => overlaps(bomb, ship))) loseLife()
  if (state !== 'playing') return

  if (alive().length === 0) {
    wave += 1
    spawnWave()
    return
  }

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
  ctx.textAlign = 'center'
  ctx.fillText('WAVE ' + wave, canvas.width / 2, 24)
  ctx.textAlign = 'right'
  ctx.fillText('LIVES ' + lives, canvas.width - 10, 24)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 200, canvas.width, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px monospace'
    ctx.fillText('GAME OVER', canvas.width / 2, 250)
    ctx.font = '16px monospace'
    ctx.fillText('BEST ' + best + '   SPACE TO PLAY AGAIN', canvas.width / 2, 290)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
