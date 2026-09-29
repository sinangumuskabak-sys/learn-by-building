---
title: Four big rocks
title_tr: Dört büyük kaya
skills: [prog.arrays, prog.loops]
---

# --goal--

The game starts with four big rocks on the top edge, away from the ship in the middle. Each one's `x` is either 0 or a
random point across the width, 50/50.

# --goal-tr--

Oyun **dört büyük kayayla** başlasın. Hepsi **üst kenarda** doğsun, ortadaki gemiden uzakta; yoksa oyun bir çarpmayla
başlardı. Her kayanın `x`'i yazı-tura ile seçilsin: ya 0 (sol kenar) ya da genişlik boyunca rastgele bir yer.

Kayaları bir sonraki adımda çizeceğiz; bu adımda sadece listeleri kuruluyor.

# --code--

```js
let asteroids

asteroids = []
for (let i = 0; i < 4; i++) asteroids.push(makeAsteroid(Math.random() < 0.5 ? 0 : Math.random() * canvas.width, 0, 3))
```

# --meaning--

- The loop runs 4 times, each time adding a big rock (size 3) at `y = 0`.
- `Math.random() < 0.5 ? 0 : ...` is a coin toss: half the time 0, otherwise a random `x`.

# --meaning-tr--

- `let asteroids` → kaya listesi; en altta `asteroids = []` ile boş başlar.
- `for (let i = 0; i < 4; i++) ...` → **sayan döngü**: `i` 0'dan başlar, 4'ten küçük olduğu sürece işi yapar, her turda
  `i++` ile 1 artar. Yani iş 4 kez yapılır.
- `Math.random() < 0.5 ? 0 : Math.random() * canvas.width` → **üçlü operatör** (kısa "eğer"): `koşul ? A : B`, koşul
  doğruysa A, değilse B. Yarı yarıya ihtimalle 0, yoksa 0–600 arası rastgele bir `x`.
- `makeAsteroid(..., 0, 3)` → `y` 0 (üst kenar), boy 3 (büyük).

# --task--

1. Under `let bullets` write `let asteroids`.
2. At the bottom, under `bullets = []`, write the two lines.

# --task-tr--

1. `let bullets` satırının altına `let asteroids` yaz.
2. En altta `bullets = []` satırının altına iki kaya satırını yaz (`resetShip()`'ten önce).
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

There should be 4 big asteroids on the top edge.
tr: Üst kenarda 4 büyük asteroit olmalı.

```js
assert.lengthOf(asteroids, 4)
assert.isTrue(asteroids.every((a) => a.size === 3 && a.y === 0))
assert.isTrue(asteroids.every((a) => a.x >= 0 && a.x < 600))
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

let ship
let bullets
let asteroids
const keys = {}

// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

function makeAsteroid(x, y, size) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.6 + Math.random() * (4 - size) * 0.5 // smaller asteroids are faster
  const shape = Array.from({ length: 10 }, () => 1)
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
  bullets = bullets.filter((bullet) => bullet.life > 0)
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

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  drawShip()

  ctx.fillStyle = 'white'
  for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

bullets = []
asteroids = []
for (let i = 0; i < 4; i++) asteroids.push(makeAsteroid(Math.random() < 0.5 ? 0 : Math.random() * canvas.width, 0, 3))
resetShip()
requestAnimationFrame(loop)
```
