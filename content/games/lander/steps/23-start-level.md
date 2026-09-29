---
title: Levels
title_tr: Bölümler
skills: [game.state, prog.functions]
---

# --goal--

The game gets levels. One flight is `startLevel()`: new hills, a new lander, and gravity that grows with the level.
`reset()` now starts a whole new game: level 1, no score.

# --goal-tr--

Oyun **bölümlere** ayrılsın: her başarılı inişten sonra biraz daha zor bir bölüm. Bölüm ve puan **bütün oyuna**
aittir; tepeler ve araç ise **tek bir uçuşa**. Bu yüzden iki fonksiyon olacak:

- `startLevel()` (bölümü başlat) → yeni tepeler, yeni araç, bölüme göre yerçekimi.
- `reset()` → bütün oyunu baştan başlatır: 1. bölüm, 0 puan, sonra `startLevel()`.

Eski `reset`'in adı `startLevel` oluyor.

# --code--

```js
let level
let score

function startLevel() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
  gravity = 0.02 + level * 0.005
  state = 'flying'
}

function reset() {
  level = 1
  score = 0
  startLevel()
}
```

# --meaning--

- The old `reset` is renamed `startLevel`; its gravity now grows by 0.005 per level (0.025 on level 1, as before).
- The new `reset` sets level 1 and score 0, then starts the level.

# --meaning-tr--

- `let level`, `let score` → bölüm ve puan.
- `function startLevel()` → eski `reset`'in yeni adı; içi aynı, yalnız yerçekimi değişiyor.
- `gravity = 0.02 + level * 0.005` → 1. bölümde 0.025 (eskisiyle aynı), 2. bölümde 0.03, 3. bölümde 0.035...
- Yeni `function reset()` → `level = 1`, `score = 0`, sonra `startLevel()`. En alttaki `reset()` çağrısı ve `next`
  aynı kalıyor: yeni oyun demek.

# --task--

1. Above `let state` write `let level` and `let score`.
2. Rename `reset` to `startLevel` and change its gravity line.
3. Under it, leave an empty line and write the new `reset`.

# --task-tr--

1. `let state ...` satırının **üstüne** `let level` ve `let score` yaz.
2. `function reset() {` satırını `function startLevel() {` yap; içindeki `gravity = 0.025` satırını
   `gravity = 0.02 + level * 0.005` yap.
3. `startLevel`'ın kapanış `}`'inin altına bir boş satır bırak ve yeni `reset` fonksiyonunu yaz.
4. **Çalıştır**: oyun eskisi gibi oynanmalı.

# --tests--

A new game should start on level 1 with no score.
tr: Yeni oyun 1. bölümde ve 0 puanla başlamalı.

```js
assert.deepEqual([level, score, state], [1, 0, 'flying'])
assert.closeTo(gravity, 0.025, 1e-9)
```

`startLevel()` should make gravity stronger on later levels.
tr: `startLevel()` sonraki bölümlerde yerçekimini artırmalı.

```js
level = 3
lander.x = 300
startLevel()
assert.closeTo(gravity, 0.035, 1e-9)
assert.strictEqual(lander.x, 60)
assert.strictEqual(level, 3)
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

function startLevel() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
  gravity = 0.02 + level * 0.005
  state = 'flying'
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
