---
title: Breaking rocks
title_tr: Kayaları kırmak
skills: [game.collision, prog.arrays]
---

# --explanation--

Two circles touch when the distance between their centers is less than the sum of their radii. As in Breakout, compare
**squared** distances and skip the square root:

```js
dx * dx + dy * dy < (ar + br) * (ar + br)
```

A bullet is a tiny circle (radius 2). When it hits an asteroid, the asteroid **breaks**: it is removed, and if it was
not already the smallest size, two smaller asteroids are born at the same spot, each flying off in its own random
direction (a fresh `makeAsteroid` call gives each one a new angle and speed). Big becomes two medium, medium becomes two
small, small disappears.

That rule makes the difficulty grow as you play: shooting a big rock turns one slow target into two faster ones. And
because smaller rocks are harder to hit, they are worth more: 20, 50 and 100 points.

Notice that `breakAsteroid` replaces the `asteroids` array with a **filtered** copy instead of splicing items out while
a loop might be walking over it. Changing an array while you loop over it is a classic source of skipped items.

# --explanation-tr--

**Bu adımda:** mermiler kayalara çarpacak. Vurulan büyük kaya iki ortaya, orta kaya iki küçüğe bölünecek, küçük kaya
yok olacak. Sol üstte de puanın görünecek.

**İki daire ne zaman değer?** Merkezleri arasındaki uzaklık, iki yarıçapın toplamından **küçükse**. Uzaklık Pisagor'la
bulunur: yatay fark `dx`, dikey fark `dy` ise uzaklık `√(dx² + dy²)`. Karekök almak yerine iki tarafın da karesini
karşılaştırırız, sonuç aynıdır ve daha hızlıdır:

```js
dx * dx + dy * dy < (ar + br) * (ar + br)
```

Bunu `hits(a, ar, b, br)` adında bir fonksiyona koyarız: `a` ve `b` konumu olan iki şey, `ar` ve `br` yarıçapları.
Sonucu `return` ile verir: `<` karşılaştırması zaten `true` ya da `false` üretir. Mermi, yarıçapı 2 olan küçük bir
daire sayılır.

**Kaya kırılınca** (`breakAsteroid`):

1. Boyuna göre puan eklenir: `POINTS[asteroid.size]`. Küçük kayayı vurmak zor, o yüzden daha değerli: küçük 100,
   orta 50, büyük 20.
2. Kaya listeden çıkarılır: `asteroids.filter((a) => a !== asteroid)` → "bu kaya **olmayan** her şeyi tut". `!==`
   "eşit değil" demektir.
3. Boyu 1'den büyükse aynı yerde bir küçük boydan iki yeni kaya doğar. Her biri yeni bir `makeAsteroid` çağrısı olduğu
   için kendi rastgele yönüne ve hızına fırlar.

Bu kural oyunu oynadıkça zorlaştırır: yavaş bir büyük hedef, iki hızlı orta hedefe dönüşür.

**Neden `filter`?** Bir listenin üzerinden döngüyle geçerken aynı listeden öğe silmek, bazı öğelerin atlanmasına yol
açan klasik bir hatadır. `filter` eski listeye dokunmaz, yerine yeni bir liste koyar.

**Hangi kaya vuruldu?** `asteroids.find((asteroid) => hits(...))` listede koşulu tutan **ilk** öğeyi verir; hiçbiri
tutmazsa `undefined` (yok) verir. `if (hit)` "bir şey bulunduysa" demektir. Vuran merminin ömrünü 0 yaparız; hemen
sonraki `filter` satırı onu siler.

**Yazı çizmek.** `ctx.font = '18px monospace'` yazının boyunu ve türünü, `ctx.textAlign = 'left'` hizasını seçer.
`ctx.fillText(yazı, x, y)` yazıyı o noktaya boyar. `String(score)` sayıyı yazıya çevirir (`20` → `'20'`).

# --task--

1. Add `POINTS = [0, 100, 50, 20]` and `let score`, set `score = 0` in the start-up code at the bottom, and write
   `hits(a, ar, b, br)` for two circles.
2. Write `breakAsteroid(asteroid)`: add its points, remove it from `asteroids` with `filter`, and if its size is above
   1, push two new asteroids of size `size - 1` at its position.
3. In `update()`, for each bullet, find an asteroid it hits (bullet radius 2); if there is one, break it and set the
   bullet's `life` to 0 (before the bullets are filtered).
4. Draw the score in white `'18px monospace'` at the top left `(12, 26)`.

# --task-tr--

1. `const SIZES = ...` satırının hemen altına puan tablosunu ekle:

   ```js
   const POINTS = [0, 100, 50, 20] // smaller asteroids are worth more
   ```

2. `let asteroids` satırının hemen altına puanın adını ekle:

   ```js
   let score
   ```

3. `shoot` fonksiyonunun kapanış `}`'inden sonra, `document.addEventListener('keydown', ...)` satırından önce iki
   fonksiyon yaz: çarpışma sorusu ve kaya kırma.

   ```js
   function hits(a, ar, b, br) {
     const dx = a.x - b.x
     const dy = a.y - b.y
     return dx * dx + dy * dy < (ar + br) * (ar + br)
   }

   function breakAsteroid(asteroid) {
     score += POINTS[asteroid.size]
     asteroids = asteroids.filter((a) => a !== asteroid)
     if (asteroid.size > 1) {
       asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
       asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
     }
   }
   ```

4. `update()`'in sonunda, kayaları hareket ettiren döngüden sonra ve `bullets = bullets.filter(...)` satırından **önce**
   şu döngüyü ekle:

   ```js
     for (const bullet of bullets) {                                                  // ← yeni
       const hit = asteroids.find((asteroid) => hits(bullet, 2, asteroid, asteroid.r))
       if (hit) {
         breakAsteroid(hit)
         bullet.life = 0
       }
     }
     bullets = bullets.filter((bullet) => bullet.life > 0)
   }
   ```

   Sıra önemli: mermi önce `life = 0` olur, sonra `filter` onu siler.

5. `draw()`'un sonunda, mermileri çizen satırdan sonra ve kapanış `}`'inden önce puanı yazan satırları ekle:

   ```js
     for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)

     ctx.font = '18px monospace'         // ← yeni
     ctx.textAlign = 'left'              // ← yeni
     ctx.fillText(String(score), 12, 26) // ← yeni
   }
   ```

   Renk zaten bir üstte `'white'` seçildi, o yüzden yazı da beyaz olur.

6. En alttaki başlangıç satırlarının en üstüne puanı sıfırlayan satırı koy:

   ```js
   score = 0 // ← yeni
   bullets = []
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, bir kayaya ateş et: kaya ikiye bölünmeli ve sol üstteki puan
   artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `hits` içindeki `<` işaretine (küçük-eşit değil,
   sadece küçük) ve `POINTS` sırasına bak.

# --tests--

`hits()` should compare the distance with the sum of the radii.
tr: `hits()` uzaklığı yarıçapların toplamıyla karşılaştırmalı.

```js
assert.isTrue(hits({ x: 0, y: 0 }, 10, { x: 15, y: 0 }, 10))
assert.isFalse(hits({ x: 0, y: 0 }, 10, { x: 20, y: 0 }, 10), 'just touching does not count')
assert.isTrue(hits({ x: 0, y: 0 }, 10, { x: 14, y: 14 }, 10))
assert.isFalse(hits({ x: 0, y: 0 }, 10, { x: 15, y: 15 }, 10))
```

A big rock should break into two medium ones, worth 20 points.
tr: Büyük bir kaya 20 puan değerinde iki orta kayaya bölünmeli.

```js
asteroids = [makeAsteroid(300, 100, 3)]
bullets = [{ x: 300, y: 130, vx: 0, vy: 0, life: 20 }]
update()
assert.strictEqual(score, 20)
assert.lengthOf(asteroids, 2)
assert.isTrue(asteroids.every((a) => a.size === 2 && a.r === 28))
assert.lengthOf(bullets, 0)
```

A small rock should just disappear, worth 100 points.
tr: Küçük bir kaya 100 puan değerinde, yalnızca kaybolmalı.

```js
asteroids = [makeAsteroid(300, 100, 1)]
bullets = [{ x: 300, y: 105, vx: 0, vy: 0, life: 20 }]
update()
assert.strictEqual(score, 100)
assert.lengthOf(asteroids, 0)
```

The pieces should fly apart in different directions, and the score should be shown.
tr: Parçalar farklı yönlere fırlamalı ve skor gösterilmeli.

```js
asteroids = [makeAsteroid(300, 100, 2)]
bullets = [{ x: 300, y: 100, vx: 0, vy: 0, life: 20 }]
update()
const [a, b] = asteroids
assert.isFalse(a.vx === b.vx && a.vy === b.vy)
draw()
assert.include($.texts(), '50')
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
const POINTS = [0, 100, 50, 20] // smaller asteroids are worth more

let ship
let bullets
let asteroids
let score
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

function breakAsteroid(asteroid) {
  score += POINTS[asteroid.size]
  asteroids = asteroids.filter((a) => a !== asteroid)
  if (asteroid.size > 1) {
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
    asteroids.push(makeAsteroid(asteroid.x, asteroid.y, asteroid.size - 1))
  }
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

  for (const bullet of bullets) {
    const hit = asteroids.find((asteroid) => hits(bullet, 2, asteroid, asteroid.r))
    if (hit) {
      breakAsteroid(hit)
      bullet.life = 0
    }
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

  ctx.font = '18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(String(score), 12, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

score = 0
bullets = []
asteroids = []
for (let i = 0; i < 4; i++) asteroids.push(makeAsteroid(Math.random() < 0.5 ? 0 : Math.random() * canvas.width, 0, 3))
resetShip()
requestAnimationFrame(loop)
```
