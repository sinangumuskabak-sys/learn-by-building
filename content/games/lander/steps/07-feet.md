---
title: Two feet
title_tr: İki ayak
skills: [game.canvas]
---

# --goal--

The lander stands on two small feet, 9 pixels left and right of its middle. We will use the same numbers to check
whether it touches the ground.

# --goal-tr--

Aracın iki küçük **ayağı** olsun: ortasının 9 piksel solunda ve sağında. Bu uzaklığı bir sabite yazıyoruz, çünkü aynı
sayıyı birazdan aracın yere değip değmediğini anlamak için de kullanacağız.

# --code--

```js
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it

  ctx.fillRect(-FEET, 8, 2, 2)
  ctx.fillRect(FEET - 2, 8, 2, 2)
```

# --meaning--

- Each foot is a 2×2 square at y = 8, the bottom of the body; the feet's bottoms are 10 below the middle.
- They are drawn inside `save`/`restore`, so they tilt with the lander.

# --meaning-tr--

- `const FEET = 9` → ayakların ortadan yatay uzaklığı. Yorum da not ediyor: ayakların altı ortanın **10 piksel
  aşağısında** (8 + 2).
- `ctx.fillRect(-FEET, 8, 2, 2)` → sol ayak: 2×2'lik bir kare, gövdenin alt kenarında.
- `ctx.fillRect(FEET - 2, 8, 2, 2)` → sağ ayak; `- 2` onu gövdenin içine doğru hizalar.
- İkisi de `save`/`restore` arasında: araç eğilince ayaklar da onunla eğilir.

# --task--

1. Under `const STEP = ...` write `const FEET = 9` with its comment.
2. In `drawLander`, between `ctx.fill()` and `ctx.restore()`, write the two feet.

# --task-tr--

1. `const STEP = ...` satırının altına yorumuyla `const FEET = 9` yaz.
2. `drawLander` içinde `ctx.fill()` ile `ctx.restore()` satırlarının **arasına** iki ayağı yaz.
3. **Çalıştır**: üçgenin altında iki küçük ayak görmelisin.

# --tests--

The lander should have two 2×2 feet.
tr: Aracın 2×2'lik iki ayağı olmalı.

```js
assert.strictEqual(FEET, 9)
assert.lengthOf($.rects('#e2e8f0').filter((r) => r.w === 2 && r.h === 2), 2)
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

reset()
draw()
```
