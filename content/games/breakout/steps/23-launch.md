---
title: Launch the ball
title_tr: Topu fırlat
skills: [game.state]
---

# --goal--

`launch()` sends the waiting ball off: the state becomes `'playing'` and the ball gets its velocity. It only works
while serving.

# --goal-tr--

Bekleyen topu yola çıkaracak fonksiyonu yazıyoruz: `launch` (fırlat). Durumu `'playing'` yapıp topa hızını verecek.
Ama yalnız **servis sırasında**: oyun sürerken bir daha fırlatmak topu tuhaf biçimde yeniden yönlendirirdi.

Bu adımda fonksiyonu yazıyoruz; tıklama ve Boşluk tuşuna bir sonraki adımda bağlayacağız.

# --code--

```js
function launch() {
  if (state !== 'serve') return
  state = 'playing'
  ball.vx = 3
  ball.vy = -4
}
```

# --meaning--

- `!==` means "is not equal". If we are not serving, `return` leaves at once and nothing happens.
- Otherwise the state becomes `'playing'` and the ball gets the velocity it used to start with.

# --meaning-tr--

- `if (state !== 'serve') return` → `!==` "**eşit değil mi?**" diye sorar. Servis durumunda değilsek hiçbir şey
  yapmadan çık.
- `state = 'playing'` → artık oyundayız. `update`'in başındaki servis bloğu bundan sonra atlanır.
- `ball.vx = 3`, `ball.vy = -4` → top eskisi gibi sağa ve yukarı fırlar.

# --task--

Leave an empty line under `resetBall` and write `launch`.

# --task-tr--

`resetBall` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve `launch` fonksiyonunu yaz. **Çalıştır**:
ekranda bir şey değişmez, çünkü henüz kimse `launch()`'u çağırmıyor.

# --tests--

`launch()` should start the game and send the ball off.
tr: `launch()` oyunu başlatmalı ve topu yola çıkarmalı.

```js
launch()
assert.strictEqual(state, 'playing')
assert.deepEqual([ball.vx, ball.vy], [3, -4])
$.tick(5)
assert.isBelow(ball.y, 363)
```

`launch()` should do nothing while the ball is already flying.
tr: Top zaten uçarken `launch()` hiçbir şey yapmamalı.

```js
launch()
ball.vx = 1
launch()
assert.strictEqual(ball.vx, 1)
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
let state // 'serve', 'playing', 'won' or 'lost'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}

function launch() {
  if (state !== 'serve') return
  state = 'playing'
  ball.vx = 3
  ball.vy = -4
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
  if (state === 'serve') {
    ball.x = paddle.x + PADDLE_W / 2
    return
  }

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

  // Break at most one brick per frame, or two flips could cancel out.
  const brick = bricks.find((b) => b.alive && hitsBrick(b))
  if (brick) {
    brick.alive = false
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
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
