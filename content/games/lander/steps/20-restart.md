---
title: Fly again
title_tr: Yeniden uç
skills: [game.input, game.state]
---

# --goal--

After a landing or a crash, Space (or a tap) starts a new flight over new hills. The decision lives in one function,
`next()`.

# --goal-tr--

İnişten ya da kazadan sonra **Boşluk** tuşu (ya da ekrana dokunmak) yeni bir uçuş başlatsın: yeni tepeler, yeni bir
araç. "Sırada ne var?" kararını tek bir fonksiyona koyuyoruz: `next` (sonraki). Klavye de dokunuş da onu çağıracak.

# --code--

```js
  if (event.key === ' ') next()

function next() {
  if (state !== 'flying') reset()
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'flying') {
    next()
    return
  }
```

# --meaning--

- Space calls `next()`; `next` starts a new flight only when not flying.
- A tap after the flight calls `next()` too, and `return` stops it from also holding a steering key.

# --meaning-tr--

- `if (event.key === ' ') next()` → Boşluk'a basınca `next()`.
- `function next()` → uçmuyorsak (indiysek ya da düştüysek) `reset()` ile yeni uçuş. Uçarken Boşluk hiçbir şey yapmaz.
- Dokunma dinleyicisinin başındaki blok → uçuş bittiyse dokunuş da `next()` çağırır; `return` ile çıkar ki aynı
  dokunuş bir de eğme ya da yakma tuşu olarak sayılmasın.

# --task--

1. In the `keydown` listener, add `if (event.key === ' ') next()` as its last line.
2. Above the `// Touch: ...` comment, write `next`, followed by an empty line.
3. At the top of the `pointerdown` listener, write the `if (state !== 'flying')` block.

# --task-tr--

1. `keydown` dinleyicisinin son satırı olarak `if (event.key === ' ') next()` yaz.
2. `// Touch: ...` yorumunun **üstüne** `next` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `pointerdown` dinleyicisinin **en başına**, `const rect = ...` satırının üstüne `if (state !== 'flying')` bloğunu
   yaz.
4. **Çalıştır**, bir kez in ya da düş ve Boşluk'a bas: yeni tepelerle yeni bir uçuş başlamalı.

# --tests--

Space should start a new flight after a landing or a crash, and do nothing while flying.
tr: Boşluk iniş ya da kazadan sonra yeni uçuş başlatmalı; uçarken hiçbir şey yapmamalı.

```js
$.tick(5)
$.press(' ')
assert.strictEqual(state, 'flying', 'nothing happens while flying')
assert.notStrictEqual(lander.x, 60)
state = 'crashed'
$.press(' ')
assert.strictEqual(state, 'flying')
assert.deepEqual([lander.x, lander.y, lander.fuel], [60, 40, 400])
```

A tap after a landing should start a new flight without steering.
tr: İnişten sonra dokunmak, yönlendirmeden yeni uçuş başlatmalı.

```js
state = 'landed'
$.pointerDown(20, 100)
assert.strictEqual(state, 'flying')
assert.notOk(keys.ArrowLeft)
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
