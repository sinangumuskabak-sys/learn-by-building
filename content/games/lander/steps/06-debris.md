---
title: Debris
title_tr: Enkaz
skills: [game.physics]
---

# --explanation--

A crash that only prints "Crashed" is a letdown. A crash where the lander **bursts into pieces** that fly out and fall
back is a moment. It is also the simplest **particle system** there is: many tiny objects, each with a position, a speed
and a lifetime, all following the same rules.

Each piece starts at the wreck with a random direction (an angle, turned into `cos` and `sin` again) and a random speed,
nudged upwards so the burst looks like it came off the ground:

```js
const a = Math.random() * Math.PI * 2
debris.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2, life: 60 })
```

Every frame each piece falls with the same gravity as the lander, and loses one frame of `life`. When it reaches zero, it
is removed. The pieces keep moving after the crash, so they are updated even when the game is not flying any more. The
wrecked lander itself is no longer drawn.

The same few lines make sparks, smoke, rain, confetti and explosions in every kind of game.

# --explanation-tr--

**Bu adımda:** kaza anını görünür yapacağız. Araç çakılınca kaybolacak ve yerine 24 turuncu kıvılcım etrafa saçılıp
yerçekimiyle geri düşecek; yaklaşık bir saniye sonra hepsi sönecek.

**Parçacık sistemi (particle system).** Sadece "Crashed" yazan bir kaza hayal kırıklığıdır; parçalara ayrılan bir araç
ise akılda kalan bir andır. Bu, var olan en basit **parçacık sistemidir**: her birinin konumu, hızı ve ömrü olan bir
sürü küçük nesne, hepsi aynı kurallara uyar. Kıvılcım, duman, yağmur, konfeti ve patlamalar her türlü oyunda bu birkaç
satırla yapılır.

**Parçaları bir listede tutmak.** `debris` (enkaz) bir **dizidir**. Boş liste `[]` diye yazılır;
`debris.push(parça)` listenin sonuna bir parça ekler.

**Parça nasıl doğar?** 24 kez tekrar eden bir `for` döngüsüyle (`i` 0'dan başlar, 24'ten küçük olduğu sürece, `i++`
her turda bir artırır). Her parça:

```js
const a = Math.random() * Math.PI * 2       // rastgele bir yön: 0 ile tam tur arası bir açı
const speed = 1 + Math.random() * 3         // rastgele bir hız: 1 ile 4 arası
debris.push({ x: lander.x, y: lander.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2, life: 60 })
```

`Math.PI * 2` tam bir turdur (360°). 3. adımdaki gibi `cos` ve `sin` açıyı "ne kadarı yana, ne kadarı aşağı" oranına
çevirir; hızla çarpınca parçanın hızı olur. `- 2` hepsini biraz yukarı fırlatır, sanki yerden sekmiş gibi. `life: 60`
parçanın 60 kare (yaklaşık bir saniye) yaşayacağı demektir.

**Her karede.** Listedeki her parça:

```js
for (const d of debris) { ... }
```

Bu da bir döngüdür: "`debris`'teki her eleman için, ona `d` de ve süslü parantezin içini yap". İçeride parça araçla
aynı yerçekimiyle düşer, hızı kadar ilerler ve ömründen bir kare kaybeder (`d.life -= 1`).

Sonra ömrü bitenleri atarız:

```js
debris = debris.filter((d) => d.life > 0)
```

`filter` (süz) sadece koşulu doğru olan elemanlardan yeni bir liste yapar: "ömrü 0'dan büyük olanlar kalsın".

**Neden `update()`'in en başında?** `update()`'in ilk satırı uçmuyorsak `return` ile çıkıyordu. Parçalar kazadan
**sonra** hareket etmeli, o yüzden onları bu kontrolün **üstüne** koyarız.

**Çizim.** Her parça 3×3'lük bir kare. Kareyi parçanın ortasına oturtmak için 1.5 piksel sola ve yukarı kaydırarak
başlatırız. Kaza olduysa artık aracı çizmeyiz: `if (state !== 'crashed') drawLander()`.

# --task--

1. Add `debris` (`[]` in `startLevel()`). A crash adds 24 pieces at the lander with a random angle, a random speed from 1 to
   4 and `life: 60`, as above.
2. At the start of `update()`, before the "not flying" check, move every piece with gravity, count its `life` down and
   remove the pieces with no life left.
3. Draw each piece as a `'#fb923c'` 3 by 3 square centered on it, and do not draw the lander once it has crashed.

# --task-tr--

1. `let state ...` satırının hemen altına parça listesini ekle:

   ```js
   let debris
   ```

2. `startLevel()` içinde, `state = 'flying'` satırının altına listeyi boşaltan satırı ekle:

   ```js
     state = 'flying'
     debris = []                                                   // ← yeni
   }
   ```

3. `touchdown()` içinde, `state = 'crashed'` satırının hemen altına (en iyi skoru kontrol eden `if`'in **üstüne**)
   patlamayı ekle:

   ```js
     state = 'crashed'
     // A burst of pieces flying out from the wreck.
     for (let i = 0; i < 24; i++) {
       const a = Math.random() * Math.PI * 2
       const speed = 1 + Math.random() * 3
       debris.push({ x: lander.x, y: lander.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2, life: 60 })
     }
     if (score > best) {
   ```

4. `update()`'in en başına, `if (state !== 'flying') return` satırının **üstüne** parçaları hareket ettiren kodu
   ekle:

   ```js
   function update() {
     for (const d of debris) {                                     // ← yeni
       d.vy += gravity                                             // ← yeni
       d.x += d.vx                                                 // ← yeni
       d.y += d.vy                                                 // ← yeni
       d.life -= 1                                                 // ← yeni
     }                                                             // ← yeni
     debris = debris.filter((d) => d.life > 0)                     // ← yeni
     if (state !== 'flying') return
   ```

5. `draw()` içinde `drawLander()` satırını değiştir ve altına parçaları çizen iki satırı ekle:

   ```js
     if (state !== 'crashed') drawLander()                         // ← değişti
     ctx.fillStyle = '#fb923c'                                     // ← yeni
     for (const d of debris) ctx.fillRect(d.x - 1.5, d.y - 1.5, 3, 3)   // ← yeni
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve bilerek çakıl: araç kaybolmalı, turuncu parçalar saçılıp
   düşmeli ve bir saniye içinde sönmeli. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

A crash should burst the lander into 24 pieces.
tr: Bir kaza aracı 24 parçaya ayırmalı.

```js
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
assert.strictEqual(state, 'crashed')
assert.lengthOf(debris, 24)
assert.isTrue(debris.every((d) => d.life <= 60 && Math.hypot(d.vx, d.vy + 2) <= 4.0001))
$.tick(1)
assert.isAtLeast($.rects('#fb923c').length, 20)
assert.isFalse($.screen().some((c) => c.op === 'fill' && c.fill === '#e2e8f0'), 'no lander after a crash')
```

The pieces should fall and disappear after a second.
tr: Parçalar düşmeli ve bir saniye sonra kaybolmalı.

```js
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
const piece = debris[0]
const vy = piece.vy
$.tick(10)
assert.closeTo(piece.vy, vy + 10 * gravity, 1e-9)
$.tick(60)
assert.lengthOf(debris, 0)
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

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity
let level
let score
let state // 'flying', 'landed' or 'crashed'
let debris
let best = Number(localStorage.getItem('lander-best')) || 0
const keys = {}

// Random hills, with one flat stretch: the pad. It gets narrower on later levels.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = level < 3 ? 2 : 1
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

function startLevel() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
  gravity = 0.02 + level * 0.005
  state = 'flying'
  debris = []
}

function reset() {
  level = 1
  score = 0
  startLevel()
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
  if (event.key === ' ') next()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// After a landing, the next level; after a crash, a new game.
function next() {
  if (state === 'landed') {
    level += 1
    startLevel()
  } else if (state === 'crashed') {
    reset()
  }
}

// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'flying') {
    next()
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
    score += 100 * level + lander.fuel
    return
  }
  state = 'crashed'
  // A burst of pieces flying out from the wreck.
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 3
    debris.push({ x: lander.x, y: lander.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2, life: 60 })
  }
  if (score > best) {
    best = score
    localStorage.setItem('lander-best', best)
  }
}

function update() {
  for (const d of debris) {
    d.vy += gravity
    d.x += d.vx
    d.y += d.vy
    d.life -= 1
  }
  debris = debris.filter((d) => d.life > 0)
  if (state !== 'flying') return

  if (keys.ArrowLeft) lander.angle -= SPIN
  if (keys.ArrowRight) lander.angle += SPIN
  if (burning()) {
    // The engine pushes along the direction the lander points: angle 0 is straight up.
    lander.vx += Math.sin(lander.angle) * THRUST
    lander.vy -= Math.cos(lander.angle) * THRUST
    lander.fuel -= 1
  }
  lander.vy += gravity
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

  if (state !== 'crashed') drawLander()
  ctx.fillStyle = '#fb923c'
  for (const d of debris) ctx.fillRect(d.x - 1.5, d.y - 1.5, 3, 3)

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
  ctx.fillStyle = 'white'
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level + '  Score ' + score + '  Best ' + best, canvas.width - 10, 20)

  ctx.textAlign = 'center'
  ctx.font = 'bold 22px sans-serif'
  if (state === 'landed') {
    ctx.fillStyle = '#4ade80'
    ctx.fillText('Landed! Space: next level', canvas.width / 2, 140)
  }
  if (state === 'crashed') {
    ctx.fillStyle = '#f87171'
    ctx.fillText('Crashed. Space: new game', canvas.width / 2, 140)
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
