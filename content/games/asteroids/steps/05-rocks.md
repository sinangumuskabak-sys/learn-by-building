---
title: Jagged rocks drifting in space
title_tr: Uzayda sürüklenen pürüzlü kayalar
skills: [game.canvas, prog.arrays]
---

# --explanation--

An asteroid has a position, a velocity and a **size**: 3 (big), 2 (medium) or 1 (small). Its radius comes from a small
lookup table, `SIZES[size]`, and it moves in a random direction: pick a random angle, then turn it into a velocity with
`cos` and `sin`, exactly like thrust.

A perfect circle would look like a bubble, not a rock. The trick is to draw a polygon whose corners sit at **slightly
random distances** from the center:

```js
shape: Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)   // one scale per corner
```

Corner `i` sits at angle `i / 10` of a full turn, at distance `r * shape[i]`. The random scales are chosen **once**, when
the asteroid is made, and stored with it. If you rolled new random numbers every frame, the outline would fizz and
wobble. Deciding randomness once and remembering it is how games give each enemy, tree or cloud its own stable look.

For collisions, the rock is still treated as a simple circle of radius `r`. The jagged outline is only for the eye.

# --explanation-tr--

Bir asteroitin konumu, hızı ve bir **boyutu** vardır: 3 (büyük), 2 (orta) ya da 1 (küçük). Yarıçapı küçük bir arama
tablosundan gelir, `SIZES[size]`, ve rastgele bir yönde hareket eder: rastgele bir açı seç, sonra onu itkideki gibi `cos`
ve `sin` ile bir hıza çevir.

Kusursuz bir daire kaya değil baloncuk gibi görünür. Hile, köşeleri merkezden **biraz rastgele uzaklıklarda** duran bir
çokgen çizmektir:

```js
shape: Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)   // köşe başına bir ölçek
```

`i`. köşe tam turun `i / 10`'u açıda, `r * shape[i]` uzaklıkta durur. Rastgele ölçekler asteroit yapılırken **bir kez**
seçilir ve onunla birlikte saklanır. Her karede yeni rastgele sayılar çekseydin taslak cızırdar ve titrerdi. Rastgeleliği
bir kez belirleyip hatırlamak, oyunların her düşmana, ağaca ya da buluta kendi sabit görünümünü vermesinin yoludur.

Çarpışmalarda kaya yine `r` yarıçaplı basit bir daire sayılır. Pürüzlü taslak yalnızca göz içindir.

# --task--

1. Add `SIZES = [0, 15, 28, 45]` and `let asteroids`.
2. Write `makeAsteroid(x, y, size)`: a random angle, `speed = 0.6 + Math.random() * (4 - size) * 0.5` (smaller is
   faster), velocity from the angle, `r: SIZES[size]`, and a `shape` of 10 random scales from 0.75 to 1.1.
3. Start with 4 big asteroids at the top or left edge. In `update()`, move and wrap every asteroid.
4. Write `drawAsteroid(asteroid)` that strokes the jagged outline, and draw every asteroid.

# --task-tr--

1. `SIZES = [0, 15, 28, 45]` ve `let asteroids` ekle.
2. `makeAsteroid(x, y, size)` yaz: rastgele bir açı, `speed = 0.6 + Math.random() * (4 - size) * 0.5` (küçük olan daha
   hızlı), açıdan hız, `r: SIZES[size]` ve 0.75 ile 1.1 arası 10 rastgele ölçekten oluşan bir `shape`.
3. Üst ya da sol kenarda 4 büyük asteroitle başla. `update()` içinde her asteroiti taşı ve dolaştır.
4. Pürüzlü taslağı çizgiyle çizen `drawAsteroid(asteroid)` yaz ve her asteroiti çiz.

# --tests--

`makeAsteroid()` should build a rock of the right size with a stable jagged shape.
tr: `makeAsteroid()` doğru boyutta, sabit pürüzlü biçimli bir kaya kurmalı.

```js
const rock = makeAsteroid(100, 100, 3)
assert.include(rock, { x: 100, y: 100, size: 3, r: 45 })
assert.lengthOf(rock.shape, 10)
assert.isTrue(rock.shape.every((s) => s >= 0.75 && s <= 1.1))
assert.isAbove(new Set(rock.shape).size, 5, 'the corners should be at different distances')
```

Smaller rocks should tend to move faster.
tr: Küçük kayalar daha hızlı hareket etme eğiliminde olmalı.

```js
const speed = (size) => {
  let total = 0
  for (let i = 0; i < 200; i++) {
    const a = makeAsteroid(0, 0, size)
    total += Math.hypot(a.vx, a.vy)
  }
  return total / 200
}
assert.isAbove(speed(1), speed(3))
const big = makeAsteroid(0, 0, 3)
assert.isAtLeast(Math.hypot(big.vx, big.vy), 0.6 - 1e-9)
assert.isAtMost(Math.hypot(big.vx, big.vy), 1.1 + 1e-9)
```

There should be 4 big asteroids, drifting and wrapping.
tr: Sürüklenen ve dolaşan 4 büyük asteroit olmalı.

```js
assert.lengthOf(asteroids, 4)
assert.isTrue(asteroids.every((a) => a.size === 3))
const a = asteroids[0]
a.x = 598
a.vx = 3
a.vy = 0
update()
assert.isBelow(a.x, 5)
```

Each asteroid should be drawn as a closed 10-corner outline.
tr: Her asteroit kapalı 10 köşeli bir taslak olarak çizilmeli.

```js
draw()
const lines = $.screen().filter((c) => c.op === 'lineTo').length
assert.strictEqual(lines, 4 * 9 + 2, '9 lines per rock after the first corner, plus 2 for the ship')
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
