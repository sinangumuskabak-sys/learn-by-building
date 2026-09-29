---
title: Flying or not
title_tr: Uçuyor mu, uçmuyor mu
skills: [game.state]
---

# --goal--

The lander is either flying or already on the ground. A `state` variable says which, and `update` does nothing unless
flying.

# --goal-tr--

Araç ya **uçuyordur** ya da yere inmiştir. Yere indiyse artık hareket etmemeli. Oyunun durumunu bir değişkende
tutuyoruz: `state`. Şimdilik hep `'flying'` (uçuyor); yorum ileride alacağı değerleri de listeliyor: `'landed'`
(indi) ve `'crashed'` (düştü).

`update` en başta soracak: uçmuyorsak hiçbir şey yapma.

# --code--

```js
let state // 'flying', 'landed' or 'crashed'

  state = 'flying'

  if (state !== 'flying') return
```

# --meaning--

- `reset` starts every flight in the `'flying'` state.
- `!==` means "is not equal"; `return` leaves `update` at once, so nothing moves.

# --meaning-tr--

- `let state` → oyunun durumu.
- `state = 'flying'` → `reset` her uçuşu uçarak başlatır.
- `if (state !== 'flying') return` → `!==` "**eşit değil mi?**" diye sorar. Uçmuyorsak `return` ile fonksiyondan
  hemen çık: hiçbir şey hareket etmez.

# --task--

1. Under `let gravity` write `let state` with its comment.
2. In `reset`, under `gravity = 0.025`, write `state = 'flying'`.
3. In `update`, write the `if` as the first line, followed by an empty line.

# --task-tr--

1. `let gravity` satırının altına yorumuyla `let state` yaz.
2. `reset` içinde `gravity = 0.025` satırının altına `state = 'flying'` yaz.
3. `update` içinde en üste `if` satırını yaz; altında bir boş satır kalsın.
4. **Çalıştır**: araç eskisi gibi düşmeli (henüz hep uçuyor).

# --tests--

A new flight should be flying.
tr: Yeni bir uçuş uçuyor durumunda olmalı.

```js
assert.strictEqual(state, 'flying')
```

A lander that is not flying should not move.
tr: Uçmayan araç hareket etmemeli.

```js
state = 'landed'
$.tick(10)
assert.deepEqual([lander.x, lander.y, lander.vy], [60, 40, 0])
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
let state // 'flying', 'landed' or 'crashed'

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

function update() {
  if (state !== 'flying') return

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
