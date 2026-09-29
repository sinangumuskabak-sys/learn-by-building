---
title: Next level or new game
title_tr: Sonraki bölüm ya da yeni oyun
skills: [game.state]
---

# --goal--

After a landing, Space goes to the next level and keeps the score. After a crash, the game starts over.

# --goal-tr--

Şimdi bölümler gerçekten ilerlesin. İnişten sonra Boşluk **bir sonraki bölüme** geçsin ve puan korunsun. Kazadan sonra
ise oyun **baştan** başlasın. Mesajlar da bunu söylesin.

# --code--

```js
// After a landing, the next level; after a crash, a new game.
function next() {
  if (state === 'landed') {
    level += 1
    startLevel()
  } else if (state === 'crashed') {
    reset()
  }
}

    ctx.fillText('Landed! Space: next level', canvas.width / 2, 140)

    ctx.fillText('Crashed. Space: new game', canvas.width / 2, 140)
```

# --meaning--

- After a landing: one level up, then a new flight (the score stays).
- `else if` checks a second condition only when the first was false: after a crash, `reset()` starts a new game.
- While flying, neither is true and nothing happens.

# --meaning-tr--

- `if (state === 'landed')` → indiysek: `level += 1` ve `startLevel()`. `reset` çağrılmadığı için **puan korunur**.
- `else if (state === 'crashed')` → `else if` "değilse, **şu doğruysa**": ilk koşul yanlışsa ikinciyi sorar.
  Düştüysek `reset()`: 1. bölüm, 0 puan.
- Uçarken ikisi de yanlış: hiçbir şey olmaz.
- Mesajlarda `fly again` yerine `next level` (sonraki bölüm), `try again` yerine `new game` (yeni oyun).

# --task--

1. Replace the body of `next` as shown and write the comment above it.
2. In `draw`, change the two messages.

# --task-tr--

1. `next` fonksiyonunun üstüne yorum satırını yaz; içini kodda görüldüğü gibi değiştir.
2. `draw` içindeki iki mesajda `fly again` yerine `next level`, `try again` yerine `new game` yaz.
3. **Çalıştır**, bir kez in ve Boşluk'a bas: `Level 2` olmalı ve araç biraz daha hızlı düşmeli.

# --tests--

A landing should lead to a harder level and keep the score.
tr: Bir iniş daha zor bir bölüme götürmeli ve puanı korumalı.

```js
ground = Array(13).fill(300)
pad = { x1: 40, x2: 120, y: 300 }

lander = { x: 80, y: 285, vx: 0, vy: 0.5, angle: 0, fuel: 250 }
$.tick(20)
assert.include($.texts(), 'Landed! Space: next level')
$.press(' ')
assert.deepEqual([state, level, score], ['flying', 2, 350])
assert.closeTo(gravity, 0.03, 1e-9)
```

A crash should lead to a new game.
tr: Bir kaza yeni bir oyuna götürmeli.

```js
score = 900
level = 4
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
assert.include($.texts(), 'Crashed. Space: new game')
$.press(' ')
assert.deepEqual([state, level, score], ['flying', 1, 0])
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
