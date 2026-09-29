---
title: When do two circles touch?
title_tr: İki daire ne zaman değer?
skills: [game.collision]
---

# --goal--

Two circles touch when the distance between their centers is less than the sum of their radii. Comparing **squared**
distances skips the square root and gives the same answer.

# --goal-tr--

Çarpışma için her şeyi bir **daire** sayacağız: mermi minik bir daire, kaya kendi yarıçapında bir daire. İki daire,
merkezleri arasındaki uzaklık **iki yarıçapın toplamından küçükse** değer.

Uzaklık Pisagor ile bulunur: `√(dx² + dy²)`. Karekök almak yerine iki tarafın da karesini karşılaştırırız; sonuç aynı,
hesap daha hızlı. `hits` (vurur mu?) fonksiyonu bunu soracak. Bu adımda ekran değişmez.

# --code--

```js
function hits(a, ar, b, br) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy < (ar + br) * (ar + br)
}
```

# --meaning--

- `a` and `b` are anything with `x` and `y`; `ar` and `br` their radii.
- The comparison itself is `true` or `false`, and that is what the function returns.

# --meaning-tr--

- `a` ve `b` → yeri olan (`x`, `y` taşıyan) iki şey; `ar` ve `br` → yarıçapları.
- `dx`, `dy` → iki merkez arasındaki yatay ve dikey fark.
- `dx * dx + dy * dy` → uzaklığın **karesi**; `(ar + br) * (ar + br)` → yarıçaplar toplamının karesi.
- `<` karşılaştırması zaten `true` ya da `false` üretir; `return` onu geri verir. Tam değmek (eşit olmak) sayılmaz.

# --task--

Above the `keydown` listener write `hits`, followed by an empty line.

# --task-tr--

`document.addEventListener('keydown', ...` satırının **üstüne** `hits` fonksiyonunu yaz; altında bir boş satır kalsın.
**Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

Two circles of radius 10, centers at (0, 0) and (15, 15). Do they touch?
- [ ] Yes, 15 is less than 20
- [x] No
  The distance is √(15² + 15²) ≈ 21.2, more than 20. Looking at `x` and `y` separately is not enough.

# --predict-tr--

Yarıçapı 10 olan iki daire, merkezleri (0, 0) ve (15, 15). Değerler mi?
- [ ] Evet, 15, 20'den küçük
- [x] Hayır
  Uzaklık √(15² + 15²) ≈ 21.2, yani 20'den fazla. `x` ve `y`'ye ayrı ayrı bakmak yetmez.

# --tests--

`hits()` should compare the distance with the sum of the radii.
tr: `hits()` uzaklığı yarıçapların toplamıyla karşılaştırmalı.

```js
assert.isTrue(hits({ x: 0, y: 0 }, 10, { x: 15, y: 0 }, 10))
assert.isFalse(hits({ x: 0, y: 0 }, 10, { x: 20, y: 0 }, 10), 'just touching does not count')
assert.isTrue(hits({ x: 0, y: 0 }, 10, { x: 14, y: 14 }, 10))
assert.isFalse(hits({ x: 0, y: 0 }, 10, { x: 15, y: 15 }, 10))
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

function hits(a, ar, b, br) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy < (ar + br) * (ar + br)
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
