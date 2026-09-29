---
title: A high score
title_tr: Rekor
skills: [game.state]
---

# --goal--

When a game ends with a crash, a score higher than the best is saved in the browser's `localStorage`, and the best is
shown next to the score.

# --goal-tr--

Bir **rekor** tutalım. Oyun bir kazayla bittiğinde puan rekordan yüksekse yeni rekor olsun ve tarayıcıya
**kaydedilsin**: sayfayı yenilesen de kaybolmasın.

Tarayıcının küçük bir kalıcı defteri var: `localStorage`. İçine bir ad altında yazı saklanır ve sayfa kapansa da kalır.

# --code--

```js
let best = Number(localStorage.getItem('lander-best')) || 0

  if (score > best) {
    best = score
    localStorage.setItem('lander-best', best)
  }

  ctx.fillText('Level ' + level + '  Score ' + score + '  Best ' + best, canvas.width - 10, 20)
```

# --meaning--

- `getItem` reads the saved text (or `null`); `Number` turns it into a number; `|| 0` covers the very first game.
- In `touchdown`, after a crash, a better score is saved with `setItem`.
- The top-right text shows the best too.

# --meaning-tr--

- `localStorage.getItem('lander-best')` → `'lander-best'` adıyla saklanan yazıyı okur; hiç yoksa `null` verir.
- `Number(...)` → yazıyı sayıya çevirir. `|| 0` → sonuç boşsa (ilk oyun) 0 kullan.
- `touchdown`'da `state = 'crashed'` satırının altında: puan rekordan yüksekse `best = score` ve
  `localStorage.setItem('lander-best', best)` ile kaydet. Oyun kazayla bittiği için rekor da orada kontrol edilir.
- Sağ üstteki yazı artık rekoru da gösterir: `'Level 2  Score 530  Best 900'`.

# --task--

1. Above `const keys = {}` write the `best` line.
2. In `touchdown`, under `state = 'crashed'`, write the `if (score > best)` block.
3. In `draw`, add `+ '  Best ' + best` to the top-right text.

# --task-tr--

1. `const keys = {}` satırının **üstüne** `best` satırını yaz.
2. `touchdown` içinde `state = 'crashed'` satırının altına `if (score > best)` bloğunu yaz.
3. `draw` içinde sağ üstteki yazıya `+ '  Best ' + best` ekle.
4. **Çalıştır**: sağ üstte rekoru görmelisin. Birkaç puan toplayıp düş, sayfayı yenile: rekor durmalı.

# --tests--

A crash should save the best score.
tr: Bir kaza rekoru kaydetmeli.

```js
score = 900
level = 4
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
assert.strictEqual(state, 'crashed')
assert.strictEqual(best, 900)
assert.strictEqual(localStorage.getItem('lander-best'), '900')
assert.include($.texts(), 'Level 4 Score 900 Best 900')
```

A lower score should not replace the best.
tr: Daha düşük bir puan rekorun yerini almamalı.

```js
best = 2000
score = 300
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
assert.strictEqual(best, 2000)
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
