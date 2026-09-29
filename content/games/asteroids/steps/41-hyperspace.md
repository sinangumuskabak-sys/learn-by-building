---
title: "Build it yourself: hyperspace"
title_tr: "Kendin yap: hiperuzay"
skills: [game.input, game.state]
---

# --goal--

The arcade original had a panic button: **hyperspace**. Pressing H makes the ship vanish and reappear at a random spot,
standing still. Add it to your game.

# --goal-tr--

Orijinal atari oyununda bir **panik düğmesi** vardı: **hiperuzay**. H tuşuna basınca gemi kaybolur ve ekranda rastgele
bir yerde, **duran** hâlde yeniden belirir. Sıkıştığında kurtarır; ama nereye düşeceğin belli değil!

Bu adımda kod verilmiyor. Bildiklerin yetiyor: tuş olayları, `Math.random()`, geminin nesnesi. Kontroller çalıştığında
yeşile döner.

# --task--

- Pressing the `h` key moves the ship to a random place on the screen.
- After the jump the ship stands still (`vx` and `vy` are 0).
- When the game is over, H does nothing.

# --task-tr--

- `h` tuşuna basınca gemi ekranda rastgele bir yere ışınlansın (`event.key` küçük harf `'h'`).
- Işınlanınca gemi dursun: `vx` ve `vy` 0 olsun.
- Oyun bittiyse (`state` `'over'` iken) H hiçbir şey yapmasın.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

In the `keydown` listener, check `event.key === 'h'` (and that the game is being played), then give the ship a new random
`x` and `y` inside the canvas and set its velocity to 0.

# --hint-tr--

`keydown` dinleyicisinde `event.key === 'h'` olup olmadığına (ve oyunun sürdüğüne) bak. Öyleyse gemiye tuvalin içinde
rastgele yeni bir `x` ve `y` ver (`Math.random() * canvas.width` gibi) ve hızını 0 yap. İstersen bunu ayrı bir fonksiyona
koyabilirsin.

# --tests--

H should move the ship to a random place on the screen.
tr: H gemiyi ekranda rastgele bir yere taşımalı.

```js
$.press('h')
assert.isFalse(ship.x === 300 && ship.y === 225, 'the ship should have moved')
assert.isTrue(ship.x >= 0 && ship.x < 600 && ship.y >= 0 && ship.y < 450)
$.release('h')
const first = { x: ship.x, y: ship.y }
$.press('h')
assert.isFalse(ship.x === first.x && ship.y === first.y, 'each jump should land somewhere new')
```

After the jump the ship should stand still.
tr: Işınlanınca gemi durmalı.

```js
ship.vx = 3
ship.vy = -2
$.press('h')
assert.strictEqual(ship.vx, 0)
assert.strictEqual(ship.vy, 0)
```

When the game is over, H should do nothing.
tr: Oyun bitince H bir şey yapmamalı.

```js
state = 'over'
const x = ship.x
const y = ship.y
$.press('h')
assert.strictEqual(ship.x, x)
assert.strictEqual(ship.y, y)
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
let wave
let state // 'playing' or 'over'
let now = 0
let best = Number(localStorage.getItem('asteroids-best')) || 0
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
  // Smaller asteroids are faster, and every wave is 20% faster than the one before.
  const speed = (0.6 + Math.random() * (4 - size) * 0.5) * (1 + (wave - 1) * 0.2)
  // A jagged outline: 10 corners at slightly random distances from the center.
  const shape = Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, r: SIZES[size], shape }
}

function spawnWave() {
  asteroids = []
  for (let i = 0; i < 3 + wave; i++) {
    // Start at the edges, away from the ship in the middle.
    const edge = Math.random() < 0.5
    const x = edge ? 0 : Math.random() * canvas.width
    const y = edge ? Math.random() * canvas.height : 0
    asteroids.push(makeAsteroid(x, y, 3))
  }
}

function newGame() {
  score = 0
  lives = 3
  wave = 1
  bullets = []
  state = 'playing'
  resetShip()
  spawnWave()
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
  if (lives > 0) {
    resetShip()
    return
  }
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('asteroids-best', best)
  }
}

function hyperspace() {
  ship.x = Math.random() * canvas.width
  ship.y = Math.random() * canvas.height
  ship.vx = 0
  ship.vy = 0
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ' && !event.repeat) {
    if (state === 'over') newGame()
    else shoot()
  }
  if (event.key === 'h' && state === 'playing') hyperspace()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (state !== 'playing') return

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
    return
  }

  if (asteroids.length === 0) {
    wave += 1
    spawnWave()
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
  if (state === 'playing' && (!safe || Math.floor(now / 150) % 2 === 0)) drawShip()

  ctx.fillStyle = 'white'
  for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)

  ctx.font = '18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(String(score), 12, 26)
  ctx.textAlign = 'right'
  ctx.fillText('▲'.repeat(Math.max(0, lives)), canvas.width - 12, 26)

  if (state === 'over') {
    ctx.textAlign = 'center'
    ctx.font = 'bold 36px monospace'
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px monospace'
    ctx.fillText('BEST ' + best + '   SPACE TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 34)
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
