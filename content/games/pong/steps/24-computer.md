---
title: A computer opponent
title_tr: Bilgisayar rakip
skills: [game.state]
---

# --goal--

Playing alone? The computer takes the right paddle: when the ball comes toward it, it moves to meet it, but a bit
slower than you, so it can be beaten.

# --goal-tr--

Tek başına mı oynuyorsun? Sağ raketi **bilgisayar** yönetsin. Top kendine doğru gelirken raketini topun hizasına
götürsün. Ama senden biraz **yavaş** olsun ki yenilebilsin; yenilmez rakip eğlenceli değildir.

`twoPlayers` (iki oyuncu) `false` iken bilgisayar oynar; bir sonraki adımda bunu bir tuşla değiştireceğiz.

# --code--

```js
const AI_SPEED = 4 // slower than the player, so the computer can be beaten
let twoPlayers = false

  if (twoPlayers) {
    if (keys.ArrowUp) right.y -= PADDLE_SPEED
    if (keys.ArrowDown) right.y += PADDLE_SPEED
  } else if (ball.vx > 0) {
    const target = ball.y + BALL / 2 - PADDLE_H / 2
    right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
  }
```

# --meaning--

- With two players the arrow keys move the right paddle as before; otherwise the computer does, only while the ball
  comes toward it (`vx > 0`).
- `target` is where the paddle's top should be so its middle meets the ball.
- `clamp(..., -AI_SPEED, AI_SPEED)` limits each move to 4 pixels, slower than your 6.

# --meaning-tr--

- `if (twoPlayers) { ... }` → iki oyunculu modda ok tuşları sağ raketi eskisi gibi oynatır.
- `else if (ball.vx > 0)` → **değilse** ve top sağa (bilgisayara) geliyorsa bilgisayar oynar. Top uzaklaşırken
  beklemesi onu daha insan gibi yapar.
- `const target = ball.y + BALL / 2 - PADDLE_H / 2` → raketin ortası topun ortasına gelsin diye raketin üst kenarının
  olması gereken yer.
- `target - right.y` → gitmesi gereken mesafe (eksi: yukarı, artı: aşağı).
- `clamp(..., -AI_SPEED, AI_SPEED)` → bu mesafeyi **en fazla 4 piksele** sınırla. Senin raketin 6 piksel gidiyor;
  bilgisayar biraz yavaş kalır.

# --task--

1. Under `PADDLE_SPEED`, write `AI_SPEED`; under `let state`, write `let twoPlayers = false`.
2. In `update`, replace the two arrow-key lines with the `if (twoPlayers) ... else if ...` block.

# --task-tr--

1. `const PADDLE_SPEED = 6` satırının altına `AI_SPEED` satırını, `let state ...` satırının altına
   `let twoPlayers = false` satırını yaz.
2. `update` içindeki `ArrowUp` ve `ArrowDown` satırlarını `if (twoPlayers) { ... } else if ...` bloğuyla değiştir (iki
   satır bloğun içine girer).
3. **Çalıştır**: sağ raket kendi kendine topu karşılamalı.

# --tests--

The computer should move the right paddle toward a ball coming at it, 4 pixels at a time.
tr: Bilgisayar kendine gelen topa doğru sağ raketi her seferinde 4 piksel oynatmalı.

```js
right.y = 160
ball = { x: 300, y: 50, vx: 4, vy: 0 }
update()
assert.strictEqual(right.y, 156)
```

The computer should wait while the ball moves away.
tr: Top uzaklaşırken bilgisayar beklemeli.

```js
right.y = 160
ball = { x: 300, y: 50, vx: -4, vy: 0 }
update()
assert.strictEqual(right.y, 160)
```

With two players, the arrow keys should move the right paddle.
tr: İki oyunculu modda ok tuşları sağ raketi oynatmalı.

```js
twoPlayers = true
right.y = 160
ball = { x: 300, y: 50, vx: 4, vy: 0 }
$.press('ArrowDown')
update()
assert.strictEqual(right.y, 166)
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
  if (twoPlayers) {
    if (keys.ArrowUp) right.y -= PADDLE_SPEED
    if (keys.ArrowDown) right.y += PADDLE_SPEED
  } else if (ball.vx > 0) {
    const target = ball.y + BALL / 2 - PADDLE_H / 2
    right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
  }
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
