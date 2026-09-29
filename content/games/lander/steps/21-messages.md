---
title: Landed or crashed?
title_tr: İndin mi, düştün mü?
skills: [game.canvas]
---

# --goal--

The player should see the result: a green `Landed!` or a red `Crashed.`, each saying how to go on.

# --goal-tr--

Sonucu oyuncu görsün: iyi bir inişte yeşil `Landed! Space: fly again` (indin! Boşluk: yeniden uç), kazada kırmızı
`Crashed. Space: try again` (düştün. Boşluk: yeniden dene).

# --code--

```js
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
```

# --meaning--

- `textAlign = 'center'` centers the text on the point; `canvas.width / 2` is the middle of the screen.
- Each message is drawn only in its own state, in its own color.

# --meaning-tr--

- `ctx.textAlign = 'center'` → yazı verilen noktaya **ortalanır**. `canvas.width / 2` ekranın ortası.
- `ctx.font = 'bold 22px sans-serif'` → kalın, 22 piksel.
- `ctx.fillText(yazı, x, y)` → yazıyı o noktaya boyar; rengi o anki `fillStyle`.
- Her mesaj yalnız kendi durumunda ve kendi renginde çizilir.

# --task--

In `draw`, under `drawLander()`, leave an empty line and write the message lines.

# --task-tr--

`draw` içinde `drawLander()` satırının altına bir boş satır bırak ve mesaj satırlarını yaz. **Çalıştır**: in ya da
düş; mesajı görmelisin.

# --tests--

A landing should say so.
tr: Bir iniş bunu söylemeli.

```js
ground = Array(13).fill(300)
pad = { x1: 40, x2: 120, y: 300 }

lander = { x: 80, y: 285, vx: 0, vy: 0.5, angle: 0.1, fuel: 100 }
$.tick(20)
assert.include($.texts(), 'Landed! Space: fly again')
```

A crash should say so.
tr: Bir kaza bunu söylemeli.

```js
state = 'crashed'
draw()
assert.include($.texts(), 'Crashed. Space: try again')
assert.notInclude($.texts(), 'Landed! Space: fly again')
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
