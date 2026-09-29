---
title: Touching the ground
title_tr: Yere değmek
skills: [game.collision]
---

# --goal--

When a foot (or the middle) reaches the ground under it, the lander stops. For now every touch counts as a crash;
the rules of a good landing come later.

# --goal-tr--

Araç zeminin içinden geçmesin. Ayaklar ortanın 10 piksel altında. Sol ayağın, ortanın ya da sağ ayağın **altındaki**
zemin yüksekliğini `groundY` ile buluruz. Ayağın `y`'si oraya ulaştıysa araç yere **değmiştir**.

Değince `touchdown` (yere temas) çağrılacak. Şimdilik her temas bir **kaza** sayılıyor; iyi bir inişin kurallarını
birkaç adım sonra yazacağız.

# --code--

```js
function touchdown() {
  state = 'crashed'
}

  const feet = lander.y + 10
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) touchdown()
```

# --meaning--

- `feet` is the y of the bottom of the feet.
- `groundY` gives the ground's height under the left foot, the middle and the right foot. `>=` means the feet reached
  it (y grows downward); `||` means any one of the three is enough.
- `touchdown()` sets the state to `'crashed'`, so `update` stops moving the lander.

# --meaning-tr--

- `const feet = lander.y + 10` → ayakların altının `y`'si.
- `groundY(lander.x - FEET)`, `groundY(lander.x)`, `groundY(lander.x + FEET)` → sol ayağın, ortanın ve sağ ayağın
  altındaki zemin.
- `feet >= ...` → ayak zemine ulaştı mı ya da geçti mi? (`y` aşağı doğru büyür.)
- `||` → "**veya**": üçünden biri yeterli. Yokuşta önce bir ayak değer.
- `touchdown()` → yere temas. Şimdilik durumu `'crashed'` yapıyor; bir önceki adımda yazdığımız satır sayesinde araç
  artık kıpırdamıyor.

# --task--

1. Write `touchdown` just above `function update() {`, with an empty line between.
2. At the end of `update`, leave an empty line and write the two `feet` lines.

# --task-tr--

1. `function update() {` satırının **üstüne** `touchdown` fonksiyonunu yaz; aralarında bir boş satır kalsın.
2. `update`'in sonunda, kenar satırının altına bir boş satır bırak ve `feet` ile başlayan iki satırı yaz. İkinci satır
   uzun; tek satırda yaz.
3. **Çalıştır**: araç zemine değince durmalı.

# --hint--

All three checks go in one `if`, joined with `||`, and it ends with `touchdown()`.

# --hint-tr--

Üç kontrol tek bir `if` içinde, `||` ile bağlı; satır `touchdown()` ile biter.

# --tests--

The lander should stop when its feet touch the ground.
tr: Araç ayakları zemine değince durmalı.

```js
ground = Array(13).fill(300)
$.tick(140)
assert.strictEqual(state, 'flying')
$.tick(1)
assert.strictEqual(state, 'crashed')
const y = lander.y
$.tick(10)
assert.strictEqual(lander.y, y)
```

A foot on a slope should count too.
tr: Yokuştaki bir ayak da sayılmalı.

```js
ground = Array(13).fill(350)
ground[3] = 100 // a peak at x = 120
lander = { x: 111, y: 95, vx: 0, vy: 0, angle: 0 }
$.tick(1)
assert.strictEqual(state, 'crashed', 'the right foot at x = 120 is on the peak')
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity
let state // 'flying', 'landed' or 'crashed'

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

function touchdown() {
  state = 'crashed'
}

function update() {
  if (state !== 'flying') return

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
