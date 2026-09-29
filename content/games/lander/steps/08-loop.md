---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game loop moves the lander by its velocity and redraws the picture, about 60 times a second.

# --goal-tr--

Aracı hareket ettirelim. Bir **oyun döngüsü** saniyede yaklaşık 60 kez iki iş yapar: **güncelle** (aracı hızı kadar
kaydır) ve **çiz**. Aracın `vx`'i 1 olduğu için araç yavaşça sağa kayacak; henüz düşmüyor.

# --code--

```js
function update() {
  lander.x += lander.vx
  lander.y += lander.vy
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `update` adds the velocity to the position every frame.
- `loop` updates, draws, and asks the browser to run it again before the next screen refresh.
- The bottom starts the loop instead of drawing once.

# --meaning-tr--

- `lander.x += lander.vx` → `x`'e `vx`'i **ekle** (`+=`): her karede 1 piksel sağa.
- `lander.y += lander.vy` → aynısı dikeyde (`vy` şimdilik 0).
- `function loop() { ... }` → döngünün bir turu: önce `update()`, sonra `draw()`, sonra
  `requestAnimationFrame(loop)` ile tarayıcıya "ekranı bir sonraki yenileyişinden önce `loop`'u yine çalıştır" de.
- En altta tek seferlik `draw()` yerine `requestAnimationFrame(loop)` → döngüyü başlatır. `loop` parantezsiz:
  "sırası gelince sen çalıştır".

# --task--

1. Write `update` just above `function drawLander() {`, with an empty line between.
2. At the bottom, replace `draw()` with the `loop` function and `requestAnimationFrame(loop)` as shown.

# --task-tr--

1. `function drawLander() {` satırının **üstüne** `update` fonksiyonunu yaz; aralarında bir boş satır kalsın.
2. En alttaki `draw()` satırını sil; `reset()` satırının **üstüne** `loop` fonksiyonunu (altında bir boş satırla),
   `reset()`'in altına da `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**: araç yavaşça sağa kaymalı.

# --predict--

What will the lander do?
- [ ] Fall to the ground
- [x] Slide slowly to the right, at the same height
  `vy` is 0 and nothing changes it yet: there is no gravity.
- [ ] Stay still

# --predict-tr--

Araç ne yapacak?
- [ ] Yere düşecek
- [x] Aynı yükseklikte yavaşça sağa kayacak
  `vy` 0 ve onu değiştiren bir şey yok: henüz yerçekimi yok.
- [ ] Yerinde duracak

# --tests--

The lander should move by its velocity every frame.
tr: Araç her karede hızı kadar ilerlemeli.

```js
$.tick(10)
assert.strictEqual(lander.x, 70)
assert.strictEqual(lander.y, 40)
assert.deepEqual($.screen().find((c) => c.op === 'translate').args, [70, 40])
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
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

function update() {
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
