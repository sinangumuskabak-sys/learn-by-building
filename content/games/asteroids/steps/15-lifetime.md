---
title: A lifetime for bullets
title_tr: Mermilere ömür
skills: [prog.arrays]
---

# --goal--

Bullets wrap, so they never leave the screen and cannot just be removed there. Instead each one's `life` counts down, and
at 0 it is dropped: `filter` keeps only the bullets that still have life.

# --goal-tr--

Mermiler kenarlardan dolaştığı için ekrandan hiç çıkmıyor; "ekrandan çıkınca sil" diyemeyiz. Onun yerine **ömür
sayacı**: her karede `life` 1 azalır, 0 olunca mermi silinir. Kenarı olmayan her şeyi sınırlamanın doğal yolu bir geri
sayım.

# --code--

```js
  bullet.life -= 1

bullets = bullets.filter((bullet) => bullet.life > 0)
```

# --meaning--

- Each frame every bullet loses 1 life.
- `filter` builds a **new** list with only the bullets whose `life` is above 0, and we put it in `bullets`.

# --meaning-tr--

- `bullet.life -= 1` → döngünün içinde: her mermi her karede 1 ömür kaybeder. 55 kare sonra 0'dır.
- `bullets.filter((bullet) => bullet.life > 0)` → listeden sadece şartı tutanları alıp **yeni bir liste** yapar. Ömrü
  bitenler dışarıda kalır.
- `bullets = ...` → eski listenin yerine yeni liste. `bullets` bu yüzden `const` değil `let`.

# --task--

1. In the bullet loop, under the two moving lines, write `bullet.life -= 1`.
2. Under the loop's closing `}` write the `filter` line.

# --task-tr--

1. Mermi döngüsünde iki hareket satırının altına `bullet.life -= 1` yaz.
2. Döngünün kapanış `}`'sinin **altına** `filter` satırını yaz (`update`'in son `}`'sinden önce).
3. **Çalıştır** ve ateş et: mermiler bir süre uçup kaybolmalı.

# --tests--

Bullets should expire after 55 frames.
tr: Mermiler 55 kare sonra yok olmalı.

```js
shoot()
$.tick(40)
assert.lengthOf(bullets, 1)
assert.isAbove(bullets[0].y, 200, 'it flew off the top and came back at the bottom')
$.tick(15)
assert.lengthOf(bullets, 0)
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

let ship
let bullets
const keys = {}

// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
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
resetShip()
requestAnimationFrame(loop)
```
