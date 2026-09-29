---
title: Bullets fly
title_tr: Mermiler uçar
skills: [game.physics, prog.loops]
---

# --goal--

Every frame each bullet moves by its velocity and wraps around the screen, exactly like the ship.

# --goal-tr--

Şimdi mermiler uçsun: her karede her mermi kendi hızı kadar ilerlesin ve ekranın kenarından dolaşsın; tıpkı gemi gibi.
`wrap` fonksiyonunu bir kez yazmıştık, şimdi ikinci kez işe yarıyor.

# --code--

```js
for (const bullet of bullets) {
  bullet.x = wrap(bullet.x + bullet.vx, canvas.width)
  bullet.y = wrap(bullet.y + bullet.vy, canvas.height)
}
```

# --meaning--

- The loop visits every bullet; `bullet` is the object in the list itself, so changing it changes the list.

# --meaning-tr--

- `for (const bullet of bullets) { ... }` → her mermi için süslü parantezin içini yap.
- `bullet` listedeki nesnenin **kendisi**; `bullet.x`'i değiştirmek listedeki mermiyi değiştirir.
- İki satır geminin hareket satırlarının aynısı, sadece `ship` yerine `bullet`.

# --task--

In `update`, under the ship's two moving lines, leave an empty line and write the loop.

# --task-tr--

`update` içinde geminin iki `wrap`'li hareket satırının altına bir boş satır bırakıp döngüyü yaz. **Çalıştır** ve ateş et:
mermiler uçmalı ve kenarlardan dolaşmalı. (Şimdilik hiç yok olmuyorlar.)

# --predict--

Fire ten times and wait. How many bullets will be flying after a minute?
- [ ] None
- [x] All ten, forever
  Nothing removes a bullet yet: they wrap around the screen for ever. The next step gives them a lifetime.
- [ ] One

# --predict-tr--

On kez ateş et ve bekle. Bir dakika sonra kaç mermi uçuyor olur?
- [ ] Hiç
- [x] Onu da, sonsuza kadar
  Mermiyi silen hiçbir şey yok: kenarlardan dolaşıp dururlar. Bir sonraki adımda onlara ömür vereceğiz.
- [ ] Bir

# --tests--

Bullets should move by their velocity.
tr: Mermiler hızları kadar ilerlemeli.

```js
shoot()
$.tick(1)
assert.closeTo(bullets[0].y, 204, 0.001)
```

Bullets should wrap around the screen.
tr: Mermiler ekranın çevresinden dolaşmalı.

```js
bullets = [{ x: 100, y: 3, vx: 0, vy: -7, life: 50 }]
$.tick(1)
assert.closeTo(bullets[0].y, 446, 0.001)
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
  }
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
