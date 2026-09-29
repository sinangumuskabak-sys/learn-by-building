---
title: Fuel
title_tr: Yakıt
skills: [game.state]
---

# --goal--

Fuel makes every burn a decision. The tank holds 400; each frame of engine uses 1, and an empty tank stops the engine.

# --goal-tr--

Sınırsız yakıtla araç havada asılı kalıp rahatça pisti arardı. **Yakıt** sınırlı olunca her yanma bir karar olur. Depo
400 birim; motorun her karesi 1 birim harcar (yaklaşık 7 saniyelik yanma). Depo boşalınca motor çalışmaz.

# --code--

```js
lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }

return state === 'flying' && keys.ArrowUp && lander.fuel > 0

  lander.fuel -= 1
```

# --meaning--

- The lander gets `fuel: 400`.
- `burning()` also needs fuel left, so an empty tank means no push and no flame.
- Every frame of burning uses 1.

# --meaning-tr--

- `fuel: 400` → araç dolu depoyla başlar.
- `&& lander.fuel > 0` → `burning()` artık yakıt da ister. Depo boşsa `false`: ne itki olur ne alev.
- `lander.fuel -= 1` → yanan her kare 1 birim harcar.

# --task--

1. In `reset`, add `fuel: 400` to the lander.
2. In `burning`, add `&& lander.fuel > 0`.
3. In `update`, inside the `if (burning())` block, write `lander.fuel -= 1` at the end.

# --task-tr--

1. `reset` içinde aracın nesnesine `, fuel: 400` ekle.
2. `burning` içindeki satırın sonuna `&& lander.fuel > 0` ekle.
3. `update` içinde `if (burning())` bloğunun sonuna `lander.fuel -= 1` yaz.
4. **Çalıştır**: yakıtı henüz göremiyorsun (göstergeler sonra); kontroller yeşil olmalı.

# --tests--

Burning should use fuel.
tr: Yanmak yakıt harcamalı.

```js
assert.strictEqual(lander.fuel, 400)
$.press('ArrowUp')
$.tick(10)
assert.strictEqual(lander.fuel, 390)
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
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
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
  return state === 'flying' && keys.ArrowUp && lander.fuel > 0
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
