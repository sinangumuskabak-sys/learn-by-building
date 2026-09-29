---
title: A flickering flame
title_tr: Titreyen alev
skills: [game.canvas]
---

# --goal--

While the engine burns, an orange flame shows under the lander. Its tip jumps a little every frame, so it flickers.

# --goal-tr--

Motor yanarken aracın altında turuncu bir **alev** görünsün. Alevin ucu her karede biraz rastgele uzayıp kısalsın:
böylece **titrer** ve canlı görünür.

Alevi `drawLander` içinde, `rotate`'ten sonra çiziyoruz: araç eğilince alev de onunla birlikte eğilir, hem de hiçbir
hesap yapmadan.

# --code--

```js
if (burning()) {
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.moveTo(-5, 8)
  ctx.lineTo(5, 8)
  ctx.lineTo(0, 16 + Math.random() * 8)
  ctx.fill()
}
```

# --meaning--

- The flame is a triangle under the body: from (-5, 8) and (5, 8) down to a tip between y = 16 and 24.
- It is drawn before the body, inside `save`/`restore`, so it tilts with the lander.

# --meaning-tr--

- `if (burning())` → yalnız motor yanarken.
- Alev bir üçgen: üst köşeleri gövdenin altında `(-5, 8)` ve `(5, 8)`, ucu aşağıda `(0, 16 + Math.random() * 8)`.
- `16 + Math.random() * 8` → ucun yüksekliği her karede 16 ile 24 arasında rastgele: alev **titrer**.
- Gövdeden **önce** çizilir; gövde alevin üst kenarını örter.

# --task--

In `drawLander`, under `ctx.rotate(lander.angle)`, write the flame block.

# --task-tr--

`drawLander` içinde `ctx.rotate(lander.angle)` satırının altına alev bloğunu yaz. **Çalıştır** ve yukarı oku basılı
tut: aracın altında titreyen bir alev görmelisin.

# --try--

Change `* 8` to `* 30`: a wild, long flame. Put 8 back.

# --try-tr--

`* 8` yerine `* 30` yaz: vahşi, uzun bir alev. Sonra 8'e geri al.

# --tests--

A flame should show only while the engine burns.
tr: Alev yalnız motor yanarken görünmeli.

```js
$.tick(1)
assert.isFalse($.screen().some((c) => c.op === 'fill' && c.fill === '#f97316'))
$.press('ArrowUp')
$.tick(1)
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === '#f97316'), 'a flame while burning')
$.release('ArrowUp')
$.tick(1)
assert.isFalse($.screen().some((c) => c.op === 'fill' && c.fill === '#f97316'))
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
