---
title: Hitting the side of a brick
title_tr: Tuğlanın yanına çarpmak
skills: [game.collision]
---

# --goal--

A ball that hits a brick from the side should bounce sideways, not up or down. The ball's center tells us which face
it came through.

# --goal-tr--

Top bir tuğlaya **yandan** çarparsa yukarı-aşağı değil, sağa-sola sekmeli. Hangi yüzden girdiğini nasıl anlarız?

Topun merkezi tuğlanın **yatay aralığındaysa** (tam altında ya da üstündeyse) alt veya üst yüzden girmiştir:
dikey yönü çevir. Değilse bir yana çarpmıştır: yatay yönü çevir.

# --code--

```js
const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
if (throughTopOrBottom) ball.vy = -ball.vy
else ball.vx = -ball.vx
```

# --meaning--

- `throughTopOrBottom` is true when the center is between the brick's left and right edges.
- `else` runs when the `if` condition is false: a side hit flips `vx` instead.

# --meaning-tr--

- `ball.x >= brick.x && ball.x <= brick.x + BRICK_W` → topun merkezi tuğlanın sol ve sağ kenarı **arasında** mı?
  Cevabı `throughTopOrBottom` ("üstten ya da alttan") adına koyuyoruz.
- `if (throughTopOrBottom) ball.vy = -ball.vy` → evetse dikey yönü çevir.
- `else ball.vx = -ball.vx` → `else` "**değilse**" demek: koşul yanlışsa bu satır çalışır ve yatay yön döner.

# --task--

In the `if (brick)` block, replace `ball.vy = -ball.vy` with the three new lines.

# --task-tr--

`if (brick) {` bloğunda `ball.vy = -ball.vy` satırını sil; yerine üç yeni satırı yaz (`brick.alive = false`
satırı kalıyor). **Çalıştır** ve topu tuğlaların yanlarına çarptırmaya çalış.

# --tests--

Hitting the side of a brick should flip the horizontal direction.
tr: Bir tuğlanın yanına çarpmak yatay yönü çevirmeli.

```js
bricks = [{ x: 100, y: 100, row: 0, alive: true }]
ball = { x: 92, y: 109, vx: 3, vy: 0 }
update()
assert.isFalse(bricks[0].alive)
assert.strictEqual(ball.vx, -3)
assert.strictEqual(ball.vy, 0)
```

Hitting a brick from below should still flip the vertical direction.
tr: Tuğlaya alttan çarpmak yine dikey yönü çevirmeli.

```js
bricks = [{ x: 100, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 2, vy: -4 }
update()
assert.strictEqual(ball.vy, 4)
assert.strictEqual(ball.vx, 2)
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
