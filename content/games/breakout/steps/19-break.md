---
title: Break a brick
title_tr: Tuğla kır
skills: [game.collision, prog.arrays]
---

# --goal--

Every frame, find the first living brick the ball touches. If there is one, it dies and the ball bounces back.

# --goal-tr--

Şimdi asıl iş: top bir tuğlaya değince tuğla **kırılsın** ve top geri seksin.

Önemli bir kural: **bir karede en fazla bir tuğla.** Top aynı anda iki tuğlaya değip iki kez ters dönseydi, iki
dönüş birbirini silerdi ve top duvarı dümdüz delip geçerdi. Bu yüzden yalnız **ilk** değen tuğlayı alacağız.

# --code--

```js
// Break at most one brick per frame, or two flips could cancel out.
const brick = bricks.find((b) => b.alive && hitsBrick(b))
if (brick) {
  brick.alive = false
  ball.vy = -ball.vy
}
```

# --meaning--

- `bricks.find(...)` returns the first brick for which the arrow function returns true, or `undefined`.
- `if (brick)` is true only when a brick was found.
- The brick is marked dead (so it is no longer drawn) and the vertical direction flips.

# --meaning-tr--

- `bricks.find((b) => b.alive && hitsBrick(b))` → "listede, ayakta **ve** topla değen **ilk** tuğlayı bul". `find`
  her tuğlayı sırayla küçük fonksiyona verir (`b` adıyla); cevap ilk kez doğru olunca durur ve o tuğlayı verir.
  Hiçbiri uymazsa "hiçbir şey" (`undefined`) verir.
- `if (brick)` → "bir tuğla bulunduysa". `undefined` yanlış sayılır.
- `brick.alive = false` → tuğla artık kırık. `draw` onu atlayacak.
- `ball.vy = -ball.vy` → top dikeyde geri döner.

# --task--

In `update`, write the block between the paddle check's closing `}` and the last `if`, with an empty line on both
sides.

# --task-tr--

`update` içinde raket kontrolünün kapanış `}`'i ile en alttaki `if (ball.y - BALL_R > canvas.height) ...` satırının
**arasına** bloğu yaz; üstünde ve altında birer boş satır kalsın. **Çalıştır** ve oyna: tuğlalar kırılmalı!

# --hint--

Inside `find` both parts are needed: `b.alive && hitsBrick(b)`. Without `b.alive`, dead bricks keep bouncing the ball.

# --hint-tr--

`find` içinde iki parça da gerekli: `b.alive && hitsBrick(b)`. `b.alive` olmazsa kırık tuğlalar da topu sektirir.

# --tests--

Hitting a brick from below should break it and send the ball back down.
tr: Bir tuğlaya alttan çarpmak onu kırmalı ve topu aşağı geri göndermeli.

```js
bricks = [{ x: 100, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.isFalse(bricks[0].alive)
assert.strictEqual(ball.vy, 4)
```

Only one brick should break per frame, and dead bricks should be ignored.
tr: Karede yalnızca bir tuğla kırılmalı ve kırık tuğlalar görmezden gelinmeli.

```js
bricks = [
  { x: 100, y: 100, row: 0, alive: false },
  { x: 100, y: 100, row: 0, alive: true },
  { x: 100, y: 100, row: 0, alive: true },
]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.deepEqual(bricks.map((b) => b.alive), [false, false, true])
assert.strictEqual(ball.vy, 4)
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
    ball.vy = -ball.vy
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
