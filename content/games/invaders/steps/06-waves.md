---
title: Faster and faster, wave after wave
title_tr: Dalga dalga, gittikçe hızlanan
skills: [game.state, game.loop]
---

# --explanation--

The original arcade game has a famous accident: the machine was so slow that moving 55 invaders took a while, so the
formation sped up as the player shot them down, simply because there was less to draw. It turned out to be the best
part of the game: the last invader races across the screen.

You can build that tension **on purpose**: make the step interval depend on how many invaders are alive.

```js
60 + (alive().length - 1) * 12   // 588 ms with all 45 alive … 60 ms for the last one
```

No special "hard mode" code, no timers: difficulty **emerges** from a rule. The player's own success makes the game
harder. Designing rules that produce interesting behavior by themselves is one of the most satisfying parts of game
design.

When the last invader falls, a new **wave** starts, a little faster (`- (wave - 1) * 40`). Building a wave needs the
same code as starting the game, so move it into a function, `spawnWave()`, and keep one-time setup (the ship, the
score) in `newGame()`.

# --explanation-tr--

Orijinal arcade oyununun ünlü bir kazası var: makine o kadar yavaştı ki 55 istilacıyı hareket ettirmek zaman alıyordu;
oyuncu onları vurdukça, yalnızca çizilecek şey azaldığı için düzen hızlanıyordu. Oyunun en iyi kısmı bu çıktı: son
istilacı ekranda yıldırım gibi koşar.

Bu gerilimi **bilerek** kurabilirsin: adım aralığını canlı istilacı sayısına bağla.

```js
60 + (alive().length - 1) * 12   // 45'i de canlıyken 588 ms … sonuncusu için 60 ms
```

Özel bir "zor mod" kodu yok, zamanlayıcı yok: zorluk bir kuraldan **doğar**. Oyuncunun kendi başarısı oyunu zorlaştırır.
Kendi kendine ilginç davranış üreten kurallar tasarlamak, oyun tasarımının en tatmin edici kısımlarından biridir.

Son istilacı düşünce yeni bir **dalga** başlar, biraz daha hızlı (`- (wave - 1) * 40`). Bir dalgayı kurmak oyunu
başlatmakla aynı kodu gerektirir; onu bir fonksiyona taşı, `spawnWave()`, tek seferlik kurulumu da (gemi, skor)
`newGame()`'de tut.

# --task--

1. Move the formation building, `bullets = []`, `dir = 1` and `lastStep = now` into `function spawnWave()`. Write
   `function newGame()` that creates the ship, sets `wave = 1`, `score = 0`, `lastShot = -COOLDOWN` and calls
   `spawnWave()`. Declare the variables with `let` (no values) and start with `newGame()`.
2. Make `stepInterval()` return `Math.max(40, 60 + (alive().length - 1) * 12 - (wave - 1) * 40)`.
3. In `update()`, when no invader is alive, add 1 to `wave`, call `spawnWave()` and stop for this frame.
4. Draw `WAVE 2` centered at the top, next to the score.

# --task-tr--

1. Düzen kurulumunu, `bullets = []`, `dir = 1` ve `lastStep = now`'ı `function spawnWave()`'e taşı. Gemiyi oluşturan,
   `wave = 1`, `score = 0`, `lastShot = -COOLDOWN` yapan ve `spawnWave()` çağıran `function newGame()` yaz. Değişkenleri
   `let` ile (değersiz) tanımla ve `newGame()` ile başlat.
2. `stepInterval()` `Math.max(40, 60 + (alive().length - 1) * 12 - (wave - 1) * 40)` döndürsün.
3. `update()` içinde hiçbir istilacı canlı değilse `wave`'i 1 artır, `spawnWave()` çağır ve bu karede dur.
4. Tepede ortada, skorun yanına `WAVE 2` yaz.

# --tests--

Fewer invaders should march faster.
tr: Daha az istilacı daha hızlı yürümeli.

```js
assert.strictEqual(stepInterval(), 588)
for (let i = 0; i < 44; i++) invaders[i].alive = false
assert.strictEqual(stepInterval(), 60)
```

The last invader should step much more often than a full formation.
tr: Son istilacı tam bir düzenden çok daha sık adım atmalı.

```js
// Count how many times the invader actually moves in one second.
const stepsInOneSecond = () => {
  let steps = 0
  let last = JSON.stringify([invaders[44].x, invaders[44].y])
  for (let i = 0; i < 60; i++) {
    $.tick()
    const now = JSON.stringify([invaders[44].x, invaders[44].y])
    if (now !== last) steps++
    last = now
  }
  return steps
}
const full = stepsInOneSecond()
for (let i = 0; i < 44; i++) invaders[i].alive = false
const lastOne = stepsInOneSecond()
assert.isAtMost(full, 2)
assert.isAtLeast(lastOne, 12)
```

Clearing a wave should start the next one, a little faster.
tr: Bir dalgayı temizlemek bir sonrakini biraz daha hızlı başlatmalı.

```js
for (const invader of invaders) invader.alive = false
update()
assert.strictEqual(wave, 2)
assert.lengthOf(alive(), 45)
assert.strictEqual(stepInterval(), 548)
draw()
assert.include($.texts(), 'WAVE 2')
```

`newGame()` should reset the score, the wave and the ship.
tr: `newGame()` skoru, dalgayı ve gemiyi sıfırlamalı.

```js
score = 500
wave = 4
ship.x = 0
newGame()
assert.deepEqual([score, wave, ship.x], [0, 1, 222])
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

let ship
let bullets
let invaders
let dir // +1 marching right, -1 marching left
let lastStep
let lastShot
let wave
let score
let now = 0
const keys = {}

function spawnWave() {
  invaders = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
    }
  }
  bullets = []
  dir = 1
  lastStep = now
}

function newGame() {
  ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
  wave = 1
  score = 0
  lastShot = -COOLDOWN
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

// Fewer invaders march faster: from 600 ms with all 45 alive down to 60 ms for the last one, quicker in later waves.
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

  if (alive().length === 0) {
    wave += 1
    spawnWave()
    return
  }

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
  ctx.textAlign = 'center'
  ctx.fillText('WAVE ' + wave, canvas.width / 2, 24)
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
