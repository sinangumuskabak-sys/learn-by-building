---
title: Break into sparks
title_tr: Kıvılcımlara dönüş
skills: [game.canvas]
---

# --goal--

Call `burst` when a brick breaks, and draw every particle as a tiny 4×4 square.

# --goal-tr--

Şimdi parçacıkları devreye sokalım: tuğla kırıldığında `burst(brick)` çağrılsın, `draw` da her parçacığı minik bir
**4×4 kare** olarak çizsin. Tuğlalardan hemen sonra çiziyoruz ki raket ve top onların üstünde kalsın.

# --code--

```js
  burst(brick)

for (const p of particles) {
  ctx.fillStyle = p.color
  ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
}
```

# --meaning--

- `burst(brick)` goes right after `score += 10`, so every broken brick bursts once.
- `p.x - 2, p.y - 2` with size 4 centers the square on the particle's position.

# --meaning-tr--

- `burst(brick)` → `score += 10` satırının altında: her kırılan tuğla bir kez patlar.
- `for (const p of particles)` → her parçacık için...
- `ctx.fillRect(p.x - 2, p.y - 2, 4, 4)` → 4×4'lük bir kare. Sol üst köşesi 2 piksel sol ve yukarıda olduğu için kare
  parçacığın konumuna **ortalanır**.

# --task--

1. In `update`, write `burst(brick)` under `score += 10`.
2. In `draw`, after the brick loop's closing `}`, leave an empty line and write the particle loop.

# --task-tr--

1. `update` içinde `score += 10` satırının altına `burst(brick)` yaz.
2. `draw` içinde tuğla döngüsünün kapanış `}`'inin altına bir boş satır bırak ve parçacık döngüsünü yaz.
3. **Çalıştır** ve bir tuğla kır.

# --predict--

You break a brick. What do the particles do?
- [ ] Fly out and fade away
- [x] Stay frozen in a little clump where the brick was
  Nothing moves them yet: `update` does not touch `particles`. That is the next step.
- [ ] Nothing appears

# --predict-tr--

Bir tuğla kırıyorsun. Parçacıklar ne yapar?
- [ ] Saçılıp solarlar
- [x] Tuğlanın yerinde küçük bir yığın olarak donup kalırlar
  Onları henüz kimse hareket ettirmiyor: `update` `particles`'a dokunmuyor. Bir sonraki adım bu.
- [ ] Hiçbir şey görünmez

# --tests--

Breaking a brick should release 12 particles.
tr: Bir tuğla kırmak 12 parçacık saçmalı.

```js
$.tap(' ')
bricks = [{ x: 100, y: 100, row: 2, alive: true }, { x: 300, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.lengthOf(particles, 12)
assert.include(particles[0], { x: 127, y: 109, color: '#eab308' })
```

Each particle should be drawn as a 4×4 square centered on it.
tr: Her parçacık kendisine ortalanmış 4×4 bir kare olarak çizilmeli.

```js
particles = [{ x: 100, y: 100, vx: 0, vy: 0, life: 30, color: '#ef4444' }]
draw()
assert.deepInclude($.rects('#ef4444'), { x: 98, y: 98, w: 4, h: 4, color: '#ef4444' })
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
let particles
let lives
let score
let state // 'serve', 'playing', 'won' or 'lost'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function newGame() {
  buildBricks()
  particles = []
  lives = 3
  score = 0
  resetBall()
}

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}

function launch() {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }
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

function burst(brick) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: brick.x + BRICK_W / 2,
      y: brick.y + BRICK_H / 2,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * 6 - 3,
      life: 30,
      color: COLORS[brick.row],
    })
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
    score += 10
    burst(brick)
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
    if (bricks.every((b) => !b.alive)) state = 'won'
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

  for (const p of particles) {
    ctx.fillStyle = p.color
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  if (state === 'serve' || state === 'playing') {
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)
  ctx.textAlign = 'right'
  ctx.fillText('Score: ' + score, canvas.width - 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
  if (state === 'won' || state === 'lost') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, 250)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 280)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
