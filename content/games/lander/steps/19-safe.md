---
title: Landing or crashing
title_tr: İniş mi, kaza mı
skills: [game.collision, game.state]
---

# --goal--

A touch is a landing only if everything is right: both feet on the pad, falling slowly, hardly drifting and nearly
upright. The limits live in one object, `SAFE`.

# --goal-tr--

Yere değmek ancak **her şey** yerindeyse bir iniştir:

- iki ayak da **pistin üstünde**,
- **yavaş** düşüyor: karede en fazla 1.2 piksel,
- yana **neredeyse hiç** kaymıyor: en fazla 0.6,
- **dike yakın**: en fazla 0.2 radyan (yaklaşık 11°) eğik.

Biri bile tutmazsa **kaza**. Sınırları tek bir nesnede, `SAFE`'te topluyoruz: kurallar tek bir yerde durur.

# --code--

```js
const SAFE = { vy: 1.2, vx: 0.6, angle: 0.2 } // the most a landing may have

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
```

# --meaning--

- `onPad`: the left foot is right of the pad's start and the right foot left of its end.
- `gentle`: the falling speed, the sideways speed and the tilt are all within `SAFE`. `Math.abs` ignores the sign, so
  drifting left or right (and tilting either way) count the same.
- A landing sets the lander exactly on the pad; anything else is a crash.

# --meaning-tr--

- `const SAFE = { vy: 1.2, vx: 0.6, angle: 0.2 }` → bir inişin en fazla sahip olabileceği değerler.
- `onPad` → sol ayak pistin başından sağda **ve** sağ ayak pistin sonundan solda mı? İki ayak da pistte.
- `gentle` ("yumuşak") → düşme hızı, yana hız ve eğim hepsi sınırın içinde mi?
- `Math.abs(...)` → işareti yok sayar: sola ya da sağa kaymak, sola ya da sağa eğilmek aynı sayılır.
- `if (onPad && gentle)` → ikisi de doğruysa **indi**: `state = 'landed'` ve araç tam pistin üstüne oturtulur
  (`pad.y - 10`, çünkü ayaklar ortanın 10 piksel altında). `return` ile çık.
- Değilse `state = 'crashed'`.

# --task--

1. Above `const FEET` write the `SAFE` constant.
2. Replace the body of `touchdown` with the new lines.

# --task-tr--

1. `const FEET ...` satırının **üstüne** `SAFE` sabitini yaz.
2. `touchdown` fonksiyonunun içindeki tek satırın **üstüne** `onPad`, `gentle` ve `if` bloğunu yaz;
   `state = 'crashed'` en sonda kalsın.
3. **Çalıştır** ve pisti dene: yumuşak bir iniş yapabildin mi? (Henüz mesaj yok; araç duruyorsa ya indin ya düştün.)

# --predict--

You come down on the pad at the right speed, but tilted 15° to the left. What happens?
- [ ] A landing: the speed was fine
- [x] A crash
  15° is about 0.26 radians, more than `SAFE.angle`. Every rule must hold.

# --predict-tr--

Piste doğru hızla iniyorsun ama 15° sola eğiksin. Ne olur?
- [ ] İniş: hız uygundu
- [x] Kaza
  15° yaklaşık 0.26 radyan; `SAFE.angle`'dan fazla. Kuralların hepsi tutmalı.

# --tests--

A gentle, upright touchdown on the pad should be a landing.
tr: Pistte yumuşak ve dik bir temas iniş olmalı.

```js
ground = Array(13).fill(300)
pad = { x1: 40, x2: 120, y: 300 }

lander = { x: 80, y: 285, vx: 0, vy: 0.5, angle: 0.1, fuel: 100 }
$.tick(20)
assert.strictEqual(state, 'landed')
assert.strictEqual(lander.y, 290)
```

Too fast, too tilted, drifting or off the pad should be a crash.
tr: Fazla hızlı, fazla eğik, kayarak ya da pist dışında olmak kaza olmalı.

```js
const tries = [
  { x: 80, vy: 2, vx: 0, angle: 0 },
  { x: 80, vy: 0.5, vx: 0, angle: 0.3 },
  { x: 80, vy: 0.5, vx: 0.8, angle: 0 },
  { x: 125, vy: 0.5, vx: 0, angle: 0 },
]
for (const t of tries) {
  reset()
  ground = Array(13).fill(300)
  pad = { x1: 40, x2: 120, y: 300 }
  lander = { y: 285, fuel: 100, ...t }
  $.tick(30)
  assert.strictEqual(state, 'crashed', JSON.stringify(t))
}
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
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
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
