---
title: Play again
title_tr: Yeniden oyna
skills: [game.state, game.input]
---

# --goal--

After winning or losing, the same click or Space starts a new game. A small line under the message tells the player.

# --goal-tr--

İki son (`'won'` ve `'lost'`) aynı kapıya çıksın: bir tıklama ya da Boşluk **yeni bir oyun** başlatsın. Tıklama ve
Boşluk zaten `launch`'u çağırıyor; o hâlde işi `launch`'a veriyoruz. Büyük mesajın altına da küçük bir satır
ekliyoruz: `Click to play again` (yeniden oynamak için tıkla).

# --code--

```js
function launch() {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }

    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 280)
```

# --meaning--

- At the top of `launch`: if the game is over, start a new one and stop there (so it is not launched at once).
- The small line goes under the big message, back in the 16-pixel font.

# --meaning-tr--

- `launch`'un en başında: oyun bittiyse `newGame()` ile yenisini başlat ve `return` ile çık. Böylece aynı tıklama topu
  hemen fırlatmaz; yeni oyun servisle başlar.
- `ctx.font = '16px sans-serif'` → büyük başlıktan sonra yazıyı yeniden küçült.
- `ctx.fillText('Click to play again', canvas.width / 2, 280)` → mesajın 30 piksel altına, ortaya.

# --task--

1. At the top of `launch`, above `if (state !== 'serve') return`, write the new `if` block.
2. In `draw`, inside the won/lost block, write the two lines under the big message.

# --task-tr--

1. `launch` fonksiyonunun **en başına**, `if (state !== 'serve') return` satırının üstüne yeni `if` bloğunu yaz.
2. `draw` içinde, kazan/kaybet bloğunda büyük mesajı yazan `ctx.fillText(state === 'won' ? ...)` satırının altına iki
   satırı yaz.
3. **Çalıştır**, üç topu da kaçır ve tıkla: yeni bir oyun başlamalı.

# --predict--

Why is there a `return` after `newGame()`?
- [x] So the same click does not launch the ball right away
  Without it, `newGame()` sets `'serve'` and the next lines would launch the ball at once.
- [ ] Because `newGame()` must not run twice
- [ ] It is not needed; it just looks tidy

# --predict-tr--

`newGame()`'den sonra neden `return` var?
- [x] Aynı tıklama topu hemen fırlatmasın diye
  O olmasaydı `newGame()` durumu `'serve'` yapar, alttaki satırlar da topu anında fırlatırdı.
- [ ] `newGame()` iki kez çalışmasın diye
- [ ] Gerekmiyor, sadece düzgün görünüyor

# --tests--

Clicking after winning should start a new game.
tr: Kazandıktan sonra tıklamak yeni bir oyun başlatmalı.

```js
state = 'won'
score = 400
lives = 1
bricks = []
$.click(240, 300)
assert.strictEqual(state, 'serve')
assert.strictEqual(score, 0)
assert.strictEqual(lives, 3)
assert.lengthOf(bricks, 40)
```

Pressing Space after losing should start a new game too.
tr: Kaybettikten sonra Boşluk'a basmak da yeni bir oyun başlatmalı.

```js
state = 'lost'
lives = 0
$.tap(' ')
assert.strictEqual(state, 'serve')
assert.strictEqual(lives, 3)
```

The end screen should say how to play again.
tr: Bitiş ekranı nasıl yeniden oynanacağını söylemeli.

```js
state = 'lost'
draw()
assert.include($.texts(), 'Click to play again')
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
