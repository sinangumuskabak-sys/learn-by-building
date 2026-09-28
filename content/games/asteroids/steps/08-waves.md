---
title: Waves and the end
title_tr: Dalgalar ve son
skills: [game.state]
---

# --explanation--

When the last rock is gone, a new **wave** begins with one more asteroid than the last, and every wave's rocks are 20%
faster:

```js
speed = baseSpeed * (1 + (wave - 1) * 0.2)
```

A multiplier that grows with the wave is a simple, readable way to tune difficulty. Wave 1 is ×1, wave 3 is ×1.4,
wave 6 is ×2. It is the same "difficulty from a formula" idea as in Whack-a-Mole, driven by progress through the game
instead of time.

New rocks appear at the **edges**, away from the ship in the middle, so a new wave never starts with a hit.

Running out of lives ends the game, with the usual best score and "Space to play again". Setting up a new game and a
new wave are now separate functions, `newGame()` and `spawnWave()`, because a game has many waves but only one start.

# --explanation-tr--

**Bu adımda:** oyunu tamamlayacağız. Bütün kayalar vurulunca bir kaya fazlasıyla ve daha hızlı yeni bir **dalga**
gelecek. Canlar bitince ekranda `GAME OVER` ve en iyi skorun yazacak; boşluk tuşu yeni oyun başlatacak.

**Dalgalar.** 1. dalgada 4 kaya var, her yeni dalgada bir fazlası: `3 + wave`. Her dalganın kayaları öncekinden %20
daha hızlıdır:

```js
speed = temelHız * (1 + (wave - 1) * 0.2)
```

1. dalga ×1, 3. dalga ×1.4, 6. dalga ×2. Dalgayla büyüyen bir çarpan, zorluğu ayarlamanın basit ve okunaklı yoludur.

Yeni kayalar **kenarlarda** doğar (sol kenarda ya da üst kenarda), ortadaki gemiden uzakta. Böylece dalga bir
çarpmayla başlamaz. `const edge = Math.random() < 0.5` yazı-tura atar: `true` çıkarsa sol kenar (`x` = 0, `y`
rastgele), `false` çıkarsa üst kenar (`y` = 0, `x` rastgele).

**Oyunun durumu (state).** Oyun ya oynanıyor (`'playing'`) ya da bitmiş (`'over'`). Bunu bir yazıyla `state` içinde
tutarız ve her yerde ona göre davranırız:

- `update()`'in başındaki `if (state !== 'playing') return` → "oynanmıyorsa hiçbir şey yapma". `return` fonksiyondan
  hemen çıkar, alttaki satırlar çalışmaz.
- Oyun bitince gemi çizilmez, ortada yazılar görünür.
- Boşluk tuşu oyun bitmişse yeni oyun başlatır, yoksa ateş eder.

**İki başlangıç fonksiyonu.** Bir oyunda çok dalga ama tek başlangıç vardır. Bu yüzden ikiye ayırırız:
`spawnWave()` sadece kayaları kurar, `newGame()` her şeyi (puan, can, dalga, mermiler, gemi) sıfırlayıp ilk dalgayı
çağırır. En alttaki dağınık başlangıç satırlarının yerini tek bir `newGame()` alır.

**En iyi skoru hatırlamak.** `localStorage` tarayıcının küçük bir defteridir; sayfa kapansa bile içindekini unutmaz.

- `localStorage.setItem('asteroids-best', best)` → `'asteroids-best'` adıyla deftere yaz.
- `localStorage.getItem('asteroids-best')` → o adla yazılanı oku (hiç yazılmamışsa `null`, yani boş).
- `Number(...)` → okunan yazıyı sayıya çevirir. `|| 0` → "sonuç boş ya da geçersizse 0 kullan".

**Yazı birleştirmek.** `'BEST ' + best + '   SPACE TO PLAY AGAIN'` → `+` yazılarda yan yana eklemek demektir:
`best` 1200 ise sonuç `'BEST 1200   SPACE TO PLAY AGAIN'` olur (`BEST`'ten sonra bir, `AGAIN`'den önce üç boşluk).

# --task--

1. Add `let wave` and `let state`. Write `spawnWave()` that creates `3 + wave` big asteroids at the top or left edge,
   and `newGame()` that sets `score = 0`, `lives = 3`, `wave = 1`, `bullets = []`, `state = 'playing'`, resets the ship
   and spawns the wave. Start with `newGame()`.
2. Multiply the asteroid speed in `makeAsteroid` by `1 + (wave - 1) * 0.2`.
3. In `update()` (only while playing): when no asteroids are left, add 1 to `wave` and `spawnWave()`.
4. `crash()` ends the game when the last life is lost: `state = 'over'` and save a higher score as the best under
   `'asteroids-best'`. Otherwise it resets the ship.
5. When over, don't draw the ship; show `GAME OVER` and `BEST 1200   SPACE TO PLAY AGAIN`, and Space starts a
   `newGame()`.

# --task-tr--

1. `let lives` satırının hemen altına `wave` ve `state` satırlarını, `let now = 0` satırının altına da en iyi skoru
   okuyan satırı ekle. Bu bölüm şöyle görünmeli:

   ```js
   let lives
   let wave
   let state // 'playing' or 'over'
   let now = 0
   let best = Number(localStorage.getItem('asteroids-best')) || 0
   ```

2. `makeAsteroid` içindeki `const speed = ...` satırını dalga çarpanlı hâliyle değiştir:

   ```js
     // Smaller asteroids are faster, and every wave is 20% faster than the one before.
     const speed = (0.6 + Math.random() * (4 - size) * 0.5) * (1 + (wave - 1) * 0.2) // ← değişti
   ```

   Eski hesabın tamamı paranteze alındı ve dalga çarpanıyla çarpıldı.

3. `makeAsteroid` fonksiyonunun kapanış `}`'inden sonra, `function shoot()`'tan önce iki fonksiyon yaz:

   ```js
   function spawnWave() {
     asteroids = []
     for (let i = 0; i < 3 + wave; i++) {
       // Start at the edges, away from the ship in the middle.
       const edge = Math.random() < 0.5
       const x = edge ? 0 : Math.random() * canvas.width
       const y = edge ? Math.random() * canvas.height : 0
       asteroids.push(makeAsteroid(x, y, 3))
     }
   }

   function newGame() {
     score = 0
     lives = 3
     wave = 1
     bullets = []
     state = 'playing'
     resetShip()
     spawnWave()
   }
   ```

4. `crash` fonksiyonunu şu hâle getir. Can kalmışsa gemi yeniden doğar ve `return` ile çıkılır; kalmamışsa oyun biter
   ve gerekirse rekor kaydedilir:

   ```js
   function crash() {
     lives -= 1
     if (lives > 0) {        // ← yeni
       resetShip()
       return                // ← yeni
     }                       // ← yeni
     state = 'over'          // ← yeni
     if (score > best) {     // ← yeni
       best = score
       localStorage.setItem('asteroids-best', best)
     }
   }
   ```

5. `keydown` dinleyicisindeki boşluk satırını şöyle değiştir:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === ' ' && !event.repeat) { // ← değişti
       if (state === 'over') newGame()         // ← yeni
       else shoot()                            // ← yeni
     }                                         // ← yeni
   })
   ```

6. `update()`'in en başına, `function update() {` satırının hemen altına şunu ekle:

   ```js
   function update() {
     if (state !== 'playing') return // ← yeni

     if (keys.ArrowLeft) ship.angle -= TURN
   ```

7. `update()`'in sonundaki çarpışma kontrolünü şöyle genişlet:

   ```js
     if (now >= ship.safeUntil && asteroids.some((asteroid) => hits(ship, SHIP_R * 0.7, asteroid, asteroid.r))) {
       crash()
       return                     // ← yeni
     }

     if (asteroids.length === 0) { // ← yeni
       wave += 1
       spawnWave()
     }
   }
   ```

   `asteroids.length === 0` → "listede hiç kaya kalmadı mı?".

8. `draw()` içinde gemiyi çizen satırı, sadece oyun sürerken çizecek şekilde değiştir:

   ```js
     if (state === 'playing' && (!safe || Math.floor(now / 150) % 2 === 0)) drawShip() // ← değişti
   ```

9. `draw()`'un en sonunda, canları yazan satırdan sonra ve kapanış `}`'inden önce oyun sonu yazılarını ekle:

   ```js
     ctx.fillText('▲'.repeat(Math.max(0, lives)), canvas.width - 12, 26)

     if (state === 'over') {                                  // ← yeni
       ctx.textAlign = 'center'
       ctx.font = 'bold 36px monospace'
       ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2)
       ctx.font = '16px monospace'
       ctx.fillText('BEST ' + best + '   SPACE TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 34)
     }
   }
   ```

10. En alttaki başlangıç satırlarını (`score = 0`'dan `resetShip()`'e kadar altı satırı) sil ve yerine `newGame()` yaz.
    Sonuç şöyle olmalı:

    ```js
    newGame()
    requestAnimationFrame(loop)
    ```

11. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Bütün kayaları temizleyince 5 kayalık yeni dalga gelmeli; üç can
    bitince ortada `GAME OVER` yazmalı ve boşluk yeni oyun başlatmalı. Alttaki kontrollerin hepsi yeşil olmalı. Yazı
    kontrolü kırmızıysa `'BEST '` ve `'   SPACE TO PLAY AGAIN'` içindeki boşlukları say.

# --tests--

Clearing the rocks should start a bigger wave.
tr: Kayaları temizlemek daha büyük bir dalga başlatmalı.

```js
assert.strictEqual(wave, 1)
assert.lengthOf(asteroids, 4)
asteroids = []
update()
assert.strictEqual(wave, 2)
assert.lengthOf(asteroids, 5)
assert.isTrue(asteroids.every((a) => a.size === 3 && (a.x === 0 || a.y === 0)))
```

Rocks should be faster in later waves.
tr: Sonraki dalgalarda kayalar daha hızlı olmalı.

```js
const average = () => {
  let total = 0
  for (let i = 0; i < 200; i++) {
    const a = makeAsteroid(0, 0, 3)
    total += Math.hypot(a.vx, a.vy)
  }
  return total / 200
}
const first = average()
wave = 6
const sixth = average()
assert.closeTo(sixth / first, 2, 0.25)
```

Losing the last life should end the game and save the best score.
tr: Son canı kaybetmek oyunu bitirmeli ve rekoru kaydetmeli.

```js
score = 1200
lives = 1
crash()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 1200)
assert.strictEqual(localStorage.getItem('asteroids-best'), '1200')
draw()
assert.includeMembers($.texts(), ['GAME OVER', 'BEST 1200 SPACE TO PLAY AGAIN'])
```

Space after game over should start a fresh game.
tr: Oyun bittikten sonra Boşluk yepyeni bir oyun başlatmalı.

```js
lives = 1
crash()
$.press(' ')
assert.strictEqual(state, 'playing')
assert.deepEqual([score, lives, wave], [0, 3, 1])
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
const SIZES = [0, 15, 28, 45] // asteroid radius for size 1, 2 and 3
const POINTS = [0, 100, 50, 20] // smaller asteroids are worth more
const SAFE_TIME = 2000 // milliseconds of invulnerability after respawning

let ship
let bullets
let asteroids
let score
let lives
let wave
let state // 'playing' or 'over'
let now = 0
let best = Number(localStorage.getItem('asteroids-best')) || 0
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
  // Smaller asteroids are faster, and every wave is 20% faster than the one before.
  const speed = (0.6 + Math.random() * (4 - size) * 0.5) * (1 + (wave - 1) * 0.2)
  // A jagged outline: 10 corners at slightly random distances from the center.
  const shape = Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35)
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, r: SIZES[size], shape }
}

function spawnWave() {
  asteroids = []
  for (let i = 0; i < 3 + wave; i++) {
    // Start at the edges, away from the ship in the middle.
    const edge = Math.random() < 0.5
    const x = edge ? 0 : Math.random() * canvas.width
    const y = edge ? Math.random() * canvas.height : 0
    asteroids.push(makeAsteroid(x, y, 3))
  }
}

function newGame() {
  score = 0
  lives = 3
  wave = 1
  bullets = []
  state = 'playing'
  resetShip()
  spawnWave()
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
  if (lives > 0) {
    resetShip()
    return
  }
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('asteroids-best', best)
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ' && !event.repeat) {
    if (state === 'over') newGame()
    else shoot()
  }
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (state !== 'playing') return

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
    return
  }

  if (asteroids.length === 0) {
    wave += 1
    spawnWave()
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
  if (state === 'playing' && (!safe || Math.floor(now / 150) % 2 === 0)) drawShip()

  ctx.fillStyle = 'white'
  for (const bullet of bullets) ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3)

  ctx.font = '18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(String(score), 12, 26)
  ctx.textAlign = 'right'
  ctx.fillText('▲'.repeat(Math.max(0, lives)), canvas.width - 12, 26)

  if (state === 'over') {
    ctx.textAlign = 'center'
    ctx.font = 'bold 36px monospace'
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px monospace'
    ctx.fillText('BEST ' + best + '   SPACE TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 34)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
