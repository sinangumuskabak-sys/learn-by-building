---
title: Lives and a hint on screen
title_tr: Ekranda canlar ve bir ipucu
skills: [game.canvas]
---

# --goal--

The player should see how many lives are left and, while serving, how to launch. Canvas draws text with `fillText`.

# --goal-tr--

Oyuncu kaç canı kaldığını ve servis sırasında topu nasıl fırlatacağını **görmeli**. Sol üste `Lives: 3` (canlar),
servis sırasında ortaya da `Click or press Space to launch` (fırlatmak için tıkla ya da Boşluk'a bas) yazacağız.

# --code--

```js
ctx.fillStyle = 'white'
ctx.font = '16px sans-serif'
ctx.textAlign = 'left'
ctx.fillText('Lives: ' + lives, 10, 26)

ctx.textAlign = 'center'
if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
```

# --meaning--

- `font` sets the size and typeface; `textAlign` says whether the point is the text's left end or its center.
- `'Lives: ' + lives` joins text and a number: `'Lives: 3'`.
- `fillText(text, x, y)` paints the text at that point. The hint is drawn only while serving.

# --meaning-tr--

- `ctx.font = '16px sans-serif'` → yazı **boyu ve tipi**: 16 piksel, düz bir yazı tipi.
- `ctx.textAlign = 'left'` → verilen nokta yazının **sol ucu** olsun.
- `'Lives: ' + lives` → yazı ile sayıyı **birleştirir**: `lives` 3 ise `'Lives: 3'`. Yazılarda `+` "ucuna ekle"
  demektir.
- `ctx.fillText(yazı, x, y)` → yazıyı o noktaya boyar. (10, 26) sol üst köşeye yakın.
- `ctx.textAlign = 'center'` → bundan sonraki yazılarda nokta yazının **ortası** olsun. `canvas.width / 2` alanın
  ortası: yazı tam ortalanır.
- `if (state === 'serve') ...` → ipucu yalnız servis sırasında görünür.

# --task--

In `draw`, under the ball's `ctx.fill()` line, leave an empty line and write the text lines.

# --task-tr--

`draw` içinde topu çizen bloğun son satırı `ctx.fill()`'in altına bir boş satır bırak ve yazı satırlarını yaz.
**Çalıştır**: sol üstte canlar, ortada ipucu görünmeli; topu fırlatınca ipucu kaybolmalı.

# --hint--

Text is drawn in the current `fillStyle`; without `ctx.fillStyle = 'white'` it takes the ball's color.

# --hint-tr--

Yazı o anki `fillStyle` ile boyanır; `ctx.fillStyle = 'white'` satırını unutursan topun rengini alır.

# --tests--

The lives should be shown in the top-left corner.
tr: Canlar sol üst köşede görünmeli.

```js
$.tick()
assert.include($.texts(), 'Lives: 3')
lives = 2
draw()
assert.include($.texts(), 'Lives: 2')
```

The launch hint should be shown only while serving.
tr: Fırlatma ipucu yalnız servis sırasında görünmeli.

```js
$.tick()
assert.include($.texts(), 'Click or press Space to launch')
$.tap(' ')
$.tick()
assert.notInclude($.texts(), 'Click or press Space to launch')
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
let lives = 3
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
  if (state !== 'playing') return

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

  if (ball.y - BALL_R > canvas.height) {
    lives -= 1
    if (lives === 0) state = 'lost'
    else resetBall()
  }
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

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
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
