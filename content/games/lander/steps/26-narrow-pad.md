---
title: A narrower pad
title_tr: Daha dar pist
skills: [game.state]
---

# --goal--

From level 3, the pad is only half as wide. One small change, and the game keeps getting harder.

# --goal-tr--

Zorluğun ikinci ayağı: 3. bölümden itibaren pist **yarı yarıya daralsın**. Tek bir satır, ama iniş çok daha fazla
dikkat isteyecek.

# --code--

```js
// Random hills, with one flat stretch: the pad. It gets narrower on later levels.

  const width = level < 3 ? 2 : 1
```

# --meaning--

- Before level 3 the pad is 2 steps (80 pixels) wide, from then on 1 step (40 pixels).

# --meaning-tr--

- `level < 3 ? 2 : 1` → bölüm 3'ten küçükse 2 aralık (80 piksel), değilse 1 aralık (40 piksel).
- Yorum satırına da not düşüyoruz.
- 40 piksellik bir piste iki ayak (18 piksel arayla) hâlâ sığar, ama pay çok az.

# --task--

1. Add `It gets narrower on later levels.` to the comment above `makeGround`.
2. In `makeGround`, change `const width = 2` as shown.

# --task-tr--

1. `makeGround`'ın üstündeki yorumun sonuna ` It gets narrower on later levels.` ekle.
2. `makeGround` içinde `const width = 2` satırını `const width = level < 3 ? 2 : 1` yap.
3. **Çalıştır**: 1. bölümde pist yine geniş olmalı.

# --tests--

From level 3 the pad should be narrower.
tr: 3. bölümden itibaren pist daha dar olmalı.

```js
level = 2
startLevel()
assert.strictEqual(pad.x2 - pad.x1, 80)
level = 3
startLevel()
assert.strictEqual(pad.x2 - pad.x1, 40)
assert.strictEqual(groundY(pad.x1), pad.y)
assert.strictEqual(groundY(pad.x2), pad.y)
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
  ctx.fillStyle = 'white'
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level + '  Score ' + score, canvas.width - 10, 20)

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
