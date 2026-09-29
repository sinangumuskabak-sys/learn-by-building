---
title: Readouts
title_tr: Göstergeler
skills: [game.canvas, prog.arrays]
---

# --goal--

Four readouts at the top left show the fuel, the falling speed, the sideways speed and the tilt. Each is green while it
is safe for landing and red when it is not.

# --goal-tr--

Oyuncu kuralları **görebilmeli**. Sol üste dört **gösterge** koyacağız: yakıt, düşme hızı, yana hız ve eğim. Değer
iniş için güvenliyse **yeşil**, değilse **kırmızı**. Gizli kurallar görünür olunca zor bir oyun **adil** hissettirir;
oyuncu neden düştüğünü görür ve öğrenir.

`SAFE`'teki aynı sayılar renkleri de belirleyecek: kurallar hâlâ tek bir yerde.

# --code--

```js
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
```

# --meaning--

- `readouts` is a list of pairs: the text, and whether it is fine.
- `toFixed(1)` writes a number with one decimal; `angle * 180 / Math.PI` turns radians into degrees.
- `forEach(([text, ok], i) => ...)` takes each pair apart into `text` and `ok`; `i` places them 18 pixels apart.

# --meaning-tr--

- `const readouts = [ [...], [...], ... ]` → **çiftlerden** oluşan bir liste: her çift `[yazı, iyi mi]`.
- `lander.vy.toFixed(1)` → sayıyı **tek ondalıkla** yazar: `0.4375` → `'0.4'`.
- `(lander.angle * 180) / Math.PI` → radyanı **dereceye** çevirir (π radyan = 180°). `Math.round` tam sayıya yuvarlar.
- İkinci parçalar kurallar: yakıt 50'den fazla mı, düşme hızı sınırın içinde mi...
- `ctx.font = 'bold 14px monospace'` → her harfi aynı genişlikte bir yazı tipi: sayılar değişirken yazı titremez.
- `readouts.forEach(([text, ok], i) => { ... })` → `[text, ok]` her çifti **iki ada ayırır**. `i` sıra numarası:
  `20 + i * 18` ile satırlar 18 piksel arayla alt alta gelir.
- `ok ? '#4ade80' : '#f87171'` → iyiyse yeşil, değilse kırmızı.

# --task--

In `draw`, above `ctx.textAlign = 'center'`, write the readout lines, followed by an empty line.

# --task-tr--

`draw` içinde `ctx.textAlign = 'center'` satırının **üstüne** gösterge satırlarını yaz; altlarında bir boş satır
kalsın. **Çalıştır**: sol üstte dört gösterge görmelisin. Düşerken `Down`'un kırmızıya döndüğü anı izle.

# --hint--

Each pair is `[text, test]` and ends with a comma; the list closes with `]` on its own line.

# --hint-tr--

Her çift `[yazı, sınama]` biçiminde ve virgülle biter; liste kendi satırında `]` ile kapanır.

# --tests--

The readouts should show the values.
tr: Göstergeler değerleri göstermeli.

```js
lander.vx = 1
lander.angle = 0.05
$.tick(1)
assert.include($.texts(), 'Fuel 400')
assert.include($.texts(), 'Side 1.0')
assert.include($.texts(), 'Tilt 3°')
assert.include($.texts(), 'Down 0.0')
```

The readouts should turn red when a value is not safe.
tr: Göstergeler bir değer güvenli değilken kırmızıya dönmeli.

```js
lander.vx = 1
lander.angle = 0.05
$.tick(1)
const color = (start) => $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith(start)).fill
assert.strictEqual(color('Fuel'), '#4ade80')
assert.strictEqual(color('Side'), '#f87171')
assert.strictEqual(color('Tilt'), '#4ade80')
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
  gravity = 0.025
  state = 'flying'
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
  if (event.key === ' ') next()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function next() {
  if (state !== 'flying') reset()
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
