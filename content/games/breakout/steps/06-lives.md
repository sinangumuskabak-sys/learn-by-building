---
title: Serving and lives
title_tr: Servis ve canlar
skills: [game.state, game.input]
---

# --explanation--

Right now a missed ball instantly reappears in the middle, flying, before the player is ready. Real Breakout **holds
the ball on the paddle** until the player launches it, and each miss costs one of three lives.

That is a new state machine:

```
'serve'  --click / Space-->  'playing'  --ball lost, lives left-->  'serve'
                                        --ball lost, no lives-->    'lost'
```

While serving, the ball has no velocity; `update()` just keeps it sitting on top of the paddle, wherever the paddle
moves. Launching gives it a velocity and switches to `'playing'`.

One `launch()` function is called from both the mouse (`pointerdown`) and the keyboard (Space). The arrow keys also
move the paddle, using the "held keys" pattern: events record what is held, the loop moves the paddle every frame.

# --explanation-tr--

Şu an kaçırılan top, oyuncu hazır olmadan ortada uçarak anında yeniden beliriyor. Gerçek Tuğla Kırma, oyuncu fırlatana
kadar **topu raketin üstünde tutar** ve her ıskalama üç candan birine mal olur.

Bu yeni bir durum makinesi:

```
'serve'  --tıklama / Boşluk-->  'playing'  --top kaçtı, can var-->  'serve'
                                           --top kaçtı, can yok-->  'lost'
```

Servis sırasında topun hızı yoktur; `update()` onu yalnızca raket nereye giderse gitsin raketin üstünde oturtur.
Fırlatmak ona bir hız verir ve `'playing'`'e geçer.

Tek bir `launch()` fonksiyonu hem fareden (`pointerdown`) hem klavyeden (Boşluk) çağrılır. Ok tuşları da "basılı
tuşlar" kalıbıyla raketi hareket ettirir: olaylar neyin basılı olduğunu kaydeder, döngü raketi her karede taşır.

# --task--

1. Add `let lives = 3` and `let state` (`'serve'`, `'playing'` or `'lost'`).
2. Change `resetBall()` to set `state = 'serve'` and put the ball on the paddle:
   `{ x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }`.
3. Write `function launch()`: when serving, switch to `'playing'` and give the ball `vx = 3`, `vy = -4`. Call it on
   `pointerdown` on the canvas and when Space is pressed.
4. Track held keys in `keys`; in `update()`, move the paddle 7 px per frame while `ArrowLeft`/`ArrowRight` are held
   and clamp it. Then, while serving, keep the ball on the paddle's center and stop there; only move the ball while
   `'playing'`.
5. When the ball falls out, subtract a life; if none are left, set `state = 'lost'`, otherwise `resetBall()`.
6. Draw `Lives: 3` in the top-left corner (white, `16px sans-serif`); while serving, draw
   `Click or press Space to launch`; when lost, draw `Game Over`.

# --task-tr--

1. `let lives = 3` ve `let state` (`'serve'`, `'playing'` ya da `'lost'`) ekle.
2. `resetBall()`'u `state = 'serve'` yapacak ve topu raketin üstüne koyacak şekilde değiştir:
   `{ x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }`.
3. `function launch()` yaz: servis sırasında `'playing'`'e geçsin ve topa `vx = 3`, `vy = -4` versin. Canvas
   üzerindeki `pointerdown`'da ve Boşluk'a basıldığında çağır.
4. Basılı tuşları `keys`'te izle; `update()` içinde `ArrowLeft`/`ArrowRight` basılıyken raketi karede 7 px taşı ve
   sınırla. Sonra servis sırasında topu raketin ortasında tut ve orada dur; topu yalnızca `'playing'` iken hareket
   ettir.
5. Top düşünce bir can düş; can kalmadıysa `state = 'lost'`, kaldıysa `resetBall()`.
6. Sol üst köşeye `Lives: 3` yaz (beyaz, `16px sans-serif`); servis sırasında `Click or press Space to launch`,
   kaybedince `Game Over` yaz.

# --tests--

The game should start with the ball resting on the paddle.
tr: Oyun top raketin üstünde dururken başlamalı.

```js
assert.strictEqual(lives, 3)
assert.strictEqual(state, 'serve')
assert.deepEqual(ball, { x: 240, y: 363, vx: 0, vy: 0 })
$.tick(30)
assert.deepEqual(ball, { x: 240, y: 363, vx: 0, vy: 0 })
assert.include($.texts(), 'Lives: 3')
assert.include($.texts(), 'Click or press Space to launch')
```

While serving, the ball should ride along with the paddle.
tr: Servis sırasında top raketle birlikte gitmeli.

```js
$.move(100, 300)
$.tick()
assert.strictEqual(ball.x, 100)
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(paddle.x, 130)
assert.strictEqual(ball.x, 170)
```

Clicking or pressing Space should launch the ball.
tr: Tıklamak ya da Boşluk'a basmak topu fırlatmalı.

```js
$.click(240, 300)
assert.strictEqual(state, 'playing')
assert.deepEqual([ball.vx, ball.vy], [3, -4])
$.tick(5)
assert.isBelow(ball.y, 363)
```

Losing the ball should cost a life and go back to serving.
tr: Topu kaçırmak bir cana mal olmalı ve servise dönmeli.

```js
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
draw()
assert.include($.texts(), 'Game Over')
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
let state // 'serve', 'playing' or 'lost'
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

  if (state !== 'lost') {
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
  if (state === 'lost') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, 250)
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
