---
title: Drawing the rocks
title_tr: Kayaları çiz
skills: [game.canvas, game.physics]
---

# --goal--

A rock is drawn as a 10-cornered outline: corner `i` sits at `i / 10` of a full turn, at distance `r * scale` from the
center, found with `cos` and `sin` like the ship's corners.

# --goal-tr--

Kayayı **10 köşeli** bir çizgiyle çizeceğiz. `i`'nci köşe tam turun `i / 10`'unda durur: 0., 36., 72. derece... Her
köşe merkezden `r * scale` uzakta (`scale` şimdilik hep 1). Köşenin yeri geminin köşeleri gibi `cos` ve `sin` ile
bulunur.

# --code--

```js
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

  for (const asteroid of asteroids) drawAsteroid(asteroid)
```

# --meaning--

- `forEach((scale, i) => ...)` runs for every item of `shape`: `scale` is the item, `i` its number.
- The first corner moves the pen there, the others draw lines, and `closePath` joins the last to the first.
- In `draw`, every asteroid is drawn right after the line settings.

# --meaning-tr--

- `asteroid.shape.forEach((scale, i) => { ... })` → dizideki **her öğe için** işi yapar: `scale` öğenin kendisi, `i`
  sıra numarası (0, 1, ... 9).
- `(i / asteroid.shape.length) * Math.PI * 2` → `i`'nci köşenin açısı: tam turun onda `i`'si.
- `x`, `y` → o açıda, `r * scale` uzaklıktaki nokta.
- `if (i === 0) ctx.moveTo(x, y)` → ilk köşede kalemi oraya götür; `else ctx.lineTo(x, y)` → **değilse**, çizgi çek.
- `ctx.closePath()` → son köşeyi ilk köşeye bağlar.
- `draw` içindeki satır → her kayayı çizer. Beyaz çizgi ayarlarından sonra, gemiden önce.

# --task--

1. Above `function draw() {` write `drawAsteroid`, followed by an empty line.
2. In `draw`, under `ctx.lineWidth = 2`, write the asteroid line and an empty line.

# --task-tr--

1. `function draw() {` satırının **üstüne** `drawAsteroid` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `draw` içinde `ctx.lineWidth = 2` satırının altına kayaları çizen satırı yaz; altında (drawShip'ten önce) bir boş
   satır kalsın.
3. **Çalıştır**: üst kenarda dört düzgün, on köşeli şekil görmelisin. (Henüz kıpırdamıyorlar.)

# --tests--

Each asteroid should be drawn as a closed 10-corner outline.
tr: Her asteroit kapalı 10 köşeli bir çizgi olarak çizilmeli.

```js
$.tick(1)
const lines = $.screen().filter((c) => c.op === 'lineTo').length
assert.strictEqual(lines, 4 * 9 + 2, '9 lines per rock after the first corner, plus 2 for the ship')
```

The corners should sit `r` from the center.
tr: Köşeler merkezden `r` uzakta olmalı.

```js
asteroids = [makeAsteroid(100, 100, 2)]
$.tick(1)
const first = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(first.args[0], 128, 1e-9)
assert.closeTo(first.args[1], 100, 1e-9)
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
