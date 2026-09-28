---
title: Landing or crashing
title_tr: İniş mi, kaza mı
skills: [game.collision, game.state]
---

# --explanation--

Touching the ground is only a landing if **everything** is right at that moment:

- both feet are on the pad,
- falling slowly: at most 1.2 pixels per frame,
- hardly drifting sideways: at most 0.6,
- nearly upright: at most 0.2 radians (about 11°) of tilt.

Any one of them wrong, and it is a crash. Putting the limits in one object, `SAFE`, keeps the rules in one place, and the
same numbers can color the **readouts**: each value is shown green while it is within the limit and red when it is not.
That turns hidden rules into something the player can see and learn from, which is what makes a hard game feel fair.

After a landing or a crash, Space (or a tap) starts a new flight over new hills.

# --explanation-tr--

**Bu adımda:** yere değmek artık ya **iniş** ya da **kaza** olacak. Sol üstte dört gösterge (yakıt, düşüş hızı,
yana kayma, eğim) göreceksin: değer güvenliyse yeşil, değilse kırmızı. İnince ortada yeşil "Landed!", çakılınca
kırmızı "Crashed." yazısı çıkacak; Boşluk ya da dokunuş yeni bir uçuş başlatacak.

**Ne zaman iniş sayılır?** Değdiği anda **her şey** doğru olmalı:

- iki ayak da pistin üstünde,
- yavaş düşüyor: karede en fazla 1.2 piksel,
- neredeyse hiç yana kaymıyor: en fazla 0.6,
- neredeyse dik: en fazla 0.2 radyan (yaklaşık 11°) eğim.

Biri bile yanlışsa kazadır. Sınırları tek bir nesnede (`SAFE`, güvenli) tutarız; kurallar tek yerde durur ve aynı
sayılarla göstergeleri de boyarız. Gizli kuralları oyuncunun görebildiği bir şeye çevirmek zor bir oyunu adil
hissettirir.

**Kontrol parça parça:**

```js
const onPad = lander.x - FEET >= pad.x1 && lander.x + FEET <= pad.x2
```

Sol ayak pistin sol ucundan sağda **ve** sağ ayak pistin sağ ucundan solda mı? `>=` "büyük veya eşit", `<=` "küçük
veya eşit" demektir. Sonuç `true` ya da `false` olur ve `onPad` adıyla saklanır.

```js
const gentle = lander.vy <= SAFE.vy && Math.abs(lander.vx) <= SAFE.vx && Math.abs(lander.angle) <= SAFE.angle
```

`Math.abs` bir sayının işaretsiz hâlidir (`Math.abs(-0.8)` → 0.8): sola kayma da sağa kayma kadar tehlikelidir.
Sonra `if (onPad && gentle)` ise iniş: `state = 'landed'` ve araç tam pistin üstüne oturtulur (`pad.y - 10`, çünkü
ayaklar ortanın 10 piksel altında). `return` fonksiyonu orada bitirir; oraya gelmediysek `state = 'crashed'` olur.

**Göstergeler.** Her gösterge `[yazı, iyi mi]` şeklinde iki elemanlı küçük bir **dizidir**; dördü de bir dizinin içinde
durur:

- `'Fuel ' + lander.fuel` → `+` yazı ile sayıyı uç uca ekler: `'Fuel 400'`.
- `sayı.toFixed(1)` → sayıyı virgülden sonra tek haneyle yazıya çevirir: `0.4567` → `'0.5'`.
- `Math.round((açı * 180) / Math.PI)` → radyanı dereceye çevirip en yakın tam sayıya yuvarlar.
- `readouts.forEach(([text, ok], i) => ...)` → her gösterge için bir kez çalışır. `[text, ok]` iki elemanı ayrı
  adlara açar; `i` sıra numarasıdır (0, 1, 2, 3), bu yüzden `20 + i * 18` her yazıyı bir alta koyar.
- `ok ? '#4ade80' : '#f87171'` → iyiyse yeşil, değilse kırmızı.
- `ctx.textAlign = 'left'` yazıyı verilen `x`'ten sağa doğru, `'center'` ise ortalı yazar.

**Yeniden başlamak.** Uçuş bittiyse (`state !== 'flying'`) Boşluk ya da dokunuş `reset()`'i çağırır: yeni tepeler, dolu
depo. Dokunuşta `return`, o dokunuşun ayrıca motoru ya da dönüşü açmasını engeller.

# --task--

1. Add `SAFE = { vy: 1.2, vx: 0.6, angle: 0.2 }`. Write `touchdown()`, called when a foot touches the ground: if both feet
   are within the pad and the speeds and tilt are within `SAFE`, the state becomes `'landed'` and the lander sits on the pad
   (`y = pad.y - 10`); otherwise `'crashed'`.
2. Space or a tap starts again (`reset()`) when the state is not `'flying'`.
3. Draw four readouts at the top left in `'bold 14px monospace'`, 18 pixels apart from `y = 20`: `Fuel 400`, `Down 0.5`,
   `Side 1.0` and `Tilt 3°` (one decimal for speeds, whole degrees), each `'#4ade80'` when fine and `'#f87171'` when not
   (fuel is fine above 50).
4. Show `Landed! Space: fly again` in `'#4ade80'` or `Crashed. Space: try again` in `'#f87171'`, centered at `y = 140`.

# --task-tr--

1. `const SPIN = ...` satırının altına güvenli sınırları ekle:

   ```js
   const SAFE = { vy: 1.2, vx: 0.6, angle: 0.2 } // the most a landing may have
   ```

2. `let state` satırının yorumunu güncelle (durum artık `'down'` değil):

   ```js
   let state // 'flying', 'landed' or 'crashed'
   ```

3. `keydown` dinleyicisine Boşluk satırını ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
     if (event.key === ' ' && state !== 'flying') reset()       // ← yeni
   })
   ```

4. `pointerdown` dinleyicisinin başına yeniden başlatmayı ekle:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (state !== 'flying') {                                   // ← yeni
       reset()                                                   // ← yeni
       return                                                    // ← yeni
     }                                                           // ← yeni
     const rect = canvas.getBoundingClientRect()
   ```

5. `burning()` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`function update()`'in **üstüne**)
   şunu yaz:

   ```js
   function touchdown() {
     const onPad = lander.x - FEET >= pad.x1 && lander.x + FEET <= pad.x2
     const gentle = lander.vy <= SAFE.vy && Math.abs(lander.vx) <= SAFE.vx && Math.abs(lander.angle) <= SAFE.angle
     if (onPad && gentle) {
       state = 'landed'
       lander.y = pad.y - 10
       return
     }
     state = 'crashed'
   }
   ```

6. `update()`'in son satırında, sondaki `state = 'down'` yerine `touchdown()` yaz:

   ```js
     if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) touchdown()   // ← değişti
   ```

7. `draw()` içinde `drawLander()` satırından sonra, fonksiyonun son `}`'sinden önce bir boş satır bırak ve
   göstergeleri ve sonuç yazısını ekle:

   ```js
     drawLander()

     // Readouts: green while the value is safe for landing, red when it is not.
     const readouts = [
       ['Fuel ' + lander.fuel, lander.fuel > 50],
       ['Down ' + lander.vy.toFixed(1), lander.vy <= SAFE.vy],
       ['Side ' + lander.vx.toFixed(1), Math.abs(lander.vx) <= SAFE.vx],
       ['Tilt ' + Math.round((lander.angle * 180) / Math.PI) + '°', Math.abs(lander.angle) <= SAFE.angle],
     ]
     ctx.font = 'bold 14px monospace'
     ctx.textAlign = 'left'
     readouts.forEach(([text, ok], i) => {
       ctx.fillStyle = ok ? '#4ade80' : '#f87171'
       ctx.fillText(text, 10, 20 + i * 18)
     })

     ctx.textAlign = 'center'
     ctx.font = 'bold 22px sans-serif'
     if (state === 'landed') {
       ctx.fillStyle = '#4ade80'
       ctx.fillText('Landed! Space: fly again', canvas.width / 2, 140)
     }
     if (state === 'crashed') {
       ctx.fillStyle = '#f87171'
       ctx.fillText('Crashed. Space: try again', canvas.width / 2, 140)
     }
   }
   ```

   Derece işareti (`°`) klavyende yoksa **Çözümü göster** ile kopyalayabilirsin.

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Motorla yavaşlayıp dik şekilde yeşil piste in: "Landed!"
   çıkmalı. Hızlı çakılırsan "Crashed." çıkmalı; Boşluk ile yeniden uç. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

A gentle, upright touchdown on the pad should be a landing.
tr: Pistte yumuşak ve dik bir temas iniş olmalı.

```js
ground = Array(13).fill(300)
pad = { x1: 40, x2: 120, y: 300 }
lander = { x: 80, y: 285, vx: 0, vy: 0.5, angle: 0.1, fuel: 100 }
$.tick(20)
assert.strictEqual(state, 'landed')
assert.strictEqual(lander.y, 290)
assert.include($.texts(), 'Landed! Space: fly again')
```

Too fast, too tilted, drifting or off the pad should be a crash.
tr: Fazla hızlı, fazla eğik, kayarak ya da pist dışında olmak kaza olmalı.

```js
const tries = [
  { x: 80, vy: 2, vx: 0, angle: 0 },
  { x: 80, vy: 0.5, vx: 0, angle: 0.3 },
  { x: 80, vy: 0.5, vx: 0.8, angle: 0 },
  { x: 125, vy: 0.5, vx: 0, angle: 0 },
]
for (const t of tries) {
  reset()
  ground = Array(13).fill(300)
  pad = { x1: 40, x2: 120, y: 300 }
  lander = { y: 285, fuel: 100, ...t }
  $.tick(30)
  assert.strictEqual(state, 'crashed', JSON.stringify(t))
}
assert.include($.texts(), 'Crashed. Space: try again')
```

The readouts should turn red when a value is not safe.
tr: Göstergeler bir değer güvenli değilken kırmızıya dönmeli.

```js
lander.vx = 1
lander.angle = 0.05
$.tick(1)
const color = (start) => $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith(start)).fill
assert.include($.texts(), 'Fuel 400')
assert.include($.texts(), 'Tilt 3°')
assert.strictEqual(color('Fuel'), '#4ade80')
assert.strictEqual(color('Side'), '#f87171')
assert.strictEqual(color('Tilt'), '#4ade80')
```

Space should start a new flight after a landing or a crash.
tr: Boşluk bir iniş ya da kazadan sonra yeni bir uçuş başlatmalı.

```js
$.press(' ')
assert.strictEqual(state, 'flying', 'nothing happens while flying')
state = 'crashed'
$.press(' ')
assert.strictEqual(state, 'flying')
assert.deepEqual([lander.x, lander.y, lander.fuel], [60, 40, 400])
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
const SAFE = { vy: 1.2, vx: 0.6, angle: 0.2 } // the most a landing may have
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it
const GRAVITY = 0.025 // speed gained per frame, downwards

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let state // 'flying', 'landed' or 'crashed'
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
  if (event.key === ' ' && state !== 'flying') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'flying') {
    reset()
    return
  }
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

function touchdown() {
  const onPad = lander.x - FEET >= pad.x1 && lander.x + FEET <= pad.x2
  const gentle = lander.vy <= SAFE.vy && Math.abs(lander.vx) <= SAFE.vx && Math.abs(lander.angle) <= SAFE.angle
  if (onPad && gentle) {
    state = 'landed'
    lander.y = pad.y - 10
    return
  }
  state = 'crashed'
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
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) touchdown()
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

  // Readouts: green while the value is safe for landing, red when it is not.
  const readouts = [
    ['Fuel ' + lander.fuel, lander.fuel > 50],
    ['Down ' + lander.vy.toFixed(1), lander.vy <= SAFE.vy],
    ['Side ' + lander.vx.toFixed(1), Math.abs(lander.vx) <= SAFE.vx],
    ['Tilt ' + Math.round((lander.angle * 180) / Math.PI) + '°', Math.abs(lander.angle) <= SAFE.angle],
  ]
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'left'
  readouts.forEach(([text, ok], i) => {
    ctx.fillStyle = ok ? '#4ade80' : '#f87171'
    ctx.fillText(text, 10, 20 + i * 18)
  })

  ctx.textAlign = 'center'
  ctx.font = 'bold 22px sans-serif'
  if (state === 'landed') {
    ctx.fillStyle = '#4ade80'
    ctx.fillText('Landed! Space: fly again', canvas.width / 2, 140)
  }
  if (state === 'crashed') {
    ctx.fillStyle = '#f87171'
    ctx.fillText('Crashed. Space: try again', canvas.width / 2, 140)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
