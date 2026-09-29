---
title: Fire!
title_tr: Ateş!
skills: [game.input, game.canvas]
---

# --goal--

Space fires, once per press: holding the key sends repeated `keydown` events with `event.repeat` set, and we ignore
those. Each bullet is drawn as a small white square.

# --goal-tr--

**Boşluk** tuşu ateş etsin, ama her basışta **bir kez**. Tuşu basılı tutunca bilgisayar `keydown` olayını tekrar tekrar
gönderir; bu tekrarlarda `event.repeat` `true` olur. Onları yok sayarsak makineli tüfek olmaz.

Her mermiyi küçük beyaz bir kare olarak çizeceğiz. Mermiler henüz hareket etmiyor; burnun ucunda birikecekler.

# --code--

```js
if (event.key === ' ' && !event.repeat) shoot()

ctx.fillStyle = 'white'
for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)
```

# --meaning--

- `' '` is the Space key; `!event.repeat` is true only for the first press, and `&&` needs both.
- `for (const bullet of bullets)` goes through every bullet and paints a 3×3 square centered on it.

# --meaning-tr--

- `event.key === ' '` → basılan tuş boşluk mu? `===` "eşit mi?" diye sorar; `' '` tırnak içinde bir boşluk.
- `!event.repeat` → `!` "değil": tekrar **değilse**, yani ilk basışsa. `&&` "ve": iki şart da doğru olmalı.
- `for (const bullet of bullets) ...` → listedeki **her mermi için**, ona `bullet` de ve işi yap.
- `ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)` → 3 × 3 piksel kare. Mermi tam ortada olsun diye sol üst köşeyi
  1.5 piksel sola ve yukarı kaydırıyoruz.

# --task--

1. In the `keydown` listener, under `keys[event.key] = true`, write the Space line.
2. In `draw`, under `drawShip()`, leave an empty line and write the two bullet lines.

# --task-tr--

1. `keydown` dinleyicisinde `keys[event.key] = true` satırının altına Boşluk satırını yaz.
2. `draw` içinde `drawShip()` satırının altına bir boş satır bırakıp iki mermi satırını yaz.
3. **Çalıştır**, oyuna tıkla ve Boşluk'a bas: burnun ucunda küçük beyaz bir kare görünmeli.

# --tests--

Pressing Space should fire one bullet.
tr: Boşluğa basmak bir mermi atmalı.

```js
$.press(' ')
assert.lengthOf(bullets, 1)
```

Holding Space should fire only once.
tr: Boşluğu basılı tutmak yalnızca bir kez ateş etmeli.

```js
$.press(' ')
$.press(' ', { repeat: true })
$.press(' ', { repeat: true })
assert.lengthOf(bullets, 1)
```

Bullets should be drawn as small white squares.
tr: Mermiler küçük beyaz kareler olarak çizilmeli.

```js
bullets = [{ x: 100, y: 50, vx: 0, vy: 0, life: 10 }]
$.tick(1)
assert.deepEqual($.rects('white').map((r) => [r.x, r.y, r.w, r.h]), [[98.5, 48.5, 3, 3]])
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
