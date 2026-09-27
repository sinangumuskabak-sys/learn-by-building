---
title: Bouncing off lines
title_tr: Çizgilerden sekmek
skills: [game.physics, game.collision]
---

# --explanation--

How does a round ball bounce off a slanted line? In three steps:

1. **Find the closest point** on the segment to the ball's centre. Project the centre onto the line (`t`, a dot product divided
   by the length squared), then clamp `t` between 0 and 1, so the closest point stays on the segment, at an end if need be.
2. If that point is **nearer than `R`**, the ball overlaps the wall. The direction from the point to the centre is the **normal**
   `n`; push the ball out along it until it just touches.
3. **Reflect** the part of the velocity that goes into the wall: `vn = v · n`, and if it is negative (moving in), take away
   `(1 + bounce) × vn` along `n`. With `bounce = 0.5` the ball comes back at half the speed.

```js
const vn = ball.vx * nx + ball.vy * ny
if (vn < 0) {
  ball.vx -= (1 + bounce) * vn * nx
  ball.vy -= (1 + bounce) * vn * ny
}
```

The same few lines handle vertical walls, slopes and corners, which is why the table is made only of segments.

The table is tilted, so **gravity** pulls the ball gently towards you. A fast ball could pass through a thin wall between two
frames, so, as in the pool game, each frame is split into four smaller steps, and the speed is capped.

For now Space launches the ball up the lane at a fixed speed, and a ball that drains or rolls back down the lane is replaced.

# --explanation-tr--

Yuvarlak bir top eğik bir çizgiden nasıl seker? Üç adımda:

1. Parçanın topun merkezine **en yakın noktasını bul**. Merkezi doğrunun üstüne izdüşür (`t`, uzunluğun karesine bölünmüş bir iç
   çarpım), sonra `t`'yi 0 ile 1 arasında sınırla; böylece en yakın nokta parçanın üstünde, gerekirse bir ucunda kalır.
2. O nokta **`R`'den yakınsa** top duvara biner. Noktadan merkeze yön **normal** `n`'dir; topu onun boyunca yalnızca değene kadar dışarı
   it.
3. Hızın duvara giden kısmını **yansıt**: `vn = v · n` ve negatifse (içeri gidiyorsa) `n` boyunca `(1 + bounce) × vn` çıkar.
   `bounce = 0.5` ile top yarı hızla geri gelir.

```js
const vn = ball.vx * nx + ball.vy * ny
if (vn < 0) {
  ball.vx -= (1 + bounce) * vn * nx
  ball.vy -= (1 + bounce) * vn * ny
}
```

Aynı birkaç satır dikey duvarları, eğimleri ve köşeleri halleder; masanın yalnızca parçalardan yapılmasının sebebi budur.

Masa eğiktir, bu yüzden **yerçekimi** topu nazikçe sana doğru çeker. Hızlı bir top iki kare arasında ince bir duvarın içinden
geçebilir; bu yüzden bilardo oyunundaki gibi her kare dört küçük adıma bölünür ve hız sınırlanır.

Şimdilik Boşluk topu kanal boyunca sabit bir hızla fırlatır ve düşen ya da kanaldan geri yuvarlanan bir topun yerine yenisi gelir.

# --task--

1. Add `GRAVITY = 0.12`, `SUB = 4`, `MAX_SPEED = 18` and `state` (`'ready'` in `newBall()`).
2. Write `hitSegment(x1, y1, x2, y2, bounce)` as described; it returns `true` when the ball touched the segment.
3. Write `step()`: add `GRAVITY / SUB` to `vy`, move by `velocity / SUB`, and collide with every wall (`bounce` 0.5). Write
   `update()`, called before `draw()`: nothing while `'ready'`; otherwise `SUB` steps, then cap the speed at `MAX_SPEED`. A ball
   below the canvas, or resting at the bottom of the lane (`x > 360`, `y > 550`, speed below 0.5), becomes a `newBall()`.
4. Write `launch()`: only while ready, `vy = -16` and `'playing'`. Space and Down launch (`preventDefault()`).

# --task-tr--

1. `GRAVITY = 0.12`, `SUB = 4`, `MAX_SPEED = 18` ve `state` (`newBall()`'da `'ready'`) ekle.
2. `hitSegment(x1, y1, x2, y2, bounce)`'u anlatıldığı gibi yaz; top parçaya değdiğinde `true` döndürür.
3. `step()` yaz: `vy`'ye `GRAVITY / SUB` ekle, `hız / SUB` kadar hareket ettir ve her duvarla çarpıştır (`bounce` 0.5). `draw()`'dan önce
   çağrılan `update()`'i yaz: `'ready'` iken hiçbir şey; değilse `SUB` adım, sonra hızı `MAX_SPEED`'de sınırla. Canvas'ın altındaki ya
   da kanalın dibinde duran (`x > 360`, `y > 550`, hız 0.5'in altında) bir top `newBall()` olur.
4. `launch()` yaz: yalnızca hazırken `vy = -16` ve `'playing'`. Boşluk ve Aşağı fırlatır (`preventDefault()`).

# --tests--

`hitSegment` should push the ball out and bounce it, also at the end of a segment.
tr: `hitSegment` topu dışarı itmeli ve sektirmeli, bir parçanın ucunda da.

```js
ball = { x: 25, y: 300, vx: -5, vy: 0 }
assert.isTrue(hitSegment(20, 470, 20, 120, 0.5))
assert.strictEqual(ball.x, 28, 'pushed out of the wall')
assert.closeTo(ball.vx, 2.5, 1e-9, 'bounced back at half the speed')
ball = { x: 200, y: 300, vx: -5, vy: 0 }
assert.isFalse(hitSegment(20, 470, 20, 120, 0.5), 'far away: nothing')
ball = { x: 20, y: 114, vx: 0, vy: 3 }
assert.isTrue(hitSegment(20, 470, 20, 120, 0.5), 'the end of a segment counts too')
assert.closeTo(ball.y, 112, 1e-9)
```

A launched ball should go up the lane and round into the table, never through a wall.
tr: Fırlatılan bir top kanal boyunca yukarı çıkıp masaya dönmeli, asla bir duvarın içinden geçmemeli.

```js
assert.strictEqual(state, 'ready')
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(ball.vy, -16)
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

A drained ball, or one that rolled back down the lane, should be replaced.
tr: Düşen ya da kanaldan geri yuvarlanan bir topun yerine yenisi gelmeli.

```js
launch()
ball = { x: 200, y: 590, vx: 0, vy: 2 }
for (let i = 0; i < 10; i++) $.tick(1)
assert.strictEqual(state, 'ready', 'a drained ball is replaced')
assert.strictEqual(ball.x, LANE_X)
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

function reset() {
  newBall()
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

reset()
requestAnimationFrame(loop)
```
