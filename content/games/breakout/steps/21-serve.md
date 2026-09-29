---
title: Wait on the paddle
title_tr: Rakette bekle
skills: [game.state]
---

# --goal--

A lost ball should not fly off again before the player is ready. We add a `state` variable, and `resetBall()` now puts
the ball on the paddle, standing still, in the `'serve'` state.

# --goal-tr--

Şu an kaçırılan top, oyuncu hazır olmadan ortada belirip uçmaya devam ediyor. Gerçek oyunda top, oyuncu fırlatana
kadar **raketin üstünde bekler**.

Oyunun o anda hangi aşamada olduğunu tek bir değişkende tutacağız: `state` (durum). Her an şu yazılardan tam olarak
biri olacak: `'serve'` (servis, top bekliyor), `'playing'` (oyunda), `'won'` (kazandı), `'lost'` (kaybetti). Son
ikisini daha sonra kullanacağız.

Bu adımdan sonra top rakette **hareketsiz** duracak. Endişelenme: fırlatmayı birkaç adım sonra ekleyeceğiz.

# --code--

```js
let state // 'serve', 'playing', 'won' or 'lost'

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}
```

# --meaning--

- `state` holds which phase the game is in; the comment lists every value it will have.
- `resetBall()` now sets the state to `'serve'` and puts the ball on the middle of the paddle with no velocity.

# --meaning-tr--

- `let state` → oyunun **durumu**. Yanındaki yorum alabileceği bütün değerleri listeliyor.
- `state = 'serve'` → top her sıfırlandığında oyun **servis** durumuna geçer.
- `x: paddle.x + PADDLE_W / 2` → raketin **ortası**.
- `y: PADDLE_Y - BALL_R` → raketin üst yüzünün bir yarıçap üstü: top rakete **oturur** (370 − 7 = 363).
- `vx: 0, vy: 0` → hız yok; top yerinde durur. `update` her karede 0 eklediği için kıpırdamaz.

# --task--

1. Under `let bricks` write `let state` with its comment.
2. In `resetBall`, add `state = 'serve'` and change the `ball` line as shown.

# --task-tr--

1. `let bricks` satırının altına `let state` satırını yorumuyla birlikte yaz.
2. `resetBall` içinde `ball = ...` satırının **üstüne** `state = 'serve'` yaz ve `ball = ...` satırını kodda
   görüldüğü gibi değiştir.
3. **Çalıştır**: top raketin ortasında durmalı.

# --predict--

You move the paddle away. What does the ball do?
- [ ] It moves with the paddle
- [x] It stays where it is, floating in the air
  Its position is set only once, in `resetBall()`. Following the paddle is the next step.
- [ ] It falls down

# --predict-tr--

Raketi kenara çekiyorsun. Top ne yapar?
- [ ] Raketle birlikte gider
- [x] Olduğu yerde, havada asılı kalır
  Konumu yalnız bir kez, `resetBall()` içinde veriliyor. Raketi izlemesi bir sonraki adım.
- [ ] Aşağı düşer

# --tests--

The game should start with the ball resting on the paddle.
tr: Oyun top raketin üstünde dururken başlamalı.

```js
assert.strictEqual(state, 'serve')
assert.deepEqual(ball, { x: 240, y: 363, vx: 0, vy: 0 })
$.tick(30)
assert.deepEqual(ball, { x: 240, y: 363, vx: 0, vy: 0 })
```

A lost ball should come back to rest on the paddle.
tr: Kaçırılan top rakete geri oturmalı.

```js
paddle.x = 100
state = 'playing'
ball = { x: 50, y: 405, vx: 0, vy: 4 }
update()
assert.strictEqual(state, 'serve')
assert.deepEqual(ball, { x: 140, y: 363, vx: 0, vy: 0 })
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
