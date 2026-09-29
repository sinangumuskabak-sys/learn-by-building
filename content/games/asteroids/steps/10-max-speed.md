---
title: A speed limit
title_tr: Hız sınırı
skills: [game.physics]
---

# --goal--

The speed is the length of the velocity vector, `Math.hypot(vx, vy)`. Over the limit, both parts are scaled down by the
same factor: the direction stays and only the speed shrinks.

# --goal-tr--

Gemi sonsuza kadar hızlanmasın. Toplam hız, hız okunun **uzunluğudur**: `vx` sağa, `vy` aşağı ise uzunluk Pisagor ile
bulunur: `√(vx² + vy²)`. JavaScript'te bunun hazır adı `Math.hypot(vx, vy)`.

Hız sınırı aşarsa **iki** hızı da **aynı oranla** küçülteceğiz. Böylece yön aynı kalır, sadece hız kısalır. İkisini
ayrı ayrı sınırlasaydık gemi çapraz giderken daha hızlı uçardı.

# --code--

```js
const MAX_SPEED = 6

  const speed = Math.hypot(ship.vx, ship.vy)
  if (speed > MAX_SPEED) {
    ship.vx *= MAX_SPEED / speed
    ship.vy *= MAX_SPEED / speed
  }
```

# --meaning--

- `Math.hypot(vx, vy)` is the length of the velocity, Pythagoras.
- `MAX_SPEED / speed` is below 1 when too fast; multiplying both parts by it makes the length exactly `MAX_SPEED`.

# --meaning-tr--

- `Math.hypot(ship.vx, ship.vy)` → hızın uzunluğu: `vx` 3, `vy` 4 ise 5.
- `if (speed > MAX_SPEED)` → sınırı aştıysa (`>` "büyüktür").
- `MAX_SPEED / speed` → 1'den küçük bir oran: hız 8 ise 6 / 8 = 0.75. İki parçayı da bununla çarpınca uzunluk tam 6
  olur, ok aynı yöne bakmaya devam eder.

# --task--

1. Under `FRICTION` write `MAX_SPEED`.
2. In `update`, above `ship.x += ship.vx`, write the speed limit.

# --task-tr--

1. `const FRICTION = ...` satırının altına `MAX_SPEED` satırını yaz.
2. `update` içinde `ship.x += ship.vx` satırının **üstüne** hız sınırı satırlarını yaz.
3. **Çalıştır**.

# --tests--

The speed should be capped in every direction, keeping the direction.
tr: Hız her yönde sınırlanmalı ve yön korunmalı.

```js
ship.angle = Math.PI / 4
$.press('ArrowUp')
$.tick(300)
assert.closeTo(Math.hypot(ship.vx, ship.vy), 6, 0.01)
assert.closeTo(ship.vx, ship.vy, 1e-6, 'still flying diagonally')
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

let ship
const keys = {}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
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
  ship.x += ship.vx
  ship.y += ship.vy
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

resetShip()
requestAnimationFrame(loop)
```
