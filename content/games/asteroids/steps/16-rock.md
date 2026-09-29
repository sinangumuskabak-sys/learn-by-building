---
title: Making a rock
title_tr: Kaya yapmak
skills: [prog.arrays, game.physics]
---

# --goal--

An asteroid has a position, a velocity and a **size**: 3 big, 2 medium, 1 small. Its radius comes from the table
`SIZES`. It flies in a random direction, smaller ones faster. `shape` holds how far each of its 10 corners is from the
center; all 1 for now.

# --goal-tr--

Sıra kayalarda. Bir kaya neyi bilir? Yerini (`x`, `y`), hızını (`vx`, `vy`) ve **boyunu** (`size`): 3 büyük, 2 orta,
1 küçük. Yarıçapını (`r`) boyuna göre küçük bir tablodan okuruz.

Her kaya **rastgele bir yöne** uçar; küçükler daha hızlı olabilir. Bir de `shape` (biçim): kayanın 10 köşesinin
merkezden ne kadar uzakta olduğu. Şimdilik hepsi 1 (düzgün bir şekil); ileride pürüzlendireceğiz.

Bu adımda ekran değişmez; kaya yapan fonksiyonu yazıyoruz.

# --code--

```js
const SIZES = [0, 15, 28, 45] // asteroid radius for size 1, 2 and 3

function makeAsteroid(x, y, size) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.6 + Math.random() * (4 - size) * 0.5 // smaller asteroids are faster
  const shape = Array.from({ length: 10 }, () => 1)
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, r: SIZES[size], shape }
}
```

# --meaning--

- `SIZES[size]` looks up the radius; index 0 is a placeholder so size 3 is simply `SIZES[3]`.
- `Math.random()` is a random number from 0 up to 1: times `2π` it is any angle. The speed is at least 0.6, and
  `(4 - size)` is bigger for small rocks.
- The velocity comes from the angle with `cos` and `sin`, like thrust.
- `Array.from({ length: 10 }, () => 1)` makes a list of ten 1s.
- `{ x, y, ... size }` is short for `{ x: x, y: y, ... size: size }`.

# --meaning-tr--

- `const SIZES = [0, 15, 28, 45]` → **tablo**: `SIZES[3]` → 45. Dizide sıra numaraları **0'dan** başlar; baştaki 0 boş
  bir yer tutucu, böylece "boy 3" doğrudan `SIZES[3]` olur.
- `Math.random()` → her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir sayı.
- `Math.random() * Math.PI * 2` → 0 ile tam tur arasında rastgele bir **açı**.
- `0.6 + Math.random() * (4 - size) * 0.5` → en az 0.6 olan bir hız. `size` küçüldükçe `(4 - size)` büyür: küçük
  kayalar daha hızlı olabilir. Büyük kaya 0.6–1.1, küçük kaya 0.6–2.1.
- `vx: Math.cos(angle) * speed` → açıdan hıza geçiş, itkideki `cos`/`sin` hesabının aynısı.
- `Array.from({ length: 10 }, () => 1)` → "10 öğeli bir dizi yap; her öğeyi şu fonksiyonla üret": `[1, 1, ..., 1]`.
- `return { x, y, ..., size, ..., shape }` → kısa yazım: ad ile değer aynıysa bir kez yazılır (`size` = `size: size`).

# --task--

1. Under `BULLET_LIFE` write `SIZES`.
2. Above `function shoot() {` write `makeAsteroid`, followed by an empty line.

# --task-tr--

1. `const BULLET_LIFE = ...` satırının altına `SIZES` satırını yaz.
2. `function shoot() {` satırının **üstüne** `makeAsteroid` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

`makeAsteroid()` should build a rock of the right size.
tr: `makeAsteroid()` doğru boyutta bir kaya kurmalı.

```js
const rock = makeAsteroid(100, 80, 3)
assert.include(rock, { x: 100, y: 80, size: 3, r: 45 })
assert.deepEqual(rock.shape, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
assert.strictEqual(makeAsteroid(0, 0, 1).r, 15)
```

Rocks should fly in random directions, smaller ones faster.
tr: Kayalar rastgele yönlere uçmalı, küçükler daha hızlı.

```js
const speed = (size) => {
  let total = 0
  for (let i = 0; i < 200; i++) {
    const a = makeAsteroid(0, 0, size)
    total += Math.hypot(a.vx, a.vy)
  }
  return total / 200
}
assert.isAbove(speed(1), speed(3))
const big = makeAsteroid(0, 0, 3)
assert.isAtLeast(Math.hypot(big.vx, big.vy), 0.6 - 1e-9)
assert.isAtMost(Math.hypot(big.vx, big.vy), 1.1 + 1e-9)
const a = makeAsteroid(0, 0, 2)
const b = makeAsteroid(0, 0, 2)
assert.isFalse(a.vx === b.vx && a.vy === b.vy, 'two rocks should not fly the same way')
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
