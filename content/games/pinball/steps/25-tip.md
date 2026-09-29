---
title: Where is the tip?
title_tr: Uç nerede?
skills: [game.canvas, prog.functions]
---

# --goal--

The pivot is fixed; the tip is `FLIPPER_LENGTH` away in the direction of the angle. Cosine and sine turn an angle
into a horizontal and a vertical part. Then each flipper is drawn as a thick blue line from pivot to tip.

# --goal-tr--

Paletin ekseni sabit; peki öbür ucu, **ucu** (tip) nerede? Eksenden, açının gösterdiği yönde `FLIPPER_LENGTH`
kadar ötede. Bir saatin yelkovanı gibi: merkez sabit, ucun yeri açıya göre değişir.

Bir açıyı "ne kadar sağa, ne kadar aşağı"ya çeviren iki matematik fonksiyonu var: **kosinüs** ve **sinüs**. Ucu
bulan küçük bir fonksiyon yazıp paletleri eksenden uca kalın mavi çizgiler olarak çizeceğiz.

# --code--

```js
const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 10
  for (const f of flippers) {
    const t = tip(f)
    ctx.beginPath()
    ctx.moveTo(f.x, f.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
```

# --meaning--

- For an angle `a`, `Math.cos(a)` is how far right and `Math.sin(a)` how far down a one-pixel step in that direction
  goes. Multiplying by the length gives the tip's offset from the pivot.
- `tip` is written as an arrow function stored in a constant; it returns an object `{ x, y }`.
- The drawing loop goes from each pivot to its tip, 10 pixels thick.

# --meaning-tr--

- `Math.cos(açı)` → o yönde 1 piksel gidersen ne kadar **sağa** gidersin (sola ise eksi).
- `Math.sin(açı)` → aynı adımda ne kadar **aşağı** gidersin (yukarı ise eksi).
  - Açı `0` ise cos 1, sin 0: tam sağ. Açı `Math.PI` ise cos -1, sin 0: tam sol.
- `* FLIPPER_LENGTH` → 1 piksellik adımı paletin boyuna büyütür; `f.x +` ve `f.y +` eksenden başlatır.
- `const tip = (f) => ({ ... })` → bir **ok fonksiyonu** bir sabite konmuş: `tip(palet)` diye çağrılır ve ucun
  yerini `{ x, y }` nesnesi olarak döndürür. `function tip(f) { return { ... } }` ile aynı iş, daha kısa.
- Çizimde `for (const f of flippers)` → her palet için ucu bul, eksenden uca 10 piksel kalınlığında mavi çizgi çek.

# --task--

1. Above the `// Push the ball out of a segment...` comment write `tip`, with an empty line after it.
2. In `draw`, under the bumpers' `forEach` block, write the flipper drawing.

# --task-tr--

1. `// Push the ball out of a segment...` yorum satırının **üstüne** `tip` satırını yaz; altında bir boş satır kalsın.
2. `draw` içinde tamponları çizen `forEach` bloğunun kapanan `})` satırının **altına** paletleri çizen satırları yaz.
3. **Çalıştır**: masanın altında iki mavi palet görmelisin.

# --try--

In `FLIPPERS`, give the left flipper `rest: 0` and run: it lies flat. Put `0.45` back.

# --try-tr--

`FLIPPERS` içinde sol palete `rest: 0` ver ve çalıştır: yatay durur. Sonra `0.45`'e geri al.

# --tests--

`tip` should find the far end of a flipper.
tr: `tip` paletin uzak ucunu bulmalı.

```js
assert.deepEqual(tip({ x: 0, y: 0, angle: 0 }), { x: 62, y: 0 })
const down = tip({ x: 10, y: 20, angle: Math.PI / 2 })
assert.closeTo(down.x, 10, 1e-9)
assert.closeTo(down.y, 82, 1e-9, 'a quarter turn points straight down')
```

Both flippers should be drawn from pivot to tip.
tr: İki palet de eksenden uca çizilmeli.

```js
$.tick(1)
const flips = $.screen().filter((c) => c.op === 'stroke' && c.stroke === '#38bdf8')
assert.lengthOf(flips, 2)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
for (const f of flippers) {
  const t = tip(f)
  assert.include(ends, Math.round(t.x) + ',' + Math.round(t.y))
}
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
const FLIPPER_LENGTH = 62
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let state // 'ready' (in the lane) or 'playing'
let score
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  score = 0
  flash = BUMPERS.map(() => 0)
  newBall()
}

const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

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

function hitBumper(b, i) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const d = Math.hypot(dx, dy)
  if (d >= b.r + R) return
  const nx = dx / d
  const ny = dy / d
  ball.x = b.x + nx * (b.r + R)
  ball.y = b.y + ny * (b.r + R)
  // A bumper kicks the ball away, faster than it came.
  const vn = ball.vx * nx + ball.vy * ny
  ball.vx += (-vn + 6) * nx
  ball.vy += (-vn + 6) * ny
  if (flash[i] === 0) score += 100
  flash[i] = 10
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
  BUMPERS.forEach(hitBumper)
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
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
  BUMPERS.forEach((b, i) => {
    ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 10
  for (const f of flippers) {
    const t = tip(f)
    ctx.beginPath()
    ctx.moveTo(f.x, f.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
