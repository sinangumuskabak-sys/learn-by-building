---
title: They shoot back
title_tr: Karşılık veriyorlar
skills: [game.collision, game.state]
---

# --explanation--

Now the invaders fire too. On some of their steps (35% of the time), one of them drops a **bomb**. But which one? If any
invader could fire, bombs would fly out of the middle of the formation, straight through the invaders below. So the
rule is: pick a random column, and only its **lowest** living invader fires.

```js
const shooter = living[Math.floor(Math.random() * living.length)]            // a random living invader
const lowest = living
  .filter((invader) => invader.x === shooter.x)                                // everyone in its column
  .reduce((a, b) => (b.y > a.y ? b : a))                                       // the one furthest down
```

`reduce` walks a list while carrying one value along, here "the lowest invader seen so far". It is the general tool
behind `Math.max`, sums, and many "find the best" searches.

A bomb that hits the cannon costs a **life**, and clears the other bombs so the player gets a fair moment to recover.
The game ends when the lives run out, **or** when the formation marches all the way down to the cannon's row.

# --explanation-tr--

Şimdi istilacılar da ateş ediyor. Adımlarının bazılarında (%35), biri bir **bomba** bırakıyor. Ama hangisi? Herhangi bir
istilacı ateş edebilseydi bombalar düzenin ortasından çıkıp alttaki istilacıların içinden geçerdi. Bu yüzden kural şu:
rastgele bir sütun seç, yalnızca onun **en alttaki** canlı istilacısı ateş etsin.

```js
const shooter = living[Math.floor(Math.random() * living.length)]            // rastgele bir canlı istilacı
const lowest = living
  .filter((invader) => invader.x === shooter.x)                                // onun sütunundaki herkes
  .reduce((a, b) => (b.y > a.y ? b : a))                                       // en aşağıdaki
```

`reduce`, yanında tek bir değer taşıyarak bir listeyi gezer; burada "şimdiye kadar görülen en alttaki istilacı".
`Math.max`'in, toplamların ve birçok "en iyiyi bul" aramasının arkasındaki genel araçtır.

Topa çarpan bir bomba bir **cana** mal olur ve oyuncuya toparlanması için adil bir an tanınsın diye diğer bombaları
temizler. Canlar bitince **ya da** düzen topun hizasına kadar yürüyünce oyun biter.

# --task--

1. Add `BOMB_SPEED = 3`, `let bombs` (emptied in `spawnWave()`), `let lives` (3 in `newGame()`) and
   `let state` (`'playing'` in `newGame()`).
2. Write `dropBomb()` as above, pushing a 4×10 bomb at `x = lowest.x + INVADER_W / 2 - 2`,
   `y = lowest.y + INVADER_H`. Call it after a march step when `Math.random() < 0.35`.
3. In `update()` (only while `'playing'`): move bombs down by `BOMB_SPEED`, drop the ones below the screen, and if one
   overlaps the ship call `loseLife()`: lose a life, clear the bombs, and `endGame()` (`state = 'over'`) at 0 lives.
   Also end the game when a living invader's bottom reaches `SHIP_Y`. Only shoot while playing.
4. Draw bombs in `'#fb923c'`, `LIVES 3` right-aligned at the top, and `GAME OVER` over the screen when over.

# --task-tr--

1. `BOMB_SPEED = 3`, `let bombs` (`spawnWave()` içinde boşaltılır), `let lives` (`newGame()` içinde 3) ve `let state`
   (`newGame()` içinde `'playing'`) ekle.
2. `dropBomb()`'u yukarıdaki gibi yaz; `x = lowest.x + INVADER_W / 2 - 2`, `y = lowest.y + INVADER_H` noktasına 4×10
   bir bomba eklesin. Bir yürüyüş adımından sonra `Math.random() < 0.35` ise çağır.
3. `update()` içinde (yalnızca `'playing'` iken): bombaları `BOMB_SPEED` kadar aşağı taşı, ekranın altındakileri at;
   biri gemiyle kesişirse `loseLife()` çağır: bir can kaybet, bombaları temizle ve can 0'da `endGame()`
   (`state = 'over'`). Canlı bir istilacının altı `SHIP_Y`'ye ulaşınca da oyunu bitir. Yalnızca oyun sürerken ateş et.
4. Bombaları `'#fb923c'` ile, tepede sağa hizalı `LIVES 3`'ü ve oyun bitince ekranın üstüne `GAME OVER`'ı çiz.

# --tests--

Bombs should come from the lowest invader of a column.
tr: Bombalar bir sütunun en alttaki istilacısından gelmeli.

```js
for (let i = 0; i < 30; i++) dropBomb()
for (const bomb of bombs) {
  const column = invaders.filter((inv) => inv.alive && inv.x + INVADER_W / 2 - 2 === bomb.x)
  const lowest = Math.max(...column.map((inv) => inv.y))
  assert.strictEqual(bomb.y, lowest + INVADER_H)
}
invaders[40].alive = false
bombs = []
for (let i = 0; i < 60; i++) dropBomb()
const fromThatColumn = bombs.filter((b) => b.x === invaders[40].x + INVADER_W / 2 - 2)
assert.isAbove(fromThatColumn.length, 0)
assert.isTrue(fromThatColumn.every((b) => b.y === invaders[31].y + INVADER_H), 'with the bottom one gone, the next one up fires')
```

A bomb hitting the cannon should cost a life and clear the bombs.
tr: Topa çarpan bir bomba bir cana mal olmalı ve bombaları temizlemeli.

```js
bombs = [{ x: ship.x + 10, y: ship.y - 5, w: 4, h: 10 }, { x: 10, y: 100, w: 4, h: 10 }]
update()
assert.strictEqual(lives, 2)
assert.lengthOf(bombs, 0)
```

Losing the last life should end the game.
tr: Son canı kaybetmek oyunu bitirmeli.

```js
lives = 1
bombs = [{ x: ship.x + 10, y: ship.y - 5, w: 4, h: 10 }]
update()
assert.strictEqual(state, 'over')
$.tap(' ')
assert.lengthOf(bullets, 0, 'no shooting after game over')
draw()
assert.include($.texts(), 'GAME OVER')
```

The game should end when the invaders reach the cannon.
tr: İstilacılar topa ulaşınca oyun bitmeli.

```js
for (const invader of invaders) invader.y += 400
update()
assert.strictEqual(state, 'over')
```

The invaders should actually fire during play.
tr: İstilacılar oyun sırasında gerçekten ateş etmeli.

```js
let seen = 0
for (let i = 0; i < 600 && state === 'playing'; i++) {
  lives = 3
  $.tick()
  seen = Math.max(seen, bombs.length)
}
assert.isAtLeast(seen, 1)
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
  if (event.key === ' ' && state === 'playing') shoot()
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
