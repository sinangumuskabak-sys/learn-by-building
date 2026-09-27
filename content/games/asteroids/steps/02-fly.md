---
title: Turning, thrust and drift
title_tr: Dönüş, itki ve kayma
skills: [game.physics, game.input]
---

# --explanation--

Left and right turn the ship by changing its `angle`. Up is **thrust**: it does not set the speed, it **adds** a little
velocity in the direction the ship is facing, using the same `cos`/`sin` direction vector:

```js
ship.vx += Math.cos(ship.angle) * THRUST
ship.vy += Math.sin(ship.angle) * THRUST
```

That is what gives Asteroids its famous feel: the ship keeps drifting the way it was going, and turning around does not
stop it. To brake, you have to turn and thrust the other way. This is **inertia**, straight from Newton.

Two small rules keep it playable:

- **Friction**: multiply the velocity by `0.99` every frame, so a ship left alone slowly drifts to a stop.
- **A speed limit**: the speed is the length of the velocity vector, `Math.hypot(vx, vy)`. If it is over the maximum,
  scale **both** parts down by the same factor. That keeps the direction and only shortens the vector. Capping `vx` and
  `vy` separately would let the ship fly faster diagonally.

# --explanation-tr--

Sol ve sağ, `angle`'ı değiştirerek gemiyi döndürür. Yukarı **itkidir**: hızı ayarlamaz; aynı `cos`/`sin` yön vektörünü
kullanarak geminin baktığı yöne biraz hız **ekler**:

```js
ship.vx += Math.cos(ship.angle) * THRUST
ship.vy += Math.sin(ship.angle) * THRUST
```

Asteroids'e ünlü hissini veren budur: gemi gittiği yöne kaymaya devam eder ve arkasını dönmek onu durdurmaz. Fren yapmak
için dönüp öbür yöne itmen gerekir. Bu, doğrudan Newton'dan gelen **eylemsizliktir**.

İki küçük kural onu oynanabilir tutar:

- **Sürtünme**: hızı her karede `0.99` ile çarp; kendi hâline bırakılan gemi yavaşça durur.
- **Hız sınırı**: hız, hız vektörünün uzunluğudur, `Math.hypot(vx, vy)`. En büyük değeri aşarsa **iki** bileşeni de
  aynı oranla küçült. Bu yönü korur, yalnızca vektörü kısaltır. `vx` ve `vy`'yi ayrı ayrı sınırlamak geminin çaprazda
  daha hızlı uçmasına izin verirdi.

# --task--

1. Add `TURN = 0.07`, `THRUST = 0.12`, `FRICTION = 0.99`, `MAX_SPEED = 6` and a `keys` object for held keys.
2. Write `update()`: `ArrowLeft`/`ArrowRight` change `ship.angle` by `TURN`; `ArrowUp` adds thrust as above. Then apply
   friction to both velocity parts, cap the speed at `MAX_SPEED` by scaling both parts, and move the ship by its
   velocity.
3. Run `update()` and `draw()` in a `requestAnimationFrame` loop.

# --task-tr--

1. `TURN = 0.07`, `THRUST = 0.12`, `FRICTION = 0.99`, `MAX_SPEED = 6` ve basılı tuşlar için bir `keys` nesnesi ekle.
2. `update()` yaz: `ArrowLeft`/`ArrowRight` `ship.angle`'ı `TURN` kadar değiştirsin; `ArrowUp` yukarıdaki gibi itki
   eklesin. Sonra iki hız bileşenine de sürtünme uygula, hızı iki bileşeni ölçekleyerek `MAX_SPEED`'te sınırla ve gemiyi
   hızı kadar taşı.
3. `update()` ve `draw()`'u bir `requestAnimationFrame` döngüsünde çalıştır.

# --tests--

The arrows should turn the ship.
tr: Oklar gemiyi döndürmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(ship.angle, -Math.PI / 2 + 0.7, 1e-9)
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(20)
assert.closeTo(ship.angle, -Math.PI / 2 - 0.7, 1e-9)
```

Thrust should push the ship the way it faces, and it should keep drifting.
tr: İtki gemiyi baktığı yöne itmeli ve gemi kaymaya devam etmeli.

```js
$.press('ArrowUp')
$.tick(10)
$.release('ArrowUp')
assert.isBelow(ship.vy, -1, 'moving up')
assert.closeTo(ship.vx, 0, 1e-9)
const y = ship.y
$.tick(10)
assert.isBelow(ship.y, y, 'still drifting up without thrust')
```

Friction should slowly stop a drifting ship.
tr: Sürtünme kayan bir gemiyi yavaşça durdurmalı.

```js
ship.vx = 2
update()
assert.closeTo(ship.vx, 1.98, 1e-9)
for (let i = 0; i < 600; i++) update()
assert.isBelow(Math.abs(ship.vx), 0.01)
```

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
