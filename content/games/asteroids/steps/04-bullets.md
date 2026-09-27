---
title: Firing from the nose
title_tr: Burundan ateş
skills: [game.physics, prog.arrays]
---

# --explanation--

Bullets leave from the ship's **nose**, the same point you draw: `SHIP_R` pixels in the direction the ship faces. Their
velocity is the direction vector times the bullet speed, **plus the ship's own velocity**:

```js
vx: ship.vx + Math.cos(ship.angle) * BULLET_SPEED
```

Why add the ship's velocity? Because that is how motion works: a ball thrown forward from a moving car goes faster than
one thrown by someone standing still. Without it, bullets fired while flying fast would seem to crawl out of the nose,
or even fall behind the ship.

Bullets wrap around the screen like everything else, so they cannot simply be removed when they leave it. Instead each
bullet has a **lifetime** in frames that counts down, and it disappears at 0. A countdown is the natural way to limit
anything that has no edge to fall off.

Space fires once per press: ignore `keydown` events with `event.repeat`, so holding the key does not make a machine gun.

# --explanation-tr--

Mermiler geminin **burnundan**, çizdiğin noktanın aynısından çıkar: geminin baktığı yönde `SHIP_R` piksel ötede. Hızları
yön vektörü çarpı mermi hızı, **artı geminin kendi hızıdır**:

```js
vx: ship.vx + Math.cos(ship.angle) * BULLET_SPEED
```

Neden geminin hızını ekliyoruz? Çünkü hareket böyle işler: hareket eden bir arabadan ileri atılan bir top, yerinde duran
birinin attığından daha hızlı gider. Bu olmadan, hızla uçarken atılan mermiler burundan sürünerek çıkıyor ya da geminin
gerisinde kalıyor gibi görünürdü.

Mermiler de her şey gibi ekranın çevresinde dolaşır; bu yüzden ekrandan çıkınca öylece kaldırılamazlar. Bunun yerine her
merminin karelerle ölçülen, geri sayan bir **ömrü** vardır ve 0'da kaybolur. Düşeceği bir kenarı olmayan her şeyi
sınırlamanın doğal yolu bir geri sayımdır.

Boşluk her basışta bir kez ateş eder: `event.repeat` olan `keydown` olaylarını yok say, böylece tuşu basılı tutmak onu
makineli tüfeğe çevirmez.

# --task--

1. Add `BULLET_SPEED = 7`, `BULLET_LIFE = 55` and `let bullets = []`.
2. Write `shoot()` that pushes a bullet at the ship's nose, with velocity `ship.v + direction * BULLET_SPEED` and
   `life: BULLET_LIFE`. Call it on a non-repeated Space `keydown`.
3. In `update()`, move and wrap every bullet, subtract 1 from its `life`, and keep only bullets with `life > 0`.
4. Draw each bullet as a white 3×3 square centered on it.

# --task-tr--

1. `BULLET_SPEED = 7`, `BULLET_LIFE = 55` ve `let bullets = []` ekle.
2. Geminin burnunda, `ship.v + yön * BULLET_SPEED` hızlı ve `life: BULLET_LIFE` ömürlü bir mermi ekleyen `shoot()` yaz.
   Tekrar olmayan bir Boşluk `keydown`'ında çağır.
3. `update()` içinde her mermiyi taşı ve dolaştır, `life`'ından 1 çıkar ve yalnızca `life > 0` olanları tut.
4. Her mermiyi ortalanmış beyaz 3×3 bir kare olarak çiz.

# --tests--

A bullet should leave the nose in the direction the ship faces.
tr: Bir mermi burundan, geminin baktığı yönde çıkmalı.

```js
$.press(' ')
assert.lengthOf(bullets, 1)
const b = bullets[0]
assert.closeTo(b.x, 300, 0.001)
assert.closeTo(b.y, 211, 0.001)
assert.closeTo(b.vx, 0, 0.001)
assert.closeTo(b.vy, -7, 0.001)
assert.strictEqual(b.life, 55)
```

A bullet should carry the ship's velocity.
tr: Bir mermi geminin hızını taşımalı.

```js
ship.vx = 3
ship.vy = 0
shoot()
assert.closeTo(bullets[0].vx, 3, 0.001)
assert.closeTo(bullets[0].vy, -7, 0.001)
```

Bullets should move, wrap and expire after 55 frames.
tr: Mermiler hareket etmeli, dolaşmalı ve 55 kare sonra sona ermeli.

```js
shoot()
$.tick(40)
assert.lengthOf(bullets, 1)
assert.isAbove(bullets[0].y, 200, 'it flew off the top and came back at the bottom')
$.tick(15)
assert.lengthOf(bullets, 0)
```

Holding Space should fire only once.
tr: Boşluğu basılı tutmak yalnızca bir kez ateş etmeli.

```js
$.press(' ')
$.press(' ', { repeat: true })
$.press(' ', { repeat: true })
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
