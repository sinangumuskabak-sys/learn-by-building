---
title: The engine
title_tr: Motor
skills: [game.physics]
---

# --goal--

The engine is under the lander and always pushes the way the lander points. Upright it pushes straight up; tilted,
part of the push goes sideways. `sin` and `cos` split the push into its two parts.

# --goal-tr--

Aracın altında tek bir **motor** var ve hep aracın **baktığı yöne** iter. Dik dururken dümdüz yukarı iter. Eğikken
itkinin bir kısmı **yana** gider; yana gitmenin tek yolu da bu.

Bir açıyı yatay ve dikey parçalara ayırmak için trigonometrinin iki fonksiyonu var: `Math.sin` ve `Math.cos`. Yukarı
ok basılıyken motor çalışacak (**yanma**).

# --code--

```js
const THRUST = 0.1 // speed gained per frame of engine, along the direction the lander points

function burning() {
  return state === 'flying' && keys.ArrowUp
}

  if (burning()) {
    // The engine pushes along the direction the lander points: angle 0 is straight up.
    lander.vx += Math.sin(lander.angle) * THRUST
    lander.vy -= Math.cos(lander.angle) * THRUST
  }
```

# --meaning--

- `burning()` is true while flying with the up arrow held.
- For an angle measured from straight up, `sin` is the sideways part and `cos` the upward part of a push of 1.
- The engine changes the **speed**, not the position: the lander keeps moving after you let go.
- `vy -=` because up is a smaller y.

# --meaning-tr--

- `function burning()` → "motor şu an yanıyor mu?": uçuyorsak **ve** yukarı ok basılıysa `true`. Bu soruyu birkaç
  yerde soracağımız için bir fonksiyona koyduk.
- Dik yukarıdan ölçülen bir açıda, 1 büyüklüğündeki bir itkinin **yan** parçası `Math.sin(açı)`, **yukarı** parçası
  `Math.cos(açı)`'dır:
  - açı 0 (dik) → sin 0, cos 1: hepsi yukarı.
  - açı π/2 (tam yan, 90°) → sin 1, cos 0: hepsi yana.
  - arada → ikisine bölünür.
- `lander.vx += Math.sin(lander.angle) * THRUST` → yana hızı artır.
- `lander.vy -= Math.cos(lander.angle) * THRUST` → aşağı hızı **azalt** (`-=`), çünkü yukarı daha küçük bir `y`.
- Motor **hızı** değiştirir, konumu değil: tuşu bıraksan da araç gitmeye devam eder. Durmak da kalkmak kadar plan
  ister: sağa kayışı durdurmak için sola eğilip yakmalısın.

# --task--

1. Above `const SPIN` write the `THRUST` constant.
2. Above `function touchdown() {`, write `burning`, followed by an empty line.
3. In `update`, under the two arrow lines, write the `if (burning())` block.

# --task-tr--

1. `const SPIN ...` satırının **üstüne** `THRUST` sabitini yaz.
2. `function touchdown() {` satırının **üstüne** `burning` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `update` içinde iki ok satırının altına `if (burning())` bloğunu yaz.
4. **Çalıştır** ve yukarı oku basılı tut: araç yavaşlamalı, sonra yükselmeli. Eğip yakınca yana gitmeli.

# --hint--

Use `+=` for `vx` and `-=` for `vy`; `sin` goes with `vx`, `cos` with `vy`.

# --hint-tr--

`vx` için `+=`, `vy` için `-=` kullan; `sin` `vx` ile, `cos` `vy` ile gider.

# --tests--

The engine should push up against gravity.
tr: Motor yerçekimine karşı yukarı itmeli.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(lander.vy, -0.75, 1e-9)
assert.isTrue(burning())
$.release('ArrowUp')
assert.isFalse(burning())
```

Tilting should turn the push sideways.
tr: Eğilmek itkiyi yana çevirmeli.

```js
lander.angle = Math.PI / 2
lander.vx = 0
lander.vy = 0
$.press('ArrowUp')
$.tick(5)
assert.closeTo(lander.vx, 0.5, 1e-9)
assert.closeTo(lander.vy, 5 * 0.025, 1e-9, 'pointing sideways, gravity is not fought at all')
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

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity
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
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }
  gravity = 0.025
  state = 'flying'
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function burning() {
  return state === 'flying' && keys.ArrowUp
}

function touchdown() {
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
