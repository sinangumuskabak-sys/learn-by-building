---
title: Engine and steering
title_tr: Motor ve yönlendirme
skills: [game.physics, game.input]
---

# --explanation--

The lander has one engine, under it, and it always pushes the way the lander points. Pointing straight up (`angle` 0), it
pushes straight up. Tilted, part of the push goes sideways, and that is the only way to move sideways at all:

```js
lander.vx += Math.sin(lander.angle) * THRUST
lander.vy -= Math.cos(lander.angle) * THRUST   // minus: up is a smaller y
```

This is the heart of the game, and of every "thrust" game (Asteroids works the same way): the engine changes the
**speed**, not the position, so the lander keeps moving after you let go, and stopping takes as much planning as starting.
To stop drifting right, you must tilt left and burn.

Fuel makes every burn a decision. Each frame of engine costs 1 of 400, and with an empty tank the engine does nothing.
The flame is drawn inside the same `save`/`restore` as the lander, so it tilts with it for free.

# --explanation-tr--

**Bu adımda:** aracı sen kullanacaksın. ← ve → ile araç sola/sağa eğilecek, ↑ basılıyken motor yanacak: aracın
altında turuncu bir alev görünecek ve araç baktığı yöne itilecek. Telefonda ekranın sol, orta ve sağ üçte birine
dokunarak aynı şeyleri yapabileceksin.

**Motor nereye iter?** Motor aracın altındadır ve aracı hep **baktığı yöne** iter. Dik dururken (`angle` 0) tam
yukarı iter. Eğikken itmenin bir kısmı yana gider; yana gitmenin tek yolu da budur:

```js
lander.vx += Math.sin(lander.angle) * THRUST
lander.vy -= Math.cos(lander.angle) * THRUST   // eksi: yukarı, daha küçük y demek
```

`Math.sin` ve `Math.cos` açıyı "ne kadarı yana, ne kadarı yukarı" oranına çevirir. Açı 0 iken `sin` 0 (hiç yana yok),
`cos` 1 (tamamı yukarı); araç tam yana yattığında tersi olur. Açılar derece değil **radyan** cinsindendir: yarım tur
(180°) yaklaşık 3.14'tür (`Math.PI`).

Bu oyunun kalbidir: motor **konumu değil hızı** değiştirir. Tuşu bıraksan da araç gitmeye devam eder; durmak da
başlamak kadar plan ister. Sağa kaymayı durdurmak için sola eğilip motoru yakman gerekir.

**Tuş notu: `keys`.** Tuşları basılı tutarak oynayacağız. Tarayıcı bir tuşa basılınca `keydown`, bırakılınca `keyup`
**olayı** gönderir. `addEventListener` ile "bu olay olunca şunu yap" deriz. Olaylar sadece hangi tuşun basılı olduğunu
bir nesneye not eder; `update()` her karede bu nota bakar:

```js
document.addEventListener('keydown', (event) => {
  keys[event.key] = true        // örn. keys.ArrowUp = true
})
```

`(event) => { ... }` olay olunca çağrılan küçük bir fonksiyondur; `event.key` basılan tuşun adıdır (`'ArrowUp'`,
`' '` boşluk). Köşeli parantez, adı değişkende duran alana yazar.

**Sayfa kaymasın.** Ok tuşları ve Boşluk normalde sayfayı kaydırır. `event.preventDefault()` "tarayıcının bu tuşla
normalde yaptığını yapma" der. `event.key.startsWith('Arrow')` "tuş adı `Arrow` ile mi başlıyor?" diye sorar.

**Yakıt.** Motorun her karesi 400 yakıttan 1 harcar; depo boşsa motor çalışmaz. "Motor şu an yanıyor mu?" sorusunu
küçük bir fonksiyona koyarız. `&&` "ve" demektir: üç şartın hepsi doğru olmalı:

```js
return state === 'flying' && keys.ArrowUp && lander.fuel > 0
```

**Dokunmatik.** `pointerdown` parmak (ya da fare) ekrana değince, `pointerup` kalkınca gelir. `pointercancel`
dokunuş yarıda kesilirse gelir. Dokunulan yerin canvas'ın hangi üçte birinde olduğunu hesaplarız:

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki konumu ve boyu (`rect.left`, `rect.width`).
- `(event.clientX - rect.left) / rect.width` → dokunuşun canvas içindeki yeri, 0 (sol) ile 1 (sağ) arası. `* 3`
  ile 0–3 arası olur: 1'den küçükse sol, 2'den küçükse orta, yoksa sağ.
- `koşul ? a : b` → koşul doğruysa `a`, değilse `b`. İki tane art arda: "1'den küçükse sol ok, değilse (2'den
  küçükse yukarı ok, değilse sağ ok)".

Parmak kalkınca üç tuşu da bırakan `stopTouch` fonksiyonunu iki olaya birden veririz. Bir fonksiyonu adıyla, `()`
olmadan vermek "olay olunca bunu çağır" demektir.

**Alev.** Aracın içinde, gövdeden önce çizilen turuncu küçük bir üçgendir. 2. adımdaki `save`/`translate`/`rotate`
içinde çizildiği için araçla birlikte kendiliğinden eğilir. Ucu her karede rastgele uzayıp kısalır ki titresin.

# --task--

1. Add `THRUST = 0.1`, `SPIN = 0.05`, a `keys` object (`keydown`/`keyup`, `preventDefault()` for arrows and Space), and
   `fuel: 400` on the lander.
2. Write `burning()`: flying, `ArrowUp` held and fuel left. In `update()`, before gravity: the left and right arrows change
   `angle` by `SPIN`; while burning, push along the angle as above and use 1 fuel.
3. On `pointerdown`, hold `ArrowLeft`, `ArrowUp` or `ArrowRight` for the left, middle or right third of the canvas; release
   them on `pointerup` and `pointercancel`.
4. While burning, draw a `'#f97316'` flame inside `drawLander()`, before the body: `(-5, 8)`, `(5, 8)` and
   `(0, 16 + Math.random() * 8)`.

# --task-tr--

1. `const GRAVITY = ...` satırının altına iki sabit ekle:

   ```js
   const THRUST = 0.1 // speed gained per frame of engine, along the direction the lander points
   const SPIN = 0.05 // radians per frame
   ```

2. `let state ...` satırının altına tuş notunu ekle:

   ```js
   const keys = {}
   ```

3. `reset()` içinde araca yakıt ekle:

   ```js
     lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }   // ← değişti
   ```

4. `reset()`'in kapanan `}`'sinden sonra bir boş satır bırak ve (`function update()`'in **üstüne**) klavye,
   dokunmatik ve motor kodunu yaz:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })

   // Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const third = ((event.clientX - rect.left) / rect.width) * 3
     keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
   })
   function stopTouch() {
     keys.ArrowLeft = false
     keys.ArrowUp = false
     keys.ArrowRight = false
   }
   canvas.addEventListener('pointerup', stopTouch)
   canvas.addEventListener('pointercancel', stopTouch)

   function burning() {
     return state === 'flying' && keys.ArrowUp && lander.fuel > 0
   }
   ```

5. `update()` içinde, `if (state !== 'flying') return` ve boş satırdan sonra, `lander.vy += GRAVITY` satırının
   **üstüne** eğilme ve motor kodunu ekle:

   ```js
   function update() {
     if (state !== 'flying') return

     if (keys.ArrowLeft) lander.angle -= SPIN                                                   // ← yeni
     if (keys.ArrowRight) lander.angle += SPIN                                                  // ← yeni
     if (burning()) {                                                                           // ← yeni
       // The engine pushes along the direction the lander points: angle 0 is straight up.
       lander.vx += Math.sin(lander.angle) * THRUST                                             // ← yeni
       lander.vy -= Math.cos(lander.angle) * THRUST                                             // ← yeni
       lander.fuel -= 1                                                                         // ← yeni
     }                                                                                          // ← yeni
     lander.vy += GRAVITY
   ```

   Geri kalanı aynen kalır.

6. `drawLander()` içinde, `ctx.rotate(lander.angle)` satırının altına, gövdenin rengini seçen
   `ctx.fillStyle = '#e2e8f0'` satırının **üstüne** alevi ekle:

   ```js
     ctx.rotate(lander.angle)
     if (burning()) {                                  // ← yeni
       ctx.fillStyle = '#f97316'                       // ← yeni
       ctx.beginPath()                                 // ← yeni
       ctx.moveTo(-5, 8)                               // ← yeni
       ctx.lineTo(5, 8)                                // ← yeni
       ctx.lineTo(0, 16 + Math.random() * 8)           // ← yeni
       ctx.fill()                                      // ← yeni
     }                                                 // ← yeni
     ctx.fillStyle = '#e2e8f0'
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. ↑'ya basılı tut: alev çıkmalı ve araç yavaşlayıp yükselmeli.
   ← / → ile eğil ve motoru yakarak yana git. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa tuş
   adlarının büyük harflerine bak: `ArrowUp`, `ArrowLeft`, `ArrowRight`.

# --tests--

The engine should push up against gravity and use fuel.
tr: Motor yerçekimine karşı yukarı itmeli ve yakıt harcamalı.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(lander.vy, -0.75, 1e-9)
assert.strictEqual(lander.fuel, 390)
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === '#f97316'), 'a flame while burning')
$.release('ArrowUp')
$.tick(1)
assert.isFalse($.screen().some((c) => c.op === 'fill' && c.fill === '#f97316'))
```

Tilting should turn the push sideways.
tr: Eğilmek itkiyi yana çevirmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(lander.angle, 0.5, 1e-9)
$.release('ArrowRight')
lander.angle = Math.PI / 2
lander.vx = 0
lander.vy = 0
$.press('ArrowUp')
$.tick(5)
assert.closeTo(lander.vx, 0.5, 1e-9)
assert.closeTo(lander.vy, 5 * 0.025, 1e-9, 'pointing sideways, gravity is not fought at all')
```

An empty tank should stop the engine.
tr: Boş bir depo motoru durdurmalı.

```js
lander.fuel = 2
$.press('ArrowUp')
$.tick(5)
assert.strictEqual(lander.fuel, 0)
assert.isFalse(burning())
assert.closeTo(lander.vy, 2 * -0.1 + 5 * 0.025, 1e-9)
```

Touching the thirds of the screen should steer and burn.
tr: Ekranın üçte birlerine dokunmak yönlendirmeli ve yakmalı.

```js
$.pointerDown(20, 100)
$.tick(4)
assert.closeTo(lander.angle, -0.2, 1e-9)
$.pointerUp(20, 100)
$.pointerDown(240, 100)
$.tick(2)
assert.strictEqual(lander.fuel, 398)
$.pointerUp(240, 100)
$.tick(2)
assert.strictEqual(lander.fuel, 398)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const THRUST = 0.1 // speed gained per frame of engine, along the direction the lander points
const SPIN = 0.05 // radians per frame
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it
const GRAVITY = 0.025 // speed gained per frame, downwards

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let state // 'flying' or 'down'
const keys = {}

// Random hills, with one flat stretch: the pad.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}

function reset() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
  state = 'flying'
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function burning() {
  return state === 'flying' && keys.ArrowUp && lander.fuel > 0
}

function update() {
  if (state !== 'flying') return

  if (keys.ArrowLeft) lander.angle -= SPIN
  if (keys.ArrowRight) lander.angle += SPIN
  if (burning()) {
    // The engine pushes along the direction the lander points: angle 0 is straight up.
    lander.vx += Math.sin(lander.angle) * THRUST
    lander.vy -= Math.cos(lander.angle) * THRUST
    lander.fuel -= 1
  }
  lander.vy += GRAVITY
  lander.x += lander.vx
  lander.y += lander.vy
  // Leaving one side brings the lander back on the other.
  lander.x = (lander.x + canvas.width) % canvas.width

  const feet = lander.y + 10
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) state = 'down'
}

function drawLander() {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  if (burning()) {
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(-5, 8)
    ctx.lineTo(5, 8)
    ctx.lineTo(0, 16 + Math.random() * 8)
    ctx.fill()
  }
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(9, 8)
  ctx.lineTo(-9, 8)
  ctx.fill()
  ctx.fillRect(-FEET, 8, 2, 2)
  ctx.fillRect(FEET - 2, 8, 2, 2)
  ctx.restore()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)

  drawLander()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
