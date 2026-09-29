---
title: Making a bullet
title_tr: Mermi yapmak
skills: [prog.arrays, game.physics]
---

# --goal--

Many bullets can fly at once, so they go in an array. `shoot` adds one at the ship's nose. Its velocity is the
direction times `BULLET_SPEED`, **plus the ship's own velocity**, like a ball thrown from a moving car.

# --goal-tr--

Ekranda aynı anda birçok mermi olabilir; onları bir **dizide** (listede) tutacağız. `shoot` (ateş et) fonksiyonu
listeye bir mermi ekleyecek.

Mermi **burundan** çıkar ve baktığın yöne uçar. Hızına **geminin kendi hızı da eklenir**: giden bir arabadan ileri
atılan top, yerde duran birinin attığından hızlı gider. Bunu eklemeseydik hızlı uçarken attığın mermi burundan sürünerek
çıkar, hatta geride kalırdı. Her merminin bir de **ömrü** var: kaç kare yaşayacağı.

Bu adımda ekranda bir şey değişmez; ateş tuşunu bir sonraki adımda bağlayacağız.

# --code--

```js
const BULLET_SPEED = 7
const BULLET_LIFE = 55 // frames

let bullets

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

bullets = []
```

# --meaning--

- `dx`, `dy` are the direction the ship faces, worked out once.
- `bullets.push({ ... })` adds a bullet object to the end of the list: at the nose, with the ship's velocity plus the
  bullet speed, and a life of 55 frames.
- `bullets = []` at the bottom starts with an empty list.

# --meaning-tr--

- `BULLET_SPEED = 7` → merminin kendi hızı; `BULLET_LIFE = 55` → kaç kare yaşayacağı (yaklaşık bir saniye).
- `let bullets` → mermi listesi. En altta `bullets = []` ile **boş liste** olarak başlar.
- `const dx = Math.cos(ship.angle)`, `dy = Math.sin(...)` → baktığın yön. Aynı hesabı iki kez yazmamak için bir kere
  hesaplıyoruz.
- `bullets.push({ ... })` → listenin **sonuna** yeni bir mermi nesnesi ekler. Uzun nesne okunsun diye her alan ayrı
  satırda; sondaki virgül serbest.
- `x: ship.x + dx * SHIP_R` → burnun yeri (çizimdeki `tip` ile aynı nokta).
- `vx: ship.vx + dx * BULLET_SPEED` → geminin hızı + mermi hızı.

# --task--

1. Under `MAX_SPEED` write the two bullet constants; under `let ship` write `let bullets`.
2. Above the `keydown` listener write `shoot`, followed by an empty line.
3. At the bottom, above `resetShip()`, write `bullets = []`.

# --task-tr--

1. `const MAX_SPEED = 6` satırının altına iki mermi sabitini yaz.
2. `let ship` satırının altına `let bullets` yaz.
3. `document.addEventListener('keydown', ...` satırının **üstüne** `shoot` fonksiyonunu yaz; altında bir boş satır kalsın.
4. En alttaki `resetShip()` satırının **üstüne** `bullets = []` yaz.
5. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

A bullet should start at the nose, flying the way the ship faces.
tr: Mermi burundan, geminin baktığı yöne uçarak başlamalı.

```js
shoot()
assert.lengthOf(bullets, 1)
const b = bullets[0]
assert.closeTo(b.x, 300, 0.001)
assert.closeTo(b.y, 211, 0.001)
assert.closeTo(b.vx, 0, 0.001)
assert.closeTo(b.vy, -7, 0.001)
assert.strictEqual(b.life, 55)
```

A bullet should carry the ship's velocity.
tr: Mermi geminin hızını taşımalı.

```js
ship.vx = 3
ship.vy = 0
shoot()
assert.closeTo(bullets[0].vx, 3, 0.001)
assert.closeTo(bullets[0].vy, -7, 0.001)
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

bullets = []
resetShip()
requestAnimationFrame(loop)
```
