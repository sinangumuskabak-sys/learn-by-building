---
title: Bullets hit rocks
title_tr: Mermi kayayı vurur
skills: [game.collision]
---

# --goal--

Every frame, for each bullet, find a rock it touches (a bullet is a circle of radius 2). If there is one, break it and
set the bullet's life to 0, so the `filter` line right after removes it.

# --goal-tr--

Şimdi ikisini birleştiriyoruz: her karede her mermi için, değdiği bir kaya var mı diye bakacağız (mermi yarıçapı 2 olan
minik bir daire). Varsa kayayı kırar, mermiyi de "öldürürüz": ömrünü 0 yaparız, hemen sonraki `filter` satırı onu siler.

# --code--

```js
for (const bullet of bullets) {
  const hit = asteroids.find((asteroid) => hits(bullet, 2, asteroid, asteroid.r))
  if (hit) {
    breakAsteroid(hit)
    bullet.life = 0
  }
}
```

# --meaning--

- `find` returns the first rock that the bullet hits, or `undefined` if there is none.
- `if (hit)` is true only when a rock was found.

# --meaning-tr--

- `asteroids.find((asteroid) => hits(...))` → listede şartı tutan **ilk** öğeyi verir; hiçbiri tutmazsa `undefined`
  (yok).
- `if (hit)` → "bir şey bulunduysa". `undefined` yanlış sayılır.
- `breakAsteroid(hit)` → kayayı kır. `bullet.life = 0` → mermi bir sonraki satırda silinsin; bir mermi iki kaya kırmasın.

# --task--

In `update`, above the `bullets = bullets.filter(...)` line, write the loop.

# --task-tr--

`update` içinde `bullets = bullets.filter(...)` satırının **üstüne** döngüyü yaz. **Çalıştır** ve kayalara ateş et:
büyükler ikiye bölünmeli, küçükler yok olmalı.

# --tests--

A bullet should break the rock it hits and disappear.
tr: Mermi vurduğu kayayı kırmalı ve yok olmalı.

```js
asteroids = [makeAsteroid(300, 100, 3)]
bullets = [{ x: 300, y: 130, vx: 0, vy: 0, life: 20 }]
update()
assert.lengthOf(asteroids, 2)
assert.isTrue(asteroids.every((a) => a.size === 2))
assert.lengthOf(bullets, 0)
```

A bullet that misses should fly on.
tr: Iskalayan mermi uçmaya devam etmeli.

```js
asteroids = [makeAsteroid(300, 100, 1)]
asteroids[0].vx = 0
asteroids[0].vy = 0
bullets = [{ x: 300, y: 130, vx: 0, vy: 0, life: 20 }]
update()
assert.lengthOf(asteroids, 1)
assert.lengthOf(bullets, 1)
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

function hits(a, ar, b, br) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy < (ar + br) * (ar + br)
}

function breakAsteroid(asteroid) {
  asteroids = asteroids.filter((a) => a !== asteroid)
  if (asteroid.size > 1) {
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
  }
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
