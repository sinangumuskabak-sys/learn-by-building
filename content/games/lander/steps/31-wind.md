---
title: "Build it yourself: wind"
title_tr: "Kendin yap: rüzgâr"
skills: [game.physics, game.state]
---

# --goal--

Your game, your rules. Add **wind**: a small sideways push on the lander, changing every few seconds.

# --goal-tr--

Oyun senin, kurallar da! Ay'da hava yok ama oyunumuzda olabilir: **rüzgâr** ekle. Rüzgâr uçarken aracı her karede
biraz **yana** itsin ve birkaç saniyede bir yönünü ya da gücünü değiştirsin. Oyuncu rüzgârın yönünü görebilsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir değişken, bir geri sayım, `Math.random()`, `vx`'e ekleme ve bir
yazı. Kontroller çalıştığında yeşile döner.

# --task--

While flying, push the lander sideways a little every frame (at most 0.02 per frame). Pick a new random wind every
few seconds (at most 5), and show it on the screen with a text that starts with `Wind`.

# --task-tr--

- Uçarken rüzgâr aracın `vx`'ine her karede küçük bir miktar eklesin (karede en fazla 0.02, sola ya da sağa).
- Rüzgâr birkaç saniyede bir (en geç 5 saniyede) rastgele yeniden seçilsin.
- Ekranda `Wind` ile başlayan bir yazı rüzgârı göstersin (örneğin `Wind ←` ya da `Wind →`).

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Keep `wind` and a countdown in two variables. In `update`, after the "not flying" check, count down; at 0 pick a new
random wind and start the countdown again; then add `wind` to `lander.vx`.

# --hint-tr--

Rüzgârı ve bir geri sayımı iki değişkende tut (`let wind = 0`, `let windIn = 0`). `update` içinde, uçmuyorsak çıkan
satırdan sonra: `windIn`'i bir azalt; 0'a inince `wind = Math.random() * 0.02 - 0.01` ile yeni rüzgâr seç ve
`windIn = 180` (3 saniye) yap; sonra `lander.vx += wind`. `draw` içinde `'Wind ' + (wind < 0 ? '←' : '→')` yaz.

# --tests--

The wind should push the lander sideways, gently.
tr: Rüzgâr aracı yavaşça yana itmeli.

```js
gravity = 0
lander.vx = 0
$.tick(1)
const v0 = lander.vx
$.tick(1)
const push = lander.vx - v0
assert.notStrictEqual(push, 0, 'with no engine, only the wind can change vx')
assert.isAtMost(Math.abs(push), 0.02)
```

The wind should change within a few seconds.
tr: Rüzgâr birkaç saniye içinde değişmeli.

```js
gravity = 0
lander.vx = 0
$.tick(1)
const pushes = []
for (let i = 0; i < 300; i++) {
  const v = lander.vx
  $.tick(1)
  pushes.push(lander.vx - v)
}
assert.isAbove(new Set(pushes.map((p) => p.toFixed(9))).size, 1)
```

The wind should be shown on the screen.
tr: Rüzgâr ekranda gösterilmeli.

```js
$.tick(2)
assert.isTrue($.texts().some((t) => t.startsWith('Wind')))
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
let wind = 0 // sideways push per frame
let windIn = 0 // frames until the wind changes
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
  for (const d of debris) {
    d.vy += gravity
    d.x += d.vx
    d.y += d.vy
    d.life -= 1
  }
  debris = debris.filter((d) => d.life > 0)
  if (state !== 'flying') return

  // Wind: a new random push every 3 seconds.
  windIn -= 1
  if (windIn <= 0) {
    wind = Math.random() * 0.02 - 0.01
    windIn = 180
  }
  lander.vx += wind
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

  if (state !== 'crashed') drawLander()
  ctx.fillStyle = '#fb923c'
  for (const d of debris) ctx.fillRect(d.x - 1.5, d.y - 1.5, 3, 3)

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
  ctx.fillText('Wind ' + (wind < 0 ? '←' : '→'), canvas.width - 10, 38)

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
