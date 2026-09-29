---
title: Three bumpers
title_tr: Üç tampon
skills: [prog.arrays, game.canvas]
---

# --goal--

Bumpers are the round red posts that throw the ball around. Each is a circle `{ x, y, r }`; we list three and draw
them.

# --goal-tr--

Pinball'un en sevilen parçası **tamponlar** (bumper): topa çarpınca onu hızla geri iten kırmızı, yuvarlak direkler.
Önce onları yerleştirip çiziyoruz; çarpışma sonraki adımda.

Her tampon bir daire: merkezi (`x`, `y`) ve yarıçapı (`r`). Üçünü bir listede tutuyoruz: `BUMPERS`.

# --code--

```js
const BUMPERS = [
  { x: 100, y: 160, r: 22 },
  { x: 200, y: 120, r: 22 },
  { x: 280, y: 280, r: 22 },
]

  BUMPERS.forEach((b) => {
    ctx.fillStyle = '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
```

# --meaning--

- `BUMPERS` is a list of objects, one per bumper: centre and radius.
- `BUMPERS.forEach((b) => { ... })` runs the function once for each bumper, with the bumper as `b`.
- Each is drawn as a filled red circle, before the ball so the ball shows on top.

# --meaning-tr--

- `const BUMPERS = [ ... ]` → **nesnelerden oluşan bir liste**. Her nesne bir tampon: `x`, `y` merkezi, `r`
  yarıçapı (22 piksel).
- `BUMPERS.forEach((b) => { ... })` → `forEach` "her biri için": listedeki her tampon için süslü parantez içini
  çalıştırır ve o tamponu `b` adıyla verir. `for (const b of BUMPERS)` ile aynı işi yapar; iki yazımı da
  göreceksin.
- `ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)` → tamponun merkezinde, kendi yarıçapıyla tam bir daire.
- Tamponlar **topun çizgisinden önce** çiziliyor: sonra çizilen üstte görünür, top tamponların üstünden geçerken
  kaybolmasın.

# --task--

1. Under the `WALLS` list write `BUMPERS`.
2. In `draw`, above `ctx.fillStyle = '#e7e5e4'` (the ball), write the `forEach` block.

# --task-tr--

1. `WALLS` listesinin kapanan `]` satırının hemen **altına** `BUMPERS` listesini yaz.
2. `draw` içinde topu çizen `ctx.fillStyle = '#e7e5e4'` satırının **üstüne** `forEach` bloğunu yaz.
3. **Çalıştır**: masada üç kırmızı tampon görmelisin. Top şimdilik onların içinden geçer.

# --try--

Add a fourth bumper, for example `{ x: 150, y: 350, r: 15 }`, and run. Then remove it.

# --try-tr--

Dördüncü bir tampon ekle, örneğin `{ x: 150, y: 350, r: 15 }`, ve çalıştır. Sonra geri sil.

# --tests--

There should be three bumpers of radius 22.
tr: Yarıçapı 22 olan üç tampon olmalı.

```js
assert.lengthOf(BUMPERS, 3)
assert.deepEqual(BUMPERS[0], { x: 100, y: 160, r: 22 })
for (const b of BUMPERS) assert.strictEqual(b.r, 22)
```

Every bumper should be drawn as a red circle, under the ball.
tr: Her tampon, topun altında kırmızı bir daire olarak çizilmeli.

```js
$.tick(1)
const arcs = $.arcs()
for (const b of BUMPERS) assert.deepInclude(arcs, { x: b.x, y: b.y, r: 22, color: '#e11d48' })
assert.strictEqual(arcs[arcs.length - 1].color, '#e7e5e4', 'the ball is drawn last')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const SUB = 4 // physics steps per frame
const MAX_SPEED = 18
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]
const BUMPERS = [
  { x: 100, y: 160, r: 22 },
  { x: 200, y: 120, r: 22 },
  { x: 280, y: 280, r: 22 },
]

let ball // { x, y, vx, vy }
let state // 'ready' (in the lane) or 'playing'

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  const nx = (ball.x - px) / d
  const ny = (ball.y - py) / d
  ball.x = px + nx * R
  ball.y = py + ny * R
  const vn = ball.vx * nx + ball.vy * ny
  if (vn < 0) {
    ball.vx -= (1 + bounce) * vn * nx
    ball.vy -= (1 + bounce) * vn * ny
  }
  return true
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
}

function update() {
  if (state === 'ready') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) newBall() // drained: the next ball
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  BUMPERS.forEach((b) => {
    ctx.fillStyle = '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
