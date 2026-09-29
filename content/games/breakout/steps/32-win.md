---
title: Win the game
title_tr: Oyunu kazan
skills: [game.state, prog.arrays]
---

# --goal--

The player wins when no brick is left standing. `every` asks exactly that. Then the big message says `You win!`.

# --goal-tr--

Oyunu **kazanmak** da mümkün olmalı: ayakta hiç tuğla kalmadığında. Listeler bu soruyu doğrudan sorabilir:
`every` ("her biri"). Kazanınca ortada `You win!` (kazandın!) yazacak; kaybedince yine `Game Over`.

# --code--

```js
  if (bricks.every((b) => !b.alive)) state = 'won'

if (state === 'won' || state === 'lost') {
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, 250)
```

# --meaning--

- `every` is true only if the arrow function is true for every brick: all of them dead.
- The check runs right after a brick breaks: that is the only moment the answer can change.
- `a ? b : c` is a short "if": `'You win!'` when the state is `'won'`, otherwise `'Game Over'`.

# --meaning-tr--

- `bricks.every((b) => !b.alive)` → her tuğlayı sırayla küçük fonksiyona verir; **hepsi** için cevap doğruysa sonuç
  doğrudur: "bütün tuğlalar kırık mı?". (Tersi `some`: "en az biri için doğru mu?")
- Bu satır bir tuğla kırıldıktan hemen sonra, `if (brick) {` bloğunun sonunda: cevap ancak o anda değişebilir.
- `state === 'won' || state === 'lost'` → iki sondan biri.
- `state === 'won' ? 'You win!' : 'Game Over'` → kısa bir "eğer": "soru `?` evetse şu `:` değilse bu". Durum
  `'won'` ise `'You win!'`, değilse `'Game Over'`.

# --task--

1. In `update`, write the `every` line at the end of the `if (brick)` block, under `else ball.vx = -ball.vx`.
2. In `draw`, change the `lost` block's first line and its `fillText` line as shown.

# --task-tr--

1. `update` içinde `if (brick) {` bloğunun sonuna, `else ball.vx = -ball.vx` satırının altına `every` satırını yaz.
2. `draw` içinde `if (state === 'lost') {` satırını `if (state === 'won' || state === 'lost') {` yap.
3. Aynı bloktaki `ctx.fillText('Game Over', ...)` satırında `'Game Over'` yerine
   `state === 'won' ? 'You win!' : 'Game Over'` yaz.
4. **Çalıştır**: bütün tuğlaları kırmak zaman alır; kontroller yeşilse tamam.

# --try--

To win quickly, write `bricks.length = 1` under the `buildBricks()` call at the bottom: only one brick is left. Win, then delete that line.

# --try-tr--

Hızlı kazanmak için en alttaki `buildBricks()` satırının altına geçici olarak `bricks.length = 1` yaz: tek tuğla kalır. Kazan, sonra o satırı sil.

# --tests--

Breaking the last brick should win the game.
tr: Son tuğlayı kırmak oyunu kazandırmalı.

```js
$.tap(' ')
bricks = [{ x: 100, y: 100, row: 0, alive: true }, { x: 300, y: 100, row: 0, alive: false }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.strictEqual(state, 'won')
draw()
assert.include($.texts(), 'You win!')
```

Breaking a brick while others stand should not win.
tr: Başka tuğlalar dururken bir tuğla kırmak kazandırmamalı.

```js
$.tap(' ')
bricks = [{ x: 100, y: 100, row: 0, alive: true }, { x: 300, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.strictEqual(state, 'playing')
```

Losing should still show `Game Over`.
tr: Kaybetmek yine `Game Over` göstermeli.

```js
state = 'lost'
draw()
assert.include($.texts(), 'Game Over')
assert.notInclude($.texts(), 'You win!')
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
let score = 0
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

buildBricks()
resetBall()
requestAnimationFrame(loop)
```
