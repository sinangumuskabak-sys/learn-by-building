---
title: One function for a new game
title_tr: Yeni oyun için tek fonksiyon
skills: [prog.functions, game.state]
---

# --goal--

Starting a game means: build the wall, refill the lives, zero the score, serve. We collect all of it in `newGame()`
and use it at startup.

# --goal-tr--

Yeni bir oyun başlatmak birkaç iş demek: duvarı yeniden kur, canları doldur, puanı sıfırla, servise geç. Hepsini tek
bir fonksiyonda toplayacağız: `newGame`. Oyunun en başında da onu çağıracağız; böylece ilk oyun ile onuncu oyun
**aynı koddan** başlar ve birbirinden farklı başlayamaz.

Canlar ve puan artık ilk değerlerini `newGame`'den alacak.

# --code--

```js
let lives
let score

function newGame() {
  buildBricks()
  lives = 3
  score = 0
  resetBall()
}

newGame()
requestAnimationFrame(loop)
```

# --meaning--

- `lives` and `score` are declared without values; `newGame()` sets them.
- `newGame` calls `buildBricks`, which is written further down. That is fine: what matters is that every function is
  defined by the time `newGame()` actually runs, at the bottom.
- At the bottom, `newGame()` replaces the separate `buildBricks()` and `resetBall()` calls.

# --meaning-tr--

- `let lives`, `let score` → artık **değersiz** tanımlanıyor; değerlerini `newGame()` veriyor.
- `function newGame() { ... }` → dört işi sırayla yapar: duvar, canlar, puan, servis.
- `newGame`, kendisinden daha **aşağıda** yazılmış `buildBricks()`'i çağırıyor; bu sorun değil. Önemli olan,
  `newGame()` **çalıştırıldığı** anda (en alttaki çağrıda) bütün fonksiyonların tanımlanmış olması.
- En alttaki `newGame()` → ayrı ayrı `buildBricks()` ve `resetBall()` çağrılarının yerini alır.

# --task--

1. Remove `= 3` from `let lives` and `= 0` from `let score`.
2. Leave an empty line under `clamp` and write `newGame`.
3. At the bottom, replace `buildBricks()` and `resetBall()` with `newGame()`.

# --task-tr--

1. `let lives = 3` satırından `= 3`'ü, `let score = 0` satırından `= 0`'ı sil.
2. `clamp` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve `newGame` fonksiyonunu yaz.
3. En alttaki `buildBricks()` ve `resetBall()` satırlarını sil; yerlerine `newGame()` yaz.
4. **Çalıştır**: oyun eskisi gibi başlamalı.

# --hint--

If the game does not start, check that the bottom has `newGame()` above `requestAnimationFrame(loop)`.

# --hint-tr--

Oyun başlamıyorsa en altta `requestAnimationFrame(loop)` satırının üstünde `newGame()` olduğundan emin ol.

# --tests--

`newGame()` should rebuild the wall, refill the lives and zero the score.
tr: `newGame()` duvarı yeniden kurmalı, canları doldurmalı ve puanı sıfırlamalı.

```js
state = 'lost'
lives = 0
score = 70
bricks = []
newGame()
assert.strictEqual(state, 'serve')
assert.strictEqual(lives, 3)
assert.strictEqual(score, 0)
assert.lengthOf(bricks, 40)
```

The game should start the same way as before.
tr: Oyun eskisi gibi başlamalı.

```js
assert.strictEqual(lives, 3)
assert.strictEqual(score, 0)
assert.strictEqual(state, 'serve')
assert.lengthOf(bricks, 40)
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
let lives
let score
let state // 'serve', 'playing', 'won' or 'lost'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function newGame() {
  buildBricks()
  lives = 3
  score = 0
  resetBall()
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
    score += 10
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
