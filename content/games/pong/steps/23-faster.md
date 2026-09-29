---
title: Faster every hit
title_tr: Her vuruşta hızlan
skills: [game.physics]
---

# --goal--

Long rallies get exciting when the ball speeds up: every hit makes it 5% faster, up to a limit of 12.

# --goal-tr--

Uzun ralliler top **hızlandıkça** heyecanlanır: her vuruş topu **yüzde 5** hızlandırsın. Ama sonsuza kadar değil;
12'de dursun, yoksa göremeyecek kadar hızlanır.

# --code--

```js
const speed = Math.min(Math.abs(ball.vx) * 1.05, 12)
```

# --meaning--

- `* 1.05` makes the speed 5% bigger each hit.
- `Math.min(..., 12)` takes the smaller of the two, so the speed never goes past 12.

# --meaning-tr--

- `Math.abs(ball.vx) * 1.05` → hızı 1,05 ile çarp: %5 artış. 4 → 4,2 → 4,41...
- `Math.min(..., 12)` → iki sayıdan **küçüğünü** seçer: hız 12'yi hiç geçmez. Bu bir **üst sınır**.

# --task--

In `bounceOff`, change the `speed` line.

# --task-tr--

`bounceOff` içindeki `const speed = Math.abs(ball.vx)` satırını koddaki gibi değiştir. **Çalıştır** ve uzun bir ralli yap.

# --tests--

Each hit should make the ball 5% faster.
tr: Her vuruş topu %5 hızlandırmalı.

```js
left.y = 160
ball = { x: 32, y: 195, vx: -4, vy: 0 }
bounceOff(left)
assert.closeTo(ball.vx, 4.2, 0.001)
```

The speed should never go past 12.
tr: Hız asla 12'yi geçmemeli.

```js
right.y = 160
ball = { x: 568, y: 195, vx: 11.9, vy: 0 }
bounceOff(right)
assert.strictEqual(ball.vx, -12)
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

let left
let right
let ball
let state // 'playing' or 'over'
const keys = {}

function reset() {
  left = { x: 20, y: 160, score: 0 }
  right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
  state = 'playing'
  serve(1)
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
