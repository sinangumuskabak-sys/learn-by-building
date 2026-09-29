---
title: Who won?
title_tr: Kim kazandı?
skills: [game.canvas]
---

# --goal--

When the game is over, the ball disappears and the winner is announced in the middle.

# --goal-tr--

Oyun bitince top kaybolsun ve ortada **kazanan** ilan edilsin. Altına da yeniden oynamanın yolunu yazalım (tuşu
sonraki adımda bağlayacağız).

# --code--

```js
if (state === 'playing') ctx.fillRect(ball.x, ball.y, BALL, BALL)

if (state === 'over') {
  const winner = left.score >= WIN_SCORE ? 'Left' : 'Right'
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(winner + ' player wins!', canvas.width / 2, canvas.height / 2)
  ctx.font = '16px sans-serif'
  ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
}
```

# --meaning--

- The ball is drawn only while playing.
- The winner is whoever reached `WIN_SCORE`; the text is centered (the alignment was set for the scores).

# --meaning-tr--

- `if (state === 'playing') ctx.fillRect(ball...)` → top yalnız oyun sürerken çizilir.
- `left.score >= WIN_SCORE ? 'Left' : 'Right'` → 5'e ulaşan sol oyuncuysa `'Left'`, değilse `'Right'`.
- `winner + ' player wins!'` → `Left player wins!` gibi bir yazı.
- `ctx.textAlign` skorlar için zaten `'center'` yapılmıştı; yazılar ortaya hizalanır.

# --task--

1. Put `if (state === 'playing') ` in front of the ball's `fillRect`.
2. At the end of `draw`, under the scores, write the `if (state === 'over')` block.

# --task-tr--

1. Topu çizen satırın başına `if (state === 'playing') ` ekle.
2. `draw`'ın sonunda, skor satırlarının altına bir boş satır bırakıp `if (state === 'over')` bloğunu yaz.
3. **Çalıştır**, oyunu kaybet ya da kazan.

# --tests--

The winner should be announced when the game is over.
tr: Oyun bitince kazanan ilan edilmeli.

```js
state = 'over'
right.score = 5
$.tick()
assert.include($.texts(), 'Right player wins!')
assert.include($.texts(), 'Press Space to play again')
```

The ball should not be drawn after the game is over.
tr: Oyun bitince top çizilmemeli.

```js
state = 'over'
ball = { x: 100, y: 100, vx: 4, vy: 3 }
$.tick()
assert.isFalse($.rects('white').some((r) => r.w === 10 && r.h === 10 && r.x === 100))
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
const BALL = 10 // the ball is a BALL×BALL square
const WIN_SCORE = 5

let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
let ball
let state = 'playing' // 'playing' or 'over'
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
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

function update() {
  if (state !== 'playing') return
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)

  ball.x += ball.vx
  ball.y += ball.vy
  if (ball.y < 0 || ball.y + BALL > canvas.height) {
    ball.vy = -ball.vy
    ball.y = clamp(ball.y, 0, canvas.height - BALL)
  }
  if (ball.vx < 0 && touches(left)) {
    ball.vx = -ball.vx
    ball.x = left.x + PADDLE_W
  }
  if (ball.vx > 0 && touches(right)) {
    ball.vx = -ball.vx
    ball.x = right.x - BALL
  }

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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

serve(1)
requestAnimationFrame(loop)
```
