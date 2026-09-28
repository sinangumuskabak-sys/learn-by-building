---
title: Traffic
title_tr: Trafik
skills: [game.collision, game.loop]
---

# --explanation--

Other cars share the road. Each has a distance along the track `z`, a position across the road `x` and its own `speed`,
slower than your top speed, so you catch up and have to get past them.

To draw a car, find the segment it is on: that segment's near edge has already been projected while drawing the road, so it
tells you where on the screen that distance is and how wide the road is there. A car there is drawn as wide as a third of the
road: far cars come out tiny, near ones big. That is the whole secret of **scaling sprites**: size proportional to the
road's width at that distance. Far cars are drawn first, so near ones cover them.

Because the track loops, "how far ahead is that car?" needs the same wrap-around as before:

```js
const ahead = (a, b) => (((b - a) % trackLength) + trackLength) % trackLength
```

Running into a car from behind throws away most of your speed: you drop to half of its speed. Weaving through traffic at top
speed is the skill.

# --explanation-tr--

**Bu adımda:** yola sarı rakip arabalar gelecek. Senden yavaş gidiyorlar; onlara yetişip aralarından geçmen gerekecek.
Arkadan çarparsan hızının çoğunu kaybedersin.

**Her araba bir nesne.** Bir rakip arabayı üç bilgiyle anlatırız: pist boyunca uzaklığı `z`, yoldaki yan konumu `x`
(senin `playerX`'in gibi) ve kendi hızı `speed`. On iki arabayı `cars` adlı bir dizide (listede) tutarız:

```js
{ z: 5000, x: 0.3, speed: 55 }
```

**Rastgelelik:** `Math.random()` her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir sayı verir.
`Math.random() * 1.2 - 0.6` bunu -0.6 ile 0.6 arasına, `40 + Math.random() * 30` ise 40 ile 70 arasına taşır.
Böylece her oyunda arabalar farklı şeritte ve farklı hızda olur.

**Listedeki her eleman için:** `for (const car of cars) { ... }` → "`cars` listesindeki her araba için, ona `car`
de ve `{ }` içini yap." Sayaçlı `for`'dan daha kolay okunur.

**Döngüsel pistte "ne kadar önde?"** Pist dönüyor; 15.900'deki araç 100'deki araçtan aslında sadece birkaç yüz birim
geride olabilir. Bunun için bir yardımcı yazarız:

```js
const ahead = (a, b) => (((b - a) % trackLength) + trackLength) % trackLength
```

"`a`'dan ileri doğru giderek `b`'ye kaç birim var?" sorusunun cevabı. `+ trackLength` ve ikinci `%`, farkın eksi
çıktığı durumu (pistin sonunu geçmek) düzeltir; sonuç hep 0 ile pist uzunluğu arasında olur.

**Çarpışma:** araba senin önünde 120 birimden yakınsa, yan yana farkınız 0.35'ten azsa ve sen ondan hızlıysan
arabaya arkadan çarpmışsın demektir: hızın onun hızının yarısına düşer.

**Uzaktakini küçük çiz.** Arabayı çizmek için bulunduğu parçayı buluruz. O parçanın yakın kenarı yol çizilirken zaten
ekrana çevrilmişti (`shown` listesinde duruyor): ekrandaki yerini ve yolun oradaki genişliğini biliyoruz. Arabayı
yolun genişliğinin üçte biri kadar çizeriz. Uzaktaki araba minik, yakındaki büyük çıkar. Uzaktakileri önce çizeriz ki
yakındakiler onları örtsün.

**Listelerle yeni işler:** hepsi listeyi baştan sona dolaşır ve her eleman için verdiğin küçük fonksiyonu çalıştırır.

- `.map(f)` → her elemanı `f`'in sonucuyla değiştirip **yeni bir liste** yapar.
- `.filter(f)` → sadece `f`'in doğru dediği elemanları tutar.
- `.sort((a, b) => b.gap - a.gap)` → listeyi `gap`'e göre büyükten küçüğe dizer (en uzak önce).
- `.find(f)` → `f`'in doğru dediği **ilk** elemanı verir; yoksa `undefined` (hiçbir şey).
- `!seg` → "`seg` yok mu?" `!` "değil" demektir. `continue` → "bu elemanı bırak, sıradakine geç".

Satırın başındaki noktalar (`.map`, `.filter`...) bir önceki satırın devamıdır; uzun zinciri okunur kılmak için alt alta yazılır.

# --task--

1. Add 12 `cars`, spread evenly along the track (`z = (i + 1) × trackLength / 12`), each with a random `x` from `-0.6` to `0.6` and
   a random `speed` from 40 to 70.
2. Every frame, move each car along the track (wrapping). If a car is less than 120 ahead of your car
   (`ahead(position + PLAYER_Z, car.z)`), within `0.35` across and slower than you, your speed drops to half of its speed.
3. Keep the drawn segments (index, near and far edge). Draw the cars between `PLAYER_Z / 2` and `DRAW × SEG` ahead of the camera,
   furthest first, as `'#facc15'` rectangles on their segment's near edge: `w = 0.35 × near.w` wide, `0.6 × w` high, standing
   on the road at `near.x + car.x × near.w`.

# --task-tr--

1. `let speed` satırının hemen altına araba listesini ekle:

   ```js
   let cars
   ```

2. `reset()` içinde `speed = 0` satırının altına 12 arabayı kuran satırları ekle:

   ```js
   function reset() {
     buildTrack()
     position = 0
     playerX = 0
     speed = 0
     cars = [] // ← yeni (bu dört satır)
     for (let i = 0; i < 12; i++) {
       cars.push({ z: (i + 1) * (trackLength / 12), x: Math.random() * 1.2 - 0.6, speed: 40 + Math.random() * 30 })
     }
   }
   ```

   Arabalar pist boyunca eşit aralıklarla dizilir.

3. `const segmentAt = ...` satırının hemen altına `ahead` yardımcısını ekle:

   ```js
   // Distance from a to b going forwards along the looping track.
   const ahead = (a, b) => (((b - a) % trackLength) + trackLength) % trackLength
   ```

4. `update()` içinde, `playerX = Math.max(-2.5, ...)` satırı ile `position += speed` satırının **arasına** arabaları
   yürüten döngüyü ekle:

   ```js
     playerX = Math.max(-2.5, Math.min(2.5, playerX))

     for (const car of cars) { // ← yeni (buradan)
       car.z = (car.z + car.speed) % trackLength
       const gap = ahead(position + PLAYER_Z, car.z)
       // Driving into a car from behind: you slow down to half its speed.
       if (gap < 120 && Math.abs(car.x - playerX) < 0.35 && speed > car.speed) speed = car.speed / 2
     } // ← (buraya kadar)

     position += speed
   ```

5. `draw()` içinde, yolu boyayan ikinci `for` döngüsünün kapanış `}`'sinden sonra, `// Your car.` yorumunun **üstüne**
   rakip arabaları çizen kısmı ekle:

   ```js
     // The other cars, far ones first, sized by their distance.
     const visible = cars
       .map((car) => ({ car, gap: ahead(position, car.z) }))
       .filter((c) => c.gap > PLAYER_Z * 0.5 && c.gap < DRAW * SEG)
       .sort((a, b) => b.gap - a.gap)
     for (const { car } of visible) {
       const seg = shown.find((s) => s.index === Math.floor(car.z / SEG) % segments.length)
       if (!seg) continue
       const w = seg.near.w * 0.35
       ctx.fillStyle = '#facc15'
       ctx.fillRect(seg.near.x + car.x * seg.near.w - w / 2, seg.near.y - w * 0.6, w, w * 0.6)
     }
   ```

   Önce görünecek kadar yakın olan arabaları seçer ve uzaktan yakına dizer; sonra her birini kendi parçasının yakın
   kenarına, yolun üstünde duracak şekilde sarı bir dikdörtgen olarak çizer.

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve hızlan: ileride sarı arabalar görmeli, yaklaştıkça
   büyüdüklerini izlemelisin. Birine arkadan çarparsan hızın düşmeli. Alttaki kontrollerin hepsi yeşil olmalı.
   Arabalar hiç görünmüyorsa arabaları çizen kısmın `draw()`'un **içinde** kaldığından emin ol.

# --tests--

The cars should be spread along the track and drive on their own.
tr: Arabalar pist boyunca dağılmış olmalı ve kendi başlarına gitmeli.

```js
assert.lengthOf(cars, 12)
assert.isTrue(cars.every((c) => c.x >= -0.6 && c.x <= 0.6 && c.speed >= 40 && c.speed <= 70))
const car = cars[0]
const z = car.z
$.tick(10)
assert.closeTo(car.z, (z + 10 * car.speed) % trackLength, 1e-6)
assert.strictEqual(ahead(trackLength - 10, 20), 30)
```

Driving into a slower car should cost most of your speed.
tr: Daha yavaş bir arabaya çarpmak hızının çoğuna mal olmalı.

```js
cars = [{ z: PLAYER_Z + 60, x: 0.1, speed: 50 }]
speed = MAX_SPEED
$.tick(1)
assert.strictEqual(speed, 25)
cars = [{ z: position + PLAYER_Z + 60, x: 0.8, speed: 50 }]
speed = MAX_SPEED
$.tick(1)
assert.isAbove(speed, 100, 'one lane over: no crash')
```

Cars should get smaller with distance.
tr: Arabalar uzaklıkla küçülmeli.

```js
cars = [{ z: 3000, x: 0, speed: 0 }, { z: 12000, x: 0, speed: 0 }]
$.tick(1)
const drawn = $.rects('#facc15')
assert.lengthOf(drawn, 2)
assert.isBelow(drawn[0].w, drawn[1].w / 3, 'the far one is drawn first, and much smaller')
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
let cars
const keys = {}

// The track is made of stretches: `count` segments bending by `curve` (0 is straight, + right, - left).
function buildTrack() {
  segments = []
  const add = (count, curve) => {
    for (let i = 0; i < count; i++) segments.push({ curve })
  }
  add(80, 0)
  add(60, 2)
  add(50, 0)
  add(80, -3)
  add(40, 0)
  add(50, 4)
  add(30, -1)
  add(60, -2)
  add(70, 0)
  add(90, 3)
  add(40, 0)
  add(60, -4)
  add(90, 0)
  trackLength = segments.length * SEG
}

function reset() {
  buildTrack()
  position = 0
  playerX = 0
  speed = 0
  cars = []
  for (let i = 0; i < 12; i++) {
    cars.push({ z: (i + 1) * (trackLength / 12), x: Math.random() * 1.2 - 0.6, speed: 40 + Math.random() * 30 })
  }
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

const segmentAt = (z) => segments[Math.floor(z / SEG) % segments.length]
// Distance from a to b going forwards along the looping track.
const ahead = (a, b) => (((b - a) % trackLength) + trackLength) % trackLength

function update() {
  const ratio = speed / MAX_SPEED

  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  const offRoad = Math.abs(playerX) > 1
  if (offRoad && speed > MAX_SPEED / 3) speed -= 2.5 // grass slows you down
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

  // Steering works better the faster you go; curves push you outwards.
  const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  playerX += steer * 0.04 * ratio
  playerX -= segmentAt(position + PLAYER_Z).curve * 0.012 * ratio * ratio
  playerX = Math.max(-2.5, Math.min(2.5, playerX))

  for (const car of cars) {
    car.z = (car.z + car.speed) % trackLength
    const gap = ahead(position + PLAYER_Z, car.z)
    // Driving into a car from behind: you slow down to half its speed.
    if (gap < 120 && Math.abs(car.x - playerX) < 0.35 && speed > car.speed) speed = car.speed / 2
  }

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

  // Work out where every segment is on screen, from near to far, bending the road a little more at each curve.
  const base = Math.floor(position / SEG)
  let x = 0
  let dx = -segments[base % segments.length].curve * ((position % SEG) / SEG)
  const shown = []
  for (let i = 0; i < DRAW; i++) {
    const index = (base + i) % segments.length
    const z = (base + i) * SEG - position
    const near = project(x - playerX * ROAD, -CAMERA_HEIGHT, z)
    const far = project(x + dx - playerX * ROAD, -CAMERA_HEIGHT, z + SEG)
    x += dx
    dx += segments[index].curve
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

  // The other cars, far ones first, sized by their distance.
  const visible = cars
    .map((car) => ({ car, gap: ahead(position, car.z) }))
    .filter((c) => c.gap > PLAYER_Z * 0.5 && c.gap < DRAW * SEG)
    .sort((a, b) => b.gap - a.gap)
  for (const { car } of visible) {
    const seg = shown.find((s) => s.index === Math.floor(car.z / SEG) % segments.length)
    if (!seg) continue
    const w = seg.near.w * 0.35
    ctx.fillStyle = '#facc15'
    ctx.fillRect(seg.near.x + car.x * seg.near.w - w / 2, seg.near.y - w * 0.6, w, w * 0.6)
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
