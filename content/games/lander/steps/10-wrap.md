---
title: Around the sides
title_tr: Kenarlardan dolan
skills: [game.physics]
---

# --goal--

A lander that leaves one side of the screen comes back on the other. The remainder operator `%` does it in one line.

# --goal-tr--

Araç ekranın sağından çıkınca **solundan** geri girsin (ve tersi). Bunu tek satırda yapan bir işlem var: `%`,
yani **bölümden kalan**.

# --code--

```js
// Leaving one side brings the lander back on the other.
lander.x = (lander.x + canvas.width) % canvas.width
```

# --meaning--

- `%` gives the remainder: `490 % 480` is 10.
- Adding 480 first keeps negative positions working: `(-3 + 480) % 480` is 477.

# --meaning-tr--

- `%` → bölümden **kalan**: `490 % 480` → 10, `100 % 480` → 100.
- Önce 480 eklemek eksi sayıları da düzeltir: `(-3 + 480) % 480` → 477. Soldan çıkan araç sağdan girer.
- Sonuç her zaman 0 ile 480 arasında.

# --task--

In `update`, under `lander.y += lander.vy`, write the comment and the new line.

# --task-tr--

`update` içinde `lander.y += lander.vy` satırının altına yorumu ve yeni satırı yaz. **Çalıştır**: kontroller yeşil
olmalı.

# --tests--

Leaving the right side should bring the lander back on the left.
tr: Sağdan çıkan araç soldan geri gelmeli.

```js
lander.x = 479.5
$.tick(1)
assert.closeTo(lander.x, 0.5, 1e-9)
```

Leaving the left side should bring it back on the right.
tr: Soldan çıkan araç sağdan geri gelmeli.

```js
lander.x = 0.5
lander.vx = -1
$.tick(1)
assert.closeTo(lander.x, 479.5, 1e-9)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity

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
}

function update() {
  lander.vy += gravity
  lander.x += lander.vx
  lander.y += lander.vy
  // Leaving one side brings the lander back on the other.
  lander.x = (lander.x + canvas.width) % canvas.width
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
