---
title: Jagged rocks drifting in space
title_tr: Uzayda sürüklenen pürüzlü kayalar
skills: [game.canvas, prog.arrays]
---

# --explanation--

An asteroid has a position, a velocity and a **size**: 3 (big), 2 (medium) or 1 (small). Its radius comes from a small
lookup table, `SIZES[size]`, and it moves in a random direction: pick a random angle, then turn it into a velocity with
`cos` and `sin`, exactly like thrust.

A perfect circle would look like a bubble, not a rock. The trick is to draw a polygon whose corners sit at **slightly
random distances** from the center:

```js
shape: Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)   // one scale per corner
```

Corner `i` sits at angle `i / 10` of a full turn, at distance `r * shape[i]`. The random scales are chosen **once**, when
the asteroid is made, and stored with it. If you rolled new random numbers every frame, the outline would fizz and
wobble. Deciding randomness once and remembering it is how games give each enemy, tree or cloud its own stable look.

For collisions, the rock is still treated as a simple circle of radius `r`. The jagged outline is only for the eye.

# --explanation-tr--

**Bu adımda:** ekrana dört büyük, pürüzlü kaya koyacağız. Çalıştırınca yukarıdan başlayıp her biri kendi yönünde
yavaşça süzülen, kenarlardan dolaşan dört taş göreceksin.

**Kaya neyi bilir?** Konumunu (`x`, `y`), hızını (`vx`, `vy`) ve **boyunu** (`size`): 3 büyük, 2 orta, 1 küçük. Boyuna
göre yarıçapını (`r`) küçük bir tablodan okuruz:

```js
const SIZES = [0, 15, 28, 45]
SIZES[3]   // 45
```

Dizideki öğelerin sıra numarası (index) **0'dan** başlar: `SIZES[0]` 0, `SIZES[1]` 15, `SIZES[3]` 45. Baştaki 0 boş
bir yer tutucudur, böylece "boy 3" doğrudan `SIZES[3]` olur.

**Rastgelelik.** `Math.random()` her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir sayı verir. Onu büyütüp
kaydırarak istediğin aralığı elde edersin:

- `Math.random() * Math.PI * 2` → 0 ile tam tur arasında rastgele bir açı.
- `0.6 + Math.random() * (4 - size) * 0.5` → en az 0.6 olan bir hız. `size` küçüldükçe `(4 - size)` büyür, yani
  küçük kayalar daha hızlı olabilir.

Açıdan hıza geçiş, itkideki `cos`/`sin` hesabının aynısıdır.

**Kayayı kaya gibi göstermek.** Düz bir daire balon gibi görünür. Hile: 10 köşeli bir çokgen çiziyoruz ve her köşeyi
merkezden **biraz farklı** uzaklığa koyuyoruz. Her köşe için bir ölçek sayısı (0.75 ile 1.1 arası) üretiriz:

```js
const shape = Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)
```

`Array.from({ length: 10 }, ...)` → "10 öğeli bir dizi yap; her öğeyi şu fonksiyonla üret". Sonuç `[0.93, 0.81, ...]`
gibi 10 sayıdır. Bu sayılar kaya **doğarken bir kez** seçilir ve kayayla birlikte saklanır. Her karede yeni rastgele
sayı çekseydik kayanın çizgisi titreyip kıpırdardı. Rastgeleliği bir kez seçip hatırlamak, oyunlarda her ağaca, buluta
ya da düşmana kendine özgü ve sabit bir görünüm vermenin yoludur.

**Yeni araçlar:**

- `return { x, y, size }` → kısa yazım: `{ x: x, y: y, size: size }` ile aynı. Ad ile değer aynıysa bir kere yazılır.
- `asteroid.shape.forEach((scale, i) => { ... })` → dizideki her öğe için işi yapar; `scale` öğenin kendisi, `i` sıra
  numarası (0, 1, 2 ... 9). `i`. köşe tam turun `i / 10`'unda, `r * scale` uzaklıktadır.
- `if (i === 0) ... else ...` → `else` "değilse" demektir: ilk köşede kalemi oraya götür (`moveTo`), diğerlerinde çizgi
  çek (`lineTo`).
- `for (let i = 0; i < 4; i++) ...` → sayan döngü: `i` 0'dan başlar, 4'ten küçük olduğu sürece işi yapar, her turda
  `i++` ile 1 artar. Yani iş 4 kez yapılır.
- `koşul ? A : B` → kısa "eğer": koşul doğruysa A, değilse B. `Math.random() < 0.5 ? 0 : ...` yarı yarıya ihtimalle 0.

Çarpışma için kaya yine basit bir `r` yarıçaplı daire sayılacak; pürüzlü çizgi sadece göz için.

# --task--

1. Add `SIZES = [0, 15, 28, 45]` and `let asteroids`.
2. Write `makeAsteroid(x, y, size)`: a random angle, `speed = 0.6 + Math.random() * (4 - size) * 0.5` (smaller is
   faster), velocity from the angle, `r: SIZES[size]`, and a `shape` of 10 random scales from 0.75 to 1.1.
3. In the start-up code at the bottom, set `asteroids = []` and push 4 big (size 3) asteroids on the top edge: `y = 0`,
   and `x` either `0` or a random point across the width, 50/50. In `update()`, move and wrap every asteroid.
4. Write `drawAsteroid(asteroid)` that strokes the jagged outline, and draw every asteroid.

# --task-tr--

1. `const BULLET_LIFE = 55` satırının hemen altına boy tablosunu ekle:

   ```js
   const SIZES = [0, 15, 28, 45] // asteroid radius for size 1, 2 and 3
   ```

2. `let bullets` satırının hemen altına kaya listesinin adını ekle:

   ```js
   let asteroids
   ```

3. `resetShip` fonksiyonunun kapanış `}`'inden sonra, `function shoot()`'tan önce kaya üreten fonksiyonu yaz:

   ```js
   function makeAsteroid(x, y, size) {
     const angle = Math.random() * Math.PI * 2
     const speed = 0.6 + Math.random() * (4 - size) * 0.5 // smaller asteroids are faster
     // A jagged outline: 10 corners at slightly random distances from the center.
     const shape = Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)
     return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, r: SIZES[size], shape }
   }
   ```

4. `update()` içinde mermileri hareket ettiren `for` döngüsünün kapanış `}`'inden sonra, `bullets = bullets.filter(...)`
   satırından önce kayaları hareket ettiren döngüyü ekle:

   ```js
     for (const asteroid of asteroids) {                              // ← yeni
       asteroid.x = wrap(asteroid.x + asteroid.vx, canvas.width)
       asteroid.y = wrap(asteroid.y + asteroid.vy, canvas.height)
     }

     bullets = bullets.filter((bullet) => bullet.life > 0)
   ```

5. `drawShip` fonksiyonunun kapanış `}`'inden sonra, `function draw()`'dan önce bir kayayı çizen fonksiyonu yaz:

   ```js
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
   ```

6. `draw()` içinde `ctx.lineWidth = 2` satırının hemen altına bütün kayaları çizen satırı ekle:

   ```js
     ctx.strokeStyle = 'white'
     ctx.lineWidth = 2
     for (const asteroid of asteroids) drawAsteroid(asteroid) // ← yeni

     drawShip()
   ```

7. En alttaki başlangıç satırlarına, `bullets = []`'in altına iki satır ekle: boş kaya listesi ve 4 büyük kaya.

   ```js
   bullets = []
   asteroids = []                                                                                                        // ← yeni
   for (let i = 0; i < 4; i++) asteroids.push(makeAsteroid(Math.random() < 0.5 ? 0 : Math.random() * canvas.width, 0, 3)) // ← yeni
   resetShip()
   requestAnimationFrame(loop)
   ```

   Her kaya üst kenarda (`y` = 0), rastgele bir yerde doğar ve boyu 3'tür (büyük).

8. **Çalıştır**'a bas. Dört büyük pürüzlü kaya yavaşça süzülmeli ve kenarlardan dolaşmalı (henüz vurulamazlar, gemiye
   de çarpmazlar). Alttaki kontrollerin hepsi yeşil olmalı. Çizgi sayısı kontrolü kırmızıysa `drawAsteroid` içindeki
   `if (i === 0)` / `else` kısmına bak.

# --tests--

`makeAsteroid()` should build a rock of the right size with a stable jagged shape.
tr: `makeAsteroid()` doğru boyutta, sabit pürüzlü biçimli bir kaya kurmalı.

```js
const rock = makeAsteroid(100, 100, 3)
assert.include(rock, { x: 100, y: 100, size: 3, r: 45 })
assert.lengthOf(rock.shape, 10)
assert.isTrue(rock.shape.every((s) => s >= 0.75 && s <= 1.1))
assert.isAbove(new Set(rock.shape).size, 5, 'the corners should be at different distances')
```

Smaller rocks should tend to move faster.
tr: Küçük kayalar daha hızlı hareket etme eğiliminde olmalı.

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
```

There should be 4 big asteroids, drifting and wrapping.
tr: Sürüklenen ve dolaşan 4 büyük asteroit olmalı.

```js
assert.lengthOf(asteroids, 4)
assert.isTrue(asteroids.every((a) => a.size === 3))
const a = asteroids[0]
a.x = 598
a.vx = 3
a.vy = 0
update()
assert.isBelow(a.x, 5)
```

Each asteroid should be drawn as a closed 10-corner outline.
tr: Her asteroit kapalı 10 köşeli bir taslak olarak çizilmeli.

```js
draw()
const lines = $.screen().filter((c) => c.op === 'lineTo').length
assert.strictEqual(lines, 4 * 9 + 2, '9 lines per rock after the first corner, plus 2 for the ship')
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
