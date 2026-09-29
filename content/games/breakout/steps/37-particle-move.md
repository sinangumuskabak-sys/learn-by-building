---
title: Move, fall and disappear
title_tr: Hareket et, düş ve kaybol
skills: [game.physics, prog.arrays]
---

# --goal--

Every frame each particle moves, gravity pulls it down a little, and its life counts down. Dead particles are removed
with `filter`.

# --goal-tr--

Parçacıklar canlansın. Her karede her parçacık için: **hareket ettir**, biraz **yerçekimi** ekle, **ömrünü** bir
azalt. Sonra ömrü biten parçacıkları listeden at.

Bu "doğ → güncellen → yok ol" deseni oyunlarda her yerdedir: patlamalar, kıvılcımlar, yağmur, toz, konfeti hep
böyle yapılır. Bu satırlar `update`'in **en başına** gelir; böylece servis sırasında da parçacıklar hareket eder.

# --code--

```js
for (const p of particles) {
  p.x += p.vx
  p.y += p.vy
  p.vy += 0.15
  p.life -= 1
}
particles = particles.filter((p) => p.life > 0)
```

# --meaning--

- Adding `0.15` to `vy` every frame is gravity: particles curve downward.
- `filter` makes a new list with only the particles whose `life` is above 0.
- Without it the list would grow forever and the game would slow down.

# --meaning-tr--

- `p.x += p.vx`, `p.y += p.vy` → top gibi: konuma hızı ekle.
- `p.vy += 0.15` → **yerçekimi**: her karede aşağı doğru hız biraz artar, parçacık bir yay çizerek düşer.
- `p.life -= 1` → ömür bir kare azalır.
- `particles.filter((p) => p.life > 0)` → `filter` listenin yalnız istediğin elemanlarını tutan **yeni bir liste**
  verir: ömrü 0'dan büyük olanlar. Ömrü bitenleri silmeyi unutursan liste sonsuza kadar büyür ve oyun gittikçe
  yavaşlar.

# --task--

Write the lines at the very top of `update`, above the arrow-key lines, followed by an empty line.

# --task-tr--

`update` fonksiyonunun **en başına**, `if (keys.ArrowLeft) ...` satırının üstüne satırları yaz; altında bir boş satır
kalsın. **Çalıştır** ve bir tuğla kır: parçacıklar saçılıp düşmeli.

# --try--

Change `0.15` to `0.6`: the sparks drop like stones. Try `0` too. Put 0.15 back.

# --try-tr--

`0.15`'i `0.6` yap: kıvılcımlar taş gibi düşer. `0`'ı da dene. Sonra 0.15'e geri al.

# --tests--

Particles should move and fall.
tr: Parçacıklar hareket etmeli ve düşmeli.

```js
particles = [{ x: 100, y: 100, vx: 2, vy: -1, life: 30, color: 'red' }]
update()
assert.include(particles[0], { x: 102, y: 99, life: 29 })
assert.closeTo(particles[0].vy, -0.85, 0.001)
```

Particles should disappear after 30 frames.
tr: Parçacıklar 30 kare sonra kaybolmalı.

```js
particles = [{ x: 100, y: 100, vx: 2, vy: -1, life: 30, color: 'red' }]
for (let i = 0; i < 29; i++) update()
assert.lengthOf(particles, 1)
update()
assert.lengthOf(particles, 0)
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
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15
    p.life -= 1
  }
  particles = particles.filter((p) => p.life > 0)

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
