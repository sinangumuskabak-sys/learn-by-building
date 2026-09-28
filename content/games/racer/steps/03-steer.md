---
title: Steering and the grass
title_tr: Direksiyon ve çimen
skills: [game.input, game.physics]
---

# --explanation--

The car stays in the middle of the screen; steering moves the **camera** sideways, and the road moves the other way. So the
player's position across the road, `playerX` (`-1` is the left edge, `1` the right edge), is subtracted from every point
before projecting:

```js
project(-playerX * ROAD, -CAMERA_HEIGHT, z)
```

Because nearer segments are wider on screen, the same sideways shift moves the near road a lot and the far road hardly at
all, which is exactly how it looks from a real car.

Real cars do not turn when they stand still, so steering is scaled by the speed. And the grass is slow: off the road the car
cannot keep more than a third of its top speed. The player can drive a little onto the grass, but not away from the road.

On a phone, holding the left or right third of the screen steers (and accelerates too).

# --explanation-tr--

**Bu adımda:** sağ ve sol oklarla direksiyon çevireceksin. Araba ekranın ortasında kalacak ama yol yana kayacak;
yoldan çıkarsan çimen seni yavaşlatacak.

**Araba değil, kamera kayar.** Araba hep ekranın altında ortada durur. Direksiyon çevirince aslında **kamerayı**
yana kaydırırız, yol da ters yöne gider. Arabanın yoldaki yan konumunu `playerX` adlı bir sayıda tutacağız:
`0` yolun ortası, `-1` sol kenar, `1` sağ kenar. Her noktayı ekrana çevirirken (`project`) yan konumdan
`playerX * ROAD` kadar çıkarırız:

```js
project(-playerX * ROAD, -CAMERA_HEIGHT, z)
```

Yakın parçalar ekranda geniş olduğu için aynı kayma yakın yolu çok, uzak yolu çok az oynatır. Gerçek bir arabadan
bakınca da tam böyle görünür.

**Duran araba dönmez.** Direksiyonun etkisini hızla çarparız. `ratio = speed / MAX_SPEED` hızın en yüksek hıza oranıdır:
dururken `0`, tam hızda `1`. Bu oranı hız değişmeden **önce** hesaplıyoruz, o yüzden `update`'in en başına yazılır.

**Çimen yavaştır.** Yoldan çıkınca (`playerX` -1'den küçük ya da 1'den büyük) araba en yüksek hızının üçte birinden
fazlasını koruyamaz. Biraz çimene girebilirsin ama yoldan çok uzaklaşamazsın: `playerX` -2.5 ile 2.5 arasında tutulur.

**Yeni şeyler:**

- `Math.abs(x)` bir sayının işaretsiz hâlidir: `Math.abs(-1.5)` → `1.5`. Böylece "sağa ya da sola 1'den fazla mı?"
  tek soruda sorulur.
- `&&` "ve" demektir: `offRoad && speed > MAX_SPEED / 3` → "yoldan çıktı **ve** hızı üçte birden fazla".
- `(keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)` → sağ basılıysa `1`, sol basılıysa `-1`, ikisi de ya da hiçbiri
  basılı değilse `0`. Bu sayıya `steer` (yön) diyoruz.
- `keys.ArrowUp = keys.ArrowLeft = keys.ArrowRight = false` → üçüne birden `false` koyar.

**Telefonda:** ekranın sol üçte birine dokunmak sola, sağ üçte birine dokunmak sağa çevirir (ve gaz da verir).
Parmağın nerede olduğunu şöyle buluruz: `canvas.getBoundingClientRect()` canvas'ın sayfadaki yerini ve enini verir,
`event.clientX` parmağın yatay konumudur. `(parmak - sol kenar) / en` 0 ile 1 arasında bir sayı olur; 3 ile
çarpınca `third` 0 ile 3 arasında olur. `third < 1` sol üçte bir, `third >= 2` sağ üçte birdir.

# --task--

1. Add `playerX` (`0` in `reset()`). In `update()`, using `ratio = speed / MAX_SPEED` from before the speed changes: steer by
   `0.04 × ratio` per frame with the left and right arrows, and keep `playerX` between `-2.5` and `2.5`.
2. Off the road (`Math.abs(playerX) > 1`), a car faster than `MAX_SPEED / 3` loses another `2.5` per frame.
3. Project every road point with `-playerX * ROAD` across.
4. On `pointerdown`, hold `ArrowUp`, plus `ArrowLeft` for the left third or `ArrowRight` for the right third; let go of all
   three on `pointerup` and `pointercancel`.

# --task-tr--

1. `let position ...` satırının hemen altına yan konumu ekle:

   ```js
   let playerX // -1 is the left edge of the road, 1 the right edge
   ```

2. `reset()` içinde `position = 0` satırının altına ekle:

   ```js
   function reset() {
     buildTrack()
     position = 0
     playerX = 0 // ← yeni
     speed = 0
   }
   ```

3. Dokunma kısmını değiştir. `// Touch: hold anywhere to accelerate.` satırından `stopTouch` fonksiyonunun kapanış
   `}`'sine kadar olan kısmı sil ve yerine şunu yaz:

   ```js
   // Touch: hold the left or right third to steer; the car accelerates on its own while you touch.
   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const third = ((event.clientX - rect.left) / rect.width) * 3
     keys.ArrowUp = true
     if (third < 1) keys.ArrowLeft = true
     if (third >= 2) keys.ArrowRight = true
   })
   function stopTouch() {
     keys.ArrowUp = keys.ArrowLeft = keys.ArrowRight = false
   }
   ```

   Altındaki iki `canvas.addEventListener('pointerup' ...)` ve `('pointercancel' ...)` satırı aynen kalır.

4. `update()` fonksiyonunu şöyle değiştir (yeni satırlar işaretli):

   ```js
   function update() {
     const ratio = speed / MAX_SPEED // ← yeni

     if (keys.ArrowUp) speed += 1.2
     else if (keys.ArrowDown) speed -= 3
     else speed -= 0.4
     const offRoad = Math.abs(playerX) > 1 // ← yeni
     if (offRoad && speed > MAX_SPEED / 3) speed -= 2.5 // grass slows you down  ← yeni
     speed = Math.max(0, Math.min(MAX_SPEED, speed))

     // Steering works better the faster you go.  ← yeni (bu dört satır)
     const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
     playerX += steer * 0.04 * ratio
     playerX = Math.max(-2.5, Math.min(2.5, playerX))

     position += speed
     if (position >= trackLength) position -= trackLength
   }
   ```

   Çimen satırında `// ← yeni` yazmana gerek yok; işaretler sadece sana yol göstermek için.

5. `draw()` içindeki ilk `for` döngüsünde `near` ve `far` satırlarındaki ilk `0`'ı `-playerX * ROAD` yap:

   ```js
       const near = project(-playerX * ROAD, -CAMERA_HEIGHT, z) // ← değişti
       const far = project(-playerX * ROAD, -CAMERA_HEIGHT, z + SEG) // ← değişti
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Yukarı okla hızlan, sağ-sol oklarla yolu kaydır; yoldan çıkınca
   hızın 100 km/h civarına düşmeli. Alttaki kontrollerin hepsi yeşil olmalı. Dururken direksiyon dönüyorsa
   `ratio` satırını `update`'in en başına yazdığından emin ol.

# --tests--

Steering should move across the road, faster at higher speed, and not at all when standing still.
tr: Direksiyon yol boyunca kaydırmalı, yüksek hızda daha çok, dururken hiç.

```js
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(playerX, 0, 'standing still')
speed = MAX_SPEED
$.press('ArrowUp')
$.tick(10)
assert.closeTo(playerX, 0.4, 1e-9)
playerX = 2.49
$.tick(5)
assert.strictEqual(playerX, 2.5)
```

The grass should slow the car down to a third of its top speed.
tr: Çimen arabayı en yüksek hızının üçte birine yavaşlatmalı.

```js
speed = MAX_SPEED
playerX = -1.5
$.press('ArrowUp')
$.tick(200)
assert.isBelow(speed, MAX_SPEED / 3 + 2)
playerX = 0
$.tick(100)
assert.strictEqual(speed, MAX_SPEED)
```

Moving across should shift the near road much more than the far road.
tr: Yana kaymak yakın yolu uzak yoldan çok daha fazla kaydırmalı.

```js
playerX = 0.5
const near = project(-playerX * ROAD, -CAMERA_HEIGHT, 1000)
const far = project(-playerX * ROAD, -CAMERA_HEIGHT, 10000)
assert.isBelow(near.x, far.x)
assert.closeTo(240 - near.x, 10 * (240 - far.x), 1e-6)
```

Touching the left third should steer left and accelerate.
tr: Sol üçte bire dokunmak sola yönlendirmeli ve hızlandırmalı.

```js
speed = MAX_SPEED
$.pointerDown(20, 100)
$.tick(5)
assert.closeTo(playerX, -0.2, 1e-9)
$.pointerUp(20, 100)
$.tick(1)
assert.isFalse(!!keys.ArrowLeft)
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const SEG = 200 // length of one road segment, in world units
const ROAD = 1000 // half the width of the road
const CAMERA_HEIGHT = 1000
const DEPTH = 1 / Math.tan((50 * Math.PI) / 180) // camera depth for a 100 degree field of view
const PLAYER_Z = CAMERA_HEIGHT * DEPTH // how far in front of the camera the player's car is
const DRAW = 100 // segments drawn
const MAX_SPEED = 120 // world units per frame

let segments // the track: { curve } for each segment
let trackLength
let position // how far along the track the camera is
let playerX // -1 is the left edge of the road, 1 the right edge
let speed
const keys = {}

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(800, 0) // straight for now
  trackLength = segments.length * SEG
}

function reset() {
  buildTrack()
  position = 0
  playerX = 0
  speed = 0
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
// Touch: hold the left or right third to steer; the car accelerates on its own while you touch.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys.ArrowUp = true
  if (third < 1) keys.ArrowLeft = true
  if (third >= 2) keys.ArrowRight = true
})
function stopTouch() {
  keys.ArrowUp = keys.ArrowLeft = keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  const ratio = speed / MAX_SPEED

  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  const offRoad = Math.abs(playerX) > 1
  if (offRoad && speed > MAX_SPEED / 3) speed -= 2.5 // grass slows you down
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

  // Steering works better the faster you go.
  const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  playerX += steer * 0.04 * ratio
  playerX = Math.max(-2.5, Math.min(2.5, playerX))

  position += speed
  if (position >= trackLength) position -= trackLength
}

// Perspective: a point `dz` in front of the camera, `dx` to the side and `dy` above the ground.
function project(dx, dy, dz) {
  const scale = DEPTH / dz
  return { x: W / 2 + scale * dx * (W / 2), y: H / 2 - scale * dy * (H / 2), w: scale * ROAD * (W / 2) }
}

function quad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x2 - w2, y2)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x1 + w1, y1)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)

  // Work out where every segment is on screen, from near to far.
  const base = Math.floor(position / SEG)
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(-playerX * ROAD, -CAMERA_HEIGHT, z)
    const far = project(-playerX * ROAD, -CAMERA_HEIGHT, z + SEG)
    if (z > 0) shown.push({ index, near, far })
  }

  // Paint from far to near, so nearer road covers what is behind it.
  for (let i = shown.length - 1; i >= 0; i--) {
    const { index, near, far } = shown[i]
    const light = Math.floor(index / 3) % 2 === 0
    ctx.fillStyle = light ? '#16a34a' : '#15803d'
    ctx.fillRect(0, far.y, W, near.y - far.y + 1)
    quad(light ? '#f8fafc' : '#dc2626', near.x, near.y, near.w * 1.15, far.x, far.y, far.w * 1.15)
    quad(light ? '#6b7280' : '#646b75', near.x, near.y, near.w, far.x, far.y, far.w)
    if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
  }

  // Your car.
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(W / 2 - 34, H - 44, 68, 30)
  ctx.fillStyle = '#111827'
  ctx.fillRect(W / 2 - 38, H - 22, 14, 12)
  ctx.fillRect(W / 2 + 24, H - 22, 14, 12)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(Math.round((speed / MAX_SPEED) * 300) + ' km/h', 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
