---
title: Circle meets box
title_tr: Daire kutuyla buluşuyor
skills: [game.collision]
---

# --goal--

Does the round ball touch a rectangular brick? Find the point of the brick closest to the ball's center; they touch
when that point is within one radius.

# --goal-tr--

Topun bir tuğlaya değip değmediğini soran bir fonksiyon yazacağız: `hitsBrick`. Topu da bir kutu gibi düşünebilirdik,
ama o zaman top köşelerde gözle görülür biçimde ıskaladığı tuğlaları da kırardı. Doğru yöntem kısa:

1. Tuğlanın topun merkezine **en yakın noktasını** bul.
2. O nokta merkeze **bir yarıçaptan yakınsa** değiyorlar.

Bu adımda ekranda bir şey değişmeyecek; soruyu soran fonksiyonu hazırlıyoruz.

# --code--

```js
function hitsBrick(brick) {
  // The point of the brick closest to the ball's center; they touch if it is within one radius.
  const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
  const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY
  return dx * dx + dy * dy <= BALL_R * BALL_R
}
```

# --meaning--

- Clamping the center into the brick's rectangle gives the brick's nearest point.
- `dx` and `dy` are the distances from that point to the center.
- By Pythagoras the distance is `√(dx² + dy²)`. Comparing squares gives the same answer without a square root.

# --meaning-tr--

- `clamp(ball.x, brick.x, brick.x + BRICK_W)` → topun merkezini tuğlanın sol ve sağ kenarı arasına sıkıştırır. Top
  tuğlanın solundaysa sonuç sol kenar, üstündeyse merkezin kendi x'i... `nearestY` aynısı dikeyde. İkisi birlikte
  tuğlanın merkeze **en yakın noktası**. (`clamp`'in ikinci işi!)
- `dx`, `dy` → o noktadan topun merkezine yatay ve dikey fark.
- İki nokta arasındaki uzaklık okuldaki **Pisagor** bağıntısıyla bulunur: `√(dx² + dy²)`. Karekök yavaş bir
  işlemdir; iki tarafın **karesini** karşılaştırmak aynı cevabı verir: `dx * dx + dy * dy <= BALL_R * BALL_R`.
- `return` bu karşılaştırmanın sonucunu verir: `true` (değiyor) ya da `false` (değmiyor).

# --task--

Write `hitsBrick` just above `function update() {`, with an empty line between them.

# --task-tr--

`function update() {` satırının **üstüne** `hitsBrick` fonksiyonunu yaz; aralarında bir boş satır kalsın.
**Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

The ball's center is 5 pixels left and 5 pixels above a brick's corner. The radius is 7. Do they touch?
- [ ] Yes, 5 is less than 7
- [x] No
  The real distance is √(25 + 25) ≈ 7.07, a little more than 7.

# --predict-tr--

Topun merkezi bir tuğlanın köşesinin 5 piksel solunda ve 5 piksel üstünde. Yarıçap 7. Değiyorlar mı?
- [ ] Evet, 5 sayısı 7'den küçük
- [x] Hayır
  Gerçek uzaklık √(25 + 25) ≈ 7.07; 7'den biraz fazla.

# --tests--

`hitsBrick()` should be true exactly when the ball reaches the brick.
tr: `hitsBrick()` top tuğlaya tam ulaştığında doğru olmalı.

```js
const brick = { x: 100, y: 100, row: 0, alive: true }
ball = { x: 127, y: 125, vx: 0, vy: 0 }
assert.isTrue(hitsBrick(brick), 'exactly one radius below the bottom face')
ball = { x: 127, y: 126, vx: 0, vy: 0 }
assert.isFalse(hitsBrick(brick))
```

`hitsBrick()` should use the real distance at the corners, not a box.
tr: `hitsBrick()` köşelerde kutuyu değil gerçek uzaklığı kullanmalı.

```js
const brick = { x: 100, y: 100, row: 0, alive: true }
ball = { x: 95, y: 95, vx: 0, vy: 0 }
assert.isFalse(hitsBrick(brick), 'near the corner: the boxes overlap but the circle does not reach')
ball = { x: 96, y: 97, vx: 0, vy: 0 }
assert.isTrue(hitsBrick(brick))
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370
const BALL_R = 7
const COLS = 8
const ROWS = 5
const BRICK_W = 54
const BRICK_H = 18
const GAP = 4
const TOP = 50
const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

let paddle = { x: 200 }
let ball
let bricks

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}

function buildBricks() {
  bricks = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
    }
  }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function hitsBrick(brick) {
  // The point of the brick closest to the ball's center; they touch if it is within one radius.
  const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
  const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY
  return dx * dx + dy * dy <= BALL_R * BALL_R
}

function update() {
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
    ball.vx = -ball.vx
    ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
  }
  if (ball.y - BALL_R < 0) {
    ball.vy = Math.abs(ball.vy)
    ball.y = BALL_R
  }

  const onPaddle =
    ball.vy > 0 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + PADDLE_W
  if (onPaddle) {
    // -1 at the paddle's left end, 0 in the middle, 1 at the right end
    const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)
    ball.vx = offset * 5
    ball.vy = -Math.abs(ball.vy)
    ball.y = PADDLE_Y - BALL_R
  }

  if (ball.y - BALL_R > canvas.height) resetBall()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const brick of bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

buildBricks()
resetBall()
requestAnimationFrame(loop)
```
