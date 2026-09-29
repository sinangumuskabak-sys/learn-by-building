---
title: Three lives
title_tr: Üç can
skills: [game.state]
---

# --goal--

Each lost ball costs one of three lives. With lives left, the ball goes back to the paddle; with none, the game is
`'lost'` and the ball stops.

# --goal-tr--

Oyunun bir bedeli olsun: **üç can**. Topu her kaçırışında bir can gider. Can kaldıysa top rakete döner; kalmadıysa
durum `'lost'` (kaybetti) olur.

Kaybedince top artık hareket etmemeli. Bu yüzden `update`'e bir kural daha ekliyoruz: **yalnız `'playing'`
durumunda** top hareket etsin.

# --code--

```js
let lives = 3

  if (state !== 'playing') return

  if (ball.y - BALL_R > canvas.height) {
    lives -= 1
    if (lives === 0) state = 'lost'
    else resetBall()
  }
```

# --meaning--

- `lives` starts at 3; `lives -= 1` takes one away.
- `if ... else`: with no lives left the game is lost, otherwise the ball goes back to serving.
- `if (state !== 'playing') return` stops `update` in any state other than playing, so a lost ball stays put.

# --meaning-tr--

- `let lives = 3` → can sayısı.
- `if (state !== 'playing') return` → servis bloğunun hemen altında: oyunda değilsek (örneğin kaybettiysek) topu
  hareket ettirme, çık. Bu satır olmasaydı kaybettikten sonra top düşmeye devam eder ve can her karede bir azalırdı:
  -1, -2, -3...
- `lives -= 1` → bir can düş.
- `if (lives === 0) state = 'lost'` → can kalmadıysa oyun biter.
- `else resetBall()` → `else` "**değilse**": can varsa top servise döner.

# --task--

1. Above `let state` write `let lives = 3`.
2. In `update`, right under the serve block's `}`, write `if (state !== 'playing') return`.
3. Replace the last line of `update` with the new `if` block.

# --task-tr--

1. `let state ...` satırının **üstüne** `let lives = 3` yaz.
2. `update` içinde servis bloğunun kapanış `}`'inin hemen altına `if (state !== 'playing') return` yaz.
3. `update`'in son satırını (`if (ball.y - BALL_R > canvas.height) resetBall()`) sil; yerine yeni `if` bloğunu yaz.
4. **Çalıştır** ve topu üç kez kaçır: üçüncüsünde top rakete dönmemeli.

# --hint--

If lives go below zero, the `if (state !== 'playing') return` line is missing or is below `ball.x += ball.vx`.

# --hint-tr--

Canlar sıfırın altına iniyorsa `if (state !== 'playing') return` satırı eksik ya da `ball.x += ball.vx` satırının
altında kalmış.

# --tests--

Losing the ball should cost a life and go back to serving.
tr: Topu kaçırmak bir cana mal olmalı ve servise dönmeli.

```js
assert.strictEqual(lives, 3)
$.tap(' ')
ball = { x: 50, y: 405, vx: 0, vy: 4 }
update()
assert.strictEqual(lives, 2)
assert.strictEqual(state, 'serve')
assert.strictEqual(ball.y, 363)
```

Losing the last life should end the game.
tr: Son canı kaybetmek oyunu bitirmeli.

```js
$.tap(' ')
lives = 1
ball = { x: 50, y: 405, vx: 0, vy: 4 }
update()
assert.strictEqual(lives, 0)
assert.strictEqual(state, 'lost')
$.tap(' ')
assert.strictEqual(state, 'lost', 'launching does nothing after game over')
```

After the game is lost, the ball and the lives should stay put.
tr: Oyun kaybedildikten sonra top ve canlar olduğu gibi kalmalı.

```js
$.tap(' ')
lives = 1
ball = { x: 50, y: 405, vx: 0, vy: 4 }
update()
update()
update()
assert.strictEqual(lives, 0)
assert.strictEqual(ball.y, 409)
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
