---
title: They shoot back
title_tr: Karşılık veriyorlar
skills: [prog.arrays, game.state]
---

# --goal--

Now the invaders drop bombs. On some march steps (35% of them) a random column fires. Only the lowest invader in that
column may fire, so a bomb never passes through its friends.

# --goal-tr--

Artık istilacılar da **bomba** atsın. Bazı yürüyüş adımlarında (%35'inde) rastgele bir sütun ateş etsin. O sütunda
yalnız **en alttaki** istilacı atabilsin; yoksa bomba arkadaşlarının içinden geçerdi. Bombalar turuncu. Bu adımda
bombalar oluşup çiziliyor; düşmelerini sonraki adımda ekliyoruz.

# --code--

```js
let bombs = []

// Only the lowest invader in a column can fire, so bombs never pass through other invaders.
function dropBomb() {
  const living = alive()
  const shooter = living[Math.floor(Math.random() * living.length)]
  const lowest = living.filter((invader) => invader.x === shooter.x).reduce((a, b) => (b.y > a.y ? b : a))
  bombs.push({ x: lowest.x + INVADER_W / 2 - 2, y: lowest.y + INVADER_H, w: 4, h: 10 })
}

    if (Math.random() < 0.35) dropBomb()

  ctx.fillStyle = '#fb923c'
  for (const bomb of bombs) ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h)
```

# --meaning--

- A random living invader picks the column; the ones with the same `x` are that column.
- `reduce` walks the column keeping the one with the biggest `y` (the lowest on screen).
- The bomb starts under that invader, centered.

# --meaning-tr--

- `living[Math.floor(Math.random() * living.length)]` → yaşayanlardan rastgele biri: **sütunu** o seçiyor.
- `filter((invader) => invader.x === shooter.x)` → aynı x'teki istilacılar, yani o sütun (hepsi birlikte yürüdüğü
  için sütundakilerin x'i hep aynı).
- `.reduce((a, b) => (b.y > a.y ? b : a))` → sütunu gezip y'si **en büyük** olanı (ekranda en alttakini) tutar.
- Bomba o istilacının altından, ortalanmış başlar: 4×10.
- `if (Math.random() < 0.35)` → her yürüyüş adımında %35 ihtimalle bomba.

# --task--

1. Above `dir`, write `let bombs = []`.
2. Under `march`, write `dropBomb`; after `march()` in `update`, maybe drop a bomb.
3. In `draw`, draw the bombs right under the bullets.

# --task-tr--

1. `let dir` satırının üstüne `let bombs = []` yaz.
2. `march` fonksiyonunun altına yorum satırıyla birlikte `dropBomb` fonksiyonunu yaz.
3. `update`'te `march()` satırının altına bomba satırını yaz.
4. `draw`'da mermileri çizen satırın hemen altına bombaları çizen iki satırı yaz.
5. **Çalıştır**: istilacıların altında turuncu bombalar belirmeli.

# --tests--

A bomb should start under the lowest invader of a column.
tr: Bomba bir sütunun en alttaki istilacısının altından başlamalı.

```js
dropBomb()
assert.lengthOf(bombs, 1)
assert.strictEqual(bombs[0].y, 224)
assert.strictEqual(bombs[0].h, 10)
```

With only two invaders left in the first column, the lower one should fire.
tr: İlk sütunda iki istilacı kalınca alttaki ateş etmeli.

```js
for (const invader of invaders) invader.alive = false
invaders[0].alive = true
invaders[9].alive = true
dropBomb()
assert.deepEqual(bombs[0], { x: 52, y: 116, w: 4, h: 10 })
$.tick()
assert.lengthOf($.rects('#fb923c'), 1)
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
let bombs = []
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

// Only the lowest invader in a column can fire, so bombs never pass through other invaders.
function dropBomb() {
  const living = alive()
  const shooter = living[Math.floor(Math.random() * living.length)]
  const lowest = living.filter((invader) => invader.x === shooter.x).reduce((a, b) => (b.y > a.y ? b : a))
  bombs.push({ x: lowest.x + INVADER_W / 2 - 2, y: lowest.y + INVADER_H, w: 4, h: 10 })
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
    if (Math.random() < 0.35) dropBomb()
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
  ctx.fillStyle = '#fb923c'
  for (const bomb of bombs) ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h)

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
