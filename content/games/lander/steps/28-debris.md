---
title: Burst into pieces
title_tr: Parçalara ayrıl
skills: [game.physics, prog.arrays]
---

# --goal--

A crash that only prints "Crashed" is a letdown. The lander should burst into 24 pieces flying out in random directions.

# --goal-tr--

Yalnız "Crashed" yazan bir kaza hayal kırıklığıdır. Araç **parçalara ayrılıp** etrafa saçılsın ve parçalar geri
düşsün: işte bu bir **an** olur. Bu aynı zamanda en basit **parçacık sistemidir**: her biri kendi konumu, hızı ve
ömrü olan bir sürü minik nesne.

Bu adımda parçaları üretiyoruz: kazada 24 tane, her biri rastgele bir yöne.

# --code--

```js
let debris

  debris = []

  // A burst of pieces flying out from the wreck.
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 3
    debris.push({ x: lander.x, y: lander.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2, life: 60 })
  }
```

# --meaning--

- `a` is a random direction: any angle in a full turn. `speed` is from 1 to 4.
- `cos` and `sin` turn the direction and speed into `vx` and `vy`; `- 2` nudges every piece upward.
- Each piece lives 60 frames (one second).

# --meaning-tr--

- `let debris` → enkaz parçaları; `startLevel` her uçuşta listeyi boşaltır.
- `const a = Math.random() * Math.PI * 2` → rastgele bir **yön**: tam bir tur içinde herhangi bir açı.
- `const speed = 1 + Math.random() * 3` → 1 ile 4 arası rastgele bir hız.
- `Math.cos(a) * speed`, `Math.sin(a) * speed` → yönü ve hızı yatay ve dikey hıza çevirir. (Burada açı sağdan
  ölçülüyor: cos yatay, sin dikey parça.)
- `- 2` → her parçayı biraz **yukarı** iter; patlama yerden fırlamış gibi görünür.
- `life: 60` → her parça 60 kare (1 saniye) yaşar.

# --task--

1. Under `let state ...` write `let debris`.
2. In `startLevel`, under `state = 'flying'`, write `debris = []`.
3. In `touchdown`, under `state = 'crashed'`, write the comment and the `for` loop.

# --task-tr--

1. `let state ...` satırının altına `let debris` yaz.
2. `startLevel` içinde `state = 'flying'` satırının altına `debris = []` yaz.
3. `touchdown` içinde `state = 'crashed'` satırının altına (rekor bloğunun üstüne) yorumu ve `for` döngüsünü yaz.
4. **Çalıştır**: parçaları henüz görmüyorsun; kontroller yeşil olmalı.

# --tests--

A crash should burst the lander into 24 pieces.
tr: Bir kaza aracı 24 parçaya ayırmalı.

```js
assert.deepEqual(debris, [])
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
assert.strictEqual(state, 'crashed')
assert.lengthOf(debris, 24)
assert.isTrue(debris.every((d) => d.life === 60 && d.x === lander.x && d.y === lander.y))
assert.isTrue(debris.every((d) => Math.hypot(d.vx, d.vy + 2) <= 4.0001 && Math.hypot(d.vx, d.vy + 2) >= 0.9999))
```

A landing should not make debris.
tr: Bir iniş enkaz çıkarmamalı.

```js
ground = Array(13).fill(300)
pad = { x1: 40, x2: 120, y: 300 }

lander = { x: 80, y: 285, vx: 0, vy: 0.5, angle: 0, fuel: 100 }
$.tick(20)
assert.strictEqual(state, 'landed')
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
