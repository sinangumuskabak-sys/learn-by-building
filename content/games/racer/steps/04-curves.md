---
title: Curves
title_tr: Virajlar
skills: [game.physics]
---

# --explanation--

Here is the cleverest trick of the old racers: the road is not really curved. Each segment only has a `curve` number, and
while drawing, every segment is shifted sideways a little more than the one before it:

```js
x += dx          // this segment's shift
dx += curve      // and the next one shifts a bit more
```

Adding a growing amount again and again makes a smooth **parabola**, which to the eye is a road bending away. Straight
stretches have `curve` 0, so nothing changes; positive bends right, negative bends left. Starting `dx` at a fraction of
the current segment's curve (how far through it the camera is) keeps the bend from jumping from one segment to the next.

A curve also **pulls** the car outwards, harder the faster you go (with the speed squared, like a real car). Against a gentle
curve steering wins easily; in the sharpest ones at top speed the pull is stronger than the steering, and you have to lift off
the gas. That single rule is what makes a racing line worth learning.

# --explanation-tr--

**Bu adımda:** yol virajlı olacak. İleride yolun sağa ya da sola kıvrıldığını göreceksin ve virajlar arabanı dışarı
doğru itecek; hızlı giderken direksiyonla karşı koyman gerekecek.

**Yol aslında hiç kıvrılmıyor.** Eski yarış oyunlarının en akıllıca hilesi bu. Her parçanın sadece bir `curve`
(kıvrım) sayısı var. Çizerken her parçayı bir öncekinden **biraz daha fazla** yana kaydırırız:

```js
x += dx        // bu parçanın kayması
dx += curve    // bir sonraki biraz daha fazla kaysın
```

Bir örnekle: `curve` 2 ise kaymalar 0, 2, 6, 12, 20... diye gider. Her seferinde artan bir miktarı eklemek düzgün bir
eğri (parabol) çizer; göze bu, uzaklaşırken kıvrılan bir yol gibi gelir. Düz kısımlarda `curve` 0'dır, hiçbir şey
değişmez. Artı değer sağa, eksi değer sola kıvırır.

Kamera bir parçanın içinde ilerlerken kıvrım birden sıçramasın diye `dx`'i sıfırdan değil, o parçanın ne kadarını
geçtiğimize göre küçük bir değerden başlatırız: `position % SEG` parçanın içinde kaç birim ilerlediğimizdir
(hatırla, `%` bölümden kalandı), `/ SEG` onu 0 ile 1 arasına getirir.

**Pist kısımlardan kurulur.** `add(60, 2)` "60 parça boyunca sağa 2 kıvrıl" demektir. `buildTrack` içinde
`add`'i peş peşe çağırarak düzlükleri ve virajları sıralarız. Toplam yine 800 parça.

**Hangi parçanın üstündeyim?** `segmentAt(z)`, pist boyunca `z` uzaklıktaki parçayı verir:

```js
const segmentAt = (z) => segments[Math.floor(z / SEG) % segments.length]
```

- `z / SEG` kaçıncı parçada olduğunu, `Math.floor` onu tam sayıya çevirir.
- `% segments.length` pist bittiyse başa sarar.
- `segments[5]` listenin 5 numaralı elemanıdır. Dikkat: numaralar (**index**) **0'dan** başlar; ilk eleman `segments[0]`.

Araba kameranın `PLAYER_Z` kadar önünde durduğu için arabanın altındaki parça `segmentAt(position + PLAYER_Z)`'dir.

**Viraj dışarı çeker.** Gerçek bir araba gibi, viraj arabayı dışa doğru iter ve bu itme **hızın karesiyle**
büyür (`ratio * ratio`): yarı hızda itme dörtte birine düşer. Yumuşak virajlarda direksiyon kolayca kazanır; en keskin
virajlarda tam hızda itme direksiyondan güçlüdür, gazı bırakman gerekir.

# --task--

1. In `buildTrack()`, replace `add(800, 0)` with these stretches:

   ```js
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
   ```

2. Add `segmentAt(z)`, the segment at a distance `z` along the track. In `update()`, the curve under the car
   (`segmentAt(position + PLAYER_Z)`) pulls it: `playerX -= curve × 0.012 × ratio²`, before clamping.
3. When drawing, start with `x = 0` and `dx = -curve × (position % SEG) / SEG` of the current segment; each segment's near edge
   is at `x`, its far edge at `x + dx` (minus the camera's `playerX * ROAD`), then `x += dx` and `dx += curve`.

# --task-tr--

1. `buildTrack()` içindeki `add(800, 0) // straight for now` satırını sil ve yerine pistin kısımlarını yaz:

   ```js
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
   ```

   Altındaki `trackLength = ...` satırı aynen kalır.

2. `canvas.addEventListener('pointercancel', stopTouch)` satırının altına, `function update()`'in **üstüne** şunu yaz:

   ```js
   const segmentAt = (z) => segments[Math.floor(z / SEG) % segments.length]
   ```

3. `update()` içindeki direksiyon kısmına virajın itmesini ekle (yorum da değişti):

   ```js
     // Steering works better the faster you go; curves push you outwards. // ← değişti
     const steer = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
     playerX += steer * 0.04 * ratio
     playerX -= segmentAt(position + PLAYER_Z).curve * 0.012 * ratio * ratio // ← yeni
     playerX = Math.max(-2.5, Math.min(2.5, playerX))
   ```

   Yeni satır, `playerX`'i sınırlayan `Math.max` satırının **üstünde** olmalı.

4. `draw()` içinde ilk `for` döngüsünün öncesini ve içini şöyle değiştir:

   ```js
     // Work out where every segment is on screen, from near to far, bending the road a little more at each curve. // ← değişti
     const base = Math.floor(position / SEG)
     let x = 0 // ← yeni
     let dx = -segments[base % segments.length].curve * ((position % SEG) / SEG) // ← yeni
     const shown = []
     for (let i = 0; i < DRAW; i++) {
       const index = (base + i) % segments.length
       const z = (base + i) * SEG - position
       const near = project(x - playerX * ROAD, -CAMERA_HEIGHT, z) // ← değişti
       const far = project(x + dx - playerX * ROAD, -CAMERA_HEIGHT, z + SEG) // ← değişti
       x += dx // ← yeni
       dx += segments[index].curve // ← yeni
       if (z > 0) shown.push({ index, near, far })
     }
   ```

   Yakın kenar `x` kadar, uzak kenar `x + dx` kadar yana kayar; sonra bir sonraki parça için `x` ve `dx` büyür.

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve hızlan: ileride yolun kıvrıldığını görmeli, virajda arabanın
   dışa kaydığını hissetmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Pist kontrolü kırmızıysa `add` satırlarının
   sayılarını ve eksi işaretlerini tek tek karşılaştır.

# --tests--

The track should be built from straights and curves.
tr: Pist düzlüklerden ve virajlardan kurulmalı.

```js
assert.lengthOf(segments, 800)
assert.strictEqual(segments[0].curve, 0)
assert.strictEqual(segments[80].curve, 2)
assert.strictEqual(segmentAt(310 * SEG + 5).curve, 4)
assert.strictEqual(segmentAt(trackLength + 81 * SEG).curve, 2, 'the track loops')
```

A curve should pull a fast car outwards.
tr: Bir viraj hızlı bir arabayı dışarı çekmeli.

```js
position = 310 * SEG + 100 - PLAYER_Z
speed = MAX_SPEED
$.tick(1)
assert.closeTo(playerX, -4 * 0.012, 1e-9)
playerX = 0
speed = MAX_SPEED / 2
$.tick(1)
assert.closeTo(playerX, -4 * 0.012 / 4, 1e-6, 'half the speed, a quarter of the pull')
```

The road ahead should bend where the curve starts.
tr: Öndeki yol virajın başladığı yerde kıvrılmalı.

```js
position = 300 * SEG // the sharp right curve starts 10 segments ahead
$.tick(1)
const calls = $.screen()
const isRoad = (c) => c.op === 'fill' && (c.fill === '#6b7280' || c.fill === '#646b75')
const centers = []
calls.forEach((c, i) => {
  if (!isRoad(c)) return
  const path = calls.slice(0, i).filter((d) => d.op === 'moveTo' || d.op === 'lineTo').slice(-4)
  centers.push((path[0].args[0] + path[3].args[0]) / 2)
})
assert.isAbove(centers[0], 300, 'far away, in the curve, the road bends right')
assert.closeTo(centers[centers.length - 1], 240, 1e-6, 'right in front it is still straight')
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
