---
title: Moon gravity
title_tr: Ay yerçekimi
skills: [game.physics]
---

# --goal--

On the moon gravity is weak: every frame it adds a little to the falling speed, so the lander drifts down slowly and
speeds up.

# --goal-tr--

Ay'da yerçekimi zayıftır. Yerçekimi konumu değil **hızı** değiştirir: her karede aşağı doğru hıza biraz (`0.025`)
ekler. Böylece araç önce çok yavaş düşer, sonra gittikçe hızlanır. Yana hız ise olduğu gibi kalır: boşlukta onu
yavaşlatacak hava yok.

# --code--

```js
let gravity

  gravity = 0.025

  lander.vy += gravity
```

# --meaning--

- `gravity` is added to `vy` every frame, before the lander moves.
- After 10 frames `vy` is 0.25; the lander has fallen 0.025 × (1 + 2 + ... + 10) pixels.

# --meaning-tr--

- `let gravity` → yerçekimi. Değeri `reset` içinde veriliyor (ileride bölümlere göre değişecek).
- `lander.vy += gravity` → her karede aşağı doğru hıza 0.025 ekle. 10 karede `vy` 0.25 olur.
- Bu satır `update`'in **en başında**: önce hız değişir, sonra araç yeni hızla ilerler.

# --task--

1. Under `let lander` write `let gravity`.
2. In `reset`, under the `lander` line, write `gravity = 0.025`.
3. In `update`, write `lander.vy += gravity` as the first line.

# --task-tr--

1. `let lander` satırının altına `let gravity` yaz.
2. `reset` içinde `lander = ...` satırının altına `gravity = 0.025` yaz.
3. `update` içinde en üste `lander.vy += gravity` yaz.
4. **Çalıştır**: araç kayarak ve hızlanarak düşmeli; sonra zeminin içinden geçip kaybolacak (onu düzelteceğiz).

# --try--

Set `gravity = 0.1`: Earth-like falling. Put 0.025 back.

# --try-tr--

`gravity = 0.1` yap: Dünya'daki gibi hızlı bir düşüş. Sonra 0.025'e geri al.

# --tests--

The lander should fall faster and faster and keep drifting sideways.
tr: Araç gittikçe hızlanarak düşmeli ve yana kaymayı sürdürmeli.

```js
$.tick(10)
assert.closeTo(lander.vy, 0.25, 1e-9)
assert.closeTo(lander.y, 40 + 0.025 * 55, 1e-9)
assert.strictEqual(lander.x, 70)
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
