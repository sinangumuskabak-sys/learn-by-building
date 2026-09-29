---
title: Breaking a rock
title_tr: Kaya kırmak
skills: [prog.arrays, game.state]
---

# --goal--

A hit rock breaks: it is removed, and unless it was the smallest, two rocks one size smaller are born at the same spot,
each flying its own random way. Big → two medium → two small → gone.

# --goal-tr--

Vurulan kaya **kırılır**: listeden çıkar; en küçük boy değilse aynı yerde bir küçük boydan **iki yeni kaya** doğar.
Her biri yeni bir `makeAsteroid` çağrısı olduğu için kendi rastgele yönüne fırlar. Büyük → iki orta → iki küçük → yok.

Bu kural oyunu oynadıkça zorlaştırır: yavaş bir büyük hedef, iki hızlı orta hedefe dönüşür. Bu adımda ekran değişmez;
mermiyle bağlantıyı bir sonraki adımda kuracağız.

# --code--

```js
function breakAsteroid(asteroid) {
  asteroids = asteroids.filter((a) => a !== asteroid)
  if (asteroid.size > 1) {
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
  }
}
```

# --meaning--

- `filter((a) => a !== asteroid)` keeps every rock except this one, in a new list.
- If it was bigger than 1, two new rocks of `size - 1` are added at its position.

# --meaning-tr--

- `asteroids.filter((a) => a !== asteroid)` → "bu kaya **olmayan** her şeyi tut". `!==` "eşit değil" demek. `filter`
  eski listeye dokunmaz, yeni bir liste yapar. Bir listede döngüyle gezerken aynı listeden öğe silmek bazı öğelerin
  atlanmasına yol açan klasik bir hatadır; `filter` bu tuzaktan korur.
- `if (asteroid.size > 1)` → en küçük değilse.
- İki `push` → aynı yerde, bir küçük boydan iki yeni kaya.

# --task--

Above the `keydown` listener write `breakAsteroid`, followed by an empty line.

# --task-tr--

`document.addEventListener('keydown', ...` satırının **üstüne** `breakAsteroid` fonksiyonunu yaz; altında bir boş satır
kalsın. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

A big rock should break into two medium ones at the same spot.
tr: Büyük bir kaya aynı yerde iki orta kayaya bölünmeli.

```js
const big = makeAsteroid(300, 100, 3)
const other = makeAsteroid(50, 50, 1)
asteroids = [big, other]
breakAsteroid(big)
assert.lengthOf(asteroids, 3)
assert.notInclude(asteroids, big)
assert.include(asteroids, other)
const pieces = asteroids.filter((a) => a !== other)
assert.isTrue(pieces.every((a) => a.size === 2 && a.r === 28 && a.x === 300 && a.y === 100))
assert.isFalse(pieces[0].vx === pieces[1].vx && pieces[0].vy === pieces[1].vy, 'the pieces should fly apart')
```

A small rock should just disappear.
tr: Küçük bir kaya yalnızca yok olmalı.

```js
asteroids = [makeAsteroid(300, 100, 1)]
breakAsteroid(asteroids[0])
assert.lengthOf(asteroids, 0)
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
