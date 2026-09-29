---
title: Small steps and a speed limit
title_tr: Küçük adımlar ve hız sınırı
skills: [game.physics, prog.loops]
---

# --goal--

A fast ball can jump over a thin wall between two frames. So each frame is split into four small steps, and the
speed is capped at `MAX_SPEED`.

# --goal-tr--

Duvarlarımız **ince çizgiler**. Top bir karede 16 piksel giderse, bir karede duvarın önünde, sonrakinde **arkasında**
olabilir; aradaki anı hiç görmeyiz ve top duvardan geçer. Hızlı bir arabanın fotoğrafını saniyede bir çekmek gibi.

Çözüm iki parça:

1. Her kareyi **4 küçük adıma** (`SUB`) bölmek: top her seferinde hızının dörtte biri kadar gider ve her küçük
   adımda duvarlar denenir.
2. Hıza bir **üst sınır** koymak: `MAX_SPEED`. Böylece en hızlı top bile küçük adımda duvarı atlayamaz.

# --code--

```js
const SUB = 4 // physics steps per frame
const MAX_SPEED = 18

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
}

function update() {
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
}
```

# --meaning--

- `step()` is the old `update` with everything divided by `SUB`: a quarter of the gravity and a quarter of the move.
- `for (let i = 0; i < SUB; i++) step()` runs it four times per frame.
- `Math.hypot(vx, vy)` is the ball's speed; if it is above the limit, both parts are scaled down by the same factor,
  so the direction stays the same.

# --meaning-tr--

- `const SUB = 4` → her karede kaç küçük fizik adımı.
- `const MAX_SPEED = 18` → en yüksek hız (piksel/kare).
- `function step() {` → eski `update`'in içi, ama her şey `SUB`'a bölünmüş: yerçekiminin dörtte biri, hareketin
  dörtte biri. Dört küçük adım toplamda yine aşağı yukarı bir kare eder.
- `for (let i = 0; i < SUB; i++) step()` → sayan bir **döngü**: `i` 0'dan başlar, `i < SUB` doğru olduğu sürece
  `step()`'i çağırır, her turda `i++` ile 1 artar. `i` 0, 1, 2, 3: dört tur.
- `const speed = Math.hypot(ball.vx, ball.vy)` → hızın büyüklüğü (yatay ve dikey hızdan Pisagor ile).
- `if (speed > MAX_SPEED) {` → sınırı aşıyorsa:
  - `ball.vx *= MAX_SPEED / speed` → `*=` "şununla çarp". İki hız da **aynı oranla** küçülür; top aynı yöne ama
    tam `MAX_SPEED` hızla gider.

# --task--

1. Under `GRAVITY` write `SUB` and `MAX_SPEED`.
2. Replace the whole `update` function with `step` and the new `update`.

# --task-tr--

1. `const GRAVITY = ...` satırının altına `SUB` ve `MAX_SPEED` satırlarını yaz.
2. `update` fonksiyonunun **tamamını** sil; yerine `step` fonksiyonunu ve yeni `update` fonksiyonunu yaz (aralarında
   bir boş satır).
3. **Çalıştır** ve Boşluk'a bas: top kanaldan çıkıp tepedeki eğriyi dolaşmalı ve masaya düşmeli.

# --hint--

`update` should now only call `step()` in the loop and cap the speed; the moving and the walls are in `step`.

# --hint-tr--

`update` artık yalnız döngüde `step()`'i çağırmalı ve hızı sınırlamalı; hareket ve duvarlar `step`'in içinde.

# --tests--

`step()` should do a quarter of a frame.
tr: `step()` bir karenin dörtte birini yapmalı.

```js
ball = { x: 200, y: 300, vx: 4, vy: 0 }
step()
assert.strictEqual(ball.x, 201)
assert.closeTo(ball.vy, 0.03, 1e-9)
```

The speed should never go over `MAX_SPEED`, and keep its direction.
tr: Hız asla `MAX_SPEED`'i geçmemeli ve yönünü korumalı.

```js
ball = { x: 200, y: 300, vx: 30, vy: -40 }
$.tick(1)
assert.closeTo(Math.hypot(ball.vx, ball.vy), 18, 1e-9)
assert.isBelow(ball.vy, 0, 'still going up')
assert.isAbove(ball.vx, 0, 'and right')
```

A launched ball should go up the lane and round into the table, never through a wall.
tr: Fırlatılan top kanaldan çıkıp masaya dönmeli, asla bir duvarın içinden geçmemeli.

```js
$.press(' ')
let highest = ball.y
let left = false
for (let i = 0; i < 200; i++) {
  $.tick(1)
  highest = Math.min(highest, ball.y)
  if (ball.x < 340) left = true
  assert.isAtLeast(ball.x, 0)
  assert.isAtMost(ball.x, 400)
  assert.isAtLeast(ball.y, 0, 'never through the top')
}
assert.isBelow(highest, 130, 'up the lane to the top')
assert.isTrue(left, 'and round into the table')
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

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
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
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
}

function launch() {
  ball.vy = -16
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
