---
title: Speed
title_tr: Hız
skills: [game.physics, game.input]
---

# --explanation--

Moving along the road is only one number: `position`, how far the camera has come. Every frame it grows by `speed`, and
because the segments are drawn relative to `position`, the stripes slide towards you and the road seems to rush by. When
`position` passes the end of the track, it wraps back to the start: the track is a loop.

Speed itself changes gently:

- holding **up** accelerates,
- **down** brakes, much harder,
- letting go coasts: the car slowly loses speed,
- and there is a top speed.

Three different rates (accelerate, brake, coast) are what make driving feel like driving. The speedometer shows the speed
scaled to a friendlier number, as km/h.

On a phone, holding a finger anywhere on the game is the gas pedal.

# --explanation-tr--

**Bu adımda:** yola kırmızı bir araba koyacağız ve gaza basınca yol üstüne akmaya başlayacak. Sol üstte hızın
`km/h` olarak yazacak. Yukarı ok gaz, aşağı ok fren.

**Hareket tek bir sayıdır.** 1. adımda parçaları hep `position`'a göre çizdik. Şimdi her karede (saniyede ~60 kez)
`position`'a `speed` (hız) kadar ekleyeceğiz. `position` büyüdükçe çizgiler sana doğru kayar; yol akıyormuş gibi
görünür. `position` pistin sonunu geçince baştan başlar: pist bir **tur**dur.

**Hız yumuşak değişir.** Gerçek bir araba gibi üç farklı oran kullanacağız:

- yukarı ok basılıyken hız her karede 1.2 artar,
- aşağı ok (fren) basılıyken 3 azalır (fren çok daha sert),
- hiçbir şeye basmazsan araba kendi kendine 0.4 yavaşlar,
- ve bir en yüksek hız vardır (`MAX_SPEED`).

**Olay (event) nedir?** Kullanıcı bir tuşa bastığında tarayıcı bir **olay** yayar. Ona önceden "bu olunca şunu yap"
diye bir fonksiyon verebilirsin:

```js
document.addEventListener('keydown', (event) => {
  // bir tuşa basıldığında burası çalışır
})
```

- `addEventListener('keydown', ...)` → "tuşa basılınca şu fonksiyonu çağır". `'keyup'` tuş bırakılınca olur.
- `event.key` basılan tuşun adıdır: `'ArrowUp'`, `'ArrowDown'`, `'a'` gibi.

**Hangi tuşlar basılı?** Bunu `keys` adlı boş bir nesnede tutacağız (`const keys = {}`). Tuşa basılınca
`keys[event.key] = true`, bırakılınca `false` yazarız. Köşeli parantez `keys['ArrowUp']` ile nokta `keys.ArrowUp`
aynı şeydir; adı bir değişkenden geliyorsa köşeli parantez kullanılır. `true` "doğru/evet", `false` "yanlış/hayır" demek.

- `event.key.startsWith('Arrow')` → "tuşun adı `Arrow` ile mi başlıyor?"
- `event.preventDefault()` → tarayıcının kendi işini yapmasını engeller. Yoksa ok tuşları sayfayı kaydırırdı.

**Telefon için:** `pointerdown` parmak (ya da fare) ekrana değince, `pointerup` kalkınca, `pointercancel` dokunuş
yarıda kesilince olur. Parmak ekrandayken `keys.ArrowUp = true` yaparız: parmak gaz pedalı olur.

**`update` fonksiyonundaki yeni şeyler:**

- `speed += 1.2` → "`speed`'e 1.2 ekle" (`speed = speed + 1.2`'nin kısası). `-=` çıkarır.
- `if (...) A else if (...) B else C` → ilk doğru koşulun işini yapar, hiçbiri doğru değilse `else`'i.
- `Math.min(MAX_SPEED, speed)` iki sayının küçüğünü, `Math.max(0, ...)` büyüğünü verir. İkisi birlikte hızı 0 ile
  `MAX_SPEED` arasında tutar: ne eksiye düşer ne de sınırı aşar.

**Yazı çizmek:** `ctx.font = 'bold 16px sans-serif'` yazı tipini, `ctx.textAlign = 'left'` hizayı ayarlar,
`ctx.fillText(yazı, x, y)` yazıyı boyar. `Math.round` en yakın tam sayıya yuvarlar. Bir sayıyla bir yazıyı `+` ile
yan yana koyabilirsin: `30 + ' km/h'` → `'30 km/h'`. Hızı `MAX_SPEED`'e bölüp 300 ile çarpıyoruz, böylece en yüksek
hız ekranda "300 km/h" görünür.

# --task--

1. Add `MAX_SPEED = 120`, `PLAYER_Z` (`CAMERA_HEIGHT * DEPTH`), `speed` (`0` in `reset()`) and a `keys` object from `keydown`
   and `keyup` (`preventDefault()` for arrows). Holding a finger on the canvas holds `ArrowUp`.
2. Write `update()`: `ArrowUp` adds `1.2`, otherwise `ArrowDown` takes `3`, otherwise the car loses `0.4`; keep the speed
   between `0` and `MAX_SPEED`. Then add `speed` to `position`, and subtract `trackLength` when it reaches the end.
3. Draw your car at the bottom center: a `'#ef4444'` body 68 by 30 at `(W / 2 - 34, H - 44)` and two `'#111827'` wheels 14 by 12
   at `(W / 2 - 38, H - 22)` and `(W / 2 + 24, H - 22)`, and `30 km/h` at the top left (speed / `MAX_SPEED` × 300, rounded;
   `'#0f172a'`, `'bold 16px sans-serif'`, `y = 22`).

# --task-tr--

1. `const DEPTH = ...` satırının hemen **altına** şunu ekle (arabanın kameranın ne kadar önünde durduğu):

   ```js
   const PLAYER_Z = CAMERA_HEIGHT * DEPTH // how far in front of the camera the player's car is
   ```

2. `const DRAW = 100 ...` satırının hemen altına en yüksek hızı ekle:

   ```js
   const MAX_SPEED = 120 // world units per frame
   ```

3. `let position ...` satırının hemen altına hızı ve tuş listesini ekle:

   ```js
   let speed
   const keys = {}
   ```

4. `reset()` fonksiyonunun içine, `position = 0` satırının altına hızı sıfırlayan satırı ekle:

   ```js
   function reset() {
     buildTrack()
     position = 0
     speed = 0 // ← yeni
   }
   ```

5. `reset()` fonksiyonunun kapanış `}`'sinden sonra (yani `// Perspective: ...` yorumunun üstüne) klavye ve dokunma
   olaylarını, sonra da `update` fonksiyonunu yaz:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key.startsWith('Arrow')) event.preventDefault()
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })
   // Touch: hold anywhere to accelerate.
   canvas.addEventListener('pointerdown', () => {
     keys.ArrowUp = true
   })
   function stopTouch() {
     keys.ArrowUp = false
   }
   canvas.addEventListener('pointerup', stopTouch)
   canvas.addEventListener('pointercancel', stopTouch)

   function update() {
     if (keys.ArrowUp) speed += 1.2
     else if (keys.ArrowDown) speed -= 3
     else speed -= 0.4
     speed = Math.max(0, Math.min(MAX_SPEED, speed))

     position += speed
     if (position >= trackLength) position -= trackLength
   }
   ```

   Son satır: `position` pist uzunluğuna ulaşınca ondan pist uzunluğunu çıkarır, böylece araba başa döner.

6. `draw()` fonksiyonunun en sonuna, ikinci `for` döngüsünü kapatan `}`'den **sonra** ama `draw`'u kapatan son
   `}`'den **önce** arabayı ve hız göstergesini çizen satırları ekle:

   ```js
       if (light) quad('#f8fafc', near.x, near.y, near.w * 0.03, far.x, far.y, far.w * 0.03)
     }

     // Your car.                                        // ← yeni (buradan aşağısı)
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
   ```

   Kırmızı dikdörtgen arabanın gövdesi, iki koyu küçük dikdörtgen tekerlekleri. En son çizildikleri için yolun üstünde görünürler.

7. `loop()` fonksiyonunda `draw()`'un **üstüne** `update()` çağrısını ekle; önce hareket, sonra çizim:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra yukarı oku basılı tut: yol akmalı, hız artmalı; aşağı ok
   frenlemeli. Alttaki kontrollerin hepsi yeşil olmalı. Hız hiç değişmiyorsa `update()` çağrısını `loop`'a eklemeyi
   unutmuş olabilirsin.

# --tests--

Holding up should accelerate, braking should slow down hard and letting go gently.
tr: Yukarı basılı tutmak hızlandırmalı, fren sert, bırakmak yumuşak yavaşlatmalı.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(speed, 12, 1e-9)
assert.closeTo(position, 1.2 * 55, 1e-9)
$.release('ArrowUp')
$.tick(5)
assert.closeTo(speed, 10, 1e-9)
$.press('ArrowDown')
$.tick(2)
assert.closeTo(speed, 4, 1e-9)
$.tick(5)
assert.strictEqual(speed, 0)
```

Speed should stop at the top speed, and the track should loop.
tr: Hız en yüksek hızda durmalı ve pist döngü olmalı.

```js
$.press('ArrowUp')
$.tick(150)
assert.strictEqual(speed, MAX_SPEED)
position = trackLength - 50
$.tick(1)
assert.closeTo(position, 70, 1e-9)
assert.include($.texts(), '300 km/h')
```

A finger on the game should work as the gas pedal, and the car should be drawn.
tr: Oyundaki bir parmak gaz pedalı gibi çalışmalı ve araba çizilmeli.

```js
$.pointerDown(240, 160)
$.tick(5)
assert.closeTo(speed, 6, 1e-9)
$.pointerUp(240, 160)
$.tick(1)
assert.closeTo(speed, 5.6, 1e-9)
assert.deepEqual($.rects('#ef4444').map((r) => [r.x, r.y, r.w, r.h]), [[206, 276, 68, 30]])
assert.lengthOf($.rects('#111827'), 2)
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
  speed = 0
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
// Touch: hold anywhere to accelerate.
canvas.addEventListener('pointerdown', () => {
  keys.ArrowUp = true
})
function stopTouch() {
  keys.ArrowUp = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  if (keys.ArrowUp) speed += 1.2
  else if (keys.ArrowDown) speed -= 3
  else speed -= 0.4
  speed = Math.max(0, Math.min(MAX_SPEED, speed))

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
    const near = project(0, -CAMERA_HEIGHT, z)
    const far = project(0, -CAMERA_HEIGHT, z + SEG)
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
