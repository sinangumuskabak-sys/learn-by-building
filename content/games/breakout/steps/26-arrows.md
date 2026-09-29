---
title: Steer with the arrow keys
title_tr: Ok tuşlarıyla sür
skills: [game.input]
---

# --goal--

Every frame, while an arrow key is held, the paddle moves 7 pixels. Then `clamp` keeps it on the screen.

# --goal-tr--

Şimdi not defterine bakıp raketi kaydıralım. Her karede: sol ok basılıysa raket 7 piksel sola, sağ ok basılıysa 7
piksel sağa. Sonra yine `clamp` ile ekranda tutuyoruz.

Bu satırlar `update`'in en başına, servis bloğundan **önce** gelir; böylece servis sırasında da raketi (ve üstündeki
topu) sürebilirsin.

# --code--

```js
if (keys.ArrowLeft) paddle.x -= 7
if (keys.ArrowRight) paddle.x += 7
paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)
```

# --meaning--

- `keys.ArrowLeft` is `true` while the left arrow is held; `-= 7` subtracts 7.
- A key never pressed gives `undefined`, which counts as false.
- `clamp` keeps the paddle between 0 and 400.

# --meaning-tr--

- `if (keys.ArrowLeft) paddle.x -= 7` → sol ok basılıysa `paddle.x`'ten 7 **çıkar** (`-=`, `+=`'nin tersi).
- Hiç basılmamış bir tuşun alanı `undefined`'dır; `if` onu yanlış sayar.
- `paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)` → raket kenarlardan taşmasın.
- 60 kare × 7 piksel = saniyede 420 piksel: raket alanı bir saniyede baştan sona geçer.

# --task--

Write the three lines at the very top of `update`, above the serve block, followed by an empty line.

# --task-tr--

`update` fonksiyonunun **en başına**, `if (state === 'serve') {` satırının üstüne üç satırı yaz; altında bir boş
satır kalsın. **Çalıştır**, oyuna tıkla ve ok tuşlarını basılı tut.

# --try--

Change both 7s to 12: a nervous, fast paddle. Put 7 back.

# --try-tr--

İki 7'yi de 12 yap: sinirli, hızlı bir raket. Sonra 7'ye geri al.

# --tests--

While serving, the ball should ride along with an arrow-driven paddle.
tr: Servis sırasında top, okla sürülen raketle gitmeli.

```js
$.move(100, 300)
$.tick()
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(paddle.x, 130)
assert.strictEqual(ball.x, 170)
```

The arrow keys should not push the paddle off the screen.
tr: Ok tuşları raketi ekrandan çıkarmamalı.

```js
$.press('ArrowLeft')
$.tick(60)
assert.strictEqual(paddle.x, 0)
$.release('ArrowLeft')
$.press('ArrowRight')
$.tick(90)
assert.strictEqual(paddle.x, 400)
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
const keys = {}

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
canvas.addEventListener('pointerdown', launch)

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') launch()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
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
  if (keys.ArrowLeft) paddle.x -= 7
  if (keys.ArrowRight) paddle.x += 7
  paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)

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
