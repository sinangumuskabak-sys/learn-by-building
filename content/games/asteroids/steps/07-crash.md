---
title: Crashing, and a moment of safety
title_tr: Çarpmak ve bir anlık güvenlik
skills: [game.collision, game.state]
---

# --explanation--

A rock hitting the ship costs a life and puts the ship back in the middle. The collision uses a circle a bit smaller than
the ship (`SHIP_R * 0.7`), because a triangle does not fill its circle: a generous, "forgiving" hitbox, like in the
runner game.

Respawning raises a fairness problem. If a rock happens to be drifting through the middle, the new ship would be hit
instantly and lose another life without the player ever touching a key. The classic fix is a few seconds of
**invulnerability**. Store **until when** the ship is safe, the timestamp idea from Whack-a-Mole:

```js
ship.safeUntil = now + SAFE_TIME
...
if (now >= ship.safeUntil && /* touching a rock */) crash()
```

The player must be able to **see** that they are safe, or it feels like a bug when rocks pass through. So the ship blinks
while invulnerable: it is drawn only on alternate 150 ms slices of time, `Math.floor(now / 150) % 2 === 0`. That is a
tiny formula for a very recognizable effect; almost every action game uses it.

# --explanation-tr--

**Bu adımda:** kaya gemiye çarpınca bir can gidecek ve gemi ortada yeniden doğacak. Yeni doğan gemi iki saniye yanıp
sönecek ve bu sürede kayalar ona zarar veremeyecek. Sağ üstte canların `▲▲▲` olarak görünecek.

**Çarpışma.** 6. adımdaki `hits` fonksiyonunu kullanırız. Gemi için daire yarıçapı `SHIP_R * 0.7`: üçgen, çevresindeki
daireyi tam doldurmadığı için biraz küçük bir daire daha **adil** hissettirir. Oyuncu "değmedi ki!" demesin.

`asteroids.some((asteroid) => hits(...))` → listede koşulu tutan **en az bir** öğe varsa `true` verir. Yani "herhangi
bir kaya gemiye değiyor mu?".

**Adalet sorunu.** Gemi ortada yeniden doğarken oradan bir kaya geçiyorsa, oyuncu tek tuşa basmadan bir can daha
kaybeder. Klasik çözüm: birkaç saniyelik **dokunulmazlık**. Geminin **ne zamana kadar** güvende olduğunu saklarız:

```js
ship.safeUntil = now + SAFE_TIME
```

**Zaman nereden gelir?** `requestAnimationFrame`, `loop`'u çağırırken ona sayfa açıldığından beri geçen süreyi
**milisaniye** olarak verir (1000 milisaniye = 1 saniye). `function loop(time)` diye bir parametre ekleyince bu sayıyı
alırız ve `now` adlı değişkende saklarız. `SAFE_TIME = 2000` yani 2 saniye.

Çarpışmayı yalnız `now >= ship.safeUntil` ("şimdiki zaman güvenli sürenin sonuna geldi ya da geçti") ise sayarız. `>=`
"büyük ya da eşit" demektir.

**Yanıp sönme.** Oyuncu güvende olduğunu **görmeli**; yoksa kayaların içinden geçmesi hata gibi görünür. Bunun için
gemiyi 150 milisaniyelik dilimlerin sadece birinde çizer, diğerinde çizmeyiz:

- `now / 150` → şimdiye kadar kaç tane 150 ms'lik dilim geçti (küsuratlı).
- `Math.floor(...)` → küsuratı atıp aşağı yuvarlar: `7.8` → `7`.
- `% 2 === 0` → 2'ye bölümünden kalan 0 mı, yani sayı **çift** mi? Dilim numarası çift, tek, çift, tek diye gider;
  gemi de görünür, görünmez diye yanıp söner.

`||` "veya" demektir: `!safe || ...` → "güvende değilse **ya da** çift dilimdeyse çiz".

**Canları göstermek.** `'▲'.repeat(3)` yazıyı 3 kez yan yana koyar: `'▲▲▲'`. `Math.max(0, lives)` iki sayıdan
büyüğünü verir; can eksiye düşerse bile 0 kullanılır. `textAlign = 'right'` yazıyı verilen noktaya sağdan hizalar,
böylece sağ kenara yaslanır.

# --task--

1. Add `SAFE_TIME = 2000`, `let lives = 3` and `let now = 0` (set from the loop's `time`). `resetShip()` also sets
   `safeUntil: now + SAFE_TIME`.
2. Write `crash()`: lose a life and `resetShip()`. In `update()`, after the bullets, call it when the ship is not safe
   and touches any asteroid (ship radius `SHIP_R * 0.7`).
3. Draw the ship only when it is not safe, or when `Math.floor(now / 150) % 2 === 0`. Show the lives as `▲` symbols
   (`'▲'.repeat(lives)`) right-aligned at the top.

# --task-tr--

1. `const POINTS = ...` satırının hemen altına güvenli süreyi ekle:

   ```js
   const SAFE_TIME = 2000 // milliseconds of invulnerability after respawning
   ```

2. `let score` satırının hemen altına iki satır ekle:

   ```js
   let lives
   let now = 0
   ```

3. `resetShip` fonksiyonundaki satırın sonuna, `vy: 0`'dan sonra `safeUntil`'i ekle:

   ```js
   function resetShip() {
     ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0, safeUntil: now + SAFE_TIME } // ← değişti
   }
   ```

4. `breakAsteroid` fonksiyonunun kapanış `}`'inden sonra, `document.addEventListener('keydown', ...)`'ten önce çarpma
   fonksiyonunu yaz:

   ```js
   function crash() {
     lives -= 1
     resetShip()
   }
   ```

5. `update()`'in en sonunda, `bullets = bullets.filter(...)` satırından sonra ve kapanış `}`'inden önce çarpışma
   kontrolünü ekle:

   ```js
     bullets = bullets.filter((bullet) => bullet.life > 0)

     if (now >= ship.safeUntil && asteroids.some((asteroid) => hits(ship, SHIP_R * 0.7, asteroid, asteroid.r))) { // ← yeni
       crash()
     }
   }
   ```

6. `draw()` içinde tek başına duran `drawShip()` satırını şu üç satırla değiştir:

   ```js
     // Blink while invulnerable, so the player can see it.
     const safe = now < ship.safeUntil
     if (!safe || Math.floor(now / 150) % 2 === 0) drawShip() // ← değişti
   ```

7. `draw()`'un en sonunda, `ctx.fillText(String(score), 12, 26)` satırından sonra canları yazan iki satırı ekle:

   ```js
     ctx.fillText(String(score), 12, 26)
     ctx.textAlign = 'right'                                              // ← yeni
     ctx.fillText('▲'.repeat(Math.max(0, lives)), canvas.width - 12, 26) // ← yeni
   }
   ```

   `▲` işaretini buradan kopyalayıp yapıştırabilirsin.

8. `loop` fonksiyonuna zamanı alan parametreyi ve onu saklayan satırı ekle:

   ```js
   function loop(time) { // ← değişti
     now = time          // ← yeni
     update()
     draw()
     requestAnimationFrame(loop)
   }
   ```

9. En alttaki başlangıç satırlarında `score = 0`'ın altına canları koy:

   ```js
   score = 0
   lives = 3 // ← yeni
   bullets = []
   ```

10. **Çalıştır**'a bas. Gemi ilk iki saniye yanıp sönmeli; sağ üstte `▲▲▲` görünmeli. Oynamak için önce oyuna tıkla ve
    bir kayaya çarp: bir `▲` gitmeli, gemi ortada yanıp sönerek yeniden doğmalı. Alttaki kontrollerin hepsi yeşil
    olmalı. Kırmızı kalırsa `function loop(time)` ve `now = time` satırlarını unutmadığına bak.

# --tests--

A rock hitting the ship should cost a life and bring the ship back to the middle.
tr: Gemiye çarpan bir kaya bir cana mal olmalı ve gemiyi ortaya geri getirmeli.

```js
$.run(2.5)
ship.x = 100
ship.y = 100
asteroids = [makeAsteroid(110, 100, 2)]
asteroids[0].vx = 0
asteroids[0].vy = 0
update()
assert.strictEqual(lives, 2)
assert.include(ship, { x: 300, y: 225 })
```

Right after respawning, the ship should be safe for two seconds.
tr: Yeniden doğduktan hemen sonra gemi iki saniye güvende olmalı.

```js
$.run(2.5)
crash()
asteroids = [makeAsteroid(300, 225, 3)]
asteroids[0].vx = 0
asteroids[0].vy = 0
$.run(1.5)
assert.strictEqual(lives, 2, 'still safe')
$.run(1)
assert.strictEqual(lives, 1, 'safe time is over')
```

The ship should blink while it is safe, and the lives should be shown.
tr: Gemi güvendeyken yanıp sönmeli ve canlar gösterilmeli.

```js
let shown = 0
let hidden = 0
for (let i = 0; i < 60; i++) {
  $.tick()
  if ($.screen().some((c) => c.op === 'moveTo' && Math.abs(c.args[1] - 211) < 3 && Math.abs(c.args[0] - 300) < 3)) shown++
  else hidden++
}
assert.isAbove(shown, 10)
assert.isAbove(hidden, 10)
assert.include($.texts(), '▲▲▲')
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
const SAFE_TIME = 2000 // milliseconds of invulnerability after respawning

let ship
let bullets
let asteroids
let score
let lives
let now = 0
const keys = {}

// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0, safeUntil: now + SAFE_TIME }
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

function crash() {
  lives -= 1
  resetShip()
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

  if (now >= ship.safeUntil && asteroids.some((asteroid) => hits(ship, SHIP_R * 0.7, asteroid, asteroid.r))) {
    crash()
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

  // Blink while invulnerable, so the player can see it.
  const safe = now < ship.safeUntil
  if (!safe || Math.floor(now / 150) % 2 === 0) drawShip()

  ctx.fillStyle = 'white'
  for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)

  ctx.font = '18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(String(score), 12, 26)
  ctx.textAlign = 'right'
  ctx.fillText('▲'.repeat(Math.max(0, lives)), canvas.width - 12, 26)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

score = 0
lives = 3
bullets = []
asteroids = []
for (let i = 0; i < 4; i++) asteroids.push(makeAsteroid(Math.random() < 0.5 ? 0 : Math.random() * canvas.width, 0, 3))
resetShip()
requestAnimationFrame(loop)
```
