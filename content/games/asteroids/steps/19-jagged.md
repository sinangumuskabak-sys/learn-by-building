---
title: Jagged rocks
title_tr: Pürüzlü kayalar
skills: [game.canvas]
---

# --goal--

A perfect polygon looks like a bubble, not a rock. Put each corner at a slightly random distance, 0.75 to 1.1 of the
radius. The random numbers are chosen **once**, when the rock is made, and kept.

# --goal-tr--

Düzgün bir çokgen balon gibi görünür, kaya gibi değil. Hile: her köşeyi merkezden **biraz farklı** uzaklığa koymak.
Her köşe için 0.75 ile 1.1 arasında bir ölçek.

Önemli nokta: bu sayılar kaya **doğarken bir kez** seçilir ve kayayla saklanır. Her karede yeni rastgele sayı çekseydik
kayanın çizgisi titreyip kıpırdardı. Rastgeleliği bir kez seçip hatırlamak, oyunlarda her ağaca, buluta ya da düşmana
kendine özgü, **sabit** bir görünüm vermenin yoludur.

# --code--

```js
// A jagged outline: 10 corners at slightly random distances from the center.
const shape = Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)
```

# --meaning--

- `0.75 + Math.random() * 0.35` is a random number from 0.75 to 1.1, one for each corner.
- `drawAsteroid` already multiplies the radius by `scale`, so nothing else changes.

# --meaning-tr--

- `0.75 + Math.random() * 0.35` → 0.75 ile 1.1 arasında rastgele bir sayı; her köşe için ayrı.
- `drawAsteroid` zaten yarıçapı `scale` ile çarpıyordu; başka bir şeyi değiştirmeye gerek yok. Düzgün şekil için 1
  koymamızın sebebi buydu.

# --task--

In `makeAsteroid`, write the comment and change `() => 1` to `() => 0.75 + Math.random() * 0.35`.

# --task-tr--

`makeAsteroid` içinde `shape` satırının üstüne yorum satırını yaz ve `() => 1` kısmını
`() => 0.75 + Math.random() * 0.35` yap. **Çalıştır**: kayalar artık pürüzlü.

# --try--

Try `0.4 + Math.random() * 0.8`: very rough rocks. Put the old numbers back.

# --try-tr--

`0.4 + Math.random() * 0.8` dene: çok sivri kayalar. Sonra eski sayıları geri koy.

# --tests--

Each rock should have its own stable jagged shape.
tr: Her kayanın kendine özgü, sabit, pürüzlü bir biçimi olmalı.

```js
const rock = makeAsteroid(100, 100, 3)
assert.lengthOf(rock.shape, 10)
assert.isTrue(rock.shape.every((s) => s >= 0.75 && s <= 1.1))
assert.isAbove(new Set(rock.shape).size, 5, 'the corners should be at different distances')
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
