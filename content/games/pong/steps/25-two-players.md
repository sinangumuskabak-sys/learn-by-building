---
title: One player or two
title_tr: Tek ya da iki oyuncu
skills: [game.input]
---

# --goal--

The 2 key switches between playing the computer and playing a friend, and a grey line at the bottom says which mode
is on.

# --goal-tr--

**2** tuşu bilgisayara karşı oynamakla bir arkadaşa karşı oynamak arasında geçiş yapsın. Altta küçük gri bir yazı
hangi modda olduğunu ve nasıl değiştirileceğini söylesin.

# --code--

```js
if (event.key === '2') twoPlayers = !twoPlayers

ctx.fillStyle = '#888'
ctx.font = '14px sans-serif'
const hint = twoPlayers ? 'Two players · press 2 to play the computer' : 'W/S to move · press 2 for two players'
ctx.fillText(hint, canvas.width / 2, canvas.height - 12)
```

# --meaning--

- `!twoPlayers` is the opposite: `true` becomes `false` and back. This is called toggling.
- The hint text depends on the mode, chosen with `? :`.

# --meaning-tr--

- `twoPlayers = !twoPlayers` → `!` **tersi** demek: `true` ise `false`, `false` ise `true` yapar. Her basışta mod
  değişir; buna **aç-kapa** (toggle) denir.
- `ctx.fillStyle = '#888'` → gri, daha sönük bir renk: önemli bilgi değil, yardım yazısı.
- `twoPlayers ? '...' : '...'` → moda göre iki yazıdan biri. Ortadaki `·` sadece bir ayırıcı nokta.
- `canvas.height - 12` → en alttan 12 piksel yukarı.

# --task--

1. In the `keydown` listener, write the `'2'` line under `keys[event.key] = true`.
2. At the very end of `draw`, after an empty line, write the hint lines.

# --task-tr--

1. `keydown` dinleyicisinde `keys[event.key] = true` satırının altına `'2'` satırını yaz.
2. `draw` fonksiyonunun **en sonuna**, `if (state === 'over')` bloğunun altına bir boş satır bırakıp dört yardım
   satırını yaz.
3. **Çalıştır**, 2'ye bas ve bir arkadaşınla oyna (o ok tuşlarını kullanır). Oyun bitti!

# --tests--

The 2 key should switch between one and two players.
tr: 2 tuşu tek ve iki oyuncu arasında geçiş yapmalı.

```js
$.tap('2')
assert.isTrue(twoPlayers)
$.tap('2')
assert.isFalse(twoPlayers)
```

The bottom line should say which mode is on.
tr: Alttaki satır hangi modun açık olduğunu söylemeli.

```js
$.tick()
assert.include($.texts(), 'W/S to move · press 2 for two players')
$.tap('2')
$.tick()
assert.include($.texts(), 'Two players · press 2 to play the computer')
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
