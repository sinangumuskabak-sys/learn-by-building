---
title: A little friction
title_tr: Biraz sürtünme
skills: [game.physics]
---

# --goal--

Real space has no friction, but a game is nicer with a little: every frame both velocity parts are multiplied by 0.99,
so a ship left alone slowly drifts to a stop.

# --goal-tr--

Gerçek uzayda sürtünme yok, ama oyun biraz sürtünmeyle daha rahat oynanır. Her karede iki hızı da `0.99` ile
çarpacağız: kendi hâline bırakılan gemi yavaş yavaş durur.

# --code--

```js
const FRICTION = 0.99

  ship.vx *= FRICTION
  ship.vy *= FRICTION
```

# --meaning--

- `*=` multiplies: each frame the velocity keeps 99% of itself. After 60 frames about 55% is left.

# --meaning-tr--

- `ship.vx *= FRICTION` → "`vx`'i 0.99 ile çarp ve kaydet". Her karede hız %1 azalır.
- Çarpma olduğu için hız hiç eksiye dönmez; sadece küçülür: 2 → 1.98 → 1.96... Bir saniyede (60 kare) yaklaşık yarısı
  kalır.

# --task--

1. Under `THRUST` write `FRICTION`.
2. In `update`, above `ship.x += ship.vx`, write the two friction lines.

# --task-tr--

1. `const THRUST = ...` satırının altına `FRICTION` satırını yaz.
2. `update` içinde `ship.x += ship.vx` satırının **üstüne** iki sürtünme satırını yaz.
3. **Çalıştır**: itip bırakınca gemi yavaşça durmalı.

# --try--

Try `FRICTION = 1` (no friction at all, like real space) and then `0.95`. Put 0.99 back.

# --try-tr--

`FRICTION = 1` (hiç sürtünme yok, gerçek uzay gibi) ve sonra `0.95` dene. Sonra 0.99'a geri al.

# --tests--

Friction should slowly stop a drifting ship.
tr: Sürtünme kayan bir gemiyi yavaşça durdurmalı.

```js
ship.vx = 2
update()
assert.closeTo(ship.vx, 1.98, 1e-9)
for (let i = 0; i < 600; i++) update()
assert.isBelow(Math.abs(ship.vx), 0.01)
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
