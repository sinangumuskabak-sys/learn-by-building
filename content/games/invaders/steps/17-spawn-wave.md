---
title: A wave in a function
title_tr: Dalga bir fonksiyonda
skills: [prog.functions]
---

# --goal--

When all invaders are gone, a new wave should come. So building the formation moves into a function, `spawnWave`,
which also clears the bullets and bombs and starts the march fresh. The game calls it once at the start.

# --goal-tr--

Bütün istilacılar ölünce **yeni bir dalga** gelsin. Bunun için diziliş kurmayı bir fonksiyona taşıyoruz: `spawnWave`
(dalga doğur). Mermileri ve bombaları da temizleyip yürüyüşü baştan başlatıyor. Oyun onu başta bir kez çağırıyor.
Oyun aynı görünüyor; değişen, kodun düzeni.

# --code--

```js
let bullets
let invaders
let bombs
let dir // +1 marching right, -1 marching left
let lastStep
let lastShot = -COOLDOWN

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

spawnWave()
```

# --meaning--

- The variables are only declared at the top; `spawnWave` gives them their values.
- `lastStep = now` makes the first march step come half a second after the wave appears.

# --meaning-tr--

- Yukarıda değişkenler yalnız **tanımlanıyor** (`let invaders`); değerlerini `spawnWave` veriyor.
- `invaders = []` → önce listeyi boşalt, sonra aynı iç içe döngüyle 45 istilacıyı kur.
- `lastStep = now` → ilk yürüyüş adımı dalga göründükten yarım saniye sonra gelsin.
- En altta `spawnWave()` → oyun başlarken ilk dalga.

# --task--

1. Replace the variables from `bullets` to `lastStep` with the short list.
2. Above `overlaps`, write `spawnWave`.
3. At the bottom, call `spawnWave()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `let bullets = []` satırından `let lastStep = 0` satırına kadar olan kısmı sil; yerine kısa listeyi yaz (sıra
   değişti: `lastShot` en sona geldi).
2. `overlaps` fonksiyonunun üstüne `spawnWave` fonksiyonunu yaz.
3. En alttaki `requestAnimationFrame(loop)` satırının üstüne `spawnWave()` yaz. **Çalıştır**.

# --tests--

spawnWave should bring back a full wave and clear the shots.
tr: spawnWave tam bir dalga getirmeli ve atışları temizlemeli.

```js
assert.strictEqual(alive().length, 45)
for (const invader of invaders) invader.alive = false
bombs = [{ x: 10, y: 100, w: 4, h: 10 }]
dir = -1
spawnWave()
assert.strictEqual(alive().length, 45)
assert.deepEqual(bombs, [])
assert.deepEqual(bullets, [])
assert.strictEqual(dir, 1)
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
let bullets
let invaders
let bombs
let dir // +1 marching right, -1 marching left
let lastStep
let lastShot = -COOLDOWN
let score = 0
let lives = 3
let state = 'playing' // 'playing' or 'over'
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
  if (score > best) {
    best = score
    localStorage.setItem('invaders-best', best)
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

spawnWave()
requestAnimationFrame(loop)
```
