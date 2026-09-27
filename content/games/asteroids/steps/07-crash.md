---
title: Crashing, and a moment of safety
title_tr: Çarpmak ve bir anlık güvenlik
skills: [game.collision, game.state]
---

# --explanation--

A rock hitting the ship costs a life and puts the ship back in the middle. The collision uses a circle a bit smaller than
the ship (`SHIP_R * 0.7`), because a triangle does not fill its circle: a generous, "forgiving" hitbox, like in the
runner game.

Respawning raises a fairness problem. If a rock happens to be drifting through the middle, the new ship would be hit
instantly and lose another life without the player ever touching a key. The classic fix is a few seconds of
**invulnerability**. Store **until when** the ship is safe, the timestamp idea from Whack-a-Mole:

```js
ship.safeUntil = now + SAFE_TIME
...
if (now >= ship.safeUntil && /* touching a rock */) crash()
```

The player must be able to **see** that they are safe, or it feels like a bug when rocks pass through. So the ship blinks
while invulnerable: it is drawn only on alternate 150 ms slices of time, `Math.floor(now / 150) % 2 === 0`. That is a
tiny formula for a very recognizable effect; almost every action game uses it.

# --explanation-tr--

Gemiye çarpan bir kaya bir cana mal olur ve gemiyi ortaya geri koyar. Çarpışma, gemiden biraz küçük bir daire kullanır
(`SHIP_R * 0.7`), çünkü üçgen dairesini doldurmaz: koşucu oyunundaki gibi cömert, "affedici" bir çarpışma kutusu.

Yeniden doğmak bir adalet sorunu doğurur. Ortadan bir kaya geçiyorsa yeni gemi anında vurulur ve oyuncu hiçbir tuşa
dokunmadan bir can daha kaybeder. Klasik çözüm birkaç saniyelik **dokunulmazlıktır**. Geminin **ne zamana kadar**
güvende olduğunu sakla; Köstebek Vurmaca'daki zaman damgası fikri:

```js
ship.safeUntil = now + SAFE_TIME
...
if (now >= ship.safeUntil && /* bir kayaya değiyor */) crash()
```

Oyuncu güvende olduğunu **görebilmeli**, yoksa kayalar içinden geçince bir hata gibi hisseder. Bu yüzden gemi
dokunulmazken yanıp söner: yalnızca 150 ms'lik dilimlerde bir çizilir, `Math.floor(now / 150) % 2 === 0`. Çok tanıdık
bir efekt için küçücük bir formül; neredeyse her aksiyon oyunu bunu kullanır.

# --task--

1. Add `SAFE_TIME = 2000`, `let lives = 3` and `let now = 0` (set from the loop's `time`). `resetShip()` also sets
   `safeUntil: now + SAFE_TIME`.
2. Write `crash()`: lose a life and `resetShip()`. In `update()`, after the bullets, call it when the ship is not safe
   and touches any asteroid (ship radius `SHIP_R * 0.7`).
3. Draw the ship only when it is not safe, or when `Math.floor(now / 150) % 2 === 0`. Show the lives as `▲` symbols
   (`'▲'.repeat(lives)`) right-aligned at the top.

# --task-tr--

1. `SAFE_TIME = 2000`, `let lives = 3` ve `let now = 0` (döngünün `time`'ından ayarlanır) ekle. `resetShip()`
   `safeUntil: now + SAFE_TIME` de ayarlasın.
2. `crash()` yaz: bir can kaybet ve `resetShip()`. `update()` içinde mermilerden sonra gemi güvende değilken bir
   asteroite değiyorsa (gemi yarıçapı `SHIP_R * 0.7`) çağır.
3. Gemiyi yalnızca güvende değilken ya da `Math.floor(now / 150) % 2 === 0` iken çiz. Canları tepede sağa hizalı `▲`
   sembolleri olarak göster (`'▲'.repeat(lives)`).

# --tests--

A rock hitting the ship should cost a life and bring the ship back to the middle.
tr: Gemiye çarpan bir kaya bir cana mal olmalı ve gemiyi ortaya geri getirmeli.

```js
$.run(2.5)
ship.x = 100
ship.y = 100
asteroids = [makeAsteroid(110, 100, 2)]
asteroids[0].vx = 0
asteroids[0].vy = 0
update()
assert.strictEqual(lives, 2)
assert.include(ship, { x: 300, y: 225 })
```

Right after respawning, the ship should be safe for two seconds.
tr: Yeniden doğduktan hemen sonra gemi iki saniye güvende olmalı.

```js
$.run(2.5)
crash()
asteroids = [makeAsteroid(300, 225, 3)]
asteroids[0].vx = 0
asteroids[0].vy = 0
$.run(1.5)
assert.strictEqual(lives, 2, 'still safe')
$.run(1)
assert.strictEqual(lives, 1, 'safe time is over')
```

The ship should blink while it is safe, and the lives should be shown.
tr: Gemi güvendeyken yanıp sönmeli ve canlar gösterilmeli.

```js
let shown = 0
let hidden = 0
for (let i = 0; i < 60; i++) {
  $.tick()
  if ($.screen().some((c) => c.op === 'moveTo' && Math.abs(c.args[1] - 211) < 3 && Math.abs(c.args[0] - 300) < 3)) shown++
  else hidden++
}
assert.isAbove(shown, 10)
assert.isAbove(hidden, 10)
assert.include($.texts(), '▲▲▲')
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose
const TURN = 0.07 // radians per frame
const THRUST = 0.12
const FRICTION = 0.99
const MAX_SPEED = 6
const BULLET_SPEED = 7
const BULLET_LIFE = 55 // frames
const SIZES = [0, 15, 28, 45] // asteroid radius for size 1, 2 and 3
const POINTS = [0, 100, 50, 20] // smaller asteroids are worth more
const SAFE_TIME = 2000 // milliseconds of invulnerability after respawning

let ship
let bullets
let asteroids
let score
let lives
let now = 0
const keys = {}

// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0, safeUntil: now + SAFE_TIME }
}

function makeAsteroid(x, y, size) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.6 + Math.random() * (4 - size) * 0.5 // smaller asteroids are faster
  // A jagged outline: 10 corners at slightly random distances from the center.
  const shape = Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, r: SIZES[size], shape }
}

function shoot() {
  const dx = Math.cos(ship.angle)
  const dy = Math.sin(ship.angle)
  bullets.push({
    x: ship.x + dx * SHIP_R,
    y: ship.y + dy * SHIP_R,
    vx: ship.vx + dx * BULLET_SPEED,
    vy: ship.vy + dy * BULLET_SPEED,
    life: BULLET_LIFE,
  })
}

function hits(a, ar, b, br) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy < (ar + br) * (ar + br)
}

function breakAsteroid(asteroid) {
  score += POINTS[asteroid.size]
  asteroids = asteroids.filter((a) => a !== asteroid)
  if (asteroid.size > 1) {
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
  }
}

function crash() {
  lives -= 1
  resetShip()
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ' && !event.repeat) shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.angle -= TURN
  if (keys.ArrowRight) ship.angle += TURN
  if (keys.ArrowUp) {
    ship.vx += Math.cos(ship.angle) * THRUST
    ship.vy += Math.sin(ship.angle) * THRUST
  }
  ship.vx *= FRICTION
  ship.vy *= FRICTION
  const speed = Math.hypot(ship.vx, ship.vy)
  if (speed > MAX_SPEED) {
    ship.vx *= MAX_SPEED / speed
    ship.vy *= MAX_SPEED / speed
  }
  ship.x = wrap(ship.x + ship.vx, canvas.width)
  ship.y = wrap(ship.y + ship.vy, canvas.height)

  for (const bullet of bullets) {
    bullet.x = wrap(bullet.x + bullet.vx, canvas.width)
    bullet.y = wrap(bullet.y + bullet.vy, canvas.height)
    bullet.life -= 1
  }
  for (const asteroid of asteroids) {
    asteroid.x = wrap(asteroid.x + asteroid.vx, canvas.width)
    asteroid.y = wrap(asteroid.y + asteroid.vy, canvas.height)
  }

  for (const bullet of bullets) {
    const hit = asteroids.find((asteroid) => hits(bullet, 2, asteroid, asteroid.r))
    if (hit) {
      breakAsteroid(hit)
      bullet.life = 0
    }
  }
  bullets = bullets.filter((bullet) => bullet.life > 0)

  if (now >= ship.safeUntil && asteroids.some((asteroid) => hits(ship, SHIP_R * 0.7, asteroid, asteroid.r))) {
    crash()
  }
}

function drawShip() {
  const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
  const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
  const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(left.x, left.y)
  ctx.lineTo(right.x, right.y)
  ctx.closePath()
  ctx.stroke()
}

function drawAsteroid(asteroid) {
  ctx.beginPath()
  asteroid.shape.forEach((scale, i) => {
    const angle = (i / asteroid.shape.length) * Math.PI * 2
    const x = asteroid.x + Math.cos(angle) * asteroid.r * scale
    const y = asteroid.y + Math.sin(angle) * asteroid.r * scale
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  for (const asteroid of asteroids) drawAsteroid(asteroid)

  // Blink while invulnerable, so the player can see it.
  const safe = now < ship.safeUntil
  if (!safe || Math.floor(now / 150) % 2 === 0) drawShip()

  ctx.fillStyle = 'white'
  for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)

  ctx.font = '18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(String(score), 12, 26)
  ctx.textAlign = 'right'
  ctx.fillText('▲'.repeat(Math.max(0, lives)), canvas.width - 12, 26)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

score = 0
lives = 3
bullets = []
asteroids = []
for (let i = 0; i < 4; i++) asteroids.push(makeAsteroid(Math.random() < 0.5 ? 0 : Math.random() * canvas.width, 0, 3))
resetShip()
requestAnimationFrame(loop)
```
