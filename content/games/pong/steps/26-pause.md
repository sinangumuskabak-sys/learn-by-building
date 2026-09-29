---
title: "Build it yourself: a serve pause"
title_tr: "Kendin yap: servis beklemesi"
skills: [game.state, game.loop]
---

# --goal--

After every point the new ball starts moving at once, and players barely have time to get ready. Make it wait: keep
the ball still in the middle for one second (60 frames) after each serve.

# --goal-tr--

Her sayıdan sonra yeni top **hemen** yola çıkıyor; oyuncular hazırlanmaya fırsat bulamıyor. Servisten sonra top **bir
saniye** (60 kare) ortada **beklesin**, sonra hareket etsin. Beklerken raketler oynayabilsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `serve` topu kuruyor, `update` her karede çalışıyor, bir sayacı
azaltmayı da biliyorsun.

# --task--

- After every serve, the ball stays still for about 60 frames, then moves as before.
- The paddles can still move while it waits.

# --task-tr--

- Her servisten sonra top yaklaşık **60 kare** yerinde dursun, sonra eskisi gibi hareket etsin.
- Top beklerken raketler yine oynayabilsin.

Bir fikir: servis ederken topa bir bekleme sayacı ver; `update`'te sayaç sıfırdan büyükse bir azalt ve topu
oynatmadan çık.

# --hint--

Give the ball a counter in `serve` (for example `wait: 60`). In `update`, after the paddles move, if the counter is
above 0, subtract 1 and `return` before the ball moves.

# --hint-tr--

`serve`'de topa bir sayaç ver (ör. `wait: 60`). `update`'te raketler oynadıktan sonra, top oynamadan hemen önce:
sayaç 0'dan büyükse 1 azalt ve `return` ile çık.

# --tests--

After a point, the new ball should stay in the middle for a while.
tr: Sayıdan sonra yeni top bir süre ortada durmalı.

```js
point(left)
$.tick(30)
assert.strictEqual(ball.x, 295)
assert.strictEqual(ball.y, 195)
```

After about a second, the ball should move again.
tr: Yaklaşık bir saniye sonra top yeniden hareket etmeli.

```js
point(left)
$.tick(75)
assert.notStrictEqual(ball.x, 295)
```

The paddles should still move while the ball waits.
tr: Top beklerken raketler oynayabilmeli.

```js
point(left)
const start = left.y
$.press('s')
$.tick(10)
assert.isAbove(left.y, start)
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80
const PADDLE_SPEED = 6
const AI_SPEED = 4 // slower than the player, so the computer can be beaten
const BALL = 10 // the ball is a BALL×BALL square
const WIN_SCORE = 5

let left
let right
let ball
let state // 'playing' or 'over'
let twoPlayers = false
const keys = {}

function reset() {
  left = { x: 20, y: 160, score: 0 }
  right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
  state = 'playing'
  serve(1)
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === '2') twoPlayers = !twoPlayers
  if (event.key === ' ' && state === 'over') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function serve(direction) {
  ball = {
    x: canvas.width / 2 - BALL / 2,
    y: canvas.height / 2 - BALL / 2,
    vx: 4 * direction,
    vy: Math.random() < 0.5 ? -3 : 3,
    wait: 60, // frames the ball stays still before it moves
  }
}

function point(winner) {
  winner.score += 1
  if (winner.score >= WIN_SCORE) {
    state = 'over'
    return
  }
  // Serve toward the player who just lost the point.
  serve(winner === left ? 1 : -1)
}

function touches(paddle) {
  return (
    ball.x < paddle.x + PADDLE_W &&
    ball.x + BALL > paddle.x &&
    ball.y < paddle.y + PADDLE_H &&
    ball.y + BALL > paddle.y
  )
}

function bounceOff(paddle) {
  // -1 at the paddle's top edge, 0 in the middle, 1 at the bottom edge
  const offset = (ball.y + BALL / 2 - (paddle.y + PADDLE_H / 2)) / (PADDLE_H / 2)
  const speed = Math.min(Math.abs(ball.vx) * 1.05, 12)
  ball.vy = offset * 5
  if (paddle === left) {
    ball.vx = speed
    ball.x = left.x + PADDLE_W
  } else {
    ball.vx = -speed
    ball.x = right.x - BALL
  }
}

function update() {
  if (state !== 'playing') return
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (twoPlayers) {
    if (keys.ArrowUp) right.y -= PADDLE_SPEED
    if (keys.ArrowDown) right.y += PADDLE_SPEED
  } else if (ball.vx > 0) {
    const target = ball.y + BALL / 2 - PADDLE_H / 2
    right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
  }
  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)

  if (ball.wait > 0) {
    ball.wait -= 1
    return
  }
  ball.x += ball.vx
  ball.y += ball.vy
  if (ball.y < 0 || ball.y + BALL > canvas.height) {
    ball.vy = -ball.vy
    ball.y = clamp(ball.y, 0, canvas.height - BALL)
  }
  if (ball.vx < 0 && touches(left)) bounceOff(left)
  if (ball.vx > 0 && touches(right)) bounceOff(right)

  if (ball.x + BALL < 0) point(right)
  else if (ball.x > canvas.width) point(left)
}

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
  if (state === 'playing') ctx.fillRect(ball.x, ball.y, BALL, BALL)

  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(left.score), canvas.width / 4, 60)
  ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)

  if (state === 'over') {
    const winner = left.score >= WIN_SCORE ? 'Left' : 'Right'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(winner + ' player wins!', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }

  ctx.fillStyle = '#888'
  ctx.font = '14px sans-serif'
  const hint = twoPlayers ? 'Two players · press 2 to play the computer' : 'W/S to move · press 2 for two players'
  ctx.fillText(hint, canvas.width / 2, canvas.height - 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
