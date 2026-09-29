---
title: "Build it yourself: tough bricks"
title_tr: "Kendin yap: sağlam tuğlalar"
skills: [game.state, game.collision]
---

# --goal--

Your game, your rules. Make the top row tougher: its bricks need two hits. Until the first hit they look darker.

# --goal-tr--

Oyun senin, kurallar da! En üst sırayı **sağlamlaştır**: o sıradaki tuğlalar **iki vuruşta** kırılsın. İlk vuruşa
kadar daha **koyu** bir renkte görünsünler; ilk vuruştan sonra normal kırmızılarına dönsünler.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: tuğla nesnesine yeni bir alan, `-=`, `if`, `? :`... Kontroller
çalıştığında yeşile döner.

# --task--

Give the top-row bricks two hit points: the first hit leaves them standing (the ball still bounces), the second breaks
them. Draw an unhit top-row brick in a darker color than `COLORS[0]`. Other rows still break with one hit.

# --task-tr--

- En üst sıradaki (`row` 0) tuğlalar ilk vuruşta **kırılmasın**; top yine seksin.
- İkinci vuruşta kırılsınlar (puan ve parçacıklar da o zaman gelsin).
- Hiç vurulmamış üst sıra tuğlası `COLORS[0]`'dan **farklı, daha koyu** bir renkte çizilsin (örneğin `'#7f1d1d'`);
  bir kez vurulunca `COLORS[0]` ile çizilsin.
- Öteki sıralar eskisi gibi tek vuruşta kırılsın.

Değiştireceğin yerler `buildBricks`, `update` ve `draw`. Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Add a hit counter to each brick in `buildBricks` (2 for the top row, 1 for the rest). In `update`, subtract one and
only break the brick when it reaches 0; the bounce happens either way.

# --hint-tr--

`buildBricks` içinde her tuğlaya bir vuruş sayacı ekle, örneğin `hits: row === 0 ? 2 : 1`. `update` içinde tuğla
bulununca sayacı bir azalt; tuğlayı (puan ve `burst` ile birlikte) yalnız sayaç 0 olunca kır, sekme her durumda olsun.
`draw` içinde renk için `brick.hits === 2 ? '#7f1d1d' : COLORS[brick.row]` gibi bir seçim kullanabilirsin.

# --tests--

A top-row brick should need two hits.
tr: En üst sıradaki bir tuğla iki vuruş istemeli.

```js
$.tap(' ')
bricks = bricks.filter((b) => b.row === 0)
const brick = bricks[0]
ball = { x: 37, y: 79, vx: 0, vy: -4 }
update()
assert.isTrue(brick.alive, 'one hit should not break a top-row brick')
assert.strictEqual(ball.vy, 4, 'the ball should still bounce off it')
ball = { x: 37, y: 79, vx: 0, vy: -4 }
update()
assert.isFalse(brick.alive, 'the second hit should break it')
```

Bricks in the other rows should still break with one hit.
tr: Öteki sıralardaki tuğlalar yine tek vuruşta kırılmalı.

```js
$.tap(' ')
bricks = bricks.filter((b) => b.row === 1)
const brick = bricks[0]
ball = { x: 37, y: 101, vx: 0, vy: -4 }
update()
assert.isFalse(brick.alive)
assert.strictEqual(score, 10)
```

An unhit top-row brick should look darker; after one hit it should be drawn in `COLORS[0]`.
tr: Hiç vurulmamış üst sıra tuğlası daha koyu görünmeli; bir vuruştan sonra `COLORS[0]` ile çizilmeli.

```js
const at = () => $.rects().find((r) => r.x === 10 && r.y === 50 && r.w === 54)
$.tick()
assert.notStrictEqual(at().color, '#ef4444', 'an unhit top-row brick should look different')
$.tap(' ')
bricks = bricks.filter((b) => b.row === 0)
ball = { x: 37, y: 79, vx: 0, vy: -4 }
update()
draw()
assert.strictEqual(at().color, '#ef4444')
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
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true, hits: row === 0 ? 2 : 1 })
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
    brick.hits -= 1
    if (brick.hits === 0) {
      brick.alive = false
      score += 10
      burst(brick)
    }
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
    ctx.fillStyle = brick.hits === 2 ? '#7f1d1d' : COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

  for (const p of particles) {
    ctx.globalAlpha = p.life / 30
    ctx.fillStyle = p.color
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
  }
  ctx.globalAlpha = 1

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
