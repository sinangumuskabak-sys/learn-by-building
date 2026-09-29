---
title: The next ball
title_tr: Sıradaki top
skills: [game.state]
---

# --goal--

A ball that falls out of the bottom is lost; a new one waits in the lane. A weak launch can also roll back down the
lane: once it rests there, it waits to be launched again.

# --goal-tr--

Masanın altındaki boşluktan düşen top **kaybolur** (bu boşluk birazdan paletlerin arası olacak). Yerine kanalda yeni
bir top beklemeli.

Bir de şu durum var: top kanaldan çıkamadan **geri yuvarlanabilir**. Kanalın dibinde durunca onu da yeniden
fırlatılabilir yapmalıyız; yoksa `'playing'` durumunda sonsuza kadar orada kalır.

# --code--

```js
// A ball that rolled back down the lane waits to be launched again.
if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
if (ball.y > canvas.height + R) newBall() // drained: the next ball
```

# --meaning--

- The first check: in the lane (`x > 360`), near its bottom (`y > 550`) and almost still (speed under 0.5).
- The second: the ball is completely below the canvas. Both call `newBall()`, which also sets `'ready'` again.

# --meaning-tr--

- `ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5` → üç koşul, `&&` ("ve") ile: top kanalda
  (`x > 360`), dibine yakın (`y > 550`) **ve** neredeyse duruyor (hızı 0.5'ten küçük). Üçü birden doğruysa
  `newBall()`.
- `ball.y > canvas.height + R` → topun merkezi canvas'ın altından yarıçap kadar da aşağıda: top tamamen görünmez
  oldu, yani düştü.
- İki durumda da `newBall()` topu kanala koyar ve `state`'i yine `'ready'` yapar.

# --task--

In `update`, at the end, under the speed limit's closing `}`, write the comment and the two lines.

# --task-tr--

1. `update` içinde, hız sınırının kapanan `}` satırının **altına** (fonksiyonun sonuna) yorum satırını ve iki satırı
   yaz.
2. **Çalıştır**, fırlat ve topun aşağı düşmesini bekle: kanalda yeni bir top belirmeli.

# --tests--

A drained ball should be replaced by a new one in the lane.
tr: Düşen topun yerine kanalda yeni bir top gelmeli.

```js
launch()
ball = { x: 200, y: 590, vx: 0, vy: 2 }
$.tick(10)
assert.strictEqual(state, 'ready', 'a drained ball is replaced')
assert.deepEqual(ball, { x: 375, y: 570, vx: 0, vy: 0 })
```

A ball that rolled back down the lane should wait again.
tr: Kanaldan geri yuvarlanan top yeniden beklemeli.

```js
launch()
ball = { x: 375, y: 575, vx: 0, vy: 0.1 }
$.tick(30)
assert.strictEqual(state, 'ready', 'a ball back at the bottom of the lane waits again')
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
