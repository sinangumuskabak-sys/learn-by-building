---
title: Tilt
title_tr: Eğil
skills: [game.input]
---

# --goal--

The left and right arrows tilt the lander. Angles are in **radians**: 0.05 per frame, about 3 degrees.

# --goal-tr--

Sol ve sağ ok tuşları aracı **eğsin**. Açılar **radyan** ile ölçülür: tam bir tur 2π (yaklaşık 6.28) radyandır, yani
1 radyan yaklaşık 57 derece. Her karede 0.05 radyan (yaklaşık 3 derece) döneceğiz.

Aracı döndürerek çizen kod zaten var (`rotate`), o yüzden eğim hemen görünecek.

# --code--

```js
const SPIN = 0.05 // radians per frame

  if (keys.ArrowLeft) lander.angle -= SPIN
  if (keys.ArrowRight) lander.angle += SPIN
```

# --meaning--

- While an arrow is held, the angle changes by `SPIN` every frame: left makes it smaller, right bigger.
- On the canvas a positive angle turns clockwise, so the right arrow tilts the lander to the right.

# --meaning-tr--

- `const SPIN = 0.05` → her karedeki dönüş.
- `if (keys.ArrowLeft) lander.angle -= SPIN` → sol ok basılıysa açıyı azalt: araç **sola** eğilir.
- `if (keys.ArrowRight) lander.angle += SPIN` → sağ ok basılıysa açıyı artır: canvas'ta artı açı **saat yönünde**
  döndürür, araç **sağa** eğilir.

# --task--

1. Above `const FEET` write the `SPIN` constant.
2. In `update`, under the `if (state !== 'flying') return` line and its empty line, write the two arrow lines.

# --task-tr--

1. `const FEET ...` satırının **üstüne** `SPIN` sabitini yaz.
2. `update` içinde `if (state !== 'flying') return` satırından ve altındaki boş satırdan sonra iki ok satırını yaz.
3. **Çalıştır**, oyuna tıkla ve sol/sağ okları basılı tut: araç eğilmeli.

# --predict--

You tilt the lander to the right. Does it start moving to the right?
- [ ] Yes, it slides the way it leans
- [x] No, it only tilts
  Tilting changes only the angle. Only the engine (next step) can push it sideways.

# --predict-tr--

Aracı sağa eğiyorsun. Sağa doğru gitmeye başlar mı?
- [ ] Evet, eğildiği yöne kayar
- [x] Hayır, yalnız eğilir
  Eğilmek yalnız açıyı değiştirir. Aracı yana itebilen tek şey motor (bir sonraki adım).

# --tests--

The arrows should tilt the lander.
tr: Oklar aracı eğmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(lander.angle, 0.5, 1e-9)
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(4)
assert.closeTo(lander.angle, 0.3, 1e-9)
assert.closeTo($.screen().find((c) => c.op === 'rotate').args[0], 0.3, 1e-9)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
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
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }
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

function touchdown() {
  state = 'crashed'
}

function update() {
  if (state !== 'flying') return

  if (keys.ArrowLeft) lander.angle -= SPIN
  if (keys.ArrowRight) lander.angle += SPIN
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
