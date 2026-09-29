---
title: Click or press Space
title_tr: Tıkla ya da Boşluk'a bas
skills: [game.input]
---

# --goal--

A click (or tap) on the canvas and the Space key both call the same `launch` function.

# --goal-tr--

Şimdi `launch`'u oyuncuya bağlayalım: canvas'a **tıklamak** (telefonda dokunmak) ya da **Boşluk** tuşuna basmak
topu fırlatsın. İki ayrı yol, tek bir fonksiyon. Oyun yeniden oynanabilir hâle geliyor!

# --code--

```js
canvas.addEventListener('pointerdown', launch)

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') launch()
})
```

# --meaning--

- `pointerdown` fires when the canvas is clicked or touched. We pass `launch` itself (no `()`), to be called then.
- `keydown` fires on the whole page when a key goes down; `event.key` is `' '` for Space.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', launch)` → canvas'a basıldığında (fare tıklaması ya da dokunma) `launch`'u
  çalıştır. `launch`'u **parantezsiz** veriyoruz: "şimdi çalıştır" değil, "basılınca sen çalıştır".
- `document.addEventListener('keydown', ...)` → **sayfanın tamamında** bir tuşa basıldığında çalışır.
- `event.key === ' '` → basılan tuş **Boşluk** mu? Boşluk tuşunun adı tırnak içinde tek bir boşluktur.

# --task--

Write the lines right under the closing `})` of the `pointermove` listener.

# --task-tr--

`pointermove` dinleyicisinin kapanış `})`'inin **hemen altına** `pointerdown` satırını, bir boş satırdan sonra da
`keydown` dinleyicisini yaz. **Çalıştır**, sonra oyuna tıkla: top fırlamalı. Kaçırınca rakete geri dönmeli.

# --hint--

Write `' '` with exactly one space between the quotes.

# --hint-tr--

`' '` yazarken tırnakların arasında tam olarak **bir** boşluk olsun.

# --tests--

Clicking the canvas should launch the ball.
tr: Canvas'a tıklamak topu fırlatmalı.

```js
$.click(240, 300)
assert.strictEqual(state, 'playing')
assert.deepEqual([ball.vx, ball.vy], [3, -4])
```

Pressing Space should launch the ball; other keys should not.
tr: Boşluk'a basmak topu fırlatmalı; başka tuşlar fırlatmamalı.

```js
$.tap('a')
assert.strictEqual(state, 'serve')
$.tap(' ')
assert.strictEqual(state, 'playing')
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
canvas.addEventListener('pointerdown', launch)

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') launch()
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
